# Milestone 3 — cannons, ammo and queues

Status: implemented and validated, 2026-10-22. Stop for developer review before full HUD, tutorial, timer and endcard.

## Pacing adjustment

**Confirmed implementation:** successful head/tail playback reduced from 2× to **1.5× original speed**, as requested. Head duration is now 0.1067–0.5333 seconds, depending on distance. Tail following and the forced insertion deadline use the same rate. Blocked feedback remains 2× and conveyor remains 24 units/s. Values live in `src/core/motionTuning.ts`. These are authored choices, not reference measurements.

## Delivered

- Four source cannon lanes and their authored color/ammo queues now operate.
- Matching on-path blocks trigger shots when entering a detector. Board blocks and blocks still in group transit are ineligible.
- Projectiles travel toward the detector center over 0.1 seconds while reserved targets shrink. Completion removes the target once and consumes one ammo.
- Ammo reservation prevents negative ammo and duplicate hits across cannons. Several contacts may fire concurrently; there is no invented fire cooldown.
- Cannons pulse when firing. Live ammo numbers follow the front cannon in portrait and landscape.
- At zero ammo, the front cannon disappears, the reserve advances, and the next reserve appears over 0.3 seconds. The detector is disabled during advancement.
- Front cannons whose color no longer exists among remaining board/transit/conveyor segments are removed; empty queues are supported.
- Pooled projectile and impact meshes; document/context pause retains pending simulation time. A core stop method cancels delayed cannon work for later session-ending integration.

## Source evidence

**Confirmed in reference code/data:**

| Behavior | Source |
|---|---|
| Collision-enter color/transit gate | `extracted/modules/Cannon.ts.js`, `onDetectionEnter` |
| 0.1-second projectile/shrink; ammo decremented on completion | same module, `destroyBlock` |
| Firing scale 1→1.15 over 0.05 seconds backOut, return over 0.1 seconds bounceOut | same module, `destroyBlock` |
| 0.3-second smooth queue movement and reserve visibility | `extracted/modules/Tunnel.ts.js`, `onCannonDestroyed`, `refresh` |
| Obsolete-color removal considers board plus conveyor | `extracted/modules/GameManager.ts.js`, `cleanupCannons` |
| Detector local offset (0,0.515,3.113), dimensions (1.489,2.585,1) | `assets/serialized/097e4753-ec84-4b56-9ff0-7fec40869754.json`, objects 4–5 |
| Projectile local origin (0,0.75,0.75), scale 0.75 | `assets/serialized/20e2baef-fc53-4029-be6e-e2a84b2eda4b.json`, object 1 |
| Four lane origins and queues | scene objects 47,51,57,63, and `../src/data/level.json` |

**Inferred port/adaptations:** detector world positions combine lane origin, front position and prefab local offsets. A numeric swept-box test replaces physics contact, expanding the detector by the block collider half extents. Existing contacts are tracked even while transit-gated: becoming shootable while already inside does not invent a new collision-enter event. New front cannons start with fresh contacts after advancement.

The source does not safely reserve target/ammo across overlapping callbacks; the port adds exactly-once reservations. Logical detectors stay fixed rather than expanding with visual recoil. Crossing checks run at 1/120-second simulation substeps, including at the updated 24-unit/s belt speed. Target selection follows stable on-path order for simultaneous contacts; original physics callback ordering remains Unknown.

## Files

- `src/core/cannons.ts`: detector intersections, contact state, shot reservations/completion, queue advancement, obsolete-color cleanup and cancellation.
- `src/core/simulation.ts`: owns cannon state, previous segment positions and updates after transit; renderer remains separate.
- `src/render/cannons.ts`: cannon meshes, firing pulse, queue poses, pooled spherical projectiles/impacts and projected ammo labels.
- `src/render/board.ts`: shrinking reserved blocks and removal visibility.
- `src/main.ts`, `src/render/scene.ts`, `src/constants.ts`, `src/style.css`: wiring, camera-following labels and disposal.
- `tests/cannons.test.mjs`, `tools/cannon-queue-smoke.mjs`: focused rules and last-shot browser fixture.

## Validation

**Confirmed for this implementation:**

- `npm.cmd test`: **23 passing tests**. Cannon tests cover mismatch/transit gates, re-entry, swept crossings, simultaneous contacts, cross-cannon duplicate targets, ammo limits, delayed consumption, queue timing, externally removed targets, cancellation, obsolete colors, empty queues, and paused pending shots.
- Authored-level integration: launching arrow 141 removes its six green segments and changes lane 0 ammo **26→20**. Final core completion occurs at about 0.6 seconds of simulation time in this fixture; this is not a reference runtime measurement.
- `npm.cmd run build`: TypeScript and single-file/classic-script/budget checks passed. Raw HTML: **1,781,397 bytes**. No new dependencies or remote assets.
- `npm.cmd run validate:browser`: 390×844, 844×390, 768×1024 and 360×640 at DPR 2; one canvas, no browser errors or external asset requests. Initial **40 draw calls / 255,131 triangles**. [Evidence](evidence/milestone-3-browser.json).
- `npm.cmd run validate:gameplay`: mouse and emulated touch verify blocked feedback, accepted launch, displayed ammo 26→20, unmatched block circulation, rotation, context restoration and native input ownership. [Evidence](evidence/milestone-3-gameplay-browser.json).
- `npm.cmd run validate:cannons`: isolated fixture changes only front green ammo to one in memory; its last shot replaces it with the yellow cannon carrying 18 ammo. Label is hidden mid-transition and visible afterward. Production level remains unchanged. [Evidence](evidence/milestone-3-queue-browser.json).

Visual inspection: [live shot/shrink](screenshots/milestone-3/mouse-shot-350ms.png), [initial ammo labels](screenshots/milestone-3/390x844.png), [queue mid-transition fixture](screenshots/milestone-3/fixture-queue-mid-550ms.png), [queue complete fixture](screenshots/milestone-3/fixture-queue-complete-800ms.png). Fixture filename times are controlled browser-clock offsets from tap; they are not recordings of the reference.

## Limits and next stage

**Inferred presentation choices:** projectiles use a lightweight sphere rather than adding the reference engine sphere mesh; impact feedback is a short colored sphere flash, not a verified particle reconstruction. Ammo uses projected DOM text with Arial fallback, rather than the reference font/plane rasterization. Queue label fade and remaining-reserve count are deferred with full HUD. Detector activation waits until the whole lane transition completes, avoiding source callback-order ambiguity.

**Unknown/unverified:** exact reference runtime parity, physical-device smoothness/audio, host lifecycle and low-end GPU performance. No FPS claim. Physical WebView/context-driver coverage remains outstanding. The original scene's 406-cell reconstruction remains Inferred.

Audio, countdown, idle tutorial, fill warning/HUD, endcard and eight-network integration remain deferred. This preview is not ready for network submission. The next stage adds the HUD/tutorial/session/endcard flow; no client questions or editor integration are prerequisites.
