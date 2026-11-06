import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {conveyorGLB} from './fixtures/conveyor-glb.mjs';
import {readConveyorGLB,importConveyor,conveyorSurfaces} from '../tools/level-editor/import-glb.ts';
import {parseFlowDraft,flowRuntime,anchorAt} from '../src/layout/arrowFlow.ts';
import {arrangeCannons,cannonBase} from '../tools/level-editor/model.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Cannons} from '../src/core/cannons.ts';
const fixture=()=>JSON.parse(fs.readFileSync('examples/levels/four-sides.arrow-flow.json'));

test('belt detection uses geometry rather than artist names and reports ambiguity',()=>{
 const parts=readConveyorGLB(conveyorGLB());parts[0].name='blue surface';parts[1].name='frame';assert.deepEqual(conveyorSurfaces(parts),[1]);
 assert.deepEqual(conveyorSurfaces([...parts].reverse()),[0]);
 assert.deepEqual(conveyorSurfaces([parts[0]]),[]);
 assert.deepEqual(conveyorSurfaces([...parts,structuredClone(parts[1])]),[1,2]);
});

test('artist GLB import preserves triangles, derives rounded path, scales and rotates transformed nodes',()=>{
 const parts=readConveyorGLB(conveyorGLB(j=>{j.nodes[0].translation=[3,2,-4];j.nodes[0].scale=[2,2,2];}));
 assert.equal(parts.reduce((n,p)=>n+p.index.length/3,0),16968);
 const a=importConveyor(parts,1,[0],1.3),b=importConveyor(parts,1,[0],2.6,1);
 assert.equal(a.points.length,606);assert.equal(b.points.length,606);
 a.points.forEach((p,i)=>{assert(Math.abs(b.points[i][0]+2*p[1])<1e-6);assert(Math.abs(b.points[i][1]-2*p[0])<1e-6);});
 const doc=fixture();doc.board.arrows=[];doc.cannons=[];doc.conveyor=a;assert.deepEqual(parseFlowDraft(JSON.parse(JSON.stringify(doc))),doc);
});
test('model importer rejects malformed, external, compressed, non-ring and oversized geometry',()=>{
 for(const edit of [j=>j.buffers[0].uri='https://example.invalid/model.bin',j=>j.images=[{uri:'https://example.invalid/a.png'}],j=>j.extensionsRequired=['KHR_draco_mesh_compression'],j=>j.accessors[0].count=100001,j=>j.accessors[0].byteOffset=9e6,j=>j.nodes[0].children=[0]])assert.throws(()=>readConveyorGLB(conveyorGLB(edit)));
 assert.throws(()=>readConveyorGLB(new ArrayBuffer(40)));
 const parts=readConveyorGLB(conveyorGLB());assert.throws(()=>importConveyor(parts,0,[1]),/flat/);assert.throws(()=>importConveyor(parts,1,[1]));
 const broken=structuredClone(parts);broken[1].index=broken[1].index.slice(0,3);assert.throws(()=>importConveyor(broken,1,[0]),/ring|hole/);
});
test('free cannon placement keeps detector at its assigned anchor and clears at unequal distances',()=>{
 for(const direction of [1,-1]){const d=fixture();d.conveyor.direction=direction;d.cannons.forEach((c,i)=>c.position=[[-10,-18],[-17,4],[1,20],[20,-2]][i]);parseFlowDraft(d);
  const r=flowRuntime(d),c=new Cannons(r.shooters);c.lanes.forEach((lane,i)=>{const p=c.detector(lane),anchor=anchorAt(d.conveyor.points,d.cannons[i].progress).point;assert(Math.abs(p[0]-anchor[0])<1e-8);assert(Math.abs(p[2]+anchor[1])<1e-8);});
  const sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);r.arrows.forEach(a=>assert.equal(sim.launch(a.id),'accepted'));for(let i=0;i<3600;i++)sim.advance(1/60);assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)));
  assert.deepEqual(parseFlowDraft(JSON.parse(JSON.stringify(d))),d);
 }
});
test('row alignment and distribution preserve target anchors; invalid placement is rejected',()=>{
 const d=fixture();d.cannons=d.cannons.slice(0,3);d.cannons.forEach((c,i)=>{c.position=[[-9,12],[1,16],[8,15]][i];c.progress=.625;});const progress=d.cannons.map(c=>c.progress);
 arrangeCannons(d,'row',d.cannons[1].id);assert.deepEqual(d.cannons.map(c=>cannonBase(d,c)[1]),[16,16,16]);arrangeCannons(d,'space',d.cannons[1].id);assert.deepEqual(d.cannons.map(c=>c.position[0]),[-9,-.5,8]);assert.deepEqual(d.cannons.map(c=>c.progress),progress);parseFlowDraft(d);
 for(const position of [[0,0],[0,5],[0,6],[NaN,12]]){const bad=structuredClone(d);bad.cannons[0].position=position;assert.throws(()=>parseFlowDraft(bad));}
});
