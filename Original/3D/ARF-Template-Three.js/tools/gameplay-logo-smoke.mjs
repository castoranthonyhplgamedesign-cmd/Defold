import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {hintPoint} from './gameplay-points.mjs';

const root='http://127.0.0.1:5173',dir='analysis/screenshots/gameplay-logo';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const results=[],errors=[];
try{
 const context=await browser.newContext({serviceWorkers:'block',hasTouch:true});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 await context.addInitScript(()=>{
  window.fixtureCalls={opens:[],events:[],close:0,end:0};
  window.open=(...args)=>{window.fixtureCalls.opens.push(args);return null;};
  window.playableSDK={reportEvent:e=>window.fixtureCalls.events.push(e)};
  window.gameClose=()=>window.fixtureCalls.close++;window.gameEnd=()=>window.fixtureCalls.end++;
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();assert(source.includes('view.setHostPaused(hostPaused);'));
  await route.fulfill({response,body:source.replace('view.setHostPaused(hostPaused);','window.fixture={session,simulation,view};view.setHostPaused(hostPaused);')});
 });
 await page.clock.install();
 const state=()=>page.evaluate(()=>{
  const {session,simulation}=window.fixture;
  return {calls:window.fixtureCalls,ended:session.ended,endcard:session.endcardShown,started:session.started,taps:session.taps,remaining:session.remaining,paused:simulation.paused,progress:simulation.preloaded.find(s=>!s.removed).progress};
 });
 const layout=()=>page.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
  return {logo:rect(document.querySelector('.hud-title')),meter:rect(document.querySelector('.meter')),caption:rect(document.querySelector('.opening-caption'))};
 });
 for(const [width,height] of [[320,568],[568,320],[360,640],[640,360],[390,844],[844,390],[430,932],[932,430],[768,1024],[1024,768],[820,1180],[1180,820]]){
  await page.setViewportSize({width,height});await page.goto(root+'/?variant=60sec');
  await page.locator('html[data-scene-ready="true"]').waitFor();await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));await page.clock.runFor(200);
  await page.locator('.intro-screen').click();await page.clock.runFor(400);
  const bounds=await layout(),logo=page.locator('.hud-title');
  assert(bounds.logo.x>=0&&bounds.logo.bottom<=height&&bounds.logo.right<width/2);
  assert(bounds.logo.right<=bounds.meter.x||bounds.logo.y>=bounds.meter.bottom||bounds.logo.bottom<=bounds.meter.y,'Logo must not cover the fullness meter');
  await page.screenshot({path:`${dir}/opening-${width}x${height}.png`});
  await logo.click();let s=await state();assert.equal(s.calls.opens.length,1);assert.equal(s.taps,0);assert(!s.started&&!s.ended&&!s.endcard&&!s.paused);assert.equal(s.calls.close,0);assert.equal(s.calls.end,0);
  assert.deepEqual(s.calls.events.filter(e=>e==='CTA_CLICKED'),['CTA_CLICKED']);
  await page.mouse.click(...await hintPoint(page));await page.clock.runFor(100);const playing=await state();assert(playing.started);
  const r=await logo.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);
  await logo.focus();await page.keyboard.press('Enter');await page.clock.runFor(200);s=await state();
  assert.equal(s.calls.opens.length,3,'Mouse, touch and keyboard each route once');assert.equal(s.taps,playing.taps);assert(s.remaining<playing.remaining);assert.notEqual(s.progress,playing.progress);assert(!s.ended&&!s.endcard&&!s.paused);assert.equal(s.calls.close,0);assert.equal(s.calls.end,0);
  results.push({viewport:[width,height],bounds,redirects:s.calls.opens.length,ctaEvents:s.calls.events.filter(e=>e==='CTA_CLICKED').length,remainingBefore:playing.remaining,remainingAfter:s.remaining});
  await page.clock.resume();
 }
 // Simulate the host hiding the ad while a store is open, then returning to the same session.
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));
 await page.evaluate(()=>{window.fixtureHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.fixtureHidden});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await state();assert(hidden.paused);await page.clock.runFor(500);assert.equal((await state()).remaining,hidden.remaining);
 await page.evaluate(()=>{window.fixtureHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await page.clock.runFor(200);
 assert((await state()).remaining<hidden.remaining);assert(!(await state()).ended);
 await page.keyboard.press('Shift+E');await page.clock.runFor(50);assert(await page.locator('.hud-title').isHidden());
 // Safe-area placement, including the landscape side cutout and portrait home-indicator area.
 const cdp=await context.newCDPSession(page),safeAreas=[];
 for(const [width,height,insets] of [[390,844,{top:59,bottom:34,left:0,right:0}],[844,390,{top:0,bottom:21,left:59,right:0}]]){
  await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets});await page.setViewportSize({width,height});await page.clock.resume();await page.goto(root);
  await page.locator('html[data-scene-ready="true"]').waitFor();await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));await page.clock.runFor(200);
  const bounds=await layout();assert(bounds.logo.x>=insets.left&&bounds.logo.bottom<=height-insets.bottom);
  assert(bounds.logo.right<=bounds.meter.x||bounds.logo.y>=bounds.meter.bottom||bounds.logo.bottom<=bounds.meter.y);
  safeAreas.push({viewport:[width,height],insets,bounds});await page.screenshot({path:`${dir}/safe-area-${width}x${height}.png`});
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/gameplay-logo-browser.json',JSON.stringify({at:new Date().toISOString(),audio:'muted',redirects:'mocked; no store opened',results,safeAreas,hideResume:true,endcardHidesLogo:true,errors},null,2));
 console.log(JSON.stringify({viewports:results.length,safeAreas:safeAreas.length,hideResume:true,errors}));
}finally{await browser.close();}
