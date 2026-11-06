import {gameplayPoints} from './gameplay-points.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import os from 'node:os';
import {chromium} from 'playwright';
const html=fs.readFileSync('dist/index.html','utf8');
const browser=await chromium.launch({headless:true,args:['--mute-audio','--disable-background-networking']});
const errors=[],results=[];
try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
  await context.route('**/*',route=>route.request().url()==='https://preview.invalid/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://preview.invalid/');await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');
  const point=await gameplayPoints(page);
  await page.mouse.click(...point(165,191));await page.mouse.click(...point(204,191));
  const cdp=await context.newCDPSession(page);
  for(const rate of [1,4]){
    await cdp.send('Emulation.setCPUThrottlingRate',{rate});
    const metrics=await page.evaluate(()=>new Promise(resolve=>{
      const samples=[];let previous=performance.now(),frame;
      function tick(now){samples.push(now-previous);previous=now;frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);
      setTimeout(()=>{cancelAnimationFrame(frame);const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');samples.sort((a,b)=>a-b);resolve({samples:samples.length,fps:1000/(samples.reduce((a,b)=>a+b,0)/samples.length),medianMs:samples[Math.floor(samples.length*.5)],p95Ms:samples[Math.floor(samples.length*.95)],heapBytes:performance.memory?.usedJSHeapSize??null,gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'Unknown',drawCalls:Number(canvas.dataset.drawCalls),triangles:Number(canvas.dataset.triangles)});},4000);
    }));
    assert(metrics.samples>0);results.push({cpuThrottle:rate,...metrics});
  }
  await context.close();
  const fallback=await browser.newContext({viewport:{width:390,height:844}});
  await fallback.route('**/*',route=>route.request().url()==='https://preview.invalid/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};window.destinations=[];window.open=(...args)=>window.destinations.push(args);});
  const p=await fallback.newPage();await p.goto('https://preview.invalid/');await p.waitForFunction(()=>document.documentElement.dataset.sceneReady==='failed');assert.equal(await p.evaluate(()=>window.destinations.length),0);await p.locator('.fallback button').click();assert.equal(await p.evaluate(()=>window.destinations.length),1);await p.screenshot({path:'analysis/screenshots/delivery/webgl-fallback.png'});await fallback.close();
  assert.deepEqual(errors,[]);fs.writeFileSync('analysis/evidence/performance.json',JSON.stringify({testedAt:new Date().toISOString(),browser:browser.version(),cpu:os.cpus()[0]?.model,platform:os.platform(),results,errors,fallback:'WebGL disabled fixture displays deliberate CTA; no automatic redirect',limits:'Headless desktop, not a phone or real ad WebView. Shared machine load affects samples.'},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
