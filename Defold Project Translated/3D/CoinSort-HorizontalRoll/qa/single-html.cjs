// Run the delivered HTML offline in a headed browser with no companion files.
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const {chromium}=require(path.resolve(root,'../../../reference/BBS-Corners/node_modules/playwright'));
const config=require(path.join(root,'docs/source-constants.json'));
const brand=require(path.join(root,'branding.json'));

(async()=>{
  const metadata=JSON.parse(await fs.readFile(path.join(root,'qa/single-html-package.json'),'utf8'));
  const isolated=await fs.mkdtemp(path.join(os.tmpdir(),'token-roll-standalone-'));
  const file=path.join(isolated,brand.filename);
  await fs.copyFile(metadata.file,file);
  assert.equal((await fs.readdir(isolated)).length,1);
  const replay=JSON.parse(await fs.readFile(path.join(root,'qa/rotation-replay.json'),'utf8'));
  const report={started:new Date().toISOString(),headed:true,screenshots:true,offline:true,file:metadata.file,sha256:metadata.sha256,isolated_directory:isolated,runs:[]};
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
    const browser=await chromium.launch({headless:false,args:['--mute-audio']});
    const context=await browser.newContext({viewport,offline:true});
    const page=await context.newPage();
    const result={viewport,actions:[],requests:[],errors:[],runtime_errors:[],stage:'startup'};
    report.runs.push(result);
    result.visual=[];
    const capture=async stage=>{
      const filename=path.join(root,`qa/render-${viewport.width}-${stage}.png`);
      await page.screenshot({path:filename});
      result.visual.push({stage,file:path.basename(filename),...JSON.parse(execFileSync('python',[path.join(root,'qa/check_render.py'),filename],{encoding:'utf8'}))});
    };
    const save=()=>fs.writeFile(path.join(root,'qa/single-html-results.json'),JSON.stringify(report,null,2)+'\n');
    page.on('request',request=>result.requests.push(request.url()));
    page.on('pageerror',error=>result.errors.push(error.message));
    page.on('console',message=>{if(/ERROR:SCRIPT|ERROR:GRAPHICS|ERROR:RESOURCE|ERROR:RENDER|ERROR:GAMEOBJECT|Lua stack|attempt to/.test(message.text()))result.runtime_errors.push(message.text());});
    try{
      await save();
      await page.goto(pathToFileURL(file).href,{waitUntil:'load',timeout:60000});
      await page.bringToFront();
      await page.waitForFunction(()=>window.__coinState?.render_frames>1,null,{timeout:60000});
      assert.equal(await page.title(),brand.name);
      assert.equal(await page.evaluate(()=>TokenRollEmbedded.name),brand.name);
      assert.equal(await page.evaluate(()=>CoinHost.local),true,'file:// CTA guard');
      assert.ok(await page.evaluate(()=>document.querySelector('link[rel="icon"]').href.startsWith('data:image/png;base64,')));
      assert.equal(await page.locator('script[src]').count(),0);
      const state=()=>page.evaluate(()=>window.__coinState);
      const waitState=async predicate=>{
        const deadline=Date.now()+25000;
        while(Date.now()<deadline){const s=await state();if(predicate(s))return s;await page.waitForTimeout(100);}
        throw Error('State timeout: '+JSON.stringify(await state()));
      };
      result.initial=await state();
      await capture('start');
      assert.equal(result.initial.viewport.w,viewport.width);assert.equal(result.initial.viewport.h,viewport.height);
      await page.mouse.click(viewport.width/2,viewport.height/2,{delay:120});
      await waitState(s=>s.active===1&&s.phase==='playing');
      result.stage='playing';await save();
      await capture('playing');
      let moves=0;
      for(const [index,row,step,matches]of replay){
        const before=await waitState(s=>s.active===index&&s.phase==='playing');
        const cfg=config.LEVEL_CONFIGS[index-1],scale=Math.min(viewport.width/1080,viewport.height/1920),zoom=scale*before.camera.zoom;
        const spacing=(cfg.coinsPerRowSegment-1)*11+60-33-15;
        const worldX=cfg.centerX+(row-1-(cfg.rowSegmentCount-1)/2)*spacing;
        const x=viewport.width/2+(worldX-before.camera.x)*zoom,y=viewport.height/2+(cfg.centerY-before.camera.y)*zoom;
        const old=before.levels[index-1].offsets[row-1];
        await page.mouse.move(x,y);await page.mouse.down();await page.waitForTimeout(100);
        await page.mouse.move(x,y-step*46.8*zoom,{steps:10});await page.waitForTimeout(100);await page.mouse.up();moves++;
        await waitState(s=>s.levels[index-1].offsets[row-1]===(old+step+12)%12&&s.moves>=moves);
        const expected=before.levels[index-1].cleared+matches.length;
        const after=await waitState(s=>s.levels[index-1].cleared===expected&&(s.active>index||s.phase==='playing'));
        result.actions.push({level:index,row,step,cleared:after.levels[index-1].cleared});await save();
      }
      await waitState(s=>s.active===3&&s.phase==='playing');
      await page.mouse.click(viewport.width/2,viewport.height/2,{delay:120});
      result.end=await waitState(s=>s.phase==='endcard');
      await page.waitForTimeout(700);
      await capture('endcard');
      assert.equal(await page.evaluate(()=>CoinHost.calls.length),1);assert.equal(context.pages().length,1);
      result.events=await page.evaluate(()=>CoinHost.events.map(e=>e.name));
      assert.deepEqual(result.events,['DISPLAYED','CHALLENGE_STARTED','CHALLENGE_SOLVED','CHALLENGE_SOLVED','ENDCARD_SHOWN','CTA_CLICKED']);
      const rotated={width:viewport.height,height:viewport.width};await page.setViewportSize(rotated);
      await waitState(s=>s.viewport.w===rotated.width&&s.viewport.h===rotated.height);
      const documentURL=pathToFileURL(file).href;
      result.external_requests=result.requests.filter(url=>url!==documentURL&&!url.startsWith('data:')&&!url.startsWith('blob:'));
      assert.equal(result.external_requests.length,0,'no network or sibling files');
      assert.equal(result.errors.length,0);assert.equal(result.runtime_errors.length,0);
      result.status='PASS';result.stage='complete';
    }catch(error){result.status='FAIL';result.failure=error.stack;}
    finally{await browser.close();await save();}
  }
  const current=await fs.readFile(metadata.file);assert.equal(crypto.createHash('sha256').update(current).digest('hex'),metadata.sha256);
  const names=await fs.readdir(path.dirname(metadata.file));
  assert.equal(names.filter(name=>name.toLowerCase().replace(/[^a-z0-9]/g,'')===brand.filename.toLowerCase().replace(/[^a-z0-9]/g,'')).length,1);
  report.output_names=names;await fs.writeFile(path.join(root,'qa/single-html-results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({file:report.file,offline:true,headed:true,runs:report.runs.map(run=>({viewport:run.viewport,status:run.status,actions:run.actions.length,errors:run.errors,failure:run.failure,external_requests:run.external_requests}))}));
  if(report.runs.some(run=>run.status!=='PASS'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
