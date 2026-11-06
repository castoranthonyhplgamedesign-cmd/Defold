# Cannon shell color #373d65

The active lossless atlas is `tunnel-373d65-exact.webp`, copied to the identically named runtime asset. `scripts/prepare-cannon-texture.mjs` uses the preserved `tunnel-121420.webp` source mask (largest RGB channel below 64) and replaces 115,545 shell pixels with RGB (55,61,101). Other decoded pixels, including silver trim, are unchanged. The script asserts the decoded lossless round trip. Output: 512x512, 49,212 bytes. Earlier masters are retained.

Muted Chromium samples on both hoods and the outer edge equal #373d65, unchanged by lights or the red warning. Resizing, offset-container bounds and context recovery pass. Evidence: `analysis/evidence/cannon-texture-373d65.json` and `analysis/evidence/cannon-373d65-vignette.json`. Boundary pixels can still blend through texture filtering/antialiasing.
