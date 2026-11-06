import fs from 'node:fs';
import {replay} from '../../scripts/overload-replay.mjs';
let best=JSON.parse(fs.readFileSync('analysis/evidence/balance-compact.json'));
const evaluate=q=>[.65,.75,.8].map(cadence=>replay(q,{cadence,limit:65}));
const score=rs=>Math.max(...rs.map(r=>r.ending==='clear'?r.time:100));
let results=evaluate(best),value=score(results),seed=391;
const random=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/2**32;
const pick=a=>a[Math.floor(random()*a.length)];
const seen=new Set();
for(let i=0;i<150;i++){
 const q=structuredClone(best),slots=q.flatMap((l,lane)=>l.flatMap((c,index)=>index>3?[{lane,index,c}]:[]));
 const a=pick(slots),b=pick(slots);[q[a.lane][a.index],q[b.lane][b.index]]=[q[b.lane][b.index],q[a.lane][a.index]];
 const key=JSON.stringify(q);if(seen.has(key))continue;seen.add(key);
 for(const l of q)for(let j=l.length-1;j>1;j--)if(l[j].color===l[j-1].color){l[j-1].ammo+=l[j].ammo;l.splice(j,1);}
 const r=replay(q,{cadence:.8,limit:value+.05});if(r.ending!=='clear'||r.time>value)continue;
 const rs=evaluate(q),s=score(rs);if(s<value){best=q;results=rs;value=s;console.log({trial:i,value,times:rs.map(r=>r.time)});fs.writeFileSync('analysis/evidence/balance-tail.json',JSON.stringify({queues:best,results,value},null,2));}
}
