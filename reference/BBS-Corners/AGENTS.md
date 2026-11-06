# AGENTS.md - Wide-U Babylon Playable Port

## Scope

This folder is the Babylon.js playable-ad port workspace for the Unity scene:

- Source scene: `../Assets/Scenes/Wide-U.unity`
- Source scripts: `../Assets/Scripts/`
- Source art: `../Assets/Projects/2026.06.01 BBS, MIP, Wide U/`

Treat Unity as the level-design source of truth until the scene is locked. Treat this folder as a web rewrite, not a Unity WebGL export and not a Phaser project.

## Stack

- Babylon.js
- TypeScript
- Vite
- `vite-plugin-singlefile`
- HTML/CSS overlay for end cards, CTA, and text UI unless Babylon GUI is clearly better
- GLB/glTF for meshes
- WebP or PNG for raster UI, preferring WebP where alpha/quality allows
- MP3 or OGG for short audio

Playable networks:

- Applovin (`al`)
- GoogleAds (`gg`)
- Ironsource (`is`)
- Mintegral (`mtg`)
- Facebook (`fb`)
- Unity (`un`)
- Vungle (`vu`)
- Moloco (`mo`)
- TikTok (`tt`)

## Non-Negotiables

- One Babylon `Engine` and one active gameplay `Scene` per page.
- No Phaser APIs or Phaser-style scene assumptions.
- No Unity runtime dependency and no Unity WebGL build.
- No full physics engine for gameplay. Use deterministic grid/cell occupancy.
- No network requests at runtime except sanctioned ad SDK scripts such as `mraid.js` / `exitapi.js`.
- All local assets must be bundled or inlined into the generated playable output.
- Audio starts muted or locked until first user interaction.
- The built creative must work in portrait and landscape.
- The final included build should stay under 5 MB unless a target network explicitly allows more.
- Avoid `console.error` in production output. Use guarded warnings or visible fallback state for recoverable failures.

## Project Structure

Expected structure once the port is scaffolded:

```text
PortRoot/
  AGENTS.md
  PORT_PLAN.md
  package.json
  index.html
  vite.config.ts
  scripts/
    build-all.mjs
    extract-wide-u-scene.mjs
  src/
    main.ts
    constants.ts
    networks.ts
    analytics.ts
    iteration.ts
    assets.ts
    data/
      wideUScene.ts
      colors.ts
    engine/
      createEngine.ts
      camera.ts
      resize.ts
    game/
      board.ts
      brick.ts
      gate.ts
      input.ts
      hints.ts
      scoring.ts
      endcard.ts
      audio.ts
      types.ts
    ui/
      cta.ts
      overlay.ts
      handPointer.ts
  assets/
    models/
    textures/
    audio/
```

Keep modules small and explicit. Gameplay modules must not call ad SDKs directly; route CTA, lifecycle, and analytics through `networks.ts` / `analytics.ts`.

## Unity Behavior To Preserve

### Board And Movement

- Board is grid/cell based.
- Bricks are composed of one or more `BrickCell` positions.
- Occupancy is authoritative: a brick can move only if every occupied cell can move into an existing unoccupied slot or its own current slots.
- Dragging is manual pointer movement on the board plane, then snapping to valid grid slots.
- If drop target slots are invalid or occupied by another brick, snap back.
- Absorbed bricks clear their occupied slots and become inactive.

### Colors

Maintain this enum/order unless the Unity project changes:

```ts
export const BRICK_COLORS = [
  'Red',
  'Green',
  'Blue',
  'Yellow',
  'Orange',
  'Purple',
  'Pink',
  'Black',
  'White',
] as const;
```

Materials source:

`../Assets/Projects/2026.06.01 BBS, MIP, Wide U/CurrentMats/`

### Gates

- Gate color must match brick color.
- Gate acceptance uses gate slots plus an `acceptDirection`.
- If a brick occupies every required gate slot and is not blocked in the gate `acceptDirection`, it can be submitted/absorbed.
- Absorb animation should move and shrink the brick toward the gate VFX point, then deactivate it.

### Hint System

Current priority order:

1. Submit hint: if any brick is already accepted by a matching gate, hint the gate `acceptDirection`.
2. Direct clear hint: any color brick with a clear direct route to its matching gate can be hinted.
3. If there is no direct clear, target the closest possible black/white block to its matching gate.
4. If the target can move toward/pass through the gate, hint the target.
5. If the target path is blocked, hint a blocker move that reduces obstruction.
6. Avoid moving the same brick back in the opposite direction for a short recent-history window.

The hand pointer should:

- Start over the hinted brick center.
- Move in the suggested grid direction.
- Scale movement distance by available free cells, clamped to reasonable min/max distance.
- Highlight the target gate color. When hinting a blocker, highlight the target brick's gate, not the blocker color.

### Iterations

Preserve these playable variants:

- `Full`: clear the whole board, show win end card, no automatic redirect; any interaction after CTA is enabled redirects.
- `FourClicks`: after 4 block clicks, trigger redirect and show end card.
- `ThirtySeconds`: 30-second timer starts on first valid input, then trigger redirect and show end card.

Full mode must not use the old "last 4 bricks" shortcut.

### CTA And End Card

- `CTAManager.CTAClick()` maps to platform store redirect.
- End cards fade in, lock gameplay input, lower music volume, and enable CTA after the fade.
- Limited iterations redirect before or while showing the end card.
- Full win shows end card without automatic redirect; user interaction redirects after CTA is enabled.

## Babylon Implementation Rules

### Engine

- Create the canvas at runtime inside a DOM-ready boot path.
- Use one `BABYLON.Engine(canvas, true, options)` and one main `BABYLON.Scene`.
- Do not create separate engines/scenes for background previews or UI.
- Use `engine.resize()` on viewport changes.
- Keep render loop simple and deterministic.

### Camera And Resize

- Match the rendered Unity-game visual and camera tilt from approved reference captures.
- Do not copy Unity camera numeric settings blindly if they produce a different Babylon composition.
- Use an orthographic Babylon camera with a slight tilt so brick height, studs, and board thickness read like the Unity playable.
- Current portrait visual target:
  - beige scene background
  - centered tilted board beneath the tutorial copy
  - dark footer visible at the bottom
  - board large enough to match the reference without clipping side gates
- Test portrait phone, portrait tablet, landscape phone, and landscape tablet.

### Coordinates

- Preserve Unity's X/Z board plane as Babylon X/Z.
- Use Y as vertical height.
- Store grid positions as integer cell coordinates separate from mesh world positions.
- Do not rely on floating point distances for gameplay decisions once grid slots are known.

### Rendering

- Convert Unity FBX meshes to GLB/glTF:
  - `SM_Tile_Short.fbx`
  - `SM_Tile_Long.fbx`
  - `SM_Gate.fbx`
  - `SM_Base.fbx`
  - `SM_Border*.fbx`
- Prefer instancing or thin instances for repeated brick cells and slots.
- Use Babylon `StandardMaterial` or `PBRMaterial` with colors sampled from current Unity materials.
- Keep shadows and post-processing minimal for mobile playable performance.

### Input

- Use Babylon pointer picking against brick meshes.
- Drag on a board plane.
- Convert pointer delta to board X/Z movement.
- During drag, clamp/snap movement through grid occupancy checks.
- On release, snap to valid slots or snap back.
- First valid input starts iteration timers and registers clicks.

### Animation

- Use Babylon animations or a tiny tween helper.
- Keep animation allocations low.
- Required animations:
  - hand pointer fade/move loop
  - brick snap and snap-back
  - brick absorb move/scale
  - gate bounce/lower
  - end-card fade

## Playable Network Layer

Implement SDK access in `src/networks.ts`. Game modules call wrapper functions only.

CTA priority:

```text
1. ExitApi.exit()             -> GoogleAds
2. FbPlayableAd.onCTAClick()  -> Facebook / Moloco
3. Luna.Unity.Playable        -> Unity
4. playableSDK.openAppStore() -> runtime fallback
5. window.install()           -> Mintegral
6. window.openAppStore()      -> runtime fallback
7. window.clickTag            -> Moloco fallback
8. Vungle postMessage         -> Vungle
9. TikTok openAppStore/window -> TikTok
10. mraid.open(url)           -> Applovin / Ironsource / Unity fallback
11. window.open(storeUrl)     -> final fallback
```

Lifecycle stubs:

- `gameReady()`
- `gameStart()`
- `gameEnd()`
- `gameClose()`

Analytics events:

- `DISPLAYED`
- `CTA_CLICKED`
- `ENDCARD_SHOWN`
- `CHALLENGE_STARTED`
- `CHALLENGE_SOLVED`
- `LEVEL_FAILED`

## MRAID

MRAID networks are `al`, `is`, and `un`.

- Inject exactly one `<script src="mraid.js"></script>` for MRAID builds.
- Initialize MRAID before gameplay starts.
- Resolve MRAID startup after a timeout so missing or late MRAID never blocks boot.
- Register early listeners for:
  - `ready`
  - `error`
  - `stateChange`
  - `exposureChange`
  - `viewableChange`
  - `audioVolumeChange`
- Pause/mute when hidden, non-viewable, or zero exposure.
- Guard every optional MRAID call with `typeof`.
- Do not call removed APIs such as `useCustomClose()`.
- Use `mraid.open(url)` for MRAID clickthroughs when ready, then fallback safely.

## Build Output

- Vite output should be single-file HTML per network/iteration.
- Build script should strip `type="module"` and `crossorigin` from final HTML.
- Every output HTML must start with a network comment:

```html
<!-- ad-network: Applovin | al -->
<!DOCTYPE html>
```

Network outputs:

| Network | Tag | Injected | Zip |
|---|---:|---|---|
| Applovin | `al` | `mraid.js` | no |
| Google | `gg` | `exitapi.js` | yes |
| Ironsource | `is` | `mraid.js` | no |
| Mintegral | `mtg` | `onload="gameReady()"` | yes |
| Facebook | `fb` | none | no |
| Unity | `un` | `mraid.js` | no |
| Vungle | `vu` | `window.__VUNGLE__=true` | yes |
| Moloco | `mo` | none | no |
| TikTok | `tt` | `window.__TIKTOK__=true` | optional |

## QA Checklist

- [ ] No Phaser references in source or comments unless documenting migration away from Phaser.
- [ ] One Babylon engine and one active scene.
- [ ] Board clear behavior matches Unity.
- [ ] All nine colors render and match their gates.
- [ ] Direct submit hints override all other hint choices.
- [ ] Direct clear hints work for any color.
- [ ] Blocker-planning hints target black/white only when no direct clear exists.
- [ ] No immediate back-and-forth hint loop.
- [ ] `Full`, `FourClicks`, and `ThirtySeconds` variants match Unity behavior.
- [ ] CTA works in all target network previewers.
- [ ] MRAID lifecycle pauses audio/render work when hidden.
- [ ] Portrait and landscape layouts do not clip or overlap.
- [ ] Final per-network output has no external local asset paths.
- [ ] Final per-network output has no `console.error`, `type="module"`, or `crossorigin`.
- [ ] HTML size is within network limits.

## Common Pitfalls

| Issue | Fix |
|---|---|
| Babylon starts before DOM exists | Gate boot on `DOMContentLoaded` and create the canvas in code. |
| iOS black screen | Use one WebGL context only; do not create background engines/scenes. |
| Grid drift after drag | Snap and resolve from integer grid data, not mesh world floats. |
| Hint points away from ready gate | Run submit hint before all other hint planning. |
| Back-and-forth tutorial | Track recent suggested directions per brick and reject reverse moves. |
| Assets missing in ad sandbox | Import assets through JS/TS manifests so Vite can inline or bundle them. |
| Runtime fetch blocked | Do not load local JSON/GLB by URL after build unless it is inlined/base64 or explicitly packaged. |
| Audio rejected | Unlock audio on first pointer interaction and honor visibility/MRAID mute. |
| MRAID hangs boot | Self-resolve MRAID init after timeout. |
| Moloco CTA rejected | Use `FbPlayableAd.onCTAClick()` with no parameters when present. |
| Unity submission flags `window.top` | Avoid literal `window.top`; rewrite third-party output for Unity if needed. |
