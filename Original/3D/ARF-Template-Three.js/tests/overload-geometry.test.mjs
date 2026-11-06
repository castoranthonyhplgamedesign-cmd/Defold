import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {flowRuntime} from '../src/layout/arrowFlow.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation,preloadTuning} from '../src/core/simulation.ts';

// Use the actual body mesh's convex footprint, including its rounded corners.
const manifest=JSON.parse(fs.readFileSync('src/assets/geometry.json')).body[0].position;
const bytes=fs.readFileSync('src/assets/geometry.bin');
const vertices=new Float32Array(bytes.buffer,bytes.byteOffset+manifest.offset,manifest.count*manifest.components),points=[];
for(let i=0;i<vertices.length;i+=3)points.push([vertices[i],vertices[i+2]]);
points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function half(points){const h=[];for(const p of points){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p);}return h.slice(0,-1);}
const hull=[...half(points),...half([...points].reverse())];
function overlaps(a,b){
 for(const poly of [a,b])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],length=Math.hypot(p[1]-q[1],q[0]-p[0]),x=(p[1]-q[1])/length,z=(q[0]-p[0])/length;
  // Unit axes: near-duplicate hull points otherwise make projections smaller than the tolerance.
  if(length<1e-6)continue;
  const ap=a.map(p=>p[0]*x+p[1]*z),bp=b.map(p=>p[0]*x+p[1]*z);
  if(Math.max(...ap)<=Math.min(...bp)+1e-8||Math.max(...bp)<=Math.min(...ap)+1e-8)return false;
 }
 return true;
}
test('packed belt bodies clear the imported bends against the real body mesh while an arrow joins',()=>{
 const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json')),runtime=flowRuntime(doc);
 const sim=new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),[],doc.board.grid.size);
 const scale=doc.board.grid.size*preloadTuning.beltScale,radius=Math.max(...hull.map(p=>Math.hypot(...p)))*scale;
 sim.launch(sim.arrows.find(a=>sim.canMove(a)).data.id);
 for(let frame=0;frame<240;frame++){
  sim.advance(1/30);
  const bodies=sim.onPath.map(s=>{const c=s.position,co=Math.cos(s.yaw),si=Math.sin(s.yaw);return {c,hull:hull.map(([x,z])=>[c[0]+scale*(x*co+z*si),c[2]+scale*(-x*si+z*co)])};});
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j];
   if(Math.hypot(a.c[0]-b.c[0],a.c[2]-b.c[2])>2*radius)continue;
   assert(!overlaps(a.hull,b.hull),`Intersecting mesh footprints at frame ${frame}, blocks ${i}/${j}`);
  }
 }
});
