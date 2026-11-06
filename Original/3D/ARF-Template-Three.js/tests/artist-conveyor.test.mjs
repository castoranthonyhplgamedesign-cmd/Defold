import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {parseFlowDraft,parseFlowDocument,flowRuntime,meshBytes} from '../src/layout/arrowFlow.ts';
import {trackGeometry} from '../src/render/track.ts';
import {setLoop,preset} from '../tools/level-editor/model.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
const draft=()=>JSON.parse(fs.readFileSync('examples/levels/artist-rounded.arrow-flow.json'));
const playable=()=>{const d=draft();d.board.arrows=[{id:'test',color:'green',head:[0,0],body:[[-1,0],[-2,0]],facing:'Right'}];d.cannons=[{id:'test',progress:.46,offset:5.313,angle:null,queue:[{color:'green',ammo:3}]}];return d;};
test('artist mesh buffers survive export, preserve triangles and translate with origin',()=>{
 const d=parseFlowDraft(draft());assert.equal(d.conveyor.points.length,606);const copy=structuredClone(d);assert.deepEqual(parseFlowDraft(JSON.parse(JSON.stringify(d))),d);
 d.origin=[3,4];const runtime=flowRuntime(d),geometries=trackGeometry(runtime.path,runtime.trackWidth,runtime.trackMesh,runtime.trackOrigin);
 assert.equal(geometries.reduce((n,g)=>n+g.index.count/3,0),16968);
 geometries.forEach((g,i)=>{const original=new Float32Array(meshBytes(d.conveyor.mesh.parts[i].position).buffer);for(let j=0;j<original.length;j+=3){assert(Math.abs(g.attributes.position.array[j]-original[j]-3)<2e-6);assert.equal(g.attributes.position.array[j+1],original[j+1]);assert(Math.abs(g.attributes.position.array[j+2]-original[j+2]-4)<2e-6);}g.dispose();});
 setLoop(d,preset(d,'rectangle'));assert.equal(d.conveyor.mesh,undefined);assert.doesNotThrow(()=>parseFlowDraft(d));assert(copy.conveyor.mesh);
});
test('mesh import rejects malformed buffers, invalid indices and paths outside the surface',()=>{
 for(const edit of [d=>d.conveyor.mesh.parts[0].position='bad!',d=>d.conveyor.mesh.parts[0].normal='',d=>d.conveyor.mesh.parts[0].index=Buffer.from(new Uint32Array([999999,0,1]).buffer).toString('base64'),d=>d.conveyor.mesh.surface=[],d=>d.conveyor.points=[[4,-4],[-4,-4],[-4,4],[4,4]],d=>d.conveyor.mesh.extra=true]){const d=draft();edit(d);assert.throws(()=>parseFlowDraft(d));}
});
test('rounded artist conveyor admits and shoots arrows in both travel directions',()=>{
 for(const direction of [1,-1]){const d=playable();d.conveyor.direction=direction;const r=flowRuntime(parseFlowDocument(d)),sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);assert.equal(sim.launch(r.arrows[0].id),'accepted');for(let i=0;i<3600;i++)sim.advance(1/60);assert(sim.arrows.every(a=>a.segments.every(s=>s.removed)));}
});
