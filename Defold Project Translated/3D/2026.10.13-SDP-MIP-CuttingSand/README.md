# Sand Slice — Defold port of CuttingSand / Cantreach

Original: `D:\allproject\defold\Original\3D\2026.10.13-SDP-MIP-CuttingSand`, branch `cantReach`, commit `8a241d35af7e59acaa1aa092505dafab9db7ea40` (Client Revisions).

This project translates the checked-out Phaser experience into Defold. Gameplay, grain simulation, bucket queues, conveyor, input interpretation, waves, and rendering live in Lua. JavaScript handles browser input events, audio and host SDK access. The Phaser runtime is not shipped. The current build target is HTML5/WASM; native platform support is outside this implementation.

The user-requested public name is **Sand Slice**. `branding.json` owns the name and stable output filename. The new icon and end-card wordmark replace the original branding by explicit user request; source repository/directory names stay traceable to the original.

Single-file delivery: `D:\allproject\defold\output\Sand-Slice.html`. It embeds the engine, WASM, archives, artwork, fonts and audio and opens directly from disk. No companion files are required. `npm.cmd run package:html` regenerates this exact filename without timestamp copies; it leaves other games' outputs intact. `npm.cmd run qa:html` tests the actual delivered file offline. Package and QA reports are under `qa/single-html-*.json`.

The source has both tap and swipe mechanics. Local URLs select `?mechanic=tap` or `?mechanic=cut` and `?variant=5clicks`, `10clicks`, `90seconds`, or `full`. Missing options select swipe/full. Every ending opens the CTA and shows the end card. On loopback, CTA calls are recorded and never open a store tab.

## Setup and build

Run commands in this directory. Use `npm.cmd` on Windows if PowerShell blocks npm scripts.

1. `npm.cmd ci` installs asset and QA tools.
2. Stage a copy of the original `src`, `scripts`, `Assets`, `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, and `vite.config.ts` in ignored `tools/reference/`. Run `npm.cmd ci --prefix tools/reference`. Preserve Original unchanged.
3. `npm.cmd run prepare:assets` converts original WebP assets to PNG and exports original grain/shape/pixel ownership data. See `docs/ASSET_MANIFEST.json` for provenance.
4. `npm.cmd run brand` rebuilds the new wordmark and resizes the generated icon. `npm.cmd run build` generates `web/template.html`, builds Defold WASM, and copies original audio into `bundle/Sand Slice/audio/`. It uses the workspace `.tools/bob.jar` and installed Defold Java 25. Override `DEFOLD_BOB` and `DEFOLD_JAVA` if installed elsewhere.
5. Commit source and documentation before publishing for review.
6. `npm.cmd run publish:local` serves the bundle at **http://127.0.0.1:8182/**. It binds only loopback. Stop with Ctrl+C.
7. `npm.cmd test` runs original-grid oracle comparisons and Lua gameplay checks using workspace LuaJIT (`DEFOLD_LUA` overrides it).
8. `npm.cmd run qa` runs browser QA using installed Chrome. `node scripts/qa-long.mjs` checks a real complete solve and the actual 90-second timer. Evidence lives in `qa/`.

The comparison reference runs from `tools/reference`: `npm.cmd run dev -- --host 127.0.0.1 --port 8181 --strictPort`. From this project's root, `node scripts/capture-reference.mjs` captures it without opening store links.

## Architecture and acceptance

`modules/grid.lua` ports support, shape taps, swipe cuts, leftover crumbling and falling sand. `rack.lua` and `belt.lua` own grain accounting, reservations and bucket progression. `game.lua` coordinates lifecycle, hints, three waves, limits, failures and endings. `view.lua` uses original art and dynamic Defold textures for the HD picture and moving grains. `web/host.js` owns browser services. Offline asset exports use the original shape segmentation and HD ownership algorithms, preserving the source's artwork and shape boundaries.

The original uses a 1080×1920 composition fitted and centered in the viewport. Rotation preserves authored coordinates and simulation/animation progress. All generated source conversions are local; no new art or placeholder assets are used.

Build success does not establish parity. See `docs/QA_CHECKLIST.md` and `docs/WORK_LOG.md` for verification status and remaining differences. Do not call this translation complete until behavior and output differences are resolved or explicitly accepted.

The single-file local delivery is not certified for an ad network and does not port the external configuration-editor toolchain. Physical-device performance/audio and SDK submission acceptance remain unverified. The baseline reveal opening is implemented; alternative opening/configuration editor cases require separate comparison. Builds default to debug for local diagnostics; set `DEFOLD_VARIANT=release` for a release bundle. The delivered single HTML uses a release engine.

Current local Defold working branch: `cantReach`, selected explicitly by the user. This branch retains the Sand Slice rename and already matches the source `cantReach` baseline above. The original and translated repositories have separate Git histories.
