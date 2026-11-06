# Longarrow Conveyor.glb import repair

Source: `C:/Users/nobzunar/Downloads/New folder (3)/Longarrow_Bigclear Assets/Conveyor.glb`. Read-only source copied here for repeatable regression tests. SHA-256 and final unchanged-source check: [source.json](source.json). Size: 341,624 bytes.

**Confirmed:** the active glTF scene contains the conveyor's `bridge.004 / white edge` and `bridge.004 / blue` primitives plus six separate arrow decoration nodes. Other scenes in the file are not part of the selected active scene. The belt is horizontal, but duplicated seam vertices differ by approximately 0.00000012 to 0.00000169 source units. The previous rounded-coordinate key split some near-identical seam vertices across hash boundaries, so boundary tracing reported a broken ring and auto-detection returned no candidates.

The importer now checks neighboring spatial buckets and welds by actual distance within the existing span-relative tolerance (`span * 1e-6`). This changes only boundary inference; source and exported geometry buffers are not welded or reshaped. The detected belt has two 418-vertex boundary loops and generates a valid 418-point movement path.

Frame selection now uses the parsed glTF node identity when exactly one sibling primitive exists. It selects the white frame belonging to `bridge.004`, excludes the six separate decorations, and leaves Advanced collapsed for this asset. Multiple sibling candidates still require explicit selection. The playable adds its own moving conveyor guides.

Selected geometry: 8,372 vertex records, 5,852 triangles. Converted conveyor data: 411,646 compact JSON bytes at Standard size. The source still matches SHA-256 `774c68e83f84c3ec0c06cc9ee919d1cea82d7453d74be2901d039e62b87320d8` after verification.

**Confirmed local validation:** TypeScript and seven focused importer/authoring tests passed. Tests cover all four size presets, original geometry preservation, exclusion of unrelated nodes, ambiguous frames, prior model compatibility, and gameplay clears in both travel directions. `node tools/longarrow-import-smoke.mjs` imports the exact supplied file through the actual editor, verifies automatic selections and Undo/Redo, draws an arrow, places a cannon, exports/reloads the document, and completes a native-input Three preview clear. No page errors or external requests were observed.

Evidence: [browser results](../evidence/artist-longarrow-browser.json), [import screenshot](../screenshots/artist-longarrow/import.png), [Three preview](../screenshots/artist-longarrow/three-preview.png). The regression fixture and QA level stay outside shipping bundles. Shipping/network packages and physical devices were not rechecked for this editor-only repair.

## Follow-up: visible edge correction

Confirmed 12 surface faces opposed the supplied upward normals. The importer now corrects face winding without deleting triangles or changing positions, removing the dark seam seen near the top-left bend. The editor and import dialog now draw the actual projected mesh rather than a stroked movement-ring approximation. Refresh and reimport to update existing saved geometry. Source file hash remains unchanged.

TypeScript, 86 playable tests, 22 shared-editor tests and the three artist browser workflows passed. Evidence: [before](../screenshots/artist-detail/longarrow-before.png), [after](../screenshots/artist-detail/longarrow-after.png), [checks](../evidence/artist-detail-fix.json). Physical devices and official hosts were not checked.
