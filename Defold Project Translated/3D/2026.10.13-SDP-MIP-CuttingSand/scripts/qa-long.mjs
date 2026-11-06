import{chromium}from'playwright';import fs from'node:fs/promises';import assert from'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{
 let p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});let errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await p.goto('http://127.0.0.1:8182/');await p.waitForFunction(()=>window.__SDP_STATE__?.state==='play');const seen=new Set();
 const s=Math.min(390/1080,844/1920),ox=(390-1080*s)/2,oy=(844-1920*s)/2;
 for(let step=0;step<180;step++){
  const q=await p.evaluate(()=>window.__SDP_STATE__);assert.equal(q.accounted,q.total);assert.equal(q.integrity,'');
  if(!seen.has(q.wave)){seen.add(q.wave);await p.screenshot({path:`qa/defold/full-wave-${q.wave}.png`})}
  if(q.state==='endcard')break;
  if(q.state==='play'&&q.targets.swipe){const h=q.targets.swipe;await p.mouse.move(ox+h.x1*s,oy+h.y1*s);await p.mouse.down();await p.mouse.move(ox+h.x2*s,oy+h.y2*s,{steps:3});await p.mouse.up();}
  await p.waitForTimeout(650);
 }
 let q=await p.evaluate(()=>window.__SDP_STATE__);assert.equal(q.endReason,'solved');assert.deepEqual([...seen],[1,2,3]);assert.equal(errors.length,0);await p.screenshot({path:'qa/defold/full-solved.png'});results.push({name:'real-browser-three-wave-solve',state:q,errors,events:await p.evaluate(()=>SandQA.events)});await p.close();console.log('PASS browser three-wave full solve.');
 p=await b.newPage({viewport:{width:390,height:844}});errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto('http://127.0.0.1:8182/?variant=90seconds');await p.waitForFunction(()=>window.__SDP_STATE__?.state==='play');await p.waitForTimeout(1200);q=await p.evaluate(()=>window.__SDP_STATE__);assert.equal(q.counted,0);assert.equal(q.ended,false);
 await p.mouse.click(10,10);const start=Date.now();await p.waitForFunction(()=>window.__SDP_STATE__?.state==='endcard',null,{timeout:160000});const elapsed=Date.now()-start;q=await p.evaluate(()=>window.__SDP_STATE__);assert.equal(q.endReason,'time');assert.equal(q.counted,1);assert(elapsed>85000);assert.equal(errors.length,0);await p.screenshot({path:'qa/defold/timer-endcard.png'});results.push({name:'real-90-second-browser-timer',elapsedWallMs:elapsed,state:q,errors});await p.close();console.log('PASS actual 90-second browser timer.');
}catch(e){results.push({error:String(e)});throw e}finally{await fs.writeFile('qa/browser-long-results.json',JSON.stringify(results,null,2));await b.close()}
