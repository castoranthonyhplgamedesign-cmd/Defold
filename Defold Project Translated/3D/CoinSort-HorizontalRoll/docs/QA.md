# Local delivery and QA

Historical initial-port QA is recorded below. The current Token Roll rebrand and single-file delivery are documented in BRANDING.md, qa/single-html-package.json and qa/single-html-results.json.

Date: 2026-11-06, Asia/Taipei.

Published runtime commit: `bf93e5a53942d0580ebe352c7c5444f0dd9a55bb`.
Original baseline: `main @ ccb8e2b210a432272e0e4147a64b163484c4aa70`.

Game: http://127.0.0.1:18982/
Pinned game revision: http://127.0.0.1:18982/bf93e5a53942/
Reference: http://127.0.0.1:18981/

## Observed results

| Check | Result | Evidence |
| --- | --- | --- |
| HTML5 release build, Bob 1.14.0 / Java 25 | PASS | `qa/build.json` |
| Lua syntax, rule replay and SDK-boundary checks | PASS, 11 commands | `qa/code-tests.json` |
| Native matching against actual source class methods | PASS, seven legal moves, two and three cleared columns | `qa/rules-comparison.json` |
| SDK priority, exposure, mute/volume and pause handling | PASS | `qa/host-tests.json` |
| Original, portrait 390x844 | PASS, complete playthrough and CTA | `qa/browser.json`, reference_runs |
| Original, landscape 844x390 | PASS, complete playthrough and CTA | `qa/browser.json`, reference_runs |
| Final Defold revision, portrait 390x844 | PASS, complete playthrough and CTA | `qa/browser.json`, runs |
| Final Defold revision, landscape 844x390 | PASS, complete playthrough and CTA | `qa/browser.json`, runs |
| Endcard rotation and native pause/resume | PASS in both native cases | `qa/browser.json` |
| Shader/program compilation and runtime errors | No failures/errors observed | `qa/browser.json` |
| Publication/input hashes, exact served revision and pinned source | PASS, eight checks | `qa/delivery-verification.json` |
| Loopback-only native and reference listeners | PASS | `qa/listeners.json` |
| Original working tree | Clean, baseline unchanged | `qa/source-preservation.json` and delivery verification |

Each playthrough used real pointer input: tap to focus, seven legal band rotations from the source setup, natural two-/three-column objectives, unlock/pan to the third cylinder, then its endcard tap. No forced win fixture or direct game-state edit was used. Both versions reported the same lifecycle and analytics sequence. Native CTA stayed local and recorded exactly one call; the reference's store opening was intercepted by the test browser.

The original tests were retained as unchanged-baseline evidence when the final native depth/opacity shader corrections were rerun. Both final native cases identify the published `bf93e5a53942` URL. All browser testing was headed and produced no screenshots, following COLLAB.md.

## Delivery identity

The published directory contains 17,905,803 bytes (about 17.9 MB), with individual hashes in `qa/publication.json`. Full-resolution original art is retained. It is a local multi-file HTML5 bundle. Ad-network single-file/ZIP packaging, the source's sub-5 MB network limit, actual network SDK containers and physical-device performance are unverified.

The final documentation commit follows the tested runtime commit and changes documentation, setup/verification helpers and QA evidence only. The stable game URL continues to select the tested runtime revision. `scripts/verify_delivery.py` checks that the current runtime sources still match the successful build and the published files still match its manifest.

## User review remaining

Visual and listening sign-off remains with the user as requested in COLLAB.md. Compare the two local URLs for camera/framing, number orientation, coin materials and shadows, tutorial text/hand, lock/jar/flight timing, and endcard presentation in both orientations. Listen for the original music/SFX balance and loop/gesture behavior on target devices.

Exact shadow softness, rasterization, antialiasing, visual/audio equivalence, tablet presentation and real mobile performance are not certified by the code assertions. Record and resolve any observed mismatch in COMPARISON.md before claiming client fidelity acceptance.

## Superseding rendering verification

The user's black-screen report exposed a gap in the historical state-based tests above. A debug engine revealed renderer and GUI API errors suppressed by the release build. Those failures are repaired in runtime commit dd920a3. Historical claims of successful rendering are superseded by BLACK_SCREEN_FIX.md and the new headed visual checks. All new screenshots are taken for this user-requested failure investigation. The final single-file package supersedes the historical multi-file delivery description above; exact bytes/hash are in qa/single-html-package.json.

Current QA includes completed render frames, pixel checks and inspected startup/gameplay/endcard captures in both orientations, complete legal playthroughs offline, title/icon verification, CTA suppression and zero companion/network requests. qa/debug-single-html-results.json contains debug-engine results; qa/single-html-results.json contains release results.
