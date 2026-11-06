# Arrow Flow template → Three.js plan

**Project scope correction:** exactly Applovin, Facebook, Google, Ironsource, Mintegral, Moloco, Unity and Vungle. No external GAME_CONFIG/editor contract; use ordinary source-controlled tuning and asset imports.

**Current plan:** [implementation-plan.md](implementation-plan.md) expands this migration outline into stages and incorporates the supplied general/iOS audio rules. Use it with root AGENTS.md for implementation.

**Inferred — proposed implementation scope:** a lightweight playable demonstrating arrow release, conveyor transport and color-matching cannon fire, plus the reference's tutorial/timer/endcard/CTA. Use the supplied ad as the behavior target and the colleague's project as reusable source material. No boosters, orbit controls, progression or full-game economy. A complete puzzle solution is not an acceptance prerequisite for a timed ad.

## Smallest coherent migration

1. **Reuse data/assets first.** Keep the validated Point Out importer, Unity node types, GLBs, WebPs and scene configuration as source material. For exact reference layout, use the extracted reference data instead of pretending the 12-arrow template is the same board. Keep reference and template tuning identifiable; never mix their coordinate scales invisibly.
2. **Extract pure simulation.** Core stores numbers, plain vectors, IDs, colors, progress, transit flags, ammo and queue state. No Babylon or Three imports. Translate path operations into scalar arithmetic. Reuse ordering/crossing algorithms where compatible; replace fixed-slot insertion with the reference's moving-segment model. Do not build a Babylon compatibility shim.
3. **Create one Three render layer.** Load the approved mesh set, build material mappings, synchronize poses from core, and render through a fixed orthographic camera. Implement picking separately. Retain existing labels/effects as visual specifications, not core dependencies.
4. **Add the ad presentation.** First valid launch starts the 60-second reference timer. Blocked-tap feedback, guide arrows, idle hint, fill meter and endcard match source timings. Full-board clear may end early; do not make clear the only ending. Reuse reference SFX when required and unlock audio on a user gesture.
5. **Package and verify.** One selected network adapter per output; ready/viewability/audio/CTA handling; single-file build with a measured byte guard. No dependency on remote game resources.

## Proposed modules and boundaries

|Module|Owns|Public contract|
|---|---|---|
|`core/types.ts`, `core/level.ts`|Plain state, validated level and cannon queues|loadLevel(data), immutable IDs and initial state|
|`core/path.ts`|Closed polyline sampling and entry calculations|sample(distance), entry(origin,direction), length|
|`core/game.ts`|Tap admission, movement/transit, shots, ammo, timer and end condition|requestLaunch(id), step(dt), setPaused(value), snapshot(), event list|
|`render/view.ts`|Renderer/camera/light/materials and model instances|resize(viewport), sync(state), render(), dispose()|
|`render/input.ts`|Tap-end selection and UI interception|pickArrow(screenPosition) → ID or null|
|`render/effects.ts`|Projectile poses, impact particles, tween presentation|consume(events), update(dt)|
|`ui.ts`, `audio.ts`|Meter, tutorial, endcard, labels, gesture-safe sound|update(state), consume(events), suspend/resume|
|`ad.ts` and selected network module|Host readiness, visibility, completion and clickthrough|ready, subscribeVisibility, completed, openStore|
|`main.ts`|Construction and one update loop|Wire modules; own teardown|

**Inferred:** keep core/game together initially; split transit/conveyor/shooter systems only when their real complexity warrants separate files. Avoid exporting meshes, textures or renderer vectors through core interfaces. Preserve simultaneous-arrow behavior and deterministic event ordering.

## Babylon-to-Three mapping

|Current dependency|Proposed replacement|Important detail|
|---|---|---|
|Engine/Scene/runRenderLoop|WebGLRenderer/Scene/one frame loop|No physics package, WebGPU path or second canvas renderer needed.|
|FreeCamera orthographic mode|OrthographicCamera|Reference half-height 21 and quaternion for exact reference; template's responsive formula is a different composition. Call updateProjectionMatrix after resize.|
|SceneLoader|GLTFLoader addon|Reuse GLBs; parse embedded bytes. No Draco/Meshopt dependency is required by these files.|
|StandardMaterial|MeshPhongMaterial for template appearance; MeshStandardMaterial for reference PBR matching|Material selection depends on which visual set is used. Do not treat specularPower as PBR roughness directly.|
|Mesh clone and mutable pose|Shared geometry/material Mesh initially; InstancedMesh for repeated groups where useful|With instancing, maintain ID→instance mapping, update instance matrices and bounds; grouping by textured color avoids accidental tint changes.|
|DynamicTexture|CanvasTexture on a plane or a DOM label|Update only when ammo changes; keep rendering outside core.|
|Vector3/Quaternion in simulation|Plain numeric state|Use Three vectors only inside view/input. Quaternion multiplication order and Unity Z conversion need explicit parity checks.|
|Pooled sphere fragments|Shared sphere geometry, pooled meshes or instances|Preserve current particle pooling; no particle library needed.|

**Confirmed API support:** Three's [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) accepts embedded model data through parse/parseAsync; [OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html) exposes explicit frustum bounds and projection updates; [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) groups repeated geometry and material with per-instance transforms. **Inferred:** these cover the template's required renderer functions; they do not establish visual equivalence by themselves.

## Fidelity rules to preserve

**Confirmed from reference source:** speed 15 units/s; nominal foreign-group spacing 1; meter weight 0.5 per on-path block; tap rejection at 90%; head travel clamp(0.05×distance,0.16,0.8); forced tail insertion 0.5 seconds after head arrival; shot travel/shrink 0.1 seconds; replacement 0.3 seconds; idle hint 5 seconds; timer 60 seconds after first accepted launch; endcard scale 0.4 seconds. Exact sources, queue data and remaining values are in [tuning.json](tuning.json) and [REPORT.md](REPORT.md).

**Inferred:** do not rescale only the track while retaining template units for collider boxes, speed, block spacing or cameras. Either retain a complete source coordinate system or apply one explicit scale consistently. For a simpler demonstration using the colleague's board/art, keep that layout but tune pacing intentionally and record the visual/layout difference from the supplied ad.

**Inferred:** choose an analytical segment-versus-detector entry check for cannons and an axis-aligned board obstruction check for arrows. The reference uses Cocos physics, but no general physics simulation is needed for this planar interaction. Test contact boundaries and edge cases before claiming exact parity. Keep projectile target reservation as an explicit robustness choice if adopted; it differs from the reference handler.

## Size and packaging

**Confirmed:** template model/texture data is 638,194 bytes raw, 850,940 bytes as base64 payload strings. This is the only measured prospective payload component. Existing Vite singlefile configuration and classic-script finalization are reusable in principle; generated output must be inspected after changing imports.

**Unknown:** Three bundle bytes, total script bytes, final audio/UI cost and final HTML size. Measure minified output, not npm package size or gzip alone. Raw final HTML is the meaningful budget for a single-file upload. Current template finalizer does not enforce a size threshold; add one during implementation once the delivery ceiling is chosen.

**Inferred:** start with only `three`, TypeScript, Vite and the singlefile plugin plus Three's GLTFLoader addon. Do not include OrbitControls, an animation library, physics, GUI framework or compression decoder without demonstrated need. The existing GLBs require none of those extras. Preserve asset inlining and eliminate remote URLs. When a network scanner imposes specific API restrictions, audit the final bundle rather than assuming a renderer swap solves it.

## Acceptance order

1. A reference runtime capture becomes available in a functioning sandbox, or the unverified visual details remain explicitly provisional. Do not block pure source-based development on unavailable client contact.
2. Load chosen assets and verify head/body/corner orientation, normals, UVs and camera composition at 390×844, 844×390, 768×1024 and 360×640.
3. Test valid/blocked taps, two concurrent arrows, tail transfer, crowded entries, meter admission and persistent gaps with deterministic core fixtures.
4. Test matching/nonmatching colors, detector entry, simultaneous targets, ammo timing and queue advancement. Verify no orphan targets after removal.
5. Demonstrate the core interaction reliably, then reach the endcard through the configured timer. Test board-clear ending separately if attainable; do not require a full-game solution.
6. Test pause/resume, orientation change during transit, audio unlock/mute, CTA exactly once per click and missing/late host SDKs.
7. Build each target, inspect requests and bytes, then measure frame time, draw calls and memory. Only optimize measured bottlenecks.

**Confirmed:** this document is a plan, not a port. **Unknown:** browser parity, build savings and device/network acceptance remain unverified. The current environment cannot complete Phase 7, and the Babylon checkout has not been built here.
