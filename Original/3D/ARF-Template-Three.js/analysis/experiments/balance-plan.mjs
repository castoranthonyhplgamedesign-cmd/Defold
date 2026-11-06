import fs from 'node:fs';
import {runtime,replay} from '../../scripts/overload-replay.mjs';
import {Simulation,preloadTuning} from '../../src/core/simulation.ts';
import {ConveyorPath} from '../../src/core/path.ts';
import {Session} from '../../src/core/session.ts';
const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json'));
const left=(a,b)=>a.data.position[0]-b.data.position[0]||a.data.position[2]-b.data.position[2];
function plan(chunk,freeWeight){
  const queues=[[{color:'blue',ammo:4}],[{color:'purple',ammo:5}],[{color:'purple',ammo:9}]];
  const lanes=[...runtime.shooters].sort((a,b)=>a.position[0]-b.position[0]).map((l,i)=>({...l,queue:queues[i]}));
  const sim=new Simulation(runtime.arrows,new ConveyorPath(runtime.path,.1,'first-intersection'),lanes,doc.board.grid.size),session=new Session(sim,Infinity);
  const budget=runtime.arrows.reduce((b,a)=>(b[a.color]=(b[a.color]??0)+a.cells.length,b),{white:sim.preloaded.length});
  queues.flat().forEach(c=>budget[c.color]-=c.ammo);
  const white=[[17,17],[13,12],[19,19]],whiteCount=[0,0,0];let next=0;
  for(let f=0;f<30*100&&!session.ended;f++){
    const free=sim.arrows.filter(a=>sim.canMove(a));
    for(let i=0;i<3;i++)if(!sim.cannons.lanes[i].queue.length){
      let cannon;
      if(queues[i].length===1||queues[i].length===3){cannon={color:'white',ammo:white[i][whiteCount[i]++]};}
      else {
        const arrival=sim.path.closest(sim.cannons.detector(sim.cannons.lanes[i]));
        const choices=Object.entries(budget).filter(([c,n])=>c!=='white'&&n>0).map(([color,n])=>{
          const active=sim.cannons.lanes.reduce((s,l)=>s+(l.queue[0]?.color===color?l.queue[0].ammo:0),0);
          const on=sim.onPath.filter(s=>s.color===color),f=free.filter(a=>a.data.color===color),ready=f.reduce((n,a)=>n+a.segments.length,0);
          const eta=Math.min(10,...on.map(s=>sim.unitsBetween(s.progress,arrival)/preloadTuning.blocksPerSecond));
          return {color,n,score:(Math.max(0,on.length-active)+freeWeight*Math.max(0,ready-active))/(1+eta),available:ready+on.length-active};
        }).sort((a,b)=>b.score-a.score||b.n-a.n);
        if(!choices.length)continue;const c=choices[0];
        cannon={color:c.color,ammo:Math.min(c.n,chunk,Math.max(2,c.available))};
      }
      budget[cannon.color]-=cannon.ammo;queues[i].push(cannon);sim.cannons.lanes[i].queue.push({...cannon,reserved:0,recoil:1});sim.cannons.lanes[i].advancing=.3;
    }
    if(session.time+1e-8>=next){const a=sim.hintable(free).sort(left)[0];if(a&&session.launch(a.data.id)==='accepted')next=session.time+.75;}
    session.advance(1/30);
  }
  if(Object.values(budget).some(n=>n!==0))return null;
  return queues;
}
let best;
for(const chunk of [6,10,14,20])for(const weight of [.25,1,3]){
  const queues=plan(chunk,weight);if(!queues){console.log({chunk,weight,invalid:true});continue;}
  const results=[.65,.75,.8].map(cadence=>replay(queues,{cadence,limit:85}));
  const score=Math.max(...results.map(r=>r.ending==='clear'?r.time:100));
  console.log(JSON.stringify({chunk,weight,score,times:results.map(r=>r.time)}));
  if(!best||score<best.score){best={chunk,weight,score,queues,results};fs.writeFileSync('analysis/evidence/balance-planned.json',JSON.stringify(best,null,2));}
}
