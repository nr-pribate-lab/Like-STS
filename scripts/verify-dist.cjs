// Verify deployment paths using a project-site URL, including case-sensitive names.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../dist');
const base = new URL('https://example.github.io/LikeSlayTheSpire/');
function verify(reference, parent = base) {
  const url = new URL(reference, parent);
  assert.equal(url.origin, base.origin, `Unexpected external asset: ${reference}`);
  assert.ok(url.pathname.startsWith(base.pathname), `Asset escapes project URL: ${reference}`);
  const parts = decodeURIComponent(url.pathname.slice(base.pathname.length)).split('/').filter(Boolean);
  let current = root;
  for (const part of parts) {
    assert.ok(fs.readdirSync(current).includes(part), `Missing asset or wrong capitalization: ${reference}`);
    current = path.join(current, part);
  }
  assert.ok(fs.statSync(current).isFile(), `Asset is not a file: ${reference}`);
  return { url, file: current };
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (match[1].startsWith('#')) continue;
  const asset = verify(match[1]);
  if (asset.file.endsWith('.css')) {
    for (const entry of fs.readFileSync(asset.file, 'utf8').matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) {
      if (!entry[1].startsWith('data:') && !entry[1].startsWith('#')) verify(entry[1], asset.url);
    }
  }
}
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(verify('content/manifest.js').file, 'utf8'), context);
const manifest = context.window.GameContentManifest;
const files = [
  ...Object.values(manifest.shared).flat(),
  ...manifest.characters.flatMap(entry => [entry.definition, ...entry.cards]),
  ...manifest.gameCore, ...manifest.application,
];
for (const file of files) verify(file);
assert.equal(fs.existsSync(path.join(root, '.git')), false);
assert.equal(fs.existsSync(path.join(root, '.github')), false);
console.log(`Distribution verified: HTML/CSS and ${files.length} manifest assets resolve under ${base.pathname}, with exact filename casing.`);
