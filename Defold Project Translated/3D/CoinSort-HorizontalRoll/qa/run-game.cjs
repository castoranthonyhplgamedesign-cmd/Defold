// Open the exact standalone export visibly and leave it available for play.
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(path.resolve(__dirname,'../../../../reference/BBS-Corners/node_modules/playwright'));
(async()=>{
  const browser=await chromium.launch({headless:false});
  const page=await browser.newPage({viewport:{width:480,height:850}});
  await page.goto(pathToFileURL('D:/allproject/defold/output/Token Roll.html').href);
  await page.waitForFunction(()=>window.__coinState?.render_frames>1,null,{timeout:60000});
  await page.bringToFront();
  console.log('Token Roll is running. Click the coins to start. Close the browser when finished.');
  await new Promise(resolve=>browser.on('disconnected',resolve));
})().catch(error=>{console.error(error);process.exitCode=1;});
