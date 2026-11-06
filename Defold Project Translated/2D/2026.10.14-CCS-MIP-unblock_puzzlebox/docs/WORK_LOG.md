# Work log

## 2026-11-06

- Authorized scope: port Puzzlebox to Defold, document, commit, publish on loopback only, test and QA.
- Source: main @ be16ff7d7afada777f1160be16df37485adac21b. Original kept unchanged.
- Target: Defold HTML5 with Lua gameplay/rendering and original Phaser Matter solver through a JavaScript bridge. Native builds are not supported by this backend.
- Fidelity baseline is executable source; HANDOFF.txt is historical. Current GameScene.toEndcard auto redirects for fail as well as win/limits.
- Reference staging copy lives in ignored tools/reference so npm/build output never modifies Original.

- Implemented source-sized PNG atlas conversion (126 images), font reuse, and unchanged MP3 copies. Generated asset provenance and SHA-256 manifest.
- Lua owns whole-run transfer, capacity reservation for in-flight rings, nine-ring clear, receiver-only rechecks, launcher, click/time limits, failure countdown, progress events and end-state sequencing.
- Browser bridge owns exact pinned Matter geometry, JavaScript Mulberry32/initial coloring, first-gesture WebAudio, pointer capture and host lifecycle. Loopback store opens are suppressed and recorded.
- Installed builder requires platform wasm-web and compiled bootstrap/input resource suffixes. Build script now uses those settings.

## Validation and corrections

- Initial commit: 07d7322 (implementation before local browser QA).
- Defold HTML5 compilation and release bundling pass. Java's native-access and temporary-directory cleanup warnings are toolchain diagnostics, not compile failures.
- Initial smoke test raced server startup; subsequent warm startup passed. Added an inline empty favicon to remove an unrelated 404.
- A dropped-ball assertion originally sampled after a legitimate merge had removed the ball. It now samples 180 ms after release and separately verifies NEXT advancement.
- Source/port screenshots exposed a seeded-pile mismatch. Added observation-only hooks to an ignored reference copy, comparing all initial body geometry and ten solver steps. Found Phaser MatterPhysics constructor overrides in Resolver (rest thresholds, position damping/warming and friction multiplier). Applying those produces exactly zero error for all 49 settled balls and the gift, with all 49 ring-color arrays matching.
- Removed an accidental finite mass override on static walls; added source rolling damping only after initial settle.
- Fixed NEXT scaling retention, gift rotation around its actual anchor, and replaced scaled ring-flight art with constant-width Defold pie outlines plus white highlights.
- Added fixed-step interpolation so rendering remains smooth between physics steps.
- The 60-second test exposed Defold's capped frame delta under load. Timer now uses uncapped visible browser elapsed time; animation/physics dt remains bounded. Visibility/host pause are excluded.
- Corrected HTML5 canvas sizing to current viewport with the original DPR cap of 2, using Defold's GUI adjustment with stretch nodes. Earlier disabled adjustment was valid only for a fixed-size canvas and cropped a resized canvas.
- Cached unchanged node geometry, texture, color and layer assignments to avoid redundant GUI engine calls.
- Tests distinguish physical/pointer interactions from explicitly controlled merge, danger and win fixtures. No unassisted full-clear claim is made.

## Final local QA outcome

- Cached 20 common complete ball patterns from the original ring atlas using source-style run clipping. The manifest now contains 146 converted images. Typical idle pile rendering falls from hundreds of layered ring nodes to one sprite per ball.
- Final desktop samples: approximately 60 FPS in all five portrait/landscape/tablet/DPR configurations. These are not mobile hardware certification.
- Hardened the loopback HTTP server with HTTP/1.1 keep-alive and a 128-connection backlog after transient parallel-download refusals. Added bounded retries for audio transport failures.
- A restart assertion sometimes observed the old ready snapshot immediately after CHALLENGE_RETRY and then sampled during the new intro. The check now waits for the new b50 launcher and all 49 physical pile balls. Its targeted rerun passes; other checks remain from the same cached-artifact functional run, including the full real-time timer.
- Final gate: 15/15 functional checks, 5/5 viewport/DPR checks, no recorded browser errors, 49/49 exact initial color/position matches, gift center exact, 146 asset hashes, seven original audio copies, TypeScript and JavaScript syntax checks pass.
- Original source is unchanged at its baseline commit. No Git remote is configured and no cloud publication was performed.
- Local-only limits are explicit in qa/REPORT.md: multi-file bundle exceeds the source's 5-MB ad-creative target; native builds, mobile ad-preview certification, auditory device comparison and an unassisted full-board solve are not claimed.

## User-requested Sinonimus rebrand

- Selected exact requested name Sinonimus. Generated a glossy ring-S icon and transparent SINONIMUS wordmark using the built-in imagegen skill. Prompts and paths are recorded in docs/BRANDING.md.
- Updated project/package/browser/app/manifest names, end-card artwork and install accessibility text. Added favicon, touch icon, PWA icons and Windows ICO configuration.
- Made brand asset conversion repeatable so rebuilding assets cannot restore the original logo. Kept the original source repository intact.
- Local bundle destination is Sinonimus; previous and root URLs redirect to it. Branding QA is recorded separately from the existing gameplay regression evidence.

- Branding validation: rebuilt the Defold release HTML5 bundle; 6/6 targeted browser branding checks pass with no browser errors. Verified old/root URL redirects, exact Sinonimus title and metadata, served icon/manifest hashes, new end-card wordmark and install label, portrait and landscape captures. Source checks and all 146 conversion hashes pass; original source remains unchanged.

## Corrected naming and single HTML export

- User clarified that the name should be synonymous with the original Circle Sort, not literally Sinonimus. Corrected to Ring Sort. Replaced icon with concentric rings (no letter) and wordmark with RING SORT.
- Updated active project, browser, package, manifest, accessibility, output and test naming. Single-file exporter embeds engine, archives, audio, icons and scripts.
- User requires no duplicate output names/files: obsolete Sinonimus.html removed from the output folder; repeated exports overwrite Ring Sort.html.

- Final standalone Ring Sort.html passed five tests in an isolated folder with network disabled: startup, input/physics/NEXT/audio unlock, corrected end-card branding and local CTA, rotation, and zero external/sibling requests. Six browser branding checks also pass.
- Output contains one Ring Sort.html and no obsolete Sinonimus.html; existing Block-Breaker.html and Brick-Bender.html are unrelated exports and were preserved. Source and converted-asset verification pass.
