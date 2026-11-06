# Arrow Flow — full Three.js implementation plan

Status: **Planned implementation stages 1–8 completed locally, 2026-10-22; ready for developer review.** Audio, lifecycle, eight target packages, recordings and automated checks are delivered. Physical-device and official-host acceptance remain unverified; the software-renderer FPS target did not pass. See [delivery-report.md](delivery-report.md), [audio-verification.md](audio-verification.md) and [network-integration.md](network-integration.md). This plan replaces earlier implementation proposals where the newly supplied root AGENTS.md and IOS_SFX_GUIDELINES.md require a different approach, especially audio.

**Priority update:** build the playable ad first. Custom conveyor authoring and integration with Arr_LayoutEditor are deferred in [deferred-arrow-flow-editor.md](deferred-arrow-flow-editor.md). They are not prerequisites, implementation stages or acceptance requirements for this delivery. Keep authored level/path/queue data separate from rendering as already planned, without building a general editor integration now.

## 1. Outcome and decisions

Build a self-contained playable ad showing this sequence: identify a free arrow → tap to launch → colored segments enter and circulate on the conveyor → matching cannons shoot them and consume ammo → cannon queues advance → timer/clear leads to an endcard → deliberate CTA opens the correct host destination.

**Confirmed source roles:** the Cocos HTML is the behavior/layout reference. The Babylon template is reusable source material, not a second behavior specification. Its 12-arrow test grid, fixed slots, backward occupant pushing and loss logic are not inherited automatically.

**Proposed implementation decisions:**

- Three.js + TypeScript + Vite; one WebGLRenderer, fixed orthographic camera, plain TypeScript core, responsive DOM UI and persistent HTMLAudioElement audio pools.
- Target the reference's board/track/four-queue composition. Use the colleague's mesh/texture for an element only when its silhouette, material and UVs can match that element; otherwise reuse the extracted reference geometry. The template's different board may be a temporary test fixture, never an unlabeled final substitute.
- Retain source launch/spacing/fill/shooting/timing rules. No boosters, camera controls, progression, economy, lives, extra lose screen or required full-board solution.
- No physics/tween/UI framework or compression decoder by default. Implement only the small analytical collision checks and easing functions needed.
- Exactly eight target outputs: Applovin, Facebook, Google, Ironsource, Mintegral, Moloco, Unity and Vungle. No other network adapters or outputs. Distinguish network product/placement details in build profiles rather than assuming identical bridges and ZIP requirements.
- Working raw-HTML target below 4,000,000 bytes, baseline ceiling below 5,000,000 with stricter per-target overrides. These are proposed budgets, not measured savings or a guarantee of every placement's acceptance.

**Known limitation:** the reference has not loaded in this environment despite sandboxed-browser attempts. All timing/behavior below comes from source, not observed playback. Runtime comparison remains a required fidelity check, but unavailable client contact does not block the pure implementation work once authorized.

## 2. Behavior baseline and intentional adaptations

|Area|Implementation baseline|Evidence/status|
|---|---|---|
|Board|Planar XZ arrows, facing ±X/±Z; validate cell order, origins and transforms|Confirmed axes; reconstructed full level remains Inferred. REPORT Q11 and evidence/level.json|
|Path|12-point chamfered polygon, source resampling; no automatic smooth spline|Confirmed algorithm, approximately 84.272-unit sampled length is Inferred. REPORT Q1|
|Motion|15 units/s; nominal 1-unit spacing against foreign groups; free gaps persist|Confirmed source. REPORT Q3–4|
|Admission|Meter = 100×0.5×onPathCount/pathLength; reject taps at ≥90%; no fixed slots or capacity-loss transition|Confirmed source. REPORT Q2|
|Blocked tap|0.25-unit head nudge over 0.1 s, return over 0.2 s bounceOut and wrong cue|Confirmed source. REPORT Q12|
|Launch|Head to selected path sample; clamp(0.05×distance,0.16,0.8) seconds; tail history follows; force remainder after 0.5 s|Confirmed source. REPORT Q13|
|Shootability|Preserve arrow color; whole group remains inTransit until all segments enter|Confirmed source. REPORT Q14|
|Shooting|Matching-color detector entry; 0.1 s projectile/shrink; ammo charged on completion|Confirmed source. REPORT Q8–10|
|Replacement|Four source queues, 0.3 s advance/fade; remove obsolete front colors as source does|Confirmed source logic; queue expansion Inferred. REPORT Q7–9|
|Hints/end|5 s idle hint; 60 s countdown after first accepted launch; clear or timeout shows CTA; 0.4 s quadOut entrance|Confirmed source. REPORT Phase 4–5|
|Input|Tap release, multiple independently launching arrows, no invented global cooldown|Confirmed source concurrency; native input details adapted below|

**Proposed robustness changes, explicitly not source facts:**

1. Pause every timer, transit fallback and effect on host/document hide; source used wall-clock time in one transit branch. Resume from active time without catch-up.
2. Genuine touch/pointer cancellation releases ownership without launching. The source listens to touch-cancel; copying that behavior would create unintended launches.
3. Use per-target shot reservations and exactly-once destruction/ammo completion to avoid duplicate collision callbacks consuming the same block twice. Preserve normal source timing; record this difference if live reference tests reveal deliberate multi-hit behavior.
4. Empty hint candidates produce no hint, rather than an invalid access. No automatic move or forced win.
5. Endcard blocks board input and freezes game simulation; keep only authored endcard presentation alive. No accidental background launch through the overlay.

These adaptations address lifecycle/state integrity. They do not authorize replacing the reference's congestion model with the template's cleaner slot system.

## 3. Architecture and public boundaries

|Module|Responsibility and interface|
|---|---|
|`core/types.ts`|IDs/plain coordinates; arrow, segment, shooter, queue, session and event types. No renderer objects.|
|`core/level.ts`|Validate/load compact layout, colors, axes and queues; preserve source order; report duplicate cells without silently repairing source data.|
|`core/path.ts`|Sample distance/progress, entry-point choice, tangent and wrapping; numeric arrays.|
|`core/transit.ts`|Head/tail history, partial entry, group shootability and active-time fallback.|
|`core/conveyor.ts`|Segment progress, group spacing, occupancy meter and removal; no fixed slots.|
|`core/shooters.ts`|Analytical detector entry, reservations, pending shot completion, ammo and queue cleanup/advance.|
|`core/game.ts`|`createGame`, `requestLaunch(id)`, `step(dt)`, `setPaused`, `snapshot`; session timer, hints, end reason and event output.|
|`render/view.ts`|One renderer/camera/light set; `resize`, `sync(snapshot)`, `render`, `dispose`.|
|`render/assets.ts`, `render/effects.ts`|Load approved embedded geometry/materials; mesh ID mappings, visual tweens and pooled impacts.|
|`input/nativeInput.ts`, `input/picking.ts`|Own one event family, map screen→arrow ID, validate release and feed synchronous actions/audio.|
|`ui/hud.ts`, `ui/tutorial.ts`, `ui/endcard.ts`|Design-space layout, meter/ammo/timer, hand/highlights, visible CTA buttons.|
|`audio/GameAudio.ts`|`prepare`, `beginInteraction`, `playCue`, `primeIdle`, `retryBoundary`, `endInteraction`, `setLifecycle`, `dispose`; persistent voice pools.|
|`projectDefaults.json`, `assets.ts`|Ordinary source-controlled tuning, provenance and embedded resource imports; no external editor or global overrides.|
|`networks.ts`, `analytics.ts`, `main.ts`|Selected host adapter, events, bootstrap/lifecycle and one frame loop.|

The core reports launchAccepted, launchRejected, segmentEntered, shotStarted, blockDestroyed, cannonRemoved/advanced, hintChanged and sessionEnded events with stable IDs. Input-triggered events are consumed synchronously inside the native handler where required by audio; do not defer launch SFX to the next render frame. Frame-triggered events are consumed immediately after simulation steps. Keep pending-shot visual positions separate from their logical target IDs.

Use a deterministic simulation clock with bounded substeps for movement/collision stability. Preserve the reference's system order where meaningful and document differences. Events and timer deadlines use active time; rendering interpolates poses independently. Avoid a general event-bus framework.

## 4. Implementation stages and exit checks

### Stage 0 — lock evidence, asset choices and baseline data

**Work:** verify source hashes; inspect the reference control points, UI hierarchy, arrow prefab expansion and shooter queues. Compare the template's head/body/corner/cannon/track geometry with the corresponding extracted reference elements. Create a per-element provenance manifest including source UUID/file, transform, material/texture and selected shipping representation. Preserve original art.

Retry reference observation only through a functioning sandbox with outgoing requests logged/blocked and audio muted. If unavailable, retain the explicit gap; do not spend repeated cycles on the same blank-page crash. Inspect remaining animation-curve data for exact CTA pulse values rather than inventing amplitudes. Validate reconstructed duplicate cells and 536-block/425-ammo counts independently of any full-game solvability expectation.

**Outputs:** `analysis/implementation-decisions.md`, compact candidate level data, selected asset manifest and updated unknowns. These files are created during implementation, not present validation results.

**Exit check:** every chosen element has provenance; questionable source data is flagged; no silent deduplication, fabricated camera values or assumed template visual equivalence. Exact-fidelity acceptance remains provisional if the reference cannot be observed.

### Stage 1 — minimal project, packaging and static scene

**Work:** create the TypeScript/Vite/Three project only after implementation is requested. Pin tested versions; import GLTFLoader only if needed. Establish DOM-ready boot, source-controlled settings, a selected-host lifecycle seam, one renderer and fallback UI. Render one head/body/corner, track and cannon using chosen assets. No gameplay yet.

Camera starts from reference orthographic transform, half-height 21, near/far 1/10000 and background #434267. Do not paste Cocos HDR intensity directly into Three. Start with a simple light/material mapping and calibrate it. Use original normals/UVs and correct texture color spaces. For template elements, preserve Unity-to-right-handed conversion once, not twice.

Build an early singlefile baseline and measure engine/loader/model/image/code bytes. Use the guide's persistent media service boundary, not Three Audio. Check WebGL2 availability and deliberate-CTA fallback behavior.

**Exit check:** classic single HTML loads selected embedded resources without external game fetches; one renderer; no missing geometry; bytes recorded. A static render is not gameplay parity.

### Stage 2 — pure arrow and conveyor core

**Work:** implement validated layout loading, axis-aligned obstruction, source entry-point selection, head/tail transit, concurrent arrows, group flags, path movement, spacing and meter/admission. Reuse template ordering/path math where equivalent, replacing Babylon vectors with numeric operations. Do not port its fixed-slot admission or reverse-animation policy.

Use a tiny deterministic board fixture to isolate mechanics; label it test-only. Then integrate the candidate reference board. Keep logical visibility/transit in core; render mesh enablement is an output, not a rule input.

**Exit tests:** blocked/free arrow; each facing axis; two concurrent groups; long/short tails; forced insertion; occupied entry; foreign vs same-group spacing; gap after removal; wraparound; threshold just below/at 90%; incoming group overshoot; irregular dt and pause/resume. Never infer capacity loss from the meter.

### Stage 3 — cannon targeting, ammo and queues

**Work:** build four authored source lanes and their queues. Detect entry to the source detector volumes analytically, gated by color and group transit. Use swept checks/substeps so a fast block is not missed between frames. Schedule 0.1-second shot completion, shrink/removal and ammo consumption; advance queues over 0.3 seconds. Implement source obsolete-color cleanup.

Use reservations to guarantee a block is removed once and ammo remains valid. Queue labels and projectile/impact visuals consume state/events. No physics engine or bullet homing. Pool render effects; do not reuse Babylon's different firing-distance rule without documenting a deliberate change.

**Exit tests:** mismatched color ignored; transit ignored; just-entered matching block; multiple detector contacts; duplicate callback; last shot; empty queue; obsolete front color; target removal during pending shot; removal opens a gap; simultaneous shot completions. Timer-ending cleanup must cancel future gameplay effects safely.

### Stage 4 — input, UI, pacing and endcard

**Work:** implement native accepted-input ownership with tap-release selection; raycast selected arrow meshes or accurate projected hit regions with stable ID mapping. Reject drags/cancellations without creating a camera gesture. Use a documented UI tap tolerance calibrated against captures, not an invented reference number.

Create HUD meter/ammo, internal timer, source hand animation and valid-arrow highlights. No visible countdown label was found in the reference; preserve that presentation. Start the countdown on the first accepted launch, show hint after 5 seconds idle, and show endcard on timeout/clear. Preserve the source warning color sequence and blocked feedback. Resolve exact CTA pulse from data; do not ship a guessed amplitude as matched.

Use 720×1280 reference design coordinates. Endcard icon/title/button remain the deliberate CTA surfaces; do not install an invisible full-screen store link. Use an actual accessible DOM button for each required surface and one adapter invocation per click. Endcard appearance is 0.4 seconds quadOut; dimmer belongs to UI, not page opacity.

**Exit checks:** timer does not start on blocked/missed input; hint tolerates no candidate; repeated input remains responsive; endcard appears once; board input stops; timer never redirects automatically; CTA bounds align with visible art at all four required viewports.

### Stage 5 — iOS-safe audio, integrated with native input

**Work:** implement IOS_SFX_GUIDELINES.md's persistent HTMLAudioElement strategy before enabling production input. No React, Web Audio unlock replacement or sound-test controls. Load all chosen cue pools in the stable boot owner.

|Cue|When requested|Source facts and policy|
|---|---|---|
|select|Accepted launch inside native release handler|Reference duration ~0.161 s; immediate, no artificial delay|
|wrong|Blocked launch or rejected full-meter tap inside native handler|Reference duration ~1.045 s; independent bounded pool|
|shoot|Block destruction event|Reference duration ~0.075 s; preserve actual event binding, do not move it to fire merely because of its name|
|slidey|Cannon removal/replacement event|Reference duration ~0.686 s; may overlap hit cues|
|win/BGM|Not bound by default|Assigned win clip has no found call; no assigned BGM payload|

Prime idle future voices at real gesture boundaries. On release, request newly due audible cues before priming, retry eligible pending/starting voices before ending the interaction, and distinguish fulfilled play promises from observed playing. Do not immediately restart a new attempt created in that same handler; recovery targets prior eligible attempts, with new generations protecting replacement work. Retain one-shot tails after release. Cancel stale pending requests at interaction end/hide; future delayed cues are new requests, not resurrected old cues.

Pool capacity is a proposed implementation parameter chosen from maximum supported concurrent events × clip duration plus burst margin, verified with rapid-input fixtures. Use separate category pools; prefer idle primed voices and drop the newest excess request when genuinely exhausted. This audio overflow policy never blocks gameplay. Final capacities/freshness/retry windows must be recorded in audio-verification.md; they are not extracted reference numbers.

Transcode chosen source WAVs to compact MP3 only after comparing onset, duration and quality. Preserve source files. Map requested source gains above 1 to valid 0–1 media levels or normalized assets, with audible comparison; never silently clamp and claim matched loudness. No unsolicited audio logging/trace globals/UI. Mute browser automation, not production assets.

**Exit tests:** quick first release with unsettled play; stale reject after retry; fulfilled promise without playing; playing-before-release without rewind; prime promoted to real cue; independent overlapping instances; both multi-touch release orders; touch/pointer cancellation ownership; hidden-state completion; delayed cue after release; overflow. Physical first-use/overlap/delayed audibility is a separate recorded device check, not established by mocks.

### Stage 6 — responsive composition and lifecycle

**Work:** apply cached host/document gates before input; pause simulation and all media when any required gate is closed. Keep already-ready, delayed/missing SDK and late injection paths bounded. Visibility restoration must not reset level, jump transit, replay stale sounds or consume another endcard reveal.

Resize one renderer using CSS dimensions and a measured DPR policy; update camera projection and DOM design scaling. Proposed initial DPR cap is 2. Keep the source portrait composition; derive a landscape arrangement that preserves readable board, track, cannons and UI, and record any difference until reference captures exist. No controls that change camera orientation.

**Exit checks:** 390×844, 844×390, 768×1024, 360×640; rotate during launch, shot and endcard; offset iframe picking; no clipping/duplicate canvases; hidden start; hide/resume without time jump; null SDK volume; context loss/restoration/fallback. Physical device and host testing remain separately identified.

### Stage 7 — eight network outputs and packaging

**Work:** keep gameplay/camera/queue values, store URLs and audio settings in ordinary source-controlled projectDefaults.json or typed modules. Import assets directly with Vite. Use one countdown duration (60 seconds initially), a 5-second idle hint and the reference endcard. Preserve extracted store URLs until delivery metadata changes them. Sound remains silent before its legitimate gesture/cue and respects user/host mute.

**Explicit exclusion:** no GAME_CONFIG integration, browser-global overrides, editor markers, payload-slot registry, keyed/dotted configuration merging, compatibility aliases or generated configuration guide. Those belong to another playable project.

Implement exactly eight build profiles: Applovin (al), Facebook (fb), Google (gg), Ironsource (is), Mintegral (mtg), Moloco (mo), Unity (un), Vungle (vu). No optional extra networks.

Use selected-placement MRAID readiness/viewability/open for Applovin/Ironsource/Unity; Google literal ExitApi.exit and official hosted exitapi.js; Facebook/Moloco no-argument FbPlayableAd.onCTAClick; selected Mintegral install/lifecycle and Vungle bridge contracts. No arbitrary postMessage protocol, location redirect or Moloco XHR/mraid.js. Only deliberate clicks open destinations.

Maintain lowercase filenames and network meta tags. Baseline ZIP choices gg/mtg/vu remain provisional until placement validation; ZIPs contain root index.html. Embed all selected model resources, textures, fonts and sounds. Byte guards include wrapper/base64 overhead. Test both store platform branches with destination stubs.

**Exit checks:** exactly eight target profiles/artifacts per creative variant; source settings consumed correctly; no external configuration-editor feature; classic JS syntax; no module chunks or external game resources; one intended bridge per target; lifecycle/completion/CTA idempotent; raw HTML and package bytes within selected caps. Mark unavailable official-host checks unverified.

### Stage 8 — fidelity, performance and delivery

**Work:** capture load, first input, mid-game, congested entry, timeout/clear and endcard at required sizes. Record complete showcase sessions and congestion/blocked-input scenarios. Only call a run successful/failed according to implemented rules; the reference has no source capacity-fail branch. Record console/request evidence, frame-time distribution, memory and renderer.info draw calls where accessible.

Compare source asset silhouettes, colors, camera composition, transition timing and UI against a working reference run when available. Prioritize the oversized reference track, repeated geometry, redundant assets and audio for measured size improvements. Do not add a decoder unless its payload savings exceed its code cost. No generic cleanup unrelated to acceptance.

**Exit:** core/audio/lifecycle tests pass; target builds audited; visuals and interaction reviewed; device/host checks recorded honestly; source/provenance/defaults and artifacts handed off. Unavailable browser/device validation prevents a claim of complete fidelity or submission approval, not completion of the parts that can be independently verified.

## 5. Size strategy and asset choice

**Confirmed measurements:** colleague's five GLBs/seven WebPs: 638,194 bytes raw, 850,940 bytes as base64 payload strings. Entire reference native inventory: 3,686,789 bytes; unchanged base64 mesh/texture/audio/font categories alone approach 4.91 MB before engine/code. Do not embed both full sets.

**Plan:** reuse only the selected element from each source, simplify/rebuild the heavy reference conveyor mesh while preserving measured silhouette/path, keep compact shared head/body/corner geometry, convert suitable textures to WebP and audition short compressed SFX. GLTF resources must be self-contained; forensic glTF files referencing external .bin files need packaging conversion. Large metadata exports are evidence, not shipping level data.

Three engine/loader bytes, final game code, final combined asset cost and total savings remain **Unknown until built**. Produce the first byte breakdown at Stage 1 and maintain it at each asset/build change; do not postpone the size check to final delivery.

## 6. Validation matrix and handoff

|Evidence|Required proof|What it cannot prove|
|---|---|---|
|Static source/data|Hashes, level/assets provenance, mapped constants and no prohibited imports|Rendered appearance or live callback order|
|Pure tests|Core clock/rules, source settings and lifecycle transitions|GPU/device performance|
|Controlled media tests|Per-voice ownership, race recovery, pooling and cancellation|iOS permission or speaker audibility|
|Browser capture|Viewport composition, taps, errors/requests, timings and frame metrics|Every physical ad WebView|
|Physical devices|First/rapid/delayed SFX, touch, orientation, performance|Unvisited host placements|
|Network validators|Actual artifact checked in the specified host/product|Other networks or builds|

Future final delivery: TypeScript source; selected assets with provenance; baseline single HTML; eight target artifacts; build/size report; screenshots/recordings; automated results; audio-verification/device/host matrix; known gaps and intentional differences. Source/review artifacts stay outside dist.

## 7. Changes made for this planning task

**Scope correction:** exactly eight networks; no external GAME_CONFIG feature. Tuning stays in ordinary project files.

**Completed:** read the entire supplied AGENTS.md and IOS_SFX_GUIDELINES.md; preserved original rules; adapted root AGENTS.md to Three.js while retaining applicable network/build rules and excluding the external configuration-editor contract; wrote this plan. Audio guide contents are unchanged. Earlier audio proposals are superseded by the persistent-element approach in this plan.

**Historical planning boundary:** no implementation was performed during the original planning task. Later authorized work is recorded in milestone reports and delivery-report.md. Publishing and real-device/official-host acceptance remain unperformed.
