import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const delivered='D:/allproject/defold/output/MysteryMaster.html';const url='http://127.0.0.1:8175/MysteryMaster.html';
const bytes=await fs.readFile(delivered);assert.ok(bytes.length<5_000_000);assert.deepEqual(bytes,await fs.readFile('dist/index.html'));
const html=bytes.toString('utf8');assert.ok(html.includes('<title>Mystery Master</title>'));assert.ok(!/<script[^>]+src=|<link[^>]+href="(?!data:)/i.test(html));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const results=[],errors=[],unexpected=[];const viewport={width:390,height:844};
async function pageFor(target){const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!/^(data:|blob:|file:)/.test(r.url())&&!r.url().startsWith(url))unexpected.push(r.url());});await page.addInitScript(()=>{window.__redirects=[];window.open=(...args)=>window.__redirects.push(args);});await page.goto(target,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.__EGYPT_STATE__,{},{timeout:60000});return page;}
function point(page,x,y){const v=page.viewportSize(),s=Math.min(v.width/1080,v.height/1920);return{x:(v.width-1080*s)/2+x*s,y:(v.height-1920*s)/2+y*s};}
async function click(page,x,y){const p=point(page,x,y);await page.mouse.click(p.x,p.y,{delay:80});await page.waitForTimeout(100);}
async function check(name,callback){try{await callback();results.push({name,status:'PASS'});console.log('PASS '+name);}catch(error){results.push({name,status:'FAIL',error:String(error)});console.log('FAIL '+name+' '+error);}}
try{
await check('Selected reskin commit, six new portraits and matching source artwork',async()=>{const page=await pageFor(url);try{
  assert.equal(await page.evaluate(()=>GAME_SOURCE_BASELINE.branch),'reskin');
  assert.equal(await page.evaluate(()=>GAME_SOURCE_BASELINE.commit),'4ed0abc9fe3a3568e9d6557491a6029b47747ae5');
  const expected=['Tia','Nebet','Nakht','Merit','Huy','Senen'];assert.deepEqual(await page.evaluate(()=>Object.keys(EgyptBridge.config.DROP_POSITIONS)),expected);
  for(const [key,file] of Object.entries({'map-bg':'MapBG.webp','character-bg':'CharBG.webp','clue-bg':'ClueBG.webp',...Object.fromEntries(expected.map(name=>[name,'Characters/'+name+'.webp']))})){
    const actual=await page.evaluate(key=>__CHANGEABLE_ASSETS__[key].split(',')[1],key);assert.equal(actual,(await fs.readFile('qa/reskin-src/Assets/'+file)).toString('base64'),key);
  }
  assert.equal(await page.evaluate(()=>EgyptBridge.config.TUTORIAL.openingCharacter),'Senen');
}finally{await page.close();}});
await check('Copied file has embedded resources, correct filename, matching hash and size under 5 MB',async()=>{assert.equal(delivered.split('/').at(-1),'MysteryMaster.html');});
await check('MysteryMaster title, icon, heading, new logo and full puzzle completion',async()=>{const page=await pageFor(url);try{
  assert.equal(await page.title(),'Mystery Master');assert.equal(await page.evaluate(()=>EgyptBridge.config.CLUE_TITLE),'MYSTERY MASTER');assert.match(await page.locator('link[rel=icon]').getAttribute('href'),/^data:image\/png;base64,/);
  assert.equal(await page.evaluate(()=>EgyptBridge.audioState().decoded),11);
  const dims=await page.evaluate(async()=>{const image=new Image();image.src=__CHANGEABLE_ASSETS__.logo;await image.decode();return[image.naturalWidth,image.naturalHeight];});assert.deepEqual(dims,[1254,1254]);
  await click(page,540,50);await page.waitForTimeout(350);await page.screenshot({path:'qa/evidence/mystery-master-gameplay.png'});
  const names=['Tia','Nebet','Nakht','Merit','Huy','Senen'];
  for(let i=0;i<names.length;i++){const a=point(page,32+1016/6*(i+.5),1222.5),p=await page.evaluate(name=>EgyptBridge.config.DROP_POSITIONS[name],names[i]),b=point(page,p.x,p.y);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.waitForTimeout(80);await page.mouse.move(b.x,b.y,{steps:12});await page.waitForTimeout(80);await page.mouse.up();await page.waitForTimeout(350);}
  await page.waitForFunction(()=>__EGYPT_STATE__.endcard);assert.equal(await page.evaluate(()=>__EGYPT_STATE__.solved),6);await page.waitForTimeout(750);await page.screenshot({path:'qa/evidence/mystery-master-endcard.png'});
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>__EGYPT_STATE__.endcard),true);await page.screenshot({path:'qa/evidence/mystery-master-landscape.png'});
}finally{await page.close();}});
for(const [variant,count] of [['2clicks',2],['4clicks',4]])await check('Single-file '+variant+' variant',async()=>{const page=await pageFor(url+'?variant='+variant);try{for(let i=0;i<count;i++)await click(page,32+1016/6*(i+.5),1222.5);await page.waitForFunction(()=>__EGYPT_STATE__.endcard);assert.equal(await page.evaluate(()=>__EGYPT_STATE__.presses),count);}finally{await page.close();}});
await check('Direct file opening works without a web server or companion files',async()=>{const page=await pageFor(pathToFileURL(delivered).href+'?variant=2clicks');try{assert.equal(await page.title(),'Mystery Master');await click(page,116.6667,1222.5);await click(page,286,1222.5);await page.waitForFunction(()=>__EGYPT_STATE__.endcard);}finally{await page.close();}});
await check('No browser errors or external asset requests',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);});
}finally{await browser.close();}
const report={delivered,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,results,errors,unexpected};await fs.writeFile('qa/evidence/mystery-master-branding-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
