# Testing CloudCue

## Automated checks in the repository

`npm test` runs 21 Node tests across `tests/study-core.test.cjs` and `tests/private-bank.test.cjs`. They cover bank/source integrity, deterministic authoring equivalence, selection/shuffle, scoring, feedback timing, missed filters, saved-state recovery, private schema/size/count/text limits, duplicate and unsafe-URL rejection, content-only round trips, and bank-revision isolation. `npm run check` checks JavaScript syntax.

CI also regenerates `ui/questions.js` and requires no diff. Its macOS job runs Rust formatting, Clippy with warnings denied, locked compilation through `cargo test`, and the app build. The Rust shell currently defines no unit tests; `cargo test` confirms compilation rather than native behavior. The Ubuntu job runs JavaScript checks, not a Linux desktop build.

The separate manually triggered preview workflow builds macOS arm64 DMG, Windows x64 NSIS, and Ubuntu 22.04 amd64 DEB from a clean main-branch commit. It checks executable architecture, package identity, actual signing status, privacy patterns, and checksums. Distribution notices are generated from locked dependencies, bundled, and compared against the packaged payload alongside the executable. These archive inspections do not execute an installer or test desktop behavior. AppImage distribution is withheld for additional bundled-library obligations.

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

Windows and Linux hosted builds have passed compilation and packaging checks; their native installation and desktop behavior remain unvalidated. Linux/BSD uses a [reviewed GLib safety backport](SECURITY.md#known-dependency-advisory), verified by optimized iterator regressions. iOS and Android builds have not been validated. No developer signing, notarization, automatic updates, official exam simulation, or readiness score is covered by these checks.

For a pull request, record the operating system and architecture, commands and flows actually run, any limitations, and screenshots for visible UI changes. Use synthetic test questions and disposable local progress; exclude personal study records and private exports from evidence.

## Workflow tests and coverage

Install pinned dev dependencies with `npm ci`, then `npx playwright install chromium`.
`npm run test:e2e` exercises five complete workflows at 940×800 and the configured
minimum window of 360×380. A loopback server serves the unchanged bundled UI with
its production CSP. The Browser plugin is not available in the development session;
regular Playwright is used for repeatable automation. These renderer tests are
separate from native desktop tests; they do not claim to test Rust startup.

The workflows cover answer locking, feedback timing, pause/reload/resume, scoring
once, retrying misses, reset confirmation, synthetic private-bank import/replacement,
curated/private isolation, export preview plus separate download/copy, removal,
invalid files, quota failure, literal markup, offline study and keyboard controls.
Only `ui/private-bank-example.json` and synthetic variations are used.

`npm run test:coverage` measures unit tests across **all three authored UI modules**,
including the DOM controller, with unexecuted files included. `npm run coverage:e2e`
reports Chromium V8 coverage from the workflow tests. HTML reports and JSON summaries
live under ignored `.local/coverage/`; generated bank data, dependencies and test code
are excluded. Unit-only and browser-only results are separate; line coverage is not
proof of accessibility, security or complete branch coverage. CI retains reports and
failure traces as artifacts for 14 days. Run a fresh workflow suite for current evidence.

On Linux, install `webkit2gtk-driver`, `xvfb`, `xauth`, `dbus-x11` and
`cargo install tauri-driver --version 2.1.0 --locked`. Build the native release with
its target-specific notices, then `npm run test:e2e:native`. These tests drive the
actual Tauri/WebKit executable, including process close/reopen and the minimum window.
A disposable XDG profile isolates all test progress. No native test plugin, invoke
mock, CSP change or WebKit sandbox override is added. macOS native automation remains
manual because the upstream external driver supports Linux/Windows.

For Python coverage, create an ignored venv and install `coverage==7.10.7`:
`COVERAGE_FILE=.local/coverage/python.data python -m coverage run --branch --source=scripts -m unittest discover -s tests -p 'test_notices*.py'`.
`python -m coverage report --data-file=.local/coverage/python.data` includes untested
build/staging scripts. Notice-helper tests do not cover native package installation.
