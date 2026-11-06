# Faster movement pass

Developer feedback: blocked arrows, accepted launches and conveyor all felt slow.

**Latest revision:** developer found 2× successful launches too fast. Launch and tail playback are now **1.5× original**, while blocked feedback stays 2× and conveyor speed stays 24 units/s. Head duration is 0.1067–0.5333 seconds, follow coefficient 30, and forced insertion deadline 0.3333 seconds after head arrival. The table below records the previous faster pass.

Authored settings are isolated in `src/core/motionTuning.ts`. These are intentional tuning changes, not measurements of the reference or template.

| Movement | Before | Now |
|---|---|---|
| Blocked approach | 4.8 cells/s | 9.6 cells/s |
| Blocked shake | 0.34 s | 0.17 s |
| Total cascade delay | Up to 0.45 s | Up to 0.225 s |
| Rewind | Minimum 0.12 s | Minimum 0.06 s; distance-dependent duration halved |
| Successful head launch | 0.16–0.8 s | 0.08–0.4 s |
| Tail follow coefficient | 20 | 40 |
| Forced tail insertion deadline after head arrival | 0.5 s | 0.25 s |
| Conveyor | 15 units/s | 24 units/s |

Shake amplitudes, contact distances, one-unit conveyor spacing, meter formula, admission threshold and pause behavior are retained. At the reconstructed 84.272-unit path length, an unobstructed lap takes approximately 3.51 seconds rather than 5.62 seconds. Congestion may still stop segments intentionally.

The renderer uses elapsed time and 1/120-second simulation substeps. It caps contributions at 0.1 seconds per frame; this slows simulation relative to wall time only during frames longer than 100 ms. That stall safeguard is retained. No evidence establishes it as the cause on the developer's device. Raising motion rates is a pacing adjustment, not a claim to fix GPU/frame-rate performance.

Validation: core regressions, explicit launch-time and conveyor-distance checks, TypeScript/build, and desktop-pointer/emulated-touch gameplay browser checks. Physical-device smoothness and preferred final feel remain unverified. Cannon targeting will be tested against the new speed when that milestone is implemented.
