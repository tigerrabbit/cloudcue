# Testing CloudCue

## Automated checks in the repository

`npm test` runs 21 Node tests across `tests/study-core.test.cjs` and `tests/private-bank.test.cjs`. They cover bank/source integrity, deterministic authoring equivalence, selection/shuffle, scoring, feedback timing, missed filters, saved-state recovery, private schema/size/count/text limits, duplicate and unsafe-URL rejection, content-only round trips, and bank-revision isolation. `npm run check` checks JavaScript syntax.

CI also regenerates `ui/questions.js` and requires no diff. Its macOS job runs Rust formatting, Clippy with warnings denied, locked compilation through `cargo test`, and the app build. The Rust shell currently defines no unit tests; `cargo test` confirms compilation rather than native behavior. The Ubuntu job runs JavaScript checks, not a Linux desktop build.

## Browser E2E launch checks

During the initial release review, disposable local Chrome/Playwright harnesses exercised the static UI at 940 × 800 and 360 × 780. Those local harnesses are not committed and are not CI jobs. A narrow browser viewport is a layout check, not an iPhone or Android device test. Reproduce these flows when changing the UI:

- Curated onboarding, six-topic selection, Practice feedback, and Self-test answers hidden until completion.
- Pause, reload, resume with answers/order retained; early finish with correct, incorrect, and unanswered counts; missed-only review and retry.
- Reset cancellation and confirmation, source-link clipboard, unavailable storage, corrupt saved progress, and no horizontal overflow.
- Private empty state; synthetic JSON selection, validation, cancel/confirm, and literal HTML remaining text.
- Private pause/reload/resume, separate curated/private scores, replacement resetting only private scores, and topic filtering.
- Explicit export preview, clipboard and downloaded JSON containing only questions/answers, and preview clearing on close.
- Invalid HTTPS URLs and duplicates rejected without exposing input values; quota failure preserves the previous bank; a successful retry clears the storage warning.
- Removal cancel/confirm, truthful feedback when question deletion succeeds but score deletion fails, normal cleanup, and corrupt private-bank recovery.

The checked browser flows produced no application console errors or automatic external application requests. Source links and GitHub contribution links were not opened during that offline-path check.

## Native macOS checks and limits

The Apple Silicon macOS build was launched as a Tauri app. Manual native checks exercised curated answering/feedback, retained paused progress, selecting the private bank, the operating-system file picker with the synthetic example, import confirmation, private question launch, export preview, and explicit JSON copying. The native Download JSON action only reported a request; a saved native file was not confirmed. Copy JSON remains the documented export fallback. Browser file export was verified separately.

Windows, Linux/BSD, iOS, and Android native behavior has not been validated. Linux/BSD has a [known dependency advisory](SECURITY.md#known-dependency-advisory). No signing, notarization, automatic updates, official exam simulation, or readiness score is covered by these checks.

For a pull request, record the operating system and architecture, commands and flows actually run, any limitations, and screenshots for visible UI changes. Use synthetic test questions and disposable local progress; exclude personal study records and private exports from evidence.
