# Comparison checklist

Baseline: `cantReach` / `8a241d35af7e59acaa1aa092505dafab9db7ea40`. Target: local HTML5/WASM.

- [x] Build and boot without Lua/JavaScript errors.
- [x] Original SandGrid oracle: all 18 tap/cut static and moving-grain snapshots/checksums match exactly.
- [x] Tap eligibility and swipe motion threshold/press counting verified by Lua and browser checks.
- [x] Five- and ten-click limits; real browser 90-second timer starts on first eligible interaction (90,157 ms wall time).
- [x] Sand conservation, bucket reservation integrity, all three waves and real complete solve: 31 buckets, all 31,752 grains accounted for.
- [x] Jam and stall watchers exercised with saturated-conveyor fixtures; win, limit, time and fail end-card flows pass Lua checks. Browser checks cover natural solved/limit/time endings.
- [x] Portrait/landscape framing and mid-session rotation; authored-coordinate rendering preserves simulation state.
- [x] Default HD picture, frame, buckets, reveal, hand, praise, cut and end card inspected from captures. Upper painting comparison has mean absolute RGB error 0.102/255 in the measured 270×90 region; this is not a whole-frame parity score.
- [x] Original audio bytes and cue mapping retained; browser gesture unlock and lifecycle pause/mute/resume verified. Original sustained-audio algorithm retained through a WebAudio adapter.
- [x] Local CTA/lifecycle/analytics behavior tested; loopback records redirects without navigating.
- [x] Servers verified listening only on 127.0.0.1:8181 and :8182.
- [x] Original Git status remains clean; implementation and documentation committed; QA evidence recorded.
- [ ] Full audio/animation equivalence across every source configuration, including physical devices and official SDK previewers. No parity exception is claimed as approved.

Physical iOS/Android performance and official ad-network submission validation require device/network testing and are not covered by desktop browser QA.

Evidence: `qa/unit-results.txt`, `qa/oracle.json`, `qa/browser-results.json`, `qa/browser-long-results.json`, `qa/reference/`, and `qa/defold/`. Historical boot failures retained in `qa/history/` were fixed before the final eight-case browser pass.
