# Pitch-black cannon texture

Requested color: #000000. Built-in image-editing tool used on the preceding `tunnel-3d436d.webp` atlas. Dark islands are now flat black, including their former painted highlights. Silver/light-blue trim remains. Originals and earlier variants are retained.

Generated source: `reference/textures/tunnel-black.png`. Shipping master: `reference/textures/tunnel-black.webp`, resized to 512x512 and encoded with existing Sharp at WebP quality 90, 11,996 bytes. Runtime copy: `src/assets/textures/tunnel-black.webp`. `src/assets.ts` and asset preparation select this version. Containers remain unlit, white material color, no shader recoloring.

Validation: texture samples at (210,20), (200,250), (112,394), (286,477) are RGB (0,0,0). Muted Chrome's rendered center hood, left hood and outer-edge samples are also RGB (0,0,0), unchanged with warning/lighting enabled or disabled. Four viewports and context recovery pass, 41 draw calls. TypeScript, focused asset/material regression and preview build pass. Preview: 3,982,035 bytes. Physical devices and network packages not checked/rebuilt. Generated edit is visually registered, not a pixel-exact preservation of every untouched atlas pixel.

## Exact edit prompt

Edit this game UV texture atlas, color changes only. Replace ALL dark navy/purple hood, shell, and outer-edge islands with perfectly SOLID pitch black sRGB #000000, RGB (0,0,0). Include the painted purple/blue highlight patches inside those dark islands: remove those highlights and shading entirely so these islands are flat true black, not charcoal, navy or glossy. Preserve the light silver/pale-blue trim islands and their existing painted shading. Keep the exact square atlas, every UV island's existing position, outline, scale and silhouette unchanged. Do not redraw, reposition, add details, labels, text, borders, swatches or a model rendering. Output the same opaque full-bleed square texture atlas only. Target 512x512 if possible. Main dark regions including the large center/lower shell, top navy island, sidewall strips, and the smaller dark inset islands must all be pure #000000.
