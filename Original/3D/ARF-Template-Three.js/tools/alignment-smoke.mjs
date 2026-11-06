// Local editor checks, with browser audio muted.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const at=(x,y)=>page.locator('#board').evaluate((svg,[x,y])=>{const p=new DOMPoint(x,-y).matrixTransform(svg.getScreenCTM());return [p.x,p.y];},[x,y]);
const click=async p=>page.mouse.click(...await at(...p));
const move=async p=>page.mouse.move(...await at(...p));
const points=()=>page.locator('[data-outline-point]>circle').evaluateAll(c=>c.map(e=>[Number(e.getAttribute('cx')),-Number(e.getAttribute('cy'))]));
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arrow-flow-simple-editor-v1')));
try{
 await page.goto('http://127.0.0.1:5181/level-editor.html');await page.locator('#new-level').click();await page.locator('#rectangle').click();await page.locator('#draw-outline').click();
 await click([-6,-6]);await move([5,-5.8]);assert.match(await page.locator('[data-alignment-guide]').textContent(),/Horizontal/);
 fs.mkdirSync('analysis/screenshots/alignment',{recursive:true});await page.screenshot({path:'analysis/screenshots/alignment/01-horizontal.png'});
 await click([5,-5.8]);assert.deepEqual((await points())[1],[5,-6]);await page.locator('#undo').click();
 await move([5,-5.8]);await page.keyboard.down('Alt');assert.equal(await page.locator('[data-alignment-guide]').count(),0);await click([5,-5.8]);await page.keyboard.up('Alt');assert.deepEqual((await points())[1],[5,-5.8]);await page.locator('#undo').click();
 await move([2,0]);await page.keyboard.down('Shift');assert.match(await page.locator('[data-alignment-guide]').textContent(),/45/);
 await page.screenshot({path:'analysis/screenshots/alignment/02-diagonal.png'});
 await click([2,0]);await page.keyboard.up('Shift');assert.deepEqual((await points())[1],[1,1]);await page.keyboard.press('Control+z');await page.keyboard.press('Control+Shift+z');assert.deepEqual((await points())[1],[1,1]);await page.keyboard.press('Escape');
 // Automatic alignment to both neighbors when moving a completed corner.
 await move([7,-7]);await page.mouse.down();await move([8,-6.8]);assert.match(await page.locator('[data-alignment-guide]').textContent(),/Horizontal/);await page.mouse.up();assert.deepEqual((await saved()).conveyor.points[0],[8,-7]);await page.locator('#undo').click();
 // Bypass on release must win even when the last move was snapped.
 await move([7,-7]);await page.mouse.down();await move([8,-6.8]);await page.keyboard.down('Alt');assert.equal(await page.locator('[data-alignment-guide]').count(),0);await page.mouse.up();await page.keyboard.up('Alt');assert.deepEqual((await saved()).conveyor.points[0],[8,-6.8]);await page.locator('#undo').click();
 await move([7,-7]);await page.mouse.down();await move([8,-5]);await page.keyboard.down('Shift');assert.match(await page.locator('[data-alignment-guide]').textContent(),/Vertical/);await page.mouse.up();await page.keyboard.up('Shift');assert.deepEqual((await saved()).conveyor.points[0],[7,-5]);await page.locator('#undo').click();
 // Cancel does not commit the snapped ghost or leave a guide behind.
 const before=await saved();await move([7,-7]);await page.mouse.down();await move([8,-6.8]);await page.keyboard.press('Escape');await page.mouse.up();assert.deepEqual(await saved(),before);assert.equal(await page.locator('[data-alignment-guide]').count(),0);
 assert.deepEqual(errors,[]);fs.writeFileSync('analysis/evidence/alignment-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,checks:['automatic horizontal snapping','live modifier guides without pointer movement','Alt bypass','Shift diagonal constraint','point undo/redo','neighbor alignment during corner drag','release-time bypass','corner Shift constraint','cancel preserves level']},null,2));console.log('Alignment browser checks passed.');
}finally{await browser.close();}
