# Incoming-arrow motion regression investigation

2026-10-30. Investigation only; no product source, tuning, level or build changes in this task.

## Conclusion

**Confirmed:** The pushback update also replaced the incoming arrow's final approach. This was broader than the intended conveyor-only improvement. The new transfer changes the trajectory, speed control, body-follow ownership, height and scale. Existing belt displacement can be retained independently.

## Cause and evidence

1. **Confirmed:** `src/core/simulation.ts:313-318` inserts the head as soon as it reaches `route.merge`, the start of the planned merge curve. `progress` becomes non-null. Subsequent frames skip the flight branch, so the remaining planned curve is not travelled. This is an early animation takeover, not just a slower/faster conveyor setting.
2. **Confirmed:** `src/core/beltPush.ts:76-88` positions the incoming block relative to its moving belt position, rotates its offset as the belt turns and removes that offset using `1-t^3` over 0.18 seconds. Forward launch speed/distance no longer controls this portion. This can produce lateral motion, a turn around the corner, and a late acceleration as the offset collapses. There is no position-speed cap in this transfer branch.
3. **Confirmed:** `src/core/simulation.ts:341-346` allows every tail part to join from its own nearest belt point and then bypass its normal history-following code. `src/core/beltPush.ts:56` clears `inTransit` immediately upon reservation, even though its visual transfer is not finished. The tail's spacing/ownership decisions therefore switch before the visible leader has finished arriving.
4. **Confirmed:** `src/render/board.ts:43-49` keeps blocks at board height until reservation and then climbs using smoothstep of cubic handoff progress. At halfway through the handoff, only 4.296875% of the rise has happened; most height change occurs late. Scale changes directly from board scale to 0.9 belt scale when reserved. Previously, rise and scale varied continuously with approach distance (visible in `git diff -- src/render/board.ts`; Git HEAD is an older snapshot, not an exact pre-update runtime capture).

**Inferred visual consequence:** These changes explain the reported sideways/scooping motion, uneven pace and separate per-part entry. The mathematical animation change is confirmed; the user's exact perceived motion has not been classified from a newly supplied recording.

## Measured core replay

Reproducible script: `analysis/launch-motion-investigation/measure.mjs`.
Full samples: `analysis/launch-motion-investigation/measurements.json`.

Each fixture uses one original level arrow, the actual artist conveyor, 60 whites, no cannons, 1/120-second simulation steps. This isolates movement from shots and full-capacity waiting. No runtime behavior is patched; the insertion method is wrapped only to record successful entries. Every tested arrow completes entry.

| Arrow ID | Planned curve remaining when handoff takes over (world units) | Peak handoff speed (world units/s) |
|---|---:|---:|
| 0 | 1.2994 | 18.8198 |
| 2 (purple below tutorial cyan) | 1.9063 | 30.2431 |
| 27 | 1.2425 | 19.1392 |
| 51 (tutorial cyan) | 1.2707 | 18.4216 |
| 58 | 1.2754 | 19.4655 |

**Confirmed:** All fixtures use a configured launch speed of 21.5047 world units/s. Arrow 2 exceeds that speed by about 40.6% in the new handoff. Other arrows slow differently; this is a route-dependent change, not a uniform speed multiplier. Measurements are core replay results, not physical-device FPS or a complete natural playthrough.

## Recommended correction

**Inferred implementation recommendation:** Keep the 0.12-second displacement of existing belt occupants, vacancy accounting, stable cannon target identities and current overload rules. Restore one continuous incoming flight/body-follow route and its speed control through the actual entry. Reserve capacity without using that reservation to take ownership of the incoming visual pose early. Remove per-part nearest-point shortcuts and restore continuous approach-based presentation, retaining the curved-entry and cyan first-pass protections.

The transition from flight ownership to belt ownership must happen once at the actual join, with continuous position, direction and speed. Validate early destroyed leaders, concurrent arrivals, wraparound, curved entry clearance and a full belt. Add checks for the complete flight trajectory and peak motion speed: prior tests covered clearance and completed entry, but did not require the old path and pacing to remain intact.

**Unknown/unverified:** A corrected implementation, before/after browser playback of that correction, and physical-device feel. No gameplay change was made during this investigation.
