// Analysis-only candidate; source mesh and playable default remain untouched.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parseFlowDraft} from '../../src/layout/arrowFlow.ts';
const [outer,rawInner]=JSON.parse(fs.readFileSync('analysis/artist-conveyor/surface-boundaries.json'));
const inner=rawInner.toReversed(),n=outer.length;assert.equal(inner.length,n);
let best=Infinity,shift=0;
for(let k=0;k<n;k++){let sum=0;for(let i=0;i<n;i++){const a=outer[i],b=inner[(i+k)%n];sum+=(a[0]-b[0])**2+(a[2]-b[2])**2;}if(sum<best){best=sum;shift=k;}}
const center=outer.map((a,i)=>{const b=inner[(i+shift)%n];return [(a[0]+b[0])/2,-(a[2]+b[2])/2];}),widths=outer.map((a,i)=>{const b=inner[(i+shift)%n];return Math.hypot(a[0]-b[0],a[2]-b[2]);}).sort((a,b)=>a-b),width=widths[Math.floor(n/2)],scale=1.3/width;
const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t);};
function simplify(points,tolerance){let max=0,index=0;for(let i=1;i<points.length-1;i++){const d=distance(points[i],points[0],points.at(-1));if(d>max){max=d;index=i;}}return max>tolerance?[...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)]:[points[0],points.at(-1)];}
const middle=center.reduce((best,p,i)=>Math.hypot(p[0]-center[0][0],p[1]-center[0][1])>Math.hypot(center[best][0]-center[0][0],center[best][1]-center[0][1])?i:best,0);
const attempts=[];let candidate;
for(const tolerance of [.001,.002,.003,.004,.005,.006,.008,.01,.012,.015,.02,.025]){
 const points=[...simplify(center.slice(0,middle+1),tolerance).slice(0,-1),...simplify([...center.slice(middle),center[0]],tolerance).slice(0,-1)];
 const doc={kind:'arrow-flow',version:1,name:'Artist conveyor - traced draft',origin:[0,0],board:{bounds:{minX:-25,minY:-25,width:50,height:50},arrows:[]},conveyor:{points:points.map(p=>p.map(v=>Math.round(v*scale*10000)/10000)),width:1.3,direction:1},cannons:[]};
 try{parseFlowDraft(doc);candidate??=doc;attempts.push({tolerance,points:points.length,valid:true});}catch(e){attempts.push({tolerance,points:points.length,valid:false,reason:e.message});}
}
const report={method:'Cyclic least-squares pairing of equal-size inner/outer boundary samples; midpoint centerline; closed RDP simplification. Inferred path, not an authored spline.',boundarySampleCount:n,pairedWidth:{min:widths[0],median:width,max:widths.at(-1)},scaleToEditor:scale,attempts};
if(candidate){fs.writeFileSync('analysis/artist-conveyor/artist-conveyor.arrow-flow.json',JSON.stringify(candidate,null,2));report.candidatePoints=candidate.conveyor.points.length;const points=candidate.conveyor.points.map(([x,y])=>`${x/scale},${-y/scale}`).join(' ');const svg=fs.readFileSync('analysis/artist-conveyor/top-view.svg','utf8');fs.writeFileSync('analysis/artist-conveyor/trace-overlay.svg',svg.replace('</svg>',`<polygon points="${points}" fill="none" stroke="#ffb73d" stroke-width=".006"/>${candidate.conveyor.points.map(([x,y])=>`<circle cx="${x/scale}" cy="${-y/scale}" r=".009" fill="#e66e20"/>`).join('')}</svg>`));}
fs.writeFileSync('analysis/artist-conveyor/trace-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
export {center,scale};
