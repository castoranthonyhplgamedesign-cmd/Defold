// Test SDK priority, exposure, volume and loopback CTA behavior without a browser.
const vm=require('node:vm');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('web/host.js','utf8');
function make(hostname){
  const events={},mraidEvents={},calls=[];
  const window={addEventListener:(name,fn)=>{events[name]=fn;},open:()=>calls.push('open'),
    ExitApi:{exit:()=>calls.push('exit')},FbPlayableAd:{onCTAClick:()=>calls.push('fb')},
    mraid:{getState:()=> 'loading',isViewable:()=>true,open:()=>calls.push('mraid'),addEventListener:(name,fn)=>{mraidEvents[name]=fn;}}};
  const context={window,mraid:window.mraid,location:{hostname,search:''},navigator:{userAgent:'Android'},
    document:{hidden:false,addEventListener:(name,fn)=>{events[name]=fn;},head:{appendChild:()=>{}},createElement:()=>({})},
    URLSearchParams,performance:{now:()=>0},console,setTimeout:()=>0};
  vm.createContext(context);vm.runInContext(source,context);
  mraidEvents.ready();
  return {host:window.CoinHost,events,mraidEvents,calls,window};
}
const local=make('127.0.0.1');local.host.cta();assert.equal(local.calls.length,0);assert.equal(local.host.calls.length,1);
local.mraidEvents.audioVolumeChange(50);assert.equal(local.host.volume(),'0.5');local.mraidEvents.audioVolumeChange(null);assert.equal(local.host.volume(),'0.5');
local.mraidEvents.exposureChange(0);assert.equal(local.host.paused(),'true');assert.equal(local.host.volume(),'0');
local.mraidEvents.viewableChange(true);assert.equal(local.host.paused(),'false');assert.equal(local.host.volume(),'0.5');
local.events['luna:mute']();assert.equal(local.host.volume(),'0');local.events['luna:unmute']();assert.equal(local.host.volume(),'0.5');
local.events.message({data:'onPause'});assert.equal(local.host.paused(),'true');local.events.message({data:'onResume'});assert.equal(local.host.paused(),'false');
const remote=make('ad-container.test');remote.host.cta();assert.deepEqual(remote.calls,['exit']);
delete remote.window.ExitApi;remote.host.cta();assert.deepEqual(remote.calls,['exit','fb']);
delete remote.window.FbPlayableAd;remote.host.cta();assert.equal(remote.calls.at(-1),'open');
remote.window.mraid.getState=()=> 'default';remote.host.cta();assert.equal(remote.calls.at(-1),'mraid');
const report={status:'PASS',checks:['loopback CTA suppression','SDK priority','loading MRAID fallback','ready MRAID open','null and numeric host volume','exposure pause','viewability resume','luna mute/unmute','message pause/resume']};
fs.writeFileSync('qa/host-tests.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
