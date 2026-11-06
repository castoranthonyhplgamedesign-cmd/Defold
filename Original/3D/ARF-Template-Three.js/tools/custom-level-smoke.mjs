import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
const profiles=JSON.parse(fs.readFileSync('src/networkProfiles.json'));
const results=[];
for(const tag of ['preview',...profiles.map(p=>p.tag)]){
 const built=spawnSync(process.execPath,['scripts/build-level.mjs','examples/levels/four-sides.arrow-flow.json',tag],{encoding:'utf8',windowsHide:true});
 assert.equal(built.status,0,built.stdout+built.stderr);
 const folder=`dist/custom/four-sides-arrow-flow-json/${tag}`,html=fs.readFileSync(`${folder}/index.html`,'utf8');
 assert(!/arrow-flow-ready|arrow-flow-level|point-out-editor|Phaser|editor-preview/.test(html),'Editor is not shipped');
 const file=fs.readdirSync(folder).find(n=>n!=='index.html'),profile=profiles.find(p=>p.tag===tag);
 assert(file.endsWith(profile?.zip?'.zip':'.html'));
 results.push({tag,htmlBytes:Buffer.byteLength(html),file:`${folder}/${file}`,packageBytes:fs.statSync(`${folder}/${file}`).size});
}
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--no-sandbox']});
const errors=[],requests=[];
try{
 for(const result of results){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await context.addInitScript(()=>{window.mraid={getState:()=> 'default',isViewable:()=>true,addEventListener:()=>{},open:()=>{}};});
  const html=fs.readFileSync(`dist/custom/four-sides-arrow-flow-json/${result.tag}/index.html`,'utf8');
  await context.route('**/*',route=>{
   const url=route.request().url();requests.push({tag:result.tag,url});
   if(url==='https://custom.invalid/')return route.fulfill({contentType:'text/html',body:html});
   if(url==='https://custom.invalid/mraid.js'||url==='https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js')return route.fulfill({contentType:'text/javascript',body:''});
   errors.push(`Unexpected request ${url}`);return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(`${result.tag}: ${e.message}`));
  await page.goto('https://custom.invalid/');await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');
  assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.locator('.cannon-ammo[data-lane]').count(),4);
  if(result.tag==='preview'){
   await page.clock.install();
   for(let i=0;i<4;i++){
    await page.clock.runFor(5500);
    const target=await page.locator('.tutorial-hand').evaluate(el=>{if(el.hidden)throw new Error('Missing valid hint');const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m);return [p.x,p.y+(tap?0:8*Math.hypot(m.a,m.b))];});
    await page.touchscreen.tap(...target);await page.clock.runFor(200);
   }
   await page.clock.runFor(6000);assert(await page.locator('.endcard').isVisible());
   await page.screenshot({path:'analysis/screenshots/editor/packaged-touch-clear.png'});
  }
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);assert.equal(await page.locator('canvas').count(),1);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/custom-level-builds.json',JSON.stringify({checkedAt:new Date().toISOString(),results,errors,requests,notes:'Eight selected network packages and standalone preview booted locally. Native touch cleared the standalone custom level. Host bridges were mocked; official network acceptance is unverified.'},null,2));
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
