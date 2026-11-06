import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
const sharp=createRequire(import.meta.url)('D:/Projects/Phaser/Bubble-Cash--Template/node_modules/sharp');
const root='http://127.0.0.1:5173',dir='analysis/screenshots/cannon-color-investigation';
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[],results=[];
try{
 const context=await browser.newContext({viewport:{width:768,height:1024},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/render/scene.ts*',async route=>{
  const response=await route.fetch(),source=await response.text();assert(source.includes('const groups ='));
  await route.fulfill({response,body:source.replace('const groups =','window.probe={scene,camera,renderer,materials};const groups =')});
 });
 await page.goto(root);await page.locator('html[data-scene-ready="true"]').waitFor();
 await page.evaluate(async()=>{
  const {MeshBasicMaterial}=await import('/node_modules/.vite/deps/three.js'),p=window.probe;
  p.original=p.materials.tunnel;p.texture=p.original.map;
  p.meshes=p.scene.children.filter(o=>o.material===p.original);
  p.unlit=new MeshBasicMaterial({map:p.texture,vertexColors:true});
  const swatch=document.createElement('div');swatch.style.cssText='position:fixed;left:580px;top:184px;width:160px;height:28px;background:#3e446e;color:white;font:14px sans-serif;z-index:50;text-align:center;line-height:28px';swatch.textContent='#3e446e target';document.body.append(swatch);
 });
 for(const mode of ['current','no-vignette','untextured-lit','unlit-textured','unlit-solid']){
  await page.evaluate(mode=>{
   const p=window.probe,unlit=mode.startsWith('unlit');
   document.querySelector('.full-vignette').style.visibility=mode==='current'?'visible':'hidden';
   p.original.map=mode==='untextured-lit'?null:p.texture;p.original.needsUpdate=true;
   p.unlit.map=mode==='unlit-solid'?null:p.texture;p.unlit.needsUpdate=true;
   for(const mesh of p.meshes)mesh.material=unlit?p.unlit:p.original;
   p.renderer.render(p.scene,p.camera);
  },mode);
  const file=`${dir}/${mode}.png`;await page.screenshot({path:file,clip:{x:0,y:0,width:768,height:220}});
  const {data,info}=await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const sample=(x,y)=>'#'+[...data.subarray((y*info.width+x)*3,(y*info.width+x)*3+3)].map(c=>c.toString(16).padStart(2,'0')).join('');
  results.push({mode,file,samples:{centerHood:sample(360,48),leftHood:sample(134,48),centerOuterEdge:sample(346,160),target:sample(585,190)}});
 }
 assert.deepEqual(errors,[]);assert.equal(results.at(-1).samples.centerHood,'#3e446e');
 fs.writeFileSync('analysis/evidence/cannon-color-investigation.json',JSON.stringify({at:new Date().toISOString(),browser:browser.version(),viewport:[768,1024],audio:'muted',note:'Browser-only material/overlay overrides; production source unchanged',results,errors},null,2));
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}


