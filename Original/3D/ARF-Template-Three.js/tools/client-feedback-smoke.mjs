import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';import {hintPoint} from './gameplay-points.mjs';
const root='http://127.0.0.1:5173',dir='analysis/screenshots/intro-screen';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const results=[],errors=[];
try{
 const context=await browser.newContext({hasTouch:true,serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 await context.addInitScript(()=>{window.fixtureRedirects=0;window.open=()=>{window.fixtureRedirects++;return null;};});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async r=>{const response=await r.fetch(),s=await response.text();assert(s.includes('view.setHostPaused(hostPaused);'));await r.fulfill({response,body:s.replace('view.setHostPaused(hostPaused);','window.fixture={session,simulation,view};view.setHostPaused(hostPaused);')});});
 await page.clock.install();
 const state=()=>page.evaluate(()=>{const {session,simulation}=window.fixture,el=document.querySelector('.intro-screen'),r=el.getBoundingClientRect(),c=document.querySelector('.opening-caption').getBoundingClientRect();return {hidden:el.hidden,opacity:Number(el.style.opacity),box:{x:r.x,y:r.y,width:r.width,height:r.height},caption:{x:c.x,y:c.y,width:c.width,height:c.height},paused:simulation.paused,time:session.time,remaining:session.remaining,taps:session.taps,started:session.started,progress:simulation.preloaded[0].progress,hintHidden:document.querySelector('.tutorial-hand').hidden,redirects:window.fixtureRedirects};});
 for(const [width,height]of [[320,568],[568,320],[360,640],[640,360],[390,844],[844,390],[430,932],[932,430],[768,1024],[1024,768],[820,1180],[1180,820]]){
  await page.setViewportSize({width,height});await page.goto(root+'/?variant=60sec');await page.locator('html[data-scene-ready="true"]').waitFor();
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));await page.clock.runFor(350);
  const initial=await state();assert(!initial.hidden&&initial.opacity===1&&initial.hintHidden);assert.deepEqual(initial.box,{x:0,y:0,width,height});
  assert(Math.abs(initial.caption.x+initial.caption.width/2-width/2)<1);assert(Math.abs(initial.caption.y+initial.caption.height/2-height/2)<1);
  assert(initial.caption.x>=0&&initial.caption.x+initial.caption.width<=width);assert(initial.caption.y>=0&&initial.caption.y+initial.caption.height<=height);
  await page.clock.runFor(1000);const idle=await state();assert(!idle.paused);assert(idle.time>initial.time);assert.equal(idle.remaining,60);assert.notEqual(idle.progress,initial.progress);assert.equal(idle.taps,0);assert.equal(await page.locator('.opening-caption small').count(),0);
  assert.equal(await page.evaluate(()=>window.fixture.view.pick(innerWidth/2,innerHeight/2)),null);
  if(results.length===0){
   const samples=[];
   for(const time of [280,680,1080,1480,1880]){
    samples.push(await page.locator('.opening-caption').evaluate((e,time)=>{
     const animation=e.getAnimations()[0];animation.currentTime=time;
     const style=getComputedStyle(e),r=e.getBoundingClientRect();return {scale:parseFloat(style.scale),opacity:style.opacity,center:[r.x+r.width/2,r.y+r.height/2]};
    },time));
   }
   assert(samples.every(s=>s.scale>=1&&s.scale<=1.0401&&s.opacity==='1'));
   assert(Math.max(...samples.map(s=>s.scale))-Math.min(...samples.map(s=>s.scale))>.02,'Caption uses a true scale pulse');
   assert(samples.every(s=>s.center.every((n,i)=>Math.abs(n-samples[0].center[i])<.1)),'Pulse remains anchored at the center');
   await page.evaluate(()=>window.fixture.view.setHostPaused(true));
   const paused=await page.locator('.opening-caption').evaluate(e=>({state:e.getAnimations()[0].playState,time:e.getAnimations()[0].currentTime}));
   assert.equal(paused.state,'paused');await page.clock.runFor(350);
   assert.equal(await page.locator('.opening-caption').evaluate(e=>e.getAnimations()[0].currentTime),paused.time);
   await page.evaluate(()=>window.fixture.view.setHostPaused(false));
  }
  await page.screenshot({path:`${dir}/intro-${width}x${height}.png`});
  const intro=page.locator('.intro-screen');
  if(results.length===0){await intro.focus();await page.keyboard.press('Enter');}
  else if(results.length===1)await page.touchscreen.tap(width/2,height/2);
  else await intro.click({position:{x:10,y:10}});
  await page.clock.runFor(110);const exiting=await state();assert(exiting.opacity>0&&exiting.opacity<1&&!exiting.hidden);assert.equal(exiting.taps,0);assert(exiting.time>idle.time);assert(!exiting.paused);
  if(results.length===0){await page.evaluate(()=>window.fixture.view.setHostPaused(true));await page.clock.runFor(500);assert.equal((await state()).opacity,exiting.opacity);await page.evaluate(()=>window.fixture.view.setHostPaused(false));}
  await page.clock.runFor(400);const gameplay=await state();assert(gameplay.hidden&&!gameplay.hintHidden&&!gameplay.started);assert.equal(gameplay.taps,0);assert.equal(gameplay.remaining,60);assert.equal(gameplay.redirects,0);
  await page.screenshot({path:`${dir}/gameplay-${width}x${height}.png`});
  await page.mouse.click(...await hintPoint(page));await page.clock.runFor(100);const launched=await state();assert(launched.started&&launched.taps===1&&launched.remaining<60);
  results.push({viewport:[width,height],initial,exiting,gameplay});await page.clock.resume();
 }
 // Rotate the same intro before accepting it.
 await page.goto(root);await page.locator('html[data-scene-ready="true"]').waitFor();await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));
 for(const [width,height]of [[390,844],[844,390],[768,1024],[1024,768]]){await page.setViewportSize({width,height});await page.clock.runFor(650);const s=await state();assert.deepEqual(s.box,{x:0,y:0,width,height});assert(!s.paused&&!s.started&&s.taps===0);assert(Math.abs(s.caption.y+s.caption.height/2-height/2)<1);}
 await page.emulateMedia({reducedMotion:'reduce'});await page.clock.resume();await page.goto(root);await page.locator('html[data-scene-ready="true"]').waitFor();await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));await page.clock.runFor(100);assert.equal((await state()).opacity,1);assert.equal(await page.locator('.opening-caption').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a),1);await page.locator('.intro-screen').click();await page.clock.runFor(16);assert((await state()).hidden);
 assert.deepEqual(errors,[]);fs.writeFileSync('analysis/evidence/intro-screen-browser.json',JSON.stringify({at:new Date().toISOString(),audio:'muted',results,rotation:true,pausedTransition:true,reducedMotion:true,errors},null,2));console.log(JSON.stringify({viewports:results.length,rotation:true,pausedTransition:true,reducedMotion:true,errors}));
}finally{await browser.close();}
