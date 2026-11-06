// Requires editor on :4181 and playable Vite on :5181. Both remain muted.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const folder='analysis/screenshots/editor';fs.mkdirSync(folder,{recursive:true});
const reference=JSON.parse(fs.readFileSync('examples/levels/reference.arrow-flow.json'));
const fixture=JSON.parse(fs.readFileSync('examples/levels/four-sides.arrow-flow.json'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const errors=[],external=[];
context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1'||u.protocol==='data:')return route.continue();external.push(u.href);return route.abort();});
const page=await context.newPage();page.on('dialog',d=>d.accept());
const input=value=>page.locator('#file').setInputFiles({name:'level.arrow-flow.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('point-out-editor-draft-v1')));
const download=async selector=>{const event=page.waitForEvent('download');await page.locator(selector).click();return JSON.parse(fs.readFileSync(await(await event).path(),'utf8'));};
const tick=ms=>new Promise(r=>setTimeout(r,ms));
try{
 await page.goto('http://127.0.0.1:4181');await page.locator('#canvas canvas').waitFor();
 await input(reference);assert.equal(await page.locator('#exportTarget').inputValue(),'arrow-flow');assert(await page.locator('#solve').isDisabled());
 assert.deepEqual(await download('#export'),reference);
 await page.locator('#flowWidth').fill('1.5');await page.locator('#flowDirection').selectOption('-1');await page.locator('#flowApplyTrack').click();
 assert.equal((await saved()).layout.arrowFlow.conveyor.width,1.5);
 await page.locator('#undo').click();assert.equal((await saved()).layout.arrowFlow.conveyor.width,1.3);
 await page.locator('#redo').click();assert.equal((await saved()).layout.arrowFlow.conveyor.direction,-1);
 await page.locator('#flowQueue').fill('green:9\npink:6');await page.locator('#flowApplyLane').click();
 assert.deepEqual((await saved()).layout.arrowFlow.cannons[0].queue,[{color:'green',ammo:9},{color:'pink',ammo:6}]);
 const project=await download('#saveProject');await input(project);assert.deepEqual((await saved()).layout.arrowFlow,project.layout.arrowFlow);
 const before=await saved();await input({...reference,version:99});assert.deepEqual((await saved()).layout,before.layout);
 await input(fixture);await page.locator('#flowTrack').click();await page.locator('#fit').click();
 const rect=await page.locator('#canvas canvas').boundingBox(),size=Math.min(70,(rect.width-60)/26.626,(rect.height-70)/26.626);
 const at=(x,y)=>[rect.x+rect.width/2+x*size,rect.y+rect.height/2-y*size];
 await page.mouse.move(...at(5,-5));await page.mouse.down();await page.mouse.move(...at(6,-5),{steps:10});await page.mouse.up();
 assert.deepEqual((await saved()).layout.arrowFlow.conveyor.points[0],[6,-5]);await page.locator('#undo').click();
 await page.locator('#flowAddLane').click();assert.equal((await saved()).layout.arrowFlow.cannons.length,5);await page.locator('#flowDeleteLane').click();assert.equal((await saved()).layout.arrowFlow.cannons.length,4);
 await page.locator('#toast.visible').waitFor({state:'hidden'});await page.screenshot({path:`${folder}/authoring.png`});
 await page.locator('#flowPreviewURL').fill('http://127.0.0.1:5181/editor-preview.html');
 const popupEvent=page.waitForEvent('popup');await page.locator('#flowPreview').click();const preview=await popupEvent;
 await preview.locator('#game[data-level-ready="true"]').waitFor({timeout:30000});assert.equal(await preview.locator('canvas').count(),1);
 for(const [width,height] of [[390,844],[844,390],[768,1024],[360,640]]){
  await preview.setViewportSize({width,height});await tick(350);
  const bar=await preview.locator('#preview-bar').boundingBox(),game=await preview.locator('#game').boundingBox();assert(Math.abs(bar.y+bar.height-game.y)<1,'Preview toolbar overlaps the game');
  for(const label of await preview.locator('.cannon-ammo:not([hidden]),.meter').all()){
   const b=await label.boundingBox();assert(b&&b.x>=0&&b.y>=76&&b.x+b.width<=width&&b.y+b.height<=height,`UI outside ${width}x${height}: ${JSON.stringify(b)}`);
  }
  const meter=await preview.locator('.meter').boundingBox();
  for(const label of await preview.locator('.cannon-ammo:not([hidden])').all()){const b=await label.boundingBox();assert(b.y+b.height<meter.y||b.x+b.width<meter.x||b.x>meter.x+meter.width,'Meter overlaps cannon ammo');}
  await preview.screenshot({path:`${folder}/four-sides-${width}x${height}.png`});
 }
 await preview.setViewportSize({width:390,height:844});await tick(300);
 // The real tutorial fingertip identifies a valid native tap without adding game debug globals.
 for(let i=0;i<4;i++){
  await preview.locator('.tutorial-hand:not([hidden])').waitFor({timeout:15000});
  const target=await preview.locator('.tutorial-hand').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];});
  await preview.mouse.click(...target);await tick(250);
 }
 await preview.locator('.endcard:not([hidden])').waitFor({timeout:15000});await preview.screenshot({path:`${folder}/four-sides-clear.png`});
 await preview.locator('#restart').click();await preview.locator('#game[data-level-ready="true"]').waitFor();assert.equal(await preview.locator('canvas').count(),1);assert(await preview.locator('.endcard').isHidden());
 assert.equal(await preview.locator('audio').count(),0);
 await preview.locator('#level-file').setInputFiles('examples/levels/reference.arrow-flow.json');
 await preview.waitForFunction(()=>document.getElementById('preview-status').textContent.includes('79 arrows'));
 await preview.screenshot({path:`${folder}/reference-custom-390x844.png`});
 assert.equal(await preview.locator('.cannon-ammo[data-lane]').count(),4);
 // Reloaded drafts retain Flow data and the old export profile still works.
 await page.reload();assert.equal(await page.locator('#exportTarget').inputValue(),'arrow-flow');
 await page.locator('#exportTarget').selectOption('general');assert(!await page.locator('#solve').isDisabled());assert(!await page.locator('#flowPanel').isVisible());
 const general=await download('#export');assert(!general.arrowFlow);assert.equal(general.arrows.length,4);
 await page.locator('#new').click();await page.locator('#exportTarget').selectOption('arrow-flow');
 await page.locator('#undo').click();assert.equal(await page.locator('#exportTarget').inputValue(),'general');
 await page.locator('#redo').click();assert.equal(await page.locator('#exportTarget').inputValue(),'arrow-flow');assert(await page.locator('#flowPanel').isVisible());
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync('analysis/evidence/editor-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,external,viewports:['390x844','844x390','768x1024','360x640'],checks:['reference export round-trip','undo/redo conveyor','queue edits','save/reload project','invalid import retains state','drag conveyor corner','add/delete lane','cross-port Three preview handshake','native taps clear four-sided level','restart retains one canvas','old general export']},null,2));
 console.log('Arrow Flow editor / Three preview browser checks passed.');
}finally{await browser.close();}
