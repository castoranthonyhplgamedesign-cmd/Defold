import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {Simulation,tuning} from '../src/core/simulation.ts';
import {ConveyorPath,distance} from '../src/core/path.ts';
import {flowRuntime} from '../src/layout/arrowFlow.ts';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const page=await browser.newPage({viewport:{width:1000,height:1000}}),errors=[],external=[],measurements=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{const u=r.request().url();if(/^https?:/.test(u)&&!u.startsWith('http://127.0.0.1:5181/')){external.push(u);return r.abort();}return r.continue();});
try{
 fs.mkdirSync('analysis/screenshots/launch-connection',{recursive:true});
 for(const size of [.5,1,1.5]){
  const doc={kind:'arrow-flow',version:1,name:'Connected launch QA',origin:[0,0],board:{bounds:{minX:-25,minY:-25,width:50,height:50},grid:{size,offset:[0,0]},arrows:[{id:'qa',color:'green',head:[0,0],body:[[-1,0],[-2,0],[-2,-1],[-2,-2],[-3,-2]],facing:'Right'}]},conveyor:{points:[[20,-20],[-20,-20],[-20,20],[20,20]],width:1.3,direction:1},cannons:[{id:'c',progress:.625,offset:5.313,angle:null,position:[0,26],queue:[{color:'green',ammo:6}]}]};
  if(size===1)fs.writeFileSync('analysis/evidence/launch-connected-qa.arrow-flow.json',JSON.stringify(doc));
  const r=flowRuntime(doc),sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),r.shooters);sim.launch(r.arrows[0].id);let maxGap=0;
  for(let i=0;i<120;i++){sim.advance(tuning.tick);const a=sim.arrows[0];if(a.segments[0].progress===null)for(let j=1;j<a.segments.length;j++)maxGap=Math.max(maxGap,distance(a.segments[j-1].position,a.segments[j].position)/size);}
  assert(maxGap<=1.04+1e-7);measurements.push({size,maxBoardGapInCells:maxGap});
  await page.goto('http://127.0.0.1:5181/level-editor.html');await page.locator('#level-file').setInputFiles({name:'connected.arrow-flow.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});await page.locator('#play-test').click();const frame=page.frameLocator('#preview-frame iframe');await frame.locator('#game[data-level-ready="true"]').waitFor({timeout:30000});
  const point=await frame.locator('.tutorial-hand').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];});const box=await page.locator('#preview-frame iframe').boundingBox();
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.mouse.click(box.x+point[0],box.y+point[1]);let last=0;
  for(const time of [0,20,40,80,100,300,600,900,1200]){if(time>last)await page.clock.runFor(time-last);last=time;await page.screenshot({path:`analysis/screenshots/launch-connection/size-${size}-${String(time).padStart(4,'0')}ms.png`});}
  await page.clock.runFor(20000);await frame.locator('.endcard:not([hidden])').waitFor();await page.clock.resume();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);fs.writeFileSync('analysis/evidence/launch-connection-browser.json',JSON.stringify({checkedAt:new Date().toISOString(),result:'pass',errors,external,measurements,checks:['native click on scaled arrow','timestamped eased launch frame sequences','six-block bent arrow reaches belt and clears at each grid size','head and body links stay within 1.04 cells during pre-belt travel']},null,2));console.log('Connected launch browser checks passed.');
}finally{await browser.close();}
