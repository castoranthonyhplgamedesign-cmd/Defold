# Source-derived beat sheet

**Unknown:** no runtime session was captured. These are conditional source timings, not measured screenshot/video timestamps. There is no evidence for a typical user decision time. **Confirmed:** the session timer starts only on the first accepted arrow and defaults to 60 s. Evidence: GameManager.ts.js::onTouchEnd/update/activateCTA; Path.ts.js; Cannon.ts.js; Tunnel.ts.js.

## Boot and event-relative beats

|Anchor|Source behavior|Label|
|---|---|---|
|HTML load to first render|Unpack → ready/viewable gate → engine/scene; elapsed duration unavailable|Unknown duration, Confirmed sequence|
|Before first accepted launch|Hand/tutorial visible according to authored state; timer not running|Confirmed source; visual Unknown|
|Accepted launch +0|Tap SFX; mark moving/inTransit; hide hand; first accepted launch starts timer|Confirmed|
|Launch +0.16…0.8 s|Head reaches direction-selected entry; actual duration clamp(0.05×distance)|Confirmed source duration|
|Head arrival +0.5 s|Fallback inserts any remaining tail segment at nearest path progress|Confirmed source threshold; execution on next update|
|Matching detector collision +0|Cannon recoil; projectile begins; block shrink begins|Confirmed|
|Collision +0.1 s|Ammo decrements and target destroy event completes|Confirmed source duration; engine callback order Unknown|
|Ammo exactly zero +next scheduled turn|Delete cannon, begin queue slide|Confirmed|
|Queue slide +0.3 s|Positions/scales complete; front detector/label refreshed|Confirmed source duration|
|Last accepted launch +more than 5 s|Leftmost valid active-color arrow gets hint, if candidate set exists|Confirmed source; missing candidate failure Unknown|
|Timer below zero, or board/path empty|Begin CTA scale from zero to one; hide HUD; stop audio|Confirmed|
|CTA +0.4 s|Entry scale tween complete|Confirmed source duration|
|CTA tap|Route to store through host API; no measured delay|Confirmed code; runtime Unknown|

## Second-by-second nominal idle-after-one-launch scenario

**Inferred:** set t=0 at the first accepted launch and perform no more taps. The nominal timer column is 60−t; the engine uses variable dt and tests `<0`, so exact wall-clock crossing is Unknown. Cannon hits are spatially dependent and cannot be assigned fabricated timestamps.

|Second after accepted launch|Nominal remaining s|Expected source-driven state|
|---:|---:|---|
|0|60|Head launch; firstTouch clears; timer/hint enabled|
|1|59|Head is normally on path; tail fallback may still be pending until at most ~1.3 s|
|2|58|Conveyor and detectors update; collision events Unknown|
|3|57|Conveyor and detectors update; collision events Unknown|
|4|56|Conveyor and detectors update; collision events Unknown|
|5|55|Idle threshold reached nominally; hint on next update below zero if valid candidate|
|6|54|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|7|53|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|8|52|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|9|51|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|10|50|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|11|49|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|12|48|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|13|47|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|14|46|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|15|45|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|16|44|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|17|43|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|18|42|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|19|41|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|20|40|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|21|39|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|22|38|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|23|37|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|24|36|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|25|35|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|26|34|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|27|33|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|28|32|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|29|31|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|30|30|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|31|29|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|32|28|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|33|27|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|34|26|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|35|25|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|36|24|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|37|23|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|38|22|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|39|21|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|40|20|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|41|19|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|42|18|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|43|17|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|44|16|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|45|15|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|46|14|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|47|13|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|48|12|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|49|11|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|50|10|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|51|9|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|52|8|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|53|7|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|54|6|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|55|5|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|56|4|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|57|3|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|58|2|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|59|1|Hint shown once if candidate exists; conveyor continues; collision events Unknown|
|60|0|Timer reaches zero nominally; CTA on next update below zero|
|61|0|CTA entry expected complete if timer ran normally; actual frame timing Unknown|

## Requested successful and failed runs

**Unknown / unavailable:** no playable run, capture sequence or video was obtained. The source board-clear branch and timer branch both show the same CTA. No capacity-loss branch exists. A full successful run must be established with unmodified rules after hydrated cells/ammo are checked; the static level expansion has an ammo discrepancy. An overflow attempt must record rejection/congestion, not be labeled a losing run unless the runtime shows an actual loss.
