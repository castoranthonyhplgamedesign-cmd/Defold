import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(path.resolve(root,'../../../reference/BBS-Corners/package.json'));
const {chromium}=require('@playwright/test');
const out=path.join(root,'qa/artifacts');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.env.BBS_URL||'http://127.0.0.1:8188/';
const report={timestamp:new Date().toISOString(),tests:[],errors:[],externalRequests:[]};
let page;
async function open(query='',viewport={width:390,height:844},setup){
  if(page)await page.close();
  page=await browser.newPage({viewport});
  page.on('pageerror',e=>report.errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'||/^ERROR:/.test(m.text()))report.errors.push(m.text())});
  page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))report.externalRequests.push(r.url())});
  if(setup)await page.addInitScript(setup);
  await page.goto(base+query);
  await page.waitForFunction(()=>window.__bbsState&&window.__bbsState.remaining===56,null,{timeout:45000});
  await page.waitForTimeout(250);
}
const state=()=>page.evaluate(()=>window.__bbsState);
const pass=(name,details)=>{report.tests.push({name,passed:true,details});console.log('PASS '+name)};
async function press(id){const s=await state(),a=s.bricks.find(b=>b.id===id);await page.mouse.click(a.screen_x,a.screen_y,{delay:100});await page.waitForTimeout(350)}
async function dragHint(){
  const s=await state(),hint=s.hint;
  assert(hint,'a legal hint exists');
  const a=s.bricks.find(b=>b.id===hint.id);assert(a.active,'hint points to active brick');
  await page.mouse.move(a.screen_x,a.screen_y);await page.mouse.down();
  const route=Array.isArray(hint.route)?hint.route:[];
  if(route.length){for(const p of route)await page.mouse.move(p.x,p.y,{steps:3})}
  else await page.mouse.move(a.screen_x+hint.dx*s.ppu*0.9,a.screen_y-hint.dz*s.ppu*0.942*0.9,{steps:6});
  await page.mouse.up();await page.waitForTimeout(750);
}
try{
  await open();
  assert.equal((await state()).remaining,56);
  assert.equal(await page.evaluate(()=>BBSBridge.calls.length),0);
  await page.screenshot({path:path.join(out,'portrait-390x844.png')});
  pass('startup: 56 bricks and no automatic CTA');
  const before=await state();await page.mouse.click(190,15);await page.waitForTimeout(320);
  assert.equal((await state()).clicks,0);pass('background/header presses do not count');
  await dragHint();assert.equal((await state()).remaining,55);pass('matching gate submits during drag');
  const blocked=await state();const b=blocked.bricks[0];
  await page.mouse.move(b.screen_x,b.screen_y);await page.mouse.down();await page.mouse.move(b.screen_x+blocked.ppu*8,b.screen_y,{steps:20});await page.mouse.up();await page.waitForTimeout(350);
  const after=(await state()).bricks[0];assert.equal(after.x,b.x);assert.equal(after.z,b.z);pass('blocked drag cannot tunnel through occupied cells or bounds');
  for(const [width,height]of [[844,390],[768,1024],[1024,768],[390,844]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(500);const s=await state();assert.equal(s.remaining,55);
    for(const a of s.bricks.filter(a=>a.active)){assert(a.screen_x>0&&a.screen_x<width);assert(a.screen_y>0&&a.screen_y<height)}
    await page.screenshot({path:path.join(out,`viewport-${width}x${height}.png`)});
  }pass('rotation preserves state and board fits four viewports');
  await open('?iteration=4clicks');
  for(let i=0;i<4;i++)await press(1);
  assert((await state()).ended);assert.equal((await state()).clicks,4);
  assert.equal(await page.evaluate(()=>BBSBridge.calls.length),1);
  assert.equal(await page.evaluate(()=>BBSBridge.events.filter(e=>e==='CHALLENGE_SOLVED').length),0);
  await page.screenshot({path:path.join(out,'four-click-endcard.png')});pass('four-click mode ends on fourth brick press and redirects once');
  await open('?iteration=30seconds');await page.waitForTimeout(1200);assert.equal((await state()).time,30);
  await press(1);const t=(await state()).time;
  await page.evaluate(()=>window.dispatchEvent(new Event('luna:pause')));await page.waitForTimeout(1400);
  await page.evaluate(()=>window.dispatchEvent(new Event('luna:resume')));await page.waitForTimeout(350);
  assert(t-(await state()).time<0.9);pass('timer starts on first brick input and pauses with lifecycle');
  await page.waitForFunction(()=>window.__bbsState.ended,null,{timeout:45000});
  assert.equal(await page.evaluate(()=>BBSBridge.calls.length),1);pass('30-second mode reaches its end card and redirects');
  await open('?sdk=1',undefined,()=>{window.__exitCalls=0;window.ExitApi={exit(){window.__exitCalls++}};window.__fbCalls=0;window.FbPlayableAd={onCTAClick(){window.__fbCalls++}}});
  await page.evaluate(()=>BBSBridge.cta());assert.equal(await page.evaluate(()=>window.__exitCalls),1);assert.equal(await page.evaluate(()=>window.__fbCalls),0);pass('CTA prioritizes Google ExitApi over Facebook');
  await open('?iteration=full');
  let drags=0;
  while(!(await state()).ended&&drags<400){await dragHint();drags++;if(drags%20===0)console.log('full-clear: '+(await state()).remaining+' remaining');}
  const final=await state();assert(final.ended,'full mode reaches end card');assert.equal(final.remaining,0);
  assert.equal(await page.evaluate(()=>BBSBridge.calls.length),0);
  assert.equal(await page.evaluate(()=>BBSBridge.events.filter(e=>e==='CHALLENGE_SOLVED').length),1);
  await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'full-win-endcard.png')});
  await page.mouse.click(190,420,{delay:100});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>BBSBridge.calls.length),1);
  pass('full-clear: all 56 bricks removed with real pointer input; win emits once and waits for CTA', {drags});
  assert.equal(report.errors.length,0,'no browser or Defold runtime errors');assert.equal(report.externalRequests.length,0,'all requests stay local');
  pass('no runtime errors or external requests');
}catch(e){report.failure=String(e.stack||e);if(page){report.failureState=await state();await page.screenshot({path:path.join(out,'failure.png')})}process.exitCode=1;console.log(report.failure);console.log(JSON.stringify(report.failureState&&{clicks:report.failureState.clicks,iteration:report.failureState.iteration,ended:report.failureState.ended,paused:report.failureState.paused}))}
finally{fs.writeFileSync(path.join(out,'e2e-report.json'),JSON.stringify(report,null,2));await browser.close()}
