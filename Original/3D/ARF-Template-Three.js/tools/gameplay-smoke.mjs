import {gameplayPoints} from './gameplay-points.mjs';
import { chromium } from 'playwright';
import { transformSync } from 'esbuild';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('dist/index.html','utf8');
const input=transformSync(fs.readFileSync('src/input/taps.ts','utf8'),{loader:'ts',format:'iife',globalName:'TapInput'}).code;
const browser=await chromium.launch({headless:true,args:['--mute-audio','--disable-background-networking']});
const errors=[],outcomes=[];
fs.mkdirSync('analysis/screenshots/milestone-4',{recursive:true});
try {
  for(const mobile of [false,true]) {
    const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:mobile,...(mobile?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1'}:{}),serviceWorkers:'block'});
    await context.route('**/*',route=>route.request().url()==='https://preview.invalid/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
    await context.addInitScript(()=>{
      const AudioOriginal=window.Audio,play=HTMLMediaElement.prototype.play;
      window.testVoices=[];window.testCueRequests=[];
      window.Audio=function(...args){const media=new AudioOriginal(...args);window.testVoices.push(media);return media;};
      HTMLMediaElement.prototype.play=function(){if(!this.muted)window.testCueRequests.push({voice:window.testVoices.indexOf(this),time:performance.now()});return play.call(this);};
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('https://preview.invalid/');await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');
    await page.evaluate(()=>document.fonts.ready);const point=await gameplayPoints(page);
    const hideUI=await page.addStyleTag({content:'.hud,.tutorial-hand {visibility:hidden}'});
    await page.clock.install({time:new Date('2026-01-01T00:00:00Z')}); await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
    const blockedPoint=point(44,264),blockedClip={x:Math.floor(blockedPoint[0])-12,y:Math.floor(blockedPoint[1])-14,width:30,height:30};
    const blockedBefore=await page.screenshot({clip:blockedClip});
    const tapTime=await page.evaluate(()=>performance.now());
    if(mobile) await page.touchscreen.tap(...point(44,264));else await page.mouse.click(...point(44,264));
    assert.equal(await page.evaluate(()=>testCueRequests.filter(c=>c.voice>=4&&c.voice<8).length),0,'Blocked SFX is not requested on release');
    await page.clock.runFor(100);
    const nudged=await page.screenshot({clip:blockedClip,path:`analysis/screenshots/milestone-4/${mobile?'touch':'mouse'}-blocked.png`});
    assert(!blockedBefore.equals(nudged),'Blocked arrow nudges');
    await page.clock.runFor(1600);assert(blockedBefore.equals(await page.screenshot({clip:blockedClip})),'Blocked arrow returns without launching');
    const blockedSounds=await page.evaluate(()=>testCueRequests.filter(c=>c.voice>=4&&c.voice<8));
    assert.equal(blockedSounds.length,1,'Exactly one delayed blocked contact cue');assert(blockedSounds[0].time>tapTime);
    await hideUI.evaluate(node=>node.remove());
    const before=await page.screenshot();
    if(mobile) await page.touchscreen.tap(...point(145,191));else await page.mouse.click(...point(145,191));
    await page.clock.runFor(250);
    const after=await page.screenshot({path:`analysis/screenshots/milestone-4/${mobile?'touch':'mouse'}-launch-250ms.png`});
    assert(!before.equals(after),'Accepted release should visibly animate the board');
    await page.clock.runFor(100);
    await page.screenshot({path:`analysis/screenshots/milestone-4/${mobile?'touch':'mouse'}-shot-350ms.png`});
    await page.clock.runFor(1800);
    const moving=await page.screenshot({path:`analysis/screenshots/milestone-4/${mobile?'touch':'mouse'}-conveyor-1250ms.png`});
    assert.equal(await page.locator('.cannon-ammo[data-lane="0"]').textContent(),'20','Six matching blocks consume six shots');
    await page.clock.resume();
    if(mobile){await page.touchscreen.tap(...point(165,191));await page.touchscreen.tap(...point(204,191));}
    else{await page.mouse.click(...point(165,191));await page.mouse.click(...point(204,191));}
    await page.waitForTimeout(700);
    const unmatched=await page.screenshot({path:`analysis/screenshots/milestone-4/${mobile?'touch':'mouse'}-multiple-groups.png`});
    await page.waitForTimeout(250);assert(!unmatched.equals(await page.screenshot()),'Unmatched blocks keep circulating');
    await page.setViewportSize({width:844,height:390});await page.waitForTimeout(750);
    assert.equal(await page.locator('canvas').count(),1);
    await page.screenshot({path:`analysis/screenshots/milestone-4/${mobile?'touch':'mouse'}-rotated.png`});
    const recovered=await page.evaluate(()=>new Promise((resolve,reject)=>{
      const canvas=document.querySelector('canvas'),extension=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
      if(!extension){reject(new Error('Context loss test extension unavailable'));return;}
      const timeout=setTimeout(()=>reject(new Error('Context restore timeout')),5000);
      canvas.addEventListener('webglcontextrestored',()=>{clearTimeout(timeout);resolve(true);},{once:true});
      canvas.addEventListener('webglcontextlost',()=>setTimeout(()=>extension.restoreContext(),100),{once:true});
      extension.loseContext();
    }));
    assert(recovered);await page.waitForTimeout(250);assert.equal(await page.locator('canvas').count(),1);
    // Isolated fixture exercises the exact shipped native-input module without production debug APIs.
    await page.setContent('<div id="target" style="position:fixed;left:0;top:0;width:200px;height:200px;touch-action:none"></div>');
    await page.addScriptTag({content:input});
    await page.evaluate(()=>{window.releases=[];window.audioTokens=new Set();window.audioEvents=[];window.unbind=TapInput.bindTaps(document.getElementById('target'),(x,y)=>x>=0&&x<200&&y>=0&&y<200?1:null,id=>window.releases.push(id),{
      start(token,action){audioTokens.add(token);audioEvents.push(['start',token]);action();},move(){},
      release(token,action){if(!audioTokens.has(token))throw new Error('Audio token lost before release');action();audioEvents.push(['release',token]);audioTokens.delete(token);},
      cancel(token){audioEvents.push(['cancel',token]);audioTokens.delete(token);},
    });});
    if(!mobile) {
      await page.mouse.click(50,50);assert.equal(await page.evaluate(()=>releases.length),1);
      await page.mouse.move(50,50);await page.mouse.down();await page.mouse.move(100,100);await page.mouse.move(50,50);await page.mouse.up();
      assert.equal(await page.evaluate(()=>releases.length),2,'Returning drag does not undo or repeat the press');
      await page.mouse.move(50,50);await page.mouse.down();await page.mouse.move(300,50);await page.mouse.up();
      assert.equal(await page.evaluate(()=>releases.length),3,'Outside release does not repeat the press');
      await page.mouse.click(50,50,{button:'right'});assert.equal(await page.evaluate(()=>releases.length),3);
      await page.mouse.move(50,50);await page.mouse.down();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();
      assert.equal(await page.evaluate(()=>releases.length),4,'Blur cleans up without undoing the earlier press');
    } else {
      await page.touchscreen.tap(50,50);assert.equal(await page.evaluate(()=>releases.length),1);
      const cdp=await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:50,y:50,id:1},{x:100,y:50,id:2}]});
      await page.evaluate(()=>document.getElementById('target').dispatchEvent(new PointerEvent('lostpointercapture',{pointerId:1})));
      assert.equal(await page.evaluate(()=>audioTokens.size),2,'Compatibility pointer loss does not cancel native touch audio');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert.equal(await page.evaluate(()=>releases.length),3,'Independent touch identifiers release once each');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:50,y:50,id:3}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      assert.equal(await page.evaluate(()=>releases.length),4,'Touch cancel does not repeat the earlier press');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:50,y:50,id:4},{x:300,y:50,id:5}]});
      assert.equal(await page.evaluate(()=>audioTokens.size),1,'Outside target does not acquire gameplay audio token');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert.equal(await page.evaluate(()=>releases.length),5);
    }
    const count=await page.evaluate(()=>releases.length);await page.evaluate(()=>unbind());
    if(mobile)await page.touchscreen.tap(50,50);else await page.mouse.click(50,50);
    assert.equal(await page.evaluate(()=>releases.length),count,'Disposal removes handlers');
    assert.equal(await page.evaluate(()=>audioTokens.size),0,'All accepted audio tokens released or cancelled');
    outcomes.push({input:mobile?'native touch emulation':'native mouse pointer',blockedNudgeAndReturn:true,blockedCueAfterReleaseMs:blockedSounds[0].time-tapTime,blockedCueCount:blockedSounds.length,launchAndMotion:true,ammo26To20:true,unmatchedBlocksCirculate:true,rapidLaunchCapture:true,rotation:true,contextRestoreEvent:true,inputOwnership:true});
    await context.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('analysis/evidence/milestone-4-gameplay-browser.json',JSON.stringify({testedAt:new Date().toISOString(),browser:browser.version(),outcomes,errors,limits:'Pixel changes confirm visible response/motion, not exact reference timing. Touch emulation is not physical iOS.'},null,2));
  console.log(JSON.stringify({outcomes,errors},null,2));
}finally{await browser.close();}
