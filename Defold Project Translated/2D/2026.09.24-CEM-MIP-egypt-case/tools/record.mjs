// Browser-native recordings: real WebGL frames and matching pointer sequences.
import {chromium} from 'playwright';import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const viewport={width:390,height:844};const s=390/1080,oy=(844-1920*s)/2;
const point=(x,y)=>({x:x*s,y:oy+y*s});
async function drag(page,i,to){const a=point(32+1016/6*(i+.5),1222.5),b=point(to[0],to[1]);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.waitForTimeout(100);await page.mouse.move(b.x,b.y,{steps:18});await page.waitForTimeout(100);await page.mouse.up();await page.waitForTimeout(800);}
try{
for(const [name,url] of [['reference','http://127.0.0.1:8176/'],['defold','http://127.0.0.1:8174/dist/']]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  await page.addInitScript(()=>{window.open=()=>{};window.GAME_CONFIG={MUTE:true};});
  let readyResolve;const ready=new Promise(resolve=>readyResolve=resolve);page.on('console',m=>{if(m.text().includes('[Analytics] DISPLAYED'))readyResolve();});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
  await Promise.race([ready,new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error(name+' not ready')),60000);timer.unref();})]);
  await page.evaluate(()=>{
    const stream=document.querySelector('canvas').captureStream(20);window.__recordedChunks=[];
    window.__recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});
    window.__recorder.ondataavailable=e=>{if(e.data.size)window.__recordedChunks.push(e.data);};window.__recorder.start(250);
  });
  await page.waitForTimeout(6500);await page.mouse.click(4,4,{delay:100});await page.waitForTimeout(400);
  await drag(page,0,[305,940]);
  for(const [i,to] of [[0,[260,350]],[1,[305,940]],[2,[775,970]],[3,[735,190]],[4,[845,380]],[5,[850,780]]])await drag(page,i,to);
  await page.waitForTimeout(2300);
  const encoded=await page.evaluate(()=>new Promise(resolve=>{
    window.__recorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(window.__recordedChunks,{type:'video/webm'}));};window.__recorder.stop();
  }));
  await fs.writeFile(`qa/evidence/${name}-gameplay.webm`,Buffer.from(encoded,'base64'));
  console.log('Recorded '+name);await page.close();
}
}finally{await browser.close();}
