// Exact solver shipped by Phaser 3.90. No Phaser renderer or game runtime.
import Matter from 'phaser/src/physics/matter-js/CustomMain.js';
import {pileSlots,colorPile,makeRng} from './pile.ts';
const {Engine, Bodies, Body, Composite, Events}=Matter;
let engine, bodies={}, pairs=[], contacts=[], launcherRng;
const out=b=>({id:b.plugin.key,x:b.position.x,y:b.position.y,a:b.angle,vx:b.velocity.x,vy:b.velocity.y,speed:b.speed});
window.PuzzlePhysics={
 prepare(g){this.init();const rng=makeRng(g.SEED),slots=pileSlots(rng);let top=g.FLOOR_Y;
 const commands=[{op:'rect',id:'left',x:g.BOARD_LEFT-100,y:g.FLOOR_Y-2500,w:200,h:6000,static:true},{op:'rect',id:'right',x:g.BOARD_RIGHT+100,y:g.FLOOR_Y-2500,w:200,h:6000,static:true},{op:'rect',id:'floor',x:540,y:g.FLOOR_Y+100,w:2000,h:200,static:true}];
 slots.forEach((s,i)=>{const r=g.RING_HOLE+g.RING_PITCH*s.n;top=Math.min(top,s.y-r);commands.push({op:'circle',id:'b'+(i+1),x:s.x,y:s.y,r,mass:(r/(g.RING_HOLE+g.RING_PITCH*3))**3});});
 commands.push({op:'rect',id:'gift',x:g.BOX_X,y:top-g.BOX_H/2-2,w:g.BOX_W,h:g.BOX_H,mass:g.BOX_MASS});
 const state=JSON.parse(this.run(commands,g.PILE_SETTLE_STEPS));
 const items=slots.map((s,i)=>{const b=bodies['b'+(i+1)];return {two:s.two,ball:{id:'b'+(i+1),x:b.position.x,y:b.position.y,radius:b.circleRadius,rings:new Array(s.n).fill(0)}}});
 colorPile(items,rng);const gift=out(bodies.gift);top=bodies.gift.bounds.min.y;for(const x of items)top=Math.min(top,x.ball.y-x.ball.radius);
 for(const x of items)this.run([{op:'remove',id:x.ball.id}]);this.run([{op:'remove',id:'gift'},{op:'rect',id:'ceiling',x:540,y:g.CEILING_Y-100,w:2000,h:200,static:true}]);
 launcherRng=makeRng(g.SEED);return JSON.stringify({balls:items.map(x=>x.ball),gift,drop:top-(g.CEILING_Y+4)});},
 random(){return launcherRng();},
 init(){engine=Engine.create({positionIterations:20,velocityIterations:10});engine.gravity.y=2.094;bodies={};pairs=[];contacts=[];
  Events.on(engine,'collisionStart',e=>{for(const p of e.pairs){const a=p.bodyA.parent,b=p.bodyB.parent;contacts.push([a.plugin.key,b.plugin.key]);
   for(const [x,y] of [[a,b],[b,a]]){if(!x.plugin.landing||y.label!=='ball')continue;let nx=x.position.x-y.position.x,ny=x.position.y-y.position.y;const len=Math.hypot(nx,ny)||1;nx/=len;ny/=len;const vn=((x.plugin.vx||0)-(y.plugin.vx||0))*nx+((x.plugin.vy||0)-(y.plugin.vy||0))*ny;if(vn< -2){const k=-vn*.35;if(k>(x.plugin.kick?.v||0))x.plugin.kick={nx,ny,v:k};}}
  }});return true;},
 run(commands,steps=0){for(const c of (Array.isArray(commands)?commands:[])){let b=bodies[c.id];
  if(c.op==='circle'){b=Bodies.circle(c.x,c.y,c.r,{label:'ball',restitution:c.restitution??0.1,friction:0.15,frictionStatic:0.15,frictionAir:0.01});Body.setMass(b,c.mass);}
  if(c.op==='rect'){b=Bodies.rectangle(c.x,c.y,c.w,c.h,{isStatic:!!c.static,label:c.id,mass:c.mass||1,friction:c.id==='gift'?0.3:0.1,...(c.id==='gift'?{chamfer:{radius:14}}:{})});if(c.angle)Body.setAngle(b,c.angle);}
  if(c.op==='circle'||c.op==='rect'){b.plugin.key=c.id;bodies[c.id]=b;Composite.add(engine.world,b);}
  else if(c.op==='remove'&&b){Composite.remove(engine.world,b);delete bodies[c.id];}
  else if(c.op==='resize'&&b){const k=c.r/b.circleRadius;Body.scale(b,k,k);Body.setMass(b,c.mass);}
  else if(c.op==='velocity'&&b)Body.setVelocity(b,{x:c.x,y:c.y});
  else if(c.op==='friction'&&b){b.friction=c.value;b.frictionStatic=c.value;b.plugin.landing=c.value===0;}
  else if(c.op==='position'&&b){if(c.static)Body.setStatic(b,true);Body.setPosition(b,{x:c.x,y:c.y});}
 }
 contacts=[];
 for(let i=0;i<steps;i++){
  for(const b of Object.values(bodies))if(b.label==='ball'){const k=b.plugin.kick;if(k){const v=b.velocity,o=v.x*k.nx+v.y*k.ny;if(o<k.v)Body.setVelocity(b,{x:v.x+k.nx*(k.v-o),y:v.y+k.ny*(k.v-o)});b.plugin.kick=null;}b.plugin.vx=b.velocity.x;b.plugin.vy=b.velocity.y;Body.setAngularVelocity(b,b.angularVelocity*0.85);}
  Engine.update(engine,1000/60);
 }
 pairs=engine.pairs.list.filter(p=>p.isActive).map(p=>[p.bodyA.parent.plugin.key,p.bodyB.parent.plugin.key]);
 return JSON.stringify({bodies:Object.values(bodies).filter(b=>!b.isStatic||b.label==='ball').map(out),contacts,pairs});
 },
 inspect(){return {bodies:Object.values(bodies).map(out),pairs};}
};
