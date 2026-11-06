import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
const sharp=createRequire(import.meta.url)('D:/Projects/Phaser/Bubble-Cash--Template/node_modules/sharp');
const root='http://127.0.0.1:5173',dir='analysis/screenshots/cannon-3c4374-vignette';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[],results=[];
try{
 const context=await browser.newContext({viewport:{width:768,height:1024},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/src/render/scene.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();assert(source.includes('const groups ='));
  await route.fulfill({response,body:source.replace('const groups =','window.lightProbe={scene,renderer,camera};const groups =')});
 });
 await page.goto(root);await page.locator('html[data-scene-ready="true"]').waitFor();
 for(const [width,height] of [[768,1024],[390,844],[844,390],[360,640],[640,360],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(200);
  const state=await page.locator('.full-vignette').evaluate(el=>({on:el.classList.contains('on'),mask:el.style.maskImage,box:el.getBoundingClientRect().toJSON(),drawCalls:Number(document.querySelector('canvas').dataset.drawCalls),z:Number(getComputedStyle(el).zIndex),worldZ:Number(getComputedStyle(document.querySelector('canvas')).zIndex)}));
  assert(state.on);assert.equal(state.mask,'');assert(state.z<state.worldZ);
  assert.equal(state.box.width,width);assert.equal(state.box.height,height);assert.equal(state.box.x,0);assert.equal(state.box.y,0);
  await page.screenshot({path:`${dir}/${width}x${height}.png`});
  const screenshot=await sharp(`${dir}/${width}x${height}.png`).removeAlpha().raw().toBuffer();
  for(const [x,y] of [[4,4],[width-5,4],[4,height-5],[width-5,height-5]]){
    const i=(y*width+x)*3;assert(screenshot[i]>screenshot[i+2]+20,'Red warning must reach all four corners after resize');
  }
  if(width===768){
   const samples=[];
   for(const hidden of [false,true]){
    await page.locator('.full-vignette').evaluate((el,hidden)=>el.style.visibility=hidden?'hidden':'visible',hidden);
    const file=`${dir}/${hidden?'no-warning':'current'}.png`;await page.screenshot({path:file});
    const {data,info}=await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const at=(x,y)=>[...data.subarray((y*info.width+x)*3,(y*info.width+x)*3+3)];
    samples.push({hidden,centerHood:at(360,48),leftHood:at(134,48),centerEdge:at(346,160),warning:at(15,900)});
   }
   for(const key of ['centerHood','leftHood','centerEdge'])assert.deepEqual(samples[0][key],samples[1][key],`Warning must not tint ${key}`);
   for(const key of ['centerHood','leftHood','centerEdge'])assert.deepEqual(samples[0][key],[60,67,116],`${key} must be exactly #3c4374`);
   assert.notDeepEqual(samples[0].warning,samples[1].warning,'Warning remains outside containers');
   await page.locator('.full-vignette').evaluate(el=>el.style.visibility='visible');
   await page.evaluate(()=>{
    const p=lightProbe;p.lights=[];p.scene.traverse(o=>{if(o.isLight){p.lights.push([o,o.intensity]);o.intensity=0;}});
    p.environment=p.scene.environment;p.scene.environment=null;p.renderer.render(p.scene,p.camera);
   });
   const dark=await page.screenshot({path:`${dir}/lights-disabled.png`});
   const {data,info}=await sharp(dark).removeAlpha().raw().toBuffer({resolveWithObject:true});
   for(const [key,x,y] of [['centerHood',360,48],['leftHood',134,48],['centerEdge',346,160]]){
    const offset=(y*info.width+x)*3;assert.deepEqual([...data.subarray(offset,offset+3)],samples[0][key],`Lighting must not affect ${key}`);
   }
   await page.evaluate(()=>{const p=lightProbe;for(const [light,intensity] of p.lights)light.intensity=intensity;p.scene.environment=p.environment;p.renderer.render(p.scene,p.camera);});
   results.push({viewport:[width,height],drawCalls:state.drawCalls,samples});
  }else results.push({viewport:[width,height],drawCalls:state.drawCalls,fullViewport:true});
 }
 await page.evaluate(()=>Object.assign(document.getElementById('game').style,{width:'320px',height:'480px',left:'20px',top:'30px'}));
 await page.waitForTimeout(200);
 const embedded=await page.locator('.full-vignette').evaluate(el=>el.getBoundingClientRect().toJSON());
 assert.deepEqual([embedded.x,embedded.y,embedded.width,embedded.height],[20,30,320,480]);
 await page.screenshot({path:`${dir}/offset-container.png`});
 await page.evaluate(()=>Object.assign(document.getElementById('game').style,{width:'',height:'',left:'',top:''}));
 await page.waitForTimeout(200);
 await page.evaluate(()=>{window.testContext=document.querySelector('canvas').getContext('webgl2');window.testLoss=testContext.getExtension('WEBGL_lose_context');testLoss.loseContext();});
 await page.waitForFunction(()=>testContext.isContextLost());
 await page.evaluate(()=>testLoss.restoreContext());await page.waitForFunction(()=>!testContext.isContextLost());await page.waitForTimeout(200);
 await page.screenshot({path:`${dir}/context-restored.png`});
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/cannon-3c4374-vignette.json',JSON.stringify({at:new Date().toISOString(),browser:browser.version(),audio:'muted',lightingInvariant:true,embedded,results,errors},null,2));
 console.log(JSON.stringify(results));
}finally{await browser.close();}
