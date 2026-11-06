// Inspect the actual rendered output in a headed browser, including warnings.
const {chromium}=require('../../../..//reference/BBS-Corners/node_modules/playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:false,args:['--mute-audio']});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const logs=[],seen=new Set();
 page.on('console',m=>{if(!seen.has(m.text())){seen.add(m.text());logs.push({type:m.type(),text:m.text()});}});
 page.on('pageerror',e=>logs.push({type:'pageerror',text:e.stack}));
 try{
  await page.goto(pathToFileURL('D:/allproject/defold/output/Token Roll.html').href,{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>window.__coinState?.render_frames>1,null,{timeout:60000});
  await page.waitForTimeout(1500);
  await page.screenshot({path:'qa/visible-start.png'});
  await page.mouse.click(640,400,{delay:150});
  await page.waitForFunction(()=>window.__coinState?.phase==='playing',null,{timeout:15000});
  await page.waitForTimeout(500);
  await page.screenshot({path:'qa/visible-focus.png'});
  await fs.writeFile('qa/visible-probe.json',JSON.stringify({state:await page.evaluate(()=>window.__coinState),logs},null,2));
 }finally{await browser.close();}
 console.log(JSON.stringify(logs));
})().catch(e=>{console.error(e);process.exitCode=1;});
