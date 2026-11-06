import '../src/style.css';
import {parseFlowDocument,flowRuntime,type FlowDocument} from '../src/layout/arrowFlow';
import {Simulation} from '../src/core/simulation';
import {ConveyorPath} from '../src/core/path';
import {Session} from '../src/core/session';
import {createScene} from '../src/render/scene';
import {bindTaps} from '../src/input/taps';
const style=document.createElement('style');style.textContent='body{display:flex;flex-direction:column}#preview-bar{box-sizing:border-box;min-height:76px;flex:none;padding:10px;background:#25273f;font:14px Arial;display:flex;gap:10px;flex-wrap:wrap;align-items:center}#preview-status{flex:1;min-width:180px}#game{height:auto;flex:1;min-height:0}';document.head.append(style);
const root=document.getElementById('game')!,status=document.getElementById('preview-status')!;
if(new URLSearchParams(location.search).has('embedded'))document.querySelector<HTMLElement>('#preview-bar label')!.hidden=true;
let current:FlowDocument|undefined,view:Awaited<ReturnType<typeof createScene>>|undefined,unbind:(()=>void)|undefined,loading=false;
function close(){
  unbind?.();const gl=view?.canvas.getContext('webgl2');view?.dispose();
  gl?.getExtension('WEBGL_lose_context')?.loseContext();view=undefined;unbind=undefined;
}
async function open(value:unknown){
  if(loading){status.textContent='Please wait for the current level to finish loading.';return;}
  let doc:FlowDocument;
  try{doc=parseFlowDocument(value);}catch(error){status.textContent=(error as Error).message;return;}
  loading=true;root.dataset.levelReady='false';
  try{
    const data=flowRuntime(doc),simulation=new Simulation(data.arrows,new ConveyorPath(data.path,.1,'first-intersection'),data.shooters),session=new Session(simulation,Infinity);
    close();root.replaceChildren();status.textContent='Loading level…';
    view=await createScene(root,simulation,session,()=>{status.textContent='CTA disabled in the editor preview.';},()=>{},false,{points:data.path,width:data.trackWidth,mesh:data.trackMesh,origin:data.trackOrigin});
    unbind=bindTaps(view.canvas,view.pick,id=>{session.launch(id);view!.wake();});current=doc;
    status.textContent=`${doc.name} · ${doc.board.arrows.length} arrows · ${doc.cannons.length} lanes · muted`;
    root.dataset.levelReady='true';
  }catch(error){status.textContent=`Preview failed: ${(error as Error).message}`;}finally{loading=false;}
}
document.getElementById('level-file')!.addEventListener('change',async event=>{
  const input=event.target as HTMLInputElement,file=input.files?.[0];input.value='';if(!file)return;
  try{if(file.size>4_000_000)throw new Error('Level JSON exceeds 4 MB');await open(JSON.parse(await file.text()));}catch(error){status.textContent=(error as Error).message;}
});
document.getElementById('restart')!.addEventListener('click',()=>{if(current)void open(current);});
window.addEventListener('message',event=>{
  const localOpener=event.source===window.opener&&/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(event.origin);
  const sameOriginParent=window.parent!==window&&event.source===window.parent&&event.origin===location.origin;
  if((!localOpener&&!sameOriginParent)||event.data?.type!=='arrow-flow-level')return;
  void open(event.data.level);
});
// Only the initiating local editor is notified; no game assets or SDK requests are made.
if(window.opener&&document.referrer){const origin=new URL(document.referrer).origin;if(/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(origin))window.opener.postMessage({type:'arrow-flow-ready'},origin);}
if(window.parent!==window)window.parent.postMessage({type:'arrow-flow-ready'},location.origin);
window.addEventListener('pagehide',close);
