import fs from 'node:fs';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'ts',contents:`
import {Simulation} from './src/core/simulation';import {Session} from './src/core/session';import {ConveyorPath} from './src/core/path';
import {createScene} from './src/render/scene';import level from './src/data/level.json';import path from './src/data/path.json';
const clear=new URL(location.href).searchParams.has('clear');
const simulation=new Simulation(clear?level.arrows.filter(a=>a.id===141):level.arrows,new ConveyorPath(path),level.shooters);
const session=new Session(simulation);window.fixture=session;
createScene(document.getElementById('game'),simulation,session).then(view=>{window.view=view;document.documentElement.dataset.sceneReady='true';});
`},bundle:true,format:'iife',write:false,loader:{'.bin':'dataurl','.webp':'dataurl'}});
const css=fs.readFileSync('src/style.css','utf8').replace('./assets/ui/LilitaOne-Regular.ttf',`data:font/ttf;base64,${fs.readFileSync('src/assets/ui/LilitaOne-Regular.ttf').toString('base64')}`);
const html=`<!doctype html><html><head><style>${css}</style></head><body><main id="game"></main><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body></html>`;
const browser=await chromium.launch({headless:true,args:['--mute-audio','--disable-background-networking']});
const records=[];fs.mkdirSync('analysis/recordings',{recursive:true});fs.mkdirSync('analysis/screenshots/delivery',{recursive:true});
try {
  for(const mode of ['congestion-timeout','clear-fixture']) {
    const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:'analysis/recordings',size:{width:390,height:844}},serviceWorkers:'block'});
    await context.route('**/*',route=>route.request().url().startsWith('https://fixture.invalid/')?route.fulfill({contentType:'text/html',body:html}):route.abort());
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`https://fixture.invalid/${mode==='clear-fixture'?'?clear':''}`);await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');
    await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2030-01-01T00:00:00Z'));
    const beats=[];
    async function capture(label){await page.clock.runFor(32);const state=await page.evaluate(()=>({time:fixture.time,remaining:fixture.remaining,fill:fixture.simulation.percentage,ended:fixture.ended,blocks:fixture.simulation.onPath.length}));const file=`analysis/screenshots/delivery/${mode}-${label}.png`;await page.screenshot({path:file});beats.push({label,...state,file});}
    await capture('load');await page.evaluate(()=>fixture.launch(141));await page.clock.runFor(250);await capture('first-launch');
    if(mode==='clear-fixture'){
      await page.evaluate(()=>fixture.advance(2));await page.clock.runFor(2450);await capture('clear-endcard');assert.equal(await page.evaluate(()=>fixture.ended),'clear');
    }else{
      const launches=await page.evaluate(()=>{
        const results=[];
        for(let step=0;step<100 && !fixture.ended;step++){
          const colors=new Set(fixture.simulation.cannons.lanes.map(l=>l.queue[0]?.color));
          const free=fixture.simulation.arrows.filter(a=>fixture.simulation.canMove(a));
          free.sort((a,b)=>Number(colors.has(a.data.color))-Number(colors.has(b.data.color)));
          if(!free.length)break;
          const result=fixture.launch(free[0].data.id);results.push({id:free[0].data.id,result,fill:fixture.simulation.percentage});
          if(result==='full')break;fixture.advance(.15);
        }
        return results;
      });
      await capture('congestion');assert(launches.some(l=>l.result==='full'),'Authored board can reach admission threshold');
      await page.evaluate(()=>fixture.advance(fixture.remaining));await page.clock.runFor(450);await capture('timeout-endcard');assert.equal(await page.evaluate(()=>fixture.ended),'timeout');
      beats.push({launches});
    }
    assert.deepEqual(errors,[]);const video=page.video();await context.close();const videoPath=`analysis/recordings/${mode}.webm`;await video.saveAs(videoPath);await video.delete();
    records.push({mode,fixture:mode==='clear-fixture'?'Only original arrow 141 retained; real cannon removal clears six segments':'Original level, valid launches greedily favor colors not currently active; simulation clock advanced in chunks',timing:'Accelerated fixture recording; timestamps below are simulation time, not real-time playback',video:videoPath,beats,errors});
    console.log(`${mode} recorded`);
  }
  fs.writeFileSync('analysis/evidence/showcase.json',JSON.stringify({testedAt:new Date().toISOString(),records},null,2));
}finally{await browser.close();}
