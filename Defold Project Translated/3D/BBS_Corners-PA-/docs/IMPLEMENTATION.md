# Implementation and source mapping

## Current branding

The user requested a new icon and a synonymous or similar title. The new product name is **Brickshatter Corners**. `branding.json` holds the name and build identifiers; `game.project` supplies the Defold window/browser title. Publication folders, executable and ZIP names follow the new name. Source paths retain the original repository mapping for traceability.

The new interlocking-block mark is editable SVG in `assets/branding/mark.svg`, rendered locally by `tools/generate-branding.mjs`. It produces the in-game logo (`assets/app_icon.png`), browser/app icon (`assets/branding/icon.png`), and Windows icon (`assets/branding/icon.ico`, 16/24/32/48/256 px). This is the user-authorized exception to original branding reuse. The generated logo uses the existing Roboto Bold font. Asset import deliberately preserves it rather than restoring the original Block Buster logo. Browser loading copy and application metadata also use the new title.

## Baseline and workflow

The source is the Unity/Babylon repository at branch `Wide-U-Client_Revision`, commit `cfd9f7b`. Its working tree was clean during inspection. Dependencies were installed only in an isolated copy of `PortRoot`, served on loopback port 5177. Reference startup screenshots were captured before visual comparison.

The Unity project cannot open unchanged on this machine because `Packages/manifest.json` points Playworks to the absent `D:/GameDev/Work/HPL/Unity files/7.2.0/scripts`. The checked-in Babylon port supplies a runnable visual reference, while Unity C# supplies authoritative rules. No source assets or scripts in `Original` were edited.

## Components

| Defold file | Responsibility | Source |
|---|---|---|
| `main/board.lua` | 63-cell U grid, 56 blocks, 9 gates, occupancy, one-cell swept movement, route planning | Unity BoardManager, Brick, Gate; Babylon wideUScene |
| `main/game.script` | Input, drag, submission, audio, iterations, completion, tutorial and state telemetry | ControlManager, IterationVariantManagers, GameManager |
| `main/viewport.lua` | Shared camera projection and pointer unprojection; rotation preserves authored grid positions | Babylon camera/assetSizing |
| `main/hud.gui_script` | Original logo, CTA, hand, header, end-card fade, submission particles | Unity UI and Babylon HUD |
| `main/platform.lua` | Engine-to-browser events, lifecycle state, CTA calls | Babylon networks/analytics |
| `web/template.html` | DOM-ready startup, bounded MRAID readiness, SDK priority, local-preview behavior | Original network integration |
| `render/` | Depth-tested 3D meshes, directional plastic shading, textured board, GUI pass | Original materials and source mesh normals |

## Coordinates and assets

The logical grid keeps Unity X/Z coordinates. Rendered meshes reflect Z into Defold's right-handed coordinate system; triangle winding is reversed, and normal Z is reflected. Original vertices, normal data and FBX material regions are preserved. Mesh instances use source scale and placement constants. The two-cell colored blocks are centered between their two occupied cells.

`tools/import-assets.mjs` converts the already extracted Unity FBX triangle arrays in `PortRoot/src/generated/wideUModels.ts` into Defold `.buffer`/`.mesh` resources. It copies original images and audio without synthesizing replacement art. Defold does not consume the reference MP3 through its sound component, so music uses the original `bgm_compressed.wav` instead. `assets/header.font` uses the original Roboto Bold TTF supplied in the Unity repository. Board surface triangulation and UV mapping follow the reference port's cutout surface.

`tools/create-scene.mjs` generates the collection, board surface and sound components. The conversion can be rerun from the original without modifying it. `docs/asset-manifest.json` records copied source paths and hashes plus converted mesh bounds and counts.

## Gameplay

Movement is validated through each intermediate cardinal cell. A block cannot cross the center opening, another block, or the board edge. Occupancy updates atomically. Drag visuals can follow the pointer between legal cells; release settles to the authoritative cell position.

Matching gate contact submits during drag and frees occupancy. The block moves toward the gate and shrinks over 400 ms. Gates bounce, original crumple audio plays, and colored fragments animate outward. Pickup and settle use 340-milliunit elevation and a 120 ms settle. Neutral exits are white at (-3,1) and black at (3,2); seven colored exits sit above the board.

Hints prioritize matching submissions and legal clear routes. If a route is blocked, a bounded vacancy search finds a blocker move that enables the next route. The search collapses interchangeable same-color neutral blocks in its visited-state keys. Hint planning is cached between moves; it does not run every render frame. The hand appears on opening and after six seconds of inactivity. This expresses the source's direct-clear/blocker-planning behavior using a deterministic search rather than a line-for-line translation of its heuristic planner.

Full completion requires all 56 blocks, following Unity `BoardManager.CheckAllBricks`; the obsolete last-four shortcut is disabled. FourClicks counts valid block presses and ends on press four. ThirtySeconds starts at the first valid block press and pauses while hidden. End cards fade over one second, lower music, lock gameplay, and then accept CTA input. Limited modes request CTA as the end card starts. Full completion waits for user CTA input.

## Lifecycle and SDKs

Audio stays locked until the first valid block interaction. Browser visibility and MRAID exposure/viewability pause gameplay and music. Host mute is honored; unavailable/null volume is ignored. MRAID detection is bounded to 500 ms and loading readiness to two seconds. Error, state, exposure, viewability and volume listeners are installed before gameplay starts.

CTA priority is ExitApi, Facebook/Moloco, Luna, playableSDK, Mintegral/install, openAppStore, clickTag, Vungle parent message, ready MRAID, then window.open. `gameClose` precedes redirect. Analytics milestones are idempotent; limited modes do not emit challenge-solved.

The local preview suppresses outgoing redirects. `?sdk=1` permits isolated SDK mock tests. `?network=al|gg|is|mtg|fb|un|vu|mo` selects wrapper behavior; local preview does not request remote SDK scripts. The source engine's standard Wasm distribution is a multi-file bundle; this local publish is not advertised as a single-file network deliverable.

## Tool references

- [Defold mesh components](https://defold.com/manuals/mesh/)
- [Defold Bob build tool](https://defold.com/manuals/bob/)
- [HTML5 integration and query parameters](https://defold.com/manuals/html5/)
- [HTML5 Lua bridge](https://defold.com/ref/stable/html5-lua/)

The installed 1.14.0 built-in renderer was also inspected to match its `graphics.*` state/buffer constants. Java 21 cannot run this Bob; the installed Defold Java 25 runtime is required.
