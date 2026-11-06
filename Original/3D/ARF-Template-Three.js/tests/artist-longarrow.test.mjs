import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {readConveyorGLB,conveyorSurfaces,conveyorFrame,importConveyor} from '../tools/level-editor/import-glb.ts';
import {parseFlowDraft,flowRuntime,meshBytes} from '../src/layout/arrowFlow.ts';
import {nearestProgress} from '../tools/level-editor/model.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath} from '../src/core/path.ts';
const source=()=>{const b=fs.readFileSync('analysis/artist-longarrow/Conveyor.glb');return readConveyorGLB(b.buffer.slice(b.byteOffset,b.byteOffset+b.length));};
test('backward belt triangles face upward without moving vertices or deleting faces',()=>{
 const parts=source(),copy=structuredClone(parts),c=importConveyor(parts,1,[0]),belt=c.mesh.parts[1],p=new Float32Array(meshBytes(belt.position).buffer),ix=new Uint32Array(meshBytes(belt.index).buffer);let corrected=0;
 for(let i=0;i<ix.length;i+=3){const a=ix[i]*3,b=ix[i+1]*3,d=ix[i+2]*3;assert((p[b+2]-p[a+2])*(p[d]-p[a])-(p[b]-p[a])*(p[d+2]-p[a+2])>=0);assert.deepEqual([...ix.slice(i,i+3)].sort((a,b)=>a-b),[...parts[1].index.slice(i,i+3)].sort((a,b)=>a-b));if(ix[i+1]!==parts[1].index[i+1])corrected++;}
 assert.equal(corrected,12);assert.deepEqual(parts,copy);assert.equal(p.length,parts[1].position.length);
});
test('Longarrow belt seams join within tolerance and the same-node frame excludes decorations',()=>{
 const parts=source(),before=structuredClone(parts);assert.equal(parts.length,8);assert.deepEqual(conveyorSurfaces(parts),[1]);assert.equal(conveyorFrame(parts,1),0);
 for(const width of [1.1,1.3,2,3]){
  const conveyor=importConveyor(parts,1,[0],width);assert.equal(conveyor.points.length,418);assert.equal(conveyor.mesh.parts.reduce((n,p)=>n+Buffer.from(p.index,'base64').length/12,0),5852);
 }
 assert.deepEqual(parts,before,'Welding is only for path inference; original geometry stays unchanged');
 const ambiguous=structuredClone(parts);ambiguous.push({...structuredClone(parts[0]),name:'Another frame'});assert.equal(conveyorFrame(ambiguous,1),null);
 const unrelated=structuredClone(parts);unrelated[0].node=999;assert.equal(conveyorFrame(unrelated,1),null);
});
test('Longarrow imported conveyor clears arrows in both directions',()=>{
 const parts=source(),conveyor=importConveyor(parts,1,[0]);const top=Math.max(...conveyor.points.map(p=>p[1]));
 for(const direction of [1,-1]){
  const d=parseFlowDraft({kind:'arrow-flow',version:1,name:'Longarrow QA',origin:[0,0],board:{bounds:{minX:-25,minY:-25,width:50,height:50},arrows:[{id:'test',color:'green',head:[0,0],body:[[-1,0],[-2,0]],facing:'Right'}]},conveyor:{...conveyor,direction},cannons:[{id:'test',progress:nearestProgress(conveyor.points,[0,top]).progress,position:[0,top+6],offset:5.313,angle:null,queue:[{color:'green',ammo:3}]}]});
  const r=flowRuntime(d),sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);assert.equal(sim.launch(r.arrows[0].id),'accepted');for(let i=0;i<3600;i++)sim.advance(1/60);assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)));
 }
});
