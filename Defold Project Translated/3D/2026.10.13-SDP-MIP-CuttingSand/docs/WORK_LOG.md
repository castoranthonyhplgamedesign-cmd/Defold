# Work log

## 2026-11-07 — clean rebuild from cantReach

- User explicitly requested rebuilding the project from the work branch, rather than only switching branches.
- Verified active Defold branch `cantReach`, source commit `e256179ab2341abaf432dc7bef7bebfc3328e48d`, and a clean working tree before building.
- Ran Bob `clean`, then rebuilt the WASM release engine/project and regenerated the single-file package from that checkout.
- Replaced the existing `D:\allproject\defold\output\Sand-Slice.html` without creating an additional filename: 8,091,336 bytes, SHA-256 `666b72ccf83c9dc1e1af4d75c151872219f38be66da303dd3eb73c89cf0bc5f9`.
- Tested the regenerated file directly with networking disabled. All eight standalone QA checks passed: branding/icon, offline boot, swipe/audio, click-limit end card and local CTA, rotation, tap mode, unique output name, and zero external/companion requests or runtime errors.
- Evidence: `qa/rebuild-clean.log`, `qa/build.log`, `qa/rebuild-cantReach.json`, `qa/single-html-package.json`, `qa/single-html-results.json`, and refreshed `qa/single-html/` captures. No original source files were changed.

## Sand Slice rename and single-file delivery

- User requested a similar game name, a new icon/title, and exactly one HTML in `D:\allproject\defold\output`, with no duplicate names/files. Chosen name: **Sand Slice**; output: **Sand-Slice.html**. Existing output names were checked and no collision existed. Other games' files are preserved.
- New icon generated using the built-in image-generation skill/tool, then copied into `assets/branding/icon-source.png` and resized to `icon.png`. Exact visual brief and generation method are recorded in `BRANDING.json`. New SAND / SLICE wordmark uses the bundled original Nunito font. These brand replacements are explicitly authorized and supersede the original-logo preservation requirement.
- Updated Defold project title/executable, HTML title and application metadata, favicon/touch icon, end-card wordmark and accessible CTA name. Source directory remains mapped to its original baseline.
- `scripts/package-html.mjs` embeds gzip/base64 WASM, engine JavaScript, every archive piece and original audio. In-memory file reads replace loader requests; script execution is inline. Network preloads are removed, direct file startup is supported, and file previews intercept store navigation.
- The packager writes one stable filename, rejects normalized duplicate names, and does not create companion files or version-suffixed copies in the output directory. QA will open the exact delivered HTML with networking disabled and record results under `qa/single-html*`.
- Delivered `D:\allproject\defold\output\Sand-Slice.html`: 8,091,556 bytes; SHA-256 `6149ac6988f27739f52b01f92ccd557fd6221ab1a9e8bb354d25cd9256efc799`. All 19 engine/archive/audio resources are embedded; artwork/fonts live inside the embedded archive. No companion files are required.
- Offline QA passed from the actual `file://` delivery: correct title/metadata/new icon, engine boot, real swipe and tap interactions, audio unlock, five-click end card, renamed accessible CTA, repeated local CTA, rotation, and unique output filename. Zero external/companion requests and zero runtime errors. Captures: `qa/single-html/`; reports: `qa/single-html-package.json` and `qa/single-html-results.json`.

## 2026-11-06

- User selected CuttingSand and authorized: comment work, document, commit, publish locally, test and QA. No public deployment.
- Original baseline: `cantReach` at `8a241d35af7e59acaa1aa092505dafab9db7ea40`; no tracked modifications at initial inspection.
- Original has 189×168 picture grains (31,752), 27 segmented shapes, a funnel, conveyor, weighted bucket stacks, three waves, tap/swipe versions and 5/10-click or 90-second deliveries. Full mode retained for review.
- Reference staged in ignored `tools/reference`; its Vite server binds 127.0.0.1:8181. Portrait, landscape, opening and cut captures are under `qa/reference`.
- Original assets converted to PNG for Defold and audio copied unchanged. Grain data, original segmentation, seeded shades and HD ownership exported offline. `docs/ASSET_MANIFEST.json` records source paths and hashes.
- Implemented Lua grid, bucket/conveyor model, orchestration and GUI rendering. Browser services handle audio, input collection and SDK lifecycle. No Phaser runtime is bundled.
- Target: Defold HTML5/WASM. Current Bob requires Java 25 and platform `wasm-web`; Java 21 / `js-web` invocation failed and was corrected. Windows script policy blocked a PowerShell build script; replaced it with a Node build entry point.
- Initial implementation is pending build/runtime QA. Final measured results and residual differences will be recorded after local publishing and verification.

## Local verification and corrections

- Initial source commit: `02f8908`, before starting the loopback server at `http://127.0.0.1:8182/`.
- Defold 1.14.0 / engine `d295ed4` compiled successfully. Runtime QA found and corrected custom resources being declared in the wrong settings section, the dynamic texture format constant, missing alpha channels in decoded PNG data, authored-coordinate projection, and texture vertical orientation.
- The original procedural praise painter is now executed offline with the original font. Ring/glow assets use the original drawing instructions. Browser audio reuses the original `SustainedAudio` fade, content-bound detection, and two-voice crossfade code with a WebAudio adapter; Phaser itself is not shipped.
- `npm test`: all 18 original SandGrid tap/cut snapshots match exactly (static checksum, moving-grain checksum, remaining/loose/exited counts). Input eligibility, click/time cutoffs, end states, real jam/stall watchers, reservations and grain conservation pass. A real three-wave Lua hint solve completes through all 31 buckets.
- Browser QA initially passed eight cases: portrait, landscape, tap, cut, 5 clicks, 10 clicks, mid-session rotation, pause/resume and audio mute. CTA tests record local redirects and verify end-card taps remain active. Final reruns and long-duration results are stored under `qa/`.
- A real browser hint-following playthrough reached all three waves, completed all 31 buckets and solved the level with all 31,752 grains accounted for. The actual 90-second browser timer passed at 90,157 ms wall time. Both long checks reported zero browser errors.
- The final build after presentation/audio corrections passed all eight short browser QA cases again. The upper painting's measured 270×90 region differs from the original by mean absolute RGB 0.102/255; that is a region-specific check, not a full-frame fidelity certification.
- Follow-up implementation commit: `6f893e2`. Final QA evidence is committed separately so results remain reviewable.

## Scope of verification

The deliverable is a local Defold HTML5 project and review bundle, with both mechanics and all source delivery-length choices. It is not an ad-network submission package. Physical-device performance/audio, official SDK previewers, single-file network packaging and the original external configuration-editor workflow have not been certified. The original optional `OPENING_STYLE=pour` and arbitrary replacement-image/editor configurations are not acceptance-tested; the checked-out default uses the reveal opening. Native builds are not supported by the browser-services backend. These limits must not be represented as approved parity exceptions.

Relevant engine API references used while correcting the integration: [custom resources](https://defold.com/manuals/file-access/) and [dynamic GUI textures](https://defold.com/ref/gui-lua/). Asset/source provenance remains in `ASSET_MANIFEST.json`.

## Confirmed cantReach working branch

The user explicitly selected `cantReach` on 2026-11-07. The translated Defold repository now uses a local branch named `cantReach`; it retains the existing implementation and Sand Slice branding. The original repository was already on `cantReach` at `8a241d35af7e59acaa1aa092505dafab9db7ea40`, which matches the live remote branch. The asset manifest and README already identify that same source baseline, so no gameplay migration or replacement artwork was necessary.

Reran gameplay tests: all 18 original-grid oracle snapshots passed, together with input, limits, timer, endings, conservation, reservations and the three-wave/31-bucket solve. Changed standalone browser QA to run visibly and reran it against the exact exported HTML with networking disabled. All eight assertions passed, including tap/swipe, audio unlock, endcard, rotation, local CTA safety and absence of companion requests/runtime errors. Startup and endcard captures were inspected. The stable export remains Sand-Slice.html, 8,091,556 bytes, SHA-256 6149ac6988f27739f52b01f92ccd557fd6221ab1a9e8bb354d25cd9256efc799. No duplicate export or runtime rebuild was needed. The existing local preview binds only 127.0.0.1:8182. Original remains unchanged; no remote publish or push was performed.
