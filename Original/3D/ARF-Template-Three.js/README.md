# Arrow Flow — Three.js playable

The playable includes arrow/conveyor/cannon gameplay, HUD and hints, timed and tap-count session variants, persistent SFX pools, lifecycle gates and eight network packages. A dedicated Arrow Flow editor authors custom boards, conveyors and cannon queues; it adds no GAME_CONFIG or production editor interface.

For level authoring, run `npm.cmd run editor` and open [Arrow Flow Level Studio](http://127.0.0.1:5181/level-editor.html). Follow **Conveyor → Arrows → Cannons**, then **Play test** and **Export level**. See the [simple editor guide](analysis/simple-arrow-flow-editor.md). If the playable dev server already runs on port 5181, open that link without starting another server.

Conveyors support connected-point drawing with a Corner rounding control, or local artist GLB import with surface/border selection, scale and rotation preview. Drawing color applies only to new arrows; existing arrows have a separate edit palette. Cannon containers move freely outside the belt, snap into rows, and expose draggable conveyor targets. Align row and Space evenly arrange all cannon containers without moving their targets. Older level files still open; levels containing artist geometry or free cannon positions use the dedicated editor.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the Vite address, or open `dist/index.html` for the self-contained standalone preview. Reload to reset. Dev and standalone preview use the 60-second countdown, starting on the first successful launch. During `npm.cmd run dev`, select a version with `?variant=3clicks`, `?variant=10clicks`, `?variant=60sec`, or `?variant=90sec` (for example, `http://localhost:5173/?variant=90sec`). Reloading starts a fresh session. `60seconds`/`90seconds` also work. Missing or unrecognized values keep the dev-server default; `npm.cmd run dev:90` still defaults to 90 seconds. URL selection is development-only and is removed from production packages. The requested delivery set is `3clicks`, `10clicks`, `60seconds`, and unlimited `full`; 90 seconds remains available for local previews but is excluded from `build:all`. Timed and unlimited versions still end early on an actual clear or overload. Every ending closes the cannon doors, invokes the configured store redirect, then shows the endcard. The win sound plays immediately on an actual clear, with a 2.2-second pause before the store opens; other endings retain their 0.6-second transition. The entire endcard is clickable in portrait and landscape, and repeated taps remain active. Its title and logo retain the same pixel size when the viewport rotates; landscape does not apply an extra reduction.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run build:all
npm.cmd run validate:delivery
```

Run `build:all` after `build`: the preview build cleans `dist`. Eight packages go to each of `dist/3clicks/`, `dist/10clicks/`, `dist/60seconds/` and `dist/full/`: Applovin, Facebook, Google, Ironsource, Mintegral, Moloco, Unity and Vungle. Google/Mintegral/Vungle use ZIPs; others use HTML. Each ZIP contains root `index.html`.

Additional checks: `validate:browser`, `validate:gameplay`, `validate:cannons`, `validate:session`, `validate:showcase`, `validate:performance`. Playwright Chromium must be installed. Automation mutes output without muting production sound. Tests use Node 24 TypeScript stripping. Test fixtures never enter delivery files.

Asset provenance stays under `analysis/`. `prepare:assets` rebuilds compact geometry/level data; `prepare:audio` copies the four original WAVs; `prepare:ui` exports artwork using Sharp already installed in the sibling Bubble Cash checkout. None executes the supplied reference.

## Where files belong

| Folder | Contents |
| --- | --- |
| `src/` | Shipping game code and selected assets; music and win SFX are in `src/assets/audio/` |
| `levels/` | Current `overload-level.arrow-flow.json` and earlier supplied level files |
| `reference/` | Supplied audio originals, mockup, screenshots, creative brief, video and reference playable |
| `tools/level-editor/` | Editor source; `tools/` also holds browser checks |
| `scripts/` | Build, asset preparation and cannon validation scripts |
| `tests/` | Automated regression tests |
| `examples/`, `schemas/` | Sample levels and authoring format |
| `analysis/` | Reports and original extraction; `experiments/` holds exploratory scripts, `evidence/` results, `screenshots/` captures, `build/` generated staging HTML |
| `dist/` | Generated preview and network deliveries |

`npm run dev` builds from [levels/overload-level.arrow-flow.json](levels/overload-level.arrow-flow.json). Custom-level builds also use 90 seconds. To build another level: `npm.cmd run build:level -- levels/untitled-level.arrow-flow.json preview`. Run tooling from the repository root. Editor browser saves are unchanged by the file moves.

Recreate the approved shorter music loop (7.68 seconds with a baked wraparound crossfade) with `node scripts/prepare-bgm.mjs` (requires FFmpeg); its original is `reference/audio/BGM.wav`. The supplied `sfx_win.mp3` is already 96 kbps and is preserved in `src/assets/audio/`. These sources are embedded by Vite; reference files and analysis tools are not shipped.

- [Delivery report](analysis/delivery-report.md): artifacts, validation and limitations.
- [Audio verification](analysis/audio-verification.md): cue mapping, races and device gaps.
- [Network notes](analysis/network-integration.md): contracts and official sources.
- [Implementation plan](analysis/implementation-plan.md): playable implementation history.
- [Shared editor integration](analysis/arrow-flow-editor-implementation.md): the earlier Arr_LayoutEditor workflow and custom-level build details.

Device audio/performance and official network submission acceptance remain unverified. The slow headless software-renderer sample is not a mobile benchmark. Review before uploading.

In the dedicated level editor, **Arrows > Arrow grid** adjusts block size, horizontal/vertical placement and centering inside the conveyor. Grid settings are saved with the level and included in Undo/Redo; green cells show usable placements.
