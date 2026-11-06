# Conveyor-overload: 60-second balancing

Historical first pass. The user could not reproduce this clear; the current guidance and cannon plan supersede it in [overload-guidance-followup.md](overload-guidance-followup.md). Evidence files produced by `plan-cannons.mjs` describe the latest plan.

## Result — Confirmed in local scripted checks

The authored queues can now clear the complete level before the real 60-second countdown expires. Native mouse clicks through the running Three.js preview cleared it in **57.006 s at 390×844** and **57.113 s at 844×390**. The automated player chooses free arrows compatible with current cannon ammo, prioritizing the leftmost, then uppermost arrow, with a minimum 650 ms between clicks. Playwright drives the normal animation clock; it does not remove blocks, grant ammo, advance queues, or bypass picking. Audio was muted. This proves an achievable route, not an average human completion time.

Core comparison with identical current mechanics, 60 Hz frames and only the queues changed:

| Minimum decision interval | Previous queues, unlimited timer | New queues, actual 60 s timer |
|---|---:|---:|
| 650 ms | 91.817 s | 55.433 s |
| 750 ms | 100.517 s | 57.833 s |
| 800 ms | 99.617 s | 58.933 s |

30 Hz replays also clear in 57.100, 58.600 and 58.933 s respectively. A 2-second pre-game idle followed by the 750 ms policy clears in 58.600 gameplay seconds. Browser polling/input timing differs slightly from the core runner, so its measured durations are listed separately.

## Changes and preserved mechanics — Confirmed from source

`src/data/overloadCannons.ts` now contains a fixed, authored queue plan. Each colored opener immediately unlocks a white cannon. Later batches combine/reassign ammo to reduce unnecessary color changes and extra laps. The sequence is fixed before play; nothing adapts secretly to player choices.

The initial front cannons remain **cyan 4 / purple 5 / purple 9**. There are no white cannons firing at startup. A colored opener must empty before its white relief begins. White cannons exclusively remove whites; colored hits do not remove whites.

The selected JSON currently contains **60 arrows / 195 colored blocks**, rather than the earlier discussed 200-block draft. This balancing pass changes neither its layout nor block counts. It retains 97 preloaded whites, the 99% opening meter, the existing capacity/overload rules, conveyor speed (10 block units/s), launch motion, cannon firing zones, projectile speed and 0.3 s cannon replacement. Wider firing-zone experiments were not adopted.

| Lane | Queue, front first | Total ammo |
|---|---|---:|
| Left | Cyan 4 → White 17 → Cyan 20 → White 17 → Pink 15 → Black 22 → Green 9 | 104 |
| Center | Purple 5 → White 13 → Black 19 → White 12 → Purple 17 → Pink 11 → Cyan 19 | 96 |
| Right | Purple 9 → White 19 → Purple 20 → White 19 → Yellow 18 → Pink 4 → Green 3 | 92 |

Exact totals: cyan 43, purple 51, black 41, pink 30, yellow 18, green 12, white 97. Cyan retains the internal `blue` identifier. The slightly unequal lane totals accommodate different detection positions and queue timing.

At 750 ms decisions / 30 Hz, remaining whites are 67 at 10 s, 48 at 20 s, 29 at 30 s, and zero by 40 s. The last arrow launches at 45.4 s; the remaining time is real conveyor travel and shooting. White pressure therefore drains progressively, not immediately.

## Validation and limits

- `scripts/plan-cannons.mjs` now **validates** the authored current-level plan instead of regenerating queues. The old generator only checked survival/activity across 180 seconds; it did not require a completed run within 60. Running it cannot overwrite the tuned plan. It checks exact budgets and timed completion, and records an alternate route that times out.
- `scripts/overload-replay.mjs` uses actual core obstruction, admission, motion, cannon and session logic, with no state shortcuts.
- `tests/overload-cannons.test.mjs` checks budgets, colored openers, complete 30/60 Hz clears and a genuine timeout for an unsuccessful alternate order. Entry tests now expect white relief after the four cyan blocks clear on the first pass.
- Browser evidence: `analysis/evidence/overload-balance-browser.json`; screenshots: `analysis/screenshots/overload-balance/`.
- Core evidence: `analysis/evidence/overload-balance.json` and `overload-balance-comparison.json`.

**Confirmed limitation:** selecting the rightmost eligible arrows at 750 ms intervals times out at 60 s with about 73.6% of all blocks removed, even though all arrows have been launched. Order matters. This is an achievable but demanding 60-tap challenge; it is not a guaranteed win for every safe order. The 3clicks/10clicks variants still intentionally end at their tap limits.

**Unknown:** first-time human completion rate and physical-device timing/feel. Automated native mouse clicks are not human touch playtesting. Official network-host/device checks and new delivery packages are outside this tuning verification; existing `dist/` outputs have not been regenerated.

Recheck: `node scripts/plan-cannons.mjs`, `npm.cmd test`, `npm.cmd run typecheck`, and with the dev server running, `node tools/overload-balance-smoke.mjs`.
