# Arrow Flow Unity scene â†’ Babylon port

## Source analysis

The Unity scene is `D:\Repo\3D Layout\Assets\Scenes\Arrow Flow Scene.unity`. The layout export at `Assets/3D World Assets/Arrow Flow 3D Scene_Layout.json` supplies the conveyor, tunnels, turrets, and mesh templates. `New-Arrow-Flow-Arrow-Grid-Test-layout.json` supplies the current runtime arrow grid. The Unity export contains 180 objects under five roots:

| Root | Objects | Role |
|---|---:|---|
| Main Camera | 1 | Orthographic camera at `(0, 22.42, 0.3)`, size 16, tilted 70Â° |
| GameObject | 23 | Two tunnel assemblies with four turrets |
| Directional Light | 1 | Warm overhead light |
| Conveyor Model | 119 | Custom Unity mesh, 33 red block positions, 20 direction markers, border sprites |
| Arrow Example | 36 | Red arrow path, including heads, corners and highlight sprites |

The renderable inventory is 65 skinned arrow block meshes, 13 ordinary meshes, and 30 Unity sprites. Every arrow block uses `Red Arrow Variant`; the active Unity scene does not use the other color variants in the asset pack. The conveyor follows a rectangular loop from approximately `x = -6.75..6.76`, `z = 0.06..15.16`. The example arrow sits inside that loop. The tunnel assemblies are beyond the far end near `z = 23..25`.

The Unity scene references Dreamteck `SplineFollower` and `SplineComputer` components for the conveyor path. The JSON records their object positions and transforms, but it does not contain the spline's runtime motion or a playable rule set. The source Unity project has no game logic script for this scene.

## Babylon mapping

- `src/main.ts` reads the layout JSON and creates Babylon instances at its world positions. Unity's left-handed `z` coordinates and yaw are converted into the glTF right-handed scene.
- The three FBX model families were converted to `src/models/*.glb`: arrow blocks, turrets, and tunnels. Their Unity material textures were converted to WebP in `src/textures/`.
- The block FBX includes an animation track that is not part of this layout. Model conversion removes imported animation tracks, and Babylon stops any animation groups found during loading so the scene remains still.
- The orthographic camera uses the exported framing with a lower viewing angle. The clear color and warm directional light follow the exported values, and the camera keeps the full board visible in portrait and landscape.
- The converted FBX meshes use non-inverted texture sampling. This matches the block faces in the supplied Unity reference screenshot.
- Unity's `Custom Mesh.asset` conveyor is decoded from its serialized vertices and triangles into `src/models/Conveyor_Custom_Mesh.glb`. Its wall and flat belt submeshes remain separate, so the belt renders at `#3B3F74` while the walls keep their lighter color.
- The belt pads, arrow markers, and head outlines are placed from the exported `SpriteRenderer` transforms. The 20 conveyor arrow sprites move and turn on the belt beneath the blocks; they continue circulating when a block is destroyed. `Square.png` and `Circle.png` are Unity built-in sprites represented as colored planes; the supplied arrow and outline sprite images use converted WebP textures.
- `src/layout/arrowGrid2D.ts` maps the supplied 7×8 Point Out layout into the Babylon X/Z plane. The new grid has 12 arrows and 56 cells across red, green, yellow, and blue. The old Unity arrow objects provide head, body, corner, and highlight mesh templates but are hidden at runtime. `src/game/arrowGrid.ts` animates each arrow independently along its ordered path, uses the corner mesh while idle, and checks contact against other grid arrows while moving. A blocked arrow jiggles and returns. A head highlight appears after its path remains clear briefly. Each segment takes the nearest moving conveyor slot at the crossing and waits when every slot is occupied. No grid HUD or end card is shown.
- The 33 exported conveyor block placements determine the belt's straight side positions. Motion follows a rounded rectangle with exact straight segments and quarter-circle corners, so it cannot sway after a turn. The 33 slots have equal distance around the loop; they start empty and move faster than the 20 permanent belt arrows, whose speed remains unchanged. The two front turrets use the exported muzzle points; when a red block reaches a matching turret, the supplied `Bullet_.fbx` mesh flies along a fixed straight trajectory in its original material, and the hit block disappears, leaving an empty position on the belt for later grid segments.
- Each tunnel holds a front and rear turret. Both begin with 17 shots shown as large white numbers on the turret body. Turret color comes from its layout node's `blockColor` and determines both its material and which belt blocks it fires at. The front turrets are red; the rear turrets are yellow on the left and green on the right. Only the front turret fires. After its last shot it disappears, and the rear turret slides into the front firing position with its own 17-shot count.

The scene now uses reusable grid, path, and conveyor systems. `src/projectLayout.ts` contains this particular Unity scene's settings; `TEMPLATE_GUIDE.md` explains how to supply another grid, conveyor shape, or turret arrangement.

## Build and inspect

```sh
npm install
npm run dev
npm run build
```

`dist/index.html` is a self-contained HTML file. Store links, CTA behavior, and network wrappers are outside this phase.

The model and texture conversions can be repeated with `npm run convert:models`, `npm run convert:conveyor`, and `npm run convert:textures`. Source FBX, the conveyor `Custom Mesh.asset`, and PNG files stay in `Assets/3D World Assets/`. Unity `.meta`, `.mat`, and `.prefab` files are omitted because neither the Babylon runtime nor these converters use them.
