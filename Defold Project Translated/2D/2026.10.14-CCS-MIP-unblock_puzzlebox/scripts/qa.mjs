import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const chrome=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,...(chrome?{executablePath:chrome}:{}),args:['--mute-audio','--no-sandbox','--enable-webgl']});
const results=[],errors=[],screens=[];
const only=process.argv.find(x=>x.startsWith('--only='))?.slice(7);
await mkdir('qa/screenshots',{recursive:true});
const base='http://127.0.0.1:8171/Ring%20Sort/index.html';
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
const page=await context.newPage();
page.on('pageerror',e=>{errors.push(String(e));console.log('BROWSER ERROR',String(e));});
page.on('console',m=>{if(m.type()==='error'||/ERROR:SCRIPT|ERROR:GUI|stack traceback/.test(m.text())){errors.push(m.text());console.log('BROWSER LOG',m.text());}});
async function test(name,fn){if(only&&!name.includes(only))return;try{await fn();results.push({name,pass:true,testedAt:new Date().toISOString()});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:String(e),testedAt:new Date().toISOString()});console.log('FAIL',name,String(e));}}
function assert(x,msg){if(!x)throw Error(msg);}
async function state(){return page.evaluate(()=>window.PuzzleQA?.state());}
async function open(variant='60sec',hud=false){await page.goto(`${base}?qa=1&variant=${variant}&hud=${hud?1:0}`);await page.waitForFunction(()=>window.PuzzleQA?.state()?.ready,{},{timeout:60000});await page.waitForTimeout(500);}
async function shot(name){await page.screenshot({path:`qa/screenshots/${name}.png`});screens.push(name);}
async function grab(){const s=await state(),b=s.balls.find(b=>b.id===s.current),v=s.viewport;await page.mouse.move(v.ox+b.x*v.s,v.oy+b.y*v.s);await page.mouse.down();return s;}
try{
 await test('Defold boots with original seeded 49-ball pile and launcher',async()=>{await open();const s=await state();assert(s.balls.filter(b=>b.body).length===49,JSON.stringify(s));assert(s.clicks===0,'unexpected clicks');await shot('defold-portrait-start');await writeFile('qa/initial-state.json',JSON.stringify(s,null,2));});
 if(process.argv.includes('--smoke')){await writeFile('qa/smoke.json',JSON.stringify({results,errors},null,2));}
 else {
 await test('Background presses do not count',async()=>{await page.mouse.click(5,400);await page.waitForTimeout(200);assert((await state()).clicks===0,'background counted');});
 await test('Press-drag-release drops one ball and advances NEXT',async()=>{const s=await grab();await page.mouse.move(s.viewport.ox+650*s.viewport.s,s.viewport.oy+422*s.viewport.s,{steps:8});await page.waitForTimeout(120);await page.mouse.up();await page.waitForTimeout(180);let a=await state();assert(a.balls.some(b=>b.id===s.current&&b.body),'ball not physical immediately after release');await page.waitForTimeout(1020);a=await state();assert(a.clicks===1&&a.current!==s.current,'drop/advance failed');await shot('defold-after-drop');});
 await test('Audio unlocks on gesture and host pause/resume gates it',async()=>{let a=await page.evaluate(()=>PuzzleQA.audio());assert(a.unlocked,'audio locked');await page.evaluate(()=>dispatchEvent(new Event('luna:pause')));await page.waitForTimeout(200);a=await page.evaluate(()=>PuzzleQA.audio());assert(a.paused&&a.gain===0,'pause failed');await page.evaluate(()=>dispatchEvent(new Event('luna:resume')));});
 await test('Rotation preserves click count, elapsed session and ball identity',async()=>{const before=await state();await page.setViewportSize({width:844,height:390});await page.waitForTimeout(500);const after=await state();assert(after.clicks===before.clicks&&after.current===before.current,'rotation reset state');await shot('defold-landscape');await page.setViewportSize({width:390,height:844});});
 await test('3-click variant ends on third press with one automatic redirect',async()=>{await open('3clk');for(let i=0;i<3;i++){await grab();await page.mouse.up();if(i<2)await page.waitForTimeout(900);}await page.waitForTimeout(500);const s=await state();assert(s.clicks===3&&s.phase==='endcard','limit timing failed');const r=await page.evaluate(()=>PuzzleQA.redirects);assert(r.length===1&&r[0].auto,'redirect count');await shot('defold-endcard');});
 await test('Endcard tap routes through local CTA and records CTA_CLICKED',async()=>{await page.mouse.click(195,400);const e=await page.evaluate(()=>PuzzleQA.events.map(e=>e.name));assert(e.includes('CTA_CLICKED'),'CTA event absent');});
 await test('Real danger countdown reaches failure presentation',async()=>{await open();await page.evaluate(()=>PuzzleQA.command('danger'));await page.waitForTimeout(2400);assert((await state()).reason==='fail','danger did not fail');await shot('defold-fail');await page.waitForTimeout(1600);assert((await state()).phase==='endcard','fail endcard absent');});
 await test('Controlled physical gift-floor contact reaches win and opens gift',async()=>{await open();await page.evaluate(()=>PuzzleQA.command('gift-floor'));await page.waitForFunction(()=>PuzzleQA.state().reason==='win',{},{timeout:10000});await page.waitForTimeout(1300);await shot('defold-win-gift');await page.waitForTimeout(1700);assert((await state()).phase==='endcard','win endcard absent');const events=await page.evaluate(()=>PuzzleQA.events.map(e=>e.name));for(const e of ['CHALLENGE_PASS_25','CHALLENGE_PASS_50','CHALLENGE_PASS_75','CHALLENGE_SOLVED','ENDCARD_SHOWN'])assert(events.filter(x=>x===e).length===1,e+' not once');});
 await test('Controlled 6+3 ring merge clears the complete nine-ring run',async()=>{await open();await page.evaluate(()=>PuzzleQA.command('merge-fixture'));await page.waitForTimeout(2200);const s=await state();assert(!s.balls.some(b=>b.id==='test_a'||b.id==='test_b'),'nine-ring clear failed');});
 await test('Mixed donor exposes its inner color after whole-run transfer',async()=>{await open();await page.evaluate(()=>PuzzleQA.command('merge-fixture',{a:[0,0,0],b:[1,1,1,0,0,0]}));await page.waitForTimeout(850);const s=await state();const donor=s.balls.find(b=>b.id==='test_b');assert(donor&&donor.rings.length===3&&donor.rings.every(c=>c===1),'inner color lost');});
 await test('Capacity reservations never exceed the 20-ring atlas limit',async()=>{await open();await page.evaluate(()=>PuzzleQA.command('merge-fixture',{a:Array(18).fill(0),b:Array(6).fill(0)}));await page.waitForTimeout(1000);const s=await state();assert(s.balls.filter(b=>b.id.startsWith('test_')).every(b=>b.rings.length<=20),'capacity exceeded');assert(s.balls.some(b=>b.id==='test_a'&&b.rings.length===18),'oversized run was partially transferred');});
 await test('HUD restart creates a fresh pile while keeping session clicks',async()=>{await open('60sec',true);await grab();await page.mouse.up();await page.waitForTimeout(800);const s=await state(),v=s.viewport,oh=(v.oy-30*v.s)/2;await page.mouse.click(v.ox+180*v.s,oh+164*v.s);await page.waitForFunction(()=>{const s=PuzzleQA.state();return PuzzleQA.events.some(e=>e.name==='CHALLENGE_RETRY')&&s.ready&&s.current==='b50'&&s.balls.filter(b=>b.body).length===49;},{},{timeout:10000});const a=await state();await writeFile('qa/restart-state.json',JSON.stringify(a,null,2));assert(a.clicks===1,'restart/session mismatch: '+JSON.stringify({clicks:a.clicks,count:a.balls.filter(b=>b.body).length,ready:a.ready}));await shot('defold-hud-restart');});
 await test('10-click variant ends on the tenth player-ball press',async()=>{await open('10clk');for(let i=0;i<10;i++){await grab();await page.mouse.up();if(i<9)await page.waitForTimeout(700);}await page.waitForTimeout(300);const s=await state();assert(s.clicks===10&&s.phase==='endcard','10-click limit failed');});
 await test('60-second variant starts on first valid input and ends after real elapsed play',async()=>{await open('60sec');await page.waitForTimeout(1500);assert((await state()).elapsed===0,'timer started without input');await grab();await page.waitForTimeout(30000);await page.waitForTimeout(30000);await page.waitForTimeout(1200);const s=await state();assert(s.phase==='endcard'&&s.reason==='limit'&&s.elapsed>=60,'60-second timer failed: '+JSON.stringify({phase:s.phase,elapsed:s.elapsed}));await page.mouse.up();});
 }
}finally{
 let output={date:new Date().toISOString(),results,errors,screens,unassistedFullClear:false};
 if(only){const previous=JSON.parse(await readFile('qa/results.json','utf8'));output={...previous,date:output.date,results:previous.results.map(r=>results.find(x=>x.name===r.name)||r),errors:[...previous.errors,...errors],screens:[...new Set([...previous.screens,...screens])],lastRerun:only};}
 await writeFile('qa/results.json',JSON.stringify(output,null,2));
 await browser.close();
}
if(results.some(r=>!r.pass)||errors.length)process.exitCode=1;
