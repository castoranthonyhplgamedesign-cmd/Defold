import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ConveyorPath, distance, wrap } from '../src/core/path.ts';
import { Simulation, tuning } from '../src/core/simulation.ts';
const square = () => new ConveyorPath([[-5,0,-5],[5,0,-5],[5,0,5],[-5,0,5]]);
const arrow = (id, position = [0,0,0], direction = [1,0,0], cells = [[0,0,0]]) => ({ id, position, direction, cells, color: 'green' });
const segment = (id, progress) => ({ arrowId: id, index: 0, color: 'green', position: [0,0,0], yaw: 0, progress: null, inTransit: false, removed: false });
const insert = (sim, id, p) => { const s = segment(id); sim.insert(s,p); return s; };

test('short launches retain their visible minimum and the belt moves at 12.825 units per second', () => {
  const sim = new Simulation([arrow(1,[2,0,0])], square());
  sim.launch(1);
  assert(Math.abs(sim.arrows[0].duration - .2/.9) < 1e-9);
  sim.advance(.225);
  assert.equal(sim.onPath.length,1);
  const start = sim.onPath[0].progress;
  sim.advance(.5);
  assert(Math.abs(wrap(sim.onPath[0].progress - start) * sim.path.length - 6.4125) < 1e-8);
});

test('source resampling and entry selection work across wraparound', () => {
  const points = JSON.parse(fs.readFileSync('src/data/path.json'));
  const path = new ConveyorPath(points);
  assert.equal(path.points.length, 843);
  assert(Math.abs(path.length - 84.272) < .002);
  assert(distance(path.position(-.2), path.position(.8)) < 1e-8);
  for (const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]) {
    const p = square().position(square().entry([0,0,0], d));
    assert(distance(p, d.map(v => v * 5)) < .11);
  }
  assert.throws(() => new ConveyorPath([[0,0,0],[0,0,0],[1,0,1]]));
});
test('all facing axes reject a front blocker, allow behind and ignore launched arrows', () => {
  for (const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]) {
    const sim = new Simulation([arrow(1,[0,0,0],d), arrow(2,d.map(v=>v*2),d)], square());
    assert.equal(sim.launch(1),'blocked');
    assert.equal(sim.onPath.length,0);
    sim.advance(.1); assert(sim.arrows[0].feedback);
    assert.equal(sim.launch(1),'ignored');
    sim.advance(2); assert.equal(sim.arrows[0].feedback,null);
    assert.equal(sim.launch(2),'accepted');
    assert.equal(sim.launch(1),'accepted');
    assert.equal(sim.launch(1),'ignored');
  }
});
test('own forward tail blocks; malformed and overlapping layouts fail validation', () => {
  const sim = new Simulation([arrow(1,[0,0,0],[1,0,0],[[0,0,0],[1,0,0]])], square());
  assert.equal(sim.launch(1),'blocked');
  assert.throws(()=>new Simulation([arrow(1),arrow(2)],square()));
  assert.throws(()=>new Simulation([arrow(1,[0,0,0],[1,0,1])],square()));
  assert.throws(()=>new Simulation([arrow(1,[0,0,0],[1,0,0],[[0,0,0],[3,0,0]])],square()));
});
test('concurrent short and long tails all enter and clear transit flags', () => {
  const sim = new Simulation([arrow(1,[0,0,-1],[1,0,0],[[0,0,0],[-1,0,0]]),arrow(2,[0,0,1],[1,0,0],Array.from({length:12},(_,i)=>[-i,0,0]))],square());
  assert.equal(sim.launch(1),'accepted'); assert.equal(sim.launch(2),'accepted');
  sim.advance(.05); assert(sim.arrows.every(a=>a.segments.every(s=>s.inTransit)));
  sim.advance(2);
  assert.equal(sim.onPath.length,14); assert(sim.arrows.every(a=>a.done));
  assert(sim.onPath.every(s=>!s.inTransit && s.position.every(Number.isFinite)));
  assert(sim.arrows.every(a=>a.histories.length===0));
});
test('occupied entry records group flag but admits; fallback inserts stalled tail', () => {
  const sim = new Simulation([arrow(1,[4.9,0,0],[1,0,0],[[0,0,0],[-1,0,0],[-2,0,0]])],square());
  const entry = sim.path.entry([4.9,0,0],[1,0,0]);
  const head = sim.arrows[0].segments[0];
  insert(sim,2,entry+.01); sim.insert(head,entry);
  assert(sim.pausedGroups.has(1)); assert.equal(sim.onPath.length,2);
  // Fill a tightly spaced foreign ring to keep the entering head from progressing.
  const stalled = new Simulation([arrow(1,[4.9,0,0],[1,0,0],[[0,0,0],[-1,0,0],[-2,0,0]])],square());
  assert.equal(stalled.launch(1),'accepted');
  for(let i=0;i<80;i++) insert(stalled,100+i,wrap(entry+i/80));
  stalled.advance(.8);
  assert.equal(stalled.arrows[0].segments.filter(s=>s.progress!==null).length,3);
  assert(stalled.arrows[0].done);
});
test('foreign spacing, same-group exemption and persistent gaps after removal', () => {
  const sim = new Simulation([],square());
  const follower = insert(sim,1,.1), leader = insert(sim,2,.1+.5/sim.path.length);
  sim.advance(tuning.tick); assert(Math.abs(follower.progress-.1)<1e-9);
  sim.remove(leader); sim.advance(tuning.tick);
  assert(Math.abs(follower.progress-(.1+tuning.speed*tuning.tick/sim.path.length))<1e-9);
  const same = new Simulation([],square());
  const a = insert(same,1,.99), b = insert(same,1,.995);
  same.advance(.1); assert(Math.abs(wrap(b.progress-a.progress)-.005)<1e-9);
  assert(a.progress < .1);
  const gaps = new Simulation([],square());
  const first = insert(gaps,1,.1), middle = insert(gaps,1,.2), last = insert(gaps,1,.3);
  gaps.remove(middle); gaps.advance(.4);
  assert(Math.abs(wrap(last.progress-first.progress)-.2)<1e-9);
});
test('admission is meter based at 90%; already admitted group can exceed it', () => {
  const sim = new Simulation([arrow(1,[0,0,0],[1,0,0],[[0,0,0],[-1,0,0],[-2,0,0]]),arrow(2,[0,0,2])],square());
  for(let i=0;i<71;i++) insert(sim,100+i,i/71);
  assert(sim.percentage<90); assert.equal(sim.launch(1),'accepted');
  insert(sim,999,.5); assert(Math.abs(sim.percentage-90)<1e-9);
  assert.equal(sim.launch(2),'full'); sim.advance(1);
  assert.equal(sim.arrows[0].done,true); assert(sim.percentage>90);
  assert.equal(sim.arrows[1].moving,false);
});
test('fixed substeps match irregular dt; paused time does not advance transit', () => {
  const make=()=>new Simulation([arrow(1,[0,0,0],[1,0,0],[[0,0,0],[-1,0,0]])],square());
  const a=make(),b=make(); a.launch(1); b.launch(1);
  a.advance(1); for(const t of [.13,.07,.3,.11,.39]) b.advance(t);
  assert.deepEqual(a.onPath.map(s=>s.position),b.onPath.map(s=>s.position));
  const before=JSON.stringify(b.onPath); b.paused=true; b.advance(10);
  assert.equal(JSON.stringify(b.onPath),before); b.paused=false; b.advance(.1);
  assert.notEqual(JSON.stringify(b.onPath),before); assert.throws(()=>b.advance(NaN));
});
test('candidate reference layout has free and blocked arrows and conserves all segments', () => {
  const data=JSON.parse(fs.readFileSync('src/data/level.json')),points=JSON.parse(fs.readFileSync('src/data/path.json'));
  const sim=new Simulation(data.arrows,new ConveyorPath(points));
  const free=sim.arrows.filter(a=>sim.canMove(a)); assert(free.length>0 && free.length<79);
  for(const a of free.slice(0,5)) assert.equal(sim.launch(a.data.id),'accepted');
  sim.advance(2);
  assert.equal(sim.arrows.flatMap(a=>a.segments).length,406);
  assert.equal(new Set(sim.onPath).size,sim.onPath.length);
});

test('every initially free reference arrow joins without teleporting, including long tails',()=>{
  const data=JSON.parse(fs.readFileSync('src/data/level.json')),raw=JSON.parse(fs.readFileSync('src/data/path.json'));
  const base=new Simulation(data.arrows,new ConveyorPath(raw));
  for(const free of base.arrows.filter(a=>base.canMove(a))){
    const sim=new Simulation(data.arrows,new ConveyorPath(raw));sim.launch(free.data.id);
    const a=sim.arrows.find(a=>a.data.id===free.data.id);
    assert(a.duration>=.2-1e-9,'Short exits still have visible animation');
    for(let frame=0;frame<4*120;frame++){
      const before=a.segments.map(s=>[...s.position]);sim.advance(tuning.tick);
      a.segments.forEach((s,i)=>assert(distance(before[i],s.position)<.3,`Arrow ${a.data.id} segment ${i} jumped on frame ${frame}`));
    }
    assert(a.done,`Arrow ${a.data.id} tail did not arrive`);
  }
});

test('clearing the head during a long transfer does not strand its following tail',()=>{
  const sim=new Simulation([arrow(1,[4,0,0],[1,0,0],Array.from({length:12},(_,i)=>[-i,0,0]))],square());
  sim.launch(1);sim.advance(.225);const a=sim.arrows[0],head=a.segments[0];
  assert.equal(head.inTransit,false);assert(a.segments.at(-1).inTransit);
  sim.remove(head);sim.advance(3);assert(a.done);assert.equal(sim.onPath.length,11);
  assert(a.segments.slice(1).every(s=>!s.inTransit));
});

test('long launches share the 20.25 unit body speed limit without a capped duration',()=>{
  for(const x of [-4,-20,-40]){
    const sim=new Simulation([arrow(1,[x,0,0])],square());sim.launch(1);
    const a=sim.arrows[0],length=distance(a.segments[0].position,sim.path.position(a.entry));
    assert(Math.abs(a.duration-length/20.25-.04)<1e-9);
    for(let i=0;i<12;i++){
      const before=[...a.segments[0].position];sim.advance(tuning.tick);
      const speed=distance(before,a.segments[0].position)/tuning.tick;
      assert(speed<=20.25+1e-8);
      if(i===0)assert(speed<2,'Launch should ease into movement');
      if(i>=10)assert(Math.abs(speed-20.25)<1e-8);
    }
  }
});

test('reference arrow parts enter with slightly tighter gaps and retain them while circulating',()=>{
  const data=JSON.parse(fs.readFileSync('src/data/level.json')),points=JSON.parse(fs.readFileSync('src/data/path.json'));
  const sim=new Simulation(data.arrows,new ConveyorPath(points));sim.launch(141);sim.advance(4);
  const a=sim.arrows.find(a=>a.data.id===141);
  const gaps=()=>a.segments.slice(1).map((s,i)=>wrap(a.segments[i].progress-s.progress)*sim.path.length);
  const before=gaps();assert(before.every(g=>g>.855&&g<1.1),JSON.stringify(before));
  sim.advance(1);gaps().forEach((g,i)=>assert(Math.abs(g-before[i])<1e-8));
});
