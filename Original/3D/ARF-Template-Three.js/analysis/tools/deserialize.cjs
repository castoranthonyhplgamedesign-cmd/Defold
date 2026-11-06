// Data-only reader of the compiled array format; never instantiates or executes reference classes.
const fs=require('fs'),path=require('path'),assert=require('assert');
const base='analysis/extracted/bundle';fs.mkdirSync('analysis/assets/serialized',{recursive:true});
function uuid(s){const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';if(s.split('@')[0].length!==22)return s;let [v,suffix]=s.split('@'),hex=v.slice(0,2);for(let i=2;i<22;i+=2){let a=chars.indexOf(v[i]),b=chars.indexOf(v[i+1]);hex+=(a>>2).toString(16)+(((a&3)<<2)|(b>>4)).toString(16)+(b&15).toString(16);}return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-')+(suffix?'@'+suffix:'');}
function decode(data){
 const [version,uuids,strings,classes,masks,instances,types,refs,owners,props,assets]=data,patch=[];
 function value(v){const names=['Vec2','Vec3','Vec4','Quat','Color','Size','Rect','Mat4'];let o={__type__:'cc.'+names[v[0]]};if(v[0]===4){o.r=v[1]&255;o.g=v[1]>>>8&255;o.b=v[1]>>>16&255;o.a=v[1]>>>24;}else{const keys=v[0]===5?['width','height']:v[0]===6?['x','y','width','height']:['x','y','z','w'];v.slice(1).forEach((x,i)=>o[keys[i]||i]=x);}return o;}
 function field(o,k,type,v){switch(type){case 0:o[k]=v;break;case 1:if(v>=0)o[k]={__ref__:v};else patch.push({slot:3*~v,o,k});break;case 2:o[k]=v.map((x,i)=>{let a={};field(a,'v',1,x);if(x<0){patch[patch.length-1]={slot:3*~x,o:v,k:i};return null;}return a.v;});for(let p of patch)if(p.o===v)p.o=o[k];break;case 3:o[k]=v.map((x,i)=>{patch.push({asset:x,o:v,k:i});return null;});for(let p of patch)if(p.o===v)p.o=o[k];break;case 4:o[k]=obj(v);break;case 5:case 8:o[k]=value(v);break;case 6:patch.push({asset:v,o,k});break;case 7:o[k]=v;break;case 9:o[k]=v.map(obj);break;case 10:o[k]={__type__:classes[v[0]],content:v[1]};break;case 11:o[k]=v[0];for(let i=1;i<v.length;i+=3)field(o[k],v[i],v[i+1],v[i+2]);break;case 12:o[k]=v[0];for(let i=0;i<o[k].length;i++)if(v[i+1])field(o[k],i,v[i+1],o[k][i]);break;default:throw Error('unknown '+type);}}
 function obj(v){const mask=masks[v[0]],cls=classes[mask[0]],o={__type__:cls[0]},simple=mask.at(-1);for(let i=1;i<v.length;i++){const p=mask[i],key=cls[1][p];assert(key!==undefined);field(o,key,i<simple?0:cls[p+cls[2]],v[i]);}return o;}
 const n=types?types.length:0;let count=instances.length-n;if(typeof instances.at(-1)==='number')count--;const out=instances.slice(0,count).map(obj);
 for(let i=0;i<n;i++){const type=types[i],v=instances[count+i];if(type>=0)out.push({__type__:classes[type],content:v});else{let a={};field(a,'v',~type,v);out.push(a.v);}}
 for(const p of patch){if(p.slot!==undefined)p.o[p.k]={__ref__:refs[p.slot+2]};else p.o[p.k]={__uuid__:uuid(typeof assets[p.asset]==='number'?uuids[assets[p.asset]]:assets[p.asset])};}
 if(refs)for(let i=3*refs.at(-1);i<refs.length-1;i+=3){const key=refs[i+1]>=0?strings[refs[i+1]]:~refs[i+1];out[refs[i]][key]={__ref__:refs[i+2]};}
 if(owners)owners.forEach((o,i)=>{if(typeof o==='number'&&!patch.some(p=>p.asset===i)){let k=typeof props[i]==='number'?(props[i]>=0?strings[props[i]]:~props[i]):props[i];out[o][k]={__uuid__:uuid(typeof assets[i]==='number'?uuids[assets[i]]:assets[i])};}});
 return {root:typeof instances.at(-1)==='number'?(instances.at(-1)<0?~instances.at(-1):instances.at(-1)):0,objects:out};
}
const manifest=[];
for(const bundle of ['main','internal']){
 const cfg=JSON.parse(fs.readFileSync(`${base}/assets/${bundle}/config.json`));
 for(const [pack,ids] of Object.entries(cfg.packs)){
 const file=`${base}/assets/${bundle}/import/${pack.slice(0,2)}/${pack}.json`,data=JSON.parse(fs.readFileSync(file));
 if(!Array.isArray(data)){fs.writeFileSync(`analysis/assets/serialized/${bundle}-${pack}.json`,JSON.stringify(data,null,2));continue;}
 data[5].forEach((part,i)=>{const id=uuid(cfg.uuids[ids[i]]),v=decode([...data.slice(0,5),...part]),dest=`analysis/assets/serialized/${id}.json`;fs.writeFileSync(dest,JSON.stringify(v,null,2));manifest.push({id,bundle,pack,index:i,file:dest,type:v.objects[v.root]?.__type__,name:v.objects[v.root]?._name||v.objects[v.root]?.content?.name||''});});
 }
}
fs.writeFileSync('analysis/evidence/serialized-manifest.json',JSON.stringify(manifest,null,2));console.log(manifest.map(x=>({id:x.id,type:x.type,name:x.name})));
