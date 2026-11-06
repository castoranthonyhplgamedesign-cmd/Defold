# Full-screen repeatable endcard CTA — 2026-10-30

The endcard now routes clicks from its whole container through one parent handler. Removed the icon's separate click listener, so tapping the logo bubbles into that same handler without dispatching twice. Empty background, title and logo all route to the selected host CTA. No one-use latch or cooldown was added: each further intentional tap can open the destination again. Existing host readiness/visibility gates remain in effect.

The full-screen hit area uses the endcard's existing absolute inset:0 bounds, so it follows both orientations and the actual preview container. A pointer cursor communicates clickability. Logo keyboard activation and focus behavior remain available. The wrapper explicitly invokes install() without forwarding the DOM MouseEvent into triggerCTA's automatic-redirect flag. Existing automatic game-end redirect behavior is unchanged.

Validation: TypeScript and eight network-unit tests pass, including repeat invocation of selected adapters. Muted Chromium scene/session checks pass across 14 sizes (seven portrait/landscape pairs): all four corners, title, logo, two repeated touch taps per size, keyboard activation, unchanged layout, and loading-host suppression. Each accepted tap increments the stubbed destination count exactly once. This is browser/touch emulation with destinations stubbed, not physical-device or official-host acceptance. Evidence: `evidence/milestone-4-session-browser.json`.

Standalone preview refreshed at 3,881,581 bytes. No gameplay input or audio timing changed. Physical-device and official-host checks remain unverified.

All 32 network packages were regenerated (3clicks, 10clicks, 60seconds, 90seconds across eight networks), maximum raw HTML 3,882,828 bytes. The packaged 90-second AppLovin smoke also passes boot, audio, orientation resize, selected CTA and pause using mocked host callbacks. Reports: `evidence/network-builds.json`, `evidence/delivery-browser.json`.
