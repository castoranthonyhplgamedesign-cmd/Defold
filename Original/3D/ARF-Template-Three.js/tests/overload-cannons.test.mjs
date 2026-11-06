import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseFlowDocument,flowRuntime} from '../src/layout/arrowFlow.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
import {overloadQueues,overloadShooters,overloadHintOrder} from '../src/data/overloadCannons.ts';
import {Session} from '../src/core/session.ts';
import {replay} from '../scripts/overload-replay.mjs';

const doc=parseFlowDocument(JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json'))),runtime=flowRuntime(doc);

test('overload outlines show every open path while the hand recommends a safer move',()=>{
 const sim=new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),overloadShooters(runtime.shooters),doc.board.grid.size),session=new Session(sim,60,Infinity,overloadHintOrder);
 assert.equal(session.hintId,19);
 const free=sim.arrows.filter(a=>sim.canMove(a));
 assert.deepEqual([...session.valid],free.map(a=>a.data.id));
 assert(free.some(a=>a.segments.length>sim.room&&session.valid.has(a.data.id)),'Risky open arrows remain highlighted');
 assert(sim.fits(sim.arrows.find(a=>a.data.id===session.hintId)),'The hand still recommends a fitting arrow');
 session.launch(51);assert.equal(session.hintId,null);
 session.advance(3.4);assert.equal(session.hintId,null,'No immediate next-arrow hint');
 session.advance(.2);assert.notEqual(session.hintId,null,'The hand returns after 3.5 seconds idle');
 assert(session.valid.has(session.hintId));assert(!sim.arrows.find(a=>a.data.id===session.hintId).moving);
 const time=session.time,hint=session.hintId;sim.paused=true;session.advance(10);
 assert.equal(session.time,time);assert.equal(session.hintId,hint);
});

test('the authored guide covers the exact board and accepts player choices outside its suggested order',()=>{
 assert.deepEqual([...overloadHintOrder].sort((a,b)=>a-b),runtime.arrows.map(a=>a.id).sort((a,b)=>a-b));
 const sim=new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),overloadShooters(runtime.shooters),doc.board.grid.size),session=new Session(sim,60,Infinity,overloadHintOrder);
 assert.equal(session.launch(2),'accepted','A different free arrow remains playable');
 for(let i=0;i<900&&session.hintId!==19;i++)session.advance(1/60);
 assert.equal(session.hintId,19,'The guide offers the untouched right cyan once the earlier purple frees belt room');
 assert.equal(session.launch(19),'accepted');
 session.advance(1);assert.notEqual(session.hintId,2,'Already launched arrows are skipped');
});

test('the opening right cyan enters safely, clears, and returns guidance to the earlier route',()=>{
 const sim=new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),overloadShooters(runtime.shooters),doc.board.grid.size),session=new Session(sim,60,Infinity,overloadHintOrder);
 const arrow=sim.arrows.find(a=>a.data.id===session.hintId);
 assert.equal(arrow.data.color,'blue');assert(arrow.data.position[0]>0);assert.equal(arrow.segments.length,4);
 assert.equal(session.launch(arrow.data.id),'accepted');session.advance(3.4);assert.equal(session.hintId,null);
 for(let i=0;i<600&&session.hintId!==51;i++)session.advance(1/60);
 assert.equal(session.ended,null);assert(arrow.segments.every(s=>s.removed));assert.equal(session.hintId,51);
});

test('authored queues preserve exact ammo budgets and colored openers before white relief',()=>{
 const budget=cannons=>cannons.reduce((n,c)=>(n[c.color]=(n[c.color]??0)+c.ammo,n),{});
 const blocks=runtime.arrows.reduce((n,a)=>(n[a.color]=(n[a.color]??0)+a.cells.length,n),{white:new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),[],doc.board.grid.size).preloaded.length});
 assert.deepEqual(budget(overloadQueues.flat()),blocks);
 const totals=overloadQueues.map(q=>q.reduce((n,c)=>n+c.ammo,0));
 assert.deepEqual(totals,[108,77,107]);
 for(const q of overloadQueues){
  assert.notEqual(q[0].color,'white','Opening cannons are colored');
  assert.equal(q[1].color,'white','First cleared color unlocks white relief');
  for(let i=1;i<q.length;i++)assert.notEqual(q[i].color,q[i-1].color,'No color, white included, twice in a row');
 }
});

test('waiting for every idle hint respects the delay and times out without a forced win',()=>{
 const r=replay(overloadQueues,{cadence:.75,guided:true,duration:60,limit:65});
 assert.equal(r.ending,'timeout');assert.equal(r.time,60);assert(r.launched>1&&r.launched<runtime.arrows.length);assert(r.cleared<1);
 for(let i=1;i<r.log.length;i++)assert(r.log[i].time-r.log[i-1].time>=3.5-1e-6);
});

test('the timer still ends an unfinished alternate play order without granting a win',()=>{
 const r=replay(overloadQueues,{cadence:.75,reverse:true,duration:60,limit:65});
 assert.equal(r.ending,'timeout');assert.equal(r.time,60);assert(r.cleared<1);
});
