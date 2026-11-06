import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root='http://127.0.0.1:5173';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[];
try {
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 await context.addInitScript(()=>{
  window.media=[];const OriginalAudio=window.Audio;
  window.Audio=class extends OriginalAudio {
   constructor(...args){super(...args);this.requests=0;this.observedPlaying=0;window.media.push(this);this.addEventListener('playing',()=>this.observedPlaying++);}
   play(){this.requests++;return super.play();}
  };
  window.open=()=>null;
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/main.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();assert(source.includes('view.setHostPaused(hostPaused);'));
  await route.fulfill({response,body:source.replace('view.setHostPaused(hostPaused);','window.fixture={simulation,session,view,audio};view.setHostPaused(hostPaused);')});
 });
 await page.route('**/src/render/scene.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('camera.updateMatrixWorld();','camera.updateMatrixWorld();window.fixtureProjection={camera,renderer};')});
 });
 await page.goto(root);await page.locator('html[data-scene-ready="true"]').waitFor();
 const before=await page.evaluate(()=>({voices:media.length,requests:media.reduce((n,m)=>n+m.requests,0),duration:media.find(m=>m.loop).duration}));
 assert.equal(before.voices,37);assert.equal(before.requests,0);assert(Math.abs(before.duration-7.68)<.15);
 const point=await page.evaluate(async()=>{
  const {simulation:s,view}=fixture,{camera,renderer}=fixtureProjection;
  const {Vector3}=await import('/node_modules/.vite/deps/three.js'),a=s.arrows.find(a=>a.data.id===0),rect=renderer.domElement.getBoundingClientRect();
  const p=new Vector3(...a.segments[0].position);p.y+=(-1.55+.6)*a.data.cellSize;p.project(camera);
  const point=[rect.left+(p.x+1)*rect.width/2,rect.top+(1-p.y)*rect.height/2];if(view.pick(...point)!==0)throw new Error('Missed arrow');return point;
 });
 await page.mouse.click(...point);
 await page.waitForFunction(()=>media.find(m=>m.loop).observedPlaying>0);
 const snapshot=()=>page.evaluate(()=>{const m=media.find(m=>m.loop);return {time:m.currentTime,paused:m.paused,muted:m.muted,volume:m.volume,requests:m.requests,playing:m.observedPlaying};});
 const started=await snapshot();assert(!started.muted&&!started.paused);assert.equal(started.volume,.5);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await snapshot();assert(hidden.paused&&hidden.muted);
 await page.waitForTimeout(200);assert.equal((await snapshot()).time,hidden.time);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>!media.find(m=>m.loop).paused&&media.find(m=>m.loop).currentTime>0);
 const resumed=await snapshot();assert(resumed.time>=hidden.time);
 await page.evaluate(()=>fixture.audio.setState(false,0));assert((await snapshot()).paused);
 await page.evaluate(()=>fixture.audio.setState(false,1));
 await page.waitForFunction(()=>!media.find(m=>m.loop).paused);
 await page.evaluate(()=>{const m=media.find(m=>m.loop);m.currentTime=m.duration-.25;});
 await page.waitForFunction(()=>{const m=media.find(m=>m.loop);return m.currentTime<2&&!m.paused;});
 const looped=await snapshot();assert(!looped.muted);assert.deepEqual(errors,[]);
 const repeats=await page.evaluate(()=>new Promise((resolve,reject)=>{
  const m=media.find(m=>m.loop),times=[];let last=m.currentTime;
  const timeout=setTimeout(()=>{clearInterval(timer);reject(new Error('Music did not complete three natural loops'));},28000);
  const timer=setInterval(()=>{const time=m.currentTime;if(time<last-1)times.push(performance.now());last=time;if(times.length===3){clearInterval(timer);clearTimeout(timeout);resolve({wraps:times.length,intervalsMs:times.slice(1).map((t,i)=>t-times[i]),paused:m.paused});}},30);
 }));
 assert.equal(repeats.wraps,3);assert.equal(repeats.paused,false);
 for(const interval of repeats.intervalsMs)assert(Math.abs(interval-7680)<250);
 fs.writeFileSync('analysis/evidence/bgm-browser.json',JSON.stringify({at:new Date().toISOString(),browser:browser.version(),output:'muted with --mute-audio; speaker mix not auditioned',before,started,hidden,resumed,looped,repeats,errors},null,2));
 console.log(JSON.stringify({before,started,hidden,resumed,looped,repeats,errors}));
}finally{await browser.close();}
