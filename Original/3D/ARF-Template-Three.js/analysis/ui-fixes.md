# UI and arrow-highlight corrections — 2026-10-22

The fixes address [the UI audit](ui-audit.md) and the subsequent arrow-highlight review. The original reference and colleague's project were not modified.

## Changes

- **Confirmed source-backed correction:** HUD and endcard use the reference's 720×1280 fixed-height policy. Each HUD widget retains its distinct margins. Removed the endcard's extra 80-unit downward offset and separate 800-unit fitting rule.
- **Confirmed source-backed correction:** camera retains orthographic half-height 21 instead of expanding around scene bounds with an added framing margin. Geometry and gameplay pacing remain unchanged.
- **Confirmed source-backed correction:** all seven UI images use their serialized sprite rectangles. Play Now no longer shrinks inside `object-fit:contain`; meter fill no longer includes padding inside an already-sized fill region.
- **Confirmed source-backed correction:** meter border, fill, percentage, cannon ammo/reserves and tutorial hand use original world-plane dimensions, offsets and both projected axes. Font 128, scale .01/.008 and black outline replace border-relative text sizing, world-Y sizing and arbitrary font clamps. Hand idle/tap offsets and parent X rotation are composed before projection.
- **Confirmed source-backed correction:** arrow `Inner` is the arrow color, not white. Only the separate `White` layer uses the white material and is enabled on open arrows. Both layers' offsets are composed relative to the head mesh rather than reversing their z positions. Existing geometry, layer scales and directional rotation are retained.

Highlight evidence: `analysis/extracted/modules/GameManager.ts.js`, `initializeArrows` (color all mesh nodes except White, then assign whiteMat to the nested White renderer), `updateArrowHighlight` (activate White on valid arrows); `analysis/assets/serialized/9e896dbe-96ba-4321-b8c8-f55cd9da5258.json`, objects 3/4/6 and nested property overrides. A regression composes the actual source prefab transforms and compares rendered matrices in all four directions.

## Verification

- 42 unit/regression tests passed, including source-prefab matrix and world-plane projection tests.
- TypeScript and single-file production builds passed. All eight network variants regenerated after the final source change. Preview: 2,522,572 bytes.
- Native mouse and emulated touch checks passed: blocked nudge/return, accepted launch, cannon ammo 26→20, circulating unmatched blocks, rotation, context restoration and input ownership. Capture coordinates were updated for the corrected camera.
- Session checks passed: idle hint, pause, timeout endcard, four viewport bounds, three CTA surfaces and keyboard CTA.
- All eight packaged mocked-host browser checks passed: boot, media requests, orientation, CTA routing and pause. This is local validation, not official network acceptance or physical audio verification.
- Five viewport checks compare measured logo size/anchor, meter width, projected cannon-label size, endcard icon size/center and endcard bounds against reference-derived values. A 75% fullness fixture checks fill width. Eleven captures, no page errors or outbound requests.
- Evidence: `analysis/evidence/ui-fixes-browser.json`, `analysis/screenshots/ui-fixes/`, `analysis/evidence/network-builds.json`, and current session/delivery browser evidence. Original `ui-audit` captures remain as before evidence.

At 390×844, corrected logo width is approximately 111.77px and endcard icon width 263.75px. At 844×390 these are 51.65px and 121.875px. These match the inspected resolution policy; they are not original-runtime screenshot measurements.

## Limits

Original runtime pixel parity, lighting/material equivalence, physical-device rendering/audio and official ad-host acceptance remain unverified. The earlier software-renderer performance limitation is not resolved by this visual correction. No new dependencies, engine, network, gameplay feature or tuning changes were added.
