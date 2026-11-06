# Original Projects to Defold

Our aim is to translate the original projects into Defold while preserving the same functionality and output. The translated projects must meet the client's expectations by matching the original experience: gameplay, controls, rules, visuals, audio, timing, progression, and end states.

This is an engine translation. The original project is the reference for implementation and acceptance. Do not redesign the experience or change behavior unless the client explicitly requests it.

## Download this workspace

Install Git and Git LFS, then clone the workspace with its original assets:

```powershell
git lfs install
git clone https://github.com/castoranthonyhplgamedesign-cmd/Defold.git
cd Defold
git lfs pull
```

This repository includes the full workspace: original source files, translated Defold projects, documentation, outputs, comparison evidence, reference files, downloaded tools, installed dependencies, builds, bundles, caches, logs, and QA browser profiles. Large files are stored with Git LFS. The individual projects' local Git metadata is preserved locally and is not tracked as project content. Local credentials must not be committed.

## Workspace and project mapping

Keep the downloaded source projects in `D:\allproject\defold\Original`. Build the Defold versions in `D:\allproject\defold\Defold Project Translated`, preserving the original repository folder names and the `2D` / `3D` grouping.

| Project | Original source | Defold destination | Reference branch |
| --- | --- | --- | --- |
| BBS Corners (3D) | `Original\3D\BBS_Corners-PA-` | `Defold Project Translated\3D\BBS_Corners-PA-` | `Wide-U-Client_Revision` |
| Ludios Sort Marble Run (3D) | `Original\3D\Ludios-Sort-Marble-Run` | `Defold Project Translated\3D\Ludios-Sort-Marble-Run` | `main` |
| Conveyor Overload (3D) | `Original\3D\ARF-Template-Three.js` | `Defold Project Translated\3D\ARF-Template-Three.js` | `playable/conveyor-overload` |
| CoinSort HorizontalRoll (3D) | `Original\3D\CoinSort-HorizontalRoll` | `Defold Project Translated\3D\CoinSort-HorizontalRoll` | `main` |
| CuttingSand (3D) | `Original\3D\2026.10.13-SDP-MIP-CuttingSand` | `Defold Project Translated\3D\2026.10.13-SDP-MIP-CuttingSand` | `cantReach` |
| Egypt Case (2D) | `Original\2D\2026.09.24-CEM-MIP-egypt-case` | `Defold Project Translated\2D\2026.09.24-CEM-MIP-egypt-case` | `main` |
| Unblock Puzzlebox (2D) | `Original\2D\2026.10.14-CCS-MIP-unblock_puzzlebox` | `Defold Project Translated\2D\2026.10.14-CCS-MIP-unblock_puzzlebox` | `main` |

All paths in the table are relative to `D:\allproject\defold`.

Original repositories:

- 3D: https://github.com/HPL-PlayableAds/BBS_Corners-PA-/tree/Wide-U-Client_Revision
- 3D: https://github.com/HPL-PlayableAds/Ludios-Sort-Marble-Run
- 3D: https://github.com/HPL-PlayableAds/ARF-Template-Three.js/tree/playable/conveyor-overload
- 3D: https://github.com/HPL-PlayableAds/CoinSort-HorizontalRoll
- 3D: https://github.com/HPL-PlayableAds/2026.10.13-SDP-MIP-CuttingSand/tree/cantReach
- 2D: https://github.com/HPL-PlayableAds/2026.09.24-CEM-MIP-egypt-case
- 2D: https://github.com/HPL-PlayableAds/2026.10.14-CCS-MIP-unblock_puzzlebox

## Translation requirements

- Reuse all original assets needed to reproduce the project, including models, textures, sprites, fonts, UI, animations, effects, and audio. Do not substitute placeholders or newly generated assets for available original assets.
- When Defold requires a different asset format, create a converted copy in the translated project and preserve its appearance, scale, orientation, animation, and sound. Keep the original source files intact and record the conversion and source path.
- Match the original gameplay logic, input handling, movement, collisions, puzzle rules, feedback, transitions, win/loss conditions, restart behavior, and any existing tutorial or call-to-action flow.
- Match the original camera, framing, composition, colors, materials, lighting, UI layout, text, effects, animation timing, audio cues, and final rendered output as closely as the engine allows.
- Preserve the original target dimensions, aspect-ratio behavior, device interactions, and deployment requirements where applicable. Confirm these from the original project and client requirements.
- Adapt engine-specific implementation details to Defold while preserving the behavior visible to the player. Record any unavoidable difference and resolve it before calling the translation complete.
- Keep the `Original` projects unchanged as comparison references. Make implementation changes in the corresponding translated project.

## Workflow and comparison

1. Inspect and run the original project before translating. Record the source branch and commit used as the baseline, its startup instructions, asset inventory, gameplay flow, and relevant client requirements.
2. Capture reference screenshots and gameplay recordings covering the initial screen, interactions, tutorial, effects, transitions, and all reachable end states. Use the original implementation to resolve details that recordings alone cannot show.
3. Create the Defold project in its mapped destination and translate the systems using the original assets. Preserve recognizable asset names and organization where practical so sources can be traced.
4. Run the original and Defold versions with the same viewport, starting conditions, and input sequence. Compare them side by side throughout development.
5. Check functional behavior and visual/audio output separately. Compare framing, object positions, UI, motion, timing, effects, sound, and results, as well as input responsiveness and gameplay rules.
6. Keep a comparison checklist and evidence in each translated project. Record mismatches, fix them, and repeat the comparison. Any accepted difference must have explicit client approval recorded with it.

## Completion criteria

A translation is complete only when:

- The project runs in Defold from the documented setup and produces the required target build.
- Original assets are reused, with necessary conversions documented and no remaining placeholders.
- The original gameplay flows and outcomes work with matching controls, rules, feedback, and timing.
- Side-by-side comparison confirms that visuals, audio, layout, and output match the original reference across the required viewports and states.
- There are no unresolved behavior or output differences. Any exception has explicit client approval.
- The translated project's documentation identifies the original baseline commit, how to run/build it, and where to find comparison evidence.

The acceptance standard is the original project and the client's expectations. A successful build alone does not establish a successful translation.
