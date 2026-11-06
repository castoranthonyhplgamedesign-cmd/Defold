# Rescue mascot conveyor: complete artwork and budget

Checked 2026-10-27 against C:/Users/nobzunar/Downloads/New folder (3)/ARF, MIP, rescue mascot/Conveyor bridge.glb.

**The missing whiskers were an importer mistake, not unrelated decoration.** The previous partial import and its 4.19 MB measurement are superseded. Refresh the editor and reimport the original GLB to restore the complete model. Existing saved drafts cannot recover omitted geometry automatically.

## Confirmed source and selection

- Original: 2,248,508 bytes, SHA-256 ea883eb48c630c7bb50a6160ac2f552bb25d8e241360ee3565a6f0a95b6f0d74. Hash rechecked after this change; unchanged.
- All four primitives under node ear.001 / mesh Plane.008 are now retained: **61,680 vertices and 45,112 triangles**.
- Primitive 3 (blue.007) remains the movement-ring source. Primitive 1 (blue.006) supplies the whisker surfaces; both use the belt material.
- Primitives 0 (white edge.003) and 2 (white edge.004) supply the whisker and main frame geometry; both use the frame material.
- Same-node attached artwork is selected automatically after identifying the main belt/frame. Ambiguous frame selection still requires explicit selection; unrelated nodes remain excluded.

The editor's previous stroked ring diagram did not represent attached details. Both the dialog and canvas now project the actual mesh triangles, so whiskers and rounded model contours are visible in authoring as well as Three preview. Vertex positions, normals and triangle coverage are preserved; face winding is corrected where it disagrees with supplied normals. No decimation or approximate vertex welding was applied.

## Inferred movement route

The main belt contains overlapping faces and small vertical offsets. A bounded projected-union fallback traces two contours at 2,040 cells across the longest span, with 1.5-cell contour simplification. The resulting 256-point centerline remains an inferred movement route, not an artist-authored spline. It is validated and clears a test arrow in both directions. The whiskers are retained visually; the movement route remains a continuous loop rather than branching into each protrusion. Render geometry is independent of this route inference.

## Authoring and delivery limits

- Source GLB: at most 20 MB, 100,000 vertex records / 300,000 indices.
- Selected authoring mesh: at most 100,000 vertices / 300,000 indices, each base64 buffer at most 1,600,000 characters.
- Converted conveyor JSON: below 3.8 MB. Complete exported level file: at most 4 MB.
- Final playable HTML: the existing **4,000,000-byte cap remains unchanged for all eight profiles**. Authoring acceptance does not certify a shippable package.

The complete conveyor JSON is **2,715,936 bytes**. Building the one-arrow QA level produced **5,325,040 bytes** of diagnostic Vite HTML and correctly failed final packaging. This model still needs optimization that preserves its whiskers and rounded silhouette before delivery. Source geometry was not deleted to force a budget pass. The earlier evidence file artist-rescue-budget.json records the superseded partial import only.

## Verification and artifacts

- TypeScript, all 86 playable tests and 22 shared-editor tests passed. Tests assert complete triangle retention, correct material groups, bounded authoring imports, unchanged source arrays, and gameplay clears in both directions.
- Muted Chromium: actual source-file import, automatic selections, Undo/Redo, arrow/cannon authoring, export/reload and native-input Three preview clear passed. No page errors or external requests. The earlier Longarrow and original rounded artist model browser workflows also passed.
- Visually inspected the cat in both editor and game: all four whisker protrusions and their border connections are visible. Original file remains unchanged. Default reference level and existing network delivery outputs remain unchanged.

Artifacts: [source metadata](source.json), [current conveyor](conveyor.json), [QA level](playable-qa.arrow-flow.json), [checks and size](../evidence/artist-detail-fix.json), [editor](../screenshots/artist-rescue/editor-details.png), [game](../screenshots/artist-rescue/three-preview.png).

Physical devices and official ad-host acceptance remain unverified. The full cat build fails the delivery size check and is not a finalized package.
