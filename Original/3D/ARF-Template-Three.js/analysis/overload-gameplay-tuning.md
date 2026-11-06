# Overload entry, pacing and cannon queues — 2026-10-28

**Superseded entry and opening order:** the user rejected the boarding animation and requested colored starters. See [overload-flow-restoration.md](overload-flow-restoration.md) for current behavior. The center now starts Yellow 6, followed by White 3; ammo totals are unchanged. The hard slot-entry gate described below is removed.

This supersedes the movement and temporary overlap workarounds in `overload-preload.md`. It is active in the root page served by `npm run dev`, using the untouched `untitled-level.arrow-flow.json` layout. The editor JSON's original cannon queues are not overwritten. Production template defaults remain unchanged; an isolated build of the overload configuration was checked separately.

## Current tuning and behavior

- Steady overload conveyor speed: **4.5 world units/second** (50% above the previous 3; approximately 65% below the original 12.825). Reference/editor simulations without preload retain 12.825.
- Capacity is now enforced at **101 belt slots**, with **100 white blocks** initially and a 99% rounded meter. The path length is 136.50996458405072 world units; nominal slot pitch is 1.3515838077628784.
- Board spacing and scale stay at **1.25**. Blocks on this conveyor use **0.8 times their board scale**, giving **1.0** for this layout. The larger bodies intersected each other on the tight bends even when their centers were evenly spaced.
- Entry first reserves a vacant slot. When needed, a contiguous run of blocks moves forward one slot into an existing vacancy. This makes room before admission instead of allowing overlap and redistributing afterward. The base belt motion continues; the extra motion is smooth and capped at **1.5 units/second**, so blocks move at 4.5–6 during this short adjustment.
- Concurrent launches share one entry reservation. Occupancy cannot exceed 101. When completely full, the remaining arrow segments wait on their authored approach until a cannon frees space. Admission occurs within one simulation step's travel of the entry point (at most 0.0375 world units).
- Unjoined segments follow the original arrow's authored bends and remain at the recessed board height. On admission, a segment shrinks first, then rises into its reserved slot over **0.18 seconds**. It cannot be shot during this boarding transition.
- White cannons start after the **first accepted arrow launch**. Idle/blocked taps do not consume the 99% preload. White hits only remove white blocks; colored hits only remove their matching color.
- Clear waits for the colored board and white preload to be removed. Ordinary reference behavior is preserved because it has no preloaded segments.

Tuning and entry authority are in `src/core/simulation.ts`; boarding presentation is in `src/render/board.ts`. This is an intentional overload-scenario adaptation of the reference's freely admitted groups.

## Ammo budget

The user selected **100 white ammo in small batches**. There are 19 cannons per container, queued front to back. Individual colored cannons carry 4–10 ammo; white cannons carry 3–5. Logical `blue` uses the cyan material.

| Color | Left | Center | Right | Total |
| --- | ---: | ---: | ---: | ---: |
| Purple | 19 | 19 | 19 | 57 |
| Cyan | 14 | 14 | 14 | 42 |
| Black | 14 | 13 | 14 | 41 |
| Pink | 10 | 10 | 10 | 30 |
| Yellow | 6 | 6 | 6 | 18 |
| Green | 4 | 4 | 4 | 12 |
| White | 34 | 33 | 33 | 100 |
| **All ammo** | **101** | **99** | **100** | **300** |

Source: `src/data/overloadCannons.ts`. Columns map to physical left/center/right by container X position, rather than the JSON's original lane-array order.

| Queue position | Left | Center | Right |
| ---: | --- | --- | --- |
| 1 | Purple 5 | White 3 | Cyan 4 |
| 2 | White 3 | Yellow 6 | White 3 |
| 3 | Pink 5 | Purple 5 | Black 7 |
| 4 | White 5 | White 5 | White 5 |
| 5 | Cyan 7 | Pink 5 | Green 4 |
| 6 | Black 7 | Cyan 7 | Purple 5 |
| 7 | White 5 | White 5 | White 5 |
| 8 | Purple 7 | White 3 | Cyan 10 |
| 9 | White 3 | Black 6 | White 3 |
| 10 | Yellow 6 | Purple 7 | Pink 5 |
| 11 | White 5 | White 5 | White 5 |
| 12 | Green 4 | Green 4 | Yellow 6 |
| 13 | Purple 7 | Pink 5 | Purple 7 |
| 14 | White 5 | White 4 | White 4 |
| 15 | Cyan 7 | Cyan 7 | Black 7 |
| 16 | Pink 5 | Purple 7 | Pink 5 |
| 17 | White 4 | White 4 | White 4 |
| 18 | Black 7 | Black 7 | Purple 7 |
| 19 | White 4 | White 4 | White 4 |

## Evidence

- TypeScript passes; **109 tests pass**.
- `tests/white-preload.test.mjs`: exact budgets, idle preservation, native core opening sequence, capacity enforcement, reservations under concurrent input, per-step separation/speed, full-entry waiting and recovery, shrink-before-rise geometry heights, white matching, and clear waiting for the last white.
- `tests/overload-geometry.test.mjs`: uses the actual rounded body mesh's convex footprint, testing all pairs of 101 slots across 100 sub-slot phases. No intersecting footprints at the new belt scale in this sampled check, including nearby nonadjacent track branches.
- Muted Chromium root-page checks at 390×844, 844×390, 768×1024 and 360×640 pass. Opening ammo is 5/3/4; idle retains 99%; a native tutorial tap starts white removal; the cyan cannon completes and its white replacement fires before the black cannon appears. No page errors or external requests; source JSON hash unchanged.
- Browser evidence: `analysis/evidence/white-preload-browser.json`; screenshots: `analysis/screenshots/white-preload/`, including `after-launch-settled.png` and `after-white-replacement.png`.
- Isolated single-file overload build: `analysis/build/overload-build-check/index.html`, **3,648,961 raw bytes**. Built using the dev level definition with production minification, outside shipping `dist/`. Muted Chromium also loaded this file directly and verified scene readiness, 99%, 5/3/4 opening ammo and no page errors. This is a local preview build, not eight-network submission certification.

## Remaining limits

The loss/endcard rule for a wrong-color launch at full capacity is still pending; this version waits safely when full. The opening sequence and ammo conservation are tested, but a complete board-clear strategy and late-queue difficulty are not certified. Sampled geometry checks are not a continuous collision-proof for every authored layout. Physical-device motion comfort/audio, official network hosts, and performance on target hardware remain unverified. No commit or push performed.
