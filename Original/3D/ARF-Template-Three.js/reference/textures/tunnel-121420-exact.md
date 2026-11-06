# Exact cannon shell color

The user approved a uniform RGB (18, 20, 32) fill and lossless WebP export to remove the earlier edited/encoded color variation.

`scripts/prepare-cannon-texture.mjs` decodes `tunnel-121420.webp`, selects dark shell pixels whose largest RGB channel is below 64, and fills them with #121420. The 115,545 selected pixels are checked individually after export. All other decoded pixels, including silver trim, are preserved exactly. The script asserts a byte-identical decoded round trip. The 512x512 output is 49,438 bytes; the runtime copy is `src/assets/textures/tunnel-121420-exact.webp`.

This is deterministic pixel processing, not another generated image. The source and earlier variants are retained. Regeneration uses Sharp from the sibling Bubble-Cash--Template checkout; ordinary asset preparation only copies the completed master and does not need that dependency.

The runtime uses the existing unlit, untinted material with tone mapping disabled. Interior hood and outer-edge screenshot samples are exactly #121420. Filtering and antialiasing can still blend pixels at silver-trim boundaries. See `analysis/evidence/cannon-exact-texture.json` and `analysis/evidence/cannon-exact-vignette.json`.
