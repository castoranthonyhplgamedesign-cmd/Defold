# Immediate full-entry failure

Implemented and manually approved by the user on 2026-10-30. The user requested rebuilding the four approved delivery variants afterward.

The first head or tail segment that reaches a physically full entry now latches failure immediately. The simulation exits that tick without processing further tails or cannon updates. Session failure stops cannons, plays the existing fail cue and retains the existing 0.6-second endcard/store transition. Further simulation advances cannot resume the failed run.

This removes both the wait for all moving segments to settle and the subsequent 0.8-second entry grace. Shots that free space before the first blocked entry still work. The separate unmatched settled-belt rule, nominal meter capacity, physical capacity, launch animation, conveyor speed, hand hints and ammo queues are unchanged.

Validation:
- Core regression: failure and first detected jam occur in the same 1/120-second step. Arrow and conveyor poses freeze, cannon shots stop, failure dispatches once, and the endcard keeps its previous delay.
- Matching-shot rescue before a jam, paused approach, rejection after failure and simultaneous launches are covered in `tests/overload-failure.test.mjs`.
- Muted headless browser checks cover 390x844, 844x390, 768x1024 and 360x640 using real input and the authored level. The six-block arrow fills the four available positions; two parts remain outside and every gameplay pose freezes immediately. The first three measured failures occurred approximately 0.475-0.484 seconds after launch, versus roughly 1.7 seconds in the prior browser fixture. No pre-fail grace frame is shown. The existing endcard appears afterward.
- Evidence: `analysis/evidence/overload-failure-browser.json`, `analysis/screenshots/overload-failure/`, `analysis/evidence/immediate-fail-tests.txt`.
- TypeScript check passed. The initial trial left delivery files unchanged; the subsequently approved rebuild is recorded in `analysis/evidence/network-builds.json`.

The user approved the manual gameplay check. Their test device was not specified; physical-device audio audibility and official network-host validation remain unverified.
