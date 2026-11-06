"""Publish this assessment and successful immutable build copies locally."""
from pathlib import Path
from html import escape
import json
import shutil
import subprocess

HERE = Path(__file__).resolve().parent
OUT = HERE / 'local-publish'
OUT.mkdir(exist_ok=True)
for name in ['REPORT.md', 'QA.md', 'WORK_LOG.md']:
    if (HERE / name).exists():
        shutil.copy2(HERE / name, OUT / name)
shutil.copytree(HERE / 'evidence', OUT / 'evidence', dirs_exist_ok=True)
links = []
for key, title in [('bbs', 'BBS Corners - Wide U'), ('egypt', 'EgyptCase')]:
    result = json.loads((HERE / 'evidence' / f'{key}-build.json').read_text(encoding='utf-8'))
    source = HERE / 'staging' / key / 'build/default' / title
    if result['exit_code'] == 0 and (source / 'index.html').exists():
        shutil.copytree(source, OUT / 'games' / key, dirs_exist_ok=True)
        links.append(f'<li><a href="games/{key}/index.html">{escape(title)} snapshot</a> — build passed; consult QA for runtime status.</li>')
commit = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=HERE, capture_output=True, text=True).stdout.strip() or 'uncommitted'
report = (HERE / 'REPORT.md').read_text(encoding='utf-8')
(OUT / 'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Defold workspace analysis</title>
<style>body{margin:0;background:#f4f6f8;color:#172433;font:16px/1.6 system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:28px 20px}h1{line-height:1.15}a{color:#155aaf}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:white;border:1px solid #d6dfe8;padding:24px;border-radius:8px;font:14px/1.65 ui-monospace,monospace}aside{border-left:4px solid #237b64;padding:8px 16px;background:#e4f2ed}li{margin:8px 0}</style>
<main><h1>Defold workspace analysis</h1><aside>Local review only · five source projects · three existing ports · two isolated builds passed.</aside>
<p>Analysis commit: <strong>''' + escape(commit) + '''</strong>. Build success does not establish parity.</p>
<p><a href="REPORT.md">Full report</a> · <a href="evidence/inventory.json">Baseline and file hashes</a> · <a href="evidence/toolchain.json">Toolchain evidence</a></p>
<ul>''' + ''.join(links) + '''</ul><h2>Assessment</h2><pre>''' + escape(report) + '</pre></main></html>', encoding='utf-8')
print(json.dumps({'url': 'http://127.0.0.1:18967/', 'commit': commit, 'games': len(links)}))
