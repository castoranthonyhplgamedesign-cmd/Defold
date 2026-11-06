import fs from 'node:fs';
import {registerHooks} from 'node:module';
const source=JSON.parse(fs.readFileSync('analysis/evidence/overload-guidance-core.json'));
const guide=source.results.find(r=>r.cadence===.7).log.map(r=>r.id);
registerHooks({load(url,context,next){const r=next(url,context);if(url.endsWith('/scripts/overload-replay.mjs'))r.source=String(r.source).replace('const a=guided?candidates.find(a=>a.data.id===session.hintId):candidates[0];',`const planned=${JSON.stringify(guide)}.map(id=>sim.arrows.find(a=>a.data.id===id)).find(a=>!a.moving);const a=planned&&sim.canMove(planned)&&(sim.fits(planned)||planned.segments.length<=sim.room-8)?planned:undefined;`);return r;}});
const {replay}=await import('../../scripts/overload-replay.mjs');
const {overloadQueues}=await import('../../src/data/overloadCannons.ts');
const results=[];
for(const cadence of [.6,.7,.75,.8,.85,.9]){const r=replay(overloadQueues,{cadence,step:1/60,limit:100});results.push({cadence,...r});console.log({cadence,time:r.time,ending:r.ending});}
fs.writeFileSync('analysis/evidence/fixed-guide-probe.json',JSON.stringify({guide,results},null,2));
