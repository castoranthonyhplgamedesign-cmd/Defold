# Arrow Flow delivery report — 2026-10-22

The planned Three.js + TypeScript + Vite implementation is ready for developer review. User authorization now covers completion without intermediate milestone stops. Core mechanics and the previously reviewed pacing remain unchanged: successful launch/tail playback 1.5x, blocked feedback 2x, conveyor 24 units/s.

## Delivered

**Confirmed implementation:** interactive 79-arrow candidate layout, conveyor admission/spacing/transit, four cannon lanes with ammo and queues, projected HUD, tutorial/hints, countdown, timeout/clear endcard, deliberate CTA, native input ownership, persistent SFX, document/host/context lifecycle and unsupported-WebGL fallback.

Exactly eight selected network variants are packaged. No extra network, GAME_CONFIG, level editor, orbit control, booster, economy, invented congestion loss, automatic redirect or unsolicited audio diagnostics were added. Original reference and colleague checkout remain preserved.

## Review entry points

- Standalone preview: `../dist/index.html` — **2,523,475 bytes**.
- Eight HTML/ZIP packages: `../dist/60seconds/`.
- Build table: [network-builds.json](evidence/network-builds.json), including each file, raw bytes, ZIP bytes and allowed bridge.
- [Audio verification](audio-verification.md) and [network integration notes](network-integration.md).
- Screenshots: `screenshots/delivery/` and latest four-viewport/endcard checks in `screenshots/milestone-4/`.
- [Congestion→timeout recording](recordings/congestion-timeout.webm), [small clear-fixture recording](recordings/clear-fixture.webm).

Each raw HTML is approximately **2.52 MB**, below the common 4 MB guard. Google/Mintegral/Vungle ZIPs are approximately **1.05 MB**, each containing only root `index.html`. These are review/validation packages, not a claim of accepted campaigns. Vungle expects its documented parent wrapper; ironSource Exchange raw-tag submission may need placement-specific packaging.

## Size breakdown

Exact data-URI accounting in [size-breakdown.json](evidence/size-breakdown.json):

| Category | Original bytes | Embedded URI bytes |
|---|---:|---:|
| Selected packed geometry | 933,388 | 1,244,557 |
| Seven lossless WebP UI images | 165,872 | 221,333 |
| Four supplied WAV effects | 351,402 | 468,628 |
| Lilita One font | 26,828 | 35,793 |

Remaining HTML bytes combine minified Three.js/game logic, scene data, markup and CSS. A separate exact Three-only cost was not measured. Keeping original audio avoids claiming an unauditioned compression change is faithful. No heavyweight renderer/UI/audio dependency was added; build-time ZIP generation reuses installed fflate, now explicitly pinned.

## Validation and evidence

**Confirmed automated:** 40 tests pass across geometry/data, blocked feedback, conveyor/transit, cannon reservations/ammo/queues, session outcomes, audio races and network contracts. Typecheck and standalone/eight-profile builds pass. Package audit checks classic-script parsing, exact bridges, Google literal ExitApi call, Moloco exclusions, byte ceilings and ZIP round-trips.

**Confirmed browser:** packaged startup, 32 persistent audio voices, no startup playback, real audible-mode media events under muted output, native successful launch and ammo 26→20, portrait/landscape resize, one selected CTA route per intentional click, close-before-route and all-voice pause pass for all eight artifacts. See [delivery-browser.json](evidence/delivery-browser.json). This uses controlled SDKs and intercepted bridge requests, not real ad containers.

Mouse and emulated touch regressions pass: blocked contact/return, successful launch, multiple groups, matching shots, resize/context restoration, release-only action, drag/outside rejection, multi-touch identifiers, compatibility pointer-capture loss, outside-target ownership and cleanup. See `evidence/milestone-4-gameplay-browser.json`.

HUD/endcard checks pass at 390x844, 844x390, 768x1024 and 360x640. Session fixture verifies first-success countdown, five-second hint, hidden pause, terminal input lock, background non-CTA, keyboard activation and loading-host fallback prevention. Low-ammo fixture separately verifies cannon replacement. Unsupported WebGL shows a deliberate app CTA without auto-navigation.

**Confirmed runtime fixture observation:** greedy legal launches on the original candidate board reached **155 conveyor blocks / 91.96%**, then another launch returned `full`. The session continued until timeout; no fabricated lose state was added. The clear fixture retains only original arrow 141, whose six segments are destroyed by real cannon logic before clear. It does not establish that the full candidate board is solvable. Recordings accelerate simulation time in chunks; they are not real-time timing references. Exact beat/state data is in [showcase.json](evidence/showcase.json).

## Performance and remaining limits

The headless test uses **ANGLE SwiftShader software rendering**, with around 47 draw calls and 271k–273k triangles. The final isolated sample measured **5.15 FPS at 1x CPU and 4.50 FPS at 4x CPU throttle**, with about 11.2 MB reported JS heap (see [performance.json](evidence/performance.json)); the 55 FPS throttled target is **not passed**. This environment cannot establish hardware mobile performance. No device-performance success is inferred from functional test passes. The report records CPU model, renderer, sample count, frame-time distribution, heap and throttle level.

**Unknown/unverified:** physical iPhone/iPad/Android audibility and performance, Safari/WebKit (binary unavailable), real ad-WebView behavior, official validator acceptance, exact reference runtime pixel/timing parity and full-board solution. The original reference runtime remained inaccessible in the earlier analysis. Data-derived constants and authored adaptations remain labeled in prior reports.

No external publication or account upload was performed. Device/host checks and the developer's feedback are the remaining review gates; custom editor integration stays deferred.

## Reproduce

Run `npm.cmd test`, `npm.cmd run build`, then `npm.cmd run build:all` (preview build cleans dist). Browser commands are listed in README. `prepare:audio` reproduces exact copies and provenance. `scripts/size-report.mjs` refreshes URI accounting. All test fixtures and recordings stay outside shipping bundles.
