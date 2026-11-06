# Cyan first-pass shooting and curved conveyor entry

## Confirmed cause and correction

- Overload tails were exponentially chasing their leaders even after those leaders joined the belt. That cut across the bend and delayed the trailing segments' belt admission until after they passed the cannon detector. They now follow the recorded target without that extra easing once their leader is on the overload belt. The existing travel-speed cap, initial easing, entry curve and pre-belt softness remain. Cannon eligibility still requires actual belt admission; no board targets or extra ammo were introduced.
- Some Hermite/quadratic merge curves intersected the conveyor before their intended endpoint. The route now ends at its first actual polyline intersection. `ConveyorPath.intersection` shares the existing ray-intersection algorithm with entry selection and accepts a finite segment limit. Entry spacing/gates are calculated from the corrected landing point. Changes are in `src/core/path.ts` and `src/core/simulation.ts`.
- Both new regressions failed before the fix. The curve case first failed on arrow 0; a diagnostic identified 13 affected entries (0, 1, 3, 9, 14, 19, 27, 28, 29, 37, 40, 48, 58), all covered by the regression.

## Measured results

At an immediate launch, cyan arrow 51's four blocks are now removed at .3083, .4167, .5250 and .6250 seconds. Previously its last two blocks waited until approximately 10.65 and 10.78 seconds. Seven idle phases (0, .25, .5, 1, 2, 3, 5 seconds) pass the two-second first-pass deadline without consuming whites or targeting resting arrows. Evidence: [core timings](evidence/entry-handoff-core.json).

The actual dev page was clicked using native mouse input in muted installed Chrome at 390x844, 844x390, 768x1024 and 360x640. Each advanced from Cyan 4 to Purple 11 in 603–682 ms and returned to 99%. Isolated browser fixtures rendered the real artist conveyor with a white train and arrows 0, 27 and 58; all segments joined by 1.6 seconds. [Browser evidence](evidence/entry-handoff-browser.json), [frame sequence](screenshots/entry-handoff/curve-0-400ms.png), [cyan cleared](screenshots/entry-handoff/cyan-cleared-390x844.png).

Typecheck and all 124 tests passed, including real block-footprint overlap, all-arrow entry, concurrent admission, queue budgets, hint-following pacing, reference behavior, and lifecycle/audio regressions. The old 25-second opening-arrow test was tightened to two seconds so it cannot silently allow an extra circuit.

## Follow-up: purple below the hinted cyan

Confirmed on the complete board: purple arrow 2 at (-10.32, 0, 3.56), facing negative Z, was blocked by cyan arrow 51. Obstruction checking still used the straight ray's 10.665-unit exit, although the planned curved entry was only about 2.6 units away. Thus the cyan blocks beyond that entry incorrectly blocked it.

`Simulation.exitDistance` now caches the overload route and limits obstruction checking to its forward extent. `launch` consumes that same route and entry rather than resetting to the distant straight-ray intersection. Real blockers before the curve still cause blocked feedback. Hint selection breaks equal-X ties toward the upper arrow so the default tutorial remains cyan 51.

Native browser clicks on purple 2 in portrait and landscape now complete its entry with cyan 51 still untouched. The existing cyan first-pass checks still pass at all four viewports. Tests also prove repeated hint checks and launch reuse the route, and that a blocker one cell ahead still blocks. Typecheck and all **127 tests** passed. Evidence: `evidence/entry-handoff-browser.json`, `screenshots/entry-handoff/purple-curve-390x844.png`.

The route cache computes once per stationary arrow. The nearest-path search now compares squared XYZ distances without allocating per sample; a regression compares its answer with the former distance-based search at every authored board block. A local single-run planning probe fell from 1806 ms to 98 ms; this is not a device-performance benchmark.

## Limits

Browser curve captures are isolated rendering fixtures; they do not claim a full successful playthrough of the production board. Physical devices and official hosts remain unverified. Production packages have not been regenerated, and these changes have not been committed or pushed.
