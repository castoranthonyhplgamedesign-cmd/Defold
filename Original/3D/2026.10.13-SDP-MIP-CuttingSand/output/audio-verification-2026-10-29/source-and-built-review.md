# Current audio source and built-output review

Scope: read-only review of current source and the latest AppLovin 90-second tap and swipe builds. This verifies the implemented mapping and embedded payloads. It does not establish a perceptual or sample-accurate match to the reference video's final mix.

## Confirmed current build

Both builds embed the same eleven current `Assets/Runtime/audio/*.mp3` files byte-for-byte. Their `CHANGABLE_SOUNDTRACKS` metadata and `AUDIO` tuning match `src/projectDefaults.json`; their mechanics are respectively `tap` and `cut`. See `current-source-built-audio-audit.json` for filenames, SHA-256 hashes, durations and individual comparisons. Each HTML is 4,258,892 bytes.

The older `output/audio-analysis-2026-10-29/current-playable-audio-map.json` predates the supplied WAV integration. Its synth-chimes, Sand Swish, separate lid-close and other legacy mappings are not the current build.

## Mapping and actual triggers

All current mappings come from `scripts/prepare-assets.mjs:92-106`. All play at rate 1. WAVs retain their source amplitude, are mixed to mono and encoded at 96 kbps (`scripts/prepare-assets.mjs:143-180`).

| Runtime slot | Supplied WAV | Base volume | Current trigger |
|---|---|---:|---|
| bgm | Relaxing Lo-Fi Audio Extracted | 0.8 | First genuine pointerdown; continues through gameplay, then fades at end card. |
| sfx-conveyor | Conveyor Audio Extracted | 0.9 | First genuine pointerdown; continues even when belt is empty. |
| sfx-cut | Falling Sand Audio Extracted | 0.8 | A successful swipe releasing sand, or at least eight grain moves in the picture. Sustained while activity persists. |
| sfx-sand | Source Prop Salt Pour Big Shaker Grains Sand Falling Heavy 01 Audio Extracted | 0.85 | Moving funnel sand or any belt/incoming/bucket-drop transport grains. Continues during belt-only transport. |
| sfx-click | click_128kbps Audio Extracted | 0.8 | Once per pending successful tap/stroke, after actual picture movement reaches eight grain moves within a 400 ms window. |
| sfx-bells | star Audio Extracted | 0.9 | At the bucket's zero-count/completion callback. |
| sfx-woosh | StoneSlide01 Audio Extracted | 0.55 | Together with star at the same bucket completion callback. |
| sfx-win | OhmLab_Bubble-Pop Audio Extracted | 1 | End-card reveal at relative 0 ms and 233 ms; not a separate gameplay victory jingle. |
| sfx-endcard | bubble-pop Audio Extracted | 1 | At the end-card logo tween's completion, approximately 500 ms after reveal. |
| sfx-cta | Digital Click 1 Audio Extracted | 0.9 | Accepted explicit CTA tap; not the automatic store attempt. |
| sfx-fail | Danger Alarm Audio Extracted | 0.4 | Real jam or soft-lock failure, not a time/click cutoff or successful completion. |

Source references: `src/audio.ts:141-155`, `src/audio.ts:195-219`, `src/scenes/GameScene.ts:268-271`, `src/scenes/GameScene.ts:396-400`, `src/scenes/GameScene.ts:599`, `src/scenes/GameScene.ts:694-709`, `src/scenes/GameScene.ts:955-968`, `src/scenes/cta.ts:71-96`, `src/scenes/cta.ts:169-175`, `src/game/BucketRack.ts:606-611`.

Opening/wave lid lifts do not have a separate sound callback wired in `GameScene`; neither do the later lid impact and bucket fling callbacks. Bucket completion already plays both layers before those visual stages. Praise words and a fully solved state have no additional audio beyond the existing bucket/transport/end-card cues.

## Differences and uncertainties against the mockup

- The reference audio contains signal from the start (`signal-features.json`, first 50 ms RMS about 0.014), whereas the playable deliberately starts silent and unlocks after input. Therefore its opening cannot match the video before user interaction. HTML5 fallback also retains Phaser's native restriction: a moving first swipe can remain locked until a stationary tap; the latest probe records that behavior.
- The playable follows player activity, physical sand motion, bucket counts and end-card state. It does not follow the reference's fixed 59-second clock. The two 90-second builds can therefore use matching mechanic cues at different absolute times.
- The new envelopes intentionally alter boundaries: 100 ms attack/recovery, 120 ms activity hold, 220 ms release, up to 240 ms complementary EOF overlap, and a 500 ms music release at the end card. Repeated WebAudio beds skip detected near-silent recording heads/tails. HTML5 fallback lacks decoded sample bounds and repeats the full clip.
- The supplied Relaxing Lo-Fi source's exact identity against the reference remains unconfirmed, explicitly documented at `scripts/prepare-assets.mjs:94`. Correctly embedding it does not prove the video's background music or its final mix level is matched.
- The current base volumes are confirmed in both builds, but exact reference mix gains, panning and EQ have not been established by this source/build audit. Conversion to mono and MP3 also prevents byte identity with the original recording.
- Dense reference contact sheets show the appropriate visual stages (opening lids, zero-count completion, end-card icon/logo/button), but those images alone cannot prove sound identity or exact audio onset. The old broad-library correlation reports are not evidence for the newly supplied WAV identities.
- No fail event is visible in the sampled reference run. The alarm is an added supported game mechanic, not a cue that can be verified against that winning reference run.

No production source or existing assets were changed for this review.
