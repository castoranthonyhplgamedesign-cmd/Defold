# Opening cyan arrow: two blocks missed on the first pass

**Update:** corrected after implementation approval. See [entry handoff fix](entry-handoff-fix.md) for current behavior and validation. The investigation below preserves the original failing observations.

Investigated 2026-10-29. No gameplay code changed.

## Confirmed reproduction

The initial tutorial selects cyan (`blue`) arrow **51**, containing **four blocks**. The left starting cannon has **four cyan ammo**, followed by Purple 11 (`src/data/overloadCannons.ts:6`).

Direct simulation, starting immediately and advancing at 60 Hz:

| Block, head first | Joins conveyor | Removed by cannon |
| --- | ---: | ---: |
| 1 | 0.250 s | 0.317 s |
| 2 | 0.417 s | 0.483 s |
| 3 | 0.683 s | 10.650 s |
| 4 | 0.817 s | 10.783 s |

The same two-first/two-next-lap behavior reproduced after idle periods of 0, .25, .5, 1, 2, 3 and 5 seconds. Individual times vary slightly with the entry gap. Evidence: `evidence/opening-cyan-investigation.json`.

Actual dev-page Chromium, native click on the visible tutorial target, muted audio:

- At 1.505 s after the click: cyan ammo **2**.
- At 6.016 s: cyan ammo still **2**.
- At 12.016 s: the remaining cyan blocks have been shot and **Purple 11** has replaced the cyan cannon.
- No page errors. Evidence: `evidence/opening-cyan-browser.json` and `screenshots/opening-cyan/{1.5s,6s,12s}.png`.

## Confirmed mechanism

Trailing segments follow the preceding segment's recorded route and can join at their nearest belt point, downstream of the original head entry (`src/core/simulation.ts:319-379`). Cannon targeting only considers the `onPath` list (`src/core/cannons.ts:84-92`).

The last two blocks are first added to that list **after passing the firing area**. At their first eligible frame, their local detector offsets are approximately **x=1.898, z=1.113**, outside its half-extents **x=1.2445, z=1**. By comparison the first two join at local x=.198 and .698, both inside the detector.

Both missed blocks are already `inTransit=false`, the cannon has two unreserved ammo, and neither is in its previous-contact set. Thus this occurrence is not an ammo shortfall, color mismatch, or the contact re-entry suppression rule. `previousPosition` is also unset on their first belt frame, so the detector's fallback checks the current position rather than reconstructing their earlier merge path. See `evidence/opening-cyan-detector.json`.

On the next circuit they cross the same detector as ordinary belt blocks and are shot. Direct `Session.launch()` reproduces it without any pointer/touch handler, isolating this behavior from the recent input-event change.

## Why the existing test passed

The opening-arrow regression advances **25 seconds** and checks eventual removal (`tests/white-preload.test.mjs:119-126`). That allows the extra circuit, so it does not protect the intended first-pass behavior.

## Recommended correction

Correct the handoff between merge movement and cannon targeting so trailing blocks become eligible at the firing area, while preserving the flowing entry and avoiding shots at resting board blocks. Keep the four-ammo budget. Add a regression that requires all four opening cyan blocks to be removed during their first pass, including different entry-gap phases.

No correction or replacement build was made during this investigation. Physical-device reproduction and original-reference behavior for this exact custom entry remain unverified.
