# Phone endcard proportions - 2026-10-30

Extended the tablet landscape rule to all landscape viewports as requested. Removed the 600-pixel short-edge cutoff and its unused setting. Title, icon and spacing scale together using the portrait screen-height proportion; portrait dimensions are unchanged. Centering, title/icon aspect ratios, pop animation and repeatable full-screen CTA remain intact.

Measured phone landscape results, each equal to its rotated portrait stack-height fraction:

| Landscape size | Stack / screen height | Icon width |
| --- | --- | --- |
| 568x320 | 46.71% | 100.16 px |
| 640x360 | 46.64% | 112.50 px |
| 844x390 | 38.31% | 100.12 px |
| 932x430 | 38.25% | 110.22 px |

Validation: TypeScript passes. Muted Chromium session smoke passes all 14 sizes, covering small/tall phones and tablets, matching stack-height ratios per orientation pair, centered bounds, repeated corner/title/logo clicks, repeated touch taps and keyboard CTA. Compared all portrait title/icon widths to the pre-change measurements; unchanged within 0.01 px. Visually inspected the tall-phone landscape capture. Matching portrait proportions makes landscape artwork smaller; the entire viewport remains the CTA hit area.

Before measurements: `evidence/phone-endcard-before.json`; after: `evidence/phone-endcard-after.json`. Before captures: `screenshots/phone-endcard-before/`; after: `screenshots/milestone-4/endcard-*.png`. Runtime report: `evidence/milestone-4-session-browser.json`. These use browser emulation; physical phones and official host rendering remain unverified.

Standalone preview rebuilt at 3,881,660 bytes. All 32 network packages rebuilt and passed packaging checks; maximum raw HTML 3,882,907 bytes. Report: evidence/network-builds.json.
