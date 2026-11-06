from pathlib import Path
import json,hashlib,datetime
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent.parent
qa=root/'qa'
functional=json.loads((qa/'results.json').read_text())
viewports=json.loads((qa/'viewport-results.json').read_text())
solver=json.loads((qa/'solver-parity.json').read_text())
sources=json.loads((qa/'source-verification.json').read_text())
assert all(t['pass'] for t in functional['results']) and not functional['errors'], 'Functional checks must pass'
assert len(viewports['results'])==5 and all(t['pass'] for t in viewports['results']) and not viewports['errors'], 'Viewport checks must pass'
assert solver['maxDistance']==0 and solver['colorMatches']==49, 'Source setup parity must pass'
assert all(t['pass'] for t in sources.values()), 'Source checks must pass'
bundle=root/'local-publish/Ring Sort'
files=[dict(path=str(p.relative_to(bundle)).replace('\\','/'),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted(bundle.rglob('*')) if p.is_file()]
(qa/'publish-manifest.json').write_text(json.dumps({'date':datetime.datetime.now().isoformat(),'local_url':'http://127.0.0.1:8171/Ring%20Sort/index.html?variant=60sec','files':files},indent=2)+'\n')
for suffix in ['portrait-start','landscape','endcard']:
 a=Image.open(qa/'screenshots'/('reference-'+suffix+'.png')).convert('RGB');b=Image.open(qa/'screenshots'/('defold-'+suffix+'.png')).convert('RGB')
 sheet=Image.new('RGB',(a.width+b.width,max(a.height,b.height)+36),'#eeeeee');sheet.paste(a,(0,36));sheet.paste(b,(a.width,36));draw=ImageDraw.Draw(sheet);draw.text((12,12),'ORIGINAL',fill='black');draw.text((a.width+12,12),'DEFOLD',fill='black');sheet.save(qa/'screenshots'/('comparison-'+suffix+'.png'))
rows='\n'.join(f"| {t['name']} | PASS |" for t in functional['results'])
vp='\n'.join(f"| {t['viewport'][0]} x {t['viewport'][1]} | {t['dpr']} | {t['canvas'][0]} x {t['canvas'][1]} | {t['fps']:.1f} | {t['p95ms']:.1f} |" for t in viewports['results'])
size=sum(f['bytes'] for f in files)
text=f'''# Ring Sort — local QA report

Date: {functional['date']}

The Defold HTML5 local build passes {len(functional['results'])}/{len(functional['results'])} functional checks, five viewport/DPR checks, source verification and exact seeded-setup comparison. No browser script/resource errors were recorded in this functional run. This is a local implementation and QA result, not client acceptance or ad-network certification.

## Open locally

[Play 60 seconds](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=60sec) · [3 clicks](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=3clk) · [10 clicks](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=10clk) · [HUD build](http://127.0.0.1:8171/Ring%20Sort/index.html?variant=60sec&hud=1)

The server binds only 127.0.0.1. Store redirects are suppressed and logged locally. No cloud publication or remote Git push was performed.

## Functional results

| Check | Result |
|---|---|
{rows}

The danger test pins a real physics ball above the rope and waits for the real countdown. The gift-floor test moves the physical gift to floor contact and exercises the actual collision-to-win path. Merge fixtures use the production Lua rules with controlled starting rings. These are controlled coverage, not an unassisted full-board solve.

## Original comparison

Baseline: `main @ be16ff7d7afada777f1160be16df37485adac21b`. The original working tree is unchanged. Observation hooks are applied only to the ignored staging copy.

- All 49 settled ball centers: maximum error {solver['maxDistance']} design pixels.
- All 49 ring-color arrays: exact match.
- Gift center: error {solver['giftDistance']} design pixels.
- Original MP3s: seven byte-for-byte matches.
- Converted asset manifest: {sources['asset_checksums']['count']} SHA-256 checks pass.
- Staged source TypeScript typecheck and browser JavaScript syntax checks pass.

[Portrait comparison](screenshots/comparison-portrait-start.png) · [Landscape comparison](screenshots/comparison-landscape.png) · [Endcard comparison](screenshots/comparison-endcard.png)

Animation captures are taken at different wall-clock phases; hand positions and animation progress can differ between screenshots. Exact solver comparison uses the synchronous settled state, avoiding screenshot timing ambiguity.

## Viewports and performance observations

| CSS viewport | DPR | Canvas pixels | Frame callback FPS | p95 frame interval ms |
|---|---|---|---|---|
{vp}

Measurements are short headless Windows Chrome frame-callback samples, not a mobile hardware certification or a complete chain-reaction performance profile. Device-level 60 FPS / minimum 30 FPS requirements remain unverified.

## Build and practical limits

- Installed Defold release builder successfully compiled and bundled wasm-web.
- Local multi-file bundle: {size:,} bytes ({size/1048576:.2f} MiB), including engine, lossless converted texture archives and audio.
- This bundle is **not** a sub-5-MB single-file ad creative. Network packaging/size optimization and network preview certification are not included in this local publication.
- Rendering and gameplay orchestration are Defold/Lua. Matter, seeded setup utilities, WebAudio and browser lifecycle services run through the documented JavaScript bridge. Native desktop/mobile builds are not supported by this backend.
- Original audio files and browser unlock/mute/pause behavior were verified; auditory parity on iPhone/Android ad preview apps was not tested.
- No unassisted full-clear playthrough or client approval is claimed. The repository-wide acceptance requirements therefore remain a separate acceptance gate.

## Reproduce

See [README](../README.md), [work log](../docs/WORK_LOG.md), `results.json`, `viewport-results.json`, `solver-parity.json`, `source-verification.json` and `publish-manifest.json`. The publish manifest hashes every locally served build file.

Official implementation references: [Defold builder](https://defold.com/manuals/bob/), [HTML5](https://defold.com/manuals/html5/), [HTML5 Lua bridge](https://defold.com/ref/html5-lua/), [texture profiles](https://defold.com/manuals/texture-profiles/).
'''
if (qa/'branding-results.json').exists():
 branding=json.loads((qa/'branding-results.json').read_text())
 assert all(t['pass'] for t in branding['results']) and not branding['errors'], 'Branding checks must pass'
 text+='\n## User-requested Ring Sort branding update\n\n'
 text+='Date: '+branding['date']+'. '+str(len(branding['results']))+'/'+str(len(branding['results']))+' targeted branding checks pass with no browser errors. The existing 15-check gameplay and five-viewport results above are the prior gameplay baseline; the rebrand changes artwork and metadata only.\n\n'
 text+='New concentric-ring icon, RING SORT end-card wordmark, browser/project/package names, favicon, Apple touch icon, manifest icons, Windows icon configuration and accessibility label are updated. The original repository remains unchanged.\n\n'
 text+='[Branding prompts and saved assets](../docs/BRANDING.md) · [Portrait end card](screenshots/ring-sort-endcard-portrait.png) · [Landscape end card](screenshots/ring-sort-endcard-landscape.png)\n'
if (qa/'single-html-results.json').exists():
 single=json.loads((qa/'single-html-results.json').read_text());package=json.loads((qa/'single-html-package.json').read_text())
 assert all(t['pass'] for t in single['results']) and not single['errors'], 'Single HTML checks must pass'
 text+='\n## Single-file delivery\n\n'
 text+='Final file: `'+package['file']+'`. Size: '+format(package['bytes'],',')+' bytes. SHA-256: `'+package['sha256']+'`.\n\n'
 text+='All five offline single-file checks pass after copying only this HTML into an otherwise empty directory. Engine, game archives, audio, icons and scripts are embedded. No network or sibling-file requests occurred. Repeated exports overwrite Ring Sort.html; the obsolete Sinonimus.html is removed. Unrelated games in the output folder are preserved. The 15 gameplay baseline checks above predate this packaging-only change.\n'
(qa/'REPORT.md').write_text(text,encoding='utf-8')
print(f'QA report generated: {len(functional["results"])}/{len(functional["results"])} functional checks; 5/5 viewport checks; exact 49-ball setup parity.')
