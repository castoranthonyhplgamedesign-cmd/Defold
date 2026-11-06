import type { Segment, Simulation } from './simulation.ts';

// Long Arrow's transfer time, with Rescue's path-following displacement.
export const beltPushSeconds = .12;
interface Push { offset: number; elapsed: number }

export class BeltPush {
  private pushes = new Map<Segment, Push>();
  private simulation: Simulation;
  constructor(simulation: Simulation) { this.simulation = simulation; }
  private gap(from: number, to: number) {
    const total = this.simulation.blockUnits;
    const gap = ((to - from) % total + total) % total;
    return gap < 1e-8 || total - gap < 1e-8 ? 0 : gap;
  }
  private offset(segment: Segment) {
    const push = this.pushes.get(segment);
    return push ? push.offset * Math.max(0, 1 - push.elapsed / beltPushSeconds) : 0;
  }
  progress(segment: Segment) {
    return this.simulation.fromUnits(this.simulation.toUnits(segment.progress!) + this.offset(segment));
  }
  private makeRoom(entry: number, clearance: number, immediate: boolean, arrowId?: number) {
    const sim = this.simulation, total = sim.blockUnits;
    const target = sim.toUnits(entry);
    const ordered = sim.onPath.map(s => {
      const progress = s.progress!;
      let behind = this.gap(sim.toUnits(progress), target);
      if (behind > total - clearance + 1e-8) behind -= total;
      return { segment: s, behind };
    })
      .sort((a, b) => a.behind - b.behind);
    const changes: { segment: Segment; shift: number }[] = [];
    let needed = clearance;
    for (const item of ordered) {
      if (item.behind >= needed - 1e-8) break;
      if (item.segment.arrowId === arrowId) return false;
      if (needed > total - clearance + 1e-8) return false;
      changes.push({ segment: item.segment, shift: needed - item.behind });
      needed++;
    }
    // Reserve atomically before the next arrow is processed; keep Segment identity for cannon reservations.
    for (const { segment: s, shift } of changes) {
      if (immediate) {
        s.progress = sim.fromUnits(sim.toUnits(s.progress!) - shift);
        this.pushes.delete(s);
        s.position = sim.path.position(s.progress); s.yaw = sim.path.yaw(s.progress);
      } else {
        this.pushes.set(s, { offset: this.offset(s) + shift, elapsed: 0 });
        s.progress = sim.fromUnits(sim.toUnits(s.progress!) - shift);
      }
    }
    return true;
  }
  yieldTo(segment: Segment, leader?: Segment) {
    const sim = this.simulation, entry = leader?.progress !== null && leader?.progress !== undefined
      ? sim.fromUnits(sim.toUnits(leader.progress) - 1) : sim.path.closest(segment.position), center = sim.path.position(entry);
    const radius = (segment.size ?? 1) * sim.beltScale;
    const off = Math.hypot(segment.position[0] - center[0], segment.position[2] - center[2]);
    // Grow the vacancy as the unchanged approach reaches it; only belt occupants are displaced.
    if (off < radius) this.makeRoom(entry, Math.sqrt(1 - (off / radius) ** 2), true, segment.arrowId);
  }
  insert(segment: Segment, entry: number) {
    const sim = this.simulation;
    const p = sim.path.position(entry), atEntry = Math.hypot(segment.position[0]-p[0],segment.position[2]-p[2]) < .1;
    if (sim.onPath.length >= Math.floor(sim.blockUnits + 1e-9) || !this.makeRoom(entry, 1, atEntry)) return false;
    const target = sim.toUnits(entry);
    segment.progress = sim.fromUnits(target);
    segment.inTransit = false;
    sim.onPath.push(segment);
    segment.position = sim.path.position(segment.progress); segment.yaw = sim.path.yaw(segment.progress);
    return true;
  }
  remove(segment: Segment) { this.pushes.delete(segment); }
  update(dt: number) {
    const sim = this.simulation;
    for (const s of sim.onPath) {
      s.previousPosition = s.position;
      const push = this.pushes.get(s);
      if (push && (push.elapsed += dt) >= beltPushSeconds) this.pushes.delete(s);
      const progress = this.progress(s);
      s.position = sim.path.position(progress); s.yaw = sim.path.yaw(progress);
    }
  }
}
