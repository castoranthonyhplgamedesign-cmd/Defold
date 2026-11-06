import {chromium} from 'playwright';
import {readFile,writeFile,mkdir,copyFile,mkdtemp} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const metadata=JSON.parse(await readFile('qa/single-html-package.json','utf8'));
// A separate directory containing ONLY this HTML proves no sibling asset dependency.
const isolated=await mkdtemp(join(tmpdir(),'ring-sort-single-'));
const artifact=join(isolated,'Ring Sort.html');await copyFile(metadata.file,artifact);
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--mute-audio','--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},offline:true});
const page=await context.newPage(),errors=[],requests=[],results=[];
page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>{errors.push(String(e));console.log('ERROR',String(e))});page.on('console',m=>{if(m.type()==='error'||/ERROR:SCRIPT|ERROR:GUI/.test(m.text())){errors.push(m.text());console.log('LOG',m.text())}});
function assert(x,msg){if(!x)throw Error(msg);}
async function test(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:String(e)});console.log('FAIL',name,String(e));}}
async function state(){return page.evaluate(()=>PuzzleQA.state());}
try{
 await test('Single file boots offline in an otherwise empty folder',async()=>{await page.goto(pathToFileURL(artifact).href+'?qa=1&variant=3clk');await page.waitForFunction(()=>window.PuzzleQA?.state()?.ready,{},{timeout:60000});assert(await page.title()==='Ring Sort','wrong title');assert((await state()).balls.filter(b=>b.body).length===49,'pile not ready');await page.screenshot({path:'qa/screenshots/ring-sort-single-html-start.png'});});
 if(results[0].pass){
 await test('Offline input, physics, NEXT advancement and audio unlock work',async()=>{const s=await state(),b=s.balls.find(b=>b.id===s.current),v=s.viewport;await page.mouse.move(v.ox+b.x*v.s,v.oy+b.y*v.s);await page.mouse.down();await page.mouse.move(v.ox+650*v.s,v.oy+422*v.s,{steps:5});await page.waitForTimeout(100);await page.mouse.up();await page.waitForFunction(id=>PuzzleQA.state().ready&&PuzzleQA.state().current!==id,s.current);const a=await state();assert(a.clicks===1,'input count');assert(await page.evaluate(()=>PuzzleQA.audio().unlocked),'audio not unlocked');});
 await test('Offline end card uses Ring Sort branding and local CTA',async()=>{await page.evaluate(()=>PuzzleQA.command('limit'));await page.waitForFunction(()=>PuzzleQA.state().phase==='endcard');await page.waitForTimeout(500);await page.getByRole('button',{name:'Install Ring Sort'}).click();assert((await page.evaluate(()=>PuzzleQA.redirects.length))===2,'local CTA not intercepted');await page.screenshot({path:'qa/screenshots/ring-sort-single-html-endcard.png'});});
 await test('Single-file canvas rotates correctly',async()=>{await page.setViewportSize({width:844,height:390});await page.waitForTimeout(300);assert(await page.evaluate(()=>document.querySelector('canvas').width)===844,'canvas did not resize');await page.screenshot({path:'qa/screenshots/ring-sort-single-html-landscape.png'});});
 }
 await test('No network or sibling file requests',async()=>{const nonDocument=requests.filter(u=>!u.startsWith('data:')&&!u.startsWith('blob:')&&new URL(u).pathname!==new URL(pathToFileURL(artifact).href).pathname);assert(nonDocument.length===0,JSON.stringify(nonDocument));});
}finally{await writeFile('qa/single-html-results.json',JSON.stringify({date:new Date().toISOString(),testedFile:metadata.file,isolatedDirectory:isolated,offline:true,results,errors,requests},null,2));await browser.close();}
if(results.some(r=>!r.pass)||errors.length)process.exitCode=1;
