import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { ConveyorPath } from './conveyorPath';
import { HitEffects, type HitEffectsOptions } from './hitEffects';

export type BlockColor = string;
export type TurretUnit = {
  color: BlockColor;
  meshes: Mesh[];
  bodyPosition: Vector3;
  muzzlePosition: Vector3;
};
export type TurretLane = { units: TurretUnit[]; targetPosition: Vector3 };
export type ConveyorMarker = { mesh: Mesh; distance: number };
export type ConveyorOptions = {
  slotSpeed: number;
  markerSpeed: number;
  bulletSpeed: number;
  shotsPerTurret: number;
  turretAdvanceSeconds: number;
  counterOffset: Vector3;
  bulletHitHeight: number;
  bulletScale: number;
  blockColor: BlockColor;
  startEmpty: boolean;
  transferSeconds: number;
  effects: HitEffectsOptions;
};

type BeltBlock = {
  mesh: Mesh;
  color: BlockColor;
  distance: number;
  targeted: boolean;
  occupied: boolean;
  transferFrom: Vector3;
  transferProgress: number;
};
type Bullet = {
  mesh: Mesh;
  target: BeltBlock | null;
  active: boolean;
  direction: Vector3;
  remainingDistance: number;
};
type TurretState = TurretUnit & {
  counter: Mesh;
  countTexture: DynamicTexture;
  shotsRemaining: number;
  startBody: Vector3;
  startMuzzle: Vector3;
  startMeshes: Vector3[];
};
type FiringLane = {
  front: TurretState | null;
  waiting: TurretState[];
  moving: TurretState | null;
  fireAtDistance: number;
  frontPosition: Vector3;
  advanceOffset: Vector3;
  advance: number;
};

export class ConveyorSystem {
  private readonly lanes: FiringLane[];
  private readonly markers: ConveyorMarker[];
  private readonly blocks: BeltBlock[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly blockTemplate: Mesh;
  private readonly bulletTemplate: Mesh;
  private readonly blockMaterials: Map<BlockColor, StandardMaterial>;
  private readonly tempPosition = Vector3.Zero();
  private readonly tempRotation = Quaternion.Identity();
  private readonly tempBaseRotation = Quaternion.Identity();
  private readonly tempTangent = Vector3.Zero();
  private readonly tempHitPosition = Vector3.Zero();
  private readonly sourceRotation: Quaternion;
  private readonly entryDistances: { x: number; z: number; distance: number }[] = [];
  private readonly slotSpacing: number;
  private readonly hitEffects: HitEffects;

  constructor(
    private readonly path: ConveyorPath,
    slotCount: number,
    firstSlotPosition: Vector3,
    lanes: TurretLane[],
    markers: ConveyorMarker[],
    blockTemplate: Mesh,
    bulletTemplate: Mesh,
    blockMaterials: Map<BlockColor, StandardMaterial>,
    private readonly blockScale: Vector3,
    private readonly options: ConveyorOptions,
  ) {
    if (slotCount < 1) throw new Error('Conveyor needs at least one slot');
    this.markers = markers;
    this.slotSpacing = path.length / slotCount;
    this.blockTemplate = blockTemplate;
    this.bulletTemplate = bulletTemplate;
    this.blockMaterials = blockMaterials;
    this.hitEffects = new HitEffects(blockTemplate.getScene(), options.effects);
    this.sourceRotation = blockTemplate.rotationQuaternion?.clone() ?? Quaternion.Identity();

    this.lanes = lanes.map((lane) => {
      const units = lane.units.map((unit) => this.createTurret(unit));
      const front = units.shift() ?? null;
      return { front, waiting: units, moving: null,
        fireAtDistance: path.nearestDistance(lane.targetPosition),
        frontPosition: front?.bodyPosition.clone() ?? Vector3.Zero(),
        advanceOffset: Vector3.Zero(), advance: 0 };
    });
    const startDistance = path.nearestDistance(firstSlotPosition);
    for (let i = 0; i < markers.length; i++) {
      markers[i].distance = (startDistance + i * path.length / markers.length) % path.length;
    }
    for (let i = 0; i < slotCount; i++) {
      const distance = (startDistance + i * path.length / slotCount) % path.length;
      const mesh = this.blockTemplate.clone('Conveyor slot ' + i, null, false)!;
      mesh.parent = null;
      mesh.material = this.blockMaterials.get(options.blockColor) ?? this.blockTemplate.material;
      mesh.scaling.copyFrom(this.blockTemplate.scaling).multiplyInPlace(this.blockScale);
      mesh.rotationQuaternion = Quaternion.Identity();
      this.sample(distance, this.tempPosition, this.tempRotation);
      mesh.position.copyFrom(this.tempPosition);
      mesh.rotationQuaternion.copyFrom(this.tempRotation);
      mesh.isPickable = false;
      mesh.setEnabled(!options.startEmpty);
      this.blocks.push({ mesh, color: options.blockColor, distance, targeted: false,
        occupied: !options.startEmpty, transferFrom: Vector3.Zero(), transferProgress: 1 });
    }
  }

  private closestSlotIndexAt(position: Vector3): number {
    let entry: number | undefined;
    for (let i = 0; i < this.entryDistances.length; i++) {
      const cached = this.entryDistances[i];
      if (Math.abs(cached.x - position.x) < 0.001 && Math.abs(cached.z - position.z) < 0.001) {
        entry = cached.distance;
        break;
      }
    }
    if (entry === undefined) {
      entry = this.path.nearestDistance(position);
      this.entryDistances.push({ x: position.x, z: position.z, distance: entry });
    }
    let nearest = -1;
    let nearestGap = this.slotSpacing * 0.5 + 0.03;
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const difference = Math.abs(block.distance - entry);
      const gap = Math.min(difference, this.path.length - difference);
      if (gap < nearestGap) { nearest = i; nearestGap = gap; }
    }
    return nearest;
  }

  private pushOccupant(source: BeltBlock, destination: BeltBlock) {
    destination.color = source.color;
    destination.mesh.material = source.mesh.material;
    destination.occupied = true;
    destination.targeted = source.targeted;
    destination.transferFrom.copyFrom(source.mesh.position);
    destination.transferProgress = 0;
    destination.mesh.position.copyFrom(source.mesh.position);
    destination.mesh.setEnabled(true);
    for (let i = 0; i < this.bullets.length; i++) {
      if (this.bullets[i].target === source) this.bullets[i].target = destination;
    }
    source.occupied = false;
    source.targeted = false;
    source.transferProgress = 1;
    source.mesh.setEnabled(false);
  }

  insertAt(position: Vector3, color = this.options.blockColor): boolean {
    const targetIndex = this.closestSlotIndexAt(position);
    if (targetIndex < 0) return false;
    const material = this.blockMaterials.get(color);
    if (!material) throw new Error(`Missing conveyor block material for ${color}`);
    let freeIndex = targetIndex;
    for (let i = 0; i < this.blocks.length && this.blocks[freeIndex].occupied; i++) {
      freeIndex = (freeIndex - 1 + this.blocks.length) % this.blocks.length;
    }
    if (this.blocks[freeIndex].occupied) return false;
    for (let index = freeIndex; index !== targetIndex; index = (index + 1) % this.blocks.length) {
      const sourceIndex = (index + 1) % this.blocks.length;
      this.pushOccupant(this.blocks[sourceIndex], this.blocks[index]);
    }
    const slot = this.blocks[targetIndex];
    slot.color = color;
    slot.mesh.material = material;
    slot.occupied = true;
    slot.targeted = false;
    slot.transferFrom.copyFrom(position);
    slot.transferFrom.y = slot.mesh.position.y;
    slot.transferProgress = 0;
    slot.mesh.position.copyFrom(slot.transferFrom);
    slot.mesh.setEnabled(true);
    return true;
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].occupied) return false;
    }
    return true;
  }

  isFull(): boolean {
    for (let i = 0; i < this.blocks.length; i++) {
      if (!this.blocks[i].occupied) return false;
    }
    return true;
  }

  canClearOccupiedBlock(): boolean {
    for (let i = 0; i < this.bullets.length; i++) {
      if (this.bullets[i].active && this.bullets[i].target?.occupied) return true;
    }
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      if (!block.occupied) continue;
      for (let j = 0; j < this.lanes.length; j++) {
        const lane = this.lanes[j];
        if ((lane.front?.color === block.color && lane.front.shotsRemaining > 0)
          || (lane.moving?.color === block.color && lane.moving.shotsRemaining > 0)) return true;
      }
    }
    return false;
  }

  private sample(distance: number, position: Vector3, rotation: Quaternion, marker = false) {
    this.path.sample(distance, position, this.tempTangent);
    const yaw = Math.atan2(this.tempTangent.x, -this.tempTangent.z);
    if (marker) {
      Quaternion.RotationYawPitchRollToRef(-yaw - Math.PI, Math.PI / 2, 0, rotation);
    } else {
      Quaternion.RotationYawPitchRollToRef(-yaw - Math.PI / 2, 0, 0, this.tempBaseRotation);
      this.tempBaseRotation.multiplyToRef(this.sourceRotation, rotation);
    }
  }

  private createTurret(unit: TurretUnit): TurretState {
    const scene = unit.meshes[0].getScene();
    const countTexture = new DynamicTexture('Turret shot count', { width: 256, height: 256 }, scene, false);
    countTexture.hasAlpha = true;
    const material = new StandardMaterial('White turret shot count', scene);
    material.diffuseTexture = countTexture;
    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.emissiveColor.set(1, 1, 1);
    material.backFaceCulling = false;
    const counter = MeshBuilder.CreatePlane('Turret shot count', { width: 1.4, height: 1.1 }, scene);
    counter.position.copyFrom(unit.bodyPosition);
    counter.position.addInPlace(this.options.counterOffset);
    counter.rotation.x = -Math.PI / 2;
    counter.material = material;
    counter.isPickable = false;
    const turret: TurretState = {
      ...unit,
      counter,
      countTexture,
      shotsRemaining: this.options.shotsPerTurret,
      startBody: unit.bodyPosition.clone(),
      startMuzzle: unit.muzzlePosition.clone(),
      startMeshes: unit.meshes.map((mesh) => mesh.position.clone()),
    };
    this.drawCount(turret);
    return turret;
  }

  private drawCount(turret: TurretState) {
    const context = turret.countTexture.getContext() as CanvasRenderingContext2D;
    context.clearRect(0, 0, 256, 256);
    context.fillStyle = '#ffffff';
    context.font = 'bold 172px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(String(turret.shotsRemaining), 128, 135);
    turret.countTexture.update();
  }

  private advanceTurrets(dt: number) {
    for (let i = 0; i < this.lanes.length; i++) {
      const lane = this.lanes[i];
      const turret = lane.moving;
      if (!turret) continue;
      lane.advance = Math.min(1, lane.advance + dt / this.options.turretAdvanceSeconds);
      const eased = 1 - (1 - lane.advance) ** 3;
      const offset = lane.advanceOffset.scale(eased);
      for (let j = 0; j < turret.meshes.length; j++) {
        turret.meshes[j].position.copyFrom(turret.startMeshes[j]).addInPlace(offset);
      }
      turret.bodyPosition.copyFrom(turret.startBody).addInPlace(offset);
      turret.muzzlePosition.copyFrom(turret.startMuzzle).addInPlace(offset);
      turret.counter.position.copyFrom(turret.bodyPosition).addInPlace(this.options.counterOffset);
      if (lane.advance === 1) {
        lane.front = turret;
        lane.moving = null;
      }
    }
  }

  private fire(origin: Vector3, target: BeltBlock) {
    let bullet: Bullet | undefined;
    for (let i = 0; i < this.bullets.length; i++) {
      const item = this.bullets[i];
      if (!item.active) { bullet = item; break; }
    }
    if (!bullet) {
      const mesh = this.bulletTemplate.clone('Turret bullet', null, false)!;
      mesh.parent = null;
      mesh.scaling.copyFrom(this.bulletTemplate.scaling).scaleInPlace(this.options.bulletScale);
      mesh.isPickable = false;
      bullet = { mesh, target: null, active: false,
        direction: Vector3.Zero(), remainingDistance: 0 };
      this.bullets.push(bullet);
    }
    bullet.target = target;
    bullet.active = true;
    bullet.mesh.position.copyFrom(origin);
    // Lock the aim when fired. The projectile never steers toward the moving block.
    bullet.direction.copyFrom(target.mesh.position);
    bullet.direction.y += this.options.bulletHitHeight;
    bullet.direction.subtractInPlace(origin);
    bullet.remainingDistance = bullet.direction.length();
    bullet.direction.normalize();
    bullet.mesh.setEnabled(true);
    target.targeted = true;
  }

  update(deltaSeconds: number) {
    const dt = Math.min(deltaSeconds, 0.05);
    this.advanceTurrets(dt);
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const previous = block.distance;
      block.distance = (block.distance + this.options.slotSpeed * dt) % this.path.length;
      this.sample(block.distance, this.tempPosition, this.tempRotation);
      if (block.transferProgress < 1) {
        block.transferProgress = Math.min(1, block.transferProgress + dt / this.options.transferSeconds);
        Vector3.LerpToRef(block.transferFrom, this.tempPosition, block.transferProgress, block.mesh.position);
      } else {
        block.mesh.position.copyFrom(this.tempPosition);
      }
      block.mesh.rotationQuaternion!.copyFrom(this.tempRotation);
      if (!block.occupied || block.targeted) continue;
      for (let j = 0; j < this.lanes.length; j++) {
        const lane = this.lanes[j];
        const turret = lane.front;
        if (!turret) continue;
        if (turret.color !== block.color) continue;
        const distanceToFire = (lane.fireAtDistance - previous + this.path.length) % this.path.length;
        if (distanceToFire <= this.options.slotSpeed * dt) {
          this.fire(turret.muzzlePosition, block);
          turret.shotsRemaining--;
          this.drawCount(turret);
          if (turret.shotsRemaining === 0) {
            for (let k = 0; k < turret.meshes.length; k++) turret.meshes[k].setEnabled(false);
            turret.counter.setEnabled(false);
            lane.front = null;
            if (lane.waiting.length) {
              lane.moving = lane.waiting.shift()!;
              lane.advanceOffset.copyFrom(lane.frontPosition).subtractInPlace(lane.moving.bodyPosition);
              lane.advance = 0;
            }
          }
          break;
        }
      }
    }

    for (let i = 0; i < this.markers.length; i++) {
      const marker = this.markers[i];
      marker.distance = (marker.distance + this.options.markerSpeed * dt) % this.path.length;
      this.sample(marker.distance, this.tempPosition, this.tempRotation, true);
      marker.mesh.position.copyFrom(this.tempPosition);
      marker.mesh.position.y += 0.03;
      marker.mesh.rotationQuaternion!.copyFrom(this.tempRotation);
    }

    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      if (!bullet.active || !bullet.target) continue;
      const target = bullet.target;
      if (!target.occupied) {
        bullet.active = false;
        bullet.mesh.setEnabled(false);
        bullet.target = null;
        continue;
      }
      const travel = this.options.bulletSpeed * dt;
      if (bullet.remainingDistance <= travel) {
        this.tempHitPosition.copyFrom(target.mesh.position);
        this.tempHitPosition.y += this.options.bulletHitHeight * 0.7;
        this.hitEffects.burst(this.tempHitPosition, target.color);
        target.occupied = false;
        target.targeted = false;
        target.mesh.setEnabled(false);
        bullet.active = false;
        bullet.mesh.setEnabled(false);
        bullet.target = null;
      } else {
        bullet.mesh.position.addInPlaceFromFloats(
          bullet.direction.x * travel,
          bullet.direction.y * travel,
          bullet.direction.z * travel,
        );
        bullet.remainingDistance -= travel;
      }
    }
  }

  updateEffects(deltaSeconds: number) {
    this.hitEffects.update(deltaSeconds);
  }
}
