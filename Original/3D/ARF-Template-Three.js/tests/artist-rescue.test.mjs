import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {readConveyorGLB,conveyorSurfaces,conveyorFrame,conveyorPieces,importConveyor} from '../tools/level-editor/import-glb.ts';
import {projectedBeltOutline} from '../tools/level-editor/belt-outline.ts';
import {parseFlowDraft,flowRuntime,meshBytes} from '../src/layout/arrowFlow.ts';
import {nearestProgress} from '../tools/level-editor/model.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath} from '../src/core/path.ts';
const source=()=>{const b=fs.readFileSync('analysis/artist-rescue/Conveyor bridge.glb');return readConveyorGLB(b.buffer.slice(b.byteOffset,b.byteOffset+b.length));};
test('cat import retains all whisker/frame artwork with correct color groups and bounded authoring geometry',()=>{
 const p=source(),copy=structuredClone(p);assert.equal(p.reduce((n,a)=>n+a.position.length/3,0),61680);assert.deepEqual(conveyorSurfaces(p),[3]);assert.equal(conveyorFrame(p,3),2);
 assert.deepEqual(conveyorPieces(p,3),[0,1,2]);
 const c=importConveyor(p,3,conveyorPieces(p,3));assert.equal(c.mesh.parts.reduce((n,a)=>n+meshBytes(a.position).length/12,0),61680);assert.equal(c.mesh.parts.reduce((n,a)=>n+meshBytes(a.index).length/12,0),45112);assert(JSON.stringify(c).length<3_800_000);
 for(const [part,sources]of c.mesh.parts.map((a,i)=>[a,[[0,2],[3,1]][i]])){
  const ix=new Uint32Array(meshBytes(part.index).buffer);let offset=0,at=0;
  for(const id of sources){const original=p[id];for(let j=0;j<original.index.length;j+=3){assert.deepEqual([...ix.slice(at+j,at+j+3)].sort((a,b)=>a-b),[...original.index.slice(j,j+3)].map(v=>v+offset).sort((a,b)=>a-b));}at+=original.index.length;offset+=original.position.length/3;}
 }
 assert.deepEqual(p,copy,'Outline reconstruction must not alter the source geometry');
 const oversized=[...p,structuredClone(p[0]),structuredClone(p[2])];assert.throws(()=>importConveyor(oversized,3,[0,1,2,4,5]),/authoring geometry limit/);
});
test('overlapping cat belt reconstructs a nested ring and remains playable both ways',()=>{
 const p=source(),c=importConveyor(p,3,conveyorPieces(p,3)),top=Math.max(...c.points.map(v=>v[1]));
 for(const direction of [1,-1]){const d=parseFlowDraft({kind:'arrow-flow',version:1,name:'Rescue QA',origin:[0,0],board:{bounds:{minX:-25,minY:-25,width:50,height:50},arrows:[{id:'test',color:'green',head:[0,0],body:[[-1,0],[-2,0]],facing:'Right'}]},conveyor:{...c,direction},cannons:[{id:'test',progress:nearestProgress(c.points,[0,top]).progress,position:[0,top+6],offset:5.313,angle:null,queue:[{color:'green',ammo:3}]}]});const r=flowRuntime(d),sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);assert.equal(sim.launch(r.arrows[0].id),'accepted');for(let i=0;i<3600;i++)sim.advance(1/60);assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)));}
 assert.throws(()=>projectedBeltOutline(p[1].position,p[1].index),/single|disconnected/);
 assert.throws(()=>projectedBeltOutline(new Float32Array([0,0,0,1,0,0,0,0,1]),new Uint32Array([0,1,2])),/hole/);
});
