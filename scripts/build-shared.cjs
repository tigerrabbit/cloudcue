// Copy only the public shared assets into the offline bundle; no runtime fetches.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const [source, output] of [['shared/study-core.js', 'ui/study-core.js'], ['shared/study.css', 'ui/style.css']]) {
  const content = fs.readFileSync(path.join(root, source));
  if (process.argv.includes('--check')) {
    if (!content.equals(fs.readFileSync(path.join(root, output)))) throw Error(`Stale shared asset: ${output}; run npm run build:shared`);
  } else fs.writeFileSync(path.join(root, output), content);
}
