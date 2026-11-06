import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root='http://127.0.0.1:5173',errors=[];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 await context.addInitScript(()=>{
  const Original=window.Audio;window.fixtureMedia=[];
  window.Audio=function(...args){const m=new Original(...args),play=m.play.bind(m);m.requests=[];m.starts=[];
   m.play=()=>{m.requests.push({time:performance.now(),muted:m.muted,phase:window.fixture?.session.warningPhase});return play();};
   m.addEventListener('playing',()=>m.starts.push({time:performance.now(),muted:m.muted}));window.fixtureMedia.push(m);return m;};
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{
  const response=await route.fetch(),source=await response.text(),marker='view.setHostPaused(hostPaused);';assert(source.includes(marker));
  await route.fulfill({response,body:source.replace(marker,'window.fixture={session,simulation,view};'+marker)});
 });
 await page.route('**/src/render/scene.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('camera.updateMatrixWorld();','camera.updateMatrixWorld();window.fixtureProjection={camera,renderer};')});
 });
 await page.goto(root+'/?variant=60sec');await page.locator('html[data-scene-ready="true"]').waitFor();
 const snapshot=()=>page.evaluate(()=>({count:fixtureMedia.length,warning:fixtureMedia.filter(m=>m.src.includes('warning-pulse')).map(m=>({duration:m.duration,volume:m.volume,paused:m.paused,requests:m.requests.filter(r=>!r.muted),starts:m.starts.filter(r=>!r.muted)}))}));
 await page.waitForTimeout(1300);const before=await snapshot();assert.equal(before.count,37);assert(before.warning.every(m=>!m.requests.length));
 const point=await page.evaluate(async()=>{
  const {simulation:s,view}=fixture,{camera,renderer}=fixtureProjection,{Vector3}=await import('/node_modules/.vite/deps/three.js'),rect=renderer.domElement.getBoundingClientRect();
  for(const a of s.arrows.filter(a=>!s.canMove(a)))for(const part of a.segments){
   const p=new Vector3(...part.position);p.y+=(-1.55+.6)*a.data.cellSize;p.project(camera);
   const point=[rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2];if(view.pick(...point)===a.data.id)return point;
  }throw new Error('No pickable blocked arrow');
 });
 await page.mouse.click(...point);
 await page.waitForFunction(()=>fixtureMedia.filter(m=>m.src.includes('warning-pulse')).flatMap(m=>m.starts).filter(r=>!r.muted).length>=3);
 const playing=await snapshot(),requests=playing.warning.flatMap(m=>m.requests).sort((a,b)=>a.time-b.time);
 assert(playing.warning.every(m=>Math.abs(m.duration-.46)<.07&&m.volume===.22));
 for(let i=1;i<requests.length;i++)assert(Math.abs(requests[i].time-requests[i-1].time-1100)<180,'Warning matches the 1.1 s pulse');
 assert(requests.every(r=>r.phase>=.35&&r.phase<=.51),'Requests occur at the visual crest');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await snapshot();assert(hidden.warning.every(m=>m.paused));await page.waitForTimeout(1200);
 assert.deepEqual(await snapshot(),hidden,'No hidden warning requests');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:844,height:390});
 const count=hidden.warning.reduce((n,m)=>n+m.requests.length,0);
 await page.waitForFunction(count=>fixtureMedia.filter(m=>m.src.includes('warning-pulse')).flatMap(m=>m.requests).filter(r=>!r.muted).length>count,count);
 // Controlled threshold transition; no source changes or production debug interface.
 await page.evaluate(()=>fixture.simulation.preloaded.slice(0,10).forEach(s=>fixture.simulation.remove(s)));await page.waitForTimeout(150);
 const cleared=await snapshot();assert(cleared.warning.every(m=>m.paused));assert(!await page.locator('.full-vignette').evaluate(e=>e.classList.contains('on')));
 await page.waitForTimeout(1200);assert.deepEqual(await snapshot(),cleared);
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/warning-browser.json',JSON.stringify({at:new Date().toISOString(),browser:browser.version(),output:'Muted runner; browser media evidence, not speaker audition',before,playing,hidden,cleared,errors},null,2));
 console.log(JSON.stringify({voices:before.count,warningStarts:playing.warning.reduce((n,m)=>n+m.starts.length,0),lifecycle:'passed',reducedMotion:'audio retained',errors}));
}finally{await browser.close();}
