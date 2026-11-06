"""Reproducibly convert original assets; never write to the reference repository."""
from pathlib import Path
import json, hashlib, shutil
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'qa/reskin-src'
mapping = {'map-bg':'MapBG.webp','character-bg':'CharBG.webp','clue-bg':'ClueBG.webp',
           'drop-circle':'Dashed-Circle.webp','error':'Error.webp','logo':'Logo.webp','tutorial-hand':'hand-egypt.webp'}
names = ['Tia','Nebet','Nakht','Merit','Huy','Senen']
mapping.update({n:f'Characters/{n}.webp' for n in names})
for folder in ['assets/images','assets/source','assets/runtime','assets/fonts','config','web/audio','docs','qa/evidence']:
    (ROOT/folder).mkdir(parents=True,exist_ok=True)
inventory=[]
for key,relative in mapping.items():
    branded=key=='logo' and (ROOT/'assets/branding/mystery-master-logo.webp').exists()
    src=ROOT/'assets/branding/mystery-master-logo.webp' if branded else ROOT/'assets/source'/f'{key}.webp'
    if not src.exists():shutil.copy2(SOURCE/'Assets'/relative,src)
    out=ROOT/'assets/images'/f'{key}.png'
    original=Image.open(src).convert('RGBA');runtime_src=None
    if key=='tutorial-hand':
        runtime_src=ROOT/'assets/runtime/tutorial-hand.webp'
        original.resize((512,512),Image.Resampling.LANCZOS).save(runtime_src,quality=95,method=6)
        im=Image.open(runtime_src).convert('RGBA')
    else:im=original
    im.save(out,optimize=True)
    inventory.append({'key':key,'source':str(src.relative_to(ROOT)) if branded else f'Assets/{relative}','source_type':'generated' if branded else 'original','local_source':str(src.relative_to(ROOT)),'destination':str(out.relative_to(ROOT)),
                      'conversion':'WebP decoded losslessly to RGBA PNG; dimensions unchanged',
                      'dimensions':list(im.size),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
    if runtime_src:
        inventory[-1].update({'runtime_source':str(runtime_src.relative_to(ROOT)),'runtime_sha256':hashlib.sha256(runtime_src.read_bytes()).hexdigest(),'source_dimensions':list(original.size),'conversion':'Hand resized from 1534 to 512 pixels; WebP quality 95 for 200-design-unit display width; original preserved'})
font_source=ROOT/'assets/fonts/Grenze-VariableFont_wght.ttf'
if not font_source.exists():shutil.copy2(SOURCE/'Assets/Grenze-VariableFont_wght.ttf',font_source)
for weight in [600,700]:
    font=TTFont(font_source)
    instantiateVariableFont(font,{'wght':weight},inplace=True)
    font.save(ROOT/f'assets/fonts/Grenze-{weight}.ttf')
    inventory.append({'source':'Assets/Grenze-VariableFont_wght.ttf','local_source':str(font_source.relative_to(ROOT)),
                      'destination':f'assets/fonts/Grenze-{weight}.ttf','conversion':f'Original variable font instantiated at weight {weight} for native previews; HTML5 uses the unchanged variable font',
                      'source_sha256':hashlib.sha256(font_source.read_bytes()).hexdigest()})
    (ROOT/f'assets/fonts/grenze{weight}.font').write_text(f'font: "/assets/fonts/Grenze-{weight}.ttf"\nmaterial: "/builtins/fonts/font-df.material"\nsize: 80\nantialias: 1\nalpha: 1.0\noutline_alpha: 0.0\nshadow_alpha: 0.0\noutput_format: TYPE_DISTANCE_FIELD\n',encoding='utf8')
for src in (SOURCE/'Assets/Audio').glob('*.mp3'):
    if not (ROOT/'web/audio'/src.name).exists():shutil.copy2(src, ROOT/'web/audio'/src.name)
for src in (ROOT/'web/audio').glob('*.mp3'):
    inventory.append({'source':f'Assets/Audio/{src.name}','destination':f'web/audio/{src.name}','conversion':'Unmodified original MP3, decoded to Web Audio buffers by HTML5 bridge','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
if not (ROOT/'config/defaults.json').exists():shutil.copy2(SOURCE/'src/projectDefaults.json',ROOT/'config/defaults.json')
config_path=ROOT/'config/defaults.json';config=json.loads(config_path.read_text(encoding='utf8'))
next(t for t in config['CHANGABLE_TEXTURES'] if t['spriteName']=='tutorial-hand')['originalSize']={'width':512,'height':512}
config_path.write_text(json.dumps(config,indent=2),encoding='utf8')
for entry in inventory:
    if entry.get('source_type')!='generated':entry.update({'source_branch':'reskin','source_commit':'4ed0abc9fe3a3568e9d6557491a6029b47747ae5'})
(ROOT/'docs/asset-inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf8')
atlas=''.join(f'images {{ image: "/assets/images/{key}.png" }}\n' for key in mapping)
(ROOT/'assets/game.atlas').write_text(atlas+'margin: 0\nextrude_borders: 2\ninner_padding: 0\n',encoding='utf8')
(ROOT/'main/game.gui').write_text('script: "/main/game.gui_script"\nfonts { name: "body" font: "/assets/fonts/grenze600.font" }\nfonts { name: "title" font: "/assets/fonts/grenze700.font" }\nmaterial: "/builtins/materials/gui.material"\nadjust_reference: ADJUST_REFERENCE_DISABLED\nmax_nodes: 256\nmax_dynamic_textures: 32\n',encoding='utf8')
print(f'Prepared {len(mapping)} original images, 2 font weights, 11 original audio files.')
