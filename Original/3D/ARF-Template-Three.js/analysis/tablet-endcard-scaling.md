# Tablet endcard proportions — 2026-10-30

The title/icon stack previously used the same pixel size after rotation. On tablets this made it occupy approximately 83% of landscape height versus 58–62% in portrait. The user requested landscape sizing balanced against portrait. Implemented portrait screen-height proportions for landscape containers whose short edge is at least 600 CSS pixels. The existing scale is multiplied by height/width for those containers only. Portrait and phone scale are unchanged; title/icon ratio, gap, stack centering, pop animation, keyboard access and full-screen repeatable CTA remain intact.

Measured on the live overload preview after the pop settles:

| Tablet pair | Portrait stack / height | Previous landscape stack / height | Updated landscape stack / height | Landscape icon width before ? after |
| --- | --- | --- | --- | --- |
| 768×1024 / 1024×768 | 62.18% | 82.91% | 62.18% | 426.67 ? 320 px |
| 820×1180 / 1180×820 | 57.61% | 82.91% | 57.61% | 455.56 ? 316.57 px |
| 1024×1366 / 1366×1024 | 62.15% | 82.91% | 62.15% | 568.89 ? 426.46 px |

Before/after captures: `screenshots/tablet-endcard-before/` and `screenshots/tablet-endcard-after/`. Measurements: `evidence/tablet-endcard-before.json` and `evidence/tablet-endcard-after.json`. Portrait title and icon widths were checked unchanged. Updated browser session fixture passes all 14 viewport sizes, tablet proportional matching, phone pixel-size parity, centered bounds, repeated full-screen mouse/touch taps and keyboard CTA. TypeScript passes. Automated Chromium output was muted. Physical tablets and official ad-host rendering remain unverified.

Standalone preview rebuilt at 3,881,703 bytes. All 32 network packages regenerated and passed packaging validation; largest raw HTML 3,882,950 bytes. Build report: evidence/network-builds.json.
