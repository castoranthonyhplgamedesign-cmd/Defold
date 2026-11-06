"""Verify the published bytes, tested revision, loopback listeners and source baseline."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
build=json.loads((ROOT/'qa/build.json').read_text())
publication=json.loads((ROOT/'qa/publication.json').read_text())
browser=json.loads((ROOT/'qa/browser.json').read_text())
revision=publication['commit'][:12]
runtime_ok=all(hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest for name,digest in build['input_sha256'].items())
folder=ROOT/'local-publish'/revision
artifacts_ok=all((folder/name).stat().st_size==info['bytes']and hashlib.sha256((folder/name).read_bytes()).hexdigest()==info['sha256']for name,info in publication['artifacts'].items())
with urllib.request.urlopen(publication['url'],timeout=10)as response:
    http={'status':response.status,'url':response.geturl(),'correct_revision':('/'+revision+'/')in response.geturl()}
source=ROOT.parents[2]/'Original/3D/CoinSort-HorizontalRoll'
head=subprocess.run(['git','-C',str(source),'rev-parse','HEAD'],capture_output=True,text=True,check=True).stdout.strip()
status=subprocess.run(['git','-C',str(source),'status','--porcelain'],capture_output=True,text=True,check=True).stdout
source_ok=head=='ccb8e2b210a432272e0e4147a64b163484c4aa70'and not status
native=browser['runs']
references=browser.get('reference_runs',[])
qa_ok=len(native)==2 and len(references)==2 and all(run['status']=='PASS'for run in native+references)and all('/'+revision+'/'in run['url']for run in native)
single=None
single_metadata=ROOT/'qa/single-html-package.json'
single_results=ROOT/'qa/single-html-results.json'
if single_metadata.exists()and single_results.exists():
    metadata=json.loads(single_metadata.read_text())
    results=json.loads(single_results.read_text())
    output=Path(metadata['file'])
    digest=hashlib.sha256(output.read_bytes()).hexdigest()
    normalize=lambda value:''.join(char for char in Path(value).stem.casefold()if char.isalnum())
    duplicates=[p.name for p in output.parent.iterdir()if normalize(p.name)==normalize(output.name)]
    single={'file':str(output),'sha256':digest,'bytes':output.stat().st_size,'hash_matches_package_and_test':digest==metadata['sha256']==results['sha256'],
            'unique_output_name':duplicates==[output.name],'no_companion_files':metadata['companion_files_required']is False,
            'offline_qa':results['offline']and len(results['runs'])==2 and all(run['status']=='PASS'and not run.get('external_requests')for run in results['runs'])}
    single['rendered_frames_and_pixels']=all(run.get('initial',{}).get('render_frames',0)>1 and len(run.get('visual',[]))==3 and all(capture['lit']>capture['pixels']*.1 and capture['colored_foreground']>capture['pixels']*.003 for capture in run['visual']) for run in results['runs'])
    qa_ok=all(single[key]for key in ['hash_matches_package_and_test','unique_output_name','no_companion_files','offline_qa','rendered_frames_and_pixels'])
listeners=json.loads((ROOT/'qa/listeners.json').read_text(encoding='utf-8-sig'))
if isinstance(listeners,dict):listeners=[listeners]
loopback_ok=len(listeners)>=2 and all(row['LocalAddress']=='127.0.0.1'for row in listeners)
checks={'successful_build':build['exit_code']==0,'stable_build_inputs':build['inputs_unchanged_during_build'],
        'runtime_inputs_match_build':runtime_ok,'published_files_match_manifest':artifacts_ok,
        'http_serves_tested_revision':http['correct_revision']and http['status']==200,
        'original_clean_and_pinned':source_ok,'headed_source_and_final_native_qa':qa_ok,'loopback_only_listeners':loopback_ok}
report={'captured_utc':datetime.now(timezone.utc).isoformat(),'commit':publication['commit'],'status':'PASS'if all(checks.values())else 'FAIL',
        'checks':checks,'http':http,'published_bytes':sum(x['bytes']for x in publication['artifacts'].values()),'original':{'head':head,'status':status},'listeners':listeners}
if single:report['single_html']=single
(ROOT/'qa/delivery-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
raise SystemExit(0 if report['status']=='PASS'else 1)
