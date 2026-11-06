# Reusing the Arrow Flow mechanic

The Babylon gameplay code is split by responsibility:

| File | Responsibility |
|---|---|
| `src/game/arrowGrid.ts` | Finds each arrow's ordered cells, checks whether its exit is blocked, animates clearing, and transfers parts at a belt crossing |
| `src/game/conveyorPath.ts` | Closed path geometry, distance sampling, and grid to belt intersection |
| `src/game/conveyor.ts` | Moving slots and belt arrows, block insertion, turret queues, shots, and bullets |
| `src/game/hitEffects.ts` | Pooled 3D spherical block-hit particles |
| `src/layout/arrowGrid2D.ts` | Validates Point Out arrow JSON and maps 2D cells into the Babylon X/Z plane |
| `src/layout/unityLayout.ts` | Unity JSON structure and arrow group discovery |
| `src/projectLayout.ts` | Scene names, path choice, grid motion, belt motion, and shooter settings |
| `src/main.ts` | Babylon assets and meshes, plus wiring the modules together |

## New scene setup

1. Replace the Point Out grid JSON import in `src/main.ts` with a new arrow layout. Replace the Unity scene export and model or texture imports when the conveyor, shooters, or mesh family changes.
2. Set the scene's camera framing, mesh names, grid cell size, grid center, color mapping, and speeds in `src/projectLayout.ts`.
3. Supply `gridBounds` and an `arrows` array in the 2D JSON. Each arrow needs `headPosition`, ordered `bodyOffsets`, `exitDirection`, and `style.color`. The adapter places X horizontally and maps increasing 2D Y toward Babylon −Z. Body cells must be adjacent in their listed order; the adapter detects bends and selects the matching Unity corner mesh. The current 7×8 layout is centered at `{ x: 0.11, z: -7.35 }` with 1.5 world units per cell.
4. Supply a conveyor GLB with a separate indexed, flat, closed ring mesh for the belt surface. The loader uses the name `Conveyor Belt` when present or finds the ring by geometry. The default `beltMesh` path follows the belt's authored middle vertex ring when present; otherwise it traces the midpoint between the two edges. It derives slot count, belt arrow count, spacing, and block scale from the belt's length and width. No slot or arrow placement objects are needed. Keep the wall and belt as separate meshes so they can retain their different colors. `conveyor.meshSizing` contains width ratios for adjusting the inferred density or visual sizes when a new art style needs it. A mesh with holes, branching tracks, or disconnected belt surfaces needs its own path definition. The older `roundedRectangleFromSlots` and `waypoints` modes remain available for those cases.
5. Put each lane's turret objects under a common immediate parent. Set `blockColor` on each turret root to choose its color and matching block color; the supported colors are mapped to materials in `src/main.ts`. The nearest turret to the belt starts in front; any others queue behind it and move to the front position when it runs out of shots. Lane position and firing point are derived from the turret bodies, muzzle points, and conveyor path, so lanes can be placed on any side of the belt.

The grid sends a block to the first belt crossing along that arrow's exit direction. The conveyor uses the nearest slot. If occupied, it shifts that block and any preceding occupied blocks one slot backward until it reaches an empty slot. The entering block and shifted blocks animate into their slots over `transferSeconds`; clearing waits only when the belt is full. By default, slot speed is calculated from belt length, inferred slot count, grid cell size, and grid speed so each arriving segment lines up with the next slot. Set `slotSpeed` explicitly in `src/projectLayout.ts` only if a scene needs a different cadence. Belt arrow speed is separate.

The bullet keeps its source mesh; `shooters.bulletColor` and `bulletEmissiveStrength` set its rendered color and brightness. `shooters.effects` controls the spherical hit particle size, count, duration, and colors for each block color. Add a `burstColors` entry when adding a new block color.

Arrows clear independently, so another arrow can be tapped while one is moving. Highlights appear once the path has stayed clear briefly after its last blocking piece moves away. Every tap starts movement; each moving part checks for contact with other grid arrows. On contact, the newly moving arrow jiggles and retraces its recorded movement steps back around any bends while the arrow already clearing keeps moving. The game ends in a win once every grid arrow has cleared and the belt is empty. It ends in a loss when every belt slot is occupied and no front or advancing turret or incoming bullet can clear an occupied block. The result is exposed as `document.documentElement.dataset.gameOutcome` (`win` or `lose`) and an `arrowflow:outcome` window event; this phase has no result overlay.

The current grid comes from `New-Arrow-Flow-Arrow-Grid-Test-layout.json`: 12 arrows and 56 cells in red, green, yellow, and blue. `src/projectLayout.ts` maps the JSON's hex colors to the supplied Unity texture variants. A new layout can use the same 2D format without 3D coordinates; adjust the grid center or cell size if its dimensions differ.

The current imported models and materials are red Unity assets. Projects with different mesh families or block colors must supply those assets and add their materials to `blockMaterials` in `src/main.ts`. A cell or turret can select a material and matching shooter color with `blockColor` in its layout node. The current playable has no extra HUD, end card, or ad network wrapper.
