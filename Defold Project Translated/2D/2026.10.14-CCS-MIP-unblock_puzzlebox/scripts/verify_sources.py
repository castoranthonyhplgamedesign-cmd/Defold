from pathlib import Path
import subprocess,hashlib,json,os
root=Path(__file__).resolve().parent.parent
source=root.parents[2]/'Original/2D/2026.10.14-CCS-MIP-unblock_puzzlebox'
def run(args):
 r=subprocess.run(args,cwd=root,capture_output=True,text=True,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
 return {'pass':r.returncode==0,'output':(r.stdout+r.stderr).strip()}
checks={}
checks['reference_typecheck']=run(['node','node_modules/typescript/bin/tsc','--noEmit','-p','tools/reference/tsconfig.json'])
r=run(['git','-C',str(source),'status','--porcelain']);r['pass']=r['pass'] and not r['output'];checks['original_unchanged']=r
r=run(['git','-C',str(source),'rev-parse','HEAD']);r['pass']=r['pass'] and r['output']=='be16ff7d7afada777f1160be16df37485adac21b';checks['baseline_commit']=r
assets=json.loads((root/'docs/ASSET_MANIFEST.json').read_text());checks['asset_checksums']={'pass':all(hashlib.sha256((root/a['output']).read_bytes()).hexdigest()==a['sha256'] for a in assets),'count':len(assets)}
audio=list((root/'web/audio').glob('*.mp3'));checks['original_audio_reused']={'pass':all(p.read_bytes()==(source/'Assets/audio'/p.name).read_bytes() for p in audio),'count':len(audio)}
for f in ['web/host.js','web/physics.js','scripts/qa.mjs','scripts/viewport_qa.mjs']:
 checks['syntax:'+f]=run(['node','--check',f])
(root/'qa/source-verification.json').write_text(json.dumps(checks,indent=2)+'\n')
print(json.dumps(checks,indent=2));raise SystemExit(0 if all(v['pass'] for v in checks.values()) else 1)
