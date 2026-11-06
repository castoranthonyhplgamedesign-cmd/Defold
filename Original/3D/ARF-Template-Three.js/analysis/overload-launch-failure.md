# Risky launches and visible conveyor overload

Implemented following the user's approved plan: an unobstructed arrow launches even when the conveyor cannot hold the whole arrow. The hand continues recommending a safer move; the outline now indicates only an unobstructed path.

## Current behavior — Confirmed in code and local checks

- Overload-mode taps no longer return `full` because of meter level or arrow length. A blocked path still uses the existing approach/contact/shake/red-pulse feedback. Paused, already moving, already failing, or completed-session inputs remain ignored.
- The initial valid launch starts the existing countdown, including a risky launch. Capacity is evaluated as the arrow enters, not at tap time.
- The existing gate and tail-follow movement admit only blocks with physical room. A hard physical-count guard also prevents the belt exceeding its computed touching-block limit. Excess parts remain in transit outside the belt, rather than being inserted over existing blocks.
- A settled entry jam starts a **0.8-second grace period**. A full belt with no pending entry and no matching front cannon also starts that period. Actual cannon shots/removals and replacement transitions get their chance to resolve first. Resumed movement/removal resets the pending failure; after the grace expires, failure latches and gameplay stops.
- A jammed conveyor displays 100%, flashes the meter text and uses the existing red warning vignette. Multiple entry gates can exhaust usable entry space before all nominal positions are occupied; that also counts as a full jam rather than leaving the session stuck forever.
- Pause freezes this grace clock. The existing fail/endcard/analytics path handles the loss once; timer expiry remains a separate outcome. No input, audio-pool or SDK implementation was changed.
- White outlines cover every stationary arrow with an unobstructed path, independent of matching ammo or spare slots. The hand retains the authored safer-route checks. A highlighted arrow can therefore cause failure.

The 0.8-second value is newly authored project tuning (`preloadTuning.jamGraceSeconds`), not a measured reference constant. The original reference-mode 90% admission gate is retained. Layout, cannon budgets, movement speeds, the near-full preload and 60-second countdown were not changed by this update.

## Evidence

`tests/overload-failure.test.mjs` checks oversized acceptance, preserved obstruction, still allowing an open tap at 100%, real matching-cannon rescue, no belt overpacking, pending tails outside occupied belt blocks, delayed exactly-once failure, paused grace, recovery after removal, and concurrent launches. Existing guided-win, entry-animation and reference tests remain passing.

**135 tests passed**, plus TypeScript checking. Geometry/motion fixtures that previously asserted admission refusal now assert the approved loss behavior. A movement-only fixture retains a matching cannon outside its view so the separate no-match failure rule does not terminate its physics check.

`tools/overload-failure-smoke.mjs` used native mouse clicks on the actual dev level, with test-only observation globals, blocked outbound requests and muted automated audio. At **390×844, 844×390, 768×1024 and 360×640**, cyan arrow 0:

1. Was highlighted and had six blocks against four available spaces.
2. Launched on normal native input.
3. Admitted four blocks, leaving two outside and 101 physically admitted blocks in total.
4. Showed 100% and the warning during the jam.
5. Failed about 1.90–1.98 seconds after launch and displayed the endcard.

Frame polling observes warnings every 50 ms, so the captured warning-to-failure intervals are slightly below the exact fixed-step 0.8-second grace. The core test verifies the grace at 120 Hz. The current nominal meter capacity remains 98 with 97 initial whites; the touching-block physical limit remains 101. Those existing capacity definitions were not retuned.

Browser evidence: `evidence/overload-failure-browser.json`. Captures: `screenshots/overload-failure/` (initial highlights, jam, endcard for each viewport). Real matching-cannon rescue was checked in the core with a cannon at the entry; it does not imply that any matching cannon anywhere on the loop can save an entry jam.

Physical devices and official hosts were not checked. No delivery rebuild or push was performed. This update makes failure more direct; it does not make the 60-arrow layout easier to finish within 60 seconds.
