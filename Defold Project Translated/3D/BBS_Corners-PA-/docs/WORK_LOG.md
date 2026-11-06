# Work log

## 2026-11-06

1. Inspected Unity source, the existing Babylon implementation, branch and baseline commit. Confirmed originals were clean.
2. Copied `PortRoot` outside `Original`, installed dependencies there, ran its Vite preview and captured its opening screen.
3. Verified Unity's all-brick win condition, four-click and 30-second variants, end-card fade, CTA timing, board occupancy and gates. Recorded the Babylon colored-only win discrepancy.
4. Created a separate Git repository at the mapped Defold destination. Imported original geometry, textures, UI, music, sound effects and font. Added reproducible asset and scene generation scripts and provenance.
5. Implemented Defold rendering, camera/input mapping, deterministic grid movement, submissions, tutorial, hints, variants, end cards and isolated platform integration.
6. Added Lua regression tests. These found that two immediate starting submissions do not alone open a direct-clear route; added vacancy/blocker planning. Full-board solver now clears all 56 blocks through 508 legal moves with occupancy consistency checks after every move.
7. Corrected build integration issues exposed by Bob and browser execution: compiled bootstrap resource suffixes, Wasm platform selection, archive packaging, supported audio format, loader defaults and 1.14 graphics constants.
8. Browser smoke reached a clean startup with 56 blocks. Pointer QA passed gate submission, blocked drags, no background click counting and rotation across four viewport shapes. Visual comparison drove board framing, border-color, footer-color and original bold-font corrections.
9. Added end-to-end QA covering limited modes, lifecycle, mock CTA priority and a full clear using real pointer input. Final results and release metadata are recorded in `QA.md` and local publish build information.
10. Full-game browser QA cleared all 56 blocks in 88 drags. Its lifecycle checks exposed a nil/boolean audio-resume defect; corrected it and applied numeric host volume to the master group, including muting active effects while hidden.
11. High-DPI touch QA passed four-click completion and rotation on the end card. Native startup logging exposed the removed untyped `sys.get_config` API; replaced it with Defold 1.14's `sys.get_config_string` and repeated native startup QA.
12. The clean full-game browser rerun passed all 11 checks with zero runtime errors and zero external requests. Repeated smoke/touch checks after the final tutorial-hand adjustment. Built both release platforms from `4a3636d`; native startup passed. Packaged HTML5 and Windows ZIPs and recorded checksums.
13. Saved selected QA reports and visual evidence to `qa/evidence/`. Replaced the temporary preview server with the committed loopback-only Node server, launched with its window hidden. Original Vite reference preview was stopped after comparison.

All network publishing is excluded. The deliverable is served on loopback only. Build products are reproducible and ignored by Git; source, documentation, asset manifests and test code are committed.

## Branding revision

The user requested a new icon and game title/name, described as synonymous or near the original. Selected **Brickshatter Corners** as a related block-puzzle title. Replaced the old wordmark with a locally rendered interlocking-block SVG mark and bold title, configured browser and Windows app icons, updated loading text and product/build names, and made build, preview and packaging tools read `branding.json`. Original source assets remain untouched. The imported-asset generator now preserves the custom brand artwork.

The user clarified that the title should be synonymous with the original and not duplicate an existing title. Rejected the already-used generic “Block Breaker”; exact web and app-store searches for “Brickshatter Corners” returned no results. Checked shared output filenames and document titles for duplicates while preserving the other two games' exports.

At the user's request, built a truly single-file HTML distribution in the shared `output` folder. The custom packer embeds the stock Defold loader, runtime JavaScript, Wasm and archive data, and serves archive loads from embedded bytes. Offline QA of the final output file passes with no companion-file or network requests. Corrected Windows icon encoding to the engine's eight DIB sizes and verified every embedded icon resource changed.
