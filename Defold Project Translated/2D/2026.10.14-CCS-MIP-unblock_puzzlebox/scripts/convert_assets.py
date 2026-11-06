"""Traceable lossless conversion of reference WebP artwork to Defold PNG atlases."""
from pathlib import Path
from PIL import Image, ImageDraw
import math,json,shutil,hashlib
root=Path(__file__).resolve().parent.parent
src=root/'tools/reference/Assets'
manifest=[]
def save(im,name,source,atlas='art'):
    dest=root/'assets'/atlas/(name+'.png');dest.parent.mkdir(exist_ok=True,parents=True)
    im.save(dest,optimize=True)
    manifest.append(dict(output=str(dest.relative_to(root)),source=source,size=list(im.size),sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
names={'bg':'images/bg.webp','board':'images/new/container.webp','hand':'images/new/hand-point.webp','restart':'images/new/restart-icon.webp','goal':'images/new/goall-board.webp','next':'images/new/next-board.webp','gift':'images/new/ui_gift.webp','fail':'images/failBadge.webp','logo':'images/ui_logo.webp'}
for name,file in names.items():
    if name=='logo' and (root/'branding/wordmark.png').exists():save(Image.open(root/'branding/wordmark.png').convert('RGBA'),name,'branding/wordmark.png (user-requested Ring Sort rebrand)')
    else:save(Image.open(src/file).convert('RGBA'),name,'Assets/'+file)
atlas=Image.open(src/'images/ring_atlas.webp').convert('RGBA');tile=474
# At original design resolution. Annular masks reproduce RingArt.drawBall clips.
for n in range(1,21):
    r=16.36+10.91*n;side=math.ceil(r+10)*2;c=side/2
    for col in range(4):
        im=Image.new('RGBA',(side,side));crop=atlas.crop(((col%2)*tile,(col//2)*tile,(col%2+1)*tile,(col//2+1)*tile))
        # Pixel centers match the canvas atlas placement; all radii keep their original scale.
        im.paste(crop,(round(c-tile/2),round(c-tile/2)))
        mask=Image.new('L',(side*4,side*4));d=ImageDraw.Draw(mask);ri=16.36+10.91*(n-1)
        d.ellipse(((c-r)*4,(c-r)*4,(c+r)*4,(c+r)*4),fill=255)
        d.ellipse(((c-ri)*4,(c-ri)*4,(c+ri)*4,(c+ri)*4),fill=0)
        mask=mask.resize((side,side),Image.Resampling.LANCZOS)
        import PIL.ImageChops
        im.putalpha(PIL.ImageChops.multiply(im.getchannel('A'),mask))
        save(im,f'ring_{col}_{n}','Assets/images/ring_atlas.webp; annulus '+str(n),'rings')
    # Same dark groove base and soft shadow as RingArt.underlay, baked once per count.
    im=Image.new('RGBA',(side,side));pix=im.load();blur=10.91*.45
    for y in range(side):
        for x in range(side):
            dist=math.hypot(x+.5-c,y+.5-c);ds=math.hypot(x+.5-c,y+.5-c-10.91*.28)
            if dist<16.36:continue
            a=round(255*.25*max(0,min(1,(r+blur-ds)/(2*blur))))
            if 16.36+10.91*.25<dist<r-10.91*.12:a=255
            pix[x,y]=(40,15,65,a)
    save(im,f'base_{n}','RingArt.ts underlay algorithm','rings')
sheet=Image.open(src/'images/new/gift_open_sheet.webp').convert('RGBA')
# Cache common complete balls, using the source run-clipping algorithm. Most of the
# pile then needs one quad rather than 3-6 translucent ring quads every frame.
for inner in range(4):
 for outer in range(4):
  for n in ([3,6] if inner==outer else [6]):
   r=16.36+10.91*n;side=math.ceil(((r+10)*2)/32)*32;c=side/2
   im=Image.new('RGBA',(side,side));under=Image.open(root/'assets/rings'/f'base_{n}.png');im.alpha_composite(under,(round(c-under.width/2),round(c-under.height/2)))
   runs=[(0,n,inner)] if inner==outer else [(0,3,inner),(3,6,outer)]
   for start,end,col in runs:
    layer=Image.new('RGBA',(side,side));crop=atlas.crop(((col%2)*tile,(col//2)*tile,(col%2+1)*tile,(col//2+1)*tile));layer.paste(crop,(round(c-tile/2),round(c-tile/2)))
    mask=Image.new('L',(side*4,side*4));d=ImageDraw.Draw(mask);ri=16.36+10.91*start;ro=16.36+10.91*end
    d.ellipse(((c-ro)*4,(c-ro)*4,(c+ro)*4,(c+ro)*4),fill=255);d.ellipse(((c-ri)*4,(c-ri)*4,(c+ri)*4,(c+ri)*4),fill=0)
    layer.putalpha(PIL.ImageChops.multiply(layer.getchannel('A'),mask.resize((side,side),Image.Resampling.LANCZOS)));im.alpha_composite(layer)
   save(im,f'ball_{n}_{inner}_{outer}','Assets/images/ring_atlas.webp + RingArt.ts run clipping','balls')
for n in range(12):save(sheet.crop(((n%4)*512,(n//4)*768,(n%4+1)*512,(n//4+1)*768)),f'open_{n}','Assets/images/new/gift_open_sheet.webp; frame '+str(n),'giftanim')
# Code-drawn source primitives, not replacement artwork.
im=Image.new('RGBA',(864,12),(255,41,66,255));d=ImageDraw.Draw(im)
for x in range(0,864,88):d.polygon([(x,12),(x+12,0),(x+56,0),(x+44,12)],fill=(255,232,239,255))
save(im,'rope','Board.ts relayout() stripe geometry')
im=Image.new('RGBA',(16,16));ImageDraw.Draw(im).ellipse((1,1,15,15),fill='white');save(im,'dot','Board.ts makeTextures()')
im=Image.new('RGBA',(32,12));d=ImageDraw.Draw(im);d.rounded_rectangle((0,0,31,11),radius=6,fill='#9a7a40');d.rounded_rectangle((2,2,29,9),radius=4,fill='white');save(im,'pill','Board.ts makeTextures()')
im=Image.new('RGBA',(100,64));d=ImageDraw.Draw(im);d.polygon([(100,32),(48,0),(48,24),(2,24),(2,40),(48,40),(48,64)],fill='white');save(im,'arrow','Hand.ts relayout()')
im=Image.new('RGBA',(256,256));px=im.load()
for y in range(256):
 for x in range(256):px[x,y]=(255,20,40,round(255*.9*max(0,min(1,(math.hypot(x-128,y-128)-256*.3)/(256*.41)))))
save(im,'vignette','Danger.ts radial gradient')
for group in ['art','rings','giftanim','balls']:
    files=sorted((root/'assets'/group).glob('*.png'))
    (root/'assets'/(group+'.atlas')).write_text(''.join('images { image: "/assets/'+group+'/'+f.name+'" }\n' for f in files)+'margin: 0\nextrude_borders: 2\ninner_padding: 0\n')
shutil.copy2(src/'font/Helvetica Rounded Bold.otf',root/'assets/HelveticaRoundedBold.otf')
(root/'docs/ASSET_MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Converted',len(manifest),'assets without changing original files')
