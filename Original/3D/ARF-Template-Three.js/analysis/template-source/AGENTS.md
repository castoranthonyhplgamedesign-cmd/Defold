# AGENTS.md — Playable Ads

## Current Arrow Flow prototype

This repository currently runs a Babylon.js scene, as requested for the Unity 3D port. The Phaser structure and build guidance below is the original playable-ad template guidance; use it when that stack is added, but preserve the Babylon implementation for this prototype.

- Scene-specific values and Unity object names live in `src/projectLayout.ts`.
- `src/game/arrowGrid.ts`, `src/game/conveyorPath.ts`, and `src/game/conveyor.ts` are reusable mechanics. Do not put a particular board's coordinates, conveyor shape, or shooter positions in these modules.
- `src/layout/unityLayout.ts` discovers arrow groups from the exported JSON. `src/main.ts` maps Unity nodes and assets to Babylon meshes and wires the mechanics.
- `TEMPLATE_GUIDE.md` describes how to port another grid, conveyor path, and turret arrangement.
- Keep `npm run build` passing and `dist/index.html` below 5 MB.

## Stack
Phaser 3.90 · TypeScript · Vite + vite-plugin-singlefile · WebP · MP3 96kbps
Networks: Applovin (al) · GoogleAds (gg) · Ironsource (is) · Mintegral (mtg) · Facebook (fb) · Unity (un) · Vungle (vu) · Moloco (mo) · TikTok (tt) · Liftoff (lf)

## Porting to a new project
1. Update naming fields (3LC, creative type, vendor, concept name, sub-concept name, gameplay, UGC, seasonal, language, length, size, network) in [scripts/build-all.mjs](scripts/build-all.mjs) — drives the output filename
2. Update store URLs in [constants.ts](src/constants.ts) (iOS + Android)
3. Adjust the Depth Map below to match the project's layer needs
4. Update [iteration.ts](src/iteration.ts) A/B config shape for this project's variants
5. Replace `Assets/` with project assets; update asset manifests in [BootScene.ts](src/scenes/BootScene.ts)
6. Rewrite `game/` modules for the new mechanic(s) — keep the single-responsibility split
7. Update this AGENTS.md's Depth Map and any project-specific pitfalls

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
2. FbPlayableAd.onCTAClick()  → Facebook (fb) · Moloco (mo)
3. Luna.Unity.Playable        → Unity (un)
4. playableSDK.openAppStore() → (runtime fallback if SDK present)
5. window.install()           → Mintegral (mtg)
6. window.openAppStore()      → (runtime fallback)
7. window.clickTag            → Moloco (mo) fallback
8. window.__VUNGLE__          → Vungle (vu) via parent.postMessage
9. window.__TIKTOK__          → TikTok (tt) → openAppStore() or window.open fallback
10. mraid.open(url)           → Applovin (al) / Ironsource (is) / Unity (un fallback after Luna) / Liftoff (lf)
11. window.open(storeUrl)     → Fallback (all others)
```
`notifyGameClose()` fires before every CTA redirect (all networks, no-op when SDK absent).
MRAID CTA calls must be guarded: require `typeof mraid.open === 'function'`; treat missing `mraid.getState()` as `ready`; if state is still `loading`, fall through to `window.open(storeUrl)`.

### GoogleAds Exit API Requirements
GoogleAds (`gg`) builds must include Google's official Exit API script inside the HTML `<head>`:

```html
<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>
```

Do not reference Google's implementation URL directly:

`https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi-impl.js`

Google's validator can reject that implementation URL with `URL_FETCH_NOT_ALLOWED`. The only Google Exit API URL that should appear in generated `gg` HTML is the official `exitapi.js` script URL above.

CTA code for Google must call `ExitApi.exit()` from the click/tap handler. Keep `ExitApi.exit()` as the first branch in `triggerCTA()` and guard it with `typeof ExitApi !== 'undefined' && typeof ExitApi.exit === 'function'`. A standard HTML CTA may use `onclick="ExitApi.exit()"`, but Phaser/DOM button handlers should call the same API from their click callback. If Google validation reports the `ExitApi.exit()` call is missing, inspect the built `gg` HTML and bundle text, not only source TypeScript, and confirm the literal `ExitApi.exit()` call survived minification/build output.

## Analytics — SDK Priority
```
ALPlayableAnalytics.trackEvent(e)  → Applovin (al)
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
| Unity | `luna:mute` / `luna:unmute` / `luna:pause` / `luna:resume` events; also shared MRAID exposure/viewability when `mraid.js` is present |
| Mintegral | `window.message` → `onPause` / `onResume` |
| Vungle | `ad-event-pause` / `ad-event-resume` events |
| Applovin / Ironsource / Unity / Liftoff | MRAID 3.0 `exposureChange`, MRAID 2.0 fallback `viewableChange` / `isViewable`, and `audioVolumeChange` (gated in `initMraid`) |
| GoogleAds / Facebook / Moloco | No SDK pause — browser handles visibility |

### MRAID 3.0 Requirements & Best Practices
MRAID networks are **Applovin (`al`)**, **Ironsource (`is`)**, **Unity (`un`)**, and **Liftoff (`lf`)**. All four must request `<script src="mraid.js"></script>` early in the generated HTML. Liftoff uses the standard MRAID implementation with no network-specific bridge ahead of MRAID. Unity still uses Luna first for CTA/lifecycle where available, but MRAID must exist as the standards fallback.

Creative requirements from the MRAID 3.0 spec and Best Practices Guide:

- Request `mraid.js` as early as possible, exactly once, either with `<script src="mraid.js"></script>` or DOM insertion. Do not rely on the container to inject it automatically.

- Wait for both DOM readiness and MRAID readiness before starting rich media behavior. Use `document.readyState` / `DOMContentLoaded` or `load` for the DOM side.

- Use `mraid.getState()` together with `mraid.addEventListener('ready', ...)` so the creative still starts when the container fires `ready` before the listener attaches.

- Guard access to `mraid` and MRAID methods with `typeof` checks. Treat missing optional methods as unsupported and fall back gracefully.

- Use `mraid.open(url)` for MRAID clickthroughs. Avoid `<a href>`, `location.href` / `assign` / `replace`, and unguarded `window.open`.

- Include `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">` or an equivalent mobile viewport tag.

- Do not assume nested iframes can access native MRAID. If nested iframe access is required, the outer frame must provide its own bridge.

- Use `exposureChange` as the MRAID 3.0 viewability signal, then degrade to `viewableChange` / `isViewable()` for MRAID 2.0 compatibility.

- Listen for `audioVolumeChange`; `null` is valid and must be ignored. Only apply volume math when the value is numeric.

- Listen for `error`; if the ad cannot run or assets fail, gracefully degrade or call `mraid.unload()` instead of showing a broken/blank ad.

- Call `setResizeProperties()` before `resize()`. Do not use `resize()` for full-screen takeovers; use `expand()` for that case.

- Avoid resizing or expanding interstitials. Check placement with `getPlacementType()` when one creative can serve inline and interstitial placements.

- Avoid `useCustomClose()` and custom close indicators in MRAID 3.0. The host provides the close control.

- Avoid two-part expandable ads (`expand(url)`); use self-contained one-part expandables.

- Call `supports()` before optional/native features such as `storePicture`, `createCalendarEvent`, `getLocation`, VPAID, SMS/tel, or inline video behavior.

- Use `playVideo()` for native video playback cases instead of `mraid.open(videoUrl)`. Use HTML5 `<video>` for inline playback when supported.

Implementation requirements for `networks.ts` / `networks.js`:

- Export `initMraid(timeoutMs = 2000, detectTimeoutMs = 500)` and call it at module load.

- If `window.mraid` is missing at module load, poll briefly (`detectTimeoutMs`, default 500 ms) for late container injection before resolving as no-MRAID.

- If MRAID exists and `mraid.getState() === 'loading'`, wait for `mraid.addEventListener('ready', ...)`; self-resolve after `timeoutMs` (default 2000 ms) so startup never hangs.

- `main` / boot must `await initMraid()` before constructing `new Phaser.Game(...)`.

- On setup, seed cached visibility from `mraid.isViewable()` when available.

- Register MRAID callbacks once, before any Phaser scene is ready:
  - `mraid.addEventListener('error', (message, action) => ...)` — log or gracefully handle failed/unsupported MRAID calls.
  - `mraid.addEventListener('stateChange', state => ...)` — required when using state-changing MRAID behavior such as `close`, `expand`, or `resize`.
  - `mraid.addEventListener('exposureChange', exposedPercentage => ...)` — MRAID 3.0 primary viewability. Pause when `exposedPercentage <= 0`; resume when positive.
  - `mraid.addEventListener('viewableChange', viewable => ...)` — MRAID 2.0 compatibility fallback.
  - `mraid.addEventListener('audioVolumeChange', pct => ...)` — only apply `pct / 100` when `typeof pct === 'number'`.

- In `bindLifecycle(scene)`, apply cached hidden/non-exposed MRAID state immediately once a scene exists.

- If the creative renders its own close control, wire that control to a guarded `mraid.close()` helper and call `notifyGameClose()` before closing.

## Build
Vite outputs IIFE format (`format: 'iife'`, `modulePreload: false`).
Build script strips `type="module"` and `crossorigin` — ad networks reject ES modules.

Every built HTML file must include `<meta name="network" content="<networkname>">` in `<head>`, where `<networkname>` is the lowercase value from the `Network` column for that output. This tag is required for internal tool parsing.

MRAID networks (`al`, `is`, `un`, `lf`) inject exactly one `<script src="mraid.js"></script>` request.
Google (`gg`) injects Google's official hosted `<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>` in `<head>`. Never inject or preserve remote Google Exit API implementation URLs; the generated `gg` HTML must not contain `https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi-impl.js`.
If built output contains `console.error` from Phaser or bundled node modules, prefer dropping it at bundle time instead of editing library source. Add this option to the shared Vite config, usually `vite.shared.js`:

```js
export default {
  esbuild: {
    pure: ['console.error'],
  },
};
```

Keep project-authored error handling meaningful: use visible fallback UI, `console.warn`, or guarded debug logging where needed.

| Network | Tag | Injected | Zipped | Included |
|---|---|---|---|---|
| Applovin | al | `mraid.js` | — | ✓ |
| Google | gg | `exitapi.js` | ✓ | ✓ |
| Ironsource | is | `mraid.js` | — | ✓ |
| Mintegral | mtg | `onload="gameReady()"` | ✓ | ✓ |
| Facebook | fb | — | — | ✓ |
| Unity | un | `mraid.js` | — | ✓ |
| Vungle | vu | `window.__VUNGLE__=true` | ✓ | ✓ |
| Moloco | mo | — | — | ✓ |
| TikTok | tt | `window.__TIKTOK__=true` | — | — |
| Liftoff | lf | `mraid.js` | — | ✓ |


Networks marked **Zipped** ingest zipped creatives — [scripts/build-all.mjs](scripts/build-all.mjs) writes a `.zip` containing the HTML (one zip per variant, containing just that HTML at the root named index.html). Toggled per-network via `zip: true` in the `NETWORKS` array.

Networks marked **Included** are built by default. Networks not marked are prepared for but not built. Toggle per-network via `included: true` in the `NETWORKS` array.

Output is grouped by **iteration length** (e.g. `2words/`, `4words/`, `full/`), with all per-network HTML or ZIP variants for that iteration sitting together inside the folder:

`dist/<length>/<3lc>_<creative-type>_<vendor>_<concept-name>_<sub-concept-name>_<gameplay>_<ugc>_<seasonal>_<language>_<length>_<size>_<network>`

Example layout:
```
dist/
  2words/
      ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_al.html
      ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_gg.zip
      ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_is.html
    …one HTML or ZIP per network…
  4words/
  full/
```

| Field | Description | Example |
|---|---|---|
| 3LC | 3-letter project code | `cos` (CoinSort), `ws` (Wordscapes), `wss` (Wordscape Solitaire), `pp` (Profile Perfect) |
| Creative Type | Format identifier; default to `mip` | `mip`, `sip` |
| Vendor | Studio / vendor code | `grhpl` |
| Concept Name | Creative concept | `dirtycoins`, `wbinspired`, `burglar` |
| Sub-Concept Name | Theme or variant | `white`, `black`, `default` |
| Gameplay | Gameplay style | `real`, `cartoon` |
| UGC | UGC presence | `na`, `ugc`, `nougc` |
| Seasonal | Seasonal tie-in | `noseason`, `xmas` |
| Language | Locale code | `en` |
| Length | Run length before endcard | `2clicks`, `2words`, `60seconds`, `full` |
| Size | Region / size code; default to `na` | `na` |
| Network | Abbreviated network tag (last segment) | `al`, `gg`, `is`, `mtg`, `fb`, `un`, `vu`, `mo`, `tt`, `lf` |

All filename segments must be lowercase. Convert project/client labels such as `COS`, `MIP`, `GRHPL`, `NoUGC`, `NoSeason`, `EN`, or `2Words` to lowercase in output filenames.

Examples (this project):
- `ws_mip_grhpl_wbinspired_white_real_na_noseason_en_2words_na_al.html`  (2 words, white theme)
- `ws_mip_grhpl_wbinspired_black_real_na_noseason_en_full_na_fb.html`    (full, black theme)
- `cos_mip_grhpl_dirtycoins_default_real_na_noseason_en_2clicks_na_gg.html` (2 clicks, default theme)

Naming fields are defined in [scripts/build-all.mjs](scripts/build-all.mjs) — update them when porting.

## Asset Loading

- **Critical** (BootScene): first-frame assets, target < 200 KB

- **Deferred**: audio, overlays, secondary UI — loads during intro

- Gameplay start waits on a deferred-ready flag set when the secondary manifest finishes loading

## Inline Game Configuration

Use this section as the baseline when porting `AGENTS.md` to another playable project. Preserve the object structure, field names, marker names, and placement contract. Replace project-specific values and omit only the fields explicitly marked as conditional. Add project-specific fields when needed so every modifiable game setting remains represented in the same object.

Every built HTML file must contain `<meta name="network" content="<networkname>">` and classic script blocks inside `<head>`. The document starts with `<!DOCTYPE html>`, then `<html><head>`. The external config editor/parser may inject overrides immediately after the opening `<head>` tag, so assign `window.GAME_CONFIG` only after that injection point. The editable object must be named `GAME_CONFIG_DEFAULTS` and enclosed by the exact, unescaped sentinels `/*__INLINE_GAME_CONFIG_START__*/` and `/*__INLINE_GAME_CONFIG_END__*/`.

```html
<!DOCTYPE html>
<html>
<head>
<meta name="network" content="applovin">
<script>
/*__INLINE_GAME_CONFIG_START__*/
const GAME_CONFIG_DEFAULTS = { // TypeScript interface: GameConfig
  APP_LINKS: {
    app_store: "...",
    google_play: "..."
  },
  MUTE: false,
  GAME_LENGTH: {
    timeLimit: 9999, // When using a time limit, set clickLimit to the maximum value.
    clickLimit: 9999 // When using a click limit, set timeLimit to the maximum value.
  },
  GAME_BACKGROUND_TYPE: "Gradient" | "Image" | "Color",
  GAME_BACKGROUND_COLOR: [51, 63, 141], // [R, G, B]; used only for "Color".
  GAME_BACKGROUND_COLOR_CONFIG: { // ColorTuple[]; used only for "Gradient".
    gradientDirection: "vertical" | "horizontal",
    colors: [
      [0, 0, 0],
      [255, 255, 255]
    ]
  },
  SHOW_PACKSHOT: false, // Whether to show the end card.
  CHANGABLE_TEXTURES: [ // Texture2D[]
    {
      spriteName: "...", // Original/runtime sprite name.
      path: "", // Empty at rest; filled from __CHANGEABLE_ASSETS__ unless overridden.
      originalSize: { width: 9999, height: 9999 }, // Original file resolution.
      format: "webp",
      uuid: "...", // Use the same value as spriteName for simple stable mapping.
      resizeBlocked: true, // Prevent the auto-resizer from changing this sprite.
      anchorPoint: { x: 0.5, y: 0.5 },
      scale: 1
    }
  ],
  CHANGABLE_SOUNDTRACKS: [ // Soundtrack[]
    {
      id: "...",
      path: "",
      volume: 1,
      loop: true,
      format: "mp3",
      uuid: "..." // Use the same value as id for simple stable mapping.
    }
  ],
  HAND_TUTOR_MODE: true, // Include only when the playable has a hand hint.
  TUTORIAL_DELAY: 15, // Idle seconds before the hand hint; include only with a hand hint.
  TIMER_ENABLED: false, // Include only when the playable has a countdown timer.
  START_TIMER_VALUE: 999, // Include only when the playable has a countdown timer.
  AUTO_PLAY_MODE: false, // Include only when the playable implements autoplay behavior.
  VIDEO_INTRO: false, // Include only when the playable implements a video intro.
  OPENING_GAMEPLAY_ANIMATION: false // Enables project-specific opening animation behavior.
};
/*__INLINE_GAME_CONFIG_END__*/
window.GAME_CONFIG_DEFAULTS = GAME_CONFIG_DEFAULTS;
window.__CHANGEABLE_ASSETS__ = {
  "...": "data:image/webp;base64,...",
  "...": "data:audio/mpeg;base64,..."
};
</script>

<script>
window.GAME_CONFIG = window.GAME_CONFIG_DEFAULTS;
</script>
</head>
<body>
  <div id="game"></div>
</body>
</html>
```

The marked config block describes the playable; it must never contain the playable's asset bytes. Keep image and audio payloads outside the sentinels in `window.__CHANGEABLE_ASSETS__`, keyed by stable `uuid` with fallback support for `spriteName` / `id`.

Implementation requirements:


- Treat `GAME_CONFIG_DEFAULTS` as the single public source for all modifiable gameplay settings, app links, background behavior, packshot visibility, tutorial behavior, limits, replaceable textures, and replaceable soundtracks.

- Support an optional `window.GAME_CONFIG` override loaded before game boot. The external config editor/parser may install an accessor immediately after the opening `<head>` tag, so the build must assign `window.GAME_CONFIG = window.GAME_CONFIG_DEFAULTS;` after that point exactly as shown above. The override system is then responsible for merging supplied values over the defaults. An override changes only the exact supplied field while unspecified sibling fields retain their default values. Merge texture entries by `uuid` or `spriteName` and soundtrack entries by `uuid` or `id`, allowing one asset to be overridden without removing the rest of the required manifest.

- Prefer valid nested-object override syntax:

  ```js
  window.GAME_CONFIG = {
    GAME_LENGTH: { timeLimit: 10 },
    APP_LINKS: { app_store: "https://example.com/app" }
  };
  ```


- Also accept quoted dotted-path keys for integrations that provide flattened settings:

  ```js
  window.GAME_CONFIG = {
    "GAME_LENGTH.timeLimit": 10,
    "APP_LINKS.app_store": "https://example.com/app"
  };
  ```

  Assignments such as `GAME_LENGTH.timeLimit = 10` are not valid inside a JavaScript object literal and must not be used as object entries.

- Runtime code must consume the inline values; the block is not metadata-only. Retain safe typed fallbacks for local development when the inline block is absent.

- Every field emitted for a project must produce runtime behavior. Omit unsupported capability fields instead of publishing inert switches. Identity/encoding fields must participate in loading or override resolution: use `uuid` as an asset override key and `format` to normalize/validate the media MIME type.

- Runtime code must hydrate empty asset paths from `window.__CHANGEABLE_ASSETS__` after `window.GAME_CONFIG` is resolved and before Phaser asset loading. A blank `path` means "use the bundled default data URI from `window.__CHANGEABLE_ASSETS__`." A non-empty `path` may be either a relative path to an asset or a `data:` URI, and means "use this provided asset path or data URI"; it must be preserved. Fill only empty `path` fields; if the external config editor/parser or another override already supplied a `path`, do not overwrite it. This hydration may live in a TypeScript config/runtime module rather than as a literal inline script, as long as the built playable behaves the same.

- Use `9999` as the maximum/unlimited sentinel for an inactive time or click limit. A project may add another limit such as `wordLimit` inside `GAME_LENGTH`, but must document and consume it consistently.

- Use the canonical property spelling `CHANGABLE_TEXTURES` and `CHANGABLE_SOUNDTRACKS` for client compatibility, even though “changeable” is normally spelled differently.

- `CHANGABLE_TEXTURES[].spriteName` and `CHANGABLE_SOUNDTRACKS[].id` are stable runtime asset keys. For simplicity, use the same value for each entry's `uuid` as its `spriteName` or `id`, and key `window.__CHANGEABLE_ASSETS__` with that same value. Production `path` values must default to `""` inside `GAME_CONFIG_DEFAULTS`; the creative remains self-contained because data URIs live in `window.__CHANGEABLE_ASSETS__` outside the marked config block.

- The marked config block must stay small and parser-friendly. It should be under 100 KB and must not contain `data:image` or `data:audio` payloads.

- Conditional hand-hint, timer, autoplay, video-intro, and opening-animation fields should be omitted when that mechanic does not exist.

- Add every other project-specific, externally modifiable setting to `GAME_CONFIG_DEFAULTS`; do not leave editable behavior scattered across source constants or a second public config object.

- The build must create `GAME_CONFIG.md` in its output root. Generate this guide from the same built config metadata emitted into `GAME_CONFIG_DEFAULTS`; do not document source-project file paths as built defaults. If a value is not overridable, say so instead of printing a plausible-looking default. The guide must list every variable and nested field present in the generated config block in a Markdown table with these columns: `Variable name`, `What it controls`, `Accepted value types and range`, and `Default value used`.
- The configuration guide must also explain the `window.GAME_CONFIG` precedence, nested-object syntax, optional quoted dotted-path syntax, deep-merge behavior, array-replacement behavior, and replaceable asset slots by stable key, format, target dimensions, and exposed tuning fields such as `volume`, `loop`, `anchorPoint`, `scale`, and `resizeBlocked` when present.

- Keep generated config readable: serialize it with indentation (for example, `JSON.stringify(config, null, 2)`) rather than writing the entire object on one line. Large data-URI strings belong in `window.__CHANGEABLE_ASSETS__`, outside the marked config block.

### Config Editor Outcomes

- Every `CHANGABLE_*` slot is replaceable in the editor asset panel.
- Texture slots expose real thumbnails and correct target dimensions from `originalSize`.
- Asset swaps are size-neutral because replacements are spliced into `window.__CHANGEABLE_ASSETS__` while overrides stay small.
- Tuning parameters survive because arrays are metadata-only, allowing fields like `volume` and `loop` to remain editable.
- Previews stay fast because the external config editor/parser reads a small config instead of a multi-megabyte payload block.

Project defaults must mirror the Phaser runtime rather than placeholder/example values:


- Store project-owned runtime defaults in `src/projectDefaults.json`. Phaser modules and `build-all.mjs` must read the same source; do not copy sample values into either side. The build serializes these project values into `GAME_CONFIG_DEFAULTS`, after which `window.GAME_CONFIG` may override supported fields.

- Treat the configuration flow as `Phaser implementation/assets → GAME_CONFIG_DEFAULTS → window.GAME_CONFIG`. Never modify Phaser layout or gameplay merely to match placeholder values from the schema.

- Generate each texture's `originalSize` from its actual WebP dimensions and `format` from its actual file extension.

- Phaser images use `anchorPoint` as their runtime origin. `scale` is a multiplier on the responsive authored size. When `resizeBlocked` is `false`, use `originalSize × scale`; when it is `true`, retain the authored layout size and apply only the scale multiplier.

- The current authored images use `{ x: 0.5, y: 0.5 }`, `scale: 1`, and `resizeBlocked: true`.

- Generate soundtrack `format` from the source extension. The configured `volume` and `loop` values are the actual base values consumed by Phaser, not descriptive metadata.

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

- [ ] Google (`gg`) CTA path calls `ExitApi.exit()` and built `gg` output contains the literal call

- [ ] No `console.error`

- [ ] No `type="module"` or `crossorigin` on `<script>` in output HTML

- [ ] Google (`gg`) HTML includes the official hosted `exitapi.js` script in `<head>` and never references remote `exitapi-impl.js`

- [ ] Each built HTML has `<meta name="network" content="<networkname>">` in `<head>` using the lowercase `Network` value

- [ ] Lifecycle: gameReady / gameStart / gameEnd / gameClose detected by all network preview tools

- [ ] Config-related scripts live inside `<head>`

- [ ] Marked config block is under 100 KB and contains no `data:image` or `data:audio`

- [ ] Every `CHANGABLE_*` entry has a stable `uuid`

- [ ] Every default `uuid` resolves in `window.__CHANGEABLE_ASSETS__`

- [ ] Hydration fills only empty `path` values and does not overwrite asset overrides

- [ ] `GAME_CONFIG.md` describes the built config, not source-only paths or non-overridable placeholders

## Pitfalls
| Issue | Fix |
|---|---|
| Rotation stuck | `Scale.NONE` + per-frame poll |
| Mobile aliasing | Canvas = viewport × DPR |
| FPS drop on resize | rAF debounce |
| MRAID crash | `typeof mraid !== 'undefined'` guard |
| Assets not inlined | `assetsInlineLimit: 100_000_000` |
| Bundle > 5 MB | WebP q75, shorter audio |
| Built output contains library `console.error` | If `console.error` comes from Phaser or bundled node modules, add `esbuild: { pure: ['console.error'] }` in `vite.shared.js` so it is dropped at bundle time. Do not edit library source. |
| Audio blocked | Gate on `pointerdown` |
| Letterbox | Avoid `Scale.FIT/EXPAND/CENTER_BOTH` |
| CORS / module error | `format: 'iife'` + strip `type="module"` and `crossorigin` |
| Network preview checklist fail | Expose lifecycle stubs on `window` + call `notifyX()` with `typeof` guards |
| Google rejects `URL_FETCH_NOT_ALLOWED: https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi-impl.js` | Do not reference the remote Exit API implementation URL directly. For `gg`, inject only the official hosted `<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>` in `<head>`, and verify the generated HTML contains no `exitapi-impl.js` string. |
| Google reports missing `ExitApi.exit()` | The `gg` CTA must call `ExitApi.exit()` from the click handler. Keep a guarded literal call in `triggerCTA()` (`typeof ExitApi !== 'undefined' && typeof ExitApi.exit === 'function'`) and verify the built/minified `gg` HTML still contains `ExitApi.exit()`. HTML CTAs may use `onclick="ExitApi.exit()"`. |
| `playableSDK.reportEvent is not a function` | Applovin preview injects `playableSDK` without `reportEvent` — guard with `typeof playableSDK.reportEvent === 'function'`, not just `typeof playableSDK !== 'undefined'` |
| iPhone black screen (Android works) | **Only one `Phaser.Game` per page, ever.** iOS WKWebView — used by Applovin/Ironsource preview apps and most in-app ad containers — caps or outright rejects the 2nd WebGL context. If a background scene is spun up as a separate `new Phaser.Game()` synchronously at module load, it can throw before `await initMraid()` and before the font promise resolves, so the rest of `main.ts` never runs → black screen with no visible error. Render the background as a CSS `background-image` on `#bg-container` (cover-sized) instead — zero WebGL contexts for the background, and nothing to throw at module-load time. iOS-debug path: enable Safari → Advanced → Web Inspector on the iPhone, connect to a Mac, open Develop → iPhone → preview WebView, read the Console. Without a Mac, temporarily install top-of-`main.ts` `window.addEventListener('error',…)` and `unhandledrejection` handlers that write the error into `document.body.innerHTML` so the failure is visible on-screen. |
| iOS hangs on font load | `document.fonts.load()` silently stalls in WKWebView when `@font-face` uses base64 `data:` URLs. Race against a 1.5 s timeout: `Promise.race([Promise.all([…fonts]), new Promise(r=>setTimeout(r,1500))]).then(startGame)` |
| iOS hangs on MRAID ready | `mraid.addEventListener('ready', …)` can miss the event if the container fires it before the listener attaches. `initMraid()` must self-resolve after ~2 s so `startGame()` always runs; also check `mraid.getState() !== 'loading'` first. |
| External `src=` survives build | `vite-plugin-singlefile` only inlines assets *imported from JS*. A raw `<img src="src/assets/…">` in `index.html` ships as a literal relative path and fails in ad sandboxes, producing inconsistent per-device load failures. Leave DOM `<img>` elements with no `src`; assign via JS from `assets.ts` at boot (`setEndcardHtmlAssets()`). |
| Audio keeps playing when ad hides | Add `visibilitychange` listener in the sound module — mute Phaser's sound system and `suspend()` the `AudioContext` when `document.hidden`, resume on return. Spec requires audio stop on hide/close. |
| `mraid.open()` silently no-ops | Guard with `mraid.getState() !== 'loading'` before calling; fall through to `window.open()` if still loading. |
| Previewer black screen with `Cannot read properties of null (reading 'appendChild')` in Phaser boot | Two compounding causes: (1) `vite-plugin-singlefile` hoists the bundled script into `<head>`, and the build strips `type="module"`, so the script runs **synchronously before `<body>` is parsed** — `document.body` is null. Wrap main.ts in a `DOMContentLoaded` gate (`if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot) else boot()`). (2) `parent: 'game'` (string selector) fails when the previewer sandbox strips custom DOM; create `<div id="game">` at runtime inside `boot()` and pass the **element reference** (not the string) to `Phaser.Game({ parent })`. The cascading `ScaleManager.resize → Cannot set properties of undefined (setting 'width')` errors all trace back to `game.canvas` never being created when either of these fail. |
| NineSlice won't shrink in landscape | Phaser's `NineSlice` silently clamps its minimum dimensions to `(leftWidth + rightWidth) × (topHeight + bottomHeight)` **in source pixels**. Symptom: one UI chrome element stays huge in landscape while every other `sd()`-driven element rescales correctly — because the requested `sd(H)` is below the inset total. Shrinking the insets fixes the scale clamp but stretches the art's rounded corners. The right fix: **operate the NineSlice in source-pixel space and scale it uniformly with `setScale(sd(1))`**. Keep `setSize(wSrc, hSrc)` in source px so the center stretches horizontally with text growth while corners stay intact; the `sd(1)` scale is what makes the whole object shrink in landscape, bypassing the min-dim clamp entirely. When reading `this.preview.width` (which is in scaled px) to decide `wSrc`, divide by `sd(1)` to convert back to source space. Tween callers that reset `setScale(1)` also need updating — the bg's base scale is now `sd(1)`, not 1. See [SelectionLine.ts](src/game/SelectionLine.ts) for the pattern. |
| Unity (un) submission: "not allowed to use window.top" | Luna's static scan flags the literal `window.top`, which Phaser 3 ships internally. In `build-all.mjs`, rewrite `window.top` → `window.self` for the `un` HTML only (other networks keep the original). Safe inside the playable's own frame because the iframe-vs-top check collapses to always-top. |
| MRAID network missing `mraid.js` | MRAID 3.0 creatives must request `mraid.js` early. Inject `<script src="mraid.js"></script>` exactly once for Applovin (`al`), Ironsource (`is`), Unity (`un`), and Liftoff (`lf`), even if the container may also expose runtime MRAID objects. |
| MRAID listener wired too late | Previewers can probe MRAID before any Phaser scene is ready — if listeners are wired only inside `bindLifecycle` / scene `create()`, the creative can miss `ready`, `exposureChange`, or `viewableChange`. Fix: call `initMraid()` at `networks.ts` module-load time, guarded by `getState() === 'loading'` → `addEventListener('ready', setupMraid)` vs immediate call. Cache `_mraidViewable` / `_mraidExposed`; in `bindLifecycle` apply cached hidden/non-exposed state immediately. |
| MRAID 3.0 `exposureChange` not handled | MRAID 3.0 containers dispatch `exposureChange` with `exposedPercentage` directly instead of — or in addition to — `viewableChange`. If only listening to `viewableChange`, the ad may never receive pause signals on newer AL/IS/Unity/Liftoff builds. Register both: `mraid.addEventListener('exposureChange', exposedPercentage => onExposure(exposedPercentage > 0))` and `mraid.addEventListener('viewableChange', onViewable)` inside `initMraid()`. Seed initial state from `mraid.isViewable()` on ready. |
| MRAID 3.0 `audioVolumeChange` not handled | MRAID 3.0 containers fire `audioVolumeChange` with a volume level (0–100) or `null` when unavailable. Without a listener, the ad ignores host-level mute/unmute signals; if `null` is divided by 100, the ad can mute accidentally. Register `mraid.addEventListener('audioVolumeChange', v => { if (typeof v === 'number') scene.sound.setVolume(v / 100) })` in `initMraid()`. |
| MRAID `error` listener missing | Validators expect failed or unsupported MRAID calls to be observable. Register `mraid.addEventListener('error', (message, action) => console.warn('[MRAID error]', { message, action }))` during early MRAID setup. |
| MRAID `stateChange` listener missing | If the creative uses state-changing container behavior such as `mraid.close()`, `expand`, or `resize`, validators expect a `stateChange` listener. Register `mraid.addEventListener('stateChange', state => console.log('[MRAID stateChange]', state))` with the other early MRAID callbacks. |
| Custom close control not wired to MRAID | If the creative renders its own close button, the button must call a guarded close helper: `notifyGameClose()` then `mraid.close()` when `typeof mraid.close === 'function'` and `mraid.getState() !== 'loading'`. Do not use CTA/install buttons as close controls. |
| MRAID init not awaited before Phaser boot | If `new Phaser.Game()` is created before `initMraid()` resolves, the scene may fire `create()` before MRAID state is known — `bindLifecycle` then cannot apply a cached hidden/paused state. Make `boot()` async and `await initMraid()` before constructing the Phaser game. `initMraid()` must self-resolve after a timeout (~2 s) so a missing or non-firing MRAID container never blocks startup. |
| Late MRAID injection not handled | Some containers inject `window.mraid` after the script executes — a synchronous `typeof window.mraid !== 'undefined'` check at module load returns false even though MRAID will be present. After the immediate check fails, poll briefly (~500 ms) before concluding no-MRAID, then proceed. |
| Unsafe optional MRAID API calls | `useCustomClose()` was removed in MRAID 3.0, and APIs such as `expand`, `resize`, `storePicture`, and `createCalendarEvent` are optional/capability-dependent. Do not call them unless the project intentionally supports the feature and guards every call with `typeof mraid.method === 'function'` / `mraid.supports(...)` where relevant. |
| Endcard CTA click area does not match visible playable frame | Avoid using a Phaser `setInteractive()` rectangle/zone as the full-screen endcard CTA. Phaser’s input coordinates can diverge from the visually rendered frame, causing clicks outside the visible playable to trigger the store redirect. Prefer a DOM click layer for whole-screen endcards: create a transparent `button` only while the endcard is visible, append it to `document.body`, style it with `position: fixed; inset: 0; width: 100%; height: 100%; z-index` above the canvas, and call the project’s CTA helper from its `click` handler. Keep Phaser endcard overlays visual-only, with no CTA listener attached to them. Remove the DOM layer when the scene/endcard is destroyed or hidden. |

## Ironsource — Runtime Analysis
Ironsource requires every `_is.html` build to pass **LevelPlay → Creative Management → Playable Workshop** (Runtime Analysis / Playable Validator) before launch. Skipping this can get the ad disabled. The validator runs in an iOS-like WKWebView sandbox and exposes console errors — use it as a free diagnostic channel for iPhone-only failures when a Mac + Safari remote-debug isn't available.

## Moloco — Upload Checklist & CTA Implementation
Creative specs: HTML5 (`.html` / `.htm`), < 5 MB, portrait + landscape.

Before uploading to Moloco Ads, confirm all three:

- [ ] No `XMLHttpRequest` anywhere in the ad (Moloco rejects it outright)

- [ ] CTA calls `FbPlayableAd.onCTAClick()` with no parameters — Moloco uses this for store redirect (not `window.clickTag`)

- [ ] No JavaScript redirects in ad file assets

### CTA implementation options

**Option 1 — event listener**
```html
<button id="ctaButton">Install</button>
<script>
  document.getElementById('ctaButton').addEventListener('click', function() {
    FbPlayableAd.onCTAClick();
  });
</script>
```

**Option 2 — inline onClick**
```html
<button onclick="FbPlayableAd.onCTAClick()">Install</button>
```

Moloco's validator requires `FbPlayableAd.onCTAClick()` — this is why it shares priority #2 in the CTA chain with Facebook. `window.clickTag` is kept as a fallback at priority #7.

***EOF***
 [09/02/2026]
