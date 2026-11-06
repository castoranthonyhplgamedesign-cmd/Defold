# Blocked-arrow feedback — template port

Implemented at developer request after Milestone 2. This deliberately supersedes the Cocos reference's head-only nudge; accepted launch/conveyor rules are unchanged.

**Pacing revision:** developer found all movement slow. `src/core/motionTuning.ts` now plays this complete feedback sequence at 2× speed, preserving its shape/contact distances. Source timings documented below are historical; runtime durations are halved. Successful launch and tail playback are also 2×; conveyor speed is 24 instead of 15 units/s. See [motion-pacing.md](motion-pacing.md).

**Confirmed source:** read the colleague checkout at `D:/Reference Projects/Arrow-Flow-Template/src/game/arrowGrid.ts`, `start`, `prepareStep`, `collidesAt`, `startBlockedFeedback`, `updateBlockedFeedback` (approximately lines 258–417), and `updateClearing` (approximately 436–486). The analysis snapshot contains the same feedback logic. `projectLayout.ts` specifies cell size 1.5 and speed 7.2.

The template advances all arrow segments in ordered one-cell steps until contact, temporarily replacing corner pieces with ordinary blocks. Contact uses a 0.78-cell radius. A damped two-cycle shake runs for 0.34 seconds per segment, delayed along the arrow by min(0.45, (segmentCount−1)×0.07) seconds in total. Sideways amplitude is 0.11 cells and backward recoil is 0.06 cells. It then reverses the saved route using smoothstep, over max(0.12, distance/(speed×1.8)) seconds. Repeat input is ignored while feedback is active; corner visuals return afterward.

**Implemented:** `src/core/blockedFeedback.ts` ports that motion in pure numeric TypeScript. Speed is normalized to our one-unit grid: 7.2/1.5 = 4.8 cells/s. Position and yaw interpolation reverse the same cell-step route. `Simulation` retains original logical cells during feedback; `render/board.ts` renders temporary poses and restores static corners when feedback completes. No Babylon dependency is added.

**Intentional adaptations:** a swept circle calculation finds contact rather than frame sampling plus eight binary-search iterations. Feedback is planned against stationary logical board positions at tap time. Existing reference open-front/admission rules still determine rejection, including own-tail obstruction; for an own-tail rejection without an external blocker the feedback shakes in place. This is a feedback port, not a replacement of the reference's movement/collision policy. Fixed simulation substeps and hidden-time pause remain in force.

**Validation:** 13 unit tests cover contact distance, delayed tail shake, exact positional restoration, original body yaw restoration, stable occupancy, repeat-tap suppression and pause/resume, plus existing launch/conveyor regressions. TypeScript/build checks pass. `tools/gameplay-smoke.mjs` checks deterministic visible feedback and pixel-identical return on mouse and emulated touch, followed by accepted launch, conveyor motion and rotation. See `evidence/milestone-2-gameplay-browser.json` and `screenshots/milestone-2/mouse-blocked.png`.

**Unverified:** side-by-side runtime playback against Babylon and physical-device appearance/performance. No audio was added; cannons and later milestones remain deferred.
