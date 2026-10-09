#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
[ "$(uname -s)" = Linux ] || { echo 'Native WebKit tests require Linux.' >&2; exit 1; }
[ -x src-tauri/target/release/cloudcue ] || { echo 'Build the release app first.' >&2; exit 1; }
command -v tauri-driver >/dev/null
command -v WebKitWebDriver >/dev/null
# A disposable XDG profile keeps these tests away from actual app-local records.
profile=$(mktemp -d)
trap 'rm -rf "$profile"' EXIT HUP INT TERM
export XDG_CONFIG_HOME="$profile/config" XDG_DATA_HOME="$profile/data" XDG_CACHE_HOME="$profile/cache"
mkdir -p "$XDG_CONFIG_HOME" "$XDG_DATA_HOME" "$XDG_CACHE_HOME"
dbus-run-session -- xvfb-run -a node --test tests/native/desktop.test.cjs
