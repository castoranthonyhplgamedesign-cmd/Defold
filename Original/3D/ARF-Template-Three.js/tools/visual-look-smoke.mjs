import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const stage=process.argv[2]??'after',dir=`analysis/screenshots/mockup-look/${stage}`;
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
try{
 const page=await browser.newPage(),errors=[],external=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=r.request().url();if(/^https?:/.test(u)&&!u.startsWith('http://127.0.0.1:5173/')){external.push(u);return r.abort();}return r.continue();});
 for(const [width,height]of [[390,844],[844,390],[768,1024],[360,640]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5173/');
  await page.locator('html[data-scene-ready="true"]').waitFor({timeout:45000});await page.waitForTimeout(400);
  assert.equal(await page.locator('canvas').count(),1);
  await page.screenshot({path:`${dir}/${width}x${height}.png`});
  views.push({width,height,meter:await page.locator('.meter-percent').innerText(),...await page.locator('canvas').evaluate(c=>({...c.dataset}))});
 }
 let restored=false;
 if(stage.endsWith('after')){
  restored=await page.locator('canvas').evaluate(c=>new Promise(resolve=>{
   const extension=c.getContext('webgl2').getExtension('WEBGL_lose_context');
   if(!extension){resolve(false);return;}
   c.addEventListener('webglcontextlost',()=>setTimeout(()=>extension.restoreContext(),100),{once:true});
   c.addEventListener('webglcontextrestored',()=>resolve(true),{once:true});
   extension.loseContext();
  }));
  assert(restored,'Context-loss fixture requires WEBGL_lose_context');await page.waitForTimeout(600);
  assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.locator('.meter-percent').innerText(),'99%');
  await page.screenshot({path:`${dir}/context-restored.png`});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(`${dir}/checks.json`,JSON.stringify({at:new Date().toISOString(),stage,views,restored,errors,external,audio:'muted'},null,2));
 console.log(JSON.stringify({stage,views,restored,errors,external}));
}finally{await browser.close();}
