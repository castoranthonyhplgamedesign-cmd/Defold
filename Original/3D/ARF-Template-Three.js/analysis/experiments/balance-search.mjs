import fs from 'node:fs';
import {replay} from '../../scripts/overload-replay.mjs';
import {overloadQueues} from '../../src/data/overloadCannons.ts';

const queues=overloadQueues.map(q=>{const a=structuredClone(q),i=a.findIndex(c=>c.color==='white');a.splice(1,0,...a.splice(i,1));return a;});
let best=queues,result=replay(best,{limit:80}),runs=1;
const score=r=>r.ending==='clear'?r.time:100+(1-r.cleared)*100;
let seed=29;const random=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/2**32;
function valid(q){
  if(q.some(l=>l.some((c,i)=>i&&l[i-1].color===c.color)))return false;
  const totals=q.map(l=>l.reduce((n,c)=>n+c.ammo,0));return Math.max(...totals)-Math.min(...totals)<=10;
}
const seen=new Set();
for(let i=0;i<180;i++){
  const q=structuredClone(best),slots=q.flatMap((l,lane)=>l.flatMap((c,index)=>index>1?[{lane,index}]:[]));
  const a=slots[Math.floor(random()*slots.length)],b=slots[Math.floor(random()*slots.length)];
  [q[a.lane][a.index],q[b.lane][b.index]]=[q[b.lane][b.index],q[a.lane][a.index]];
  const key=JSON.stringify(q);if(seen.has(key)||!valid(q))continue;seen.add(key);
  const r=replay(q,{limit:Math.min(80,Math.max(62,result.time+3))});runs++;
  if(score(r)<score(result)){best=q;result=r;console.log(JSON.stringify({trial:i,runs,time:r.time,ending:r.ending}));fs.writeFileSync('analysis/evidence/balance-candidate.json',JSON.stringify({queues:best,result,runs},null,2));}
  if(runs%20===0)console.log(JSON.stringify({runs,best:result.time}));
}
const checks=[];for(const options of [{cadence:.65},{cadence:.8},{cadence:.75,reverse:true}]){const r=replay(best,{...options,limit:100});checks.push({options,...r});console.log(JSON.stringify({options,time:r.time,ending:r.ending}));}
fs.writeFileSync('analysis/evidence/balance-candidate.json',JSON.stringify({queues:best,result,checks,runs},null,2));
