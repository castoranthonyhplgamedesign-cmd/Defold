import fs from 'node:fs';
import {parseFlowDocument} from '../src/layout/arrowFlow.ts';
const level=JSON.parse(fs.readFileSync('src/data/level.json')),raw=JSON.parse(fs.readFileSync('src/data/path.json'));
const points=raw.map(p=>[p[0]-.5,-p[2]]),lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%points.length][0],p[1]-points[(i+1)%points.length][1])),total=lengths.reduce((a,b)=>a+b,0);
const facing=d=>d[0]>0?'Right':d[0]<0?'Left':d[2]>0?'Bottom':'Top';
const arrows=level.arrows.map(a=>({id:String(a.id),color:a.color,head:[a.position[0]-.5,-a.position[2]],body:a.cells.slice(1).map(p=>[p[0],-p[2]]),facing:facing(a.direction)}));
const cells=arrows.flatMap(a=>[a.head,...a.body.map(p=>[a.head[0]+p[0],a.head[1]+p[1]])]);
const xs=cells.map(p=>p[0]),ys=cells.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys);
const cannons=level.shooters.map((lane,i)=>{
 const x=lane.position[0]-.5,y=-lane.position[2];let travelled=0,best;
 points.forEach((a,j)=>{const b=points[(j+1)%points.length],t=(x-a[0])/(b[0]-a[0]);
  if(Number.isFinite(t)&&t>=0&&t<=1){const offset=y-(a[1]+(b[1]-a[1])*t);if(offset>=0&&(!best||offset<best.offset))best={offset,progress:(travelled+lengths[j]*t)/total};}
  travelled+=lengths[j];
 });
 if(!best)throw new Error('Reference cannon has no conveyor intersection');
 return {id:`lane-${i+1}`,...best,angle:0,queue:lane.queue};
});
const doc=parseFlowDocument({kind:'arrow-flow',version:1,name:'Arrow Flow reference',origin:[.5,0],board:{bounds:{minX,minY,width:Math.max(...xs)-minX+1,height:Math.max(...ys)-minY+1},arrows},conveyor:{points,width:1.3,direction:1},cannons});
fs.mkdirSync('examples/levels',{recursive:true});fs.writeFileSync('examples/levels/reference.arrow-flow.json',JSON.stringify(doc,null,2)+'\n');
console.log('Exported reference board, path and cannon queues.');
