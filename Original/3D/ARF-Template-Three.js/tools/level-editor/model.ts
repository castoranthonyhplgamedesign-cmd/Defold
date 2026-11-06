import {flowColors,parseFlowDraft,cannonPose,conveyorPoints,gridPoint,gridCell,type FlowCannon,type FlowDocument,type FlowArrow,type FlowColor,type Pair} from '../../src/layout/arrowFlow.ts';
import {fitsConveyor} from '../../src/layout/visualClearance.ts';
export function cannonBase(doc:FlowDocument,c:FlowCannon):Pair{
 const p=cannonPose(doc,c).position;return [p[0]-doc.origin[0],doc.origin[1]-p[2]];
}
export function arrangeCannons(doc:FlowDocument,action:'row'|'space',selected:string){
 if(doc.cannons.length<2)return;
 const bases=doc.cannons.map(c=>({c,p:cannonBase(doc,c)}));
 if(action==='row'){
  const y=(bases.find(b=>b.c.id===selected)??bases[0]).p[1];
  bases.forEach(({c,p})=>c.position=[p[0],y]);
 }else{
  bases.sort((a,b)=>a.p[0]-b.p[0]);const left=bases[0].p[0],right=bases.at(-1)!.p[0];
  bases.forEach(({c,p},i)=>c.position=[left+(right-left)*i/(bases.length-1),p[1]]);
 }
}
export const same=(a:Pair,b:Pair)=>a[0]===b[0]&&a[1]===b[1];
export const arrowCells=(a:FlowArrow):Pair[]=>[a.head,...a.body.map(p=>[p[0]+a.head[0],p[1]+a.head[1]] as Pair)];
export const arrowPoints=(doc:FlowDocument,a:FlowArrow)=>arrowCells(a).map(p=>gridPoint(doc.board,p));
export function centerGrid(doc:FlowDocument){
 const p=conveyorPoints(doc.conveyor),xs=p.map(p=>p[0]),ys=p.map(p=>p[1]);
 doc.board.grid={size:doc.board.grid?.size??1,offset:[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2]};
}
let usableKey='',usable:Pair[]=[],usableMesh:FlowDocument['conveyor']['mesh'];
export function usableGridCells(doc:FlowDocument):Pair[]{
 const path=conveyorPoints(doc.conveyor),key=JSON.stringify([path,doc.conveyor.width,doc.board.grid]);if(key===usableKey&&usableMesh===doc.conveyor.mesh)return usable;
 const xs=path.map(p=>p[0]),ys=path.map(p=>p[1]),min=gridCell(doc.board,[Math.min(...xs),Math.min(...ys)]),max=gridCell(doc.board,[Math.max(...xs),Math.max(...ys)]),result:Pair[]=[];
 // Keep the visual guide bounded like the 100-by-100 authoring board.
 const left=Math.max(-1000,min[0],Math.floor((min[0]+max[0])/2)-50),bottom=Math.max(-1000,min[1],Math.floor((min[1]+max[1])/2)-50);
 for(let y=bottom;y<=Math.min(1000,max[1],bottom+99);y++)for(let x=left;x<=Math.min(1000,max[0],left+99);x++)if(fitsConveyor(doc,[x,y]))result.push([x,y]);
 usableKey=key;usableMesh=doc.conveyor.mesh;usable=result;return result;
}
export function ammoBudget(doc:FlowDocument){
 return (Object.keys(flowColors) as FlowColor[]).map(color=>{
  const blocks=doc.board.arrows.filter(a=>a.color===color).reduce((sum,a)=>sum+a.body.length+1,0);
  const ammo=doc.cannons.reduce((sum,lane)=>sum+lane.queue.filter(q=>q.color===color).reduce((n,q)=>n+q.ammo,0),0);
  return {color,blocks,ammo,missing:Math.max(0,blocks-ammo)};
 }).filter(row=>row.blocks||row.ammo);
}
export function alignPoint(point:Pair,anchors:Pair[],tolerance:number,shift=false,alt=false){
 const result:Pair=[...point],guides:{anchor:Pair;axis:'horizontal'|'vertical'|'diagonal'}[]=[];
 if(alt||!anchors.length)return {point:result,guides};
 if(shift){
  const anchor=anchors[0],dx=point[0]-anchor[0],dy=point[1]-anchor[1];
  if(!dx&&!dy)return {point:result,guides};
  const angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4));
  if(angle%2===0){const horizontal=angle%4===0;result[horizontal?1:0]=anchor[horizontal?1:0];guides.push({anchor,axis:horizontal?'horizontal':'vertical'});}
  else{const distance=Math.round((Math.abs(dx)+Math.abs(dy))*5)/10;result[0]=anchor[0]+Math.sign(dx)*distance;result[1]=anchor[1]+Math.sign(dy)*distance;guides.push({anchor,axis:'diagonal'});}
 }else{
  for(const index of [0,1] as const){
   const anchor=anchors.reduce((best,p)=>Math.abs(p[index]-point[index])<Math.abs(best[index]-point[index])?p:best);
   if(Math.abs(anchor[index]-point[index])<=tolerance){result[index]=anchor[index];guides.push({anchor,axis:index===0?'vertical':'horizontal'});}
  }
 }
 return {point:result,guides};
}
export function updateBounds(doc:FlowDocument){
 const cells=doc.board.arrows.flatMap(arrowCells);if(!cells.length)return;
 const b=doc.board.bounds;if(cells.every(p=>p[0]>=b.minX&&p[0]<b.minX+b.width&&p[1]>=b.minY&&p[1]<b.minY+b.height))return;
 const xs=cells.map(p=>p[0]),ys=cells.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys);
 doc.board.bounds={minX,minY,width:Math.max(...xs)-minX+1,height:Math.max(...ys)-minY+1};
}
export function preset(doc:FlowDocument,shape:'rectangle'|'notch'):Pair[]{
 const all=doc.board.arrows.flatMap(a=>arrowPoints(doc,a)),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
 const left=Math.min(-4,...xs)-3,right=Math.max(4,...xs)+3,bottom=Math.min(-4,...ys)-3,top=Math.max(4,...ys)+3,mid=Math.round((left+right)/2);
 return shape==='rectangle'?[[right,bottom],[left,bottom],[left,top],[right,top]]:[[right,bottom],[left,bottom],[left,top+4],[mid-2,top+4],[mid-2,top],[mid+2,top],[mid+2,top+4],[right,top+4]];
}
export function setLoop(doc:FlowDocument,points:Pair[]){
 delete doc.conveyor.mesh;
 const copy=points.map(p=>[...p] as Pair);
 if(copy.length>1&&same(copy[0],copy.at(-1)!))copy.pop();
 if(copy.length>=3){const a=copy.at(-2)!,b=copy.at(-1)!,c=copy[0];if((b[0]-a[0])*(c[1]-b[1])===(b[1]-a[1])*(c[0]-b[0])&&(b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1])>0)copy.pop();}
 doc.conveyor.points=copy;doc.cannons.forEach(c=>c.angle=null);
}
export function appendCorner(points:Pair[],p:Pair):Pair[]{
 if(points.at(-1)&&same(points.at(-1)!,p))return points;
 if(points.some(c=>same(c,p)))throw new Error('This point is already in the outline. Click the green first point to close, or Undo to remove the last point.');
 if(points.length>=64)throw new Error('The conveyor can have up to 64 corners.');return [...points,p];
}
export function extendArrow(doc:FlowDocument,points:Pair[],target:Pair):Pair[]{
 const result=points.map(p=>[...p] as Pair),last=result.at(-1);if(!last)return result;
 let [x,y]=last;const dx=target[0]-x,dy=target[1]-y;
 const occupied=new Set(doc.board.arrows.flatMap(arrowCells).map(p=>p.join(',')));
 function step(nx:number,ny:number){
  const p:Pair=[nx,ny];if(result.length>1&&same(result[result.length-2],p)){result.pop();return;}
  if(result.length>=500||result.some(c=>same(c,p))||occupied.has(p.join(','))||!fitsConveyor(doc,p))throw new Error('Keep the arrow inside the belt on green cells, and away from other arrows.');
  result.push(p);
 }
 const horizontal=()=>{while(x!==target[0]){x+=Math.sign(dx);step(x,y);}},vertical=()=>{while(y!==target[1]){y+=Math.sign(dy);step(x,y);}};
 if(Math.abs(dx)>=Math.abs(dy)){horizontal();vertical();}else{vertical();horizontal();}return result;
}
export function makeArrow(points:Pair[],color:FlowColor,id:string):FlowArrow{
 if(points.length<2)throw new Error('Drag across at least two squares to draw an arrow.');
 const head=points.at(-1)!,before=points.at(-2)!;
 const facing=head[0]>before[0]?'Right':head[0]<before[0]?'Left':head[1]>before[1]?'Top':'Bottom';
 return {id,color,facing,head:[...head],body:points.slice(0,-1).reverse().map(p=>[p[0]-head[0],p[1]-head[1]])};
}
export function nearestProgress(points:Pair[],p:Pair){
 const lengths=points.map((a,i)=>Math.hypot(a[0]-points[(i+1)%points.length][0],a[1]-points[(i+1)%points.length][1])),total=lengths.reduce((a,b)=>a+b,0);
 let distance=Infinity,progress=0,travel=0;
 points.forEach((a,i)=>{const b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(lengths[i]**2))),d=Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t);
  if(d<distance){distance=d;progress=(travel+t*lengths[i])/total;}travel+=lengths[i];});
 return {progress:progress%1,distance};
}
export const checkedDraft=(doc:FlowDocument)=>{updateBounds(doc);return parseFlowDraft(doc);};
