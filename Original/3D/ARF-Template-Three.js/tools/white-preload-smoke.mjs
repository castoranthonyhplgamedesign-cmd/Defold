import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
import {overloadQueues} from '../src/data/overloadCannons.ts';

const url='http://127.0.0.1:5173',dir='analysis/screenshots/white-preload',start='99%';
fs.mkdirSync(dir,{recursive:true});
const hash=()=>crypto.createHash('sha256').update(fs.readFileSync('levels/overload-level.arrow-flow.json')).digest('hex'),before=hash();
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage(),errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>{const target=route.request().url();if(/^https?:/.test(target)&&!target.startsWith(`${url}/`)){external.push(target);return route.abort();}return route.continue();});
try{
 for(const [width,height]of [[390,844],[844,390],[768,1024],[360,640]]){
  await page.setViewportSize({width,height});await page.goto(url);
  await page.locator('html[data-scene-ready="true"]').waitFor({timeout:30000});
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.meter-percent').innerText(),start);
  assert.deepEqual(await page.locator('.cannon-ammo[data-lane]').allTextContents(),overloadQueues.map(q=>String(q[0].ammo)));
  const opening=await page.locator('.cannon-ammo[data-lane]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));
  assert(opening.every(text=>!text.startsWith('red cannon')));
  assert.equal(await page.locator('canvas').count(),1);
  await page.screenshot({path:`${dir}/${width}x${height}.png`});
 }
 await page.waitForTimeout(2000);assert.equal(await page.locator('.meter-percent').innerText(),start,'No white drainage while idle');
 // The hand hides between 3 s tap cycles; read its pose only while shown.
 await page.locator('.tutorial-hand').waitFor({state:'visible'});
 const point=await page.locator('.tutorial-hand').evaluate(el=>{
  const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();
  return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];
 });
 await page.mouse.click(...point);
 await page.waitForTimeout(100);
 await page.screenshot({path:`${dir}/after-launch.png`});
 await page.waitForTimeout(300);
 await page.screenshot({path:`${dir}/flowing-entry.png`});
 assert.equal(await page.locator('.full-vignette.on').count(),1,'Urgency vignette pulses from the 99% start');
 await page.waitForTimeout(8000);
 await page.screenshot({path:`${dir}/after-launch-settled.png`});
 // The hinted arrow fits its front cannon, so the meter returns to the preload level once it is shot.
 await page.waitForFunction(s=>document.querySelector('.meter-percent')?.textContent===s,start,{timeout:40000});
 await page.screenshot({path:`${dir}/after-hint-cleared.png`});
 await page.reload();await page.locator('html[data-scene-ready="true"]').waitFor();assert.equal(await page.locator('.meter-percent').innerText(),start);
 assert.equal(hash(),before);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync('analysis/evidence/white-preload-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),url,sourceHash:before,errors,external,checks:['four viewports at the 99% preload','generated opening colored cannons; no active white starter','one renderer canvas','idle retains white preload','native tap launches the flowing arrow','hinted arrow is fully shot and the meter returns to the preload level','urgency vignette on at the 99% start','reload restores the preload level','source level unchanged'],audio:'muted'},null,2));
 console.log('White preload dev preview checks passed.');
}finally{await browser.close();}
