import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const brand=JSON.parse(fs.readFileSync(path.join(root,'branding.json'),'utf8'));
const file=path.resolve(root,'../../../output',brand.packageName+'.html');
const url=pathToFileURL(file).href;
const require=createRequire(path.resolve(root,'../../../reference/BBS-Corners/package.json'));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({viewport:{width:390,height:844},offline:true});
const page=await context.newPage();
const report={name:brand.name,file,timestamp:new Date().toISOString(),offline:true,tests:[],errors:[],extraRequests:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||/^ERROR:/.test(m.text()))report.errors.push(m.text())});
page.on('request',r=>{if(!r.url().startsWith(url)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))report.extraRequests.push(r.url())});
await context.route(/^https?:\/\//,route=>route.abort());
const out=path.join(root,'qa/artifacts');fs.mkdirSync(out,{recursive:true});
try{
  await page.goto(url+'?iteration=4clicks');
  await page.waitForFunction(()=>window.__bbsState,null,{timeout:45000});
  assert.equal(await page.title(),brand.name);
  let state=await page.evaluate(()=>window.__bbsState);
  assert.equal(state.remaining,56);assert.equal(state.iteration,'4clicks');
  assert.equal((await page.evaluate(()=>window.__BBS_SINGLE_FILE__)).embeddedFiles.length,7);
  report.tests.push('renamed HTML loads directly from the requested folder with networking disabled');
  await page.screenshot({path:path.join(out,'single-html-gameplay.png')});
  // Use real pointer input for a starting matching submission.
  const hint=state.hint,a=state.bricks.find(b=>b.id===hint.id);
  await page.mouse.move(a.screen_x,a.screen_y);await page.mouse.down();
  await page.mouse.move(a.screen_x+hint.dx*state.ppu*0.9,a.screen_y-hint.dz*state.ppu*0.942*0.9,{steps:6});
  await page.mouse.up();await page.waitForTimeout(800);
  assert.equal((await page.evaluate(()=>window.__bbsState)).remaining,55);
  report.tests.push('embedded meshes, textures, fonts, audio and gameplay run without companion files');
  for(let i=0;i<3;i++){
    state=await page.evaluate(()=>window.__bbsState);const b=state.bricks[0];
    await page.mouse.click(b.screen_x,b.screen_y,{delay:100});await page.waitForTimeout(400);
  }
  assert((await page.evaluate(()=>window.__bbsState)).ended);await page.waitForTimeout(1100);
  await page.screenshot({path:path.join(out,'single-html-endcard.png')});
  report.tests.push('renamed end card works offline and local CTA stays in the file');
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(500);
  assert((await page.evaluate(()=>window.__bbsState)).ended);report.tests.push('standalone file supports rotation');
  assert.equal(report.extraRequests.length,0,'no companion-file or network requests');
  assert.equal(report.errors.length,0,'no browser or engine runtime errors');
  report.tests.push('zero external requests and zero runtime errors');report.passed=true;
  console.log('PASS '+report.tests.join('\nPASS '));
}catch(e){report.passed=false;report.failure=String(e.stack||e);await page.screenshot({path:path.join(out,'single-html-failure.png')});console.log(JSON.stringify(report,null,2));process.exitCode=1}
finally{fs.writeFileSync(path.join(out,'single-html-smoke.json'),JSON.stringify(report,null,2));await browser.close()}
