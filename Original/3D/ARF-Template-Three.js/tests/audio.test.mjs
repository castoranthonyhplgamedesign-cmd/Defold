import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioPools} from '../src/audio/pools.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath} from '../src/core/path.ts';
class Media extends EventTarget {
  paused=true;ended=false;muted=true;volume=1;currentTime=0;calls=[];pauses=0;
  load(){} removeAttribute(){}
  pause(){this.paused=true;this.pauses++;}
  play(){this.paused=false;const call={muted:this.muted,time:this.currentTime};this.calls.push(call);return new Promise((resolve,reject)=>{call.resolve=resolve;call.reject=reject;});}
  playing(){this.paused=false;this.dispatchEvent(new Event('playing'));}
}
const flush=()=>new Promise(resolve=>queueMicrotask(resolve));

test('stopping warning voices invalidates late starts without interrupting result or music pools',async()=>{
 const media=[],audio=new AudioPools({warning:{src:'warning.mp3',count:2,gain:.22},fail:{src:'fail.mp3',count:1,gain:.15},bgm:{src:'bgm.mp3',count:1,gain:.5,loop:true}},()=>{const m=new Media();media.push(m);return m;});
 audio.start(1,()=>audio.startMusic('bgm'));media[3].playing();
 audio.play('warning');const old=media[0].calls.at(-1);
 audio.stopCue('warning');audio.play('fail');media[2].playing();
 old.resolve();await flush();assert(media[0].paused&&media[1].paused);
 assert(!media[2].paused&&!media[3].paused,'Fail and BGM are independent');
 audio.play('warning');media[0].playing();assert(!media[0].paused);
 audio.setState(true,1);assert(media.every(m=>m.paused));audio.setState(false,1);
 assert(media[0].paused&&media[1].paused,'Hidden warnings do not replay on resume');audio.dispose();
});
function fixture(count=2) {
  const media=[];let now=0;
  const audio=new AudioPools({cue:{src:'sound.wav',count,gain:1}},()=>{const m=new Media();media.push(m);return m;},()=>now);
  return {audio,media,tick:n=>{now+=n;}};
}

function musicFixture() {
 const media=[];let now=0;
 const audio=new AudioPools({cue:{src:'cue.wav',count:2,gain:1},bgm:{src:'bgm.mp3',count:1,gain:.5,loop:true}},()=>{const m=new Media();media.push(m);return m;},()=>now);
 return {audio,media,music:media[2],tick:n=>now+=n};
}
test('music starts after due SFX before spare primes, and releases/repeated taps do not restart it',()=>{
 const {audio,media,music}=musicFixture(),order=[];
 media.forEach((m,i)=>{const play=m.play.bind(m);m.play=()=>{order.push([i,m.muted]);return play();};});
 audio.startMusic('bgm');assert.equal(music.calls.length,0);
 audio.start(1,()=>{audio.play('cue',1);audio.startMusic('bgm');});
 assert.deepEqual(order,[[0,false],[2,false],[1,true]]);assert(music.loop);assert.equal(music.volume,.5);
 music.playing();music.currentTime=3;audio.release(1,()=>{});
 audio.start(2,()=>audio.startMusic('bgm'));audio.cancel(2);
 assert.equal(music.calls.length,1);assert.equal(music.currentTime,3);assert(!music.paused);audio.dispose();
});
test('music quick release and bounded move recovery reuse the element and ignore stale callbacks',async()=>{
 const {audio,music,tick}=musicFixture();audio.start(1,()=>audio.startMusic('bgm'));music.currentTime=.03;
 music.calls[0].reject({name:'NotAllowedError'});await flush();
 audio.move(1);assert.equal(music.calls.length,1);tick(100);audio.move(1);assert.equal(music.calls.length,2);
 audio.release(1,()=>{});assert.equal(music.calls.length,3);assert.equal(music.calls[2].time,.03);
 music.calls[1].resolve();await flush();assert(!music.paused);
 music.playing();music.calls[2].reject({name:'NotAllowedError'});await flush();assert(!music.paused);audio.dispose();
});
test('hidden and muted music preserves its position, resumes alone and cannot revive after disposal',async()=>{
 const {audio,music,media}=musicFixture();audio.setState(false,0);
 audio.start(1,()=>audio.startMusic('bgm'));assert.equal(music.calls.length,0);
 audio.setState(false,1);assert.equal(music.calls.length,1);music.playing();music.currentTime=7;
 audio.play('cue');media[0].playing();audio.setState(true,1);assert(media.every(m=>m.paused&&m.muted));assert.equal(music.currentTime,7);
 music.calls[0].resolve();await flush();assert(music.paused);
 audio.setState(false,.4);assert.equal(music.calls.length,2);assert.equal(music.calls[1].time,7);assert.equal(music.volume,.2);assert(media[0].paused);
 music.calls[1].reject({name:'NotAllowedError'});await flush();audio.start(2);assert.equal(music.calls.length,3);
 music.playing();audio.setState(false,0);assert(music.paused);assert.equal(music.currentTime,7);
 audio.setState(false,1);const last=music.calls.at(-1);audio.dispose();last.resolve();await flush();assert(music.paused);
});
test('music does not silently prime before selection or retry an unsupported source',async()=>{
 const {audio,music}=musicFixture();audio.start(1);audio.release(1,()=>{});assert.equal(music.calls.length,0);
 audio.start(2,()=>audio.startMusic('bgm'));music.calls[0].reject({name:'NotSupportedError'});await flush();
 audio.release(2,()=>{});audio.start(3,()=>audio.startMusic('bgm'));assert.equal(music.calls.length,1);audio.dispose();
});

test('prepared blocked SFX starts at contact, never at press-down or during a pause',()=>{
 const {audio,media}=fixture();
 const data=[0,3].map((x,id)=>({id,color:'green',position:[x,0,0],direction:[1,0,0],cells:[[0,0,0]]}));
 const sim=new Simulation(data,new ConveyorPath([[-5,0,-5],[5,0,-5],[5,0,5],[-5,0,5]]));
 sim.onBlockedContact=()=>audio.play('cue');
 const audible=()=>media.flatMap(m=>m.calls).filter(c=>!c.muted).length;
 audio.start(1,()=>sim.launch(0));audio.release(1,()=>{});assert.equal(audible(),0);
 sim.advance(.1);assert.equal(audible(),0);
 sim.paused=true;audio.setState(true,1);sim.advance(3);assert.equal(audible(),0);
 sim.paused=false;audio.setState(false,1);sim.advance(.2);assert.equal(audible(),1);
 sim.advance(2);assert.equal(audible(),1);
 audio.dispose();
});

test('press action requests its cue before spare priming; release recovers audio without repeating the action',async()=>{
 const {audio,media}=fixture(),order=[];let actions=0;
 media.forEach(m=>{const play=m.play.bind(m);m.play=()=>{order.push(m.muted?'prime':'cue');return play();};});
 audio.start(1,()=>{actions++;audio.play('cue',1);});
 assert.equal(actions,1);assert.deepEqual(order,['cue','prime']);
 media[0].currentTime=.03;audio.release(1,()=>{});
 assert.equal(actions,1);assert.equal(media[0].calls.length,2);assert.equal(media[0].calls[1].time,.03);
 media[0].calls[0].reject({name:'NotAllowedError'});await flush();assert.equal(media[0].paused,false);
 audio.dispose();
});
test('persistent voices, synchronous release cue before spare priming, promotion survives stale settlement',async()=>{
  const {audio,media}=fixture();assert.equal(media[0].calls.length,0);
  audio.start(1);assert(media.every(m=>m.calls[0].muted));
  audio.release(1,()=>audio.play('cue',1));assert.equal(media[0].calls.length,2);assert.equal(media[0].calls[1].muted,false);
  media[0].calls[0].resolve();await flush();assert.equal(media[0].paused,false);assert.equal(media[0].muted,false);
  media[0].playing();audio.start(2);audio.release(2,()=>audio.play('cue',2));assert.equal(media[0].calls.length,2);assert.equal(media[1].muted,false);
  audio.dispose();assert(media.every(m=>m.paused));
});
test('quick boundary retries old starts without rewind; stale rejection cannot kill replacement',async()=>{
  const {audio,media}=fixture(1);audio.start(1);audio.play('cue',1);media[0].currentTime=.03;
  audio.release(1,()=>{});assert.equal(media[0].calls.length,3);assert.equal(media[0].calls[2].time,.03);
  media[0].calls[1].reject({name:'NotAllowedError'});await flush();assert.equal(media[0].paused,false);
  media[0].playing();media[0].calls[2].reject({name:'NotAllowedError'});await flush();assert.equal(media[0].paused,false);
});
test('fulfilled promise alone still recovers; observed playing never restarts',async()=>{
  const {audio,media}=fixture(1);audio.start(1);audio.play('cue',1);media[0].calls[1].resolve();await flush();audio.release(1,()=>{});assert.equal(media[0].calls.length,3);
  const f=fixture(1);f.audio.start(2);f.audio.play('cue',2);f.media[0].playing();f.audio.release(2,()=>{});assert.equal(f.media[0].calls.length,2);
});
test('hidden cancellation and late success do not revive audio; new delayed cue after release is independent',async()=>{
  const {audio,media}=fixture(1);audio.start(1);audio.release(1,()=>audio.play('cue',1));audio.setState(true,1);
  media[0].calls[1].resolve();await flush();assert(media[0].paused);audio.setState(false,1);assert(media[0].paused);
  audio.play('cue');assert.equal(media[0].calls.length,3);assert.equal(media[0].muted,false);
  media[0].calls[2].reject({name:'NotAllowedError'});await flush();const calls=media[0].calls.length;audio.start(2);assert.equal(media[0].calls.length,calls+1);assert(media[0].muted,'Only a new silent prime, not stale audible retry');
});
test('concurrent tokens retain independent retry eligibility, cancellation and bounded overflow',()=>{
  const {audio,media}=fixture(2);audio.start(1);audio.start(2);audio.play('cue',1);audio.play('cue',2);
  const calls=media.map(m=>m.calls.length);audio.play('cue',2);assert.deepEqual(media.map(m=>m.calls.length),calls);
  audio.release(1,()=>{});audio.move(2);audio.cancel(2);assert.equal(media[0].paused,false);assert.equal(media[1].paused,true);
  audio.cancel(1);assert(media.every(m=>m.paused));
});
test('expired/unsupported/stalled attempts are bounded and volume never unmutes a prime',async()=>{
  const {audio,media,tick}=fixture(1);audio.start(1);audio.setState(false,.5);assert(media[0].muted);assert.equal(media[0].volume,.5);
  audio.play('cue',1);tick(400);audio.release(1,()=>{});assert(media[0].muted);
  audio.play('cue');media[0].calls.at(-1).reject({name:'NotSupportedError'});await flush();const count=media[0].calls.length;audio.start(2);audio.play('cue',2);assert.equal(media[0].calls.length,count);
  const f=fixture(1);f.audio.start(1);f.audio.play('cue',1);f.tick(1600);f.audio.sweep();assert(f.media[0].paused);
});
