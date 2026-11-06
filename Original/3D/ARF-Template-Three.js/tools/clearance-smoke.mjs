import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {clearanceConflicts,requireClearance} from '../src/layout/visualClearance.ts';
const original=JSON.parse(fs.readFileSync('levels/untitled-level.arrow-flow.json')),draftFixture=JSON.parse(fs.readFileSync('analysis/artist-rescue/playable-qa.arrow-flow.json'));
draftFixture.board={bounds:{minX:-8,minY:22,width:1,height:1},grid:{size:.5,offset:[0,0]},arrows:[{id:'draft',color:'blue',head:[-8,22],body:[],facing:'Top'}]};
const sourceHash=()=>crypto.createHash('sha256').update(fs.readFileSync('levels/untitled-level.arrow-flow.json')).digest('hex'),hash=sourceHash();
assert.equal(original.board.arrows.length,59);assert.equal(original.board.grid.size,1.25);assert.equal(original.board.arrows.reduce((n,a)=>n+a.body.length+1,0),199);
assert.doesNotThrow(()=>requireClearance(original));assert(clearanceConflicts(draftFixture).length>0);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{const url=r.request().url();if(/^https?:/.test(url)&&!url.startsWith('http://127.0.0.1:5181/')){external.push(url);return r.abort();}return r.continue();});
const dir='analysis/screenshots/mockup-layout';fs.mkdirSync(dir,{recursive:true});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arrow-flow-simple-editor-v1')));
try{
 await page.goto('http://127.0.0.1:5181/level-editor.html');await page.locator('#level-file').setInputFiles({name:'draft.arrow-flow.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(draftFixture))});await page.locator('[data-step="1"]').click();
 assert.equal(await page.locator('[data-clearance="overlap"]').count(),clearanceConflicts(draftFixture).length);
 assert.equal(await page.locator('#export-level').innerText(),'Save draft');await page.screenshot({path:`${dir}/editor-warnings.png`});
 const draftDownload=page.waitForEvent('download');await page.locator('#export-level').click();const draft=await draftDownload;assert(draft.suggestedFilename().includes('.draft.'));assert.deepEqual(JSON.parse(fs.readFileSync(await draft.path())),draftFixture);
 await page.locator('#level-file').setInputFiles('levels/untitled-level.arrow-flow.json');await page.locator('#grid-size').fill('1.5');await page.locator('#grid-size').dispatchEvent('change');assert.deepEqual(await saved(),original);
 await page.locator('#level-name').fill('Retained draft');await page.locator('#level-name').dispatchEvent('change');await page.locator('#undo').click();assert.deepEqual(await saved(),original);await page.locator('#redo').click();assert.equal((await saved()).name,'Retained draft');
 await page.reload();assert.equal((await saved()).board.arrows.length,59);await page.locator('[data-step="1"]').click();assert.equal(await page.locator('[data-clearance="overlap"]').count(),clearanceConflicts(original).length);
 await page.locator('#level-file').setInputFiles('levels/untitled-level.arrow-flow.json');await page.locator('[data-step="1"]').click();assert.equal(await page.locator('[data-clearance="overlap"]').count(),0);assert.equal(await page.locator('[data-color="blue"]').evaluate(el=>getComputedStyle(el).getPropertyValue('--swatch').trim()),'#2cd8ed');await page.screenshot({path:`${dir}/editor.png`});
 const exportDownload=page.waitForEvent('download');await page.locator('#export-level').click();const exported=await exportDownload;assert(!exported.suggestedFilename().includes('.draft.'));assert.deepEqual(JSON.parse(fs.readFileSync(await exported.path())),original);
 await page.locator('#play-test').click();const frame=page.frameLocator('#preview-frame iframe');await frame.locator('#game[data-level-ready="true"]').waitFor({timeout:30000});await page.screenshot({path:`${dir}/preview.png`});
 for(const [width,height]of [[390,844],[844,390],[768,1024],[360,640]]){await page.setViewportSize({width,height});await page.screenshot({path:`${dir}/${width}x${height}.png`});}
 const point=await frame.locator('.tutorial-hand').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];}),box=await page.locator('#preview-frame iframe').boundingBox();await page.mouse.click(box.x+point[0],box.y+point[1]);await frame.locator('.tutorial-hand').waitFor({state:'hidden'});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(sourceHash(),hash);
 fs.writeFileSync('analysis/evidence/mockup-layout-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',sourceHash:hash,grid:original.board.grid,conflicts:0,errors,external,checks:['original 1.25 layout retained on import and reload','centers over artist geometry rejected','draft download preserves invalid drafts','unsafe grid adjustment rejected atomically','undo and redo','export preserves every original coordinate and queue','cyan editor swatch','four preview viewports','native arrow launch with recessed picking and adjusted tutorial']},null,2));console.log('Mockup layout editor checks passed.');
}finally{await browser.close();}
