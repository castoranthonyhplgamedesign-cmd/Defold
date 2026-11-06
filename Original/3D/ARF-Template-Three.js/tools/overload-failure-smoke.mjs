import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root='http://127.0.0.1:5173',dir='analysis/screenshots/overload-failure';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const runs=[],errors=[];
try{
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 // Observation only: normal input, authored level/cannons and render-loop simulation.
 await page.route('**/src/main.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();
  assert(source.includes('view.setHostPaused(hostPaused);'));
  await route.fulfill({response,body:source.replace('view.setHostPaused(hostPaused);','window.fixture={simulation,session,view};view.setHostPaused(hostPaused);')});
 });
 await page.route('**/src/render/scene.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('camera.updateMatrixWorld();','camera.updateMatrixWorld();window.fixtureProjection={camera,renderer};')});
 });
 await page.clock.install();
 for(const [width,height] of [[390,844],[844,390],[768,1024],[360,640]]){
  await page.setViewportSize({width,height});await page.goto(root);
  await page.locator('html[data-scene-ready="true"]').waitFor();
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));
  const target=await page.evaluate(async()=>{
   window.open=()=>null;
   const {simulation:s,session,view}=window.fixture,{camera,renderer}=window.fixtureProjection;
   const {Vector3}=await import('/node_modules/.vite/deps/three.js'),a=s.arrows.find(a=>a.data.id===0),rect=renderer.domElement.getBoundingClientRect();
   const p=new Vector3(...a.segments[0].position);p.y+=(-1.55+.6)*a.data.cellSize;p.project(camera);
   const point=[rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2];
   return {id:a.data.id,length:a.segments.length,room:s.room,highlighted:session.valid.has(a.data.id),pick:view.pick(...point),point};
  });
  assert.equal(target.pick,target.id);assert(target.highlighted);assert(target.length>target.room);
  await page.screenshot({path:`${dir}/${width}x${height}-open-highlight.png`});
  await page.mouse.click(...target.point);
  assert(await page.evaluate(()=>window.fixture.simulation.arrows.find(a=>a.data.id===0).moving));
  let warned=null,ended=null;
  for(let frame=0;frame<120;frame++){
   await page.clock.runFor(50);
   const state=await page.evaluate(()=>{
    const {simulation:s,session}=window.fixture,a=s.arrows.find(a=>a.data.id===0);
    return {time:60-session.remaining,warning:s.overloadPending,ended:session.ended,admitted:s.onPath.length,limit:Math.floor(s.blockUnits),pending:a.segments.filter(s=>s.progress===null).length,meter:document.querySelector('.meter-percent').textContent,alert:document.querySelector('.full-vignette').classList.contains('alert')};
   });
   assert(state.admitted<=state.limit);
   if(state.warning&&!warned){warned=state;assert.equal(state.ended,'fail');assert.equal(state.meter,'100%');await page.screenshot({path:`${dir}/${width}x${height}-jam.png`});}
   if(state.ended){ended=state;break;}
  }
  assert(warned);assert.equal(ended?.ended,'fail');assert(ended.pending>0);assert.equal(ended.time,warned.time);
  const pose=()=>page.evaluate(()=>JSON.stringify({arrows:window.fixture.simulation.arrows,belt:window.fixture.simulation.onPath}));
  const frozen=await pose();await page.clock.runFor(300);assert.equal(await pose(),frozen);assert(!await page.locator('.endcard').isVisible());
  await page.clock.runFor(500);assert(await page.locator('.endcard').isVisible());assert.equal(await pose(),frozen);
  await page.screenshot({path:`${dir}/${width}x${height}-endcard.png`});
  runs.push({viewport:[width,height],target,warned,ended});console.log(JSON.stringify(runs.at(-1)));
  await page.clock.resume();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/overload-failure-browser.json',JSON.stringify({at:new Date().toISOString(),audio:'muted',runs,errors},null,2));
}finally{await browser.close();}
