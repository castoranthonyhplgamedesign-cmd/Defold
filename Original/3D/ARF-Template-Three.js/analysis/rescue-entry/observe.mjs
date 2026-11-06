import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const dir='analysis/rescue-entry',root='https://reference.invalid/';
let html=fs.readFileSync(dir+'/reference.html','utf8');
const projection='g.updateMatrixWorld();const Q=$7(B);';assert(html.includes(projection));html=html.replace(projection,'g.updateMatrixWorld();window.rescueProjection={camera:g,renderer:B,Vector:F};const Q=$7(B);');
const marker='const l=Xg(r.canvas';assert(html.includes(marker));
const instrumentation=`window.rescue={simulation:i,session:Q,view:r,config:EA,motion:MP,pushes:[],reverse:[],entries:[],attempts:[]};
const originalBegin=Mg.prototype.begin;Mg.prototype.begin=function(segment,target,hold){const old=segment.progress;const result=originalBegin.call(this,segment,target,hold);if(old!==null){let delta=target-old;delta-=Math.round(delta);if(Math.abs(delta)>1e-8)rescue.pushes.push({time:Q.time,arrow:segment.arrowId,part:segment.index,deltaSlots:delta*this.capacity,duration:this.blends.get(segment)?.duration});}return result;};
const originalInsert=Mg.prototype.insert;Mg.prototype.insert=function(segment,entry,phase,onPath,previous){const count=rescue.pushes.length,result=originalInsert.call(this,segment,entry,phase,onPath,previous);rescue.attempts.push({time:Q.time,accepted:result,occupied:onPath.length,arrow:segment.arrowId,part:segment.index,pushed:rescue.pushes.length-count});return result;};
const originalStep=yg.prototype.step;yg.prototype.step=function(dt){const before=this.onPath.map(part=>[part,this.referenceConveyor.progress(part)]),phase=this.beltPhase;originalStep.call(this,dt);for(const [part,old]of before){if(part.removed)continue;let delta=this.referenceConveyor.progress(part)-old;delta-=Math.round(delta);if(delta < -1e-7&&rescue.reverse.length<200)rescue.reverse.push({time:Q.time,arrow:part.arrowId,part:part.index,visualDeltaSlots:delta*this.capacity,beltPhaseDelta:vP(this.beltPhase-phase),beltPaused:this.beltPaused});}};
const l=Xg(r.canvas`;
html=html.replace(marker,instrumentation);
fs.writeFileSync(dir+'/instrumented.html',html);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,chromiumSandbox:true,args:['--mute-audio','--disable-background-networking']});
const requests=[],errors=[],logs=[],taps=[];
try{
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:false,recordVideo:{dir:dir+'/video',size:{width:390,height:844}}});
await context.route('**/*',route=>{const url=route.request().url();requests.push({url,action:url===root?'local-fixture':'blocked'});return url===root?route.fulfill({contentType:'text/html',body:html}):route.abort();});
await context.routeWebSocket('**',s=>s.close());
await context.addInitScript(()=>{window.hostDestinations=[];window.open=(...args)=>{hostDestinations.push(args);return null;};window.mraid={getState:()=> 'default',isViewable:()=>true,addEventListener:()=>{},removeEventListener:()=>{},open:(...args)=>hostDestinations.push(args)};});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>logs.push({type:m.type(),text:m.text().slice(0,500)}));
await page.goto(root);await page.locator('html[data-scene-ready="true"]').waitFor({timeout:20000});await page.waitForFunction(()=>rescue.view.isInteractive());
const initial=await page.evaluate(()=>({capacity:rescue.simulation.capacity,onPath:rescue.simulation.onPath.length,pathLength:rescue.simulation.path.length,blockSizing:rescue.simulation.blockSizing,referenceInsertion:!!rescue.simulation.referenceConveyor,alternatePush:!!rescue.simulation.slotPush,continuousMerge:!!rescue.simulation.movingMerge,arrows:rescue.simulation.arrows.length,blocks:rescue.simulation.allSegments.length,motion:rescue.motion}));
await page.screenshot({path:dir+'/load.png'});
for(let index=0;index<30;index++){
const target=await page.evaluate(()=>{const {simulation:s,session:q,view}=rescue,{camera,renderer,Vector}=rescueProjection;if(q.ended)return null;const rect=renderer.domElement.getBoundingClientRect();let candidates=s.arrows.filter(a=>!a.moving&&s.canMove(a)&&s.fitsOnBelt(a));candidates.sort((a,b)=>{const d=x=>s.onPath.length?Math.min(...s.onPath.map(p=>Math.abs(((p.progress-x.entry+1.5)%1)-.5))):0;return d(a)-d(b);});for(const arrow of candidates){const p=new Vector(...arrow.segments[0].position);p.y+=(arrow.data.cellSize??1)*.5;p.project(camera);const x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2;for(const dx of [0,-5,5])for(const dy of [0,-5,5])if(view.pick(x+dx,y+dy)===arrow.data.id)return {id:arrow.data.id,x:x+dx,y:y+dy,time:q.time};}return null;});
if(!target){await page.waitForTimeout(500);if(await page.evaluate(()=>!!rescue.session.ended))break;continue;}
await page.mouse.click(target.x,target.y);taps.push(target);await page.waitForTimeout(450);
if(index===0)await page.screenshot({path:dir+'/first-launch.png'});
if(await page.evaluate(()=>rescue.pushes.length>=4)){await page.screenshot({path:dir+'/pushback.png'});break;}
}
await page.waitForTimeout(1000);
const result=await page.evaluate(()=>({pushes:rescue.pushes,reverse:rescue.reverse,attempts:rescue.attempts,final:{time:rescue.session.time,ended:rescue.session.ended,onPath:rescue.simulation.onPath.length,beltPaused:rescue.simulation.beltPaused},destinations:hostDestinations}));
await page.screenshot({path:dir+'/after-entry.png'});const video=await page.video().path();await context.close();fs.writeFileSync(dir+'/runtime.json',JSON.stringify({at:new Date().toISOString(),browser:browser.version(),method:'Instrumented copy; native mouse clicks; sandboxed headless browser; muted; every external request blocked; MRAID stubbed',initial,taps,...result,requests,errors,logs,video},null,2));console.log({initial,taps:taps.length,pushes:result.pushes.length,reverse:result.reverse.length,firstPushes:result.pushes.slice(0,4),firstReverse:result.reverse.slice(0,2),final:result.final,requests,errors,video});
}finally{await browser.close();}
