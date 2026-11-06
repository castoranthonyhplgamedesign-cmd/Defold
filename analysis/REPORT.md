# Defold workspace analysis

Review date: 2026-11-06 (Asia/Taipei). Scope: analyze the existing five-project translation workspace before further implementation. This review adds analysis, reproducible audit tooling, isolated build evidence, and local preview/QA only. It does not implement or certify all five translations.

## Acceptance standard

The root README is the governing specification: translate the original experience into Defold, reuse original assets, preserve gameplay, controls, rules, camera, visuals, audio, timing, progression and end states, and record conversions. Keep Original unchanged. Compare original and translation with identical viewports and inputs. A build passing is not proof of parity; unresolved differences require resolution or explicit client acceptance.

The user's delivery flow is: comment progress, document work, commit, publish locally, test and QA. No remote push, public hosting or external deployment is part of this review.

## Baseline and current coverage

Paths below are relative to D:\allproject\defold. Each source repository was clean at the recorded inventory. The source branches match the root README.

| Project | Original baseline | Translation coverage at snapshot | Isolated wasm-web build |
| --- | --- | --- | --- |
| BBS Corners | Wide-U-Client_Revision @ cfd9f7b | 3D/BBS_Corners-PA- exists; Lua board/input/HUD, custom materials/rendering, asset conversion and web bridge | PASS |
| Ludios Sort Marble Run | main @ 0a19ded | No mapped translated directory | Not available |
| Conveyor Overload | playable/conveyor-overload @ 5d3e97c | No mapped translated directory | Not available |
| Egypt Case | main @ d993837 | 2D/2026.09.24-CEM-MIP-egypt-case exists; Lua GUI gameplay, configuration and asset inventory, browser audio/SDK bridge | PASS; browser integration still requires verification |
| Unblock Puzzlebox | main @ be16ff7 | 2D/2026.10.14-CCS-MIP-unblock_puzzlebox exists; Lua rules and GUI, browser Matter physics/audio/input bridge | FAIL at bootstrap configuration |

Full baseline commits:

- BBS: cfd9f7b37c71ecbaf6aa70b68cebb11288633a8a
- Ludios: 0a19ded147c48b0e167648eca735f846bca98abf
- Conveyor: 5d3e97c0cc063f3eb3fb8f572ab7d140fd22a00f
- Egypt: d993837484f9f5e6ee2fe9530c704365eed376fc
- Puzzlebox: be16ff7d7afada777f1160be16df37485adac21b

The parent workspace has no Git repository. At inventory, BBS and Egypt each had an unborn master branch with no commits; Puzzlebox had no own repository. This review uses a separate repository in analysis/ to avoid staging anyone else's unfinished game work or changing repository discovery in sibling projects.

Files changed during inspection, including BBS scripts, its template, and Puzzlebox tooling. Findings apply to the recorded copies, not an assertion that live folders are unchanged. evidence/inventory.json contains scan time and file hashes. Each build JSON records the actual staged hashes and differences from the inventory. Missing files observed in the first scan but subsequently created are not listed as final defects.

## Architecture and behavior to preserve

### BBS Corners

Original/3D/BBS_Corners-PA- contains a Unity 2022.3.3f1 project and a Babylon.js PortRoot. The browser port is useful executable reference material, but Unity scene and scripts remain necessary to resolve conflicts. PortRoot/README.md contains scaffold-era status text; inspect current implementation and assets instead of accepting that status literally.

The translation has an integer U-shaped board, occupancy checks, cardinal movement, matching colored exits, BFS hints, dragging, sound, tutorial, timing and click-limit handling. qa/board_test.lua tests 63 cells, 56 bricks, nine exits, occupancy consistency, collision rejection and complete clearing. The default display is 540x960 with orientation handling and a custom render pipeline. Full, four-click and 30-second variants appear in the web template/game code.

docs/asset-manifest.json names cfd9f7b as baseline. It records source geometry from PortRoot/src/generated/wideUModels.ts, a Z reflection and winding reversal, plus hashes for original raster/audio assets. This is useful provenance, but model/material/camera equivalence still needs matched visual captures. main/platform.lua isolates lifecycle, analytics and CTA behavior; the web template suppresses store navigation on loopback by default.

Primary files: main/board.lua, main/game.script, main/hud.gui_script, main/viewport.lua, render/main.render_script, web/template.html, tools/import-assets.mjs and tools/create-scene.mjs.

### Ludios Sort Marble Run

The original lives under Original/3D/Ludios-Sort-Marble-Run/Ludios and uses Unity 2023.1.0f1. Its main scene is Assets/Scenes/Gameplay Scene.unity. There is no Defold destination yet.

Marble.cs permits moving a marble only when an available path and tray reservation exist; blocked taps display animated wrong feedback. Front-of-column movement has priority over multi-hop routes through cleared positions and neighboring columns. Departure unlocks routes after a short delay, while arrival confirms the reserved tray slot. TrayManager temporarily disables new reservations during a completed-tray transition, slides the filled tray back, moves the parent, then brings the next tray forward. The final tray leads to an endcard.

Porting must preserve those reservation/arrival/transition rules, not merely animate colored spheres. Extract actual scene data, prefabs, materials, lighting, path waypoints, intro sequencing, UI, audio and DOTween timing before implementation. Inspect Tray.cs and MarbleColumn.cs alongside Marble.cs and TrayManager.cs to capture matching/failure and route rules completely. No runtime parity or build claim is possible yet.

### Conveyor Overload

Original/3D/ARF-Template-Three.js is a TypeScript/Three.js project with separate gameplay, level data, authoring tools and a substantial Node/browser test suite. There is no Defold destination yet. levels/overload-level.arrow-flow.json supplies the default game board.

The original README describes conveyor/arrow/cannon gameplay, launch-triggered timers, click-limit variants, actual clear and overload outcomes, sound pools, SDK lifecycle gates and an endcard. Requested delivery variants are three clicks, ten clicks, 60 seconds and unlimited full; 90 seconds is a development/custom-level option. Eight network package formats exist. Original acceptance includes early actual wins/losses, configured redirects and distinct end delays; do not replace the game's outcome with a timer-only flow.

The editor is a separate authoring surface. Decide its required translation scope from the client requirements before counting it as part of the game port. Retain level schema compatibility and geometry/source provenance regardless. Existing tests and analysis evidence are valuable reference specifications, but they have not been rerun in this review and do not validate a future Defold implementation.

### Egypt Case

The original is Phaser/TypeScript. src/scenes/GameScene.ts coordinates character dragging, clue completion, wrong-drop feedback, tutorial, audio, lifecycle, progression events and a full-screen completion CTA. A correct drop solves its clue; wrong drops return with feedback. Six characters complete the challenge. Limited iterations count unsolved-character presses, so a click-limit ending is not the same as solving all clues. Original variants include full, two clicks and four clicks.

The Defold implementation uses GUI nodes and top-left 1080x1920 authoring coordinates, with viewport/input conversion and custom rendering. Configuration is read through a JavaScript bridge. The same bridge supplies audio, lifecycle, SDK routing and published QA state. These dependencies must be injected by the final HTML build; compiling Lua alone cannot validate them.

docs/asset-inventory.json records source paths, PNG conversions/dimensions and source SHA-256 values. MP3s are copied for browser playback. Recheck typography, text wrapping, portrait sizes, clue strikes, spotlight/tutorial masks, orientation changes and audio timing against the original. Native feature parity is not established because configuration/audio/SDK behavior crosses the HTML5 boundary.

Primary files: main/game.gui_script, main/game.render_script, config/defaults.json, web/bridge.js and scripts/prepare.py. qa/reference-src is a comparison copy; it must be traced to the recorded original baseline.

### Unblock Puzzlebox

The original is Phaser 3.90 with Matter physics and a 1080x1920 design space. src/constants.ts defines a bottom-anchored fit region, seed 1234, a 49-ball starting pile, nine matching outer rings for a clear, ring transfer/flight timing, gift geometry, danger line and a two-second fail hold. Preserve seeded setup, physics behavior, ring transfer order/capacity, delayed clearing, drop/throw behavior, tutorial, restart and gift/endcard animation.

The translation keeps merge/clear rules in Lua and uses Phaser's Matter solver through web/physics.js. It is therefore an HTML5 implementation; main/game.gui_script explicitly returns from update on non-HTML5 platforms. docs/WORK_LOG.md already records the browser-only backend. This may be suitable for the intended playable output, but it does not establish a native Defold port.

The audited snapshot fails before compilation completes: Bob reports that bootstrap.main_collection '/main/main.collectio' cannot be found. The copied game.project uses /main/main.collection where this toolchain expects the compiled collection reference /main/main.collectionc. Record this as a snapshot build blocker; don't assume fixing this first error proves later resources, generated constants, view module, physics bundle or host injection are correct. The live project was changing during the review.

At the inspected package snapshot, the qa script referred to scripts/qa.mjs, which was absent in the first scan. Verify the final script and local build orchestration after ongoing work settles. scripts/prepare.mjs also uses literal backslash-n separators in generated Lua/TypeScript strings in the inspected source; inspect generated outputs for commented-out code or invalid trailing text before relying on regeneration. These generator observations are static risks, not independently demonstrated gameplay failures.

## Toolchain and reproducibility

- Node v24.14.0, Python 3.14.3 and Git 2.53.0 are available.
- PATH selects Microsoft OpenJDK 21.0.11. Running the shared .tools/bob.jar with it fails with UnsupportedClassVersionError (class version 69 versus supported 65).
- Defold's bundled JDK at C:\Users\Anthony Castor\Documents\Defold\packages\jdk-25.0.4.1+1\bin\java.exe works. Shared Bob reports Defold 1.14.0, SDK d295ed4edff2e49072719835713e625f409849f1.
- The working browser build platform is wasm-web. An initial audit harness attempt using js-web was rejected by this Bob and corrected before the recorded final builds; that was a harness issue, not a game defect.
- No standalone lua or luajit executable was found on PATH, so the BBS Lua board test was inspected, not executed separately.
- Build only copied project files under analysis/staging. No dependency installation, import script, build or asset conversion was run in Original.

Reproduce from analysis/ with `python audit.py inventory`, then `python audit.py build`. The script preserves existing staging files so retrying tests the same copies; use a new isolated analysis directory for a fresh revision. Generated files, source manifests and logs belong to that snapshot. Its build is a direct Bob baseline check, not an execution of every project-specific packaging script.

Build command shape: bundled Java 25, shared bob.jar, --root <snapshot>, --platform wasm-web, --variant debug, --max-cpu-threads 2, --archive resolve build bundle. Full commands, stdout, stderr, exit status and hashes are in evidence/*-build.json. Bob's temporary-directory cleanup warnings occurred even on passing builds and are preserved in the logs.

## Risks and next implementation order

1. Finish one vertical slice to proven parity before spreading work across all five games. BBS has a compiled browser bundle, board logic, conversion manifest and a useful logic test; it is a reasonable first candidate if no client priority supersedes it.
2. Stabilize the exact revision and HTML packaging of each active port. Keep the baseline SHA, toolchain SHA and generated-artifact hashes in every delivery record. Commit each translation's intended files only after reviewing its pending changes.
3. Validate original-versus-Defold startup, controls and an actual completed playthrough. Add failed/limited sessions, restart, idle tutorial, orientation changes, pause/resume and repeated CTA checks. Forced end-state fixtures are useful diagnostics but do not establish a natural win.
4. Compare the same frames and timestamps at 390x844 and 844x390, plus the original's required tablet dimensions. Capture tutorial, interaction, feedback, effect and endcard states. Record visible and audible mismatches separately.
5. Verify browser gesture audio unlocking, mute/unmute and interrupted playback. Test SDK behavior with local stubs and navigation interception. Actual mobile audio/performance and ad-network submission acceptance remain separate unverified requirements.
6. Build Ludios and Conveyor only after asset/scene/level extraction and behavioral checklists are pinned. Preserve recognizable asset names and conversion provenance.

Every translation needs its own setup/build README, source baseline, conversion inventory, behavior/viewport matrix, evidence links, remaining differences and final commit/artifact identity. Current isolated build passes establish compilation only; no project is certified complete by this analysis.

## Local publication and QA

The analysis report and passing snapshot bundles are published only from analysis/local-publish on 127.0.0.1:18967. This location is generated and ignored by the analysis repository. The server does not expose Original or the workspace root. Run `python publish.py`, then `python serve.py`; stop the server with Ctrl+C in its terminal session. Exclusive socket binding avoids collisions with other local preview tasks.

Browser QA results and limitations will be recorded in evidence/browser-qa.json and QA.md after publication. The report is an assessment of the existing work; failures found in a snapshot are documented rather than silently changing active game implementations.
