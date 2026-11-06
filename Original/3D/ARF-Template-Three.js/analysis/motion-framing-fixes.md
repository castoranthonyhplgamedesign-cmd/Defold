# Chevron, lighting, transfer and tall-screen corrections

## Changes and evidence

- **Confirmed bug:** chevrons advanced along increasing conveyor progress but their textured arrowheads faced the opposite tangent. Removed the extra 180° rotation in `src/render/conveyorGuides.ts`. Browser fixture compares each rendered quad's tip direction against its travel tangent; all dot products exceed .999.
- **Authored visual adjustment:** raised white ambient intensity from .8 to 1.6 and directional intensity to 2.5, retaining the reference-derived light direction. This is brighter Three.js calibration; exact Cocos lighting parity remains **Unknown**.
- **Confirmed bug:** reference-board arrow 165, segment 6, jumped **7.9912 world units in one 1/120-second step** when the previous insertion rule admitted it from far inside the board. Tail blocks now approach continuously, enter only near the track, and use a bounded approach when an entry is stalled. The timeout no longer teleports the remaining tail. Short head launches have a .2-second minimum after the existing 1.5× multiplier and use smoothstep interpolation.
- **Intentional gameplay adaptation supporting continuous transfers:** a block becomes shootable once it joins the conveyor, independently of its remaining tail. If it is shot first, its logical route continues until following blocks finish entering. This prevents long transfers from missing the first cannon pass or becoming stranded. Belt speed remains 15 units/s; projectile/shrink time remains .1 seconds, with no added cooldown. Blocked playback remains 2×.
- **Authored responsiveness adjustment:** retain orthographic half-height 21 as the baseline, expanding only when needed to fit world bounds with `min(24px,6% of viewport width)` on each side. Camera rotation and target remain fixed; picking, labels and meter use the resulting camera. No independent cannon mesh scaling.

## Validation

44 unit/regression tests passed. New tests exercise every initially free reference-board arrow, bound every segment step below .3 world units, require completed tails, and cover a head removed during a long transfer. The measured worst step across those starting-board launches after the fix is **.1882 units**. This is bounded coverage, not a proof for every possible future board state.

Seven viewport captures and geometry-direction checks passed, with no page errors or outbound requests. Captures are in `analysis/screenshots/motion-framing/`; measurements are in `analysis/evidence/motion-framing-browser.json`.

| Viewport | Visible composition left/right pixel bounds |
|---|---|
| 720×1280 | 64–655 |
| 390×844 | 23–366 |
| 844×390 | 331–511 |
| 768×1024 | 147–620 |
| 360×640 | 32–327 |
| 320×932 | 19–300 |
| 430×932 | 24–405 |

Bounds are measured from pixels differing from the background, including cannons; antialiasing threshold allows approximately 1–3px tolerance. Endcard elements also fit all seven viewports. Native-input browser fixtures map their original samples through the live projected cannon-label separation, so camera changes cannot silently invalidate their tap coordinates.

Preview and all eight network packages rebuilt. Preview: **2,538,020 bytes**. Current gameplay/session/delivery evidence records browser outcomes; official hosts and physical devices remain unverified. Prior software-renderer performance limitations are not claimed resolved.

Final browser results: native mouse/touch gameplay, session hint/pause/endcard/CTA checks, and all eight packaged mocked-host boot/media/resize/CTA/pause checks passed.
