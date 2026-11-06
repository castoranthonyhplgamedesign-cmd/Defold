import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {hintPoint} from './gameplay-points.mjs';

const root='http://127.0.0.1:5173',results=[],errors=[],dir='analysis/screenshots/opening-right-cyan';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
try{
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();
  const marker=/session.onStart\s*=\s*network.notifyStart;/;assert(marker.test(source));
  await route.fulfill({response,body:source.replace(marker,'window.fixtureSession=session;session.onStart=network.notifyStart;')});
 });
 await page.clock.install();
 const state=()=>page.evaluate(()=>({idle:window.fixtureSession.idle,hint:window.fixtureSession.hintId,hidden:document.querySelector('.tutorial-hand').hidden}));
 for(const [width,height] of [[390,844],[844,390],[768,1024],[360,640]]){
  await page.setViewportSize({width,height});await page.goto(root+'/?variant=90sec');
  await page.locator('html[data-scene-ready="true"]').waitFor();
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));
  await page.locator('.intro-screen').click();await page.clock.runFor(400);
  await page.clock.runFor(200);const initial=await state();assert(initial.hint===19&&!initial.hidden);
  assert((await hintPoint(page))[0]>width/2,'Opening hand must point to the right-side cyan');
  await page.screenshot({path:`${dir}/opening-${width}x${height}.png`});
  const beats=[];
  for(let repeat=0;repeat<2;repeat++){
   await page.mouse.click(...await hintPoint(page));
   assert.equal((await state()).hint,null,'Press immediately dismisses the hint');
   await page.clock.runFor(3200);const early=await state();assert(early.hidden&&early.hint===null);
   await page.clock.runFor(500);
   // The right opener must travel to the left cannon before enough belt room exists for another safe hint.
   if(repeat===0){
    assert.equal((await state()).hint,null);
    for(let i=0;i<100&&(await state()).hint===null;i++)await page.clock.runFor(100);
    await page.clock.runFor(200);assert.equal((await state()).hint,51);
   }
   const idle=await state();assert(idle.hint!==null&&!idle.hidden);
   beats.push({early,idle});
  }
  results.push({viewport:[width,height],initial,beats});await page.clock.resume();
 }
 assert.deepEqual(errors,[]);
 fs.mkdirSync('analysis/evidence',{recursive:true});
 fs.writeFileSync('analysis/evidence/idle-hint-browser.json',JSON.stringify({at:new Date().toISOString(),audio:'muted',results,errors},null,2));
 console.log(JSON.stringify({viewports:results.length,cyclesPerViewport:2,errors}));
}finally{await browser.close();}
