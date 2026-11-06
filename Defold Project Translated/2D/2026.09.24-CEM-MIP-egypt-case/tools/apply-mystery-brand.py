"""Apply the corrected, synonymous brand; retain prior masters as provenance."""
from pathlib import Path
from PIL import Image
import json,shutil
root=Path(__file__).resolve().parents[1]
source=Path(r'C:\Users\Anthony Castor\.codex\generated_images\01a1b125-3b1c-71e3-b2dd-780edbb51af2\exec-53a78b1b-0457-4feb-880e-905e2fb3ef83.png')
master=root/'assets/branding/mystery-master-master.png'
shutil.copy2(source,master)
image=Image.open(master).convert('RGBA')
image.save(root/'assets/branding/mystery-master-logo.webp',quality=90,method=6)
image.resize((64,64),Image.Resampling.LANCZOS).save(root/'assets/branding/mystery-master-icon.png',optimize=True)
image.save(root/'assets/branding/mystery-master.ico',sizes=[(32,32),(48,48),(64,64),(128,128),(256,256)])
for name in ['game.project','scripts/publish.py','scripts/prepare.py','tools/branding-qa.mjs','tools/qa.mjs','README.md']:
    path=root/name
    text=path.read_text(encoding='utf8').replace('Sinonimus','MysteryMaster').replace('sinonimus','mystery-master')
    if name=='scripts/publish.py':
        text=text.replace('<title>MysteryMaster</title>','<title>Mystery Master</title>').replace('content="MysteryMaster"','content="Mystery Master"')
    if name=='tools/branding-qa.mjs':
        text=text.replace("page.title(),'MysteryMaster'","page.title(),'Mystery Master'").replace("config.CLUE_TITLE),'SINONIMUS'","config.CLUE_TITLE),'MYSTERY MASTER'")
        text=text.replace('mystery-master-branding-report.json','mystery-master-branding-report.json')
    path.write_text(text,encoding='utf8')
path=root/'config/defaults.json';config=json.loads(path.read_text(encoding='utf8'));config['CLUE_TITLE']='MYSTERY MASTER'
logo=next(item for item in config['CHANGABLE_TEXTURES'] if item['spriteName']=='logo');logo['originalSize']={'width':image.width,'height':image.height}
path.write_text(json.dumps(config,indent=2),encoding='utf8')
print('Applied Mystery Master brand:',image.size)
