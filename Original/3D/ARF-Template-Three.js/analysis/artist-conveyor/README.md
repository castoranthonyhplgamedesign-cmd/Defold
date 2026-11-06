# Artist conveyor inspection — 2026-10-27

## Result

**Updated after the rounded-edge request:** use `artist-rounded.arrow-flow.json`, also available in the dedicated editor under **Start from an example → Artist rounded conveyor**. It preserves the original GLB's conveyor geometry, including rounded corners and raised border. The older 45-point trace below remains an approximate historical draft.

**Confirmed:** the rounded version stores the two original indexed mesh parts and normals, uniformly scaled by 15.5774334 and translated vertically so the belt surface is at gameplay Y=0. All 16,968 triangles remain. The original double-sided material behavior is retained. Colors, lighting and glossy shading use the playable's existing materials; this is geometry fidelity, not a claim of identical Blender shading.

**Inferred:** the 606-sample movement path comes from paired boundary midpoints, not an artist-authored animation spline. It stays within the extracted surface and supports admission, travel and shooting in both directions in simulation tests. The default direction still does not claim to reproduce the separate chevron asset's intended motion.

The artist shape is fixed in this mode to prevent moving control points away from its mesh. Arrow layout, cannon positions/queues and travel direction remain editable. Width is fixed; choosing a polygon preset or drawing a replacement outline removes the mesh from that edit, and Undo restores it. Generic editable polygons have not gained a rounding-radius control.

The version-1 level contract now optionally embeds `conveyor.mesh` (two bounded base64 Float32 position/normal buffers and Uint32 triangle-index buffers, plus two top-view outlines). Imported-mesh paths allow up to 1,024 samples; ordinary editable polygons retain their 64-point limit and offset/clearance validation. Imported data validates buffer sizes/coordinates/indices and movement-path containment. The renderer decodes embedded buffers directly; no GLTFLoader, decoder request, or new dependency is needed. The schema is updated and the old shared editor explicitly directs mesh imports to the dedicated page.

Verification:

- 70 playable/core/editor tests and 22 shared-editor compatibility tests passed; TypeScript passed.
- `tools/rounded-conveyor-smoke.mjs` passed: example loading, fixed geometry controls, preset replacement/Undo, native arrow drawing/cannon placement, export buffer equality, draft reload, Three.js preview clear, and narrow layout.
- The packaged standalone QA build rendered at 390×844, 844×390, 768×1024 and 360×640 and cleared through native pointer input. No page errors or external requests were recorded. See [package evidence](../evidence/artist-rounded-package.json) and [screenshots](../screenshots/artist-rounded/).
- Rounded blank level JSON: 1,025,611 bytes. Packaged three-block QA playable: 3,634,762 bytes. Isolated normal default build: 2,576,705 bytes, with no artist mesh embedded. Network packages were not regenerated.
- Physical-device performance, audio and official host acceptance remain unverified. The three-block clear is a routing check, not validation of a fully populated level.

Reproduce conversion with `node analysis/artist-conveyor/rounded.mjs` while the original artist folder is available. Original source files and the playable's default level were preserved. `rounded-qa.arrow-flow.json` contains a three-block test arrow and one cannon; it is a QA fixture, not a designed level.

## Earlier polygon trace

**Confirmed:** the conveyor outline can be represented as an editable draft in the current Arrow Flow editor. `artist-conveyor.arrow-flow.json` imports with 45 editable points and passes the current structural/width validation. It contains no arrows or cannons. The playable default and source assets were not changed.

**Inferred:** this is a simplified centerline approximation of the artist mesh, not its original authored path. It preserves the overall silhouette and inward bends, but replaces rounded corners with straight segments. Do not treat it as exact visual parity or a finished playable level.

## Source and evidence

- Folder: `C:\Users\nobzunar\Downloads\New folder (3)\.glb` (a folder, not one GLB file).
- **Confirmed:** relevant layout file is `Converyor.glb`, 785,288 bytes. Node `bridge.001`, mesh `Plane.001`, two materials `white edge.003` and `blue.003`. Mesh contains 21,290 exported vertex records and 16,968 triangles. Parsed directly without executing reference content or requesting remote resources.
- **Confirmed:** `Converyor - arrow.glb` holds 33 separate placements of the conveyor chevron mesh; it is not the belt layout. Shooters and cubes are separate files and were excluded from tracing.
- **Confirmed:** the flat blue belt surface has two closed boundaries, each containing 606 welded boundary vertices. See `inspection.json`, `surface-boundaries.json`, and `inspect.mjs`. The border outline is shown in `top-view.png`.
- **Inferred:** cyclic pairing of the inner/outer boundaries gives a centerline. Pair distances are nearly uniform: 0.08345389–0.08345433 source units. This supports a constant-width belt interpretation; it does not establish the artist's intended gameplay scale or direction.
- **Chosen conversion:** scale 15.5774334 maps the measured median surface width to the editor's normal width of 1.3. X maps to editor X, source Z maps to negative editor Y. This is an authoring choice, not a measured gameplay scale. Travel direction is the draft default, not verified against the chevrons.
- **Confirmed:** closed-path simplification with tolerance 0.025 source units produces a valid 45-point draft. Finer candidates either exceed 64 points or fail current narrow-bend/offset checks. See `trace-report.json` and reproducible `trace.mjs`.
- **Confirmed:** local muted Chromium imported the draft, displayed 45 corner handles, and correctly disabled Play test for the empty board. Evidence: `browser-check.json`, `editor-draft.png`.
- **Unknown / unverified:** gameplay traversal, cannon behavior on this particular layout, physical-device presentation, exact round-corner parity, original art scale and intended belt direction.

## Open the draft

In `http://127.0.0.1:5181/level-editor.html`, choose **Open** and select `analysis/artist-conveyor/artist-conveyor.arrow-flow.json`. Draw arrows and place cannons before play testing. Export your finished level as a separate file.

`trace-overlay.png` shows the extracted belt in blue and the simplified editable path in orange. The later rounded version above uses the actual artist mesh with a separately traced gameplay path instead of this approximation.
