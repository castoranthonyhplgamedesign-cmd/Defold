# Reference visual corrections and normal conveyor pace

## Implemented

- Gameplay logo and Play Now removed at the user's request. Endcard title/icon/CTA remain available.
- Labels retain the reference's black outline and now also have a four-direction outline fallback, preserving readable edges after CSS projection.
- Meter fill tint follows the reference `Path.calcPercentage`: HSV hue 120→0 at full saturation/value, green at 0%, yellow at 50%, orange at 75%, red at 100%. Its extracted texture supplies shading/alpha. The fill is explicitly below the border overlay; text remains above both.
- Conveyor double chevrons use the original `111e5ae7-b6bd-44cf-bd61-943063308bd6.png`, converted losslessly to WebP. One instanced draw renders the repeated paired quads. Spacing 5, speed 1 unit/second, size .7×.6, offsets ±.25 and color #515b91 come from `Path` and the Guide prefab/material. They animate before interaction, pause with the host, and freeze on endcard. A .02 world-unit lift avoids z-fighting with the track.
- Conveyor blocks restored to **15 units/second**, the scene's `Path.segmentSpeed`, replacing the previous user-tuned 24. Launch/blocked feedback multipliers remain as previously requested.
- Cannon shots retain the reference **.1-second projectile/block-shrink**, **.05 + .1-second recoil** and **.3-second queue advance**. No artificial firing cooldown was added. Restoring belt speed also restores the rate at which matching blocks reach the detectors.
- Directional lighting now follows the source -65° X orientation. White ambient/directional intensities use the source 26000:45000 ratio, normalized to .8:1.3846 for Three.js. This is an **inferred visual calibration**, not a claim that Cocos illuminance and Three intensity are equivalent. No unsupported shadow/postprocessing effect was added.

## Evidence

**Confirmed static reference:** `analysis/extracted/modules/Path.ts.js`, `calcPercentage`, `instantiateGuideArrows`/`updateGuideArrows`, property defaults; scene `05df34ae-586f-458e-a1b4-9cb0c0e05872.json` object 229 (segmentSpeed 15, guideArrowSpacing 5), node 228/main light and scene globals; Guide prefab `ceaedc83-4edf-4fe2-a242-8dab3ea41ca8.json`; Guide material `cee6149c-7d35-41fb-b686-3e689475510d.json`; `Cannon.ts.js`, `destroyBlock`.

**Current browser evidence:** `analysis/evidence/ui-polish-browser.json` and `analysis/screenshots/ui-polish/`. Five viewport layouts, 75% orange fill fixture, border-over-fill stacking, stroke presence, absent gameplay CTAs, moving idle guides and paused-guide stability checked. Original-runtime screenshots were not captured; this remains a source-backed reconstruction.

42 unit tests and TypeScript passed. Preview and eight network packages rebuilt; preview is 2,537,506 bytes. The gameplay and packaged-browser reports carry the latest executable results. Packaged CTA tests now exercise the real endcard button handler directly; session tests separately cover its presentation. This avoids retaining a gameplay CTA solely for the test.

Physical-device appearance, official ad-host acceptance and exact lighting parity remain unverified. The previously recorded software-renderer performance limit is not resolved by this pass.
