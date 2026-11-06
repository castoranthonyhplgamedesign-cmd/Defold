# AGENTS.md — Arrow Flow playable, Three.js

## Scope and authority

Target: **Three.js + TypeScript + Vite**, rebuilding the supplied playable-ad demonstration of arrows entering a conveyor and matching cannons shooting them. The reference determines behavior; the colleague's Babylon template supplies reusable assets, layout adapters and algorithm ideas. No full-game progression, economy, boosters, orbit controls or guaranteed board-clear solution is required.

Current authorization is documentation and planning only. [analysis/implementation-plan.md](../implementation-plan.md) describes future implementation, not permission to start it. When this header is incorporated into root AGENTS.md, the plan path is `analysis/implementation-plan.md`.

Read `IOS_SFX_GUIDELINES.md` before audio/input/lifecycle work. Its safeguards apply to plain TypeScript; its React examples do not require React. Preserve the original reference HTML and colleague's checkout. Keep analysis tools, forensic originals and snapshots out of shipping bundles.

Reference facts and tuning are in `analysis/REPORT.md`, `analysis/tuning.json` and `analysis/rebuild-spec.md`; template findings are in `analysis/template-analysis.md`. Label reference facts Confirmed/Inferred/Unknown. Static inspection, mocked tests, browser events and physical-device observations are different evidence levels. The original rules are backed up in `analysis/rules-source/AGENTS.before-three.md`.

## Stack and module responsibilities

One Three.js WebGLRenderer and canvas, TypeScript, Vite + vite-plugin-singlefile, WebP textures and short MP3 SFX around 96 kbps when audition confirms acceptable quality. Pin compatible dependency versions; measure bundle savings. No Babylon/Phaser runtime, React, physics engine, OrbitControls, animation library or post-processing without demonstrated need. Use GLTFLoader only for chosen assets; no remote decoder URLs.

Planned structure (not existing implementation):

```text
src/
  main.ts                  # DOM/host boot, wiring, clock and one frame loop
  config.ts                # Typed defaults, overrides and asset hydration
  projectDefaults.json     # Shared runtime/build source of defaults
  constants.ts             # Named layer/non-editable constants
  assets.ts                # Selected embedded asset manifest
  networks.ts              # Selected host adapter, readiness/lifecycle/CTA
  analytics.ts             # Guarded event reporting
  core/                    # Pure TS state, level, path, transit, shooting, session
  render/                  # Three scene/camera/materials, pose sync and effects
  input/                   # Native event ownership, picking and tap decisions
  ui/                      # Responsive HUD, tutorial and endcard
  audio/                   # Persistent media pools and cue management
  layout/                  # Engine-independent data adapters
  data/                    # Compact validated playable level
  assets/                  # Approved models, textures, fonts, audio
scripts/                   # Asset processing, build-all, finalization and audits
tests/                     # Core/config/audio/lifecycle regression fixtures
```

- Core imports no Three, Babylon, DOM, audio or SDK APIs. Use IDs and plain numerical state; meshes are not occupancy/ammo authority.
- View reads state/events; input resolves arrow IDs and requests core actions. SDK calls belong in networks/analytics, never in core.
- Main wires services. Endcard owns presentation and calls central CTA; a timer shows endcard, never opens a store.
- Keep modules proportionate. No Babylon compatibility shim, generic ECS or speculative framework.
- Set project naming, URLs, asset manifest, defaults and network outputs before shipping. Do not ship stale Wordscapes/CoinSort example values.

## Three rendering and responsive rules

- Construct one renderer after DOM/host initialization; UI cameras/DOM overlays do not require another context. Handle context loss/restoration without resetting simulation or creating a second renderer.
- Enable antialiasing. Explicitly configure output/texture color spaces and calibrate materials; Cocos illuminance numbers are not Three intensity equivalents.
- Fixed orthographic camera. Reference half-height 21 and exact transform are in tuning.json. No orbit/pan/zoom controls. Landscape framing remains provisional until observed.
- Use the reference's **720×1280** UI design space. Responsive helpers transform design coordinates to CSS coordinates; world positions remain world units.
- Determine CSS viewport dimensions from the actual container/visualViewport. Set renderer pixel ratio, then `renderer.setSize(cssWidth, cssHeight, false)`; do not multiply dimensions by DPR again. Update camera frustum and call updateProjectionMatrix.
- Proposed initial DPR cap: 2, subject to measured performance; this is not a reference constant. Cheap cached dimension checks, rAF-debounced resize and bounded 100/300/600 ms retries handle host rotation. Never recreate assets on resize.
- Picking uses the same canvas rectangle/camera. Test DPR, offset frames and rotation. Keep canvas full-frame and arrange camera/HUD for portrait and landscape without covering cannons or CTA.
- DOM overlay is the baseline for HUD/endcard; world rendering uses the depth buffer. Use renderOrder only for deliberate overlays. Dim through an overlay, never body opacity/background changes.
- Target 60 FPS; at least 30 FPS on designated mid-range Android and seek ≥55 FPS in the documented throttled fixture. Record hardware/throttle/frame times; these are targets until measured.
- Share geometry/materials, instance repeated objects where beneficial, pool projectiles/particles and avoid hot-loop allocations. Do not claim zero GC. Dispose owned resources and listeners.
- Pause all gameplay clocks, transit, projectiles, hints and tweens while hidden; resume without large catch-up. Pausing the reference's wall-clock fallback is an intentional host-lifecycle adaptation.
- Modern Three WebGLRenderer requires WebGL2. Detect unsupported rendering and show a lightweight fallback/endcard with deliberate CTA; do not promise WebGL1 support. See https://threejs.org/docs/pages/WebGLRenderer.html.

## Audio and native input — required guide adaptation

Follow IOS_SFX_GUIDELINES.md in full; this section maps it to this app.

- Create persistent HTMLAudioElement pools after DOM/host initialization and before input. Prepare every actually used immediate/future cue. Retain exact elements across screens/retries. No late endcard pool, replacement elements, preliminary unlock button or audible autoplay.
- Do not replace the supplied strategy with Three Audio/AudioListener or an independent Web Audio unlock scheme.
- Choose one native TouchEvent/PointerEvent family using the guide's mobile/iPadOS detection, capture listeners and accepted input identifiers. Touch gestures ignore compatibility pointer capture loss; pointer gestures handle matching capture loss. Cover outside release, cancel, blur and concurrent touches.
- Gameplay action is a valid **tap release**. Down may prime future voices but does not fire a premature launch cue. Resolve release synchronously and request due accepted/blocked SFX inside that native handler, before spare priming. Release recovery precedes removal of the interaction token. Cancellation does not launch.
- Delayed hit/replacement SFX fire immediately at authored core events. No arbitrary delay/debounce/stagger or waiting for priming.
- Implement per-voice states/generations, same-element prime promotion, caught throws/rejections, bounded freshness and native-boundary retries. Old callbacks cannot pause/revive new or canceled cues. Promise settlement is distinct from playing events.
- Preallocate for expected overlap; separate categories and define bounded overflow. No cue-time pool growth. Valid one-shot tails survive ordinary release; loops stop with their interaction.
- Combine document visibility, host viewability/exposure, SDK volume and config mute. Pause all voices including detached pools on hide; invalidate pending work and never replay stale one-shots on resume.
- HTML media volume is 0–1. Reference gains above 1 need explicit asset-level/relative gain mapping and audition, not invalid volume assignments. No BGM or win cue simply because an unused clip/API exists.
- No audio diagnostics, traces, console logs, globals, sound-test controls or UI unless explicitly requested. Required playback state and project analytics are separate.
- During implementation record real checks in `analysis/audio-verification.md`; missing device checks remain unverified. Automated browsers stay muted while production sound is preserved.

## Project-specific host and delivery decisions

The general contracts below are retained with these explicit project adaptations:

- Enable the eight requested targets: al, gg, is, mtg, fb, un, vu, mo. TikTok and a separate Liftoff variant remain optional/disabled. Network tags identify internal build variants, not universal compatibility with every placement product.
- Select one host adapter per build. Preserve guarded host-specific fallback capabilities, but do not use a global SDK priority chain to route through an unrelated host.
- One intentional CTA click invokes at most one destination. notifyGameClose precedes the redirect. Preserve the reference's icon/title/button surfaces; no automatic redirect or unrequested whole-screen CTA.
- Google: guarded literal ExitApi.exit() and only official exitapi.js, never exitapi-impl.js. Meta/Moloco: no-argument FbPlayableAd.onCTAClick(). MRAID targets: ready-gated mraid.open and one early bridge request. Mintegral/Vungle use the selected host's documented callbacks; do not invent postMessage payloads. Luna is conditional on an actual Luna host, not required by Three.
- A real MRAID host still loading must not be bypassed with window.open or a later automatic redirect. Missing optional getState is handled gracefully. Standalone preview may use guarded window.open inside a click when no host exists. No location redirects.
- Keep initMraid's 2000 ms readiness / 500 ms late-detection defaults. Timeout avoids hanging bootstrap; it does not certify known-host readiness/visibility. Register listeners once, cache state early and apply it before enabling interaction.
- All known visibility gates must permit running. Asset readiness is not presentation permission. Ignore null/non-finite host volume; clamp valid percentages and preserve config mute.
- Expose lifecycle hooks without overwriting host functions; report actual ready/start/end/close once. Stubs alone are not compliance. CHALLENGE_SOLVED means an actual clear, never just timer expiry.
- Default HTML ceiling: less than 5,000,000 bytes, with stricter per-placement caps (e.g. 4,000,000 for selected ironSource Exchange deliveries). Work toward a provisional 4,000,000-byte common target. These are budget targets, not measured outputs.
- Preserve original baseline ZIP choices for gg/mtg/vu pending placement checks; ironSource Exchange raw-tag delivery differs from full-HTML upload. Confirm adapter/package against available target validators before claiming acceptance; do not require client contact to begin core work.
- Only intended host bridges are allowed external requests. No remote game assets, compression decoders or tracking resources added by default. Moloco must contain no XMLHttpRequest or mraid.js.
- Do not blindly rewrite engine code/window.top based on historical Phaser fixes. Inspect the actual Three bundle; preserve meaningful authored error handling.

## Configuration clarifications for Three

Preserve the full editor contract below, including marker spelling, head placement, GAME_CONFIG_DEFAULTS, window.GAME_CONFIG assignment and CHANGABLE_* names.

- An injected editor accessor must survive. Without that accessor, preserve preexisting plain-object overrides before the required assignment and merge them before runtime consumption.
- Deep-merge supported objects/dotted paths; reject prototype-pollution keys and invalid ranges. Replace ordinary arrays; merge texture/sound slots by uuid with spriteName/id fallbacks. Do not mutate defaults.
- Use GAME_LENGTH.timeLimit as duration authority. START_TIMER_VALUE is a compatible alias normalized to the same value; explicit timeLimit override wins when both are supplied. Document/test precedence.
- Include the reference's hint/timer fields; omit unsupported autoplay/video/opening-animation fields. Proposed Arrow Flow settings join the same resolved object, not another public config authority.
- Production payloads are self-contained; relative asset overrides can be development inputs but must be embedded before delivery. Hydrate only empty paths.
- Payload replacement avoids duplicate bytes in config; it does not make larger replacement assets equal in file size.

