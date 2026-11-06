"""Create reviewable side-by-side captures and report pixel differences."""
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageStat, ImageEnhance, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
evidence=ROOT/'qa/evidence';results=[]
for w,h in [(390,844),(844,390),(768,1024),(1024,768)]:
    a=Image.open(evidence/f'reference-{w}x{h}.png').convert('RGB')
    b=Image.open(evidence/f'defold-{w}x{h}.png').convert('RGB')
    assert a.size==b.size==(w,h)
    diff=ImageChops.difference(a,b)
    scale=min(w/1080,h/1920);ox=(w-1080*scale)/2;oy=(h-1920*scale)/2
    mapbox=(round(ox),round(oy),round(ox+1080*scale),round(oy+1080*scale))
    means=ImageStat.Stat(diff).mean
    results.append({'viewport':[w,h],'mean_absolute_rgb_difference_0_to_255':means,
                    'map_mean_absolute_rgb_difference_0_to_255':ImageStat.Stat(diff.crop(mapbox)).mean,
                    'note':'Rendering comparison, not a substitute for client acceptance. Diff is amplified 4x in the image.'})
    canvas=Image.new('RGB',(w*3,h+30),'#ffffff');draw=ImageDraw.Draw(canvas)
    for i,(label,im) in enumerate([('Original',a),('Defold',b),('Difference x4',ImageEnhance.Brightness(diff).enhance(4))]):
        draw.text((i*w+8,8),label,fill='#222222');canvas.paste(im,(i*w,30))
    canvas.save(evidence/f'comparison-{w}x{h}.png',optimize=True)
(evidence/'visual-comparison.json').write_text(json.dumps(results,indent=2),encoding='utf8')
print(json.dumps(results,indent=2))
