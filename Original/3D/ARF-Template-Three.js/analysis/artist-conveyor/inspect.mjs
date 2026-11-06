import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const source='C:/Users/nobzunar/Downloads/New folder (3)/.glb/Converyor.glb';
const buffer=fs.readFileSync(source);assert.equal(buffer.toString('ascii',0,4),'glTF');
let gltf,bin;for(let offset=12;offset<buffer.length;){const length=buffer.readUInt32LE(offset),type=buffer.readUInt32LE(offset+4),data=buffer.subarray(offset+8,offset+8+length);if(type===0x4e4f534a)gltf=JSON.parse(data.toString());if(type===0x004e4942)bin=data;offset+=length+8;}
function accessor(index){const a=gltf.accessors[index],v=gltf.bufferViews[a.bufferView],width={SCALAR:1,VEC2:2,VEC3:3}[a.type],bytes={5123:2,5125:4,5126:4}[a.componentType],read={5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'}[a.componentType];assert(width&&read&&!a.sparse);return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,j)=>bin[read]((v.byteOffset??0)+(a.byteOffset??0)+i*(v.byteStride??width*bytes)+j*bytes)));}
const primitives=gltf.meshes[0].primitives,blue=primitives.find(p=>gltf.materials[p.material].name==='blue.003'),positions=accessor(blue.attributes.POSITION),indices=accessor(blue.indices).flat();
const vertices=[],keys=new Map(),weld=positions.map(p=>{const key=p.map(v=>Math.round(v*1e6)).join(',');if(!keys.has(key)){keys.set(key,vertices.length);vertices.push(p);}return keys.get(key);}),edges=new Map();
for(let i=0;i<indices.length;i+=3)for(let j=0;j<3;j++){const a=weld[indices[i+j]],b=weld[indices[i+(j+1)%3]],key=[Math.min(a,b),Math.max(a,b)].join(',');const e=edges.get(key)??{a,b,count:0};e.count++;edges.set(key,e);}
const boundary=[...edges.values()].filter(e=>e.count===1),neighbors=new Map();for(const {a,b}of boundary){neighbors.set(a,[...(neighbors.get(a)??[]),b]);neighbors.set(b,[...(neighbors.get(b)??[]),a]);}assert([...neighbors.values()].every(n=>n.length===2));
const remaining=new Set(neighbors.keys()),loops=[];while(remaining.size){const start=remaining.values().next().value,loop=[];let current=start,prev=-1;do{loop.push(vertices[current]);remaining.delete(current);const next=neighbors.get(current).find(n=>n!==prev);prev=current;current=next;assert(loop.length<=vertices.length);}while(current!==start);loops.push(loop);}
const area=p=>p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[2]-b[0]*a[2];},0)/2;loops.sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)));
const triangles=primitives.reduce((n,p)=>n+gltf.accessors[p.indices].count/3,0),summary={source,sha256:crypto.createHash('sha256').update(buffer).digest('hex'),bytes:buffer.length,node:gltf.nodes[0],triangles,vertexRecords:primitives.reduce((n,p)=>n+gltf.accessors[p.attributes.POSITION].count,0),surfaceBoundaryLoops:loops.map(p=>({vertices:p.length,area:area(p)})),bounds:primitives.map(p=>({material:gltf.materials[p.material].name,min:gltf.accessors[p.attributes.POSITION].min,max:gltf.accessors[p.attributes.POSITION].max}))};
fs.writeFileSync('analysis/artist-conveyor/inspection.json',JSON.stringify(summary,null,2));fs.writeFileSync('analysis/artist-conveyor/surface-boundaries.json',JSON.stringify(loops));
const path=loops.map(p=>'M '+p.map(v=>`${v[0]},${v[2]}`).join(' L ')+' Z').join(' ');
fs.writeFileSync('analysis/artist-conveyor/top-view.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1040" viewBox="-1 -1.35 2 2.6"><rect x="-1" y="-1.35" width="2" height="2.6" fill="#eeeee7"/><path d="${path}" fill="#495373" fill-rule="evenodd" stroke="#9da8d1" stroke-width=".012"/><text x="0" y="1.2" font-family="sans-serif" font-size=".045" text-anchor="middle" fill="#353c36">Artist conveyor — top view (X / Z)</text></svg>`);
console.log(JSON.stringify(summary,null,2));
export {accessor,gltf,primitives};
