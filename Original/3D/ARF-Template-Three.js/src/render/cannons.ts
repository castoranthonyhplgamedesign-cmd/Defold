import { BoxGeometry, BufferGeometry, Camera, Color, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Scene, SphereGeometry, Vector3 } from 'three';
import type { Cannons, Impact, LaneData } from '../core/cannons';
import { cannonTuning, lanePoint } from '../core/cannons';
import { UI_LAYER } from '../constants';
import { planeTransform } from '../ui/projection';

const smooth = (t: number) => t * t * (3 - 2 * t);
const bounce = (t: number) => {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + .75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + .9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
};
// Hit burst: colored shards hop out and fall, white sparks streak radially, a white flash pops at the hit.
// Retire: an emptied cannon swells, then shrinks away in a big burst. Door: a shutter rolls down over an empty lane.
const retireTuning = { swell: .08, seconds: .25, grow: .2, burst: 1.8 }, doorTuning = { seconds: .35, width: 2.6, height: 2.4, depth: .14, z: .32 };
const burstTuning = { shards: 8, shardLife: .45, shardSpeed: 6, shardLift: 5, gravity: 22, shardSize: .42, sparks: 6, sparkLife: .22, sparkSpeed: 9, sparkLength: .9, sparkWidth: .12, flash: 2.2, max: 48 };
const hash = (n: number, i: number) => { const x = Math.sin(n * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); };
// View-only lane scale about the front cannon's muzzle, so the muzzle still meets the belt at the core detector.
const muzzle = 2.95;
export const laneView = (lane: Pick<LaneData, 'position' | 'yaw'>, scale: number) => (x: number, y: number, z: number) => lanePoint(lane, x * scale, y * scale, muzzle + (z - muzzle) * scale);
// Fire kick: the front cannon jumps back from the muzzle, squashes and bulges, then settles; seconds fits the
// ~.1 s between shots at 10 blocks/s. Projectile: scale of the .375-radius ball.
const fireTuning = { seconds: .12, kick: .55, squash: .3, bulge: .22, projectile: 1.8 };
const kick = (age: number) => age >= fireTuning.seconds ? 0 : (1 - age / fireTuning.seconds) ** 2;

export function createCannons(scene: Scene, root: HTMLElement, core: Cannons, geometry: BufferGeometry, materials: Record<string, MeshStandardMaterial>, laneScale = 1) {
  // Unit door box hangs from its top edge, so scaling its height rolls the shutter down.
  const doorBox = new BoxGeometry(1, 1, 1).translate(0, -.5, 0);
  const lanes = core.lanes.map((lane, index) => {
    const view = laneView(lane, laneScale);
    const meshes = [0, 1].map(() => {
      const mesh = new Mesh(geometry, materials.white); mesh.rotation.y = Math.PI / 2+(lane.yaw??0); scene.add(mesh); return mesh;
    });
    const label = document.createElement('span'); label.className = 'cannon-ammo';
    label.style.zIndex = String(UI_LAYER.hud); label.dataset.lane = String(index); root.appendChild(label);
    const reserve = document.createElement('span'); reserve.className='cannon-ammo cannon-reserve'; reserve.style.zIndex=String(UI_LAYER.hud); root.appendChild(reserve);
    const retire = new Mesh(geometry, materials.white); retire.rotation.y = Math.PI / 2 + (lane.yaw ?? 0); retire.visible = false; scene.add(retire);
    const door = new Mesh(doorBox, materials.Outer ?? materials.neutral); door.rotation.y = lane.yaw ?? 0; door.visible = false; scene.add(door);
    return { lane, view, meshes, label, reserve, retire, door, front: lane.queue[0], retiredAt: -Infinity, retiredColor: 'white', emptyAt: Infinity };
  });
  const capacity = Math.max(1, core.lanes.reduce((sum, lane) => sum + Math.max(0, ...lane.queue.map(c => c.ammo)), 0));
  const sphere = new SphereGeometry(.375, 8, 6), cube = new BoxGeometry();
  const shardMaterial = materials.neutral.clone(), sparkMaterial = new MeshBasicMaterial({ color: 0xffffff });
  const projectiles = new InstancedMesh(sphere, materials.neutral, capacity);
  const flashes = new InstancedMesh(sphere, sparkMaterial, capacity + burstTuning.max);
  const shards = new InstancedMesh(cube, shardMaterial, burstTuning.max * burstTuning.shards);
  const sparks = new InstancedMesh(cube, sparkMaterial, burstTuning.max * burstTuning.sparks);
  const effects = [projectiles, flashes, shards, sparks];
  for (const mesh of effects) { mesh.frustumCulled = false; mesh.count = 0; scene.add(mesh); }
  const seen = new WeakSet<Impact>(), bursts: { position: number[]; color: string; born: number; n: number; size: number }[] = [];
  let burstCount = 0;
  const pose = new Object3D(), color = new Color(), point = new Vector3(), top = new Vector3();
  function sync(time = 0) {
    for (const impact of core.impacts) if (!seen.has(impact)) {
      seen.add(impact); bursts.push({ position: impact.position, color: impact.color, born: time - impact.age, n: burstCount++, size: 1 });
      if (bursts.length > burstTuning.max) bursts.shift();
    }
    while (bursts.length && (core.stopped || time - bursts[0].born >= burstTuning.shardLife)) bursts.shift();
    for (const entry of lanes) {
      const { lane, view, meshes, label, reserve, retire, door } = entry;
      // A front cannon leaving the queue (emptied, or its color is gone) retires with a swell, shrink and burst.
      if (lane.queue[0] !== entry.front) {
        if (entry.front && !core.stopped) {
          entry.retiredAt = time; entry.retiredColor = entry.front.color;
          bursts.push({ position: view(0, .428, 2.2), color: entry.front.color, born: time, n: burstCount++, size: retireTuning.burst });
          if (bursts.length > burstTuning.max) bursts.shift();
        }
        entry.front = lane.queue[0];
        if (!lane.queue.length) entry.emptyAt = time;
      }
      const age = time - entry.retiredAt;
      retire.visible = age < retireTuning.seconds;
      if (retire.visible) {
        retire.material = materials[entry.retiredColor] ?? materials.white;
        retire.position.fromArray(view(0, .428, 2.2));
        retire.scale.setScalar(1.2 * laneScale * (age < retireTuning.swell ? 1 + retireTuning.grow * age / retireTuning.swell : (1 + retireTuning.grow) * (1 - (age - retireTuning.swell) / (retireTuning.seconds - retireTuning.swell))));
      }
      // The run's end shuts every lane door, then the endcard follows (sessionTuning.endcardDelay).
      if (core.stopped && entry.emptyAt === Infinity) entry.emptyAt = time;
      const shut = Math.min(1, Math.max(0, (time - entry.emptyAt) / doorTuning.seconds));
      door.visible = shut > 0;
      if (door.visible) {
        door.position.fromArray(view(0, doorTuning.height - .566, doorTuning.z));
        door.scale.set(doorTuning.width * laneScale, doorTuning.height * laneScale * bounce(shut), doorTuning.depth * laneScale);
      }
      // The incoming ammo label crosses the reserve counter while loading.
      reserve.hidden=lane.queue.length<=1||shut>0||lane.advancing>0;
      reserve.textContent=String(Math.max(0,lane.queue.length-1));
      reserve.setAttribute('aria-label',`${Math.max(0,lane.queue.length-1)} reserve cannons`);
      const t = lane.advancing > 0 ? smooth(1 - lane.advancing / cannonTuning.advanceSeconds) : 1;
      // A shutting door sits over the reserve slot, so the reserve cannon shrinks away under it.
      meshes.forEach((mesh, index) => {
        const cannon = lane.queue[index]; mesh.visible = !!cannon && !(index === 1 && shut >= 1);
        if (!cannon) return;
        mesh.material = materials[cannon.color];
        const k = index === 0 ? kick(cannon.recoil) : 0, size = 1.2 * laneScale * (index === 1 ? t * (1 - shut) : 1);
        mesh.position.fromArray(view(0,.428,2.2*(1-index)-2.2*(1-t)-fireTuning.kick*k));
        mesh.scale.set(size * (1 + fireTuning.bulge * k), size * (1 - fireTuning.squash * k), size * (1 + fireTuning.bulge * k));
      });
      const cannon = lane.queue[0];
      label.hidden = !cannon;
      if (cannon) {
        const text = String(cannon.ammo); if (label.textContent !== text) label.textContent = text;
        label.setAttribute('aria-label', `${cannon.color==='white'?'red':cannon.color} cannon: ${cannon.ammo} shots remaining`);
      }
    }
    const shots = core.shots.slice(0, capacity);
    projectiles.count = shots.length; flashes.count = shards.count = sparks.count = 0;
    pose.rotation.set(0, 0, 0);
    shots.forEach((shot, i) => {
      const t = Math.min(1, shot.age / cannonTuning.shotSeconds), origin = lanes[core.lanes.indexOf(shot.lane)].view(0, .428 + .75, muzzle);
      pose.position.fromArray(origin).lerp(top.fromArray(shot.destination), t);
      pose.scale.setScalar(fireTuning.projectile); pose.updateMatrix(); projectiles.setMatrixAt(i, pose.matrix);
      // Muzzle flash.
      pose.position.fromArray(origin); pose.scale.setScalar(1.6 * laneScale * (1 - t)); pose.updateMatrix(); flashes.setMatrixAt(flashes.count++, pose.matrix);
    });
    for (const burst of bursts) {
      const t = time - burst.born, [x, y, z] = burst.position, base = burst.n * 2.39996;
      if (t < cannonTuning.impactSeconds) {
        pose.rotation.set(0, 0, 0); pose.position.set(x, y + .6, z); pose.scale.setScalar(burstTuning.flash * (1 - t / cannonTuning.impactSeconds));
        pose.updateMatrix(); flashes.setMatrixAt(flashes.count++, pose.matrix);
      }
      const fade = burst.size * (1 - (t / burstTuning.shardLife) ** 2);
      color.set(materials[burst.color]?.color ?? 0xffffff);
      for (let i = 0; i < burstTuning.shards; i++) {
        const angle = base + i * Math.PI * 2 / burstTuning.shards + hash(burst.n, i) - .5, speed = burstTuning.shardSpeed * burst.size * (.6 + .4 * hash(burst.n, i + 9));
        pose.position.set(x + Math.sin(angle) * speed * t, y + .6 + burstTuning.shardLift * t - burstTuning.gravity * t * t / 2, z + Math.cos(angle) * speed * t);
        pose.rotation.set(t * 9 * hash(burst.n, i + 3), t * 11, t * 7); pose.scale.setScalar(burstTuning.shardSize * fade); pose.updateMatrix();
        shards.setMatrixAt(shards.count, pose.matrix); shards.setColorAt(shards.count++, color);
      }
      if (t < burstTuning.sparkLife) for (let i = 0; i < burstTuning.sparks; i++) {
        const angle = base + (i + .5) * Math.PI * 2 / burstTuning.sparks, reach = .4 + burstTuning.sparkSpeed * t;
        pose.position.set(x + Math.sin(angle) * reach, y + .9, z + Math.cos(angle) * reach); pose.rotation.set(0, angle, 0);
        pose.scale.set(burstTuning.sparkWidth, burstTuning.sparkWidth, burstTuning.sparkLength * (1 - t / burstTuning.sparkLife)); pose.updateMatrix();
        sparks.setMatrixAt(sparks.count++, pose.matrix);
      }
    }
    for (const mesh of effects) { mesh.visible = mesh.count > 0; mesh.instanceMatrix.needsUpdate = true; }
    if (shards.instanceColor) shards.instanceColor.needsUpdate = true;
  }
  function layout(camera: Camera, width: number, height: number) {
    const project=(position:number[])=>{point.fromArray(position).project(camera);return {x:(point.x+1)*width/2,y:(1-point.y)*height/2};};
    const size=.008*laneScale;
    for (const { lane, view, meshes, label, reserve } of lanes) {
      const p=meshes[0].position;
      label.style.transform=planeTransform(project,[p.x+Math.sin(lane.yaw??0)*.072*laneScale,p.y+1.863*laneScale,p.z+Math.cos(lane.yaw??0)*.072*laneScale],[size,0,0],[0,0,size]);
      reserve.style.transform=planeTransform(project,view(0,2.778,-.653),[size,0,0],[0,0,size]);
    }
  }
  sync();
  return { sync, layout, dispose: () => { lanes.forEach(l => { l.label.remove();l.reserve.remove(); }); sphere.dispose(); cube.dispose(); doorBox.dispose(); shardMaterial.dispose(); sparkMaterial.dispose(); effects.forEach(m => m.dispose()); } };
}
