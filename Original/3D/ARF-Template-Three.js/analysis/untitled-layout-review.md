# Review of the supplied untitled-level.arrow-flow.json

Reviewed 2026-10-28 on `playable/conveyor-overload`. Read-only analysis of the supplied layout; no source layout or product code modified.

## Confirmed input and reproduction

- Source: repository-root `untitled-level.arrow-flow.json`, 1,124,603 bytes.
- SHA-256: `ea15bc1e4a7d3fde229be4e8bb638b83603e45005897afb4d15e87750c9920d8`.
- 59 arrows, 199 blocks, 3 cannon lanes; grid size 1.25, offset [0,0], origin [0,0].
- The current `parseFlowDocument` accepts this exact layout.
- Loaded this file into an isolated muted Chrome editor session and opened its Three preview. No page errors. Captures: `screenshots/untitled-layout-review/editor.png` and `preview.png`.
- Grid coordinates convert consistently to world coordinates via `gridPoint` / `flowRuntime`. No missing grid-size conversion was found.

## Confirmed footprint conflicts in this file

Compared the actual head/body/corner geometry triangles, scaled to 1.25 and oriented as in `createBoard`, against both imported conveyor mesh parts in top-down projection. Strict triangle overlap excludes mere shared-edge contact. Five arrow parts across three blue arrows overlap the conveyor footprint:

| Arrow (file order, 1-based) | Location | Part | Logical cell | Mesh part overlapped |
|---|---|---|---|---|
| 1 | Bottom-left downward blue arrow | Head | (-7,-12) | Frame |
| 6 | Left upright blue arrow in side pocket | Head | (-8,3) | Frame |
| 6 | Same arrow | Last body block | (-8,0) | Frame and belt |
| 42 | Right upright blue arrow in side pocket | Head | (8,3) | Frame |
| 42 | Same arrow | Last body block | (8,0) | Frame and belt |

Full IDs and positions: `evidence/untitled-layout-overlap-review.json`. Six full grid squares intersect the mesh; five actual rendered-part footprints intersect. These counts are distinct from the earlier generic fixture review.

## Cause and visual interpretation

Confirmed: `gridClearance` in `src/layout/arrowFlow.ts` uses nominal half-belt width plus 0.45 cell, and arrow validation checks the cell center against the movement loop. It does not compare the imported model with each rendered part's footprint. The editor also draws thin arrow lines rather than full block silhouettes, making borderline placements look clearer than they are in Three.

Confirmed: the supplied head geometry is about 1.101 units wide before scaling (about 1.376 at size 1.25); its height is about 1.547 after scaling. The imported conveyor frame reaches approximately y=0.210. Inferred: the tilted camera and these tall arrow parts account for additional apparent screen overlap near the upper frame, beyond the five measured top-down conflicts. The footprint test is not a full 3D solid-intersection test and does not classify every overlapping screen pixel as an actual placement conflict.

## Recommended next change

Show the block footprint while authoring and highlight these specific conflicts. Use shared mesh-aware placement checks for drawing, dragging, grid changes and export. Preserve this saved layout so its three affected arrows can be adjusted locally with the rest of the design intact. Do not automatically rescale or shift the entire layout: its narrow side pockets make that unreliable.

No correction has been applied. Physical-device rendering and full-session playthrough were not tested in this review.
