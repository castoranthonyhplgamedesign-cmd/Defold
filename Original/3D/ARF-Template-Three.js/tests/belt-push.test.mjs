import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {flowRuntime} from '../src/layout/arrowFlow.ts';import {ConveyorPath,distance} from '../src/core/path.ts';import {Simulation} from '../src/core/simulation.ts';import {beltPushSeconds} from '../src/core/beltPush.ts';import {Cannons} from '../src/core/cannons.ts';
const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json')),data=flowRuntime(doc);
const make=()=>new Simulation(data.arrows,new ConveyorPath(data.path,.1,'first-intersection'),[],doc.board.grid.size);
function spaced(sim){const ordered=[...sim.onPath].sort((a,b)=>a.progress-b.progress);for(let i=0;i<ordered.length;i++)assert(sim.unitsBetween(ordered[i].progress,ordered[(i+1)%ordered.length].progress)>=1-1e-7);}
function signed(sim,from,to){let d=sim.unitsBetween(from,to);if(d>sim.blockUnits/2)d-=sim.blockUnits;return d;}

test('occupied entry yields only backward, preserves poses on reservation, and blends along the artist path',()=>{
 const sim=make(),part=sim.arrows[0].segments[0],entry=sim.preloaded[50].progress;
 const before=sim.preloaded.map(s=>({progress:s.progress,position:[...s.position]}));
 assert(sim.insert(part,entry));spaced(sim);const shifts=sim.preloaded.map((s,i)=>-signed(sim,before[i].progress,s.progress));
 assert(shifts.some(d=>d>.9));assert(shifts.every(d=>d>=-1e-7));assert(shifts.some(d=>Math.abs(d)<1e-7));
 sim.preloaded.forEach((s,i)=>assert.deepEqual(s.position,before[i].position,'Reservation must not teleport the train'));
 const elapsed=7/120;sim.advance(elapsed);
 sim.preloaded.forEach((s,i)=>{
  const expected=sim.fromUnits(sim.toUnits(before[i].progress)+10*elapsed-shifts[i]*elapsed/beltPushSeconds);
  assert(distance(s.position,sim.path.position(expected))<1e-7,'Push follows the path, including bends');
 });
 const paused=JSON.stringify(sim.onPath);sim.paused=true;sim.advance(10);assert.equal(JSON.stringify(sim.onPath),paused);sim.paused=false;
 sim.advance(beltPushSeconds);spaced(sim);
 sim.preloaded.forEach(s=>assert(distance(s.position,sim.path.position(s.progress))<1e-7));
});

test('wraparound and concurrent insertions share real capacity, and a full belt rejects without moving occupants',()=>{
 const sim=make(),parts=sim.arrows.flatMap(a=>a.segments),limit=Math.floor(sim.blockUnits),room=limit-sim.onPath.length;
 for(let i=0;i<room;i++){assert(sim.insert(parts[i],i%2?1-1e-12:0));spaced(sim);}
 const before=JSON.stringify(sim.onPath);assert.equal(sim.insert(parts[room],.5),false);assert.equal(JSON.stringify(sim.onPath),before);
 assert.equal(new Set(sim.onPath).size,limit);
 for(let i=0;i<40;i++){sim.advance(1/120);spaced(sim);}
});

test('a reserved cannon shot keeps the same target when entry pushes that target backward',()=>{
 const sim=make(),target=sim.preloaded[50],p=target.position;
 const cannons=new Cannons([{position:[p[0],-.428,p[2]-5.313],queue:[{color:'white',ammo:1}]}]);
 cannons.update(.001,[target],sim.preloaded,s=>sim.remove(s));assert.equal(cannons.shots.length,1);assert.equal(cannons.shots[0].target,target);
 assert(sim.insert(sim.arrows[0].segments[0],target.progress));sim.advance(.025);
 assert.equal(cannons.shots[0].target,target);cannons.update(.1,sim.onPath,sim.preloaded,s=>sim.remove(s));
 assert(target.removed);assert.equal(cannons.shots.length,0);assert.equal(cannons.lanes[0].queue.length,0);spaced(sim);
});
