# AGENTS.md — Arrow Flow playable, Three.js

## Scope and authority

Target: **Three.js + TypeScript + Vite**, rebuilding the supplied playable-ad demonstration of arrows entering a conveyor and matching cannons shooting them. The reference determines behavior; the colleague's Babylon template supplies reusable assets, layout adapters and algorithm ideas. No full-game progression, economy, boosters, orbit controls or guaranteed board-clear solution is required.

The developer now authorizes completing all remaining planned implementation stages without intermediate review stops. Finish audio, lifecycle, eight-network packaging and locally available delivery checks, then hand off for review. Physical-device and official-host checks that cannot be run must remain explicitly unverified. Latest user tuning reduces movement by 10%: blocked feedback 1.8x, successful launch/tail playback 1.35x, tail travel cap 20.25 units/s and conveyor 12.825 units/s after a further 5% conveyor-only reduction. Chevron animation currently uses its separate 3 units/s guide speed. Successful launch duration is distance-based without a maximum-duration cap; short launches retain a visible minimum. Conveyor follow spacing is .9 world units. Blocked feedback adds two red pulses beginning at contact and retains the approach, shake and return.

The launch-connection correction also caps the head at the existing 20.25 units/s body limit and follows the authored body route. The follow-up softness adjustment eases the first 80 ms and bounds pre-belt follow lag to .04 cell per link. See [analysis/launch-connection-fix.md](analysis/launch-connection-fix.md) for the measured cause and validation.

The conveyor entry uses backward displacement (user approval 2026-10-30), but the user rejected the accompanying incoming-arrow animation change. Preserve the restored full authored approach curve, distance-based rise and history-following tail. No separate moving-position handoff or 0.18-second incoming transfer. Existing belt occupants make room as the approaching block reaches the belt; only they are displaced, using the footprint-aware path. Belt speed, ammo queues and overload rules remain unchanged, and cannon reservations retain Segment identity. See [analysis/launch-motion-restoration/REPORT.md](analysis/launch-motion-restoration/REPORT.md), which supersedes the incoming-motion portions of the original pushback report.

The supplied conveyor-overload mockup supersedes the earlier 1.0-grid workaround: retain the original 1.25 grid and coordinates. For imported artist conveyors, the view uses a 60-degree fixed camera tilt, a resting board offset of -1.55 times cell size, and 0.9 head-width scale; arrows rise smoothly to the belt during launch. Default reference/procedural camera and board height stay unchanged. The blue palette entry is cyan #2cd8ed in both editor and runtime. See `analysis/mockup-layout-match.md`. Do not reject ordinary rim occlusion as a projected collision: resting blocks are below the rim; centers still must remain inside the opening.

The developer explicitly authorized Arr_LayoutEditor integration on 2026-10-26. The first integration is documented in [analysis/arrow-flow-editor-implementation.md](analysis/arrow-flow-editor-implementation.md); the earlier proposal remains in [analysis/deferred-arrow-flow-editor.md](analysis/deferred-arrow-flow-editor.md). Keep authoring tools and the local Three preview outside shipping bundles. On 2026-10-29 the user chose to ship the conveyor-overload level (`levels/overload-level.arrow-flow.json` with generated `src/data/overloadCannons.ts` queues) in every build; the original reference level stays in `src/data/level.json` for tests. Other custom levels are selected at build time with `build:level`, without GAME_CONFIG or a production import/debug interface. Build lengths are `3clicks`, `10clicks` (every tap on an arrow counts, including blocked and refused taps; the endcard follows once the last tapped arrow settles), `60seconds` and unlimited `full` (user delivery correction 2026-10-30: exclude 90 seconds from network outputs). Timed countdowns start on the first accepted launch; `full` has no timer or tap limit and ends on clear or overload. The 90-second local preview remains available.

Read `IOS_SFX_GUIDELINES.md` before audio/input/lifecycle work. Its safeguards apply to plain TypeScript; its React examples do not require React. Preserve the original reference HTML and colleague's checkout. Keep analysis tools, forensic originals and snapshots out of shipping bundles.

Reference facts and tuning are in `analysis/REPORT.md`, `analysis/tuning.json` and `analysis/rebuild-spec.md`; template findings are in `analysis/template-analysis.md`. Label reference facts Confirmed/Inferred/Unknown. Static inspection, mocked tests, browser events and physical-device observations are different evidence levels. The original rules are backed up in `analysis/rules-source/AGENTS.before-three.md`.

## Stack and module responsibilities

One Three.js WebGLRenderer and canvas, TypeScript, Vite + vite-plugin-singlefile, WebP textures and short MP3 SFX around 96 kbps when audition confirms acceptable quality. Pin compatible dependency versions; measure bundle savings. No Babylon/Phaser runtime, React, physics engine, OrbitControls, animation library or post-processing without demonstrated need. Use GLTFLoader only for chosen assets; no remote decoder URLs.

Planned structure (not existing implementation):

```text
src/
  main.ts                  # DOM/host boot, wiring, clock and one frame loop
  projectDefaults.json     # Ordinary source-controlled runtime/build defaults
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
tests/                     # Core/audio/lifecycle regression fixtures
```

- Core imports no Three, Babylon, DOM, audio or SDK APIs. Use IDs and plain numerical state; meshes are not occupancy/ammo authority.
- View reads state/events; input resolves arrow IDs and requests core actions. SDK calls belong in networks/analytics, never in core.
- Main wires services. Endcard owns presentation and calls central CTA. Game-end redirect (user decision 2026-10-29, matching the CCS/SL2/FNI projects): every ending (clear, fail, timer, tap count) shuts the lane doors, then opens the store once through the selected adapter (`triggerCTA(true)`, gameClose first, not reported as CTA_CLICKED), then shows the endcard for the player's return. On clear, the win cue starts at completion and the store/endcard wait is 2.2 active seconds so the 1.814-second cue can finish; other endings retain 0.6 seconds.
- Keep modules proportionate. No Babylon compatibility shim, generic ECS or speculative framework.
- Set project naming, URLs, asset manifest, defaults and network outputs before shipping. Do not ship stale Wordscapes/CoinSort example values.

## Three rendering and responsive rules

- Construct one renderer after DOM/host initialization; UI cameras/DOM overlays do not require another context. Handle context loss/restoration without resetting simulation or creating a second renderer.
- Enable antialiasing. Explicitly configure output/texture color spaces and calibrate materials; Cocos illuminance numbers are not Three intensity equivalents.
- Fixed orthographic camera pose. Reference half-height 21 and exact transform are in tuning.json. Expand the frustum only when needed for the user-requested horizontal world padding of min(24px, 6% of viewport width). No orbit/pan/zoom controls. Landscape framing remains provisional until observed.
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
- Gameplay action and click counting occur on **pointerdown / touchstart** (user correction, 2026-10-29). Mark the audio token active, synchronously request the action and due accepted/full-meter SFX, then prime spare voices. The blocked-arrow SFX remains at animation contact after approach. Release only performs audio recovery and cleanup; it never launches or counts again. Dragging or canceling after an accepted press does not undo that action. Ignore empty-space presses and duplicate starts for an active input identifier.
- Delayed hit/replacement SFX fire immediately at authored core events. No arbitrary delay/debounce/stagger or waiting for priming.
- Implement per-voice states/generations, same-element prime promotion, caught throws/rejections, bounded freshness and native-boundary retries. Old callbacks cannot pause/revive new or canceled cues. Promise settlement is distinct from playing events.
- Preallocate for expected overlap; separate categories and define bounded overflow. No cue-time pool growth. Valid one-shot tails survive ordinary release; loops stop with their interaction.
- Combine document visibility, host viewability/exposure, SDK volume and config mute. Pause all voices including detached pools on hide; invalidate pending work and never replay stale one-shots on resume.
- HTML media volume is 0–1. Reference gains above 1 need explicit asset-level/relative gain mapping and audition, not invalid volume assignments. No BGM or win cue simply because an unused clip/API exists.
- No audio diagnostics, traces, console logs, globals, sound-test controls or UI unless explicitly requested. Required playback state and project analytics are separate.
- During implementation record real checks in `analysis/audio-verification.md`; missing device checks remain unverified. Automated browsers stay muted while production sound is preserved.

## Project-specific host and delivery decisions

The general contracts below are retained with these explicit project adaptations:

- Implement exactly eight networks: Applovin (al), Facebook (fb), Google (gg), Ironsource (is), Mintegral (mtg), Moloco (mo), Unity (un), Vungle (vu). Do not add optional or disabled extra-network adapters or outputs. Network tags identify internal build variants, not universal compatibility with every placement product.
- Select one host adapter per build. Preserve guarded host-specific fallback capabilities, but do not use a global SDK priority chain to route through an unrelated host.
- One intentional CTA click invokes at most one destination. notifyGameClose precedes endcard/game-end redirects. User correction 2026-11-03: the bottom-left gameplay title CTA opens the store and reports CTA_CLICKED without gameClose, gameEnd, an endcard or a session reset (`triggerCTA(false,true)`). Preserve normal host/document pause and resume while the store is open. The user explicitly requested a full-screen endcard CTA in both orientations. Every intentional tap remains active, including repeated taps; one tap invokes one destination. Preserve the icon/title visuals. The only automatic redirect is the single game-end redirect above.
- Google: guarded literal ExitApi.exit() and only official exitapi.js, never exitapi-impl.js. Meta/Moloco: no-argument FbPlayableAd.onCTAClick(). MRAID targets: ready-gated mraid.open and one early bridge request. Mintegral/Vungle use the selected host's documented callbacks; do not invent postMessage payloads. Luna is conditional on an actual Luna host, not required by Three.
- A real MRAID host still loading must not be bypassed with window.open or a later automatic redirect. Missing optional getState is handled gracefully. Standalone preview may use guarded window.open inside a click when no host exists. No location redirects.
- Keep initMraid's 2000 ms readiness / 500 ms late-detection defaults. Timeout avoids hanging bootstrap; it does not certify known-host readiness/visibility. Register listeners once, cache state early and apply it before enabling interaction.
- All known visibility gates must permit running. Asset readiness is not presentation permission. Ignore null/non-finite host volume; clamp valid percentages and preserve config mute.
- Expose lifecycle hooks without overwriting host functions; report actual ready/start/end/close once. Stubs alone are not compliance. CHALLENGE_SOLVED means an actual clear, never just timer expiry.
- Default HTML ceiling: less than 5,000,000 bytes, with stricter per-placement caps (e.g. 4,000,000 for selected ironSource Exchange deliveries). Work toward a provisional 4,000,000-byte common target. These are budget targets, not measured outputs.
- Preserve original baseline ZIP choices for gg/mtg/vu pending placement checks; ironSource Exchange raw-tag delivery differs from full-HTML upload. Confirm adapter/package against available target validators before claiming acceptance; do not require client contact to begin core work.
- Only intended host bridges are allowed external requests. No remote game assets, compression decoders or tracking resources added by default. Moloco must contain no XMLHttpRequest or mraid.js.
- Do not blindly rewrite engine code/window.top based on historical Phaser fixes. Inspect the actual Three bundle; preserve meaningful authored error handling.

## Project tuning

Intro screen (user correction 2026-11-03): replace the opening HUD caption with a centered full-screen DOM dim overlay. Tap anywhere to dismiss with a short transition before gameplay. Keep the simulation running behind the intro and reject canvas picking through dismissal; the tap only dismisses the intro and does not count or start the countdown. Show the existing opening hand hint after the intro, and retain first-accepted-launch countdown timing. Remove the old caption's camera header reservation. Intro animation uses the paused renderer clock and respects reduced motion. See `analysis/intro-screen.md`.

Warning audio (2026-10-30): the user rejected the initial bright two-note cue. `warning-pulse.mp3` is now an original low double-buzzer inspired by the supplied `OnWarning.wav`; no reference samples are reused. Two persistent one-shot voices, gain 0.22; duration 0.46 s. Request it at each red-vignette crest after interaction, using the shared active-session pulse clock (1.1 s normal, 0.3 s alert). No audible startup playback. Stop only the warning pool below 95% fullness or on game end; host pause/mute cancels it through the existing audio layer. Keep the independent BGM and result sounds intact. Asset generation: `scripts/prepare-warning.mjs`.

Full-entry failure (user manually approved 2026-10-30): the first incoming head or tail segment blocked by physical conveyor capacity immediately latches overload and stops the simulation, regardless of other arrows still moving or pending cannon shots. Cannons may free room before that point; there is no post-jam rescue window. Keep the existing fail SFX and 0.6-second store/endcard transition. The separate unmatched settled-belt rule is unchanged. See `analysis/immediate-entry-failure.md`.

Hand tutorial (user correction 2026-10-30): preserve the immediate opening hint. After an arrow press, dismiss it and wait 3.5 active seconds of inactivity before showing another hint. Further arrow presses restart that wait, including blocked/repeated presses. Do not restore the former 0.15-second overload guidance delay. Waiting for every idle hint is no longer a strategy that clears the 60-arrow board within 60 seconds.

Use ordinary source-controlled TypeScript/JSON settings for gameplay tuning, camera/layout values, store links and audio levels. Import assets through the normal Vite manifest. This project has no external configuration-editor integration, browser-global override API, editable payload slots or generated configuration guide. Do not implement GAME_CONFIG; that contract belongs to another project.

### GoogleAds Exit API Requirements
GoogleAds (`gg`) builds must include Google's official Exit API script inside the HTML `<head>`:

```html
<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>
```

Do not reference Google's implementation URL directly:

`https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi-impl.js`

Google's validator can reject that implementation URL with `URL_FETCH_NOT_ALLOWED`. The only Google Exit API URL that should appear in generated `gg` HTML is the official `exitapi.js` script URL above.

CTA code for Google must call `ExitApi.exit()` from the click/tap handler. For the Google adapter, route `triggerCTA()` directly to `ExitApi.exit()` and guard it with `typeof ExitApi !== 'undefined' && typeof ExitApi.exit === 'function'`. A standard HTML CTA may use `onclick="ExitApi.exit()"`, but DOM button handlers should call the same API from their click callback. If Google validation reports the `ExitApi.exit()` call is missing, inspect the built `gg` HTML and bundle text, not only source TypeScript, and confirm the literal `ExitApi.exit()` call survived minification/build output.

## Analytics — SDK Priority
```
ALPlayableAnalytics.trackEvent(e)  → Applovin (al)
playableSDK.reportEvent(e)        → (runtime fallback if SDK present)
console.log('[Analytics]', e)      → All other networks
```
Events (AppLovin playable analytics, each sent once): `LOADING` · `LOADED` · `DISPLAYED` · `CHALLENGE_STARTED` · `CHALLENGE_PASS_25` · `CHALLENGE_PASS_50` · `CHALLENGE_PASS_75` (share of all blocks cleared) · `CHALLENGE_SOLVED` (board clear) · `CHALLENGE_FAILED` (belt overload only, never timer expiry or technical failure) · `ENDCARD_SHOWN` · `CTA_CLICKED`. `CHALLENGE_RETRY` needs a retry feature, which the playable does not have.

## Game Lifecycle (all networks)
`main.ts` exposes the expected lifecycle surface on `window`; actual readiness and event dispatch still require validation in each selected host.
Stubs only set if the SDK hasn't already provided its own (`typeof` guard).
```
gameReady()  → stub in main.ts; Mintegral also gets onload body attr from build
gameStart()  → notifyGameStart() in session first accepted launch
gameEnd()    → notifyGameEnd()  in session ending
gameClose()  → notifyGameClose() in endcard redirectToStore(), before triggerCTA()
```

### Pause / Resume / Mute (bindLifecycle in networks.ts)
| Network | Mechanism |
|---|---|
| Unity | `luna:mute` / `luna:unmute` / `luna:pause` / `luna:resume` events; also shared MRAID exposure/viewability when `mraid.js` is present |
| Mintegral | `window.message` → `onPause` / `onResume` |
| Vungle | `ad-event-pause` / `ad-event-resume` events |
| Applovin / Ironsource / Unity | MRAID 3.0 `exposureChange`, MRAID 2.0 fallback `viewableChange` / `isViewable`, and `audioVolumeChange` (gated in `initMraid`) |
| GoogleAds / Facebook / Moloco | Application document.visibilitychange handling; add host signals only if documented |

### MRAID 3.0 Requirements & Best Practices
MRAID networks are **Applovin (`al`)**, **Ironsource (`is`)**, **Unity (`un`)**. Each selected MRAID target requests `<script src="mraid.js"></script>` early in the generated HTML. Use Luna hooks only in an actual Luna host; the ordinary Unity Three.js build uses the selected MRAID adapter.

Creative requirements from the MRAID 3.0 spec and Best Practices Guide:

- Request `mraid.js` as early as possible, exactly once, either with `<script src="mraid.js"></script>` or DOM insertion. Do not rely on the container to inject it automatically.

- Wait for both DOM readiness and MRAID readiness before starting rich media behavior. Use `document.readyState` / `DOMContentLoaded` or `load` for the DOM side.

- Use `mraid.getState()` together with `mraid.addEventListener('ready', ...)` so the creative still starts when the container fires `ready` before the listener attaches.

- Guard access to `mraid` and MRAID methods with `typeof` checks. Treat missing optional methods as unsupported and fall back gracefully.

- Use `mraid.open(url)` for MRAID clickthroughs. Avoid `<a href>`, `location.href` / `assign` / `replace`, and unguarded `window.open`.

- Include `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">` or an equivalent mobile viewport tag.

- Do not assume nested iframes can access native MRAID. If nested iframe access is required, the outer frame must provide its own bridge.

- Use `exposureChange` as the MRAID 3.0 viewability signal, then degrade to `viewableChange` / `isViewable()` for MRAID 2.0 compatibility.

- Listen for `audioVolumeChange`; `null` is valid and must be ignored. Only apply volume math when the value is numeric.

- Listen for `error`; if the ad cannot run or assets fail, gracefully degrade or call `mraid.unload()` instead of showing a broken/blank ad.

- Call `setResizeProperties()` before `resize()`. Do not use `resize()` for full-screen takeovers; use `expand()` for that case.

- Avoid resizing or expanding interstitials. Check placement with `getPlacementType()` when one creative can serve inline and interstitial placements.

- Avoid `useCustomClose()` and custom close indicators in MRAID 3.0. The host provides the close control.

- Avoid two-part expandable ads (`expand(url)`); use self-contained one-part expandables.

- Call `supports()` before optional/native features such as `storePicture`, `createCalendarEvent`, `getLocation`, VPAID, SMS/tel, or inline video behavior.

- Use `playVideo()` for native video playback cases instead of `mraid.open(videoUrl)`. Use HTML5 `<video>` for inline playback when supported.

Implementation requirements for `networks.ts` / `networks.js`:

- Export `initMraid(timeoutMs = 2000, detectTimeoutMs = 500)` and call it at module load.

- If `window.mraid` is missing at module load, poll briefly (`detectTimeoutMs`, default 500 ms) for late container injection before resolving as no-MRAID.

- If MRAID exists and `mraid.getState() === 'loading'`, wait for `mraid.addEventListener('ready', ...)`; self-resolve after `timeoutMs` (default 2000 ms) so startup never hangs.

- `main` / boot must `await initMraid()` before constructing the renderer/game.

- On setup, seed cached visibility from `mraid.isViewable()` when available.

- Register MRAID callbacks once, before the game is ready:
  - `mraid.addEventListener('error', (message, action) => ...)` — log or gracefully handle failed/unsupported MRAID calls.
  - `mraid.addEventListener('stateChange', state => ...)` — required when using state-changing MRAID behavior such as `close`, `expand`, or `resize`.
  - `mraid.addEventListener('exposureChange', exposedPercentage => ...)` — MRAID 3.0 primary viewability. Pause when `exposedPercentage <= 0`; resume when positive.
  - `mraid.addEventListener('viewableChange', viewable => ...)` — MRAID 2.0 compatibility fallback.
  - `mraid.addEventListener('audioVolumeChange', pct => ...)` — only apply `pct / 100` when `typeof pct === 'number'`.

- In `bindLifecycle(gameServices)`, apply cached hidden/non-exposed MRAID state immediately once game services exist.

- If the creative renders its own close control, wire that control to a guarded `mraid.close()` helper and call `notifyGameClose()` before closing.

## Build
Vite outputs IIFE format (`format: 'iife'`, `modulePreload: false`).
Build script safely finalizes classic scripts without module/crossorigin attributes for the target templates; do not generalize every host as rejecting every ES module.

Every built HTML file must include `<meta name="network" content="<networkname>">` in `<head>`, where `<networkname>` is the lowercase value from the `Network` column for that output. This tag is required for internal tool parsing.

MRAID networks (`al`, `is`, `un`) inject exactly one `<script src="mraid.js"></script>` request.
Google (`gg`) injects Google's official hosted `<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>` in `<head>`. Never inject or preserve remote Google Exit API implementation URLs; the generated `gg` HTML must not contain `https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi-impl.js`.
If built output contains `console.error` from Three or bundled node modules, prefer dropping it at bundle time instead of editing library source. Add this option to the shared Vite config, usually `vite.shared.js`:

```js
export default {
  esbuild: {
    pure: ['console.error'],
  },
};
```

Keep project-authored error handling meaningful: use visible fallback UI, `console.warn`, or guarded debug logging where needed.

| Network | Tag | Injected | Zipped | Included |
|---|---|---|---|---|
| Applovin | al | `mraid.js` | — | ✓ |
| Google | gg | `exitapi.js` | ✓ | ✓ |
| Ironsource | is | `mraid.js` | — | ✓ |
| Mintegral | mtg | `onload="gameReady()"` | ✓ | ✓ |
| Facebook | fb | — | — | ✓ |
| Unity | un | `mraid.js` | — | ✓ |
| Vungle | vu | `window.__VUNGLE__=true` | ✓ | ✓ |
| Moloco | mo | — | — | ✓ |


Networks marked **Zipped** ingest zipped creatives — [scripts/build-all.mjs](scripts/build-all.mjs) writes a `.zip` containing the HTML (one zip per variant, containing just that HTML at the root named index.html). Toggled per-network via `zip: true` in the `NETWORKS` array.

Networks marked **Included** are built by default. Networks not marked are prepared for but not built. Toggle per-network via `included: true` in the `NETWORKS` array.

Output is grouped by **iteration length** (e.g. `2words/`, `4words/`, `full/`), with all per-network HTML or ZIP variants for that iteration sitting together inside the folder:

`dist/<length>/<3lc>_<creative-type>_<vendor>_<concept-name>_<sub-concept-name>_<gameplay>_<ugc>_<seasonal>_<language>_<length>_<size>_<network>`

Example layout:
```
dist/
  2words/
      ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_al.html
      ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_gg.zip
      ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_is.html
    …one HTML or ZIP per network…
  4words/
  full/
```

| Field | Description | Example |
|---|---|---|
| 3LC | 3-letter project code | `cos` (CoinSort), `ws` (Wordscapes), `wss` (Wordscape Solitaire), `pp` (Profile Perfect) |
| Creative Type | Format identifier; default to `mip` | `mip`, `sip` |
| Vendor | Studio / vendor code | `grhpl` |
| Concept Name | Creative concept | `dirtycoins`, `wbinspired`, `burglar` |
| Sub-Concept Name | Theme or variant | `white`, `black`, `default` |
| Gameplay | Gameplay style | `real`, `cartoon` |
| UGC | UGC presence | `na`, `ugc`, `nougc` |
| Seasonal | Seasonal tie-in | `noseason`, `xmas` |
| Language | Locale code | `en` |
| Length | Run length before endcard | `2clicks`, `2words`, `60seconds`, `full` |
| Size | Region / size code; default to `na` | `na` |
| Network | Abbreviated network tag (last segment) | `al`, `gg`, `is`, `mtg`, `fb`, `un`, `vu`, `mo` |

All filename segments must be lowercase. Convert project/client labels such as `COS`, `MIP`, `GRHPL`, `NoUGC`, `NoSeason`, `EN`, or `2Words` to lowercase in output filenames.

Legacy naming examples (do not ship these values):
- `ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_al.html`  (2 words, white theme)
- `ws_mip_grhpl_wbinspired_black_real_na_noseason_en_full_na_fb.html`    (full, black theme)
- `cos_mip_grhpl_dirtycoins_default_real_na_noseason_en_2clicks_na_gg.html` (2 clicks, default theme)

Naming fields are defined in [scripts/build-all.mjs](scripts/build-all.mjs) — update them when porting.

## Asset Loading

- **Critical** (assets.ts boot manifest): first-frame assets, target < 200 KB

- **Deferred**: audio, overlays, secondary UI — loads during intro

- Gameplay start waits on a deferred-ready flag set when the secondary manifest finishes loading

## Source-controlled defaults and assets

- Keep actual project values in src/projectDefaults.json, shared by runtime and build tooling where needed; use typed imports and normal source edits.
- Keep one countdown duration value, initially 60 seconds. No compatibility alias, inactive-limit sentinel or unused configuration switches are required.
- Import selected assets directly through assets.ts and Vite. Embed models, buffers, images, fonts and audio in the final package; preserve their source provenance.
- Audio volume/loop and UI dimensions/anchors are normal authored settings consumed by their services. Do not add an asset override/hydration system.
- Network names, filenames and byte ceilings belong to the build script's eight-target table. No additional network scaffolding.

## UI layer map (world geometry uses depth testing)
Define DOM z-index values as named constants in [constants.ts](src/constants.ts) — never use magic numbers in scene code.

| Layer | Depth |
|---|---|
| Background | 0 |
| Full-belt warning backdrop | 0 |
| Canvas world (transparent) | 1 |
| HUD | 10 |
| Tutorial | 15 |
| HUD logo | 17 |
| Dim overlay | 20 |
| Endcard art | 21 |
| EndCard input | 25 |

## Ship Checklist

- [ ] < 5 MB, all WebP

- [ ] FPS ≥ 55 under CPU throttle

- [ ] Portrait + landscape pass

- [ ] MRAID ready before gameplay

- [ ] No audible autoplay; default pre-gesture mute and configured/host mute respected

- [ ] Deliberate CTA routes once in selected host and standalone fallback

- [ ] Google (`gg`) CTA path calls `ExitApi.exit()` and built `gg` output contains the literal call

- [ ] No `console.error`

- [ ] No `type="module"` or `crossorigin` on `<script>` in output HTML

- [ ] Google (`gg`) HTML includes the official hosted `exitapi.js` script in `<head>` and never references remote `exitapi-impl.js`

- [ ] Each built HTML has `<meta name="network" content="<networkname>">` in `<head>` using the lowercase `Network` value

- [ ] Lifecycle: gameReady / gameStart / gameEnd / gameClose detected by all network preview tools








## Three/iOS-specific release checks

- [ ] Pure core contains no renderer/DOM/SDK dependencies.
- [ ] Source behavior deviations are recorded; no inherited fixed-slot rules or full-game features silently replace the reference.
- [ ] One renderer; correct DPR sizing/picking; camera and HUD survive rotation during transit.
- [ ] Core tests cover obstruction, concurrent launches, entry congestion, group spacing, threshold admission, target matching, ammo replacement and timer/clear endings.
- [ ] Host tests cover already-ready/late/missing SDK, hidden start, viewability/exposure disagreement, null volume, pause/resume and exactly-once completion/CTA.
- [ ] IOS_SFX_GUIDELINES.md tests cover persistent voices, quick-release recovery, prime promotion, overlap, stale callbacks, selected event ownership, cancellation and hidden delayed cues.
- [ ] No unrequested audio diagnostics; automated sessions muted without modifying production audio.
- [ ] Four viewports checked: 390×844, 844×390, 768×1024, 360×640; no claiming runtime parity from source inspection.
- [ ] Final raw bytes and target ZIP sizes audited; no remaining relative model/texture/decoder paths.
- [ ] Audio-verification record distinguishes automated/media evidence from physical iPhone/iPad/Android and target-host audibility; unavailable checks marked unverified.

## Three-specific pitfalls

|Issue|Required handling|
|---|---|
|Blank boot after script hoisting|Gate DOM readiness; create playable root/canvas if absent; initialize host/settings before input.|
|Font load delays|Bound font readiness (initial policy 1.5 s) and retain a measured fallback; do not hang boot.|
|DPR double scaling|setPixelRatio once, setSize with CSS dimensions; use canvas rect for picking.|
|Hidden gameplay/audio continues|Central lifecycle state pauses core/render effects and all detached media pools; invalidate pending requests.|
|A late callback stops new SFX|Per-voice generations and same-element promotion; guide's native-boundary recovery.|
|Touch gesture canceled by pointer cleanup|One selected input family and identifier-matched release/cancel.|
|Asset path survives singlefile build|Audit actual output; embed GLB buffers/textures/fonts/audio, including resources referenced by models.|
|Frame hitch or growing memory|Profile actual draws/allocations; share geometry/materials, pool transient effects and dispose owned resources.|
|Duplicate CTA|One selected adapter and one intentional click handler; stub destinations during tests.|
|Unsupported graphics/context loss|Graceful fallback/endcard, retained state and no second renderer; no automatic store redirect.|

## Target submission checks

Run the selected ironSource/LevelPlay Playable Workshop Runtime Analysis where available and all other target preview/submission checks. Mark unavailable host checks unverified; static scans are not certification.

Moloco: single HTML below the selected cap, both orientations, no XMLHttpRequest anywhere in output, no mraid.js, no `location` JavaScript redirect, and guarded no-argument FbPlayableAd.onCTAClick() from the CTA and the game-end redirect. Do not use clickTag as its primary route.

Original-reference browser runtime remains unverified. The implemented Three playable now has local Chromium evidence in analysis/delivery-report.md. Physical devices and official host validators remain unverified; the SwiftShader performance target did not pass. Do not turn missing or failing evidence into a pass.
