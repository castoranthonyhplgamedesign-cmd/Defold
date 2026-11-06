import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { launchBrowser, connect, openPage, sleep } from '../qa-2026-10-29/cdp-isolated.mjs';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out,'../..');
const video = 'Assets/Mock_Up/sdp_cantreach_sandshovel_59s_1080x1920.mp4';
const sampleRate = 11025;
const mime = {'.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.html':'text/html'};
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]); }
const sources = [video,...walk(path.join(root,'Assets/Audio')).filter(f=>/\.(mp3|wav)$/i.test(f)).map(f=>path.relative(root,f).replaceAll('\\','/')),...walk(path.join(root,'Assets/Runtime/audio')).filter(f=>/\.mp3$/i.test(f)).map(f=>path.relative(root,f).replaceAll('\\','/'))];
const manifest = {video,sampleRate,metadata:null,files:[],errors:[]};
const server = http.createServer((req,res)=>{
  if(req.url==='/') {res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><html><body><video id="v" muted playsinline preload="metadata"></video></body></html>');return;}
  let target;
  try{target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));}catch{res.writeHead(400);res.end();return;}
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return;}
  const size=fs.statSync(target).size;
  const headers={'Content-Type':mime[path.extname(target).toLowerCase()]||'application/octet-stream','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(range){const start=+range[1],end=range[2]?Math.min(+range[2],size-1):size-1;res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(target,{start,end}).pipe(res);}
  else{res.writeHead(200,{...headers,'Content-Length':size});fs.createReadStream(target).pipe(res);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,cdp;
const save=()=>fs.writeFileSync(path.join(out,'decoded.json'),JSON.stringify(manifest,null,2));
try{
  browser=await launchBrowser();cdp=await connect(browser.wsUrl);
  const page=await openPage(cdp,{url:`http://127.0.0.1:${server.address().port}/`,width:540,height:960,dpr:1});
  manifest.metadata=await page.evaluate(`(async()=>{const v=document.querySelector('video');v.src=${JSON.stringify('/'+video)};await new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=()=>j(Error(v.error?.message||'video metadata'));});return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,audioTracks:v.audioTracks?.length??null};})()`);
  console.log('VIDEO',JSON.stringify(manifest.metadata));
  await page.evaluate(`window.__decode=async function(url){const ctx=new OfflineAudioContext(1,1,${sampleRate});const buffer=await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());const mono=new Float32Array(buffer.length);const channels=[];for(let c=0;c<buffer.numberOfChannels;c++)channels.push(buffer.getChannelData(c));let sum=0,peak=0;for(let i=0;i<mono.length;i++){let value=0;for(let c=0;c<channels.length;c++)value+=channels[c][i]/channels.length;mono[i]=value;sum+=value*value;peak=Math.max(peak,Math.abs(value));}window.__decodedBytes=new Uint8Array(mono.buffer);return {duration:buffer.duration,sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,samples:mono.length,rms:Math.sqrt(sum/mono.length),peak};};window.__chunk=function(offset,length){const bytes=window.__decodedBytes.subarray(offset,offset+length);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary)};`);
  fs.mkdirSync(path.join(out,'pcm'),{recursive:true});
  for(let i=0;i<sources.length;i++){
    const source=sources[i];const id=source===video?'reference':`${String(i).padStart(3,'0')}-${path.basename(source,path.extname(source)).replaceAll(' ','_')}`;
    try{
      const result=await page.evaluate(`window.__decode(${JSON.stringify('/'+source)})`);
      const chunks=[];
      for(let offset=0;offset<result.samples*4;offset+=131072) chunks.push(Buffer.from(await page.evaluate(`window.__chunk(${offset},131072)`),'base64'));
      const bytes=Buffer.concat(chunks);
      fs.writeFileSync(path.join(out,'pcm',id+'.f32'),bytes);
      manifest.files.push({id,source,pcm:'pcm/'+id+'.f32',sourceBytes:fs.statSync(path.join(root,source)).size,...result});
      if(i===0||i%20===0)console.log('DECODED',i+1,'/',sources.length,source,result.duration);
      save();
    }catch(error){manifest.errors.push({source,error:error.message});console.warn('DECODE FAILED',source,error.message);save();}
  }
  // Seek the actual reference, not an authored recreation, to create time-labelled visual evidence.
  fs.mkdirSync(path.join(out,'frames'),{recursive:true});
  for(const time of [0.1,1,2,4,8,12,16,20,24,28,32,36,40,44,48,52,56,Math.min(58.5,manifest.metadata.duration-.1)]){
    await page.evaluate(`(async()=>{const v=document.querySelector('video');v.style.cssText='position:fixed;inset:0;width:100%;height:100%;object-fit:contain;background:#111';v.currentTime=${time};await new Promise(r=>v.addEventListener('seeked',r,{once:true}));await new Promise(requestAnimationFrame);})()`);
    await page.screenshot(path.join(out,'frames',String(time).padStart(4,'0')+'.png'));
  }
  console.log('DONE',manifest.files.length,'files;',manifest.errors.length,'decode errors');
}finally{save();cdp?.close();await browser?.close();await new Promise(resolve=>server.close(resolve));}
