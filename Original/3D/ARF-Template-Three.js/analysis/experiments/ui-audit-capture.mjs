import {build} from 'esbuild';
import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('D:/Projects/Phaser/Bubble-Cash--Template/node_modules/sharp');
const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'ts',contents:`
import {Simulation} from './src/core/simulation';import {Session} from './src/core/session';
import {ConveyorPath} from './src/core/path';import {createScene} from './src/render/scene';
import level from './src/data/level.json';import path from './src/data/path.json';
import {Scene,Matrix4,Vector3} from 'three';import {createConveyorGuides} from './src/render/conveyorGuides';
import {motionTuning} from './src/core/motionTuning';
const simulation=new Simulation(level.arrows,new ConveyorPath(path),level.shooters);
const probeScene=new Scene(),probe=createConveyorGuides(probeScene,simulation.path),mesh=probeScene.children[0];
window.guideDots=[];
for(let i=0;i<mesh.count/2;i++){
 const m=new Matrix4();mesh.getMatrixAt(i*2,m);
 const tip=new Vector3(0,1,0).transformDirection(m),p=i/(mesh.count/2);
 const tangent=new Vector3().fromArray(simulation.path.position(p+.01)).sub(new Vector3().fromArray(simulation.path.position(p-.01))).normalize();
 window.guideDots.push(tip.dot(tangent));
}
window.guideSpeedError=0;
for(const time of [.1,.5,6]){
 probe.sync(time);
 for(let i=0;i<mesh.count/2;i++){
  const a=new Matrix4(),b=new Matrix4();mesh.getMatrixAt(i*2,a);mesh.getMatrixAt(i*2+1,b);
  const center=new Vector3().setFromMatrixPosition(a).add(new Vector3().setFromMatrixPosition(b)).multiplyScalar(.5);center.y-=.02;
  const expected=new Vector3().fromArray(simulation.path.position(i/(mesh.count/2)+time*motionTuning.conveyorSpeed/simulation.path.length));
  window.guideSpeedError=Math.max(window.guideSpeedError,center.distanceTo(expected));
 }
}
probe.dispose();
const session=new Session(simulation);window.fixture=session;
createScene(document.getElementById('game'),simulation,session).then(view=>{window.view=view;window.ready=true;});
`},bundle:true,format:'iife',write:false,loader:{'.bin':'dataurl','.webp':'dataurl'}});
const css=fs.readFileSync('src/style.css','utf8').replace('./assets/ui/LilitaOne-Regular.ttf',`data:font/ttf;base64,${fs.readFileSync('src/assets/ui/LilitaOne-Regular.ttf').toString('base64')}`);
const html=`<style>${css}</style><main id="game"></main><script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`;
const label=process.argv[2]??'ui-audit';assert(/^[a-z0-9-]+$/.test(label));
const dir=`analysis/screenshots/${label}`;fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--mute-audio','--disable-background-networking']});
const results=[],errors=[],requests=[];
try{
 const context=await browser.newContext({deviceScaleFactor:1,serviceWorkers:'block'});
 await context.route('**/*',route=>{requests.push(route.request().url());return route.request().url()==='https://audit.invalid/'?route.fulfill({contentType:'text/html',body:html}):route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[720,1280],[390,844],[844,390],[768,1024],[360,640],...(['motion-framing','gloss-feedback','motion-feedback'].includes(label)?[[320,932],[430,932]]:[])]){
  await page.setViewportSize({width,height});await page.goto('https://audit.invalid/');await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>window.guideSpeedError<.00001),'Chevron pairs match the authored free conveyor speed, including wraparound');
  for(const state of ['gameplay',...(width===390?['meter75',...(label==='gloss-feedback'?['blocked']:[]),...(label==='motion-feedback'?['tutorial-tap','blocked-approach','blocked-pulse1','blocked-between','blocked-pulse2','blocked-return']:[])]:[]),'endcard']){
   if(state==='tutorial-tap')await page.evaluate(()=>{
    const session=window.fixture;Object.defineProperty(session,'hintSince',{get:()=>session.time-1.1,set:()=>{}});
   });
   if(state.startsWith('blocked-'))await page.evaluate(state=>{
    const sim=window.fixture.simulation;
    if(!window.heldFeedback){
     const arrow=sim.arrows.find(a=>a.data.color==='blue'&&!sim.canMove(a));window.fixture.launch(arrow.data.id);window.heldFeedback=arrow.feedback;
     Object.defineProperty(arrow.feedback,'elapsed',{get:()=>window.heldElapsed,set:()=>{}});
     Object.defineProperty(arrow.feedback,'done',{get:()=>false});
    }
    const feedback=window.heldFeedback,phase={'blocked-approach':-.1,'blocked-pulse1':.25,'blocked-between':.5,'blocked-pulse2':.75,'blocked-return':1}[state];
    window.heldElapsed=phase<0?feedback.approachSeconds/2:feedback.approachSeconds+(feedback.duration-feedback.approachSeconds)*phase;
   },state);
   if(state==='blocked')await page.evaluate(()=>{
    const sim=window.fixture.simulation,arrow=sim.arrows.find(a=>a.data.color==='blue'&&!sim.canMove(a));
    window.fixture.launch(arrow.data.id);
    // Freeze only this feedback in the isolated capture so software rendering cannot miss it.
    const elapsed=arrow.feedback.approachSeconds+.04;
    Object.defineProperty(arrow.feedback,'elapsed',{get:()=>elapsed,set:()=>{}});
   });
   if(state==='meter75')await page.evaluate(()=>Object.defineProperty(window.fixture.simulation,'percentage',{value:75,configurable:true}));
   if(state==='endcard')await page.evaluate(()=>{window.fixture.ended='timeout';window.fixture.endedAt=window.fixture.time-1;});
   await page.waitForTimeout(500);
   if(label==='ui-polish'&&width===390&&state==='gameplay'){
    const clip={x:0,y:270,width:32,height:100},before=await page.screenshot({clip});
    await page.waitForTimeout(1200);assert(!before.equals(await page.screenshot({clip})),'Conveyor chevrons animate while idle');
    await page.evaluate(()=>window.view.setHostPaused(true));await page.waitForTimeout(100);
    const paused=await page.screenshot({clip});await page.waitForTimeout(400);assert(paused.equals(await page.screenshot({clip})),'Conveyor chevrons freeze while paused');
    await page.evaluate(()=>window.view.setHostPaused(false));
   }
   if(label==='ui-polish'&&state==='meter75'){
    const styles=await page.evaluate(()=>{const meter=document.querySelector('.meter'),fill=document.querySelector('.meter-fill');return {color:getComputedStyle(fill).backgroundColor,fill:getComputedStyle(fill).zIndex,border:getComputedStyle(meter,'::after').zIndex,stroke:getComputedStyle(document.querySelector('.meter-percent')).webkitTextStrokeWidth};});
    assert.equal(styles.color,'rgb(255, 128, 0)');assert(Number(styles.border)>Number(styles.fill));assert.equal(styles.stroke,'8px');
   }
   const elements=await page.evaluate(()=>Object.fromEntries(['.hud-logo','.hud-play','.meter','.meter-fill','.meter-percent','.tutorial-hand','.cannon-ammo','.cannon-reserve','.end-title','.end-icon','.end-play'].map(selector=>{
    const e=document.querySelector(selector);if(!e)return [selector,null];const r=e.getBoundingClientRect(),s=getComputedStyle(e);return [selector,{x:r.x,y:r.y,width:r.width,height:r.height,fontSize:s.fontSize,visible:!!r.width&&!!r.height,transform:s.transform}];
   })));
   if(label==='ui-fixes'||label==='ui-polish'){
    const close=(actual,expected)=>assert(Math.abs(actual-expected)<.1,`${actual} != ${expected}`);
    if(state==='endcard'){
     const icon=elements['.end-icon'];close(icon.width,400*height/1280);close(icon.y+icon.height/2,height/2-66.055*height/1280);
     for(const name of ['.end-title','.end-icon','.end-play']){const b=elements[name];assert(b.x>=0&&b.y>=0&&b.x+b.width<=width&&b.y+b.height<=height,`${name} clipped`);}
    }else{
     if(label==='ui-polish'){assert.equal(elements['.hud-logo'],null);assert.equal(elements['.hud-play'],null);}else{close(elements['.hud-logo'].width,169.513*height/1280);close(elements['.hud-logo'].x,8.3715*height/1280);}
     close(elements['.meter'].width,13.824*height/42);
     const labelHeight=elements['.cannon-ammo'].height;assert(labelHeight>height*.025&&labelHeight<height*.035,'Cannon text projects along the reference plane');
     if(state==='meter75')close(elements['.meter-fill'].width/elements['.meter'].width,354/512);
    }
   }
   const file=`${dir}/${state}-${width}x${height}.png`;const capture=await page.screenshot({path:file});
   let foregroundBounds;
   if(label==='motion-framing'||label==='gloss-feedback'||label==='motion-feedback'){
    assert((await page.evaluate(()=>window.guideDots)).every(dot=>dot>.999),'Every chevron faces its actual travel tangent');
    if(state==='gameplay'){
     const {data,info}=await sharp(capture).removeAlpha().raw().toBuffer({resolveWithObject:true});let minX=width,maxX=0;
     for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*info.channels;if(Math.max(Math.abs(data[i]-67),Math.abs(data[i+1]-66),Math.abs(data[i+2]-103))>12){minX=Math.min(minX,x);maxX=Math.max(maxX,x);}}
     foregroundBounds={minX,maxX};const padding=Math.min(24,width*.06);assert(minX>=padding-3&&maxX<=width-padding+3,`World/cannon edges need padding at ${width}x${height}: ${minX}..${maxX}`);
    }
    if(state==='endcard')for(const name of ['.end-title','.end-icon','.end-play']){const b=elements[name];assert(b.x>=0&&b.y>=0&&b.x+b.width<=width&&b.y+b.height<=height,`${name} clipped`);}
   }
   results.push({width,height,state,elements,file,foregroundBounds,guideSpeedError:await page.evaluate(()=>window.guideSpeedError)});
  }
 }
 assert.deepEqual(errors,[]);assert(requests.every(url=>url==='https://audit.invalid/'));
 fs.writeFileSync(`analysis/evidence/${label}-browser.json`,JSON.stringify({testedAt:new Date().toISOString(),browser:browser.version(),scope:'Real current source modules. Endcard and 75% fullness forced in isolated fixture. DPR 1; all external requests blocked. Not reference runtime.',errors,requests,results},null,2));
 console.log(`Captured ${results.length} UI audit views; no page errors or external requests.`);
}finally{await browser.close();}
