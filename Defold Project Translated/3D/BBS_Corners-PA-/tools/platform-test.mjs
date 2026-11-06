import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../web/template.html',import.meta.url),'utf8');
const code=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
let passed=0;
function context(query='?sdk=1'){
  const calls=[],listeners={},intervals=[];let now=0;
  const c={URLSearchParams,Promise,console,location:{search:query,hostname:'127.0.0.1'},navigator:{userAgent:'Android'},performance:{now:()=>now+=1000},
    document:{hidden:false,addEventListener:(n,f)=>listeners[n]=f,querySelector:()=>({}),getElementById:()=>({}),createElement:()=>({}),head:{appendChild(){}}},
    addEventListener:(n,f)=>listeners[n]=f,open:(...a)=>calls.push(['open',...a]),parent:{postMessage:(...a)=>calls.push(['vungle',...a])},
    setInterval:f=>(intervals.push(f),1),clearInterval(){},setTimeout:f=>1};
  c.window=c;vm.createContext(c);vm.runInContext(code,c);return {c,calls,listeners,intervals};
}
function check(name,fn){fn();passed++;console.log('PASS '+name)}
check('local preview suppresses navigation',()=>{const{c,calls}=context('');c.BBSBridge.cta();assert.equal(calls.length,0);assert.equal(c.BBSBridge.calls.length,1)});
for(const [name,setup,expected]of [
 ['Google',c=>c.ExitApi={exit:()=>c.record('google')},'google'],
 ['Facebook/Moloco',c=>c.FbPlayableAd={onCTAClick:()=>c.record('facebook')},'facebook'],
 ['Unity Luna',c=>c.Luna={Unity:{Playable:{InstallFullGame:()=>c.record('unity')}}},'unity'],
 ['playableSDK',c=>c.playableSDK={openAppStore:()=>c.record('playable')},'playable'],
 ['Mintegral',c=>c.install=()=>c.record('mintegral'),'mintegral'],
 ['openAppStore',c=>c.openAppStore=()=>c.record('store'),'store'],
 ['MRAID ready',c=>c.mraid={getState:()=> 'ready',open:()=>c.record('mraid')},'mraid'],
 ['MRAID without optional state',c=>c.mraid={open:()=>c.record('mraid')},'mraid']
])check(name+' CTA',()=>{const{c,calls}=context();c.record=s=>calls.push(s);setup(c);c.BBSBridge.cta();assert.equal(calls[0],expected)});
check('MRAID loading falls back',()=>{const{c,calls}=context();c.mraid={getState:()=> 'loading',open:()=>{throw Error('unsafe')}};c.BBSBridge.cta();assert.equal(calls[0][0],'open')});
check('optional SDK methods are guarded',()=>{const{c,calls}=context();c.playableSDK={};c.mraid={};c.BBSBridge.cta();assert.equal(calls[0][0],'open')});
check('gameClose precedes redirect',()=>{const{c,calls}=context();c.gameClose=()=>calls.push('close');c.ExitApi={exit:()=>calls.push('exit')};c.BBSBridge.cta();assert.deepEqual(calls,['close','exit'])});
check('SDK lifecycle pauses and unmutes',()=>{const{c,listeners}=context();assert.equal(c.BBSBridge.state(),'active');listeners['luna:pause']();assert.equal(c.BBSBridge.state(),'paused');listeners['luna:resume']();listeners['luna:mute']();assert.equal(c.BBSBridge.state(),'muted');listeners['luna:unmute']();assert.equal(c.BBSBridge.state(),'active')});
check('MRAID exposure and nullable volume',()=>{const{c,intervals}=context();const handlers={};c.mraid={getState:()=> 'ready',isViewable:()=>true,addEventListener:(n,f)=>handlers[n]=f};c.BBSBridge.ready();intervals[0]();assert(handlers.error&&handlers.stateChange&&handlers.viewableChange);handlers.audioVolumeChange(null);assert.equal(c.BBSBridge.state(),'active');handlers.exposureChange(0);assert.equal(c.BBSBridge.state(),'paused');handlers.exposureChange(100);handlers.audioVolumeChange(0);assert.equal(c.BBSBridge.state(),'muted')});
console.log(`${passed} platform tests passed.`);
