# Long Arrow vs Rescue Mascot: conveyor entry

## Conclusion

**Confirmed:** Both references open an occupied entry slot by moving its contiguous occupants backward toward an empty slot while the conveyor continues advancing. They are different implementations, with different transition timing and full-belt rules. No shipping gameplay was changed by this analysis.

## Evidence and provenance

**Confirmed:** Input `reference/playable/arf_mip_grhpl_longarrow_bigclear_real_na_noseason_en_60seconds_na_al.html` is 3,927,071 bytes; SHA-256 `466c4fab2cbecd5a320ecabe6e42b0f75bbc3fb25d3ef27d2c8d7ffe33f8da55`. `reference.html` is an unchanged copy. `script-0.js` contains the short variant bootstrap; `script-1.js` contains the application. `script.pretty.js` is a static TypeScript-printer formatting of the application, with zero parse diagnostics. No reference code was executed in Node.

**Confirmed:** Long Arrow uses Babylon.js 9.31.0 (`script.pretty.js:2122`, Babylon scene/engine construction and boot at 157xx-15983), unlike Rescue Mascot's Three revision 184. This is not the same bundle with just another level.

## Mechanism comparison

All rows below are **Confirmed** from the source and, where numerical runtime values are supplied, the instrumented runtime captures.

| Behavior | Long Arrow | Rescue Mascot |
|---|---|---|
| Occupied entry | Scan backward to an empty slot, move connected occupants one slot backward | Same basic rule |
| Belt movement during insertion | Continues forward | Continues forward |
| Displaced-block blend | 0.12 seconds | 0.04 seconds |
| Incoming-block blend | 0.12 seconds, same setting as push | 0.12 seconds, including a 0.04-second hold when pushing |
| Visual trajectory | Linear world-position blend toward moving slot | Interpolated offset following the belt path |
| Capacity in supplied level | 72 slots | 76 slots |
| Belt speed | 7.454592716397226 world units/s | 12.825 world units/s |
| Path length | 67.09133444757504 world units | 110.62342365666458 world units |
| Initial occupied slots | 0 | 0 |
| Full-belt launch behavior | No whole-arrow admission check; insertion waits if no vacancy | Whole-arrow admission check can refuse launch |
| Clear condition | Board cleared AND conveyor empty | Configured to win on placement |

Long Arrow evidence: `by` constructor and slot creation, lines 14921-14928; `closestSlotIndexAt`, `pushOccupant`, and `insertAt`, 14955-14977; conveyor update, 15061-15069; settings, 15721; path-derived capacity/speed, 15865-15916; input, 15267-15268; failed insertion, 15444-15449; outcome checks, 15983. Rescue evidence: [previous report](../rescue-entry/REPORT.md), corresponding extracted source and runtime JSON.

**Confirmed:** Long Arrow's slot spacing is 0.9318240895496532 world units. Capacity is rounded from path length divided by belt width times `slotPitchToWidth: 0.86`, with a minimum of three slots. Its speed is derived from slot spacing, grid cell size/speed, and the 1.25 block-speed multiplier. These are reference-specific values, not proposed tuning for our overload level.

**Confirmed:** Long Arrow moves occupant data between reusable slot objects. `pushOccupant` preserves color, targeted status, and current visual position, and retargets both in-flight bullets and pending cannon shots to the destination slot. This matters if a block moves while being shot. Evidence: 14965-14969.

**Confirmed:** The slot's logical distance continues advancing during transfer. Visual position interpolates from the old position to the moving destination over 0.12 seconds. A backward slot reassignment does not imply a constant backward screen-space velocity throughout that blend. Evidence: 15061-15063.

**Inferred:** Because Long Arrow uses world-position interpolation rather than following intermediate path samples, its push animation can cut across tight bends. Our imported conveyor should use path-following motion to avoid that risk. This is a geometric consequence of the source interpolation; a quantified corner-penetration test was not run.

## Full conveyor and failure

**Confirmed, static:** If all slots are occupied, `insertAt` returns false without displacing any occupants (14970-14976). `updateClearing` then holds that arrow at the crossing and retries on later updates (15444-15449). It does not freeze the entire conveyor.

**Confirmed, static:** The main loop loses when the belt is full AND `canClearOccupiedBlock()` is false (15983). That method checks active matching in-flight bullets, front cannons with available ammo, and advancing replacement cannons (14986-14998). A matching cannon therefore permits a full belt to keep running. This is different from both Rescue's admission restriction and an unconditional fail at 100%.

**Inferred recommendation:** Borrow backward displacement without silently adopting either reference's admission or failure rules. Keep our agreed overload rules, preload, colors, ammo queues and speed. Reuse the path-following approach on curved sections and preserve shot targets through displacement. At our 99% preload, the displaced chain may be almost the entire loop; the Rescue controlled fixture already demonstrated this case.

## Runtime observation

**Confirmed, instrumented native input:** A muted sandbox-enabled Chrome session at 390x844 launched two arrows using native mouse clicks. The loaded level had 30 arrows, 176 board blocks, four cannon lanes, and 72 initially empty slots. At session time about 1.209 seconds, an entering red block pushed five black occupants backward one slot each. Later entries pushed up to eight occupants at once. Across the capture, 52 individual slot shifts occurred; each measured minus one slot. The conveyor's slot distances kept increasing during transfers.

Evidence: `runtime.json` (`initial`, `taps`, `pushes`, `entries`, `steps`); reproducible fixture `observe.mjs`; `load.png`, `first-launch.png`, `pushback.png`, and recording under `video/` (exact path in JSON). Times refer to the reference's gameplay clock, not frame-exact video offsets. The fixture asserts observed pushback, one-slot displacement and forward slot motion.

**Confirmed:** Only the local HTML was served. The attempted `mraid.js` request was logged and blocked; all other requests and WebSockets were blocked, service workers disabled, host destinations stubbed and audio muted. Page errors: zero. Instrumentation exposes and wraps state only in `instrumented.html`, leaving the input unchanged.

**Unknown/unverified:** Natural full-belt failure/win playthroughs, physical-device feel/performance, official ad hosts, and visual fidelity of this push timing on our near-full overload level. The full-belt and clear rules above were verified statically, not by a complete natural playthrough. No game implementation or production build was changed.
