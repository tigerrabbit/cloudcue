# Private builds from the public source

CloudCue has one Tauri application, one Rust dependency lockfile and one study
engine. The private profile builds that same source with a separate app name and
identifier. It contains the same curated questions and the existing local
private-bank importer. Personal question banks and progress are runtime data,
not another source repository.

## Build on macOS

Use the prerequisites in [README.md](README.md#run-and-build), then:

```sh
git clone https://github.com/tigerrabbit/cloudcue.git
cd cloudcue
npm ci
npm test
npm run check
npm run build:private
```

The result is
`src-tauri/target/release/bundle/macos/CloudCue Private.app`. For development,
use `npm run dev:private`. `npm run build` continues to produce `CloudCue.app`.
The private macOS profile applies an ad-hoc signature for local use. It does not
use a Developer ID certificate or notarization and is not a signed distribution
for other users. The standard build's signing configuration is unchanged.

The profile is
[`src-tauri/tauri.private.conf.json`](src-tauri/tauri.private.conf.json). Tauri
[merges it with the standard configuration](https://v2.tauri.app/develop/configuration-files/#extending-the-configuration).
It changes the product name, identifier and local macOS ad-hoc signing setting.
The Rust code, frontend,
restrictive content security policy, capabilities and distribution notices are
shared. There are no additional native commands, network services or secrets.

| Build | App identifier | Local records |
| --- | --- | --- |
| Standard | `io.github.tigerrabbit.cloudcue` | Standard CloudCue webview storage |
| Private | `io.github.tigerrabbit.cloudcue.private` | Separate private-profile webview storage |

The distinct identifiers let the installed apps coexist and isolate their
webview data. This is local app separation, not encryption or an access-control
boundary against someone who can access your Mac account. The private build's
source remains public.

## Use private study material

Open **CloudCue Private**, select **Private**, choose an authorized JSON bank,
and confirm **Import locally**. The importer, limits and explicit export/remove
controls are described in [README.md](README.md#private-local-question-bank).
Keep banks and exports outside the checkout. Do not put personal material in
`ui/`, `data/`, bundled resources, commits or release artifacts. Nothing is
uploaded automatically, and local records are not encrypted.

This profile starts with its own empty progress and private-bank storage. It
does not migrate or overwrite records from standard CloudCue, Echo Tauri, or
Echo GPUI. Existing Echo checkouts, installed apps and progress remain available
for reference; the GPUI implementation is no longer a maintained build target.

## Windows and Linux

Follow the platform prerequisites and notice-generation steps in
[README.md](README.md#desktop-platform-routes), then add the same profile to the
normal Tauri command:

```sh
# Windows, after generating notices for x86_64-pc-windows-msvc:
npx tauri build --config src-tauri/tauri.private.conf.json --bundles nsis -- --locked

# Debian/Ubuntu, after generating notices for x86_64-unknown-linux-gnu:
npx tauri build --config src-tauri/tauri.private.conf.json --bundles deb -- --locked
```

The private profile has been built on macOS Apple Silicon. Private Windows and
Linux packages have not been built or manually verified. Existing signing,
preview and AppImage limitations still apply. Private builds are made locally;
the public release workflow continues to package only standard CloudCue.
