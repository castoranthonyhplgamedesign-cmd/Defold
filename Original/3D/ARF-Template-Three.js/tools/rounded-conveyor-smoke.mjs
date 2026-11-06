import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const draft=JSON.parse(fs.readFileSync('examples/levels/artist-rounded.arrow-flow.json'));
const load=doc=>page.locator('#level-file').setInputFiles({name:'artist.arrow-flow.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arrow-flow-simple-editor-v1')));
const at=(x,y)=>page.locator('#board').evaluate((svg,[x,y])=>{const p=new DOMPoint(x,-y).matrixTransform(svg.getScreenCTM());return [p.x,p.y];},[x,y]);
try{
 await page.goto('http://127.0.0.1:5181/level-editor.html');await page.locator('summary').click();await page.locator('#load-artist').click();await page.locator('#belt-width:disabled').waitFor();assert.equal(await page.locator('[data-corner]').count(),0);assert.deepEqual(await saved(),draft);
 fs.mkdirSync('analysis/screenshots/artist-rounded',{recursive:true});await page.screenshot({path:'analysis/screenshots/artist-rounded/editor.png'});
 await page.locator('#rectangle').click();assert(!(await saved()).conveyor.mesh);await page.locator('#undo').click();assert.deepEqual(await saved(),draft);
 await page.locator('[data-step="1"]').click();await page.mouse.move(...await at(-2,0));await page.mouse.down();await page.mouse.move(...await at(0,0),{steps:8});await page.mouse.up();assert.equal((await saved()).board.arrows.length,1);
 await page.locator('[data-step="2"]').click();const top=Math.max(...draft.conveyor.points.map(p=>p[1]));await page.mouse.click(...await at(0,top));assert.equal((await saved()).cannons.length,1);
 const download=page.waitForEvent('download');await page.locator('#export-level').click();assert.deepEqual(JSON.parse(fs.readFileSync(await(await download).path())).conveyor.mesh,draft.conveyor.mesh);
 await page.reload();await page.locator('#board').waitFor();assert((await saved()).conveyor.mesh);await page.locator('#play-test').click();const frame=page.frameLocator('#preview-frame iframe');await frame.locator('#game[data-level-ready="true"]').waitFor({timeout:30000});
 await page.screenshot({path:'analysis/screenshots/artist-rounded/three-preview.png'});
 const point=await frame.locator('.tutorial-hand').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];});const box=await page.locator('#preview-frame iframe').boundingBox();await page.mouse.click(box.x+point[0],box.y+point[1]);await frame.locator('.endcard:not([hidden])').waitFor({timeout:25000});
 await page.locator('#close-preview').click();await page.locator('#preview-frame iframe').waitFor({state:'detached'});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'analysis/screenshots/artist-rounded/narrow.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);fs.writeFileSync('analysis/evidence/artist-rounded-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,checks:['original rounded mesh import','fixed artist geometry controls','preset replacement and undo restore mesh','arrow authoring','cannon placement','export buffer roundtrip','browser draft reload','native-input Three preview clear','narrow layout']},null,2));console.log('Artist rounded conveyor browser checks passed.');
}finally{await browser.close();}
