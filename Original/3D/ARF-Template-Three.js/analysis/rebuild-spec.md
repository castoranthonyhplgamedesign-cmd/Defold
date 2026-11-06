# Arrow Flow — Three.js + TypeScript + Vite rebuild specification

**Project scope correction:** exactly Applovin, Facebook, Google, Ironsource, Mintegral, Moloco, Unity and Vungle. No external GAME_CONFIG/editor contract; use ordinary source-controlled tuning and asset imports.

**Planning update:** [implementation-plan.md](implementation-plan.md) is the current staged plan incorporating root AGENTS.md and IOS_SFX_GUIDELINES.md. Its persistent HTMLAudioElement strategy supersedes earlier audio-unlock proposals; source measurements below remain evidence.

## Scope and evidence contract

**Inferred — proposal:** rebuild the supplied Cocos playable using Three.js rendering, a pure TypeScript simulation and Vite packaging. This is a specification only. It describes the smallest complete reproduction of this file, including its actual flat board, fixed camera, linked-arrow launch and cannon queues. Orbit controls, six-axis stacks, boosters, a new lose mechanic and economy are outside the supplied build.

**Confirmed:** authoritative evidence is [REPORT.md](REPORT.md), [tuning.json](tuning.json), [level.json](evidence/level.json), [scene-settings.json](evidence/scene-settings.json), [ui-layout.json](evidence/ui-layout.json), [assets.csv](assets.csv) and [decoded source](extracted/modules/). Preserve names/UUID mappings when integrating assets so every change remains traceable.

**Unknown / acceptance blocker:** sandboxed browsers failed before loading the reference. There are no measured reference screenshots or successful/failed runs. Hydrated level cell counts, collision ordering, responsive layout and rendering parity must be resolved before calling a rebuild faithful. Static expansion yields overlapping cells and 536 blocks versus 425 ammo; this document does not authorize silently fixing or deduplicating that data.

## 1. Proposed project layout and interfaces

**Inferred — proposal:** the following modules and interface contracts are design declarations, not implementation code. All core IDs are integers, colors are stable names/indices, vectors are plain numeric data. No Three.js, DOM, audio or ad-SDK imports in `core/`.

|Proposed module|Responsibility|Public interface contract|
|---|---|---|
|`src/core/types.ts`|Arrow/segment/shooter/queue/session data and event union|Arrow has id, color, facing, cells, origin, moving; segment has id, owner/group, position, progress, inTransit; cannon has color, ammo, queue index|
|`src/core/level.ts`|Load validated authored level from compact JSON; preserve cell order|`loadLevel(data)` → level; reject invalid IDs, directions, null cells and broken queue refs; report overlap separately, do not silently normalize|
|`src/core/game.ts`|Own session state, accepted tap flow, timer/hint/clear checks|`createGame(level,tuning)`; `requestLaunch(arrowId)` → accepted/rejected reason; `step(dt,elapsed)` → domain events; `setPaused(bool)`; `snapshot()`|
|`src/core/conveyor.ts`|Closed path samples, progress, entry choice, foreign-group spacing and removal|`sample(progress)` → position/tangent; `chooseEntry(origin,facing)`; `advance(segments,dt)`; `add/remove(segment)`; `fillPercent()`|
|`src/core/shooters.ts`|Detector-entry matching, pending shot timing, ammo and replacement queue|`updateContacts(previous,current)`; `step(dt)` → hit/cannon-replaced events. Keep contact-entry semantics explicit.|
|`src/render/scene.ts`|Three renderer/cameras/lights, asset/mesh creation, instancing, pose sync, resize|`createView(canvas,assets)`; `resize(width,height,dpr)`; `render(snapshot,dt)`; `dispose()`|
|`src/render/input.ts`|Map pointer coordinates to candidate arrow/instance; UI interception|`pickArrow(clientX,clientY)` → id/null. Input can call core requests, never mutate core internals.|
|`src/ui.ts`|Meter, ammo labels, tutorial hand, endcard and CTA click surface|`sync(snapshot)`; `showEndcard()`; accessible button invokes adapter through main|
|`src/audio.ts`|Persistent media pools, native gesture preparation/recovery, event cues and lifecycle mute|`unlock()`; `play(cue)`; `pause/resume()`; `stop()`|
|`src/ad.ts` plus selected network entry|Host ready/viewability, permitted CTA, completion, audio policy|`ready(callback)`; `onVisibility(callback)`; `openStore()`; `completed(reason)`; `dispose()`|
|`src/main.ts`|Wire clock, core, view, input, UI/audio events and host adapter|Own one frame loop and one cleanup path|
|`src/data/level.json`, `src/assets/`|Approved compact data and selected extracted resources|No runtime external asset URLs|
|`vite.config.ts`, build script|Select one network adapter, inline assets, emit correct package, check bytes|Build each requested delivery independently; no automatic publish|

**Inferred — proposal:** use a tiny shared tween evaluator in render code if needed; do not create a general event bus, dependency container, ECS or configurable physics framework. Keep shooter/contact logic and core rules testable with arrays/maps and deterministic clock input.

## 2. Scene, camera, lighting and resize

**Confirmed source values:**

|Item|Value|Evidence|
|---|---|---|
|Projection|Orthographic|scene camera `_projection=0`; engine enum in engine-defaults.json|
|Ortho bounds|top=21, bottom=−21; left/right=±21×aspect|scene camera and engine projection implementation|
|Camera transform|position `(0,227.132,105.063)`; quaternion `(-0.5372996083468239,0,0,0.8433914458128856)`|scene-settings.json|
|Near / far|1 / 10000|engine default / scene override|
|FOV|stored 6°, inactive for orthographic camera|scene-settings.json|
|Background|`#434267`|scene camera color|
|Main light transform|position `(0,10,10)`, X rotation −65°|scene-settings.json `/light`|
|Light/ambient|HDR directional 45000; sky HDR 26000, LDR 0.8; colors in JSON|scene-settings.json `/globals`|
|Design resolution|720×1280, policy 3, auto orientation, exact fit enabled|settings.json|
|UI camera|orthographic half-height 640, far 2000, node Z=1000|serialized scene objects 321/322|

**Inferred — proposal:** use an OrthographicCamera and copy the quaternion directly. Do not replace it with a guessed lookAt. Start resize with constant vertical half-height and recomputed aspect; reproduce the engine's exact design-resolution policy only after observing live frame/canvas sizes. Keep a portrait and landscape comparison fixture at the four requested sizes. The [Three.js camera documentation](https://threejs.org/docs/pages/OrthographicCamera.html) defines bounds explicitly; validate sign conventions against the exported transforms.

**Unknown:** exact active Cocos HDR/tone-mapping state, pixel ratio cap, antialiasing, shadow enablement and engine-to-Three light intensity equivalence. Cocos illuminance numbers must not be pasted into Three intensity fields and described as equivalent. **Inferred — proposal:** begin with a directional plus hemisphere/ambient contribution and imported standard materials, then calibrate exposure/colors against captures. Preserve serialized emissive values, normals and texture color interpretation. Avoid adding bloom, fog, a skybox or post-processing merely because an engine shader exists in the export.

**Inferred — proposal:** decide DPR from measured performance during implementation; its value is not known now. Pause the simulation clock while hidden to avoid a resume-time leap. Resizing must leave core path progress, ammo and launched groups intact. Respect each host's overlay safe area; CSS env declarations alone do not establish safe UI positioning.

## 3. Geometry, materials and resource reuse

**Confirmed:** [mesh-usage.json](evidence/mesh-usage.json) maps mesh UUIDs to node names/material references. Ten geometry-only glTFs retain the original binary attributes and primitive groups. Their coordinates are local; node/prefab transforms remain necessary. Materials are deliberately separate because these are Cocos effects, not native glTF PBR materials.

|Element|Proposed Three.js approach|Source / fidelity requirement|
|---|---|---|
|Arrow head and straight/corner body|Reuse extracted mesh BufferGeometry; InstancedMesh per geometry/material or per color|Arrow/Head/Block prefabs and GM.initializeArrows; maintain separate head/default visibility and corner orientation|
|Arrow marker / highlight|Reuse exported marker geometry or chevron texture as appropriate to prefab binding|Do not assume the visible arrow is a generic text glyph; preserve White submesh/material|
|Conveyor appearance|Initially reuse Spline mesh 716d…@a62fe, then simplify only after silhouette comparison|24,150 vertices / 33,948 triangles; approximately 2.33 MB raw. The motion path is separate from this mesh.|
|Conveyor motion|Sample the supplied 12-point polygon into 843 approximately equal-spaced points|Do not use an oval, perfect rectangle or CatmullRomCurve3 merely because spline helpers exist in source|
|Cannons and tunnels|Reuse Shooter1_/Tunnel meshes and serialized local transforms|Maintain four lanes, hidden reserves, label position and front detector geometry|
|Guide arrows|Instance guide prefab geometry at 5-unit spacing; move at 1 unit/s|Path.instantiateGuideArrows/updateGuideArrows; reverse tangent rotation as source|
|Projectile|Reuse source projectile mesh/material; small recycled instances are sufficient|0.1-second flight to detector position, not target-seeking ballistics|
|Explosion|Billboards/particles using approved atlas cells and block color|BlockExplosion prefab contains particle settings; do not substitute unrelated confetti|
|UI|Sprite images plus live Lilita One labels; DOM overlay or orthographic sprites|Compare actual design coordinates and font metrics. DOM is a proposed implementation choice; original is in-canvas.|

**Inferred — proposal:** start color materials with MeshStandardMaterial mapped from mainColor, roughness and emissive, preserving each source define/state as a documented decision. Use MeshBasicMaterial for genuinely unlit UI/particles. Imported specular/glossiness may need a physical-material adjustment or baked treatment; exact parity is Unknown. Avoid a new outline shader unless captures prove it is necessary. [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) supports repeated geometry/material rendering; retain an explicit instance-ID-to-core-ID map for picking and removals.

**Confirmed:** gameplay colors are green, blue, orange, black, pink, purple and yellow. Exact values are in `tuning.json` material entries; do not substitute an approximate seven-color palette. The texture contact sheet is a visual asset aid, not a rendered gameplay reference.

## 4. Rules, path movement and interaction

**Confirmed target behavior:**

1. Board arrows face only ±X/±Z; they lie at Y=0. Preserve ordered cells and local head origin. Original blocked-front test uses a physics ray against other non-moving Arrow colliders, not all visible mesh triangles.
2. On tap release, select closest collider hit; require Arrow parent and `moving=false`. Reject globally when the last computed fill is ≥90%. Do not reserve full-arrow capacity, impose a cooldown, or add a loss unless approved as a change.
3. Choose entry by maximum dot product between facing and normalized vector to each path sample. Do not replace this with the nearest path point or a single gate.
4. Mark every segment inTransit; move head straight for clamp(0.05×distance,0.16,0.8) seconds. Tail follows prior segment history with 1-unit lag and factor 20×dt. Reparent/register segments as their predecessor moves past entry spacing; after head-arrival +0.5 s, insert any missing tails at nearest path progress.
5. Once all segments are registered, clear inTransit. Switch Head visual to Default, preserve color and group ID. Existing source turns corners into straight blocks before departure.
6. Move on-track blocks at 15 units/s. Normalize by loop length; stop/clamp for different-group blocks within 1 unit ahead. Preserve gaps and same-group exclusion. Source mutates progress in array order; ordering can matter under congestion.
7. Fill percent is `100×0.5×count/length`. Do not “correct” the half-unit meter weight to match the one-unit movement spacing as an incidental part of the engine migration.
8. Active cannon fires on matching detector entry and only when !inTransit. No explicit cooldown. Target disappears over 0.1 s while projectile travels for 0.1 s. Ammo decrements on completion; exactly zero advances the queue. Also retire front colors absent from remaining blocks.
9. Board/path empty or timer <0 enters the same endcard. First accepted launch starts the 60-second timer. No source retry or explicit congestion loss exists.

Evidence: decoded GM, Path, Cannon and Tunnel functions named in REPORT.md. **Unknown:** edge behavior for entry overlap, pending duplicate hits, ray-inside-own-collider, large dt and zero candidate hints. Do not claim a mathematically cleaner replacement is equivalent until those differences are accepted.

**Inferred — proposal:** use Three Raycaster only for screen picking, with collider-equivalent boxes mapped to arrow IDs. Keep the front-ray/blocking test in pure TS using authored collider boxes. A simple occupied-grid scan is valid only after comparing collider extents, self-ray behavior and reconstructed overlaps. A full Cannon physics dependency is not needed solely for this planar matching mechanic, but equivalence must be tested.

**Confirmed:** there are no orbit/zoom gestures. **Inferred — proposal:** omit OrbitControls and pinch state. Resolve touch cancellation semantics explicitly; the reference treats cancel as tap. Preserve the original for fidelity testing, then ask whether accidental-launch prevention is an approved improvement.

## 5. Animation, audio, tutorial and UI

**Confirmed:** source timing/easing requirements:

|Animation|Timing / curve|
|---|---|
|Blocked head|0.25 units forward in 0.1 s; return in 0.2 s bounceOut|
|Accepted head|distance×0.05 s clamped to 0.16…0.8; source default easing|
|Cannon recoil|scale 1→1.15 in 0.05 s backOut; 1.15→1 in 0.1 s bounceOut|
|Projectile / hit shrink|0.1 s; projectile linear; shrink has default easing|
|Queue advance|0.3 s smooth; queue Z=2.2×(1−index), Y=0.43|
|Front ammo fade|0.3 s, source easing name fade|
|Capacity warning|four 0.25 s label-color segments, red/white/red/white|
|CTA entry|scale 0→1 in 0.4 s quadOut|
|CTA pulse|2 s clip, sample=60, vector scale track; raw curve bytes in CCON|
|Idle hint|after >5 s since accepted launch; choose leftmost valid active-color arrow|

**Inferred — proposal:** implement only the required easing equations in a small render-time helper; no tween library dependency is warranted. Preserve source timing while using simulation time for deterministic tests. Source uses Date.now for its insertion fallback; pausing that clock with gameplay is an intentional lifecycle fix that should be documented.

**Confirmed:** two hand textures, tapDistance default 0.3, tapIntensity 1.2 and optional squash. Use the full sequence in HandAnim.startTapAnimation, including sprite switches, euler rotations, delays, and scale reset. CCON pulse curve amplitudes are not yet decoded into time/value keys; do not invent a 1.1× pulse.

**Confirmed — endcard design coordinates:** scene Canvas centered at `(360,640)`, 720×1280. CTA begins scaled to zero. Black overlay alpha=200/255 with 720×1280 design size and a BlockInputEvents component. App icon 400×400 at `(0,66.055)`. Button 337.31×108.364778 at `(0,−226.073)`. Title local size 169.513×102.458807, scale 1.801, position `(−0.106,360.479)`. Icon, title and button all route to onStoreButtonClicked; preserve intended CTA hit surfaces. [ui-layout.json](evidence/ui-layout.json) retains complete component/anchor data. **Unknown:** final bounds in each viewport and how overlay blocking affects global touch input.

**Confirmed:** audio files and trigger volumes are in assets.md. No BGM file is assigned. **Inferred — proposal:** prepare persistent HTMLAudioElement pools before input, request gesture cues synchronously, prime/retry the same voices and protect callbacks with request generations under IOS_SFX_GUIDELINES.md; keep production sounds but mute test browsers. Do not add music to fill the empty BGM API call. Audition before reducing WAVs, matching starts/durations and avoiding clipping from source's >1 gains. Pause all voices on hidden lifecycle events; resume only appropriate loop state.

## 6. Vite output and byte budget

**Inferred — proposal:** choose and pin compatible Three.js, TypeScript, Vite and single-file plugin versions during implementation; the reference supplies none of these versions. Build from one HTML entry with named Three.js imports. Exclude OrbitControls, physics packages, unused loaders and post-processing unless necessary. Keep game modules statically imported; inspect chunks rather than assuming tree shaking removed unused engine code.

**Confirmed documentation:** Vite builds from index.html; build target and browser support require deliberate selection. [Vite production guide](https://vite.dev/guide/build.html). The single-file plugin inlines JS/CSS, but that alone does not guarantee every binary/public asset is embedded. [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile).

**Inferred — proposal:** configure single-file output, no split CSS/runtime chunks, imported embedded assets, and explicit conversion/inlining for all buffers/fonts/audio. Do not leave `public/` URLs, GLTFLoader external buffer paths or relative texture fetches in a single-file build. The forensic glTFs deliberately use relative `.bin` references; transform them at build time or build compact BufferGeometry data. Keep sourcemaps in private review artifacts only. A loader should operate on embedded data without runtime XHR, particularly for Moloco.

**Inferred — proposal:** emit one selected ad adapter per target. Use `index.html` as the reusable single-file artifact; wrap it in the target ZIP where required. Add Google orientation metadata and the documented hosted exit API only for that target. Confirm Mintegral, Meta and ironSource placement packaging before implementing those exports. Enforce exact final bytes of the deliverable, including base64 expansion and wrapper code. Do not use gzip estimates as evidence that a raw-HTML upload meets its cap.

### Size estimate based on measured source assets

**Confirmed measurements / Inferred reuse scenario:** these are costs of reusing the extracted payloads unchanged. They are not invented sizes for unwritten code. Base64 values below encode each category as one concatenated payload; individually encoded assets add small padding/header overhead.

|Category|Decoded payload bytes|Base64 payload bytes|Status / budget implication|
|---|---:|---:|---|
|Three.js|Unknown|Unknown|No target version or import graph built; measure selected bundle|
|Game code + HTML/CSS + adapters|Unknown|Not applicable to plain JS|No game code authored in this analysis|
|Textures: 11 PNGs|326838|435784|Confirmed source cost; little extra compression expected|
|Models: 10 buffers|2673436|3564584|Confirmed source cost; largest mesh dominates|
|Audio: 5 WAVs|652508|870012|Confirmed source cost; transcode only after audition|
|Font|26828|35772|Confirmed source cost; approved subset may reduce it|
|Level/material/animation metadata|Unknown compact shipping size|Unknown|Forensic pretty JSON must not be shipped wholesale|

**Inferred:** unchanged base64 models/textures/audio/font alone total **4,906,152 bytes**, before Three.js, code and metadata. That leaves too little room under a 5 MB ceiling and already exceeds a 4 MB target. A lean final size is **Unknown until built**; do not promise a made-up total. The original Cocos file reaches 3.82 MB using ZIP compression, including compressible geometry, whereas direct base64 is larger. Raw-deflate of concatenated mesh buffers measured 979,283 bytes, showing why compressed geometry or simplification matters; a real shipping container/decoder adds overhead.

**Inferred — priority optimization:** first simplify the 2.33 MB Spline mesh or use a measured compact compressed representation; then compress audio; then strip unused material/shader variants. Avoid a large decoder library unless its net measured saving beats its own cost. Keep an unoptimized visual baseline for comparisons.

## 7. Ad integration contract

**Inferred — proposal:** the adapter exposes readiness, visibility, user-gesture store opening and completion. Main pauses the clock/audio when hidden and resumes without catch-up. Keep completion idempotent and independent from opening the store. Every store request must originate from the correct deliberate interaction; a timeout shows CTA, not the app store. No custom close control.

**Confirmed reference behavior:** AppLovin-oriented MRAID readiness/visibility boot, MRAID/open CTA, optional ALPlayableAnalytics events and fallback window Events. Android/iOS scene URLs are in REPORT.md. No explicit visibility-false pause. No Meta/Google/Moloco adapter.

**Inferred — target plan:** MRAID adapters for confirmed AppLovin/Unity/Exchange contexts; Google App-campaign exit adapter and package; Moloco no-argument FbPlayableAd CTA with no XHR/mraid.js; Meta adapter only after current template confirmation; Mintegral callback/lifecycle contract pending official template; Vungle product-specific wrapper. Exact requirements and authoritative links are in REPORT.md Phase 6. Do not carry obfuscated Cocos loader code into the rebuild to preserve its integration accidentally.

**Unknown:** client tracking requirements and acceptance on each network's actual webview. Validate with ready-delayed, already-viewable, hidden-at-start, hide/resume, missing-SDK, CTA and duplicate-completion fixtures, then the network's preview tool. Treat expected injected host scripts separately from forbidden remote game assets in test logs.

## 8. Implementation priority and acceptance checklist

**Inferred — proposed order; unchecked items are future implementation work:**

1. [ ] Re-run reference safely; snapshot hydrated level, path, cameras and active cannons; record all four viewports. Resolve overlaps/ammo and decide fidelity versus fixes.
2. [ ] Import exact level data and validate color/cell/queue identities. Keep a test for front-axis blocking and own-arrow treatment.
3. [ ] Match static camera/board/track/shooter visuals with reused assets before simplifying them.
4. [ ] Implement head/tail transit, color-preserving conversion, progress wrapping and cross-group spacing. Test occupied entries and simultaneous launches.
5. [ ] Implement detector-entry matching, inTransit protection, 0.1 s hit timing, exact ammo and queue replacement. Test multiple entrants in one frame and stale collision callbacks.
6. [ ] Match fill meter's 0.5-unit accounting and ≥90% rejection. Test exact threshold, in-flight overshoot and recovery after removal. No invented lose state.
7. [ ] Add 60 s session timer, idle hint, blocked feedback and endcard/hit surfaces. Test empty hint candidates and endcard input containment.
8. [ ] Add extracted SFX and required animation sequences; compare waveform/visual event timing and mute behavior.
9. [ ] Add and validate one network adapter at a time; audit packaged output for unintended requests and stale store URLs.
10. [ ] Measure final bundle bytes, stable-frame/peak draw calls, frame-time distribution, memory and load time on representative physical devices. Optimize only measured bottlenecks.
11. [ ] Record an unmodified-rule successful run and overflow/timed-out run if attainable. Maintain evidence that differentiates natural outcomes from diagnostic state manipulation.
12. [ ] Check internal delivery settings and document any intentional deviations from the supplied playable. Full-game progression, orbit and boosters remain out of scope.

## 9. Assets requiring recreation or confirmation

**Confirmed:** all identified native payloads are extractable; no missing binary is currently known. The ten glTFs contain geometry only, so Three materials and hierarchy must be recreated from metadata. Exported Cocos GLSL is evidence and not guaranteed to compile unchanged in Three.

**Inferred — likely recreation work:** simplified conveyor Spline geometry; native UI layout/labels; particle system behavior; small tween evaluator; sampler/material conversions; compact level JSON. Use original dimensions listed in assets.md: 512² title/icon/model texture, 512×174 CTA, 512×114 meter elements, 256² hands, 1024² particle sheet. Do not upscale by guesswork.

**Unknown:** rights clearance for branding, character icon, font, audio and models; localized copy; final destination URLs. If assets must be replaced, obtain client-approved replacements with matching bounds/alpha and record that visual parity has changed.

## 10. Hardest parts and remaining verification

**Inferred — three hardest reproduction tasks:**

1. Matching concurrent head/tail entry, 0.5 s forced insertion and cross-group spacing, including source quirks under congestion.
2. Reproducing detector contact ordering and authored ammo/queue behavior without a successful hydrated reference run; resolving overlapping cells and insufficient static ammo.
3. Matching orthographic composition, Cocos PBR/emissive appearance, UI scaling and landscape framing while reducing the large Spline mesh.

**Confirmed — clarified scope:** build the short core-mechanic showcase, not the full game. No client questions block analysis or planning. **Unknown:** runtime visuals and physics edge cases, final byte budgets and target-specific submission acceptance. See [template-analysis.md](template-analysis.md) and [three-migration-plan.md](three-migration-plan.md) for the newly inspected Babylon starting point.

**Confirmed:** this spec contains no game implementation. **Unknown:** runtime parity, audio audition, full solution path, final bundle size and network/device acceptance remain outstanding.
