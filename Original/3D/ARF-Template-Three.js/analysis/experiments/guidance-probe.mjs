import {registerHooks} from 'node:module';
import fs from 'node:fs';
const weight=Number(process.argv[2]??0);
registerHooks({load(url,context,next){const r=next(url,context);if(url.endsWith('/scripts/overload-replay.mjs'))r.source=String(r.source).replace('const candidates=sim.hintable',`const eta=a=>{
 const lanes=sim.cannons.lanes.filter(l=>l.queue[0]?.color===a.data.color);
 return Math.min(100,...lanes.map(l=>sim.unitsBetween(a.entry,sim.path.closest(sim.cannons.detector(l)))/10+${weight}*Math.max(0,l.queue[0].ammo-a.segments.length)));
 };const candidates=sim.hintable`).replace('(reverse?-1:1)*(a.data.position[0]-b.data.position[0])',weight===-1?'Number(b.data.color===log.at(-1)?.color)-Number(a.data.color===log.at(-1)?.color)||a.data.position[0]-b.data.position[0]':'eta(a)-eta(b)||a.data.position[0]-b.data.position[0]');return r;}});
const {replay}=await import('../../scripts/overload-replay.mjs');
const {overloadQueues}=await import('../../src/data/overloadCannons.ts');
const results=[];
for(const cadence of [.6,.75,.8,.9]){const r=replay(overloadQueues,{cadence,step:1/60,limit:100});results.push({cadence,...r});console.log({weight,cadence,time:r.time,ending:r.ending,first:r.log[0]?.id});}
fs.writeFileSync(`analysis/evidence/guidance-probe-${weight}.json`,JSON.stringify(results,null,2));
