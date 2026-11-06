# Work log

## 2026-11-06

- Authorized scope: CoinSort HorizontalRoll translation, progress commentary, documentation, commit, local publication, code testing and QA. Chat commit instructions override the older COLLAB.md commit preference. Honor its preference for no headless checks or screenshots.
- Inspected root README, source AGENTS.md/COLLAB.md, game description, current constants, authored palettes, Three.js FBX/material pipeline, Phaser orchestration, gesture rules, jar, flights, tutorials, endcard and SDK behavior.
- Baseline is main at ccb8e2b210a432272e0e4147a64b163484c4aa70. Original was clean. Staged and installed the comparison copy without modifying Original; reference runs on loopback port 18981.
- Used current executable 3/4/5-band setup rather than historical Game Details.txt. Preserved two-/three-column objectives and third-level tap ending.
- Extracted the original 1,140-vertex FBX mesh with its exact winding and numbered-cap UV fixes, original 0.7 display scaling and texture colors. Preserved source image texels and recorded hashes, atlas tiles and conversions.
- Implemented native Lua matching/progression/input/camera and native shader-rendered coin bands, clear flights and jar filling. Kept browser code limited to the SDK/lifecycle/local-diagnostics boundary.
- Implemented original art for background, locks, hand, jar and endcard; tutorial copy and Arial Bold; gesture-gated audio and SDK pause/mute/volume handling.
- Direct MP3 sound resources failed Bob's supported-format check; converted source copies to Vorbis quality 6 and recorded conversion provenance. No source audio was overwritten.
- GLSL ES 1.00 cannot express the jar's exact integer hash; excluded that shader target. WebGL 2 matches the original Three.js requirement.
- Lua syntax and rules tests passed. Seven legal rotations completed the two objectives. Actual original TypeScript methods agreed with every clear decision, with two and three columns cleared.
- HTML5 release build passed with Bob 1.14.0 and bundled Java 25. Browser runtime assertions and local delivery hashes follow publication.
- Added native 2048px directional shadows with source light placement, bias and Phong material parameters; skipped unnecessary flight/fill passes while the jar is hidden.
- First headed run found an incorrect numeric HTML5 scale setting. Switched to the documented Stretch value. Subsequent real pointer input completed all seven rotations and reached the endcard.
- The resize assertion then found a 42px engine footer reservation despite hidden button CSS. Disabled the made-with-Defold flag, preserving the full browser viewport.
- Matched the original continuous Back/Sine jar lid motion and single-instance SFX behavior, avoiding repeated jar-sound retriggers. Ported tutorial hand phases and fade timing from executable source.
- Removed an extra diagnostic LOADED event and restored original gameReady-before-DISPLAYED ordering. SDK events now use the source sequence.
- Strengthened publication with hashes of all runtime inputs and a check that inputs stayed unchanged during compilation. Published immutable revision directories; the stable loopback root selects the current committed revision. Omitted the unused pthread engine from new bundles.
- Added Windows line-ending normalization and passed the staged whitespace check. Source preservation was rechecked at the same clean original baseline.
- Code tests now include SDK priority, loading/ready MRAID behavior, numeric/null volume, exposure/viewability, pause/resume and local CTA suppression. No live SDK or store navigation is used.
- Completed original and native real-pointer playthroughs in both portrait (390x844) and landscape (844x390), reaching the natural objectives and third-level endcard with matching lifecycle/analytics. Each used the same seven legal rotations.
- Corrected native coin depth to the source orthographic near/far projection and kept coins opaque until the original material's alpha visibility cutoff. Rebuilt, committed and locally published runtime bf93e5a53942d0580ebe352c7c5444f0dd9a55bb.
- Reran both native viewport playthroughs against that exact immutable revision. All passed, including shader/program checks, full viewport size, endcard rotation, pause/resume and one suppressed local CTA.
- Added and ran the pinned reference staging helper. It rejects a different or dirty original baseline, preserves the original checkout, and instruments only the ignored comparison copy.
- Delivery verification passed eight checks: build success, stable/matching runtime inputs, published hashes, exact served revision, unchanged clean source, passing source/final-native headed QA, and loopback-only listeners.
- Final local runtime is 17,905,803 bytes. Documented the local-only multi-file scope, remaining network packaging/device checks and the user's visual/audio sign-off in QA.md. No screenshots, headless runs, remote hosting or Git push were used.
- Final documentation/evidence commit does not change runtime inputs; the local server retains the tested bf93e5a revision.

## User-requested Token Roll rebrand and standalone HTML

- Selected the similar name Token Roll, distinct from existing exports. The user explicitly excluded the literal Sinonimus name.
- Used the imagegen skill and built-in image_gen tool for the replacement TOKEN ROLL app icon. Saved the generated asset in the project and wired it into the native endcard atlas and embedded favicon, preserving its square aspect ratio. Prompt/provenance are in BRANDING.md.
- Updated the Defold project/window title and HTML document title. Kept original gameplay assets, rules and controls intact, apart from the authorized branding replacement; Original remains unchanged.
- Added a single-file packager that embeds loader, engine, Wasm, archive pieces and icon, removes network preload/script dependencies, and enables file:// local-preview guards.
- Output uses one stable filename, D:\allproject\defold\output\Token Roll.html. Existing unrelated exports are preserved; normalized-name collisions and accidental unrelated overwrites are rejected.
- Rebuilt the branded game successfully and passed all 12 current code-check commands. Offline headed single-file QA follows the branding commit and publication.
- Committed the branding/packaging implementation as 9fbb71b49b6420aff83aed78e9b49ab594f979d7, repackaged the stable filename, and locally published the branded build.
- The exact exported HTML passed complete offline headed playthroughs in both 390x844 and 844x390, including title/favicon assertions, all seven legal rotations, natural objectives, endcard/CTA and rotation. Each isolated test folder contained only the HTML. No network or companion-file requests and no runtime errors were observed.
- Verified the delivered HTML hash against packaging and offline-test evidence and checked its unique normalized output name. Final file size is 23,239,432 bytes; other games' outputs were preserved.

## Black-screen report and repair

The user reported that the exported game did not work. Reproduction confirmed a black screen while simulation state advanced. Earlier state-only release QA therefore did not establish successful rendering; its no-rendering-error claim was incomplete.

Fixed invalid cull-face enums and the removed GUI text-metrics API. Enabled multi-layer font rendering so tutorial glyph outlines do not hide adjacent text. Added a completed-frame heartbeat, debug build option, and screenshot pixel checks for startup, play and endcard. Both debug offline headed playthroughs passed with seven pointer-driven moves each and zero runtime errors. Debug captures were visually inspected. The final release is tested separately and replaces the same Token Roll.html without duplicate exports.

Runtime repair commit: dd920a3f57a8abe9c93e34ab6a5796fdd755c6af. See BLACK_SCREEN_FIX.md and current QA JSON for final release identity and results. Publication is loopback-only; no remote push or hosting was performed.

Final repair validation: all 12 code checks passed; debug and release each passed both offline headed playthroughs (seven pointer moves per viewport, no runtime errors or external requests). Six release captures passed pixel checks and the gameplay/endcard presentation was inspected. Delivery verification passed, including current artifact hashes, untouched Original and the unique output name. Release HTML: 23,240,184 bytes; SHA-256 44ebca4042568b01878ea8379c047d5943c0266a97ab1a0524b8e73eff8ddf65. The exact standalone file was opened in a visible browser and left running for the user.
