import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s)};
const esc=s=>JSON.stringify(s);
const comp=(id,component)=>`components { id: "${id}" component: "${component}" position {x:0 y:0 z:0} rotation {x:0 y:0 z:0 w:1} }\n`;
const embedded=(id,data,p=[0,0,0],s=[1,1,1],angle=0)=>`embedded_instances { id: "${id}" data: ${esc(data)} position { x:${p[0]} y:${p[1]} z:${p[2]} } rotation { x:0 y:${Math.sin(angle/2)} z:0 w:${Math.cos(angle/2)} } scale3 { x:${s[0]} y:${s[1]} z:${s[2]} } }\n`;
let collection='name: "main"\n';
let game=comp('script','/main/game.script');
for(const name of ['bgm','drag','drop','crumple']){
    write(`main/${name}.sound`,`sound: "/assets/${name}.wav"\nlooping: ${name==='bgm'?1:0}\ngroup: "master"\ngain: 1\npan: 0\nspeed: 1\n`);
    game+=comp(name,`/main/${name}.sound`);
}
collection+=embedded('game',game);
collection+=embedded('hud',comp('gui','/main/hud.gui'));
let id=0;
for(let x=-3;x<=3;x++) collection+=embedded('brick'+(++id),comp('mesh','/assets/models/tileLong.mesh'),[x,0,3.5],[0.932,1.326,0.956]);
for(let z=-2;z<=7;z++)for(let x=-3;x<=3;x++)if(!(x>=-1&&x<=1&&z>=-1&&z<=5))collection+=embedded('brick'+(++id),comp('mesh','/assets/models/tileShort.mesh'),[x,0,-z],[0.953,1.342,0.953]);
for(let i=0;i<7;i++)collection+=embedded('gate'+(i+1),comp('mesh','/assets/models/gate.mesh'),[i-3,0,-7.67],[1.05,1.05,1.05],-Math.PI/2);
collection+=embedded('gate8',comp('mesh','/assets/models/gate.mesh'),[-3.71,0,-1]);
collection+=embedded('gate9',comp('mesh','/assets/models/gate.mesh'),[3.7,0,-2],[1,0.98,1],Math.PI);
for(const [name,p]of [['borderOuter',[0.09,-0.1,-1.35]],['borderInside',[0,-0.1,-2]]])collection+=embedded(name,comp('mesh',`/assets/models/${name}.mesh`),p);
// Board surface uses the original board texture and the reference port's cutout.
const pos=[],normal=[],uv=[];
function quad(x0,x1,z0,z1){for(const [x,z]of [[x0,z0],[x1,z1],[x1,z0],[x0,z0],[x0,z1],[x1,z1]]){pos.push(x,0,-z);normal.push(0,1,0);uv.push((10+(z+4.5)*84)/1024,1-(178+(x+3.5)*84)/1024)}}
quad(-3.536,3.542,-4.639,-1.08);quad(-3.536,-1.12,-1.08,5.08);quad(1.12,3.542,-1.08,5.08);quad(-3.536,3.542,5.08,7.537);
write('assets/models/floor.buffer',JSON.stringify([{name:'position',type:'float32',count:3,data:pos},{name:'normal',type:'float32',count:3,data:normal},{name:'texcoord0',type:'float32',count:2,data:uv}]));
write('assets/models/floor.mesh','material: "/render/floor.material"\nvertices: "/assets/models/floor.buffer"\ntextures: "/assets/board.png"\nprimitive_type: PRIMITIVE_TRIANGLES\nposition_stream: "position"\nnormal_stream: "normal"\n');
collection+=embedded('floor',comp('mesh','/assets/models/floor.mesh'));
write('main/main.collection',collection);
console.log(`Generated scene: ${id} bricks, 9 gates.`);
