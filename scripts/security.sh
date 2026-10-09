#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ -x .local/toolchain/cargo/bin/cargo ]; then
  export CARGO_HOME="$PWD/.local/toolchain/cargo"
  export RUSTUP_HOME="$PWD/.local/toolchain/rustup"
  export PATH="$CARGO_HOME/bin:$PATH"
fi
python3 -m unittest discover -s tests -p 'test_notices*.py'
exec cargo test --release --locked --manifest-path security-tests/Cargo.toml "$@"
