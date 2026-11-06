# Token Roll — Defold translation

Player-facing name: **Token Roll**, formerly CoinSort HorizontalRoll. The user-authorized icon, favicon, window/document title and endcard now use Token Roll. The folder retains the source repository name for traceability.

Standalone delivery: `D:\allproject\defold\output\Token Roll.html`. This is one self-contained HTML file with the engine, game data and icon embedded. See [branding and packaging](docs/BRANDING.md) for regeneration and offline QA.

Original baseline: `Original/3D/CoinSort-HorizontalRoll`, branch `main`, commit `ccb8e2b210a432272e0e4147a64b163484c4aa70` (Coin Submission).

This project translates the executable Phaser/Three.js game into Defold Lua and native mesh shaders. The original checkout stays unchanged. The runnable comparison copy is `tools/reference/`, ignored by Git.

## Play locally

Open `http://127.0.0.1:18982/` after publication. Tap to focus the first cylinder, drag individual bands vertically, and release to snap. Matching same-color columns clear into the jar. Two columns unlock the second cylinder; three columns there unlock the third. Tap the third cylinder for the endcard. `R` reloads the local game. Local CTA calls are recorded without opening a store.

The original executable uses three, four and five bands, not the two/three/four bands in the older Game Details.txt. Its constants and authored palettes are the acceptance baseline. Inner cylinders remain cosmetic and stationary.

## Build and publish

Requirements: Python with Pillow, Node 24, the workspace Bob 1.14.0 and Defold's bundled Java 25. PATH Java 21 is too old for this Bob. The build script selects Java 25 explicitly.

```powershell
python scripts/test.py
python scripts/build.py
git add .
git commit -m "Port CoinSort HorizontalRoll to Defold"
python scripts/publish.py
python scripts/serve.py
```

The server binds exclusively to `127.0.0.1:18982`; it serves only `local-publish/`. No remote deployment or Git push is performed. Stop it with Ctrl+C.

To run the reference copy:

```powershell
python scripts/stage_reference.py
cd tools/reference
npm.cmd ci
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 18981 --strictPort
```

The reference staging script checks the pinned source commit and exposes its existing Phaser.Game instance for code assertions. It does not change game rules or Original. `qa/browser.cjs` uses the workspace's existing Playwright installation under `reference/BBS-Corners/node_modules` and runs headed with no screenshots.

The browser build requires WebGL 2, as does the original Three.js renderer. Asset conversion is repeatable with `node tools/import.mjs`, `python tools/prepare.py`, and `python scripts/convert_audio.py` after staging/installing the reference. The latter uses FFmpeg on PATH or the existing workspace ffmpeg-static executable. Preserve the MP3 source copies; Defold plays the converted Vorbis files.

## Implementation

| Location | Responsibility |
| --- | --- |
| `main/config.lua` | All original executable constants, generated from baseline TypeScript |
| `main/rules.lua` | Wrapping offsets, source-lane lookup, matching and cleared-source occupancy |
| `main/game.script` | Input, snap/clear timelines, jar state, objectives, camera and lifecycle |
| `render/coin.vp` and `coin.fp` | Native FBX geometry, lane placement, rotation, pop/flight/fill and material shading |
| `main/*.gui_script` | Original background, hand, tutorial, locks, jar artwork and endcard |
| `web/host.js` | SDK boundary, visibility/mute gates, local state reporting and CTA suppression |
| `docs/asset-manifest.json` | Source hashes, mesh correction, texture atlas and audio conversions |
| `qa/` | Tests, deterministic legal rotation replay, build/runtime and delivery evidence |

All bands share an immutable mesh buffer. Per-band uniforms supply the original palette, offset, cosmetic-inner geometry and clear schedule. The GPU handles continuous rotation and flights; Lua owns every matching and progression decision. The runtime does not embed the original Phaser or Three.js game.

Directional shadows use a 2048px native shadow map, the source light/camera bounds and bias, and a nine-tap PCF filter. Source FBX Phong shininess/specular values are retained. Exact shadow softness, glyph rasterization, antialiasing and device audio still require the user's visual/listening comparison.

Source images are decoded without replacing artwork except for the user-authorized Token Roll icon; all six 2048x2048 coin textures are copied into an atlas. The coin FBX receives the original implementation's exterior-winding reversal and numbered-cap UV correction, then its original centered scale. Original MP3s are retained and converted to Vorbis at quality 6 without timing/gain edits. Arial Bold matches the original browser's system-font choice.

## Validation and review

`qa/rules-comparison.json` compares a Lua-generated legal playthrough with actual original CoinCylinderLevel methods. It covers both objectives, rotating empty source lanes, wraparound and JavaScript's signed snap rounding. `qa/build.json` records the exact toolchain command and build result.

Per COLLAB.md, browser QA uses a headed browser and records code/runtime assertions only, without screenshots. Visual sign-off remains the user's review. See `docs/COMPARISON.md` and `docs/WORK_LOG.md` for remaining checks and the final observed status. A successful build or rule test alone does not establish visual/audio parity or network submission acceptance.

Initial translation results: build, all 11 then-current code-check commands, original/Defold portrait and landscape playthroughs, and all eight delivery checks passed. See [historical QA record](docs/QA.md). That tested runtime commit was `bf93e5a53942d0580ebe352c7c5444f0dd9a55bb`.

Current Token Roll release: branded build and all 12 code-check commands passed. The delivered single HTML passed complete headed offline playthroughs at 390x844 and 844x390 from an isolated folder containing only the HTML, including endcard/CTA and rotation, with zero network or sibling-file requests. Evidence and SHA-256 are in `qa/single-html-package.json` and `qa/single-html-results.json`.

The initial local multi-file build was approximately 17.9 MB. It preserves full-resolution source art and is not a single-file sub-5 MB ad-network package. External network packaging/submission and physical-device performance are outside this local publication and remain unverified.

## Rendered-screen verification

The reported black-screen startup is repaired. See [repair details](docs/BLACK_SCREEN_FIX.md) for the cause and corrected QA criteria. Current tests require completed render frames and inspect startup, gameplay and endcard captures, in addition to the offline playthrough. Run `node qa/run-game.cjs` to open the exact exported HTML in a visible browser and leave it available for play.
