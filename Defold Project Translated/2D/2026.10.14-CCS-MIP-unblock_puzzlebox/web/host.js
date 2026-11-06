// Browser services only: input, audio, lifecycle and SDK routing. Game rules are Lua.
(()=>{
 const params=new URLSearchParams(location.search),qa=params.get('qa')==='1'&&['127.0.0.1','localhost'].includes(location.hostname);
 const inputs=[],commands=[],events=[],redirects=[];let activePointer=null,lastFrame=performance.now(),wasPaused=false;
 let hostPaused=false,viewable=true,exposed=true,hostMuted=false,unlocked=false,volume=1,ctx,master,music;
 const buffers={},base={touch:1,merge:.5,pop:.5,warn:.25,gift:1,win:1};
 const stores={ios:'https://apps.apple.com/us/app/circle-sort-ring-puzzle/id6743114220',android:'https://play.google.com/store/apps/details?id=com.game5mobile.circlesort&hl=en'};
 const paused=()=>hostPaused||!viewable||!exposed||document.hidden;
 function syncAudio(){if(paused()||wasPaused)lastFrame=performance.now();if(paused())wasPaused=true;if(master)master.gain.value=paused()||hostMuted||!unlocked?0:volume;if(ctx){if(paused())ctx.suspend().catch(()=>{});else if(unlocked)ctx.resume().catch(()=>{});}}
 function event(name){events.push({name,time:performance.now()});if(typeof window.ALPlayableAnalytics?.trackEvent==='function')window.ALPlayableAnalytics.trackEvent(name);else if(typeof window.playableSDK?.reportEvent==='function')window.playableSDK.reportEvent(name);}
 for(const name of ['gameReady','gameStart','gameEnd','gameClose'])if(typeof window[name]!=='function')window[name]=()=>{};
 function life(name){window[name]?.();}
 function cta(auto=false){if(!auto)event('CTA_CLICKED');life('gameClose');redirects.push({auto,time:performance.now()});
  if(qa||['127.0.0.1','localhost'].includes(location.hostname)){document.dispatchEvent(new CustomEvent('puzzlebox-local-cta',{detail:{auto}}));return;}
  const url=/iPad|iPhone|iPod/.test(navigator.userAgent)?stores.ios:stores.android;
  if(typeof ExitApi!=='undefined'&&typeof ExitApi.exit==='function')ExitApi.exit();
  else if(typeof window.FbPlayableAd?.onCTAClick==='function')window.FbPlayableAd.onCTAClick();
  else if(typeof window.Luna?.Unity?.Playable?.InstallFullGame==='function')window.Luna.Unity.Playable.InstallFullGame();
  else if(typeof window.playableSDK?.openAppStore==='function')window.playableSDK.openAppStore();
  else if(typeof window.install==='function')window.install();
  else if(typeof window.openAppStore==='function')window.openAppStore();
  else if(window.clickTag)window.open(window.clickTag);
  else if(window.__VUNGLE__)window.parent.postMessage('download','*');
  else if(typeof window.mraid?.open==='function'&&(typeof window.mraid.getState!=='function'||window.mraid.getState()!=='loading'))window.mraid.open(url);
  else window.open(url);
 }
 async function audio(){ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  await Promise.all(['bgm',...Object.keys(base)].map(async key=>{const file=key==='bgm'?'bgm_loop':`sfx_${key}`;let bytes;for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(`audio/${file}.mp3`);if(!r.ok)throw Error('Audio load failed: '+file);bytes=await r.arrayBuffer();break;}catch(e){if(attempt===2)throw e;await new Promise(r=>setTimeout(r,100*(attempt+1)));}}buffers[key]=await ctx.decodeAudioData(bytes);}));
  music=ctx.createBufferSource();music.buffer=buffers.bgm;music.loop=true;const d=music.buffer.getChannelData(0);let lead=0;while(lead<d.length&&Math.abs(d[lead])<1e-4)lead++;music.loopStart=lead/music.buffer.sampleRate;music.loopEnd=music.loopStart+940800/44100;
  const gain=ctx.createGain();gain.gain.value=.4;music.connect(gain).connect(master);music.start(0,music.loopStart);syncAudio();
 }
 async function mraidReady(){const start=performance.now();while(!window.mraid&&performance.now()-start<500)await new Promise(r=>setTimeout(r,20));const m=window.mraid;if(!m)return;
  if(typeof m.getState==='function'&&m.getState()==='loading')await Promise.race([new Promise(r=>m.addEventListener?.('ready',r)),new Promise(r=>setTimeout(r,2000))]);
  const on=(n,f)=>{if(typeof m.addEventListener==='function')m.addEventListener(n,f);};
  on('error',(message,action)=>console.warn('MRAID',message,action));on('stateChange',()=>{});
  on('viewableChange',v=>{viewable=!!v;syncAudio();});on('exposureChange',v=>{exposed=v>0;syncAudio();});on('audioVolumeChange',v=>{if(typeof v==='number'){volume=Math.max(0,Math.min(1,v/100));syncAudio();}});
  if(typeof m.isViewable==='function')viewable=m.isViewable();syncAudio();
 }
 document.addEventListener('visibilitychange',()=>{inputs.length=0;activePointer=null;syncAudio();});
 window.addEventListener('blur',()=>{inputs.push({type:'cancel'});activePointer=null;});
 for(const [n,v] of [['luna:pause',true],['luna:resume',false]])window.addEventListener(n,()=>{hostPaused=v;syncAudio();});
 for(const [n,v] of [['luna:mute',true],['luna:unmute',false]])window.addEventListener(n,()=>{hostMuted=v;syncAudio();});
 window.addEventListener('message',e=>{if(e.data==='onPause'||e.data==='onResume'){hostPaused=e.data==='onPause';syncAudio();}});
 for(const [n,v] of [['ad-event-pause',true],['ad-event-resume',false]])window.addEventListener(n,()=>{hostPaused=v;syncAudio();});
 function attach(){const canvas=document.getElementById('canvas');
  canvas.addEventListener('pointerdown',e=>{if(activePointer!==null)return;activePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);unlocked=true;syncAudio();inputs.push({type:'down',x:e.clientX,y:e.clientY,time:performance.now()});});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId===activePointer)inputs.push({type:'move',x:e.clientX,y:e.clientY,time:performance.now()});});
  const end=e=>{if(e.pointerId!==activePointer)return;syncAudio();inputs.push({type:e.type==='pointercancel'?'cancel':'up',x:e.clientX,y:e.clientY,time:performance.now()});activePointer=null;};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 }
 let snapshot={},layer;
 window.PuzzleHost={
  ready:false,variant:['3clk','10clk','60sec'].includes(params.get('variant'))?params.get('variant'):'60sec',hud:params.get('hud')==='1',
  frame(){const now=performance.now(),p=paused(),clockdt=p||wasPaused?0:(now-lastFrame)/1000,dt=Math.min(.25,clockdt);lastFrame=now;wasPaused=p;return JSON.stringify({w:Math.round(visualViewport?.width||innerWidth),h:Math.round(visualViewport?.height||innerHeight),dt,clockdt,paused:p,inputs:inputs.splice(0),commands:qa?commands.splice(0):[]});},
  event,sfx(cue){if(!ctx||paused()||!unlocked||!buffers[cue])return;const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buffers[cue];g.gain.value=base[cue]??1;s.connect(g).connect(master);s.start();},
  life,cta,publish(s){snapshot=s;},
  endcard(){if(layer)return;layer=document.createElement('button');layer.id='install-layer';layer.setAttribute('aria-label','Install Ring Sort');layer.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;background:transparent;padding:0;z-index:10;cursor:pointer';layer.addEventListener('click',()=>cta(false));document.body.appendChild(layer);},
  removeEndcard(){layer?.remove();layer=null;},
 };
 if(qa)window.PuzzleQA={state:()=>structuredClone(snapshot),events,redirects,command:(name,data={})=>commands.push({name,...data}),audio:()=>({unlocked,paused:paused(),muted:hostMuted,volume,context:ctx?.state,gain:master?.gain.value})};
 window.PuzzleBoot=async()=>{event('LOADING');try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}await Promise.all([mraidReady(),audio()]);attach();window.PuzzleHost.ready=true;life('gameReady');};
})();
