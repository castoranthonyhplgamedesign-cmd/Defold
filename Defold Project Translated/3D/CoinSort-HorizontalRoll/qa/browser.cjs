// Exercise real pointer input in a headed browser; no screenshots or headless runs.
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {chromium}=require(path.resolve(root,'../../../reference/BBS-Corners/node_modules/playwright'));
const config=require(path.join(root,'docs/source-constants.json'));

(async()=>{
  const replay=JSON.parse(await fs.readFile(path.join(root,'qa/rotation-replay.json'),'utf8'));
  let browser;
  const report={headed:true,screenshots:false,started:new Date().toISOString(),runs:[]};
  if(process.argv.includes('--defold-only')){
    const previous=JSON.parse(await fs.readFile(path.join(root,'qa/browser.json'),'utf8'));
    report.reference_runs=previous.reference_runs??previous.runs.filter(run=>run.kind==='original'&&run.status==='PASS');
    report.reference_evidence_started=previous.reference_evidence_started??previous.started;
  }
  try{
    const kinds=process.argv.includes('--defold-only')?['defold']:['original','defold'];
    for(const viewport of [{width:390,height:844},{width:844,height:390}])for(const kind of kinds){
      browser=await chromium.launch({headless:false,args:['--mute-audio']});
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      const result={kind,viewport,errors:[],runtime_errors:[],http_errors:[],external_blocked:[],actions:[]};
      report.runs.push(result);
      const save=()=>fs.writeFile(path.join(root,'qa/browser.json'),JSON.stringify(report,null,2)+'\n');
      result.stage='startup';await save();
      await context.addInitScript(()=>{
        window.__qaCalls={cta:0,lifecycle:[],events:[],gpu:[]};
        window.open=()=>{window.__qaCalls.cta++;return null;};
        for(const name of ['gameReady','gameStart','gameEnd','gameClose'])window[name]=()=>window.__qaCalls.lifecycle.push(name);
        window.ALPlayableAnalytics={trackEvent:name=>window.__qaCalls.events.push(name)};
        for(const proto of [window.WebGLRenderingContext?.prototype,window.WebGL2RenderingContext?.prototype]){
          if(!proto)continue;
          const compile=proto.compileShader,link=proto.linkProgram;
          proto.compileShader=function(s){compile.call(this,s);if(!this.getShaderParameter(s,this.COMPILE_STATUS))window.__qaCalls.gpu.push(this.getShaderInfoLog(s));};
          proto.linkProgram=function(p){link.call(this,p);if(!this.getProgramParameter(p,this.LINK_STATUS))window.__qaCalls.gpu.push(this.getProgramInfoLog(p));};
        }
      });
      await context.route('**/*',route=>{
        const url=new URL(route.request().url());
        if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)){result.external_blocked.push(url.href);return route.abort();}
        return route.continue();
      });
      page.on('pageerror',error=>result.errors.push(error.message));
      page.on('console',message=>{if(/ERROR:SCRIPT|ERROR:GRAPHICS|ERROR:RESOURCE|ERROR:RENDER|ERROR:GAMEOBJECT|Lua stack|attempt to|shader.*failed/i.test(message.text()))result.runtime_errors.push(message.text());});
      page.on('response',response=>{if(response.status()>=400)result.http_errors.push({url:response.url(),status:response.status()});});
      try{
        await page.goto(kind==='original'?'http://127.0.0.1:18981/':'http://127.0.0.1:18982/',{waitUntil:'load',timeout:60000});
        await page.bringToFront();
        if(kind==='original')await page.waitForFunction(()=>window.__coinSourceGame?.scene.getScene('GameScene')?.levels?.length===3, null,{timeout:60000});
        else await page.waitForFunction(()=>!!window.__coinState,null,{timeout:60000});
        const state=async()=>page.evaluate(kind=>{
          if(kind==='defold')return window.__coinState;
          const scene=window.__coinSourceGame.scene.getScene('GameScene');
          return {active:scene.activeLevelIndex+1,ended:scene.ended,camera:{x:scene.cameraState.targetX,y:scene.cameraState.targetY,zoom:scene.cameraState.zoom},
            phase:scene.endcard?'endcard':scene.ended?'ending':scene.activeLevelIndex<0?'overview':scene.levels[scene.activeLevelIndex].enabled&&!scene.levels[scene.activeLevelIndex].resolving?'playing':'busy',
            levels:scene.levels.map(level=>({offsets:level.rowSegmentLaneOffsets,cleared:level.clearedLaneCount,locked:level.locked}))};
        },kind);
        const waitState=async(predicate,timeout=20000)=>{
          const deadline=Date.now()+timeout;
          while(Date.now()<deadline){const s=await state();if(predicate(s))return s;await page.waitForTimeout(100);}
          throw Error('State timeout: '+JSON.stringify(await state()));
        };
        result.initial=await state();assert.equal(result.initial.active,0);
        result.stage='playing';result.url=page.url();await save();
        if(kind==='defold'){assert.equal(result.initial.viewport.w,viewport.width);assert.equal(result.initial.viewport.h,viewport.height);}
        await page.mouse.click(viewport.width/2,viewport.height/2,{delay:120});
        await waitState(s=>s.active===1&&s.phase==='playing');
        let moves=0;
        for(const [index,row,step,matches]of replay){
          const before=await waitState(s=>s.active===index&&s.phase==='playing');
          const cfg=config.LEVEL_CONFIGS[index-1];
          const metrics=await page.evaluate(()=>({w:innerWidth,h:innerHeight}));
          const s=Math.min(metrics.w/1080,metrics.h/1920),z=s*before.camera.zoom;
          const rowWidth=(cfg.coinsPerRowSegment-1)*11+60;
          const worldX=cfg.centerX+(row-1-(cfg.rowSegmentCount-1)/2)*(rowWidth-33-15);
          const x=metrics.w/2+(worldX-before.camera.x)*z;
          const y=metrics.h/2+(cfg.centerY-before.camera.y)*z;
          const old=before.levels[index-1].offsets[row-1];
          await page.mouse.move(x,y);await page.mouse.down();await page.waitForTimeout(100);
          await page.mouse.move(x,y-step*46.8*z,{steps:10});await page.waitForTimeout(100);await page.mouse.up();moves++;
          const target=(old+step+12)%12;
          await waitState(s=>s.levels[index-1].offsets[row-1]===target&&(kind!=='defold'||s.moves>=moves));
          const expected=before.levels[index-1].cleared+matches.length;
          const after=await waitState(s=>s.levels[index-1].cleared===expected&&(s.active>index||s.phase==='playing'));
          result.actions.push({level:index,row,step,expected_cleared:expected,actual_cleared:after.levels[index-1].cleared});
          await save();
        }
        await waitState(s=>s.active===3&&s.phase==='playing');
        await page.mouse.click(viewport.width/2,viewport.height/2,{delay:120});
        result.end=await waitState(s=>s.phase==='endcard',15000);
        await page.waitForTimeout(700);
        result.calls=await page.evaluate(()=>window.__qaCalls);
        assert.ok(result.calls.lifecycle.includes('gameStart'));
        assert.ok(result.calls.lifecycle.includes('gameEnd'));
        assert.ok(result.calls.events.includes('ENDCARD_SHOWN'));
        assert.deepEqual(result.calls.events,['DISPLAYED','CHALLENGE_STARTED','CHALLENGE_SOLVED','CHALLENGE_SOLVED','ENDCARD_SHOWN','CTA_CLICKED']);
        assert.equal(result.calls.gpu.length,0,'all WebGL shaders/programs compiled');
        if(kind==='defold'){
          result.local_cta=await page.evaluate(()=>CoinHost.calls.length);
          assert.equal(result.local_cta,1);assert.equal(context.pages().length,1);
          await page.evaluate(()=>dispatchEvent(new Event('luna:pause')));
          const paused=await state();await page.waitForTimeout(300);const later=await state();
          assert.ok(Math.abs(paused.time-later.time)<.15,'simulation pauses');
          await page.evaluate(()=>dispatchEvent(new Event('luna:resume')));
          const rotated={width:viewport.height,height:viewport.width};
          await page.setViewportSize(rotated);
          await page.waitForTimeout(500);
          result.landscape=await state();
          assert.equal(result.landscape.phase,'endcard');
          assert.equal(result.landscape.viewport.w,rotated.width);assert.equal(result.landscape.viewport.h,rotated.height);
          assert.ok(result.landscape.time>paused.time+.1,'simulation resumes');
          result.pause_resume=true;
        }
        assert.equal(result.errors.length,0);assert.equal(result.runtime_errors.length,0);assert.equal(result.http_errors.length,0);
        result.status='PASS';
        result.stage='complete';
      }catch(error){result.status='FAIL';result.failure=error.stack;result.dom=await page.evaluate(()=>({hit:document.elementFromPoint(innerWidth/2,innerHeight/2)?.outerHTML.slice(0,1500),canvas:[...document.querySelectorAll('canvas')].map(c=>({id:c.id,rect:c.getBoundingClientRect().toJSON(),width:c.width,height:c.height})),host:window.CoinHost?.audioState()})).catch(()=>null);}
      await context.close();
      await browser.close();browser=null;
      await fs.writeFile(path.join(root,'qa/browser.json'),JSON.stringify(report,null,2)+'\n');
    }
  }finally{if(browser)await browser.close();await fs.writeFile(path.join(root,'qa/browser.json'),JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify(report));
  if(report.runs.some(run=>run.status!=='PASS'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
