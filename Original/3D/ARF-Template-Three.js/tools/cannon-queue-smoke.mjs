import {gameplayPoints} from './gameplay-points.mjs';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

// Test-only low-ammo fixture imports the real core/render/input modules. No fixture enters dist.
const bundle = await build({ stdin: { contents: `
  import { Simulation } from './src/core/simulation';
  import { ConveyorPath } from './src/core/path';
  import { createScene } from './src/render/scene';
  import { bindTaps } from './src/input/taps';
  import level from './src/data/level.json';
  import path from './src/data/path.json';
  const lanes = structuredClone(level.shooters); lanes[0].queue[0].ammo = 1;
  const simulation = new Simulation(level.arrows, new ConveyorPath(path), lanes);
  createScene(document.getElementById('game'), simulation).then(view => {
    bindTaps(view.canvas, view.pick, id => { simulation.launch(id); view.wake(); });
    document.documentElement.dataset.sceneReady = 'true';
  });
`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, format: 'iife', write: false, loader: { '.bin': 'dataurl', '.webp':'dataurl' } });
const css=fs.readFileSync('src/style.css','utf8').replace('./assets/ui/LilitaOne-Regular.ttf',`data:font/ttf;base64,${fs.readFileSync('src/assets/ui/LilitaOne-Regular.ttf').toString('base64')}`);
const html = `<html><head><style>${css}</style></head><body><main id="game"></main><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body></html>`;
const browser = await chromium.launch({headless:true,args:['--mute-audio','--disable-background-networking']});
const errors=[];
try {
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.route('**/*',route=>route.request().url()==='https://fixture.invalid/'?route.fulfill({contentType:'text/html',body:html}):route.abort());
  const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('https://fixture.invalid/'); await page.waitForFunction(()=>document.documentElement.dataset.sceneReady==='true');
  const point=await gameplayPoints(page);
  const label=page.locator('.cannon-ammo[data-lane="0"]');
  assert.equal(await label.textContent(),'1');
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')}); await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z')); await page.mouse.click(...point(145,191));
  await page.clock.runFor(450);
  assert.equal(await label.textContent(),'18'); assert.equal(await label.isVisible(),false);
  await page.screenshot({path:'analysis/screenshots/milestone-4/fixture-queue-start-450ms.png'});
  await page.clock.runFor(100);
  await page.screenshot({path:'analysis/screenshots/milestone-4/fixture-queue-mid-550ms.png'});
  await page.clock.runFor(250);
  assert.equal(await label.isVisible(),true); assert.match(await label.getAttribute('aria-label'),/yellow cannon: 18/);
  await page.screenshot({path:'analysis/screenshots/milestone-4/fixture-queue-complete-800ms.png'});
  assert.deepEqual(errors,[]);
  fs.writeFileSync('analysis/evidence/milestone-4-queue-browser.json',JSON.stringify({testedAt:new Date().toISOString(),browser:browser.version(),fixture:'Only front green ammo reduced from 26 to 1 in in-memory test data; production level untouched',result:'Last shot removes green cannon, yellow cannon advances, hidden label becomes visible with 18 ammo',errors},null,2));
  console.log('Queue fixture passed: green 1 -> yellow 18, label hidden during advance and visible afterward.');
} finally { await browser.close(); }
