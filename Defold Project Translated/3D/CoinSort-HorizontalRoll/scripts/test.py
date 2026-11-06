"""Check Lua syntax and behavior against original TypeScript in code-only tests."""
from pathlib import Path
import json
import subprocess

ROOT=Path(__file__).resolve().parents[1]
LUA=ROOT.parents[2]/'.tools/libexec/x86_64-win32/luajit-64.exe'
commands=[]
for folder in ['main','render']:
    for path in (ROOT/folder).glob('*'):
        if path.suffix in ['.lua','.script','.gui_script','.render_script']:
            rel=path.relative_to(ROOT).as_posix()
            commands.append([str(LUA),'-e',f'assert(loadfile("{rel}"))'])
commands.extend([[str(LUA),'qa/rules_test.lua'],['node','qa/compare-rules.mjs'],['node','qa/host.test.cjs']])
results=[]
for command in commands:
    p=subprocess.run(command,cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace')
    results.append({'command':command,'exit_code':p.returncode,'stdout':p.stdout,'stderr':p.stderr})
    if p.returncode:
        print(json.dumps(results[-1]));break
(ROOT/'qa/code-tests.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'checks':len(results),'passed':all(p['exit_code']==0 for p in results),'tail':results[-1]}))
raise SystemExit(0 if all(p['exit_code']==0 for p in results)else 1)
