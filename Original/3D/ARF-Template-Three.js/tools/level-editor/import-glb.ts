import {BufferGeometry,BufferAttribute,Matrix4,Quaternion,Vector3} from 'three';
import {polygonArea,parseFlowDraft,insideLoop,type Pair,type FlowDocument} from '../../src/layout/arrowFlow.ts';
import {projectedBeltOutline} from './belt-outline.ts';

export type ArtistPart={name:string;node?:number;color?:number[];position:Float32Array;normal:Float32Array;index:Uint32Array};
function fail(ok:unknown,message:string):asserts ok {if(!ok)throw new Error(message);}
const values=(v:unknown,n:number)=>Array.isArray(v)&&v.length===n&&v.every(Number.isFinite);

// Geometry-only GLB reader: no loaders, image decoding, URLs or executable content.
export function readConveyorGLB(buffer:ArrayBuffer):ArtistPart[]{
 fail(buffer.byteLength>=20&&buffer.byteLength<=20_000_000,'Choose a GLB smaller than 20 MB.');
 const view=new DataView(buffer);fail(view.getUint32(0,true)===0x46546c67&&view.getUint32(4,true)===2&&view.getUint32(8,true)===buffer.byteLength,'Expected a complete glTF 2.0 binary (.glb).');
 let json:any,bin:DataView|undefined;
 for(let at=12;at<buffer.byteLength;){
  fail(at+8<=buffer.byteLength,'Truncated GLB chunk.');const size=view.getUint32(at,true),type=view.getUint32(at+4,true);at+=8;
  fail(size%4===0&&at+size<=buffer.byteLength,'Invalid GLB chunk length.');
  if(type===0x4e4f534a){fail(!json,'Duplicate GLB JSON chunk.');json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,at,size)));}
  if(type===0x004e4942){fail(!bin,'Duplicate GLB binary chunk.');bin=new DataView(buffer,at,size);}at+=size;
 }
 fail(json?.asset?.version==='2.0'&&bin,'GLB needs JSON and embedded geometry.');
 fail(json.buffers?.length===1&&!json.buffers[0].uri&&Number.isInteger(json.buffers[0].byteLength)&&json.buffers[0].byteLength<=bin.byteLength,'Embed the geometry in one GLB buffer.');
 fail(!(json.images??[]).some((image:any)=>image.uri&&!image.uri.startsWith('data:')),'Embed images in the GLB; external resources are not imported.');
 fail(!(json.extensionsRequired??[]).length,'Export without compression or required glTF extensions.');
 function attribute(id:number,type:string,index=false){
  const a=json.accessors?.[id],v=json.bufferViews?.[a?.bufferView],width=type==='VEC3'?3:1;
  fail(a&&v&&a.type===type&&!a.sparse&&!a.normalized&&v.buffer===0&&!v.extensions,'Use ordinary, uncompressed geometry accessors.');
  const bytes=({5121:1,5123:2,5125:4,5126:4} as Record<number,number>)[a.componentType];
  fail(bytes&&(index?a.componentType!==5126:a.componentType===5126),'Unsupported geometry component type.');
  fail(Number.isInteger(a.count)&&a.count>0&&a.count<=(index?300000:100000),'Source model exceeds the inspection limit; export the conveyor separately.');
  const start=(v.byteOffset??0)+(a.byteOffset??0),stride=v.byteStride??width*bytes;
  fail([v.byteOffset??0,v.byteLength,a.byteOffset??0,stride].every(Number.isInteger)&&start>=0&&stride>=width*bytes&&(a.byteOffset??0)>=0&&(a.byteOffset??0)+(a.count-1)*stride+width*bytes<=v.byteLength&&(v.byteOffset??0)+v.byteLength<=bin!.byteLength,'Geometry accessor exceeds its buffer.');
  const result=index?new Uint32Array(a.count):new Float32Array(a.count*width);
  for(let i=0;i<a.count;i++)for(let j=0;j<width;j++){
   const at=start+i*stride+j*bytes;
   result[i*width+j]=a.componentType===5126?bin!.getFloat32(at,true):bytes===4?bin!.getUint32(at,true):bytes===2?bin!.getUint16(at,true):bin!.getUint8(at);
  }
  fail(result.every(Number.isFinite),'Model contains non-finite coordinates.');return result;
 }
 const parts:ArtistPart[]=[],seen=new Set<number>();let vertices=0,indices=0;
 function visit(id:number,parent:Matrix4,depth=0){
  fail(Number.isInteger(id)&&json.nodes?.[id]&&!seen.has(id)&&depth<128,'Invalid or repeated GLB scene node.');seen.add(id);
  const n=json.nodes[id],local=new Matrix4();
  fail(n.skin===undefined,'Export a static conveyor without skinning.');
  if(n.matrix!==undefined){fail(values(n.matrix,16),'Invalid node matrix.');local.fromArray(n.matrix);}
  else{fail(values(n.translation??[0,0,0],3)&&values(n.rotation??[0,0,0,1],4)&&values(n.scale??[1,1,1],3),'Invalid node transform.');local.compose(new Vector3().fromArray(n.translation??[0,0,0]),new Quaternion().fromArray(n.rotation??[0,0,0,1]),new Vector3().fromArray(n.scale??[1,1,1]));}
  const world=new Matrix4().multiplyMatrices(parent,local);fail(Math.abs(world.determinant())>1e-12,'Model has a collapsed transform.');
  if(n.mesh!==undefined){const mesh=json.meshes?.[n.mesh];fail(Array.isArray(mesh?.primitives),'Invalid mesh.');
   for(const [i,p]of mesh.primitives.entries()){
    fail((p.mode??4)===4&&!p.targets&&!p.extensions,'Export static, uncompressed triangles.');
    const position=attribute(p.attributes?.POSITION,'VEC3') as Float32Array,index=p.indices===undefined?Uint32Array.from({length:position.length/3},(_,i)=>i):attribute(p.indices,'SCALAR',true) as Uint32Array;
    vertices+=position.length/3;indices+=index.length;fail(vertices<=100000&&indices<=300000&&index.length%3===0&&index.every(i=>i<position.length/3),'Source model exceeds the inspection limit or contains invalid triangles.');
    const g=new BufferGeometry();try{
     g.setAttribute('position',new BufferAttribute(position,3));g.setIndex(new BufferAttribute(index,1));
     if(p.attributes.NORMAL!==undefined){const normal=attribute(p.attributes.NORMAL,'VEC3');fail(normal.length===position.length,'Normal count does not match positions.');g.setAttribute('normal',new BufferAttribute(normal,3));}else g.computeVertexNormals();
     const material=json.materials?.[p.material],base=material?.pbrMetallicRoughness?.baseColorFactor??[1,1,1,1],emissive=material?.emissiveFactor??[0,0,0];
     fail(values(base,4)&&values(emissive,3),'Invalid material color.');
     const color=base.slice(0,3).map((v:number,i:number)=>v+emissive[i]);
     g.applyMatrix4(world);parts.push({name:`${n.name??mesh.name??'Mesh'} / ${material?.name??`part ${i+1}`}`,node:id,color,position:g.attributes.position.array as Float32Array,normal:g.attributes.normal.array as Float32Array,index});
    }finally{g.dispose();}
   }
  }
  for(const child of n.children??[])visit(child,world,depth+1);
 }
 const roots=json.scenes?.[json.scene??0]?.nodes;fail(Array.isArray(roots)&&roots.length,'GLB needs a scene with mesh nodes.');roots.forEach((id:number)=>visit(id,new Matrix4()));
 fail(parts.length>=2&&parts.length<=64,'Export separate belt-surface and border parts (2 to 64 parts).');return parts;
}

function exactBoundaryLoops(part:ArtistPart):Pair[][]{
 const {position,index}=part,xs=[],ys=[],zs=[];
 for(let i=0;i<position.length;i+=3){xs.push(position[i]);ys.push(position[i+1]);zs.push(position[i+2]);}
 const span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs));
 fail(span>0&&Math.max(...ys)-Math.min(...ys)<span*1e-4,'Choose the flat, horizontal top belt surface. Export the model with Y up.');
 const epsilon=span*1e-6,buckets=new Map<string,number[]>(),vertices:Pair[]=[],weld:number[]=[];
 // Adjacent hash cells can contain the same exported seam; compare actual distances.
 for(let i=0;i<position.length;i+=3){
  const p:Pair=[position[i],-position[i+2]],x=Math.floor(p[0]/epsilon),y=Math.floor(p[1]/epsilon);let match=-1;
  for(let dx=-1;dx<=1&&match<0;dx++)for(let dy=-1;dy<=1&&match<0;dy++)for(const id of buckets.get(`${x+dx},${y+dy}`)??[]){if(Math.hypot(vertices[id][0]-p[0],vertices[id][1]-p[1])<=epsilon){match=id;break;}}
  if(match<0){match=vertices.length;vertices.push(p);const key=`${x},${y}`;buckets.set(key,[...(buckets.get(key)??[]),match]);}weld.push(match);
 }
 const edges=new Map<string,{a:number;b:number;count:number}>();
 for(let i=0;i<index.length;i+=3)for(let j=0;j<3;j++){const a=weld[index[i+j]],b=weld[index[i+(j+1)%3]];fail(a!==b,'Surface has degenerate triangles.');const key=[Math.min(a,b),Math.max(a,b)].join(','),edge=edges.get(key)??{a,b,count:0};edge.count++;fail(edge.count<=2,'Surface is not a clean manifold ring.');edges.set(key,edge);}
 const neighbors=new Map<number,number[]>();
 for(const {a,b,count}of edges.values())if(count===1){neighbors.set(a,[...(neighbors.get(a)??[]),b]);neighbors.set(b,[...(neighbors.get(b)??[]),a]);}
 fail(neighbors.size>0&&[...neighbors.values()].every(n=>n.length===2),'Surface needs a closed outer edge and one inner hole.');
 const remaining=new Set(neighbors.keys()),loops:Pair[][]=[];
 while(remaining.size){const start=remaining.values().next().value!,loop:Pair[]=[];let previous=-1,current=start;
  do{fail(remaining.delete(current),'Surface boundary touches or branches.');loop.push(vertices[current]);const next=neighbors.get(current)!.find(n=>n!==previous)!;previous=current;current=next;}while(current!==start);
  fail(loop.length>=3&&loop.length<=1024,'Surface boundaries must have 3 to 1024 vertices.');if(polygonArea(loop)<0)loop.reverse();loops.push(loop);
 }
 loops.sort((a,b)=>Math.abs(polygonArea(b))-Math.abs(polygonArea(a)));
 fail(loops.length===2&&insideLoop(loops[1][0],loops[0]),'Choose a single ring surface: exactly one outer edge and one inner hole.');return loops;
}
const outlines=new WeakMap<ArtistPart,Pair[][]>();
function partBounds(part:ArtistPart){
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<part.position.length;i++){min[i%3]=Math.min(min[i%3],part.position[i]);max[i%3]=Math.max(max[i%3],part.position[i]);}return {min,max};
}
function boundaryLoops(part:ArtistPart):Pair[][]{
 const cached=outlines.get(part);if(cached)return cached;
 let rings:Pair[][];
 try{rings=exactBoundaryLoops(part);}catch(error){
  const {min,max}=partBounds(part),span=Math.max(max[0]-min[0],max[2]-min[2]);
  // Permit small exporter height offsets, but never infer a belt from walls or steep ramps.
  if(max[1]-min[1]>span*.002||!part.normal.every((v,i)=>i%3!==1||v>.99))throw error;
  rings=projectedBeltOutline(part.position,part.index);
 }
 outlines.set(part,rings);return rings;
}
const encode=(data:Float32Array|Uint32Array)=>{let text='';const bytes=new Uint8Array(data.buffer);for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);};
export function conveyorSurfaces(parts:ArtistPart[]):number[]{
 return parts.flatMap((part,i)=>{try{boundaryLoops(part);return [i];}catch{return [];}});
}
export function conveyorFrame(parts:ArtistPart[],surface:number):number|null{
 const node=parts[surface]?.node;
 let candidates=parts.flatMap((part,i)=>i!==surface&&(node!==undefined?part.node===node:parts.length===2)?[i]:[]);
 if(candidates.length>1){const belt=partBounds(parts[surface]),span=Math.max(belt.max[0]-belt.min[0],belt.max[2]-belt.min[2]);candidates=candidates.filter(i=>{const frame=partBounds(parts[i]);return [0,2].every(axis=>frame.min[axis]<=belt.min[axis]&&frame.max[axis]>=belt.max[axis]&&belt.min[axis]-frame.min[axis]<span*.1&&frame.max[axis]-belt.max[axis]<span*.1);});}
 return candidates.length===1?candidates[0]:null;
}
export function conveyorPieces(parts:ArtistPart[],surface:number):number[]{
 const frame=conveyorFrame(parts,surface);if(frame===null)return [];
 const node=parts[surface].node;
 // A same-node accessory can complete the authored silhouette, even outside the movement ring.
 return parts.flatMap((p,i)=>i!==surface&&(node===undefined?i===frame:p.node===node)?[i]:[]);
}
function resample(points:Pair[],count:number):Pair[]{
 const lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%points.length][0],p[1]-points[(i+1)%points.length][1])),total=lengths.reduce((a,b)=>a+b,0);
 let edge=0,before=0;return Array.from({length:count},(_,i)=>{const at=total*i/count;while(edge<lengths.length-1&&before+lengths[edge]<at)before+=lengths[edge++];const a=points[edge],b=points[(edge+1)%points.length],t=(at-before)/lengths[edge];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];});
}
export function importConveyor(parts:ArtistPart[],surfaceIndex:number,borderIndices:number[],width=1.3,turns=0):FlowDocument['conveyor']{
 fail(parts[surfaceIndex]&&borderIndices.length&&borderIndices.every(i=>parts[i]&&i!==surfaceIndex)&&new Set(borderIndices).size===borderIndices.length,'Choose a belt surface and separate border parts.');
 const selected=[surfaceIndex,...borderIndices];
 fail(selected.reduce((n,i)=>n+parts[i].position.length/3,0)<=100000&&selected.reduce((n,i)=>n+parts[i].index.length,0)<=300000,'Selected pieces exceed the authoring geometry limit. Simplify the model without removing its intended details.');
 fail(Number.isFinite(width)&&width>=1.1&&width<=3&&Number.isInteger(turns),'Invalid scale or rotation.');
 const surface=boundaryLoops(parts[surfaceIndex]);let [outer,inner]=surface;
 if(outer.length!==inner.length){const count=Math.min(1024,Math.max(256,outer.length,inner.length));outer=resample(outer,count);inner=resample(inner,count);}
 let best=Infinity,shift=0;const n=outer.length;
 for(let k=0;k<n;k++){let error=0;for(let i=0;i<n;i++){const a=outer[i],b=inner[(i+k)%n];error+=(a[0]-b[0])**2+(a[1]-b[1])**2;}if(error<best){best=error;shift=k;}}
 const widths=outer.map((a,i)=>Math.hypot(a[0]-inner[(i+shift)%n][0],a[1]-inner[(i+shift)%n][1])).sort((a,b)=>a-b),scale=width/widths[Math.floor(n/2)];
 fail(Number.isFinite(scale)&&scale>0,'Could not infer the belt width.');
 const xs=surface[0].map(p=>p[0]),ys=surface[0].map(p=>p[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2,angle=turns*Math.PI/2,c=Math.cos(angle),s=Math.sin(angle);
 const transform=([x,y]:Pair):Pair=>[((x-cx)*c-(y-cy)*s)*scale,((x-cx)*s+(y-cy)*c)*scale];
 const center=outer.map((a,i)=>{const b=inner[(i+shift)%n];return transform([(a[0]+b[0])/2,(a[1]+b[1])/2]);});
 const points:Pair[]=[];for(const p of center)if(!points.length||Math.hypot(p[0]-points.at(-1)![0],p[1]-points.at(-1)![1])>.051)points.push(p);
 if(points.length>2&&Math.hypot(points[0][0]-points.at(-1)![0],points[0][1]-points.at(-1)![1])<=.051)points.pop();
 const surfaceY=parts[surfaceIndex].position[1];
 const pack=(selected:number[])=>{
  const count=selected.reduce((sum,i)=>sum+parts[i].position.length,0),position=new Float32Array(count),normal=new Float32Array(count),index=new Uint32Array(selected.reduce((sum,i)=>sum+parts[i].index.length,0));let vertexAt=0,indexAt=0;
  for(const i of selected){const part=parts[i];for(let j=0;j<part.position.length;j+=3){const p=transform([part.position[j],-part.position[j+2]]);position.set([p[0],(part.position[j+1]-surfaceY)*scale,-p[1]],vertexAt+j);const x=part.normal[j],z=part.normal[j+2];normal.set([x*c+z*s,part.normal[j+1],-x*s+z*c],vertexAt+j);}
   index.set(part.index.map(v=>v+vertexAt/3),indexAt);vertexAt+=part.position.length;indexAt+=part.index.length;}
  // Some artist faces oppose their supplied normals, producing dark seams with double-sided shading.
  for(let i=0;i<index.length;i+=3){const a=index[i]*3,b=index[i+1]*3,d=index[i+2]*3,ab=[position[b]-position[a],position[b+1]-position[a+1],position[b+2]-position[a+2]],ac=[position[d]-position[a],position[d+1]-position[a+1],position[d+2]-position[a+2]],cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
   if(cross.reduce((sum,v,j)=>sum+v*(normal[a+j]+normal[b+j]+normal[d+j]),0)<0)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];
  }
  return {position:encode(position),normal:encode(normal),index:encode(index)};
 };
 const beltColor=parts[surfaceIndex].color;
 const extraBelt=borderIndices.filter(i=>beltColor&&parts[i].color&&Math.hypot(...parts[i].color!.map((v,j)=>v-beltColor[j]))<.08&&parts[i].normal.every((v,j)=>j%3!==1||v>.99));
 const borders=borderIndices.filter(i=>!extraBelt.includes(i));fail(borders.length,'Choose at least one frame piece.');
 const conveyor:FlowDocument['conveyor']={points,width,direction:1,mesh:{surface:surface.map(r=>r.map(transform)),parts:[pack(borders),pack([surfaceIndex,...extraBelt])]}};
 parseFlowDraft({kind:'arrow-flow',version:1,name:'Imported conveyor',origin:[0,0],board:{bounds:{minX:-25,minY:-25,width:50,height:50},arrows:[]},conveyor,cannons:[]});
 fail(JSON.stringify(conveyor).length<3_800_000,'Converted conveyor exceeds the authoring limit. Simplify the model before importing.');return conveyor;
}
