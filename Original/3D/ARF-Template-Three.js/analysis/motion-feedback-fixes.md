# Movement, feedback and tutorial revision

These are user-requested adjustments to the current Three implementation, not newly measured reference constants.

## Changes

- Movement reduced by 10%: conveyor and chevrons 15 -> 13.5 units/s; blocked playback 2 -> 1.8; successful launch/follow multiplier 1.5 -> 1.35; tail travel cap 22.5 -> 20.25 units/s. The tail cap is explicit so two changed multipliers do not accidentally compound the reduction. Cannon firing timing is unchanged.
- **Confirmed cause of distant-arrow rush:** the previous head duration was capped at .8 seconds before the playback multiplier, and smoothstep also accelerated through mid-flight. Longer trips therefore exceeded the normal travel speed. Head travel is now linear with distance-based duration and no maximum-duration cap: up to 27 units/s. Very short launches retain a .222-second minimum to remain visible. Longer trips take proportionally longer instead of rushing to meet a deadline.
- Conveyor follow/separation distance is .9 instead of 1 world unit. Board spacing remains one unit. Actual circulating gaps include the existing follower lag and entry geometry: in the arrow-141 fixture they decrease from approximately 1.30-1.35 to 1.18-1.26 world units. Gaps still persist after removals; no new gap-closing rule was added.
- Red feedback now consists of exactly two smooth opacity pulses, beginning at contact and ending with the return. It is transparent during approach and between pulses, peaks at .65, and uses independent per-arrow materials so overlapping blocked inputs do not reset each other's pulses. Existing approach, cascade shake and return remain. The effect follows every head/body part.
- White head highlight extent above the colored inset is reduced by 25% in X/Z; its authored scale changes from [1.146,1,1.088] to [1.041,1,.999]. The colored inset, heading and source alignment remain.
- Tutorial hand is smaller and anchored by the fingertip to the projected arrowhead, using the appropriate fingertip coordinate for each image. Both squash axes are applied; rotation is softened. It targets a valid arrow matching an active cannon, keeps that target stable, hides on accepted/blocked/full taps and returns after five seconds idle. A blocked tap still does not start the countdown. Size and position follow camera projection across viewports.
- **Confirmed cause of early blocked audio:** `main.ts` previously requested wrong SFX directly for a blocked release. It now subscribes to the core contact event and requests the existing prepared wrong voice exactly once there. Accepted/full-meter cues remain native-release cues. Hidden time pauses the approach and its pending contact. No arbitrary timeout, new audio element or production diagnostics were added.

## Validation

52 unit tests pass, including distance-based constant-speed launches, actual tighter entry gaps, no-teleport transfers, two pulse peaks, independent feedback, contact-event deduplication, delayed prepared media, tutorial idle behavior and fingertip alignment. TypeScript and preview build pass. Preview HTML: 2,575,454 bytes. All eight packages rebuilt and passed static/package audits; exact sizes are in `evidence/network-builds.json`.

Muted packaged Chromium mouse and touch checks pass: no blocked cue on release; exactly one contact cue (40 ms after the short-approach sample tap); nudge/return; accepted launches; matching ammo use; circulating unmatched blocks; rotation; context restoration; native input ownership. See `evidence/milestone-4-gameplay-browser.json`. This measures cue requests, not physical speaker onset.

Seven viewport checks pass (720x1280, 390x844, 844x390, 768x1024, 360x640, 320x932, 430x932), including world padding, endcard bounds, chevron direction and the updated shared speed. `screenshots/motion-feedback/` contains 21 captures, including the tutorial tap and approach/first pulse/between/second pulse/return poses. These selected poses, 75% meter and endcard are fixture-controlled, not natural full-playthrough milestones. The two red peaks and restored blue between them were visually inspected. No page errors or outbound requests occurred. Evidence: `evidence/motion-feedback-browser.json`.

Session browser checks pass for idle hints, pause/resume, countdown endcard, locked board, CTA surfaces and keyboard access. All eight actual packages also pass muted Chromium boot, media, resize, CTA and pause checks using mocked host callbacks (`evidence/milestone-4-session-browser.json`, `evidence/delivery-browser.json`). Largest HTML: 2,576,613 bytes; ZIPs: 1,092,143-1,092,180 bytes. These are local checks, not official-host certification.

## Limits

Original-reference runtime parity, physical-device FPS and sound onset, and official ad-network host acceptance remain unverified. The updated contact cue relies on the pre-existing native priming strategy; browser evidence does not guarantee iOS/WebView authorization. See `audio-verification.md` for the new timing record and remaining device checks.
