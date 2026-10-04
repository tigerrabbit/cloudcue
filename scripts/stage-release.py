"""Inspect clean CI packages and stage explicit preview files and SHA-256 metadata."""
import argparse
import hashlib
import io
import json
import os
import pathlib
import plistlib
import re
import shutil
import struct
import subprocess
import sys
import tarfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
PLATFORMS = {
    'macos-arm64': ('aarch64-apple-darwin', {'dmg': 'macos_arm64.dmg'}),
    'windows-x64': ('x86_64-pc-windows-msvc', {'nsis': 'windows_x64_setup.exe'}),
    'linux-x64': ('x86_64-unknown-linux-gnu', {'deb': 'linux_amd64.deb'}),
}
UI_FILES = {'index.html', 'questions.js', 'private-bank.js', 'private-bank-example.json',
            'study-core.js', 'study.js', 'style.css'}


def command(*args):
    return subprocess.check_output(args, cwd=ROOT, stderr=subprocess.STDOUT).decode().strip()


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def powershell_path(path):
    return "'" + str(path).replace("'", "''") + "'"


def authenticode_status(path):
    # Use the same PowerShell 7 runtime as the Windows workflow, with no profile.
    return command('pwsh', '-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
                   "$ErrorActionPreference = 'Stop'; "
                   f"$cloudcue_signature = Get-AuthenticodeSignature -LiteralPath {powershell_path(path)}; "
                   "$cloudcue_signature.Status.ToString(); exit 0")


def inspect_payload(kind, package, binary, notices):
    expected = {'cloudcue': sha256(binary), 'DISTRIBUTION-NOTICES.txt': sha256(notices)}
    if kind == 'dmg':
        result = subprocess.check_output(['hdiutil', 'attach', '-readonly', '-nobrowse', '-plist', str(package)])
        mounts = [entry['mount-point'] for entry in plistlib.loads(result)['system-entities'] if 'mount-point' in entry]
        try:
            require(len(mounts) == 1, 'Expected one disk-image volume.')
            mount = pathlib.Path(mounts[0])
            app = mount / 'CloudCue.app/Contents'
            require(sha256(app / 'MacOS/cloudcue') == expected['cloudcue'], 'Disk-image executable mismatch.')
            require(sha256(app / 'Resources/DISTRIBUTION-NOTICES.txt') == expected['DISTRIBUTION-NOTICES.txt'],
                    'Disk-image distribution notices mismatch.')
        finally:
            for mount in mounts:
                command('hdiutil', 'detach', mount)
    elif kind == 'deb':
        data = subprocess.check_output(['dpkg-deb', '--fsys-tarfile', str(package)])
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:') as archive:
            for suffix, wanted in {'/usr/bin/cloudcue': expected['cloudcue'],
                                   '/DISTRIBUTION-NOTICES.txt': expected['DISTRIBUTION-NOTICES.txt']}.items():
                members = [entry for entry in archive.getmembers() if ('/' + entry.name.lstrip('./')).endswith(suffix)]
                require(len(members) == 1 and members[0].isfile(), 'Expected one ordinary Debian payload file.')
                require(hashlib.sha256(archive.extractfile(members[0]).read()).hexdigest() == wanted,
                        'Debian payload mismatch.')
    elif kind == 'nsis':
        tool = shutil.which('7z') or 'C:/Program Files/7-Zip/7z.exe'
        for name, wanted in {'cloudcue.exe': expected['cloudcue'],
                             'DISTRIBUTION-NOTICES.txt': expected['DISTRIBUTION-NOTICES.txt']}.items():
            data = subprocess.check_output([tool, 'x', '-so', '-bd', '-r', str(package), name], stderr=subprocess.PIPE)
            require(hashlib.sha256(data).hexdigest() == wanted, 'Windows installer payload mismatch.')


def stage(platform, prebuild=False):
    target, formats = PLATFORMS[platform]
    require(os.environ.get('GITHUB_ACTIONS') == 'true', 'Staging is restricted to GitHub Actions.')
    require(os.environ.get('RUNNER_ENVIRONMENT') == 'github-hosted', 'Use a fresh GitHub-hosted runner.')
    require(pathlib.Path(os.environ.get('GITHUB_WORKSPACE', '')).resolve() == ROOT,
            'Unexpected CI workspace.')
    require(not command('git', 'status', '--porcelain'), 'Source checkout must be clean.')
    commit = command('git', 'rev-parse', 'HEAD')
    require(re.fullmatch(r'[a-f0-9]{40}', commit), 'Source commit must be an exact Git SHA.')
    require(os.environ.get('GITHUB_SHA') == commit, 'CI source commit mismatch.')
    require(os.environ.get('GITHUB_REF') == 'refs/heads/main', 'Only main builds can be staged.')
    if prebuild:
        require(not (ROOT / 'src-tauri/target').exists(), 'Native outputs must be absent before this build.')
        require(not (ROOT / 'release-assets').exists(), 'Staged outputs must be absent before this build.')
        print('Fresh hosted CI workspace and source commit verified.')
        return
    config = json.loads((ROOT / 'src-tauri/tauri.conf.json').read_text())
    version = config['version']
    require(re.fullmatch(r'\d+\.\d+\.\d+', version), 'Use an explicit numeric package version.')
    require(config['build']['frontendDist'] == '../ui', 'Unexpected frontend source.')
    require(config['identifier'] == 'io.github.tigerrabbit.cloudcue', 'Unexpected app identity.')
    require(config['productName'] == 'CloudCue', 'Unexpected product name.')
    require(config['bundle'].get('resources') == {'../DISTRIBUTION-NOTICES.txt': 'DISTRIBUTION-NOTICES.txt'},
            'Unexpected package resources.')
    notices = ROOT / 'DISTRIBUTION-NOTICES.txt'
    require(notices.is_file() and not notices.is_symlink() and notices.stat().st_size > 1000,
            'Distribution notices must be generated before packaging.')
    require({p.name for p in (ROOT / 'ui').iterdir()} == UI_FILES, 'Unexpected bundled UI files.')
    secret = re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[opus]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|xox[baprs]-[A-Za-z0-9-]{25,}')
    private = re.compile(rb'(?i)(/Users/(?!runner/)[^\s/]+/|obsidian://|gdwobsidian|creditcleanup|echo\.exam-prep\.v1)')
    require(not secret.search(notices.read_bytes()) and not private.search(notices.read_bytes()),
            'Distribution notices failed the privacy check; do not publish them.')
    for path in (ROOT / 'ui').iterdir():
        require(path.is_file() and not path.is_symlink(), 'Bundled UI must contain ordinary files only.')
        require(not secret.search(path.read_bytes()) and not private.search(path.read_bytes()),
                'Bundled UI failed the privacy check; inspect it without publishing values.')
    release = ROOT / 'src-tauri/target' / target / 'release'
    binary = release / ('cloudcue.exe' if platform == 'windows-x64' else 'cloudcue')
    metadata = {'platform': platform, 'target': target, 'version': version, 'sourceCommit': commit,
                'rust': command('rustc', '--version'), 'nativeInstallTested': False,
                'developerSignature': False, 'notarized': False,
                'distributionNoticesSha256': sha256(notices), 'files': []}
    if platform == 'macos-arm64':
        app = release / 'bundle/macos/CloudCue.app'
        binary = app / 'Contents/MacOS/cloudcue'
        info = plistlib.loads((app / 'Contents/Info.plist').read_bytes())
        require(info['CFBundleIdentifier'] == config['identifier'], 'Bundle identity mismatch.')
        require(info['CFBundleShortVersionString'] == version, 'Bundle version mismatch.')
        metadata['minimumMacOS'] = info.get('LSMinimumSystemVersion')
        architecture = command('lipo', '-archs', str(binary))
        require(architecture == 'arm64', 'Unexpected macOS binary architecture.')
        command('codesign', '--verify', '--deep', '--strict', str(app))
        signing = command('codesign', '-d', '--verbose=2', str(app))
        require('Signature=adhoc' in signing, 'Expected explicitly ad-hoc preview signing.')
        metadata['signature'] = 'ad-hoc; no Developer ID or notarization'
    elif platform == 'windows-x64':
        data = binary.read_bytes()
        require(data[:2] == b'MZ' and len(data) > 64, 'Invalid Windows executable.')
        offset = struct.unpack_from('<I', data, 60)[0]
        require(offset + 6 <= len(data) and data[offset:offset + 4] == b'PE\0\0'
                and struct.unpack_from('<H', data, offset + 4)[0] == 0x8664,
                'Unexpected Windows binary architecture.')
        signature = authenticode_status(binary)
        require(signature == 'NotSigned', 'Expected unsigned preview executable.')
        metadata['signature'] = 'unsigned; no Authenticode certificate'
    else:
        header = binary.read_bytes()[:20]
        require(header[:6] == b'\x7fELF\x02\x01' and struct.unpack_from('<H', header, 18)[0] == 62,
                'Unexpected Linux binary architecture.')
        metadata['signature'] = 'unsigned'
        metadata['knownAdvisory'] = 'GHSA-wrw7-89jp-8q8g / RUSTSEC-2024-0429 (glib 0.18.5)'
    require(not private.search(binary.read_bytes()) and not secret.search(binary.read_bytes()),
            'Executable failed the privacy check; do not publish it.')
    output = ROOT / 'release-assets' / platform
    require(not output.exists(), 'Use a fresh staging directory.')
    output.mkdir(parents=True)
    for kind, suffix in formats.items():
        extension = {'dmg': '*.dmg', 'nsis': '*.exe', 'deb': '*.deb'}[kind]
        matches = list((release / 'bundle' / kind).glob(extension))
        require(len(matches) == 1 and matches[0].is_file() and not matches[0].is_symlink(),
                'Expected one ordinary package per format.')
        source = matches[0]
        if kind == 'dmg':
            command('hdiutil', 'verify', str(source))
        elif kind == 'deb':
            # Tauri's Debian bundler converts the product name to kebab case.
            for field, expected in {'Package': 'cloud-cue', 'Version': version, 'Architecture': 'amd64'}.items():
                require(command('dpkg-deb', '-f', str(source), field) == expected, 'Debian metadata mismatch.')
            metadata['debianPackage'] = {'name': 'cloud-cue', 'depends': command('dpkg-deb', '-f', str(source), 'Depends')}
        elif kind == 'nsis':
            require(authenticode_status(source) == 'NotSigned',
                    'Expected unsigned preview installer.')
        inspect_payload(kind, source, binary, notices)
        destination = output / f'CloudCue_{version}_{suffix}'
        shutil.copyfile(source, destination)
        metadata['files'].append({'name': destination.name, 'bytes': destination.stat().st_size,
                                  'sha256': sha256(destination)})
    notice_copy = output / f'CloudCue_{version}_{platform.replace("-", "_")}_NOTICES.txt'
    shutil.copyfile(notices, notice_copy)
    metadata['files'].append({'name': notice_copy.name, 'bytes': notice_copy.stat().st_size,
                              'sha256': sha256(notice_copy)})
    (output / 'BUILD-INFO.json').write_text(json.dumps(metadata, indent=2) + '\n')
    (output / 'SHA256SUMS.txt').write_text(''.join(f"{item['sha256']}  {item['name']}\n" for item in metadata['files']))
    print(json.dumps(metadata, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('platform', choices=PLATFORMS)
    parser.add_argument('--prebuild', action='store_true', help='Require a fresh hosted CI output directory.')
    try:
        args = parser.parse_args()
        stage(args.platform, args.prebuild)
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f'Package inspection failed: {error}', file=sys.stderr)
        sys.exit(1)
