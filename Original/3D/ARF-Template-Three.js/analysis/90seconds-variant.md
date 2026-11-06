# 90-second variant — 2026-10-30

The user requested a 90-second version instead of unlimited `full` to allow more time for a clear. `scripts/build-all.mjs` now produces `3clicks`, `10clicks`, `60seconds`, and `90seconds`, eight networks each. `full` is no longer produced. Existing board, cannon queues, speed, overload rules and early-win behavior are unchanged.

The 90-second timer starts on the first accepted launch, freezes under existing lifecycle pause, ends immediately on clear or overload, and times out after 90 active seconds. Custom-level builds now explicitly use 90 seconds and matching filenames. `npm.cmd run dev:90` selects Vite's 90seconds preview mode; ordinary `dev` and standalone `build` retain 60 seconds. A review server was started at http://127.0.0.1:5190/.

Validation:
- 11 session tests pass, including idle-before-launch, paused timer, timeout at 90, and controlled clear at 70 seconds followed by endcard.
- Muted Chromium dev preview confirms initial duration 90, first native launch starts countdown, and document hide/resume pauses/resumes it. No page errors (`evidence/90seconds-preview.json`).
- `npm run build:all` passes TypeScript and packaging for 32 outputs. `dist/90seconds/` has exactly eight outputs; no `dist/full/` remains. 90-second raw HTML sizes range from 3,881,516 to 3,882,803 bytes. Google, Mintegral and Vungle ZIPs contain only root index.html. Build report: `evidence/network-builds.json`.
- Local packaged AppLovin 90-second smoke passes boot, muted media playback, portrait/landscape resize, selected CTA and host pause. Host callbacks are mocked (`evidence/delivery-browser.json`), not official host certification.

A complete human-paced winning run within 90 seconds was not verified; extra time does not establish board solvability or guarantee a win. Physical devices and official host validators remain unverified. No gameplay balancing changes were made.
