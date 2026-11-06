# Imported conveyor / arrow grid review — 2026-10-28

Review only, on `playable/conveyor-overload` at 8f1e1fa. No product code changed.

## Confirmed findings

1. **Placement ignores the imported mesh footprint.** `src/layout/arrowFlow.ts:14` defines clearance as half the nominal conveyor width plus 0.45 cell. `parseFlow` at line 189 checks the cell center against the movement loop using that distance. Neither check uses the imported border or belt triangles. An artist mesh can extend farther inward than this estimate.
2. **The same approximation drives drawing and green usable cells.** See `tools/level-editor/model.ts:24` (`usableGridCells`), `extendArrow` at line 85, and the new-arrow start check in `tools/level-editor/main.ts:195`. Thus this is a placement-validation issue, not just how the grid is drawn. A square's full footprint is not tested against the art.
3. **Top-down measurements reproduce overlap on both available artist fixtures.** With grid size 1 and offset [0,0], Longarrow advertises 358 usable cells, of which 28 square footprints intersect projected mesh triangles; the cat/rescue fixture advertises 662, with 39 intersections. At size 0.5 the cat fixture even has three accepted cell centers over mesh triangles. Measured against both stored mesh parts, ignoring triangles with zero projected area and using a triangle/square separating-axis test. Details and example logical coordinates: `evidence/grid-mesh-overlap-review.json`.
4. **Browser presentation reproduces the misleading placement area.** Imported both saved fixtures into an isolated muted Chrome editor session and captured the Arrows tab at 1440 x 1000. Images: `screenshots/grid-mesh-review/longarrow.png` and `rescue.png`. The mesh is drawn above the green grid, so affected squares can look partially clipped by the model while still being accepted by placement logic.

## Recommended correction

Use one shared full-cell clearance predicate for green cells, arrow start/extension, moving arrows, grid adjustments and export validation. For imported models, test against the actual projected frame and belt geometry, including inward details, with a small explicit margin. Preserve the existing movement centerline for travel. Cache geometry work so pointer movement remains responsive. Procedural conveyors should also account for the full cell footprint and visible border.

Existing saved layouts must remain recoverable: highlight conflicting arrows and allow moving them inward, rather than rejecting the saved draft on startup and falling back to the starter. The current startup catch in `tools/level-editor/main.ts:18` makes that important when tightening validation.

## Limits

The user's currently open browser draft was not accessible in the automation session. These are reproductions with the repository's artist fixtures, not an inspection of that private saved draft. Counts measure top-down grid-square/mesh overlap, not exact rendered arrow-mesh intersections or collision at each 3D height. Current-layout specifics remain unverified until its exported JSON is available.
