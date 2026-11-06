# Gift Open Sprite Sheet — Brief for Codex (imagegen)

## Goal
Client feedback: *"the gift should open and have something at the end, like a plushy toy or something."*

Create a **sprite sheet animation**: the gift box opens, its lid pops off, and a **plush toy** pops out and settles. This replaces the placeholder in the win beat, which crops `ui_gift.webp` into a lid and a body and uses a 🧸 emoji.

**Scope: create the asset only.** Do not edit `src/`. The code integration happens separately (see [Integration notes](#integration-notes)).

## Source art (match it exactly)
- `Assets/images/new/ui_gift.webp`: 373×373 px, transparent background. It shows a glossy blue striped box with a yellow-gold ribbon and bow, in a soft 3D casual-game render style.
- The box spans art x 41–331. The lid meets the box body at art row **214**.
- **Frame 0 must look identical to `ui_gift.webp`**: same art, scale and position inside the frame. The game swaps the static gift for the sheet at frame 0, so any mismatch shows as a pop.
- Game palette for the plush and the sparkles: the ring colors red `#ff2026`, blue `#1469e4`, green `#18c908` and yellow `#ffec16` (`RING_COLORS` in `src/game/RingArt.ts`), plus the merge-spark golds `#ffd21f`, `#ffc400` and `#ffe45c`.

## Plush design
- A cute, round **plush teddy bear**, chunky and soft, with a stitched seam look and big friendly eyes. It is the same glossy, soft-lit casual 3D style as the gift.
- Main fur color: warm honey or light brown, with a **ribbon or bow tie in the gift's yellow-gold** so it reads as part of the gift.
- When fully out, it is about as wide as the box (~260–290 px) and sits on or just above the open box.
- If a teddy bear looks generic, an alternative is a plush in a game ring color, such as a round blue bunny. Pick one character and keep it identical in every frame.
- Do not add text, logos or brand marks.

## Sheet spec
| Item | Value |
|---|---|
| Frame size | **512 × 768 px** (portrait: room above the box for the lid and the plush) |
| Box placement | `ui_gift.webp` art drawn at **1:1 scale**, horizontally centered (art x offset 69), bottom-aligned (art y offset 395, so the art bottom = frame bottom) in **every** frame |
| Frames | **12**, in a **4 columns × 3 rows** grid, left-to-right then top-to-bottom, no padding or gaps |
| Sheet size | 2048 × 2304 px |
| Background | Fully transparent (alpha). No ground shadow (the source art has none). |
| Format | **WebP**, quality ~75–80, alpha kept. Target **≤ 500 KB** (the whole playable must stay < 5 MB; it is ~2.5 MB now). |
| Playback | 24 fps (~0.5 s). The **last frame is the hold pose**: the game holds it for ~1.1 s before the endcard. |
| Output | `Assets/images/new/gift_open_sheet.webp` |
| Preview | `ref/generated/gift_open_preview.gif` (or `.webm`), for review only, not shipped |

## Frame plan (12 frames)
| # | Beat | Notes |
|---|---|---|
| 0 | Rest | Pixel-identical to `ui_gift.webp`. |
| 1–2 | Anticipation | The whole box squashes down ~6–8% (wider, shorter). The bottom edge stays on the frame bottom. |
| 3 | Burst | The box stretches up ~5% and the lid lifts slightly. Warm light and gold sparkles leak from the seam. |
| 4–5 | Lid off | The lid (everything above art row 214, with the bow) flies up and to the right, rotating ~20–35°, and leaves the frame top or fades. The open box shows a dark interior with a warm glow. |
| 6–7 | Peek | The plush's head and ears rise out of the box, partly hidden by the front box wall. |
| 8–9 | Pop | The plush jumps clear of the box with an overshoot (slightly above its final spot, arms up). Sparkles in the palette colors. |
| 10–11 | Settle | The plush lands sitting on or behind the box rim in a happy pose (arms open or waving). Frame 11 is the clean hold pose with few or no sparkles. |

Animation principles: ease out of each beat, add squash and stretch on the plush landing, keep the outlines and lighting consistent, and keep the box body fixed in place after frame 3, except for a small settle bounce.

## Recommended pipeline (for consistent frames)
Imagegen rarely keeps one character identical across 12 separate generations. Prefer this:
1. **Generate parts** with transparent backgrounds, in the same style as `ui_gift.webp`:
   - (a) the plush in 2–3 poses: peek (head only), pop (arms up), hold (sitting, happy);
   - (b) the open box interior: the inside back wall and the dark interior with a glow, to sit behind the plush;
   - (c) gold and palette sparkle sprites.
   - The lid and the front box wall come from `ui_gift.webp` itself (split at row 214). Do not regenerate them.
2. **Composite the 12 frames with a script** (Node + sharp, or Python + Pillow) using the transforms in the frame plan, then pack the 4×3 grid and export WebP. The script makes frame 0 exact and the box placement identical in every frame.
3. Render the preview GIF from the same frames, and check the timing at 24 fps.

Generating full frames directly is fine only if character and box consistency hold across all 12. Reject the sheet if the plush changes design between frames.

## Acceptance checklist
- [ ] Sheet is 2048×2304, 12 frames of 512×768, 4×3 grid, transparent background
- [ ] Frame 0 matches `ui_gift.webp` at 1:1, offset (69, 395)
- [ ] Box body is in the same place in every frame (no drift or jitter)
- [ ] The plush is the same character in every frame, with no text or logos
- [ ] Frame 11 is a clean hold pose
- [ ] WebP ≤ 500 KB, with alpha
- [ ] Preview GIF reviewed at 24 fps

## Integration notes
These are for whoever wires the sheet in, not part of the Codex task.
- Load it as a Phaser spritesheet: `load.spritesheet('gift_open', url, { frameWidth: 512, frameHeight: 768 })` in `DEFERRED` ([BootScene.ts](src/scenes/BootScene.ts)).
- [WinFx.ts](src/game/WinFx.ts) `showWin` → `open()`: replace the lid crop (`LID_ROW`), the emoji plush and their tweens with one sprite playing `gift_open` (24 fps, no repeat, holding the last frame). Size it so the box matches the current gift display size: the sprite display width = gift width × 512/373.
- Origin: put the origin at the box art's anchor, so the fly-in and wiggle (which use `ui_gift`) hand off to frame 0 without a jump. Keep the existing burst particles and the `sfx('gift')` cue on the lid-pop frame (frame 4).
- Remove `PLUSH_FONT` and the `ponytail:` emoji placeholder comment once the sheet is live.
