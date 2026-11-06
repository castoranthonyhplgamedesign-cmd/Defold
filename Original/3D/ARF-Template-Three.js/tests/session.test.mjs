import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Session,sessionTuning} from '../src/core/session.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {pulse,handPose,handTransform} from '../src/ui/motion.ts';
const level=JSON.parse(fs.readFileSync('src/data/level.json'));
const path=JSON.parse(fs.readFileSync('src/data/path.json'));
const fixture=()=>new Session(new Simulation(level.arrows,new ConveyorPath(path),level.shooters));

test('warning cues follow visible pulse crests after interaction and stop below the threshold',()=>{
 const s=fixture();let pressure=99,pulses=0,stops=0;
 Object.defineProperty(s.simulation,'percentage',{get:()=>pressure});
 s.onWarningPulse=()=>pulses++;s.onWarningStop=()=>stops++;
 s.advance(2.2);assert(s.warningActive);assert.equal(pulses,0,'No audible startup warning');
 pressure=0;s.launch(148);pressure=99;s.advance(.54);assert.equal(pulses,0);s.advance(.02);assert.equal(pulses,1);
 assert(Math.abs(s.warningPhase-.5)<.02,'Cue occurs at the bright part of the pulse');
 s.advance(1.1);assert.equal(pulses,2);
 const phase=s.warningPhase;s.simulation.paused=true;s.advance(10);assert.equal(s.warningPhase,phase);assert.equal(pulses,2);
 s.simulation.paused=false;s.advance(.1);assert.equal(pulses,2,'Resume does not replay missed pulses');
 pressure=94;s.advance(.1);assert(!s.warningActive);assert.equal(stops,1);assert.equal(s.warningPhase,0);
 s.advance(5);assert.equal(stops,1);assert.equal(pulses,2);
 pressure=99;s.advance(.56);assert.equal(pulses,3,'A later full-belt warning can sound again');
 pressure=0;s.launch(141);pressure=99;s.remaining=.01;s.advance(.02);assert.equal(s.ended,'timeout');assert.equal(stops,2);
 s.advance(5);assert.equal(pulses,3,'No endcard warning cues');
});

test('rapid warning pulses retain their authored cadence and threshold equality',()=>{
 const s=fixture();Object.defineProperty(s.simulation,'percentage',{get:()=>95});
 let pulses=0;s.onWarningPulse=()=>pulses++;s.launch(148);s.warningUntil=s.time+1;
 s.advance(.14);assert.equal(pulses,0);s.advance(.02);assert.equal(pulses,1);
 s.advance(.3);assert.equal(pulses,2);assert(s.warningActive);
});
test('first successful launch starts timer; idle and blocked taps do not',()=>{
  const s=fixture();assert(s.hintId!==null);s.advance(10);assert.equal(s.remaining,60);
  assert.equal(s.launch(148),'blocked');s.advance(.5);assert.equal(s.remaining,60);
  assert.equal(s.launch(141),'accepted');assert.equal(s.hintId,null);s.advance(1);assert.equal(s.remaining,59);
  s.simulation.paused=true;const time=s.time;s.advance(20);assert.equal(s.time,time);assert.equal(s.remaining,59);
  s.simulation.paused=false;s.advance(4);assert(s.hintId!==null);
});

test('blocked tap dismisses the hand until idle and preserves a stable valid hint',()=>{
  const s=fixture(),initial=s.hintId;s.advance(2);assert.equal(s.hintId,initial);
  s.launch(148);assert.equal(s.hintId,null);s.advance(3.4);assert.equal(s.hintId,null);
  s.advance(.2);assert(s.hintId!==null);assert(s.simulation.canMove(s.simulation.arrows.find(a=>a.data.id===s.hintId)));
  assert.equal(s.remaining,60);
});

test('every arrow press restarts hint inactivity, including a repeated blocked-animation press',()=>{
  const s=fixture();assert(s.hintId!==null);
  s.launch(148);s.advance(.1);assert.equal(s.launch(148),'ignored');assert.equal(s.taps,1);assert.equal(s.idle,0);
  s.advance(3.4);assert.equal(s.hintId,null);s.advance(.2);assert(s.hintId!==null);
  s.launch(148);assert.equal(s.hintId,null);s.advance(3);s.launch(148);s.advance(3.4);assert.equal(s.hintId,null);
  s.simulation.paused=true;s.advance(10);assert.equal(s.hintId,null);s.simulation.paused=false;
  s.advance(.2);assert(s.hintId!==null);assert.equal(s.started,false);
});

test('tutorial fingertip stays on the arrowhead during both tap sprites and scales with the camera',()=>{
  for(const scale of [8,16,30])for(const age of [.4,1.05,1.13,1.3]){
    const project=([x,y,z])=>({x:200+x*scale,y:350+(z-y)*scale});
    const head=[-4,0,3],motion=handPose(age),target=project([-4,1.2,3]);
    const [a,b,c,d,e,f]=handTransform(project,head,age).match(/matrix\((.*)\)/)[1].split(',').map(Number);
    const tipY=motion.tap?29:14;
    assert(Math.abs(a*29+c*tipY+e-target.x)<1e-9);
    assert(Math.abs(b*29+d*tipY+f-target.y+(motion.tap?0:8*scale*.017))<1e-9);
    assert(Math.hypot(a,b)*196<scale*4,'Hand covers less than four cells');
  }
});
test('timeout freezes simulation, cancels effects and rejects further launches',()=>{
  const s=fixture();s.launch(141);s.advance(60);assert.equal(s.ended,'timeout');assert.equal(s.remaining,0);assert(s.simulation.cannons.stopped);
  const state=JSON.stringify(s.simulation.arrows);const endedAt=s.endedAt;s.advance(10);
  assert.equal(JSON.stringify(s.simulation.arrows),state);assert.equal(s.endedAt,endedAt);assert.equal(s.launch(142),'ignored');
});
test('actual clear takes precedence over timeout and empty/no-match hints are safe',()=>{
  const s=fixture();s.launch(141);s.simulation.arrows.forEach(a=>a.segments.forEach(b=>{b.removed=true;}));s.advance(.01);assert.equal(s.ended,'clear');
  const empty=new Session(new Simulation([],new ConveyorPath(path)));empty.advance(10);assert.equal(empty.hintId,null);assert.equal(empty.ended,null);
});
test('full conveyor warns without ending or starting countdown',()=>{
  const s=fixture();s.simulation.onPath=Array(160).fill(s.simulation.arrows[0].segments[0]);assert.equal(s.launch(141),'full');assert.equal(s.warningUntil,1);assert.equal(s.started,false);assert.equal(s.ended,null);
});
test('decoded weighted pulse pingpongs and hand switches at authored beats',()=>{
  const c=JSON.parse(fs.readFileSync('src/data/cta-pulse.json'));
  assert(Math.abs(pulse(0,c)-1)<1e-6);assert(Math.abs(pulse(2,c)-1.1)<1e-6);assert(Math.abs(pulse(4,c)-1)<1e-6);assert(Math.abs(pulse(1,c)-pulse(3,c))<1e-9);
  assert.equal(handPose(.4).tap,false);assert.equal(handPose(1.05).tap,true);assert.equal(handPose(1.3).tap,false);
  assert.equal(handPose(.125).opacity,.5);assert.equal(handPose(1).opacity,1);assert(handPose(1.8).opacity>0&&handPose(1.8).opacity<1);assert.equal(handPose(2.5).opacity,0);assert.equal(handPose(4.05).tap,true);assert.equal(handPose(5.3).tap,false);
});

test('90-second variant starts on launch, pauses when hidden and times out at 90',()=>{
  const s=new Session(new Simulation(level.arrows,new ConveyorPath(path),level.shooters),90);
  s.advance(10);assert.equal(s.remaining,90);s.launch(141);s.advance(60);
  assert.equal(s.ended,null);assert.equal(s.remaining,30);
  s.simulation.paused=true;s.advance(20);assert.equal(s.remaining,30);s.simulation.paused=false;
  s.advance(29.9);assert.equal(s.ended,null);s.advance(.1);assert.equal(s.ended,'timeout');assert(s.remaining<1e-9);
});

test('90-second variant still wins immediately on a clear after the former 60-second limit',()=>{
  const s=new Session(new Simulation(level.arrows,new ConveyorPath(path),level.shooters),90);s.launch(141);s.advance(70);
  assert.equal(s.ended,null);s.simulation.arrows.forEach(a=>a.segments.forEach(b=>{b.removed=true;}));s.advance(.01);
  assert.equal(s.ended,'clear');assert(s.remaining>19);s.advance(sessionTuning.winEndcardDelay+.01);assert(s.endcardShown);
});

test('tap-count variant counts blocked and refused taps and ends after the last arrow settles',()=>{
  const s=new Session(new Simulation(level.arrows,new ConveyorPath(path),level.shooters),Infinity,3);
  assert.equal(s.launch(148),'blocked');assert.equal(s.launch(141),'accepted');s.advance(.1);assert.equal(s.launch(148),'ignored');
  s.advance(3);assert.equal(s.ended,null);assert.equal(s.taps,2);
  assert.equal(s.launch(148),'blocked');assert.equal(s.taps,3);assert.equal(s.ended,null);
  assert.equal(s.launch(141),'ignored');s.advance(5);assert.equal(s.ended,'timeout');
});

test('the endcard waits for the lane doors after the run ends and is announced once',()=>{
  const s=fixture();let shown=0;s.onEndcard=()=>shown++;s.launch(141);s.advance(60);assert.equal(s.ended,'timeout');
  s.advance(.5);assert.equal(s.endcardShown,false);s.advance(.2);assert.equal(s.endcardShown,true);s.advance(5);assert.equal(shown,1);
});

test('clear announces the win before the delayed store/endcard and pauses that delay while hidden',()=>{
  const s=fixture(),events=[];s.onEnd=reason=>events.push(reason);s.onEndcard=()=>events.push('endcard');
  s.launch(141);s.simulation.arrows.forEach(a=>a.segments.forEach(b=>{b.removed=true;}));s.advance(.01);
  assert.deepEqual(events,['clear']);s.advance(.6);assert.equal(s.endcardShown,false);
  s.simulation.paused=true;s.advance(10);assert.equal(s.endcardShown,false);s.simulation.paused=false;
  s.advance(1.59);assert.equal(s.endcardShown,false);s.advance(.02);assert.deepEqual(events,['clear','endcard']);
  s.advance(5);assert.deepEqual(events,['clear','endcard']);
});
