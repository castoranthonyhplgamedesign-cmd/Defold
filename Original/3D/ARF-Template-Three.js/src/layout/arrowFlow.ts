// Shared data contract. Sync the editor copy with scripts/sync-editor-contract.mjs.
export const flowColors = {green:'#1bd733',blue:'#2cd8ed',orange:'#fd9d1b',black:'#6e7074',pink:'#fa3ad1',purple:'#9259ff',yellow:'#fdd71a'} as const;
export type FlowColor = keyof typeof flowColors;
export type Pair = [number,number];
export type FlowBounds = {minX:number;minY:number;width:number;height:number};
export type FlowArrow = {id:string;color:FlowColor;head:Pair;body:Pair[];facing:'Top'|'Right'|'Bottom'|'Left'};
export type FlowCannon = {id:string;progress:number;offset:number;angle:number|null;position?:Pair;queue:{color:FlowColor;ammo:number}[]};
export type FlowMesh = {parts:{position:string;normal:string;index:string}[];surface:Pair[][]};
export type FlowSettings = {origin:Pair;conveyor:{points:Pair[];width:number;direction:1|-1;mesh?:FlowMesh;cornerRadius?:number};cannons:FlowCannon[]};
export type FlowGrid = {size:number;offset:Pair};
export type FlowDocument = FlowSettings & {kind:'arrow-flow';version:1;name:string;board:{bounds:FlowBounds;arrows:FlowArrow[];grid?:FlowGrid}};
export function gridPoint(board:FlowDocument['board'],p:Pair):Pair {const size=board.grid?.size??1,offset=board.grid?.offset??[0,0];return [p[0]*size+offset[0],p[1]*size+offset[1]];}
export function gridCell(board:FlowDocument['board'],p:Pair):Pair {const size=board.grid?.size??1,offset=board.grid?.offset??[0,0];return [Math.round((p[0]-offset[0])/size),Math.round((p[1]-offset[1])/size)];}
export function gridClearance(doc:FlowDocument){return doc.conveyor.width/2+.45*(doc.board.grid?.size??1);}
const directions = {Top:[0,0,-1],Right:[1,0,0],Bottom:[0,0,1],Left:[-1,0,0]};
const length = (a:Pair,b:Pair)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
export const polygonArea = (points:Pair[])=>points.reduce((s,a,i)=>{const b=points[(i+1)%points.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2;
// One sampled fillet path drives editor, clearance, targeting, geometry and movement.
export function conveyorPoints(conveyor:FlowSettings['conveyor']):Pair[]{
  const {points,cornerRadius:radius=0}=conveyor;if(!radius||conveyor.mesh)return points;
  const rounded:Pair[]=[];
  points.forEach((p,i)=>{
    const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length],before=length(a,p),after=length(p,b);
    if(before<1e-8||after<1e-8){rounded.push(p);return;}
    const ux=(p[0]-a[0])/before,uy=(p[1]-a[1])/before,vx=(b[0]-p[0])/after,vy=(b[1]-p[1])/after;
    const turn=Math.atan2(ux*vy-uy*vx,ux*vx+uy*vy);
    if(Math.abs(turn)<1e-5){rounded.push(p);return;}
    const tangent=Math.tan(Math.abs(turn)/2),trim=Math.min(radius*tangent,.45*before,.45*after),r=trim/tangent;
    const start:Pair=[p[0]-ux*trim,p[1]-uy*trim],sign=Math.sign(turn),center:Pair=[start[0]-uy*sign*r,start[1]+ux*sign*r];
    const angle=Math.atan2(start[1]-center[1],start[0]-center[0]),steps=Math.max(2,Math.ceil(Math.abs(turn)/(Math.PI/18)));
    for(let j=0;j<=steps;j++){const theta=angle+turn*j/steps;rounded.push([center[0]+Math.cos(theta)*r,center[1]+Math.sin(theta)*r]);}
  });
  return rounded;
}
export function offsetLoop(points:Pair[],offset:number):Pair[] {
  const sign=Math.sign(polygonArea(points));
  return points.map((p,i)=>{
    const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];
    const l1=length(a,p),l2=length(p,b),n1=[-(p[1]-a[1])*sign/l1,(p[0]-a[0])*sign/l1],n2=[-(b[1]-p[1])*sign/l2,(b[0]-p[0])*sign/l2];
    const denominator=1+n1[0]*n2[0]+n1[1]*n2[1];
    if(denominator<.1)throw new Error('Conveyor corner is too sharp; widen it');
    return [p[0]+(n1[0]+n2[0])*offset/denominator,p[1]+(n1[1]+n2[1])*offset/denominator];
  });
}
export function anchorAt(points:Pair[],progress:number) {
  const lengths=points.map((p,i)=>length(p,points[(i+1)%points.length]));
  let remaining=((progress%1)+1)%1*lengths.reduce((a,b)=>a+b,0),i=0;
  while(i<points.length-1&&remaining>lengths[i])remaining-=lengths[i++];
  const a=points[i],b=points[(i+1)%points.length],t=remaining/lengths[i],sign=Math.sign(polygonArea(points));
  return {point:[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t] as Pair,
    angle:Math.atan2(-(b[1]-a[1])*sign,-(b[0]-a[0])*sign)*180/Math.PI};
}
export function cannonPose(settings:FlowSettings,cannon:FlowCannon) {
  const path=conveyorPoints(settings.conveyor);
  if(cannon.position){const target=anchorAt(path,cannon.progress).point,base=cannon.position;
    return {position:[base[0]+settings.origin[0],-.428,-base[1]+settings.origin[1]],yaw:Math.atan2(target[0]-base[0],base[1]-target[1])};}
  const anchor=anchorAt(path,cannon.progress),yaw=(cannon.angle??anchor.angle)*Math.PI/180;
  return {position:[anchor.point[0]+settings.origin[0]-Math.sin(yaw)*cannon.offset,-.428,-anchor.point[1]+settings.origin[1]-Math.cos(yaw)*cannon.offset],yaw};
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=1000;
const pair=(v:unknown):v is Pair=>Array.isArray(v)&&v.length===2&&v.every(finite);
const color=(v:unknown):v is FlowColor=>typeof v==='string'&&Object.hasOwn(flowColors,v);
export function meshBytes(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
function validateMesh(value:unknown){
  requireValue(object(value),'Conveyor mesh is invalid');exact(value,['parts','surface'],'Conveyor mesh');
  requireValue(Array.isArray(value.parts)&&value.parts.length===2,'Conveyor mesh needs border and surface parts');
  let vertices=0,indices=0;
  for(const part of value.parts){
    requireValue(object(part),'Invalid conveyor mesh part');exact(part,['position','normal','index'],'Mesh part');
    for(const key of ['position','normal','index'])requireValue(typeof part[key]==='string'&&part[key].length<=1600000&&/^[A-Za-z0-9+/]*={0,2}$/.test(part[key] as string),'Invalid mesh buffer');
    const p=meshBytes(part.position as string),n=meshBytes(part.normal as string),ix=meshBytes(part.index as string);
    requireValue(p.length>0&&p.length%12===0&&n.length===p.length&&ix.length>0&&ix.length%12===0,'Invalid mesh buffer lengths');
    const positions=new Float32Array(p.buffer),normals=new Float32Array(n.buffer),index=new Uint32Array(ix.buffer),count=positions.length/3;
    requireValue(positions.every(finite)&&normals.every(v=>Number.isFinite(v)&&Math.abs(v)<=1.001)&&index.every(i=>i<count),'Invalid mesh coordinates or indices');
    vertices+=count;indices+=index.length;
  }
  requireValue(vertices<=100000&&indices<=300000,'Conveyor mesh exceeds authoring geometry limit');
  requireValue(Array.isArray(value.surface)&&value.surface.length===2&&value.surface.every(p=>Array.isArray(p)&&p.length>=3&&p.length<=1024&&p.every(pair)),'Mesh surface needs two bounded outlines');
}
function requireValue(ok:unknown,message:string):asserts ok {if(!ok)throw new Error(message);}
function exact(value:Record<string,unknown>,keys:string[],where:string){requireValue(Object.keys(value).every(k=>keys.includes(k)),`${where}: unsupported field`);}
function segmentDistance(p:Pair,a:Pair,b:Pair) {
  const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t);
}
const cross=(a:Pair,b:Pair,c:Pair)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function edgesMeet(a:Pair,b:Pair,c:Pair,d:Pair){
  const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);
  if(abC*abD<0&&cdA*cdB<0)return true;
  return segmentDistance(a,c,d)<1e-5||segmentDistance(b,c,d)<1e-5||segmentDistance(c,a,b)<1e-5||segmentDistance(d,a,b)<1e-5;
}
function simpleLoop(points:Pair[]){
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
    if(j===i+1||(i===0&&j===points.length-1))continue;
    if(edgesMeet(points[i],points[(i+1)%points.length],points[j],points[(j+1)%points.length]))return false;
  }
  return true;
}
export function insideLoop(point:Pair,points:Pair[],clearance=0){
  let inside=false;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length];
    if(segmentDistance(point,a,b)<clearance)return false;
    if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function validateFlowSettings(value:unknown):FlowSettings {
  requireValue(object(value),'Arrow Flow settings must be an object');
  requireValue(pair(value.origin),'Origin must be two finite coordinates');
  const c=value.conveyor;
  requireValue(object(c),'Conveyor is required');exact(c,['points','width','direction','mesh','cornerRadius'],'Conveyor');
  requireValue(c.cornerRadius===undefined||(finite(c.cornerRadius)&&c.cornerRadius>=0&&c.cornerRadius<=10),'Corner rounding must be 0 to 10 grid units');
  requireValue(!c.mesh||!c.cornerRadius,'Imported meshes retain their own rounded geometry');
  if(c.mesh!==undefined)validateMesh(c.mesh);
  requireValue(Array.isArray(c.points)&&c.points.length>=3&&c.points.length<=(c.mesh?1024:64)&&c.points.every(pair),'Conveyor point count is invalid (3-64 editable, up to 1024 for an imported mesh)');
  requireValue(finite(c.width)&&c.width>=1.1&&c.width<=3,'Conveyor width must be 1.1-3 cells');
  requireValue(c.direction===1||c.direction===-1,'Conveyor direction must be 1 or -1');
  const controls=c.points as Pair[],width=c.width;
  requireValue(Math.abs(polygonArea(controls))>=4,'Conveyor has no usable area');
  for(let i=0;i<controls.length;i++){
    const a=controls[i],b=controls[(i+1)%controls.length],edge=length(a,b);
    requireValue(edge>.05,'Conveyor contains repeated or extremely short edges');
  }
  requireValue(simpleLoop(controls),'Conveyor must be a simple loop without crossings or touching edges');
  const points=conveyorPoints(c as FlowSettings['conveyor']),sign=Math.sign(polygonArea(points));
  requireValue(Math.abs(polygonArea(points))>=4&&points.every((p,i)=>p.every(finite)&&length(p,points[(i+1)%points.length])>1e-6)&&simpleLoop(points),'Rounded corners overlap or collapse; move the corner points farther apart');
  if(c.mesh){const surface=(c.mesh as FlowMesh).surface;requireValue(points.every((p,i)=>{const q=points[(i+1)%points.length];return [p,[(p[0]+q[0])/2,(p[1]+q[1])/2] as Pair].every(v=>insideLoop(v,surface[0])&&!insideLoop(v,surface[1]));}),'Conveyor movement path must stay on the imported surface');}
  // Imported art supplies its actual surface; procedural offset tests apply only to generated belts.
  for(const offset of c.mesh?[]:[width/2+.15,-width/2-.15]){
    const ring=offsetLoop(points,offset);
    requireValue(simpleLoop(ring)&&polygonArea(ring)*sign>0,'Conveyor width overlaps its corners or a narrow bend');
    requireValue(offset>0?ring.every(p=>insideLoop(p,points)):points.every(p=>insideLoop(p,ring)),'Conveyor is too narrow for its belt width');
    for(let i=0;i<points.length;i++)for(let j=0;j<ring.length;j++)requireValue(!edgesMeet(points[i],points[(i+1)%points.length],ring[j],ring[(j+1)%ring.length]),'Conveyor width crosses another part of the loop');
  }
  requireValue(Array.isArray(value.cannons)&&value.cannons.length<=16,'Use at most 16 cannon lanes');
  const ids=new Set<string>();let maxVoices=0;
  for(const [i,lane] of value.cannons.entries()){
    requireValue(object(lane),`Cannon ${i+1} is invalid`);exact(lane,['id','progress','offset','angle','position','queue'],'Cannon');
    requireValue(typeof lane.id==='string'&&lane.id.length>0&&lane.id.length<=128&&!ids.has(lane.id),'Cannon IDs must be unique');ids.add(lane.id);
    requireValue(finite(lane.progress)&&lane.progress>=0&&lane.progress<1,'Cannon progress must be 0 to less than 1');
    requireValue(finite(lane.offset)&&lane.offset>=4&&lane.offset<=7,'Cannon offset must be 4-7 cells');
    requireValue(lane.angle===null||(finite(lane.angle)&&Math.abs(lane.angle)<=180),'Cannon angle must be blank (auto) or -180 to 180 degrees');
    requireValue(Array.isArray(lane.queue)&&lane.queue.length>=1&&lane.queue.length<=32,'Each cannon needs 1-32 queue entries');
    let largest=0;
    for(const entry of lane.queue){
      requireValue(object(entry)&&color(entry.color)&&Number.isSafeInteger(entry.ammo)&&Number(entry.ammo)>0&&Number(entry.ammo)<=500,'Queue entries need a supported color and 1-500 ammo');
      exact(entry,['color','ammo'],'Queue');largest=Math.max(largest,Number(entry.ammo));
    }
    maxVoices+=largest;
    if(lane.position!==undefined){
      requireValue(pair(lane.position),'Cannon position needs two finite coordinates');
      requireValue(!insideLoop(lane.position,points),'Place cannon bases outside the conveyor outline');
      requireValue(points.every((p,j)=>segmentDistance(lane.position as Pair,p,points[(j+1)%points.length])>=width/2+1.5),'Leave space between the cannon base and belt');
      requireValue(length(lane.position,anchorAt(points,lane.progress).point)>=4,'Place the cannon base at least 4 units from its target');
    }else{
      const normal=anchorAt(points,lane.progress).angle,angle=lane.angle??normal;
      requireValue(Math.cos((angle-normal)*Math.PI/180)>.25,'Cannon must face toward the conveyor');
    }
  }
  requireValue(maxVoices<=2000,'Cannon ammo allocation exceeds the playable budget');
  return structuredClone(value) as FlowSettings;
}
function parseFlow(value:unknown,allowEmptyBoard:boolean):FlowDocument {
  requireValue(object(value),'Expected an Arrow Flow document');
  exact(value,['kind','version','name','origin','board','conveyor','cannons'],'Level');
  requireValue(value.kind==='arrow-flow'&&value.version===1,'Unsupported Arrow Flow format/version');
  requireValue(typeof value.name==='string'&&value.name.length>0&&value.name.length<=128,'Level name must have 1-128 characters');
  const settings=validateFlowSettings(value),board=value.board;
  requireValue(object(board)&&object(board.bounds),'Board bounds are required');exact(board,['bounds','arrows','grid'],'Board');
  if(board.grid!==undefined){requireValue(object(board.grid),'Arrow grid is invalid');exact(board.grid,['size','offset'],'Arrow grid');requireValue(finite(board.grid.size)&&board.grid.size>=.5&&board.grid.size<=1.5&&pair(board.grid.offset),'Grid size must be 0.5 to 1.5, with a finite position');}
  const b=board.bounds;exact(b,['minX','minY','width','height'],'Bounds');
  requireValue(['minX','minY','width','height'].every(k=>finite(b[k])&&Number.isSafeInteger(b[k]))&&Number(b.width)>0&&Number(b.height)>0&&Number(b.width)<=100&&Number(b.height)<=100,'Board bounds must be integers, size 1-100');
  requireValue(Array.isArray(board.arrows)&&board.arrows.length>=(allowEmptyBoard?0:1)&&board.arrows.length<=500,allowEmptyBoard?'Use at most 500 arrows':'Add at least one arrow before playing or exporting');
  const ids=new Set<string>(),occupied=new Set<string>(),points=conveyorPoints(settings.conveyor);
  for(const a of board.arrows){
    requireValue(object(a),'Invalid arrow');exact(a,['id','color','head','body','facing'],'Arrow');
    requireValue(typeof a.id==='string'&&a.id.length>0&&a.id.length<=128&&!ids.has(a.id),'Arrow IDs must be unique');ids.add(a.id);
    requireValue(color(a.color),'Arrow has an unsupported gameplay color');
    requireValue(typeof a.facing==='string'&&Object.hasOwn(directions,a.facing),'Arrow facing must be Top, Right, Bottom or Left');
    requireValue(pair(a.head)&&a.head.every(Number.isSafeInteger)&&Array.isArray(a.body)&&a.body.length<=500&&a.body.every(p=>pair(p)&&p.every(Number.isSafeInteger)),'Arrow cells must be integer pairs');
    const head=a.head,cells:Pair[]=[head,...(a.body as Pair[]).map(p=>[head[0]+p[0],head[1]+p[1]] as Pair)];
    for(let i=0;i<cells.length;i++){
      const p=cells[i],key=p.join(',');requireValue(!occupied.has(key),'Arrow cells overlap or repeat');occupied.add(key);
      requireValue(p[0]>=Number(b.minX)&&p[0]<Number(b.minX)+Number(b.width)&&p[1]>=Number(b.minY)&&p[1]<Number(b.minY)+Number(b.height),'Arrow outside board bounds');
      if(i)requireValue(Math.abs(p[0]-cells[i-1][0])+Math.abs(p[1]-cells[i-1][1])===1,'Arrow body must be contiguous');
      const worldPoint=gridPoint(board as FlowDocument['board'],p);
      requireValue(worldPoint.every(finite)&&insideLoop(worldPoint,points,gridClearance(value as FlowDocument)),'Arrow needs clearance inside the conveyor; move it inward before adjusting the grid');
    }
  }
  requireValue(occupied.size<=2000,'Board exceeds 2000 cells');
  return structuredClone(value) as FlowDocument;
}
export const parseFlowDocument=(value:unknown)=>parseFlow(value,false);
// Authoring can temporarily contain no arrows; playable exports still require one.
export const parseFlowDraft=(value:unknown)=>parseFlow(value,true);
export function flowWarnings(doc:FlowDocument):string[] {
  const warnings:string[]=[],ammo=new Map<string,number>(),blocks=new Map<string,number>();
  for(const a of doc.board.arrows)blocks.set(a.color,(blocks.get(a.color)??0)+a.body.length+1);
  for(const lane of doc.cannons)for(const c of lane.queue)ammo.set(c.color,(ammo.get(c.color)??0)+c.ammo);
  for(const [color,count] of blocks)if((ammo.get(color)??0)<count)warnings.push(`${color}: ${count} blocks, ${ammo.get(color)??0} shots; a full clear is not guaranteed.`);
  for(const color of ammo.keys())if(!blocks.has(color))warnings.push(`${color} cannons have no matching board blocks.`);
  if(!doc.cannons.length)warnings.push('No cannons: arrows circulate without being shot.');
  const positions=doc.cannons.map(c=>cannonPose(doc,c).position);
  for(let i=0;i<positions.length;i++)for(let j=0;j<i;j++)if(Math.hypot(positions[i][0]-positions[j][0],positions[i][2]-positions[j][2])<3)warnings.push(`${doc.cannons[j].id} / ${doc.cannons[i].id}: cannon containers may overlap.`);
  return warnings;
}
export function flowRuntime(doc:FlowDocument) {
  const world=(p:Pair)=>[p[0]+doc.origin[0],0,-p[1]+doc.origin[1]];
  const numeric=(id:string)=>/^(0|[1-9]\d*)$/.test(id)&&Number.isSafeInteger(Number(id));
  const ids=new Set(doc.board.arrows.filter(a=>numeric(a.id)).map(a=>Number(a.id)));let next=0;
  const arrows=doc.board.arrows.map(a=>{
    while(ids.has(next))next++;
    const id=numeric(a.id)?Number(a.id):next++;
    const size=doc.board.grid?.size??1;
    return {id,color:a.color,position:world(gridPoint(doc.board,a.head)),direction:[...directions[a.facing]],cells:[[0,0,0],...a.body.map(p=>[p[0]*size,0,-p[1]*size])],...(size!==1?{cellSize:size}:{})};
  });
  const points=conveyorPoints(doc.conveyor),path=points.map(world);if(doc.conveyor.direction===-1)path.reverse();
  return {arrows,path,shooters:doc.cannons.map(c=>({...cannonPose(doc,c),detectorDistance:c.position?length(c.position,anchorAt(points,c.progress).point):c.offset,queue:c.queue.map(q=>({...q}))})),trackWidth:doc.conveyor.width,...(doc.conveyor.mesh?{trackMesh:doc.conveyor.mesh,trackOrigin:doc.origin}:{})};
}
