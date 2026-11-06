// The browser boundary owns SDK lifecycle and local diagnostics, never game rules.
(() => {
  'use strict';
  const local = location.protocol === 'file:' || ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const params = new URLSearchParams(location.search);
  const events = [], lifecycle = [], calls = [];
  let hidden = document.hidden, exposed = true, hostPaused = false, volume = 1, sdkMuted = false, unlocked = false;
  let mraidWired = false;
  for (const name of ['gameReady','gameStart','gameEnd','gameClose']) if(typeof window[name] !== 'function') window[name] = () => {};
  const invoke = (object,key,...args) => {if(typeof object?.[key] !== 'function') return false; object[key](...args); return true;};
  const paused = () => hidden || !exposed || hostPaused;
  const host = window.CoinHost = {
    events, lifecycle, calls, local,
    paused: () => String(paused()),
    muted: () => String(sdkMuted || volume === 0 || paused()),
    volume: () => String(sdkMuted || paused() ? 0 : volume),
    unlock: () => {unlocked = true;},
    event: name => {events.push({name,time:performance.now()}); invoke(window.ALPlayableAnalytics,'trackEvent',name) || invoke(window.playableSDK,'reportEvent',name);},
    life: name => {lifecycle.push(name);invoke(window,name);},
    publish: state => {if(local) window.__coinState = state;},
    cta: () => {
      calls.push({type:'cta',time:performance.now()});
      if(local) return;
      const url=/iPad|iPhone|iPod/.test(navigator.userAgent)?'https://apps.apple.com/us/app/coin-sort/id6446354191':'https://play.google.com/store/apps/details?id=com.MoodGames.CoinSort&hl=en';
      if(invoke(window.ExitApi,'exit') || invoke(window.FbPlayableAd,'onCTAClick') || invoke(window.Luna?.Unity?.Playable,'InstallFullGame') || invoke(window.playableSDK,'openAppStore') || invoke(window,'install') || invoke(window,'openAppStore')) return;
      if(typeof window.clickTag === 'function'){window.clickTag();return;}
      if(typeof window.clickTag === 'string'){window.open(window.clickTag);return;}
      if(window.__VUNGLE__){window.parent.postMessage('download','*');return;}
      if(typeof window.mraid?.open === 'function' && (typeof mraid.getState !== 'function' || mraid.getState() !== 'loading')){mraid.open(url);return;}
      window.open(url,'_blank');
    },
    audioState: () => ({unlocked,volume,sdkMuted,paused:paused()})
  };
  function wireMraid() {
    const m = window.mraid;
    if (!m || mraidWired) return;
    mraidWired = true;
    if(typeof m.isViewable === 'function') exposed = m.isViewable();
    if(typeof m.addEventListener !== 'function') return;
    m.addEventListener('error',(message,action)=>console.warn('[MRAID]',message,action));
    m.addEventListener('stateChange',()=>{});
    m.addEventListener('exposureChange',percent=>{if(typeof percent === 'number') exposed = percent > 0;});
    m.addEventListener('viewableChange',value=>{exposed = !!value;});
    m.addEventListener('audioVolumeChange',value=>{if(typeof value === 'number') volume = Math.max(0,Math.min(1,value/100));});
  }
  host.ready = new Promise(resolve => {
    let done = false;
    const finish = () => {if(done)return;done=true;wireMraid();resolve();};
    const started = performance.now();
    const poll = () => {
      const m = window.mraid;
      if(m){if(typeof m.getState === 'function' && m.getState() === 'loading' && typeof m.addEventListener === 'function')m.addEventListener('ready',finish);else finish();return;}
      if(performance.now()-started < 500)setTimeout(poll,25);else finish();
    };
    poll();setTimeout(finish,2000);
  });
  document.addEventListener('visibilitychange',()=>{hidden=document.hidden;});
  for(const type of ['luna:pause','ad-event-pause'])window.addEventListener(type,()=>{hostPaused=true;});
  for(const type of ['luna:resume','ad-event-resume'])window.addEventListener(type,()=>{hostPaused=false;});
  window.addEventListener('luna:mute',()=>{sdkMuted=true;});
  window.addEventListener('luna:unmute',()=>{sdkMuted=false;});
  window.addEventListener('message',e=>{if(e.data==='onPause')hostPaused=true;else if(e.data==='onResume')hostPaused=false;});
  const network=params.get('network');
  if(!local && ['al','is','un'].includes(network)){const script=document.createElement('script');script.src='mraid.js';document.head.appendChild(script);}
})();
