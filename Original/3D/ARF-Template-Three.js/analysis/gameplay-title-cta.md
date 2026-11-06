# Gameplay title logo and store CTA

Implemented 2026-11-03 on user request.

- Reuses `src/assets/ui/title.webp`, the existing Arrow Flow title artwork, at bottom left. No additional image payload, play button or animation.
- Reference-derived base sizing is 169.51 units at 1280 height (`ui-audit.md`). Following the user's size reduction, the responsive adaptation is 10% smaller: width clamps to 57.6–122.4 CSS pixels, with an 8-pixel minimum bottom/left margin plus host safe-area insets and a minimum 44-pixel button height. It is not a claim of exact reference scaling at every viewport.
- A native button click invokes `triggerCTA(false, true)`: intentional click, keep gameplay alive. Existing selected-network routing, readiness guards and store URLs remain in effect. No `gameClose`, game-end event, endcard, arrow tap, timer reset or local pause is triggered by this control.
- Repeated taps remain active. Each opens one destination; `CTA_CLICKED` is reported once per session through the existing SDK/console analytics policy. The later actual ending still calls `gameClose` normally.
- Normal host/document visibility pauses both simulation and audio while hidden. Returning resumes the same session. The creative cannot require an external ad host to keep its WebView alive.
- Logo hides when the session ends and is removed on scene disposal. Endcard title and full-screen CTA retain their existing behavior.

## Verification

- TypeScript passed; all nine network tests passed, including gameplay-title routing for eight selected networks plus standalone preview, repeated taps, no end/close signal, hidden gating and later endcard close.
- Muted Chromium browser checked twelve phone/tablet viewports in portrait/landscape. Mouse, touch and Enter activation each routed once through a mocked destination; no actual store opened. Caption and arrow tap counts were unaffected by logo presses; countdown and belt motion continued.
- Simulated host hide/return preserved the session and resumed the countdown. Forced endcard preview hid the gameplay logo.
- Two simulated safe-area cases checked portrait bottom inset and landscape side inset. No fullscreen-meter overlap or page errors.
- Evidence: `evidence/gameplay-logo-browser.json`; captures: `screenshots/gameplay-logo/`; rerun: `node tools/gameplay-logo-smoke.mjs` with dev server on port 5173.

Physical devices and real ad-host store/return behavior remain unverified. Network delivery packages were not rebuilt.
