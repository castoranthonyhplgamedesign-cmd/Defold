import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const fixture=JSON.parse(fs.readFileSync('examples/levels/four-sides.arrow-flow.json'));
fixture.board.arrows.forEach(a=>a.color='green');fixture.cannons=[];
const load=doc=>page.locator('#level-file').setInputFiles({name:'ammo.arrow-flow.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
const row=color=>page.locator(`[data-ammo-color="${color}"]`).locator('td').allTextContents();
async function ammo(index,value){const input=page.locator(`[data-queue-ammo="${index}"]`);await input.fill(String(value));await input.press('Tab');}
try{
 await page.goto('http://127.0.0.1:5181/level-editor.html');await load(fixture);await page.locator('[data-step="2"]').click();
 assert.deepEqual(await row('green'),['8','0','8 short']);
 assert.equal(await page.locator('#ammo-summary').evaluate(e=>getComputedStyle(e).borderCollapse),'collapse');
 assert.equal(await page.locator('#ammo-summary caption').evaluate(e=>getComputedStyle(e).position),'absolute');
 const point=await page.locator('#board').evaluate(svg=>{const p=new DOMPoint(0,5).matrixTransform(svg.getScreenCTM());return [p.x,p.y];});await page.mouse.click(...point);
 assert.deepEqual(await row('green'),['8','8','Exact']);await page.locator('#add-replacement').click();assert.deepEqual(await row('green'),['8','16','8 extra']);
 await page.locator('[data-queue-color="1"]').selectOption('blue');await ammo(1,3);await ammo(0,5);
 assert.deepEqual(await row('green'),['8','5','3 short']);assert.deepEqual(await row('blue'),['0','3','3 extra']);
 assert.deepEqual(await page.locator('#ammo-summary tfoot td').allTextContents(),['8','8','3 short'],'Extra shots of another color must not hide a shortage');
 await page.locator('#undo').click();assert.deepEqual(await row('green'),['8','8','Exact']);await page.locator('#redo').click();assert.deepEqual(await row('green'),['8','5','3 short']);
 await ammo(0,0);assert.deepEqual(await row('green'),['8','5','3 short'],'Rejected input preserves summary');
 await page.locator('[data-remove="1"]').click();assert.equal(await page.locator('[data-ammo-color="blue"]').count(),0);
 await page.locator('#delete-cannon').click();assert.deepEqual(await row('green'),['8','0','8 short']);
 await load(JSON.parse(fs.readFileSync('examples/levels/reference.arrow-flow.json')));await page.locator('[data-step="2"]').click();
 await page.locator('#message.visible').waitFor({state:'hidden'});
 fs.mkdirSync('analysis/screenshots/ammo-summary',{recursive:true});await page.screenshot({path:'analysis/screenshots/ammo-summary/desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('#ammo-summary').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'analysis/screenshots/ammo-summary/narrow.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync('analysis/evidence/ammo-summary-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,checks:['head and tail totals','all queue rows included','live color and ammo edits','missing vs excess by color','undo/redo','rejected edit preserves totals','lane and queue removal','reference table','narrow viewport']},null,2));console.log('Ammo summary browser checks passed.');
}finally{await browser.close();}
