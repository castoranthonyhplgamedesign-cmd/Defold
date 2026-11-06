# Mystery Master — Defold mystery puzzle

Current standalone delivery: `D:\allproject\defold\output\MysteryMaster.html`. See `docs/BRANDING.md` for the authorized rename, icon provenance and single-file publishing command. The original Egypt Case source mapping below is retained for traceability.

Current source baseline: `reskin` at `4ed0abc9fe3a3568e9d6557491a6029b47747ae5`, from the detached `qa/reskin-src` reference worktree. The original main-branch repository remains unchanged. The translated repository is on branch `reskin`. Publishing is local only; no remote deployment or push is configured. See `docs/RESKIN.md`.

The game executes in Defold: Lua handles rules, input, tutorials, animations and GUI rendering. A browser boundary queues pointer events, decodes the source WebP assets and MP3 audio, rasterizes the original font, and calls ad SDKs. It does not run Phaser. The ignored `qa/reskin-src` worktree runs the selected reskin reference for comparison on port 8176.

## Build and run

Tools used: Defold editor/engine revision `d295ed4edff2e49072719835713e625f409849f1`, its bundled JDK 25, Python 3.14 with Pillow and fontTools, Node 24, and Chrome. Download Bob from `https://d.defold.com/archive/d295ed4edff2e49072719835713e625f409849f1/bob/bob.jar` to `tools/bob-fast.jar`. Tools are ignored in Git; scripts and package locks are committed.

```powershell
npm.cmd ci --prefix tools
python scripts/prepare.py
& 'C:\Users\Anthony Castor\Documents\Defold\packages\jdk-25.0.4.1+1\bin\java.exe' -jar tools/bob-fast.jar --settings config/html5.settings --platform wasm-web --architectures wasm-web --variant release --archive --bundle-output bundle resolve build bundle
python scripts/publish.py
python -m http.server 8174 --bind 127.0.0.1
```

Open `http://127.0.0.1:8174/dist/`. The local preview supports `?variant=2clicks`, `?variant=4clicks`, or `?variant=full`. Generated per-network HTML and configured ZIPs live under `dist/<variant>/`. `dist/GAME_CONFIG.md` documents the emitted configuration. Do not open HTML by double-clicking it; use the local server.

Open `game.project` in the installed Defold editor to inspect and edit the project. The supported delivery and acceptance target is HTML5. Native editor builds load the converted PNG copies; audio and ad SDKs use the HTML5 bridge.

## QA

```powershell
npm.cmd ci --prefix tools
node tools/capture.mjs http://127.0.0.1:8174/dist/ defold
node tools/qa.mjs
python scripts/compare.py
node tools/record.mjs
```

Reference startup: create an ignored copy in `qa/reference-src`, run `npm.cmd ci`, `npm.cmd run typecheck`, `npm.cmd run build`, then `npm.cmd run dev -- --host 127.0.0.1 --port 8173 --strictPort`. Tests launch Chrome headless with audio muted and intercept store redirects. They never install or open a store page.

See `docs/BASELINE.md`, `docs/WORKLOG.md`, `docs/QA.md`, and `docs/asset-inventory.json` for evidence, implementation decisions and remaining acceptance limits. A working build alone is not a claim of client acceptance.

The embedded GZip fallback is fflate 0.8.2 (MIT); its license is in `docs/FFLATE_LICENSE.txt`. The native browser decompressor is preferred when available. Build and GUI APIs follow the [Defold Bob manual](https://defold.com/manuals/bob/), [HTML5 manual](https://defold.com/manuals/html5/), and [GUI reference](https://defold.com/ref/gui-lua/).

Original compressed images, the variable font, converted preview assets and MP3s are included in this repository. Normal builds do not require the sibling Original directory. Asset preparation imports missing originals when first bootstrapping, then uses the local copies and preserves the translated project's editable defaults.
