#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
toolchain=".local/toolchain"
if [ -x "$toolchain/cargo/bin/cargo" ]; then
  export CARGO_HOME="$(cd "$toolchain/cargo" && pwd)"
  export RUSTUP_HOME="$(cd "$toolchain/rustup" && pwd)"
  export PATH="$CARGO_HOME/bin:$PATH"
fi
case "${1:-}" in
  dev|build)
    target=$(rustc -vV | sed -n 's/^host: //p')
    python3 scripts/generate-distribution-notices.py --target "$target"
    ;;
esac
exec ./node_modules/.bin/tauri "$@"
