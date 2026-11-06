import { Box3, BufferGeometry, InstancedMesh, MeshStandardMaterial, Object3D, Raycaster, Scene, Vector2, Vector3, Camera } from 'three';
import type { Simulation } from '../core/simulation';
import {arrowStyle} from './arrowStyle.ts';

export function createBoard(scene: Scene, simulation: Simulation, geometries: Record<string, BufferGeometry[]>, materials: Record<string, MeshStandardMaterial>, boardY=0) {
  const meshes = new Map<string, InstancedMesh>();
  const insetMaterials:MeshStandardMaterial[]=[];
  const segments=[...simulation.arrows.flatMap(a=>a.segments),...simulation.preloaded];
  const colors = new Set(segments.map(s=>s.color));
  for (const color of colors) {
    const capacity = segments.filter(s=>s.color===color).length;
    const inner=new MeshStandardMaterial({color:materials[color].color.clone().multiplyScalar(.55),roughness:.75,metalness:0,envMapIntensity:.12});
    inner.name=`arrow-inset:${color}`;insetMaterials.push(inner);
    for (const name of ['body', 'corner', 'head', 'inner', 'highlight']) {
      const mesh = new InstancedMesh(geometries[name === 'highlight' ? 'inner' : name][0], name==='inner'?inner:materials[name === 'highlight' ? 'white' : color], capacity);
      mesh.count = 0; mesh.frustumCulled = false; meshes.set(`${name}:${color}`, mesh); scene.add(mesh);
    }
  }
  const blockedMaterials = new Map<number, MeshStandardMaterial>();
  for (const arrow of simulation.arrows) {
    const material=materials.blocked.clone(); material.name='blocked-overlay';
    blockedMaterials.set(arrow.data.id,material);
    for (const name of ['head', 'body']) {
      const mesh = new InstancedMesh(geometries[name][0], material, arrow.segments.length);
      mesh.count = 0; mesh.frustumCulled = false; meshes.set(`${name}:blocked:${arrow.data.id}`, mesh); scene.add(mesh);
    }
  }
  const pose = new Object3D(), inset = new Vector3(), up = new Vector3(0, 1, 0);
  let cellScale=1,lift=0;
  function add(name: string, color: string, position: number[], yaw: number, scale = [1, 1, 1]) {
    const mesh = meshes.get(`${name}:${color}`)!;
    pose.position.fromArray(position);pose.position.y+=lift; pose.rotation.set(0, yaw, 0); pose.scale.fromArray(scale).multiplyScalar(cellScale);
    if(boardY&&(name==='head'||name==='inner'||name==='highlight'))pose.scale.x*=arrowStyle.headWidth;pose.updateMatrix();
    mesh.setMatrixAt(mesh.count++, pose.matrix);
  }
  function sync(valid?: Set<number>) {
    meshes.forEach(mesh => { mesh.count = 0; });
    for (const a of simulation.arrows) blockedMaterials.get(a.data.id)!.opacity=a.feedback?.flash??0;
    for (const a of simulation.arrows) for (const s of a.segments) {
      if (s.removed) continue;
      cellScale=a.data.cellSize??1;
      // Overload: keep the approach at board height, then climb smoothly as the reserved vacancy opens.
      const onBelt=s.progress!==null&&(simulation.capacity===null||!simulation.isTransferring(s));
      const handoff=simulation.capacity===null?1:simulation.transferProgress(s);
      const rise=!a.moving?0:simulation.capacity===null?Math.min(1,a.elapsed/a.duration):onBelt?1:simulation.isTransferring(s)?handoff**3:0;
      lift=onBelt?0:boardY*cellScale*(1-rise*rise*(3-2*rise));
      if(simulation.capacity!==null){
        const t=s.progress!==null?1:rise;
        cellScale*=1+(simulation.beltScale-1)*t*t*(3-2*t);
      }
      const position = a.feedback ? a.feedback.position(s.index) : s.position;
      if (s.index === 0 && !onBelt) {
        add('head', s.color, position, s.yaw);
        if (a.feedback?.flash) add('head', `blocked:${a.data.id}`, position, s.yaw);
        if (!a.moving && valid?.has(a.data.id)) {
          inset.set(0,-.051,.074).multiplyScalar(cellScale).applyAxisAngle(up,s.yaw);
          add('highlight',s.color,position.map((v,i)=>v+inset.getComponent(i)),s.yaw+Math.PI,[1.041,1,.999]);
        }
        inset.set(0, -.029, .016).multiplyScalar(cellScale).applyAxisAngle(up, s.yaw);
        add('inner', s.color, position.map((v, i) => v + inset.getComponent(i)), s.yaw + Math.PI, [.726, 1, .732]);
      } else if (a.moving || a.feedback) {
        const yaw = a.feedback ? a.feedback.yaw(s.index) : s.yaw;
        const scale = simulation.cannons.scale(s);
        add('body', s.color, position, yaw, [scale, scale, scale]);
        if (a.feedback?.flash) add('body', `blocked:${a.data.id}`, position, yaw, [scale, scale, scale]);
      }
      else {
        const cell = a.data.cells[s.index], prev = a.data.cells[s.index - 1], next = a.data.cells[s.index + 1];
        const dx = cell[0] - prev[0], dz = cell[2] - prev[2];
        const nx = next ? next[0] - cell[0] : dx, nz = next ? next[2] - cell[2] : dz;
        const corner = !!next && dx * nx + dz * nz < .99*cellScale*cellScale, positive = dz * nx - dx * nz > 0;
        const degrees = dx > 0 ? (positive ? 0 : 90) : dx < 0 ? (positive ? 180 : 270) : dz > 0 ? (positive ? 270 : 0) : (positive ? 90 : 180);
        add(corner ? 'corner' : 'body', s.color, position, corner ? degrees * Math.PI / 180 : Math.atan2(dx, dz));
      }
    }
    lift=0;
    for(const s of simulation.preloaded)if(!s.removed){
      cellScale=(s.size??1)*simulation.beltScale;
      const scale=simulation.cannons.scale(s);
      add('body',s.color,s.position,s.yaw,[scale,scale,scale]);
    }
    meshes.forEach(mesh => { mesh.visible = mesh.count > 0; mesh.instanceMatrix.needsUpdate = true; });
  }
  const raycaster = new Raycaster(), point = new Vector3(), box = new Box3();
  function pick(x: number, y: number, camera: Camera, rect: DOMRect) {
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
    raycaster.setFromCamera(new Vector2((x - rect.left) / rect.width * 2 - 1, 1 - (y - rect.top) / rect.height * 2), camera);
    let nearest = Infinity, id: number | null = null;
    for (const a of simulation.arrows) if (!a.moving) for (const s of a.segments) {
      const [sx, originalY, sz] = s.position;
      const size=a.data.cellSize??1;
      const sy=originalY+boardY*size;
      box.min.set(sx - .5*size, sy - .15*size, sz - .5*size); box.max.set(sx + .5*size, sy + 1.35*size, sz + .5*size);
      if (raycaster.ray.intersectBox(box, point)) {
        const d = point.distanceTo(raycaster.ray.origin);
        if (d < nearest) { nearest = d; id = a.data.id; }
      }
    }
    return id;
  }
  sync();
  return { sync, pick, dispose:()=>{blockedMaterials.forEach(material=>material.dispose());insetMaterials.forEach(material=>material.dispose());} };
}
