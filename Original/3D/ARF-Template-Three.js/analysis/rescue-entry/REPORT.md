# Rescue Mascot conveyor entry comparison

## Conclusion

**Confirmed:** This supplied playable demonstrates actual backward displacement of occupied conveyor slots while the belt continues advancing. It is a suitable movement reference for the requested change. Our shipping gameplay was not modified during this study.

**Confirmed:** Input is `reference/playable/arf_mip_grhpl_rescuemascot_real_nougc_noseason_en_60seconds_na_al.html`, 3,966,652 bytes, SHA-256 `5df0fb852878b9659514b12ff73487fd5fb1616e546c259127937d4c5c310bb2`. A byte-preserved copy is `reference.html`; original hash was rechecked unchanged. Engine signature is Three revision 184 (`const ht="184"` in extracted script). Pretty-printing used the installed TypeScript parser/printer, with zero parse diagnostics. Original script is `script-0.js`; formatted evidence is `script.pretty.js`.

## Active entry behavior

**Confirmed — static and runtime:** The active implementation is class `Mg`, selected by `referenceInsertion: true`. The separate `xg` smoothstep push system is present but inactive: runtime `referenceConveyor` exists, while `slotPush` and `movingMerge` do not. Do not confuse its unused 0.12-second push setting with the active 0.04-second push. Evidence: `script.pretty.js:9398–9476`, constructor at `9658`, settings at line 3; `runtime.json` initial state.

**Confirmed:** Entry works one block at a time:

1. Convert existing blocks to moving slot indices relative to the current belt phase.
2. Choose the nearest entry slot. A tail block can use the slot directly behind its preceding segment if sufficiently close to the entry.
3. If occupied, search backward through the connected occupied slots until finding an empty slot.
4. Shift that connected chain backward one slot per block, leaving the entry slot available. Unconnected occupied runs are unaffected by that insertion.
5. Assign the incoming block to the entry slot. Subsequent segments repeat the same process.

Evidence: `Mg.insert`, `script.pretty.js:9412–9425`; `updateReferenceTransit`, lines 9840–9867.

**Confirmed tuning:** Active push blend is 0.04 seconds; incoming-block transfer is 0.12 seconds. The incoming blend holds for the 0.04-second push when displacement is needed. Slot positions change logically at insertion, while visual path offsets interpolate toward the assigned positions. The active fraction is linear, not smoothstep. Movement and yaw follow the conveyor path. Evidence: `Mg.fraction`, `progress`, `begin`, `update`, lines 9407–9432.

**Confirmed:** The conveyor continues its normal forward phase during the backward displacement. The configured belt speed is 12.825 world units/second. The observed layout has 76 slots and path length approximately 110.6234 world units. Its initial belt is empty. These values describe this reference only; they are not proposed replacements for our level's capacity or speed. Evidence: `yg.step`, lines 9778–9797; `runtime.json`.

## Empirical observations

**Confirmed — instrumented natural input:** In a sandbox-enabled headless Chrome session, three native mouse taps launched arrows 2, 38, and 40. At session time approximately 4.506 seconds, entry of arrow 40 segment 2 displaced seven existing segments by exactly minus one slot. Its next two segments each displaced seven again: 21 individual backward slot shifts total. Captured 105 simulation-step observations of negative visual progress while `beltPaused` was false and belt phase increased. No page errors occurred. Evidence: `runtime.json`, `observe.mjs`; captures `first-launch.png`, `pushback.png`, `after-entry.png`; recording under `video/` (path recorded in runtime.json). Times are runtime session times, not asserted frame-exact video timestamps.

**Confirmed — controlled manager fixtures, not a full playthrough:** With 75 of the 76 slots occupied and the vacancy at the far end of the upstream chain, insertion succeeded by shifting all 75 existing blocks backward one slot. With 76 occupied slots, insertion returned false without moving any blocks. Evidence: `capacity-fixtures.json` and `capacity-fixtures.mjs`.

**Confirmed safety of observation:** Only the locally supplied HTML was served. The reference's `mraid.js` request was logged and blocked; host readiness and destinations were stubbed. All other external requests were blocked, service workers disabled, WebSockets blocked, audio muted, and Chrome sandbox enabled. No code from the reference was executed in Node. Instrumentation was applied only to an analysis copy and to prototypes inside the sandboxed browser.

## Differences to preserve in our playable

**Confirmed:** Our current `Simulation.moveBelt` holds blocks upstream of an entering arrow; `gateOpen` waits for merge clearance. It does not move those blocks backward. Evidence: `src/core/simulation.ts:249–291`.

**Confirmed:** The Rescue reference's `fitsOnBelt` includes both all unplaced segments of the selected arrow and other in-flight arrows. Insufficient capacity produces blocked/return feedback rather than our intended risky over-capacity launch. Evidence: `script.pretty.js:9716–9721`, `9741–9745`. Its `winOnPlacement: true` is another unrelated rule that must not be copied into our block-clear win condition (line 3; session update at 9148–9155).

**Inferred recommendation, based on the observed behavior:** Adopt the backward slot displacement and path-following visual transition as the entry model. Preserve our current board data, white preload, cannon queues, speed, physical spacing and overload rules. Reserve only real empty capacity, displace the occupied chain toward a vacancy, and let actual lack of capacity feed the current overload behavior instead of rejecting the initial tap. Avoid transplanting the reference's complete admission, win, or timing system.

**Inferred implementation concerns:** At our near-full start, many blocks may reverse together, as the controlled 75-block fixture demonstrates. Tight curves need the current footprint-aware spacing rather than a fixed world-distance shove. Concurrent entries must not claim the same vacancy, and shooting must use the corrected path positions without duplicate hits during reversal. These are the main behaviors to validate before adopting the change.

**Unknown/unverified:** Full successful and failed natural sessions, physical-device appearance/performance, and official host behavior. The exact visual feel of a 0.04-second push on our denser near-full layout has not been measured. No replacement tuning has been invented or applied.
