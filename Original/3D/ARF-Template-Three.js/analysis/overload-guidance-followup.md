# Overload guidance after human play feedback

The highlight and capacity-admission descriptions below are historical. The subsequently authorized rules in [overload-launch-failure.md](overload-launch-failure.md) restore open-path highlights and allow risky launches, with failure evaluated during entry. The authored hand route and cannon queues remain.

The user could not finish the first balancing pass and explicitly chose to keep the exact layout, improving only guidance and cannon timing. All 60 arrows, 195 colored blocks, 97 preloaded whites, conveyor geometry, movement speed, capacity rules and 60-second timeout remain. No arrows launch automatically.

## Cause and changes

**Confirmed:** the old hand waited five seconds after input, and white arrow outlines identified all unobstructed arrows, including colors the front cannons could not absorb. The earlier completion proof selected moves directly from core state, which was more information than the player saw. Even perfect choices at one-second intervals cleared only 86% before timeout with the previous queues. Evidence: `evidence/overload-human-pace-baseline.json`.

**Confirmed implementation:** overload hints now become eligible 0.15 s after a tap, refreshed at the existing 10 Hz cadence. The hand fades in over 0.12 s and stays visible while that recommendation remains available. It no longer disappears for the old idle cycle. Highlighted outlines identify ammo-compatible moves or moves that leave the existing eight-block buffer; the hand's recommendation is included. The reference level retains its original five-second idle hint behavior.

The overload level has an authored 60-ID hint order alongside its cannon queues. It selects the next unlaunched arrow only when it has an open path and either matching ammo or sufficient buffer space. This removes large changes in advice caused by small differences in tap timing. It waits when the recommended move is not ready; other arrows remain playable. Already launched arrows are skipped, including player choices made out of order. This is advice, not a forced input sequence or a guaranteed win after arbitrary deviations.

`vite.config.ts` attaches the order only to the built-in overload level. `main.ts` passes it to the pure TypeScript `Session`; custom level builds and editor previews without an authored order retain ordinary hint selection. No runtime configuration editor, extra renderer or dependency was added.

## Current cannon queues

Front first; internal `blue` means cyan. Replacement duration and firing speed are unchanged; the timing improvement comes from which ammo batches reach the front.

| Lane | Queue | Ammo total |
|---|---|---:|
| Left | Cyan 4 → White 16 → Cyan 20 → White 17 → Purple 17 → Pink 30 → Green 4 | 108 |
| Center | Purple 5 → White 14 → Black 19 → White 12 → Green 8 → Cyan 19 | 77 |
| Right | Purple 9 → White 19 → Purple 20 → White 19 → Yellow 18 → Black 22 | 107 |

Budgets remain exact: cyan 43, purple 51, black 41, pink 30, yellow 18, green 12 and white 97. Cannons are still colored at startup; clearing a colored opener unlocks white relief. The unequal lane totals reflect their different positions and sequence timing.

## Evidence and practical limit

**Confirmed local browser:** native clicks following only the visible hand, at least 750 ms apart, cleared all blocks in **57.990 s at 390×844** and **57.989 s at 844×390**. Playwright drives the normal animation clock; no blocks, ammo or queues are manipulated. Automated audio is muted. Evidence: `evidence/overload-guidance-browser.json`; captures: `screenshots/overload-guidance/`.

**Confirmed core:** following the actual authored hint at 30 Hz clears in 52.833 s (650 ms decisions), 53.867 s (700 ms), 56.633 s (750 ms), and 58.233 s (800 ms). A 700 ms run with an additional two-second hesitation after launch 20 clears in 56.267 s. A two-second idle before the first move does not consume the countdown. Timing is phase-dependent, so these are measured fixtures, not promises that faster tapping always produces a faster clear. `node scripts/plan-cannons.mjs` regenerates the current evidence in `evidence/overload-balance.json`.

The tests cover exact budgets and guide IDs, prompt hint recovery, choice outside the suggested order, genuine timeout, and actual hint-following completion at 30/60 Hz. The browser test now reads the displayed recommendation instead of calculating a better choice privately.

**Not established:** an easy or reliable first-time human clear. Sixty required taps impose a real constraint: at one tap per second, the final tap alone takes about 59 seconds, before remaining travel/shooting. These changes reduce searching and bad advice; they do not remove that constraint. Slower play and some alternate orders still time out. Physical devices and official ad hosts remain unverified. Delivery builds have not been regenerated or pushed.
