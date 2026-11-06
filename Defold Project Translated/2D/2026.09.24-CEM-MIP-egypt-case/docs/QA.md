# Final local QA

**27 checks passed; 0 failed.** Original repository remains clean and its asset hashes match the recorded baseline.

Tested code commit: `760495f4831caf8fe8a1aae6cda170b896e3e213`. Defold HTML5 release build, engine revision `d295ed4edff2e49072719835713e625f409849f1`.

Local preview: http://127.0.0.1:8174/dist/

Delivery: 24 self-contained HTML variants and 9 ZIP packages. Largest HTML: **4,349,141 bytes**, below the 5,000,000-byte limit. ZIPs contain exactly one `index.html` matching the corresponding HTML.

## Executed checks

| Check | Result |
|---|---|
| Static export contract: all 24 variants | PASS |
| Full gameplay: outside drop, wrong circle, six correct placements, analytics and CTA | PASS |
| 2clicks counts only unsolved portrait presses | PASS |
| 4clicks counts only unsolved portrait presses | PASS |
| Solved portraits do not count or drag | PASS |
| Visual reference and input 390x844 | PASS |
| Visual reference and input 844x390 | PASS |
| Visual reference and input 768x1024 | PASS |
| Visual reference and input 1024x768 | PASS |
| Opening and idle tutorials; pause/resume and mute | PASS |
| Rotation preserves solved state and active motion | PASS |
| Config: dotted keys, deep merge, keyed slots and mute | PASS |
| Rapid taps are preserved between rendered frames | PASS |
| GZip fallback starts without DecompressionStream | PASS |
| Touch drag and high DPI input | PASS |
| Keyed texture replacement loads and preserves gameplay identity | PASS |
| Rotate during opening tutorial and end-card entrance | PASS |
| Desktop frame timing observation | PASS |
| Published applovin SDK route | PASS |
| Published google SDK route | PASS |
| Published ironsource SDK route | PASS |
| Published mintegral SDK route | PASS |
| Published facebook SDK route | PASS |
| Published unity SDK route | PASS |
| Published vungle SDK route | PASS |
| Published moloco SDK route | PASS |
| No browser errors or unexpected external asset requests | PASS |

The initial full matrix passed 26 checks and exposed 1 local-preview variant issue. After the fix, 6 affected checks were rerun successfully. The consolidated report retains that history; unaffected passing checks were not repeated.

## Visual evidence

| Viewport | Mean absolute RGB difference (0–255) | Comparison |
|---|---|---|
| 390 × 844 | 1.144, 1.048, 0.924 | `qa/evidence/comparison-390x844.png` |
| 844 × 390 | 0.457, 0.310, 0.201 | `qa/evidence/comparison-844x390.png` |
| 768 × 1024 | 0.538, 0.407, 0.335 | `qa/evidence/comparison-768x1024.png` |
| 1024 × 768 | 0.355, 0.225, 0.174 | `qa/evidence/comparison-1024x768.png` |

Metrics quantify raster differences; they do not establish client acceptance. The same original artwork, font, positions and rules are used. The comparison image contains original, Defold, and a four-times-amplified difference. Gameplay captures disable the hand tutorial in both versions to compare the same stable state; tutorial states are captured separately.

Recordings: `qa/evidence/reference-gameplay.webm` and `qa/evidence/defold-gameplay.webm`. They cover the opening hint, a wrong drop, correct placements, clue strikes and completion. Videos are intentionally silent; audio decoding, unlock, mapping, mute and host-volume behavior are checked separately.

Raw results: `qa/evidence/report.json`, `visual-comparison.json`, `build-info.json`, and `build-manifest.json`. Earlier failed development snapshots are historical and are superseded by this report.

## Scope and remaining external acceptance

- QA ran on Windows in headless Chrome with SwiftShader. The frame-timing observation is a desktop diagnostic, not certification of mid-range Android or iPhone FPS.
- All eight SDK routes were tested with local mocks. Live ad-network validators and real container behavior have not been exercised.
- No physical iPhone/Android test or client approval is claimed. The desktop/local workflow is complete; those external checks remain part of production acceptance.
- Only HTML5 is the delivery target tested here. Native editor previews reuse the converted art and fonts; browser-specific audio/SDK behavior is implemented in the HTML5 bridge.
- Hosting is bound to 127.0.0.1. No remote hosting, Git push, or production publication was performed.
