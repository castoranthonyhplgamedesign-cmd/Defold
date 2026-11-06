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
  const supplied=expand(window.GAME_CONFIG || {});
  const config=merge(window.GAME_CONFIG_DEFAULTS,supplied);
  config.CHANGABLE_TEXTURES=keyed(window.GAME_CONFIG_DEFAULTS.CHANGABLE_TEXTURES,supplied.CHANGABLE_TEXTURES,'spriteName');
  config.CHANGABLE_SOUNDTRACKS=keyed(window.GAME_CONFIG_DEFAULTS.CHANGABLE_SOUNDTRACKS,supplied.CHANGABLE_SOUNDTRACKS,'id');
  const variant=new URLSearchParams(location.search).get('variant') || window.EGYPT_VARIANT || 'full';
  if (!supplied.GAME_LENGTH?.clickLimit) config.GAME_LENGTH.clickLimit=({'2clicks':2,'4clicks':4,full:9999})[variant] ?? 9999;
  window.GAME_CONFIG=config;
  for (const method of ['gameReady','gameStart','gameEnd','gameClose']) window[method] ??= ()=>{};
  const events=[]; const sounds=new Map(); let unlocked=false, hidden=document.hidden, hostPaused=false, exposed=true, viewable=true, volume=1, sdkMuted=false;
  const payloads=window.__CHANGEABLE_ASSETS__ || {};
  for (const slot of config.CHANGABLE_SOUNDTRACKS) {
    const url=slot.path || payloads[slot.uuid] || payloads[slot.id];
    if (!url) continue;
    const sound=new Audio(url); sound.preload='auto'; sound.loop=slot.loop; sound.volume=slot.volume; sounds.set(slot.id,sound);
  }
  const paused=()=>hidden || hostPaused || !exposed || !viewable;
  const muted=()=>!unlocked || config.MUTE || paused() || sdkMuted;
  function applyAudio() {
    for (const [id,sound] of sounds) {
      const slot=config.CHANGABLE_SOUNDTRACKS.find(x=>x.id===id);
      sound.muted=muted(); sound.volume=Math.max(0,Math.min(1,slot.volume*volume));
      if (paused()) sound.pause(); else if (unlocked && id==='bgm') sound.play().catch(()=>{});
    }
  }
  function event(name) {
    events.push({name,time:performance.now()});
    if (typeof window.ALPlayableAnalytics?.trackEvent==='function') window.ALPlayableAnalytics.trackEvent(name);
    else if (typeof window.playableSDK?.reportEvent==='function') window.playableSDK.reportEvent(name);
    console.log('[Analytics]',name);
  }
  function unlock() {
    if (unlocked) return;
    unlocked=true; applyAudio();
  }
  function sound(id) {
    unlock(); const node=sounds.get(id); if (!node) return;
    node.pause(); node.currentTime=0; node.play().catch(()=>{});
  }
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
  async function prepareTextures() {
    for (const slot of config.CHANGABLE_TEXTURES) {
      const url=slot.path || payloads[slot.uuid] || payloads[slot.spriteName];
      const img=new Image(); img.src=url; await img.decode();
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      textures.set(slot.spriteName,canvas.toDataURL('image/png').split(',')[1]);
    }
  }
  window.EgyptBridge={config,event,sound,unlock,redirect,endcard,paused:()=>String(paused()),
    takeTexture:key=>{const value=textures.get(key);textures.delete(key);return value;},
    state:value=>{window.__EGYPT_STATE__=value;},lifecycle:name=>window[name]?.(),
    events,audioState:()=>({unlocked,muted:muted(),paused:paused(),volume}),initMraid};
  event('LOADING');
  window.EGYPT_READY=Promise.all([initMraid(),prepareTextures()]);
})();
