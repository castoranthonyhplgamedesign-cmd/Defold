# Mockup color, gloss and shadows — 2026-10-29

Follow-up corrections and measured performance are in [visual-performance-review.md](visual-performance-review.md); its conveyor colors, shadow settings and final build supersede this first-pass record.

Reference found at `arf_conveyor_overload_mockuppresentation.png`; the attachment error did not prevent local inspection. Current gameplay/queues/layout changes from the workspace were preserved. This pass changes only the imported artist-conveyor rendering, not simulation, audio, input, network behavior, layout, or the camera.

## Reference study

- **Confirmed visually:** the supplied mockup has saturated purple/cyan/pink/yellow/green blocks, gray blocks with tonal variation, a blue conveyor rim and a dark indigo belt/background. Rounded block edges have light-colored highlights; shadows are visible under the cannon containers and around the board.
- **Inferred:** broad reflected lights and a mostly overhead key light are a useful Three approximation of the gloss and short soft shadows. These are implementation choices, not recovered artist settings.
- **Unknown:** original renderer, exact light positions/intensities, roughness, environment map and shadow algorithm used for this particular artist mockup. No exact pixel/material parity is claimed.

## Implemented look

`src/render/scene.ts` applies an imported-conveyor material profile: purple `#8436f5`, pink `#fa42bd`, green `#14e528`, gray `#62686c`, yellow `#ffcc00`, rim `#84adff`, belt `#292e5c`, white `#f4f6ff`. Cyan retains the agreed `#2cd8ed`. The reference/procedural profile and editor palette definitions remain unchanged.

Materials use roughness **0.30**, clearcoat **0.70**, clearcoat roughness **0.24**; the belt uses roughness **0.52**. These are authored tuning values. The existing color-space setup and no-tone-mapping choice are retained.

`src/render/mockupLighting.ts` adds:

- Blue-white ambient light `#c9d9ff`, intensity **0.55**.
- Warm-white key light `#fff7eb`, intensity **1.9**, offset **[-10, 50, -8]** from the measured scene center.
- A **128-pixel cube-size** filtered reflection environment generated once from Three's bundled `RoomEnvironment`, intensity **0.4**. No remote image, decoder, extra renderer, added dependency or post-processing pass.
- One **1024×1024** PCF shadow map, radius **5**, normal bias **0.035**, bias **-0.0001**. Blocks, cannons, trays and track cast/receive shadows; outline overlays and effects are excluded.
- A transparent shadow catcher below the board, opacity **0.16**, color `#10132d`. It is added after measuring framing bounds, so it cannot expand the camera view.

The reflection texture is regenerated after context restoration on the same renderer. Environment, shadow, ground geometry and material resources are disposed on teardown. The current 99% red vignette remains active and still tints the scene edges; it was not part of the supplied mockup.

## Verification and comparison

- `npm run typecheck`: passed. `npm test`: **118 passed**.
- `node tools/visual-look-smoke.mjs before` / `after`: muted Chromium captures at **390×844, 844×390, 768×1024, 360×640**, one canvas, 99% retained, no page errors or external requests. Forced `WEBGL_lose_context` recovery passed; restored screenshot inspected.
- [Before](screenshots/mockup-look/before/390x844.png), [after](screenshots/mockup-look/after/390x844.png), [comparison page](mockup-look-comparison.html).
- Browser records are `screenshots/mockup-look/{before,after}/checks.json`.
- Main-render instrumentation changed from **40 to 41 draws**, **189,593 to 189,595 triangles**. These counters do **not** quantify the extra shadow pass; no claim of only one additional total GPU draw or verified device FPS is made.
- Isolated Vite single-file build: `analysis/build/mockup-look-build/index.html`, **3,666,236 raw bytes**. Shipping `dist/` and network packages were not regenerated in this visual pass.

Physical-device performance/color appearance and official ad-host checks remain unverified. The environment/shadows add GPU work, so target-device performance remains a release check. No commit or push performed.
