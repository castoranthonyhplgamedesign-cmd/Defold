import {readConveyorGLB,importConveyor,conveyorSurfaces,conveyorPieces} from './import-glb';
import {meshPreview} from './mesh-preview';
import type {FlowDocument} from '../../src/layout/arrowFlow';

export async function openArtistImport(file:File,apply:(conveyor:FlowDocument['conveyor'])=>boolean){
 const dialog=document.createElement('dialog');dialog.className='artist-import';
 dialog.innerHTML=`<h2>Import conveyor</h2><p class="import-file"></p><p class="import-status" role="status">Reading your model...</p><div class="import-controls" hidden><svg id="artist-preview" role="img" aria-label="Conveyor shape and arrow route"></svg><p id="artist-footprint" class="small"></p><p class="small">The dashed line is the route arrows will follow.</p><label>Conveyor size<select id="artist-size"><option value="1.1">Smaller</option><option value="1.3" selected>Standard (recommended)</option><option value="2">Larger</option><option value="3">Largest</option><option value="custom" disabled>Custom size</option></select></label><p class="small">Scales the whole conveyor. Start with Standard; you can draw your arrows after importing.</p><div class="row"><button id="artist-left">Rotate left</button><button id="artist-right">Rotate right</button></div><input id="artist-turns" type="hidden" value="0"><details id="artist-advanced"><summary>Advanced: choose model parts</summary><p class="small">Usually no changes are needed here. Use these controls if the wrong pieces were detected.</p><label>Moving belt<select id="artist-surface"></select></label><p class="small">The flat loop that arrows travel on. These names come from the artist's file.</p><fieldset><legend>Frame and attached details</legend><div id="artist-borders"></div></fieldset><p class="small">Keep the frame and its attached artwork, including whiskers. Only exclude objects that are unrelated to this conveyor.</p><label>Exact belt width<input id="artist-width" type="number" min="1.1" max="3" step=".1" value="1.3"></label><p class="small">Measured in arrow-grid squares. Changing this also scales the whole model.</p><p id="artist-details" class="small"></p><p class="small">Supports static GLB files with a flat horizontal ring and separate frame pieces. Rounded geometry and attached details are retained; colors use the playable's belt and frame materials.</p></details></div><p class="small">Only the conveyor is replaced. Your arrows and cannons stay; a change that does not fit is rejected. You can Undo an import.</p><div class="row"><button id="apply-artist" class="primary" disabled>Import conveyor</button><button id="cancel-artist">Cancel</button></div>`;
 document.body.append(dialog);dialog.querySelector('.import-file')!.textContent=file.name;dialog.showModal();
 const get=<T extends HTMLElement>(selector:string)=>dialog.querySelector<T>(selector)!;
 const status=get<HTMLParagraphElement>('.import-status'),applyButton=get<HTMLButtonElement>('#apply-artist'),advanced=get<HTMLDetailsElement>('#artist-advanced');
 let candidate:FlowDocument['conveyor']|null=null;
 dialog.addEventListener('close',()=>dialog.remove());get<HTMLButtonElement>('#cancel-artist').onclick=()=>dialog.close();
 applyButton.onclick=()=>{if(candidate&&apply(candidate))dialog.close();else status.textContent='This conveyor does not fit the current placements. Cancel to keep working, or start a New level before importing.';};
 try{
  if(file.size>20_000_000)throw new Error('Choose a GLB smaller than 20 MB.');
  const parts=readConveyorGLB(await file.arrayBuffer());if(!dialog.isConnected)return;
  const surface=get<HTMLSelectElement>('#artist-surface'),matches=conveyorSurfaces(parts);
  surface.add(new Option('Choose the moving belt...', ''));parts.forEach((p,i)=>surface.add(new Option(p.name,String(i))));
  surface.value=matches.length===1?String(matches[0]):'';
  const borders=get<HTMLDivElement>('#artist-borders'),size=get<HTMLSelectElement>('#artist-size'),widthInput=get<HTMLInputElement>('#artist-width'),turns=get<HTMLInputElement>('#artist-turns');
  function borderOptions(){const included=surface.value===''?[]:conveyorPieces(parts,Number(surface.value));borders.replaceChildren();parts.forEach((p,i)=>{if(surface.value!==''&&i===Number(surface.value))return;const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.value=String(i);box.checked=included.includes(i);box.onchange=update;label.append(box,document.createTextNode(p.name));borders.append(label);});}
  function update(){
   candidate=null;applyButton.disabled=true;const svg=get<SVGSVGElement & HTMLElement>('#artist-preview');svg.replaceChildren();get('#artist-footprint').textContent='';get('#artist-details').textContent='';
   if(surface.value===''){advanced.open=true;status.textContent=matches.length>1?'More than one belt shape was found. Choose the moving belt under Advanced.':'The belt could not be identified automatically. Choose the moving belt under Advanced.';return;}
   const selected=Array.from(borders.querySelectorAll<HTMLInputElement>('input:checked'),e=>Number(e.value));
   if(!selected.length){advanced.open=true;status.textContent='Choose the frame pieces that belong to the conveyor under Advanced.';return;}
   try{
    candidate=importConveyor(parts,Number(surface.value),selected,Number(widthInput.value),Number(turns.value));
    const rings=candidate.mesh!.surface,all=rings.flat(),xs=all.map(p=>p[0]),ys=all.map(p=>-p[1]),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
    svg.setAttribute('viewBox',`${left-1} ${top-1} ${width+2} ${height+2}`);
    const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
    defs.innerHTML='<pattern id="artist-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 H 0 V 1" fill="none" stroke="#d4d7ca" stroke-width=".04"/></pattern>';
    const grid=document.createElementNS('http://www.w3.org/2000/svg','rect');
    for(const [key,value]of Object.entries({x:left-1,y:top-1,width:width+2,height:height+2,fill:'url(#artist-grid)'}))grid.setAttribute(key,String(value));svg.append(defs,grid);
    const path=(d:string,attrs:Record<string,string>)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);Object.entries(attrs).forEach(([k,v])=>p.setAttribute(k,v));svg.append(p);};
    const outline=(r:number[][])=>'M '+r.map(p=>`${p[0]},${-p[1]}`).join(' L ')+' Z';
    meshPreview(candidate.mesh!).forEach((d,i)=>path(d,{fill:i?'#b9c3b5':'#6d756e'}));path(outline(candidate.points),{fill:'none',stroke:'#377958','stroke-width':'.08','stroke-dasharray':'.3 .2'});
    get('#artist-footprint').textContent=`Size on the grid: ${width.toFixed(1)} wide by ${height.toFixed(1)} tall. One grid square holds one arrow block.`;
    get('#artist-details').textContent=`${candidate.points.length} path points; ${[Number(surface.value),...selected].reduce((n,i)=>n+parts[i].index.length/3,0).toLocaleString()} triangles.`;
    status.textContent=JSON.stringify(candidate).length>1_300_000?'Artwork preserved. You can import and play test; the final ad may need mesh optimization to meet its 4 MB limit.':'Conveyor ready. Check the shape below, then import.';applyButton.disabled=false;
   }catch(error){status.textContent=(error as Error).message;advanced.open=true;}
  }
  surface.onchange=()=>{borderOptions();update();};
  size.onchange=()=>{widthInput.value=size.value;update();};widthInput.onchange=()=>{size.value=['1.1','1.3','2','3'].includes(widthInput.value)?widthInput.value:'custom';update();};
  for(const [id,delta]of [['#artist-left',1],['#artist-right',-1]] as const)get<HTMLButtonElement>(id).onclick=()=>{turns.value=String((Number(turns.value)+delta+4)%4);update();};
  get<HTMLDivElement>('.import-controls').hidden=false;borderOptions();update();
 }catch(error){status.textContent=(error as Error).message;}
}
