import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {flowRuntime} from '../src/layout/arrowFlow.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation,preloadTuning} from '../src/core/simulation.ts';
import {arrowStyle} from '../src/render/arrowStyle.ts';

// Use the actual body mesh's convex footprint, including its rounded corners.
const manifest=JSON.parse(fs.readFileSync('src/assets/geometry.json')).body[0].position;
const bytes=fs.readFileSync('src/assets/geometry.bin');
const vertices=new Float32Array(bytes.buffer,bytes.byteOffset+manifest.offset,manifest.count*manifest.components),points=[];
for(let i=0;i<vertices.length;i+=3)points.push([vertices[i],vertices[i+2]]);
points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function half(points){const h=[];for(const p of points){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p);}return h.slice(0,-1);}
const hull=[...half(points),...half([...points].reverse())];
const hm=JSON.parse(fs.readFileSync('src/assets/geometry.json')).head[0].position,hv=new Float32Array(bytes.buffer,bytes.byteOffset+hm.offset,hm.count*hm.components),hp=[];for(let i=0;i<hv.length;i+=3)hp.push([hv[i]*arrowStyle.headWidth,hv[i+2]]);hp.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const headHull=[...half(hp),...half([...hp].reverse())];
const bodyYs=Array.from(vertices).filter((_,i)=>i%3===1),minY=Math.min(...bodyYs),maxY=Math.max(...bodyYs);
const geometry=JSON.parse(fs.readFileSync('src/assets/geometry.json'));
function attribute(name,field){const a=geometry[name][0][field];return new Float32Array(bytes.buffer,bytes.byteOffset+a.offset,a.count*a.components);}
const normals={body:attribute('body','normal'),head:attribute('head','normal')};
function separated3D(a,b){
 for(const axis of [...a.axes,...b.axes]){let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
  for(const p of a.vertices){const v=p[0]*axis[0]+p[1]*axis[1]+p[2]*axis[2];amin=Math.min(amin,v);amax=Math.max(amax,v);}
  for(const p of b.vertices){const v=p[0]*axis[0]+p[1]*axis[1]+p[2]*axis[2];bmin=Math.min(bmin,v);bmax=Math.max(bmax,v);}
  if(amax<=bmin+1e-7||bmax<=amin+1e-7)return true;
 }return false;
}
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
  const bodies=sim.onPath.map(s=>{
   const c=s.position,co=Math.cos(s.yaw),si=Math.sin(s.yaw),entering=sim.isTransferring(s);
   const rise=entering?sim.transferProgress(s)**3:1;
   const smooth=rise*rise*(3-2*rise),lift=arrowStyle.boardY*doc.board.grid.size*(1-smooth);
   const size=scale;
   const isHead=entering&&sim.arrows.some(a=>a.segments[0]===s),shape=isHead?headHull:hull;
   const vs=isHead?hv:vertices,ns=normals[isHead?'head':'body'],world=[],axes=[],width=isHead?arrowStyle.headWidth:1;
   for(let k=0;k<vs.length;k+=3)world.push([c[0]+size*(vs[k]*width*co+vs[k+2]*si),c[1]+lift+size*vs[k+1],c[2]+size*(-vs[k]*width*si+vs[k+2]*co)]);
   for(let k=0;k<ns.length;k+=3)axes.push([ns[k]/width*co+ns[k+2]*si,ns[k+1],-ns[k]/width*si+ns[k+2]*co]);
   return {c,vertices:world,axes,minY:lift+minY*size,maxY:lift+maxY*size,hull:shape.map(([x,z])=>[c[0]+size*(x*co+z*si),c[2]+size*(-x*si+z*co)])};
  });
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j];
   // Reserved arrivals are still climbing from below the rim; projected footprint overlap alone is not collision.
   if(a.maxY<=b.minY+1e-8||b.maxY<=a.minY+1e-8)continue;
   if(Math.hypot(a.c[0]-b.c[0],a.c[2]-b.c[2])>2*radius)continue;
   assert(!overlaps(a.hull,b.hull)||separated3D(a,b),`Intersecting mesh footprints at frame ${frame}, blocks ${i}/${j}`);
  }
 }
});
