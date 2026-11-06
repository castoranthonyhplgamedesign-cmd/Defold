import type { Segment } from './simulation.ts';
import type { Vec } from './path.ts';

export interface CannonData { color: string; ammo: number }
export interface LaneData { position: Vec; yaw?: number; detectorDistance?: number; queue: CannonData[] }
export interface CannonState extends CannonData { reserved: number; recoil: number }
export interface LaneState { position: Vec; yaw?: number; detectorDistance?: number; queue: CannonState[]; advancing: number; contacts: Set<Segment> }
export interface Shot { lane: LaneState; cannon: CannonState; target: Segment; age: number; origin: Vec; destination: Vec }
export interface Impact { position: Vec; color: string; age: number }
// shotSeconds: projectile flight; quicker than the reference .1 s so shooting reads snappier.
export const cannonTuning = { shotSeconds: .06, advanceSeconds: .3, impactSeconds: .15 };
export function lanePoint(lane:Pick<LaneData,'position'|'yaw'>,x:number,y:number,z:number) {
  const angle=lane.yaw??0,c=Math.cos(angle),s=Math.sin(angle);
  return [lane.position[0]+x*c+z*s,lane.position[1]+y,lane.position[2]-x*s+z*c];
}
function localPoint(point:Vec,center:Vec,yaw=0) {
  const x=point[0]-center[0],z=point[2]-center[2],c=Math.cos(yaw),s=Math.sin(yaw);
  return [x*c-z*s,point[1]-center[1],x*s+z*c];
}

// Segment center against detector expanded by the source block half extents (Minkowski sum).
function intersects(start: Vec, end: Vec, center: Vec, half: Vec) {
  let enter = 0, exit = 1;
  for (let i = 0; i < 3; i++) {
    const p = start[i] + (i === 1 ? .6 : 0) - center[i], delta = end[i] - start[i];
    if (Math.abs(delta) < 1e-10) { if (Math.abs(p) > half[i]) return false; }
    else {
      const a = (-half[i] - p) / delta, b = (half[i] - p) / delta;
      enter = Math.max(enter, Math.min(a, b)); exit = Math.min(exit, Math.max(a, b));
      if (enter > exit) return false;
    }
  }
  return true;
}

export class Cannons {
  onHit = () => {};
  onAdvance = () => {};
  lanes: LaneState[];
  shots: Shot[] = [];
  impacts: Impact[] = [];
  private reserved = new Map<Segment, Shot>();
  stopped = false;
  constructor(data: LaneData[]) {
    this.lanes = data.map(lane => {
      if (lane.position.length !== 3 || !lane.position.every(Number.isFinite) || (lane.yaw!==undefined&&!Number.isFinite(lane.yaw)) || (lane.detectorDistance!==undefined&&(!Number.isFinite(lane.detectorDistance)||lane.detectorDistance<=0)) || lane.queue.some(c => !c.color || !Number.isInteger(c.ammo) || c.ammo < 1)) throw new Error('Invalid cannon queue');
      return { position: [...lane.position], yaw:lane.yaw, detectorDistance:lane.detectorDistance, queue: lane.queue.map(c => ({ ...c, reserved: 0, recoil: 1 })), advancing: 0, contacts: new Set() };
    });
  }
  get active() { return !this.stopped && (this.shots.length > 0 || this.impacts.length > 0 || this.lanes.some(l => l.advancing > 0 || l.queue.some(c => c.recoil < .15))); }
  detector(lane: LaneState) { return lanePoint(lane,0,.428+.515,lane.detectorDistance??(2.2+3.113)); }
  scale(segment: Segment) { const shot = this.reserved.get(segment); return shot ? Math.max(0, 1 - shot.age / cannonTuning.shotSeconds) : 1; }
  private advanceQueue(lane: LaneState) {
    lane.queue.shift(); lane.contacts.clear();
    lane.advancing = lane.queue.length ? cannonTuning.advanceSeconds : 0;
    this.onAdvance();
  }
  update(dt: number, onPath: Segment[], allSegments: Segment[], remove: (segment: Segment) => void) {
    if (this.stopped) return;
    for (const impact of this.impacts) impact.age += dt;
    this.impacts = this.impacts.filter(i => i.age < cannonTuning.impactSeconds);
    for (const lane of this.lanes) {
      lane.advancing = Math.max(0, lane.advancing - dt);
      for (const cannon of lane.queue) cannon.recoil += dt;
    }
    // Complete reservations before considering new contacts, and cancel externally removed targets.
    for (const shot of [...this.shots]) {
      shot.age += dt;
      if (!shot.target.removed && shot.age + 1e-9 < cannonTuning.shotSeconds) continue;
      this.reserved.delete(shot.target); shot.cannon.reserved--;
      if (!shot.target.removed) {
        this.impacts.push({ position: [...shot.target.position], color: shot.target.color, age: 0 });
        remove(shot.target); shot.cannon.ammo--;
        this.onHit();
      }
      this.shots.splice(this.shots.indexOf(shot), 1);
      if (shot.cannon.ammo === 0 && shot.lane.queue[0] === shot.cannon) this.advanceQueue(shot.lane);
    }
    const remainingColors = new Set(allSegments.filter(s => !s.removed).map(s => s.color));
    for (const lane of this.lanes) {
      const cannon = lane.queue[0];
      if (!cannon || lane.advancing > 1e-9) continue;
      if (!remainingColors.has(cannon.color) && cannon.reserved === 0) { this.advanceQueue(lane); continue; }
      const center = this.detector(lane), half = [1.489 / 2 + .5, 2.585 / 2 + .75, 1];
      const contacts = new Set<Segment>();
      for (const segment of onPath) {
        if (segment.removed) continue;
        const end=localPoint(segment.position,center,lane.yaw);
        const inside = intersects(end,end,[0,0,0],half);
        if (inside) contacts.add(segment);
        if (lane.contacts.has(segment) || segment.inTransit || segment.color !== cannon.color || this.reserved.has(segment) || cannon.ammo <= cannon.reserved) continue;
        if (!intersects(localPoint(segment.previousPosition??segment.position,center,lane.yaw),end,[0,0,0],half)) continue;
        const shot: Shot = { lane, cannon, target: segment, age: 0, origin: lanePoint(lane,0,.428+.75,2.2+.75), destination: center };
        cannon.reserved++; cannon.recoil = 0; this.reserved.set(segment, shot); this.shots.push(shot);
      }
      lane.contacts = contacts;
    }
  }
  stop() {
    this.stopped = true; this.shots = []; this.impacts = []; this.reserved.clear();
    for (const lane of this.lanes) { lane.contacts.clear(); for (const c of lane.queue) c.reserved = 0; }
  }
}
