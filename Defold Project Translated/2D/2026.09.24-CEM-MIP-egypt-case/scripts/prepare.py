"""Reproducibly convert original assets; never write to the reference repository."""
from pathlib import Path
import json, hashlib, shutil
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parents[2] / 'Original/2D/2026.09.24-CEM-MIP-egypt-case'
mapping = {'map-bg':'MapBG.webp','character-bg':'CharBG.webp','clue-bg':'ClueBG.webp',
           'drop-circle':'Dashed-Circle.webp','error':'Error.webp','logo':'Logo.webp','tutorial-hand':'hand-egypt.webp'}
names = ['Aisha','Maya','Ahmose','Nefertiti','Merneptah','Khasekhemwy']
mapping.update({n:f'Characters/{n}.webp' for n in names})
for folder in ['assets/images','assets/source','assets/fonts','config','web/audio','docs','qa/evidence']:
    (ROOT/folder).mkdir(parents=True,exist_ok=True)
inventory=[]
for key,relative in mapping.items():
    branded=key=='logo' and (ROOT/'assets/branding/mystery-master-logo.webp').exists()
    src=ROOT/'assets/branding/mystery-master-logo.webp' if branded else ROOT/'assets/source'/f'{key}.webp'
    if not src.exists():shutil.copy2(SOURCE/'Assets'/relative,src)
    out=ROOT/'assets/images'/f'{key}.png'
    im=Image.open(src).convert('RGBA'); im.save(out,optimize=True)
    inventory.append({'key':key,'source':str(src.relative_to(ROOT)) if branded else f'Assets/{relative}','source_type':'generated' if branded else 'original','local_source':str(src.relative_to(ROOT)),'destination':str(out.relative_to(ROOT)),
                      'conversion':'WebP decoded losslessly to RGBA PNG; dimensions unchanged',
                      'dimensions':list(im.size),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
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
(ROOT/'docs/asset-inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf8')
atlas=''.join(f'images {{ image: "/assets/images/{key}.png" }}\n' for key in mapping)
(ROOT/'assets/game.atlas').write_text(atlas+'margin: 0\nextrude_borders: 2\ninner_padding: 0\n',encoding='utf8')
(ROOT/'main/game.gui').write_text('script: "/main/game.gui_script"\nfonts { name: "body" font: "/assets/fonts/grenze600.font" }\nfonts { name: "title" font: "/assets/fonts/grenze700.font" }\nmaterial: "/builtins/materials/gui.material"\nadjust_reference: ADJUST_REFERENCE_DISABLED\nmax_nodes: 256\nmax_dynamic_textures: 32\n',encoding='utf8')
print(f'Prepared {len(mapping)} original images, 2 font weights, 11 original audio files.')
