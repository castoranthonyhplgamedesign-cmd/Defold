import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--mute-audio','--no-sandbox']});
const results=[];const errors=[];
for(const [w,h,d] of [[390,844,1],[844,390,1],[768,1024,1],[1024,768,1],[390,844,2]]){
 const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:d});const p=await context.newPage();p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(/ERROR:SCRIPT|ERROR:GUI/.test(m.text()))errors.push(m.text())});
 await p.goto('http://127.0.0.1:8171/Ring%20Sort/index.html?qa=1&variant=60sec');await p.waitForFunction(()=>window.PuzzleQA?.state()?.ready,{},{timeout:60000});await p.waitForTimeout(500);
 const measurement=await p.evaluate(async()=>{const times=[];let last=performance.now();await new Promise(resolve=>{function step(t){times.push(t-last);last=t;if(times.length>=61)resolve();else requestAnimationFrame(step);}requestAnimationFrame(step)});times.shift();times.sort((a,b)=>a-b);const c=document.getElementById('canvas');return {canvas:[c.width,c.height],fps:1000/(times.reduce((a,b)=>a+b,0)/times.length),p95ms:times[Math.floor(times.length*.95)],state:PuzzleQA.state()};});
 const pass=measurement.canvas[0]===w*d&&measurement.canvas[1]===h*d&&measurement.state.phase==='game';results.push({viewport:[w,h],dpr:d,pass,canvas:measurement.canvas,fps:measurement.fps,p95ms:measurement.p95ms});await p.screenshot({path:`qa/screenshots/defold-${w}x${h}-dpr${d}.png`});await context.close();console.log(JSON.stringify(results.at(-1)));
}
await browser.close();await writeFile('qa/viewport-results.json',JSON.stringify({results,errors},null,2));if(results.some(x=>!x.pass)||errors.length)process.exitCode=1;
