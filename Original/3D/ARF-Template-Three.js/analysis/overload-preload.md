# Conveyor-overload dev preload — 2026-10-28

**Historical implementation record:** the temporary redistribution, 3-unit speed and missing cannon queues below have been superseded by [overload-gameplay-tuning.md](overload-gameplay-tuning.md). Current behavior uses 101 reserved slots, 4.5-unit speed, smaller belt bodies, and the split 200-colored / 100-white ammo budget.

`npm run dev` now selects `untitled-level.arrow-flow.json` at the root page, using the existing custom-level adapter. The editor remains at `/level-editor.html`. Production builds retain their existing selection; the original reference is still the default production level. The supplied level JSON was not edited.

## Established starting count

| Quantity | Value | Basis |
| --- | --- | --- |
| Belt path length | 136.50996458405072 world units | Confirmed from `flowRuntime` and `ConveyorPath` |
| White block scale | 1.25 | Confirmed from the saved board grid; same body geometry as launched arrows |
| Minimum nominal gap | 0.10 world units | New authored preview tuning, not a reference fact |
| Nominal capacity | 101 blocks | `floor(length / (1.25 + 0.10))` |
| White preload | 100 blocks | `round(capacity * 0.99)` |
| Starting fullness | 99.00990099009901% | `100 * 100 / 101`; existing HUD rounds to **99%** |
| Nominal center pitch | 1.3515838077628784 world units | `length / 101`; one slot left empty |
| Board | 59 arrows / 200 colored blocks | Confirmed from the current saved JSON |

The capacity is an authored slot budget based on path length and nominal pitch, not an exact rigid-body packing measurement around every bend. Rounded model corners and smoothed path yaw are retained. Browser screenshots show the intended almost-full belt; no physical collision solver has been added.

The old reference meter weights each block by 0.5 world units, which would require approximately 270 blocks here to read 99%. That weighting does not describe full-size physical packing on this imported track, so only the preload scenario uses count / capacity. Ordinary reference/editor simulations preserve their original meter and admission threshold.

## Implementation

- `vite.config.ts`: development server selects the parsed saved level plus its white preload size. No browser-global configuration or production import interface.
- `src/core/simulation.ts`: constructs white belt segments independently of board arrows; reserves a nonconflicting group ID, seeds their positions, includes them in cannon matching, and calculates the count-based meter. The overload preview now uses 3 units/second; the reference simulation retains 12.825.
- `src/render/board.ts`: reuses instanced body geometry and the existing glossy white material at belt height. White segments are not selectable board arrows.
- `src/main.ts` / `src/data/customLevel.d.ts`: pass the development preload through the existing level selection.

## Verification

- TypeScript check passed; all **105 tests passed**, including the spacing/speed follow-up below.
- `tests/white-preload.test.mjs`: exact current level count, pitch, moving preload, no colored-cannon white removal, white-cannon matching/removal in a fixture, white instance count/scale/height, reference behavior, and development/production selection.
- `tools/white-preload-smoke.mjs`: muted Chromium on the actual dev root, four viewports (390×844, 844×390, 768×1024, 360×640), 99% at load and after idle, accepted native tap reaching 100%, reload restoring 99%, one canvas, no page errors or external requests, source JSON hash unchanged.
- Browser record: `analysis/evidence/white-preload-browser.json`.
- Captures: `analysis/screenshots/white-preload/`.

## Deliberately pending gameplay stage

This is the requested preload review, not the completed overload game. The saved level's existing cannon queues remain in use; they are not the proposed split 200-colored-ammo budget. No white cannon queues are installed yet. Whites therefore continue circulating until that stage.

The scenario admits a first arrow below 100% instead of rejecting every tap under the reference's 90% gate. An accepted arrow may currently take occupancy beyond capacity; the HUD clamps at 100% and later taps receive the existing full warning. There is no overload loss/endcard transition yet. Entry staging, reaction time, and white-cannon placement must be balanced together so a correct opening choice is survivable with only one nominal slot free. Clear detection still uses board arrows. These limitations must be resolved before this scenario is packaged as the finished playable.

Physical devices, official network hosts and performance under this preload are unverified. No commit or push performed.

## Follow-up: visible gap and uncomfortable speed

Confirmed root cause: all preloaded whites share one group ID. The reference movement algorithm permits same-group blocks to move freely while only individual whites near an entering colored arrow are held back. Whites therefore pile onto each other instead of consuming the initial vacant slot. An unobstructed six-block launch without shooters produced 106 belt segments after five seconds, a minimum center gap of 0, and a maximum gap of 2.7031676155 world units. The meter clamped to 100% despite that uneven distribution.

The preload scenario now moves all belt segments together and smoothly redistributes their spacing after insertion/removal. It retains circular order, shares correction in both directions, and limits extra adjustment speed to 1.5 units/second using a smoothstep whose duration accounts for its peak rate. No instant repositioning of existing blocks. Steady belt speed is **3 units/second**, about 77% lower than 12.825; transient packing speed stays within 1.5–4.5 units/second. The separate guide speed was already 3 and remains unchanged. Board launch/blocked feedback and ordinary reference/editor simulation speeds are unchanged.

Tests confirm exactly 101 belt segments at 100% settle to uniform nominal spacing of 136.50996458405072 / 101, with no persistent vacant slot. Removing that new block returns to 99% and closes the removal hole smoothly. The real six-block launch also settles evenly; the existing prototype still permits the accepted arrow's remaining segments to exceed the 101-block threshold pending the overload-loss stage described above. This follow-up does not claim a hard admission ceiling or completed lose behavior.

Additional checks: bounded per-step packing speed, pause/resume during packing, full-belt spacing, removal spacing, a real multi-block launch, and unchanged reference speed. Muted browser screenshots were refreshed at all four viewports, with `after-launch-settled.png` captured after six seconds. Physical-device motion comfort still needs user review.
