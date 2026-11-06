import {registerHooks} from 'node:module';
import fs from 'node:fs';
registerHooks({load(url,context,next){const r=next(url,context);if(url.endsWith('/core/simulation.ts'))r.source=String(r.source).replace("if (this.percentage >= (this.capacity===null?tuning.admission:100) || arrow.segments.length > this.room) return 'full';","if(this.capacity===null&&this.percentage>=tuning.admission)return 'full';");return r;}});
const {Simulation}=await import('../../src/core/simulation.ts');
const {ConveyorPath}=await import('../../src/core/path.ts');
const {flowRuntime}=await import('../../src/layout/arrowFlow.ts');
const doc=JSON.parse(fs.readFileSync('levels/overload-level.arrow-flow.json')),r=flowRuntime(doc);
const sim=new Simulation(r.arrows,new ConveyorPath(r.path,.1,'first-intersection'),[],doc.board.grid.size);
const a=sim.arrows.find(a=>sim.canMove(a)&&a.segments.length>sim.room);
console.log({id:a.data.id,color:a.data.color,length:a.segments.length,entry:a.entry,result:sim.launch(a.data.id)});
for(let i=0;i<600;i++){
 sim.advance(1/120);
 if(i%30===0)console.log({time:i/120,n:sim.onPath.length,jammed:sim.jammed,overloaded:sim.overloaded,head:a.travelled,segments:a.segments.map(s=>({joined:s.progress!==null,p:s.position,near:Math.min(...sim.onPath.filter(b=>b.arrowId!==s.arrowId).map(b=>Math.hypot(b.position[0]-s.position[0],b.position[2]-s.position[2])))}))});
}
