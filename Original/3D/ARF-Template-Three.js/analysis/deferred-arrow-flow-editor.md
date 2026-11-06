# Arrow Flow level editor integration — original proposal

**Status updated 2026-10-26:** the developer explicitly authorized implementation with “go ahead proceed.” The first integration is implemented; see [the implementation and usage guide](arrow-flow-editor-implementation.md) for current behavior, validation and remaining limits. The proposal below records the earlier deferral and design discussion; it is historical, not a current instruction to defer work.

## Original priority and boundary (historical)

The active plan is [implementation-plan.md](implementation-plan.md): Three.js + TypeScript + Vite, the supplied reference's core arrow/conveyor/cannon interaction, the required ad flow, eight networks and the iOS audio safeguards. No GAME_CONFIG/editor override system.

Keep the current playable's authored level/path/queue data separate from rendering as already planned. That is sufficient preparation for later editor work. No versioned interchange framework, arbitrary-track generator, editor preview, editor-specific migration layer or shared package is required now.

## Future objective

Extend `D:/Projects/_Other/Arr_LayoutEditor` with an Arrow Flow authoring/export mode while preserving the existing Arrow Out workflows. The editor may remain Phaser-based; the playable may remain Three.js-based. They exchange level data, not renderer objects.

The future mode would author:

- Arrow board: grid bounds, ordered cells, facing directions, colors and stable IDs.
- Conveyor: a single closed path, width, movement direction and supported shape parameters.
- Cannons: placement beside the track, firing orientation, color and ammo.
- Queues: ordered replacement cannons per firing position.
- Validation/preview: geometry validity and Arrow Flow-specific interaction checks.

This is a proposal, not an implemented feature or a finalized schema.

## Evidence inspected when this proposal was deferred

**Confirmed from current source:**

- Editor `src/core.ts` defines the layout model, import/export, occupancy, validation and Arrow Out solver; `src/main.ts` provides editor UI.
- Editor `point-out-layout.schema.json` exports `gridBounds`, `movementBounds`, `headPosition`, `bodyOffsets`, `exitDirection` and optional `style` fields. It rejects additional top-level properties.
- Editor `src/main.ts` currently offers General Point Out JSON and ARR-Template-Phaser export targets, not an Arrow Flow target.
- The Babylon template's `src/layout/arrowGrid2D.ts` consumes the same basic arrow shape, mapping editor XY into world XZ, but assumes `style.color` exists and recognizes a configured palette.
- A pure importer check accepted the template's 12-arrow/56-cell fixture. The editor's `public/examples/sample_layout.json` failed the existing importer with `Cannot read properties of undefined (reading 'color')` because color is optional in that export contract.

**Unknown:** full editor-to-Three.js round-trip behavior. No editor/browser/gameplay integration test was performed and neither source checkout was modified for this investigation. Recheck these facts against the current files when resuming; the editor/template can change meanwhile.

## Proposed future approach

1. Inspect the completed playable's actual level/path/queue interfaces before designing an export schema. Reuse them; avoid a second simulation model that diverges from runtime.
2. Add an explicit Arrow Flow export profile and a separate versioned schema/envelope. Preserve existing Point Out/ARR exports unchanged. Do not append unsupported fields to the existing strict schema.
3. Define coordinate units, origin, axis mapping, direction conventions and color IDs. Preserve the difference between board editing bounds and Arrow Out movement bounds; the latter are not the Arrow Flow conveyor boundary.
4. Require a supported gameplay color or provide an explicit, documented mapping. Reject unknown colors with an actionable message. Arrow Out thickness/custom image styling does not automatically map to 3D arrow meshes.
5. Start with one simple, non-self-intersecting loop surrounding the board: rectangle or convex polygon. No branches, self-crossings, multiple linked loops or arbitrary concave tracks in the first version. Check that each authored arrow has a valid entry under the completed game's entry-selection rule.
6. Generate visible conveyor geometry and its movement path from the same authored representation. Define width/clearance and any corner treatment once; do not create visually rounded corners while using an unrelated sharp simulation path.
7. Anchor cannons to track distance/progress plus side offset and orientation, with explicit muzzle/detection geometry. Keep queue/color/ammo data independent of rendering.
8. Reuse existing board selection, drawing, transforms and undo/redo; extend history/import/export to cover conveyor and cannon edits atomically.
9. Add Arrow Flow validation. The Arrow Out solver proves neither conveyor capacity safety nor ammo/queue reachability. A timed showcase does not need a guaranteed full clear; distinguish errors from pacing/balance warnings.
10. Add a preview using the playable's pure TypeScript core where practical. Keep a Three.js visual preview optional until its value is established; the existing editor need not be rewritten to adopt the game's renderer.

## Proposed future validation

- Existing Arrow Out imports, exports, editing and tests continue to pass.
- Arrow Flow export/import preserves IDs, cells, path, cannon anchors and queue order.
- Reject overlapping/invalid cells, unsupported colors, degenerate or self-intersecting tracks, invalid widths and malformed ammo/queue entries.
- Check board/track clearance, entry reachability and detector placement against actual runtime rules.
- Warn about unmatched colors, inaccessible reserve cannons and ammo imbalance without labeling every timed demonstration unsolvable/invalid.
- Import the export into the completed Three.js playable and compare geometry, launches, entry points, matching, ammo and replacement order.
- Cover resize/orientation and edits that change path length; derive occupancy/capacity behavior from the game's chosen rules rather than imposing fixed slots.
- Ensure the shipping playable includes only level data, not the editor, tracing images, editor dependencies or debug controls.

## Original resume note (superseded)

Start from this document and the completed playable's current interfaces. Read the editor's then-current instructions and source before changing anything. Produce a concrete schema/UI change plan and compatibility tests for the existing Arrow Out formats. The developer's current priority remains the playable ad; this document does not authorize editor implementation.
