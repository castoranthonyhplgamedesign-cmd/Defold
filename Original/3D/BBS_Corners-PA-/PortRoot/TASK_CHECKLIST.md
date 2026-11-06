# Wide-U Babylon Task Checklist

Use this file as the living checklist for the Babylon playable version in `PortRoot/`.

## Task Inbox

Add new requested work here first. We can move items into the implementation sections after they are scoped.

- [x] Gate contact area feels too large; tighten `gateRelease` logic so submission/contact matches the visible gate footprint.
- [x] Same-color gate selection feedback is missing; selecting/dragging a block that matches a gate should bounce that gate upward like Unity.
- [x] Correct submission needs visible VFX beyond the current absorb animation/flash.
- [x] Dragging or clicking a block should raise it higher than the current pickup height.
- [x] Straight drags should not board-snap; only snap if the player moves up, then changes to a different direction.
- [x] Hint should only appear after 6 seconds of player inactivity; stop repeated/spam hint playback.
- [x] Add missing SFX and BGM with playable-safe audio unlock behavior.
- [x] App logo in the footer should redirect like the Play Now button.
- [x] Submitting should happen during drag as soon as a matching block touches a gate, without waiting for pointer release.
- [x] Models look too squished/flat; recalibrate vertical mesh scale and camera tilt against Unity reference.
- [x] Expose block scale plus all gate scales/positions in `src/constants.ts`.
- [x] Keep valid dragged blocks raised instead of lowering them toward the board during snap movement.
- [x] Add subtle fake contact shadows for blocks and gates.
- [x] Port Unity `Crumple.wav` as the gate submission SFX.
- [x] Remove Unity `Success.wav` from the Babylon audio path.
- [x] Implement the four active Unity AudioLibrary clips: `BgMusic`, `Drag`, `Drop`, and `Crumple`.
- [x] Restore Unity-style pickup lift/settle feedback when dragging and releasing blocks.
- [x] Compress playable audio before final network export validation.
- [x] Make each gate set its VFX starting color to that gate color at scene start.
- [x] Add level/map bounds so rendered blocks cannot be dragged outside the board mesh.

## Current Port Status

- [x] Babylon/Vite/TypeScript scaffold exists.
- [x] Playable network export pipeline exists.
- [x] Iteration filename scheme uses `nougc`.
- [x] Reference visual prototype exists for board, gates, footer, CTA, and camera tilt.
- [x] Core Unity model meshes are converted/imported as embedded Babylon mesh data.
- [x] Remaining Unity UI/texture assets are converted/imported.
- [x] Unity scene data is extracted into a Babylon scene manifest.
- [x] Prototype scene manifest exists for the current reference layout.
- [x] Prototype drag/snap/absorb gameplay is implemented.
- [x] Prototype brick hitboxes and ray-plane dragging are implemented.
- [x] Make invisible brick hitboxes reliably pickable after model import.
- [x] Switch drag start selection from mesh picking to direct board-cell pointer selection.
- [x] Prototype center-opening routes are testable.
- [x] Prototype hint logic is wired to rendered blocks.
- [x] Final hint behavior is fully parity-tested against gameplay routes.
- [x] End-to-end playable QA is complete.

## Assets

- [x] Inventory source Unity meshes, textures, materials, and UI files needed for Wide-U.
- [x] Convert core meshes to embedded Babylon mesh data.
- [x] Port/simplify materials for mobile playable performance.
- [x] Import or recreate hand pointer UI.
- [x] Replace footer app icon and Play Now CTA placeholders with Unity UI sprites.
- [x] Import or recreate end-card UI assets.
- [x] Replace prototype brick, gate, base, and border primitives with model-backed meshes.
- [x] Remove rendered helper primitives; keep invisible hitboxes for input only.
- [x] Restore gate arrow indicators as generated gate-local meshes.
- [x] Centralize board, brick, hitbox, gate, arrow, and drag sizing in `src/data/assetSizing.ts`.
- [x] Replace primitive hand hint with optimized Unity `hand_pointer.png` sprite.
- [x] Expose hand hint size, anchor, offset, rotation behavior, world height, animation speed, and scale in constants.
- [x] Confirm total bundle size stays within playable network limits.

## Scene Data

- [x] Lock `Assets/Scenes/Wide-U.unity` as the active layout reference.
- [x] Extract grid slots, brick origins/cells, gates, gate slots, accept directions, and VFX points.
- [x] Create prototype `src/data/wideUScene.ts` from the current reference layout.
- [x] Remove movement slots from the center opening so routing matches Unity.
- [x] Align primitive `wideUScene.ts` with the extracted Unity row, color, center-opening, and side-gate layout.
- [x] Align colored starter blocks to the actual `SM_Tile_Long` 1x2 footprint.
- [x] Replace prototype `src/data/wideUScene.ts` with extracted Unity layout after lock.
- [x] Validate all nine colors are represented correctly.
- [x] Verify side/top gates match the extracted reference layout and smoke-test routes.

## Gameplay

- [x] Build rendered brick objects from scene manifest data.
- [x] Implement pointer picking.
- [x] Implement drag on the board plane.
- [x] Add larger prototype hitboxes for easier block grabs.
- [x] Add axis-locked, path-limited sliding drag with blocker clamp and gate over-drag support.
- [x] Implement grid occupancy release/claim during drag.
- [x] Implement snap to valid slots.
- [x] Implement snap-back for invalid drops.
- [x] Implement gate color matching.
- [x] Implement gate acceptance and prototype absorb animation.
- [x] Simplify gate submission to same-color dragged footprint touching a gate area.
- [x] Tighten gate submission to the visible gate-facing lane instead of a broad neighbor area.
- [x] Add prototype feedback for blocked drops, rejected gate touches, and accepted submissions.
- [x] Add same-color gate selection bounce and lightweight submit VFX.
- [x] Initialize gate VFX color from each gate color before any submissions.
- [x] Remove score target/progress logic; Full completion uses `BoardState.getActiveBrickCount() === 0`.
- [x] Allow gate-directed drag releases to submit instead of snapping back.
- [x] Submit matching blocks immediately during drag contact.
- [x] Clamp rendered drag candidates to board/map bounds while preserving one-cell gate overdrag for submit checks.
- [x] Prevent input while end-card or absorb animations lock gameplay.

## Hints And Tutorial

- [x] Wire `HintPlanner` to live board/gate state.
- [x] Implement submit-ready hint priority.
- [x] Implement direct clear hints for any color.
- [x] Implement closest possible black/white target selection when no direct clear exists.
- [x] Implement blocker-move hints toward the target route.
- [x] Prevent repeated back-and-forth hints.
- [x] Scale hand movement distance by available cells.
- [x] Highlight the target gate, not necessarily the hinted blocker.
- [x] Start the first tutorial immediately on scene start.
- [x] Set idle hint delay to 6 seconds.
- [x] Loop idle hand hint animation with a 1 second delay between cycles.
- [x] Verify hints continue after successful moves.

## Iterations

- [x] Full: clear whole board, show win end card, no auto redirect.
- [x] Full: any interaction after CTA is enabled redirects.
- [x] FourClicks: 4 valid block clicks trigger redirect and end card.
- [x] ThirtySeconds: timer starts on first valid input.
- [x] ThirtySeconds: 30 seconds triggers redirect and end card.
- [x] Confirm no old last-four-bricks shortcut exists.

## Visuals And Camera

- [x] Match the approved reference image visually, not Unity raw camera numbers.
- [x] Preserve the slight board tilt.
- [x] Reduce gate tab depth so top and side gates match the Unity reference scale more closely.
- [x] Expose hemispheric and directional light direction/intensity in constants.
- [x] Match beige background, board scale, top copy, footer, and CTA placement.
- [x] Increase perceived brick/gate height so imported meshes match Unity depth.
- [x] Make block/gate visual scale and gate position editable from constants.
- [x] Add configurable contact shadows to reduce the flat look without dynamic shadow maps.
- [x] Ensure board side gates do not clip on portrait phones.
- [x] Verify portrait tablet framing.
- [x] Verify landscape framing.
- [x] Replace prototype colors with final sampled material colors.

## Playable Networks

- [x] Confirm CTA fallback chain markers in each target network export.
- [x] Confirm MRAID builds include exactly one `mraid.js`.
- [x] Confirm Google builds include ExitAPI.
- [x] Confirm Mintegral body hook works.
- [x] Confirm zipped outputs contain only `index.html`.
- [x] Confirm no runtime local asset fetches.
- [x] Confirm no `console.error`, `type="module"`, or `crossorigin` in final exports.
- [x] Confirm audio unlocks only after user interaction.
- [x] Gate submission `Crumple` SFX respects first-input unlock and lifecycle mute.
- [x] Confirm hidden/unviewable state pauses or mutes correctly.

## QA

- [x] Typecheck passes.
- [x] Vite production build passes.
- [x] Hint smoke test passes.
- [x] Model layout smoke test passes.
- [x] Gate submit smoke test passes.
- [x] Drag resolver smoke test passes.
- [x] Framing smoke test passes.
- [x] Full clear smoke test passes.
- [x] Babylon Ray side-effect import is included for pointer ray picking.
- [x] Final `build:all` passes when export validation is needed.
- [x] `validate:dist` passes after final export.
- [x] Network-wrapped `dist` validation replaces plain Vite `dist` validation for final export.
- [x] Manual smoke test on phone portrait viewport.
- [x] Manual smoke test on tablet portrait viewport.
- [x] Manual smoke test on landscape viewport.
- [x] Confirm gameplay can be completed in Full mode.
- [x] Confirm limited iterations redirect/end correctly.

## Subagent Support

- [x] Use helper subagent for read-only audits, backlog grouping, and risk checks.
- [x] Worker subagents were not needed for final single-scope fixes; helper audit covered support.
