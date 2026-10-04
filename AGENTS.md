# CloudCue project guide

CloudCue is a CCSP foundation-practice app using Tauri 2 with static HTML/CSS/JavaScript. Read README.md for the study limitations and build prerequisites.

## Layout and checks

- `ui/study-core.js`: selection, shuffle, scoring, and saved-state validation.
- `ui/study.js`: DOM interactions and app-local progress.
- `data/ccsp.psv`, `data/sources.json`: authoring source; regenerate with `python3 scripts/build-bank.py`.
- `ui/private-bank-example.json`: synthetic schema-version-1 example; never replace it with personal or restricted study content.
- `src-tauri/src/main.rs`: native startup, with no custom commands or plugins.
- `tests/`: meaningful study-behavior and bank-integrity regressions.

Run `npm test` and `npm run check`. Use `cargo fmt --manifest-path src-tauri/Cargo.toml --check`, `cargo test --manifest-path src-tauri/Cargo.toml --locked`, and `cargo clippy --manifest-path src-tauri/Cargo.toml --locked -- -D warnings` for Rust checks. Run `npm run build` for native or packaging changes.

Before direct native/Cargo commands, generate `DISTRIBUTION-NOTICES.txt` with `python3 scripts/generate-distribution-notices.py --target <target>` using the build's active Rust toolchain. The POSIX launcher does this for its host target. Keep the generated resource out of Git; preserve pinned fallback notice provenance. Preview packages must pass payload notice/executable hash checks. AppImage distribution is withheld pending its additional native-library obligations.

For UI changes verify answering, Self-test feedback timing, pause/reopen/resume, early finish, retrying misses, reset confirmation, and desktop/narrow layouts. Inspect console errors and screenshots. State checks that could not run.

For private-bank changes verify the 2 MiB and 1–500 question limits, bounded plain-text fields, exactly four distinct options, correct-answer range, duplicate rejection, and credential-free HTTPS source URLs. Keep the README schema and synthetic example aligned with the importer. Verify separate curated/private scores and storage namespaces, explicit confirmation before import replacement, a separate download/copy action after the export preview, and offline behavior. For documentation and GitHub-template changes, check local links, required submission fields, and consistency with these policies.

## Constraints

Preserve plain-text rendering, the restrictive CSP, the app-specific storage namespaces, and an offline study path. Private JSON banks and scores stay local and separate from curated questions; import replacement needs explicit confirmation and export needs an explicit download/copy action after preview. Do not add automatic uploads, a backend, accounts, or claims that local records are encrypted. Keep private records, exports, and unrelated training out of this project. Do not add native filesystem, shell, network, or plugin capabilities without a task that requires them. Avoid unsafe Rust. Keep both lockfiles; exclude credentials, local toolchains, dependencies, generated schemas, and compiled outputs. Preserve third-party notices and source attribution.

Shared-bank questions must be original or have documented redistribution authorization, an answer rationale, and a public concept source. Human maintainer review is required before inclusion. Never add real, recalled, leaked, or confidential exam questions, reconstructed exam items, or exam dumps. Remove reported or identified policy violations from the shared bank and its generated copy. Preserve the independent, unendorsed ISC2 disclaimer and the contributor rights requirements in CONTRIBUTING.md and CONTENT_PROVENANCE.md.
