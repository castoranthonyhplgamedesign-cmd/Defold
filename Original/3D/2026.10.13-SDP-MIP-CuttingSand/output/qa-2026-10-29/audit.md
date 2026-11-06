# CuttingSand project audit and muted chaos QA

Date: 29 October 2026, Asia/Manila. Scope: the current working tree in `G:\downloads\Work\Phaser\2026.10.13 SDP, MIP, CuttingSand`, including its pre-existing changes. Production source was preserved. Distribution files were rebuilt, and diagnostic scripts/evidence were added only under this output folder.

The core gameplay and build checks pass. Four runtime defects were reproduced in generated HTML: conflicting pause sources, lost SDK mute, a blank boot after a supported relative asset override, and duplicate store opens after a blocked popup. These warrant correction before handoff.

## Results

| Check | Result |
| --- | --- |
| TypeScript | `npm.cmd run typecheck` passed. |
| Production build | `npm.cmd run build:all` passed its 54-output self-check. |
| Independent distribution inspection | All 54 outputs passed; 18 ZIPs contain only root `index.html`; six handoff copies match their originals. |
| File budgets | Largest HTML: 3,718,766 bytes; marked config: at most 15,546 bytes. |
| Asset metadata | All 34 WebP dimension/format entries match their files. |
| Full gameplay suite | Passed audio-call checks, portrait and landscape clears, click/time limits, jam, soft-lock, swipe behavior, and fifth-press cutoff. |
| Full clears | 27 taps and all 31 buckets in each orientation; approximately 53 seconds portrait and 51 seconds landscape on this desktop. |
| Chaos matrix | All 20 scenarios completed: swipe 10/10 passed; tap 9/10 stock runs, with the remaining flag proven to be a stale-snapshot false positive. |
| Stress coverage | 1,562 logged actions, 231 rotations, and 73 pause/resume cycles across the 20 scenarios, plus the targeted probes. No reported sand-accounting or bucket-integrity violations. |
| Extra cancellation/resize probe | Passed recovery after `touchCancel`, a new swipe released 817 grains, all 31,752 grains accounted for, and five viewport/DPR changes retained matching CSS/bitmap dimensions. Fractional bitmap dimensions round to integers. |

Browsers were headless and muted. Store calls were intercepted; MRAID/Luna signals were simulated. Chrome's renderer did not work inside the execution sandbox, so successful browser tests ran outside it.

## Runtime defects

### 1. Unity pause and MRAID state can override each other

At `src/networks.ts:180`, Luna pause/resume directly controls the scene. The shared lifecycle function at line 60 retains document/MRAID state but no independent Luna pause flag.

Reproductions in the built Unity playable:

- `luna:pause` froze the published frame at 56, but two audio sources remained active.
- MRAID `audioVolumeChange(50)` then advanced the paused scene from frame 56 to 114.
- MRAID `exposureChange(0)` froze it at 114; `luna:resume` advanced it to 173 while exposure remained zero.

Retain each independent pause reason and apply one combined scene/audio decision. Evidence: [targeted.json](targeted.json), first record.

### 2. SDK mute is lost after input or foregrounding

`src/audio.ts:39` and `:50` calculate mute from gesture unlock and `GAME_CONFIG.MUTE`. They do not retain the mute requested by `src/networks.ts:182`.

Both built-playable probes changed `muted: true` to `false`: `luna:mute` followed by the first pointerdown, and `luna:mute` followed by document hide/show. Combine SDK mute with config mute, visibility, and gesture unlock. Evidence: [targeted.json](targeted.json), second record.

### 3. A relative asset override prevents the game from booting

The public config resolver accepts relative asset paths (`src/config.ts:236`), while the production Vite transform throws whenever Phaser's external loader is reached (`vite.config.ts:22`).

Setting `ui-hand.path` to the existing relative file `../../../Assets/Runtime/images/ui-hand.webp` caused an uncaught `External asset loading is disabled` error. The page remained blank and never published gameplay state. Reconcile the advertised override contract with the production loader, and handle load failures gracefully. Bundled data-URI defaults work. Evidence: [targeted.json](targeted.json), final record.

### 4. One end-card tap can issue two store-open attempts

`src/networks.ts:223` arms a generic release-event retry for 1.2 seconds after a blocked popup, including an automatic time-limit redirect. A later explicit end-card tap can invoke both that retry and its normal CTA handler.

With the first automatic `window.open` returning `null`, one tap about 600 ms later produced two more calls, at 4513.2 and 4515.4 ms. Scope retries to the initiating gesture and cancel stale retries before a new explicit CTA. Evidence: [targeted-popup.json](targeted-popup.json).

## Project analysis

The responsibility split is effective: `GameScene` wires modules; typed arrays hold sand and conveyor state; `PictureHd` updates changed painting bands; moving grains share a canvas; feedback objects are reused. Design-space wrappers preserve tween geometry through resizing, and both resize paths resize before updating zoom. See [code-analysis.md](code-analysis.md) for source references.

Two additional contract gaps were confirmed by source inspection:

- `BootScene.ts:29` loads all 34 images and nine soundtracks before gameplay. Their source bytes total 1,461,272. The documented critical/deferred loading split is absent; physical-device startup impact has not been measured.
- Background slot `anchorPoint`, `scale`, and `resizeBlocked` are published but ignored by the cover-fit background renderer (`GameScene.ts:453`). The generated guide acknowledges this exception. Asset replacement itself works.

The independent output review verified network meta tags, MRAID injection, official Google Exit API scripts and literal `ExitApi.exit()` calls, config/payload separation, ZIP contents, and handoff copies. Full details: [build-audit.json](build-audit.json).

## Test interpretation and remaining limits

The stock tap chaos matrix returned 9/10. Run 5 (seed `20292705`, `SAND.columns: 40`) flagged a tap below the picture. A test-only copy exposes the actual click counter without changing gameplay. At action 15, the runner's snapshot said 7 while the live counter already said 8; after the below-picture tap, both said 8. The tap did not increment the live counter. This proves the assertion sampled a stale previous frame after a burst. Direct-counter records and a navigation journal are saved under `instrumented-isolated/cuttingsand_default/`; the raw published-state assertion is retained rather than silently turned green.

A preliminary diagnostic rerun switched to another test variant midway through execution. That run is excluded. The original browser driver chooses a random port from a shared range and has no pending-command timeout. An output-only driver now reads the debug port assigned to its own browser profile, rejects stalled commands, and records navigations. Swipe cases 1–6 passed with the stock driver; cases 7–10 passed with this isolated driver. Every isolated run stayed on its intended HTML. Production QA scripts were preserved.

The existing runner does not test overlapping pause sources, `touchCancel`, blocked-popup retries, or relative asset boot failures; it also omits bitmap-height validation. Supplemental probes supplied those checks. Its mock SDKs and intercepted store opens do not replace real network-validator or device testing.

Desktop performance used one isolated browser, a 390×844 viewport at DPR 2, D3D11 on an NVIDIA RTX 2060 SUPER, and five-second idle/busy phases for each mechanic at normal and 4× CPU throttling. Busy gameplay averaged 165.01/164.61 updates per second for tap and 165.01/158.61 for swipe, respectively, on this 165 Hz host. Across all eight phases, the largest sampled frame interval was 18.2 ms, no frame interval exceeded 33.4 ms, and no long task was recorded. See [performance.json](performance.json). These are short desktop diagnostics; they do not establish mid-range Android performance.

Physical Android/iOS frame rate, audible playback, actual store return, and network-host SDK behavior remain outside this local test.

## Reproduction and evidence

Run the normal checks from the project root:

```powershell
npm.cmd run typecheck
npm.cmd run build:all
$env:QA_GPU='1'
node scripts/qa/play.mjs
$env:QA_CONCEPT='cuttingsand_default'
node scripts/qa/chaos.mjs 10 20261029
$env:QA_CONCEPT='cuttingsand_swipe'
node scripts/qa/chaos.mjs 10 20261029
```

Use sequential stock browser runs to reduce interference. Diagnostic scripts and all logs are in this folder. [findings.json](findings.json) contains machine-readable defect descriptions; [summary.json](summary.json) contains build and chaos counts. Original suite screenshots live in the project's `qa-screenshots` folder; [targeted-portrait.png](targeted-portrait.png) records the cancellation/resize recovery probe.
