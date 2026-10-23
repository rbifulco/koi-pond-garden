import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { normalizeSpatialReviewDiscovery } from '@alterno-dev/spatial-review-protocol';
import { pondDiscoveryForPage } from '../spatial-review-discovery.js';

const manifest = JSON.parse(await readFile(new URL('../public/.well-known/spatial-review.json', import.meta.url)));
for (const base of ['https://rbifulco.github.io/koi-pond-garden/', 'http://127.0.0.1:9183/koi-pond-garden/']) {
  test(`static and browser discovery resolve to the same capture at ${base}`, () => {
    const registration = pondDiscoveryForPage(`${base}koi-pond.html?spatial-review-capture=1`);
    const staticResult = normalizeSpatialReviewDiscovery(manifest, registration.discoveryUrl);
    const bridgeResult = normalizeSpatialReviewDiscovery({schema: manifest.schema, version: 1, ...registration}, registration.discoveryUrl);
    assert.equal(registration.discoveryUrl, `${base}.well-known/spatial-review.json`);
    assert.equal(staticResult.websiteUrl, base);
    assert.equal(bridgeResult.websiteUrl, base);
    assert.equal(staticResult.liveCapture, `${base}koi-pond.html?spatial-review-capture=1`);
    assert.equal(bridgeResult.liveCapture, staticResult.liveCapture);
  });
}
test('published discovery advertises only the existing production editor policy', () => {
  assert.deepEqual(manifest.capabilities.liveCapture.editorOriginPolicy, {
    mode: 'allowlist', origins: ['https://spatial-review.alterno.dev'], allowLoopbackPeers: false,
  });
});
