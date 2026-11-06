import fs from 'node:fs';
import {replay} from '../../scripts/overload-replay.mjs';
let best=JSON.parse(fs.readFileSync('analysis/evidence/balance-planned.json')).queues;
const check=q=>[.65,.75,.8].map(cadence=>replay(q,{cadence,limit:64}));
const score=rs=>Math.max(...rs.map(r=>r.ending==='clear'?r.time:100));
let results=check(best),value=score(results),seed=167;
const random=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/2**32;
const pick=a=>a[Math.floor(random()*a.length)];
for(let i=0;i<250;i++){
 const q=structuredClone(best),slots=q.flatMap((l,lane)=>l.flatMap((c,index)=>index>0?[{lane,index,c}]:[]));
 const a=pick(slots),same=slots.filter(b=>b!==a&&b.c.color===a.c.color);
 if(random()<.65&&same.length){const b=pick(same),n=Math.min(a.c.ammo-1,1+Math.floor(random()*5));a.c.ammo-=n;b.c.ammo+=n;}
 else{const b=pick(slots);[q[a.lane][a.index],q[b.lane][b.index]]=[q[b.lane][b.index],q[a.lane][a.index]];}
 if(q.some(l=>l[1].color!=='white'||l.some((c,j)=>j&&l[j-1].color===c.color)))continue;
 const totals=q.map(l=>l.reduce((n,c)=>n+c.ammo,0));if(Math.max(...totals)-Math.min(...totals)>30)continue;
 const first=replay(q,{cadence:.75,limit:Math.min(64,value+.1)});if(first.ending!=='clear'||first.time>value)continue;
 const rs=check(q),s=score(rs);
 if(s<value){best=q;results=rs;value=s;console.log({trial:i,value,times:rs.map(r=>r.time),totals});fs.writeFileSync('analysis/evidence/balance-refined.json',JSON.stringify({queues:best,results,value},null,2));}
 if(i%25===0)console.log({trial:i,best:value});
}
