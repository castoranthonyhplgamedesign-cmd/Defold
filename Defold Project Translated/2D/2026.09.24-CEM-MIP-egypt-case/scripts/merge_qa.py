"""Retain the full matrix and transparently apply a targeted corrective rerun."""
from pathlib import Path
import json,subprocess,shutil
ROOT=Path(__file__).resolve().parents[1];p=ROOT/'qa/evidence'
full=json.loads((p/'report.json').read_text(encoding='utf8'))
followup=json.loads((p/'report-filtered.json').read_text(encoding='utf8'))
assert followup['failed']==0,'Corrective rerun must pass'
shutil.copy2(p/'report.json',p/'history/before-query-fix.json')
replacements={result['name']:result for result in followup['results']}
assert replacements.keys() <= {result['name'] for result in full['results']}
full['followup']={'reason':'Fix local query variant precedence when the page assigns its built-in defaults; rerun affected limit, config, rapid-input, fallback and rotation checks.',
                  'commit':subprocess.check_output(['git','-C',str(ROOT),'rev-parse','HEAD'],text=True).strip(),
                  'date':followup['date'],'rerun_checks':list(replacements),
                  'initial_passed':full['passed'],'initial_failed':full['failed']}
full['results']=[replacements.get(result['name'],result) for result in full['results']]
full['passed']=sum(result['status']=='PASS' for result in full['results'])
full['failed']=sum(result['status']=='FAIL' for result in full['results'])
full['errors']+=followup['errors'];full['requests']+=followup['requests']
assert full['failed']==0
(p/'report.json').write_text(json.dumps(full,indent=2),encoding='utf8')
print(f"Final coverage: {full['passed']} passed, {full['failed']} failed; {len(replacements)} corrective reruns recorded.")
