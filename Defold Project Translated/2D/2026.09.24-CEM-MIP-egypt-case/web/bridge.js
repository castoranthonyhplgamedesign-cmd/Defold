/* Browser/ad SDK boundary. Gameplay, input, animation and rendering live in Lua. */
(() => {
  'use strict';
  const clone = value => structuredClone(value);
  function expand(source) {
    const out = {};
    for (const [key,value] of Object.entries(source || {})) {
      if (['__proto__','constructor','prototype'].includes(key)) continue;
      const parts=key.split('.'); let cursor=out;
      if (parts.some(p=>['__proto__','constructor','prototype'].includes(p))) continue;
      for (const p of parts.slice(0,-1)) cursor=cursor[p] ??= {};
      cursor[parts.at(-1)]=value;
    }
    return out;
  }
  function merge(base, override) {
    if (override===undefined) return clone(base);
    if (Array.isArray(base)) return clone(override);
    if (base && override && typeof base==='object' && typeof override==='object') {
      const out=clone(base);
      for (const [k,v] of Object.entries(expand(override))) out[k]=merge(out[k],v);
      return out;
    }
    return clone(override);
  }
  function keyed(base, incoming, key) {
    const out=clone(base);
    for (const slot of incoming || []) {
      const index=out.findIndex(x=>(slot.uuid && x.uuid===slot.uuid) || (slot[key] && x[key]===slot[key]));
      if (index>=0) out[index]=merge(out[index],slot); else out.push(clone(slot));
    }
    return out;
  }
  const rawSupplied=window.GAME_CONFIG;
  const supplied=expand(rawSupplied && rawSupplied!==window.GAME_CONFIG_DEFAULTS ? rawSupplied : {});
  const config=merge(window.GAME_CONFIG_DEFAULTS,supplied);
  config.CHANGABLE_TEXTURES=keyed(window.GAME_CONFIG_DEFAULTS.CHANGABLE_TEXTURES,supplied.CHANGABLE_TEXTURES,'spriteName');
  config.CHANGABLE_SOUNDTRACKS=keyed(window.GAME_CONFIG_DEFAULTS.CHANGABLE_SOUNDTRACKS,supplied.CHANGABLE_SOUNDTRACKS,'id');
  const variant=new URLSearchParams(location.search).get('variant') || window.EGYPT_VARIANT;
  if (variant && supplied.GAME_LENGTH?.clickLimit===undefined) config.GAME_LENGTH.clickLimit=({'2clicks':2,'4clicks':4,full:9999})[variant] ?? config.GAME_LENGTH.clickLimit;
  window.GAME_CONFIG=config;
  for (const method of ['gameReady','gameStart','gameEnd','gameClose']) window[method] ??= ()=>{};
  const events=[]; const sounds=new Map(); const audioReady=[]; let unlocked=false, hidden=document.hidden, hostPaused=false, exposed=true, viewable=true, volume=1, sdkMuted=false;
  const AudioContextClass=window.AudioContext || window.webkitAudioContext;
  const audioContext=new AudioContextClass();const masterGain=audioContext.createGain();masterGain.gain.value=0;masterGain.connect(audioContext.destination);
  const payloads=window.__CHANGEABLE_ASSETS__ || {};
  for (const slot of config.CHANGABLE_SOUNDTRACKS) {
    const url=slot.path || payloads[slot.uuid] || payloads[slot.id];
    if (!url) continue;
    const sound={slot,buffer:null,source:null};sounds.set(slot.id,sound);
    audioReady.push(fetch(url).then(response=>response.arrayBuffer()).then(bytes=>audioContext.decodeAudioData(bytes)).then(buffer=>{sound.buffer=buffer;}));
  }
  const paused=()=>hidden || hostPaused || !exposed || !viewable;
  const muted=()=>!unlocked || config.MUTE || paused() || sdkMuted;
  function applyAudio() {
    masterGain.gain.value=muted()?0:volume;
  }
  function event(name) {
    events.push({name,time:performance.now()});
    if (typeof window.ALPlayableAnalytics?.trackEvent==='function') window.ALPlayableAnalytics.trackEvent(name);
    else if (typeof window.playableSDK?.reportEvent==='function') window.playableSDK.reportEvent(name);
    console.log('[Analytics]',name);
  }
  function unlock() {
    audioContext.resume().catch(()=>{});
    if (unlocked) return;
    unlocked=true;applyAudio();playBuffer('bgm',true);
  }
  function playBuffer(id,music=false) {
    const sound=sounds.get(id);if(!sound?.buffer)return;
    sound.source?.stop();
    const source=audioContext.createBufferSource(),gain=audioContext.createGain();source.buffer=sound.buffer;source.loop=music && sound.slot.loop;
    gain.gain.value=sound.slot.volume;source.connect(gain);gain.connect(masterGain);sound.source=source;
    source.onended=()=>{if(sound.source===source)sound.source=null;source.disconnect();gain.disconnect();};source.start();
  }
  function sound(id) {unlock();playBuffer(id);}
  function redirect() {
    window.gameClose?.();
    const url=/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) ? config.APP_LINKS.app_store : config.APP_LINKS.google_play;
    if (typeof window.ExitApi!=='undefined' && typeof window.ExitApi.exit==='function') { window.ExitApi.exit(); return; }
    if (typeof window.FbPlayableAd?.onCTAClick==='function') { window.FbPlayableAd.onCTAClick(); return; }
    if (typeof window.Luna?.Unity?.Playable?.InstallFullGame==='function') { window.Luna.Unity.Playable.InstallFullGame(); return; }
    if (typeof window.playableSDK?.openAppStore==='function') { window.playableSDK.openAppStore(); return; }
    if (typeof window.install==='function') { window.install(); return; }
    if (typeof window.openAppStore==='function') { window.openAppStore(); return; }
    if (typeof window.clickTag==='function') { window.clickTag(); return; }
    if (window.__VUNGLE__) { window.parent.postMessage({event:'download'},'*'); return; }
    if (typeof window.mraid?.open==='function' && (typeof window.mraid.getState!=='function' || window.mraid.getState()!=='loading')) { window.mraid.open(url); return; }
    window.open(url,'_blank');
  }
  function endcard() {
    if (document.getElementById('egypt-cta')) return;
    const button=document.createElement('button'); button.id='egypt-cta'; button.type='button'; button.setAttribute('aria-label','Install the game');
    Object.assign(button.style,{position:'fixed',inset:0,width:'100%',height:'100%',border:0,padding:0,opacity:0,zIndex:1000,cursor:'pointer'});
    button.onclick=redirect; document.body.append(button);
  }
  function initMraid(timeoutMs=2000,detectTimeoutMs=500) {
    return new Promise(resolve=>{
      const started=performance.now();
      const detect=()=>{
        const m=window.mraid;
        if (!m) { if (performance.now()-started<detectTimeoutMs) setTimeout(detect,25); else resolve(); return; }
        let done=false;
        const finish=()=>{
          if (done) return; done=true;
          if (typeof m.isViewable==='function') viewable=m.isViewable();
          if (typeof m.addEventListener==='function') {
            m.addEventListener('error',(message,action)=>console.warn('[MRAID]',message,action));
            m.addEventListener('stateChange',()=>{});
            m.addEventListener('exposureChange',p=>{if(typeof p==='number') exposed=p>0;applyAudio();});
            m.addEventListener('viewableChange',v=>{if(typeof v==='boolean') viewable=v;applyAudio();});
            m.addEventListener('audioVolumeChange',p=>{if(typeof p==='number')volume=Math.max(0,Math.min(1,p/100));applyAudio();});
          }
          applyAudio(); resolve();
        };
        if (typeof m.getState!=='function' || m.getState()!=='loading') finish();
        else { m.addEventListener?.('ready',finish); setTimeout(finish,timeoutMs); }
      }; detect();
    });
  }
  document.addEventListener('visibilitychange',()=>{hidden=document.hidden;applyAudio();});
  window.addEventListener('message',e=>{if(e.data==='onPause')hostPaused=true;else if(e.data==='onResume')hostPaused=false;applyAudio();});
  for(const type of ['ad-event','luna:']) {
    const sep=type==='ad-event'?'-':'';
    window.addEventListener(type+sep+'pause',()=>{hostPaused=true;applyAudio();});
    window.addEventListener(type+sep+'resume',()=>{hostPaused=false;applyAudio();});
  }
  window.addEventListener('luna:mute',()=>{sdkMuted=true;applyAudio();});
  window.addEventListener('luna:unmute',()=>{sdkMuted=false;applyAudio();});
  document.addEventListener('pointerdown',unlock,{once:true});
  const textures=new Map();
  let labelSignature='';let labelInfo={};
  function refreshLabels({width,height}) {
    const signature=width+'x'+height;if(signature===labelSignature)return null;labelSignature=signature;
    const s=Math.min(width/1080,height/1920),ox=(width-1080*s)/2,oy=(height-1920*s)/2;
    const specs=[{text:config.CLUE_TITLE,size:config.CLUE_LAYOUT.titleFontSize,y:config.CLUE_LAYOUT.titleY,color:config.COLORS.title,weight:700},
      ...config.CLUES.map((clue,i)=>({text:clue.text,size:config.CLUE_LAYOUT.clueFontSize,y:config.CLUE_LAYOUT.clueYPositions[i],color:config.COLORS.clue,weight:600}))];
    const updates={};labelInfo={};
    specs.forEach((spec,i)=>{
      const key='text-'+(i+1),fontSize=Math.max(1,Math.round(spec.size*s));
      const canvas=document.createElement('canvas');let ctx=canvas.getContext('2d');
      const font=`${spec.weight} ${fontSize}px Grenze`;ctx.font=font;
      // Preserve the original canvas text metrics, integer font sizing and 2x
      // resolution. Only this text rasterization boundary runs in the browser.
      const metrics=ctx.measureText('|MÉqgy');const w=Math.max(1,Math.ceil(ctx.measureText(spec.text).width));const h=Math.max(1,metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent);
      canvas.width=w*2;canvas.height=h*2;ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.font=font;ctx.textBaseline='alphabetic';ctx.fillStyle=spec.color;ctx.fillText(spec.text,0,metrics.actualBoundingBoxAscent);
      const info={w:w/s,h:h/s,x:(Math.round(ox+540*s)-ox)/s,y:(Math.round(oy+spec.y*s)-oy)/s,size:spec.size};
      updates[key]={...info,png:canvas.toDataURL('image/png').split(',')[1]};labelInfo[key]=info;
    });
    return updates;
  }
  // Preserve every DOM edge until Lua consumes it. Defold's frame polling alone
  // can miss a short tap whose down/up both arrive between rendered frames.
  const input=[];const canvas=document.getElementById('canvas');let pointerId=null;
  function queuePointer(e) {
    if (!window.__EGYPT_STATE__ || paused()) return;
    if(e.type==='pointerdown') {
      if(pointerId!==null)return;
      pointerId=e.pointerId;canvas.setPointerCapture?.(pointerId);
    } else if(e.pointerId!==pointerId)return;
    const rect=canvas.getBoundingClientRect();
    input.push({bridge:true,pressed:e.type==='pointerdown',released:e.type==='pointerup'||e.type==='pointercancel',
      screen_x:(e.clientX-rect.left)*canvas.width/rect.width,screen_y:(rect.bottom-e.clientY)*canvas.height/rect.height,
      cancelled:e.type==='pointercancel'});
    if(e.type==='pointerup'||e.type==='pointercancel')pointerId=null;
    e.preventDefault();
  }
  for(const name of ['pointerdown','pointermove','pointerup','pointercancel'])canvas.addEventListener(name,queuePointer,{passive:false});
  async function prepareTextures() {
    const font=new FontFace('Grenze',`url(${payloads['font-grenze']})`,{weight:'100 900'});document.fonts.add(font);await font.load();
    for (const slot of config.CHANGABLE_TEXTURES) {
      const url=slot.path || payloads[slot.uuid] || payloads[slot.spriteName];
      const img=new Image(); img.src=url; await img.decode();
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      textures.set(slot.spriteName,canvas.toDataURL('image/png').split(',')[1]);
    }
    const dpr=Math.min(devicePixelRatio||1,3);
    const labels=refreshLabels({width:Math.round((visualViewport?.width||innerWidth)*dpr),height:Math.round((visualViewport?.height||innerHeight)*dpr)});
    for(const [key,info] of Object.entries(labels))textures.set(key,info.png);
  }
  window.EgyptBridge={config,event,sound,unlock,redirect,endcard,paused:()=>String(paused()),
    takeInput:()=>input.splice(0),
    refreshLabels,labelInfo:()=>labelInfo,
    takeTexture:key=>{const value=textures.get(key);textures.delete(key);return value;},
    state:value=>{window.__EGYPT_STATE__=value;},lifecycle:name=>window[name]?.(),
    events,audioState:()=>({unlocked,muted:muted(),paused:paused(),volume,decoded:[...sounds.values()].filter(s=>s.buffer).length}),initMraid};
  event('LOADING');
  window.EGYPT_READY=Promise.all([initMraid(),prepareTextures(),...audioReady]);
})();
