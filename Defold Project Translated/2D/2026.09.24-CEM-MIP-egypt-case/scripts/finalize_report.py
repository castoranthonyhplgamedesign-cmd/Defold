"""Validate final local artifacts and write an evidence-based handoff."""
from pathlib import Path
import json,hashlib,zipfile,subprocess,shutil
ROOT=Path(__file__).resolve().parents[1]
evidence=ROOT/'qa/evidence';out=ROOT/'dist'
report=json.loads((evidence/'report.json').read_text(encoding='utf8'))
assert report['failed']==0, 'Browser QA must pass before finalizing'
assert report['passed']>=27, 'Run the full suite without a filter'
manifest=json.loads((out/'build-manifest.json').read_text(encoding='utf8'))
assert len(manifest)==24
for item in manifest:
    data=(out/item['path']).read_bytes()
    assert len(data)<5_000_000
    assert hashlib.sha256(data).hexdigest()==item['sha256']
zips=list(out.rglob('*.zip'))
assert len(zips)==9
for path in zips:
    with zipfile.ZipFile(path) as archive:
        assert archive.namelist()==['index.html']
        assert archive.read('index.html')==path.with_suffix('.html').read_bytes()
for name in ['reference-gameplay.webm','defold-gameplay.webm']:
    assert (evidence/name).stat().st_size>10000,name
visual=json.loads((evidence/'visual-comparison.json').read_text(encoding='utf8'))
assert len(visual)==4
original=ROOT.parents[2]/'Original/2D/2026.09.24-CEM-MIP-egypt-case'
status=subprocess.check_output(['git','-C',str(original),'status','--porcelain'],text=True)
assert not status,'Original working tree must remain unchanged'
for asset in json.loads((ROOT/'docs/asset-inventory.json').read_text(encoding='utf8')):
    source=ROOT/asset['source'] if asset.get('source_type')=='generated' else original/asset['source']
    assert hashlib.sha256(source.read_bytes()).hexdigest()==asset['source_sha256']
commit=subprocess.check_output(['git','-C',str(ROOT),'rev-parse','HEAD'],text=True).strip()
build_info={'tested_code_commit':commit,'original_branch':'main','original_commit':'d993837484f9f5e6ee2fe9530c704365eed376fc',
            'defold_engine_revision':'d295ed4edff2e49072719835713e625f409849f1','build_variant':'release','target':'wasm-web',
            'html_variants':24,'zip_packages':len(zips),'largest_html_bytes':max(x['bytes'] for x in manifest),
            'local_preview':'http://127.0.0.1:8174/dist/','qa_passed':report['passed'],'qa_failed':0}
(evidence/'build-info.json').write_text(json.dumps(build_info,indent=2),encoding='utf8')
shutil.copy2(out/'build-manifest.json',evidence/'build-manifest.json')
lines=['# Final local QA','',f"**{report['passed']} checks passed; 0 failed.** Original repository remains clean and its asset hashes match the recorded baseline.",'',
       f"Tested code commit: `{commit}`. Defold HTML5 release build, engine revision `d295ed4edff2e49072719835713e625f409849f1`.",'',
       'Local preview: http://127.0.0.1:8174/dist/','',
       f"Delivery: 24 self-contained HTML variants and 9 ZIP packages. Largest HTML: **{build_info['largest_html_bytes']:,} bytes**, below the 5,000,000-byte limit. ZIPs contain exactly one `index.html` matching the corresponding HTML.",'',
       '## Executed checks','', '| Check | Result |','|---|---|']
for result in report['results']:lines.append(f"| {result['name']} | {result['status']} |")
if report.get('followup'):
    followup=report['followup']
    lines+=['',f"The initial full matrix passed {followup['initial_passed']} checks and exposed {followup['initial_failed']} local-preview variant issue. After the fix, {len(followup['rerun_checks'])} affected checks were rerun successfully. The consolidated report retains that history; unaffected passing checks were not repeated."]
lines+=['','## Visual evidence','', '| Viewport | Mean absolute RGB difference (0–255) | Comparison |','|---|---|---|']
for item in visual:
    w,h=item['viewport'];means=', '.join(f'{value:.3f}' for value in item['mean_absolute_rgb_difference_0_to_255'])
    lines.append(f'| {w} × {h} | {means} | `qa/evidence/comparison-{w}x{h}.png` |')
lines+=['','Metrics quantify raster differences; they do not establish client acceptance. The same original artwork, font, positions and rules are used. The comparison image contains original, Defold, and a four-times-amplified difference. Gameplay captures disable the hand tutorial in both versions to compare the same stable state; tutorial states are captured separately.','',
        'Recordings: `qa/evidence/reference-gameplay.webm` and `qa/evidence/defold-gameplay.webm`. They cover the opening hint, a wrong drop, correct placements, clue strikes and completion. Videos are intentionally silent; audio decoding, unlock, mapping, mute and host-volume behavior are checked separately.','',
        'Raw results: `qa/evidence/report.json`, `visual-comparison.json`, `build-info.json`, and `build-manifest.json`. Earlier failed development snapshots are historical and are superseded by this report.','',
        '## Scope and remaining external acceptance','',
        '- QA ran on Windows in headless Chrome with SwiftShader. The frame-timing observation is a desktop diagnostic, not certification of mid-range Android or iPhone FPS.',
        '- All eight SDK routes were tested with local mocks. Live ad-network validators and real container behavior have not been exercised.',
        '- No physical iPhone/Android test or client approval is claimed. The desktop/local workflow is complete; those external checks remain part of production acceptance.',
        '- Only HTML5 is the delivery target tested here. Native editor previews reuse the converted art and fonts; browser-specific audio/SDK behavior is implemented in the HTML5 bridge.',
        '- Hosting is bound to 127.0.0.1. No remote hosting, Git push, or production publication was performed.']
(ROOT/'docs/QA.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
print(json.dumps(build_info,indent=2))
