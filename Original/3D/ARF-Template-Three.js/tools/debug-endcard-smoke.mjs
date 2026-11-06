import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const html=fs.readFileSync('analysis/build/debug-shortcut-build/index.html','utf8');
assert(!html.includes('KeyE'),'Development shortcut must be removed from the production bundle');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[];
try{
  for(const development of [true,false]){
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    await context.addInitScript(()=>{window.destinations=[];window.open=(...args)=>{window.destinations.push(args);return null;};});
    await context.route('**/*',route=>{
      const url=route.request().url();
      if(development&&url.startsWith('http://127.0.0.1:5173/'))return route.continue();
      if(!development&&url==='https://preview.invalid/')return route.fulfill({contentType:'text/html',body:html});
      return route.abort();
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(development?'http://127.0.0.1:5173/':'https://preview.invalid/');
    await page.locator('html[data-scene-ready="true"]').waitFor();
    if(development){
      await page.evaluate(()=>{const input=document.createElement('input');input.id='fixture-input';document.body.append(input);input.focus();});
      await page.keyboard.press('Shift+KeyE');assert.equal(await page.locator('.endcard').isVisible(),false,'Typing must not trigger the shortcut');
      await page.evaluate(()=>document.querySelector('#fixture-input').remove());
      await page.keyboard.press('KeyE');assert.equal(await page.locator('.endcard').isVisible(),false,'Shortcut requires Shift');
    }
    await page.keyboard.press('Shift+KeyE');
    if(development)await page.locator('.endcard:not([hidden])').waitFor({timeout:1500});
    else {await page.waitForTimeout(250);assert.equal(await page.locator('.endcard').isVisible(),false);}
    assert.equal(await page.evaluate(()=>window.destinations.length),0,'Shortcut must not open the store');
    if(development){
      await page.keyboard.press('Shift+KeyE');assert.equal(await page.locator('.endcard').count(),1);
      fs.mkdirSync('analysis/screenshots/debug-endcard',{recursive:true});
      await page.screenshot({path:'analysis/screenshots/debug-endcard/shortcut.png'});
      await page.locator('.end-icon').click();assert.equal(await page.evaluate(()=>window.destinations.length),1,'Deliberate CTA still works');
    }
    await context.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('analysis/evidence/debug-endcard-shortcut.json',JSON.stringify({at:new Date().toISOString(),shortcut:'Shift+E',checks:['dev shortcut shows endcard before first launch','typing ignored','Shift required','no automatic store open','repeat is harmless','deliberate CTA works','production shortcut removed and inactive'],errors},null,2));
  console.log('Development endcard shortcut and production exclusion passed.');
}finally{await browser.close();}
