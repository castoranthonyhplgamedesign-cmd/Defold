# Mockup audio identity recheck

Read-only verification of supplied sounds against `sdp_cantreach_sandshovel_59s_1080x1920.mp4`. No source, asset or gameplay settings changed. This is waveform/playback-state evidence, not listening or a perceptual mix approval.

Nine supplied SFX have supporting sample-aligned matches in the actual reference:

| Sound | Fresh evidence |
| --- | --- |
| Conveyor | Five separate seven-second source windows align to video with the same 21.406 ms offset. Quiet under the music; stable component gain and exact alignment support identity despite low whole-mix correlation. |
| Falling Sand | The source's 0.6–1.2 s section matches repeated events at source start offsets 14.888, 16.988, 25.221 and 36.088 s. Highpass correlation reaches 0.52. Actual runtime MP3 reaches 0.54. |
| Salt shaker / pouring sand | Adjacent source sections independently align at 5.688, 31.088, 35.321 and 39.555 s. Actual runtime MP3 correlation reaches 0.41. |
| click_128kbps | Repeated exact starts; highpass correlation 0.77 at 41.888 s and 0.73 at 10.955 s. |
| star | Repeated bucket events; highpass correlation reaches 0.89. |
| StoneSlide01 | Repeated events align to the same starts as star; full-waveform correlation reaches 0.60. |
| OhmLab_Bubble-Pop | Two end-card events at 54.721 and 54.955 s, 233 ms apart; correlation 0.99 after highpass. |
| bubble-pop | Event at 55.221 s; correlation 0.99. |
| Digital Click 1 | Event at 56.621 s; correlation 0.97. |

The supplied **Relaxing Lo-Fi BGM remains unconfirmed**. Native-speed seven-second windows produce only weak, inconsistent matches (maximum absolute correlation about 0.10). Source repetition is about 5.854/11.707 s while the video's repetition is about 5.647/11.294 s; a narrow 85/82 speed test still fails to establish the same recording. Do not retune the game based solely on that periodicity lead.

The supplied **Danger Alarm is not established in this winning reference run**. Its strongest broad correlation is weak and does not survive frequency filtering as a convincing event. This does not establish its absence in other creatives or failure paths.

**Sand mix check:** use the browser-decoded runtime MP3s, not the crude downsampled original WAVs, for relative gain. Repeated pouring sections need estimated reference component gain about 0.80–0.92 versus current base 0.85, so there is no supported large pouring-volume mismatch. Falling Sand reference estimates are usually 0.86–0.99 versus current base 0.80, roughly 0.6–1.8 dB lower in the playable for those sections. These mixed-track regression estimates do not measure perceived loudness, and fades/overlap change instantaneous levels.

An initial WAV-based pouring estimate suggested excessive volume; it was rejected because simple box-filter downsampling aliases the noisy WAV. The actual runtime MP3 comparison supersedes that estimate. Conversion amplitudeGain fields in the JSON are explicitly marked non-calibrated and must not be described as MP3 level loss.

Evidence: `source-identity.json`, `source-identity-highpass-500.json`, `runtime-level-comparison.json`, `bgm-rate-check.json`, `supplied-bgm-periodicity.json`. The fresh browser reference decode is byte-identical to the earlier reference PCM, as recorded in `decoded-current.json`.

Both current 90-second AppLovin builds embed all eleven current runtime MP3s byte-for-byte with matching source configuration. Fresh muted browser checks passed for the tap full clear (31 completed buckets) and swipe flow, including bucket cues, silent invalid input, held cutting, end-card pop ordering, and accepted CTA clicks. See `current-source-built-audio-audit.json` and `qa-current-build.json`.

The playable deliberately follows player activity rather than the reference's fixed 59-second clock. Audio begins after the first gesture; the requested 100 ms attack, 220 ms release and 240 ms loop crossfade also change boundaries. These checks establish matching sound identities and mechanic stages, not a sample-for-sample recreation of the complete video mix.
