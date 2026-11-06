# Flowing entry restored; colored cannons first — 2026-10-28

The user rejected both slot-by-slot waiting and individual shrink/lift boarding, and explicitly selected restoring the earlier flowing entry. This supersedes the entry and opening-queue behavior in `overload-gameplay-tuning.md`.

## Changes

- Removed the separate feed/slot-reservation implementation and per-segment boarding state.
- Restored the original distance-based head launch, seeded body histories, bounded tail follow and smooth launch-wide rise. Compact conveyor scale is blended during that shared approach rather than as a separate shrink-then-lift animation for each block.
- Retained the overload belt's **4.5 units/second** speed, **1.0 conveyor body size**, **1.25 board grid**, and smooth spacing redistribution. Overload tail spacing uses the nominal belt pitch instead of the reference's much tighter 0.6-cell spacing.
- **101 is again a fullness threshold, not a hard admission ceiling.** An already accepted arrow completes its transfer even if it takes the meter above 100%; the HUD clamps at 100% and further launches receive the full warning. This is the prior admission behavior, restored with the user's requested animation rollback.
- Swapped only the center queue's first two cannons. Active starters are **Purple 5 / Yellow 6 / Cyan 4**; the next cannon in each container is **White 3**. Queued white cannons remain visible as reserves but cannot fire before their colored predecessor is depleted.
- All **200 colored ammo and 100 white ammo** are preserved, including per-container totals of 101 / 99 / 100. The source layout JSON remains untouched.

## Verification

- TypeScript check and all **109 tests** pass.
- Regression checks cover complete flowing transfer without waiting for white removal, launch-wide render height/scale, bounded spacing correction, unchanged reference movement, exact ammo totals, colored starters and white replacement sequencing.
- Muted Chromium checks all four viewports, 99% idle preload, 5/6/4 colored starters, native tutorial launch, cyan depletion before its white replacement and the subsequent black cannon, reload, and preservation of the source JSON. No page errors or external requests.
- Updated evidence: `analysis/evidence/white-preload-browser.json` and `analysis/screenshots/white-preload/`, including `flowing-entry.png`.

## Remaining limits

The hard non-overlap entry gate was part of the rejected update and is removed. Smooth redistribution restores settled spacing, but transient crowding during a nearly-full entry is **not certified collision-free**. Final full-capacity loss/admission behavior still needs to be reconciled with the continuous-flow requirement; this rollback does not claim that problem is solved. Physical-device feel/audio and a complete level-clear strategy remain unverified. No commit or push performed.
