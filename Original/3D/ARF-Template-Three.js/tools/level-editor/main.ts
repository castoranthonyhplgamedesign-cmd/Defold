import './style.css';
import starter from '../../examples/levels/four-sides.arrow-flow.json';
import reference from '../../examples/levels/reference.arrow-flow.json';
import {flowColors,flowWarnings,parseFlowDraft,parseFlowDocument,insideLoop,offsetLoop,cannonPose,anchorAt,conveyorPoints,gridPoint,gridCell,type FlowDocument,type FlowColor,type Pair} from '../../src/layout/arrowFlow';
import {same,arrowCells,preset,setLoop,appendCorner,extendArrow,makeArrow,nearestProgress,checkedDraft,alignPoint,ammoBudget,cannonBase,arrangeCannons,arrowPoints,centerGrid,usableGridCells} from './model';
import {meshPreview} from './mesh-preview';
import {blockFootprint,fitsConveyor,clearanceConflicts,checkClearanceEdit,requireClearance} from '../../src/layout/visualClearance';

const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const key='arrow-flow-simple-editor-v1';
let doc=parseFlowDocument(starter),step=0,color:FlowColor='green',selectedArrow='',selectedCannon='',erase=false,outline=false;
let outlinePoints:Pair[]|null=null,ink:Pair[]|null=null,hover:Pair|null=null,ghost:FlowDocument|null=null;
let past:FlowDocument[]=[],future:FlowDocument[]=[];
let outlinePast:Pair[][]=[],outlineFuture:Pair[][]=[],outlineError='';
let drag:{kind:'corner'|'arrow'|'cannon'|'target'|'ink'|'outline';index:number;start:Pair;pointer:number;base:FlowDocument; moved:boolean}|null=null;
let bounds=[-16,-16,32,32],previewDoc:FlowDocument|null=null;
let alignment:ReturnType<typeof alignPoint>|null=null;
let lastPointer:{clientX:number;clientY:number;pointerId:number}|null=null;
try{const saved=localStorage.getItem(key);if(saved)doc=parseFlowDraft(JSON.parse(saved));}catch{/* The starter remains available when a stored draft is invalid. */}

$('studio').innerHTML=`<header><div class="brand"><span class="brand-mark" aria-hidden="true">↗</span><span>Arrow Flow<small>LEVEL EDITOR</small></span></div><div class="document-name"><label for="level-name">Working file</label><input id="level-name" maxlength="128"></div><div class="file-actions"><button id="new-level">New</button><button id="import-level">Open</button><input id="level-file" type="file" accept=".json,application/json" hidden></div><div class="delivery-actions"><button id="play-test" class="primary">▶ Play test</button><button id="export-level">Export level ↗</button></div></header>
<nav aria-label="Level creation steps"><span class="nav-label">BUILD</span>${['Conveyor','Arrows','Cannons'].map((name,i)=>`<button data-step="${i}"><span>0${i+1}</span>${name}</button>`).join('')}<p>Edit in any order</p></nav>
<main><section class="workspace" aria-label="Level drawing area"><div class="canvas-top"><div class="view-label">TOP VIEW <span id="tool-state"></span></div><div class="history"><button id="undo" aria-label="Undo" title="Undo (Ctrl+Z)">↶</button><button id="redo" aria-label="Redo" title="Redo (Ctrl+Shift+Z)">↷</button></div><button id="fit-view">Fit view</button></div><svg id="board" role="img" tabindex="0" aria-label="Level canvas. Choose a step, then draw or select objects."></svg><div class="canvas-help"><span id="canvas-hint"></span><kbd>Esc</kbd><span>cancel</span></div><div class="canvas-bottom"><span id="counts"></span><span id="save-status">Saved in this browser</span></div></section><aside aria-label="Tool inspector"><div id="panel"></div><div class="review"><h3>Level checks</h3><p id="readiness"></p><ul id="warnings"></ul></div><button id="next-step" class="next"></button></aside></main>
<div id="message" role="status" aria-live="polite"></div><dialog id="preview-dialog"><div class="dialog-bar"><strong>Play your level</strong><span>Muted preview · your edit stays here</span><button id="close-preview">Back to editing</button></div><div id="preview-frame"></div></dialog>`;
const svg=$('board') as unknown as SVGSVGElement;
let messageTimer:ReturnType<typeof setTimeout>;
function tell(message:string){$('message').textContent=message;$('message').classList.add('visible');clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('message').classList.remove('visible'),5500);}
function save(){try{localStorage.setItem(key,JSON.stringify(doc));$('save-status').textContent='Saved in this browser';}catch{$('save-status').textContent='Browser storage is full — export to keep your work';}}
function commit(change:(next:FlowDocument)=>void,fit=false,importing=false){
 try{const next=structuredClone(doc);change(next);const valid=checkedDraft(next);if(!importing)checkClearanceEdit(doc,valid);if(JSON.stringify(valid)!==JSON.stringify(doc)){past.push(doc);if(past.length>50)past.shift();future=[];doc=valid;save();}ghost=null;if(fit)fitView();render();return true;}
 catch(error){ghost=null;tell((error as Error).message);render();return false;}
}
function resetGesture(){drag=null;ghost=null;ink=null;outlinePoints=null;hover=null;outlinePast=[];outlineFuture=[];outlineError='';alignment=null;lastPointer=null;}
function selectStep(index:number){resetGesture();step=index;outline=false;erase=false;fitView();render();}
function undo(){if(outline){if(outlinePast.length){outlineFuture.push(outlinePoints??[]);outlinePoints=outlinePast.pop()!;outlineError='';alignment=null;hover=null;render();}return;}if(!past.length)return;resetGesture();future.push(doc);doc=past.pop()!;save();fitView();render();}
function redo(){if(outline){if(outlineFuture.length){outlinePast.push(outlinePoints??[]);outlinePoints=outlineFuture.pop()!;outlineError='';alignment=null;hover=null;render();}return;}if(!future.length)return;resetGesture();past.push(doc);doc=future.pop()!;save();fitView();render();}
function fitView(){
 const points=[...doc.conveyor.points,...doc.board.arrows.flatMap(a=>arrowPoints(doc,a)),...doc.cannons.map(c=>{const p=cannonPose(doc,c).position;return [p[0]-doc.origin[0],doc.origin[1]-p[2]] as Pair;})];
 const padding=step===2?8:3,left=Math.min(...points.map(p=>p[0]))-padding,right=Math.max(...points.map(p=>p[0]))+padding,bottom=Math.min(...points.map(p=>p[1]))-padding,top=Math.max(...points.map(p=>p[1]))+padding;
 bounds=[left,-top,right-left,top-bottom];svg.setAttribute('viewBox',bounds.join(' '));
}
const swatches=(selected:FlowColor=color,attribute='color')=>`<div class="palette" aria-label="Arrow colors">${Object.entries(flowColors).map(([name,hex])=>`<button data-${attribute}="${name}" class="swatch ${selected===name?'chosen':''}" style="--swatch:${hex}" aria-label="${name}" aria-pressed="${selected===name}" title="${name}"></button>`).join('')}</div>`;
function ammoSummary(){
 const rows=ammoBudget(doc),total=rows.reduce((sum,row)=>({blocks:sum.blocks+row.blocks,ammo:sum.ammo+row.ammo,missing:sum.missing+row.missing}),{blocks:0,ammo:0,missing:0});
 return `<section class="ammo-budget"><h3>Ammo by color</h3><p class="small">1 block = 1 shot, including arrowheads. Assigned ammo includes every cannon and replacement.</p>${rows.length?`<table id="ammo-summary"><caption class="sr-only">Arrow blocks and assigned cannon ammo by color</caption><thead><tr><th scope="col">Color</th><th scope="col">Blocks</th><th scope="col">Ammo</th><th scope="col">Balance</th></tr></thead><tbody>${rows.map(r=>`<tr data-ammo-color="${r.color}"><th scope="row"><i style="background:${flowColors[r.color]}" aria-hidden="true"></i>${r.color}</th><td>${r.blocks}</td><td>${r.ammo}</td><td class="${r.missing?'short':r.ammo>r.blocks?'extra':'exact'}">${r.missing?`${r.missing} short`:r.ammo>r.blocks?`${r.ammo-r.blocks} extra`:'Exact'}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">Total</th><td>${total.blocks}</td><td>${total.ammo}</td><td class="${total.missing?'short':'exact'}">${total.missing?`${total.missing} short`:'Covered'}</td></tr></tfoot></table>`:'<p class="small">No blocks yet. Draw arrows in step 2 to see the ammo needed.</p>'}</section>`;
}
function bind(id:string,action:()=>void){$(id).onclick=action;}
function gridControls(){
 const grid=doc.board.grid??{size:1,offset:[0,0]};
 return `<section class="grid-controls"><h3>Arrow grid</h3><p class="small">Smaller cells fit more blocks. Adjustments move and resize existing arrows; the conveyor stays fixed.</p><label>Cell size<input id="grid-size" type="number" min=".5" max="1.5" step=".05" value="${grid.size}"></label><div class="row"><label>Horizontal<input id="grid-x" type="number" min="-1000" max="1000" step=".1" value="${grid.offset[0]}"></label><label>Vertical<input id="grid-y" type="number" min="-1000" max="1000" step=".1" value="${grid.offset[1]}"></label></div><button id="center-grid" class="wide">Center grid in conveyor</button><p class="small" id="grid-count">${usableGridCells(doc).length} usable cells shown in green. Faint outlines show block size. Keep their centers inside the opening; the raised rim can cover the edges.</p></section>`;
}
function render(){
 const arrow=doc.board.arrows.find(a=>a.id===selectedArrow),lane=doc.cannons.find(c=>c.id===selectedCannon);
 if(!arrow)selectedArrow='';if(!lane)selectedCannon='';
 $('level-name').setAttribute('title',doc.name);$<HTMLInputElement>('level-name').value=doc.name;
 document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(b=>{const active=Number(b.dataset.step)===step;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'step':'false');});
 $<HTMLButtonElement>('undo').disabled=outline?!outlinePast.length:!past.length;$<HTMLButtonElement>('redo').disabled=outline?!outlineFuture.length:!future.length;
 $('undo').title=outline?'Undo point (Ctrl+Z)':'Undo (Ctrl+Z)';$('redo').title=outline?'Redo point (Ctrl+Shift+Z / Ctrl+Y)':'Redo (Ctrl+Shift+Z / Ctrl+Y)';
 const pending=outline||!!ink,ready=doc.board.arrows.length>0&&!pending;
 $<HTMLButtonElement>('play-test').disabled=$<HTMLButtonElement>('export-level').disabled=!ready;
 $('counts').textContent=`${doc.board.arrows.length} arrow${doc.board.arrows.length===1?'':'s'} / ${doc.board.arrows.reduce((n,a)=>n+a.body.length+1,0)} blocks / ${doc.cannons.length} cannon${doc.cannons.length===1?'':'s'}`;
 const conflicts=clearanceConflicts(doc),checks=flowWarnings(doc);
 if(conflicts.length)checks.unshift(`${conflicts.length} blocks need more conveyor clearance. Move the red-marked block centers inside the opening before exporting.`);
 $('export-level').textContent=conflicts.length?'Save draft':'Export level ↗';
 $('readiness').textContent=pending?'Finish the drawing to play test.':!doc.board.arrows.length?'Place your first arrow to play test.':checks.length?`Playable · ${checks.length} check${checks.length===1?'':'s'} to review`:'Ready to play test';
 $('readiness').dataset.state=pending||!doc.board.arrows.length?'pending':checks.length?'warning':'ready';
 const warnings=$('warnings');warnings.replaceChildren();for(const warning of checks.slice(0,4)){const li=document.createElement('li');li.textContent=warning;warnings.append(li);}
 $('tool-state').textContent=step===0?(outline?'PLACING POINTS':doc.conveyor.mesh?'ARTIST MESH':'EDIT CONVEYOR'):step===1?(erase?'ERASE':arrow?'ARROW SELECTED':'DRAW / MOVE'):'PLACE / MOVE';
 svg.dataset.tool=step===0?(outline?'draw':'edit'):step===1?(erase?'erase':'draw'):'edit';
 $('next-step').textContent=step<2?`Next: ${step===0?'Arrows':'Cannons'} →`:'▶ Play test';$<HTMLButtonElement>('next-step').disabled=step===2&&!ready;
 if(step===0){
  $('panel').innerHTML=`<p class="eyebrow">TRACK / SHAPE</p><h1>Conveyor</h1><p class="intro">${doc.conveyor.mesh?"Artist mesh: rounded shape is preserved. Arrows and cannons remain editable.":"Choose a starting shape or connect your own points."}</p>${doc.conveyor.mesh?'<p class="tip">The artist conveyor is fixed. Choosing a preset or connecting new points replaces it with an editable polygon; Undo restores it.</p>':''}<button id="import-artist" class="wide">Import artist model (.glb)</button><input id="artist-file" type="file" accept=".glb,model/gltf-binary" hidden><div class="shapes"><button id="rectangle"><svg viewBox="0 0 64 40" aria-hidden="true"><path d="M 10 8 H 54 V 32 H 10 Z"/></svg>Rectangle</button><button id="notch"><svg viewBox="0 0 64 40" aria-hidden="true"><path d="M 8 6 H 24 V 21 H 40 V 6 H 56 V 34 H 8 Z"/></svg>Inward bend</button></div><button id="draw-outline" class="wide ${outline?'selected':''}">✎ Connect points</button>${outline?`<p id="outline-status" class="drawing-note" role="status"></p><div class="drawing-note">Click around the outline. Close on the green first point. Near-straight edges snap automatically.</div><div class="row"><button id="finish-outline" class="primary" ${!outlinePoints||outlinePoints.length<3?'disabled':''}>Finish outline</button><button id="cancel-outline">Cancel</button></div>`:''}<label>Belt width<select id="belt-width"><option value="1.3">Normal</option><option value="2">Wide</option><option value="3">Extra wide</option></select></label><label>Corner rounding<select id="corner-rounding"><option value="0">Sharp corners</option><option value="1">Small curves</option><option value="2">Medium curves</option><option value="3">Large curves</option></select></label><p class="small">Rounds drawn corners, including inward bends. Yellow points stay editable. Tight bends need enough room for the belt.</p><button id="reverse-belt" class="wide">⇄ Reverse movement</button>${!doc.conveyor.mesh?'<div class="tip">Drag a yellow handle to move a corner. Click + to add one. <br><kbd>Shift</kbd> locks 45&deg; angles. <kbd>Alt</kbd> bypasses alignment.</div>':''}<details><summary>Start from an example</summary><button id="load-starter" class="wide">Small playable example</button><button id="load-reference" class="wide">Reference level</button><button id="load-artist" class="wide">Artist rounded conveyor</button></details>`;
  bind('import-artist',()=>$<HTMLInputElement>('artist-file').click());
  $<HTMLInputElement>('artist-file').onchange=e=>{const input=e.target as HTMLInputElement,file=input.files?.[0];input.value='';if(file)void import('./artist-import').then(m=>m.openArtistImport(file,conveyor=>{const applied=commit(n=>{n.conveyor=conveyor;},true);if(applied){resetGesture();outline=false;render();}return applied;})).catch(e=>tell(e.message));};
  bind('rectangle',()=>{resetGesture();outline=false;commit(n=>setLoop(n,preset(n,'rectangle')),true);});bind('notch',()=>{resetGesture();outline=false;commit(n=>setLoop(n,preset(n,'notch')),true);});
  bind('draw-outline',()=>{resetGesture();outline=true;render();});
  if(outline){$('outline-status').textContent=outlineError||`${outlinePoints?.length??0} / 64 points placed. Click ${outlinePoints?.length?'the next point':'anywhere to start'}.`;$('outline-status').style.color=outlineError?'#b42332':'';bind('finish-outline',finishOutline);bind('cancel-outline',()=>{resetGesture();outline=false;render();});}
  const width=$<HTMLSelectElement>('belt-width');if(![1.3,2,3].includes(doc.conveyor.width)){const option=new Option(`Imported (${doc.conveyor.width})`,String(doc.conveyor.width));width.add(option);}width.value=String(doc.conveyor.width);width.disabled=!!doc.conveyor.mesh;width.title=doc.conveyor.mesh?'Width is preserved from the artist mesh':'';width.onchange=()=>commit(n=>{n.conveyor.width=Number(width.value);});
  const rounding=$<HTMLSelectElement>('corner-rounding');const radius=doc.conveyor.cornerRadius??0;if(![0,1,2,3].includes(radius))rounding.add(new Option(`Custom (${radius} units)`,String(radius)));rounding.value=String(radius);rounding.disabled=!!doc.conveyor.mesh||outline;rounding.title=doc.conveyor.mesh?'The imported model already defines its edge shape':'';rounding.onchange=()=>{if(!commit(n=>{const r=Number(rounding.value);if(r)n.conveyor.cornerRadius=r;else delete n.conveyor.cornerRadius;}))tell('Cannot round these corners without overlapping the belt or existing placements. Move the corner points farther apart, or choose a different rounding size.');};
  bind('reverse-belt',()=>commit(n=>{n.conveyor.direction=n.conveyor.direction===1?-1:1;}));
  bind('load-starter',()=>load(parseFlowDocument(starter)));bind('load-reference',()=>load(parseFlowDocument(reference)));bind('load-artist',()=>{void import('../../examples/levels/artist-rounded.arrow-flow.json').then(m=>load(parseFlowDraft(m.default))).catch(e=>tell(e.message));});
  $('canvas-hint').textContent=outline?'Click points · click green point 1 to close · Undo/Redo corrects points':doc.conveyor.mesh?'Artist conveyor: original rounded mesh':'Drag yellow dots to change the shape';
 }else if(step===1){
  $('panel').innerHTML=`<p class="eyebrow">BOARD / ARROWS</p><h1>Arrows</h1><p class="intro">Draw from tail to tip. Release to finish.</p>${gridControls()}<h3>Drawing color <span class="value-label">${color}</span></h3><p class="small">Applies to the next arrow you draw.</p>${swatches()}<div class="row"><button id="draw-arrows" class="${!erase?'selected':''}">Draw / move</button><button id="erase-arrows" class="${erase?'selected':''}">Erase</button></div>${arrow?`<div class="selection"><h3>Edit selected arrow</h3>${swatches(arrow.color,'selected-color')}<button id="deselect-arrow" class="wide">Done editing / draw next</button><div class="object-properties"><span>Length<strong>${arrow.body.length+1} blocks</strong></span><span>Facing<strong>${arrow.facing}</strong></span></div><div class="row"><button id="turn-arrow">Turn head ↻</button><button id="delete-arrow" class="danger">Delete arrow</button></div></div>`:'<div class="tip">Select an arrow to change its color or direction. Drag it to move.</div>'}`;
  for(const id of ['grid-size','grid-x','grid-y'])$<HTMLInputElement>(id).onchange=()=>commit(n=>{n.board.grid={size:Number($<HTMLInputElement>('grid-size').value),offset:[Number($<HTMLInputElement>('grid-x').value),Number($<HTMLInputElement>('grid-y').value)]};});
  bind('center-grid',()=>commit(centerGrid));
  document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color as FlowColor;selectedArrow='';erase=false;render();});
  document.querySelectorAll<HTMLButtonElement>('[data-selected-color]').forEach(b=>b.onclick=()=>commit(n=>{n.board.arrows.find(a=>a.id===selectedArrow)!.color=b.dataset.selectedColor as FlowColor;}));
  bind('draw-arrows',()=>{erase=false;selectedArrow='';render();});bind('erase-arrows',()=>{erase=true;render();});
  if(arrow){bind('deselect-arrow',()=>{selectedArrow='';render();});bind('delete-arrow',()=>commit(n=>{n.board.arrows=n.board.arrows.filter(a=>a.id!==selectedArrow);}));bind('turn-arrow',()=>commit(n=>{const a=n.board.arrows.find(a=>a.id===selectedArrow)!,directions:FlowArrowFacing[]=['Top','Right','Bottom','Left'];a.facing=directions[(directions.indexOf(a.facing)+1)%4];}));}
  $('canvas-hint').textContent=erase?'Click an arrow to erase it':'Drag from tail → tip · click an arrow to edit it';
 }else{
  $('panel').innerHTML=`<p class="eyebrow">DEFENSE / CANNONS</p><h1>Cannons</h1><p class="intro">Click outside the belt to place. Drag a container freely; drag its target circle to choose where it shoots.</p>${ammoSummary()}<h3>Cannon positions</h3><div class="lane-list">${doc.cannons.map((c,i)=>`<button data-lane="${i}" class="${c.id===selectedCannon?'selected':''}"><i style="background:${flowColors[c.queue[0].color]}"></i>Cannon ${i+1}</button>`).join('')}</div><div class="row"><button id="align-row" ${doc.cannons.length<2?'disabled':''}>Align row</button><button id="space-cannons" ${doc.cannons.length<3?'disabled':''}>Space evenly</button></div><p class="small">Align all cannons to the selected row. Spacing keeps the leftmost and rightmost positions.</p>${lane?`<div class="object-properties"><span>Target distance<strong id="cannon-distance">${Math.hypot(...cannonBase(doc,lane).map((v,i)=>v-anchorAt(conveyorPoints(doc.conveyor),lane.progress).point[i])).toFixed(1)} units</strong></span></div><p class="small">Distance follows placement. Green guides snap to other cannons; hold Alt to bypass.</p><h3>Firing order</h3><p class="small">Top fires first. Each replacement starts when the previous cannon is empty.</p><div id="queue">${lane.queue.map((q,i)=>`<div class="queue-row"><span>${i+1}</span><select data-queue-color="${i}" aria-label="Cannon ${i+1} color">${Object.keys(flowColors).map(c=>`<option ${q.color===c?'selected':''}>${c}</option>`).join('')}</select><label>Shots<input data-queue-ammo="${i}" type="number" min="1" max="500" value="${q.ammo}" aria-label="Cannon ${i+1} shots"></label><button data-up="${i}" aria-label="Move cannon ${i+1} earlier" ${i===0?'disabled':''}>↑</button><button data-remove="${i}" aria-label="Remove cannon ${i+1}" ${lane.queue.length===1?'disabled':''}>×</button></div>`).join('')}</div><button id="add-replacement" class="wide" ${lane.queue.length>=32?'disabled':''}>+ Add replacement</button><button id="delete-cannon" class="wide danger">Delete this position</button>`:'<div class="tip">Click outside the conveyor to place your first cannon. Its target starts at the nearest belt section.</div>'}`;
  document.querySelectorAll<HTMLButtonElement>('[data-lane]').forEach(b=>b.onclick=()=>{selectedCannon=doc.cannons[Number(b.dataset.lane)].id;render();});
  bind('align-row',()=>commit(n=>arrangeCannons(n,'row',selectedCannon),true));bind('space-cannons',()=>commit(n=>arrangeCannons(n,'space',selectedCannon),true));
  const editQueue=(fn:(queue:FlowDocument['cannons'][number]['queue'])=>void)=>commit(n=>fn(n.cannons.find(c=>c.id===selectedCannon)!.queue));
  if(lane){
   document.querySelectorAll<HTMLSelectElement>('[data-queue-color]').forEach(s=>s.onchange=()=>editQueue(q=>{q[Number(s.dataset.queueColor)].color=s.value as FlowColor;}));
   document.querySelectorAll<HTMLInputElement>('[data-queue-ammo]').forEach(s=>s.onchange=()=>editQueue(q=>{q[Number(s.dataset.queueAmmo)].ammo=Number(s.value);}));
   document.querySelectorAll<HTMLButtonElement>('[data-up]').forEach(b=>b.onclick=()=>editQueue(q=>{const i=Number(b.dataset.up);[q[i-1],q[i]]=[q[i],q[i-1]];}));
   document.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach(b=>b.onclick=()=>editQueue(q=>{q.splice(Number(b.dataset.remove),1);}));
   bind('add-replacement',()=>editQueue(q=>q.push({color,ammo:shotsFor(color)})));bind('delete-cannon',()=>commit(n=>{n.cannons=n.cannons.filter(c=>c.id!==selectedCannon);}));
  }
  $('canvas-hint').textContent='Click outside belt to add / drag container / drag target circle';
 }
 draw();
}
type FlowArrowFacing=FlowDocument['board']['arrows'][number]['facing'];
function shotsFor(c:FlowColor){return Math.max(1,Math.min(500,doc.board.arrows.filter(a=>a.color===c).reduce((n,a)=>n+a.body.length+1,0)));}
function load(next:FlowDocument){resetGesture();outline=false;selectedArrow='';selectedCannon='';commit(n=>Object.assign(n,next),true,true);}
function node(tag:string,attrs:Record<string,string|number>={},text?:string){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
const pointString=(points:Pair[])=>points.map(p=>`${p[0]},${-p[1]}`).join(' ');
function draw(){
 const view=ghost??doc,path=conveyorPoints(view.conveyor),size=view.board.grid?.size??1,offset=view.board.grid?.offset??[0,0];svg.replaceChildren();
 const defs=node('defs'),pattern=node('pattern',{id:'squares',width:size,height:size,x:offset[0]-size/2,y:-offset[1]-size/2,patternUnits:'userSpaceOnUse'});pattern.append(node('path',{d:`M ${size} 0 L 0 0 0 ${size}`,fill:'none',stroke:'#d6d5cd','stroke-width':.025}));defs.append(pattern);svg.append(defs,node('rect',{x:bounds[0],y:bounds[1],width:bounds[2],height:bounds[3],fill:'url(#squares)'}));
 if(step===1){const cells=usableGridCells(view),d=cells.map(c=>{const p=gridPoint(view.board,c);return `M${p[0]-size/2},${-p[1]-size/2}h${size}v${size}h${-size}Z`;}).join('');svg.append(node('path',{d,fill:'#dfe9d7',stroke:'#b9cbb1','stroke-width':.025,'pointer-events':'none','data-usable-grid':'true'}));}
 const backdrop=node('g',{opacity:outline ? .14 : 1});svg.append(backdrop);
 if(view.conveyor.mesh){
  meshPreview(view.conveyor.mesh).forEach((d,i)=>backdrop.append(node('path',{d,fill:i?'#b9c3b5':'#6d756e','data-track':'true',class:'track'})));
 }else{
  try{const outer=offsetLoop(path,-(view.conveyor.width+.28)/2),inner=offsetLoop(path,(view.conveyor.width+.28)/2);backdrop.append(node('path',{d:`M ${pointString(outer)} Z M ${pointString(inner)} Z`,'fill-rule':'evenodd',fill:'#6d756e'}));}catch{/* Keep the centerline visible while dragging an invalid corner. */}
  backdrop.append(node('polygon',{points:pointString(path),fill:'none',stroke:ghost?'#a4b9a3':'#b9c3b5','stroke-width':view.conveyor.width,'stroke-linejoin':'miter','data-track':'true',class:'track'}));
 }
 const guideCount=view.conveyor.mesh||view.conveyor.cornerRadius?Math.ceil(path.reduce((sum,p,i)=>{const q=path[(i+1)%path.length];return sum+Math.hypot(p[0]-q[0],p[1]-q[1]);},0)/3):view.conveyor.points.length;
 for(let i=0;i<guideCount;i++){
  const curved=!!(view.conveyor.mesh||view.conveyor.cornerRadius),a=curved?anchorAt(path,i/guideCount).point:path[i],b=curved?anchorAt(path,i/guideCount+.001).point:path[(i+1)%path.length],x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,angle=Math.atan2(-(b[1]-a[1]),b[0]-a[0])*180/Math.PI+(view.conveyor.direction<0?180:0);
  backdrop.append(node('path',{d:'M -.22 -.22 L 0 0 L -.22 .22',transform:`translate(${x} ${-y}) rotate(${angle})`,fill:'none',stroke:'#f8f9f3','stroke-width':.08,'pointer-events':'none'}));
 }
 view.board.arrows.forEach((a,i)=>{
  const pts=arrowPoints(view,a),head=gridPoint(view.board,a.head),g=node('g',{'data-arrow':i,class:`arrow ${a.id===selectedArrow&&step===1?'picked':''}`,style:`--arrow-color:${flowColors[a.color]}`}),stroke=flowColors[a.color];
  if(step===1&&view.conveyor.mesh)for(const cell of arrowCells(a)){
   const b=blockFootprint(view,cell),safe=fitsConveyor(view,cell);
   g.append(node('rect',{x:b.left,y:-b.top,width:b.right-b.left,height:b.top-b.bottom,rx:.08*size,fill:safe?stroke:'#df334a','fill-opacity':safe?.08:.18,stroke:safe?stroke:'#bf2139','stroke-opacity':safe?.3:.9,'stroke-width':safe?.025:.07,'pointer-events':'none','data-clearance':safe?'safe':'overlap'}));
  }
  g.append(node('polyline',{points:pointString(pts),fill:'none',stroke:'transparent','stroke-width':.7*size,'stroke-linecap':'round','stroke-linejoin':'round','pointer-events':'stroke',class:'arrow-hit'}));
  g.append(node('polyline',{points:pointString(pts),fill:'none',stroke,'stroke-width':.24*size,'stroke-linecap':'round','stroke-linejoin':'round',class:'arrow-shaft'}));
  const rotation={Right:0,Bottom:90,Left:180,Top:270}[a.facing];g.append(node('path',{d:'M .53 0 L -.2 -.43 L -.2 .43 Z',fill:stroke,transform:`translate(${head[0]} ${-head[1]}) rotate(${rotation}) scale(${size})`}));backdrop.append(g);
 });
 view.cannons.forEach((c,i)=>{
  const pose=cannonPose(view,c),x=pose.position[0]-view.origin[0],y=view.origin[1]-pose.position[2],anchor=anchorAt(path,c.progress).point;
  const g=node('g',{'data-cannon':i,class:`cannon ${selectedCannon===c.id&&step===2?'picked':''}`});
  g.append(node('line',{x1:x,y1:-y,x2:anchor[0],y2:-anchor[1],stroke:'#9bacbd','stroke-width':.07,'stroke-dasharray':'.2 .2','pointer-events':'none'}));
  const color=flowColors[c.queue[0].color];g.append(node('rect',{x:-.25,y:-1.25,width:.5,height:1.1,rx:.12,fill:color,transform:`translate(${x} ${-y}) rotate(${180-pose.yaw*180/Math.PI})`}));
  g.append(node('circle',{cx:x,cy:-y,r:.8,fill:color,stroke:'#fff','stroke-width':.12}),node('text',{x,y:-y+.18,'text-anchor':'middle','font-size':.5,'font-weight':800,fill:'#fff','paint-order':'stroke',stroke:'#27384a','stroke-width':.04},String(i+1)));
  const label=node('text',{x,y:-y+1.45,'text-anchor':'middle','font-size':.45,fill:'#283a50'},`${c.queue[0].ammo} shots${c.queue.length>1?` +${c.queue.length-1}`:''}`);g.append(label);backdrop.append(g);
  if(step===2&&selectedCannon===c.id){const target=node('g',{'data-target':i,class:'cannon-target'});target.append(node('circle',{cx:anchor[0],cy:-anchor[1],r:Math.max(.45,10/(svg.getScreenCTM()?.a||30)),fill:'transparent'}),node('circle',{cx:anchor[0],cy:-anchor[1],r:.45,fill:'#f9faf5',stroke:'#377958','stroke-width':.1}),node('path',{d:`M ${anchor[0]-.25} ${-anchor[1]} h .5 M ${anchor[0]} ${-anchor[1]-.25} v .5`,stroke:'#377958','stroke-width':.07,'pointer-events':'none'}));svg.append(target);}
 });
 if(step===0&&!outline&&!view.conveyor.mesh){if(view.conveyor.cornerRadius)svg.append(node('polygon',{points:pointString(view.conveyor.points),fill:'none',stroke:'#a78a4d','stroke-width':.04,'stroke-dasharray':'.18 .18','pointer-events':'none'}));view.conveyor.points.forEach((p,i)=>{
  const q=view.conveyor.points[(i+1)%view.conveyor.points.length],x=(p[0]+q[0])/2,y=(p[1]+q[1])/2;
  if(view.conveyor.points.length<64){const g=node('g',{'data-mid':i,class:'add-bend'});g.append(node('circle',{cx:x,cy:-y,r:.28,fill:'#f6fbff',stroke:'#71869b','stroke-width':.04}),node('text',{x,y:-y+.14,'text-anchor':'middle','font-size':.5,fill:'#2f4b67'},'+'));svg.append(g);}
  svg.append(node('circle',{cx:p[0],cy:-p[1],r:.3,fill:'#ffc85c',stroke:'#fff','stroke-width':.09,'data-corner':i,class:'corner'}));
 });}
 if(outlinePoints?.length){
  const stroke=outlineError?'#d52d48':'#c78408',first=outlinePoints[0],last=outlinePoints.at(-1)!;
  svg.append(node('polyline',{points:pointString(outlinePoints),fill:'none',stroke,'stroke-width':.15,'stroke-linejoin':'round','data-outline-line':'true'}));
  if(hover)svg.append(node('line',{x1:last[0],y1:-last[1],x2:hover[0],y2:-hover[1],stroke,'stroke-width':.08,'stroke-dasharray':'.2 .15','pointer-events':'none'}));
  if(outlineError)svg.append(node('line',{x1:last[0],y1:-last[1],x2:first[0],y2:-first[1],stroke,'stroke-width':.12,'stroke-dasharray':'.2 .15','pointer-events':'none'}));
  const radius=10/(svg.getScreenCTM()?.a||30);
  outlinePoints.forEach((p,i)=>{const g=node('g',{'data-outline-point':i,style:'cursor:pointer'});g.append(node('circle',{cx:p[0],cy:-p[1],r:radius,fill:i===0?'#138661':'#a86c00',stroke:'#fff','stroke-width':radius*.15}),node('text',{x:p[0],y:-p[1]+radius*.35,'text-anchor':'middle','font-size':radius*1.1,'font-weight':700,fill:'#fff'},String(i+1)));svg.append(g);});
 }
 if(ink?.length)$('tool-state').textContent=`DRAWING / ${ink.length} BLOCKS (HEAD INCLUDED)`;
 if(ink?.length)svg.append(node('polyline',{points:pointString(ink.map(p=>gridPoint(view.board,p))),fill:'none',stroke:flowColors[color],'stroke-width':.24*size,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.6}));
 if(alignment?.guides.length){
  const p=alignment.point,scale=svg.getScreenCTM()?.a||30,g=node('g',{'pointer-events':'none','data-alignment-guide':'true'});
  for(const {anchor,axis} of alignment.guides){const a:Pair=axis==='horizontal'?[bounds[0],p[1]]:axis==='vertical'?[p[0],-bounds[1]]:anchor,b:Pair=axis==='horizontal'?[bounds[0]+bounds[2],p[1]]:axis==='vertical'?[p[0],-bounds[1]-bounds[3]]:p;g.append(node('line',{x1:a[0],y1:-a[1],x2:b[0],y2:-b[1],stroke:'#377958','stroke-width':1/scale,'stroke-dasharray':`${5/scale} ${4/scale}`}));}
  g.append(node('circle',{cx:p[0],cy:-p[1],r:5/scale,fill:'#f9faf5',stroke:'#377958','stroke-width':1.5/scale}),node('text',{x:p[0]+10/scale,y:-p[1]-10/scale,fill:'#24633f','font-size':11/scale,'paint-order':'stroke',stroke:'#f9faf5','stroke-width':3/scale},alignment.guides.map(g=>g.axis==='diagonal'?'45°':g.axis==='horizontal'?'Horizontal':'Vertical').join(' + ')));svg.append(g);
 }
}
type PointEvent=Pick<PointerEvent,'clientX'|'clientY'|'pointerId'|'shiftKey'|'altKey'>;
function position(event:PointEvent):Pair{
 const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
 if(step===1)return gridCell(doc.board,[p.x,-p.y]);
 const scale=10,point:Pair=[Math.round(p.x*scale)/scale,-Math.round(p.y*scale)/scale];
 let anchors:Pair[]=[];
 if(step===0&&outline&&outlinePoints?.length)anchors=[outlinePoints.at(-1)!];
 else if(drag?.kind==='corner'){const points=drag.base.conveyor.points,i=drag.index;anchors=[points[(i+points.length-1)%points.length],points[(i+1)%points.length]];}
 else if(drag?.kind==='target')anchors=[cannonBase(drag.base,drag.base.cannons[drag.index])];
 alignment=anchors.length?alignPoint(point,anchors,Math.min(.4,8/(svg.getScreenCTM()?.a||30)),event.shiftKey,event.altKey):null;
 return alignment?.point??point;
}
function finishOutline(){
 if(!outlinePoints||outlinePoints.length<3){tell('Place at least 3 points, then click the green first point.');return;}
 const points=outlinePoints;
 try{const next=structuredClone(doc);setLoop(next,points);checkedDraft(next);}
 catch(error){const message=(error as Error).message;outlineError=/crossings|touching/.test(message)?'Some lines cross or touch. Follow the outside edge in order; Undo points to correct the outline.':/corner|narrow|width|short edges/.test(message)?'This bend is too tight for the belt. Undo points and leave more room between bends.':/area/.test(message)?'The outline needs an inside area. Add points around the shape, then close it.':message;render();return;}
 if(commit(n=>setLoop(n,points))){resetGesture();outline=false;render();}
}
function appendOutline(p:Pair){
 if(outlinePoints?.length&&same(outlinePoints[0],p)){finishOutline();return;}
 try{const before=outlinePoints??[],next=appendCorner(before,p);if(next!==before){outlinePast.push(before);outlineFuture=[];outlinePoints=next;outlineError='';}render();}catch(e){tell((e as Error).message);}
}
svg.addEventListener('pointerdown',e=>{
 if(e.button!==0||drag)return;svg.focus();svg.setPointerCapture(e.pointerId);const p=position(e),target=e.target as Element;
 const index=(name:string)=>{const found=target.closest(`[data-${name}]`);return found?Number(found.getAttribute(`data-${name}`)):-1;};
 const base=structuredClone(doc),begin=(kind:NonNullable<typeof drag>['kind'],index=-1)=>{drag={kind,index,start:p,pointer:e.pointerId,base,moved:false};};
 if(step===0){
  if(outline){begin('outline');return;}
  const corner=index('corner'),mid=index('mid');if(corner>=0){begin('corner',corner);return;}
  if(mid>=0){const a=base.conveyor.points[mid],b=base.conveyor.points[(mid+1)%base.conveyor.points.length];base.conveyor.points.splice(mid+1,0,[(a[0]+b[0])/2,(a[1]+b[1])/2]);ghost=base;begin('corner',mid+1);draw();}return;
 }
 if(step===1){const i=index('arrow');if(i>=0){selectedArrow=doc.board.arrows[i].id;if(erase){commit(n=>{n.board.arrows.splice(i,1);});return;}begin('arrow',i);render();return;}
  selectedArrow='';if(erase){render();return;}if(!fitsConveyor(doc,p)||doc.board.arrows.some(a=>arrowCells(a).some(c=>same(c,p)))){tell('Start on an empty green square, clear of the conveyor.');return;}ink=[p];begin('ink');render();return;
 }
 const targetLane=index('target');if(targetLane>=0){selectedCannon=doc.cannons[targetLane].id;begin('target',targetLane);render();return;}
 const lane=index('cannon');if(lane>=0){selectedCannon=doc.cannons[lane].id;begin('cannon',lane);render();return;}
 const anchor=nearestProgress(conveyorPoints(doc.conveyor),p);if(insideLoop(p,conveyorPoints(doc.conveyor))&&anchor.distance>doc.conveyor.width/2){tell('Place the cannon outside the conveyor outline.');return;}
 const id=crypto.randomUUID();if(commit(n=>n.cannons.push({id,progress:anchor.progress,offset:5.313,angle:null,...(anchor.distance>doc.conveyor.width/2+.6?{position:p}:{}),queue:[{color,ammo:shotsFor(color)}]}),true)){selectedCannon=id;render();}
});
function movePointer(e:PointEvent){
 if(drag&&e.pointerId!==drag.pointer)return;
 lastPointer={clientX:e.clientX,clientY:e.clientY,pointerId:e.pointerId};hover=position(e);if(!drag){if(outlinePoints)draw();return;}
 const p=hover;if(!same(p,drag.start))drag.moved=true;
 if(drag.kind==='outline'){draw();return;}
 if(drag.kind==='ink'){try{ink=extendArrow(doc,ink!,p);}catch(error){tell((error as Error).message);}draw();return;}
 if(!drag.moved)return;ghost=structuredClone(drag.base);
 if(drag.kind==='corner'){ghost.conveyor.points[drag.index]=p;ghost.cannons.forEach(c=>c.angle=null);}
 if(drag.kind==='arrow'){const a=ghost.board.arrows[drag.index];a.head=[a.head[0]+p[0]-drag.start[0],a.head[1]+p[1]-drag.start[1]];}
 if(drag.kind==='cannon'){
  const base=cannonBase(drag.base,drag.base.cannons[drag.index]),point:Pair=[base[0]+p[0]-drag.start[0],base[1]+p[1]-drag.start[1]];
  alignment=alignPoint(point,drag.base.cannons.filter((_,i)=>i!==drag!.index).map(c=>cannonBase(drag!.base,c)),Math.min(.4,8/(svg.getScreenCTM()?.a||30)),false,e.altKey);
  ghost.cannons[drag.index].position=alignment.point;
 }
 if(drag.kind==='target'){const lane=ghost.cannons[drag.index];lane.position=cannonBase(drag.base,drag.base.cannons[drag.index]);lane.progress=nearestProgress(conveyorPoints(doc.conveyor),p).progress;}

 draw();
}
svg.addEventListener('pointermove',movePointer);
svg.addEventListener('pointerup',e=>{
 if(!drag||drag.pointer!==e.pointerId)return;
 if((drag.kind==='corner'||drag.kind==='cannon'||drag.kind==='target')&&drag.moved)movePointer(e);
 const p=position(e),finished=drag;drag=null;alignment=null;
 if(finished.kind==='outline'){const point=svg.ownerDocument.elementFromPoint(e.clientX,e.clientY)?.closest('[data-outline-point]'),i=point?Number(point.getAttribute('data-outline-point')):-1;appendOutline(i>=0?outlinePoints![i]:p);return;}
 if(finished.kind==='ink'){const points=ink;ink=null;if(points&&points.length>1){const id=crypto.randomUUID();if(commit(n=>n.board.arrows.push(makeArrow(points,color,id)))){selectedArrow='';tell(`Arrow finished: ${points.length} blocks. Draw the next arrow.`);}}else tell('Drag across two or more squares; release at the arrow tip.');render();return;}
 const next=ghost;ghost=null;if(next)commit(n=>Object.assign(n,next),finished.kind==='cannon'||finished.kind==='corner');render();
});
function cancelPointer(e:PointerEvent){if(drag?.pointer===e.pointerId){drag=null;ghost=null;ink=null;alignment=null;lastPointer=null;render();}}
svg.addEventListener('pointercancel',cancelPointer);svg.addEventListener('lostpointercapture',cancelPointer);
window.addEventListener('blur',()=>{drag=null;ghost=null;ink=null;alignment=null;lastPointer=null;render();});
svg.addEventListener('pointerleave',()=>{if(!drag){alignment=null;lastPointer=null;hover=null;draw();}});
for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{
 const event=e as KeyboardEvent;
 if((event.key==='Shift'||event.key==='Alt')&&(outline||drag?.kind==='corner'||drag?.kind==='cannon'||drag?.kind==='target')&&lastPointer&&!(event.target as HTMLElement).matches('input,select,textarea')&&!document.querySelector('dialog[open]'))movePointer({...lastPointer,shiftKey:event.shiftKey,altKey:event.altKey});
});
document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(b=>b.onclick=()=>selectStep(Number(b.dataset.step)));
bind('next-step',()=>step<2?selectStep(step+1):play());bind('fit-view',()=>{fitView();draw();});bind('undo',undo);bind('redo',redo);
$<HTMLInputElement>('level-name').onchange=e=>{const input=e.target as HTMLInputElement;if(!commit(n=>{n.name=input.value.trim();}))input.value=doc.name;};
bind('new-level',()=>{const blank=parseFlowDocument(starter);blank.name='Untitled level';blank.board.arrows=[];blank.cannons=[];load(blank);selectStep(0);});
bind('import-level',()=>$<HTMLInputElement>('level-file').click());
$<HTMLInputElement>('level-file').onchange=async e=>{const input=e.target as HTMLInputElement,file=input.files?.[0];input.value='';if(!file)return;try{if(file.size>4_000_000)throw new Error('Choose a level file smaller than 4 MB.');load(parseFlowDraft(JSON.parse(await file.text())));}catch(error){tell((error as Error).message);}};
bind('export-level',()=>{try{const value=parseFlowDocument(doc),draft=clearanceConflicts(value).length>0;if(!draft)requireClearance(value);const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${doc.name.replace(/[^a-z0-9_-]+/gi,'-').toLowerCase()}${draft?'.draft':''}.arrow-flow.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);tell(draft?'Draft saved with overlap warnings. Reopen it to finish fixing the red blocks.':'Level exported. You can reopen it here or build it into the playable.');}catch(error){tell((error as Error).message);}});
function play(){try{previewDoc=parseFlowDocument(doc);const frame=document.createElement('iframe');frame.title='Play your Arrow Flow level';frame.src='/editor-preview.html?embedded=1';$('preview-frame').replaceChildren(frame);$<HTMLDialogElement>('preview-dialog').showModal();}catch(error){tell((error as Error).message);}}
bind('play-test',play);bind('close-preview',()=>$<HTMLDialogElement>('preview-dialog').close());
$('preview-dialog').addEventListener('close',()=>{$('preview-frame').replaceChildren();previewDoc=null;});
window.addEventListener('message',event=>{const frame=$('preview-frame').querySelector('iframe');if(event.origin===location.origin&&event.source===frame?.contentWindow&&event.data?.type==='arrow-flow-ready'&&previewDoc)frame!.contentWindow!.postMessage({type:'arrow-flow-level',level:previewDoc},location.origin);});
window.addEventListener('keydown',e=>{
 if((e.target as HTMLElement).matches('input,select,textarea')||document.querySelector('dialog[open]'))return;
 if(e.key==='Escape'){resetGesture();outline=false;render();return;}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
 if(outlinePoints&&e.key==='Enter'){e.preventDefault();finishOutline();}
 if(outline&&e.key==='Backspace'){e.preventDefault();undo();}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}
});
fitView();render();
