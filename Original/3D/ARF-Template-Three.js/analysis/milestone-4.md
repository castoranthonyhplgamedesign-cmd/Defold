# Milestone 4 — HUD, hints, session and endcard

Implemented 2026-10-22. Stop for developer review before audio (Stage 5). Network delivery remains a later stage. Successful launch playback stays 1.5x, blocked feedback 2x, conveyor speed 24 units/s.

## Delivered

**Confirmed implementation:** conveyor percentage/fill and admission-warning flash; front ammo and reserve queue counts; valid-head highlights; initial hand tutorial and five-second idle hints; 60-second countdown starting only on an accepted launch; timeout/clear endcard; frozen gameplay and cancelled pending cannon effects at completion. No visible timer label, automatic store opening, retry, extra lose screen or fullscreen CTA.

The source logo, Play Now button, app icon, two hand sprites and meter art are embedded lossless WebP. Lilita One is embedded. Three accessible endcard buttons and two HUD buttons share one deliberate CTA callback. Tab stays inside the endcard. The dimmer blocks background input but never redirects. Existing native tap ownership is preserved.

## Evidence and fidelity

| Claim | Status and evidence |
|---|---|
| First accepted launch starts timer, default 60; idle hint after 5 | Confirmed static: `extracted/modules/GameManager.ts.js`, constructor, touch/update/idle methods; scene `assets/serialized/05df34ae-586f-458e-a1b4-9cb0c0e05872.json` |
| No visible countdown label found | Confirmed inventory of scene labels in `evidence/ui-layout.json`; absence in runtime remains Unknown. Internal countdown retained. |
| Fullness rejects at 90%; red/white 0.25-second phases repeated twice | Confirmed static: `extracted/modules/Path.ts.js`, meter/admission warning. No conveyor-loss ending added. |
| Hand starts after .8 seconds, .2/.1/.15/.25/.4 second cycle, squash .05/.08/.12 | Confirmed: `extracted/modules/HandAnim.ts.js`, `startTapAnimation`. DOM projection, tip alignment and responsive display size are Inferred port choices. |
| Leftmost valid matching-color idle candidate; second segment target | Confirmed static: `GameManager.ts.js`, idle handling around lines 410–423. Empty candidates safely hide in this port. |
| White valid-head layer | Confirmed static: `GameManager.ts.js`, `updateArrowHighlight`; Head prefab `assets/serialized/9e896dbe-96ba-4321-b8c8-f55cd9da5258.json`, nested White overrides, and `7e0d00cd-e958-4d76-b418-a3e8130166a2@c09bd.json`. Composed transform is Inferred port mapping; screenshot parity with reference runtime remains Unknown. |
| CTA pulse 1→1.10000002384 over 2 seconds, then reverse | Confirmed decoded CCON: `assets/native/612b568c-6e7e-4b82-a194-d0cb5b2656f1.ccon`; `evidence/animation-pulsate.json` wrapMode 22; engine `extracted/bundle/cocos-js/cc.js.pretty.js`, RealCurve deserializer and weighted interpolation around lines 1012–1035, PingPong enum around 8036. Weighted cubic controls saved in `evidence/milestone-4-ui-assets.json`. Full cycle 4 seconds. |
| Endcard .4-second quadOut; overlay alpha 200/255 | Confirmed static: GameManager activation and scene UI nodes 70/78. |
| Endcard/HUD sizes and positions | Confirmed source values: `evidence/ui-layout.json`, scene nodes 45,71,79,136,137. Responsive fit and minimum landscape HUD scale are authored adaptations; not measured reference layout. |
| Store destinations | Confirmed scene overrides: Arrow Flow Android `com.zobbogames.arrow.shooter`, Apple app `6760908162`. Current store availability not checked. |

Source files and reference HTML remain untouched. Source pulse evaluation reads numeric data only; no reference scripts are executed by the asset preparer.

## Architecture and boundaries

- `src/core/session.ts`: renderer-independent countdown, accepted-input start, idle hints, terminal reason and warning clock. Hidden/context-lost time pauses through the existing simulation gate. Terminal presentation time advances while gameplay stays frozen.
- `src/ui/overlay.ts`, `motion.ts`: DOM presentation driven by the existing scene frame loop, projected meter/hand, original weighted pulse and hand timing. No timer/tween library or second frame loop.
- `src/ui/store.ts`: standalone preview callback only. Known MRAID presence disables this fallback. Eight selected adapters, host lifecycle reporting and SDK readiness are still unimplemented; this is not an upload-ready creative.
- `scripts/prepare-ui-assets.mjs`: seven WebP exports (165,872 bytes total), title crop from its sprite frame, font copy and asserted CCON numeric decoding. Uses the already installed Sharp in the sibling Bubble Cash checkout; that offline preparation dependency is not shipped.
- Existing `render/board.ts` and `render/cannons.ts`: highlights and reserve labels. Existing scene API remains usable by earlier isolated gameplay fixtures without a Session.

## Validation

**Confirmed automated:** 28 core tests pass, including first-success countdown, blocked tap, hidden pause, idle hint, timeout freeze, actual-clear terminal reason, empty candidate handling, full-meter warning and decoded pulse/hand phases. Typecheck and single-file build pass.

Final preview HTML: **2,047,071 bytes** (2.05 MB decimal), including all selected geometry, UI and font data. This remains a standalone preview, not an eight-network delivery package.

**Confirmed browser:** four viewport captures (390x844, 844x390, 768x1024, 360x640), one WebGL canvas, initial 47 draw calls. Desktop pointer and emulated touch regression checks pass; green ammo falls 26→20, unmatched blocks circulate, resize/context restoration survive. One-ammo fixture proves queue advance. Session fixture covers hint/pause/endcard/CTA, including keyboard activation, no background redirect and no fallback through a loading MRAID host.

Evidence: `evidence/milestone-4-browser.json`, `milestone-4-gameplay-browser.json`, `milestone-4-queue-browser.json`, `milestone-4-session-browser.json`; captures under `screenshots/milestone-4/`. Browser requests are blocked; store destinations are stubbed. Session browser fixture shortens remaining time to .2 seconds after start/hint/pause checks; the pure core test exercises the full 60-second duration. The forced clear test verifies logic, not a solved full-board playthrough.

**Unknown/unverified:** physical phone usability/performance, original playable runtime visual parity, real SDK/store behavior and real-device audio. No audio is shipped yet. Added highlighting costs seven draws; no new device performance claim is made. Original level interpretation remains the previously documented candidate layout, not a runtime-confirmed full-game level.
