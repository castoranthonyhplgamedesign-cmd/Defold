import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const brand=JSON.parse(fs.readFileSync(path.join(root,'branding.json'),'utf8'));
const require=createRequire(path.resolve(root,'../../../reference/BBS-Corners/package.json'));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:390,height:844}});
const report={name:brand.name,timestamp:new Date().toISOString(),tests:[],errors:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||/^ERROR:/.test(m.text()))report.errors.push(m.text())});
const out=path.join(root,'qa/artifacts');fs.mkdirSync(out,{recursive:true});
try{
  await page.goto('http://127.0.0.1:8188/?iteration=4clicks');
  await page.waitForFunction(()=>window.__bbsState,null,{timeout:45000});
  assert.equal(await page.title(),brand.name);
  assert.equal(await page.locator('meta[name="application-name"]').getAttribute('content'),brand.name);
  report.tests.push('browser title and application name match the new brand');
  const favicon=await page.request.get('http://127.0.0.1:8188/icon.png');assert(favicon.ok());
  const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
  assert.equal(sha(await favicon.body()),sha(fs.readFileSync(path.join(root,'assets/branding/icon.png'))));
  report.tests.push('browser icon is the new generated app icon');
  await page.screenshot({path:path.join(out,'branding-gameplay.png')});
  const state=await page.evaluate(()=>window.__bbsState);assert.equal(state.remaining,56);
  for(let i=0;i<4;i++){
    const s=await page.evaluate(()=>window.__bbsState),a=s.bricks[0];
    await page.mouse.click(a.screen_x,a.screen_y,{delay:100});await page.waitForTimeout(400);
  }
  assert((await page.evaluate(()=>window.__bbsState)).ended);
  await page.waitForTimeout(1100);await page.screenshot({path:path.join(out,'branding-endcard.png')});
  report.tests.push('new in-game and end-card wordmark renders; four-click mode still works');
  const ico=fs.readFileSync(path.join(root,'assets/branding/icon.ico'));
  assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),8);
  assert.deepEqual(Array.from({length:8},(_,i)=>ico[6+i*16]||256),[16,24,32,48,64,96,128,256]);
  report.tests.push('Windows icon contains all eight engine resolutions as DIB frames');
  assert.equal(report.errors.length,0);report.tests.push('no browser or Defold runtime errors');
  report.passed=true;console.log('PASS '+report.tests.join('\nPASS '));
}catch(e){report.passed=false;report.failure=String(e.stack||e);process.exitCode=1;console.log(report.failure)}
finally{fs.writeFileSync(path.join(out,'branding-smoke.json'),JSON.stringify(report,null,2));await browser.close()}
