# CloudCue

An offline desktop app for practicing CCSP cloud security foundations. Answer a few questions, understand the explanations, and revisit what you missed.

CloudCue includes **60 AI-assisted, original practice questions**, with ten in each of the six CCSP domains. It provides topic filters, shuffled questions and answer choices, immediate feedback in Practice mode, delayed feedback in Self-test mode, paused sessions, answer review, and retries. Scores and the current session stay in local webview storage; the app has no account system, analytics, or study-data upload.

Choose the **Curated** bank for the included questions or import a **Private** JSON bank for local study. The two banks have separate questions, saved sessions, and scores. Private imports do not submit content to the shared bank.

## Download

Find published downloads on [CloudCue Releases](https://github.com/tigerrabbit/cloudcue/releases). Follow the [installation guide](INSTALL.md) to choose your platform, verify the checksum, install, and start studying. These are early previews: macOS uses an ad-hoc signature without Developer ID signing or notarization, Windows packages are unsigned, and Linux retains a documented dependency advisory. Read each release's build and installation status before downloading.

## Start studying

1. Choose a topic, session length, and mode.
2. Select an answer and submit it before moving on.
3. Pause to resume later, or finish to review explanations and source references.
4. Retry missed questions or start a different topic. Reset progress clears this app's saved study data after confirmation.

Answering questions works offline. Source references need an internet-connected browser. A copyable URL is provided because external link behavior can vary between webviews. Local progress is not encrypted or synchronized; clearing webview data can remove it.

## Private local question bank

Choose **Private** using the bank selector, then choose a JSON file with the import control. Select **Import locally** to confirm a valid import before replacing the current private bank; replacement resets private-only progress. Switch between **Curated** and **Private** using the bank selector. The curated bank and its progress stay separate.

**Export private questions** opens a read-only JSON dialog. Review the contents, then explicitly choose **Download JSON** or **Copy JSON** to export them. **Remove locally** also requires confirmation. The app stores the private bank and progress in its app-local `localStorage` namespace, with no backend, accounts, or automatic uploads. Private banks, local progress, and exported JSON are not encrypted. Clearing webview data can remove them; keep an authorized export if you need a backup.

Use only material you are authorized to possess and use. Importing does not grant redistribution rights or make a question part of the curated bank. Do not use real, recalled, leaked, or confidential exam questions. Do not commit private banks, exports, or scores to this repository. The [synthetic example](ui/private-bank-example.json) is a starting point for the format.

The JSON object has exactly two root keys: `schemaVersion`, set to the integer `1`, and `questions`, an array of 1–500 question objects. Unsupported keys at the root, question, or source level are rejected. Each question uses these fields:

| Field | Required format and limit |
| --- | --- |
| `id` | Optional string matching `^private-[A-Za-z0-9_-]{1,56}$`, at most 64 characters. Omitted IDs default to sequential IDs such as `private-0001`. |
| `topic` | Nonempty free-text string, at most 160 code units. |
| `prompt` | Nonempty string, at most 2,000 code units. |
| `options` | Exactly four nonempty strings, each at most 1,000 code units; all must remain distinct after whitespace normalization and case folding. |
| `correct` | Integer `0`–`3`, indexing the correct choice in `options`. |
| `explanation` | Nonempty string, at most 4,000 code units. |
| `source` | Object containing exactly `title` and `url`. |
| `source.title` | Nonempty string, at most 300 code units. |
| `source.url` | HTTPS URL, at most 2,048 code units before and after URL normalization, with no embedded username, password, or whitespace. |

Text is trimmed, checked for unsupported control characters, and rendered as plain text. Length limits use JavaScript UTF-16 code units, so some characters count as two units. Duplicate question IDs are rejected; duplicate prompts are rejected after whitespace normalization and case folding. Both the input file and the normalized, pretty-printed JSON export must fit within **2 MiB (2,097,152 bytes)**; a compact input can exceed the export limit once formatted. Invalid imports leave the current bank intact.

## What this bank covers

The bank is a **foundation baseline**, informed by the CCSP outline effective August 1, 2026. Difficulty and coverage are uneven. It is not a complete current-objective syllabus, a weighted or adaptive exam simulation, or a substitute for current training and fresh practice tests. Repeated attempts contribute to latest-answer accuracy and do not measure performance on unseen questions. Practice percentages are not official scaled scores or a prediction that you will pass.

The questions and explanations were authored with Codex assistance, not copied from an official exam or purchased question bank. Their primary-source references are kept alongside the bank. See [content provenance](CONTENT_PROVENANCE.md) for scope and limitations. Source websites remain under their own terms; no reference PDFs, course material, or official exam questions are bundled.

Curated submissions require original work or documented redistribution authorization, an answer rationale, a public concept source, and human maintainer review. Real, recalled, leaked, or confidential exam questions are prohibited. Reported or identified policy violations are removed from the shared bank and its generated copy. See [contributing](CONTRIBUTING.md#questions-and-rights) before proposing content.

CloudCue is an independent project and is not affiliated with, endorsed by, or sponsored by ISC2. CCSP and other referenced names belong to their respective owners. The icon is an original cloud-and-check illustration, not a certification logo.

## Run and build

Manual native behavior has been checked on macOS Apple Silicon. Hosted CI has also compiled Windows x64 and Linux x64 packages; their installation and desktop behavior have not been manually verified. Install Node.js 22 or later, Python 3.9 or later, a stable Rust toolchain with `rustfmt` and Clippy, and your [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/). The default build script produces a macOS app bundle.

```sh
npm ci
npm test
npm run check
cargo fmt --manifest-path src-tauri/Cargo.toml --check
python3 scripts/generate-distribution-notices.py --target aarch64-apple-darwin
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --locked -- -D warnings
npm run dev
npm run build
```

The build produces `src-tauri/target/release/bundle/macos/CloudCue.app`. It has no Developer ID signature or notarization. Dependencies are recorded in both lockfiles. Native commands need the generated `DISTRIBUTION-NOTICES.txt` resource; the POSIX launcher regenerates it for the host target before `dev` or `build`. See [third-party notices](THIRD_PARTY_NOTICES.md) for its scope.

### Desktop platform routes

Run `npm ci`, `npm test`, and `npm run check` on each development machine. Install the official [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/) before native commands. `npm run dev` and `npm run build` use a POSIX launcher and currently target a macOS app; use the direct CLI routes below on other operating systems. Before a direct CLI or Cargo command, run `python scripts/generate-distribution-notices.py --target <target>` using the same Rust toolchain as the build, with `x86_64-pc-windows-msvc` for Windows or `x86_64-unknown-linux-gnu` for Linux.

| Platform | Prerequisites and build route | Verification |
| --- | --- | --- |
| macOS | Xcode command-line tools (`xcode-select --install`), Node 22+, stable Rust with rustfmt/Clippy. `npm run dev`; `npm run build`. | Apple Silicon native build and manual app checks passed; macOS CI builds the app. |
| Windows | Microsoft C++ Build Tools with **Desktop development with C++**, WebView2, and an MSVC Rust toolchain. `npx tauri dev`; `npx tauri build --bundles nsis`. | Hosted x64 compilation and unsigned NSIS package checks passed; native installation and behavior remain untested. |
| Debian/Ubuntu Linux | Tauri's WebKitGTK 4.1 development packages and compiler prerequisites. `npx tauri dev`; `npx tauri build --bundles deb`. | Hosted Ubuntu 22.04 x64 compilation and DEB metadata checks passed; native installation and behavior remain untested. Read the [known dependency advisory](SECURITY.md#known-dependency-advisory) first. |

For Debian/Ubuntu, the current prerequisite list is `libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`. Other distributions use different package names. These routes do not provide developer signing, notarization, or verified native installation. AppImage distribution is withheld while its additional bundled native-library obligations are resolved. iOS and Android are future exploration, with no supported mobile build today.

### Checks and ways to help

The repository has 21 automated Node tests and native compilation checks. [Testing notes](TESTING.md) distinguish those checks from browser E2E flows and manual macOS app checks. Ordinary Ubuntu CI runs JavaScript tests and bank regeneration; the separate preview workflow builds desktop packages on each platform.

Help by reviewing question accuracy and explanations, testing keyboard and screen-reader access, or validating a desktop platform. [Open a focused issue](https://github.com/tigerrabbit/cloudcue/issues/new), [propose a legitimate question](https://github.com/tigerrabbit/cloudcue/issues/new?template=question-submission.yml), or follow [CONTRIBUTING.md](CONTRIBUTING.md) for a small pull request. Community participation follows the [code of conduct](CODE_OF_CONDUCT.md).

## Project layout

- `ui/`: static HTML, CSS, question bank, and study engine; no frontend framework or bundler.
- `ui/private-bank-example.json`: synthetic example of the private JSON import schema.
- `data/`: original CCSP authoring rows and retained source-reference metadata.
- `scripts/build-bank.py`: deterministic bank generator using Python 3; generated `ui/questions.js` is committed.
- `tests/`: bank integrity, scoring, filtering, and saved-session regression checks.
- `src-tauri/`: Tauri 2 native shell with no custom native commands or plugins.
- `scripts/tauri.sh`: POSIX launcher preferring an existing ignored `.local/toolchain` installation, otherwise using Rust on your PATH.
- `.github/workflows/build-release.yml`: manually triggered preview-package builds from `main`; it stages checked packages and metadata without publishing a release.
- `scripts/stage-release.py`: package architecture, identity, signing-status, bundled-file, and checksum checks for clean CI builds.
- `scripts/generate-distribution-notices.py`: target-specific Cargo and Rust standard-library license texts and exact source references, bundled as a build resource.

To edit the question bank, update `data/ccsp.psv` and, when needed, `data/sources.json`, run `python3 scripts/build-bank.py`, then run the tests and syntax checks. Each row has eight pipe-separated fields: topic, source key, prompt, correct answer, three distractors, and explanation.

## Credits

Built with Rust and Tauri, with development assistance from OpenAI Codex and ChatGPT, and security analysis assisted by Grok 4.7. The frontend uses plain HTML, CSS, and JavaScript.

## License and contributions

Project-authored code, questions, explanations, and icon are offered under the [MIT license](LICENSE), copyright Gregory Wendel, 2026. Authorized third-party additions must preserve their applicable license, attribution, and notices. Dependency and reference-content rights remain separate; see [third-party notices](THIRD_PARTY_NOTICES.md). AI-assisted authorship and citations do not guarantee clearance of every possible third-party claim.

See [contributing](CONTRIBUTING.md) and [security](SECURITY.md) for maintenance and reporting guidance.
