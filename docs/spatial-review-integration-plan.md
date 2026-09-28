# Spatial Review integration plan

## Access decision

- Approved editor: `https://spatial-review.alterno.dev` (user approved 2026-09-28).
- Proposed deployment: `https://rbifulco.github.io/koi-pond-garden/` from the `spatial-review-integration` branch of a fork (fork and publishing pending).
- Framing: allow the official editor to embed only the discovery and capture page if the selected connection mode requires it. GitHub Pages cannot apply separate framing headers to individual static routes.
- Data: deliberately registered Three.js scene roots and descendants, geometry, materials, generated textures, source references, discovery metadata, and authored camera paths. No DOM, browser storage, cookies, or unrelated application state. No credential-bearing texture URLs are expected: the website generates textures in canvas and loads Three.js and dat.gui from public CDNs.
- The user approved this editor origin and registered data scope. No other production editor is authorized.

## Representation

- New integration. Keep the ordinary `index.html` redirect and `koi-pond.html` visitor experience intact; use a dedicated capture state selected by a query parameter.
- Scene: stable actor IDs for pond terrain, bridge, pavilion, waterfall, lotus flower, frog, turtle, and koi as an instanced group. Capture construction groups at the point they are built.
- Ownership: garden/world owner, plus place owners for pond and shore where the SDK supports transform-only assemblies. Preserve parent-local transforms and distinguish merged geometry from individual placements.
- Assets: expose canonical grouped meshes and their geometry, materials, and generated textures where serialization is useful. Procedural water and custom shader effects require a documented approximation or explicit exclusion if the editor cannot reproduce the live effect.
- Experience: above-water cinematic route in `PATH.above`, sampled at nine positions and aims per segment; use stable stop IDs, relative segment timing, and the camera's perspective FOV. The optional underwater path, movie cuts, dynamic fish-follow, and hand-held drift are excluded.
- Source mapping: `koi-pond.html#buildBridge`, `#buildPavilion`, `#buildRoof`, `#buildWaterfall`, `#buildPondLife`, `#buildFrog`, `#buildTurtle`, `#buildKoi`, `#PATH.above`, `#buildMovie`. Preserve IDs across refreshes of unchanged subjects.
- Capture: `/koi-pond.html?spatial-review-capture=1`. Register the complete eager catalog before attaching the capture bridge. Freeze time and camera after the default scene constructs with its fixed procedural seed. Some cosmetic canvas texture noise uses `Math.random` and is not bit-for-bit reproducible. Detach the bridge on page hide.
- Discovery: browser discovery on the ordinary page; advertise the capture URL relative to the website. Production editor restricted to the exact approved origin; local cross-port development only with explicit loopback opt-in. No static discovery unless a CLI consumer needs it.

## Baselines and checks

- Visitor baseline: opening view, cinematic/manual toggle, koi feed, weather toggle, and clean view. Website has no package manager, build, or test scripts at baseline.
- Review baseline: bridge and pavilion in Scene and Asset, generated wood or roof texture in Asset, and an above-water route in Experience. Export feedback on the bridge and confirm it resolves to `koi-pond.html#buildBridge`; refresh and confirm stable identity.
- Performance: the ordinary page imports the discovery bridge after scene initialization. The current integration uses eager registrations; measure serialization and transfer against the 50 ms budget after the site is reachable in a browser. Change to deferred if measured cost triggers that threshold and the editor supports it.
- Validate starting at the ordinary Pages URL, not the capture URL. Record editor connection, texture transfer, and view-by-view evidence. The live shader water effect may differ in the editor.

## Status

The local branch, editor approval, SDK 0.7.0 installation, integration code, and production build are complete. Browser review, fork creation, branch upload, and Pages publication remain to be verified.
