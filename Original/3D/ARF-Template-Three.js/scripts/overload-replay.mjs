import fs from 'node:fs';
import {flowRuntime} from '../src/layout/arrowFlow.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {Simulation} from '../src/core/simulation.ts';
import {Session} from '../src/core/session.ts';
import {overloadHintOrder} from '../src/data/overloadCannons.ts';

const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json'));
export const runtime=flowRuntime(doc);
const path=new ConveyorPath(runtime.path,.1,'first-intersection');

// Deterministic color-aware player; no state edits, ammo grants or skipped simulation time.
export function replay(queues,{cadence=.75,limit=120,reverse=false,duration=Infinity,idle=0,step=1/30,guided=false,hesitation}={}){
  const lanes=[...runtime.shooters].sort((a,b)=>a.position[0]-b.position[0]).map((l,i)=>({...l,queue:queues[i]}));
  const sim=new Simulation(runtime.arrows,path,lanes,doc.board.grid.size),session=new Session(sim,duration,Infinity,overloadHintOrder);
  session.advance(idle);
  const log=[],milestones=[];let next=0;
  while(session.time<limit&&!session.ended){
    if(session.time+1e-8>=next){
      const candidates=sim.hintable(sim.arrows.filter(a=>sim.canMove(a))).sort((a,b)=>(reverse?-1:1)*(a.data.position[0]-b.data.position[0])||a.data.position[2]-b.data.position[2]);
      const a=guided?sim.arrows.find(a=>a.data.id===session.hintId):candidates[0];
      if(a){
        const result=session.launch(a.data.id);
        if(result==='accepted'){
          next=session.time+cadence;log.push({time:+session.time.toFixed(3),id:a.data.id,color:a.data.color});
          if(log.length===hesitation?.after)next+=hesitation.seconds;
        }
      }
    }
    const before=Math.floor(session.time/10);session.advance(step);
    if(Math.floor(session.time/10)>before)milestones.push({time:Math.round(session.time),launched:log.length,cleared:Math.round(sim.cleared*100),white:sim.preloaded.filter(s=>!s.removed).length});
  }
  return {time:+(session.time-idle).toFixed(3),ending:session.ended,launched:log.length,cleared:sim.cleared,whites:sim.preloaded.filter(s=>!s.removed).length,log,milestones};
}
