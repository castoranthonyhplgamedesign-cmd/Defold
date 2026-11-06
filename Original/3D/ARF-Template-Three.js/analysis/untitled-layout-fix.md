# Imported conveyor overlap fix — 2026-10-28

**Historical, superseded by the supplied mockup.** The user requires the original 1.25 grid. Use `untitled-level.arrow-flow.json` with the revised rendering described in `mockup-layout-match.md`; the 1.0 `.fixed` copy below is no longer the recommended layout. Its earlier projected-clearance counts and rejection behavior describe the previous implementation.

Branch: `playable/conveyor-overload`. Changes are local and uncommitted.

## Delivered

- Corrected level: `../levels/untitled-level.fixed.arrow-flow.json`. Open it in the editor instead of the original file.
- The original `untitled-level.arrow-flow.json` remains byte-identical (SHA-256 `ea15bc1e4a7d3fde229be4e8bb638b83603e45005897afb4d15e87750c9920d8`).
- Corrected copy uses grid size **1.0**, offset **[0,-0.5]**, instead of 1.25/[0,0], with arrows repositioned to fit the imported model. All 59 arrow IDs, colors, body shapes, facing directions and 199 blocks remain. Conveyor geometry and all cannon positions/queues/ammo are unchanged. Placement differences are recorded in `evidence/untitled-layout-repair.json`.
- The editor displays conservative block footprints including projected height, marks conflicts red, and excludes them from green usable cells. New drawing, dragging and grid changes cannot introduce conflicts. Existing conflicting drafts still load and can be saved as drafts; there is no automatic migration or silent replacement of browser data.
- `scripts/build-level.mjs` rejects conflicting levels for network builds. Diagnostic preview builds remain available. Authoring checks do not change runtime movement, picking, camera, block geometry, audio or the default reference level.

## Method and limits

`src/layout/visualClearance.ts` projects both imported frame/belt mesh triangles using the fixed camera orientation. The arrow envelope uses measured maximum head width and block height plus a 0.03 world-unit margin. Rectangle/triangle intersection uses separating axes with cached geometry and rows. The same predicate drives green cells, edit checks, conflict outlines and build validation.

The supplied original has **38 conservative visual-clearance conflicts**, including its raised-block screen overlap. This is different from the previous measurement of five actual top-down part-footprint intersections. The corrected copy has zero under the new check. This is intentionally conservative: a red marker means insufficient guaranteed visual clearance, not necessarily solid 3D penetration.

The correction changes spacing and may change puzzle difficulty or obstruction order. Full solvability is not claimed. Travel across the conveyor during a launch is intentional; the clearance checks apply to authored stationary positions. Procedural conveyors retain their previous placement rules.

## Validation

- TypeScript check passed; **97 tests passed**. New tests cover projected height, grid changes, mesh cache invalidation, retained legacy drafts, shared placement checks, export validation, and measured geometry bounds.
- `node tools/clearance-smoke.mjs` passed in muted Chrome. Verified original import/reload, red outlines, draft download, rejected unsafe adjustment, Undo/Redo, corrected export, unchanged original hash, native launch, and four preview viewport captures. No page errors or external requests. Evidence: `evidence/clearance-browser.json`.
- Captures: `screenshots/untitled-layout-review/editor-warnings.png`, `editor-fixed.png`, `preview-fixed.png`, and `fixed-390x844.png`, `fixed-844x390.png`, `fixed-768x1024.png`, `fixed-360x640.png`. Inspected desktop and portrait previews show space around the frame, including the previously overlapping upper section and side pockets.
- `npm.cmd run build:level -- untitled-level.fixed.arrow-flow.json preview` passed: finalized HTML **3,641,801 bytes**, below 4,000,000. A network build attempt using the overlapping original was correctly rejected before Vite ran.
- Physical-device behavior, official host validation and a full successful playthrough remain unverified. No push performed.
