import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Cannons, cannonTuning } from '../src/core/cannons.ts';
import { Simulation } from '../src/core/simulation.ts';
import { ConveyorPath } from '../src/core/path.ts';
const lane = (queue = [{color:'green',ammo:3}]) => ({position:[0,-.428,-5.313],queue});
const block = (id=1,color='green',position=[0,0,0]) => ({arrowId:id,index:0,color,position,progress:.1,yaw:0,inTransit:false,removed:false});
const reserve = block(999,'green',[100,0,100]);
function fixture(data=[lane()]) {
  const cannons = new Cannons(data), blocks=[];
  const step = dt => cannons.update(dt,blocks, [...blocks,reserve], s=>{s.removed=true;});
  return {cannons,blocks,step};
}
test('matching detector entry fires and completes once after the shot flight time', () => {
  const {cannons,blocks,step}=fixture();const s=block();blocks.push(s);const half=cannonTuning.shotSeconds/2;
  step(.01);assert.equal(cannons.shots.length,1);assert.equal(cannons.lanes[0].queue[0].ammo,3);
  step(half);assert(Math.abs(cannons.scale(s)-.5)<1e-9);assert.equal(s.removed,false);
  step(half);assert(s.removed);assert.equal(cannons.shots.length,0);assert.equal(cannons.lanes[0].queue[0].ammo,2);
  step(.2);assert.equal(cannons.lanes[0].queue[0].ammo,2);assert.equal(cannons.impacts.length,0);
});
test('mismatch and transit ignored; becoming ready while inside requires re-entry', () => {
  const {cannons,blocks,step}=fixture();const red=block(1,'pink'),s=block(2);s.inTransit=true;blocks.push(red,s);
  step(.01);assert.equal(cannons.shots.length,0);
  s.inTransit=false;step(.01);assert.equal(cannons.shots.length,0);
  s.position=[5,0,0];step(.01);s.previousPosition=[5,0,0];s.position=[0,0,0];step(.01);
  assert.equal(cannons.shots.length,1);assert.equal(cannons.shots[0].target,s);
});
test('swept detector catches a block crossing between samples; off-track blocks ignored', () => {
  const {cannons,blocks,step}=fixture();const s=block();s.previousPosition=[-3,0,0];s.position=[3,0,0];blocks.push(s,block(2,'green',[0,5,0]));
  step(.01);assert.equal(cannons.shots.length,1);assert.equal(cannons.shots[0].target,s);
});
test('shared targets reserved once across cannons; ammo limits concurrent shots', () => {
  const {cannons,blocks,step}=fixture([lane([{color:'green',ammo:1}]),lane([{color:'green',ammo:1}])]);
  blocks.push(block(1),block(2));step(.01);
  assert.equal(cannons.shots.length,2);assert.equal(new Set(cannons.shots.map(s=>s.target)).size,2);
  assert(cannons.lanes.every(l=>l.queue[0].reserved===1));
  step(.1);assert(blocks.every(b=>b.removed));assert(cannons.lanes.every(l=>l.queue.length===0));
});
test('multiple contacts fire without invented cooldown and simultaneous completions preserve ammo', () => {
  const {cannons,blocks,step}=fixture();blocks.push(block(1),block(2),block(3),block(4));step(.01);
  assert.equal(cannons.shots.length,3);assert.equal(cannons.lanes[0].queue[0].reserved,3);
  step(.1);assert.equal(blocks.filter(b=>b.removed).length,3);assert.equal(cannons.lanes[0].queue.length,0);
});
test('last shot advances queue for 0.3 seconds with detector disabled until arrival', () => {
  const {cannons,blocks,step}=fixture([lane([{color:'green',ammo:1},{color:'blue',ammo:2}])]);
  blocks.push(block(1),block(2,'blue'));step(.01);step(.1);
  const l=cannons.lanes[0];assert.equal(l.queue[0].color,'blue');assert.equal(l.advancing,.3);
  step(.29);assert.equal(cannons.shots.length,0);
  step(.01);assert.equal(cannons.shots.length,1);assert.equal(cannons.shots[0].target.color,'blue');
});
test('external target removal cancels pending ammo spend; stop invalidates delayed effects', () => {
  const {cannons,blocks,step}=fixture();const s=block();blocks.push(s);step(.01);s.removed=true;step(.1);
  assert.equal(cannons.lanes[0].queue[0].ammo,3);assert.equal(cannons.lanes[0].queue[0].reserved,0);
  blocks.push(block(2));step(.01);assert.equal(cannons.shots.length,1);cannons.stop();step(10);
  assert.equal(cannons.shots.length,0);assert.equal(blocks[1].removed,false);assert.equal(cannons.lanes[0].queue[0].ammo,3);assert.equal(cannons.active,false);
});
test('obsolete-color cleanup considers board and transit, handles an empty queue', () => {
  const cannons=new Cannons([lane([{color:'orange',ammo:5},{color:'green',ammo:2}])]);
  const board=block(1,'orange',[100,0,100]);board.progress=null;
  cannons.update(.01,[],[board],()=>{});assert.equal(cannons.lanes[0].queue[0].color,'orange');
  board.removed=true;cannons.update(.01,[],[board,reserve],()=>{});assert.equal(cannons.lanes[0].queue[0].color,'green');
  cannons.update(.3,[],[],()=>{});assert.equal(cannons.lanes[0].queue.length,0);cannons.update(1,[],[],()=>{});
  assert.throws(()=>new Cannons([lane([{color:'green',ammo:-1}])]));
});
test('authored reference lanes shoot a launched green group; hidden time pauses shots', () => {
  const data=JSON.parse(fs.readFileSync('src/data/level.json')),path=JSON.parse(fs.readFileSync('src/data/path.json'));
  const sim=new Simulation(data.arrows,new ConveyorPath(path),data.shooters);
  assert.equal(sim.launch(141),'accepted');
  let found=false;
  for(let i=0;i<600;i++) { sim.advance(1/120); if(sim.cannons.shots.length){found=true;break;} }
  assert(found,'Green group must intersect an authored detector');
  const pending=sim.cannons.shots[0],age=pending.age;sim.paused=true;sim.advance(5);assert.equal(pending.age,age);
  sim.paused=false;sim.advance(5);
  assert.equal(sim.arrows.find(a=>a.data.id===141).segments.filter(s=>s.removed).length,6);
  assert.equal(sim.cannons.lanes[0].queue[0].ammo,20);
});
