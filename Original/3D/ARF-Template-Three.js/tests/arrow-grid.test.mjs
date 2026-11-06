import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {parseFlowDocument,parseFlowDraft,flowRuntime,gridPoint,gridCell,insideLoop,conveyorPoints,gridClearance} from '../src/layout/arrowFlow.ts';
import {arrowPoints,centerGrid,usableGridCells,nearestProgress,extendArrow} from '../tools/level-editor/model.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath,distance} from '../src/core/path.ts';
const fixture=()=>JSON.parse(fs.readFileSync('examples/levels/four-sides.arrow-flow.json'));
test('grid transform round-trips cells and preserves legacy level/runtime output',()=>{
 const doc=fixture(),before=flowRuntime(doc);doc.board.grid={size:1,offset:[0,0]};assert.deepEqual(flowRuntime(doc),before);
 doc.board.grid={size:.75,offset:[.35,-.2]};parseFlowDocument(doc);
 for(const p of [[0,0],[-3,2],[2,-1]])assert.deepEqual(gridCell(doc.board,gridPoint(doc.board,p)),p);
 assert.deepEqual(parseFlowDocument(JSON.parse(JSON.stringify(doc))),doc);
 const r=flowRuntime(doc);assert.deepEqual(r.path,before.path);assert.deepEqual(r.shooters,before.shooters);assert.equal(r.arrows[0].cellSize,.75);
 const p=arrowPoints(doc,doc.board.arrows[0])[0];assert.deepEqual(r.arrows[0].position,[p[0],0,-p[1]]);
 for(const grid of [{size:.49,offset:[0,0]},{size:1.51,offset:[0,0]},{size:NaN,offset:[0,0]},{size:1,offset:[Infinity,0]},{size:1,offset:[1000,1000]}]){const bad=structuredClone(doc);bad.board.grid=grid;assert.throws(()=>parseFlowDocument(bad));}
});
test('usable grid and drawing share clearance on rounded, concave and imported conveyors',()=>{
 const remote=fixture();remote.board.grid={size:.5,offset:[999,999]};assert.deepEqual(usableGridCells(remote),[],'Do not advertise cells beyond supported logical coordinates');
 const docs=[fixture(),JSON.parse(fs.readFileSync('examples/levels/inward-bend.arrow-flow.json')),JSON.parse(fs.readFileSync('analysis/artist-rescue/playable-qa.arrow-flow.json'))];
 docs[0].conveyor.cornerRadius=1;
 for(const doc of docs){doc.board.arrows=[];doc.board.grid={size:.75,offset:[.2,.1]};parseFlowDraft(doc);const cells=usableGridCells(doc),path=conveyorPoints(doc.conveyor);assert(cells.length>0);assert(cells.length<=10000);assert(cells.every(p=>insideLoop(gridPoint(doc.board,p),path,gridClearance(doc))));assert.equal(usableGridCells(doc),cells);
  const start=cells.find(p=>cells.some(q=>q[0]===p[0]+1&&q[1]===p[1]));assert.equal(extendArrow(doc,[start],[start[0]+1,start[1]]).length,2);assert.throws(()=>extendArrow(doc,[start],[1000,1000]));
  const copy=structuredClone(doc.conveyor);centerGrid(doc);assert.deepEqual(doc.conveyor,copy);assert.equal(doc.board.grid.size,.75);
 }
});
test('scaled grids preserve lane blocking and contact-timed feedback without blocking adjacent rows',()=>{
 for(const size of [.5,.75,1.5]){
  const doc=fixture();doc.conveyor.points=doc.conveyor.points.map(p=>p.map(v=>v*2));doc.cannons=[];doc.board.grid={size,offset:[.35,-.2]};doc.board.arrows=[{id:'a',color:'green',head:[0,0],body:[[-1,0]],facing:'Right'},{id:'b',color:'green',head:[2,0],body:[[1,0]],facing:'Right'},{id:'c',color:'green',head:[0,1],body:[[-1,0]],facing:'Right'}];
  const r=flowRuntime(parseFlowDocument(doc)),sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'));const arrow=sim.arrows[0],origin=[...arrow.segments[0].position];assert(!sim.canMove(arrow));assert(sim.canMove(sim.arrows[2]));let contacts=0;sim.onBlockedContact=()=>contacts++;assert.equal(sim.launch(arrow.data.id),'blocked');assert.equal(contacts,0);
  const feedback=arrow.feedback;feedback.elapsed=feedback.approachSeconds;assert(Math.abs(distance(feedback.position(0),sim.arrows[1].segments[0].position)-.78*size)<1e-6);feedback.elapsed=0;
  for(let i=0;i<240;i++)sim.advance(1/120);assert.equal(contacts,1);assert.equal(arrow.feedback,null);assert.deepEqual(arrow.segments[0].position,origin);
 }
});
test('small and large bent arrows launch, follow and clear in either conveyor direction',()=>{
 for(const size of [.5,.75,1.5])for(const direction of [1,-1]){
  const doc=fixture();doc.board.grid={size,offset:[.35,-.2]};doc.conveyor.direction=direction;doc.board.arrows=[{id:'qa',color:'green',head:[1,0],body:[[-1,0],[-2,0],[-2,-1],[-3,-1]],facing:'Right'}];
  const top=Math.max(...doc.conveyor.points.map(p=>p[1]));doc.cannons=[{id:'c',progress:nearestProgress(doc.conveyor.points,[0,top]).progress,position:[0,top+6],offset:5.313,angle:null,queue:[{color:'green',ammo:5}]}];
  const r=flowRuntime(parseFlowDocument(doc)),sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);assert.equal(sim.launch(r.arrows[0].id),'accepted');for(let i=0;i<3600;i++)sim.advance(1/60);assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)),`size ${size} direction ${direction}`);
 }
});
