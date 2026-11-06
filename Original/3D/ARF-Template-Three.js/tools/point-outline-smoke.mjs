// Dedicated point-authoring regression. Requires the playable Vite server on :5181.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arrow-flow-simple-editor-v1')));
const at=(x,y)=>page.locator('#board').evaluate((svg,[x,y])=>{const p=new DOMPoint(x,-y).matrixTransform(svg.getScreenCTM());return [p.x,p.y];},[x,y]);
const click=async p=>page.mouse.click(...await at(...p));
const count=()=>page.locator('[data-outline-point]').count();
const folder='analysis/screenshots/point-outline';fs.mkdirSync(folder,{recursive:true});
try{
 await page.goto('http://127.0.0.1:5181/level-editor.html');await page.locator('#new-level').click();await page.locator('#rectangle').click();const before=await saved();
 await page.locator('#draw-outline').click();assert(await page.locator('#undo').isDisabled());
 await click([0,8.2]);await click([8.3,0]);assert.equal(await count(),2);
 await page.locator('#undo').click();assert.equal(await count(),1);await page.locator('#redo').click();assert.equal(await count(),2);
 await page.keyboard.press('Control+z');await page.keyboard.press('Control+y');assert.equal(await count(),2);
 // Dragging places just the released point, never a stream of intermediate corners.
 await page.mouse.move(...await at(2,-2));await page.mouse.down();await page.mouse.move(...await at(0,-8.2),{steps:30});assert.equal(await count(),2);await page.mouse.up();assert.equal(await count(),3);
 await page.keyboard.press('Backspace');assert.equal(await count(),2);await page.keyboard.press('Control+Shift+z');assert.equal(await count(),3);
 await page.locator('#undo').click();await click([0,-8.4]);assert(await page.locator('#redo').isDisabled());
 await click([-8.3,0]);assert.equal(await count(),4);assert.deepEqual(await saved(),before);
 await page.screenshot({path:`${folder}/01-diagonal-points.png`});
 // Close slightly off the center of the first point, within its visible hit circle.
 const first=await at(0,8.2);await page.mouse.click(first[0]+5,first[1]+3);
 assert.equal(await count(),0);assert.deepEqual((await saved()).conveyor.points,[[0,8.2],[8.3,0],[0,-8.4],[-8.3,0]]);
 const diamond=await saved();await page.locator('#undo').click();assert.deepEqual(await saved(),before);await page.locator('#redo').click();assert.deepEqual(await saved(),diamond);
 // Canceled pointers cannot add a point, and outline undo never eats board history.
 await page.locator('#draw-outline').click();await click([-7,-6]);await page.keyboard.press('Control+z');assert.equal(await count(),0);assert(await page.locator('#undo').isDisabled());assert.deepEqual(await saved(),diamond);
 await page.mouse.move(...await at(2,2));await page.mouse.down();await page.locator('#board').dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();assert.equal(await count(),0);
 await page.keyboard.press('Escape');
 // A crossed outline keeps the draft so Undo can correct it.
 await page.locator('#draw-outline').click();for(const p of [[-7,-6],[7,6],[-7,6],[7,-4]])await click(p);await page.locator('#finish-outline').click();
 assert.equal(await count(),4);assert.deepEqual(await saved(),diamond);assert.match(await page.locator('#outline-status').textContent(),/cross|area/);
 await page.screenshot({path:`${folder}/02-recoverable-error.png`});await page.locator('#undo').click();assert.equal(await count(),3);await page.keyboard.press('Escape');
 // Butterfly-like outline: diagonal wings and inward waist bends.
 const wings=[[-8,7],[-4,7],[0,4],[4,7],[8,7],[8,2],[4,0],[8,-2],[8,-7],[4,-7],[0,-4],[-4,-7],[-8,-7],[-8,-2],[-4,0],[-8,2]];
 await page.locator('#draw-outline').click();for(const p of wings)await click(p);await page.screenshot({path:`${folder}/03-wing-points.png`});await click(wings[0]);
 assert.equal(await count(),0);assert.deepEqual((await saved()).conveyor.points,wings);await page.screenshot({path:`${folder}/04-wing-conveyor.png`});
 await page.locator('[data-step="1"]').click();await page.mouse.move(...await at(-1,0));await page.mouse.down();await page.mouse.move(...await at(1,0),{steps:6});await page.mouse.up();
 await page.locator('[data-step="2"]').click();await click([8,4]);await page.locator('#play-test').click();
 const frame=page.frameLocator('#preview-frame iframe');await frame.locator('#game[data-level-ready="true"]').waitFor({timeout:30000});
 await page.screenshot({path:`${folder}/05-wing-play-test.png`});
 const point=await frame.locator('.tutorial-hand').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];});
 const box=await page.locator('#preview-frame iframe').boundingBox();await page.mouse.click(box.x+point[0],box.y+point[1]);await frame.locator('.endcard:not([hidden])').waitFor({timeout:20000});
 assert.deepEqual(errors,[]);fs.writeFileSync('analysis/evidence/point-outline-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,checks:['fractional diagonal points','point undo/redo buttons and keyboard','redo branch invalidation','one point per release instead of sampled drag','close using first-point hit circle','completed outline undo/redo','recoverable invalid draft','16-point concave wing outline','wing outline Three preview and native-input clear']},null,2));
 console.log('Point-outline browser checks passed.');
}finally{await browser.close();}
