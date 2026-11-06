# Arrow Flow editor integration

**Simpler authoring is now available:** use the [dedicated Arrow Flow Level Studio](simple-arrow-flow-editor.md), served by this playable checkout at `/level-editor.html`. It uses the same level files and Three.js play test, with three steps and direct controls. The shared Arr_LayoutEditor workflow below remains available.

Implemented 2026-10-26 following the developer's explicit authorization, then extended to direct conveyor drawing and inward bends following their feedback. Author one closed conveyor loop, arrow board, and cannon lanes with ordered queues. The editor remains Phaser; the playable and its play test use the existing Three.js renderer and pure TypeScript simulation. No dependencies were added.

## Start and use

In the playable checkout:

```powershell
npm.cmd run dev -- --port 5181 --strictPort
```

In `D:\Projects\_Other\Arr_LayoutEditor`, in a second terminal:

```powershell
npm.cmd run dev -- --port 4181 --strictPort
```

1. Open `http://127.0.0.1:4181`. Import `public/examples/reference.arrow-flow.json` to edit the current playable's board, or `public/examples/four-sides.arrow-flow.json` for a small working example. Both files are also in the playable's `examples/levels/` folder.
2. For a new board, choose **Arrow Flow (Three.js)** under **Export target**. Draw/edit arrows using the existing tools. Choose a gameplay palette color and click **Use for new arrows / selected arrows**. Imported Flow projects also default new arrows to green. Custom images cannot export as Flow meshes; line thickness is editor presentation only.
3. Choose **Draw conveyor**. Click corners or hold and drag to trace a new loop on the grid, including inward bends. Click/release on the green starting point, press Enter, or click **Finish loop** to close it. Backspace removes the last corner; Esc or **Cancel drawing** discards the draft. Straight drag samples reduce to corners. The old conveyor remains until the drawing passes validation, then the replacement is one undoable change. Existing cannon queues/progress/offsets remain; their aim resets inward for the new outline. **Edit conveyor corners** moves yellow handles afterward. **Rectangle around the grid** and the precise JSON corner list are still available. Set width/travel direction with **Apply conveyor**.
4. Add/select a cannon lane. Set track progress, offset and optional facing angle. Enter `color:ammo`, one replacement cannon per line, then **Apply lane and queue**. Reorder the lines to reorder the queue. Placement is edited by progress/offset; cannon circles are a 2D authoring guide, not the final mesh.
5. Use **Open Three.js play test**, or the main **Play test** button. The local preview URL defaults to `http://127.0.0.1:5181/editor-preview.html`. It opens a snapshot of the current level in the actual game. Tap arrows; Restart resets the snapshot. Reopen the preview after edits to send a new snapshot. It is muted, untimed, and has no ad SDK or store navigation.
6. **Playable JSON** exports `.arrow-flow.json`. **Save project** also preserves the editor profile, tracing image and other authoring data. Local browser drafts and undo/redo preserve conveyor and cannon edits. Ordinary Point Out and ARR exports retain their original formats.

The cross-window preview accepts only the initiating local HTTP editor and validates the received level. Serve the editor on localhost for this feature; opening its HTML directly from disk still supports authoring/export but cannot use the preview handshake. The preview can independently open a Flow JSON file through its file picker.

## Build a custom playable

From the playable checkout:

```powershell
npm.cmd run build:level -- examples/levels/four-sides.arrow-flow.json
npm.cmd run build:level -- examples/levels/reference.arrow-flow.json gg
```

The optional final argument is `preview` (default), `al`, `fb`, `gg`, `is`, `mtg`, `mo`, `un`, or `vu`. These are the same eight selected network adapters. Google, Mintegral and Vungle produce ZIPs containing only root `index.html`; the others produce HTML. A local `index.html` is also retained. Outputs live under `dist/custom/<sanitized-input-filename>/<network>/`.

Custom builds currently use the **full** session variant: no countdown, actual clear shows the endcard. Network packages keep production audio, lifecycle and deliberate CTA behavior. This command does not rewrite the reference level or path. The normal `build:all` still produces both original `60seconds` and `full` variants. Run the plain `build` before custom/network builds because plain Vite build clears `dist`.

The custom-level file is validated before Vite runs and compiled into the bundle. The renderer generates its belt from the authored polygon or uses embedded artist geometry and the validated movement path. No level fetch, JSON upload UI, editor, Phaser runtime, tracing image or preview message listener enters the playable. `GAME_CONFIG` is not used.

## Data contract

Schema: `schemas/arrow-flow-v1.schema.json` in the playable; `arrow-flow-v1.schema.json` in the editor. Pure semantic validation and coordinate conversion: playable `src/layout/arrowFlow.ts`, identical editor copy `src/arrowFlowContract.ts`. After deliberately changing that contract, run `node scripts/sync-editor-contract.mjs [editor-path]`; it also copies the schema and all three examples, including `inward-bend.arrow-flow.json`. `scripts/write-level-schema.mjs` regenerates the structural schema. Version 1 retains existing required fields and accepts optional conveyor.mesh, conveyor.cornerRadius and cannons[].position. Old levels remain valid. Mesh/free-position levels require the dedicated editor; the shared editor rejects them explicitly.

| Field | Meaning |
|---|---|
| `kind`, `version` | Exactly `arrow-flow`, `1`; unsupported versions/fields fail validation. |
| `name` | Editor/preview label, 1–128 characters. |
| `origin` | `[worldX, worldZ]` offset. Editor `[x,y]` maps to world `[x+originX, 0, -y+originZ]`. |
| `board.bounds` | Integer `minX`, `minY`, `width`, `height`, with positive dimensions up to 100 cells. These are editing bounds, not the belt boundary. |
| `board.arrows` | Unique string `id`, gameplay `color`, integer `head`, ordered local-offset `body` excluding the head, and `facing`: Top/Right/Bottom/Left. Body cells follow the head-to-tail order. |
| `conveyor.points` | 3–64 ordered XY centerline vertices, closing automatically from last to first. No repeated closing point. A simple, nondegenerate polygon surrounding every arrow cell; inward bends are allowed. |
| `conveyor.width` | 1.1–3 world/cell units. Rendered track width, independent of capacity calculation. |
| `conveyor.cornerRadius` | Optional radius 0 to 10 for drawn layouts. Missing/zero retains sharp corners; positive values create circular fillets capped by adjacent edge length. The same sampled path drives geometry, clearance, cannon anchors and movement. Requires the dedicated editor; incompatible with positive rounding on artist meshes. |
| `conveyor.direction` | `1` follows vertex order; `-1` reverses movement. Reversing travel does not relocate cannons. |
| `cannons[].progress` | Fraction `[0,1)` of authored raw-loop arc length. UI displays percent. Anchors follow path edits. |
| `cannons[].position` | Optional editor `[x,y]` base position, independent of the belt. When present, aim and detector distance are derived from this base to the progress anchor; legacy offset/angle fields are retained but ignored for pose. Base must be outside the loop, at least half belt width plus 1.5 from its centerline, and at least 4 units from its target. |
| `cannons[].offset` | Base distance behind the anchor along its aim, 4–7 units. Default **5.313**; custom-level detector distance follows this value to keep targeting on the belt. |
| `cannons[].angle` | `null` aims inward normal to the current edge; explicit degrees are -180 to 180. 0 points editor-down/world +Z; 90 points editor-right/world +X. Must aim toward the loop. |
| `cannons[].queue` | Ordered `{color, ammo}` entries; first fires initially. 1–32 entries per lane, ammo integer 1–500. Up to 16 lanes. |

Colors: green `#1bd733`, blue `#4090ff`, orange `#fd9d1b`, black `#6e7074`, pink `#fa3ad1`, purple `#9259ff`, yellow `#fdd71a`. Matching uses color IDs, not approximate visual color conversion. Canonical numeric string arrow IDs preserve their numeric runtime value; other stable export IDs receive unique internal numbers during conversion.

Limits also include 1–500 arrows, at most 2000 cells, body contiguity, unique occupied cells, coordinates within ±1000, board/track clearance of half belt width plus .45 cells, and bounded cannon allocation (sum of each lane's maximum ammo ≤2000). The build/preview rejects level JSON files over 4 MB (the final HTML still has its separate 4 MB ceiling). JSON Schema covers structure; the shared validator covers geometry and occupancy.

## Runtime behavior and intentional limits

- **Confirmed from implementation/tests:** the reference export retains 79 arrows / 406 cells, all facings, four lane positions and every ammo queue. Its origin is `[.5,0]` to retain the original half-cell X positions. The path's negligible source Y offset is flattened to the board plane. Original supplied-reference browser behavior remains unverified; these checks compare with the current playable's extracted data.
- Custom belt corners use polygon/miter corners by default; the dedicated editor can round them with circular fillets, including concave corners. The validator checks the centerline and both offset belt boundaries for crossings, touching edges and insufficient space in a narrow bend. Arrow cells must be inside the actual polygon and clear of every boundary segment; an arrow inside an inward cutout is rejected.
- Custom levels retain .1-unit path resampling, but now select the **first forward conveyor intersection**. Their obstruction ray stops at that crossing, so an arrow across a U-shaped gap cannot block a launch that reaches the belt first. This is an intentional custom-level adaptation. The default reference build retains its original entry selection, obstruction rules and extracted belt mesh. The editor preview and custom package use the same core implementation.
- Capacity remains distance based: `percentage = 100 * .5 * conveyorBlockCount / pathLength`; admission blocks at 90%. Editing loop length changes effective capacity. Width does not create additional lanes or slots. Movement, blocked feedback, spacing and shooting timings otherwise use the existing project tuning, including the checkout's guide speed.
- Cannon detection, projectile origin, queues, shell placement and recoil rotate together. As of the distance-control update, custom-level detector distance follows the authored base-to-target distance, keeping its center on the belt anchor with the source hit-volume dimensions. This is an intentional custom-authoring adaptation; the built-in reference level retains its original fixed 5.313 detector distance. Overlapping containers and insufficient per-color ammo are warnings. Play-testing remains necessary for queue pacing and reachability.
- Custom camera framing includes the authored board, conveyor, cannon containers and fullness meter. The meter moves below the scene, including bottom-mounted cannons. Original reference framing is unchanged. There are no user camera controls.
- No branches, crossings, overlapping belt sections, multiple conveyors, curved/spline editing, new booster/progression systems, automatic level repair or guaranteed-solution solver. The Arrow Out solver is disabled for the Flow profile; it cannot prove Flow solvability. Palette/shape errors block Flow export; balance warnings do not.
- Preview changes are snapshots, not continuous live synchronization. Serve both tools locally. The preview is an authoring aid, not an official ad-host validator.

## Verification and evidence

- Playable unit suite: **61 passing** (54 existing plus 7 Flow suites), including original gameplay/audio/lifecycle checks, reference conversion, invalid documents, reversed movement, rotated swept detectors, rectangular/hexagonal/concave full clears, first-crossing entry and generated geometry. Concave tests cover both winding orders and both travel directions, opposite arrows across a gap, cutout exclusion, narrow-bend rejection and touching edges.
- Editor unit suite: **22 passing** (18 existing plus 4 Flow suites), including schema validation, reference round-trip, project save/import, existing export isolation, drawing sample simplification, queue preservation and atomic invalid-outline handling.
- Both TypeScript/build checks pass. No new dependencies.
- Existing Arrow Out browser smoke passes: editing, reference images, solver, playback and dense 240-arrow interaction fixture.
- `tools/conveyor-drawing-smoke.mjs`: draws the concave fixture via real canvas clicks, checks Backspace, closure at the start, undo/redo, Escape/cancel, invalid crossing preservation and continuous drag drawing. The exported drawing opens in the actual Three preview at four sizes and clears with mouse input; its packaged custom level clears with native touch. Evidence: `analysis/evidence/conveyor-drawing-browser.json`, `analysis/screenshots/conveyor-drawing/`. Run `npm.cmd run build:level -- examples/levels/inward-bend.arrow-flow.json` first and keep both local servers running.
- `tools/editor-smoke.mjs`: actual import/export, queue edits, undo/redo, project restore, invalid-import preservation, conveyor-corner drag, lane add/delete, local cross-port handshake, native-click clear, restart, profile switching and four viewport captures. Requires the two servers above. Evidence: `analysis/evidence/editor-browser.json`, `analysis/screenshots/editor/`.
- `tools/custom-level-smoke.mjs`: builds/boots all eight custom network outputs plus preview, checks package bounds/bridges and confirms a native-touch clear of the packaged custom level. Evidence: `analysis/evidence/custom-level-builds.json`. The fixture HTML is approximately **2.61 MB**; ZIPs approximately **1.10 MB**, under the 4,000,000-byte target. These sizes describe the included four-sided fixture, not every possible authored level.
- Default network builds retain 16 packages: two session variants × eight networks. Raw HTML remains approximately **2.58 MB**. Evidence: `analysis/evidence/network-builds.json`. Shared finalization checks classic scripts, allowed bridges, network metadata, Google literal exit call, Moloco restrictions and ZIP contents.
- The original playable's `validate:delivery` also passes for all 16 packages: packaged boot, automated media behavior, resize, selected-host CTA and pause checks. Evidence: `analysis/evidence/delivery-browser.json`. These are controlled-host browser tests, not official acceptance or physical audibility checks.

Physical iPhone/iPad/Android audio, real-device performance, original-reference runtime parity and official network acceptance remain **unverified**. This work does not turn the earlier software-renderer performance failure into a pass. A full-sized authored level can still require pacing, camera-readability and performance review.

## Custom arrow grid

Optional board.grid is {size: number, offset: [x,y]}, with size between 0.5 and 1.5. Missing values mean one-unit cells and zero offset. Head/body data remains integer grid coordinates; use gridPoint/gridCell for editor/world conversion. The exported runtime applies cellSize to mesh scale, picking, obstruction, contact feedback and following gaps. The conveyor and cannon data remains in world coordinates. Grid edits preserve cell counts and are rejected if they push arrows into the belt. The dedicated editor saves/undoes these settings; the legacy editor rejects custom grids instead of discarding them.
