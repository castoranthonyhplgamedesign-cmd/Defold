// Automated local browser QA; operates only the isolated reference and local build.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(path.resolve(root,'../../../reference/BBS-Corners/package.json'));
const {chromium}=require('@playwright/test');
const out=path.join(root,'qa/artifacts');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[],logs=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{logs.push(m.text());if(m.type()==='error'||/^ERROR:/.test(m.text()))errors.push(m.text())});
await page.goto(process.argv[2]||'http://127.0.0.1:5177');
if(process.argv[2])await page.waitForFunction(()=>window.__bbsState,{timeout:45000}).catch(()=>{});
else await page.waitForTimeout(3500);
await page.screenshot({path:path.join(out,process.argv[3]||'reference-portrait.png')});
const state=await page.evaluate(()=>window.__bbsState||null);
fs.writeFileSync(path.join(out,'last-run.json'),JSON.stringify({url:page.url(),errors,logs,state},null,2));
console.log(JSON.stringify({url:page.url(),errors,logs:logs.slice(-18),body:(await page.locator('body').innerText()).slice(0,500),state:state&&{remaining:state.remaining,iteration:state.iteration,width:state.width,height:state.height,hint:state.hint}},null,2));
await browser.close();
