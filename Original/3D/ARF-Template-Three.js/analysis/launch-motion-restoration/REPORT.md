# Incoming-arrow motion restored

Implemented 2026-10-30 after the user requested restoration of the motion preceding conveyor pushback.

## Changes

- The head traverses the full planned approach, including its final curve, before entering the belt. Removed the early takeover at the start of that curve and the separate 0.18-second moving-position transfer.
- Restored history-based tail following, distance-based smooth rise over 1.4 cells, gradual belt scale, and head-to-body change at actual admission. `src/render/board.ts` and `src/render/arrowStyle.ts` match their earlier committed versions.
- `src/core/beltPush.ts` affects only existing belt occupants. As an incoming part approaches, the vacancy grows on the belt; the arriving part's position is never changed by this clearance operation. A tail opens space behind its admitted leader. Clearance cannot push that leader backward into its own tail. Final admission clears actual occupants before placing the arriving part, avoiding an overlap during a delayed visual blend.
- Restored cannon sweeps against actual previous/current positions; removed the alternate belt position used for early reservations. Existing cannon target identity, first-pass cyan clearing, destroyed-leader following and ammo accounting remain covered.
- Kept continuous belt movement, real shared capacity, the overload grace period and matching-shot recovery. No changes to authored board, speeds, preload, queues, timers, audio, input, UI or network adapters.

## Evidence

- `tests/entry-handoff.test.mjs`: new regression checks five entries (0, 2, 27, 51, 58). Each head remains exactly on its full planned route, never exceeds the configured pre-belt speed, and reaches the route endpoint before admission. Tails finish afterward.
- `npm.cmd test`: **145 passed, 0 failed**. Saved in `tests.txt` here. Includes all-arrow entry clearance, actual body-mesh overlap through bends, shared capacity, full-belt failure/recovery, first-pass cyan at seven idle phases and persistent cannon reservations.
- `measure.mjs` / `measurements.json`: controlled core runs with 60 whites and no cannons. Maximum pre-belt head speed is at most 21.504692 world units/s (floating-point tolerance), matching the existing 21.504692 limit. All five head entries have zero distance from the planned entry. Purple 2 peaks at 20.909470, compared with the rejected transfer's 30.2431 measured in the preceding investigation.
- Muted headless Chrome: `tools/entry-handoff-smoke.mjs` passed 390x844, 844x390, 768x1024 and 360x640. Cyan cleared and white relief unlocked in every viewport. Purple entered with the cyan still on the board in portrait and landscape. Isolated entries 0, 27 and 58 finished; frame captures at 100/200/400/800/1600/2400 ms are under `analysis/screenshots/entry-handoff/`. Inspected early approach/entry captures; no page errors. Results: `analysis/evidence/entry-handoff-browser.json`.
- `tools/overload-failure-smoke.mjs`: all four viewports passed. Physical occupancy stopped at 101, two excess parts remained outside, the meter reached 100%, and fail followed the existing grace period. Results: `analysis/evidence/overload-failure-browser.json`.
- `npm.cmd run build`: typecheck and standalone single-file audit passed. `dist/index.html`: **3,883,105 bytes**. Network delivery packages were not regenerated.
- Isolated desktop performance on RTX 3060, Chrome, 390x844/DPR 2: launch 139.21 FPS unthrottled, 73.90 FPS at 4x CPU throttle (p95 20.9 ms). Above the 55-FPS fixture target; this is not a mobile-device measurement. See `analysis/evidence/playable-performance-launch-restored.json`.

These are core and desktop-browser checks. Physical mobile-device playback and official network hosts remain unverified. Aesthetic approval of the restored motion remains with the user.
