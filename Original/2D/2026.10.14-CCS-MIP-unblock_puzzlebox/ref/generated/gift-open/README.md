# Gift opening asset

Asset-only delivery per `GIFT_OPEN_SPRITESHEET.md`; no runtime integration.

- Production: `Assets/images/new/gift_open_sheet.webp`, 2048 x 2304, 4 x 3 frames of 512 x 768, 24 fps.
- Preview: `ref/generated/gift_open_preview.gif`, 50% resolution, blue review backdrop only, 0.5-second action plus 1.1-second hold. GIF uses 40/50 ms durations to approximate 24 fps.
- Review: `contact-sheet.png`; automated results: `validation.json`.
- Rebuild: `python scripts/export-gift-open.py` with Pillow installed, from the repository root.
- Built-in imagegen generated `parts-source.png`; original generation ID: `01a156cc-70b0-70c0-bbe5-77258fc7fa6a`. The original gift supplies the lid and front wall. Generated parts are isolated by their connected alpha silhouette to remove adjacent fragments.
- WebP uses lossless encoding to preserve frame 0 pixel-for-pixel. Other frames use a 128-color palette and 16 alpha levels to meet the size budget; the original front wall uses one shared palette so it remains stable after frame 3.
- All frames visually inspected as a contact sheet; GIF timing checked from decoded frame durations. Live animated playback and in-game/device behavior have not been reviewed.

## Exact imagegen prompt

Create a transparent game asset parts sheet, landscape layout. Reference image is STYLE ONLY: match its polished soft 3D casual mobile game rendering and upper left lighting. Three separate isolated sprites in three evenly spaced columns, with transparent gutters, no overlap. Left: cute chunky honey brown teddy bear, full body sitting, arms raised high celebrating. Center: EXACT SAME teddy character full body sitting with arms open happy hold pose. Big friendly dark eyes, cream muzzle belly and paw pads, tiny stitched seams, golden yellow bow tie matching reference ribbon. Both bears front view, same head proportions, no clothing besides bow tie, no shadows on ground. Right: an isolated shallow OPEN BOX INTERIOR insert, frontal slight top-down perspective, horizontal rounded rectangle blue rear rim/back wall and dark blue inside with a subtle warm golden glow, no front wall, no lid, no bow. No actual gift box in bear sprites. No text or labels, no logos. Actual transparent alpha background. This is parts for a deterministic animation, not a finished scene.
