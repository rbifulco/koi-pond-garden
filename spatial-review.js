import * as THREE from 'three';
import { pondDiscoveryForPage } from './spatial-review-discovery.js';
import {
  SceneAssetRegistry,
  attachSceneAssetRegistryBridge,
  attachSpatialReviewDiscoveryBridge,
  createSpatialReviewEditorAuthorization,
} from '@alterno-dev/spatial-review';

// Only the official editor and, during local development, other loopback ports.
const authorization = createSpatialReviewEditorAuthorization({
  allowOfficialEditor: true,
  allowLoopbackPeers: import.meta.env.DEV,
  advertiseEditorOriginPolicy: {
    publicOrigins: ['https://spatial-review.alterno.dev'],
  },
});

export function attachPondDiscovery() {
  const detach = attachSpatialReviewDiscoveryBridge(pondDiscoveryForPage(window.location.href), authorization);
  window.addEventListener('pagehide', detach, { once: true });
}

const subjects = [
  { id: 'terrain', name: 'Pond basin and shore', category: 'Landscape', owner: 'garden', source: 'buildTerrain' },
  { id: 'bridge', name: 'Arched wooden bridge', category: 'Architecture', owner: 'garden', source: 'buildBridge' },
  { id: 'pavilion', name: 'Six-sided pavilion', category: 'Architecture', owner: 'garden', source: 'buildPavilion' },
  { id: 'waterfall', name: 'Rock waterfall', category: 'Water feature', owner: 'garden', source: 'buildWaterfall' },
  { id: 'lotus', name: 'Sacred lotus flower', category: 'Plant', owner: 'pond', source: 'buildSacredLotus' },
  { id: 'frog', name: 'Pond frog', category: 'Pond life', owner: 'pond', source: 'buildFrog' },
  { id: 'turtle', name: 'Yellow-bellied slider', category: 'Pond life', owner: 'pond', source: 'buildTurtle' },
  { id: 'koi', name: 'Koi school', category: 'Pond life', owner: 'pond', source: 'buildKoi' },
];

function navigationSequence(path, fov) {
  const count = path.pos.points.length;
  const position = (u) => path.pos.getPoint(u).toArray();
  const target = (u) => path.look.getPoint(u).toArray();
  const stops = Array.from({ length: count }, (_, i) => ({
    id: `above-${i + 1}`,
    name: ['Arrival', 'Near shore', 'Bridge', 'Pond', 'Koi', 'Waterfall', 'Lotus', 'Frog', 'Return', 'Closing'][i] || `Stop ${i + 1}`,
    camera: position(i / count),
    target: target(i / count),
    fov,
    sourceRef: 'koi-pond.html#PATH.above',
  }));
  const segments = stops.map((stop, i) => {
    const next = stops[(i + 1) % count];
    const samples = Array.from({ length: 9 }, (_, k) => ((i + k / 8) / count) % 1);
    return {
      id: `above-${i + 1}-to-${(i + 1) % count + 1}`,
      fromStopId: stop.id,
      toStopId: next.id,
      weight: path.T / count,
      camera: { kind: 'sampled', samples: samples.map(position) },
      aim: { kind: 'curve', curve: { kind: 'sampled', samples: samples.map(target) } },
      sourceRef: 'koi-pond.html#PATH.above',
    };
  });
  return {
    id: 'above-water-cinematic-route',
    name: 'Above-water garden tour',
    sourceRef: 'koi-pond.html#PATH.above',
    category: 'Cinematic',
    stops,
    segments,
  };
}

export function attachPondCapture({ roots, path, camera }) {
  const buildId = `koi-pond-sdk-0.9.0-${import.meta.env.VITE_REVIEW_BUILD_ID || 'local-review-v2'}`;
  const registry = new SceneAssetRegistry(buildId);
  registry.registerAssembly({ assemblyId: 'garden', name: 'Garden', sourceRef: 'koi-pond.html#init', root: new THREE.Group() });
  registry.registerAssembly({ assemblyId: 'pond', name: 'Pond', sourceRef: 'koi-pond.html#buildSDF', parentAssemblyId: 'garden', root: new THREE.Group() });

  for (const subject of subjects) {
    const objects = roots.get(subject.id) || [];
    if (!objects.length) continue;
    registry.register({
      actorId: subject.id,
      assetId: `${subject.id}-design`,
      name: subject.name,
      category: subject.category,
      sourceRef: `koi-pond.html#${subject.source}`,
      parentAssemblyId: subject.owner,
      roots: objects,
    });
  }
  registry.registerNavigationSequence(navigationSequence(path, camera.fov));
  // Attach only after every eager subject and the authored route are registered.
  const detach = attachSceneAssetRegistryBridge(registry, {
    authorization,
    maxGeometryBytes: 64 * 1024 * 1024,
    maxInFlightBytes: 96 * 1024 * 1024,
  });
  window.addEventListener('pagehide', detach, { once: true });
}
