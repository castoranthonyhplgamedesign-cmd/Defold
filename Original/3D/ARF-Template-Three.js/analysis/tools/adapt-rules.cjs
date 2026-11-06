throw new Error('Retired historical rule generator: its editor/network scope was superseded. Edit current AGENTS.md directly.');
const fs=require('fs'),assert=require('assert/strict');
const before=fs.readFileSync('analysis/rules-source/AGENTS.before-three.md','utf8');
let header=fs.readFileSync('analysis/rules-source/three-header.md','utf8').replace('[analysis/implementation-plan.md](../implementation-plan.md)','[analysis/implementation-plan.md](analysis/implementation-plan.md)').replace(' When this header is incorporated into root AGENTS.md, the plan path is `analysis/implementation-plan.md`.','');
const section=(start,end)=>{const a=before.indexOf(start),b=end?before.indexOf(end,a):before.length;assert(a>=0&&b>a);return before.slice(a,b);};
let tail=section('## Analytics — SDK Priority','## Pitfalls');
tail=tail.replaceAll('Phaser modules','Runtime modules').replaceAll('Phaser implementation/assets','Three.js implementation/assets').replaceAll('Phaser runtime','Three.js runtime').replaceAll('Phaser layout','Three.js layout').replaceAll('Phaser asset loading','embedded asset loading').replaceAll('consumed by Phaser','consumed by the audio service').replaceAll('Phaser images use','DOM/sprite UI images use').replaceAll('Phaser or bundled node modules','Three or bundled node modules').replaceAll('before any Phaser scene is ready','before the game is ready').replaceAll('new Phaser.Game(...)','the renderer/game').replaceAll('Phaser','Three.js');
tail=tail.replaceAll('bindLifecycle(scene)','bindLifecycle(gameServices)').replaceAll('once a scene exists','once game services exist').replaceAll('GameScene.startPlaying()','session first accepted launch').replaceAll('GameScene.triggerFail() / triggerWin()','session ending').replaceAll('cta.ts redirectToStore()','endcard redirectToStore()').replaceAll('**Critical** (BootScene)','**Critical** (assets.ts boot manifest)');
tail=tail.replace('| Liftoff | lf | `mraid.js` | — | ✓ |','| Liftoff | lf | `mraid.js` | — | — |');
tail=tail.replace('Every built HTML file must contain `<meta name="network" content="<networkname>">` and classic script blocks inside `<head>`.','Every built HTML file must contain `<meta name="network" content="<networkname>">` and classic configuration script blocks inside `<head>`.');
tail=tail.replace('- Asset swaps are size-neutral because replacements are spliced into `window.__CHANGEABLE_ASSETS__` while overrides stay small.','- Asset swaps replace entries in `window.__CHANGEABLE_ASSETS__` rather than duplicating payloads in overrides; replacement byte size is still measured.');
tail=tail.replace('## Depth Map (adjust per project)','## UI layer map (world geometry uses depth testing)').replace('Define depths as named constants','Define DOM z-index values as named constants').replace('| Game objects | 1–10 |','| Canvas world | 0 |\n| HUD | 10 |\n| Tutorial | 15 |').replace('| Logo | 17 |','| HUD logo | 17 |').replace('| Fail/win UI | 21 |','| Endcard art | 21 |');
tail=tail.replace('- [ ] Audio muted by default','- [ ] No audible autoplay; default pre-gesture mute and configured/host mute respected').replace('- [ ] CTA fires in fallback','- [ ] Deliberate CTA routes once in selected host and standalone fallback').replace('Examples (this project):','Legacy naming examples (do not ship these values):');
const google=section('### GoogleAds Exit API Requirements','## Analytics').replaceAll('Phaser/DOM','DOM');
const checklist=`
## Three/iOS-specific release checks

- [ ] Pure core contains no renderer/DOM/SDK dependencies.
- [ ] Source behavior deviations are recorded; no inherited fixed-slot rules or full-game features silently replace the reference.
- [ ] One renderer; correct DPR sizing/picking; camera and HUD survive rotation during transit.
- [ ] Core tests cover obstruction, concurrent launches, entry congestion, group spacing, threshold admission, target matching, ammo replacement and timer/clear endings.
- [ ] Host tests cover already-ready/late/missing SDK, hidden start, viewability/exposure disagreement, null volume, pause/resume and exactly-once completion/CTA.
- [ ] IOS_SFX_GUIDELINES.md tests cover persistent voices, quick-release recovery, prime promotion, overlap, stale callbacks, selected event ownership, cancellation and hidden delayed cues.
- [ ] No unrequested audio diagnostics; automated sessions muted without modifying production audio.
- [ ] Four viewports checked: 390×844, 844×390, 768×1024, 360×640; no claiming runtime parity from source inspection.
- [ ] Final raw bytes and target ZIP sizes audited; no remaining relative model/texture/decoder paths.
- [ ] Audio-verification record distinguishes automated/media evidence from physical iPhone/iPad/Android and target-host audibility; unavailable checks marked unverified.

## Three-specific pitfalls

|Issue|Required handling|
|---|---|
|Blank boot after script hoisting|Gate DOM readiness; create playable root/canvas if absent; initialize host/config before input.|
|Font load delays|Bound font readiness (initial policy 1.5 s) and retain a measured fallback; do not hang boot.|
|DPR double scaling|setPixelRatio once, setSize with CSS dimensions; use canvas rect for picking.|
|Hidden gameplay/audio continues|Central lifecycle state pauses core/render effects and all detached media pools; invalidate pending requests.|
|A late callback stops new SFX|Per-voice generations and same-element promotion; guide's native-boundary recovery.|
|Touch gesture canceled by pointer cleanup|One selected input family and identifier-matched release/cancel.|
|Asset path survives singlefile build|Audit actual output; embed GLB buffers/textures/fonts/audio, including resources referenced by models.|
|Frame hitch or growing memory|Profile actual draws/allocations; share geometry/materials, pool transient effects and dispose owned resources.|
|Duplicate CTA|One selected adapter and one intentional click handler; stub destinations during tests.|
|Unsupported graphics/context loss|Graceful fallback/endcard, retained state and no second renderer; no automatic store redirect.|

## Target submission checks

Run the selected ironSource/LevelPlay Playable Workshop Runtime Analysis where available and all other target preview/submission checks. Mark unavailable host checks unverified; static scans are not certification.

Moloco: single HTML below the selected cap, both orientations, no XMLHttpRequest anywhere in output, no mraid.js, no automatic JavaScript redirect, and guarded no-argument FbPlayableAd.onCTAClick() from deliberate CTA. Do not use clickTag as its primary route.

Current browser-runtime evidence remains blocked by sandboxed launch failures (analysis/evidence). Do not turn a missing capture, build or device check into a pass.
`;
const document=(header+'\n'+google+tail+checklist)
 .replace('before constructing `the renderer/game`','before constructing the renderer/game')
 .replace('Keep `ExitApi.exit()` as the first branch in `triggerCTA()`','For the Google adapter, route `triggerCTA()` directly to `ExitApi.exit()`')
 .replace('Unity still uses Luna first for CTA/lifecycle where available, but MRAID must exist as the standards fallback.','Use Luna hooks only in an actual Luna host; the ordinary Unity Three.js build uses the selected MRAID adapter.')
 .replace('All four must request `<script src="mraid.js"></script>` early in the generated HTML.','Each enabled MRAID target requests `<script src="mraid.js"></script>` early in the generated HTML; optional disabled targets produce no artifact.')
 .replace('`main.ts` exposes stubs on `window` so every network\'s preview tool detects them.','`main.ts` exposes the expected lifecycle surface on `window`; actual readiness and event dispatch still require validation in each selected host.')
 .replace('No SDK pause — browser handles visibility','Application document.visibilitychange handling; add host signals only if documented')
 .replace('Build script strips `type="module"` and `crossorigin` — ad networks reject ES modules.','Build script safely finalizes classic scripts without module/crossorigin attributes for the target templates; do not generalize every host as rejecting every ES module.');
assert(!tail.includes('Phaser'));fs.writeFileSync('AGENTS.md',document);
console.log('Adapted AGENTS.md; original retained. IOS_SFX_GUIDELINES.md unchanged.');
