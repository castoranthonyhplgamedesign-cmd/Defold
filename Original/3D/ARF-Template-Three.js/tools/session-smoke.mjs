import {gameplayPoints} from './gameplay-points.mjs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'ts',contents:`
import {Simulation} from './src/core/simulation';
import {Session} from './src/core/session';
import {ConveyorPath} from './src/core/path';
import {createScene} from './src/render/scene';
import {bindTaps} from './src/input/taps';
import {createNetwork} from './src/networks';
import level from './src/data/level.json';import path from './src/data/path.json';
const simulation=new Simulation(level.arrows,new ConveyorPath(path),level.shooters);
const session=new Session(simulation);window.fixture=session;
window.destinations=[];window.open=(...args)=>{window.destinations.push(args);return null;};
createScene(document.getElementById('game'),simulation,session,createNetwork('preview').triggerCTA).then(view=>{
bindTaps(view.canvas,view.pick,id=>session.launch(id));window.fixtureView=view;document.documentElement.dataset.sceneReady='true';
});
`},bundle:true,format:'iife',write:false,loader:{'.bin':'dataurl','.webp':'dataurl'}});
const css=fs.readFileSync('src/style.css','utf8').replace('./assets/ui/LilitaOne-Regular.ttf',`data:font/ttf;base64,${fs.readFileSync('src/assets/ui/LilitaOne-Regular.ttf').toString('base64')}`);
const html=`<html><head><style>${css}</style></head><body><main id="game"></main><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body></html>`;
fs.mkdirSync('analysis/screenshots/milestone-4',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--disable-background-networking']});
const errors=[],requests=[],captures=[],logoSizes=[];
try {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'});
  await context.addInitScript(()=>{
    window.draws=0;
    for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
      const draw=WebGL2RenderingContext.prototype[name];
      WebGL2RenderingContext.prototype[name]=function(...args){window.draws++;return draw.apply(this,args);};
    }
  });
  await context.route('**/*',route=>{const url=route.request().url();requests.push(url);return url==='https://fixture.invalid/'?route.fulfill({contentType:'text/html',body:html}):route.abort();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('https://fixture.invalid/');await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');await page.evaluate(()=>document.fonts.ready);const point=await gameplayPoints(page);
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.mouse.click(...point(44,264));await page.clock.runFor(1000);
  assert.equal(await page.evaluate(()=>window.fixture.remaining),60);
  await page.mouse.click(...point(145,191));await page.clock.runFor(100);
  assert.equal(await page.locator('.tutorial-hand').isVisible(),false);
  await page.clock.runFor(5100);assert.equal(await page.locator('.tutorial-hand').isVisible(),true);
  await page.screenshot({path:'analysis/screenshots/milestone-4/idle-hint-5200ms.png'});
  const frozen=await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));return window.fixture.remaining;});
  await page.clock.runFor(2000);assert.equal(await page.evaluate(()=>window.fixture.remaining),frozen);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));window.fixture.remaining=.2;});
  // .2 s of countdown, then the endcard waits sessionTuning.endcardDelay for the lane doors.
  await page.clock.runFor(1500);
  assert.equal(await page.evaluate(()=>window.fixture.ended),'timeout');assert.equal(await page.locator('.endcard').isVisible(),true);
  const pop=await page.locator('.end-icon img').evaluate(img=>{
    const animation=img.getAnimations()[0];if(!animation)return null;
    animation.pause();const duration=animation.effect.getTiming().duration;
    const samples=[0,duration*.65,duration].map(time=>{animation.currentTime=time;const style=getComputedStyle(img);return {scale:new DOMMatrix(style.transform).a,opacity:Number(style.opacity)};});
    animation.finish();return {samples,iterations:animation.effect.getTiming().iterations,duration};
  });
  assert(pop&&pop.iterations===1);assert(pop.samples[0].scale<1&&pop.samples[0].opacity===0);
  assert(pop.samples[1].scale>1&&pop.samples[1].opacity===1,'Logo briefly overshoots');
  assert.equal(pop.samples[2].scale,1);assert.equal(pop.samples[2].opacity,1);
  const logoPose=()=>page.locator('.end-icon').evaluate(el=>({box:el.getBoundingClientRect().toJSON(),transform:getComputedStyle(el.parentElement).transform,opacity:getComputedStyle(el.parentElement).opacity}));
  const staticLogo=await logoPose();
  const endcardDraws=await page.evaluate(()=>window.draws);
  for(const elapsed of [100,500,1400]){await page.clock.runFor(elapsed);assert.deepEqual(await logoPose(),staticLogo,'Endcard logo stays still after reveal');}
  assert.equal(await page.evaluate(()=>window.draws),endcardDraws,'Static endcard does not keep rendering the 3D scene');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.end-icon img').evaluate(img=>getComputedStyle(img).animationName),'none');
  assert.equal(await page.evaluate(()=>window.destinations.length),0);
  assert.equal(await page.evaluate(()=>window.fixtureView.pick(145,191)),null);
  const rotationSizes=new Map();let ctaCount=0;
  for(const [width,height] of [[320,568],[568,320],[360,640],[640,360],[390,844],[844,390],[430,932],[932,430],[768,1024],[1024,768],[820,1180],[1180,820],[1024,1366],[1366,1024]]) {
    await page.setViewportSize({width,height});await page.waitForTimeout(100);await page.clock.runFor(700);
    for(const selector of ['.end-icon']) {
      const box=await page.locator(selector).boundingBox();assert(box && box.x>=0 && box.y>=0 && box.x+box.width<=width && box.y+box.height<=height,`${selector} fits ${width}x${height}: ${JSON.stringify(box)}`);
      const title=await page.locator('.end-title').boundingBox();assert(title);
      assert(title.x>=0&&title.y>=0&&title.x+title.width<=width&&title.y+title.height<box.y,'Title fits above the icon');
      assert(Math.abs(title.width/box.width-.75)<.001,'Title matches the supplied relative width');
      assert(Math.abs(title.width/title.height-315/190)<.001,'Title keeps its asset aspect ratio');
      assert(Math.abs(box.x+box.width/2-width/2)<.1&&Math.abs(title.x+title.width/2-width/2)<.1,'Title and icon stay horizontally centered');
      assert(Math.abs((title.y+box.y+box.height)/2-height/2)<.1,'Complete title/icon stack stays vertically centered');
      assert(Math.abs(box.width-box.height)<.1,'Logo retains its square aspect ratio');
      const shorter=Math.min(width,height),key=[width,height].sort((a,b)=>a-b).join('x');
      const stackRatio=(box.y+box.height-title.y)/height;
      assert(box.width>=44&&box.width<shorter*.7,'Logo remains usable and leaves space around it');
      const dimensions=[box.width,box.height,title.width,title.height];
      if(rotationSizes.has(key))dimensions.forEach((value,index)=>assert(Math.abs(value-rotationSizes.get(key)[index])<.1,'Title and logo must not shrink on rotation'));
      rotationSizes.set(key,dimensions);logoSizes.push({width,height,logoWidth:box.width,logoHeight:box.height,titleWidth:title.width,stackHeightRatio:stackRatio});
    }
    const titleBox=await page.locator('.end-title').boundingBox();
    for(const [x,y] of [[5,5],[width-5,5],[5,height-5],[width-5,height-5],[titleBox.x+titleBox.width/2,titleBox.y+titleBox.height/2]]){
      await page.mouse.click(x,y);assert.equal(await page.evaluate(()=>window.destinations.length),++ctaCount,'One destination per full-screen click');
    }
    await page.locator('.end-icon').click();assert.equal(await page.evaluate(()=>window.destinations.length),++ctaCount,'Logo must not double-dispatch');
    for(let tap=0;tap<2;tap++){await page.touchscreen.tap(10,10);assert.equal(await page.evaluate(()=>window.destinations.length),++ctaCount,'Repeated taps remain enabled');}
    const file=`analysis/screenshots/milestone-4/endcard-${width}x${height}.png`;await page.screenshot({path:file});captures.push(file);
  }
  await page.mouse.click(5,5);assert.equal(await page.evaluate(()=>window.destinations.length),++ctaCount);
  await page.locator('.end-icon').click();
  assert.equal(await page.evaluate(()=>window.destinations.length),++ctaCount);
  await page.locator('.end-icon').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.destinations.length),++ctaCount);
  await page.evaluate(()=>{window.mraid={getState:()=> 'loading'};});await page.locator('.end-icon').click();assert.equal(await page.evaluate(()=>window.destinations.length),ctaCount);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,['https://fixture.invalid/']);
  fs.writeFileSync('analysis/evidence/milestone-4-session-browser.json',JSON.stringify({testedAt:new Date().toISOString(),browser:browser.version(),fixture:'Real modules; remaining time shortened to 0.2 seconds after verifying start, idle hint and pause. Store window stubbed; no external request.',checks:['blocked tap does not start','accepted tap hides hint','5-second idle hint','hidden time pauses','timeout endcard','static logo and no idle 3D draws','board locked','14 viewport bounds and centering','title and logo keep identical pixel dimensions on rotation for small phones, tall phones and tablets','full-screen corners and title CTA in 14 viewports','repeated touch taps remain enabled','one redirect per click including logo','logo click CTA','keyboard CTA','known loading host does not fall back'],logoSizes,errors,requests,captures},null,2));
  console.log('Session UI checks passed, including the static endcard logo over 2 seconds.');
} finally {await browser.close();}
