# Cannon tray comparison — 2026-10-29

Scope: small conveyor/tray beneath each cannon queue. Investigation only; no runtime source changes.

## Applied follow-up

Latest tuning: darkened the visible hood roof and the belt's outer sidewalls together, preserving the front lip and inner silver rail trim. The hood mask begins at local X=-.4 and reaches full shade at -.2; the sidewall mask runs from absolute local Z=.95 to 1.0. These are authored masks for the extracted mesh, not reference constants. [Updated comparison](screenshots/cannon-tray-applied/darker-comparison.png). Typecheck, the mesh-preservation regression and four viewport checks passed for this tuning; draw calls and triangles remain unchanged. Packages were not rebuilt.

Following the user's approval, the imported-conveyor profile now uses `src/render/cannonTray.ts` for tray-only shading. It retains the original atlas and UVs, adds a blue-silver material tint, lowers the reflection strength, and shades the rear hood with vertex colors while preserving the front lip and belt. This is an authored approximation of the raster mockup, not recovered artist material settings. The original reference/procedural profile retains its previous material.

No additional texture, mesh, shader patch or dependency was added. Positions, UVs, cannon placement, queue behavior and the main conveyor are unchanged. Existing material/geometry disposal covers the added color attribute.

Validation: TypeScript check and the real-mesh shading regression passed. Muted installed-Chrome captures passed at 390x844, 844x390, 768x1024 and 360x640; no page errors or external requests. Context loss/restoration passed. Main-pass draw calls remain 41 and triangles 189,703. These counts do not establish physical-device FPS.

Evidence: [updated tray close-up](screenshots/cannon-tray-applied/after.png), [portrait](screenshots/mockup-look/cannon-tray-after/390x844.png), [browser results](screenshots/mockup-look/cannon-tray-after/checks.json). Production network packages were not regenerated for this follow-up; physical devices remain unverified. The original investigation below records the pre-change state.

- **Confirmed (visual):** the supplied mockup has a dark blue rear hood, blue-silver rails with narrow highlights, and deeper shading around the recessed belt. The current browser capture is paler, flatter and pinker. Evidence: [mockup crop](screenshots/cannon-tray-review/mockup.png), [current crop](screenshots/cannon-tray-review/current-crop.png), [full current frame](screenshots/cannon-tray-review/current.png).
- **Confirmed (code):** the tray is textured, not missing its texture. `src/assets.ts` imports `src/assets/textures/tunnel.webp`; `src/render/scene.ts::createScene` loads it as sRGB with flipY=false, applies it to the tunnel material, and uses that material for both tunnel and tunnelBase. Both geometries retain UVs in `src/assets/geometry.json`.
- **Confirmed (provenance):** `scripts/prepare-assets.mjs` converts the extracted reference texture `861de519-e294-42c3-b5b2-078cbbc1b8e3.png` to WebP. The reference material `analysis/assets/serialized/4926a9c4-be5c-4068-89f7-6df7ccc45f6b.json` has roughness .631 and specularIntensity 0. The current imported-track rendering applies roughness .3 and clearcoat .7 to the tray along with other materials. These settings differ; original-engine numbers are not a guarantee of Three parity.
- **Confirmed (browser experiment):** intercepted only the served scene module to compare flipY=true and a tray-only roughness .631 / clearcoat 0 / specularIntensity 0 / envMapIntensity 0. Neither independently recreated the mockup. Evidence: [UV experiment](screenshots/cannon-tray-review/uv-flip.png), [material experiment](screenshots/cannon-tray-review/material-only.png). No source edits from these experiments.
- **Inferred:** the overload vignette contributes to the pink cast at the outer cannons; the texture/material and hood presentation also need attention. The mismatch should not be diagnosed as solely missing texture, gloss, or UV orientation.
- **Unknown:** whether the mockup uses exactly the same tray mesh, UV atlas and shader as the extracted playable. The raster mockup alone cannot establish that.

Recommended next change: calibrate the tray independently, preserving its glossy blue-silver rails while restoring the dark hood and recessed belt shading. Check the existing atlas and hood geometry before replacing art. Compare equal-size crops and account for the overload vignette; keep cannon colors, queue rules, camera framing and the large conveyor unchanged.

Validation: installed Chrome, muted, local Vite preview, 390x844 at DPR 2, idle before interaction. No physical-device or host validation. No build regeneration needed for this investigation.

## Requested cannon container color - 2026-10-29

The user clarified that #24293d applies to the small cannon containers: hood and matching outer edges. `src/render/cannonTray.ts` now interpolates vertex colors from silver #d0e0ff to shell #24293d using Three's linear color conversion. Material tint is neutral to avoid multiplying the requested color by the previous blue tint again. Existing UV texture, gloss, silver trim masks, geometry and main conveyor are preserved. The hex is an authored base color; lighting, the texture and the overload vignette still affect screen pixels.

The mesh regression verifies both hood and sidewall colors against #24293d and unchanged silver trim/UVs/positions. Muted Chrome captures were reviewed at 390x844, 844x390, 768x1024 and 360x640; see `screenshots/cannon-container-color/`. The combined audio/editor browser check reports no page errors in `evidence/win-screen-browser.json`. The 139 tests, TypeScript and 3,979,497-byte preview build pass; physical devices and network packages were not checked for this update.

## Implemented color replacement - 2026-10-29

The approved correction is now in `src/render/cannonTray.ts`. A per-vertex shell mask identifies the hood and outer sides while excluding the silver trim. The material replaces the original atlas's blue chroma with neutral luminance detail in those regions before applying #3e446e. Detail is calibrated with `clamp(luminance * 2.7, 0.35, 0.9)` under the existing studio lighting. This is a render-time recoloring of the sampled texture; the original WebP remains unchanged. Gloss, UVs, geometry, trim texture and the main conveyor are retained. No extra texture, dependency or rendering pass is added.

`scene.ts` measures each static tray's world bounds. `overlay.ts` projects them on resize and generates a cached, softly feathered warning mask for the corresponding screen rows. Upper cannon rows are protected from the top edge down; this prevents a detached red strip above them. The mask preserves the warning around the lower board, avoids cutout boxes around individual containers, and is not regenerated every frame. Other authored cannon rows use their own projected vertical bands.

**Confirmed rendered evidence:** at 768x1024, the center and left hood samples are now both #444767, versus the prior #4c3051 / #692b48. Switching the warning on/off leaves the sampled hoods and outer edge unchanged. The sampled shadowed edge is #303453. These are naturally lit surface colors, not a promise that every 3D pixel equals the base #3e446e. The shader preserves variation and highlights instead of flattening the container into an unlit swatch.

**Validation:** TypeScript/build and 11 focused tray/session tests pass. `tools/cannon-color-smoke.mjs` checks real browser shader compilation, hood proximity to the requested color, warning exclusion, warning visibility elsewhere, four viewport captures (768x1024, 390x844, 844x390, 360x640) and context loss/restoration. No page or shader console errors. Main draw calls remain 41 at all four sizes. Evidence: `evidence/cannon-color-correction.json`, `screenshots/cannon-color-correction/`. Draw count is not a physical-device FPS measurement.

The refreshed standalone `dist/index.html` includes #3e446e and is **3,981,256 bytes**, below the 4,000,000-byte ceiling. Eight-network deliveries were not regenerated. Physical devices, Safari/WebView SVG-mask behavior and official host previews remain unverified.

## Exact template texture, no tint - 2026-10-29

The user rejected the recoloring and requested the template's `analysis/template-source/src/textures/tunnel.webp` directly. That file exists locally despite the attachment-path error. It differs from the previously shipped reference-derived WebP. The exact 6,772-byte template file is now copied to `src/assets/textures/tunnel.webp`; SHA-256 BA381C63015B80C74F7E1B717A494D5FF645AA4E22EA092C568F7CEB2E1C4B18. `scripts/prepare-assets.mjs` now preserves that exact choice instead of regenerating the older texture.

Removed the custom vertex colors, shell mask attribute, blue tint, and shader recoloring from `createCannonTrayMaterial`. The material uses the supplied texture with neutral white color and normal glossy lighting. Existing warning exclusion is retained. This replaces the earlier #3e446e material/color-matching approach; lighting can still create highlights and shadows.

Validation: exact texture-byte equality and untinted/default-shader test passed; TypeScript and single-file preview build passed at 3,975,152 bytes. Muted Chrome checks passed for four viewports, warning exclusion and graphics-context recovery, with 41 draw calls and no browser errors. Evidence: `evidence/cannon-template-texture.json` and `screenshots/cannon-template-texture/`. Physical devices and network delivery packages were not checked/regenerated for this change.

## Unlit cannon containers - 2026-10-29

At the user's request, the cannon tray and hood now use `MeshBasicMaterial` with the exact template texture, white material color, no vertex tint, no environment map and tone mapping disabled. This removes lighting, received shadows and dynamic glossy highlights from the containers. Shading painted into the texture remains. Cannons, arrows and the main conveyor keep their existing materials; containers can still cast shadows onto the ground. The tray material is owned separately from the lit color palette and disposed with the scene.

Validation: the focused texture/material regression, TypeScript and preview build pass (3,975,071 bytes). Muted browser checks cover four viewports, warning exclusion and context recovery. Turning all scene lights off and removing the environment leaves the sampled hood and outer-edge pixels byte-identical. Evidence: `evidence/cannon-unlit.json`, `screenshots/cannon-unlit/`. Main draw calls remain 41. The preview was rebuilt; network packages and physical devices were not checked for this update.

## Texture image recolored to #3d436d - 2026-10-29

The user requested an actual texture edit. A new edited atlas is saved as `reference/textures/tunnel-3d436d.png`, with its 512x512 WebP master and runtime copy in `reference/textures/tunnel-3d436d.webp` and `src/assets/textures/tunnel-3d436d.webp`. The original template texture is retained. The renderer remains unlit and untinted; UVs and flipY=false are unchanged. Painted highlights remain lighter than the base color.

Provenance, exact built-in image-editing prompt, processing details and limitations are in `reference/textures/tunnel-3d436d.md`. Asset preparation copies the edited master so it cannot restore the previous texture accidentally. The focused material/byte-copy test, TypeScript, four muted browser viewport checks and graphics-context recovery pass. Runtime lighting changes leave the container colors unchanged; draw calls remain 41. Evidence: `evidence/cannon-texture-3d436d.json`, `screenshots/cannon-texture-3d436d/`. Preview rebuilt at 3,983,403 bytes. Network deliveries were not regenerated; physical-device appearance remains unverified.

## Pitch-black texture - 2026-10-29

The user changed the requested texture color to #000000. Active atlas is now `src/assets/textures/tunnel-black.webp` (512x512, 11,996 bytes), copied from `reference/textures/tunnel-black.webp`. Full generated edit and exact prompt/provenance are preserved in `reference/textures/tunnel-black.png` and `reference/textures/tunnel-black.md`. Both painted blue/purple color and highlights inside the dark islands were replaced by flat black; silver trim remains. Containers remain unlit without tint. Originals and prior variants are retained.

The browser now asserts RGB (0,0,0) at both hood samples and an outer-edge sample. These remain unchanged by the warning and by disabling all lights/environment. Four viewport captures and graphics-context recovery pass, with 41 draw calls and no page errors. Focused material test and TypeScript/build passed. Preview rebuilt at 3,982,035 bytes. Evidence: `evidence/cannon-texture-black.json`, `screenshots/cannon-texture-black/`. Network deliveries were not regenerated; physical devices remain unverified.

## Texture color #121420 - 2026-10-29

The latest user-selected color replaces black with #121420 in the texture image. Active asset is `src/assets/textures/tunnel-121420.webp`; its master, edited PNG and exact image-tool prompt are in `reference/textures/`. Earlier versions remain available. Containers stay unlit and untinted. Browser samples are center hood #121420, left hood #121421 and outer edge #13141f; small edited/encoded texture variation remains. The four viewport, lighting/warning invariance and context-recovery checks passed. Focused test, TypeScript and build passed; refreshed preview is 3,981,783 bytes. See `evidence/cannon-texture-121420.json`. Network deliveries and physical devices were not checked.

## Exact shell color and responsive warning - 2026-10-29

This supersedes the previous approximate #121420 texture and warning exclusion mask. The active asset is now `src/assets/textures/tunnel-121420-exact.webp`: 512x512, lossless, 49,438 bytes. All 115,545 selected dark shell pixels are exactly RGB (18,20,32); decoded nonselected trim pixels are unchanged. The generator asserts the lossless round trip. Provenance and selection details are in `reference/textures/tunnel-121420-exact.md`.

The responsiveness defect came from projected full-width mask bands around the cannons. Removed those bands and their projection code. The warning now fills the actual container behind the transparent world canvas; it does not tint opaque 3D objects. Root background color preserves the original scene background. The existing warning threshold, pulse and input behavior remain unchanged. Named layers and AGENTS.md document the new ordering.

Confirmed in muted Chromium: hood and outer-edge samples all equal #121420 with warning on/off and scene lighting disabled; resize sequence 768x1024, 390x844, 844x390, 360x640, 640x360, 390x844 retains full warning bounds and red corners. An offset 320x480 container also passes. Graphics-context recovery passes, no page errors, 41 draw calls. Evidence: `evidence/cannon-exact-vignette.json`, `screenshots/cannon-exact-vignette/`. The focused cannon/session suite passed 11 tests; TypeScript and single-file preview validation passed.

Preview: 3,982,983 bytes. Eight finalized staging network HTML builds pass the 4 MB cap, ranging from 3,982,943 to 3,984,230 bytes (`evidence/exact-color-network-sizes.json`). The BGM excerpt is now 15 seconds at the same 96 kbps and mix levels to offset the lossless texture cost. These staging checks are not official host acceptance; delivery ZIPs and all iteration packages were not regenerated. Physical devices remain unverified.

## Cannon shell #373d65 - 2026-10-29

Latest user-selected color is #373d65. Updated the deterministic fill, lossless master/runtime atlas, asset preparation and focused checks. Silver trim is preserved and containers remain unlit. Muted Chromium reports exact RGB (55,61,101) at both hood samples and the outer edge, with warning on/off and lights disabled. Responsive warning, offset-container and context recovery checks pass; 41 draw calls. Evidence: `evidence/cannon-373d65-vignette.json`; screenshots: `screenshots/cannon-373d65-vignette/`.

Focused material test, TypeScript and single-file preview build pass. Preview is 3,982,679 bytes. BGM is unchanged. Network deliveries were not rebuilt; physical-device appearance remains unverified. The earlier #121420 report describes the previous asset, which is retained.

## Cannon shell #3c4374 - 2026-10-29

Applied the latest requested #3c4374 using the same lossless fill and unlit material. Silver trim and warning behavior are preserved. Hood and outer-edge browser samples equal RGB (60,67,116), unaffected by lighting or warning visibility. Responsive viewport/offset-container and context-recovery checks pass, with 41 draw calls and no page errors. Evidence: `evidence/cannon-3c4374-vignette.json`; screenshots: `screenshots/cannon-3c4374-vignette/`.

Focused material test, TypeScript and single-file validation pass. Refreshed preview: 3,982,731 bytes. Network delivery packages were not regenerated; physical-device color remains unverified.
