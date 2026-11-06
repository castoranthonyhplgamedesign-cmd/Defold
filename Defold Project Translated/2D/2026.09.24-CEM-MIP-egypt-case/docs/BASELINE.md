# Source baseline and acceptance

- Source: Egypt Case, Phaser 3.90 / TypeScript / Vite.
- Branch: `main`; commit: `d993837484f9f5e6ee2fe9530c704365eed376fc`.
- Source working tree was clean before translation. No original files are modified.
- Reference TypeScript check and Applovin delivery build passed in the ignored comparison copy.
- Reference first-frame and gameplay screenshots are in `qa/evidence/reference-opening.png` and `reference-gameplay.png`.
- Design coordinates: 1080 × 1920, fit and center, full-viewport tan fill. Device pixel ratio capped at three.

## Behavior

Characters appear left to right: Aisha, Maya, Ahmose, Nefertiti, Merneptah, Khasekhemwy. Each has its own correct drop point from `config/defaults.json`. A successful drop hides its circle, disables dragging, shrinks the portrait to 190 design units, snaps over 260 ms with Back.Out, strikes the matching clue with Cubic.Out, and plays original cues. Unaccepted drops return over 340 ms. Wrong-circle drops flash the original full-viewport error texture twice and play wrong/return cues.

Only an unsolved portrait press counts. The second or fourth such press ends limited variants immediately, before placement. Background, solved portraits and end-card presses do not count. Full mode needs all six correct placements, then waits 1000 ms before the end card. Both limited endings and full completion automatically route to the store when the end card appears, matching `CompletionCta.show()` in the source. CTA analytics are recorded once; later end-card presses may redirect again.

Opening tutorial highlights the title and first clue, shows a ghost portrait and target, sweeps the hand across the highlighted text, moves to Khasekhemwy, then loops a drag demonstration. Any press dismisses it over 260 ms. After five idle seconds, hints cycle available characters, preferring anyone except Aisha. There is no timer-based end in the original GameScene despite the `timeLimit` config field; the port preserves that behavior.

## Required comparisons

Portrait phone, landscape phone, portrait tablet and landscape tablet; opening and idle tutorials; valid, wrong and outside drops; solved-item input; all six placements; two/four press ends; rotation during tutorial, snap, return, strike and end-card animations; SDK lifecycle pause/resume/mute; original sound mapping; all eight network CTA routes; self-contained output, config overrides and size limits.

## Source documentation

The root workspace README is the translation contract. Source AGENTS.md describes the original build and SDK requirements; its Phaser-specific APIs are adapted to Defold, preserving observable behavior. Original assets, including the Grenze variable font, are reused. `asset-inventory.json` records sources, conversions and hashes.
