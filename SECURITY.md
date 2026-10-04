# Security

## Supported scope

Security fixes target the latest source on the default branch. CloudCue is a local desktop study app with a bundled bank, local webview storage, no account system, and no custom native commands or plugins. Its saved progress is not encrypted and can be read by software with access to the same user profile.

## Reporting

Use the repository's private GitHub vulnerability-reporting flow when available. If it is unavailable, open a minimal issue requesting a private reporting channel, without publishing credentials, personal data, exploit details, or a sensitive proof of concept. This policy does not promise a response deadline.

Include the affected commit, platform, reproduction steps, expected security boundary, impact, and any safe supporting evidence. Do not send secret values or personal study records.

## Review boundaries

Review bundled-content rendering, source URL handling, saved-state parsing and track isolation, CSP, native capabilities, dependency/build configuration, and privileged automation. Same-user modification of one's own study scores is not a privilege boundary. External reference sites and host operating-system compromise are outside the app's control, while defects that grant new native authority or disclose data across a boundary remain in scope.

The project does not claim that any single scan proves absence of vulnerabilities. Signed distribution and automatic updates are not configured.
