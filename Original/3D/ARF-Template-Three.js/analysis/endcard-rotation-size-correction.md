# Endcard rotation size correction - 2026-10-30

The user's latest correction rejects the landscape shrink introduced by the earlier portrait-height interpretation. This supersedes `tablet-endcard-scaling.md` and `phone-endcard-scaling.md`: remove the height/width multiplier for all devices. Both orientations now use min(width,height)/720 so the title, logo and spacing retain the same pixel dimensions on rotation. Portrait is unchanged. Artwork remains centered and fully inside the viewport; full-screen repeatable CTA and keyboard behavior are preserved.

For the 390x844 / 844x390 pair, logo width is 216.67 px and title width is 162.5 px in both orientations (previous landscape logo was about 100.12 px). Muted Chromium checks pass across 14 sizes, comparing both width and height of title and logo for all seven rotation pairs. Includes small phones, tall phones and tablets, repeated corner/title/logo mouse and touch taps, and keyboard activation. Visually inspected the corrected 844x390 screenshot. Evidence: `evidence/milestone-4-session-browser.json`; screenshots: `screenshots/milestone-4/endcard-*.png`.

TypeScript and standalone build pass; preview is 3,881,644 bytes. Physical-device and official-host rendering remain unverified.

All 32 network packages regenerated and passed packaging validation; maximum raw HTML 3,882,891 bytes. Report: evidence/network-builds.json.
