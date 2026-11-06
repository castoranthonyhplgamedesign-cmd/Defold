import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {hintPoint} from './gameplay-points.mjs';

const root='http://127.0.0.1:5173';
const production=fs.readFileSync('dist/index.html','utf8');
assert(!/\.get\(["']variant["']\)/.test(production),'URL selector must be stripped from production');
assert(!/["'](?:3clicks|10clicks|90sec)["']/.test(production),'Dev presets must be stripped from production');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const results=[],errors=[];
try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.routeWebSocket('**',socket=>socket.close());
  await page.route('**/*',r=>/^https?:/.test(r.request().url())&&!r.request().url().startsWith(root+'/')?r.abort():r.continue());
  await page.route('**/src/main.ts*',async route=>{
    const response=await route.fetch(),source=await response.text();assert(source.includes('view.setHostPaused(hostPaused);'));
    await route.fulfill({response,body:source.replace('view.setHostPaused(hostPaused);','window.variantSession=session;view.setHostPaused(hostPaused);')});
  });
  for(const [variant,duration,tapLimit] of [['',60,'none'],['3clicks','unlimited',3],['10clicks','unlimited',10],['60sec',60,'none'],['90sec',90,'none'],['60seconds',60,'none'],['90seconds',90,'none'],['invalid',60,'none']]){
    await page.goto(`${root}/?variant=${variant}`);
    await page.locator('html[data-scene-ready="true"]').waitFor();
    const state=await page.evaluate(()=>({duration:Number.isFinite(variantSession.remaining)?variantSession.remaining:'unlimited',tapLimit:Number.isFinite(variantSession.tapLimit)?variantSession.tapLimit:'none',started:variantSession.started,taps:variantSession.taps}));
    assert.deepEqual(state,{duration,tapLimit,started:false,taps:0});
    if(variant==='3clicks'||variant==='90sec'){
      await page.mouse.move(...await hintPoint(page));await page.mouse.down();
      assert.equal(await page.evaluate(()=>variantSession.taps),1);
      await page.mouse.up();assert.equal(await page.evaluate(()=>variantSession.taps),1);
      assert.equal(await page.evaluate(()=>variantSession.started),true);
      if(variant==='90sec')await page.waitForFunction(()=>variantSession.remaining<90);
    }
    results.push({variant:variant||'(default)',...state});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('analysis/evidence/dev-url-variants.json',JSON.stringify({at:new Date().toISOString(),muted:true,productionSelectorRemoved:true,results,errors},null,2));
  console.log(JSON.stringify(results));
}finally{await browser.close();}
