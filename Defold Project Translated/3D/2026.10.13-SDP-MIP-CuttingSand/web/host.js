// Browser boundary only. Defold/Lua owns gameplay and rendering.
(() => {
 const params=new URLSearchParams(location.search),inputs=[],events=[],redirects=[],plays={};
 const config=window.SAND_DEFAULTS;let pausedByHost=false,viewable=true,exposed=true,hostMuted=false,volume=1,unlocked=false,ctx,master,finished=false,active=null,layer,lastCTA=-Infinity;
 const buffers={},loops=new Map(),effectPools=new Map();let snapshot={},audioClock=0,lastCut=-Infinity,lastSand=-Infinity;
 const paused=()=>document.hidden||pausedByHost||!viewable||!exposed;
 const muted=()=>!unlocked||hostMuted||config.MUTE||paused();
 const event=name=>{events.push({name,time:performance.now()});if(typeof window.ALPlayableAnalytics?.trackEvent==='function')window.ALPlayableAnalytics.trackEvent(name);else if(typeof window.playableSDK?.reportEvent==='function')window.playableSDK.reportEvent(name);};
 function life(name){window[name]?.();if(name==='gameStart')window.Luna?.Unity?.Playable?.LifeCycle?.GameStarted?.();if(name==='gameEnd')window.Luna?.Unity?.Playable?.LifeCycle?.GameEnded?.();}
 for(const n of ['gameReady','gameStart','gameEnd','gameClose'])window[n]??=()=>{};
 function sync(){if(master)master.gain.value=muted()?0:volume;if(ctx){if(paused())ctx.suspend().catch(()=>{});else if(unlocked)ctx.resume().catch(()=>{});}}
 class Voice{
  constructor(id){this.id=id;this.source=null;this.g=ctx.createGain();this.g.connect(master);this.volume=0;this.isPlaying=false;this.isPaused=false;this.totalRate=1;this.manager={get locked(){return !unlocked}};this.duration=buffers[id].duration;this.at=0;this.offset=0;}
  get seek(){return this.isPlaying?Math.min(this.duration,this.offset+ctx.currentTime-this.at):0}
  play(opts){this.stop();this.source=ctx.createBufferSource();this.source.buffer=buffers[this.id];this.offset=opts.seek||0;this.at=ctx.currentTime;this.setVolume(opts.volume??1);this.source.connect(this.g);this.source.onended=()=>{this.isPlaying=false};this.source.start(0,this.offset);this.isPlaying=true;return true;}
  setVolume(value){this.volume=value;this.g.gain.value=value;return this}
  stop(){if(this.source){this.source.onended=null;try{this.source.stop()}catch{}this.source.disconnect();this.source=null}this.isPlaying=false;return this}
  destroy(){this.stop();this.g.disconnect()}
 }
 function sfx(id){if(!ctx||!buffers[id]||!unlocked||config.MUTE||paused())return;const pool=effectPools.get(id);if(!pool)return;const v=pool.find(v=>!v.isPlaying)||pool[0];const slot=config.CHANGABLE_SOUNDTRACKS.find(s=>s.id===id);v.play({volume:slot?.volume??1});plays[id]=(plays[id]??0)+1;}
 function unlock(){if(!unlocked){unlocked=true;sync();for(const id of ['bgm','sfx-conveyor'])loops.get(id)?.update(0,true,!config.MUTE&&!finished)}else sync();}
 function cta(){const now=performance.now();if(now-lastCTA<400)return;lastCTA=now;event('CTA_CLICKED');life('gameClose');const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(/macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1);const url=ios?config.APP_LINKS.app_store:config.APP_LINKS.google_play;redirects.push({url,time:now});
  // Local review never opens external tabs or leaves the game.
  if(location.protocol==='file:'||['127.0.0.1','localhost','::1','[::1]'].includes(location.hostname)){document.dispatchEvent(new CustomEvent('sand-local-cta',{detail:{url}}));return;}
  if(typeof window.ExitApi?.exit==='function')window.ExitApi.exit();
  else if(typeof window.FbPlayableAd?.onCTAClick==='function')window.FbPlayableAd.onCTAClick();
  else if(typeof window.Luna?.Unity?.Playable?.InstallFullGame==='function')window.Luna.Unity.Playable.InstallFullGame();
  else if(typeof window.playableSDK?.openAppStore==='function')window.playableSDK.openAppStore();
  else if(typeof window.install==='function')window.install();
  else if(typeof window.openAppStore==='function')window.openAppStore();
  else if(typeof window.clickTag==='string')window.open(window.clickTag,'_blank');
  else if(window.__VUNGLE__)window.parent.postMessage('download','*');
  else if(typeof window.mraid?.open==='function'&&(typeof window.mraid.getState!=='function'||window.mraid.getState()!=='loading'))window.mraid.open(url);
  else window.open(url,'_blank');
 }
 async function mraidReady(){const start=performance.now();while(!window.mraid&&performance.now()-start<500)await new Promise(r=>setTimeout(r,20));const m=window.mraid;if(!m)return;
  if(m.getState?.()==='loading')await Promise.race([new Promise(r=>m.addEventListener?.('ready',r)),new Promise(r=>setTimeout(r,2000))]);
  const on=(n,f)=>m.addEventListener?.(n,f);on('error',(message,action)=>console.warn('MRAID',message,action));on('stateChange',()=>{});on('exposureChange',v=>{exposed=v>0;sync()});on('viewableChange',v=>{viewable=!!v;sync()});on('audioVolumeChange',v=>{if(typeof v==='number'){volume=Math.max(0,Math.min(1,v/100));sync()}});if(m.isViewable)viewable=m.isViewable();
 }
 document.addEventListener('visibilitychange',()=>{inputs.length=0;active=null;sync()});
 for(const [name,value]of [['luna:pause',true],['luna:resume',false],['ad-event-pause',true],['ad-event-resume',false]])window.addEventListener(name,()=>{pausedByHost=value;sync()});
 for(const [name,value]of [['luna:mute',true],['luna:unmute',false]])window.addEventListener(name,()=>{hostMuted=value;sync()});
 window.addEventListener('message',e=>{if(e.data==='onPause')pausedByHost=true;else if(e.data==='onResume')pausedByHost=false;sync()});
 const variant=params.get('variant')||'full';const limits={'5clicks':[5,9999],'10clicks':[10,9999],'90seconds':[9999,90],full:[9999,9999]};const [click_limit,time_limit]=limits[variant]||limits.full;
 window.SandHost={ready:false,event,life,sfx,cta,
  fatal(message){console.error(message);window.SandQA.fatal=message;let p=document.getElementById('fatal');if(!p){p=document.createElement('pre');p.id='fatal';p.style.cssText='position:fixed;inset:0;color:white;background:#500;z-index:100;white-space:pre-wrap';document.body.append(p)}p.textContent=message},
  options:()=>JSON.stringify({mechanic:params.get('mechanic')==='tap'?'tap':'cut',click_limit,time_limit}),
  frame:()=>JSON.stringify({w:innerWidth,h:innerHeight,paused:paused(),inputs:inputs.splice(0)}),
  publish(s){snapshot=s;window.__SDP_STATE__=s},
  flow(s){audioClock+=s.delta;if(s.cut&&!finished)lastCut=audioClock;if(s.sand&&!finished)lastSand=audioClock;for(const [id,l]of loops){const request=!finished&&(id==='sfx-cut'?audioClock-lastCut<=config.AUDIO.flowHoldMs:id==='sfx-sand'?audioClock-lastSand<=config.AUDIO.flowHoldMs:unlocked);l.update(s.delta,request,unlocked&&!config.MUTE&&!paused(),finished&&id==='bgm'?config.AUDIO.endcardMusicFadeMs:config.AUDIO.flowFadeMs)}},
  finish(){finished=true;for(const [id,l]of loops)l.update(0,false,unlocked&&!config.MUTE,id==='bgm'?config.AUDIO.endcardMusicFadeMs:config.AUDIO.flowFadeMs)},
  endcard(){if(layer)return;layer=document.createElement('button');layer.setAttribute('aria-label','Play '+window.SAND_BRAND.name);layer.setAttribute('data-endcard-cta','');layer.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;background:transparent;opacity:0;z-index:40;touch-action:manipulation';let armed=false;layer.addEventListener('pointerdown',()=>{armed=true;unlock()});layer.addEventListener('click',e=>{if(armed||e.detail===0){armed=false;sfx('sfx-cta');cta()}});document.body.append(layer)}
 };
 window.SandQA={state:()=>snapshot,events,redirects,plays,audio:()=>({unlocked,paused:paused(),muted:muted(),gain:master?.gain.value,context:ctx?.state})};
 window.SandBoot=async()=>{
  event('LOADING');ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  await Promise.all([mraidReady(),...config.CHANGABLE_SOUNDTRACKS.map(async s=>{const r=await fetch('audio/'+s.uuid+'.'+s.format);if(!r.ok)throw Error('Missing audio '+s.uuid);buffers[s.id]=await ctx.decodeAudioData(await r.arrayBuffer())})]);
  const canvas=document.getElementById('canvas');canvas.addEventListener('pointerdown',e=>{unlock();active=e.pointerId;canvas.setPointerCapture(e.pointerId);inputs.push({type:'down',x:e.clientX,y:e.clientY})});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId===active)inputs.push({type:'move',x:e.clientX,y:e.clientY})});
  const end=e=>{if(e.pointerId!==active)return;inputs.push({type:e.type==='pointercancel'?'cancel':'up',x:e.clientX,y:e.clientY});active=null};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  window.addEventListener('blur',()=>{if(active!==null)inputs.push({type:'cancel',x:0,y:0});active=null});
  const audioScene={sound:{add:id=>new Voice(id)},cache:{audio:{get:id=>buffers[id]}}};
  for(const slot of config.CHANGABLE_SOUNDTRACKS){if(['bgm','sfx-conveyor','sfx-cut','sfx-sand'].includes(slot.id))loops.set(slot.id,new SandAudio.SustainedAudio(audioScene,slot,config.AUDIO,()=>{plays[slot.id]=(plays[slot.id]??0)+1}));else effectPools.set(slot.id,Array.from({length:config.AUDIO.maxEffectVoices},()=>new Voice(slot.id)));}
  window.SandHost.ready=true;
 };
})();
