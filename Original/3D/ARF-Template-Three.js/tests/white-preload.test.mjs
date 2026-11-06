import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadConfigFromFile} from 'vite';
import {Scene,BoxGeometry,MeshStandardMaterial,Matrix4,Vector3} from 'three';
import {parseFlowDocument,flowRuntime} from '../src/layout/arrowFlow.ts';
import {ConveyorPath,wrap} from '../src/core/path.ts';
import {Simulation,tuning,preloadTuning} from '../src/core/simulation.ts';
import {createBoard} from '../src/render/board.ts';
import {overloadQueues,overloadShooters} from '../src/data/overloadCannons.ts';
import {Session} from '../src/core/session.ts';

const doc=parseFlowDocument(JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json'))),runtime=flowRuntime(doc);
const create=(lanes=runtime.shooters)=>new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),lanes,doc.board.grid.size);
// Near-full fixture: a 99% preload, for checks of the full-belt rules.
const withFraction=(fraction,make)=>{const shipped=preloadTuning.fraction;preloadTuning.fraction=fraction;try{return make();}finally{preloadTuning.fraction=shipped;}};
const nearFull=make=>withFraction(.99,make);
const createFull=lanes=>nearFull(()=>create(lanes));

const beltSize=doc.board.grid.size*preloadTuning.beltScale;
const assertSpaced=sim=>{
 const p=sim.onPath.map(s=>s.progress).sort((a,b)=>a-b);
 p.forEach((v,i)=>assert(sim.unitsBetween(v,p[(i+1)%p.length])>=1-1e-6,'Belt blocks never overlap'));
};
// Belt speed in touching-block units per second; arc speed rises slightly through bends.
const unitSpeed=()=>preloadTuning.blocksPerSecond;

test('upstream blocks yield backward while the belt retains its normal speed',()=>{
 // Keep a matching cannon available outside this movement-only fixture's view.
 const sim=nearFull(()=>new Simulation([{...runtime.arrows[0],cells:[[0,0,0]]}],new ConveyorPath(runtime.path,.1,'first-intersection'),[{position:[1000,0,1000],queue:[{color:runtime.arrows[0].color,ammo:1}]}],1.25));
 const first=sim.preloaded[0],start=first.progress;
 sim.advance(1);assert(Math.abs(sim.unitsBetween(start,first.progress)-unitSpeed(sim))<1e-8);
 const arrow=sim.arrows[0];assert.equal(sim.launch(arrow.data.id),'accepted');
 let pushed=false;
 for(let frame=0;frame<1200;frame++){
  const positions=sim.preloaded.map(s=>s.progress);sim.advance(1/120);
  const speeds=sim.preloaded.map((s,i)=>{let moved=sim.unitsBetween(positions[i],s.progress);if(moved>sim.blockUnits/2)moved-=sim.blockUnits;return moved*120;});
  assert(speeds.every(v=>v<=unitSpeed(sim)+1e-7),'Nothing outruns the belt');
  if(!arrow.done&&speeds.some(v=>v<0))pushed=true;
  assertSpaced(sim);
 }
 assert(pushed,'Upstream occupants move backward to open the entry');assert(arrow.done);
 assert.equal(sim.onPath.length,101);assert.equal(sim.percentage,100);
 const positions=sim.onPath.map(s=>s.progress);sim.advance(1/120);
 sim.onPath.forEach((s,i)=>assert(Math.abs(sim.unitsBetween(positions[i],s.progress)*120-unitSpeed(sim))<1e-6,'Whole belt moves again'));
 sim.remove(arrow.segments[0]);
 const paused=sim.onPath.map(s=>s.progress);sim.paused=true;sim.advance(2);assert.deepEqual(sim.onPath.map(s=>s.progress),paused);
 sim.paused=false;sim.advance(10);assert.equal(Math.round(sim.percentage),99);
});

test('a whole accepted arrow flows onto the belt without waiting for white removal',()=>{
 const sim=create([]),arrow=sim.arrows.find(a=>sim.canMove(a)&&a.segments.length<=sim.room);
 sim.launch(arrow.data.id);const joined=[];
 for(let frame=0;frame<1200;frame++){
  sim.advance(1/120);assertSpaced(sim);
  const count=arrow.segments.filter(s=>s.progress!==null).length;
  if(count>joined.length)joined.push(frame/120);
 }
 assert(arrow.done);assert.equal(sim.onPath.length,sim.preloaded.length+arrow.segments.length);
 assert.equal(sim.preloaded.filter(s=>s.removed).length,0);
 assert(joined.at(-1)-joined[0]<3,'No slot-by-slot stop-and-go transfer');
 assert.equal(sim.jammed,false);
});

test('overload layout starts with 97 whites in 98 nominal slots (99%) and keeps the 195 board blocks',()=>{
 const sim=create();
 assert.equal(sim.capacity,98);assert.equal(sim.preloaded.length,97);assert.equal(Math.round(sim.percentage),99);assert.equal(sim.room,4);
 assert.equal(sim.arrows.length,60);assert.equal(sim.arrows.reduce((n,a)=>n+a.segments.length,0),195);
 assert(Math.abs(sim.path.length-136.50996458405072)<1e-8);
 // Whites start as one touching train: seam pitch on straights, wider only where a bend needs it.
 const touching=()=>{for(let i=1;i<sim.preloaded.length;i++)assert(Math.abs(sim.unitsBetween(sim.preloaded[i-1].progress,sim.preloaded[i].progress)-1)<1e-6);};
 touching();
 const gaps=sim.preloaded.slice(1).map((s,i)=>wrap(s.progress-sim.preloaded[i].progress)*sim.path.length);
 assert(Math.min(...gaps)<=beltSize*preloadTuning.seam+.011,'Straights pack at the touching seam');
 assert.equal(Math.floor(sim.blockUnits),101);
 const before=sim.preloaded[0].progress;sim.advance(2);
 assert.notEqual(sim.preloaded[0].progress,before);assert.equal(sim.onPath.length,97,'Colored cannons must not consume whites');
 touching();
 const full=createFull([]);assert.equal(full.preloaded.length,97);
 const free=full.arrows.find(a=>full.canMove(a)&&a.segments.length<=full.room);assert.equal(full.launch(free.data.id),'accepted','Reference 90% gate must not block the preload preview');
 full.advance(3);assert(full.percentage>=100);
 assert(full.overloaded,'The unmatched full belt fails after its grace period');
 const next=full.arrows.find(a=>!a.moving);assert.equal(full.launch(next.data.id),'ignored');
});

test('preloaded whites participate in matching, removal and the capacity meter',()=>{
 const sim=create(runtime.shooters.map(l=>({...l,queue:[{color:'white',ammo:100}]})));
 const cannons=sim.cannons.lanes.map(l=>l.queue[0]);
 sim.advance(5);assert.equal(sim.onPath.length,sim.preloaded.length,'Whites stay put before the first accepted launch');
 sim.launch(sim.arrows.find(a=>sim.canMove(a)&&a.segments.length<=sim.room).data.id);
 sim.advance(12);
 assert(sim.preloaded.some(s=>s.removed),'White cannon should find the preloaded blocks');
 assert(sim.onPath.length<sim.preloaded.length);assert(cannons.some(c=>c.ammo<100));
});

test('preload renders white bodies at belt height with the board cell scale',()=>{
 const sim=create(),scene=new Scene(),geometries=Object.fromEntries(['head','inner','body','corner'].map(k=>[k,[new BoxGeometry()]]));
 const materials=Object.fromEntries([...new Set([...runtime.arrows.map(a=>a.color),'white','neutral','blocked'])].map(k=>[k,new MeshStandardMaterial()]));
 const board=createBoard(scene,sim,geometries,materials,-1.55),matrix=new Matrix4(),point=new Vector3(),scale=new Vector3();
 const white=scene.children.find(m=>m.material===materials.white&&m.geometry===geometries.body[0]);
 assert.equal(white.count,sim.preloaded.length);white.getMatrixAt(0,matrix);point.setFromMatrixPosition(matrix);scale.setFromMatrixScale(matrix);
 assert(Math.abs(point.y-sim.preloaded[0].position[1])<1e-6);assert(Math.abs(scale.x-beltSize)<1e-6);
 sim.remove(sim.preloaded[0]);board.sync();assert.equal(white.count,sim.preloaded.length-1);
 board.dispose();scene.children.forEach(m=>m.dispose?.());Object.values(materials).forEach(m=>m.dispose());Object.values(geometries).flat().forEach(g=>g.dispose());
});

test('default reference simulation keeps its behavior; dev and production builds both ship the overload level',async()=>{
 const sim=new Simulation(runtime.arrows,new ConveyorPath(runtime.path),runtime.shooters);
 assert.equal(sim.conveyorSpeed,12.825);
 assert.equal(sim.capacity,null);assert.equal(sim.preloaded.length,0);assert.equal(sim.percentage,0);
 sim.insert(sim.arrows[0].segments[0],0);assert.equal(sim.percentage,100*tuning.meterPerBlock/sim.path.length);
 const dev=await loadConfigFromFile({command:'serve',mode:'development'}),build=await loadConfigFromFile({command:'build',mode:'production'});
 const selected=JSON.parse(dev.config.define.__CUSTOM_LEVEL__);
 assert.equal(selected.whitePreloadSize,doc.board.grid.size);assert.equal(JSON.stringify(selected.arrows),JSON.stringify(runtime.arrows));assert.equal(JSON.stringify(selected.path),JSON.stringify(runtime.path));
 assert.deepEqual(selected.shooters.map(s=>s.queue),overloadQueues);
 assert.equal(build.config.define.__CUSTOM_LEVEL__,dev.config.define.__CUSTOM_LEVEL__);
 assert.throws(()=>nearFull(()=>new Simulation([],new ConveyorPath([[0,0,0],[1,0,0],[1,0,1]]),[],1.25)),/near-full/);
 assert.throws(()=>new Simulation([],new ConveyorPath(runtime.path),[],NaN),/preload block size/);
});

test('colored openers preserve the preload until the first hinted arrow unlocks its white cannon',()=>{
 const sim=create(overloadShooters(runtime.shooters)),session=new Session(sim,Infinity);
 assert.equal(overloadQueues.flat().filter(c=>c.color==='white').reduce((n,c)=>n+c.ammo,0),sim.preloaded.length);
 session.advance(5);assert.equal(sim.onPath.length,sim.preloaded.length);assert.equal(sim.cannons.shots.length,0);
 assert(sim.cannons.lanes.every(l=>l.queue[0].color!=='white'));
 const arrow=sim.arrows.find(a=>a.data.id===session.hintId);assert.equal(session.launch(arrow.data.id),'accepted');
 session.advance(2);
 assert(arrow.segments.every(s=>s.removed),'The first hinted arrow clears through its front cannon');
 assert(sim.preloaded.some(s=>s.removed),'Clearing the colored opener unlocks white relief');
});

test('concurrent accepted arrows finish and clear waits for the last white',()=>{
 // An out-of-reach white cannon keeps the full belt clearable without firing, so overload fail stays out of this check.
 const sim=create([{position:[1000,0,1000],queue:[{color:'white',ammo:100}]}]),session=new Session(sim,Infinity);
 // Free belt room first: four arrows cannot physically fit onto a 99% belt.
 for(const s of sim.preloaded.slice(70))sim.remove(s);
 const free=sim.arrows.filter(a=>sim.canMove(a)).slice(0,4);
 for(const a of free)session.launch(a.data.id);
 for(let frame=0;frame<1200;frame++){
  session.advance(1/120);assert.equal(new Set(sim.onPath).size,sim.onPath.length);assertSpaced(sim);
 }
 assert(free.every(a=>a.done),'All concurrent arrows finish joining');
 for(const s of sim.arrows.flatMap(a=>a.segments))sim.remove(s);
 for(const s of sim.preloaded.slice(1))sim.remove(s);
 session.advance(0);assert.equal(session.ended,null,'Remaining white cannon work must not be cut off by board clear');
 sim.remove(sim.preloaded[0]);sim.remove(sim.preloaded[0]);
 session.advance(0);assert.equal(session.ended,'clear');
});

test('a launched arrow slides on the board and each block climbs only near the belt',()=>{
 // A short arrow that fits the 99% belt and rests well away from it, launched alone.
 const size=doc.board.grid.size,path=new ConveyorPath(runtime.path,.1,'first-intersection'),away=a=>{const c=path.position(path.closest(a.position));return Math.hypot(a.position[0]-c[0],a.position[2]-c[2])>2.5*size;};
 const data=runtime.arrows.find(a=>a.cells.length>1&&a.cells.length<=4&&away(a)),color=data.color;
 const sim=new Simulation([data],new ConveyorPath(runtime.path,.1,'first-intersection'),[],size);
 const geometries=Object.fromEntries(['head','inner','body','corner'].map(k=>[k,[new BoxGeometry()]]));
 const materials=Object.fromEntries([color,'white','neutral','blocked'].map(k=>[k,new MeshStandardMaterial()]));
 const scene=new Scene(),board=createBoard(scene,sim,geometries,materials,-1.55),matrix=new Matrix4(),point=new Vector3(),scale=new Vector3();
 const body=scene.children.find(m=>m.material===materials[color]&&m.geometry===geometries.body[0]);
 const head=scene.children.find(m=>m.material===materials[color]&&m.geometry===geometries.head[0]);
 const y=(mesh,i)=>{mesh.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix);scale.setFromMatrixScale(matrix);return point.y;};
 const arrow=sim.arrows[0];sim.launch(arrow.data.id);sim.advance(.02);board.sync();
 assert(Math.abs(y(head,0)+1.55*size)<1e-6,'No jump on tap: the head is still at board height');
 let staggered=false;
 for(let frame=0;frame<1200&&!arrow.done;frame++){
  sim.advance(1/120);board.sync();
  if(head.count&&body.count&&y(head,0)>y(body,body.count-1)+.1)staggered=true;
 }
 assert(staggered,'The head climbs before the blocks behind it');assert(arrow.done);
 for(let i=0;i<body.count;i++){assert.equal(y(body,i),0);assert(Math.abs(scale.x-beltSize)<1e-6);}
 board.dispose();scene.children.forEach(m=>m.dispose?.());Object.values(materials).forEach(m=>m.dispose());Object.values(geometries).flat().forEach(g=>g.dispose());
});

test('every arrow merges onto the belt without overlapping belt blocks, sliding off the centerline or snapping its heading',()=>{
 // A 70% belt leaves room for the 6- and 8-block arrows too; each arrow launches alone so every entry gets checked.
 for(const data of runtime.arrows){
  const sim=withFraction(.7,()=>new Simulation([data],new ConveyorPath(runtime.path,.1,'first-intersection'),[],doc.board.grid.size));
  const arrow=sim.arrows[0];if(!sim.canMove(arrow))continue;
  assert.equal(sim.launch(arrow.data.id),'accepted');
  const near=new Set(),lane=s=>{const c=sim.path.position(sim.path.closest(s.position));return Math.hypot(s.position[0]-c[0],s.position[2]-c[2]);};
  let yaw=arrow.segments[0].yaw;
  for(let frame=0;frame<1200&&!arrow.done;frame++){
   sim.advance(1/120);
   const head=arrow.segments[0];
   if(head.progress===null){const turn=Math.abs(((head.yaw-yaw)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);assert(turn<.3,`Arrow ${data.id} heading snaps ${turn.toFixed(2)} rad`);yaw=head.yaw;}
   for(const s of arrow.segments)if(s.progress===null){
    const off=lane(s);
    if(near.has(s))assert(off<.35*beltSize,`Arrow ${data.id} block ${s.index} slides ${off.toFixed(2)} off the centerline`);
    else if(off<.25*beltSize)near.add(s);
    if(off<.5*beltSize)for(const w of sim.preloaded)assert(Math.hypot(w.position[0]-s.position[0],w.position[2]-s.position[2])>=.8*beltSize,`Arrow ${data.id} block ${s.index} overlaps a belt block`);
   }
  }
  assert(arrow.done,`Arrow ${data.id} finishes joining`);
 }
});

test('full belt ends in fail only when no front cannon can clear a block on it',()=>{
 const run=match=>{
  const probe=createFull([]),arrow=probe.arrows.find(a=>probe.canMove(a)&&a.segments.length<=probe.room),color=arrow.data.color;
  const other=probe.arrows.map(a=>a.data.color).find(c=>c!==color);
  const sim=createFull([{...runtime.shooters[0],queue:[{color:match?color:other,ammo:arrow.segments.length}]}]),session=new Session(sim,Infinity);
  assert.equal(session.launch(arrow.data.id),'accepted');
  for(let frame=0;frame<2400&&!session.ended;frame++)session.advance(1/120);
  return session;
 };
 const stuck=run(false);assert.equal(stuck.ended,'fail');assert(stuck.simulation.percentage>=100);
 const clearing=run(true);assert.equal(clearing.ended,null);assert(clearing.simulation.percentage<100);
});

test('arrows longer than the free belt room launch and jam into a bounded fail',()=>{
 // White cannon is out of reach, so a white match exists but can never fire.
 const sim=createFull([{position:[1000,0,1000],queue:[{color:'white',ammo:100}]}]),session=new Session(sim,Infinity);
 const free=sim.arrows.filter(a=>sim.canMove(a)),long=free.find(a=>a.segments.length>sim.room);
 assert(long,'Level has a free arrow longer than the opening room');
 assert.equal(session.launch(long.data.id),'accepted');assert.equal(long.moving,true);
 for(let frame=0;frame<2400&&!session.ended;frame++){session.advance(1/120);assertSpaced(sim);}
 assert.equal(sim.jammed,true);assert.equal(session.ended,'fail');
 assert(long.segments.some(s=>s.progress===null),'The excess tail stays outside the belt');
});
