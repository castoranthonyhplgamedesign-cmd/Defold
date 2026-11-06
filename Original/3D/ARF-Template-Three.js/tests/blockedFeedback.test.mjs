import test from 'node:test';
import assert from 'node:assert/strict';
import { BlockedFeedback } from '../src/core/blockedFeedback.ts';
import { Simulation } from '../src/core/simulation.ts';
import { ConveyorPath } from '../src/core/path.ts';

test('template contact, cascading whole-arrow shake and smooth route reversal', () => {
  const origins = [[0,0,0],[-1,0,0],[-1,0,1]];
  const feedback = new BlockedFeedback(origins,[1,0,0],[[3,0,0]],3);
  assert(Math.abs(feedback.travel-2.22)<1e-9);
  assert.equal(feedback.cascadeSeconds,.14/1.8);
  assert(Math.abs(feedback.approachSeconds - 2.22 / 8.64) < 1e-9);
  feedback.elapsed = feedback.approachSeconds;
  assert(Math.abs(feedback.position(0)[0]-2.22)<1e-9);
  const tailContact = feedback.position(2);
  feedback.elapsed += .03;
  assert.notEqual(feedback.position(0)[2],0);
  assert.deepEqual(feedback.position(2),tailContact,'Tail waits for its cascade delay');
  feedback.elapsed = feedback.approachSeconds + .07 + .03;
  assert.notDeepEqual(feedback.position(2),tailContact,'Shake reaches tail');
  feedback.elapsed = feedback.duration;
  origins.forEach((p,i)=>assert.deepEqual(feedback.position(i),p));
  assert.equal(feedback.yaw(1),-Math.PI / 2);
  assert.equal(feedback.yaw(2),0);
  assert(feedback.done);
});

test('two red pulses begin at contact and completely release the original color between peaks',()=>{
  for(const count of [1,3,12]){
    const f=new BlockedFeedback(Array.from({length:count},(_,i)=>[-i,0,0]),[1,0,0],[[3,0,0]],3);
    f.elapsed=f.approachSeconds/2;assert.equal(f.flash,0);
    const duration=f.duration-f.approachSeconds;
    for(const [phase,opacity] of [[0,0],[.25,.65],[.5,0],[.75,.65],[1,0]]){
      f.elapsed=f.approachSeconds+duration*phase;assert(Math.abs(f.flash-opacity)<1e-9);
    }
  }
});

test('blocked contact event waits for impact, pauses with the simulation and emits once',()=>{
  const arrows=[0,3].map((x,id)=>({id,color:'green',position:[x,0,0],direction:[1,0,0],cells:[[0,0,0]]}));
  const sim=new Simulation(arrows,new ConveyorPath([[-5,0,-5],[5,0,-5],[5,0,5],[-5,0,5]]));
  let events=0;sim.onBlockedContact=()=>{events++;assert(sim.arrows[0].feedback.elapsed>=sim.arrows[0].feedback.approachSeconds);};
  sim.launch(0);assert.equal(events,0);sim.advance(.1);assert.equal(events,0);
  sim.paused=true;sim.advance(5);assert.equal(events,0);
  sim.paused=false;sim.advance(.2);assert.equal(events,1);
  sim.advance(2);assert.equal(events,1);
  sim.launch(0);sim.advance(2);assert.equal(events,2);
});
test('feedback preserves logical occupancy, rejects repeated taps and resumes correctly', () => {
  const arrow=(id,position,cells)=>({id,position,cells,direction:[1,0,0],color:'green'});
  const sim=new Simulation([arrow(1,[0,0,0],[[0,0,0],[-1,0,0]]),arrow(2,[2,0,0],[[0,0,0]])],new ConveyorPath([[-5,0,-5],[5,0,-5],[5,0,5],[-5,0,5]]));
  const before=JSON.stringify(sim.arrows[0].segments);
  assert.equal(sim.launch(1),'blocked'); sim.advance(.15);
  const elapsed=sim.arrows[0].feedback.elapsed;
  assert.equal(sim.launch(1),'ignored'); assert.equal(sim.arrows[0].feedback.elapsed,elapsed);
  sim.paused=true;sim.advance(5);assert.equal(sim.arrows[0].feedback.elapsed,elapsed);
  sim.paused=false;sim.advance(2);
  assert.equal(sim.arrows[0].feedback,null);assert.equal(JSON.stringify(sim.arrows[0].segments),before);
  assert.equal(sim.onPath.length,0);assert.equal(sim.percentage,0);
});

test('far blocked approach speeds up so it lasts no longer than a three-cell approach',()=>{
  const near=new BlockedFeedback([[0,0,0]],[1,0,0],[[3,0,0]],10),far=new BlockedFeedback([[0,0,0]],[1,0,0],[[12,0,0]],20);
  assert(near.travel<3&&far.travel>10);assert(Math.abs(near.speed-far.speed*3/far.travel)<1e-9);
  assert(Math.abs(far.approachSeconds-3/near.speed)<1e-9);assert(near.approachSeconds<far.approachSeconds+1e-9);
});
