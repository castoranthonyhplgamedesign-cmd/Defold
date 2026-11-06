"""Generate Defold resources from the extracted original model and artwork."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tools/reference'
def write(name, text):
    path = ROOT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')

manifest = json.loads((ROOT / 'docs/asset-manifest.json').read_text())
manifest['assets']=[item for item in manifest['assets']if item['source']in ['src/constants.ts','src/game/CoinCylinderLevel.ts','src/game/Coin3DController.ts','Assets/models/Coin.fbx']]
names = {'App Icon':'app_icon', 'Background':'background', 'Hand':'hand', 'Lock':'lock',
         'Jar Glass Base':'jar_base', 'Jar Glass Body':'jar_body', 'Jar Wood Lid':'jar_lid'}
for name, key in names.items():
    source = SOURCE / f'Assets/images/{name}.webp'
    branded=name=='App Icon'and (ROOT/'branding.json').exists()
    if branded:
        brand=json.loads((ROOT/'branding.json').read_text())
        source=ROOT/brand['icon']
    image = Image.open(source).convert('RGBA')
    target = ROOT / f'assets/images/{key}.png'
    image.save(target)
    manifest['assets'].append({'source':str(source.relative_to(ROOT if branded else SOURCE)), 'destination':str(target.relative_to(ROOT)),
        'conversion':'User-authorized generated Token Roll replacement icon'if branded else 'WebP decoded to RGBA PNG; source dimensions and pixels retained', 'dimensions':list(image.size),
        'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()})

# Preserve every original coin texel in a power-of-two atlas with edge padding.
atlas = Image.new('RGBA',(8192,4096),(0,0,0,255))
for index,name in enumerate(['Gold','Sky','Lime','Violet','Coral','Pink']):
    source = SOURCE / f'Assets/images/{name}.webp'
    image = Image.open(source).convert('RGBA')
    x=(index%3)*2048; y=(1-index//3)*2048
    atlas.paste(image,(x,y))
    manifest['assets'].append({'source':str(source.relative_to(SOURCE)), 'destination':'assets/coin_atlas.png',
        'conversion':'2048x2048 source pixels copied into atlas; UVs address the original tile',
        'tile':[x,y,2048,2048], 'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
atlas.save(ROOT/'assets/coin_atlas.png')
for source in (SOURCE/'Assets/audio').glob('*.mp3'):
    target=ROOT/'assets/audio'/source.name
    shutil.copy2(source,target)
    manifest['assets'].append({'source':str(source.relative_to(SOURCE)),'destination':str(target.relative_to(ROOT)),
        'conversion':'byte-for-byte MP3 copy','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
shutil.copy2(Path('C:/Windows/Fonts/arialbd.ttf'),ROOT/'assets/Arial-Bold.ttf')
manifest['assets'].append({'source':'C:/Windows/Fonts/arialbd.ttf','destination':'assets/Arial-Bold.ttf',
    'conversion':'Arial Bold used by the original browser; local system font copied unchanged',
    'source_sha256':hashlib.sha256((ROOT/'assets/Arial-Bold.ttf').read_bytes()).hexdigest()})
write('assets/ui.atlas','\n'.join(f'images {{ image: "/assets/images/{key}.png" }}' for key in names.values() if key!='background')+'\nmargin: 0\nextrude_borders: 2\ninner_padding: 2\n')
write('assets/background.atlas','images { image: "/assets/images/background.png" }\nextrude_borders: 2\n')
write('assets/tutorial.font','font: "/assets/Arial-Bold.ttf"\nmaterial: "/builtins/fonts/font-df.material"\nsize: 55\nantialias: 1\nalpha: 1.0\noutline_alpha: 1.0\noutline_width: 15.0\nshadow_alpha: 0.0\noutput_format: TYPE_DISTANCE_FIELD\nrender_mode: MODE_MULTI_LAYER\n')

# All bands share one immutable vertex buffer; their palettes and rotations are uniforms.
geometry=json.loads((ROOT/'assets/coin-geometry.json').read_text())
positions=[];normals=[];uvs=[];coins=[]
count=len(geometry['positions'])//3
for lane in range(12):
    for stack in range(12):
        positions.extend(geometry['positions']); normals.extend(geometry['normals']);uvs.extend(geometry['uvs'])
        coins.extend([lane,stack,0,0]*count)
streams=[{'name':name,'type':'float32','count':size,'data':data} for name,size,data in
    [('position',3,positions),('normal',3,normals),('texcoord0',2,uvs),('coin',4,coins)]]
write('assets/meshes/coin_batch.buffer',json.dumps(streams,separators=(',',':')))
write('assets/meshes/coin_batch.mesh','material: "/render/coin.material"\nvertices: "/assets/meshes/coin_batch.buffer"\nprimitive_type: PRIMITIVE_TRIANGLES\nposition_stream: "position"\nnormal_stream: "normal"\ntextures: "/assets/coin_atlas.png"\n')

constants=''
for name,value in [('shape',[540,500,78,46.8]),('band',[12,12,0,3]),('roll',[0,0,0,0]),
                   ('camera',[540,960,1.5,0]),('viewport',[1080,1920,1,0]),('clock',[0,0,0,0]),
                   ('jar',[540,745,0,0])]:
    constants+=f'vertex_constants {{ name: "{name}" type: CONSTANT_TYPE_USER value {{ x: {value[0]} y: {value[1]} z: {value[2]} w: {value[3]} }} }}\n'
constants+='vertex_constants { name: "lanes" type: CONSTANT_TYPE_USER\n'+''.join('value { x: 0 y: -10000 z: -1 w: 0 }\n' for _ in range(12))+'}\n'
constants+='vertex_constants { name: "light_view_proj" type: CONSTANT_TYPE_USER_MATRIX4 value { x: 1 } value { y: 1 } value { z: 1 } value { w: 1 } }\n'
write('render/coin.material','name: "coin"\ntags: "coin"\nvertex_program: "/render/coin.vp"\nfragment_program: "/render/coin.fp"\nvertex_space: VERTEX_SPACE_LOCAL\n'+constants+
    'samplers { name: "texture_sampler" wrap_u: WRAP_MODE_CLAMP_TO_EDGE wrap_v: WRAP_MODE_CLAMP_TO_EDGE filter_min: FILTER_MODE_MIN_LINEAR_MIPMAP_LINEAR filter_mag: FILTER_MODE_MAG_LINEAR }\n'+
    'samplers { name: "shadow_sampler" wrap_u: WRAP_MODE_CLAMP_TO_EDGE wrap_v: WRAP_MODE_CLAMP_TO_EDGE filter_min: FILTER_MODE_MIN_NEAREST filter_mag: FILTER_MODE_MAG_NEAREST }\n')
write('render/shadow.material','name: "shadow"\ntags: "coin"\nvertex_program: "/render/coin.vp"\nfragment_program: "/render/shadow.fp"\nvertex_space: VERTEX_SPACE_LOCAL\n'+constants)
with zipfile.ZipFile(ROOT.parents[2]/'.tools/bob.jar') as bob:
    gui_material=bob.read('builtins/materials/gui.material').decode()
for tag in ['bg','jarbase']:
    write(f'render/{tag}.material',gui_material.replace('name: "gui"',f'name: "{tag}"').replace('tags: "gui"',f'tags: "{tag}"'))
write('main/hud.gui','script: "/main/hud.gui_script"\nmaterial: "/builtins/materials/gui.material"\nadjust_reference: ADJUST_REFERENCE_DISABLED\nmax_nodes: 64\ntextures { name: "ui" texture: "/assets/ui.atlas" }\nfonts { name: "tutorial" font: "/assets/tutorial.font" }\n')
write('main/background.gui','script: "/main/background.gui_script"\nmaterial: "/render/bg.material"\nadjust_reference: ADJUST_REFERENCE_DISABLED\nmax_nodes: 4\ntextures { name: "background" texture: "/assets/background.atlas" }\n')
write('main/jarbase.gui','script: "/main/jarbase.gui_script"\nmaterial: "/render/jarbase.material"\nadjust_reference: ADJUST_REFERENCE_DISABLED\nmax_nodes: 4\ntextures { name: "ui" texture: "/assets/ui.atlas" }\n')
for key,file,gain in [('coin','Coin',.42),('jar','Jar',.68),('lock','Lock',.72),('bgm','Lowkey-Trap',.34)]:
    write(f'main/{key}.sound',f'sound: "/assets/audio/{file}.ogg"\nlooping: {1 if key=="bgm" else 0}\ngain: {gain}\ngroup: "master"\n')
components=['components { id: "script" component: "/main/game.script" }']+[f'components {{ id: "{k}" component: "/main/{k}.sound" }}' for k in ['coin','jar','lock','bgm']]
write('main/game.go','\n'.join(components)+'\n')
collection='name: "main"\ninstances { id: "game" prototype: "/main/game.go" }\n'
for key in ['hud','background','jarbase']:
    write(f'main/{key}.go',f'components {{ id: "gui" component: "/main/{key}.gui" }}\n')
    collection+=f'instances {{ id: "{key}" prototype: "/main/{key}.go" }}\n'
for level,rows in enumerate([3,4,5],1):
    for inner in [False,True]:
        for row in range(rows):
            write('main/band.go','components { id: "mesh" component: "/assets/meshes/coin_batch.mesh" }\n')
            collection+=f'instances {{ id: "level{level}_{"inner" if inner else "outer"}{row}" prototype: "/main/band.go" }}\n'
write('main/main.collection',collection)
write('main/input.input_binding','mouse_trigger { input: MOUSE_BUTTON_1 action: "touch" }\nkey_trigger { input: KEY_R action: "restart" }\n')
manifest['shared_batch']={'vertex_count':count*144,'source_vertices_per_coin':count,'instances':24,
    'conversion':'FBX mesh reused as 12 lanes x 12 coins. Shader hides unused lanes/coins; all 24 bands share the same buffer.'}
write('docs/asset-manifest.json',json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'shared_vertices':count*144,'bands':24,'atlas_size':[8192,4096],'assets':len(manifest['assets'])}))
