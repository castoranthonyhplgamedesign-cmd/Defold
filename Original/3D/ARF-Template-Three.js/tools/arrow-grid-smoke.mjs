import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{const u=r.request().url();if(/^https?:/.test(u)&&!u.startsWith('http://127.0.0.1:5181/')){external.push(u);return r.abort();}return r.continue();});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arrow-flow-simple-editor-v1')));
const at=(x,y)=>page.locator('#board').evaluate((svg,[x,y])=>{const p=new DOMPoint(x,-y).matrixTransform(svg.getScreenCTM());return [p.x,p.y];},[x,y]);
const set=async(id,value)=>{await page.locator(id).fill(String(value));await page.locator(id).press('Tab');};
const load=async doc=>page.locator('#level-file').setInputFiles({name:'grid.arrow-flow.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
async function draw(a,b){await page.mouse.move(...await at(...a));await page.mouse.down();await page.mouse.move(...await at(...b),{steps:10});await page.mouse.up();}
async function clear(){
 await page.locator('#play-test').click();const frame=page.frameLocator('#preview-frame iframe');await frame.locator('#game[data-level-ready="true"]').waitFor({timeout:30000});
 const point=await frame.locator('.tutorial-hand').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];});const box=await page.locator('#preview-frame iframe').boundingBox();
 await page.screenshot({path:'analysis/screenshots/arrow-grid/preview.png'});await page.mouse.click(box.x+point[0],box.y+point[1]);await frame.locator('.endcard:not([hidden])').waitFor({timeout:30000});await page.locator('#close-preview').click();
}
try{
 fs.mkdirSync('analysis/screenshots/arrow-grid',{recursive:true});await page.goto('http://127.0.0.1:5181/level-editor.html');await page.locator('#new-level').click();await page.locator('[data-step="1"]').click();
 const count=async()=>Number((await page.locator('#grid-count').textContent()).match(/^\d+/)[0]);const initialCount=await count();
 await set('#grid-size',.75);assert((await count())>initialCount);await set('#grid-x',.3);await set('#grid-y',-.2);const empty=await saved();assert.deepEqual(empty.board.grid,{size:.75,offset:[.3,-.2]});
 assert.equal(await page.locator('#squares').getAttribute('x'),String(.3-.75/2));assert.equal(await page.locator('#squares').getAttribute('width'),'.75'.replace(/^\./,'0.'));
 await draw([-1.2,-.2],[.3,-.2]);let doc=await saved();assert.equal(doc.board.arrows.length,1);assert.deepEqual(doc.board.arrows[0].head,[0,0]);assert.deepEqual(doc.board.arrows[0].body,[[-1,0],[-2,0]]);
 await set('#grid-x',.8);assert.deepEqual((await saved()).board.arrows,doc.board.arrows);await page.locator('#undo').click();assert.deepEqual(await saved(),doc);await page.locator('#redo').click();assert.equal((await saved()).board.grid.offset[0],.8);
 await page.locator('#center-grid').click();const centered=await saved();assert.equal(centered.board.grid.size,.75);assert.deepEqual(centered.conveyor,doc.conveyor);await page.locator('#undo').click();assert.equal((await saved()).board.grid.offset[0],.8);await page.locator('#redo').click();
 const stable=await saved();await set('#grid-x',999);assert.deepEqual(await saved(),stable);await set('#grid-size',.1);assert.deepEqual(await saved(),stable);
 await page.screenshot({path:'analysis/screenshots/arrow-grid/editor.png'});
 await page.locator('[data-step="2"]').click();const top=Math.max(...stable.conveyor.points.map(p=>p[1]));await page.mouse.click(...await at(0,top+6));doc=await saved();assert.equal(doc.cannons.length,1);
 const download=page.waitForEvent('download');await page.locator('#export-level').click();assert.deepEqual(JSON.parse(fs.readFileSync(await(await download).path())),doc);await page.reload();await page.locator('#board').waitFor();assert.deepEqual(await saved(),doc);await load(doc);assert.deepEqual(await saved(),doc);
 fs.writeFileSync('analysis/evidence/arrow-grid-qa.arrow-flow.json',JSON.stringify(doc));await clear();
 await page.locator('[data-step="1"]').click();await set('#grid-size',1.5);await clear();
 const artist=JSON.parse(fs.readFileSync('analysis/artist-rescue/playable-qa.arrow-flow.json'));await load(artist);await page.locator('[data-step="1"]').click();await set('#grid-size',.5);await set('#grid-x',.4);const imported=await saved();assert.deepEqual(imported.conveyor,artist.conveyor);await page.screenshot({path:'analysis/screenshots/arrow-grid/artist.png'});await clear();
 await page.locator('[data-step="1"]').click();for(const [width,height]of [[390,844],[844,390],[768,1024],[360,640]]){await page.setViewportSize({width,height});await page.locator('#grid-size').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`analysis/screenshots/arrow-grid/${width}x${height}.png`});}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);fs.writeFileSync('analysis/evidence/arrow-grid-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,external,checks:['cell density and usable-cell count','cell centers align with visible grid','offset snapping and arrow drawing','existing arrows retain cell counts','center grid','undo/redo','invalid change preserves draft','export/import/reload','native input clear at .75 and 1.5 sizes','artist mesh preserved and clear at .5 size','four viewport layouts']},null,2));console.log('Arrow grid browser checks passed.');
}finally{await browser.close();}
