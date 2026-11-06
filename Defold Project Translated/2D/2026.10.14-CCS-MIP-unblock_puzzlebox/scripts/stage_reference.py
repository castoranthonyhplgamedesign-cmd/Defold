"""Copy baseline read-only source into an ignored staging area and add observation hooks."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent.parent
source=root.parents[2]/'Original/2D/2026.10.14-CCS-MIP-unblock_puzzlebox'
target=root/'tools/reference'
target.mkdir(parents=True,exist_ok=True)
for p in source.iterdir():
 if p.name in ('.git','node_modules','dist','dist-perf'):continue
 dest=target/p.name
 if p.is_dir():shutil.copytree(p,dest,dirs_exist_ok=True)
 else:shutil.copy2(p,dest)
p=target/'src/game/Board.ts';s=p.read_text(encoding='utf-8')
before='    for (let i = 0; i < GAME.PILE_SETTLE_STEPS; i++) m.world.step(1000 / 60)'
pre="    ;(window as any).__referencePre={gravity:(m.world.engine as any).gravity,engine:{positionIterations:m.world.engine.positionIterations,velocityIterations:m.world.engine.velocityIterations,constraintIterations:m.world.engine.constraintIterations},bodies:m.world.getAllBodies().map((b:any)=>({x:b.position.x,y:b.position.y,mass:b.mass,inertia:b.inertia,friction:b.friction,frictionStatic:b.frictionStatic,restitution:b.restitution,density:b.density,slop:b.slop,timeScale:b.timeScale,circleRadius:b.circleRadius,isStatic:b.isStatic,inverseMass:b.inverseMass,area:b.area,angle:b.angle,vertices:b.vertices.map((v:any)=>[v.x,v.y])}))};\n"
steps='    for (let i = 0; i < GAME.PILE_SETTLE_STEPS; i++) {m.world.step(1000 / 60); if(i<10) ((window as any).__steps ||= []).push(m.world.getAllBodies().map((b:any)=>({id:b.id,x:b.position.x,y:b.position.y,a:b.angle})));}'
assert before in s;s=s.replace(before,pre+steps)
needle='    for (const b of this.balls) b.redraw()'
capture="    ;(window as any).__referenceSettled={balls:this.balls.map(b=>({x:b.x,y:b.y,rings:[...b.rings]})),gift:{x:this.boxPos.x,y:boxY,a:this.boxPos.angle},top};\n"
assert needle in s;s=s.replace(needle,capture+needle);p.write_text(s,encoding='utf-8')
print('Staged baseline with observation-only hooks. Original unchanged.')
