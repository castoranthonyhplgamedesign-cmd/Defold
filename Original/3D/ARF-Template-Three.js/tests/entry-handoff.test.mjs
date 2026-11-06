import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {flowRuntime} from '../src/layout/arrowFlow.ts';
import {ConveyorPath,distance} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
import {Session} from '../src/core/session.ts';
import {overloadShooters} from '../src/data/overloadCannons.ts';

const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json')),runtime=flowRuntime(doc);
const path=()=>new ConveyorPath(runtime.path,.1,'first-intersection');

test('pushback leaves the full authored approach and distance-based launch speed intact',()=>{
  for(const id of [0,2,27,51,58]){
    const sim=new Simulation([runtime.arrows.find(a=>a.id===id)],path(),[],doc.board.grid.size);
    sim.preloaded.slice(60).forEach(s=>sim.remove(s));
    assert.equal(sim.launch(id),'accepted');
    const arrow=sim.arrows[0],head=arrow.segments[0],route=arrow.route,total=route.lengths.at(-1);
    let travelled=0,mergeFrames=0;
    for(let frame=0;frame<600&&head.progress===null;frame++){
      const before=[...head.position];sim.advance(1/120);
      assert(arrow.travelled>=travelled,'Head never travels backward before joining');
      assert(arrow.travelled-travelled<=sim.launchSpeed/120+1e-8,'No handoff acceleration');
      assert(distance(before,head.position)<=sim.launchSpeed/120+1e-8,'No lateral takeover');
      travelled=arrow.travelled;
      if(head.progress!==null)assert(Math.abs(travelled-total)<1e-8,'The whole curve finishes before belt admission');
      else {
        if(travelled>route.merge)mergeFrames++;
        let k=1;while(k<route.lengths.length-1&&route.lengths[k]<travelled)k++;
        const f=(travelled-route.lengths[k-1])/(route.lengths[k]-route.lengths[k-1]);
        const expected=route.points[k-1].map((v,i)=>v+(route.points[k][i]-v)*f);
        assert(distance(head.position,expected)<1e-8,'Belt pushback cannot move a flying head off its route');
      }
    }
    assert(head.progress!==null);assert(mergeFrames>0,'The merge curve remains visible');
    sim.advance(3);assert(arrow.done,'The original tail-follow finishes too');
  }
});

test('nearest-point lookup preserves the distance-based choice on the artist conveyor',()=>{
  const p=path();
  for(const point of runtime.arrows.flatMap(a=>a.cells.map(c=>c.map((v,i)=>v+a.position[i])))){
    let best=Infinity,index=0;
    p.points.forEach((sample,i)=>{const d=distance(point,sample);if(d<best){best=d;index=i;}});
    assert.equal(p.closest(point),index/p.points.length);
  }
});

test('purple below the tutorial cyan enters the nearby curve with the cyan still on the board',()=>{
  const sim=new Simulation(runtime.arrows,path(),overloadShooters(runtime.shooters),doc.board.grid.size);
  const purple=sim.arrows.find(a=>a.data.id===2),cyan=sim.arrows.find(a=>a.data.id===51);
  assert(sim.canMove(purple),'Cyan beyond the curved entry must not block purple');
  const route=purple.route,entry=purple.entry;
  assert(sim.canMove(purple));assert.equal(purple.route,route,'Repeated hints reuse the planned route');
  assert.equal(sim.launch(2),'accepted');
  assert.equal(purple.route,route);assert.equal(purple.entry,entry,'Launch uses the exit used by obstruction checking');
  sim.advance(2);assert(purple.done);assert(!cyan.moving&&cyan.segments.every(s=>!s.removed));
});

test('a real blocker before the curved entry still blocks purple',()=>{
  const purple=structuredClone(runtime.arrows.find(a=>a.id===2)),size=doc.board.grid.size;
  const blocker={id:100,color:'blue',cellSize:size,position:[purple.position[0],0,purple.position[2]-size],direction:[1,0,0],cells:[[0,0,0]]};
  const sim=new Simulation([purple,blocker],path(),[],size);
  assert(!sim.canMove(sim.arrows[0]));assert.equal(sim.launch(2),'blocked');
  assert(sim.arrows[0].feedback);assert(!sim.arrows[0].moving);
});

test('finite path intersections return the first crossed edge and reject a short or backward approach',()=>{
  for(const raw of [[[0,0,0],[10,0,0],[10,0,10],[0,0,10]],[[0,0,10],[10,0,10],[10,0,0],[0,0,0]]]){
    const p=new ConveyorPath(raw,.1,'first-intersection');
    const hit=p.intersection([-1,0,5],[12,0,0],1);
    assert(hit!==null);assert(distance(p.position(hit),[0,0,5])<1e-8);
    assert.equal(p.intersection([-1,0,5],[.5,0,0],1),null);
    assert.equal(p.intersection([-1,0,5],[-12,0,0],1),null);
    assert.equal(p.intersection([5,0,5],[0,0,0],1),null);
  }
});

test('all four tutorial cyan blocks are shot on their first pass at different belt phases',()=>{
  for(const idle of [0,.25,.5,1,2,3,5]){
    const sim=new Simulation(runtime.arrows,path(),overloadShooters(runtime.shooters),doc.board.grid.size),session=new Session(sim,Infinity);
    session.advance(idle);
    const arrow=sim.arrows.find(a=>a.data.id===session.hintId),cannon=sim.cannons.lanes[0].queue[0];
    assert.equal(arrow.data.id,51);assert.equal(arrow.data.color,'blue');assert.equal(arrow.segments.length,4);
    assert.equal(session.launch(arrow.data.id),'accepted');
    session.advance(2);
    assert(arrow.segments.every(s=>s.removed),`Idle ${idle}: cyan tail missed its first pass`);
    assert.equal(cannon.ammo,0);assert.equal(cannon.reserved,0);
    assert.equal(sim.cannons.lanes[0].queue[0].color,'white');
    assert(sim.preloaded.some(s=>s.removed),'White relief follows the cleared cyan opener');
    assert(sim.arrows.filter(a=>a!==arrow).every(a=>a.segments.every(s=>!s.removed)),'Resting arrows are never targets');
  }
});

test('curved entry routes end at their first belt crossing instead of passing through it',()=>{
  for(const id of [0,1,3,9,14,19,27,28,29,37,40,48,58]){
    const data=runtime.arrows.find(a=>a.id===id),sim=new Simulation([data],path(),[],doc.board.grid.size);
    for(const s of sim.preloaded.slice(60))sim.remove(s);
    assert.equal(sim.launch(id),'accepted');
    const route=sim.arrows[0].route,end=route.points.at(-1);
    // Independently intersect every launch edge against the conveyor polyline.
    for(let k=1;k<route.points.length;k++){
      const a=route.points[k-1],b=route.points[k],dx=b[0]-a[0],dz=b[2]-a[2];
      for(let j=0;j<sim.path.points.length;j++){
        const c=sim.path.points[j],d=sim.path.points[(j+1)%sim.path.points.length],ex=d[0]-c[0],ez=d[2]-c[2],det=dx*ez-dz*ex;
        if(Math.abs(det)<1e-10)continue;
        const t=((c[0]-a[0])*ez-(c[2]-a[2])*ex)/det,u=((c[0]-a[0])*dz-(c[2]-a[2])*dx)/det;
        if(t>=0&&t<=1&&u>=0&&u<=1)assert(distance([a[0]+dx*t,0,a[2]+dz*t],end)<1e-5,`Arrow ${id} crosses the belt before joining`);
      }
    }
    sim.advance(6);assert(sim.arrows[0].done,`Arrow ${id} must finish entering`);
  }
});
