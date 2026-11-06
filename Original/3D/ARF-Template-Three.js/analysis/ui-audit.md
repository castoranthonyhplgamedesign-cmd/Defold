# Arrow Flow UI fidelity audit — 2026-10-22

Follow-up: the subsequent implementation addresses these findings; see [UI and highlight corrections](ui-fixes.md). This audit and its captures retain the pre-fix state.

What this review covers: the current Three.js UI, camera framing, tutorial hand, cannon labels, sprite sizing and endcard compared with the supplied Cocos reference's serialized scene and scripts. The correct artwork is largely present, but its sizing and placement are not faithfully reproduced. Earlier bounds/functional checks did not establish visual parity.

**Verdict: needs correction before visual sign-off.** No production code was changed in this review.

## Evidence and confidence

- **Confirmed:** current source modules rendered in Chromium at 720×1280, 390×844, 844×390, 768×1024 and 360×640, DPR 1. Gameplay and forced endcard captures at each size; additional forced 75% meter capture at 390×844. Endcard and fullness values are fixture-controlled, not natural gameplay outcomes.
- **Confirmed:** original serialized transforms, sprite frames, font settings and engine resolution policy inspected as data. Reference source was not executed.
- **Inferred:** expected CSS sizes calculated from those settings. These are reference-derived targets, not measurements of the original running playable. Host overrides and original runtime presentation remain **Unknown**.
- Browser evidence: [ui-audit-browser.json](evidence/ui-audit-browser.json). Capture tool: [ui-audit-capture.mjs](ui-audit-capture.mjs), run from project root with `node analysis/experiments/ui-audit-capture.mjs`.
- Original scene shorthand below: `assets/serialized/05df34ae-586f-458e-a1b4-9cb0c0e05872.json`, indexed by `objects[n]`. Object indices identify exact records, including components held by reference.

## Must fix

### 1. Restore consistent reference UI scaling and anchors

**Confirmed:** `src/ui/overlay.ts`, `sync`, uses `min(width/720,max(.55,height/1280))` for the HUD. The endcard instead uses `min(width/720,height/800)`. The hand uses a third rule. These cannot preserve the reference's relationships across aspect ratios.

**Confirmed:** `extracted/bundle/src/settings.json.pretty.json`, `screen.designResolution`, specifies 720×1280, policy 3. The extracted engine `cocos-js/cc.js.pretty.js`, `ResolutionPolicy` constants and `View.init`, maps 3 to **FIXED_HEIGHT**, not SHOW_ALL. No `setDesignResolutionSize`, `setResolutionPolicy`, or `orthoHeight` overrides were found in the extracted gameplay modules.

**Inferred:** applying the configured fixed-height policy gives UI scale `height/1280`. Compare non-pulsing elements below. Current columns are actual DOM measurements; targets are calculated from serialized design units.

| Viewport | Current logo width | Reference-derived logo width | Current endcard icon width | Reference-derived icon width |
|---|---:|---:|---:|---:|
| 720×1280 | 169.50 | 169.51 | 400.00 | 400.00 |
| 390×844 | 91.81 | 111.77 | 216.67 | 263.75 |
| 844×390 | 93.22 | 51.65 | 195.00 | 121.88 |
| 768×1024 | 135.61 | 135.61 | 426.67 | 320.00 |
| 360×640 | 84.75 | 84.76 | 200.00 | 200.00 |

Thus the portrait 390×844 logo/icon are about **18% smaller** than configured-policy targets; the landscape logo is about **80% larger**, and landscape icon **60% larger**. The tablet icon is **33% larger**. These differences are not one global size multiplier.

**Confirmed:** original logo widget margins are left 8.3715, bottom 11.6586 design units (node 79); CTA margins are right 18.097, bottom 8.025 (node 45). Current shared padding is `max(8,16*scale)`. At the design viewport this places the logo at x=16 instead of 8.3715 and raises its bottom edge to 16 instead of 11.6586.

Smallest correction: one faithful UI coordinate conversion with each original widget's own anchor/margins; remove the .55 floor and the separate endcard scale rule. Validate any intentional landscape adaptation separately instead of describing it as reference parity.

### 2. Rebuild the fullness meter's actual fill bounds and text scale

**Confirmed:** original fill sprite frame is a **472×56 rectangle at (20,26)** inside a 512×114 PNG (`c25ecc7a-5291-441f-be5d-8845567f2c92@f9941.json`). `scripts/prepare-ui-assets.mjs` exports the complete PNG. `.meter-fill` in `src/style.css` then compresses that complete image into a box already only 55% of the border height. Transparent padding is counted twice.

The visible fill occupies approximately `55% × 56/114 = 27%` of the outer box height, before alpha-edge details. The reference child has height `56×1.108 = 62.048` against border height 114: approximately **54.4%** before shared projection. Its left anchor is -236.153 and local y offset 4.74 (scene node 139); the progress component's total length is 472 (object 244). Current width scaling also retains the fill PNG's horizontal padding.

**Confirmed:** the border is world-plane UI: node 76 has scale .027, rotation X=-90°, content size 512×114. Current DOM border height is simply width×114/512, omitting plane foreshortening. Its text is a separate reference node at z=17.144, font 128, scale .01, outline 4 (nodes 138/242), not text sized to 80% of the border height at z=17.29.

At 720×1280, current meter width/height is **393.58×87.63px**, text CSS size **70.11px**. At the same current camera scale, source font's projected vertical basis would be approximately **33px**; this is a projection comparison, not a measured reference glyph bounding box. The current percentage is roughly twice that basis size, consistent with the oversized text in the captures.

Smallest correction: export/use the source sprite rect, retain original fill anchor and progress length, project both axes of the plane, and size/place the label independently from its original transform. Match the outline rather than substituting a blurred drop shadow. This fixes both the thin fill and oversized percentage.

### 3. Cannon numbers use the wrong projection axis

**Confirmed:** `src/render/cannons.ts`, `layout`, computes font size from a **1.1-unit world-Y displacement**, clamps it to 9–30px, then copies that size onto reserve labels.

Original ammo prefab `assets/serialized/097e4753-ec84-4b56-9ff0-7fec40869754.json`, node 2/component 6, uses font 128, scale .008, rotation X=-90° and outline 4. Reserve labels use the same font/scale/plane (scene nodes 121,125,131,135 and components 300,306,314,320). Their vertical text direction is along the rotated local Y axis, not world Y. Full parent transforms must also be preserved.

Current first cannon label is only **13.24px** at 720×1280 and **9px** at 390×844. As a baseline, 128×.008 gives 1.024 world units before parent transforms; projected along the source plane at the current design-view camera this is approximately **26.4px**, about twice the current font basis.

Smallest correction: derive each label's projected local axes and full parent transform, with original offsets and outline. Remove unrelated font clamps from the parity path. Preserve ammo and reserve counts as separate anchors. This is a readability problem as well as a fidelity mismatch.

### 4. Endcard is shifted downward even at the design viewport

**Confirmed:** `overlay.ts` adds `80*fit` to the endcard group's vertical center. Original CTA node 70 has no corresponding position offset. Its children are title y=360.479, icon y=66.055, button y=-226.073 (nodes 137,136,71). Current code otherwise flips those y values into CSS correctly.

At 720×1280, the icon center is measured at **653.95px**; source-derived center is **573.95px**. The whole group is **80px too low** at that size, independently of the responsive scale issue. At 360×640 the added offset is 40px.

Smallest correction: remove the invented group offset and the 800-unit height fit; retain authored positions, title scale 1.801, icon size 400 and button size 337.31×108.365. Compare pulse animations at the same phase when measuring button bounds.

## Should fix

### 5. Tutorial hand has different dimensions and anchoring

**Confirmed:** the reference hand is scene node 69, misleadingly named `Tunnel`, with idle/tap children 224/225. Each child's UI size is **1.7×2**, scale **2.524×2.864**, rotation X=-90°. Idle local position is [1.571,0,2.288]; tap is [1.567,0,2.217]. Thus its unprojected rectangle is **4.2908×5.728 world units**, not a square.

`GameManager.ts.js`, `restartTutorial` around lines 421–422, positions its parent at the selected arrow segment's world position. Current `overlay.ts` instead adds 1.4 world Y, draws a 180×180 design-pixel image, and anchors by assumed PNG coordinates 54/256 and 20/256. This loses both the source plane's aspect and distinct idle/tap offsets. Measured current size: 180px square at design resolution, 97.5px square at 390×844.

Smallest correction: preserve source sprite trim/pivot and full child transforms, projected through the board camera. Retain the existing hint-selection rules; no new tutorial system is needed. Exact original rendered fingertip placement remains **Unknown** until runtime parity is checked.

### 6. Play button visible artwork is smaller than its declared box

**Confirmed:** source sprite rect is **498×162 at (7,6)** inside the 512×174 image (`7ee7c69f-f28a-4986-8d93-f51a03f19e78@f9941.json`). Current export retains the complete image and `.art-button img` uses `object-fit:contain` inside a differently proportioned authored box.

At the HUD's unpulsed design box, 261.524×84.018, the image is height-constrained; the source rect occupies about **240.5×78.2px**, smaller than the declared button. The hit area and visible artwork differ. The title already uses a cropped export, so the two assets are treated inconsistently.

Smallest correction: reproduce sprite-frame cropping and sizing consistently. Audit icon and hand sprite frames too; do not blindly crop every image without retaining pivot/offset semantics.

### 7. Automatic scene fitting changes every world element's screen size

**Confirmed:** source camera component 227 has orthographic half-height 21. `src/render/scene.ts` expands this using the whole scene's bounding box and `framingMargin`, then fits width on narrow screens. This is an adaptation, not a recovered reference rule.

**Inferred from measured projection:** the current design-view meter width 393.58 for 13.824 world units implies camera half-height about **22.48**, versus 21 in the serialized camera. The source-camera baseline width would be **421.30px**. Thus the board, conveyor and cannons are roughly **6.6% smaller** at this size before any geometry differences. Landscape contains a narrow central board with large empty side regions, as shown in the current capture; whether that matches the original runtime remains **Unknown**.

Smallest correction: establish reference camera/framing first, then calibrate world-space labels and hand. Do not compensate by independently scaling every mesh. Verify portrait clipping before adopting the serialized camera unchanged.

## Retain / not established as defects

- **Confirmed:** original title, icon, play artwork and Lilita font are reused; DOM overlays are a suitable implementation technique. The problem is their transforms and sprite-frame handling, not a need to replace the UI technology.
- **Confirmed:** title endcard scale 1.801, icon's 400-unit base size, black dimmer alpha 200/255 and three deliberate endcard CTA surfaces correspond to serialized values. Preserve these while correcting their parents.
- **Confirmed:** the current build has the required HUD, meter, tutorial hand, front ammo and reserve counts. No extra boosters or visible countdown should be added merely to fill space.
- **Unknown:** exact lighting/material parity, cannon model silhouette, inset/highlight geometry parity, original click-state scale transitions and endcard pulse phase. These need synchronized original runtime comparisons; the current captures alone cannot prove them wrong or correct.
- Physical safe-area/host chrome behavior is **Unknown**. No speculative safe-area padding was added during this review.

## Correction order and acceptance

1. Establish camera framing and one reference UI resolution policy; correct HUD anchors and endcard parent offset.
2. Correct sprite rectangles, especially meter fill and Play Now.
3. Restore meter, cannon labels and hand as independently transformed reference elements; match fonts and outlines.
4. Capture matching phases at all five viewports: initial hint, nonzero fullness, cannon replacement, settled endcard and CTA pulse endpoints. Include actual alpha bounds, not only DOM boxes.
5. Verify gameplay picking, CTA hit areas and orientation after layout changes. Existing audio/network/core logic need not be rewritten.

Artifacts: [portrait gameplay](screenshots/ui-audit/gameplay-390x844.png), [landscape gameplay](screenshots/ui-audit/gameplay-844x390.png), [75% meter fixture](screenshots/ui-audit/meter75-390x844.png), [design-size endcard](screenshots/ui-audit/endcard-720x1280.png), [tablet endcard](screenshots/ui-audit/endcard-768x1024.png). All measurements and capture filenames are in the JSON evidence.

Not checked: original executable's rendered output, physical devices, real ad-host chrome, or pixel-perfect material parity. Reference-derived targets remain conditional on the inspected configuration being the runtime authority; no production fixes were applied.

