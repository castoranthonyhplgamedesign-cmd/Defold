"""Copy a successful committed build to a local-only preview directory."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[1]
build=json.loads((ROOT/'qa/build.json').read_text())
if build['exit_code']!=0:raise SystemExit('Refusing to publish a failed build; run scripts/build.py.')
if not build.get('inputs_unchanged_during_build'):raise SystemExit('Build inputs changed during compilation; rebuild before publication.')
for name,digest in build['input_sha256'].items():
    if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=digest:raise SystemExit('Build is stale: '+name)
brand=json.loads((ROOT/'branding.json').read_text(encoding='utf-8'))
source=ROOT/'build/default'/brand['name']
if not (source/'index.html').exists():raise SystemExit('HTML5 bundle is missing.')
commit=subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,capture_output=True,text=True,check=True).stdout.strip()
destination=ROOT/'local-publish'/commit[:12]
destination.mkdir(parents=True,exist_ok=True)
for name in ['index.html','dmloader.js',brand['executable']+'.wasm',brand['executable']+'_wasm.js']:
    shutil.copy2(source/name,destination/name)
archive=source/'archive'
archive_manifest=json.loads((archive/'archive_files.json').read_text())
names={'archive_files.json'}
def collect(value):
    if isinstance(value,dict):
        for key,item in value.items():
            if key=='name'and isinstance(item,str)and (archive/item).is_file():names.add(item)
            else:collect(item)
    elif isinstance(value,list):
        for item in value:collect(item)
collect(archive_manifest)
(destination/'archive').mkdir(exist_ok=True)
for name in names:shutil.copy2(archive/name,destination/'archive'/name)
(ROOT/'local-publish/current.json').write_text(json.dumps({'revision':commit[:12]})+'\n')
manifest={'captured_utc':datetime.now(timezone.utc).isoformat(),'commit':commit,'url':'http://127.0.0.1:18982/',
          'reference_url':'http://127.0.0.1:18981/','revision_url':'http://127.0.0.1:18982/'+commit[:12]+'/', 'artifacts':{p.relative_to(destination).as_posix():{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in destination.rglob('*')if p.is_file()}}
(ROOT/'qa/publication.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'url':manifest['url'],'commit':commit,'bytes':sum(p['bytes']for p in manifest['artifacts'].values())}))
