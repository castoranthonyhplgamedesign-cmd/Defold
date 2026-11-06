import {hintPoint} from './gameplay-points.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {unzipSync} from 'fflate';
const report=JSON.parse(fs.readFileSync('analysis/evidence/network-builds.json'));
const browser=await chromium.launch({headless:true,args:['--mute-audio','--disable-background-networking']});
const results=[];fs.mkdirSync('analysis/screenshots/delivery',{recursive:true});
try {
  for(const profile of report.profiles.filter(p=>!process.env.ONLY||`${p.length}/${p.tag}`===process.env.ONLY)) {
    const bytes=fs.readFileSync(profile.file),html=profile.zip?Buffer.from(unzipSync(bytes)['index.html']).toString():bytes.toString();
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),errors=[],requests=[];
    await context.route('**/*',route=>{
      const url=route.request().url();requests.push(url);
      if(url==='https://preview.invalid/')return route.fulfill({contentType:'text/html',body:html});
      if(url.endsWith('/mraid.js') || url==='https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js')return route.fulfill({contentType:'text/javascript',body:''});
      return route.abort();
    });
    await context.addInitScript(({tag,bridge})=>{
      window.hostCalls=[];window.mediaEvidence=[];window.testMedia=[];window.hostListeners={};
      const AudioOriginal=window.Audio;
      window.Audio=function(...args){const media=new AudioOriginal(...args);window.testMedia.push(media);media.addEventListener('playing',()=>window.mediaEvidence.push({event:'playing',muted:media.muted,time:performance.now()}));return media;};
      const originalPlay=HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play=function(){window.mediaEvidence.push({event:'request',muted:this.muted,time:performance.now()});return originalPlay.call(this);};
      window.open=(...args)=>window.hostCalls.push(['unexpected-open',...args]);
      window.gameReady=()=>{window.hostCalls.push(['ready']);if(tag==='mtg')window.gameStart();};
      window.gameEnd=()=>window.hostCalls.push(['end']);window.gameClose=()=>window.hostCalls.push(['close']);
      window.playableSDK={reportEvent:event=>window.hostCalls.push(['analytics',event])};
      if(bridge==='mraid')window.mraid={getState:()=> 'default',isViewable:()=>window.hostVisible===true,open:url=>window.hostCalls.push(['mraid',url]),addEventListener:(e,fn)=>{window.hostListeners[e]=fn;},removeEventListener:()=>{}};
      if(tag==='fb'||tag==='mo')window.FbPlayableAd={onCTAClick:(...args)=>window.hostCalls.push(['fb',...args])};
      if(tag==='gg')window.ExitApi={exit:(...args)=>window.hostCalls.push(['gg',...args])};
      if(tag==='mtg')window.install=(...args)=>window.hostCalls.push(['mtg',...args]);
      if(tag==='vu')window.parent.postMessage=(...args)=>window.hostCalls.push(['post',...args]);
    },profile);
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const began=Date.now();await page.goto('https://preview.invalid/');await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');
    const loadMs=Date.now()-began;
    assert.equal(await page.evaluate(()=>window.testMedia.length),37);
    assert.equal(await page.evaluate(()=>window.mediaEvidence.length),0,'No startup play requests');
    if(profile.bridge==='mraid') {
      await page.mouse.click(145,191);assert.equal(await page.evaluate(()=>window.mediaEvidence.length),0,'Hidden host rejects gameplay');
      await page.evaluate(()=>{window.hostVisible=true;window.hostListeners.viewableChange(true);});
    }
    await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.drawCalls)>0);
    await page.locator('.intro-screen').click();await page.locator('.intro-screen').waitFor({state:'hidden'});
    // Shipped builds use the overload level: tap the hinted arrow.
    await page.mouse.move(...await hintPoint(page));await page.mouse.down();
    await page.waitForFunction(()=>window.hostCalls.some(c=>c[0]==='analytics'&&c[1]==='CHALLENGE_STARTED'));
    assert(await page.evaluate(()=>window.mediaEvidence.some(e=>e.event==='request'&&!e.muted)),'Launch and immediate SFX occur before pointerup');
    await page.mouse.up();await page.waitForTimeout(1100);
    const media=await page.evaluate(()=>({voices:window.testMedia.length,requests:window.mediaEvidence.filter(e=>e.event==='request'&&!e.muted).length,playing:window.mediaEvidence.filter(e=>e.event==='playing'&&!e.muted).length,durations:[...new Set(window.testMedia.map(m=>m.duration))]}));
    if(!(media.requests>0 && media.playing>0))console.log(JSON.stringify(await page.evaluate(()=>({evidence:window.mediaEvidence.slice(-12),calls:window.hostCalls}))));
    assert(media.requests>0 && media.playing>0,`${profile.length} ${profile.tag}: actual browser observes audible-mode media playback (output muted by runner)`);
    assert(media.durations.every(Number.isFinite));
    await page.waitForFunction(()=>window.hostCalls.some(c=>c[0]==='analytics'&&c[1]==='CHALLENGE_STARTED'));
    await page.screenshot({path:`analysis/screenshots/delivery/${profile.tag}-portrait.png`});
    await page.setViewportSize({width:844,height:390});await page.waitForTimeout(350);
    assert.equal(await page.locator('canvas').count(),1);
    await page.screenshot({path:`analysis/screenshots/delivery/${profile.tag}-landscape.png`});
    assert.equal(await page.locator('.hud-play,.hud-logo').count(),0);
    const gameplayCallsBefore=await page.evaluate(()=>window.hostCalls.length);
    await page.locator('.hud-title').click();
    const gameplayCTA=await page.evaluate(n=>window.hostCalls.slice(n),gameplayCallsBefore);
    assert.equal(gameplayCTA.filter(c=>['mraid','fb','gg','mtg','post'].includes(c[0])).length,1);
    assert(gameplayCTA.some(c=>c[0]==='analytics'&&c[1]==='CTA_CLICKED'));
    assert(!gameplayCTA.some(c=>['close','end','unexpected-open'].includes(c[0])));
    assert(await page.locator('.endcard').isHidden(),'Gameplay title must not open the endcard');
    const callsBefore=await page.evaluate(()=>window.hostCalls.length);
    // Exercise shipped CTA wiring directly; natural endcard presentation is checked by session-smoke.
    await page.locator('.end-icon').evaluate(button=>button.click());
    const calls=await page.evaluate(n=>window.hostCalls.slice(n),callsBefore);
    const routes=calls.filter(c=>['mraid','fb','gg','mtg','post','unexpected-open'].includes(c[0]));
    assert.equal(routes.length,1);assert.notEqual(routes[0][0],'unexpected-open');assert.equal(calls[0][0],'close');
    if(profile.bridge==='mraid')await page.evaluate(()=>window.hostListeners.exposureChange(0));
    else await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    assert(await page.evaluate(()=>window.testMedia.every(m=>m.paused && m.muted)));
    assert.deepEqual(errors,[]);assert.equal(requests.length,profile.bridge?2:1);
    results.push({network:profile.name,file:profile.file,loadMs,media,gameplayCTA,cta:calls,errors,requests});await context.close();
    console.log(`${profile.name}: packaged boot, audio, resize, CTA and pause passed`);
  }
  fs.writeFileSync('analysis/evidence/delivery-browser.json',JSON.stringify({testedAt:new Date().toISOString(),browser:browser.version(),scope:'Actual packaged files with controlled host callbacks, blocked external requests and muted output. Not an official host validator.',results},null,2));
}finally{await browser.close();}
