import fs from 'node:fs';
import {cannonTuning} from '../../src/core/cannons.ts';
import {replay} from '../../scripts/overload-replay.mjs';
const queues=JSON.parse(fs.readFileSync('analysis/evidence/balance-compact.json'));
for(const advance of [.15,.2,.25]){
 cannonTuning.advanceSeconds=advance;
 for(const cadence of [.65,.75,.8]){const r=replay(queues,{cadence,limit:75});console.log({advance,cadence,time:r.time,ending:r.ending});}
}
