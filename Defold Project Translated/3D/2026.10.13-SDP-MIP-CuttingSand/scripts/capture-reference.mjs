import {chromium} from 'playwright';import fs from 'node:fs/promises';
await fs.mkdir('qa/reference',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const [name,w,h]of [['portrait',390,844],['landscape',844,390]]){
 const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));await page.addInitScript(()=>{window.open=(url)=>{(window.__QA_REDIRECTS__??=[]).push(url);return null}});
 await page.goto('http://127.0.0.1:8181/');await page.waitForTimeout(500);await page.screenshot({path:`qa/reference/${name}-opening.png`});
 await page.waitForFunction(()=>window.__SDP_STATE__?.state==='play');await page.waitForTimeout(300);await page.screenshot({path:`qa/reference/${name}-play.png`});
 const state=await page.evaluate(()=>window.__SDP_STATE__);await fs.writeFile(`qa/reference/${name}-state.json`,JSON.stringify({state,errors},null,2));
 if(name==='portrait'){
  const p=state.targets.swipe;const s=Math.min(w/1080,h/1920),ox=(w-1080*s)/2,oy=(h-1920*s)/2;
  await page.mouse.move(ox+p.x1*s,oy+p.y1*s);await page.mouse.down();await page.mouse.move(ox+p.x2*s,oy+p.y2*s,{steps:30});await page.mouse.up();await page.waitForTimeout(2500);
  await page.screenshot({path:'qa/reference/portrait-cut.png'});await fs.writeFile('qa/reference/cut-state.json',JSON.stringify(await page.evaluate(()=>window.__SDP_STATE__),null,2));
 }
 await page.close();
}
await browser.close();console.log('Reference captures saved.');
