# Centered intro screen

Supersedes the opening HUD caption behavior and reserved header spacing described in `client-feedback-ui.md`.

- A native DOM button covers the full game container (`position:absolute; inset:0; width/height:100%`) with a 65% black dim background. Its message is centered in both orientations, respects safe-area padding, uses Lilita One, and includes “Tap to play.” Layer 18 covers the world, HUD, hand and gameplay logo; the endcard remains above it.
- Fade-in: 0.28 active seconds, cubic ease-out, 8-pixel caption offset. Tap anywhere, native touch activation, or Enter dismisses it over 0.24 active seconds with an 8-pixel upward movement and 4% caption shrink. Reduced-motion mode skips the animations.
- The caption uses a true 100–104% scale pulse over 1.6 seconds, after the 0.28-second entrance. The user rejected the attempted opacity substitute. CSS animates the independent `scale` property with ease-in-out, centered transform origin and a composited layer hint, rather than writing pulse transforms from the gameplay frame loop. The JS entrance/exit transform remains separate. Host/document pause and dismissal explicitly pause the CSS animation; reduced motion disables it. Browser checks sample keyframe phases, assert stable center and full opacity, and verify pause/reduced-motion behavior. Physical-device smoothness remains unverified.
- The renderer advances both the intro and normal simulation clocks, so the belt and warning animation keep moving behind the dim overlay. The countdown retains its normal first-accepted-launch start rule. The input picker returns null during the intro and its exit. Underlying gameplay-logo input is disabled. No arrow is launched, no tap is counted and no store destination is opened by dismissal.
- Host pause/document hiding stops the renderer and intro clock through existing lifecycle handling. No extra wall-clock timers or animation library were added.
- After dismissal, the original right-side cyan opening hand hint appears. Countdown still starts on the first accepted arrow launch. The former caption header space is removed from the orthographic camera framing, and the camera does not jump on dismissal.

Verification: TypeScript and 21 focused session/UI tests passed. `node tools/client-feedback-smoke.mjs` now tests this intro replacement across 12 viewport/orientation combinations, same-page rotation, paused exit and reduced motion, with muted output and blocked external requests. No page errors. It checks full overlay bounds, centered readable content, continuing belt motion and simulation time before dismissal, with no arrow taps or countdown consumption, mouse/touch/Enter activation, no click-through, and the actual first launch after dismissal. Measurements: `evidence/intro-screen-browser.json`. Screenshots: `screenshots/intro-screen/`.

Physical devices and official network hosts remain unverified. Delivery outputs have not been rebuilt for this change.

