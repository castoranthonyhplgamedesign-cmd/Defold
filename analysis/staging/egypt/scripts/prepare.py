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
for folder in ['assets/images','assets/fonts','config','web/audio','docs','qa/evidence']:
    (ROOT/folder).mkdir(parents=True,exist_ok=True)
inventory=[]
for key,relative in mapping.items():
    src=SOURCE/'Assets'/relative
    out=ROOT/'assets/images'/f'{key}.png'
    im=Image.open(src).convert('RGBA'); im.save(out,optimize=True)
    inventory.append({'key':key,'source':str(src.relative_to(SOURCE)),'destination':str(out.relative_to(ROOT)),
                      'conversion':'WebP decoded losslessly to RGBA PNG; dimensions unchanged',
                      'dimensions':list(im.size),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
for weight in [600,700]:
    font=TTFont(SOURCE/'Assets/Grenze-VariableFont_wght.ttf')
    instantiateVariableFont(font,{'wght':weight},inplace=True)
    font.save(ROOT/f'assets/fonts/Grenze-{weight}.ttf')
    (ROOT/f'assets/fonts/grenze{weight}.font').write_text(f'font: "/assets/fonts/Grenze-{weight}.ttf"\nmaterial: "/builtins/fonts/font-df.material"\nsize: 80\nantialias: 1\nalpha: 1.0\noutline_alpha: 0.0\nshadow_alpha: 0.0\noutput_format: TYPE_DISTANCE_FIELD\n',encoding='utf8')
for src in (SOURCE/'Assets/Audio').glob('*.mp3'):
    shutil.copy2(src, ROOT/'web/audio'/src.name)
    inventory.append({'source':str(src.relative_to(SOURCE)),'destination':f'web/audio/{src.name}','conversion':'Unmodified original MP3, played by HTML5 bridge','source_sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
shutil.copy2(SOURCE/'src/projectDefaults.json',ROOT/'config/defaults.json')
(ROOT/'docs/asset-inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf8')
atlas=''.join(f'images {{ image: "/assets/images/{key}.png" }}\n' for key in mapping)
(ROOT/'assets/game.atlas').write_text(atlas+'margin: 0\nextrude_borders: 2\ninner_padding: 0\n',encoding='utf8')
(ROOT/'main/game.gui').write_text('script: "/main/game.gui_script"\nfonts { name: "body" font: "/assets/fonts/grenze600.font" }\nfonts { name: "title" font: "/assets/fonts/grenze700.font" }\nmaterial: "/builtins/materials/gui.material"\nadjust_reference: ADJUST_REFERENCE_DISABLED\nmax_nodes: 256\nmax_dynamic_textures: 32\n',encoding='utf8')
print(f'Prepared {len(mapping)} original images, 2 font weights, 11 original audio files.')
