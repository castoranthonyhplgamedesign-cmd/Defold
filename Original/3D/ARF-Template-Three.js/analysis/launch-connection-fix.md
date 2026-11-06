# Arrow launch connection fix — 2026-10-27

## Cause and change

Confirmed in `src/core/simulation.ts`, `Simulation.launch` and `Simulation.step`: the head could travel at 27 world units/s while the body was capped at 20.25 and interpolated toward its follow target. Body histories also began with only their own position, omitting the initial authored bend. These combined to make the head run away from its body before joining the conveyor.

Measured before the fix: a four-part bent arrow with a 20-unit launch had a head-to-next-part distance of 1.834 units at 0.1 seconds, 3.859 at 0.4 seconds, and 5.209 at 0.6 seconds, instead of its initial one-unit separation.

The launch now shares the body's 20.25 world units/s cap. Initial histories include the authored link to the next part, preserving bends. Existing eased compression into the belt remains; its follow rate accounts for the editable cell size.

After the user found the initial correction too stiff, the head now accelerates over the first 80 ms. Long launches gain 40 ms of duration to retain the speed cap. Body parts ease toward their recorded route with lag bounded to 0.04 cell per link, allowing slight follow-through without recreating the growing gap. These are implementation tuning choices, not measured reference values. The short-launch minimum remains unchanged.

This is an intentional implementation correction, not a newly confirmed reference constant. Long launches are 25% slower than the former head-only speed (33% longer duration). The short-launch minimum of 0.3 / 1.35 seconds remains. There is no maximum duration. Conveyor/chevrons remain at 13.5 world units/s; cannon behavior and blocked feedback are unchanged.

## Verification

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 94 tests passed. Added coverage for four grid sizes, all four facing directions, straight and bent arrows, authored bend movement, and all initially free reference arrows.
- `node tools/launch-connection-smoke.mjs`: muted local Chrome editor preview passed at cell sizes 0.5, 1 and 1.5. Native clicks launched each six-part bent arrow; each reached its endcard before the 60-second timeout, after being cleared by its matching cannon. No page errors or external requests.
- The paired pure-core measurement bounds maximum pre-belt neighboring separation to 1.04 cells after the softness adjustment. This numerical measurement is from the simulation, not pixel measurement of the browser. Regression tests verify gradual startup, delayed body response, and unchanged cruise-speed cap.
- Browser frame captures at 0, 20, 40, 80, 100, 300, 600, 900 and 1200 ms after clicking are in `screenshots/launch-connection/`. Evidence: `evidence/launch-connection-browser.json`.
- `npm.cmd run build:level -- analysis/evidence/launch-connected-qa.arrow-flow.json preview`: passed after the softness adjustment. Finalized preview creative: 2,609,408 bytes. This checks packaging, not official network acceptance.

Physical devices and official ad hosts were not tested for this fix. The existing small insertion snap tolerance remains; this change does not claim constant speed on the exact frame a part snaps onto the belt.
