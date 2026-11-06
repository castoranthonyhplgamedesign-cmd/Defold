import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const readLog = name => { const data=fs.readFileSync(path.join(dir,name)); return data[0]===255&&data[1]===254?data.subarray(2).toString('utf16le'):data.toString('utf8'); };
const summary = {date:'2026-10-29',timezone:'Asia/Manila',sourceEdits:false,chaos:{}};
for (const mechanic of ['tap','swipe']) {
  let log = readLog(`chaos-${mechanic}.log`).replaceAll('\r','');
  if (fs.existsSync(path.join(dir,`chaos-${mechanic}-isolated.log`))) log += '\n'+readLog(`chaos-${mechanic}-isolated.log`).replaceAll('\r','');
  const records = [...log.matchAll(/^(PASS|FAIL)\s+run (\d+) seed (\d+) (.*?): (\d+) actions \((\d+) rotations, (\d+) pauses\), (.*?) at counted (\d+), (\d+) buckets; (.*)$/gm)].map(m=>({pass:m[1]==='PASS',run:+m[2],seed:+m[3],variant:m[4],actions:+m[5],rotations:+m[6],pauses:+m[7],endReason:m[8],counted:+m[9],buckets:+m[10],events:m[11].split(' > ')}));
  summary.chaos[mechanic] = {completed:records.length,passed:records.filter(r=>r.pass).length,failed:records.filter(r=>!r.pass).length,actions:records.reduce((s,r)=>s+r.actions,0),rotations:records.reduce((s,r)=>s+r.rotations,0),pauses:records.reduce((s,r)=>s+r.pauses,0),records};
}
summary.fullGameplay = /QA passed\./.test(readLog('gameplay.log'));
summary.build = JSON.parse(fs.readFileSync(path.join(dir,'build-audit.json'),'utf8')).summary;
if (fs.existsSync(path.join(dir,'performance.json'))) {
  const performance = JSON.parse(fs.readFileSync(path.join(dir,'performance.json'),'utf8'));
  summary.performance={errors:performance.errors,samples:performance.samples.map(s=>({mechanic:s.mechanic,cpuThrottle:s.cpuThrottleRate,renderer:s.renderer.unmaskedRenderer,phases:s.phases.map(p=>({phase:p.phase,gameFps:p.gameFramesPerSecond,p95FrameMs:p.raf.p95IntervalMs,maxFrameMs:p.raf.maximumIntervalMs,longTasks:p.longTasks.count}))}))};
}
const proofFile = path.join(dir,'instrumented-isolated/cuttingsand_default/run5-off-sand.json');
if(fs.existsSync(proofFile)) {
  const records=JSON.parse(fs.readFileSync(proofFile,'utf8'));
  summary.tap5CounterProof={belowPictureProbes:records.length,publishedFlags:records.filter(r=>r.publishedFailure).length,actualCountChanges:records.filter(r=>r.actualFailure).length,staleSnapshotProof:records.filter(r=>r.publishedFailure&&!r.actualFailure).map(r=>({action:r.actionIndex,beforePublished:r.before.published.counted,beforeActual:r.before.actualCount,afterPublished:r.after.published.counted,afterActual:r.after.actualCount,design:r.design}))};
}
fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({...summary,chaos:Object.fromEntries(Object.entries(summary.chaos).map(([k,v])=>[k,{...v,records:undefined}]))},null,2));
