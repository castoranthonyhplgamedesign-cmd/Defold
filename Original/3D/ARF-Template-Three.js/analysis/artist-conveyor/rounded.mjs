import fs from 'node:fs';
import {accessor,primitives} from './inspect.mjs';
import {center,scale} from './trace.mjs';
import {parseFlowDraft,parseFlowDocument} from '../../src/layout/arrowFlow.ts';
import {nearestProgress} from '../../tools/level-editor/model.ts';
const encode=typed=>Buffer.from(typed.buffer).toString('base64');
const surfaceY=accessor(primitives[1].attributes.POSITION)[0][1];
const parts=primitives.map(p=>({
 position:encode(new Float32Array(accessor(p.attributes.POSITION).flatMap(v=>[v[0]*scale,(v[1]-surfaceY)*scale,v[2]*scale]))),
 normal:encode(new Float32Array(accessor(p.attributes.NORMAL).flat())),
 index:encode(new Uint32Array(accessor(p.indices).flat()))
}));
const surface=JSON.parse(fs.readFileSync('analysis/artist-conveyor/surface-boundaries.json')).map(points=>points.map(v=>[v[0]*scale,-v[2]*scale]));
const draft={kind:'arrow-flow',version:1,name:'Artist conveyor - original rounded mesh',origin:[0,0],board:{bounds:{minX:-25,minY:-25,width:50,height:50},arrows:[]},conveyor:{points:center.map(p=>p.map(v=>v*scale)),width:1.3,direction:1,mesh:{parts,surface}},cannons:[]};
parseFlowDraft(draft);
fs.writeFileSync('examples/levels/artist-rounded.arrow-flow.json',JSON.stringify(draft));
fs.writeFileSync('analysis/artist-conveyor/artist-rounded.arrow-flow.json',JSON.stringify(draft));
const fixture=structuredClone(draft);fixture.name='Artist rounded conveyor - QA';fixture.board.arrows=[{id:'test',color:'green',head:[0,0],body:[[-1,0],[-2,0]],facing:'Right'}];fixture.cannons=[{id:'test',progress:nearestProgress(draft.conveyor.points,[0,20]).progress,offset:5.313,angle:null,queue:[{color:'green',ammo:3}]}];parseFlowDocument(fixture);
fs.writeFileSync('analysis/artist-conveyor/rounded-qa.arrow-flow.json',JSON.stringify(fixture));
console.log(`Rounded mesh draft: ${Buffer.byteLength(JSON.stringify(draft))} bytes; ${draft.conveyor.points.length} movement samples; original geometry preserved.`);
