import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseFlowDocument,parseFlowDraft} from '../src/layout/arrowFlow.ts';
import {preset,setLoop,appendCorner,extendArrow,makeArrow,nearestProgress,checkedDraft,alignPoint,ammoBudget} from '../tools/level-editor/model.ts';
const fixture=()=>JSON.parse(fs.readFileSync('examples/levels/four-sides.arrow-flow.json'));

test('ammo budget counts heads and tails by color across all lanes and replacements',()=>{
 const doc=fixture();doc.board.arrows=[makeArrow([[0,0],[1,0],[2,0]],'green','a'),makeArrow([[0,1],[1,1]],'green','b'),makeArrow([[0,2],[1,2]],'blue','c')];
 doc.cannons[0].queue=[{color:'green',ammo:2},{color:'green',ammo:1},{color:'pink',ammo:7}];doc.cannons[1].queue=[{color:'green',ammo:1},{color:'blue',ammo:4}];doc.cannons.length=2;
 assert.deepEqual(ammoBudget(doc),[{color:'green',blocks:5,ammo:4,missing:1},{color:'blue',blocks:2,ammo:4,missing:0},{color:'pink',blocks:0,ammo:7,missing:0}]);
 doc.cannons[0].queue[0].ammo=3;assert.equal(ammoBudget(doc)[0].missing,0);
 doc.cannons=[];assert.deepEqual(ammoBudget(doc),[{color:'green',blocks:5,ammo:0,missing:5},{color:'blue',blocks:2,ammo:0,missing:2}]);
 doc.board.arrows=[];assert.deepEqual(ammoBudget(doc),[]);
});

test('alignment preserves intentional slopes and constrains points without moving anchors',()=>{
 const anchors=[[1.3,2.7],[8.2,8.4]],copy=structuredClone(anchors);
 assert.deepEqual(alignPoint([6,2.8],anchors,.2).point,[6,2.7]);
 assert.deepEqual(alignPoint([1.2,6],anchors,.2).point,[1.3,6]);
 assert.deepEqual(alignPoint([5,6],anchors,.2).point,[5,6]);
 assert.deepEqual(alignPoint([8.3,2.8],anchors,.2).point,[8.2,2.7]);
 assert.deepEqual(alignPoint([6,2.8],anchors,.2,false,true),{point:[6,2.8],guides:[]});
 for(const [dx,dy] of [[4,3],[-4,3],[-4,-3],[4,-3]]){const result=alignPoint([dx,dy],[[0,0]],.2,true);assert.equal(Math.abs(result.point[0]),Math.abs(result.point[1]));assert.equal(result.guides[0].axis,'diagonal');}
 assert.deepEqual(alignPoint([6,3],[[0,0]],.2,true).point,[4.5,4.5]);
 assert.deepEqual(alignPoint([6,1],[[0,0]],.2,true).point,[6,0]);
 assert.deepEqual(alignPoint([1,-6],[[0,0]],.2,true).point,[0,-6]);
 assert.deepEqual(alignPoint([6,3],[[0,0]],.2,true,true).point,[6,3],'Alt overrides Shift');
 assert.deepEqual(alignPoint([0,0],[[0,0]],.2,true),{point:[0,0],guides:[]});
 assert.deepEqual(anchors,copy);
});
test('editor drafts may be empty while the playable contract stays strict',()=>{
 const doc=fixture();doc.board.arrows=[];assert.deepEqual(parseFlowDraft(doc),doc);assert.throws(()=>parseFlowDocument(doc),/at least one arrow/);
 const invalid=structuredClone(doc);invalid.conveyor.points=[[0,0],[0,0],[1,0]];assert.throws(()=>parseFlowDraft(invalid));
 const bad=structuredClone(doc);bad.board.bounds.width=Infinity;assert.throws(()=>parseFlowDraft(bad));
 assert.deepEqual(checkedDraft(fixture()),fixture(),'Import/export preserves authored bounds when no expansion is needed');
});
test('tail-to-tip drawing interpolates connected cells and checks overlap and belt clearance',()=>{
 const doc=fixture();doc.board.arrows=[];
 const points=extendArrow(doc,[[-2,-2]],[1,-1]);assert.deepEqual(points,[[-2,-2],[-1,-2],[0,-2],[1,-2],[1,-1]]);
 const arrow=makeArrow(points,'blue','drawn');assert.equal(arrow.facing,'Top');assert.deepEqual(arrow.head,[1,-1]);
 doc.board.arrows.push(arrow);assert.doesNotThrow(()=>checkedDraft(doc));
 assert.throws(()=>extendArrow(doc,[[-3,-2]],[-1,-2]),/away from other arrows/);
 assert.throws(()=>extendArrow(doc,[[2,2]],[5,2]),/inside the belt/);
 assert.throws(()=>makeArrow([[0,0]],'blue','short'),/two squares/);
 assert.deepEqual(extendArrow({...doc,board:{...doc.board,arrows:[]}},[[0,0],[1,0]],[0,0]),[[0,0]]);
});
test('presets surround existing content and re-aim cannons without changing queues',()=>{
 for(const shape of ['rectangle','notch']){
  const doc=fixture(),queues=structuredClone(doc.cannons.map(c=>c.queue));setLoop(doc,preset(doc,shape));
  assert.doesNotThrow(()=>parseFlowDocument(doc));assert(doc.cannons.every(c=>c.angle===null));assert.deepEqual(doc.cannons.map(c=>c.queue),queues);
 }
 const points=[[5,-5],[-5,-5],[-5,5],[5,5]];assert.equal(nearestProgress(points,[0,-8]).progress,.125);assert.equal(nearestProgress(points,[8,0]).progress,.875);
});

test('point authoring preserves each click and permits diagonal concave outlines',()=>{
 const outline=[[-8,7],[-4,7],[0,4],[4,7],[8,7],[8,2],[4,0],[8,-2],[8,-7],[4,-7],[0,-4],[-4,-7],[-8,-7],[-8,-2],[-4,0],[-8,2]];
 let points=[];for(const p of outline)points=appendCorner(points,p);assert.deepEqual(points,outline);
 assert.equal(appendCorner(points,points.at(-1)),points,'Repeated last click does not create a tiny edge');
 assert.throws(()=>appendCorner(points,points[1]),/already in the outline/);
 const doc=fixture();doc.board.arrows=[];doc.cannons=[];setLoop(doc,points);assert.doesNotThrow(()=>checkedDraft(doc));
 setLoop(doc,[[0,8.2],[8.3,0],[0,-8.2],[-8.3,0]]);assert.doesNotThrow(()=>checkedDraft(doc));
 setLoop(doc,[[-7,-6],[7,6],[-7,6],[7,-4]]);assert.throws(()=>checkedDraft(doc),/crossings|area/,'Real crossings still reject');
});
