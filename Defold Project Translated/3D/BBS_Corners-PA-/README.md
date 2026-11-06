# Brickshatter Corners — Defold

Native Defold translation of the Wide-U playable, renamed **Brickshatter Corners** at the user's request. Open `game.project` in Defold 1.14.0, or build with Bob and Java 25. The source repository remains unchanged.

## Single-file deliverable

The requested standalone export is `D:\allproject\defold\output\Brickshatter-Corners.html`. Open it directly in a browser; no server or companion files are required. The runtime, Wasm, game archive, branding and favicon are embedded. Local-file play keeps CTA attempts local.

To regenerate and test it:

```powershell
node tools/build.mjs
node tools/package-single-html.mjs
node tools/single-html-smoke.mjs
```

The offline test opens the actual output file with networking disabled, submits a block, reaches the four-click end card, rotates the viewport and verifies zero extra file/network requests. See [name check](docs/NAME_CHECK.md) for the exact-name collision search.

## Local preview

Build with `node tools/build.mjs`, then start `node tools/serve.mjs`. This server binds only to `127.0.0.1`.

- Full: <http://127.0.0.1:8188/>
- Four clicks: <http://127.0.0.1:8188/?iteration=4clicks>
- Thirty seconds: <http://127.0.0.1:8188/?iteration=30seconds>

Drag blocks to their matching exits. The U-shaped center has no playable cells. Full mode wins only after all 56 blocks are removed. Four-click mode ends on the fourth block press. The 30-second timer starts with the first block press. `R` restarts. Footer logo and Play Now are clickable; local preview records CTA attempts without navigating to the store.

## Build and QA

```powershell
node tools/build.mjs
node tools/build.mjs --windows
node tools/serve.mjs
node tools/platform-test.mjs
node tools/e2e.mjs
node tools/device-smoke.mjs
node tools/native-smoke.mjs
python tools/package-release.py
```

The build script uses the installed Defold Java 25 runtime and `../../../.tools/bob.jar`. Override with `DEFOLD_JAVA` and `DEFOLD_BOB` when moving this project. Bob is pinned to engine SHA `d295ed4edff2e49072719835713e625f409849f1` (1.14.0). Web output is under `publish/Brickshatter Corners/`; Windows output is under `publish/windows/Brickshatter Corners/`. Build output and temporary browser artifacts are ignored by Git. `publish/build-info.json` identifies the source commit used for a local build.

Browser tests use the existing Playwright dependency in the isolated reference copy at `../../../reference/BBS-Corners`. They launch installed Chrome headlessly, use real pointer input, and save JSON reports and screenshots to `qa/artifacts/`. Pure Lua tests run with the LuaJIT bundled in Bob:

```powershell
& '..\..\..\.tools\libexec\x86_64-win32\luajit-64.exe' qa/board_test.lua
```

Local ZIP packages are written to `publish/Brickshatter-Corners-HTML5.zip` and `publish/Brickshatter-Corners-Windows.zip` with SHA-256 checksums in `publish/release-manifest.json`. See [implementation notes](docs/IMPLEMENTATION.md), [asset provenance](docs/asset-manifest.json), and [QA results](docs/QA.md). Development and release history is recorded in [WORK_LOG.md](docs/WORK_LOG.md).

## Branding

`branding.json` defines the product name, Windows executable name and ZIP prefix. The project title in `game.project` must match it; the build script checks this. `node tools/generate-branding.mjs` renders the editable `assets/branding/mark.svg` into the footer/end-card logo, browser PNG icon and multi-resolution Windows ICO. Run it before rebuilding after a branding change. The source-import script preserves the customized logo.

## Baseline

- Original: `../../../Original/3D/BBS_Corners-PA-`
- Branch: `Wide-U-Client_Revision`
- Commit: `cfd9f7b` (`Bug Fixes`)
- Unity: `Assets/Scenes/Wide-U.unity`, `Assets/Scripts/`
- Secondary executable reference: `PortRoot/`, copied to `../../../reference/BBS-Corners` for dependency installation and preview without changing the original.

Unity's `BoardManager.CheckAllBricks` is authoritative for Full-mode completion. The existing Babylon port checks only colored blocks; this Defold port deliberately follows Unity and requires neutral blocks to be removed too.

This is a local Defold build. Network SDK wrappers can be exercised with mocks. A local QA pass does not certify an ad-network submission or an iPhone container.
