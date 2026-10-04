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

The lockfile includes `glib 0.18.5`, affected by [GHSA-wrw7-89jp-8q8g / RUSTSEC-2024-0429](https://rustsec.org/advisories/RUSTSEC-2024-0429.html): unsound iteration of `VariantStrIter` can cause undefined behavior and crashes. Tauri's GTK/WebKitGTK dependencies bring this crate into Linux/BSD builds; the verified macOS build uses AppKit/WebKit instead. CloudCue's authored Rust code does not call the affected API, but reachability through Linux framework code has not been established or ruled out. Linux/BSD builds have not been validated.

The advisory identifies `glib 0.20.0` as patched. The current upstream GTK/WebKitGTK dependency chain requires `glib 0.18`, so a normal lockfile update cannot apply that fix. This project retains the alert and does not carry an unsupported dependency fork or claim a clean dependency-advisory audit. Reassess the chain when an upstream-compatible fix is available.
