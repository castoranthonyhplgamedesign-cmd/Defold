# Wide-U Babylon.js Playable Port Plan

## Decision

Port `Assets/Scenes/Wide-U.unity` to Babylon.js as a planned TypeScript rewrite for playable ads.

Do not use Unity WebGL, Phaser, or a direct Unity scene export as runtime architecture. Unity remains the level-design source of truth until the scene is locked; Babylon owns the playable runtime.

## Current Source Of Truth

- Scene: `../Assets/Scenes/Wide-U.unity`
- Core scripts:
  - `../Assets/Scripts/Brick.cs`
  - `../Assets/Scripts/BrickCell.cs`
  - `../Assets/Scripts/GridSlot.cs`
  - `../Assets/Scripts/BoardManager.cs`
  - `../Assets/Scripts/Gate.cs`
  - `../Assets/Scripts/GameManager.cs`
  - `../Assets/Scripts/ControlManager.cs`
  - `../Assets/Scripts/IterationVariantManagers.cs`
  - `../Assets/Scripts/ScoreManager.cs`
  - `../Assets/Scripts/CTAManager.cs`
  - `../Assets/Scripts/CameraFitter.cs`
  - `../Assets/Scripts/CameraManager.cs`
- Prefabs:
  - `../Assets/Prefabs/1x1.prefab`
  - `../Assets/Prefabs/1x2.prefab`
  - `../Assets/Prefabs/Gate.prefab`
- Art:
  - `../Assets/Projects/2026.06.01 BBS, MIP, Wide U/Models/`
  - `../Assets/Projects/2026.06.01 BBS, MIP, Wide U/CurrentMats/`
  - `../Assets/Projects/2026.06.01 BBS, MIP, Wide U/UI/`

## Port Scope

The Babylon build must reproduce the complete Wide-U playable loop:

- Board frame, base, grid, gates, bricks, hand pointer, and end-card UI.
- All nine brick/gate colors: red, orange, yellow, green, blue, purple, pink, black, white.
- Grid-cell drag, snap, snap-back, and absorb.
- Gate color matching and gate-slot acceptance.
- Current target-driven hint behavior.
- Iteration modes and CTA/end-card timing.
- Audio, lifecycle, analytics, and playable-ad redirect behavior.
- Responsive camera/framing for portrait and landscape.

## Current Gameplay Contract

### Board

The board is deterministic. Each brick is a set of occupied grid cells. A move is legal only when every brick cell can move into an existing slot that is empty or currently occupied by the same brick.

Babylon should store this as data first:

```ts
type Cell = { x: number; z: number };
type BrickState = {
  id: string;
  color: BrickColor;
  cells: Cell[];
  origin: Cell;
  active: boolean;
};
type GridSlot = {
  x: number;
  z: number;
  occupyingBrickId: string | null;
};
```

Meshes are visual followers of state, not the authoritative source of truth.

### Bricks

Unity behavior:

- Drag on pointer down.
- Release occupied slots while dragging.
- Move manually on the board plane.
- On drop, snap to closest valid slots or snap back.
- Accepted bricks move/scale into the gate VFX point and deactivate.

Babylon behavior:

- Pointer pick against brick meshes.
- Drag on a board plane.
- Convert pointer movement to X/Z.
- Validate occupancy from grid data.
- Snap transform to grid-state result.

### Gates

Each gate has:

- `GateColor`
- `gateSlots`
- `acceptDirection`
- VFX/absorb point

Acceptance:

1. Brick color matches gate color.
2. Every brick cell is in a gate slot.
3. Brick is not blocked in `acceptDirection`.

If accepted, submit hint must point in `acceptDirection` and absorb must be available.

### Hint System

The current Unity hint system is goal driven. Babylon should implement the same decision order:

1. Submit any brick already accepted by a matching gate.
2. Direct clear any color brick if it has a clear route to a matching gate.
3. If no direct clear exists, choose the closest black/white target brick to its matching gate.
4. For that target, hint a direct/pass move if available.
5. If blocked, hint a blocker move that reduces obstruction.
6. Reject recent reverse hints for the same brick for a short memory window.

Important details:

- The hand points at the `hintBrick`.
- The gate highlight uses the `targetBrick`, not necessarily the `hintBrick`.
- If a colored brick can be cleared immediately, it should be hinted even though black/white are the planning targets.
- If a brick is ready to submit, no side move should be hinted.

### Iterations

`IterationVariantManagers` behavior to preserve:

| Iteration | Trigger | Redirect | End card |
|---|---|---|---|
| `Full` | Clear the whole board | No automatic redirect | Win end card; later interaction redirects |
| `FourClicks` | 4 valid block clicks | Redirect immediately | Show end card |
| `ThirtySeconds` | 30 seconds after first valid input | Redirect when timer ends | Show end card |

`CanShowEndCardOnLastBricks()` is intentionally disabled. Do not reintroduce the old last-four-bricks shortcut.

Export filename templates:

- Full: `bbs_mip_grhpl_wideu_01_real_nougc_noseason_en_full_na_{network}`
- FourClicks: `bbs_mip_grhpl_wideu_01_real_nougc_noseason_en_4clk_na_{network}`
- ThirtySeconds: `bbs_mip_grhpl_wideu_01_real_nougc_noseason_en_30sec_na_{network}`

### Score

`ScoreManager` has no UI. It tracks progress for analytics/end-state only:

- `Initialize(scoreTarget)`
- `AddScore(amount)`
- `GetScore()`

Absorbed bricks call `AddScore(1)`. Port this as a state counter, not visible score UI.

## Architecture

### Recommended Modules

```text
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
    types.ts
    board.ts
    brick.ts
    gate.ts
    input.ts
    hints.ts
    scoring.ts
    iterationController.ts
    audio.ts
    endcard.ts
  ui/
    handPointer.ts
    overlay.ts
    cta.ts
scripts/
  extract-wide-u-scene.mjs
  build-all.mjs
```

### Responsibilities

- `board.ts`: slot map, occupancy, movement validation, snap resolution.
- `brick.ts`: visual mesh assembly, drag state, snap/snap-back/absorb animation.
- `gate.ts`: gate state, acceptance checks, visual bounce/lower/absorb point.
- `input.ts`: pointer pick, drag plane, first-input lifecycle.
- `hints.ts`: current Unity hint planner in TypeScript.
- `iterationController.ts`: Full/FourClicks/ThirtySeconds behavior.
- `endcard.ts`: end-card show/fade/CTA-enable state.
- `networks.ts`: SDK wrapper only.

## Data Extraction Plan

When the Unity scene is locked, extract a scene manifest rather than hand-copying positions.

Minimum manifest:

```ts
export const wideUScene = {
  camera: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    orthographicSize: 13.6,
  },
  gridSlots: [
    { id: 'slot_0_0', x: 0, z: 0, world: [0, 0, 0] },
  ],
  bricks: [
    {
      id: 'brick_black_01',
      color: 'Black',
      origin: [0, 0],
      cells: [[0, 0], [0, 1]],
      mesh: 'SM_Tile_Long',
    },
  ],
  gates: [
    {
      id: 'gate_black',
      color: 'Black',
      position: [0, 0, 0],
      acceptDirection: [0, 0, 1],
      gateSlotIds: ['slot_0_0', 'slot_1_0'],
      vfxPosition: [0, 0, 0],
    },
  ],
};
```

Extraction can be manual at first, but the preferred approach is an editor/export script once the layout stabilizes.

## Asset Conversion

### Meshes

Convert source FBX files to GLB/glTF:

- `SM_Tile_Short.fbx`
- `SM_Tile_Long.fbx`
- `SM_Gate.fbx`
- `SM_Base.fbx`
- `SM_Border.fbx`
- `SM_Border 1.fbx`

Keep pivots and scale consistent with Unity grid units. If conversion changes scale, normalize in the asset loader and document the multiplier.

### Materials

Port current material colors from:

`../Assets/Projects/2026.06.01 BBS, MIP, Wide U/CurrentMats/`

Expected material keys:

- `M_Red`
- `M_Orange`
- `M_Yellow`
- `M_Green`
- `M_Blue`
- `M_Purple`
- `M_Pink`
- `M_Black`
- `M_White`
- `BG`
- `Edge`
- `Base texture`

### UI

Use:

- `hand_pointer.png`
- `Play Now.png`
- `App Icon.png`

Prefer HTML overlay for end-card and CTA elements so network click handling remains simple and inspectable.

## Camera And Responsive Plan

Tune Babylon camera/framing for visual parity with the approved Unity reference captures, including the slight board tilt. Do not copy Unity numeric camera settings if they do not produce the same web-rendered composition.

Current Babylon visual framing:

- orthographic camera with a shallow forward tilt
- beige scene background matching the reference
- centered board below the top tutorial copy
- dark footer always visible at the bottom
- portrait board should fill most of the play area without clipping side gates

Test:

- 390 x 844 portrait
- 430 x 932 portrait
- 768 x 1024 tablet portrait
- 844 x 390 landscape
- 1024 x 768 tablet landscape

The board must remain playable with no UI overlap in all target viewports.

## Playable-Ad Integration

Implement `networks.ts` with guarded SDK fallback chains from `AGENTS.md`.

Lifecycle mapping:

- `gameReady`: after boot assets and first render are ready.
- `gameStart`: first valid block interaction.
- `gameEnd`: win/fail end-card trigger.
- `gameClose`: before CTA redirect or close.

CTA:

- Full mode: CTA enabled after end-card fade; user interaction redirects.
- FourClicks/ThirtySeconds: redirect before or during end-card display, matching Unity.

MRAID:

- Initialize before game construction or before gameplay starts.
- Register error/viewability/audio listeners early.
- Pause render-heavy work and mute/suspend audio when hidden or unviewable.

## Implementation Order

1. Scaffold `PortRoot` Babylon/Vite project.
2. Add network/lifecycle shell and build-all script.
3. Add placeholder scene with responsive orthographic camera.
4. Convert/import core meshes and UI textures.
5. Create static board/base/gate render.
6. Build grid occupancy and brick state.
7. Implement drag, snap, snap-back.
8. Implement gate acceptance and absorb animation.
9. Implement score/progress state.
10. Implement iteration controller.
11. Implement hand pointer and hint planner.
12. Implement end-card and CTA.
13. Add audio and visibility/MRAID pause behavior.
14. Optimize meshes/materials/assets for playable size.
15. Run per-network build and preview validation.

## Acceptance Tests

### Gameplay

- [ ] Every brick can be dragged and snapped.
- [ ] Invalid drops snap back.
- [ ] Occupancy cannot overlap bricks.
- [ ] Matching gates absorb matching colors only.
- [ ] Nonmatching colors never absorb.
- [ ] Submit-ready bricks receive submit hints.
- [ ] Direct clear hints can target any color.
- [ ] No direct clear means black/white target planning takes over.
- [ ] Hint planner does not loop back and forth.
- [ ] Full clear triggers win end-card.
- [ ] Four clicks triggers redirect/end-card.
- [ ] Thirty seconds starts on first input and triggers redirect/end-card.

### Visual

- [ ] Board framing matches Unity on phone portrait.
- [ ] Board remains playable in landscape.
- [ ] All colors match current Unity materials closely.
- [ ] Hand pointer starts at brick center and moves the correct distance.
- [ ] Gate highlight matches target gate.
- [ ] Absorb animation feels like Unity.

### Playable

- [ ] HTML output is single-file or approved zipped single-file.
- [ ] No runtime local fetches.
- [ ] No broken external asset paths.
- [ ] CTA fallback chain works.
- [ ] MRAID builds include exactly one `mraid.js`.
- [ ] Google build includes `exitapi.js`.
- [ ] Mintegral build calls `gameReady()`.
- [ ] Audio unlocks on first interaction.
- [ ] Hidden/unviewable state pauses/mutes.
- [ ] No `console.error` in production output.

## Known Risks

- Unity scene data extraction can be brittle if object names are inconsistent. Prefer stable IDs or a deliberate export component if needed.
- Gate slots are discovered in Unity via overlap boxes. The Babylon port should store explicit gate-slot IDs after extraction.
- Unity material appearance will not map one-to-one to Babylon lighting. Sample colors and tune under target mobile lighting.
- GLB conversion can shift pivots/scale. Verify mesh origins before implementing drag/snap visuals.
- The hint planner depends on accurate gate slots and occupied-cell state. Build automated fixture tests for `hints.ts`.

## Current Status

- Unity level design is still changing.
- `PortRoot/` exists and is now the intended web port workspace.
- The latest Unity hint behavior has been documented here and in `AGENTS.md`.
- Babylon/Vite/TypeScript scaffold is in place.
- Network export setup exists for the 3 iterations across 8 enabled networks.
- Scene manifest extraction, converted GLB assets, and final gameplay parity implementation are still pending.
