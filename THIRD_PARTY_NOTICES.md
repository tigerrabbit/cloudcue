# Third-party notices

The MIT license in this repository applies to project-authored material. It does not replace the licenses of dependencies or linked reference material.

Tauri and `@tauri-apps/cli` are used under their upstream **Apache-2.0 OR MIT** license. The unmodified upstream license texts from the installed Tauri CLI 2.12.0 distribution are retained in `third-party/tauri/LICENSE-APACHE-2.0` and `third-party/tauri/LICENSE-MIT`, including their original attribution.

The JavaScript and Rust dependency versions are recorded in `package-lock.json` and `src-tauri/Cargo.lock`. Their source packages retain their own license files and metadata. The frontend has no installed JavaScript runtime dependencies; the Tauri CLI is a development tool.

Before a native build, `scripts/generate-distribution-notices.py --target <target>` creates the ignored `DISTRIBUTION-NOTICES.txt` resource. It preserves project and upstream license/copyright/NOTICE texts from the locked target-specific Cargo graph, conservatively including build dependencies, and the active Rust toolchain's standard-library notices. Registry archive URLs and locked SHA-256 checksums identify exact unmodified sources, including covered MPL-2.0 source. Reviewed fallback texts for notices omitted from registry archives are pinned under `third-party/rust-license-fallbacks/` by upstream revision, URL, and checksum. The generator rejects unsupported or incomplete license coverage.

Preview packages contain this resource and provide a separate per-platform notice file. The packaging workflow verifies the installed payload's executable and notice hashes. On macOS the resource is inside `CloudCue.app/Contents/Resources`; Windows and DEB packages install it alongside their application resources. These notices do not replace upstream terms or claim a completed legal-clearance audit. The macOS Objective-C binding upstream policy, including its Apple SDK discussion, is preserved without inventing attribution or resolving that policy's uncertainty.

The Windows MSVC build links Microsoft's WebView2 SDK loader from `webview2-com-sys`. Its SDK `LICENSE.txt` and `NOTICE.txt` are included separately from the Rust wrapper's MIT license, with the exact SDK package and matching loader hashes pinned. This loader is distinct from the WebView2 Runtime installed on the host or downloaded by the installer.

DEB packages rely on host-provided GTK/WebKitGTK libraries. AppImage distribution is withheld because it additionally bundles native libraries whose complete notices and corresponding-source route have not been established. Do not redistribute those AppImages from earlier development builds. New or changed dependencies and distribution formats require another notice review.

External reference pages are linked, not bundled or relicensed. ISC2, NIST, OWASP, Microsoft, AWS, Cloud Security Alliance, and European Commission references remain subject to their respective terms. Referenced product and certification names are used for identification, with no claimed endorsement.
