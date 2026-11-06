# Arrow Flow audio verification â€” 2026-10-22

## Implementation and provenance

**Latest input policy, 2026-10-29:** the user changed gameplay and click counting to `pointerdown` / `touchstart`. This supersedes the release-triggered policy described in the historical entries below. `AudioPools.start(token, action)` activates the token, executes the action and its immediate accepted/full-meter cue synchronously, then primes spare voices. Release retains native-boundary audio recovery and cleanup without another gameplay action. Blocked feedback still emits its cue at animation contact. Movement/cancellation after a press does not undo the accepted action.

The 120-test suite passes, including immediate cue ordering before spare priming and recovery of an unsettled press cue on release without repeating gameplay. `tools/press-input-smoke.mjs` passes real mouse input and native touch emulation against the input and session modules: counters increment while held, release does not double-count, three presses reach the endcard, empty space/right click are ignored, and cancellation/multi-touch/disposal preserve token ownership. See `evidence/press-input-browser.json`. Physical-device audibility remains unverified; no audio diagnostics were added to production.

All 32 output packages (eight networks across four lengths) were rebuilt and passed the updated `tools/delivery-smoke.mjs` in muted installed Chrome. Each packaged fixture verifies `CHALLENGE_STARTED` and an audible-mode media request while the mouse remains down, before sending pointer-up; it then checks actual browser media playback, resize, selected-host CTA and pause. Results are in `evidence/delivery-browser.json`. These controlled host callbacks and browser media events are not official-host acceptance or physical speaker evidence.

**Confirmed inspected:** `src/audio/pools.ts`, `sounds.ts`, `input/taps.ts`, `main.ts`, `core/cannons.ts`, `networks.ts`. Rules applied from root `IOS_SFX_GUIDELINES.md`; no external audio implementation was required. Source cues inspected in `extracted/modules/GameManager.ts.js` around lines 222,244,257,284,299.

All voices are persistent HTMLAudioElements allocated before gameplay input. Sources are byte-identical supplied stereo PCM WAVs: total **351,402 bytes**, embedded as `audio/wav`. No transcode was adopted without an audible comparison. Asset IDs, hashes and paths are in `evidence/audio-assets.json`; `scripts/prepare-audio.mjs` reproduces the copies.

| Cue | Trigger | Voices | Media gain | Source duration |
|---|---|---:|---:|---:|
| select | Accepted launch, synchronously in native release | 4 | 1/3 | .161020408 s |
| wrong | Blocked animation contact after approach; full-meter rejection remains on native release | 4 | 1/3 | 1.044897959 s |
| shoot | Actual block destruction / ammo consumption | 16 | 1 | .075260771 s |
| slidey | Cannon removal / queue advancement | 8 | .5 | .686349206 s |

**Confirmed source:** relative gains 1:1:3:1.5. **Authored adaptation:** normalize all by three to remain within media volume 0â€“1; perceived loudness equivalence is **Unknown**. Counts cover four simultaneous input cues, eight closely spaced replacement tails and a burst of sixteen destruction cues. Excess requests drop the newest sound without pausing another voice or blocking gameplay. These counts are implementation tuning, not source constants. No BGM, win or endcard cue is added.

## Recovery and lifecycle

- One selected native touch/pointer family, unique accepted-input tokens, actual target matching, outside-release/cancel/blur/resize/context-loss cleanup. Touch input ignores compatibility pointer-capture loss.
- Down primes idle future voices. Release requests its due cue first, recovers older eligible requests on the same element without rewinding, retries unsettled primes, then ends that token. Newly requested release cues are not immediately retried again.
- Per-voice generations prevent obsolete prime/play settlements from pausing newer cues. Promise fulfillment and observed `playing` are distinct. Already observed playback survives a stale rejection.
- Pending freshness 350 ms, move retry interval 100 ms, stalled-start reclamation 1,500 ms. A 500 ms maintenance interval reclaims stalled work; it never issues timer-driven retries. Actual cues are requested immediately.
- Initial media metadata/font/image readiness is bounded at 1.5 seconds. Cold or failed priming never suppresses a real cue attempt. Silent preparation succeeds only through a media event/promise, not immediate play/pause guessing.
- Document, selected host and context-loss gates pause/mute every detached pooled voice and invalidate pending work. Resume never restarts old one-shots. Valid one-shot tails survive ordinary release; delayed hits use the same preallocated voices after the gesture ends.
- No audio logs, trace globals, diagnostic controls, unlock screen, extra audio library or Web Audio engine in production. Instrumentation exists only in test harnesses.

## Evidence

**Confirmed automated:** six controlled-media tests cover persistent ownership/promotion, simultaneous voices, quick release, stale reject, fulfilled-without-playing recovery, no rewind after playing, hidden cancellation, delayed cues, token independence, expiration, unsupported format and bounded overflow. Native mouse and emulated touch fixture also verifies two accepted fingers, compatibility capture loss, outside targets and cancellation.

**Confirmed browser signals:** all eight packaged files create 32 voices before input, make no startup play calls, decode all four durations and produce audible-mode `playing` events after accepted native input. Output is muted by Chromium's `--mute-audio` flag. Exposure/document hiding pauses and mutes all 32 elements. See `evidence/delivery-browser.json`; this proves browser media behavior, **not speaker audibility**.

| Environment | Result / limit |
|---|---|
| Windows headless Chromium | Packaged media, native input and lifecycle checks passed; exact browser version recorded in JSON |
| Controlled fake-media tests | Passed covered race/recovery scenarios; no browser permission claim |
| Safari / WebKit | Not run; WebKit binary unavailable in this environment |
| Physical iPhone / iPad / Android | Unverified; no connected physical device or listening observation |
| Actual eight-network WebViews | Unverified; local host callbacks are controlled fixtures |
| Perceptual onset, mixing, normalized gains | Unverified; original files retained to avoid unverified encoding changes |

No assertion of universal iOS authorization or device audibility is made. The earliest accepted/blocked tap, rapid overlap and delayed hits with no subsequent gesture still need listening checks on the intended devices and hosts.

## Contact-timed blocked cue update, 2026-10-22

The user explicitly requested the blocked sound wait for the animation. `Simulation.onBlockedContact` now emits once when elapsed feedback time reaches its actual approach/contact boundary. `main.ts` requests the existing wrong pool there, with no timer or stale gesture token. The accepted-launch and full-meter cues remain synchronous native-release cues. All voices still exist and receive silent priming attempts before delayed use. No media pool implementation, sound asset or production diagnostic was added.

**Confirmed automated:** the 52-test suite includes contact-event deduplication, pause/resume before contact, and real simulation plus controlled media proving no audible-mode request at release or while paused, followed by one request at contact after release. Two red-pulse peaks and an intervening zero-opacity point are independently checked.

**Confirmed packaged-browser request timing:** muted Chromium native mouse and emulated touch each requested one wrong cue 40 ms after the selected short-approach blocked tap, and zero on the release itself (`evidence/milestone-4-gameplay-browser.json`). This measures request scheduling for that arrow, not speaker onset or a universal 40 ms delay. Longer approaches use their own contact time. Physical-device playback of this newly delayed earliest cue remains **unverified**; a rejected delayed request still cannot gain fresh native authorization by waiting.

### Custom arrow grid - 2026-10-27

Custom cell sizes (0.5 to 1.5) scale blocked movement/contact geometry. The existing contact event still triggers blocked SFX after approach; no native input ownership, media pools, cue mapping or playback safeguards changed. Core tests cover contact timing and one contact per blocked action at 0.5, 0.75 and 1.5; the existing audio regression suite passes. Chromium authoring/packaged checks were muted. Physical iPhone/iPad/Android audibility and official-host playback were not checked for this extension.

### Mockup board alignment - 2026-10-28

Imported-board rendering, ray-picking height and tutorial targeting now share the recessed board pose. Muted Chromium verified native launch from the adjusted tutorial target with the original 1.25 layout. Existing audio regression tests pass within the 99-test suite. No native event ownership, audio pools, cue timing or lifecycle behavior changed. Physical-device and target-host audibility remain unverified.

### Overload cannon queues - 2026-10-28

The overload scenario now gates cannon updates until its first accepted launch, so preloaded white blocks do not trigger pre-gesture firing or replacement cues. New white cannons reuse the existing hit and replacement events and prepared audio pools; no audio/input/SDK implementation changed. The 109-test suite includes existing audio regressions and idle/no-shot checks. Muted Chromium verifies the native opening tap, center white batch, cyan clear and right white replacement, plus a single-file overload boot. These are core/browser observations, not evidence of audible playback. Physical iOS/Android and target-host audibility remain unverified.

Follow-up: restored flowing launch presentation and moved the center white cannon behind Yellow 6. Updated core/browser checks verify all active starters are colored and the right white batch fires only after Cyan 4 is depleted. Cue mapping, persistent pools and native input ownership are unchanged; the 109-test suite passes. Physical audibility remains unverified.

### User-supplied BGM - 2026-10-29

This update supersedes the earlier no-BGM baseline. The original root `BGM.wav` is unchanged (SHA-256 in `evidence/bgm-asset.json`). It is 46.075964 seconds of stereo 44.1 kHz PCM. The full 96 kbps MP3 produced a 4,398,096-byte staging HTML, exceeding the configured 4,000,000-byte ceiling. The user chose a shorter loop to preserve that ceiling.

**Confirmed asset:** `src/assets/audio/bgm.mp3` uses the first 18 seconds, stereo 44.1 kHz, constant 96 kbps, 216,965 bytes. `scripts/prepare-bgm.mjs` reproduces it with FFmpeg, applying 0.2-second fades at both ends and -24 dB asset attenuation. Runtime gain is 0.5 (another approximately -6 dB). Original source measurement: mean -11.8 dBFS, peak -0.1 dBFS. The conservative mix puts its peaks below the existing SFX peaks; perceptual balance and the musical join require listening verification. The fades soften the join; they do not prove beat alignment or gapless playback on every host.

**Implemented behavior:** one persistent looping element is created with the existing 32 SFX voices before input. No startup play request. The first non-ignored arrow press selects music, after immediate due SFX and before spare one-shot priming. The same element continues through normal release, further taps and the endcard. Hidden/host-paused/muted state pauses it and preserves playback position; allowed resume reuses that element. Rejected starts retry at native boundaries with bounded move retries. Generation guards prevent stale callbacks from reviving paused/disposed playback. Old one-shots never resume with the music.

**Confirmed checks:** TypeScript passes; all 139 tests pass, including four new music tests covering cue ordering, repeated taps, release recovery, rejected starts, stale callbacks, unsupported format, lifecycle mute, position preservation and disposal. `tools/bgm-smoke.mjs` used muted local Chrome and native input to observe 33 voices, no startup calls, 18-second decoding, audible-mode playing events, document-hide pause, position-preserving resume, mute/unmute and looping (`evidence/bgm-browser.json`). Output was silenced with `--mute-audio`; this is browser media evidence, not an audition.

**Confirmed build:** `npm run build` passes single-file validation at 3,949,205 bytes, leaving 50,795 bytes below the 4 MB ceiling. The original WAV is not shipped. Eight-network delivery packages were not rebuilt or submitted for this BGM change; their smoke fixture now expects 33 voices.

**Unverified:** physical iPhone/iPad/Android, official ad-host playback, speaker/headphone loudness and musical loop quality. No new production diagnostics or dependencies were added.

### Win cue and file organization - 2026-10-29

The user supplied `sfx_win.mp3`; it was moved byte-for-byte to `src/assets/audio/sfx_win.mp3` (original hash in `evidence/file-organization.json`). FFprobe confirms stereo 44.1 kHz, 96 kbps MP3, 1.814308 seconds and 22,614 bytes. Its measured peak is 0 dBFS and mean -20.7 dBFS. Runtime gain is 0.15 (approximately -16.5 dB); the existing music gain is unchanged. This is a conservative authored mix, not a listening result.

One preallocated win voice joins the existing 33 voices and receives normal native-gesture priming. `main.ts` requests it once when `Session.onEndcard` runs with `ended === 'clear'`. Failure, timer expiry, tap-limit endings and the debug endcard shortcut do not trigger victory audio. Normal lifecycle handling cancels the cue on hide and does not replay it on return. The existing game-end store redirect remains unchanged and may interrupt the sound in a real host.

**Confirmed automated:** all 139 tests and the preview build pass. Muted Chrome observes one audible-mode request and playing event on a controlled board clear, none on controlled timeout or an actual belt-overload failure, no cue consumption while the endcard is paused before presentation, and no repeat on hide/show. This uses native input followed by controlled state for clear/timeout; it is not a complete winning playthrough. See `evidence/win-screen-browser.json` and `tools/win-screen-smoke.mjs`. Editor import of the relocated active level and its Three preview also passed.

The preview HTML is 3,979,497 bytes, 20,503 bytes below the 4 MB limit. Network packages were not regenerated or submitted. Physical-device listening, loudness balance, and actual-host audio/redirect interaction remain unverified.

The original music source is now `reference/audio/BGM.wav`; `scripts/prepare-bgm.mjs` uses that path. Supplied references and all four moved level JSON files were hash-verified unchanged. Root file count went from 26 to 13; no user input or historical evidence was deleted. `README.md`, `reference/README.md`, `levels/README.md`, and `analysis/README.md` describe the folder map. Older dated reports may still mention former root paths.

### Exact texture budget adjustment - 2026-10-29

The approved shorter BGM excerpt is now 15 seconds (180,916 bytes), retaining stereo 44.1 kHz, 96 kbps, -24 dB asset attenuation, runtime gain 0.5 and 0.2-second edge fades. This offsets the lossless cannon texture cost and keeps all eight finalized network staging HTML files below 4,000,000 bytes. The original WAV is unchanged. This supersedes the earlier 18-second value; the interim 16-second excerpt left Unity slightly over budget.

Muted Chromium verification passed with 34 persistent voices, 15-second decoding, no startup play calls, first-input start, hide/resume, mute handling and looping; no browser errors (`evidence/bgm-browser.json`). These are media-state checks, not listening verification. Physical-device playback, perceived mix and musical loop quality remain unverified.

### Fail-state sound - 2026-10-29

The supplied `src/assets/audio/sfx-fail.mp3` is used unchanged: SHA-256 F316860C4D16982CEE1059B3E14549AEEA18CF8F9267CC87F26AD860CD1E65F1, 12,140 bytes, stereo 24 kHz, 64 kbps MP3, 1.417167 seconds. Measured mean -16.1 dBFS and peak -1.3 dBFS. Runtime gain is 0.15, matching the win cue setting; perceptual balance is not auditioned.

A dedicated single fail voice is allocated with the other sounds before input (35 total persistent voices). `session.onEnd` requests it immediately and only for reason `fail`, then forwards the unchanged network completion notification. This precedes the 0.6-second endcard delay. It does not play on clear, timeout, tap-limit or technical-failure paths. Existing pool priming, cancellation and lifecycle safeguards apply; no production diagnostics or new playback system were added.

Confirmed: 22 focused audio/session tests pass. Muted Chromium observed a single request and playing event on an actual overload, before endcard presentation, none on controlled clear/timeout, and no replay after hide/show. The cue is paused on hide. Evidence: `evidence/result-audio-browser.json`; extended `tools/win-screen-smoke.mjs`. These are browser media observations, not physical audibility. The existing editor import/preview smoke also passed.

The added asset pushed Unity just beyond the 4 MB budget. The previously approved shortened BGM excerpt is now 14.9 seconds, retaining 96 kbps and existing fades/gains; its source WAV and fail MP3 are unchanged. Muted BGM start/pause/resume/loop checks pass with 35 voices. TypeScript and preview build pass at 3,997,336 bytes. Eight finalized staging HTML files pass at 3,997,296–3,998,583 bytes (`evidence/fail-audio-network-sizes.json`). Delivery ZIPs/all iterations were not regenerated; remaining budget is very tight.

Physical iPhone/iPad/Android, actual-host playback and listening remain unverified. The existing endcard store redirect occurs 0.6 seconds after failure and may interrupt this 1.42-second cue in a real host; no redirect/timing behavior was changed.

### Continuous BGM loop edit - 2026-10-30

Replaced the faded 14.9-second excerpt with a 7.68-second cyclic edit. Source energy-envelope correlation peaks at a 7.68-second repeat (0.9283); the selected 0.48-second passages beginning at 3.72 and 11.40 seconds have mono 8 kHz waveform correlation 0.9889 and RMS ratio 0.9953. These measurements support matching passages, not a listening claim.

The exported cycle begins at source 4.20 seconds, plays through 11.40, then linearly crossfades source 11.40–11.88 into 3.72–4.20 over 0.48 seconds. Its ending thus leads into its beginning. Removed the fade-to-silence at both ends. Linear complementary gains suit the strongly correlated passages and avoid boosting their shared signal. The original WAV, runtime gain, -24 dB attenuation, 96 kbps encoding and persistent HTMLAudioElement playback strategy remain unchanged.

`scripts/prepare-bgm.mjs` reproduces the edit and checks bitrate, duration, non-silent edge windows and decoded MP3 sample discontinuity at the wrap. Maximum boundary step is 0.000465 full scale (left) and 0.000373 (right); both pass the 0.005 guard. Output is 92,831 bytes, stereo 44.1 kHz, 7.680 seconds (`evidence/bgm-asset.json`). This is waveform evidence, not proof of gapless output in every browser or host.

TypeScript and single-file preview validation pass: 3,881,560 bytes. Original-source SHA-256 remains unchanged. Network delivery packages were not regenerated. Physical-device and host listening, including MP3 looping behavior, remain unverified.

Muted Chromium verification passes: 35 prepared voices, no startup requests, first-input playback, hide/resume and mute handling, plus three natural loop wraps without pausing or errors (`evidence/bgm-browser.json`). Observed wrap intervals were approximately 7.739 seconds versus the 7.680-second asset; this media-clock observation includes browser restart/sampling overhead and does not establish sample-accurate output. The baked audio join is continuous, but audible browser/host loop gaps still require listening verification; no runtime dual-player or Web Audio workaround was introduced.

### Win cue before store redirect — 2026-10-30

Confirmed cause: `main.ts` requested the win cue and automatic store open synchronously inside the same `onEndcard` callback. A host transition could therefore hide/pause the creative immediately after the cue request.

Moved the win cue to the actual `onEnd('clear')` event. Clear now uses `sessionTuning.winEndcardDelay = 2.2` active seconds before `onEndcard` opens the store and presents the endcard. The supplied win asset is 1.814308 seconds; the extra interval provides playback startup headroom. Fail and timeout retain the existing 0.6-second delay. This is a bounded authored delay, not an indefinite wait for media authorization or a media event. Hidden/host-paused time does not advance it. A cue interrupted by hiding is canceled normally and is not replayed on resume. Full-screen repeated endcard taps remain available.

Confirmed automated: 24 focused audio/session tests and TypeScript pass. Tests cover clear notification before endcard, 2.2-second wait, hidden-state suspension, exactly-once completion, unchanged timeout delay and 90-second early-win behavior. Muted Chromium with a controlled board clear records one win request at 4770.6 ms, its media ended event at 6636.0 ms and the stubbed store open at 7016.9 ms: approximately 381 ms after completion. Win plays neither on timeout nor actual belt-overload failure; hide/show does not replay it. Browser errors: none. Evidence: `evidence/result-audio-browser.json`; extended `tools/win-screen-smoke.mjs`. Hidden-before-completion checks and editor preview also pass.

Standalone preview rebuilt at 3,881,644 bytes. Physical speaker output and official host playback remain unverified. A fixed 2.2-second interval cannot guarantee completion under arbitrary media startup stalls; existing prepared voices and rejection safeguards remain unchanged. The store redirect itself was preserved as previously requested.

All 32 network delivery packages were regenerated with this change and passed the packaging audits; maximum raw HTML 3,882,891 bytes. Build report: evidence/network-builds.json. These are local build checks, not official host certification.


## 2026-10-30 original warning pulse

Added an original synthesized 240 ms / 96 kbps mono cue (`src/assets/audio/warning-pulse.mp3`), using two persistent pooled voices at gain 0.22. The supplied `sfx_warn.mp3` remains unchanged and was inspected only for metadata; no reference samples were reused. The warning and red-vignette crest share the active-session clock, with no audible pre-gesture playback. Dropping below 95% fullness or ending the game cancels only warning voices; host pause/mute uses the existing global safeguards.

149 automated tests and typecheck passed. Muted headless Chrome confirmed actual media starts, pulse cadence, hide/resume behavior, threshold cancellation and reduced-motion/landscape behavior. No page errors. Evidence: `analysis/evidence/warning-browser.json`, `warning-asset.json`, `warning-build.json`, `warning-tests.txt`. The standalone preview passed the single-file audit; network delivery packages were not regenerated. No shipping audio diagnostics were added.

Speaker audition, physical iPhone/iPad/Android, Safari and official-host audibility remain unverified. Measured gains do not prove subjective balance. Details and source provenance: `analysis/warning-audio/README.md`.


### Warning revision using OnWarning.wav ? 2026-10-30

The user rejected the initial cue and supplied `OnWarning.wav`. Measured its two low harmonic bursts and fading tail; no listening-based comparison is claimed. Replaced the asset with an original 460 ms double-buzzer (98 Hz foundation, stronger harmonics, soft saturation, short reflections), with no reference samples reused. Both references remain unchanged. Runtime warning scheduling, gain 0.22, two prepared voices and lifecycle behavior are unchanged.

Fresh muted Chrome checks pass for decoded duration, playback, pulse timing, pause/resume, threshold stop and landscape/reduced-motion behavior. Standalone build and package audit pass at 3,892,204 bytes; MP3 is 6,314 bytes. See `analysis/evidence/warning-asset.json`, `warning-build.json`, `warning-browser.json`, and `analysis/warning-audio/onwarning-analysis.json`. The prior full test run applies to unchanged runtime code; no claim of a new full-suite run. The exported duration fits the existing two-voice pool at the fastest 300 ms interval. Physical speaker audition and network delivery rebuild remain pending.


### Revised warning delivery rebuild ? 2026-10-30

Rebuilt all 32 packages for the eight networks and four requested lengths (`3clicks`, `10clicks`, `60seconds`, `full`). No 90-second output. All static packaging/ZIP audits passed, and the exact revised 6,314-byte MP3 was verified in every HTML payload. Maximum HTML: 3,893,484 bytes; ZIP range: 1,533,635-1,533,767 bytes. The 60-second AppLovin packaged browser smoke passed with 37 prepared voices, real media progress, rotation, CTA and pause checks; the host callbacks were mocked and output muted. Other hosts were not re-tested in-browser during this asset-only rebuild. Evidence: `analysis/evidence/warning-delivery-build.json`, `network-builds.json`, `delivery-browser.json`. Physical audibility and official host validation remain unverified.
