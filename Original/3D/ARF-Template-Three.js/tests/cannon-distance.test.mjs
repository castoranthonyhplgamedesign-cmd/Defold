import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {parseFlowDocument,flowRuntime} from '../src/layout/arrowFlow.ts';
import {Cannons} from '../src/core/cannons.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
const fixture=()=>JSON.parse(fs.readFileSync('examples/levels/four-sides.arrow-flow.json'));

test('custom cannon distance keeps detectors on all four belt anchors and clears both directions',()=>{
 const anchors=[[0,5],[-5,0],[0,-5],[5,0]];
 for(const offset of [4,7])for(const direction of [1,-1]){
  const doc=fixture();doc.conveyor.direction=direction;doc.cannons.forEach(c=>c.offset=offset);
  const r=flowRuntime(parseFlowDocument(doc)),sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);
  const cannons=new Cannons(r.shooters);
  cannons.lanes.forEach((lane,i)=>{
   const detector=cannons.detector(lane);
   assert(Math.abs(detector[0]-anchors[i][0])<1e-9);assert(Math.abs(detector[2]-anchors[i][1])<1e-9);
   assert(Math.abs(Math.hypot(lane.position[0]-detector[0],lane.position[2]-detector[2])-offset)<1e-9);
  });
  r.arrows.forEach(a=>assert.equal(sim.launch(a.id),'accepted'));
  for(let i=0;i<3600;i++)sim.advance(1/60);
  assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)));
 }
});

test('reference cannon distance stays fixed and invalid custom distances are rejected',()=>{
 const lane={position:[0,0,0],queue:[{color:'green',ammo:1}]},c=new Cannons([lane]);
 assert.equal(c.detector(c.lanes[0])[2],2.2+3.113);
 for(const detectorDistance of [0,-1,NaN,Infinity])assert.throws(()=>new Cannons([{...lane,detectorDistance}]));
 for(const offset of [3,8]){const doc=fixture();doc.cannons[0].offset=offset;assert.throws(()=>parseFlowDocument(doc));}
});
