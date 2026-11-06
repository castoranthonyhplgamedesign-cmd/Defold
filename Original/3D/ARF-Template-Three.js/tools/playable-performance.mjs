import fs from 'node:fs';
import os from 'node:os';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {hintPoint} from './gameplay-points.mjs';

const [stage='before',file='analysis/build/mockup-look-build/index.html']=process.argv.slice(2),html=fs.readFileSync(file,'utf8');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--disable-background-networking']});
const results=[],errors=[];
try{
 for(const rate of [1,4]){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
  await context.route('**/*',r=>r.request().url()==='https://preview.invalid/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
  await context.addInitScript(()=>{
   window.__draws=0;
   for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
    const original=WebGL2RenderingContext.prototype[name];
    WebGL2RenderingContext.prototype[name]=function(...args){window.__draws++;return original.apply(this,args);};
   }
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  const start=Date.now();await page.goto('https://preview.invalid/');await page.locator('html[data-scene-ready="true"]').waitFor({timeout:60000});const readyMs=Date.now()-start;
  await page.waitForTimeout(700);
  for(const phase of ['idle','launch']){
   if(phase==='launch'){
    const point=await hintPoint(page);
    await page.mouse.click(...point);
    await page.waitForFunction(()=>document.querySelector('.tutorial-hand').hidden,{},{timeout:1000});
   }
   const metrics=await page.evaluate(()=>new Promise(resolve=>{
    const samples=[],startDraws=window.__draws;let previous=performance.now(),raf;
    const tick=now=>{samples.push(now-previous);previous=now;raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
    setTimeout(()=>{
     cancelAnimationFrame(raf);const c=document.querySelector('canvas'),gl=c.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');samples.shift();samples.sort((a,b)=>a-b);
     resolve({frames:samples.length,fps:1000/(samples.reduce((a,b)=>a+b,0)/samples.length),medianMs:samples[Math.floor(samples.length*.5)],p95Ms:samples[Math.floor(samples.length*.95)],drawsPerFrame:(window.__draws-startDraws)/(samples.length+1),mainDraws:+c.dataset.drawCalls,triangles:+c.dataset.triangles,buffer:[c.width,c.height],heapBytes:performance.memory?.usedJSHeapSize??null,gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'Unknown'});
    },5000);
   }));
   results.push({cpuThrottle:rate,phase,readyMs,...metrics});
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);
 fs.mkdirSync('analysis/evidence',{recursive:true});
 fs.writeFileSync(`analysis/evidence/playable-performance-${stage}.json`,JSON.stringify({at:new Date().toISOString(),file,bytes:Buffer.byteLength(html),browser:browser.version(),cpu:os.cpus()[0]?.model,platform:os.platform(),results,errors,limits:'Headless desktop fixture, not a physical phone or ad host. GPU renderer and CPU throttle are recorded; shared host load affects timings.'},null,2));
 console.log(JSON.stringify({stage,results,errors},null,2));
}finally{await browser.close();}
