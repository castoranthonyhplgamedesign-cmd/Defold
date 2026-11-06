/* Local browser QA uses real pointer input against the published Defold game.
   Read-only state snapshots are evidence, never a gameplay-control backdoor. */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const base='http://127.0.0.1:8174/dist/';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
const results=[];const errors=[];const requests=[];
const order=['Tia','Nebet','Nakht','Merit','Huy','Senen'];
const defaults=JSON.parse(await fs.readFile('config/defaults.json','utf8'));
async function test(name,callback) {
  if(process.env.EGYPT_QA_FILTER && !new RegExp(process.env.EGYPT_QA_FILTER).test(name))return;
  const start=Date.now();try {const detail=await callback();results.push({name,status:'PASS',ms:Date.now()-start,detail});console.log('PASS '+name);}
  catch(error){results.push({name,status:'FAIL',ms:Date.now()-start,error:String(error),stack:error.stack});console.log('FAIL '+name+' '+error);}
}
async function open({variant='full',viewport={width:390,height:844},overrides={HAND_TUTOR_MODE:false},network='local',url,deviceScaleFactor=1,hasTouch=false,legacyInflate=false}={}) {
  const page=await browser.newPage({viewport,deviceScaleFactor,hasTouch});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'||/ERROR:SCRIPT|ERROR:GUI|SCRIPT ERROR/.test(m.text())){errors.push(m.text());console.log('BROWSER '+m.text());}});
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:8174/'))requests.push(r.url());});
  await page.route('**/mraid.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
  await page.route('https://tpc.googlesyndication.com/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
  await page.addInitScript(({overrides,network,legacyInflate})=>{
    if(legacyInflate)window.DecompressionStream=undefined;
    window.__redirects=[];window.__lifecycle=[];
    window.open=url=>window.__redirects.push({route:'fallback',url});
    const record=(route,url)=>window.__redirects.push({route,url});
    window.gameStart=()=>window.__lifecycle.push('gameStart');window.gameEnd=()=>window.__lifecycle.push('gameEnd');window.gameClose=()=>window.__lifecycle.push('gameClose');window.gameReady=()=>window.__lifecycle.push('gameReady');
    const callbacks={};window.__mraidCallbacks=callbacks;
    const mraid={getState:()=> 'default',isViewable:()=>true,addEventListener:(name,cb)=>callbacks[name]=cb,open:url=>record('mraid',url)};
    if(['applovin','ironsource','unity'].includes(network))window.mraid=mraid;
    if(network==='google')window.ExitApi={exit:()=>record('google')};
    if(['facebook','moloco'].includes(network))window.FbPlayableAd={onCTAClick:()=>record(network)};
    if(network==='unity')window.Luna={Unity:{Playable:{InstallFullGame:()=>record('unity')}}};
    if(network==='mintegral')window.install=()=>record('mintegral');
    if(network==='vungle')window.addEventListener('message',e=>{if(e.data?.event==='download')record('vungle');});
    if(overrides)Object.defineProperty(window,'GAME_CONFIG',{configurable:true,get:()=>overrides,set:()=>{}});
  },{overrides,network,legacyInflate});
  try {
    await page.goto(url || base+'?variant='+variant,{waitUntil:'domcontentloaded',timeout:120000});
    await page.waitForFunction(()=>window.__EGYPT_STATE__,{},{timeout:90000});
  }catch(error){await page.close();throw error;}
  return page;
}
const state=page=>page.evaluate(()=>window.__EGYPT_STATE__);
const events=page=>page.evaluate(()=>window.EgyptBridge.events.map(e=>e.name));
function point(viewport,x,y) {const s=Math.min(viewport.width/1080,viewport.height/1920);return{x:(viewport.width-1080*s)/2+x*s,y:(viewport.height-1920*s)/2+y*s};}
async function click(page,x,y) {const p=point(page.viewportSize(),x,y);await page.mouse.click(p.x,p.y,{delay:80});}
async function drag(page,name,target) {
  const i=order.indexOf(name);const from=point(page.viewportSize(),32+(1080-64)/6*(i+.5),1222.5);
  const to=point(page.viewportSize(),target.x,target.y);
  await page.mouse.move(from.x,from.y);await page.mouse.down();await page.waitForTimeout(80);
  await page.mouse.move(to.x,to.y,{steps:12});await page.waitForTimeout(80);await page.mouse.up();await page.waitForTimeout(40);
}
await test('Static export contract: all 24 variants',async()=>{
  const manifest=JSON.parse(await fs.readFile('dist/build-manifest.json','utf8'));assert.equal(manifest.length,24);
  for(const item of manifest){
    const html=await fs.readFile('dist/'+item.path,'utf8');assert.ok(Buffer.byteLength(html)<5_000_000,item.path+' size');
    assert.ok(html.startsWith('<!DOCTYPE html>'));assert.ok(html.includes('name="network" content="'+item.network+'"'));
    assert.ok(!html.includes('type="module"'));assert.ok(!html.includes('crossorigin'));assert.ok(!html.includes('console.error'));assert.ok(!html.includes('XMLHttpRequest'));
    const config=html.split('/*__INLINE_GAME_CONFIG_START__*/')[1].split('/*__INLINE_GAME_CONFIG_END__*/')[0];assert.ok(config.length<100000);assert.ok(!/data:image|data:audio/.test(config));
    assert.equal((html.match(/src="mraid.js"/g)||[]).length,['applovin','ironsource','unity'].includes(item.network)?1:0);
    if(item.network==='google'){assert.ok(html.includes('https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js'));assert.ok(html.includes('window.ExitApi.exit()'));}
  }
  return {largest:Math.max(...manifest.map(x=>x.bytes))};
});
await test('Full gameplay: outside drop, wrong circle, six correct placements, analytics and CTA',async()=>{
  const page=await open();
  try {
    assert.equal(await page.evaluate(()=>window.EgyptBridge.audioState().decoded),11);
    assert.equal(await page.evaluate(()=>window.EgyptBridge.audioState().unlocked),false);
    await click(page,540,50);assert.equal((await state(page)).presses,0);
    await drag(page,'Tia',{x:540,y:600});await page.waitForTimeout(450);assert.equal((await state(page)).solved,0);assert.equal((await state(page)).presses,1);
    await drag(page,'Tia',defaults.DROP_POSITIONS.Nebet);await page.waitForTimeout(450);assert.equal((await state(page)).solved,0);
    await page.screenshot({path:'qa/evidence/wrong-drop.png'});
    for(const name of order){await drag(page,name,defaults.DROP_POSITIONS[name]);await page.waitForTimeout(350);assert.equal((await state(page)).placed[name],true,name);}
    await page.waitForFunction(()=>window.__EGYPT_STATE__.endcard);
    await page.waitForTimeout(700);await page.screenshot({path:'qa/evidence/full-completion.png'});
    const before=await state(page);assert.equal(before.solved,6);assert.equal(before.finished,true);
    const names=await events(page);
    for(const name of ['LOADING','LOADED','DISPLAYED','CHALLENGE_STARTED','CHALLENGE_PASS_25','CHALLENGE_PASS_50','CHALLENGE_PASS_75','CHALLENGE_SOLVED','ENDCARD_SHOWN','CTA_CLICKED'])assert.equal(names.filter(n=>n===name).length,1,name);
    assert.equal((await page.evaluate(()=>window.__redirects)).length,1);await click(page,540,960);
    assert.equal((await page.evaluate(()=>window.__redirects)).length,2);assert.equal((await events(page)).filter(n=>n==='CTA_CLICKED').length,1);
    return {state:before,events:names};
  }finally{await page.close();}
});
for(const [variant,count] of [['2clicks',2],['4clicks',4]])await test(variant+' counts only unsolved portrait presses',async()=>{
  const page=await open({variant});try{
    await click(page,540,50);assert.equal((await state(page)).presses,0);
    for(let i=1;i<=count;i++){await click(page,116.6667,1222.5);await page.waitForTimeout(380);assert.equal((await state(page)).presses,i);}
    const s=await state(page);assert.equal(s.endcard,true);assert.equal(s.solved,0);assert.ok(!(await events(page)).includes('CHALLENGE_SOLVED'));
    return s;
  }finally{await page.close();}
});
await test('Solved portraits do not count or drag',async()=>{
  const page=await open();try{await drag(page,'Tia',defaults.DROP_POSITIONS.Tia);await page.waitForTimeout(350);await click(page,260,350);assert.equal((await state(page)).presses,1);assert.equal((await state(page)).solved,1);}finally{await page.close();}
});
for(const viewport of [{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1024,height:768}])await test(`Visual reference and input ${viewport.width}x${viewport.height}`,async()=>{
  const page=await open({viewport});const reference=await browser.newPage({viewport,deviceScaleFactor:1});try{
    await page.mouse.click(4,4,{delay:80});await page.waitForTimeout(350);
    await page.screenshot({path:`qa/evidence/defold-${viewport.width}x${viewport.height}.png`});
    await reference.addInitScript(()=>{window.GAME_CONFIG={HAND_TUTOR_MODE:false,MUTE:true};});
    const ready=new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('Reference did not reach DISPLAYED')),60000);
      reference.on('console',message=>{if(message.text().includes('[Analytics] DISPLAYED')){clearTimeout(timeout);resolve();}});
    });
    await reference.goto('http://127.0.0.1:8176/');await ready;await reference.waitForTimeout(250);
    await reference.screenshot({path:`qa/evidence/reference-${viewport.width}x${viewport.height}.png`});
    await drag(page,'Senen',defaults.DROP_POSITIONS.Senen);await page.waitForTimeout(350);assert.equal((await state(page)).solved,1);
    return {viewport,canvas:await page.locator('canvas').evaluate(n=>({width:n.width,height:n.height}))};
  }finally{await page.close();await reference.close();}
});
await test('Opening and idle tutorials; pause/resume and mute',async()=>{
  const page=await open({overrides:null,network:'applovin'});try{
    assert.equal((await state(page)).tutorial,'opening');await page.screenshot({path:'qa/evidence/tutorial-opening.png'});
    await page.mouse.click(4,4,{delay:80});await page.waitForTimeout(400);assert.equal((await state(page)).tutorial,'hidden');
    await page.waitForTimeout(5100);assert.equal((await state(page)).tutorial,'idle');await page.screenshot({path:'qa/evidence/tutorial-idle.png'});
    await page.evaluate(()=>window.__mraidCallbacks.exposureChange(0));const elapsed=(await state(page)).elapsed;await page.waitForTimeout(400);assert.ok(Math.abs((await state(page)).elapsed-elapsed)<.06);
    await page.evaluate(()=>window.__mraidCallbacks.exposureChange(100));await page.waitForTimeout(300);assert.ok((await state(page)).elapsed>elapsed+.1);
    await page.evaluate(()=>window.__mraidCallbacks.audioVolumeChange(null));await page.evaluate(()=>window.__mraidCallbacks.audioVolumeChange(25));assert.equal(await page.evaluate(()=>window.EgyptBridge.audioState().volume),.25);
    await page.evaluate(()=>dispatchEvent(new Event('luna:mute')));assert.equal(await page.evaluate(()=>window.EgyptBridge.audioState().muted),true);
    await page.evaluate(()=>dispatchEvent(new Event('luna:unmute')));assert.equal(await page.evaluate(()=>window.EgyptBridge.audioState().muted),false);
  }finally{await page.close();}
});
await test('Rotation preserves solved state and active motion',async()=>{
  const page=await open();try{
    await drag(page,'Tia',defaults.DROP_POSITIONS.Tia);await page.setViewportSize({width:844,height:390});await page.waitForTimeout(350);
    assert.equal((await state(page)).solved,1);assert.equal((await state(page)).placed.Tia,true);assert.equal((await state(page)).positions.Tia.x,260);
    await drag(page,'Nebet',{x:540,y:500});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(450);assert.ok(Math.abs((await state(page)).positions.Nebet.y-1222.5)<1);
    await page.screenshot({path:'qa/evidence/rotation-preserved.png'});
  }finally{await page.close();}
});
await test('Config: dotted keys, deep merge, keyed slots and mute',async()=>{
  const page=await open({overrides:{'TUTORIAL_DELAY':12,'GAME_LENGTH.clickLimit':4,APP_LINKS:{app_store:'https://example.com/ios'},CHANGABLE_SOUNDTRACKS:[{id:'bgm',volume:.1}],MUTE:true,HAND_TUTOR_MODE:false}});try{
    const c=await page.evaluate(()=>window.EgyptBridge.config);assert.equal(c.TUTORIAL_DELAY,12);assert.equal(c.GAME_LENGTH.clickLimit,4);assert.equal(c.GAME_LENGTH.timeLimit,9999);assert.equal(c.APP_LINKS.google_play,defaults.APP_LINKS.google_play);assert.equal(c.CHANGABLE_SOUNDTRACKS.length,11);assert.equal(c.CHANGABLE_SOUNDTRACKS.find(x=>x.id==='bgm').volume,.1);
    await click(page,540,50);assert.equal(await page.evaluate(()=>window.EgyptBridge.audioState().muted),true);
  }finally{await page.close();}
});
await test('Rapid taps are preserved between rendered frames',async()=>{
  const page=await open({variant:'2clicks'});try{
    const a=point(page.viewportSize(),116.6667,1222.5),b=point(page.viewportSize(),286,1222.5);
    await page.mouse.click(a.x,a.y);await page.mouse.click(b.x,b.y);
    await page.waitForFunction(()=>window.__EGYPT_STATE__.endcard);assert.equal((await state(page)).presses,2);assert.equal((await state(page)).solved,0);
  }finally{await page.close();}
});
await test('GZip fallback starts without DecompressionStream',async()=>{
  const page=await open({legacyInflate:true});try{assert.equal((await state(page)).solved,0);await click(page,116.6667,1222.5);assert.equal((await state(page)).presses,1);}finally{await page.close();}
});
await test('Touch drag and high DPI input',async()=>{
  const page=await open({deviceScaleFactor:2,hasTouch:true});try{
    const cdp=await page.context().newCDPSession(page);const start=point(page.viewportSize(),116.6667,1222.5);const end=point(page.viewportSize(),260,350);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});await page.waitForTimeout(80);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[end]});await page.waitForTimeout(80);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(()=>window.__EGYPT_STATE__.solved===1);
    assert.equal((await state(page)).presses,1);await page.screenshot({path:'qa/evidence/touch-high-dpi.png'});
    return await page.locator('canvas').evaluate(n=>({width:n.width,height:n.height}));
  }finally{await page.close();}
});
await test('Keyed texture replacement loads and preserves gameplay identity',async()=>{
  const bytes=await fs.readFile('qa/reskin-src/Assets/Characters/Nebet.webp');
  const replacement='data:image/webp;base64,'+bytes.toString('base64');
  const page=await open({overrides:{HAND_TUTOR_MODE:false,CHANGABLE_TEXTURES:[{uuid:'Tia',path:replacement}]}});try{
    const config=await page.evaluate(()=>window.EgyptBridge.config);assert.equal(config.CHANGABLE_TEXTURES.length,13);assert.equal(config.CHANGABLE_TEXTURES.find(x=>x.uuid==='Tia').path,replacement);
    await page.screenshot({path:'qa/evidence/asset-swap.png'});await drag(page,'Tia',defaults.DROP_POSITIONS.Tia);await page.waitForFunction(()=>window.__EGYPT_STATE__.placed.Tia);assert.equal((await state(page)).solved,1);
  }finally{await page.close();}
});
await test('Rotate during opening tutorial and end-card entrance',async()=>{
  const page=await open({variant:'2clicks',overrides:null});try{
    await page.waitForTimeout(300);const before=(await state(page)).elapsed;await page.setViewportSize({width:844,height:390});await page.waitForTimeout(100);
    assert.equal((await state(page)).tutorial,'opening');assert.ok((await state(page)).elapsed>=before);
    await click(page,116.6667,1222.5);await click(page,286,1222.5);await page.waitForFunction(()=>window.__EGYPT_STATE__.endcard);
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(800);assert.equal((await state(page)).presses,2);assert.equal((await state(page)).endcard,true);
    await page.screenshot({path:'qa/evidence/rotated-endcard.png'});
  }finally{await page.close();}
});
await test('Desktop frame timing observation',async()=>{
  const page=await open();try{
    const timing=await page.evaluate(()=>new Promise(resolve=>{
      const intervals=[];let previous;function frame(time){if(previous!==undefined)intervals.push(time-previous);previous=time;if(intervals.length<120)requestAnimationFrame(frame);else{intervals.sort((a,b)=>a-b);resolve({frames:intervals.length,meanMs:intervals.reduce((a,b)=>a+b,0)/intervals.length,p95Ms:intervals[Math.floor(intervals.length*.95)],maxMs:intervals.at(-1),note:'Headless SwiftShader observation; not a physical-device performance certification'});}}requestAnimationFrame(frame);
    }));return timing;
  }finally{await page.close();}
});
for(const [tag,network,route] of [['al','applovin','mraid'],['gg','google','google'],['is','ironsource','mraid'],['mtg','mintegral','mintegral'],['fb','facebook','facebook'],['un','unity','unity'],['vu','vungle','vungle'],['mo','moloco','moloco']])await test('Published '+network+' SDK route',async()=>{
  const filename=`2clicks/cem_mip_grhpl_mystery-master_real_nougc_noseason_en_2clicks_na_${tag}.html`;
  const page=await open({network,url:base+filename});try{
    await click(page,116.6667,1222.5);await page.waitForTimeout(380);await click(page,116.6667,1222.5);await page.waitForTimeout(200);
    assert.equal((await state(page)).endcard,true);const redirects=await page.evaluate(()=>window.__redirects);assert.equal(redirects[0]?.route,route);
    return redirects;
  }finally{await page.close();}
});
await test('No browser errors or unexpected external asset requests',async()=>{assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.includes('tpc.googlesyndication.com')));return{errors,requests};});
await browser.close();
const report={date:new Date().toISOString(),environment:'Windows, headless Chrome with SwiftShader, audio muted',passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,results,errors,requests};
await fs.writeFile('qa/evidence/'+(process.env.EGYPT_QA_FILTER?'report-filtered.json':'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
