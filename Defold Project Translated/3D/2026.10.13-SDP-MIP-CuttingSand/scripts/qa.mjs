import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
await fs.mkdir('qa/defold',{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
const base='http://127.0.0.1:8182/';
async function open(name,url='',viewport={width:390,height:844}){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});const errors=[],logs=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{logs.push(m.text());if(m.type()==='error'||/ERROR:SCRIPT/.test(m.text()))errors.push(m.text())});
 await page.goto(base+url);try{await page.waitForFunction(()=>window.__SDP_STATE__?.state==='play'||window.SandQA?.fatal,null,{timeout:45000});if(await page.evaluate(()=>SandQA.fatal))throw Error(await page.evaluate(()=>SandQA.fatal))}catch(e){await fs.writeFile(`qa/defold/${name}-boot.json`,JSON.stringify({errors,logs},null,2));await page.screenshot({path:`qa/defold/${name}-boot.png`});throw e}
 assert.equal(errors.length,0,errors.join('\n'));return {page,errors,logs,name};
}
async function state(p){return p.evaluate(()=>window.__SDP_STATE__)}
async function finish(t){const snapshot=await state(t.page);await t.page.screenshot({path:`qa/defold/${t.name}.png`});results.push({name:t.name,snapshot,errors:t.errors,diagnostics:await t.page.evaluate(()=>({events:SandQA.events,redirects:SandQA.redirects,audio:SandQA.audio(),plays:SandQA.plays}))});assert.equal(snapshot.accounted,snapshot.total);assert.equal(snapshot.integrity,'');assert.equal(t.errors.length,0,t.errors.join('\n'));await t.page.close()}
try{
 let t=await open('portrait');await t.page.waitForTimeout(500);await finish(t);
 if(process.argv.includes('--smoke')){await fs.writeFile('qa/browser-results.json',JSON.stringify(results,null,2));await browser.close();console.log('PASS Defold browser boot.');process.exit(0)}
 t=await open('landscape','',{width:844,height:390});await finish(t);
 t=await open('cut');let s=await state(t.page);const h=s.targets.swipe;const scale=Math.min(390/1080,844/1920),ox=(390-1080*scale)/2,oy=(844-1920*scale)/2;
 await t.page.mouse.move(ox+h.x1*scale,oy+h.y1*scale);await t.page.mouse.down();await t.page.mouse.move(ox+h.x2*scale,oy+h.y2*scale,{steps:20});await t.page.mouse.up();await t.page.waitForTimeout(2500);s=await state(t.page);assert.equal(s.counted,1);assert(s.remaining<s.total);await finish(t);
 t=await open('tap','?mechanic=tap');s=await state(t.page);const p=s.targets.right;await t.page.mouse.click(5,5);await t.page.waitForTimeout(200);assert.equal((await state(t.page)).counted,0);await t.page.mouse.click(ox+p.x*scale,oy+p.y*scale);await t.page.waitForTimeout(1600);s=await state(t.page);assert.equal(s.counted,1);assert(s.remaining<s.total);await finish(t);
 for(const limit of [5,10]){t=await open(`limit-${limit}`,`?variant=${limit}clicks`);for(let i=0;i<limit;i++){await t.page.mouse.click(10,10);await t.page.waitForTimeout(180)}await t.page.waitForFunction(()=>window.__SDP_STATE__.state==='endcard');s=await state(t.page);assert.equal(s.counted,limit);assert.equal(s.endReason,'limit');assert.equal((await t.page.evaluate(()=>SandQA.redirects.length)),1);await t.page.waitForTimeout(500);await t.page.mouse.click(100,100);assert.equal((await t.page.evaluate(()=>SandQA.redirects.length)),2);await finish(t)}
 t=await open('rotate');s=await state(t.page);await t.page.setViewportSize({width:844,height:390});await t.page.waitForTimeout(700);assert.equal((await state(t.page)).remaining,s.remaining);await finish(t);
 t=await open('lifecycle');await t.page.mouse.click(10,10);await t.page.waitForTimeout(300);await t.page.evaluate(()=>window.dispatchEvent(new Event('luna:pause')));await t.page.waitForTimeout(300);const before=(await state(t.page)).time;await t.page.waitForTimeout(600);assert.equal((await state(t.page)).time,before);assert.equal(await t.page.evaluate(()=>SandQA.audio().gain),0);await t.page.evaluate(()=>window.dispatchEvent(new Event('luna:resume')));await t.page.waitForTimeout(350);assert((await state(t.page)).time>before);await finish(t);
 await fs.writeFile('qa/browser-results.json',JSON.stringify(results,null,2));console.log(`PASS ${results.length} browser QA cases.`);
}catch(e){await fs.writeFile('qa/browser-results.json',JSON.stringify({results,error:String(e)},null,2));throw e}finally{await browser.close()}
