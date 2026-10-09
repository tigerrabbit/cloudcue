const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
// A fresh measurement must never include coverage from previous code or runs.
fs.rmSync('.local/coverage/browser-v8', { recursive: true, force: true });
const result = spawnSync(process.execPath, [require.resolve('@playwright/test/cli'), 'test', ...process.argv.slice(2)], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
