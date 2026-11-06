import {conveyorPoints,gridPoint,gridClearance,insideLoop,meshBytes,type FlowDocument,type FlowMesh,type Pair} from './arrowFlow.ts';

// Top-view block envelope after the imported-model head-width adjustment.
const halfWidth=.5,halfDepth=.5,margin=.03;
export function blockFootprint(doc:FlowDocument,cell:Pair){
 const [x,y]=gridPoint(doc.board,cell),size=doc.board.grid?.size??1;
 return {left:x-halfWidth*size,right:x+halfWidth*size,bottom:y-halfDepth*size,top:y+halfDepth*size};
}
type Triangle={left:number;right:number;bottom:number;top:number;axes:{x:number;y:number;min:number;max:number}[]};
let cachedParts:FlowMesh['parts']|undefined,rows=new Map<number,Triangle[]>(),results=new Map<string,boolean>();
function prepare(mesh:FlowMesh){
 if(cachedParts&&mesh.parts.every((p,i)=>p.position===cachedParts![i].position&&p.index===cachedParts![i].index))return;
 cachedParts=mesh.parts;rows=new Map();results=new Map();
 for(const part of mesh.parts){
  const p=new Float32Array(meshBytes(part.position).buffer),ix=new Uint32Array(meshBytes(part.index).buffer);
  for(let i=0;i<ix.length;i+=3){
   const v=[ix[i],ix[i+1],ix[i+2]].map(j=>[p[j*3],-p[j*3+2]]);
   if(Math.abs((v[1][0]-v[0][0])*(v[2][1]-v[0][1])-(v[1][1]-v[0][1])*(v[2][0]-v[0][0]))<1e-9)continue;
   const t:Triangle={left:Math.min(...v.map(p=>p[0])),right:Math.max(...v.map(p=>p[0])),bottom:Math.min(...v.map(p=>p[1])),top:Math.max(...v.map(p=>p[1])),axes:v.map((a,j)=>{const b=v[(j+1)%3],x=b[1]-a[1],y=a[0]-b[0],dots=v.map(p=>p[0]*x+p[1]*y);return {x,y,min:Math.min(...dots),max:Math.max(...dots)};})};
   for(let row=Math.floor(t.bottom);row<=Math.floor(t.top);row++){const list=rows.get(row)??[];list.push(t);rows.set(row,list);}
  }
 }
}
export function fitsConveyor(doc:FlowDocument,cell:Pair):boolean{
 const center=gridPoint(doc.board,cell);
 if(!insideLoop(center,conveyorPoints(doc.conveyor),gridClearance(doc)))return false;
 const mesh=doc.conveyor.mesh;if(!mesh)return true;
 // Resting arrows sit below the rim: edge occlusion is intentional, but their centers must remain in the opening.
 prepare(mesh);const b={left:center[0]-margin,right:center[0]+margin,bottom:center[1]-margin,top:center[1]+margin},key=[...center].join(',');const saved=results.get(key);if(saved!==undefined)return saved;
 const x=(b.left+b.right)/2,y=(b.bottom+b.top)/2,hx=(b.right-b.left)/2,hy=(b.top-b.bottom)/2;
 let fits=true;
 outer:for(let row=Math.floor(b.bottom);row<=Math.floor(b.top);row++)for(const t of rows.get(row)??[]){
  if(t.right<=b.left||t.left>=b.right||t.top<=b.bottom||t.bottom>=b.top)continue;
  if(t.axes.some(a=>{const mid=a.x*x+a.y*y,r=Math.abs(a.x)*hx+Math.abs(a.y)*hy;return mid+r<=a.min||mid-r>=a.max;}))continue;
  fits=false;break outer;
 }
 if(results.size>10000)results.clear();results.set(key,fits);return fits;
}
export function clearanceConflicts(doc:FlowDocument){
 return doc.board.arrows.flatMap(a=>[a.head,...a.body.map(p=>[a.head[0]+p[0],a.head[1]+p[1]] as Pair)].filter(p=>!fitsConveyor(doc,p)).map(cell=>({id:a.id,cell,key:`${a.id}:${cell}`})));
}
export function requireClearance(doc:FlowDocument){
 const conflicts=clearanceConflicts(doc);if(conflicts.length)throw new Error(`${conflicts.length} arrow blocks overlap the conveyor clearance. Move their red-marked centers into the opening before exporting.`);
}
export function checkClearanceEdit(before:FlowDocument,after:FlowDocument){
 const sameGrid=JSON.stringify(before.board.grid)===JSON.stringify(after.board.grid);
 const allowed=new Set(sameGrid?clearanceConflicts(before).map(c=>c.key):[]);
 if(clearanceConflicts(after).some(c=>!allowed.has(c.key)))throw new Error('This placement overlaps the conveyor. Keep block centers in the green cells inside the opening.');
}
