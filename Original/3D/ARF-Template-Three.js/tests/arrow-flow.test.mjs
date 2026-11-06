import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseFlowDocument,flowRuntime,flowWarnings,anchorAt,cannonPose,validateFlowSettings} from '../src/layout/arrowFlow.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Cannons,lanePoint} from '../src/core/cannons.ts';
import {trackGeometry} from '../src/render/track.ts';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const fixture=()=>read('examples/levels/four-sides.arrow-flow.json');
const near=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
test('reference export preserves every cell, direction, lane and ammo queue',()=>{
 const doc=parseFlowDocument(read('examples/levels/reference.arrow-flow.json')),data=flowRuntime(doc),original=read('src/data/level.json');
 assert.equal(data.arrows.length,79);
 for(let i=0;i<original.arrows.length;i++){
  const a=data.arrows[i],b=original.arrows[i];assert.equal(a.id,b.id);assert.equal(a.color,b.color);
  for(const field of ['position','direction'])a[field].forEach((n,j)=>near(n,b[field][j]));
  assert.equal(a.cells.length,b.cells.length);a.cells.flat().forEach((n,j)=>near(n,b.cells.flat()[j]));
 }
 data.shooters.forEach((a,i)=>{const b=original.shooters[i];a.position.forEach((n,j)=>near(n,b.position[j]));near(a.yaw,0);assert.deepEqual(a.queue,b.queue);});
 const path=read('src/data/path.json');assert.equal(data.path.length,path.length);data.path.flat().forEach((n,i)=>near(n,path.flat()[i]));
});
test('format validation rejects dangerous or unsupported layouts without mutating input',()=>{
 const doc=fixture(),before=structuredClone(doc);assert.deepEqual(parseFlowDocument(doc),doc);assert.deepEqual(doc,before);
 for(const change of [
  d=>d.version=2,d=>d.board.arrows[0].color='red',d=>d.board.arrows[0].body=[[2,2]],
  d=>d.board.arrows[1].head=[0,2],d=>d.board.arrows[0].head=[5,2],
  d=>d.conveyor.points=[[5,5],[-5,-5],[-5,5],[5,-5]],
  d=>d.conveyor.points=[[5,-5],[-5,-5],[0,0],[-5,5],[5,5]],
  d=>d.conveyor.points[0]=[Infinity,0],d=>d.cannons[0].queue[0].ammo=-1,
  d=>d.cannons[0].angle=0,d=>d.cannons[1].id=d.cannons[0].id,d=>d.extra=true,
 ]){const bad=fixture();change(bad);assert.throws(()=>parseFlowDocument(bad));}
 assert.equal(flowWarnings(doc).length,0);doc.cannons=[];assert.equal(flowWarnings(doc).length,5);
});
test('travel reversal keeps anchors fixed, both polygon windings give inward normals, IDs stay unique',()=>{
 const doc=parseFlowDocument(fixture()),forward=flowRuntime(doc);doc.conveyor.direction=-1;const reverse=flowRuntime(doc);
 assert.deepEqual(reverse.path,[...forward.path].reverse());assert.deepEqual(reverse.shooters,forward.shooters);
 for(const p of [doc.conveyor.points,[...doc.conveyor.points].reverse()])for(const t of [.125,.375,.625,.875]){
  const a=anchorAt(p,t),yaw=a.angle*Math.PI/180;assert(Math.sin(yaw)*-a.point[0]+Math.cos(yaw)*a.point[1]>0);
 }
 doc.board.arrows.forEach((a,i)=>a.id=['0','01','1','custom'][i]);assert.equal(new Set(flowRuntime(doc).arrows.map(a=>a.id)).size,4);
});
test('rotated cannons detect swept contacts and spend ammo on all sides',()=>{
 const doc=fixture();for(const authored of doc.cannons){
  const lane={...cannonPose(doc,authored),queue:[{color:'green',ammo:2}]},core=new Cannons([lane]),cannon=core.lanes[0].queue[0];
  const segment={color:'green',removed:false,inTransit:false,position:lanePoint(lane,3,.428,5.313),previousPosition:lanePoint(lane,-3,.428,5.313)};
  core.update(.01,[segment],[segment],s=>s.removed=true);assert.equal(core.shots.length,1);
  assert.deepEqual(core.shots[0].origin,lanePoint(lane,0,1.178,2.95));
  core.update(.1,[segment],[segment],s=>s.removed=true);assert(segment.removed);assert.equal(cannon.ammo,1);
 }
});
test('custom loops transfer and shoot all four arrows in either travel direction',()=>{
 for(const points of [fixture().conveyor.points,[[6,0],[3,-6],[-3,-6],[-6,0],[-3,6],[3,6]]])for(const direction of [1,-1]){
  const doc=fixture();doc.conveyor.points=points;doc.conveyor.direction=direction;const d=flowRuntime(parseFlowDocument(doc)),s=new Simulation(d.arrows,new ConveyorPath(d.path,.1,'first-intersection'),d.shooters);
  for(const a of d.arrows)assert.equal(s.launch(a.id),'accepted');
  for(let i=0;i<1200;i++)s.advance(1/60);
  assert.equal(s.arrows.flatMap(a=>a.segments).filter(a=>!a.removed).length,0);
 }
});
test('inward bends use the first crossing and ignore board arrows beyond the belt',()=>{
 for(const winding of [1,-1])for(const direction of [1,-1]){
  const doc=read('examples/levels/inward-bend.arrow-flow.json');if(winding<0)doc.conveyor.points.reverse();doc.conveyor.direction=direction;
  const data=flowRuntime(parseFlowDocument(doc)),path=new ConveyorPath(data.path,.1,'first-intersection'),sim=new Simulation(data.arrows,path,data.shooters);
  near(path.position(path.entry([-5,0,-5],[1,0,0]))[0],-2);
  near(path.position(path.entry([5,0,-5],[-1,0,0]))[0],2);
  for(const arrow of data.arrows)assert.equal(sim.launch(arrow.id),'accepted');
  for(let i=0;i<3600;i++)sim.advance(1/60);
  assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)),'Indented loop clears all queued colors');
  const meshes=trackGeometry(data.path,1.3);for(const g of meshes){assert(g.attributes.position.array.every(Number.isFinite));g.dispose();}
 }
 const doc=read('examples/levels/inward-bend.arrow-flow.json');
 doc.board.arrows[0].head=[0,5];assert.throws(()=>parseFlowDocument(doc),/clearance/);
 const narrow=read('examples/levels/inward-bend.arrow-flow.json');narrow.conveyor.points=[[-5,-5],[5,-5],[5,5],[.5,5],[.5,0],[-.5,0],[-.5,5],[-5,5]];
 assert.throws(()=>validateFlowSettings(narrow),/width|narrow/);
 const touching=read('examples/levels/inward-bend.arrow-flow.json');touching.conveyor.points=[[0,0],[8,0],[8,8],[0,8],[0,0],[-8,8],[-8,0]];
 assert.throws(()=>validateFlowSettings(touching),/crossings|touching/);
});
test('procedural belt creates finite extruded geometry for either winding',()=>{
 for(const points of [fixture().conveyor.points,[...fixture().conveyor.points].reverse()]){
  const geometries=trackGeometry(points.map(([x,y])=>[x,0,-y]),1.3);
  for(const g of geometries){assert(g.attributes.position.count>0);assert([...g.attributes.position.array].every(Number.isFinite));g.computeBoundingBox();assert(g.boundingBox.min.x<-5);assert(g.boundingBox.max.x>5);g.dispose();}
 }
});
