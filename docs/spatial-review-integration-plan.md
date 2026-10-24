# Spatial Review integration plan

## Access decision

- Approved editor: `https://spatial-review.alterno.dev` (user approved 2026-09-28).
- Published website: `https://rbifulco.github.io/koi-pond-garden/` from the existing `spatial-review-integration` branch and Pages workflow.
- Framing: allow the official editor to embed only the discovery and capture page if the selected connection mode requires it. GitHub Pages cannot apply separate framing headers to individual static routes.
- Data: deliberately registered Three.js scene roots and descendants, geometry, materials, generated textures, source references, discovery metadata, and authored camera paths. No DOM, browser storage, cookies, or unrelated application state. No credential-bearing texture URLs are expected: the website generates textures in canvas and loads Three.js and dat.gui from public CDNs.
- The user approved this editor origin and registered data scope. No other production editor is authorized.

## Representation

- Existing integration updated to SDK 0.9.0. Keep the ordinary `index.html` redirect and `koi-pond.html` visitor experience intact; use a dedicated capture state selected by a query parameter.
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

The integration uses SDK and protocol 0.9.0. The production build passes. Local cross-origin browser verification confirms eight actors, two assemblies, the above-water camera route, bridge and koi geometry, decoded texture resources, source references, and stable actor inventory across repeated catalog requests. The existing Pages workflow publishes the `spatial-review-integration` branch.


## Publication verification

The production build includes `.well-known/spatial-review.json`, which resolves the website and live capture within `/koi-pond-garden/`. The browser discovery fallback also declares absolute project-scoped URLs. Static discovery avoids initializing the full pond merely to find its capture. The existing official-editor authorization is unchanged.

`npm test` checks static and fallback URL agreement. `npm run verify:publish` checks the build inventory; with `PAGE_URL` set it also compares every published file byte-for-byte, checks JavaScript content types and discovery CORS, and detects frame blocking. The Pages workflow includes hidden files and runs these checks before and after deployment. Prebuilt review packages are not generated by this integration yet.

## SDK 0.9.0 appearance migration (2026-10-24)

The existing publishing branch remains `spatial-review-integration`. npm and
`package-lock.json` now pin `@alterno-dev/spatial-review` to 0.9.0 and resolve its
protocol dependency to 0.9.0; Three.js remains 0.160.1. The protocol, validator,
and CLI are not direct dependencies. No editor origin, actor, asset, assembly,
navigation ID, source reference, or registered boundary changed. Capture IDs
now include `koi-pond-sdk-0.9.0` and the workflow commit SHA. This is a live
capture integration: no old prepared package or static geometry export exists
to regenerate. Each new capture reconstructs the source representation.

Material inspection found actual albedo vertex colors on the terrain and
selected plant geometry. Their existing `vertexColors` settings remain intact;
bridge wood does not enable vertex colors. Shared material, geometry, attribute,
and texture objects are retained, with no blanket material replacement or
per-placement texture copies. Both serialization profiles now retain terrain
RGB and UV arrays and supported wood/ground maps.

Custom shader effects are still approximations: the basin's triplanar gravel,
rock moss/wetness, wood weathering, underwater attenuation and caustics, plant
translucency/wind, koi palette and skin deformation, waterfall/water shaders,
sky/environment lighting, and postprocessing are not reproduced by the editor.
These effects are not encoded by turning mask data into albedo. Review the
terrain's standard mapped ground and the arched bridge for supported appearance;
do not use the exported shader-only effects as pixel-accurate appearance evidence.

### Checks and measured costs

Pre-change and post-change `npm test` (3 tests), `npm run build`, and
`npm run verify:publish` pass. The build contains all nine publication files,
including `.well-known/spatial-review.json`. The existing Pages workflow retains
`include-hidden-files: true` and verifies deployed files against its exact build.

Chromium with a software GPU verified the same eight actor IDs and two assemblies
through progressive capture. Both Scene and Asset profiles retain the following
representative data (attribute/index payload sizes, not JavaScript heap sizes):

| Subject | Scene geometry | Asset geometry | Color / UV vertices | Unique live images |
| --- | ---: | ---: | --- | --- |
| Pond basin and shore (`terrain-design`) | 17,388,192 B | 22,610,172 B | 435,165 RGB and UV entries across three exported geometry definitions | 2 x 512 x 512 PNG, 404,179 B + 736,864 B transferred |
| Arched wooden bridge (`bridge-design`) | 1,142,168 B | 1,637,648 B | 41,290 UV entries; no vertex color shading | 2 x 512 x 512 PNG, 433,887 B + 726,066 B transferred |

The terrain shares attribute arrays in source across its three differently
indexed submeshes; the table counts the exported geometry definitions, not
three separate source allocations. Bridge materials reuse the same two texture
resource IDs. Each pair of decoded RGBA8 images needs 2,097,152 B; an RGBA8 GPU
allocation with full mipmaps is approximately 2.67 MiB per pair, separately from
PNG transfer and geometry. Actual driver/heap allocation is not measured.
All four representative live texture requests completed as decodable `image/png`.
Procedural noise can vary encoded byte counts slightly between captures.

On the shared software-rendering host, progressive metadata took 63 ms; terrain
Scene/Asset delivery took 179/190 ms and bridge 9/8 ms. These are observed
samples, not production performance guarantees. The terrain serialization exceeds
the 50 ms main-thread screening trigger while remaining below the existing 64 MiB
per-asset transfer ceiling. No claim of a sub-50 ms terrain export is made.

The previous hidden capture document compiled and continuously rendered the
entire live pond before exposing the bridge, timing out after 120 seconds in the
software browser. Capture now skips those unrelated GPU preview passes after
constructing the same source roots and generated textures. The measured updated
capture became ready in 41 seconds on that host. The ordinary-page branch still
runs the exact previous compile and frame calls. Its full rendering/performance
comparison remains limited by the same software-GPU startup timeout; this is not
a passed visual-parity measurement. Controls, scene factories, and visitor
rendering parameters were not changed.

### Published acceptance

[Pages run 40123180449](https://github.com/rbifulco/koi-pond-garden/actions/runs/40123180449)
succeeded for source commit `192ca476973cdd8dbcc23ec55c30a7758fcb5c20`.
The deployed discovery document returned HTTP 200 with JSON content type and
`Access-Control-Allow-Origin: *`. Starting from the ordinary website URL, the
official editor discovered the published capture and reported build ID
`koi-pond-sdk-0.9.0-192ca476973cdd8dbcc23ec55c30a7758fcb5c20`.

Read-only editor checks passed:

- Scene loaded all 8/8 asset meshes, eight objects, two assemblies and one path
  reference. The ground's supported color/UV appearance was inspected with
  selection explicitly cleared (`Nothing selected`).
- Asset opened the arched wooden bridge: 52,728 triangles, 41,290 vertices,
  four nodes, two materials, geometry ready and 4/4 texture bindings ready.
  The bridge's two materials share two image resources. The terrain Asset
  reported geometry ready and 2/2 texture bindings ready.
- Experience opened the above-water journey with 10 stops and 10 transitions,
  timeline timing, FOV controls and the live spatial context.
- No browser JavaScript error occurred. No feedback note, comment, or other
  persistent review edit was created. Existing feedback was not modified.

The official-editor transport audit measured all eight unique assets at
30,182,716 B for Scene geometry and 40,544,620 B for Asset detail. These are
actual negotiated `Float32Array` and `Uint16Array`/`Uint32Array` backing-buffer
bytes, counting shared buffers once within a response. They exclude object
heap overhead and texture memory. Both profiles share texture resources rather
than duplicating their storage by placement or view: all 13 unique registered
image IDs completed successfully, totalling 3,657,185 B of encoded PNG transfer
and an estimated 9,830,400 B (9.375 MiB) of decoded RGBA8 image storage. The
corresponding RGBA8 full-mipmap GPU estimate is 12.5 MiB, not a measured driver
allocation. These counts cover the deliberately registered representation;
custom-shader-only textures outside supported material slots remain the
appearance limitations described above.

Validation used a disposable Chromium software-GPU context. The editor's
animation callbacks were spaced by 120 ms in that context to avoid contention
on the shared test host; this did not change website source or published
behavior. This is functional/appearance evidence, not a production frame-rate
benchmark. The ordinary full-pond visual-performance timeout remains the
explicit limitation above.
