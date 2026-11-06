# Milestone 1 — static Three.js scene

Status: implemented and checked, 2026-10-22. Stop for developer review before gameplay.

## Delivered

- Three.js 0.184.0, TypeScript 5.9.3, Vite 7.3.6 and vite-plugin-singlefile 2.3.4, with a committed-style dependency lockfile. No Babylon/Phaser runtime, physics, tween package or framework imports.
- Fixed orthographic source camera transform; fit-to-container framing in both orientations, capped DPR 2. One renderer, shared materials and instanced repeated meshes. Static rendering occurs only on initial presentation/resize/visibility/context recovery.
- Eight reference geometry assets, 79 arrows, 406 reconstructed board cells, four tunnels and the first two cannons in each queue.
- Data-only asset packing, source-controlled defaults, graceful graphics failure text, disposal and resize handling.
- Standalone HTML at `../dist/index.html`; development command `npm.cmd run dev`.

## Validation

**Confirmed, new implementation:** TypeScript check, Vite build, classic-script syntax/inline-asset/size checks and two asset/layout tests pass. Raw standalone HTML: **1,761,813 bytes**. Packed geometry: **933,388 bytes**. Browser evidence: [milestone-1-browser.json](evidence/milestone-1-browser.json).

**Confirmed, browser:** Chromium rendered 390×844, 844×390, 768×1024 and 360×640 consecutively at DPR 2. One canvas, **32 draw calls / 255,131 triangles** per rendered frame. No page/console errors and no requests beyond the intercepted preview document. Browser audio was muted. This is a static render check, not an FPS benchmark or gameplay test.

Captures: [portrait](screenshots/milestone-1/390x844.png), [landscape](screenshots/milestone-1/844x390.png), [tablet](screenshots/milestone-1/768x1024.png), [small portrait](screenshots/milestone-1/360x640.png). Portrait and landscape were visually inspected; the full geometry stays within frame. Landscape leaves large side margins; its framing is provisional.

## Board extraction correction

**Confirmed:** scene object 142 has `cells.length = 4`, followed by stale overrides for cells 4 and 5. The earlier generic extraction applied these sequentially and grew the array again. Similar records exist on other arrows. See `assets/serialized/05df34ae-586f-458e-a1b4-9cb0c0e05872.json`, object 142, `_prefab.instance.propertyOverrides`.

**Inferred:** treating explicit declared lengths as authoritative yields **406 unique, contiguous cells** across 79 arrows, with no overlap. This is the static preview's layout. The old `evidence/level.json` retains the original 536-cell expansion as historical evidence; it is not shipped. The new reproducible transformation is `../scripts/prepare-assets.mjs`; compact output is `../src/data/level.json`.

**Unknown:** exact Cocos runtime array-override handling and board state at first interaction. The overlap-free reconstruction is strong evidence, not runtime proof. The 425-shot total also does not prove solvability or color-by-color balance.

## Asset choices and fidelity

**Confirmed:** this milestone uses the extracted reference geometries, rather than the colleague's differently scaled GLBs. Geometry UUID provenance is in [milestone-1-assets.json](evidence/milestone-1-assets.json). Only positions, normals and indices are packed; no texture coordinates, animation or unused engine attributes ship. No colleague source or asset has yet been copied into shipping code. Its useful adapters/algorithm ideas remain available for later stages subject to the reference rules.

**Inferred, implementation choices:** solid MeshStandardMaterial colors/roughness use source material values. Ambient intensity 2, directional intensity 2.5 and position (-8,25,12) are provisional Three lighting, not measured reference equivalents. The tunnel currently uses a flat gray material. Camera fitting margin 1.08 and DPR cap 2 are authored policies. Reference camera defaults are otherwise preserved.

## Not included / review risks

- No tapping, launching, conveyor movement, shooting, ammo labels, HUD, tutorial, audio, endcard or CTA yet. No GAME_CONFIG or editor integration.
- No host bridge or network-ready release output. The single baseline preview has AppLovin metadata only; eight-network adapter/packaging work remains deferred.
- No physical iOS/Android, ad-host, WebGL context-loss recovery or low-end GPU tests. Context restoration is wired but not yet empirically exercised.
- Reference runtime remains blocked under its required sandboxed-browser setup. The successful new-app check does not change that result.
- 255k triangles is a performance risk on weaker devices. Instancing reduces submissions, not triangle cost; profile/optimize once moving gameplay exists.
- Shader, tunnel texture, exact framing and lighting parity remain unverified. Original and colleague source files are untouched.

Next milestone: pure TypeScript board occupancy/open-front rules, picking and launch behavior with meaningful core tests, following review of this static foundation.
