# Cannon texture recolor

Requested base color: **#3d436d**. Edited with the built-in image generation/editing tool from the original `analysis/template-source/src/textures/tunnel.webp`.

Files:
- `reference/textures/tunnel-3d436d.png`: full edited source.
- `reference/textures/tunnel-3d436d.webp`: 512x512 delivery master, WebP quality 90, 13,022 bytes.
- `src/assets/textures/tunnel-3d436d.webp`: identical runtime copy, selected in `src/assets.ts`.

The original template texture and former runtime texture remain intact. Resizing/encoding used the existing Sharp installation; no runtime dependency was added. `scripts/prepare-assets.mjs` now copies the approved edited WebP. Materials remain unlit, neutral white, with no vertex tint or recoloring shader.

The edit retains the atlas arrangement, silver-blue trim and painted highlights visually. It is a generated image edit, not a pixel-exact color transform; brighter painted highlights remain lighter than the requested base color. A browser-only flipY experiment was rejected because it misplaced the atlas detail. Runtime UVs and flipY=false are unchanged.

Validation: focused material/asset test, TypeScript and preview build passed. Muted Chromium checked four viewports, warning exclusion and graphics-context recovery. Turning lights and environment off does not change the container samples. Main draw calls remain 41. Preview HTML: 3,983,403 bytes. Physical devices and network delivery packages were not checked/regenerated.

## Exact edit prompt

Edit target: the provided 512x512 UV texture atlas for a game cannon conveyor container. Make a strictly registered color-only edit. Recolor ONLY the very dark navy hood/shell/outer-edge islands to the new base midtone sRGB HEX #3d436d (RGB 61,67,109), making these navy parts lighter than the nearly black original. Preserve their existing relative painted shading and highlights, with #3d436d as the main body color. Preserve EVERY pixel boundary, UV island shape, location, scale, seams, bevels, and all silver/light-blue trim regions unchanged. Do NOT draw a model, rearrange islands, add edges, details, text, palette swatches or perspective. Output only the same square opaque texture atlas, full bleed, ideally at 512x512. This image will directly replace an existing texture on the exact same mesh UVs so geometry alignment is critical. No transparency.
