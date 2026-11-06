import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root='http://127.0.0.1:5173',dir='analysis/screenshots/cannon-container-color';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[],results=[];
try {
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 await context.addInitScript(()=>{
  window.media=[];const OriginalAudio=window.Audio;
  window.Audio=class extends OriginalAudio {
   constructor(...args){super(...args);this.audibleRequests=0;this.audiblePlaying=0;media.push(this);this.addEventListener('playing',()=>{if(!this.muted)this.audiblePlaying++;});this.addEventListener('ended',()=>{if(!this.muted)this.audibleEndedAt=performance.now();});}
   play(){if(!this.muted){this.audibleRequests++;this.requestedAt=performance.now();this.endcardAtRequest=window.fixture?.session.endcardShown;this.reasonAtRequest=window.fixture?.session.ended;}return super.play();}
  };
  window.destinations=[];window.open=()=>{const m=media.find(m=>m.src.includes('sfx_win.mp3'));destinations.push({at:performance.now(),winRequestedAt:m.requestedAt,winEndedAt:m.audibleEndedAt});return null;};
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();assert(source.includes('view.setHostPaused(hostPaused);'));
  await route.fulfill({response,body:source.replace('view.setHostPaused(hostPaused);','window.fixture={simulation,session,view};view.setHostPaused(hostPaused);')});
 });
 await page.route('**/src/render/scene.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('camera.updateMatrixWorld();','camera.updateMatrixWorld();window.fixtureProjection={camera,renderer};')});
 });
 const win=()=>page.evaluate(()=>{const m=media.find(m=>m.src.includes('sfx_win.mp3'));return {requests:m.audibleRequests,playing:m.audiblePlaying,duration:m.duration,volume:m.volume,paused:m.paused};});
 const fail=()=>page.evaluate(()=>{const m=media.find(m=>m.src.includes('sfx-fail.mp3'));return {requests:m.audibleRequests,playing:m.audiblePlaying,duration:m.duration,volume:m.volume,paused:m.paused,endcardAtRequest:m.endcardAtRequest,reasonAtRequest:m.reasonAtRequest};});
 for(const reason of ['clear','timeout','fail']){
  await page.goto(root);await page.locator('html[data-scene-ready="true"]').waitFor();
  assert.equal((await win()).requests,0);assert.equal((await fail()).requests,0);assert.equal(await page.evaluate(()=>media.length),35);
  if(reason==='clear'){
   for(const [width,height] of [[390,844],[844,390],[768,1024],[360,640]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(180);
    await page.screenshot({path:`${dir}/${width}x${height}.png`});
   }
   await page.setViewportSize({width:390,height:844});await page.waitForTimeout(180);
  }
  const point=await page.evaluate(async()=>{
   const {simulation:s,view}=fixture,{camera,renderer}=fixtureProjection;
   const {Vector3}=await import('/node_modules/.vite/deps/three.js'),a=s.arrows.find(a=>a.data.id===0),rect=renderer.domElement.getBoundingClientRect();
   const p=new Vector3(...a.segments[0].position);p.y+=(-1.55+.6)*a.data.cellSize;p.project(camera);
   const point=[rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2];if(view.pick(...point)!==0)throw new Error('Missed arrow');return point;
  });
  await page.mouse.click(...point);
  await page.evaluate(reason=>{
   const {simulation:s,session}=fixture;
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
   if(reason==='clear')for(const part of [...s.arrows.flatMap(a=>a.segments),...s.preloaded])part.removed=true;
   if(reason==='timeout')session.remaining=0;
   session.advance(.01);
  },reason);
  await page.waitForTimeout(700);assert.equal((await win()).requests,0);
  assert.equal(await page.evaluate(()=>fixture.session.endcardShown),false);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>fixture.session.endcardShown);
  assert.equal(await page.evaluate(()=>fixture.session.ended),reason);
  const redirects=await page.evaluate(()=>destinations);assert.equal(redirects.length,1);
  if(reason==='clear'){assert(redirects[0].winEndedAt>redirects[0].winRequestedAt,'Win must finish playing');assert(redirects[0].at>=redirects[0].winEndedAt,'Store must open after the win cue finishes');}
  if(reason==='clear')await page.waitForFunction(()=>media.find(m=>m.src.includes('sfx_win.mp3')).audiblePlaying>0);
  if(reason==='fail')await page.waitForFunction(()=>media.find(m=>m.src.includes('sfx-fail.mp3')).audiblePlaying>0);
  const failed=await fail();assert.equal(failed.requests,reason==='fail'?1:0);
  if(reason==='fail'){assert.equal(failed.endcardAtRequest,false);assert.equal(failed.reasonAtRequest,'fail');assert.equal(failed.volume,.15);}
  const shown=await win();assert.equal(shown.requests,reason==='clear'?1:0);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForTimeout(100);assert.equal((await win()).requests,shown.requests);
  assert.equal((await fail()).requests,failed.requests);assert.equal((await fail()).paused,true);
  results.push({reason,win:shown,fail:failed,redirects});
 }
 // File relocation must still allow editor import and play-test.
 await page.goto(root+'/level-editor.html');await page.locator('#level-file').setInputFiles('levels/overload-level.arrow-flow.json');
 await page.locator('#play-test').click();await page.locator('#preview-dialog[open]').waitFor();
 await page.frameLocator('#preview-frame iframe').locator('canvas').waitFor();
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/result-audio-browser.json',JSON.stringify({at:new Date().toISOString(),browser:browser.version(),muted:true,method:'Native press then controlled clear/timeout; actual overload failure; hide before completion; win ended before store opens; editor import and preview',results,errors},null,2));
 console.log(JSON.stringify({results,errors}));
}finally{await browser.close();}
