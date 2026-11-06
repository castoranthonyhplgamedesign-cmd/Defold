import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {fitsConveyor,blockFootprint,clearanceConflicts,checkClearanceEdit,requireClearance} from '../src/layout/visualClearance.ts';
import {parseFlowDraft,insideLoop,gridPoint,gridClearance} from '../src/layout/arrowFlow.ts';
import {usableGridCells,extendArrow,updateBounds} from '../tools/level-editor/model.ts';
const read=p=>JSON.parse(fs.readFileSync(p));

test('recessed board rejects centers under the artist mesh and invalidates cached mesh results',()=>{
 const doc=read('examples/levels/four-sides.arrow-flow.json');doc.board.grid={size:1,offset:[0,0]};
 const encode=a=>Buffer.from(a.buffer).toString('base64');
 const part=y=>({position:encode(new Float32Array([-1,0,-y,1,0,-y,1,0,-y-.2,-1,0,-y-.2])),index:encode(new Uint32Array([0,1,2,0,2,3])),normal:''});
 doc.conveyor.points=[[-5,-5],[5,-5],[5,5],[-5,5]];doc.conveyor.mesh={parts:[part(1),part(1)],surface:[]};
 assert.equal(blockFootprint(doc,[0,1]).top,1.5);assert(!fitsConveyor(doc,[0,1]));assert(fitsConveyor(doc,[0,0]));
 doc.conveyor.mesh={parts:[part(1.5),part(1.5)],surface:[]};assert(fitsConveyor(doc,[0,1]));
 doc.board.grid.size=1.5;assert(!fitsConveyor(doc,[0,1]),'Grid resize must update the footprint');
});

test('old imported drafts remain loadable while edits and usable cells share mesh clearance',()=>{
 const doc=read('analysis/artist-rescue/playable-qa.arrow-flow.json');doc.board.arrows=[];doc.board.grid={size:.5,offset:[0,0]};
 let unsafe;for(let y=-40;y<=40&&!unsafe;y++)for(let x=-40;x<=40;x++)if(insideLoop(gridPoint(doc.board,[x,y]),doc.conveyor.points,gridClearance(doc))&&!fitsConveyor(doc,[x,y])){unsafe=[x,y];break;}
 assert(unsafe);doc.board.arrows=[{id:'old',color:'blue',head:unsafe,body:[],facing:'Top'}];updateBounds(doc);
 assert.doesNotThrow(()=>parseFlowDraft(doc));assert.equal(clearanceConflicts(doc).length,1);assert.throws(()=>requireClearance(doc),/clearance/);
 const renamed=structuredClone(doc);renamed.name='Keep my draft';assert.doesNotThrow(()=>checkClearanceEdit(doc,renamed));
 const safe=usableGridCells(doc);assert(safe.length);assert(safe.every(p=>fitsConveyor(doc,p)));assert(!safe.some(p=>String(p)===String(unsafe)));
 const fixed=structuredClone(doc);fixed.board.arrows[0].head=safe[0];assert.doesNotThrow(()=>checkClearanceEdit(doc,fixed));assert.doesNotThrow(()=>requireClearance(fixed));
 assert.throws(()=>checkClearanceEdit(fixed,doc),/overlaps/);
 assert.throws(()=>extendArrow({...doc,board:{...doc.board,arrows:[]}},[[unsafe[0]-1,unsafe[1]]],unsafe));
});

test('clearance envelope covers supplied geometry and does not change procedural placement',()=>{
 const doc=read('examples/levels/four-sides.arrow-flow.json'),manifest=read('src/assets/geometry.json'),bytes=fs.readFileSync('src/assets/geometry.bin');
 for(const name of ['head','body','corner']){const a=manifest[name][0].position,p=new Float32Array(bytes.buffer,bytes.byteOffset+a.offset,a.count*3);for(let i=0;i<p.length;i+=3){assert(Math.abs(p[i])<=.56);assert(Math.abs(p[i+2])<=.56);assert(p[i+1]<=1.24);}}
 for(let y=-12;y<=12;y++)for(let x=-12;x<=12;x++)assert.equal(fitsConveyor(doc,[x,y]),insideLoop(gridPoint(doc.board,[x,y]),doc.conveyor.points,gridClearance(doc)));
});
