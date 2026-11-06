import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {hintPoint} from './gameplay-points.mjs';
import {overloadQueues} from '../src/data/overloadCannons.ts';

const root='http://127.0.0.1:5173',dir='analysis/screenshots/entry-handoff';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[],results=[];
try{
  const context=await browser.newContext({serviceWorkers:'block'});
  await context.route('**/*',route=>{
    const url=route.request().url();
    return /^https?:/.test(url)&&!url.startsWith(root+'/')?route.abort():route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const [width,height] of [[390,844],[844,390],[768,1024],[360,640]]){
    await page.setViewportSize({width,height});await page.goto(root);
    await page.locator('html[data-scene-ready="true"]').waitFor();
    const point=await hintPoint(page),start=Date.now();await page.mouse.click(...point);
    await page.waitForFunction(()=>document.querySelector('.cannon-ammo[data-lane="0"]')?.getAttribute('aria-label')?.startsWith('red cannon:'),null,{timeout:10000});
    const milliseconds=Date.now()-start;
    const meter=await page.locator('.meter-percent').innerText();
    assert(parseInt(meter)<=99);
    await page.screenshot({path:`${dir}/cyan-cleared-${width}x${height}.png`});
    results.push({viewport:[width,height],cyanClearedMs:milliseconds,firstCannon:`white ${overloadQueues[0][1].ammo}`,meter});
  }
  // Test-only access to the real scene/core; the shipped modules remain unchanged.
  await page.route('**/src/main.ts*',async route=>{
    const response=await route.fetch(),source=await response.text();
    assert(source.includes('const session = new Session'));
    await route.fulfill({response,body:source.replace('const session = new Session','window.fixture=simulation;const session = new Session')});
  });
  await page.route('**/src/render/scene.ts*',async route=>{
    const response=await route.fetch(),source=await response.text();
    assert(source.includes('camera.updateMatrixWorld();'));
    await route.fulfill({response,body:source.replace('camera.updateMatrixWorld();','camera.updateMatrixWorld();window.fixtureProjection={camera,renderer};')});
  });
  for(const [width,height] of [[390,844],[844,390]]){
    await page.setViewportSize({width,height});await page.goto(root);
    await page.locator('html[data-scene-ready="true"]').waitFor();
    const point=await page.evaluate(async()=>{
      const {Vector3}=await import('/node_modules/.vite/deps/three.js'),a=window.fixture.arrows.find(a=>a.data.id===2);
      const p=new Vector3(...a.segments[0].position);p.y+=(-1.55+.6)*a.data.cellSize;
      const {camera,renderer}=window.fixtureProjection,rect=renderer.domElement.getBoundingClientRect();p.project(camera);
      return [rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2];
    });
    await page.mouse.click(...point);
    await page.waitForFunction(()=>window.fixture.arrows.find(a=>a.data.id===2).done,null,{timeout:2000});
    const state=await page.evaluate(()=>({purpleJoined:window.fixture.arrows.find(a=>a.data.id===2).done,cyanUntouched:window.fixture.arrows.find(a=>a.data.id===51).segments.every(s=>s.progress===null&&!s.removed)}));
    assert(state.purpleJoined&&state.cyanUntouched);
    results.push({viewport:[width,height],...state});await page.screenshot({path:`${dir}/purple-curve-${width}x${height}.png`});
  }
  await page.unroute('**/src/main.ts*');await page.unroute('**/src/render/scene.ts*');
  // Isolated render fixture: retain the real artist conveyor and white train, expose one curved entry at a time.
  await page.route(root+'/entry-fixture.html*',route=>route.fulfill({contentType:'text/html',body:`
    <html><head><link rel="stylesheet" href="/src/style.css"></head><body><main id="game"></main><script type="module">
    import {Simulation} from '/src/core/simulation.ts';import {ConveyorPath} from '/src/core/path.ts';
    import {flowRuntime} from '/src/layout/arrowFlow.ts';import {createScene} from '/src/render/scene.ts';
    import doc from '/levels/overload-level.arrow-flow.json';
    const data=flowRuntime(doc),id=Number(new URL(location.href).searchParams.get('id'));
    const sim=new Simulation([data.arrows.find(a=>a.id===id)],new ConveyorPath(data.path,.1,'first-intersection'),[],doc.board.grid.size);
    sim.preloaded.slice(60).forEach(s=>sim.remove(s));window.fixture=sim;
    await createScene(document.getElementById('game'),sim,undefined,undefined,undefined,false,{points:data.path,width:data.trackWidth,mesh:data.trackMesh,origin:data.trackOrigin});
    document.documentElement.dataset.sceneReady='true';
    </script></body></html>`}));
  await page.setViewportSize({width:390,height:844});await page.clock.install();
  for(const id of [0,27,58]){
    await page.goto(root+`/entry-fixture.html?id=${id}`);
    await page.locator('html[data-scene-ready="true"]').waitFor();
    await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+100));
    assert.equal(await page.evaluate(id=>window.fixture.launch(id),id),'accepted');
    for(const ms of [100,200,400,800,1600,2400]){
      const before=results.at(-1)?.fixture===id?results.at(-1).ms:0;
      await page.clock.runFor(ms-before);
      const state=await page.evaluate(()=>{const a=window.fixture.arrows[0];return {joined:a.segments.filter(s=>s.progress!==null).length,done:a.done,positions:a.segments.map(s=>s.position)};});
      results.push({fixture:id,ms,...state});await page.screenshot({path:`${dir}/curve-${id}-${ms}ms.png`});
    }
    assert.equal(results.at(-1).done,true,`Curve ${id} finishes entering`);
    await page.clock.resume();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('analysis/evidence/entry-handoff-browser.json',JSON.stringify({at:new Date().toISOString(),audio:'muted',results,errors},null,2));
  console.log(JSON.stringify({results:results.filter(r=>r.viewport||r.ms===2400),errors}));
}finally{await browser.close();}
