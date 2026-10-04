# Download and install CloudCue

Visit [CloudCue Releases](https://github.com/tigerrabbit/cloudcue/releases) and open a published release. Under **Assets**, choose the file for your operating system and processor. GitHub's automatic **Source code** archives contain the project source, not an installer.

CloudCue is an early preview. Packaging checks and native installation checks are different; read the release notes for the checks actually completed. There is no automatic updater.

| System | Download | Status and requirements |
| --- | --- | --- |
| macOS, Apple Silicon | `CloudCue_<version>_macos_arm64.dmg` | macOS distribution is held in draft pending a signing decision. An ad-hoc signature is not Apple Developer ID signing or notarization. No Intel Mac package is offered. |
| Windows, x64 | `CloudCue_<version>_windows_x64_setup.exe` | Preview installer without an Authenticode publisher signature. Windows may display an unknown-publisher or SmartScreen warning. Native installation has not been manually verified. |
| Ubuntu/Debian, x64 | `CloudCue_<version>_linux_amd64.deb` | Requires WebKitGTK 4.1 and package dependencies. Built on Ubuntu 22.04; compatibility with other distributions is not established. Read the [known GLib advisory](SECURITY.md#known-dependency-advisory). |
| Linux, x64 | `CloudCue_<version>_linux_x86_64.AppImage` | Requires a compatible Linux desktop and FUSE support. Built on Ubuntu 22.04; it does not support every Linux distribution. Read the [known GLib advisory](SECURITY.md#known-dependency-advisory). |

Only files actually attached to a published release are available downloads. iPhone/iPad and Android builds are not available.

## Verify your download

Download `SHA256SUMS.txt` from the same release, alongside your chosen installer. Compare the file's SHA-256 hash with its matching entry:

```sh
# macOS
shasum -a 256 CloudCue_<version>_macos_arm64.dmg

# Linux
sha256sum CloudCue_<version>_linux_amd64.deb
```

```powershell
# Windows PowerShell
Get-FileHash .\CloudCue_<version>_windows_x64_setup.exe -Algorithm SHA256
```

Replace `<version>` with the release version. A matching hash verifies that the downloaded bytes match the release's checksum; it is not a developer signature or proof of safety. The release's build metadata records the exact source commit, architecture, signing status, and whether native installation was tested.

## Install and start

For a published macOS DMG, open it and drag **CloudCue** to **Applications**, then open CloudCue from Applications. The current draft has no Developer ID signature or notarization; it is not ready for a normal macOS installation experience.

On Windows, open the downloaded setup program and follow its installation prompts. WebView2 is needed; the installer may download Microsoft's runtime if it is absent. If Windows blocks or warns about this unsigned preview, stop and review the release's publisher status before deciding whether to proceed. This guide does not change operating-system security settings.

On Ubuntu/Debian, open a terminal in the download directory and install the DEB:

```sh
sudo apt install ./CloudCue_<version>_linux_amd64.deb
```

For the AppImage, give the downloaded file executable permission, then launch it:

```sh
chmod +x CloudCue_<version>_linux_x86_64.AppImage
./CloudCue_<version>_linux_x86_64.AppImage
```

If required system libraries or FUSE support are unavailable, use the DEB on a supported system or follow the [source build instructions](README.md#run-and-build). No Linux installation or desktop behavior is claimed from compilation alone.

## Your first study session

Choose **Curated**, a topic, session length, and mode. Select an answer and submit it. Practice shows feedback immediately; Self-test waits until the session ends. Pause a session to resume later, or finish it to review explanations and references.

Questions work offline. Reference links need internet access. Progress stays in local webview storage and is not encrypted or synchronized. Private JSON imports remain local; see the [private-bank guide](README.md#private-local-question-bank). **Copy JSON** is the verified native export fallback; saving a file through the native Download JSON action has not been confirmed.

For updates, download a newer published release for the same operating system and architecture. Before reinstalling or clearing app data, keep an authorized private-bank export if needed. Question exports do not include study progress. Do not post private question banks or study records in an issue.

For an installation problem, [open an issue](https://github.com/tigerrabbit/cloudcue/issues/new) with your OS version, processor, release version, chosen filename, and the error message. Avoid including personal paths or sensitive information.
