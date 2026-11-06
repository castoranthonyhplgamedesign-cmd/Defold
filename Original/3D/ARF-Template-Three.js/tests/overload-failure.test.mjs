import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {flowRuntime} from '../src/layout/arrowFlow.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
import {Session} from '../src/core/session.ts';

const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json')),r=flowRuntime(doc);
const make=(lanes=[])=>new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),lanes,doc.board.grid.size);
function spaced(sim){
 const p=sim.onPath.map(s=>s.progress).sort((a,b)=>a-b);
 assert(p.length<=Math.floor(sim.blockUnits));
 p.forEach((v,i)=>assert(sim.unitsBetween(v,p[(i+1)%p.length])>=1-1e-6,'No overlap between admitted blocks'));
}
function tick(session){session.advance(1/120);spaced(session.simulation);}

test('the first excess segment fails in the same tick and freezes all gameplay once',()=>{
 const sim=make(),session=new Session(sim),a=sim.arrows.find(a=>sim.canMove(a)&&a.segments.length>sim.room);
 let endings=0;session.onEnd=reason=>{assert.equal(reason,'fail');endings++;};
 assert.equal(session.launch(a.data.id),'accepted');assert(session.started);assert.equal(session.ended,null);
 let warned=null;
 for(let i=0;i<600&&!session.ended;i++){
  tick(session);
  if(sim.jammed&&warned===null){warned=session.time;assert(sim.percentage>=100);assert.equal(session.ended,'fail');}
  for(const s of a.segments.filter(s=>s.progress===null))for(const b of sim.onPath.filter(b=>b.arrowId!==s.arrowId))assert(Math.hypot(s.position[0]-b.position[0],s.position[2]-b.position[2])>=.8*doc.board.grid.size*sim.beltScale,'Excess tail stays outside occupied belt blocks');
 }
 assert.equal(session.ended,'fail');assert(warned!==null);
 assert.equal(session.endedAt,warned);assert(sim.cannons.stopped);assert.equal(sim.cannons.shots.length,0);
 assert(a.segments.some(s=>s.progress===null));assert.equal(endings,1);
 const snapshot=()=>JSON.stringify({arrows:sim.arrows,belt:sim.onPath,cannons:sim.cannons.lanes});
 const pose=snapshot();session.advance(.3);assert.equal(snapshot(),pose);assert(!session.endcardShown);
 session.advance(.31);assert(session.endcardShown);assert.equal(snapshot(),pose);assert.equal(endings,1);
 assert.equal(session.launch(sim.arrows.find(b=>!b.moving).data.id),'ignored');
});

test('real matching cannon shots during entry rescue an arrow longer than the opening room',()=>{
 const probe=make(),a=probe.arrows.find(a=>probe.canMove(a)&&a.segments.length>probe.room);
 const p=probe.path.position(probe.fromUnits(probe.toUnits(a.entry)+1.5));
 const sim=make([{position:[p[0],-.428,p[2]-5.313],queue:[{color:a.data.color,ammo:a.segments.length}]}]),session=new Session(sim),arrow=sim.arrows.find(b=>b.data.id===a.data.id);
 let hits=0;sim.cannons.onHit=()=>hits++;
 assert.equal(session.launch(a.data.id),'accepted');
 for(let i=0;i<1200&&!session.ended&&!arrow.segments.every(s=>s.removed);i++)tick(session);
 assert.equal(session.ended,null);assert(arrow.done);assert.equal(hits,arrow.segments.length);assert(!sim.overloadPending);
});

test('a full meter still permits open launches and preserves blocked-path feedback',()=>{
 const sim=make(),session=new Session(sim);assert.equal(session.launch(51),'accepted');
 for(let i=0;i<120&&!sim.overloadPending&&sim.percentage<100;i++)tick(session);
 assert(sim.percentage>=100);assert.equal(session.ended,null);
 const blocked=sim.arrows.find(a=>!a.moving&&!sim.canMove(a));assert(blocked);
 assert.equal(session.launch(blocked.data.id),'blocked');assert(blocked.feedback);
 const free=sim.arrows.find(a=>sim.canMove(a)&&!a.feedback);assert(free);
 assert.equal(session.launch(free.data.id),'accepted');
 for(let i=0;i<1200&&!session.ended;i++)tick(session);
 assert.equal(session.ended,'fail');
});

test('paused approach cannot fail, and freeing space after a failure cannot restart it',()=>{
 const sim=make(),session=new Session(sim),a=sim.arrows.find(a=>sim.canMove(a)&&a.segments.length>sim.room);
 session.launch(a.data.id);
 session.advance(.05);const pose=JSON.stringify(sim.arrows),at=session.time;
 sim.paused=true;session.advance(20);assert.equal(session.time,at);assert.equal(session.ended,null);assert.equal(JSON.stringify(sim.arrows),pose);
 sim.paused=false;for(let i=0;i<600&&!session.ended;i++)tick(session);
 assert.equal(session.ended,'fail');assert(sim.jammed);
 sim.preloaded.slice(0,10).forEach(s=>sim.remove(s));
 const frozen=JSON.stringify(sim.arrows);sim.advance(2);session.advance(2);
 assert.equal(session.ended,'fail');assert(sim.overloaded);assert.equal(JSON.stringify(sim.arrows),frozen);
});

test('multiple open launches are accepted and cannot overpack the belt while they jam',()=>{
 const sim=make(),session=new Session(sim);let accepted=0;
 for(const a of sim.arrows)if(sim.canMove(a)&&session.launch(a.data.id)==='accepted')accepted++;
 assert(accepted>1);
 for(let i=0;i<1800&&!session.ended;i++){tick(session);if(sim.jammed)assert.equal(session.ended,'fail','Other moving arrows cannot postpone failure');}
 assert.equal(session.ended,'fail');assert(sim.arrows.some(a=>a.moving&&!a.done));
});
