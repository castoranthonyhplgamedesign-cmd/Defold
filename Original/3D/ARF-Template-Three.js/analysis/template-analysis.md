# Babylon Arrow Flow template analysis

## Conclusion and scope

**Confirmed:** inspected `D:/Reference Projects/Arrow-Flow-Template`, commit `b4a7af769f1a1352668295d9fff6767363bdfeac`. Git reported no tracked modifications; it warned that the sandbox could not read the user's global ignore file. A 38-file snapshot of source, runtime assets, configuration and layout data is in [template-source](template-source/), with hashes in [template-audit.json](evidence/template-audit.json). The colleague's checkout was not modified.

**Confirmed — requested scope:** reproduce the playable demonstration of arrows entering a conveyor and color-matching cannons shooting them. Full-game progression, boosters, orbit controls, economy and guaranteed full-board completion are not additional requirements. This review is analysis and migration planning only.

**Inferred — recommendation:** use the colleague's compact assets, layout importer and reusable algorithm ideas as the starting point for a Three.js implementation. Separate simulation state from mesh state. Where the template's rules conflict with the supplied ad, prefer the ad's documented behavior. An engine port alone would preserve the template's different gameplay, not reproduce the reference.

**Unknown:** browser behavior, live performance, visual parity and final bundled size. Three.js is the requested renderer; a smaller final payload is a target to measure, not an automatic result of replacing Babylon.

## Repository facts

**Confirmed:** package-lock pins Babylon core/loaders 9.31.0, Vite 7.3.7, TypeScript 5.9.3 and vite-plugin-singlefile 2.3.4. Runtime is Babylon, not the Phaser described by older sections of AGENTS.md. The opening section of AGENTS.md explicitly identifies this prototype; many later sections describe production capabilities that do not exist in this checkout. Evidence: snapshot package files, AGENTS.md:1–12 and src/main.ts imports.

|File|Actual responsibility|Reuse assessment|
|---|---|---|
|`src/projectLayout.ts`|Camera, scene names, grid mapping, conveyor sizing and shooter/effect settings|**Confirmed:** plain data/types, no Babylon imports. Reuse structure; reference-specific values differ.|
|`src/layout/arrowGrid2D.ts`|Validate bounds, adjacency, colors and overlaps; map Point Out XY cells into XZ|**Confirmed:** engine independent. Reuse.|
|`src/layout/unityLayout.ts`|Layout types, recursive node lookup, arrow-group discovery|**Confirmed:** engine independent. Reuse if retaining the Unity layout.|
|`src/game/conveyorPath.ts`|Polyline/rounded-loop sampling, nearest distance, first crossing|**Confirmed:** algorithms depend on Babylon Vector3. Port numerical operations into core; no renderer is needed.|
|`src/game/beltMeshPath.ts`|Trace boundary/middle loops of an indexed ring mesh|**Confirmed:** reads Babylon mesh vertices and world matrix. Useful asset preprocessing; avoid keeping geometry discovery in core.|
|`src/game/arrowGrid.ts`|Picking, launch/return, collision, mesh motion and highlight management|**Confirmed:** rules and rendering mixed across approximately 500 lines. Split state and visual synchronization.|
|`src/game/conveyor.ts`|Slots, insertion, firing, bullets, ammo labels, turret queues|**Confirmed:** rules, Mesh/Material and canvas textures mixed across approximately 420 lines. Split these responsibilities.|
|`src/game/hitEffects.ts`|Pooled sphere fragments and their materials|**Confirmed:** rendering-only effect; straightforward replacement.|
|`src/main.ts`|Asset loading, Unity transforms, materials/camera/light, object creation, game wiring and outcomes|**Confirmed:** approximately 490 lines of renderer/bootstrap code. Replace Babylon-specific work while retaining useful data mappings.|

Evidence: [import/line inventory](evidence/template-audit.json), snapshot files named above. Line totals include trailing blank lines.

## How the template actually works

### Board and input

**Confirmed:** the active Point Out grid is 7×8, with 12 arrows and 56 cells: red 24, green 11, yellow 13, blue 8. Cell size is 1.5; center is `(0.11,-7.35)` in XZ. Increasing editor Y becomes decreasing world Z. The old Unity arrow nodes provide mesh templates and are then hidden. Evidence: main.ts::boot, arrowGrid2D.ts::mapArrowGrid2D, projectLayout.ts, verified mapper output in template-audit.json.

**Confirmed:** pointerdown projects every enabled segment center into screen space and chooses the closest within 0.55 of a projected cell width. It does not use Babylon mesh ray picking. Every eligible tap starts motion; it does not reject blocked lanes before motion. Collision is checked during movement using XZ center separation below `0.78*cellSize`. Earlier-started moving arrows have priority. The blocked arrow jiggles and retraces recorded steps if it has not already transferred a segment. Evidence: arrowGrid.ts:115–144, start, collidesAt, updateClearing.

**Confirmed:** movement is 7.2 world units/s, or one 1.5-unit step per 0.208333… seconds. Follow segments move toward the preceding segment's previous location and interpolate rotation. First crossing of the belt transfers a segment, disables its board mesh, and creates occupancy in a belt slot. Insertion failure pauses at the crossing. Other arrows remain tappable. A clear-lane highlight requires 0.12 seconds and is refreshed at roughly 0.05-second intervals. Blocked feedback uses 0.34-second shake, per-segment cascade up to 0.45 seconds, then a distance-dependent reverse animation. Evidence: arrowGrid.ts::prepareStep/updateClearing/updateBlockedFeedback/updateHighlightVisibility; projectLayout.ts.

### Conveyor

**Confirmed:** current path mode is `beltMesh`. It reads a flat indexed closed ring, traces its boundaries, prefers an authored middle ring and otherwise derives a centerline. `WaypointLoopPath` interpolates linearly along those points. The `roundedRectangleFromSlots` implementation exists but is not currently selected. Evidence: main.ts:227–256; beltMeshPath.ts::inferBeltMeshPath.

**Confirmed:** slot count is `max(3, round(pathLength/(beltWidth*0.86)))`; marker count uses 1.43 instead of 0.86. Actual current count requires evaluating the transformed mesh; **Unknown** here. Do not copy the historical “33 slots” in SCENE_PORT.md as a measured current value. Default slot speed is `(pathLength/slotCount)/(1.5/7.2)`; markers move at 2.8 units/s. Block width is 0.75 of belt width. Evidence: main.ts::createConveyorSystem, projectLayout.ts.

**Confirmed:** slots move continuously even when empty. Insertion chooses the nearest slot; if occupied, it searches backward for a free slot and shifts intervening occupants backward. It also redirects any bullet target references to the shifted occupant. Transfer interpolation lasts 0.12 seconds. When every slot is occupied, insertion returns false. Evidence: conveyor.ts::closestSlotIndexAt/pushOccupant/insertAt/update.

### Cannons and shots

**Confirmed:** two tunnel objects form two independent lanes, although their node names are identical; grouping is by parent object identity, not name. Each contains two cannons. World Z is negated from Unity: front root positions are approximately `(-3.6777,1.0444,-22.8644)` and `(3.6723,1.0444,-22.8644)`. Queues are red→yellow and red→green, each cannon starting at 17 shots. Body/muzzle child transforms establish actual firing positions. Evidence: main.ts::createFromNode/createConveyorSystem; scene layout; template-audit.json `/turrets`.

**Confirmed:** only the front cannon fires. A matching, unreserved occupied slot fires when its path distance crosses the lane's firing point. There is no physics engine or explicit firing cooldown. Ammo decreases immediately on firing; `targeted` prevents another lane from reserving the same block. A projectile travels on a fixed direction at 38 units/s; when its initial travel distance has elapsed, the referenced block is removed at its current location. It is not a physical projectile collision test. Evidence: conveyor.ts::update/fire.

**Confirmed:** an empty cannon hides immediately and the next cannon slides to its front position over 0.55 seconds with cubic ease-out. There is no “skip this color if absent” cleanup. The ammo display is a 256×256 DynamicTexture with bold 172px Arial. Hit fragments are pooled spheres: 11 per hit, size 0.31, nominal duration 0.48 seconds with per-fragment variation; gravity 8. Evidence: conveyor.ts::createTurret/drawCount/advanceTurrets; hitEffects.ts; projectLayout.ts.

### Outcomes, camera and delivery

**Confirmed:** update order is conveyor → arrows → win/lose evaluation → hit effects → render. Motion systems clamp dt to 0.05 seconds. Win requires board clear and belt empty; loss requires belt full and no front/advancing matching cannon or active incoming bullet able to clear occupancy. A result disables arrow input and simulation, sets `document.documentElement.dataset.gameOutcome`, and dispatches `arrowflow:outcome`. No endcard overlay is created. Evidence: main.ts:350–357 and 480–490; conveyor.ts::canClearOccupiedBlock.

**Confirmed:** fixed orthographic camera, no attached player controls. Camera Y is 13.5, target `(0,0,-8.46)`, near/far 0.1/1000. Half-height is `max(authoredOrthoSize or 16, 8.8/aspect)`; horizontal half-width is half-height×aspect. Scene is right-handed, Unity Z is negated, and source mesh rotation is multiplied into the converted node rotation. These transformations are important when retaining the GLBs. Evidence: main.ts:38–47,95–123,198–203.

**Confirmed:** no production CTA, timer, audio, host lifecycle wrapper or per-network build scripts are wired in this runtime. Main creates the engine immediately; package build performs tsc, Vite singlefile, then classic-script finalization. Finalizer syntax-checks the script and moves it to the end of body. It prints bytes but does not enforce the documented 5 MB limit. Evidence: main.ts; package.json; vite.config.ts; scripts/finalize-html.mjs. AGENTS.md describes desired network/config functionality, not evidence that it is implemented.

## Differences that matter for the reference rebuild

All reference findings below are **Confirmed from source**, not empirically observed. See [REPORT.md](REPORT.md) for original module evidence.

|Mechanic|Reference ad|Babylon template|Migration decision — Inferred proposal|
|---|---|---|---|
|Admission/capacity|0.5-unit weighted meter; reject new taps at ≥90%; no full-belt loss branch|Fixed slots; backward displacement; full unserviceable belt loses|Use reference admission behavior for fidelity; do not silently inherit slot rules.|
|Path|12-point chamfered polygon resampled into 843 points|Centerline derived from GLB ring|Reuse path math, supply reference points when reproducing that track.|
|Blocked arrow|Pre-launch ray rejection with small head bounce|Starts moving, collides, shakes and reverses|Use reference pre-check/bounce. Preserve template return behavior only if intentionally chosen later.|
|Transfer|Head tween plus following tails; forced remaining insertion after 0.5 s; group becomes shootable when fully entered|Each segment occupies a slot independently; no equivalent group-inTransit gate|Port reference group state and head/tail timing.|
|Shot trigger|Matching detector collision entry, no pending-kill flag|Crossing a firing distance with target reservation|Use a small deterministic detector-entry model; explicitly account for any intentional duplicate-shot prevention.|
|Ammo|Decrements after projectile completion; variable queues across four lanes; skips obsolete front colors|17 shots each, two lanes; decrements at fire; no skip|Keep reference queue data and timing separate from rendering.|
|Finish|60-second countdown after first accepted launch, or clear, then CTA|Win/lose event only, no timer/endcard|Restore reference ad pacing and CTA.|
|Input|Touch end/cancel, collider ray|Pointerdown, projected-center radius|Use deliberate tap-end selection for reference behavior; calibrate hit size.|

## Important limitations in the current template

1. **Confirmed data / Inferred consequence:** eight blue blocks have no matching cannon anywhere in the queues. Under the inspected rules they cannot be removed, so a natural board-clear win is unreachable with this data. Separately, 24 red blocks cannot exhaust both 17-shot red fronts; at least one reserve lane remains unavailable. This is not a reason to require full-game balance for a timed demonstration; it is a reason to provide a dependable ad ending. Evidence: verified grid colors, layout cannon colors, conveyor.ts matching/ammo/queue logic.
2. **Confirmed:** SCENE_PORT.md and layout-preview.png describe an earlier all-red board/slot arrangement. The preview was viewed as an existing repository image, not as a fresh runtime screenshot. Current source selects a four-color 2D grid and mesh-derived slot count. Prefer current source and data over historical documentation.
3. **Confirmed:** `canClearOccupiedBlock` considers front/advancing cannons and incoming bullets, not deeper queued cannons. A matching reserve behind an unexhausted wrong-color front does not prevent loss. This is consistent with current queue rules, not a hidden rescue mechanism.
4. **Confirmed:** once an arrow has transferred a segment, subsequent collision returns without starting its rollback. **Unknown:** whether an authored scenario can leave it permanently stalled. Test simultaneous intersecting launches during implementation.
5. **Confirmed:** pooling exists for bullets and particles, but there are per-launch arrays/vectors and per-frame allocations; mesh clones are used rather than explicit thin-instance batches. No runtime draw-call/performance measurement is available. Do not interpret AGENTS.md's “no GC” guidance as achieved.

## Runtime assets and size

**Confirmed:** five GLBs and seven WebPs total **638,194 bytes**, or **850,940 bytes** for base64 payload text alone (excluding URI headers, code, JSON and HTML). All GLBs inspected have zero animation clips, zero skins, no declared extensions and no external image/buffer URIs. The existing converted assets are the easiest reuse path; there is no need to reconvert FBX just to change renderer. Loader/render compatibility still needs a browser check.

|Model|Bytes|Contents|
|---|---:|---|
|AnimatedBlocks_.glb|179,400|Head, body, corner meshes|
|Bullet_.glb|8,316|Projectile mesh|
|Conveyor_Custom_Mesh.glb|290,240|Wall and belt primitives|
|Shooter_v3_.glb|65,420|Body and muzzle meshes|
|Tunnel_v3_.glb|63,476|Tunnel variants|
|Seven WebPs combined|31,342|Four block colors, tunnel, marker, outline|

**Confirmed:** geometry attributes/counts and source hashes are in template-audit.json. The conveyor has 11,520 wall triangles and 576 belt triangles; its shared/accessor vertex counts must not be interpreted as unique live geometry or draw calls. `optimize-glb.mjs` already packs normals and removes conveyor UVs. Imported objects are statically animated by code rather than skeletal clips.

**Unknown:** actual Babylon bundled bytes and achievable Three savings. There is no node_modules or dist in this checkout, and no build was run. Do not add the raw reference's 3.69 MB native inventory to these assets automatically: choose one visual set per element. Use the reference textures/UI/audio only where needed for the intended appearance.

## Validation and remaining work

**Confirmed:** original reference hash checks remain valid; template snapshot hashes recorded; GLB headers/file lengths inspected; original 2D layout passed its actual pure mapper and a deliberately invalid layout was rejected. Pure config/mapper execution used transpiled copied modules with no browser, filesystem or network capabilities exposed to them. This does not test game simulation or render behavior.

**Confirmed:** another installed Chromium (revision 1217), with sandbox enabled, outgoing requests blocked and audio muted, also failed creating a blank page before reference navigation. [Continuation evidence](evidence/runtime-continuation.json). No sandbox bypass was used.

**Unknown:** Phase 7 remains blocked. No new gameplay screenshots, recordings, FPS, memory, shot ordering or visual comparisons are claimed. The implementation plan and acceptance tests are in [three-migration-plan.md](three-migration-plan.md). No implementation has started.
