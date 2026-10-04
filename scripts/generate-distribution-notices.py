#!/usr/bin/env python3
"""Generate target-specific binary notices from locked, unmodified Cargo sources.

The output is a build resource, not a legal-clearance report. No downloads occur
here: missing upstream texts need reviewed, version-pinned fallback inputs.
"""

import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import quote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
TARGETS = ("aarch64-apple-darwin", "x86_64-pc-windows-msvc", "x86_64-unknown-linux-gnu")
REGISTRY = "registry+https://github.com/rust-lang/crates.io-index"
NOTICE_NAME = re.compile(r"^(?:licen[sc]e|copying|copyright|notice)(?:$|[._-])|^unlicense$", re.I)
SUPPORTED = {
    "MIT", "MIT-0", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD",
    "Unicode-3.0", "MPL-2.0", "Zlib", "Unlicense", "CC0-1.0", "ISC", "BSL-1.0",
}


class NoticeError(Exception):
    pass


def read_text(path, label):
    try:
        text = path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeError) as exc:
        raise NoticeError(f"Cannot read UTF-8 notice input: {label}") from exc
    if not text.strip() or "\x00" in text:
        raise NoticeError(f"Empty or binary notice input: {label}")
    return text.replace("\r\n", "\n").replace("\r", "\n").rstrip() + "\n"


def run(command, label):
    try:
        result = subprocess.run(command, cwd=ROOT, check=True, text=True, encoding="utf-8",
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except (OSError, UnicodeError, subprocess.CalledProcessError) as exc:
        # Cargo/rustc errors can contain local usernames and checkout paths.
        raise NoticeError(f"{label} failed; run the command locally to inspect its diagnostics") from exc
    return result.stdout


def public_url(value, label):
    parsed = urlsplit(value)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise NoticeError(f"Non-public HTTPS source URL for {label}")
    return value


def parse_expression(expression):
    """Parse the expected SPDX operators and Apache's LLVM exception.

    Cargo's historic slash form means OR. WITH requires the full base terms
    plus the full specific exception; the exception never substitutes for them.
    """
    normalized = expression.replace("/", " OR ")
    tokens = re.findall(r"\(|\)|[A-Za-z0-9.+-]+", normalized)
    if re.sub(r"\s+", "", normalized) != "".join(tokens):
        raise NoticeError(f"Unsupported license expression: {expression}")
    at = 0

    def primary():
        nonlocal at
        if at >= len(tokens):
            raise NoticeError(f"Incomplete license expression: {expression}")
        token = tokens[at]
        at += 1
        if token == "(":
            node = either()
            if at >= len(tokens) or tokens[at] != ")":
                raise NoticeError(f"Unclosed license expression: {expression}")
            at += 1
            return node
        if token not in SUPPORTED:
            raise NoticeError(f"Unsupported license identifier: {token}")
        if at < len(tokens) and tokens[at] == "WITH":
            at += 1
            if at >= len(tokens):
                raise NoticeError(f"Incomplete license exception: {expression}")
            exception = tokens[at]
            at += 1
            if token != "Apache-2.0" or exception != "LLVM-exception":
                raise NoticeError(f"Unsupported license exception: {token} WITH {exception}")
            return ("AND", token, exception)
        return token

    def both():
        nonlocal at
        node = primary()
        while at < len(tokens) and tokens[at] == "AND":
            at += 1
            node = ("AND", node, primary())
        return node

    def either():
        nonlocal at
        node = both()
        while at < len(tokens) and tokens[at] == "OR":
            at += 1
            node = ("OR", node, both())
        return node

    node = either()
    if at != len(tokens):
        raise NoticeError(f"Unsupported license expression: {expression}")
    return node


def has_terms(text):
    """Recognize full supplied terms, not SPDX labels or README badges alone.

    This is deliberately bounded to the licenses expected by this lockfile.
    It verifies notice coverage, not license compatibility or legal clearance.
    """
    t = re.sub(r"\s+", " ", text).lower()
    found = set()
    if ("permission is hereby granted, free of charge" in t and
            "above copyright notice and this permission notice" in t and
            "in no event" in t and "the software is provided" in t):
        found.add("MIT")
    if "mit no attribution" in t and "permission is hereby granted" in t and "in no event" in t:
        found.add("MIT-0")
    if "apache license" in t and "version 2.0" in t and "end of terms and conditions" in t:
        found.add("Apache-2.0")
    if ("llvm exceptions to the apache 2.0 license" in t and
            "without complying with the conditions of sections 4(a), 4(b) and 4(d)" in t and
            "only in their entirety and only with respect to the combined software" in t):
        found.add("LLVM-exception")
    if ("redistribution and use in source and binary forms" in t and
            "redistributions in binary form" in t and "however caused" in t):
        found.add("BSD-3-Clause" if "neither the name" in t else "BSD-2-Clause")
    if ("permission to use, copy, modify, and/or distribute this software for any purpose" in t and
            "the software is provided" in t and "in no event" in t):
        found.add("ISC" if "copyright notice" in t else "0BSD")
    if "unicode license v3" in t and "permission is hereby granted" in t and "in no event" in t:
        found.add("Unicode-3.0")
    if "mozilla public license" in t and "3.2." in t and "exhibit b" in t and len(t) > 10000:
        found.add("MPL-2.0")
    if ("origin of this software must not be misrepresented" in t and
            "altered source versions" in t and "this notice may not be removed" in t):
        found.add("Zlib")
    if "this is free and unencumbered software" in t and "unlicense.org" in t and "in no event" in t:
        found.add("Unlicense")
    if "cc0 1.0 universal" in t and "public license fallback" in t and len(t) > 5000:
        found.add("CC0-1.0")
    if "boost software license" in t and "version 1.0" in t and "the software is provided" in t:
        found.add("BSL-1.0")
    return found


def covered(expression, terms):
    if isinstance(expression, str):
        return expression in terms
    operator, left, right = expression
    if operator == "AND":
        return covered(left, terms) and covered(right, terms)
    return covered(left, terms) or covered(right, terms)


def lock_checksums():
    # Cargo.lock's scalar fields are TOML basic strings, compatible with JSON.
    # Avoid depending on tomllib, unavailable on the macOS system Python 3.9.
    text = read_text(ROOT / "src-tauri/Cargo.lock", "Cargo.lock")
    entries = {}
    for block in re.split(r"(?m)^\[\[package\]\]\s*$", text)[1:]:
        fields = {}
        for key in ("name", "version", "source", "checksum"):
            match = re.search(rf'(?m)^{key} = ("[^\n]*")$', block)
            if match:
                fields[key] = json.loads(match[1])
        if fields.get("source") == REGISTRY:
            checksum = fields.get("checksum", "")
            if not re.fullmatch(r"[0-9a-f]{64}", checksum):
                raise NoticeError("Missing registry archive checksum in Cargo.lock")
            entries[(fields["name"], fields["version"])] = checksum
    return entries


def resolved_packages(metadata):
    resolve = metadata.get("resolve") or {}
    root_id = resolve.get("root")
    nodes = {n["id"]: n for n in resolve.get("nodes", [])}
    packages = {p["id"]: p for p in metadata.get("packages", [])}
    if not root_id or root_id not in nodes or root_id not in packages:
        raise NoticeError("Cargo metadata lacks the resolved application root")
    root = packages[root_id]
    if root["name"] != "cloudcue" or Path(root["manifest_path"]).resolve() != ROOT / "src-tauri/Cargo.toml":
        raise NoticeError("Cargo metadata belongs to a different application checkout")
    visited = set()
    pending = [root_id]
    while pending:
        identity = pending.pop()
        if identity in visited:
            continue
        if identity not in nodes or identity not in packages:
            raise NoticeError("Incomplete Cargo resolve graph")
        visited.add(identity)
        pending.extend(nodes[identity]["dependencies"])
    dependencies = [packages[i] for i in visited if i != root_id]
    return root, sorted(dependencies, key=lambda p: (p["name"], p["version"]))


def fallback_inputs():
    base = ROOT / "third-party/rust-license-fallbacks"
    manifest = json.loads(read_text(base / "manifest.json", "fallback manifest"))
    if manifest.get("schema_version") != 1:
        raise NoticeError("Unsupported fallback manifest version")
    entries = {}
    for entry in manifest["packages"]:
        key = (entry["name"], entry["version"])
        if key in entries:
            raise NoticeError(f"Duplicate fallback: {key[0]} {key[1]}")
        entries[key] = entry
    return base, entries


def package_notices(package, fallback_base, fallbacks):
    name, version = package["name"], package["version"]
    label = f"{name} {version}"
    source_root = Path(package["manifest_path"]).parent.resolve()
    if not source_root.is_dir():
        raise NoticeError(f"Missing registry source for {label}")
    texts = []
    for path in sorted(source_root.rglob("*")):
        relative_path = path.relative_to(source_root)
        in_license_directory = any(part.lower() in {"licenses", "licences", "license", "licence"}
                                   for part in relative_path.parts[:-1])
        if (path.is_file() and (NOTICE_NAME.search(path.name) or in_license_directory)
                and path.suffix.lower() not in {".rs", ".c", ".h"}):
            if not path.resolve().is_relative_to(source_root):
                raise NoticeError(f"Notice symlink escapes registry source for {label}")
            relative = relative_path.as_posix()
            texts.append((relative, read_text(path, f"{label}: {relative}"), None))
    license_file = package.get("license_file")
    if license_file:
        path = (source_root / license_file).resolve()
        if not path.is_relative_to(source_root):
            raise NoticeError(f"Declared license file escapes registry source for {label}")
        relative = path.relative_to(source_root).as_posix()
        if relative not in {t[0] for t in texts}:
            texts.append((relative, read_text(path, f"{label}: declared license file"), None))
    # A few crates place complete license terms in their README, not a LICENSE.
    for filename in ("README", "README.md", "README.txt"):
        path = source_root / filename
        if path.is_file():
            content = read_text(path, f"{label}: README")
            if has_terms(content):
                texts.append((filename, content, None))
    entry = fallbacks.get((name, version))
    note = None
    if entry:
        if entry["license"] != package.get("license"):
            raise NoticeError(f"Fallback license declaration changed for {label}")
        vcs = json.loads(read_text(source_root / ".cargo_vcs_info.json", f"{label}: upstream revision"))
        if vcs["git"]["sha1"] != entry["revision"] or vcs.get("path_in_vcs", "") != entry["path_in_vcs"]:
            raise NoticeError(f"Fallback upstream revision changed for {label}")
        note = entry["note"]
        for item in entry["texts"]:
            path = fallback_base / item["file"]
            if not path.resolve().is_relative_to(fallback_base.resolve()):
                raise NoticeError(f"Fallback escapes its directory for {label}")
            try:
                checksum = hashlib.sha256(path.read_bytes()).hexdigest()
            except OSError as exc:
                raise NoticeError(f"Missing fallback notice for {label}") from exc
            if checksum != item["sha256"]:
                raise NoticeError(f"Fallback notice checksum mismatch for {label}")
            url = public_url(item["source_url"], label)
            texts.append((item["file"], read_text(path, f"{label}: fallback text"), url))
    expression = package.get("license")
    if not expression:
        raise NoticeError(f"Missing SPDX license declaration for {label}")
    terms = set().union(*(has_terms(t[1]) for t in texts)) if texts else set()
    if not covered(parse_expression(expression), terms):
        raise NoticeError(f"Missing full upstream license terms for {label}: {expression}")
    # Native SDK components have their own rights and notices. They cannot
    # satisfy or replace the Rust crate's SPDX license coverage checked above.
    native_components = (entry or {}).get("native_components", [])
    if name == "webview2-com-sys":
        loader_paths = {p.relative_to(source_root).as_posix()
                        for p in source_root.rglob("WebView2LoaderStatic.lib") if p.is_file()}
        if loader_paths:
            sdk_components = [c for c in native_components if c.get("name") == "Microsoft WebView2 SDK loader"]
            if len(sdk_components) != 1:
                raise NoticeError(f"Missing explicit native WebView2 SDK supplement for {label}")
            if loader_paths != {a["file"] for a in sdk_components[0].get("artifacts", [])}:
                raise NoticeError(f"Native WebView2 SDK loader inventory changed for {label}")
    for component in native_components:
        component_label = f"{component['name']} {component['version']}"
        package_url = public_url(component["sdk_package_url"], component_label)
        package_sha = component["sdk_package_sha256"]
        if not re.fullmatch(r"[0-9a-f]{64}", package_sha):
            raise NoticeError(f"Missing native SDK package checksum for {label}")
        if not component.get("artifacts") or {t.get("role") for t in component.get("texts", [])} != {"license", "notice"}:
            raise NoticeError(f"Missing native SDK artifact, license, or notice inputs for {label}")
        provenance = [f"Native SDK component: {component_label}",
                      f"Native SDK scope: {component['scope']}",
                      f"Native SDK package: {package_url}",
                      f"Native SDK package SHA-256: {package_sha}"]
        for artifact in component["artifacts"]:
            path = source_root / artifact["file"]
            if not path.resolve().is_relative_to(source_root):
                raise NoticeError(f"Native SDK artifact escapes registry source for {label}")
            try:
                checksum = hashlib.sha256(path.read_bytes()).hexdigest()
            except OSError as exc:
                raise NoticeError(f"Missing native SDK artifact for {label}") from exc
            if checksum != artifact["sha256"]:
                raise NoticeError(f"Native SDK artifact checksum mismatch for {label}")
            provenance.append(f"Native SDK artifact: {artifact['file']} (SHA-256 {checksum})")
        note = (note + "\n" if note else "") + "\n".join(provenance)
        for item in component["texts"]:
            path = fallback_base / item["file"]
            if not path.resolve().is_relative_to(fallback_base.resolve()):
                raise NoticeError(f"Native SDK notice escapes its directory for {label}")
            try:
                checksum = hashlib.sha256(path.read_bytes()).hexdigest()
            except OSError as exc:
                raise NoticeError(f"Missing native SDK {item['role']} text for {label}") from exc
            if checksum != item["sha256"]:
                raise NoticeError(f"Native SDK {item['role']} checksum mismatch for {label}")
            url = public_url(item["source_url"], component_label)
            texts.append((f"{component_label}: {item['role']} text", read_text(path, component_label), url))
    return texts, note


class HtmlNotice(HTMLParser):
    """Convert upstream standard-library HTML to text, retaining links/pre blocks."""
    BLOCKS = {"p", "div", "h1", "h2", "h3", "li", "summary", "details", "ul", "pre"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.pre = False
        self.suppressed = 0
        self.link = None

    def handle_starttag(self, tag, attrs):
        if tag in {"head", "script", "style"}:
            self.suppressed += 1
        if self.suppressed:
            return
        if tag in self.BLOCKS or tag == "br":
            self.parts.append("\n")
        if tag == "pre":
            self.pre = True
        if tag == "a":
            self.link = dict(attrs).get("href")

    def handle_endtag(self, tag):
        if tag in {"head", "script", "style"}:
            self.suppressed -= 1
            return
        if self.suppressed:
            return
        if tag == "a" and self.link:
            if not self.link.startswith("#"):
                self.parts.append(f" ({self.link})")
            self.link = None
        if tag == "pre":
            self.pre = False
        if tag in self.BLOCKS:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.suppressed:
            self.parts.append(data if self.pre else re.sub(r"\s+", " ", data))

    def text(self):
        # Preserve preformatted upstream license texts byte-for-byte after HTML
        # entity decoding, including their original paragraph spacing.
        return "".join(self.parts).strip() + "\n"


def standard_library_notices(rustc):
    version = run([rustc, "-vV"], "rustc version query")
    release = re.search(r"(?m)^release: ([0-9.]+)$", version)
    revision = re.search(r"(?m)^commit-hash: ([0-9a-f]{40})$", version)
    if not release or not revision:
        raise NoticeError("Rust toolchain lacks a stable release and exact source revision")
    sysroot = Path(run([rustc, "--print", "sysroot"], "rustc sysroot query").strip())
    rust_doc = sysroot / "share/doc/rust"
    notice = rust_doc / "COPYRIGHT-library.html"
    if not notice.is_file():
        raise NoticeError("Rust standard-library COPYRIGHT-library.html is unavailable in the active toolchain")
    html = read_text(notice, "Rust standard-library copyright notices")
    parser = HtmlNotice()
    parser.feed(html)
    converted = parser.text()
    if "Copyright notices for The Rust Standard Library" not in converted or "Out-of-tree dependencies" not in converted:
        raise NoticeError("Unrecognized Rust standard-library notice format")
    # All embedded dependency notice texts are retained; in-tree license terms
    # referenced by license identifiers are shipped separately by Rust.
    texts = [("COPYRIGHT-library.html (readable text conversion)", converted, None)]
    for path in sorted((rust_doc / "licenses").glob("*.txt")):
        if path.stem in {"MIT", "Apache-2.0"} or re.search(rf"(?<![A-Za-z0-9-]){re.escape(path.stem)}(?![A-Za-z0-9-])", converted):
            texts.append((f"licenses/{path.name}", read_text(path, f"Rust: {path.name}"), None))
    if not {"licenses/MIT.txt", "licenses/Apache-2.0.txt"}.issubset({t[0] for t in texts}):
        raise NoticeError("Rust toolchain lacks its MIT or Apache license text")
    return release[1], revision[1], texts


def append_texts(lines, texts):
    for label, text, url in texts:
        lines.extend([f"--- Upstream notice: {label} ---"])
        if url:
            lines.append(f"Notice source: {url}")
        lines.extend(["", text.rstrip(), ""])


def generate(args):
    if args.metadata_file:
        metadata = json.loads(read_text(args.metadata_file, "cached Cargo metadata"))
    else:
        metadata = json.loads(run([args.cargo, "metadata", "--format-version", "1", "--locked",
                                   "--filter-platform", args.target, "--manifest-path",
                                   str(ROOT / "src-tauri/Cargo.toml")], "Locked target-specific Cargo metadata"))
    application, packages = resolved_packages(metadata)
    checksums = lock_checksums()
    fallback_base, fallbacks = fallback_inputs()
    lines = ["CloudCue distribution notices", "=" * 72,
             f"Application version: {application['version']}", f"Rust target: {args.target}", "",
             "This file preserves project and upstream license/notice texts for the",
             "locked Cargo dependency graph resolved for this target. The graph is",
             "conservatively inclusive of build dependencies; listing a package does",
             "not assert that all its code is present in this executable. Rust's",
             "standard-library distribution notices are included separately below.",
             "Host operating-system libraries and components are outside this Cargo",
             "inventory. This file is not a claim of a completed legal-clearance audit.", "",
             "Registry packages are used unmodified. For each package, the source",
             "archive URL below retrieves the exact original source, including covered",
             "MPL-2.0 source where applicable, at no charge; its SHA-256 is recorded.",
             "Those source files retain their upstream terms. License alternatives",
             "remain as declared upstream; combined AND requirements are retained.", "",
             "Project license", "-" * 72, read_text(ROOT / "LICENSE", "project LICENSE").rstrip(), "",
             f"Resolved Cargo dependencies: {len(packages)}", ""]
    for package in packages:
        name, version = package["name"], package["version"]
        if package.get("source") != REGISTRY:
            raise NoticeError(f"Unsupported non-crates.io dependency: {name} {version}")
        if (name, version) not in checksums:
            raise NoticeError(f"Dependency is absent from locked registry checksums: {name} {version}")
        texts, note = package_notices(package, fallback_base, fallbacks)
        encoded_name, encoded_version = quote(name, safe=""), quote(version, safe="")
        lines.extend(["=" * 72, f"Package: {name} {version}", f"SPDX license declaration: {package['license']}",
                      f"Source archive: https://static.crates.io/crates/{encoded_name}/{encoded_name}-{encoded_version}.crate",
                      f"Source archive SHA-256: {checksums[(name, version)]}"])
        if note:
            lines.append(f"Notice provenance: {note}")
        lines.append("")
        append_texts(lines, texts)
    release, revision, texts = standard_library_notices(args.rustc)
    lines.extend(["=" * 72, f"Rust standard library: {release}", f"Rust source revision: {revision}",
                  f"Source archive: https://github.com/rust-lang/rust/archive/{revision}.tar.gz",
                  "The toolchain's upstream standard-library notice includes its own",
                  "build dependencies and target variants conservatively. Full supplied",
                  "copyright and embedded license texts are retained in readable form.", ""])
    append_texts(lines, texts)
    content = "\n".join(lines).rstrip() + "\n"
    # Generated resources must not reveal local build paths or host identities.
    for forbidden in (str(ROOT), str(Path.home()), str(Path(metadata["target_directory"]))):
        if forbidden and forbidden in content:
            raise NoticeError("Generated notices contain a local build path")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_name(args.output.name + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="\n") as stream:
        stream.write(content)
    temporary.replace(args.output)
    print(f"Generated distribution notices for {args.target}: {len(packages)} Cargo dependencies; Rust {release}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target", required=True, choices=TARGETS)
    parser.add_argument("--output", type=Path, default=ROOT / "DISTRIBUTION-NOTICES.txt")
    parser.add_argument("--cargo", default="cargo", help="Cargo executable for the active build toolchain")
    parser.add_argument("--rustc", default="rustc", help="Rust compiler for the same active build toolchain")
    parser.add_argument("--metadata-file", type=Path,
                        help="Offline verification input already produced with --locked --filter-platform TARGET")
    args = parser.parse_args()
    try:
        generate(args)
    except (NoticeError, ValueError, KeyError, TypeError) as exc:
        print(f"Distribution notice generation failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
