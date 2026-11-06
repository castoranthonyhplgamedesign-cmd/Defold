# Ring Sort — local QA report

Date: 2026-11-06T15:26:17.385Z

The Defold HTML5 local build passes 15/15 functional checks, five viewport/DPR checks, source verification and exact seeded-setup comparison. No browser script/resource errors were recorded in this functional run. This is a local implementation and QA result, not client acceptance or ad-network certification.

## Open locally

[Play 60 seconds](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=60sec) · [3 clicks](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=3clk) · [10 clicks](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=10clk) · [HUD build](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=60sec&hud=1)

The server binds only 127.0.0.1. Store redirects are suppressed and logged locally. No cloud publication or remote Git push was performed.

## Functional results

| Check | Result |
|---|---|
| Defold boots with original seeded 49-ball pile and launcher | PASS |
| Background presses do not count | PASS |
| Press-drag-release drops one ball and advances NEXT | PASS |
| Audio unlocks on gesture and host pause/resume gates it | PASS |
| Rotation preserves click count, elapsed session and ball identity | PASS |
| 3-click variant ends on third press with one automatic redirect | PASS |
| Endcard tap routes through local CTA and records CTA_CLICKED | PASS |
| Real danger countdown reaches failure presentation | PASS |
| Controlled physical gift-floor contact reaches win and opens gift | PASS |
| Controlled 6+3 ring merge clears the complete nine-ring run | PASS |
| Mixed donor exposes its inner color after whole-run transfer | PASS |
| Capacity reservations never exceed the 20-ring atlas limit | PASS |
| HUD restart creates a fresh pile while keeping session clicks | PASS |
| 10-click variant ends on the tenth player-ball press | PASS |
| 60-second variant starts on first valid input and ends after real elapsed play | PASS |

The danger test pins a real physics ball above the rope and waits for the real countdown. The gift-floor test moves the physical gift to floor contact and exercises the actual collision-to-win path. Merge fixtures use the production Lua rules with controlled starting rings. These are controlled coverage, not an unassisted full-board solve.

## Original comparison

Baseline: `main @ be16ff7d7afada777f1160be16df37485adac21b`. The original working tree is unchanged. Observation hooks are applied only to the ignored staging copy.

- All 49 settled ball centers: maximum error 0 design pixels.
- All 49 ring-color arrays: exact match.
- Gift center: error 0 design pixels.
- Original MP3s: seven byte-for-byte matches.
- Converted asset manifest: 146 SHA-256 checks pass.
- Staged source TypeScript typecheck and browser JavaScript syntax checks pass.

[Portrait comparison](screenshots/comparison-portrait-start.png) · [Landscape comparison](screenshots/comparison-landscape.png) · [Endcard comparison](screenshots/comparison-endcard.png)

Animation captures are taken at different wall-clock phases; hand positions and animation progress can differ between screenshots. Exact solver comparison uses the synchronous settled state, avoiding screenshot timing ambiguity.

## Viewports and performance observations

| CSS viewport | DPR | Canvas pixels | Frame callback FPS | p95 frame interval ms |
|---|---|---|---|---|
| 390 x 844 | 1 | 390 x 844 | 60.0 | 17.3 |
| 844 x 390 | 1 | 844 x 390 | 60.0 | 17.4 |
| 768 x 1024 | 1 | 768 x 1024 | 60.0 | 16.8 |
| 1024 x 768 | 1 | 1024 x 768 | 60.0 | 16.8 |
| 390 x 844 | 2 | 780 x 1688 | 60.0 | 16.8 |

Measurements are short headless Windows Chrome frame-callback samples, not a mobile hardware certification or a complete chain-reaction performance profile. Device-level 60 FPS / minimum 30 FPS requirements remain unverified.

## Build and practical limits

- Installed Defold release builder successfully compiled and bundled wasm-web.
- Local multi-file bundle: 14,428,033 bytes (13.76 MiB), including engine, lossless converted texture archives and audio.
- This bundle is **not** a sub-5-MB single-file ad creative. Network packaging/size optimization and network preview certification are not included in this local publication.
- Rendering and gameplay orchestration are Defold/Lua. Matter, seeded setup utilities, WebAudio and browser lifecycle services run through the documented JavaScript bridge. Native desktop/mobile builds are not supported by this backend.
- Original audio files and browser unlock/mute/pause behavior were verified; auditory parity on iPhone/Android ad preview apps was not tested.
- No unassisted full-clear playthrough or client approval is claimed. The repository-wide acceptance requirements therefore remain a separate acceptance gate.

## Reproduce

See [README](../README.md), [work log](../docs/WORK_LOG.md), `results.json`, `viewport-results.json`, `solver-parity.json`, `source-verification.json` and `publish-manifest.json`. The publish manifest hashes every locally served build file.

Official implementation references: [Defold builder](https://defold.com/manuals/bob/), [HTML5](https://defold.com/manuals/html5/), [HTML5 Lua bridge](https://defold.com/ref/html5-lua/), [texture profiles](https://defold.com/manuals/texture-profiles/).

## User-requested Ring Sort branding update

Date: 2026-11-06T15:43:34.336Z. 6/6 targeted branding checks pass with no browser errors. The existing 15-check gameplay and five-viewport results above are the prior gameplay baseline; the rebrand changes artwork and metadata only.

New concentric-ring icon, RING SORT end-card wordmark, browser/project/package names, favicon, Apple touch icon, manifest icons, Windows icon configuration and accessibility label are updated. The original repository remains unchanged.

[Branding prompts and saved assets](../docs/BRANDING.md) · [Portrait end card](screenshots/ring-sort-endcard-portrait.png) · [Landscape end card](screenshots/ring-sort-endcard-landscape.png)

## Single-file delivery

Final file: `D:\allproject\defold\output\Ring Sort.html`. Size: 13,472,353 bytes. SHA-256: `ff62800d8a395e377fe76a20b7276153f3688dad60b3981f5555968a06e6dc72`.

All five offline single-file checks pass after copying only this HTML into an otherwise empty directory. Engine, game archives, audio, icons and scripts are embedded. No network or sibling-file requests occurred. Repeated exports overwrite Ring Sort.html; the obsolete Sinonimus.html is removed. Unrelated games in the output folder are preserved. The 15 gameplay baseline checks above predate this packaging-only change.
