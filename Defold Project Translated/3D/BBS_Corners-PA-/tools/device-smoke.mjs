import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(path.resolve(root,'../../../reference/BBS-Corners/package.json'));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||/^ERROR:/.test(m.text()))errors.push(m.text())});
const out=path.join(root,'qa/artifacts');
const report={timestamp:new Date().toISOString(),tests:[]};
try{
  await page.goto('http://127.0.0.1:8188/?iteration=4clicks');
  await page.waitForFunction(()=>window.__bbsState,null,{timeout:45000});
  const cdp=await page.context().newCDPSession(page);
  for(let i=0;i<4;i++){
    const s=await page.evaluate(()=>window.__bbsState),a=s.bricks[0];
    const x=a.screen_x*390/s.width,y=a.screen_y*844/s.height;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await page.waitForTimeout(150);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(450);
  }
  const final=await page.evaluate(()=>window.__bbsState);
  assert.equal(final.clicks,4);assert(final.ended);report.tests.push('DPR 2 touch presses count once and reach four-click end card');
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(600);
  assert((await page.evaluate(()=>window.__bbsState)).ended);report.tests.push('rotating high-DPI end card preserves completed state');
  await page.screenshot({path:path.join(out,'touch-dpr2-landscape-endcard.png')});
  assert.equal(errors.length,0);report.tests.push('no mobile-emulation runtime errors');
  console.log('PASS '+report.tests.join('\nPASS '));
}catch(e){report.failure=String(e.stack||e);report.state=await page.evaluate(()=>window.__bbsState||null);console.log(report.failure);process.exitCode=1}
finally{report.errors=errors;fs.writeFileSync(path.join(out,'device-smoke.json'),JSON.stringify(report,null,2));await browser.close()}
