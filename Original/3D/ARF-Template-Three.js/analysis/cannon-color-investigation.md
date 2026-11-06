# Cannon color mismatch — 2026-10-29

Investigation only. Runtime source and production assets were not changed. Controlled overrides were applied only to a muted local browser page by `analysis/experiments/cannon-color-probe.mjs`.

## Cause

**Confirmed:** `src/render/cannonTray.ts::createCannonTrayMaterial` sets shell vertex color to #3e446e, but retains the blue/purple `src/assets/textures/tunnel.webp` atlas. Three multiplies the vertex tint and sampled texture: `node_modules/three/src/renderers/shaders/ShaderChunk/color_fragment.glsl.js` and `map_fragment.glsl.js`. This is not a replacement of the texture's color.

**Confirmed:** `MeshPhysicalMaterial` also responds to the ambient/key lighting, environment and gloss from `src/render/mockupLighting.ts`. These change screen pixels further. Removing the texture alone makes the measured roof brighter than the requested hex; a whole-material unlit replacement would remove the requested glossy appearance and is not the recommended production solution.

**Confirmed:** `src/ui/overlay.ts::sync` enables `.full-vignette` at 95% capacity. The starting board is already at 99%, so the red gradient in `src/style.css:18` covers the cannon hoods from the start. It also varies across the screen and pulses, so identical hood materials can appear different from each other and across frames.

**Confirmed:** the current `dist/index.html` still contains #24293d, not #3e446e. The previous color update only changed dev source/test; its final response noted that packages were not regenerated. Whether the user was viewing that built file is **Unknown**.

## Measured comparison

Local Chrome 156.0.8078.49, 768×1024, DPR 1, reduced-motion enabled to stabilize the warning overlay. No input; audio muted. The same sample positions are used for each screenshot: center hood (360,48), left hood (134,48), center outer edge (346,160). These are individual surface pixels, not a claim that a lit 3D object should have one uniform color.

| Browser-only condition | Center hood | Left hood | Center outer edge |
| --- | --- | --- | --- |
| Current runtime | #4c3051 | #692b48 | #1b1f47 |
| Red warning hidden | #32345a | #33345b | #1b1f47 |
| Warning hidden, texture removed, lighting retained | #515680 | #515680 | #444974 |
| Warning hidden, original texture, unlit | #191c49 | #191c49 | #151942 |
| Warning hidden, no texture, unlit | **#3e446e** | **#3e446e** | **#3e446e** |

Evidence: [current appearance](screenshots/cannon-color-investigation/current.png), [warning hidden](screenshots/cannon-color-investigation/no-vignette.png), [untextured lit](screenshots/cannon-color-investigation/untextured-lit.png), [unlit textured](screenshots/cannon-color-investigation/unlit-textured.png), [target-color control](screenshots/cannon-color-investigation/unlit-solid.png), and [measured samples](evidence/cannon-color-investigation.json). The browser fixture asserts the final control pixel equals #3e446e and reports no page errors.

## Recommended correction

Treat #3e446e as the desired visible shell appearance. Remove the atlas's inherited blue tint from the hood/outer-edge regions while retaining useful texture detail and the silver trim; prevent the warning overlay from tinting the containers; then calibrate their glossy shading against the target swatch under the existing lighting. Preserve the main conveyor and cannon colors. Regenerate the output after that correction.

The earlier regression test checked the vertex tint, UVs and geometry, not final displayed pixels. It was insufficient proof of a visual color match. This investigation establishes the compositing causes; it does not implement the proposed correction or establish physical-device rendering parity.

## Approved correction delivered

The user authorized implementation after this investigation. See the appended implementation section in [cannon-tray-review.md](cannon-tray-review.md), [browser results](evidence/cannon-color-correction.json), and [updated screenshot](screenshots/cannon-color-correction/390x844.png). The original measurements above remain historical evidence. The standalone preview has now been rebuilt with #3e446e; network deliveries have not.
