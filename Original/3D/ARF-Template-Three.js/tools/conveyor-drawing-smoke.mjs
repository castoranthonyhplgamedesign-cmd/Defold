// Requires local editor :4181 and playable :5181. All browser audio stays muted.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {cannonPose} from '../src/layout/arrowFlow.ts';
const fixture=JSON.parse(fs.readFileSync('examples/levels/inward-bend.arrow-flow.json'));
const rectangle=[[8,-8],[-8,-8],[-8,8],[8,8]],original=structuredClone(fixture);original.conveyor.points=rectangle;
const folder='analysis/screenshots/conveyor-drawing';fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];
context.on('page',page=>page.on('pageerror',e=>errors.push(e.message)));
const page=await context.newPage();page.on('dialog',d=>d.accept());
async function exportDoc(){const download=page.waitForEvent('download');await page.locator('#export').click();return JSON.parse(fs.readFileSync(await(await download).path()));}
async function clear(preview,mobile=false){
 await preview.clock.install();
 for(let i=0;i<3;i++){
  await preview.clock.runFor(5500);
  const point=await preview.locator('.tutorial-hand').evaluate(el=>{if(el.hidden)throw new Error('No free arrow hint');const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];});
  if(mobile)await preview.touchscreen.tap(...point);else await preview.mouse.click(...point);
  await preview.clock.runFor(250);
 }
 await preview.clock.runFor(18000);assert(await preview.locator('.endcard').isVisible());
}
try{
 await page.goto('http://127.0.0.1:4181');await page.locator('#canvas canvas').waitFor();
 await page.locator('#file').setInputFiles({name:'inward-bend.arrow-flow.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(original))});
 await page.locator('#fit').click();
 const r=await page.locator('#canvas canvas').boundingBox(),b=original.board.bounds;
 const all=[...rectangle,...original.cannons.map(c=>{const p=cannonPose(original,c).position;return [p[0],-p[2]];}),[b.minX,b.minY],[b.minX+b.width-1,b.minY+b.height-1]];
 const minX=Math.min(...all.map(p=>p[0]))-3,maxX=Math.max(...all.map(p=>p[0]))+3,minY=Math.min(...all.map(p=>p[1]))-3,maxY=Math.max(...all.map(p=>p[1]))+3;
 const size=Math.max(5,Math.min(70,(r.width-60)/(maxX-minX),(r.height-70)/(maxY-minY)));
 const at=p=>[r.x+r.width/2+(p[0]-(minX+maxX)/2)*size,r.y+r.height/2-(p[1]-(minY+maxY)/2)*size];
 await page.locator('#flowDraw').click();
 for(const p of fixture.conveyor.points.slice(0,3))await page.mouse.click(...at(p));
 await page.mouse.click(...at([-5,8]));await page.keyboard.press('Backspace');
 for(const p of fixture.conveyor.points.slice(3))await page.mouse.click(...at(p));
 await page.screenshot({path:`${folder}/drawing-draft.png`});
 await page.mouse.click(...at(fixture.conveyor.points[0]));
 assert.deepEqual(await exportDoc(),fixture);
 await page.locator('#undo').click();assert.deepEqual((await exportDoc()).conveyor.points,rectangle);
 await page.locator('#redo').click();assert.deepEqual((await exportDoc()).conveyor.points,fixture.conveyor.points);
 await page.locator('#flowDraw').click();await page.mouse.click(...at([7,-7]));await page.mouse.click(...at([-7,-7]));await page.keyboard.press('Escape');
 assert.deepEqual(await exportDoc(),fixture);
 await page.locator('#flowDraw').click();await page.mouse.move(...at([7,-7]));await page.mouse.down();await page.mouse.move(...at([-7,-7]),{steps:10});await page.keyboard.press('Escape');await page.mouse.move(...at([-7,7]),{steps:10});await page.mouse.up();assert(await page.locator('#flowCancel').isDisabled());assert.deepEqual(await exportDoc(),fixture);
 await page.locator('#flowDraw').click();for(const p of [[-7,-7],[7,7],[-7,7],[7,-7]])await page.mouse.click(...at(p));await page.keyboard.press('Enter');
 assert(await page.locator('#flowCancel').isEnabled(),'Invalid loop remains editable');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('point-out-editor-draft-v1')).layout.arrowFlow.conveyor.points),fixture.conveyor.points);
 await page.locator('#flowCancel').click();
 await page.locator('#flowDraw').click();await page.mouse.move(...at(rectangle[0]));await page.mouse.down();
 for(const p of [...rectangle.slice(1),rectangle[0]])await page.mouse.move(...at(p),{steps:32});await page.mouse.up();
 assert.deepEqual((await exportDoc()).conveyor.points,rectangle);await page.locator('#undo').click();
 await page.locator('#toast.visible').waitFor({state:'hidden'});await page.screenshot({path:`${folder}/drawn-inward-bend.png`});
 const popup=page.waitForEvent('popup');await page.locator('#flowPreview').click();const preview=await popup;
 await preview.locator('#game[data-level-ready="true"]').waitFor();
 for(const [width,height] of [[390,844],[844,390],[768,1024],[360,640]]){
  await preview.setViewportSize({width,height});await preview.waitForTimeout(300);await preview.screenshot({path:`${folder}/preview-${width}x${height}.png`});
 }
 await preview.setViewportSize({width:390,height:844});await clear(preview);await preview.screenshot({path:`${folder}/preview-clear.png`});
 await preview.close();
 const packaged=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const html=fs.readFileSync('dist/custom/inward-bend-arrow-flow-json/preview/index.html','utf8');
 await packaged.route('**/*',route=>route.request().url()==='https://drawn.invalid/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
 const touch=await packaged.newPage();touch.on('pageerror',e=>errors.push(e.message));
 await touch.goto('https://drawn.invalid/');await touch.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');await clear(touch,true);
 await touch.screenshot({path:`${folder}/packaged-touch-clear.png`});await packaged.close();
 assert.deepEqual(errors,[]);
 fs.writeFileSync('analysis/evidence/conveyor-drawing-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,checks:['clicked inward-bend outline closes at start','Backspace removes corner','one-step undo and redo','Escape cancels without replacing old belt','crossing rejection retains old belt and editable draft','continuous drag closes rectangle','drawn loop exports and opens actual Three preview','four preview sizes','mouse clear in preview','native touch clear in packaged concave level']},null,2));
 console.log('Conveyor drawing, concave preview and packaged touch clear passed.');
}finally{await browser.close();}
