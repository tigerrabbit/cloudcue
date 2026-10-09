# Security

## Supported scope

Security fixes target the latest source on the default branch. CloudCue is a local desktop study app with a bundled bank, local webview storage, no account system, and no custom native commands or plugins. Its saved progress is not encrypted and can be read by software with access to the same user profile.

## Reporting

Use [GitHub private vulnerability reporting](https://github.com/tigerrabbit/cloudcue/security/advisories/new) when enabled for the public repository. If that route is unavailable, [open a minimal issue](https://github.com/tigerrabbit/cloudcue/issues/new) requesting maintainer follow-up without publishing credentials, personal data, exploit details, or a sensitive proof of concept. This policy does not promise a response deadline.

Include the affected commit, platform, reproduction steps, expected security boundary, impact, and any safe supporting evidence. Do not send secret values or personal study records.

## Review boundaries

Review bundled-content rendering, source URL handling, saved-state parsing and track isolation, CSP, native capabilities, dependency/build configuration, and privileged automation. Same-user modification of one's own study scores is not a privilege boundary. External reference sites and host operating-system compromise are outside the app's control, while defects that grant new native authority or disclose data across a boundary remain in scope.

The project does not claim that any single scan proves absence of vulnerabilities. Signed distribution and automatic updates are not configured.

## Known dependency advisory

The upstream `glib 0.18.5` crate is affected by [GHSA-wrw7-89jp-8q8g / RUSTSEC-2024-0429](https://rustsec.org/advisories/RUSTSEC-2024-0429.html): optimized string iteration can dereference a null pointer. CloudCue now uses a reviewed local copy with the exact upstream mutable-output-pointer fix. All five affected iterator access paths share the repaired method. Optimized regression tests cover forward/reverse iteration, nth/nth_back/last, Unicode, empty strings and invalid types.

The GTK 3 dependency chain still requires GLib 0.18, so adding 0.20 alongside it would leave the old copy installed. The `[patch.crates-io]` override selects only the reviewed local backport. Its genuine upstream version remains 0.18.5; it is not an official new release. [Source provenance](vendor/README.md) records all original and patched hashes, licenses and the upstream fix. Distribution notices verify the complete vendored inventory and provide an immutable public source route. Commit changes under `vendor/` before generating binary notices.

Tauri uses GLib on Linux/BSD; macOS/Windows dependency graphs exclude it. CloudCue's authored Rust does not call the affected API, and application exploitability through framework code has not been demonstrated. The isolated unpatched optimized iterator test crashed with SIGSEGV; the reviewed copy passes. Linux/BSD desktop installation and interaction remain unvalidated. Dependency-alert disappearance alone is not proof of remediation; maintain the optimized regression and provenance checks. Remove the backport only when a compatible framework update accepts a patched upstream series. Published Linux downloads from before this source fix have not been rebuilt with it. This does not claim a clean repository-wide advisory audit.
