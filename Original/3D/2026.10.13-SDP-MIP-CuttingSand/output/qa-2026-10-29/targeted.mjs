import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { launchBrowser, connect, openPage, sleep } from '../../scripts/qa/cdp.mjs';

const root = process.cwd();
const out = path.join(root, 'output/qa-2026-10-29');
const results = [];
const selected = process.argv[2] || '';
const resultFile = selected ? `targeted-${selected}.json` : 'targeted.json';
const defaults = { OPENING_GAMEPLAY_ANIMATION: false, GAME_LENGTH: { timeLimit: 9999, clickLimit: 9999 } };
const override = config => `Object.defineProperty(window,'GAME_CONFIG',{configurable:true,get:()=>(${JSON.stringify(config)}),set:()=>{}});`;
const mock = `window.__QA={opens:[],events:[]}; window.open=url=>{window.__QA.opens.push({url:String(url),at:performance.now()});return {}}; window.ALPlayableAnalytics={trackEvent:e=>window.__QA.events.push(e)};
const handlers={};window.mraid={getState:()=> 'default',isViewable:()=>true,addEventListener:(e,f)=>(handlers[e]??=[]).push(f),open:window.open,fire:(e,...a)=>(handlers[e]??[]).forEach(f=>f(...a))};`;
const captureAudio = `window.__SOURCES=[];const originalStart=AudioBufferSourceNode.prototype.start;const originalStop=AudioBufferSourceNode.prototype.stop;AudioBufferSourceNode.prototype.start=function(...a){const record={started:performance.now(),stopped:null,ended:null};this.__qaRecord=record;window.__SOURCES.push(record);this.addEventListener('ended',()=>record.ended=performance.now());return originalStart.apply(this,a)};AudioBufferSourceNode.prototype.stop=function(...a){if(this.__qaRecord)this.__qaRecord.stopped=performance.now();return originalStop.apply(this,a)};`;

async function withPage(label, config, preload, run, network='un') {
  if (selected && !label.includes(selected)) return;
  const browser = await launchBrowser();
  const cdp = await connect(browser.wsUrl);
  const timer = setTimeout(() => { console.error('Case timeout', label); cdp.close(); }, 60000);
  try {
    const dir = path.join(root, 'dist/cuttingsand_swipe/90seconds');
    const file = fs.readdirSync(dir).find(f=>f.endsWith(`_${network}.html`));
    const page = await openPage(cdp, {url:pathToFileURL(path.join(dir,file)).href,width:390,height:844,dpr:1,touch:true,preload:override({...defaults,...config})+preload});
    const result = await run(page,cdp);
    results.push({label,...result,errors:page.consoleErrors});
    console.log(JSON.stringify(results.at(-1)));
  } catch(error) {
    results.push({label,harnessError:error.stack}); console.log(JSON.stringify(results.at(-1)));
  } finally {clearTimeout(timer);cdp.close();await browser.close();fs.writeFileSync(path.join(out,resultFile),JSON.stringify(results,null,2));}
}

await withPage('overlapping pause sources and audio',{},mock+captureAudio,async page=>{
  await page.waitFor(s=>s.state==='play');
  await page.tapDesign(500,500);await sleep(300);
  const activeBefore=await page.evaluate('window.__SOURCES.filter(s=>!s.stopped&&!s.ended).length');
  await page.evaluate("window.dispatchEvent(new Event('luna:pause'))");await sleep(180);
  const a=await page.state();await sleep(350);const b=await page.state();
  const activeWhilePaused=await page.evaluate('window.__SOURCES.filter(s=>!s.stopped&&!s.ended).length');
  await page.evaluate("mraid.fire('audioVolumeChange',50)");await sleep(350);const c=await page.state();
  await page.evaluate("mraid.fire('exposureChange',0)");await sleep(180);const d=await page.state();
  await page.evaluate("window.dispatchEvent(new Event('luna:resume'))");await sleep(350);const e=await page.state();
  return {pauseFreezes:b.frame===a.frame,activeBefore,activeWhilePaused,volumeResumedPausedScene:c.frame>b.frame,frames:[a.frame,b.frame,c.frame,d.frame,e.frame],lunaResumeWhileUnexposed:e.frame>d.frame};
});

await withPage('SDK mute persistence',{},mock,async page=>{
  await page.waitFor(s=>s.state==='play');
  await page.evaluate("window.dispatchEvent(new Event('luna:mute'))");await sleep(150);const a=await page.state();
  await page.tapDesign(500,500);await sleep(150);const b=await page.state();
  await page.evaluate("window.dispatchEvent(new Event('luna:mute'))");await sleep(150);const c=await page.state();
  await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))");await sleep(150);
  await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))");await sleep(200);const d=await page.state();
  return {mutedBeforeGesture:a.muted,mutedAfterGesture:b.muted,mutedBeforeVisibility:c.muted,mutedAfterVisibility:d.muted};
});

await withPage('touch cancellation and DPR resize',{},mock,async(page,cdp)=>{
  let s=await page.waitFor(s=>s.state==='play'&&s.targets.swipe);const line=s.targets.swipe;
  const p=page.designToCss(line.x1,line.y1),q=page.designToCss(line.x2,line.y2);
  await page.pressCss(p.x,p.y);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(p.x+q.x)/2,y:(p.y+q.y)/2,id:1}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await sleep(200);const afterCancel=await page.state();
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:q.x,y:q.y});await sleep(200);const afterMove=await page.state();
  let next=afterMove.targets.swipe;await page.swipeDesign(next.x1,next.y1,next.x2,next.y2);await sleep(200);const afterNew=await page.state();
  const sizes=[];
  for(const [width,height,dpr]of [[844,390,2.625],[390,844,3],[600,600,1],[320,568,2],[390,844,1]]){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:true});await sleep(750);
    sizes.push(await page.evaluate(`(()=>{const c=document.querySelector('canvas'),r=c.getBoundingClientRect();return {expected:[${width},${height},${dpr}],css:[r.width,r.height],bitmap:[c.width,c.height]}})()`));
  }
  await page.screenshot(path.join(out,'targeted-portrait.png'));
  return {afterCancelCount:afterCancel.counted,afterMoveCount:afterMove.counted,newSwipeCount:afterNew.counted,newSwipeCuts:afterMove.remaining-afterNew.remaining,accounted:afterNew.accounted,total:afterNew.total,sizes};
});

await withPage('blocked automatic popup then next endcard tap',{GAME_LENGTH:{timeLimit:2,clickLimit:9999}},`window.__OPENS=[];window.open=url=>{window.__OPENS.push({at:performance.now(),url:String(url)});return window.__OPENS.length===1?null:{}};`,async page=>{
  await page.waitFor(s=>s.state==='play');await page.tapDesign(500,500);
  await page.waitFor(s=>s.state==='endcard',15000);await sleep(550);
  const before=await page.evaluate('window.__OPENS');await page.tapCss(195,700);await sleep(200);
  const after=await page.evaluate('window.__OPENS');return {before,after,opensFromOneTap:after.length-before.length};
},'fb');

await withPage('relative texture override',{CHANGABLE_TEXTURES:[{uuid:'ui-hand',path:'../../../Assets/Runtime/images/ui-hand.webp'}]},'',async page=>{
  await sleep(3500);return {state:await page.state(),bodyText:await page.evaluate('document.body.innerText')};
},'fb');
