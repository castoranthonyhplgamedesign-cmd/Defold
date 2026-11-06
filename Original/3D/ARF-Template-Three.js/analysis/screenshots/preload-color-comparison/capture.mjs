import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const color=process.argv[2],root='http://127.0.0.1:5173',dir='analysis/screenshots/preload-color-comparison';
assert(['f34041','bf3233','ff4242'].includes(color));
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
try{
 const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
 await c.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/src/main.ts*',async r=>{const response=await r.fetch(),s=await response.text();assert(s.includes('view.setHostPaused(hostPaused);'));await r.fulfill({response,body:s.replace('view.setHostPaused(hostPaused);','window.colorFixture={session,simulation};view.setHostPaused(hostPaused);')});});
 await p.route('**/src/render/scene.ts*',async r=>{const response=await r.fetch(),s=await response.text();assert(s.includes('(session ?? simulation).advance(dt)'));assert(s.includes(color));await r.fulfill({response,body:s.replace('(session ?? simulation).advance(dt)','(session ?? simulation).advance(0)').replace('const trayMaterial =','window.colorMaterials=materials;const trayMaterial =')});});
 for(const [width,height]of [[390,844],[844,390]]){
  await p.setViewportSize({width,height});await p.goto(root);await p.locator('html[data-scene-ready="true"]').waitFor();await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(()=>{window.colorFixture.session.time=.5;window.colorFixture.session.warningPhase=.25;});
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const materials=await p.evaluate(()=>({red:window.colorMaterials.white.color.getHexString(),neutral:window.colorMaterials.neutral.color.getHexString()}));assert.equal(materials.red,color);assert.equal(materials.neutral,'f4f6ff');
  await p.screenshot({path:`${dir}/${color}-${width}x${height}.png`});
 }
 assert.deepEqual(errors,[]);console.log(`${color}: matched opening captures saved; no page errors`);
}finally{await b.close();}

