# Wide-U Babylon.js Port Plan

The canonical Babylon playable-ad port plan now lives in:

`PortRoot/PORT_PLAN.md`

Use `PortRoot/` as the workspace for all Babylon port files. The Unity project remains the level-design source of truth until `Assets/Scenes/Wide-U.unity` is locked.

## Current Decision

Port Wide-U as a planned Babylon.js and TypeScript rewrite for playable ads.

This is not a Unity WebGL export and not a Phaser project. Unity data should be extracted into a deterministic scene manifest, then implemented with Babylon rendering, grid-state gameplay, HTML/Babylon UI, and playable-ad network wrappers.

## Current Source Scene

- Scene: `Assets/Scenes/Wide-U.unity`
- Main port workspace: `PortRoot/`
- Port instructions: `PortRoot/AGENTS.md`
- Detailed plan: `PortRoot/PORT_PLAN.md`

## Current Port Contract

- Preserve the complete Wide-U board, gates, bricks, camera framing, hints, iterations, CTA, audio, analytics, and end-card behavior.
- Preserve all nine colors: red, orange, yellow, green, blue, purple, pink, black, white.
- Direct submit hints must override every other hint.
- Direct clear hints can target any color.
- If no direct clear exists, hint planning targets the closest possible black/white block and moves blockers to clear its route.
- Iterations:
  - `Full`: clear whole board, show win end card, no auto redirect; later interaction redirects.
  - `FourClicks`: 4 block clicks, redirect and show end card.
  - `ThirtySeconds`: 30-second timer starts on first valid input, then redirect and show end card.
- Full mode must not reintroduce the old last-four-bricks end shortcut.

## Next Step

When level design is locked, start from `PortRoot/PORT_PLAN.md`:

1. Extract the Wide-U scene manifest.
2. Convert meshes/materials/UI assets.
3. Implement deterministic grid gameplay.
4. Implement hint logic and iteration variants.
5. Build per-network playable outputs and validate in preview tools.
