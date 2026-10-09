const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const destination = '.local/coverage/combined-v8';
fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination, { recursive: true });
for (const [name, source] of [['unit', '.local/coverage/unit/tmp'], ['browser', '.local/coverage/browser-v8']]) {
  const files = fs.readdirSync(source).filter(file => file.endsWith('.json'));
  if (!files.length) throw new Error(`Run the ${name} suite before combining coverage.`);
  for (const file of files) fs.copyFileSync(path.join(source, file), path.join(destination, `${name}-${file}`));
}
const result = spawnSync(process.execPath, [require.resolve('c8/bin/c8.js'), 'report', '--all',
  '--include=ui/study-core.js', '--include=ui/private-bank.js', '--include=ui/study.js',
  `--temp-directory=${destination}`, '--reports-dir=.local/coverage/combined',
  '--reporter=text', '--reporter=html', '--reporter=json-summary'], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
