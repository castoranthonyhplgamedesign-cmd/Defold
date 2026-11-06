import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {conveyorPoints,parseFlowDraft,flowRuntime,anchorAt} from '../src/layout/arrowFlow.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
import {Cannons} from '../src/core/cannons.ts';
import {trackGeometry} from '../src/render/track.ts';
const fixture=(name='four-sides')=>JSON.parse(fs.readFileSync(`examples/levels/${name}.arrow-flow.json`));
const perimeter=p=>p.reduce((sum,a,i)=>sum+Math.hypot(a[0]-p[(i+1)%p.length][0],a[1]-p[(i+1)%p.length][1]),0);

test('drawn rounding uses circular corners, preserves edit points and supports slants and inward bends',()=>{
 const doc=fixture(),original=structuredClone(doc.conveyor.points);assert.equal(conveyorPoints(doc.conveyor),doc.conveyor.points);
 doc.conveyor.cornerRadius=2;const path=conveyorPoints(doc.conveyor);assert.equal(path.length,40);assert.deepEqual(doc.conveyor.points,original);assert(perimeter(path)<perimeter(original));
 // First corner is (5,-5); the radius-2 circle is centered on (3,-3).
 path.slice(0,10).forEach(p=>assert(Math.abs(Math.hypot(p[0]-3,p[1]+3)-2)<1e-9));
 for(const name of ['four-sides','inward-bend'])for(const reverse of [false,true]){
  const d=fixture(name);d.board.arrows=[];d.cannons=[];d.conveyor.cornerRadius=2;
  const angle=.32,c=Math.cos(angle),s=Math.sin(angle);d.conveyor.points=d.conveyor.points.map(([x,y])=>[x*c-y*s,x*s+y*c]);if(reverse)d.conveyor.points.reverse();assert.doesNotThrow(()=>parseFlowDraft(d));
  const r=flowRuntime(d),geometries=trackGeometry(r.path,r.trackWidth);geometries.forEach(g=>{assert([...g.attributes.position.array].every(Number.isFinite));g.dispose();});
 }
});
test('rounded conveyor geometry, motion and cannon anchors share one path in either direction',()=>{
 for(const name of ['four-sides','inward-bend'])for(const direction of [1,-1]){
  const d=fixture(name);d.conveyor.cornerRadius=2;d.conveyor.direction=direction;parseFlowDraft(d);
  const controls=structuredClone(d.conveyor.points),r=flowRuntime(d),path=conveyorPoints(d.conveyor);assert.deepEqual(r.path,(direction===1?path:[...path].reverse()).map(([x,y])=>[x+d.origin[0],0,-y+d.origin[1]]));
  const cannons=new Cannons(r.shooters);cannons.lanes.forEach((lane,i)=>{const p=cannons.detector(lane),target=anchorAt(path,d.cannons[i].progress).point;assert(Math.abs(p[0]-target[0]-d.origin[0])<1e-8);assert(Math.abs(p[2]+target[1]-d.origin[1])<1e-8);});
  const sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);r.arrows.forEach(a=>assert.equal(sim.launch(a.id),'accepted'));for(let i=0;i<7200;i++)sim.advance(1/60);assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)));assert.deepEqual(d.conveyor.points,controls);
  assert.deepEqual(parseFlowDraft(JSON.parse(JSON.stringify(d))),d);
 }
});
test('rounding rejects invalid radius, tight bends and arrows clipped by the rounded belt',()=>{
 const schema=JSON.parse(fs.readFileSync('schemas/arrow-flow-v1.schema.json'));
 schema.properties.conveyor.oneOf.forEach(branch=>assert(!branch.required.includes('cornerRadius'),'Rounding stays optional for older polygon and mesh files'));
 for(const radius of [-1,NaN,Infinity,11]){const d=fixture();d.conveyor.cornerRadius=radius;assert.throws(()=>parseFlowDraft(d));}
 const tight=fixture();tight.board.arrows=[];tight.cannons=[];tight.conveyor.points=[[5,-.85],[-5,-.85],[-5,.85],[5,.85]];parseFlowDraft(tight);tight.conveyor.cornerRadius=1;assert.throws(()=>parseFlowDraft(tight));
 const crowded=fixture();crowded.cannons=[];crowded.board.arrows=[{id:'corner',color:'green',head:[3,3],body:[],facing:'Right'}];parseFlowDraft(crowded);crowded.conveyor.cornerRadius=10;assert.throws(()=>parseFlowDraft(crowded),/clearance/);
 const mesh=JSON.parse(fs.readFileSync('examples/levels/artist-rounded.arrow-flow.json'));const points=mesh.conveyor.points;mesh.conveyor.cornerRadius=0;assert.equal(conveyorPoints(mesh.conveyor),points);mesh.conveyor.cornerRadius=2;assert.throws(()=>parseFlowDraft(mesh),/Imported/);
});
