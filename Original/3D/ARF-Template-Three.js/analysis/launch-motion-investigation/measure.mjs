import fs from 'node:fs';import assert from 'node:assert/strict';
import {flowRuntime} from '../../src/layout/arrowFlow.ts';import {ConveyorPath,distance} from '../../src/core/path.ts';import {Simulation} from '../../src/core/simulation.ts';
const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json')),data=flowRuntime(doc),runs=[];
for(const id of [0,2,27,51,58]){
 const sim=new Simulation([data.arrows.find(a=>a.id===id)],new ConveyorPath(data.path,.1,'first-intersection'),[],doc.board.grid.size);
 sim.preloaded.slice(60).forEach(s=>sim.remove(s));const arrow=sim.arrows[0],events=[],frames=[];let time=0;
 assert.equal(sim.launch(id),'accepted');const route=structuredClone(arrow.route),plannedEntry=arrow.entry;
 const insert=sim.insert.bind(sim);sim.insert=(part,entry,...rest)=>{const result=insert(part,entry,...rest);if(result)events.push({time:time+1/120,index:part.index,entry,entryPosition:sim.path.position(entry),plannedEntryDistance:distance(sim.path.position(entry),sim.path.position(plannedEntry))});return result;};
 for(let i=0;i<480&&!arrow.done;i++){
  const old=arrow.segments.map(s=>[...s.position]);sim.advance(1/120);time+=1/120;
  const s=arrow.segments[0],t=sim.transferProgress(s),transferring=sim.isTransferring(s),rise=s.progress===null?0:transferring?t**3:1;
  frames.push({time,headPosition:[...s.position],reserved:s.progress!==null,transferring,handoff:t,headSpeed:distance(old[0],s.position)*120,headTailDistance:arrow.segments[1]?distance(s.position,arrow.segments[1].position):0,headY:-1.55*doc.board.grid.size*(1-rise*rise*(3-2*rise)),scale:s.progress!==null?.9:1});
 }
 assert(arrow.done);
 const before=frames.filter(f=>!f.reserved),during=frames.filter(f=>f.transferring);
 runs.push({id,fixture:'Single original arrow, 60 whites, no cannons; unchanged movement code',cellSize:doc.board.grid.size,launchSpeed:sim.launchSpeed,plannedRouteLength:route.lengths.at(-1),takeoverDistance:route.merge,remainingPlannedCurve:route.lengths.at(-1)-route.merge,peakBefore:Math.max(0,...before.map(f=>f.headSpeed)),peakDuring:Math.max(...during.map(f=>f.headSpeed)),events,frames});
}
fs.writeFileSync('analysis/launch-motion-investigation/measurements.json',JSON.stringify({at:new Date().toISOString(),runs},null,2));console.log(runs.map(({frames,...r})=>r));
