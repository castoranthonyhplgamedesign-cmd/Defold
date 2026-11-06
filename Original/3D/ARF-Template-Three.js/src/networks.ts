export type Network = 'preview' | 'al' | 'fb' | 'gg' | 'is' | 'mtg' | 'mo' | 'un' | 'vu';
interface Mraid {
  getState?:()=>string;isViewable?:()=>boolean;open?:(url:string)=>void;
  addEventListener?:(name:string,callback:(value:any)=>void)=>void;
  removeEventListener?:(name:string,callback:(value:any)=>void)=>void;
}
declare global {
  interface Window {
    mraid?:Mraid; FbPlayableAd?:{onCTAClick:()=>void}; ExitApi?:{exit:()=>void};
    install?:()=>void;gameReady?:()=>void;gameStart?:()=>void;gameEnd?:()=>void;gameClose?:()=>void;
    ALPlayableAnalytics?:{trackEvent:(event:string)=>void};playableSDK?:{reportEvent:(event:string)=>void};
  }
  const __NETWORK__: Network;
  const __DURATION__: number | undefined;
  const __TAPS__: number;
}
export const storeUrls = {
  android:'https://play.google.com/store/apps/details?id=com.zobbogames.arrow.shooter',
  ios:'https://apps.apple.com/us/app/arrow-flow-shooter-puzzle/id6760908162',
};

export function createNetwork(name:Network,host:Window=window,page:Document=document) {
  const mraidTarget=name==='al' || name==='is' || name==='un';
  let sdk:Mraid|undefined,hostReady=!mraidTarget,viewable=true,exposed=true,stateVisible=true,hostPaused=name==='mtg' && typeof host.gameStart!=='function',hostMuted=false,volume=1;
  let listener=(_paused:boolean,_volume:number)=>{},disposed=false,readySent=false,displayed=false,started=false,ended=false,closed=false;
  const removers:(()=>void)[]=[],timers:ReturnType<typeof setTimeout>[]=[];
  const owned:Partial<Record<'gameReady'|'gameStart'|'gameEnd'|'gameClose',()=>void>>={};
  const safely=(action:()=>void)=>{try{action();}catch{/* A host callback must not break gameplay. */}};
  const paused=()=>page.hidden || !hostReady || !viewable || !exposed || !stateVisible || hostPaused;
  const publish=()=>{if(!disposed){listener(paused(),hostMuted?0:volume);if(readySent&&!paused()&&!displayed){displayed=true;report('DISPLAYED');}}};
  const listen=(target:EventTarget,event:string,callback:EventListener)=>{target.addEventListener(event,callback);removers.push(()=>target.removeEventListener(event,callback));};
  // AppLovin playable analytics events; each is sent at most once (no retry exists, so none repeat).
  const sent=new Set<string>();
  const report=(event:string)=>{if(!sent.has(event)){sent.add(event);send(event);}};
  const send=(event:string)=>safely(()=>{
    if(name==='al' && typeof host.ALPlayableAnalytics?.trackEvent==='function')host.ALPlayableAnalytics.trackEvent(event);
    else if(typeof host.playableSDK?.reportEvent==='function')host.playableSDK.reportEvent(event);
    else console.log('[Analytics]',event);
  });
  function seed() {
    if(!sdk)return;
    safely(()=>{const state=sdk!.getState?.();hostReady=state!=='loading';stateVisible=state!=='hidden';});
    safely(()=>{if(typeof sdk!.isViewable==='function')viewable=sdk!.isViewable()!==false;});
  }
  function attach() {
    if(!mraidTarget || !host.mraid || sdk)return false;
    sdk=host.mraid;seed();
    const callbacks:Record<string,(value:any)=>void>={
      ready:()=>{hostReady=true;seed();publish();finishReady();},
      stateChange:(value)=>{if(!['loading','default','expanded','resized','hidden'].includes(value))return;hostReady=value!=='loading';stateVisible=value!=='hidden';publish();if(hostReady)finishReady();},
      viewableChange:value=>{if(typeof value==='boolean')viewable=value;publish();},
      exposureChange:value=>{if(typeof value==='number' && Number.isFinite(value))exposed=value>0;publish();},
      audioVolumeChange:value=>{if(typeof value==='number' && Number.isFinite(value))volume=Math.max(0,Math.min(1,value/100));publish();},
      error:message=>console.warn('[MRAID]',message),
    };
    for(const [event,callback] of Object.entries(callbacks))safely(()=>{sdk!.addEventListener?.(event,callback);removers.push(()=>safely(()=>sdk?.removeEventListener?.(event,callback)));});
    publish();return true;
  }
  let finishReady=()=>{};
  function initMraid(timeoutMs=2000,detectTimeoutMs=500) {
    return new Promise<void>(resolve=>{
      let finished=false;
      finishReady=()=>{if(!finished){finished=true;resolve();}};
      if(!mraidTarget){finishReady();return;}
      const began=Date.now();
      const detect=()=>{
        if(disposed){finishReady();return;}
        if(attach() || sdk){
          if(hostReady)finishReady();
          else timers.push(setTimeout(finishReady,timeoutMs));
        } else if(Date.now()-began>=detectTimeoutMs){hostReady=true;publish();finishReady();}
        else timers.push(setTimeout(detect,25));
      };
      detect();
    });
  }
  listen(page,'visibilitychange',()=>{attach();publish();});
  if(name==='vu') {
    listen(host,'ad-event-pause',()=>{hostPaused=true;publish();});
    listen(host,'ad-event-resume',()=>{hostPaused=false;publish();});
  }
  if(name==='un')for(const [event,value] of [['luna:pause',true],['luna:resume',false],['luna:mute',true],['luna:unmute',false]] as const)
    listen(host,event,()=>{if(event==='luna:mute'||event==='luna:unmute')hostMuted=value;else hostPaused=value;publish();});
  if(name==='mtg')listen(host,'message',event=>{
    const message=event as MessageEvent;
    if(message.source!==host.parent)return;
    if(message.data==='onPause')hostPaused=true;else if(message.data==='onResume')hostPaused=false;else return;
    publish();
  });
  for(const key of ['gameReady','gameStart','gameEnd','gameClose'] as const)if(typeof host[key]!=='function'){
    const callback=()=>{if(key==='gameStart'){hostPaused=false;publish();}};host[key]=callback;owned[key]=callback;
  }
  report('LOADING');
  const ready=initMraid();
  // Mintegral's gameReady comes from the build's body onload, so it is not called twice.
  function notifyReady(){if(readySent)return;readySent=true;report('LOADED');if(name!=='mtg')safely(()=>host.gameReady?.());publish();}
  function notifyStart(){if(started)return;started=true;report('CHALLENGE_STARTED');if(name!=='mtg')safely(()=>host.gameStart?.());}
  function notifyProgress(cleared:number){if(started)for(const pass of [25,50,75])if(cleared*100>=pass)report(`CHALLENGE_PASS_${pass}`);}
  function notifyEndcard(){report('ENDCARD_SHOWN');}
  function notifyEnd(reason:'clear'|'timeout'|'fail'|'unsupported'){
    if(ended)return;ended=true;safely(()=>host.gameEnd?.());
    if(reason==='clear')report('CHALLENGE_SOLVED');else if(reason==='fail')report('CHALLENGE_FAILED');
    if(name==='vu')safely(()=>host.parent.postMessage('complete','*'));
  }
  // auto: the game-end redirect (no tap), so it is not reported as CTA_CLICKED.
  function triggerCTA(auto=false, keepPlaying=false) {
    attach();if(paused())return;
    const url=/iPad|iPhone|iPod|Macintosh/.test(host.navigator.userAgent)?storeUrls.ios:storeUrls.android;
    let action:(()=>void)|undefined;
    if(mraidTarget){seed();if(paused())return;if(typeof sdk?.open==='function')action=()=>sdk!.open!(url);else if(sdk)return;}
    else if(name==='gg'){if(typeof host.ExitApi?.exit==='function')action=()=>host.ExitApi!.exit();}
    else if(name==='fb'||name==='mo'){if(typeof host.FbPlayableAd?.onCTAClick==='function')action=()=>host.FbPlayableAd!.onCTAClick();}
    else if(name==='mtg'){if(typeof host.install==='function')action=()=>host.install!();}
    else if(name==='vu')action=()=>host.parent.postMessage('download','*');
    if(!action && (name==='preview'||(mraidTarget&&!sdk)) && !host.mraid)action=()=>{host.open(url,'_blank','noopener,noreferrer');};
    if(!action)return;
    // The gameplay title opens the store without announcing the playable has closed.
    if(!keepPlaying&&!closed){closed=true;safely(()=>host.gameClose?.());}if(!auto)report('CTA_CLICKED');safely(action);
  }
  return {ready,initMraid,notifyReady,notifyStart,notifyProgress,notifyEnd,notifyEndcard,triggerCTA,
    bind(callback:typeof listener){listener=callback;publish();return ()=>{listener=()=>{};};},
    dispose(){disposed=true;timers.forEach(clearTimeout);removers.forEach(remove=>remove());finishReady();for(const key of Object.keys(owned) as (keyof typeof owned)[])if(host[key]===owned[key])delete host[key];},
  };
}
