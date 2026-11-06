"""Import the approved reskin baseline without altering either reference tree."""
from pathlib import Path
import hashlib,json,shutil,subprocess
ROOT=Path(__file__).resolve().parents[1];SOURCE=ROOT/'qa/reskin-src'
COMMIT='4ed0abc9fe3a3568e9d6557491a6029b47747ae5'
assert subprocess.check_output(['git','-C',str(SOURCE),'rev-parse','HEAD'],text=True).strip()==COMMIT
names={'Aisha':'Tia','Maya':'Nebet','Ahmose':'Nakht','Nefertiti':'Merit','Merneptah':'Huy','Khasekhemwy':'Senen'}
for filename in ['main/game.gui_script','scripts/prepare.py','scripts/publish.py','tools/branding-qa.mjs','tools/qa.mjs','tools/record.mjs']:
    path=ROOT/filename;text=path.read_text(encoding='utf8')
    for old,new in names.items():text=text.replace(old,new).replace(old.lower(),new.lower())
    if filename=='scripts/prepare.py':text=text.replace("SOURCE = ROOT.parents[2] / 'Original/2D/2026.09.24-CEM-MIP-egypt-case'","SOURCE = ROOT / 'qa/reskin-src'")
    path.write_text(text,encoding='utf8')
images={'map-bg':'MapBG.webp','character-bg':'CharBG.webp','clue-bg':'ClueBG.webp','drop-circle':'Dashed-Circle.webp','error':'Error.webp','tutorial-hand':'hand-egypt.webp','logo':'Logo.webp'}
images.update({name:f'Characters/{name}.webp' for name in names.values()})
for key,relative in images.items():shutil.copy2(SOURCE/'Assets'/relative,ROOT/'assets/source'/f'{key}.webp')
for source in (SOURCE/'Assets/Audio').glob('*.mp3'):shutil.copy2(source,ROOT/'web/audio'/source.name)
current=json.loads((ROOT/'config/defaults.json').read_text(encoding='utf8'))
config=json.loads((SOURCE/'src/projectDefaults.json').read_text(encoding='utf8'))
config['CLUE_TITLE']=current['CLUE_TITLE']
next(t for t in config['CHANGABLE_TEXTURES'] if t['spriteName']=='logo')['originalSize']=next(t for t in current['CHANGABLE_TEXTURES'] if t['spriteName']=='logo')['originalSize']
(ROOT/'config/defaults.json').write_text(json.dumps(config,indent=2),encoding='utf8')
(ROOT/'config/source-baseline.json').write_text(json.dumps({'branch':'reskin','commit':COMMIT,'commit_date':'2026-11-06T21:59:22+08:00','reference_path':'qa/reskin-src','repository':'https://github.com/HPL-PlayableAds/2026.09.24-CEM-MIP-egypt-case.git','character_order':list(names.values()),'preserved_brand':'Mystery Master'},indent=2),encoding='utf8')
print('Imported reskin baseline',COMMIT)
