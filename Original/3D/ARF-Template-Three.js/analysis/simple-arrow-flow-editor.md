# Arrow Flow Level Studio

Implemented 2026-10-26 following feedback that the shared editor was difficult to navigate. This dedicated page uses native HTML/SVG and TypeScript, with no added dependencies. The playable preview uses the existing Three.js game.

## Open

From the playable checkout, run `npm.cmd run editor`. Open http://127.0.0.1:5181/level-editor.html. If Vite already runs on that port, open the address directly; a second server is unnecessary. The old Arr_LayoutEditor server is not required.

## Create a level

1. **Conveyor:** start with the small playable example, or choose New. Choose Rectangle or Inward bend. Drag yellow corners to adjust the shape; the small plus handles add corners. For a custom outline, click points in order around the shape. Each click adds one numbered point and a straight connecting line; slanted edges and inward bends are supported. Click the green first point or Finish outline to create the belt. Enter also finishes, Backspace undoes the last point, and Escape cancels. Dragging places only the released point, without sampling a trail of corners. After closing the outline, use **Corner rounding** below Belt width: Sharp corners, Small curves, Medium curves or Large curves. This works on your drawn outline; no 3D model is needed.
2. **Arrows:** use **Arrow grid** to set Cell size (0.5 to 1.5), Horizontal/Vertical position, or Center grid in conveyor. Smaller cells fit more blocks; the green squares show usable placements, and blocks snap to cell centers. Changes move/resize existing arrows without changing their block counts. Undo/Redo includes grid edits; invalid changes preserve the previous draft. Then choose **Drawing color**, then drag from tail to tip. The live count includes the head. Release finishes and deselects the arrow. Changing Drawing color never recolors existing arrows. Click an existing arrow to open its separate **Edit selected arrow** palette; drag it to move, turn its head, or delete it. **Done editing / draw next** clears selection. Erase mode removes arrows directly.
3. **Cannons:** click outside the conveyor to place a container. Its initial target is the nearest belt section. Drag the container freely; its conveyor target stays fixed and the cannon turns toward it. Drag the selected cannon's green target circle to move its shooting area along the belt while keeping the container fixed. Target handles snap toward horizontal/vertical alignment with their base. Container drags snap to other cannon rows/columns; hold Alt to bypass alignment. **Align row** moves all cannons to the selected cannon's Y coordinate, and **Space evenly** distributes them horizontally between the leftmost and rightmost containers. Both retain target anchors. Distance is calculated automatically; the old 4 to 7 distance control no longer limits free placement. Bases must remain outside the outline, clear of the belt, and at least 4 units from their target. Choose color/ammo and add replacement rows in firing order.

   **Ammo by color** lists board blocks (including arrowheads), ammo assigned across all cannon positions and replacements, and each color's shortage or surplus. The Total row sums missing shots per color, so extra blue ammo cannot hide missing green ammo. Counts update with edits, imports and Undo/Redo; they guide manual allocation and do not change your queues automatically.
4. **Play test:** the actual game opens inside the editor. Back to editing returns to the current layout. The preview is muted and untimed, without SDK calls or store navigation.
5. **Export level:** downloads a validated `.arrow-flow.json`. Open imports existing files, including files exported by the shared editor. Undo/Redo covers authoring edits. The most recent draft is saved in this browser; export files to keep multiple levels or backups.

New starts an empty board; Play test and Export require at least one arrow. Empty drafts may still be saved locally or opened. Invalid edits/imports preserve the last valid layout. Validation warnings help identify ammunition shortages but do not guarantee a solvable level.

While placing points, the top Undo/Redo buttons edit the unfinished outline. Shortcuts: Ctrl/Cmd+Z to undo; Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y to redo. Adding a new point after Undo replaces the undone branch. Cancel leaves the existing level intact. After closing the outline, Undo/Redo operates on completed level edits again. If closure fails, the points stay visible and editable through Undo/Redo, with an explanation in the side panel. Only completed edits are autosaved; an unfinished outline is not preserved by reloading.

Conveyor points automatically align horizontally or vertically when close to the previous point. Green guides show the snapped position. Hold **Shift** for the nearest horizontal, vertical or 45-degree edge; hold **Alt** to bypass alignment (including Shift). The existing 0.1-cell coordinate precision remains. Corner dragging uses both neighbors for automatic alignment, and the previous vertex for Shift constraints. Only the point being edited moves. The snap tolerance is 8 CSS pixels, capped at 0.4 world units. Modifier changes update the guide immediately, including while the pointer is stationary. Undo/Redo retains the exact snapped coordinates.

## Import an artist conveyor

In Conveyor, choose **Import artist model (.glb)**. For the supplied artist model, the belt and frame are identified automatically and no technical settings are needed. Check the shape in the preview, leave **Conveyor size** at **Standard (recommended)**, then click **Import conveyor**. Smaller/Larger/Largest scale the whole model uniformly; Rotate left/right turns it by 90 degrees. The preview grid and size readout use arrow-grid squares: one square holds one arrow block.

**Advanced: choose model parts** is normally collapsed. Moving belt means the flat loop where arrows travel; Frame and attached details means the surrounding frame and its artwork. Names come from the artist's file. Exact belt width is the previous numeric scale control and still scales the whole conveyor. Detection uses ring geometry rather than names. The matching frame is selected automatically when it is the only other primitive in the belt's glTF node, or the only enclosing frame of similar size in that node; all attached pieces in that node are retained, including the cat whiskers; separate scene decorations remain excluded. Ambiguous belt or frame candidates require explicit selection and open Advanced with an explanation.

Import replaces only the conveyor as one undoable edit. Cancel, parse errors, or incompatible arrow/cannon placements preserve the current level. Starting with New is useful for a different artist shape. Imported textures are not used; the playable retains its own belt materials.

The importer supports self-contained, static, uncompressed glTF 2.0 GLB files with Y up. The surface must be a separate flat horizontal triangle ring with one outer boundary and one inner boundary; select separate border geometry. Whole scenes, solid platforms without a hole, branches, multiple loops, skins, morph targets and required glTF extensions are unsupported. FBX/OBJ need conversion to this GLB structure before import. No external resources are requested. Textures/materials are not imported: the playable applies its existing belt/border materials while retaining geometry and transformed normals.

Simplified-import verification: TypeScript, five focused authoring/import tests, and the full editor-authoring browser workflow passed. Checks cover name-independent detection, ambiguous candidates, default collapsed Advanced, size/custom-width synchronization, left/right rotation, invalid selection preservation, import history and a native-input gameplay clear. Desktop and 390x844 dialog checks passed; screenshots: [simple import](screenshots/editor-authoring/import-simple.png), [narrow](screenshots/editor-authoring/import-simple-narrow.png). This update changes the authoring tool only; shipping packages and physical devices were not rechecked.

The Longarrow Bigclear `Conveyor.glb` also passes automatic detection after repairing seam matching across spatial buckets. Its original file remains unchanged. See [asset-specific diagnosis and verification](artist-longarrow/README.md).

Input inspection limit: 20 MB, 100,000 vertex records and 300,000 triangle indices across the loaded model. The selected artwork may also contain up to 100,000 vertex records and 300,000 indices. This authoring allowance preserves the complete cat model; it does not raise any network byte limit. Surface boundaries support up to 1,024 vertices each. Converted conveyor JSON must be below 3.8 MB; exported level files are limited to 4 MB. The inferred path must pass the same closed-loop/on-surface checks before applying. It is not an artist-authored spline, so use Play test to review movement around tight curves. Imported geometry remains fixed; drawn conveyors support the separate Corner rounding control.

Nearly flat upward-facing surfaces with overlapping triangles can use a projected-union outline fallback. It samples the longest span at 2,040 cells and simplifies contours within 1.5 cells; rendered positions, normals and triangle coverage are retained. Face winding that opposes the supplied normals is corrected to prevent dark seams. Disconnected pieces, extra holes and branching boundaries remain rejected. This supports the supplied rescue mascot cat conveyor; see [asset diagnosis and budget result](artist-rescue/README.md).

Import acceptance is separate from the final HTML byte budget. All eight current build profiles enforce a 4,000,000-byte ceiling, including embedded game code, audio and other assets. The rescue mascot QA level imports and plays, but its unoptimized HTML is 5,325,040 bytes (5.33 MB) and is rejected by packaging. A lower-poly version of the selected model is still needed for this common delivery target; the importer does not silently decimate artist geometry or raise network limits.

## Scope and limits

- One closed conveyor outline with up to 64 points, including diagonal edges and inward bends. Conveyor points use 0.1-cell precision; arrow cells remain on the integer grid. Crossing paths, multiple loops and branches are unsupported. Thin appendages or sharp notches must leave enough room for the belt width.
- **Artist rounded conveyor:** choose it under Start from an example, or Open `examples/levels/artist-rounded.arrow-flow.json`. This uses the original artist mesh and a 606-sample movement path. The shape and width stay fixed while arrows/cannons/direction remain editable. Choosing a preset or connecting a replacement outline switches back to polygon authoring; Undo restores the mesh. Drawn layouts use Corner rounding instead; this control is disabled for imported artist meshes. See [artist geometry evidence and size checks](artist-conveyor/README.md).
- The canvas is a top-down authoring view. Use Play test to check the actual 3D appearance and shooting behavior.
- Arrows draw on grid cells; drag authoring creates at least two cells. Existing valid one-cell arrows can still be imported.
- Cannon placement and targeting work with polygon and imported artist conveyors, persist in level files, and support Undo/Redo. Legacy files retain their original offset/angle until moved. The shared editor explicitly rejects free-position or artist-mesh imports to avoid losing unsupported authoring data.
- The page is a local development tool. It is excluded from shipping HTML and does not replace the playable's default level until you build an exported file.

## Build an exported level

```powershell
npm.cmd run build:level -- "path/to/my-level.arrow-flow.json" preview
```

Replace `preview` with `al`, `fb`, `gg`, `is`, `mtg`, `mo`, `un` or `vu` for a selected network. Outputs go under `dist/custom`. See [the integration guide](arrow-flow-editor-implementation.md) for packaging details.

## Implementation and verification

- Entry: `level-editor.html`; UI/styles/helpers: `tools/level-editor/`.
- Shared level validation: `src/layout/arrowFlow.ts`. Draft parsing permits an empty board; playable parsing retains the nonempty requirement. Geometry and field validation remain shared.
- Embedded preview: `tools/editor-preview.ts`, accepting messages only from its same-origin parent or the existing local opener workflow.
- TypeScript check passed. Playable tests: 64 passed. Shared editor compatibility tests: 22 passed.
- Muted Chromium checks passed for presets, corner editing, concave drawing, cancellation, arrow drawing/moving/color/facing, cannon placement/movement, queue editing, Undo/Redo, export/import, draft reload, and successful native-input completion in the embedded preview.
- Browser evidence: [simple-editor-browser.json](evidence/simple-editor-browser.json); screenshots: [simple-editor](screenshots/simple-editor/). The 390×844 layout has no horizontal overflow.
- The existing shared editor's browser/export/popup-preview smoke check also passed after the embedded preview change.
- Isolated normal playable build: 2,576,705 raw HTML bytes; no dedicated editor UI or draft-storage strings present. Existing shipping outputs were preserved.

Physical touch-device authoring and official ad-host acceptance were not checked. Prior device/audio/performance limitations in the delivery report remain unchanged.

### Historical cannon distance update - superseded by free placement below

Added the selected cannon's Distance from belt field, Reset distance and Shift-drag. Regular drag retains distance; distance drag keeps the anchor and aim, clamps to the existing 4 to 7 range, and uses 0.1-unit increments. Invalid numeric edits preserve the previous level. Custom runtime detectors now follow the authored offset so moving the base does not move the targeting area away from the belt. Default reference behavior is unchanged.

TypeScript, all 72 playable tests and 22 shared-editor tests passed. Muted Chromium checked numeric input, both drag modes, limits, Undo/Redo, invalid input, reset, export/import/reload, narrow layout and native-input preview completion at distance 7. Core tests cleared all four sides at offsets 4 and 7 in both travel directions. The custom QA HTML also cleared through native input, with no page errors or external requests, at 2,608,575 bytes. Evidence: [editor checks](evidence/cannon-distance-browser.json), [packaged check](evidence/cannon-distance-package.json), [screenshots](screenshots/cannon-distance/). Eight network packages and physical devices were not rechecked for this change.

### Current authoring update - 2026-10-27

Implemented GLB import with preview, independent drawing/selection colors, automatic deselection after drawing, live block count, free cannon bases, draggable belt targets, alignment snapping, Align row and Space evenly. Optional cannon `position` extends version 1 without rewriting older documents. Runtime conversion derives aim and detector distance from the base/target pair; color matching, ammo, queues and shot duration are unchanged. The legacy shared editor rejects unsupported mesh/free-position imports explicitly. No dependencies were added.

TypeScript, 76 playable tests and 22 shared-editor tests passed. `node tools/editor-authoring-smoke.mjs` covers the actual supplied `Converyor.glb`, import scale/rotation/cancel/apply/history, invalid input preservation, both arrow palettes, live counts, free placement, snapping/alignment/distribution, target dragging, export/import/reload and native-input clear in Three preview. `node tools/simple-editor-smoke.mjs` also passed after updating expectations for the intentional color/drag changes. The older `cannon-distance-smoke.mjs` entry now runs the new authoring workflow because distance is derived from placement.

Standalone custom HTML with imported geometry and a free cannon is 3,635,000 bytes. It rendered at 390x844, 844x390, 768x1024 and 360x640, and completed a native-input clear with no page errors or external requests. An isolated default build is 2,576,853 bytes and excludes importer/editor strings. Evidence: [authoring browser checks](evidence/editor-authoring-browser.json), [package checks](evidence/editor-authoring-package.json), [screenshots](screenshots/editor-authoring/). Physical devices, arbitrary artist models and official network hosts remain unverified. Existing network delivery outputs were not regenerated.

Ammo-summary verification: six editor helper tests, TypeScript, and `node tools/ammo-summary-smoke.mjs` passed. Browser coverage includes queue/color/ammo edits, per-color deficit accounting, Undo/Redo, invalid input preservation, deleting queues/positions, the full reference board, and narrow layout. Evidence: [ammo-summary-browser.json](evidence/ammo-summary-browser.json), [screenshots](screenshots/ammo-summary/). Totals establish ammunition quantities, not guaranteed solvability.

### Point drawing update — 2026-10-27

Replaced sampled conveyor dragging with explicit numbered points and connected lines, added independent draft Undo/Redo, and made closure errors recoverable without discarding the draft. The existing conveyor is faded while drawing. No runtime, level-file contract, audio, network adapter or packaging changes were needed.

TypeScript and all 65 tests passed. Both `node tools/simple-editor-smoke.mjs` and `node tools/point-outline-smoke.mjs` passed in muted Chromium. The latter covers fractional slants, point/history shortcuts, canceled input, close-point hit tolerance, redo branching, failed closure preservation, and a 16-point butterfly-like outline that completes an actual native-input arrow/cannon play test. Evidence: [point-outline-browser.json](evidence/point-outline-browser.json), [screenshots](screenshots/point-outline/). Physical touchscreen checks remain unverified; network packages were not rebuilt for this authoring-only change.

### Workspace presentation update — 2026-10-27

Replaced the large blue dashboard styling with a compact drafting workspace: graphite file toolbar, neutral canvas, green active-tool accents, smaller inspector and outlined shape thumbnails. Undo/Redo now sits beside Fit view. Contextual instructions sit below the canvas; the active tool is named above it. The file name remains directly editable, and the brand no longer reloads the page when clicked.

Arrow controls distinguish the selected arrow's color from the new-arrow color and show length/facing as properties. Selected shafts retain their thin appearance and wide invisible hit area. Point mode uses a distinct active color and a prominent Finish action. Validation now says when a playable level still has checks to review, rather than presenting ammo warnings under an unconditional ready message. The same level files, drawing rules, preview, and export remain in use.

Both editor browser suites and TypeScript passed. Layout checks covered 1440×900, 390×844, 844×390, 768×1024 and 360×640, with no horizontal overflow and toolbar buttons within the viewport. Desktop and narrow before/after screenshots are in [editor-refresh](screenshots/editor-refresh/); results are in [editor-refresh-browser.json](evidence/editor-refresh-browser.json). Physical touch-device interaction remains unverified. Shipping packages were not rebuilt for these editor-only changes.

### Drawn conveyor rounding - 2026-10-27

Added Corner rounding for completed point-drawn and preset outlines. Sharp removes the optional cornerRadius field; Small/Medium/Large request 1/2/3-unit circular fillets. Both concave and convex corners work, including slanted edges. Trimming is capped at 45% of each adjacent edge so curves leave a straight span. Corners that cannot accommodate the belt width, or curves that conflict with arrow/cannon placements, reject the edit atomically. Original editing points remain intact and appear as a dashed guide. Editing points, reversing direction, Undo/Redo and file round-trips retain the setting.

The shared pure TypeScript conveyorPoints function generates the same sampled centerline for the SVG belt, arrow clearance, cannon anchors, Three geometry and gameplay movement. Curves are sampled at at most 10-degree angular intervals. Radius zero/missing preserves existing polygon paths. Artist mesh geometry is unchanged; imported models reject positive cornerRadius. The shared legacy editor rejects rounded level imports explicitly, directing users to the dedicated editor.

TypeScript, 79 playable tests and 22 shared-editor tests passed. Geometry/core tests cover circular radius, slanted outlines, both windings, inward bends, reversed movement, actual clears, invalid radii and clipped arrows. Muted Chromium verified a custom point-drawn concave shape, visible curves and editable handles, history, editing after rounding, arrow/cannon authoring, export/import/reload, invalid edit preservation, sharp reset and narrow UI. The rounded standalone QA package (2,611,293 bytes) completed a native-input clear with no page errors or external requests. Evidence: [browser checks](evidence/rounded-drawing-browser.json), [package checks](evidence/rounded-drawing-package.json), [screenshots](screenshots/rounded-drawing/). No physical-device or official-host checks were run; network packages were not regenerated.

### Artist detail correction - 2026-10-27

The earlier rescue import incorrectly excluded the whisker pieces. Same-node artwork is now preserved and grouped into the matching belt/frame materials. Both the import dialog and editor canvas draw projected mesh triangles instead of the simplified travel boundaries, keeping attached details and actual rounded contours visible. The earlier Longarrow belt had 12 inverted faces; correcting winding removes the dark line without changing its vertex positions or silhouette. Existing imported drafts retain their saved geometry: refresh and reimport the original GLB to apply these changes.

TypeScript, 86 playable tests and 22 shared-editor tests passed. All three artist browser workflows passed, including native-input clears, history and export/reload. Original GLBs remain unchanged. The complete cat QA build is still blocked by the unchanged 4 MB packaging ceiling. See [detail fix evidence](evidence/artist-detail-fix.json), [cat editor view](screenshots/artist-rescue/editor-details.png), [cat game view](screenshots/artist-rescue/three-preview.png), and [Longarrow seam before](screenshots/artist-detail/longarrow-before.png) / [after](screenshots/artist-detail/longarrow-after.png). Physical devices and official ad hosts remain unverified.

### Editable arrow grid - 2026-10-27

Added optional board.grid with size and offset to the version 1 level format. Missing grid settings retain one-unit cells and zero offset, including the reference level. Logical arrow heads and body offsets remain contiguous integer cells. The shared gridPoint/gridCell transform maps them to editor/world positions. Grid position is independent of the global level origin, conveyor, and cannon poses. Center grid places cell (0,0) at the conveyor centerline bounding-box center. It does not recenter the existing arrow pattern independently.

Cell size accepts 0.5 to 1.5 world units. The usable-cell guide shares the same clearance rule as placement/export: half belt width plus 0.45 times cell size. It displays at most a centered 100-by-100 grid region, matching the authored board dimension bound. The separate level limit of 2,000 occupied blocks remains. Settings save with the draft/export; green cell guides are editor-only. Existing arrows keep IDs, logical cells, colors and ammo counts. Changing grid size or position is one undoable edit; invalid fit is rejected atomically.

Custom runtime arrows carry optional cellSize. Meshes, highlights, hit areas, front-lane checks, blocked-contact movement, tail following and conveyor spacing use it. Baseline tuning remains unchanged when cellSize is absent. This is an intentional custom-level extension, not a measured reference feature. Blocked SFX still requests playback at the existing contact event; native event ownership and audio pools were not changed. The legacy shared editor explicitly rejects custom grid imports to prevent losing the transform.

Browser evidence: [grid authoring](evidence/arrow-grid-browser.json), [packaged preview](evidence/arrow-grid-package.json), [screenshots](screenshots/arrow-grid/), [QA level](evidence/arrow-grid-qa.arrow-flow.json). Covered size/position/centering, usable cells, snapping, history, invalid preservation, export/import/reload, native-input clears at 0.5/0.75/1.5 sizes, intact imported cat artwork, and four viewports. The packaged QA HTML is 2,609,051 bytes. Physical devices and official network hosts remain unverified; the complete cat model still requires separate asset-size optimization.

Final verification: TypeScript, 91 playable tests and 23 legacy-editor tests passed. The existing default editor browser workflow also passed after adding the grid panel. Shared contract/schema copies were synchronized; no Git commit or push was performed for this feature.
# Imported-model clearance (2026-10-28)

In the Arrows step, imported models show faint top-view block outlines. Red outlines indicate block centers that sit over the imported mesh; green cells exclude these conflicts. Drawing, arrow dragging and grid changes reject newly introduced conflicts. Existing drafts remain loadable and editable, and Undo/Redo preserves them.

When conflicts remain, **Save draft** downloads a `.draft.arrow-flow.json` file for recovery and continued editing. Play test remains available to inspect the issue. Once clear, the button becomes **Export level**. Network builds through `build:level` reject conflicts; local preview builds remain available for diagnosis. Procedural placement behavior is unchanged.

The mockup follow-up preserves the supplied original **1.25** grid. Imported-model previews use a recessed resting board and a calibrated fixed camera; the raised rim can naturally cover block edges. The old projected-height envelope incorrectly treated this occlusion as a collision and is superseded. Use the original `untitled-level.arrow-flow.json`, not the earlier 1.0-grid `.fixed` alternative. Blue now appears as cyan in both swatches and Three materials. Details: `analysis/mockup-layout-match.md`.
