# GLib safety backport

This is the official crates.io GLib 0.18.5 source with exactly two lines changed
in `src/variant_iter.rs`: `let p` becomes `let mut p`, and the C output argument
changes from `&p` to `&mut p`. This matches [upstream commit
b5a4071](https://github.com/gtk-rs/gtk-rs-core/commit/b5a4071e439bef2b5eea76c3aa25e5ae84839e34)
for [RUSTSEC-2024-0429](https://rustsec.org/advisories/RUSTSEC-2024-0429.html).
No new unsafe block or native capability was added. Existing upstream FFI is
retained. Original MIT license and copyright files are preserved.

`provenance.json` records the upstream archive SHA-256 and original/patched
SHA-256 hashes of all 120 retained files. Cargo cache metadata is omitted.
The upstream version number is preserved; this is a local safety backport, not
an official release. The Tauri GTK 3 chain requires GLib 0.18, preventing a
simple upgrade to the patched 0.20 series. Both the application and optimized
regression manifests override crates.io with this exact local copy.

`npm run test:security` runs notice/provenance checks and optimized string
iterator regressions. System GLib development files are required (`brew install
glib pkgconf` on macOS; `libglib2.0-dev` on Ubuntu). The isolated original release
test crashes; the patched forward/reverse/nth/nth_back/last tests pass, with
Unicode, empty input and wrong-type controls. The app's private question banks
and progress are not part of these tests or this source copy.

Commit changes under `vendor/` before generating binary notices. Notice generation
rejects source modifications, missing/extra files, symlinks and unrelated path
dependencies. Linux notices include the patched copy and exact committed public
source; macOS and Windows omit GLib when absent from their resolved graphs.
Remove this override and vendor copy together when a compatible framework
release accepts a fixed upstream series. Grid is not in CloudCue's dependency
graph; its separate GPUI fix belongs to the local Echo project.
