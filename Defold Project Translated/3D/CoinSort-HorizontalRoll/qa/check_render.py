"""Reject blank captures and require the brightly colored game foreground."""
import json
import sys
from PIL import Image

image = Image.open(sys.argv[1]).convert('RGB')
raw = image.tobytes()
pixels = list(zip(raw[0::3], raw[1::3], raw[2::3]))
lit = sum(max(p) > 30 for p in pixels)
color = sum(max(p) > 130 and max(p)-min(p) > 70 for p in pixels)
assert lit > len(pixels)*0.1, 'Rendered screen is blank or black'
assert color > len(pixels)*0.003, 'Game foreground is missing'
print(json.dumps({'pixels':len(pixels),'lit':lit,'colored_foreground':color}))
