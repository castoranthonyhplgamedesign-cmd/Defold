import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root='http://127.0.0.1:5173',dir='analysis/screenshots/overload-guidance';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[],runs=[];
try{
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 // Test-only observation and a real 60-second countdown; no game state or queues are manipulated.
 await page.route('**/src/main.ts*',async route=>{
  const response=await route.fetch();let source=await response.text();
  assert(source.includes('const session = new Session'));
  source=source.replace(/new Session\(simulation, [^,]+,/, 'new Session(simulation, 60,');
  source=source.replace('view.setHostPaused(hostPaused);','window.fixture={simulation,session,view};view.setHostPaused(hostPaused);');
  await route.fulfill({response,body:source});
 });
 await page.route('**/src/render/scene.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('camera.updateMatrixWorld();','camera.updateMatrixWorld();window.fixtureProjection={camera,renderer};')});
 });
 await page.clock.install();
 for(const [width,height] of [[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(root);
  await page.locator('html[data-scene-ready="true"]').waitFor();
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));
  await page.evaluate(async()=>{window.fixtureVector=(await import('/node_modules/.vite/deps/three.js')).Vector3;window.open=()=>null;});
  await page.screenshot({path:`${dir}/${width}x${height}-start.png`});
  let next=0,start=null,mid=false;const clicks=[];
  for(let frame=0;frame<1300;frame++){
   const state=await page.evaluate(next=>{
    const {simulation:s,session,view}=window.fixture;
    const base={time:session.time,remaining:session.remaining,ended:session.ended,cleared:s.cleared,whites:s.preloaded.filter(s=>!s.removed).length};
    if(base.ended||base.time+1e-8<next)return base;
    const hand=document.querySelector('.tutorial-hand');
    if(!hand||hand.hidden||Number(hand.style.opacity)<.5)return base;
    const a=s.arrows.find(a=>a.data.id===session.hintId);
    if(!a)return base;
    const {camera,renderer}=window.fixtureProjection,rect=renderer.domElement.getBoundingClientRect();
    for(const part of a.segments){
     const p=new window.fixtureVector(...part.position);p.y+=(-1.55+.6)*a.data.cellSize;p.project(camera);
     const x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2;
     if(view.pick(x,y)===a.data.id)return {...base,id:a.data.id,point:[x,y]};
    }
    return {...base,unpickable:a.data.id};
   },next);
   assert.equal(state.unpickable,undefined,`Arrow ${state.unpickable} cannot be picked`);
   if(state.ended){runs.push({viewport:[width,height],duration:60-state.remaining,...state,clicks});break;}
   if(state.point){
    start??=state.time;next=state.time+.75;
    await page.mouse.click(...state.point);
    assert(await page.evaluate(id=>window.fixture.simulation.arrows.find(a=>a.data.id===id).moving,state.id),`Arrow ${state.id} native click failed`);
    clicks.push({time:state.time-start,id:state.id});
   }
   if(!mid&&start!==null&&state.time-start>=30){await page.screenshot({path:`${dir}/${width}x${height}-30s.png`});mid=true;}
   await page.clock.runFor(50);
  }
  const result=runs.at(-1);assert(result&&result.viewport[0]===width,'Run must end');
  await page.screenshot({path:`${dir}/${width}x${height}-finish.png`});
  console.log(JSON.stringify({viewport:result.viewport,time:result.duration,ending:result.ended,clicks:clicks.length,whites:result.whites}));
  assert.equal(result.ended,'timeout');assert(clicks.length>1&&clicks.length<60);
  for(let i=1;i<clicks.length;i++)assert(clicks[i].time-clicks[i-1].time>=3.5-1e-6,'Idle hints wait between interactions');
  await page.clock.resume();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/overload-guidance-browser.json',JSON.stringify({at:new Date().toISOString(),audio:'muted',clock:'Playwright clock drives the normal render loop; native mouse clicks follow only the visible hand, at least 750 ms apart',runs,errors},null,2));
}finally{await browser.close();}
