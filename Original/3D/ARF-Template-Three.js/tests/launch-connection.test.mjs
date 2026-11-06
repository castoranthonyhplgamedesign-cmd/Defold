import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {Simulation,tuning} from '../src/core/simulation.ts';
import {ConveyorPath,distance} from '../src/core/path.ts';
const path=()=>new ConveyorPath([[20,0,-20],[-20,0,-20],[-20,0,20],[20,0,20]],.1,'first-intersection');
test('long launches preserve every body link instead of letting the head outrun its tail',()=>{
 for(const size of [.5,.75,1,1.5])for(let turn=0;turn<4;turn++){
  const rotate=p=>{let [x,y,z]=p;for(let i=0;i<turn;i++)[x,z]=[-z,x];return [x,y,z];};
  for(const bent of [false,true]){
   const cells=(bent?[[0,0,0],[-1,0,0],[-2,0,0],[-2,0,1],[-2,0,2],[-3,0,2]]:Array.from({length:6},(_,i)=>[-i,0,0])).map(p=>rotate(p.map(v=>v*size)));
   const sim=new Simulation([{id:1,color:'green',cellSize:size,position:[0,0,0],direction:rotate([1,0,0]),cells}],path());assert.equal(sim.launch(1),'accepted');const a=sim.arrows[0];
   for(let frame=0;frame<600&&!a.done;frame++){
    const before=a.segments.map(s=>[...s.position]);sim.advance(tuning.tick);
    for(let i=1;i<a.segments.length;i++)if(a.segments[i].progress===null){assert(distance(a.segments[i-1].position,a.segments[i].position)<=size*1.06,`detached at size ${size}, turn ${turn}, frame ${frame}, part ${i}`);assert(distance(before[i],a.segments[i].position)<=20.25*tuning.tick+1e-8,'Tail exceeds its travel cap');}
    if(a.segments[0].progress===null&&!bent)for(let i=1;i<a.segments.length;i++){const gap=distance(a.segments[i-1].position,a.segments[i].position);assert(gap>=size-1e-8&&gap<=size*1.04+1e-8);}
   }
   assert(a.done);assert.equal(sim.onPath.length,6);
  }
 }
});
test('authored bends begin moving down their own route without shortcutting toward the head',()=>{
 const cells=[[0,0,0],[-1,0,0],[-1,0,1],[-2,0,1]];
 const sim=new Simulation([{id:1,color:'green',position:[0,0,0],direction:[1,0,0],cells}],path());sim.launch(1);sim.advance(tuning.tick);
 const a=sim.arrows[0],headTravel=a.segments[0].position[0],bodyTravel=a.segments[1].position[0]+1;
 assert(bodyTravel>0&&bodyTravel<headTravel,'Body should ease after the head');assert.equal(a.segments[2].position[0],-1);assert(a.segments[2].position[2]<1&&a.segments[2].position[2]>1-bodyTravel);
});
test('all initially free reference arrows retain their links before the head reaches the conveyor',()=>{
 const data=JSON.parse(fs.readFileSync('src/data/level.json')),raw=JSON.parse(fs.readFileSync('src/data/path.json')),base=new Simulation(data.arrows,new ConveyorPath(raw));
 for(const free of base.arrows.filter(a=>base.canMove(a))){const sim=new Simulation(data.arrows,new ConveyorPath(raw));sim.launch(free.data.id);const a=sim.arrows.find(a=>a.data.id===free.data.id);while(a.segments[0].progress===null){sim.advance(tuning.tick);if(a.segments[0].progress!==null)break;for(let i=1;i<a.segments.length;i++)assert(distance(a.segments[i-1].position,a.segments[i].position)<=1.04+1e-7,`reference arrow ${a.data.id} part ${i}`);}}
});
