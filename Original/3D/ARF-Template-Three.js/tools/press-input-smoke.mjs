import {build} from 'esbuild';
import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'ts',contents:`
import {bindTaps} from './src/input/taps';
import {Simulation} from './src/core/simulation';
import {Session} from './src/core/session';
import {ConveyorPath} from './src/core/path';
window.presses=[];window.tokens=new Set();
window.reset=()=>{window.presses=[];window.fixture=new Session(new Simulation([
 {id:0,color:'blue',position:[0,0,0],direction:[1,0,0],cells:[[0,0,0]]},
 {id:1,color:'blue',position:[3,0,0],direction:[-1,0,0],cells:[[0,0,0]]}
],new ConveyorPath([[-5,0,-5],[5,0,-5],[5,0,5],[-5,0,5]])),Infinity,3);};
window.reset();
window.unbind=bindTaps(document.getElementById('target'),(x,y)=>x>=0&&x<200&&y>=0&&y<200?(x<100?0:1):null,id=>{window.presses.push(id);window.fixture.launch(id);},{
 start(token,action){window.tokens.add(token);action();},move(){},
 release(token,action){if(!window.tokens.has(token))throw new Error('Lost audio token');action();window.tokens.delete(token);},
 cancel(token){window.tokens.delete(token);}
});
`},bundle:true,write:false,format:'iife'});
const html=`<meta name="viewport" content="width=device-width,initial-scale=1"><div id="target" style="position:fixed;left:0;top:0;width:200px;height:200px;touch-action:none"></div><script>${bundle.outputFiles[0].text}</script>`;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
const errors=[],results=[];
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:mobile,...(mobile?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1'}:{})});
  await context.route('**/*',r=>r.request().url()==='https://fixture.invalid/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://fixture.invalid/');
  const cdp=await context.newCDPSession(page);
  const down=async()=>{if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:50,y:50,id:1}]});else{await page.mouse.move(50,50);await page.mouse.down();}};
  const up=async()=>{if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();};
  for(let count=1;count<=3;count++){
   await down();assert.equal(await page.evaluate(()=>fixture.taps),count,'Counter increments before release');
   assert.equal(await page.evaluate(()=>presses.length),count);
   if(count===1){
    if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:300,y:50,id:1}]});else await page.mouse.move(300,50);
   }
   await up();assert.equal(await page.evaluate(()=>fixture.taps),count,'Release does not count again');
   await page.evaluate(()=>fixture.advance(2));
  }
  await page.evaluate(()=>fixture.advance(1));assert.equal(await page.evaluate(()=>fixture.endcardShown),true);
  await page.evaluate(()=>reset());
  if(mobile){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:50,y:50,id:1},{x:150,y:50,id:2}]});
   assert.equal(await page.evaluate(()=>presses.length),2,'Two fingers press independently');
   await page.evaluate(()=>document.getElementById('target').dispatchEvent(new PointerEvent('lostpointercapture',{pointerId:1})));
   assert.equal(await page.evaluate(()=>tokens.size),2,'Compatibility pointer cleanup does not cancel touch');
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
   assert.equal(await page.evaluate(()=>presses.length),2);
  }else{
   await page.mouse.click(50,50,{button:'right'});assert.equal(await page.evaluate(()=>presses.length),0);
   await down();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await up();
   assert.equal(await page.evaluate(()=>presses.length),1,'Blur does not undo or repeat a press');
  }
  assert.equal(await page.evaluate(()=>tokens.size),0);
  await page.evaluate(()=>reset());
  if(mobile)await page.touchscreen.tap(300,50);else await page.mouse.click(300,50);
  assert.equal(await page.evaluate(()=>fixture.taps),0,'Empty space is ignored');
  await page.evaluate(()=>unbind());await down();await up();assert.equal(await page.evaluate(()=>presses.length),0);
  results.push({input:mobile?'native touch emulation':'native mouse pointer',pressCounting:true,noReleaseDoubleCount:true,threeClickEndcard:true,cleanup:true});
  await context.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('analysis/evidence/press-input-browser.json',JSON.stringify({at:new Date().toISOString(),results,errors,limits:'Real input/session modules with controlled picking and audio ownership. Touch emulation is not physical iOS.'},null,2));
 console.log(JSON.stringify({results,errors}));
}finally{await browser.close();}
