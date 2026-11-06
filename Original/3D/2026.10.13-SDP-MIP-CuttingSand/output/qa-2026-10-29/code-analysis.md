# CuttingSand source analysis — 2026-10-29

Scope: current working tree in `G:\downloads\Work\Phaser\2026.10.13 SDP, MIP, CuttingSand`. This review preserved pre-existing changes and did not modify source code. Browser results are recorded separately; the findings below describe source inspection and isolated checks of the actual transpiled modules.

## Architecture and verified strengths

- One Phaser game boots through `main.ts` and `BootScene`; `GameScene` creates and connects the gameplay modules. Both tap and swipe mechanics share the simulation and rendering systems (`src/scenes/GameScene.ts:198`, `:237`, `:514`).
- `SandGrid` holds static and moving sand in typed arrays, with preallocated scratch buffers. Swipe cuts and falling-sand steps run without creating a Phaser object for every grain (`src/game/sandGrid.ts:87`, `:114`, `:352`, `:506`).
- `Conveyor` similarly stores belt and falling grains in preallocated arrays. It supplies matching front buckets and handles overflow and jam detection (`src/game/Conveyor.ts:59`, `:170`, `:218`).
- `SandView` combines moving grains into a canvas texture. `PictureHd` divides the painting into 16 horizontal bands and updates changed portions (`src/game/SandView.ts:104`, `:173`; `src/game/PictureHd.ts:16`, `:48`).
- `DesignImage` retains design-space positions and tween sizes, then maps them through responsive helpers. Rotation remaps existing objects. Both resize paths resize before changing Phaser zoom (`src/utils/designNode.ts:159`; `src/main.ts:81`; `src/scenes/GameScene.ts:375`, `:435`).
- Tap feedback uses a four-item pool, praise reuses one image, and swipe trails use fixed-length typed arrays (`src/game/Feedback.ts:7`, `:32`; `src/game/Praise.ts:22`; `src/game/CutTrail.ts:23`).
- The scene publishes sand accounting and bucket integrity diagnostics. These make conservation and queue corruption observable during stress testing (`src/scenes/GameScene.ts:1057`).

## Confirmed source issues

### Unity pause is not composed with the other visibility signals

`luna:pause` and `luna:resume` directly control the scene, while the shared lifecycle function considers only document visibility and cached MRAID flags. The Luna handlers also omit audio pause/resume (`src/networks.ts:60`, `:180`).

Isolated checks using the actual transpiled `networks.ts` reproduced all three consequences:

1. Luna pause pauses the scene but does not pause sound playback.
2. A subsequent MRAID volume callback resumes the Luna-paused scene because it calls the shared lifecycle function.
3. MRAID exposure zero followed by Luna resume resumes gameplay despite the cached hidden exposure state.

This should be resolved by retaining the independent pause reasons and applying one combined lifecycle decision, including audio.

### SDK mute can be overwritten by first input or foregrounding

The Luna mute callback changes the sound manager directly (`src/networks.ts:182`), but first-input unlocking and visibility restoration derive mute from only `unlocked` and `GAME_CONFIG.MUTE` (`src/audio.ts:39`, `:50`). Neither retains the SDK mute request.

Isolated checks using the actual transpiled `audio.ts` confirmed that a mute requested before first input is cleared by `unlockAudio()`, and a mute requested after unlocking is cleared by a hide/show cycle. Effective mute needs to include the retained SDK mute state.

### Background image tuning is bypassed

The background image is constructed with `scene.add.image()` and a calculated cover size (`src/scenes/GameScene.ts:453`). It bypasses the `DesignImage` slot handling for `anchorPoint`, `scale`, and `resizeBlocked` (`src/utils/designNode.ts:154`, `:159`). Those settings are exposed on the public background texture slot, but this rendering path does not consume them. Either consume the supported settings or accurately restrict the exposed metadata.

## Items requiring measurement or broader checks

- **Loading split:** `BootScene.preload()` queues every configured image and soundtrack together (`src/scenes/BootScene.ts:29`, `:36`). There is no implemented critical/deferred manifest split matching the documented first-frame loading policy. Measure first-frame bytes and startup latency before assigning a performance severity.
- **Frame allocations:** QA publishing creates new `activeColors` and `fronts` arrays every frame (`src/scenes/GameScene.ts:1062`, `:1074`), and front/hint tracking builds additional short arrays. This falls short of the documented no-GC aspiration, but a frame-time or memory profile is needed to establish a user-visible performance cost.
- **Scene teardown:** `EndCard.destroy()` removes its DOM click layer (`src/scenes/cta.ts:167`), but `GameScene` does not visibly register a shutdown/destroy callback that invokes it. The current game uses one scene for a session; host-driven teardown or future scene restarts need explicit cleanup verification.
- Browser emulation does not establish physical mid-range Android performance or actual SDK/container behavior. Separate those claims from source correctness and desktop browser results.
