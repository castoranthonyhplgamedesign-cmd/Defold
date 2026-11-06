# CLAUDE.md — Playable Ads

## Stack
Phaser 3.90 · TypeScript · Vite + vite-plugin-singlefile · WebP · MP3 96kbps
Networks: AppLovin (al) · GoogleAds (gg) · IronSource (is) · Mintegral (mtg) · Facebook (fb) · Unity (un) · Vungle (vu) · Moloco (mo) · TikTok (tt)

## Porting to a new project
1. Update naming fields (3LC, vendor, concept name) in [scripts/build-all.mjs](scripts/build-all.mjs) — drives the output filename
2. Update store URLs in [constants.ts](src/constants.ts) (iOS + Android)
3. Adjust the Depth Map below to match the project's layer needs
4. Update [iteration.ts](src/iteration.ts) A/B config shape for this project's variants
5. Replace `Assets/` with project assets; update asset manifests in [BootScene.ts](src/scenes/BootScene.ts)
6. Rewrite `game/` modules for the new mechanic(s) — keep the single-responsibility split
7. Update this CLAUDE.md's Depth Map and any project-specific pitfalls

## Structure
```
src/
  main.ts              # Bootstrap, resize, MRAID gating, lifecycle stubs on window
  constants.ts         # Design coords (1080×1920), store URLs
  networks.ts          # triggerCTA(), initMraid(), bindLifecycle(), notifyGameX()
  analytics.ts         # trackEvent() → SDK
  iteration.ts         # A/B iteration config
  utils/
    responsive.ts      # sx(), sy(), sd() — coordinate helpers
  scenes/
    BootScene.ts       # Critical preload + deferred asset manifest
    GameScene.ts       # Orchestrator only — wires game/ modules, handles lifecycle
    cta.ts             # End-card layout + redirectToStore() → notifyGameClose() + triggerCTA()
  game/                # Single-responsibility modules (no direct ad-SDK calls)
    # …one file per distinct mechanic or UI widget
Assets/
scripts/build-all.mjs  # Single build → per-network HTML variants
```

### Responsibility split
- **`game/`** modules each own a single concern (one mechanic, one widget, one system).
  They receive the Phaser scene as a constructor arg and own their own game objects.
  They never call ad-SDK functions (`triggerCTA`, `notifyGameX`, `trackEvent`).
- **`GameScene.ts`** is the wiring layer: creates modules, passes data between them,
  and calls SDK helpers at the correct lifecycle moments.
- **`scenes/cta.ts`** owns end-card presentation and the store-redirect sequence.

## Rules
- 60 FPS target; never below 30 on mid-range Android
- `dist/index.html` < 5 MB; WebP images, short audio
- No hardcoded px — `sx()`, `sy()`, `sd()` only
- No audio autoplay — unmute on first `pointerdown`
- `for` loops in game logic; pool objects; no GC
- `setDisplaySize(sd())` on images — never `setScale`
- Never dim via `body`/page background

## Phaser Config
```ts
{ type: Phaser.AUTO, transparent: true,
  scale:  { mode: Phaser.Scale.NONE, width: 1080, height: 1920 },
  render: { antialias: true, pixelArt: false } }
```
`Scale.NONE` — manual sizing; CSS = viewport px; internal = viewport × DPR.
`antialias: true` — required to avoid jagged edges on scaled WebP assets (end-card logo, CTA, score pill). Never set to `false`.

## Responsive (1080×1920 ref)
```ts
const s    = Math.min(viewW / 1080, viewH / 1920)
const offX = (viewW - 1080 * s) / 2
const offY = (viewH - 1920 * s) / 2
// sx/sy/sd apply offX, offY, s
```
- `update()` polls `visualViewport` per-frame for rotation
- On change: `game.scale.resize(vw*dpr, vh*dpr)` → `relayout()`
- `bindResponsiveResize()`: rAF debounce + 100/300/600ms retries

## CTA — SDK Priority (triggerCTA fallback chain)
```
1. ExitApi.exit()             → GoogleAds (gg)
2. FbPlayableAd.onCTAClick()  → Facebook (fb)
3. Luna.Unity.Playable        → Unity (un)
4. playableSDK.openAppStore() → (runtime fallback if SDK present)
5. window.install()           → Mintegral (mtg)
6. window.openAppStore()      → (runtime fallback)
7. window.clickTag            → Moloco (mo)
8. window.__VUNGLE__          → Vungle (vu) via parent.postMessage
9. window.__TIKTOK__          → TikTok (tt) → openAppStore() or window.open fallback
10. mraid.open(url)           → AppLovin (al) / IronSource (is)
11. window.open(storeUrl)     → Fallback (all others)
```
`notifyGameClose()` fires before every CTA redirect (all networks, no-op when SDK absent).

## Analytics — SDK Priority
```
ALPlayableAnalytics.trackEvent(e)  → AppLovin (al)
playableSDK.reportEvent(e)        → (runtime fallback if SDK present)
console.log('[Analytics]', e)      → All other networks
```
Events: `DISPLAYED` · `CTA_CLICKED` · `ENDCARD_SHOWN` · `CHALLENGE_STARTED` · `CHALLENGE_SOLVED`

## Game Lifecycle (all networks)
`main.ts` exposes stubs on `window` so every network's preview tool detects them.
Stubs only set if the SDK hasn't already provided its own (`typeof` guard).
```
gameReady()  → stub in main.ts; Mintegral also gets onload body attr from build
gameStart()  → notifyGameStart() in GameScene.startPlaying()
gameEnd()    → notifyGameEnd()  in GameScene.triggerFail() / triggerWin()
gameClose()  → notifyGameClose() in cta.ts redirectToStore(), before triggerCTA()
```

### Pause / Resume / Mute (bindLifecycle in networks.ts)
| Network | Mechanism |
|---|---|
| Unity | `luna:mute` / `luna:unmute` / `luna:pause` / `luna:resume` events |
| Mintegral | `window.message` → `onPause` / `onResume` |
| Vungle | `ad-event-pause` / `ad-event-resume` events |
| AppLovin / IronSource | MRAID viewable state (gated in initMraid) |
| GoogleAds / Facebook / Moloco | No SDK pause — browser handles visibility |

## Build
Vite outputs IIFE format (`format: 'iife'`, `modulePreload: false`).
Build script strips `type="module"` and `crossorigin` — ad networks reject ES modules.

| Network | Tag | Injected | Zipped |
|---|---|---|---|
| Applovin | al | `mraid.js` | — |
| Google | gg | `exitapi.js` | ✓ |
| Ironsource | is | `mraid.js` | — |
| Mintegral | mtg | `onload="gameReady()"` | ✓ |
| Facebook | fb | — | — |
| Unity | un | — | — |
| Vungle | vu | `window.__VUNGLE__=true` | ✓ |
| Moloco | mo | — | — |
| TikTok | tt | `window.__TIKTOK__=true` | — |

Networks marked **Zipped** ingest zipped creatives — [scripts/build-all.mjs](scripts/build-all.mjs) writes a sibling `.zip` next to each HTML (one zip per variant, containing just that HTML at the root). Toggled per-network via `zip: true` in the `NETWORKS` array.

Output is grouped by **iteration length** (e.g. `2words/`, `4words/`, `full/`), with all per-network HTML variants for that iteration sitting together inside the folder:

`dist/<length>/<3lc>_<creative-type>_<vendor>_<concept-name>_<concept-num>_<gameplay>_<ugc>_<seasonal>_<lang>_<length>_<size>_<network>.html`

Example layout:
```
dist/
  2words/
    ws_mip_grhpl_wbinspiredvar1_01_real_na_noseason_en_2words_na_al.html
    ws_mip_grhpl_wbinspiredvar1_01_real_na_noseason_en_2words_na_gg.html
    …one HTML per network…
  4words/
  full/
```

| Field | Description | Example |
|---|---|---|
| 3LC | 3-letter project code | `ws` (Wordscapes), `pp` (PeoplePuzzle) |
| Creative Type | Format identifier | `mip` |
| Vendor | Studio / vendor code | `grhpl` |
| Concept Name | Creative concept (append `var1`, `var2`… for variants) | `wbinspiredvar1`, `wbinspiredvar2`, `burglar` |
| Concept # | Iteration number, zero-padded | `01`, `02`, `03` |
| Gameplay | Gameplay style | `real`, `cartoon` |
| UGC | UGC presence | `na`, `ugc`, `nougc` |
| Seasonal | Seasonal tie-in | `noseason`, `xmas` |
| Language | Locale code | `en` |
| Length | Run length | `2words`, `4words`, `7words`, `full` (Wordscapes); `2clk`, `10clk`, `120sec` (other projects) |
| Size | Region / size code | `na` |
| Network | Network tag (last segment) | `al`, `gg`, `is`, `mtg`, `fb`, `un`, `vu`, `mo`, `tt` |

Examples (this project):
- `ws_mip_grhpl_wbinspiredvar1_01_real_na_noseason_en_2words_na_al.html`  (cta2, default theme)
- `ws_mip_grhpl_wbinspiredvar1_04_real_na_noseason_en_full_na_fb.html`    (full, default theme)
- `ws_mip_grhpl_wbinspiredvar2_01_real_na_noseason_en_2words_na_gg.html`  (cta2, v1 theme)

Naming fields are defined in [scripts/build-all.mjs](scripts/build-all.mjs) — update them when porting.

## Asset Loading
- **Critical** (BootScene): first-frame assets, target < 200 KB
- **Deferred**: audio, overlays, secondary UI — loads during intro
- Gameplay start waits on a deferred-ready flag set when the secondary manifest finishes loading

## Depth Map (adjust per project)
Define depths as named constants in [constants.ts](src/constants.ts) — never use magic numbers in scene code.

| Layer | Depth |
|---|---|
| Background | 0 |
| Game objects | 1–10 |
| Logo | 17 |
| Dim overlay | 20 |
| Fail/win UI | 21 |
| EndCard input | 25 |

## Ship Checklist
- [ ] < 5 MB, all WebP
- [ ] FPS ≥ 55 under CPU throttle
- [ ] Portrait + landscape pass
- [ ] MRAID ready before gameplay
- [ ] Audio muted by default
- [ ] CTA fires in fallback
- [ ] No `console.error`
- [ ] No `type="module"` or `crossorigin` on `<script>` in output HTML
- [ ] Lifecycle: gameReady / gameStart / gameEnd / gameClose detected by all network preview tools

## Pitfalls
| Issue | Fix |
|---|---|
| Rotation stuck | `Scale.NONE` + per-frame poll |
| Mobile aliasing | Canvas = viewport × DPR |
| FPS drop on resize | rAF debounce |
| MRAID crash | `typeof mraid !== 'undefined'` guard |
| Assets not inlined | `assetsInlineLimit: 100_000_000` |
| Bundle > 5 MB | WebP q75, shorter audio |
| Audio blocked | Gate on `pointerdown` |
| Letterbox | Avoid `Scale.FIT/EXPAND/CENTER_BOTH` |
| CORS / module error | `format: 'iife'` + strip `type="module"` and `crossorigin` |
| Network preview checklist fail | Expose lifecycle stubs on `window` + call `notifyX()` with `typeof` guards |
| `playableSDK.reportEvent is not a function` | AppLovin preview injects `playableSDK` without `reportEvent` — guard with `typeof playableSDK.reportEvent === 'function'`, not just `typeof playableSDK !== 'undefined'` |
| iPhone black screen (Android works) | **Only one `Phaser.Game` per page, ever.** iOS WKWebView — used by AppLovin/IronSource preview apps and most in-app ad containers — caps or outright rejects the 2nd WebGL context. If a background scene is spun up as a separate `new Phaser.Game()` synchronously at module load, it can throw before `await initMraid()` and before the font promise resolves, so the rest of `main.ts` never runs → black screen with no visible error. Render the background as a CSS `background-image` on `#bg-container` (cover-sized) instead — zero WebGL contexts for the background, and nothing to throw at module-load time. iOS-debug path: enable Safari → Advanced → Web Inspector on the iPhone, connect to a Mac, open Develop → iPhone → preview WebView, read the Console. Without a Mac, temporarily install top-of-`main.ts` `window.addEventListener('error',…)` and `unhandledrejection` handlers that write the error into `document.body.innerHTML` so the failure is visible on-screen. |
| iOS hangs on font load | `document.fonts.load()` silently stalls in WKWebView when `@font-face` uses base64 `data:` URLs. Race against a 1.5 s timeout: `Promise.race([Promise.all([…fonts]), new Promise(r=>setTimeout(r,1500))]).then(startGame)` |
| iOS hangs on MRAID ready | `mraid.addEventListener('ready', …)` can miss the event if the container fires it before the listener attaches. `initMraid()` must self-resolve after ~2 s so `startGame()` always runs; also check `mraid.getState() !== 'loading'` first. |
| External `src=` survives build | `vite-plugin-singlefile` only inlines assets *imported from JS*. A raw `<img src="src/assets/…">` in `index.html` ships as a literal relative path and fails in ad sandboxes, producing inconsistent per-device load failures. Leave DOM `<img>` elements with no `src`; assign via JS from `assets.ts` at boot (`setEndcardHtmlAssets()`). |
| Audio keeps playing when ad hides | Add `visibilitychange` listener in the sound module — mute Phaser's sound system and `suspend()` the `AudioContext` when `document.hidden`, resume on return. Spec requires audio stop on hide/close. |
| `mraid.open()` silently no-ops | Guard with `mraid.getState() !== 'loading'` before calling; fall through to `window.open()` if still loading. |
| Previewer black screen with `Cannot read properties of null (reading 'appendChild')` in Phaser boot | Two compounding causes: (1) `vite-plugin-singlefile` hoists the bundled script into `<head>`, and the build strips `type="module"`, so the script runs **synchronously before `<body>` is parsed** — `document.body` is null. Wrap main.ts in a `DOMContentLoaded` gate (`if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot) else boot()`). (2) `parent: 'game'` (string selector) fails when the previewer sandbox strips custom DOM; create `<div id="game">` at runtime inside `boot()` and pass the **element reference** (not the string) to `Phaser.Game({ parent })`. The cascading `ScaleManager.resize → Cannot set properties of undefined (setting 'width')` errors all trace back to `game.canvas` never being created when either of these fail. |
| NineSlice won't shrink in landscape | Phaser's `NineSlice` silently clamps its minimum dimensions to `(leftWidth + rightWidth) × (topHeight + bottomHeight)` **in source pixels**. Symptom: one UI chrome element stays huge in landscape while every other `sd()`-driven element rescales correctly — because the requested `sd(H)` is below the inset total. Shrinking the insets fixes the scale clamp but stretches the art's rounded corners. The right fix: **operate the NineSlice in source-pixel space and scale it uniformly with `setScale(sd(1))`**. Keep `setSize(wSrc, hSrc)` in source px so the center stretches horizontally with text growth while corners stay intact; the `sd(1)` scale is what makes the whole object shrink in landscape, bypassing the min-dim clamp entirely. When reading `this.preview.width` (which is in scaled px) to decide `wSrc`, divide by `sd(1)` to convert back to source space. Tween callers that reset `setScale(1)` also need updating — the bg's base scale is now `sd(1)`, not 1. See [SelectionLine.ts](src/game/SelectionLine.ts) for the pattern. |
| Unity (un) submission: "not allowed to use window.top" | Luna's static scan flags the literal `window.top`, which Phaser 3 ships internally. In `build-all.mjs`, rewrite `window.top` → `window.self` for the `un` HTML only (other networks keep the original). Safe inside the playable's own frame because the iframe-vs-top check collapses to always-top. |

## IronSource — Runtime Analysis
IronSource requires every `_is.html` build to pass **LevelPlay → Creative Management → Playable Workshop** (Runtime Analysis / Playable Validator) before launch. Skipping this can get the ad disabled. The validator runs in an iOS-like WKWebView sandbox and exposes console errors — use it as a free diagnostic channel for iPhone-only failures when a Mac + Safari remote-debug isn't available.
