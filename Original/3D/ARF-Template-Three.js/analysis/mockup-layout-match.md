# Conveyor-overload mockup follow-up — 2026-10-28

## Result

Use the original root `untitled-level.arrow-flow.json` again. Its **1.25 grid, [0,0] offset, all 59 arrow positions/shapes/colors/facings, 199 blocks, and cannon data are unchanged**. Original SHA-256: `ea15bc1e4a7d3fde229be4e8bb638b83603e45005897afb4d15e87750c9920d8`. The earlier 1.0-grid fixed copy is retained only as a superseded alternative.

Reference inspected: `arf_conveyor_overload_mockuppresentation.png` (4416 x 3222). It shows dense arrows in the original arrangement and cyan, rather than royal-blue, blocks. The original screenshot and JSON were not modified.

## Visual calibration

- Imported artist conveyors use a fixed 60-degree camera tilt and a resting arrow base at -1.55 times cell size. These are **implementation calibration values**, not constants extracted from the mockup. This puts the board below the raised rim instead of letting tall blocks cover it. The original reference/procedural board retains its prior camera and resting height.
- Imported arrowheads and their inset/highlight are 0.9 of their previous local width. Full body height, cell spacing, occupancy, and movement rules remain intact. Head/inset alignment and picking use the same adjusted pose.
- Launched arrows rise from the recessed board to the belt with smoothstep timing across the existing launch duration. All unjoined parts of an arrow share the lift, avoiding another detached-head effect. Belt blocks remain at their original height. Blocking feedback and native audio timing are unchanged.
- Tutorial targeting accounts for the lower board. No input-family or audio-pool changes were made.
- The logical `blue` color now uses **#2cd8ed** in both `flowColors` and runtime materials. Cannons and shots reuse the same material palette. A sampled lit cyan region in the supplied mockup had median RGB approximately **49,232,255** after scaling the reference to 1842 x 1344 for analysis; the material value is calibrated for this renderer's lighting rather than copied from a lit pixel.
- Placement still requires nominal path clearance and rejects centers over the imported frame/belt geometry. Since resting blocks are below the rim, ordinary edge occlusion is permitted. Faint editor guides are top-view block envelopes, not promises of zero projected intersection with the rim. Existing drafts remain recoverable.

## Verification

- Type checking and **99 tests passed**, including palette consistency, recessed picking, unchanged 1.25 spacing, gradual lift, belt height, legacy/default rendering, and mesh-aware center checks.
- `node tools/clearance-smoke.mjs` passed in muted local Chrome. Verified original import/reload/export without coordinate changes, cyan swatch, invalid-draft recovery, rejected unsafe grid edits, Undo/Redo, four preview viewports, and native launch using the repositioned tutorial. No page errors or external requests. Evidence: `evidence/mockup-layout-browser.json`.
- Current screenshots: `screenshots/mockup-layout/editor.png`, `preview.png`, and the four viewport PNGs. Earlier `.fixed` screenshots show the superseded workaround.
- Original-layout preview build passed: finalized HTML **3,643,649 bytes**, below 4,000,000. Build command: `npm.cmd run build:level -- untitled-level.arrow-flow.json preview`.

This is a visual calibration to the supplied mockup, not certified pixel parity. Mockup cannon queue colors and lighting details beyond the requested cyan/layout adjustments were not substituted for the user's authored data. Physical devices, official ad hosts, and a full successful run remain unverified. Changes are uncommitted and have not been pushed.
