import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSpatialReviewDiscovery } from '@alterno-dev/spatial-review-protocol';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const paths = (await readdir(root, {recursive: true, withFileTypes: true}))
  .filter(entry => entry.isFile())
  .map(entry => join(entry.parentPath, entry.name));
const files = await Promise.all(paths.map(async path => ({
  path: relative(root, path).split(sep).join('/'), bytes: await readFile(path),
})));
for (const required of ['index.html', 'koi-pond.html', '.nojekyll', '.well-known/spatial-review.json']) {
  assert(files.some(file => file.path === required), `Missing publication file: ${required}`);
}
const site = new URL(process.env.PAGE_URL || 'https://rbifulco.github.io/koi-pond-garden/');
if (!site.pathname.endsWith('/')) site.pathname += '/';
const manifest = JSON.parse(files.find(file => file.path === '.well-known/spatial-review.json').bytes);
const discovery = normalizeSpatialReviewDiscovery(manifest, new URL('.well-known/spatial-review.json', site).href);
assert.equal(discovery.websiteUrl, site.href);
assert.equal(discovery.liveCapture, new URL('koi-pond.html?spatial-review-capture=1', site).href);
console.log(`Build contains ${files.length} publication files and project-relative discovery.`);

if (process.env.PAGE_URL) {
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  let lastError;
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      for (const file of files) {
        const response = await fetch(new URL(file.path, site), {
          headers: {Origin: 'https://spatial-review.alterno.dev'}, signal: AbortSignal.timeout(20000),
        });
        assert.equal(response.status, 200, `${file.path}: HTTP ${response.status}`);
        assert.equal(digest(new Uint8Array(await response.arrayBuffer())), digest(file.bytes), `${file.path}: stale or changed file`);
        if (file.path.endsWith('.js')) assert.match(response.headers.get('content-type') || '', /javascript/);
        if (file.path === '.well-known/spatial-review.json') {
          assert(['*', 'https://spatial-review.alterno.dev'].includes(response.headers.get('access-control-allow-origin')), 'Discovery must be readable by the editor');
        }
        if (file.path === 'koi-pond.html') assert.equal(response.headers.get('x-frame-options'), null, 'Capture must allow editor embedding');
      }
      console.log(`Verified every published file against the build at ${site.href}`);
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      console.log(`Publication attempt ${attempt}: ${error.message}`);
      if (attempt < 12) await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  if (lastError) throw lastError;
}
