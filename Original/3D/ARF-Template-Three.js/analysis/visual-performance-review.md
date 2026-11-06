# Conveyor, arrow inset, endcard and performance correction

2026-10-29. This supersedes the conveyor/material and shadow settings in the earlier `mockup-look-review.md`. Existing gameplay, cannon queues, layout, input, audio and network routing were preserved.

## Visual corrections

- **Confirmed:** pixel samples from the supplied `arf_conveyor_overload_mockuppresentation.png`, mapped into its 1842x1344 displayed size: belt at (900,1014) is `#2c2f65`; blue wall at (925,1033) is `#99bdff`; upper rim at (895,508) is `#c9dfff`. These are rendered pixels, not the artist's material values.
- **Inferred:** the previous belt's specular reflections were responsible for its gray appearance. Removing its environment contribution and reducing specular strength produces a closer rendered match. Authored belt material: `#25275b`, roughness .6, environment intensity 0, clearcoat 0, specular intensity .1. Rim: `#a3ccff`, with the existing gloss retained. Other block colors and lighting remain unchanged.
- **Confirmed:** the final 390x844 capture has exposed belt samples `#2f3067` at (185,610) and `#2f3168` at (190,613); its front wall is `#98bdf0` at (190,622). This is closer to the mockup, not exact pixel parity. The existing red overload vignette still tints the outer edges.
- Arrow insets now have their own darker material, using .28 times the body's **linear** RGB, roughness .75 and environment intensity .12. White highlight size/placement and picking remain unchanged. The new materials are disposed with the board.
- Endcard logo has no pop, pulse or opacity animation. It retains its responsive size, centered placement, click handler and keyboard behavior.

[Before/after comparison](mockup-look-comparison.html) · [Final portrait](screenshots/mockup-look/revision-after/390x844.png)

## Performance changes and measurements

- Shadow map reduced from 1024x1024 to 512x512: 75% fewer shadow-map texels. Radius adjusted from 5 to 3. This reduces shadow-map work/storage; it does **not** mean the whole frame is 75% cheaper. Geometry and draw counts are unchanged.
- After the static endcard is revealed, the scene stops scheduling animation frames. Resize, visibility and context-restoration events can still request a redraw. Browser instrumentation verified **zero additional WebGL draws over 2 seconds** while the endcard remains idle.
- No new runtime dependency, post-processing pass or remote asset was added. Existing shared geometry, instancing and the single renderer remain in use.

Fixture: muted installed Chrome 156, Windows, Ryzen 5 3600, NVIDIA RTX 3060/D3D11, viewport 390x844, DPR 2 (780x1688 framebuffer). Five-second samples, fresh context per CPU throttle. These are desktop measurements; CPU throttling does not emulate a mobile GPU.

| Phase | Before FPS | Final FPS | Final p95 frame interval |
| --- | ---: | ---: | ---: |
| Idle, normal CPU | 144.0 | 144.0 | 7.1 ms |
| Native hint interaction, normal CPU | 144.0 | 139.6 | 7.1 ms |
| Idle, 4x CPU throttle | 108.1 | 105.9 | 14.0 ms |
| Native hint interaction, 4x CPU throttle | 95.3 | 93.4 | 14.3 ms |

No measured FPS improvement is claimed: the normal fixture is largely refresh limited and shared-machine variation affects the throttled samples. The updated harness waits for a visible tutorial before clicking and verifies its dismissal; the original baseline did not assert this, and its normal-CPU interaction sample retained the initial triangle count. The final interaction sample reduces triangle count as blocks are cleared. Treat that baseline row as an observation, not an equivalent workload comparison.

Final scene: **41 main-pass draws / 189,595 triangles initially**, approximately **70 actual WebGL draws including shadows**. Heap samples: about **19-22.5 MB**, not a memory-leak test. Scene readiness: **2.13-2.25 seconds** in this fixture, not a network-download benchmark.

Evidence: `evidence/playable-performance-before.json`, `evidence/playable-performance-after.json`; harness: `tools/playable-performance.mjs`. The earlier software-renderer performance failure remains historical evidence and is not superseded by a phone-performance claim.

## Validation and limits

- TypeScript check passed; 118 unit/regression tests passed, including the darker inset and unchanged highlight transforms.
- Four viewports passed: 390x844, 844x390, 768x1024, 360x640. One canvas, 99% preload retained, no page errors or unexpected external requests. Forced context loss/restoration passed. Evidence: `screenshots/mockup-look/revision-after/checks.json`.
- `tools/session-smoke.mjs` passed: static logo bounds/transforms, no continuous endcard rendering, endcard resize in all four viewports, blocked board input, keyboard/click CTA. The test fixture stubs destinations and uses virtual time; this is not an official-host test. Its initial software-browser run was stopped for excessive runtime; the final installed-Chrome run passed. Resize checks explicitly flush layout before advancing the virtual clock.
- Final isolated Vite HTML: `playable-look-build/index.html`, **3,665,858 raw bytes**, below the provisional 4,000,000-byte target. Previous visual build was 3,666,236 bytes. Shipping `dist/` and the eight network packages were not regenerated during this correction.
- **Unknown/unverified:** physical iPhone/iPad/Android GPU performance, sustained heat/battery use, actual ad-host rendering/acceptance and device color appearance. The desktop result does not certify these. The roughly 190k visible triangles plus shadow pass remain the primary mobile GPU risk.

No commit or push performed.
