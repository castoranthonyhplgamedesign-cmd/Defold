> Current implementation status (2026-10-22): this document preserves the original reference-analysis findings. Later authorized Three.js implementation and its current test/packaging limits are in [delivery-report.md](delivery-report.md). Historical statements below about implementation not having begun describe the analysis stage.

# Arrow Flow reference analysis

> **2026-10-22 implementation update:** The analysis-only report below is historical. Milestone 1 now exists outside analysis/. Its overlap-free layout uses declared array lengths: 79 arrows / 406 cells (Inferred), superseding the 536-cell expansion for preview purposes. See [milestone-1.md](milestone-1.md) for evidence and limits. Reference runtime is still unverified.

## Executive summary

1. **Confirmed:** the supplied file is a single 3,817,619-byte HTML playable built with **Cocos Creator 3.8.8**, not Three.js. [Fingerprint](evidence/fingerprint.json); [settings](extracted/bundle/src/settings.json.pretty.json).
2. **Confirmed:** the bundle contains readable-after-decoding JavaScript, serialized scene/prefab data, meshes, textures, audio, a font and shaders; no wasm or Unity/IL2CPP payload was found. [Extraction inventory](evidence/fingerprint.json).
3. **Confirmed:** conveyor speed is **15 units/s**, segment spacing **1 unit**, and new taps are rejected at **90%** meter fill. That threshold is not a lose transition. [Scene settings](evidence/scene-settings.json), `Path.updateSegmentsOnPath`, `GameManager.onTouchEnd`.
4. **Confirmed:** this is an orthographic, planar XZ arrow puzzle with four cannon queues. No player camera-control or booster implementation appears in the gameplay modules. [Modules](extracted/modules/); [scene](evidence/scene-settings.json).
5. **Inferred:** expanding authored prefab overrides yields 79 arrows / 536 blocks and 17 cannons / 425 shots. Overlapping cells and an ammo shortfall require runtime checking before treating that expansion as a solved production level. [Level](evidence/level.json); [grid audit](evidence/grid-summary.json).
6. **Confirmed:** 109 distinct catalog IDs are exported; 29 native payload files total **3,686,789 bytes**. The assets folder totals **7,613,592 bytes** including decoded metadata and derived copies. [Inventory](assets.md); [totals](evidence/asset-summary.json).
7. **Confirmed:** ad routing is AppLovin-oriented MRAID plus browser fallback. Meta, Google and Moloco CTA adapters are absent. The explicit viewability handler starts on visibility but does not pause on invisibility. [Outer wrapper](extracted/outer-wrapper.js), `onSdkReady/viewableChangeHandler`; [CTA handler](extracted/modules/CTAButtonHandler.ts.js).
8. **Unknown:** all runtime measurements, gameplay captures and empirical priority tests. Sandboxed browsers crashed before loading the reference; no successful or failed run is claimed. [Failure record](evidence/runtime-failure.json); [launch log](evidence/browser-launch.log).
9. **Confirmed:** this delivery is analysis only. No game, Vite project, or Three.js implementation was created. The original is preserved byte-for-byte; all work is under `analysis/`.

## Evidence conventions and limits

**Confirmed** means directly present in the supplied source, decoded data, or file measurements. It does not mean runtime verified. **Inferred** means calculated or reconstructed from named evidence. **Unknown** means unresolved. Recommendations are marked **Inferred — proposal**, not attributed to the reference.

Source shorthand below: **GM** = [GameManager.ts.js](extracted/modules/GameManager.ts.js); **Path** = [Path.ts.js](extracted/modules/Path.ts.js); **Cannon** = [Cannon.ts.js](extracted/modules/Cannon.ts.js); **Tunnel** = [Tunnel.ts.js](extracted/modules/Tunnel.ts.js); **Hand** = [HandAnim.ts.js](extracted/modules/HandAnim.ts.js). Function names identify the cited location. These are static decoded copies; never execute them as standalone game modules. The original bundle is preserved alongside them.

**Unknown:** the task's orientation and maximum-MB fields were placeholders. All eight listed networks are covered; placement products and budgets are delivery settings, not blockers for core-mechanic analysis.

**Confirmed — static integrity validation:** the original and working copy retain the recorded SHA-256. All 171 JSON/glTF files present at the latest validation parsed; 109 catalog IDs are unique; exported file sizes agree with the inventory. Checks passed for 1,535 serialized object references, 11 mesh primitives, index bounds and 540,310 finite geometry components. There are 109 named tuning entries. [Validation record](evidence/validation.json), [repeatable checks](tools/validate.cjs). These checks do not establish runtime rendering or visual fidelity.

## Priority questions

### 1. Conveyor loop shape, length and entry

**Confirmed:** a closed custom 12-point polygon resembling a rectangle with chamfered corners. `Path.generatePath` calls `createEquallySpacedPathPoints`, not the available Catmull–Rom routine. Control points are authored in `Points`, scaled by `(1,1,1.02)` and its `Path` parent `(0.928,1,1)`. [World control points](evidence/level.json), `pathWorldControlPoints`; Path functions above.

**Inferred:** the transformed control polygon is 84.3046871931 units long. Resampling at the 0.1-unit setting gives 843 points and approximately **84.2720095200 units** measured around the sampled polygon. This is a static calculation, not a runtime measurement; see [tuning](tuning.json), `path.sampledLength`.

**Confirmed:** there is no single entry gate. `GM.findPathPointInArrowDir` chooses the path sample with the largest direction dot product from the arrow's origin. `findClosestProgressOnPath` converts that sample to progress. Different arrows can enter different sides.

### 2. Capacity and exact fail trigger

**Confirmed:** `Path.calcPercentage` computes `100 × (0.5 × blocksOnPath.length) / pathLength`. `GM.onTouchEnd` rejects every tap when the previous frame's percentage is at least 90. It does not reserve slots for segments still entering, and does not compare incoming arrow length with spare capacity. There is **no capacity-driven fail state** in these gameplay modules.

**Inferred:** approximately 152 on-track blocks would reach the rejection threshold using the sampled length. This is a displayed occupancy threshold, not 152 physical slots: movement spacing is 1 unit while the meter charges only 0.5. Existing/transit arrows can overshoot the threshold. Source: GM.onTouchEnd; Path.calcPercentage/addSegmentToPath.

**Confirmed:** the separate timer ends the session after its 60 seconds expire following first accepted launch. Board clear also calls the same CTA. Neither branch displays a distinct coded lose state. GM.update/checkGameOver/activateCTA. **Unknown:** empirical congestion/failure outcome and whether the authored level can clear.

### 3. Conveyor speed and changes

**Confirmed:** scene override `segmentSpeed=15`, rather than constructor default 2. Progress increment is `15 × dt / length`. A block stops or clamps its movement when a different-group block is within one spacing ahead. There is no near-full speed boost or acceleration curve. Guide arrows have independent speed 1. Path.updateSegmentsOnPath/updateGuideArrows; scene-settings.json `/path`.

**Inferred:** unobstructed lap time is approximately 5.618134 seconds. Real lap time under traffic is Unknown.

### 4. Spacing and removed-block gaps

**Confirmed:** configured spacing is 1 world unit. The forward-distance check excludes blocks in the same launched group. Individual blocks advance at the same speed unless a foreign group obstructs them. Removal deletes the block and its progress/group entries; it does not re-pack the loop. Path.updateSegmentsOnPath/removeSegmentFromPath.

**Inferred:** free-flow gaps persist; a previously stopped queue can move into freed space. Same-group overlap is not prevented by this distance test. Tail following and its forced insertion can produce spacing different from the nominal value; runtime behavior remains Unknown.

### 5. Occupied entry

**Confirmed:** launch is not rejected solely because its entry point is occupied. `addSegmentToPath` inserts the block immediately and records a paused group if another group lies within three spacings ahead. The movement function does **not read** that paused-group set; it uses its own per-block distance test. `GM.update` also forces remaining segments onto nearest path progress 0.5 wall-clock seconds after head arrival.

**Unknown:** exact overlap, collision and queue behavior during crowded simultaneous entries. This needs the requested spam/occupied-entry test; the source alone does not justify describing a clean admission queue.

### 6. Near-full warning

**Confirmed:** meter color continuously interpolates hue from green toward red as percentage increases. At ≥90%, a tap plays `wrongSound` and schedules four 0.25-second label color transitions, red/white/red/white. No conveyor shake or standalone warning sound/event threshold was found. Path.calcPercentage; GM.onTouchEnd. **Unknown:** whether tweening `Label.color` visibly produces the intended flash in this build.

### 7. Shooter placement and active count

**Confirmed:** four fixed tunnels outside the negative-Z side of the loop; one active detector per queue. Tunnel bases are `(3,-0.428,-21)`, `(-3,-0.428,-21)`, `(-8,-0.428,-18)`, `(8,-0.428,-18)`. The front cannon is at local `(0,0.428,2.2)`, so nominal front world positions are `(3,0,-18.8)`, `(-3,0,-18.8)`, `(-8,0,-15.8)`, `(8,0,-15.8)`. Scene node objects 47/51/57/63 and Cannon prefab; [queue export](evidence/level.json).

**Confirmed:** Tunnel.refresh shows the front and next cannon, scales later queue entries to zero, and only enables the first detection node. Up to four cannons are active concurrently.

### 8. Colors, ammo, fire rate, range and target choice

**Inferred — authored queue expansion:** front to back:

|Tunnel base X,Z|Queue: color/ammo|
|---|---|
|3, −21|green/26 → yellow/18 → purple/13|
|−3, −21|orange/27 → pink/27 → black/25 → yellow/27|
|−8, −18|purple/33 → yellow/26 → blue/30 → pink/33 → green/15|
|8, −18|black/24 → orange/30 → green/28 → purple/19 → blue/24|

Evidence: [level.json](evidence/level.json) `/shooters`; original scene prefab overrides and Cannon default color green. The source includes an unused ammo-distribution helper; it is not called by `start` and should not replace these authored queues.

**Confirmed:** firing is triggered by `onCollisionEnter` on a box, not radial range or nearest-target selection. Target must have Block component, matching color, and `inTransit=false`. Detector local center is `(0,0.515,3.113)`, size `(1.489,2.585,1)`. No explicit cooldown or rate limiter exists. Projectile time is 0.1 seconds; this is not a guaranteed 10 Hz fire rate. Cannon.onDetectionEnter/destroyBlock; [Cannon prefab](assets/serialized/097e4753-ec84-4b56-9ff0-7fec40869754.json), objects 4/5.

**Unknown:** simultaneous collision ordering, effective shots/s and whether overlapping targets cause duplicate/deferred shots. There is no pending-kill flag in this handler.

### 9. Empty-ammo replacement

**Confirmed:** ammo decrements at projectile tween completion, after 0.1 seconds. Exactly zero destroys the detector and emits CANNON_DESTROYED. Tunnel deletes that cannon, then on the next scheduled turn moves remaining queue nodes to `(0,0.43,2.2×(1-index))` over 0.3 seconds with `smooth` easing. Front ammo label fades in over 0.3 seconds; reserve count falls. Source: Cannon.destroyBlock; Tunnel.onCannonDestroyed/refresh.

**Confirmed:** `GM.cleanupCannons` also removes front cannons whose color no longer exists among board/on-path blocks, even if ammo remains. Replacement sound requested volume is 1.5. Exact-zero testing rather than `<=0` is a potential simultaneous-shot edge case, not a confirmed runtime failure.

### 10. Targets and chain reactions

**Confirmed:** the detection handler does not explicitly require `Path.isOnPath`; it tests Block/color/inTransit and collision. **Inferred:** authored detector placement makes conveyor blocks the intended targets; no remote board shooting is implemented. An overlapping board block could satisfy the generic handler, so “conveyor only” is not a formal code guard.

**Confirmed:** a hit shrinks one block to zero in 0.1 seconds, emits BLOCK_DESTROYED, removes it from Path, spawns a color-matched explosion and checks completion. There is no match-three flood fill or adjacent-color explosion. Subsequent effects are queue release, cannon advancement and changed arrow accessibility. GM.onBlockDestroyed; Cannon.destroyBlock; Path.removeSegmentFromPath.

### 11. Open-front test and facing axes

**Confirmed:** a Cannon-physics ray starts at the arrow node's world position and uses its stored direction. Any hit whose collider parent has a non-moving Arrow blocks launch. No finite maximum distance, explicit own-arrow exclusion, or board-boundary scan is passed in the gameplay call. GM.canArrowMove.

**Confirmed:** serialized directions use only `±X` and `±Z`; all reconstructed cells have `Y=0`. This is a flat board rendered in 3D, not a stack with six-axis escape. [Level](evidence/level.json), `/stats/axes`. **Unknown:** runtime self-collider behavior and hit tolerances inherited from the physics implementation.

### 12. Blocked tap

**Confirmed:** wrong SFX, head nudged 0.25 units in its normalized direction over 0.1 seconds, then returned to local zero over 0.2 seconds using `bounceOut`. No life/score penalty and no click-count increment are in this branch. Timer, if already active, continues. GM.onTouchEnd.

### 13. Launch animation and input lock

**Confirmed:** the head moves straight to the selected path point. Duration is `clamp(0.05×distance, 0.16, 0.8)` seconds; no explicit easing is passed. Tail segments follow the previous segment's sampled trajectory at a 1-unit history lag with interpolation factor `20×dt`. History is trimmed to about 2 travelled units. GM.onTouchEnd/update.

**Confirmed:** only that Arrow's `moving` flag suppresses re-launch. Other arrows remain tappable. All segments are protected from cannon fire while `inTransit`; the group is released after all its segments are on the path. **Unknown:** exact frame-dependent visual trail and animation ordering.

### 14. Arrow-to-block conversion and color

**Confirmed:** existing segment nodes are reparented under Path/Blocks with world transform preserved. A node named Head hides its Head child and shows Default. Before departure, body corners switch to ordinary blocks. Color remains on Block and its assigned material. This is not a new randomly colored conveyor spawn. Arrow.turnCornersToBlocks; Path.addSegmentToPath; GM.initializeArrows/onTouchEnd.

### 15. Rapid launches / cooldown

**Confirmed:** there is no global cooldown, animation lock or multi-arrow admission budget. Distinct valid arrows can launch concurrently while meter <90%; already-moving arrows are ignored. TOUCH_CANCEL also invokes the same tap handler. GM.registerEvents/onTouchEnd. **Unknown:** maximum usable tap rate, duplicate input behavior and frame-race overshoot under actual browser events.

### 16. Camera gestures, sensitivity and damping

**Confirmed — source scope:** no drag, orbit, pan, wheel, pinch or zoom handler exists in the shipped gameplay modules. The only gameplay input subscriptions are TOUCH_END and TOUCH_CANCEL. Sensitivity and damping are not defined. GM.registerEvents; all [game modules](extracted/modules/).

**Unknown:** empirical drag and multitouch outcomes because runtime did not load. In particular, releasing a drag may be treated as a tap rather than rotating the board.

### 17. Rotation limits and snapping

**Confirmed:** no user rotation state, limits or snap-to-angle code was found. These settings are not applicable to the implemented source controls. **Unknown:** runtime gesture confirmation. Evidence: same module/input scan as question 16.

### 18. Camera projection and automatic motion

**Confirmed:** orthographic; Cocos enum 0 is ORTHO. Half-height 21, near 1 (engine default), far 10,000; position `(0,227.132,105.063)`; quaternion `(-0.5372996083468239,0,0,0.8433914458128856)`; Euler `(-65°,0,0)`. Stored FOV=6° is inactive for this projection. Clear color `#434267`. [Scene settings](evidence/scene-settings.json); [engine defaults](evidence/engine-defaults.json).

**Confirmed:** no gameplay intro/win/conveyor camera tween was found. **Unknown:** an explicit look-at target is not stored; preserve quaternion instead of inventing a target. A second orthographic UI camera uses half-height 640, far 2000 and node Z=1000.

### 19. Portrait and landscape adaptation

**Confirmed:** design resolution 720×1280, Cocos resolution policy 3, orientation auto, exact-fit-screen enabled. The main camera uses fixed ortho half-height; engine projection derives half-width from aspect. UI uses a Canvas and Widgets; serialized anchors/transforms are preserved. [settings](extracted/bundle/src/settings.json.pretty.json); [scene settings](evidence/scene-settings.json); engine `Camera.update`, lines 3885–3886 of cc.js.pretty.js.

**Unknown:** actual clipping, aspect values and UI overlap at 390×844, 844×390, 768×1024 and 360×640. No orientation-specific authored rearrangement was found in gameplay code. CSS safe-area variables exist, but their definitions alone do not establish safe-area handling.

### 20. Boosters

**Confirmed — supplied-build scope:** no Hammer, Color Picker or Rainbow Shooter assets, controls or effects were found in the extracted game modules and scene data. There is no booster inventory/cost/activation flow. **Confirmed — clarified scope:** full-game boosters are outside this playable demonstration and are not migration requirements.

## Phase 1 — Fingerprint

**Confirmed:** input `arf_mip_smmeemee_gameplay_01_real_nougc_noseason_en_60s_na_al.html`; 3,817,619 bytes (3.817619 decimal MB, approximately 3.641 MiB). SHA-256 `31166b29c782babc3ccbcb7b52168cda8701c08abccbaf1c010660a0aaba4c66`. Original copy: [original/](original/).

**Confirmed:** signatures include title `Cocos Creator | ArrowFlow`, SystemJS `cc` import map, `cc.Node`/`cc.Mesh`/`cc.SceneAsset`, and settings `CocosEngine:3.8.8`. This is not Three.js; `THREE.REVISION` is not applicable. The Babel/Rollup helper module and `System.register` registrations are present. Original build tool versions beyond Cocos are Unknown; Vite is not evidenced.

**Confirmed:** the HTML contains two inline script elements (one import map) and one style element. `window.__zip` decodes to a 2,785,998-byte ZIP. Its 31 non-directory entries are enumerated with sizes and SHA-256 in [fingerprint.json](evidence/fingerprint.json). Major groups: `application.js`, `index.js`, `cocos-js/cc.js`, `assets/internal/`, `assets/main/`, `src/settings.json`, `src/chunks/bundle.js`, `@src` polyfills/SystemJS/adapter, and `__res`.

**Confirmed:** `__res` contains further JSON and data URIs. Some data-URI MIME/encoding labels contain inserted digits; stripping the header and decoding the payload recovers valid PNG/WAV/TTF/mesh content. Native ZIP entries may themselves be encoded data-URI strings. No source map or wasm entry was found. JSON contains Cocos compact serialization; CCON contains MessagePack plus binary animation curves.

## Phase 2 — Unpack and boot structure

**Confirmed:** [extracted/](extracted/) preserves inline scripts/styles, payload ZIP, unpacked bundle, pretty JS/JSON and separated decoded gameplay modules. Assets are exported separately under [assets/](assets/). Original filenames/UUIDs are retained. `extract.cjs` checks ZIP path containment and declared lengths. Decoding tools interpret data and arithmetic only; they do not evaluate reference JavaScript in Node.

**Confirmed:** the game is string-table-obfuscated JavaScript, not compiled native code. Static analysis can recover methods, literals, events and serialized scene/prefab content. Original variable names/comments, authoring project and editor metadata stripped by the build cannot be restored. Pretty output is for inspection, not an executable patch.

**Confirmed — boot order:** HTML → JSZip unpack → `__res` dictionary → eager `@src` polyfills/SystemJS/adapter → `super_html.game_ready` → MRAID ready/viewable or standalone fallback → `super_boot_engine` → SystemJS index/application → Cocos initialization/settings → main/internal bundles → `db://assets/Scenes/Scene.scene`. Evidence: outer-wrapper.js `super_load/super_boot/onSdkReady`; bundle `index.js`, `application.js`, `@src/cc.adapter.js`.

**Confirmed:** one launch scene. Main gameplay modules: Analytics, Arrow, AudioManager, Block, Cannon, CTAButtonHandler, EventManager, GameManager, HandAnim, Path, RNG, Tunnel, plus prerequisite module. Internal bundle implements rendering pipeline infrastructure. GM.start registers input/events, creates arrow bodies, colors cannons and emits DISPLAYED. Path.start generates path/guides. Tunnel.start initializes front detectors.

## Phase 3 — Assets and visuals

**Confirmed:** [assets.md](assets.md) and [assets.csv](assets.csv) contain one row per catalog ID, bytes, format, dimensions/duration, extraction status, usage references and metadata. Asset count includes scene/prefab/material/shader/texture metadata IDs, not just images. The native subset is 11 PNGs, ten mesh buffers, five WAVs, one TTF, one CCON animation and one effect cache. Geometry-only glTF exports are in [assets/models/](assets/models/), shader text in [assets/shaders/](assets/shaders/).

**Confirmed:** seven gameplay material names: green, blue, orange, black, pink, purple, yellow. Exact RGBA/emissive/roughness/defines/states are preserved in [materials.json](evidence/materials.json) and tuning.json. Standard color materials request GPU instancing. A baked 512² model texture supplies additional surface coloring. UI art includes an Arrow Flow title, character app icon, PLAY NOW button, progress frame/fill and two hand states. [Contact sheet](evidence/texture-contact-sheet.png).

**Confirmed:** directional light at `(0,10,10)`, Euler −65° X, authored HDR illuminance 45,000. Ambient has HDR sky illumination 26,000 and LDR 0.8; sky/ground colors and post-setting tone-mapping enum 1 are preserved in scene-settings.json. **Unknown:** active HDR mode, final tone mapping and exact perceived Three.js equivalence. Shadow-info type is serialized, but no explicit enabled flag is authored; do not equate a stored shadow setting with visible shadows. No assigned environment cubemap was found. Fog/skybox records exist with defaults rather than authored effects.

**Confirmed:** no new mesh construction API in gameplay logic; loaded prefabs are cloned, positioned and switched. Path/guides, tail trajectories, particle color and meter color are procedural. No skeletal model or video payload was found. Animation and SFX details, oversized geometry and rights questions are in assets.md. **Unknown:** licensed ownership; extraction is not permission to redistribute.

## Phase 4 — Design, controls and pacing

**Confirmed — core loop:** tap an outward-clear arrow → head travels to loop while linked segments follow → segments become conveyor blocks → matching active cannon's detector destroys passing blocks → ammo decrements and queued cannons advance → keep clearing arrows, until board/path empty or timer expires → scale in CTA. Timings are given in priority answers and [beat-sheet.md](beat-sheet.md).

**Confirmed:** no score, lives, booster economy, reward currency, match-three rules or explicit capacity-loss transition were found. A declared analytics CHALLENGE_FAILED name does not establish an implemented loss condition. No retry scene/reset handler is wired in these modules. Source: GM, Analytics, CTAButtonHandler.

**Confirmed:** picking uses camera.screenPointToRay then physics.raycastClosest. Only collider hits whose parent contains Arrow are actionable. Any closer unrelated collider can prevent selecting an arrow. No tap-vs-drag distance threshold or pinch state is implemented. TOUCH_CANCEL is routed as TOUCH_END. Hit geometry is serialized rather than a tunable screen-pixel tolerance.

**Inferred — authored level reconstruction:** 79 arrow prefab instances; 536 cell entries across seven colors. Grid spans X −8.5…7.5, Z −13…13, Y=0 (17 distinct X values, 27 Z values). The reconstruction has only 408 unique XYZ positions and some repeated cells within individual arrows. Do not silently deduplicate: determine whether prefab hydration changes these entries at runtime. [Level](evidence/level.json), [grid audit](evidence/grid-summary.json), original scene prefab overrides.

|Color|Reconstructed blocks|Authored ammo|
|---|---:|---:|
|green|96|69|
|blue|74|54|
|orange|78|57|
|black|64|49|
|pink|74|60|
|purple|75|65|
|yellow|75|71|

**Unknown:** solvability. There is no runtime solver/guarantee call in GM.start. RNG exists as a module, but level initialization does not invoke it. Neither overlapping serialized data nor the 111-shot shortfall proves an intentional rigged loss without runtime validation. The unused `divvyBulletsByColor` helper targets 17 cannons; its existence does not make the live queues auto-balanced.

**Confirmed — tutorial:** the hand starts authored in-scene; valid arrows receive a child highlight. Successful launch hides the hand and resets idle to 5 seconds. On idle, GM.restartTutorial filters valid arrows to colors of active detectors, chooses the leftmost, places the hand on child 1 and starts tap animation. It sets canIdle false until another successful launch. The reducer has no empty-result guard: the no-valid-matching-arrow case is a source-level risk. Hand uses two sprites, angle/position tweens and optional squash. GM.updateArrowHighlight/restartTutorial; Hand.startTapAnimation.

**Confirmed — endcard:** CTA root starts at scale zero. `activateCTA` stops AudioManager, emits ENDCARD_SHOWN, stops timer/hint flags, hides HUD and scales CTA to one over 0.4 s quadOut. It does not remove input listeners or explicitly stop Path.update. Scene CTA contains art/button nodes; its scale animation asset is 2 s. The PLAY NOW image already contains its text. **Unknown:** exact visual overlay, responsiveness, animation curve amplitudes and whether gameplay remains interactable behind CTA. No successful/failed screenshot is available.

**Confirmed — juice:** 0.25-unit blocked nudge; 1.15× cannon recoil in 0.05 s backOut then 0.1 s bounceOut; 0.1 s projectile/block shrink; explosion prefab inherits target material color; replacement slides 0.3 s smooth; CTA enters 0.4 s quadOut. No haptic call or gameplay screen-shake/camera tween was found. Audio source requests are documented in assets.md; actual audio quality was not auditioned.

## Phase 5 — Architecture and algorithms

**Confirmed:** state is distributed among booleans (`moving`, `inTransit`, `firstTouch`, `tutorial`, `canTimer`, `canIdle`), arrays (`arrows`, `transitSnakes`, `blocksOnPath`), and maps/sets for normalized path progress and group IDs. See [state-machine.md](state-machine.md) for a conceptual model, not an invented enum from the source.

**Confirmed:** GameManager.update and Path.update use variable frame `dt`; physics settings use fixed step 0.0166667 s, max one substep, gravity `(0,-10,0)`. GM performs timer/hint checks, tail updates/insertion, empty-arrow cleanup and cannon cleanup. Path moves segments, moves guides and recalculates meter. **Unknown:** observed component/physics/tween callback order and frame-rate-dependent effects.

**Confirmed — source-equivalent pseudocode (not game implementation):**

```text
ON TOUCH END OR CANCEL
  if previous fill >= 90: wrong sound; flash label; stop handling tap
  raycast closest from screen through main camera
  require collider.parent.Arrow and Arrow.moving == false
  choose path sample with maximum dot(normalized(sample - arrowOrigin), facing)
  raycast from arrow origin along facing
  if any hit belongs to a non-moving Arrow: nudge head; wrong sound
  otherwise mark all segments inTransit and arrow moving
  tween head to entry; record group and per-segment histories

MOVE PATH BLOCKS (in current array order)
  step = speed * dt / loopLength
  spacing = segmentSpacing / loopLength
  for each block: find nearest positive forward progress of a different group
    ignore forward deltas >= 0.99
    stop if delta <= spacing; otherwise clamp step to delta - spacing
    wrap progress; interpolate path position; reverse tangent rotation by 180 Y

ON MATCHING DETECTOR ENTER
  require Block, same color, and not inTransit
  start projectile/recoil and target shrink independently
  after 0.1 s: decrement ammo; if exactly zero remove detector and signal cannon
  after 0.1 s target shrink: signal block destroyed; Path removes/destroys node

END CHECK
  no arrow nodes and no path blocks -> CTA
  or timer below zero after first accepted launch -> same CTA
```

Evidence: GM.onTouchEnd/canArrowMove/findPathPointInArrowDir/update/checkGameOver; Path.updateSegmentsOnPath; Cannon.destroyBlock. Tail-history insertion, the 0.5 s fallback and event ordering are essential additional steps described in priorities 5/13.

**Confirmed:** [tuning.json](tuning.json) contains 109 named entries plus 627 numeric source-literal occurrences with file/line/column/context, along with exact scene materials and queue data. Raw literals include structural constants; they are not all independent gameplay knobs. Authored overrides are distinguished from constructor defaults. It references full level and rendering metadata rather than flattening away their identity.

**Unknown:** actual DPR cap, antialiasing choice, live tone mapping/color-space conversion, draw calls, memory and FPS. Bundled engine capabilities do not prove active rendering features. Shader definitions and node layers are preserved for later inspection. **Confirmed:** code repeatedly recomputes path length and scans blocks against other blocks, so worst-case conveyor movement is quadratic in block count. Tail code allocates/clones vectors and histories. No custom gameplay object pool was found; projectiles and explosions are instantiated. Do not copy those allocation patterns unnecessarily into the rebuild.

## Phase 6 — Ad-network integration

### Hooks and destinations in this reference

**Confirmed:** outer wrapper implements `mraid.getState`, ready and viewableChange listeners, `mraid.isViewable`, `mraid.open` through `super_html.download`; `viewable_start_ads` has a one-time boot guard. `viewableChangeHandler(false)` does nothing. The wrapper also has `super_open`, browser `window.open`, and iPhone `location.href` fallback. `super_html_channel="applovin"`. Source: outer-wrapper.js named functions.

**Confirmed:** CTAButtonHandler separately initializes MRAID readiness and calls mraid.open with the chosen store URL, or window.open(URL,"_blank") if unavailable. It dispatches CTA_CLICKED and tries to stop AudioSource on `Canvas-001/GameCamera`; that path is absent from the exported scene, which uses GameManager audio. Consequently this particular stop lookup may do nothing. Scene overrides replace the misleading default sticker-app URL:

- Android: `https://play.google.com/store/apps/details?id=com.zobbogames.arrow.shooter`
- iOS/macOS: `https://apps.apple.com/us/app/arrow-flow-shooter-puzzle/id6760908162`

Evidence: CTAButtonHandler.onStoreButtonClicked; scene-settings.json `/gameManager/_components`. **Confirmed:** `redirectClicks=0` default is not overridden, so source's optional accepted-launch-count redirect is disabled. Button event records in the scene point to onStoreButtonClicked. **Unknown:** empirical click routing and host attribution.

**Confirmed:** Analytics.dispatchEvent calls `ALPlayableAnalytics.trackEvent(eventName)` when available, otherwise dispatches a window Event. Actual gameplay call sites include DISPLAYED, CHALLENGE_STARTED, ENDCARD_SHOWN and CTA_CLICKED. Declared challenge pass/retry/fail names are not evidence that those events fire. No game-owned pixel endpoint was found. `postMessage` in the package occurs in bundled scheduling support; no game-owned `parent.postMessage` protocol was found. No dapi, FbPlayableAd, ExitApi or Luna.Unity gameplay integration was found.

**Confirmed:** the first accepted arrow invokes playBGM, not initial page load. Source has no authored BGM clip. One-shot error sounds can occur before the first accepted arrow but still follow interaction. **Unknown:** Web Audio unlock behavior and viewability/background pause inherited from the engine. Explicit MRAID invisibility pause is absent and must be added to delivery adapters.

### Network compatibility planning

**Confirmed:** the file's size alone is below 4 MB and 5 MB decimal thresholds. That does not certify compatibility. **Unknown:** all uploader/device validations. The following are current documentation findings checked during this analysis, independently of reference execution.

|Target|Status and applicable requirement|Reference gap / rebuild action|
|---|---|---|
|AppLovin|**Confirmed:** single HTML ≤5 MB, embedded resources, portrait/landscape, MRAID 2.0, gesture-gated sound/store routing. [AppLovin guide](https://legacy-support.axon.ai/en/growth/promoting-your-apps/creatives/best-practices-and-guidelines/).|Keep one ready/viewability wrapper; implement pause/resume and test WebGL/rotation on device. Do not treat source fallback as host validation.|
|Meta|**Unknown:** official developer page returned HTTP 429 and Business Help required login. [Official entry](https://developers.facebook.com/docs/app-ads/formats/playable-ad/).|FbPlayableAd adapter absent. Confirm account-specific HTML/ZIP limit and template; do not present an unverified 2/5 MB number as settled.|
|Google App campaigns|**Confirmed:** ZIP ≤5 MB, ≤512 files, orientation metadata, responsive assets; custom CTA uses hosted exitapi.js and ExitApi.exit or supported MRAID equivalent. [Google guide](https://support.google.com/google-ads/answer/9981650).|Add correct App-campaign adapter and packaging. Required host script is a documented network exception, not a game asset request. Verify actual product; generic display ads have different exit rules.|
|ironSource Exchange|**Confirmed:** ≤4 MB downloaded assets+code, MRAID 2.0, loading indicator, getMaxSize, mraid.open; tag format differs from full HTML upload. [Exchange guide](https://docs.unity.com/en-us/grow/programmatic/ironsource-exchange/mraid-specifications-guidelines).|Confirm Exchange vs another placement; do not assume legacy dapi. Full document is not the specified raw exchange tag. Respect host close/timer UI.|
|Mintegral|**Confirmed:** current asset page lists single HTML ≤5 MB; upload guide also supports ZIP/URL workflows. [Asset specs](https://helpcenter.mintegral.com/en/docs/asset-specs/Event-Mapping-Review-Process), [upload/testing guide](https://helpcenter.mintegral.com/en/docs/creative-guide-step-by-step/Google-Tag-Manager-Integration).|**Unknown:** exact current callback contract; linked Playturbo guide returned no readable body. Obtain its template and verify gameReady/gameStart/gameEnd/install requirements rather than shipping AppLovin hooks unchanged.|
|Unity Ads|**Confirmed:** single inlined minified HTML <5 MB, both orientations, ready+viewability, pause while hidden, deliberate store tap after gameplay; current guide uses MRAID 3.0. [Unity specifications](https://docs.unity.com/en-us/user-acquisition/creatives/specifications/playable).|Add explicit invisible pause/audio stop; reserve host overlay areas and remove any autonomous attribution requests. Source is not validated in Unity.|
|Vungle / Liftoff|**Confirmed:** Exchange supports MRAID 2.0 playable creatives, deliberate interaction, mraid.open preferred, no location redirects. [Vungle Exchange](https://support.vungle.com/hc/en-us/articles/8709966237723-HTML-and-MRAID-Creatives-Submission-Guidelines). Liftoff Accelerate separately recommends HTML up to 5 MB, ready handling and no iframe. [Liftoff integration](https://support.accelerate.liftoff.io/hc/en-us/articles/52724569196699-Interactive-Ad-Integration).|Confirm Direct/Exchange/Accelerate placement and package. Avoid wrapper iPhone location fallback. This is not one universally interchangeable Vungle template.|
|Moloco|**Confirmed:** one non-ZIP HTML <5 MB, both orientations, no XMLHttpRequest object, no mraid.js, no external asset requests; CTA must call FbPlayableAd.onCTAClick with no arguments. [Moloco guide](https://help.moloco.com/hc/en-us/articles/24124525963799-Playable-and-Interactive-End-Card-IEC-creative-guide).|Reference CTA is wrong for this target and bundled loader contains XMLHttpRequest. Produce a clean target adapter/package; do not merely change the store URL.|

**Inferred — architecture proposal:** game rules, level and visuals are reusable; CTA, host readiness, visibility, mute, completion reporting, allowed bootstrap scripts and packaging are network-specific. Use one adapter per build, not a chain that might call several SDKs. Preserve gesture ownership and pause simulation/audio on hide. No external game assets should be needed.

## Phase 7 — Runtime observation status

**Confirmed:** Playwright launch attempts used Chromium sandboxing enabled, an isolated browser context, muted audio, service workers blocked, all outgoing requests routed to abort except an in-memory synthetic document response, and WebSockets closed. Reference originals were never served from a real external host.

**Confirmed:** Chromium headless shell reported GPU process exit −1073741515 and browser exit 3221225477. Installed Chrome, sandboxed SwiftShader and another installed Chromium build also closed during page creation; Firefox fallback failed page creation. The reference did not reach navigation. [Failure JSON](evidence/runtime-failure.json), [launch stderr](evidence/browser-launch.log), [harness](tools/observe.cjs).

**Unknown / blocked:**

|Requested evidence|Result|
|---|---|
|390×844, 844×390, 768×1024, 360×640 captures|No gameplay page loaded; zero screenshots|
|Load / first tap / mid-game / near-full / win / lose / CTA|No captures; no placeholder images presented as gameplay|
|Successful and failed run recording|No recording; no implemented capacity loss found statically|
|Console errors from game / network request trace|Not observed; launch errors are not game errors|
|FPS / frame times / memory / load time / draw calls|Unknown, no measurements|
|Fill track / occupied entry / rapid tap / blocked tap|Not empirically tested|
|Empty ammo / idle hint / timer expiry / rotate / zoom|Not empirically tested|
|Live scene graph and renderer properties|Not accessible|

**Confirmed:** zero reference network requests here means the page never loaded, not that runtime network silence was proven. [screenshots/README.md](screenshots/README.md) records missing captures. [beat-sheet.md](beat-sheet.md) is explicitly source-derived, not a measured session.

**Inferred — next empirical procedure:** in a functioning sandbox, keep all routes blocked/logged; record first stable render and inspect Cocos via System.import('cc') and director.getScene. Snapshot hydrated Arrow.cells, cannon ammo, Path.pathPoints and camera matrices before interaction. Then test each branch at all four viewports, preserving unmodified-run evidence separately from any instrumented experiments. Never synthesize a successful run by changing ammo/timer and call it reference gameplay. Compare hydrated cell counts to the static expansion before resolving solvability.

## Phase 8 — Rebuild plan and remaining questions

**Inferred — proposal:** [rebuild-spec.md](rebuild-spec.md) defines pure TypeScript core modules, Three.js scene/rendering, picking, animation, asset reuse, Vite packaging, adapter boundaries and priority acceptance checks. It is a plan, not implemented game code. Exact static values are available; runtime visual/performance parity remains an explicit prerequisite to final fidelity acceptance.

**Confirmed — scope clarified by the developer:** this is a playable-ad demonstration of arrows, conveyor transport and matching cannon fire. Full-game boosters, orbit controls, progression and guaranteed puzzle completion are outside scope. No client interview is needed to proceed. Preserve the supplied reference behavior where known; mark unverified details instead of adding features.

**Inferred — working defaults:** retain the source timer/endcard and fill-rejection behavior, do not add a congestion lose state merely because the full game might have one, and treat the block/ammo discrepancy as a reconstruction/runtime question rather than a required full-game balancing task. Orientation, byte ceiling and destination URLs remain delivery settings to resolve internally before shipping.

**Confirmed — continuation:** a further sandboxed Chromium blank-page probe also failed before navigation. Phase 7 remains blocked; see [continuation evidence](evidence/runtime-continuation.json). The colleague’s Babylon project has now been inspected separately: [template analysis](template-analysis.md), [Three.js migration plan](three-migration-plan.md).

**Confirmed:** no implementation begun. **Unknown:** device/browser/audio fidelity, runtime rules, network submission acceptance and final build size remain unverified.
