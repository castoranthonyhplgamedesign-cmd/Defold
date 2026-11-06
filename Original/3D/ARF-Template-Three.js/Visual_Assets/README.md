# Arrow Flow visual assets

Collected from the current playable. Source assets are copied byte-for-byte; GLBs are exports of runtime geometry, not new artwork. Audio is outside this visual-only collection.

- **UI/**: branding, tutorial, progress bar and fallback-only play artwork.
- **Textures/**: only the active cannon-tray texture. Apply it to hood/tray GLB UVs using an unlit material, sRGB, and the runtime flipY=false convention. GLBs do not embed this texture.
- **Fonts/**: Lilita One vector font.
- **Models/**: portable GLBs plus the original runtime binary/manifest. Arrow/cannon pieces use preview colors; actual instances are recolored and transformed by the renderer. The head inset geometry is also reused for the highlighted outline. The conveyor export preserves the current origin translation.
- **Layout/**: exact shipped level including embedded artist conveyor.
- **Materials/**: current #FF4242 preload/cannon palette and surface settings.

## Generated visuals

Projectiles, flash spheres, debris, lane shutters, dots and chevrons are generated in code; their base geometry is exported under Models/Procedural. Runtime scale, poses and animations are not baked into these single-piece exports. The vignette, progress-bar background gradient, caption and ammo outlines, dimmer, safe-area layout and endcard pop are CSS/DOM effects (src/style.css and src/ui/overlay.ts), not image assets. Studio lighting, procedural room reflections and the shadow-catching floor come from src/render/mockupLighting.ts; no static environment image or shadow texture exists to copy. GLB viewers will not reproduce the playable lighting automatically.

Unused texture trials and the unused conveyor-guide.webp are excluded. Runtime_Data retains the packed reference track because it is part of the shipped binary; this level replaces that track with the artist conveyor, so no separate reference-track GLB is exported. Source provenance and SHA-256 values are in inventory.json. Existing reference/client artwork and extracted models retain their original ownership; this export does not grant licensing rights.
