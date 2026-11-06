import fs from 'node:fs';
import {registerHooks} from 'node:module';
const width=Number(process.argv[2]??2.2);
registerHooks({load(url,context,next){const result=next(url,context);if(url.endsWith('/core/cannons.ts'))result.source=String(result.source).replace('half = [1.489 / 2 + .5, 2.585 / 2 + .75, 1]','half = ['+width+', 2.585 / 2 + .75, 1.5]');return result;}});
const {replay}=await import('../../scripts/overload-replay.mjs');
const queues=JSON.parse(fs.readFileSync('analysis/evidence/balance-refined.json')).queues;
for(const options of [{cadence:.65},{cadence:.75},{cadence:.8},{cadence:.75,reverse:true}]){const r=replay(queues,{...options,limit:95});console.log({width,options,time:r.time,ending:r.ending});}
