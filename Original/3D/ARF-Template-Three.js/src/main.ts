import './style.css';
import { createScene } from './render/scene';
import { Simulation } from './core/simulation';
import { ConveyorPath } from './core/path';
import { bindTaps } from './input/taps';
import { Session, sessionTuning } from './core/session';
import { createNetwork } from './networks';
import { AudioPools } from './audio/pools';
import { sounds } from './audio/sounds';
import { showFallback } from './ui/fallback';
import level from './data/level.json';
import path from './data/path.json';
const network=createNetwork(__NETWORK__);

async function boot() {
  const root = document.getElementById('game')!;
  await network.ready;
  const audio=new AudioPools(sounds);
  let hostPaused=false,hostVolume=1,contextPaused=false;
  let view:Awaited<ReturnType<typeof createScene>>|undefined;
  const unbindHost=network.bind((paused,volume)=>{hostPaused=paused;hostVolume=volume;view?.setHostPaused(paused);audio.setState(paused||contextPaused,volume);});
  try {
    const data=__CUSTOM_LEVEL__??{...level,path};
    const simulation = new Simulation(data.arrows, new ConveyorPath(data.path,.1,__CUSTOM_LEVEL__?'first-intersection':'reference'), data.shooters, __CUSTOM_LEVEL__?.whitePreloadSize);
    let duration=__DURATION__,tapLimit=__TAPS__;
    if(import.meta.env.DEV){
      switch(new URLSearchParams(location.search).get('variant')){
        case '3clicks': duration=Infinity;tapLimit=3;break;
        case '10clicks': duration=Infinity;tapLimit=10;break;
        case '60sec': case '60seconds': duration=60;tapLimit=Infinity;break;
        case '90sec': case '90seconds': duration=90;tapLimit=Infinity;break;
      }
    }
    const session = new Session(simulation, duration, tapLimit, __CUSTOM_LEVEL__?.hintOrder);
    session.onWarningPulse=()=>audio.play('warning');session.onWarningStop=()=>audio.stopCue('warning');
    session.onStart=network.notifyStart;session.onProgress=network.notifyProgress;// Every ending (clear, fail, timer, tap count): lane doors shut, the store opens, then the endcard stays up for the return.
    session.onEndcard=()=>{network.triggerCTA(true);network.notifyEndcard();};
    session.onEnd=reason=>{if(reason==='clear')audio.play('win');else if(reason==='fail')audio.play('fail');network.notifyEnd(reason);};
    simulation.cannons.onHit=()=>audio.play('shoot');simulation.cannons.onAdvance=()=>audio.play('slidey');
    simulation.onBlockedContact=()=>audio.play('wrong');
    view = await createScene(root, simulation, session, network.triggerCTA, paused=>{contextPaused=paused;audio.setState(paused||hostPaused,hostVolume);},hostPaused,__CUSTOM_LEVEL__?{points:data.path,width:__CUSTOM_LEVEL__.trackWidth,mesh:__CUSTOM_LEVEL__.trackMesh,origin:__CUSTOM_LEVEL__.trackOrigin}:undefined);
    view.setHostPaused(hostPaused);
    await audio.prepare();
    await Promise.race([Promise.all([document.fonts.ready,...Array.from(root.querySelectorAll('img')).map(img=>img.decode().catch(()=>{}))]),new Promise(resolve=>setTimeout(resolve,1500))]);
    const unbind = bindTaps(view.canvas, view.pick, (id,token) => {
      const result=session.launch(id);
      if(result==='accepted')audio.play('select',token);else if(result==='full')audio.play('wrong',token);
      if(result!=='ignored')audio.startMusic('bgm');
      view!.wake();
    },audio);
    if(import.meta.env.DEV){
      const previewEndcard=(event:KeyboardEvent)=>{
        const target=event.target;
        if(event.code!=='KeyE'||!event.shiftKey||event.ctrlKey||event.altKey||event.metaKey||event.repeat||event.isComposing||session.endcardShown||simulation.paused)return;
        if(target instanceof HTMLElement&&(target.isContentEditable||target.closest('input,textarea,select')))return;
        event.preventDefault();
        // Preview the final UI without invoking completion analytics or the store redirect.
        session.ended='timeout';session.endedAt=session.time-sessionTuning.endcardDelay;
        session.hintId=null;session.endcardShown=true;simulation.cannons.stop();view!.wake();
        audio.stopCue('warning');
      };
      window.addEventListener('keydown',previewEndcard);
      window.addEventListener('pagehide',event=>{if(!event.persisted)window.removeEventListener('keydown',previewEndcard);});
    }
    const sweep=setInterval(()=>audio.sweep(),500);
    network.notifyReady();
    document.documentElement.dataset.sceneReady = 'true';
    window.addEventListener('pagehide', event => {audio.setState(true,hostVolume);if (!event.persisted) {clearInterval(sweep);unbind();view?.dispose();audio.dispose();unbindHost();network.dispose();}});
    window.addEventListener('pageshow',()=>{view?.wake();audio.setState(hostPaused||document.hidden,hostVolume);});
  } catch {
    audio.dispose();showFallback(root,network.triggerCTA);network.notifyReady();network.notifyEnd('unsupported');network.notifyEndcard();
    document.documentElement.dataset.sceneReady = 'failed';
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void boot(), { once: true });
else void boot();
