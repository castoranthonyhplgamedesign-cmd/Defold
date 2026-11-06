"""Rebuild the asset-only gift animation. Requires Pillow; run from any directory."""
from pathlib import Path
import json
import math
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'ref/generated/gift-open'
OUT = ROOT / 'Assets/images/new/gift_open_sheet.webp'
SIZE = (512, 768)
RESAMPLE = Image.Resampling.LANCZOS
gift = Image.open(ROOT / 'Assets/images/new/ui_gift.webp').convert('RGBA')
parts = Image.open(REVIEW / 'parts-source.png').convert('RGBA')
assert gift.size == (373, 373)


def part(bounds):
    crop = parts.crop(bounds)
    mask = crop.getchannel('A').point(lambda a: 255 if a > 12 else 0)
    ImageDraw.floodfill(mask, (crop.width // 2, crop.height // 2), 128)
    mask = mask.point(lambda a: 255 if a == 128 else 0)
    crop.putalpha(ImageChops.multiply(crop.getchannel('A'), mask))
    return crop.crop(crop.getbbox())


pop = part((0, 0, 665, 819))
hold = part((650, 0, 1290, 800))
inside = part((1290, 0, 1920, 800))
lid = gift.crop((0, 0, 373, 214))
front = gift.crop((0, 214, 373, 373))
front_alpha = front.getchannel('A').point(lambda a: round(a / 17) * 17)
front = front.convert('RGB').quantize(colors=128, dither=Image.Dither.NONE).convert('RGBA')
front.putalpha(front_alpha)


def place(canvas, art, xy, size=None):
    if size:
        art = art.resize(size, RESAMPLE)
    canvas.alpha_composite(art, tuple(round(v) for v in xy))


def bear(canvas, pose, top, width, height_scale=1):
    height = round(pose.height * width / pose.width * height_scale)
    place(canvas, pose, ((512 - width) / 2, top), (width, height))


frames = []
for i in range(12):
    frame = Image.new('RGBA', SIZE)
    if i <= 2:
        if i == 0:
            # Copy, not alpha-composite: retain the source's exact RGBA samples.
            frame.paste(gift, (69, 395))
        else:
            width, height = [(388, 351), (395, 343)][i - 1]
            place(frame, gift, ((512 - width) / 2, 768 - height), (width, height))
    else:
        # The generated insert sits behind the unchanged original front wall.
        place(frame, inside, (116, 568), (280, 95))
        if i >= 6:
            pose, top, width, squash = {
                6: (hold, 565, 265, 1),
                7: (hold, 470, 275, 1),
                8: (pop, 325, 280, 1.04),
                9: (pop, 300, 280, 1),
                10: (hold, 373, 288, .91),
                11: (hold, 347, 280, 1),
            }[i]
            # Clip the emerging toy at the front rim; it cannot show below the box.
            toy = Image.new('RGBA', SIZE)
            bear(toy, pose, top, width, squash)
            frame.alpha_composite(toy.crop((0, 0, 512, 609)), (0, 0))
        if i == 3:
            place(frame, front, (69, 601), (373, 167))
        else:
            place(frame, front, (69, 609))
        if i <= 5:
            angle, cx, cy = {3: (0, 255.5, 475), 4: (-22, 302, 327), 5: (-35, 371, 170)}[i]
            flying = lid.rotate(angle, RESAMPLE if angle == 0 else Image.Resampling.BICUBIC, expand=True)
            if i == 5:
                flying.putalpha(flying.getchannel('A').point(lambda a: round(a * .55)))
            place(frame, flying, (cx - flying.width / 2, cy - flying.height / 2))
        if 3 <= i <= 10:
            draw = ImageDraw.Draw(frame)
            colors = ['#ffd21f', '#ffc400', '#ffe45c', '#ff2026', '#1469e4', '#18c908', '#ffec16']
            for j in range(7):
                angle = math.pi + (j / 6) * math.pi
                radius = 100 + (i - 3) * 12
                x = 256 + math.cos(angle) * radius
                y = 595 + math.sin(angle) * radius - (i - 3) * 14
                r = max(2, 8 - abs(i - 6))
                draw.polygon([(x, y-r), (x+r*.3, y-r*.3), (x+r, y), (x+r*.3, y+r*.3), (x, y+r), (x-r*.3, y+r*.3), (x-r, y), (x-r*.3, y-r*.3)], fill=colors[j])
    if i:
        # Preserve exact rest art; reuse one palette for the fixed original box wall.
        alpha = frame.getchannel('A').point(lambda a: round(a / 17) * 17)
        frame = frame.convert('RGB').quantize(colors=128, dither=Image.Dither.NONE).convert('RGBA')
        frame.putalpha(alpha)
        if i >= 4:
            frame.paste(front, (69, 609))
    frames.append(frame)

sheet = Image.new('RGBA', (2048, 2304))
for i, frame in enumerate(frames):
    sheet.paste(frame, ((i % 4) * 512, (i // 4) * 768))
# Lossless takes priority over approximate quality 75: frame zero must match exactly.
sheet.save(OUT, 'WEBP', lossless=True, quality=100, method=6, exact=True)
decoded = Image.open(OUT).convert('RGBA')
assert decoded.size == (2048, 2304)
assert OUT.stat().st_size <= 500_000, 'Sheet exceeds the brief size budget'
assert ImageChops.difference(decoded.crop((69, 395, 442, 768)), gift).getbbox(alpha_only=False) is None
assert decoded.getchannel('A').getextrema() == (0, 255)
for i in range(4, 12):
    assert frames[i].crop((69, 650, 442, 768)).tobytes() == frames[4].crop((69, 650, 442, 768)).tobytes()

# GIF has 10 ms timing granularity: 40/40/40/40/40/50 averages 24 fps.
durations = [40, 40, 40, 40, 40, 50] * 2
previews = []
contact = Image.new('RGB', (1024, 1152), '#253454')
for i, frame in enumerate(frames):
    tile = Image.new('RGBA', SIZE, '#253454')
    tile.alpha_composite(frame)
    tile = tile.convert('RGB').resize((256, 384), RESAMPLE)
    previews.append(tile)
    contact.paste(tile, ((i % 4) * 256, (i // 4) * 384))
previews[0].save(ROOT / 'ref/generated/gift_open_preview.gif', save_all=True,
                 append_images=previews[1:] + [previews[-1]],
                 duration=durations + [1100], loop=0, disposal=2)
preview = Image.open(ROOT / 'ref/generated/gift_open_preview.gif')
actual_durations = []
for i in range(preview.n_frames):
    preview.seek(i)
    actual_durations.append(preview.info['duration'])
assert sum(actual_durations) == 1600
assert actual_durations == durations[:-1] + [durations[-1] + 1100]
contact.save(REVIEW / 'contact-sheet.png')
report = {'sheet': str(OUT.relative_to(ROOT)), 'bytes': OUT.stat().st_size,
          'size': list(decoded.size), 'frames': 12, 'fps': 24,
          'encoding': 'lossless WebP, exact RGBA', 'frame0_pixel_identical': True,
          'body_fixed_frames_4_to_11': True, 'alpha': True,
          'preview_animation_ms': sum(durations), 'preview_hold_ms': 1100}
(REVIEW / 'validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
