import fs from 'node:fs';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const html=fs.readFileSync('dist/custom/arrow-grid-qa-arrow-flow-json/preview/index.html');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{const u=r.request().url();if(/^https?:/.test(u)&&!u.startsWith(url)){external.push(u);return r.abort();}return r.continue();});
try{
 for(const [width,height]of [[390,844],[844,390],[768,1024],[360,640]]){await page.setViewportSize({width,height});await page.goto(url);await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');await page.locator('.tutorial-hand').waitFor();await page.screenshot({path:`analysis/screenshots/arrow-grid/package-${width}x${height}.png`});}
 const point=await page.locator('.tutorial-hand').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];});await page.mouse.click(...point);await page.locator('.endcard:not([hidden])').waitFor({timeout:30000});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert(html.length<4_000_000);fs.writeFileSync('analysis/evidence/arrow-grid-package.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',bytes:html.length,errors,external,checks:['four viewport renders','native-input clear with .75 cell size','single-file preview below common byte ceiling']},null,2));console.log('Arrow grid packaged checks passed.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
