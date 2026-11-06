import {meshBytes,type FlowMesh} from '../../src/layout/arrowFlow.ts';

const cache=new WeakMap<FlowMesh,string[]>();
// Show the authored mesh, including attached details, independently of the inferred travel ring.
export function meshPreview(mesh:FlowMesh):string[]{
 const saved=cache.get(mesh);if(saved)return saved;
 const paths=mesh.parts.map(part=>{
  const p=new Float32Array(meshBytes(part.position).buffer),ix=new Uint32Array(meshBytes(part.index).buffer),triangles:string[]=[];
  for(let i=0;i<ix.length;i+=3){const a=ix[i]*3,b=ix[i+1]*3,c=ix[i+2]*3,area=(p[b]-p[a])*(p[c+2]-p[a+2])-(p[b+2]-p[a+2])*(p[c]-p[a]);
   if(Math.abs(area)<1e-10)continue;
   const vertices=area>0?[a,b,c]:[a,c,b];triangles.push('M'+vertices.map(j=>`${p[j]},${p[j+2]}`).join('L')+'Z');
  }
  return triangles.join('');
 });
 cache.set(mesh,paths);return paths;
}
