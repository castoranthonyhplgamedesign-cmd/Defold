"""Build only this Defold translation using the workspace's pinned toolchain."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import zipfile
import base64
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
WORKSPACE=ROOT.parents[2]
JAVA=Path('C:/Users/Anthony Castor/Documents/Defold/packages/jdk-25.0.4.1+1/bin/java.exe')
BOB=WORKSPACE/'.tools/bob.jar'
BRAND=json.loads((ROOT/'branding.json').read_text(encoding='utf-8'))
with zipfile.ZipFile(BOB) as jar:
    template=jar.read('builtins/manifests/web/engine_template.html').decode()
host=(ROOT/'web/host.js').read_text(encoding='utf-8')
icon='data:image/png;base64,'+base64.b64encode((ROOT/BRAND['icon']).read_bytes()).decode('ascii')
template=re.sub(r'<title>.*?</title>','<title>'+BRAND['name']+'</title>',template)
template=template.replace('</head>','<link rel="icon" href="data:,"><script>'+host+'</script>\n<style>html,body{width:100%;height:100%;overflow:hidden;touch-action:none}#app-container,#canvas-container{position:absolute;inset:0;width:100%!important;height:100%!important}#canvas{display:block;width:100%!important;height:100%!important;padding:0!important}.buttons-background{display:none}</style></head>')
template=template.replace('EngineLoader.load("canvas", "{{exe-name}}");','CoinHost.ready.then(function(){EngineLoader.load("canvas", "{{exe-name}}");});')
template=template.replace('href="data:,"','href="'+icon+'"')
(ROOT/'web/template.html').write_text('\n'.join(line.rstrip()for line in template.splitlines())+'\n',encoding='utf-8')
def inputs():
    paths=[ROOT/'game.project',ROOT/'branding.json']
    for folder in ['main','render','assets','web']:
        paths.extend(p for p in (ROOT/folder).rglob('*')if p.is_file())
    return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in paths}
before=inputs()
command=[str(JAVA),'-jar',str(BOB),'--root',str(ROOT),'--platform','wasm-web','--architectures','wasm-web','--variant','debug'if '--debug'in sys.argv else 'release','--max-cpu-threads','3','--archive','resolve','build','bundle']
p=subprocess.run(command,cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace')
evidence={'captured_utc':datetime.now(timezone.utc).isoformat(),'command':command,'bob_sha256':hashlib.sha256(BOB.read_bytes()).hexdigest(),'input_sha256':before,'inputs_unchanged_during_build':before==inputs(),'exit_code':p.returncode,'stdout':p.stdout,'stderr':p.stderr}
(ROOT/'qa/build.json').write_text(json.dumps(evidence,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'exit_code':p.returncode,'log':'qa/build.json','tail':(p.stdout+p.stderr)[-6000:]}))
raise SystemExit(p.returncode)
