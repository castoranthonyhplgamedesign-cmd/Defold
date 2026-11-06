# Conveyor pushback implementation

Implemented 2026-10-30. Supersedes the upstream entry-hold description in earlier overload movement notes.

**Historical implementation, partially superseded:** the user rejected the incoming animation described below. The full approach curve, tail-follow and distance-based rise are restored; the separate 0.18-second moving handoff has been removed. Current behavior and validation: [launch-motion-restoration/REPORT.md](launch-motion-restoration/REPORT.md). The results below describe the earlier build, not the current restoration.

## Behavior

- Existing occupants yield backward toward real vacant space; the conveyor's forward clock continues at its existing speed. Displacement follows the artist conveyor through bends using the existing footprint-aware block-unit map.
- Pushes blend over **0.12 seconds**, matching the Long Arrow timing. A new block's moving position is reserved atomically before the next incoming block is processed. The existing Segment object survives displacement, preserving cannon reservations.
- Incoming blocks use a **0.18-second handoff** (an adaptation for this near-full level, not a measured reference constant). The approach follows the moving belt frame with cubic easing; its height rises smoothly from the board as the vacancy opens. The head retains bounded turning. There is no zero-scale disappearance, queue-wide conveyor stop, or new launch cooldown.
- The renderer keeps the approach at board height until the handoff, then uses smoothstep of cubic handoff progress to climb. This replaces the old nearest-belt distance rise: at inward bends, the nearest surface could belong to a neighboring belt section and raise the block too early.
- Cannons detect an admitted block's swept belt position during its short visual handoff. They retain the actual block as their shot target. Destroyed leaders finish their invisible handoff so the remaining body follows continuously instead of jumping toward a different bend.
- Concurrent entries share actual free space. If none exists, the remaining arrow stays outside; the current overload warning, 0.8-second grace, matching-shot recovery and fail state remain active. This does not import Rescue Mascot's whole-arrow tap rejection or win-on-placement rule.
- No changes to level data, preload count, cannon queues/ammo, belt speed, timers, URLs, audio or network routing. The current authored level remains 195 colored blocks and 97 preloaded whites, with 98 nominal meter slots and 101 physical positions; those existing values were preserved, not reset to older discussion counts.

## Implementation

- `src/core/beltPush.ts`: vacancy reservation, backward chain displacement, path-following blends, incoming handoff and retained destroyed-leader poses.
- `src/core/simulation.ts`: replace the upstream hold with continuous belt movement and push admission; keep the existing board approach, obstruction and overload rules.
- `src/core/cannons.ts`: sweep the admitted belt position through detectors without changing target identity or ammo accounting.
- `src/render/board.ts`: continuous handoff height and head-to-body presentation; `arrowStyle.ts` drops the now-unused distance-rise setting.
- No new dependencies, runtime debug globals, network calls or shipping analysis assets.

## Validation

- `npm test`: **144 passed, 0 failed**. Includes wraparound, near-full insertion, shared capacity, full rejection without mutation, pause/resume, cannon target identity, first-pass cyan shooting at seven idle phases, concurrent launches, overload/recovery and imported-curve geometry.
- Geometry verification now distinguishes the incoming head/body and their real height during handoff. It checks actual mesh vertex separation where projected footprints intersect; it no longer assumes every reserved block already sits at belt height. See `tests/overload-geometry.test.mjs`.
- Muted headless Chrome: 390x844, 844x390, 768x1024 and 360x640; cyan opener clears, white relief unlocks, excess six-block launch with four free physical positions fails with two blocks still outside. Purple curved entry checked in portrait/landscape. No page errors. Controlled curved-entry captures include 2.4 seconds so the final handoff is included.
- Browser evidence: `analysis/evidence/entry-handoff-browser.json`, `analysis/evidence/overload-failure-browser.json`; screenshots under `analysis/screenshots/entry-handoff/` and `analysis/screenshots/overload-failure/`.
- `npm run build`: typecheck and single-file audit passed. Standalone `dist/index.html`: **3,883,514 bytes**, below the common 4,000,000-byte target. Existing per-network packages were not regenerated in this task.
- Isolated performance: headless Chrome on RTX 3060 at 390x844 / DPR 2, launch phase averaged **93.07 FPS** at **4x CPU throttle**, p95 **14 ms**; unthrottled launch averaged 139.61 FPS. The concurrent-validation run measured 47.27 FPS at 4x and is retained as a confounded sample, not hidden.
- Performance records: `analysis/evidence/playable-performance-belt-push.json` (ran alongside other validation) and `analysis/evidence/playable-performance-belt-push-isolated.json` (isolated follow-up). These are desktop Chrome fixtures, not physical-phone measurements.

## Reference provenance and limits

**Confirmed reference facts:** Long Arrow uses 0.12-second transfers and backward slot displacement. Rescue Mascot uses 0.04-second pushes and path-following offsets. See `analysis/longarrow-entry/REPORT.md` and `analysis/rescue-entry/REPORT.md` for source citations and sandbox observations.

**Intentional adaptation:** retain continuous footprint-aware positions rather than introducing a second fixed-slot geometry; use the gentler 0.12-second push, a 0.18-second visible handoff, and the existing overload rules. A push is backward relative to normal belt travel; the combined world motion can slow or reverse depending on displacement and belt phase.

**Unverified:** physical iOS/Android feel and sound, official ad hosts, and a complete human 60/90-second winning session. This change does not establish a guaranteed clear time.
