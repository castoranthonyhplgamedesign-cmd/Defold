import test from 'node:test';
import assert from 'node:assert/strict';
import {createNetwork,storeUrls} from '../src/networks.ts';
function fixture(name,sdk) {
  const host=new EventTarget(),page=new EventTarget(),calls=[],events=[];page.hidden=false;
  Object.assign(host,{navigator:{userAgent:'Android'},parent:{postMessage:(...args)=>calls.push(['post',...args])},open:(...args)=>calls.push(['open',...args]),mraid:sdk,playableSDK:{reportEvent:e=>events.push(e)}});
  const network=createNetwork(name,host,page);const states=[];network.bind((paused,volume)=>states.push({paused,volume}));
  return {host,page,calls,events,network,states};
}
function mraid(initial='loading') {
  let state=initial,visible=true;const listeners={},opens=[];
  return {getState:()=>state,isViewable:()=>visible,open:url=>opens.push(url),opens,
    addEventListener:(e,fn)=>{listeners[e]=fn;},removeEventListener:(e)=>{delete listeners[e];},
    emit(e,value){if(e==='ready')state='default';if(e==='stateChange')state=value;if(e==='viewableChange')visible=value;listeners[e]?.(value);},listeners};
}
test('MRAID loading blocks fallback; ready applies all gates and null volume is ignored',async()=>{
  const sdk=mraid(),f=fixture('al',sdk);f.network.triggerCTA();assert.deepEqual(f.calls,[]);assert(f.states.at(-1).paused);
  sdk.emit('ready');await f.network.ready;assert.equal(f.states.at(-1).paused,false);
  sdk.emit('audioVolumeChange',null);assert.equal(f.states.at(-1).volume,1);sdk.emit('audioVolumeChange',50);assert.equal(f.states.at(-1).volume,.5);
  sdk.emit('exposureChange',0);sdk.emit('viewableChange',true);f.network.triggerCTA();assert.equal(sdk.opens.length,0);
  sdk.emit('exposureChange',100);f.page.hidden=true;f.page.dispatchEvent(new Event('visibilitychange'));f.network.triggerCTA();assert.equal(sdk.opens.length,0);
  f.page.hidden=false;f.page.dispatchEvent(new Event('visibilitychange'));f.network.triggerCTA();assert.deepEqual(sdk.opens,[storeUrls.android]);
  f.network.dispose();assert.equal(Object.keys(sdk.listeners).length,0);
});
test('MRAID timeout unblocks boot but not known loading host; late ready resumes',async()=>{
  const sdk=mraid(),f=fixture('is',sdk);await f.network.ready;assert(f.states.at(-1).paused);f.network.triggerCTA();assert.equal(f.calls.length,0);
  sdk.emit('ready');assert.equal(f.states.at(-1).paused,false);f.network.dispose();
});
test('missing MRAID is bounded, late host at CTA never bypassed, optional state tolerated',async()=>{
  const f=fixture('un');await f.network.ready;f.host.mraid=mraid();f.network.triggerCTA();assert.equal(f.calls.length,0);f.host.mraid.emit('ready');f.network.triggerCTA();assert.equal(f.host.mraid.opens.length,1);f.network.dispose();
  const sdk={open:()=>{}};const g=fixture('al',sdk);await g.network.ready;assert.equal(g.states.at(-1).paused,false);g.network.dispose();
});
test('selected adapters route once, retain host functions, and report real outcomes once',async()=>{
  for(const name of ['fb','mo','gg','mtg','vu','preview']) {
    const f=fixture(name);await f.network.ready;
    f.host.FbPlayableAd={onCTAClick:(...a)=>f.calls.push(['fb',...a])};f.host.ExitApi={exit:(...a)=>f.calls.push(['gg',...a])};f.host.install=(...a)=>f.calls.push(['mtg',...a]);
    if(name==='mtg')f.host.gameStart();
    const prior=()=>f.calls.push(['end']);f.host.gameEnd=prior;f.network.notifyReady();f.network.notifyReady();f.network.notifyStart();f.network.notifyStart();f.network.notifyEnd('timeout');f.network.notifyEnd('clear');
    assert.equal(f.calls.filter(c=>c[0]==='end').length,1);assert(!f.events.includes('CHALLENGE_SOLVED'));assert.equal(f.events.filter(e=>e==='CHALLENGE_STARTED').length,1);
    f.calls.length=0;f.network.triggerCTA();assert.equal(f.calls.length,1);
    assert.equal(f.calls[0][0],name==='fb'||name==='mo'?'fb':name==='vu'?'post':name==='preview'?'open':name);
    if(['fb','mo','gg','mtg'].includes(name))assert.equal(f.calls[0].length,1);
    if(name==='vu')assert.deepEqual(f.calls[0],['post','download','*']);
    f.network.triggerCTA();assert.equal(f.calls.length,2,'A second intentional tap must route again');
    f.network.dispose();assert.equal(f.host.gameEnd,prior);
  }
});
test('hidden readiness defers DISPLAYED; host pause and volume combine; iOS store branch',async()=>{
  const f=fixture('vu');await f.network.ready;f.page.hidden=true;f.page.dispatchEvent(new Event('visibilitychange'));f.network.notifyReady();assert(!f.events.includes('DISPLAYED'));
  f.page.hidden=false;f.page.dispatchEvent(new Event('visibilitychange'));assert.deepEqual(f.events,['LOADING','LOADED','DISPLAYED']);f.host.dispatchEvent(new Event('ad-event-pause'));assert(f.states.at(-1).paused);f.host.dispatchEvent(new Event('ad-event-resume'));assert(!f.states.at(-1).paused);f.network.dispose();
  const p=fixture('preview');p.host.navigator.userAgent='iPhone';await p.network.ready;p.network.triggerCTA();assert.equal(p.calls[0][1],storeUrls.ios);p.network.dispose();
});
test('pre-existing Mintegral start callback is preserved, with host messages retaining pause control',async()=>{
  const host=new EventTarget(),page=new EventTarget();page.hidden=false;const original=()=>{};host.gameStart=original;host.parent=host;
  const network=createNetwork('mtg',host,page),states=[];network.bind(paused=>states.push(paused));await network.ready;assert.equal(host.gameStart,original);assert.equal(states.at(-1),false);
  host.dispatchEvent(new MessageEvent('message',{data:'onPause',source:null}));assert.equal(states.at(-1),false,'Unrelated message ignored');network.dispose();assert.equal(host.gameStart,original);
});

test('analytics sends progress passes, failure and endcard once, in AppLovin order',async()=>{
  const f=fixture('fb');await f.network.ready;f.network.notifyReady();
  f.network.notifyProgress(.9);assert(!f.events.includes('CHALLENGE_PASS_25'));
  f.network.notifyStart();f.network.notifyProgress(.3);f.network.notifyProgress(.6);f.network.notifyProgress(.6);f.network.notifyEnd('fail');f.network.notifyEndcard();f.host.FbPlayableAd={onCTAClick:()=>{}};f.network.triggerCTA();f.network.triggerCTA();
  assert.deepEqual(f.events,['LOADING','LOADED','DISPLAYED','CHALLENGE_STARTED','CHALLENGE_PASS_25','CHALLENGE_PASS_50','CHALLENGE_FAILED','ENDCARD_SHOWN','CTA_CLICKED']);
  f.network.dispose();
});

test('the game-end redirect routes once with gameClose first and is not a CTA click',async()=>{
  const f=fixture('fb');await f.network.ready;f.network.notifyReady();f.host.FbPlayableAd={onCTAClick:()=>f.calls.push(['fb'])};
  f.host.gameClose=()=>f.calls.push(['close']);f.network.triggerCTA(true);
  assert.deepEqual(f.calls,[['close'],['fb']]);assert(!f.events.includes('CTA_CLICKED'));
  f.network.triggerCTA();assert(f.events.includes('CTA_CLICKED'));f.network.dispose();
});

test('gameplay title CTA routes repeatedly without closing or ending, and host visibility still pauses',async()=>{
 for(const name of ['al','is','un','fb','mo','gg','mtg','vu','preview']){
  const sdk=['al','is','un'].includes(name)?mraid('default'):undefined,f=fixture(name,sdk);
  await f.network.ready;if(name==='mtg')f.host.gameStart();
  f.host.FbPlayableAd={onCTAClick:()=>f.calls.push(['fb'])};f.host.ExitApi={exit:()=>f.calls.push(['gg'])};f.host.install=()=>f.calls.push(['mtg']);
  f.host.gameClose=()=>f.calls.push(['close']);f.host.gameEnd=()=>f.calls.push(['end']);
  f.network.triggerCTA(false,true);f.network.triggerCTA(false,true);
  assert.equal(sdk?sdk.opens.length:f.calls.length,2,name);
  assert(!f.calls.some(c=>c[0]==='close'||c[0]==='end'));assert(!f.states.at(-1).paused);
  assert.equal(f.events.filter(e=>e==='CTA_CLICKED').length,1,'Existing once-per-session analytics policy');
  f.page.hidden=true;f.page.dispatchEvent(new Event('visibilitychange'));assert(f.states.at(-1).paused);
  f.network.triggerCTA(false,true);assert.equal(sdk?sdk.opens.length:f.calls.length,2,'No hidden redirect');
  f.page.hidden=false;f.page.dispatchEvent(new Event('visibilitychange'));assert(!f.states.at(-1).paused);
  f.network.triggerCTA();assert.equal(f.calls.filter(c=>c[0]==='close').length,1,'The later endcard still closes normally');
  f.network.dispose();
 }
});
