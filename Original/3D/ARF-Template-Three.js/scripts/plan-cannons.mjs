// Validate the authored overload plan; never overwrite it with an unverified automatic queue.
// Usage: node scripts/plan-cannons.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {overloadQueues,overloadHintOrder} from '../src/data/overloadCannons.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
import {replay,runtime} from './overload-replay.mjs';

assert.equal(process.argv.length,2,'This validator uses levels/overload-level.arrow-flow.json and its authored cannon queues.');
const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json'));
const sim=new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),[],doc.board.grid.size);
const blocks=runtime.arrows.reduce((n,a)=>(n[a.color]=(n[a.color]??0)+a.cells.length,n),{white:sim.preloaded.length});
const ammo=overloadQueues.flat().reduce((n,c)=>(n[c.color]=(n[c.color]??0)+c.ammo,n),{});
assert.deepEqual(ammo,blocks);
const runs=[];
for(const options of [{cadence:.65},{cadence:.7},{cadence:.75},{cadence:.8},{cadence:.75,idle:2},{cadence:.7,hesitation:{after:20,seconds:2}}]){
 const result=replay(overloadQueues,{...options,guided:true,duration:60,limit:65});
 assert.equal(result.ending,'clear',`Plan misses 60 seconds: ${JSON.stringify(options)}`);
 assert.equal(result.launched,runtime.arrows.length);assert.equal(result.whites,0);
 runs.push({options,...result});
}
// Deliberately record an alternative order too: this is a solvable challenge, not a guaranteed win.
const alternate=replay(overloadQueues,{cadence:.75,reverse:true,duration:60,limit:65});
fs.mkdirSync('analysis/evidence',{recursive:true});
fs.writeFileSync('analysis/evidence/overload-balance.json',JSON.stringify({at:new Date().toISOString(),policy:'Follow the displayed authored hint; no automatic launches or state edits',ammo,queues:overloadQueues,hintOrder:overloadHintOrder,runs,alternate},null,2));
console.log(JSON.stringify({ammo,runs:runs.map(r=>({options:r.options,time:r.time,ending:r.ending})),alternate:{time:alternate.time,ending:alternate.ending,launched:alternate.launched}},null,2));
