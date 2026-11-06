import type { Session } from '../core/session';
import { UI_LAYER } from '../constants';
import { handPose, handTransform } from './motion';
import { planeTransform } from './projection';
import type { Project } from './projection';
import icon from '../assets/ui/icon.webp';
import title from '../assets/ui/title.webp';
import handIdle from '../assets/ui/hand-idle.webp';
import handTap from '../assets/ui/hand-tap.webp';
import meterBorder from '../assets/ui/meter-border.webp';
import meterFill from '../assets/ui/meter-fill.webp';

// The short edge preserves the title and logo's pixel sizes when the device rotates.
const endcardLayout = { logo: 400, titleWidth: 300, titleHeight: 300*190/315, gap: 16 };

export function createOverlay(root: HTMLElement, session: Session, install: (auto?:boolean,keepPlaying?:boolean) => void, meterCenter=[0,0,17.29],boardY=0) {
  const hud = document.createElement('div'); hud.className='hud'; hud.style.zIndex=String(UI_LAYER.hud);
  const intro=document.createElement('button');intro.type='button';intro.className='intro-screen';intro.hidden=session.simulation.capacity===null;intro.style.zIndex=String(UI_LAYER.intro);
  const caption=document.createElement('div');caption.className='opening-caption';
  for(const line of ['The belt is 99% full!','Can you clear it?']){const span=document.createElement('span');span.textContent=line;caption.append(span);}
  intro.append(caption);
  const meter=document.createElement('div'); meter.className='meter'; meter.setAttribute('role','meter'); meter.setAttribute('aria-label','Conveyor fullness'); meter.setAttribute('aria-valuemin','0'); meter.setAttribute('aria-valuemax','100'); meter.style.setProperty('--border-image',`url("${meterBorder}")`);
  const fill=document.createElement('div'); fill.className='meter-fill'; fill.style.backgroundImage=`url("${meterFill}")`; fill.style.maskImage=`url("${meterFill}")`;
  const percent=document.createElement('span'); percent.className='meter-percent'; meter.append(fill); hud.append(meter,percent);
  function button(parent:HTMLElement,image:string,name:string,className:string) {
    const button=document.createElement('button'); button.type='button'; button.className=`art-button ${className}`; button.setAttribute('aria-label',name);
    const img=document.createElement('img'); img.src=image; img.alt=''; img.draggable=false; button.append(img); button.style.zIndex=String(UI_LAYER.endcardInput); parent.append(button); return button;
  }
  const hudLogo=button(root,title,'Get Arrow Flow','hud-title');hudLogo.style.zIndex=String(UI_LAYER.hudLogo);
  hudLogo.addEventListener('click',()=>install(false,true));
  const hand=document.createElement('img'); hand.className='tutorial-hand'; hand.alt=''; hand.setAttribute('aria-hidden','true'); hand.style.zIndex=String(UI_LAYER.tutorial); hand.src=handIdle;
  const hint=document.createElement('span'); hint.className='sr-only'; hint.textContent='Tap an arrow with an open path to launch it onto the conveyor.'; hud.append(hint);
  const endcard=document.createElement('div'); endcard.className='endcard'; endcard.hidden=true; endcard.setAttribute('role','dialog'); endcard.setAttribute('aria-modal','true'); endcard.setAttribute('aria-label','Play Arrow Flow'); endcard.style.zIndex=String(UI_LAYER.dim);
  endcard.tabIndex=-1;
  endcard.addEventListener('click',()=>install());
  const art=document.createElement('div'); art.className='endcard-art'; art.style.zIndex=String(UI_LAYER.endcardArt); endcard.append(art);
  const endTitle=document.createElement('img');endTitle.className='end-title';endTitle.src=title;endTitle.alt='Arrow Flow';endTitle.draggable=false;art.append(endTitle);
  const endIcon=button(art,icon,'Get Arrow Flow','end-icon');
  // Keep keyboard focus on the only endcard control.
  endcard.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();endIcon.focus({preventScroll:true});}});
  const vignette=document.createElement('div'); vignette.className='full-vignette'; vignette.setAttribute('aria-hidden','true'); vignette.style.zIndex=String(UI_LAYER.vignette);
  root.append(hud,vignette,hand,intro,endcard);
  let ended=false,introTime=0,introDismissedAt:number|null=null;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const setPaused=(paused:boolean)=>{caption.style.animationPlayState=paused||introDismissedAt!==null?'paused':'running';};
  intro.addEventListener('click',()=>{
    if(!session.simulation.paused&&!document.hidden&&introDismissedAt===null){introDismissedAt=introTime;setPaused(false);}
  });
  intro.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();intro.focus({preventScroll:true});}});
  function advance(seconds:number){
    introTime+=seconds;
    const enter=reducedMotion.matches?1:1-(1-Math.min(1,introTime/.28))**3;
    const exit=introDismissedAt===null?0:reducedMotion.matches?1:Math.min(1,(introTime-introDismissedAt)/.24);
    intro.hidden=session.simulation.capacity===null||!!session.ended||exit>=1;
    intro.style.opacity=String(enter*(1-exit));
    caption.style.transform=`translate3d(0,${(1-enter)*8-exit*8}px,0) scale(${1-exit*.04})`;
  }
  advance(0);
  const place=(element:HTMLElement,x:number,y:number,w:number,h:number,scale=1)=>{
    element.style.left=`${x}px`;element.style.top=`${y}px`;element.style.width=`${w}px`;element.style.height=`${h}px`;element.style.transform=`translate(-50%,-50%) scale(${scale})`;
  };
  function sync(project:Project,width:number,height:number) {
    const scale=Math.min(width,height)/720;
    hudLogo.hidden=!!session.ended;
    hudLogo.disabled=!intro.hidden;
    meter.style.transform=planeTransform(project,meterCenter,[.027,0,0],[0,0,.027]);
    percent.style.transform=planeTransform(project,[meterCenter[0],meterCenter[1],meterCenter[2]-.146],[.01,0,0],[0,0,.01]);
    const value=Math.min(100,session.simulation.percentage),text=`${Math.round(value)}%`;
    if(percent.textContent!==text) percent.textContent=text;
    meter.setAttribute('aria-valuenow',String(Math.round(value)));fill.style.width=`${value*4.72}px`;fill.style.backgroundColor=`hsl(${120*(1-value/100)} 100% 50%)`;
    const jam=session.simulation.overloadPending&&!session.ended;
    const warning=Math.max(0,session.warningUntil-session.time),red=jam?(1-Math.cos(session.time*Math.PI*8))*.5:warning>0?1-Math.abs(((1-warning)*4)%2-1):0;
    percent.style.color=`rgb(255,${255*(1-red)},${255*(1-red)})`;
    // Urgency from the 99% start: the warning pulses until the belt drops below 95%.
    vignette.classList.toggle('on',session.warningActive);vignette.classList.toggle('alert',warning>0||jam);
    vignette.style.setProperty('--warning-pulse',String(.45+.55*(1-Math.cos(session.warningPhase*Math.PI*2))/2));
    const age=session.time-session.hintSince,motion=handPose(age);
    const opacity=session.simulation.capacity!==null?Math.min(1,age/.12):motion.opacity;
    hand.hidden=!intro.hidden || session.hintId===null || !!session.ended || opacity<=0;
    hand.style.opacity=String(opacity);
    if(!hand.hidden) {
      const arrow=session.simulation.arrows.find(a=>a.data.id===session.hintId)!;
      hand.src=motion.tap?handTap:handIdle;
      hand.style.height=`${motion.tap?242:228}px`;
      const target=[...arrow.segments[0].position];if(boardY)target[1]+=(boardY+.6)*(arrow.data.cellSize??1);
      hand.style.transform=handTransform(project,target,age);
    }
    if(session.endcardShown) {
      if(!ended) {ended=true;hud.hidden=true;endcard.hidden=false;endcard.focus({preventScroll:true});}
      const {logo,titleWidth,titleHeight,gap}=endcardLayout;
      art.style.transform=`scale(${scale})`;
      place(endTitle,0,-(logo+gap)/2,titleWidth,titleHeight);
      place(endIcon,0,(titleHeight+gap)/2,logo,logo);
      art.style.top=`${height/2}px`;
    }
  }
  return {sync,advance,setPaused,get introActive(){return !intro.hidden;},dispose:()=>{hud.remove();hudLogo.remove();vignette.remove();hand.remove();intro.remove();endcard.remove();}};
}
