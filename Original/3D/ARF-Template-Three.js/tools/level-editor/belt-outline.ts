import {insideLoop,polygonArea,type Pair} from '../../src/layout/arrowFlow.ts';

// Recover a planar union from overlapping artist faces; retained render geometry is untouched.
export function projectedBeltOutline(position:Float32Array,index:Uint32Array):Pair[][]{
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(let i=0;i<position.length;i+=3){minX=Math.min(minX,position[i]);maxX=Math.max(maxX,position[i]);minY=Math.min(minY,-position[i+2]);maxY=Math.max(maxY,-position[i+2]);}
 // shortcut: sampled contours can lose subpixel detail; use an authored path for thinner features.
 const cell=Math.max(maxX-minX,maxY-minY)/2040;
 if(!(cell>0))throw new Error('The belt surface has no area.');
 minX-=2*cell;minY-=2*cell;
 const width=Math.ceil((maxX-minX)/cell)+3,height=Math.ceil((maxY-minY)/cell)+3,mask=new Uint8Array(width*height);
 const xy=(i:number):Pair=>[(position[i*3]-minX)/cell,(-position[i*3+2]-minY)/cell];
 let painted=0,rows=0;
 for(let i=0;i<index.length;i+=3){
  const p=[xy(index[i]),xy(index[i+1]),xy(index[i+2])];
  const bottom=Math.max(0,Math.ceil(Math.min(...p.map(v=>v[1]))-.5)),top=Math.min(height-1,Math.floor(Math.max(...p.map(v=>v[1]))-.5));
  for(let y=bottom;y<=top;y++){
   if(++rows>2_000_000)throw new Error('Too many overlapping faces to inspect; simplify the selected belt surface.');
   const cuts:number[]=[],sample=y+.5;
   for(let j=0;j<3;j++){const a=p[j],b=p[(j+1)%3];if((a[1]<=sample&&b[1]>sample)||(b[1]<=sample&&a[1]>sample))cuts.push(a[0]+(sample-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
   if(cuts.length===2){const from=Math.max(0,Math.ceil(Math.min(...cuts)-.5)),to=Math.min(width-1,Math.floor(Math.max(...cuts)-.5));if(to>=from){painted+=to-from+1;if(painted>64_000_000)throw new Error('Too many overlapping faces to inspect; simplify the selected belt surface.');mask.fill(1,y*width+from,y*width+to+1);}}
  }
 }
 const edges=new Map<number,number>(),stride=width+1,key=(x:number,y:number)=>y*stride+x;
 const edge=(a:number,b:number)=>{if(edges.has(a))throw new Error('Belt pieces touch or branch; export one continuous conveyor ring.');edges.set(a,b);};
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(mask[y*width+x]){
  if(!y||!mask[(y-1)*width+x])edge(key(x,y),key(x+1,y));
  if(x===width-1||!mask[y*width+x+1])edge(key(x+1,y),key(x+1,y+1));
  if(y===height-1||!mask[(y+1)*width+x])edge(key(x+1,y+1),key(x,y+1));
  if(!x||!mask[y*width+x-1])edge(key(x,y+1),key(x,y));
 }
 const rings:Pair[][]=[];
 while(edges.size){const start=edges.keys().next().value!,ring:Pair[]=[];let current=start;
  do{ring.push([current%stride,Math.floor(current/stride)]);const next=edges.get(current);if(next===undefined)throw new Error('The belt outline is open.');edges.delete(current);current=next;}while(current!==start);
  // Subpixel islands/holes are not silently filled: anything other than one ring is rejected.
  rings.push(simplifyRing(ring,1.5).map(([x,y])=>[minX+x*cell,minY+y*cell]));
  if(rings.length>2)throw new Error('Choose a single conveyor ring, without disconnected decorations or extra holes.');
 }
 rings.sort((a,b)=>Math.abs(polygonArea(b))-Math.abs(polygonArea(a)));
 if(rings.length!==2||!insideLoop(rings[1][0],rings[0]))throw new Error('The selected surface needs one closed outer edge and one inner hole.');
 for(const ring of rings){if(ring.length>1024)throw new Error('The belt outline is too detailed; simplify its shape before importing.');if(polygonArea(ring)<0)ring.reverse();}
 return rings;
}

function simplifyRing(points:Pair[],tolerance:number):Pair[]{
 let opposite=1;for(let i=2;i<points.length;i++)if(Math.hypot(points[i][0]-points[0][0],points[i][1]-points[0][1])>Math.hypot(points[opposite][0]-points[0][0],points[opposite][1]-points[0][1]))opposite=i;
 function line(p:Pair[]){
  const keep=new Set([0,p.length-1]),stack=[[0,p.length-1]];
  while(stack.length){const [start,end]=stack.pop()!,a=p[start],b=p[end],dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;let far=-1,best=tolerance;
   for(let i=start+1;i<end;i++){const v=p[i],t=length?Math.max(0,Math.min(1,((v[0]-a[0])*dx+(v[1]-a[1])*dy)/length)):0,d=Math.hypot(v[0]-a[0]-dx*t,v[1]-a[1]-dy*t);if(d>best){best=d;far=i;}}
   if(far>=0){keep.add(far);stack.push([start,far],[far,end]);}
  }
  return [...keep].sort((a,b)=>a-b).map(i=>p[i]);
 }
 return [...line(points.slice(0,opposite+1)).slice(0,-1),...line([...points.slice(opposite),points[0]]).slice(0,-1)];
}
