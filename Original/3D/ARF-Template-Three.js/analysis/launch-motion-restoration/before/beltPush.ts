import type { Vec } from './path.ts';
import type { Segment, Simulation } from './simulation.ts';

// Long Arrow's transfer time, with Rescue's path-following displacement.
export const beltPushSeconds = .12;
// The near-full overload train needs its vacancy open before the arriving block finishes climbing.
export const beltTransferSeconds = .18;
interface Push { offset: number; elapsed: number }
interface Transfer { offset: Vec; entry: number; elapsed: number }

export class BeltPush {
  private pushes = new Map<Segment, Push>();
  private transfers = new Map<Segment, Transfer>();
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
  transferring(segment: Segment) { return this.transfers.has(segment); }
  transferProgress(segment: Segment) { return Math.min(1, (this.transfers.get(segment)?.elapsed ?? beltTransferSeconds) / beltTransferSeconds); }
  insert(segment: Segment, entry: number, start: Vec) {
    const sim = this.simulation, total = sim.blockUnits;
    if (sim.onPath.length >= Math.floor(total + 1e-9)) return false;
    const target = sim.toUnits(entry);
    const ordered = sim.onPath.map(s => {
      let behind = this.gap(sim.toUnits(s.progress!), target);
      if (behind > total - 1 + 1e-8) behind -= total;
      return { segment: s, behind };
    })
      .sort((a, b) => a.behind - b.behind);
    const changes: { segment: Segment; shift: number }[] = [];
    let needed = 1;
    for (const item of ordered) {
      if (item.behind >= needed - 1e-8) break;
      if (needed > total - 1 + 1e-8) return false;
      changes.push({ segment: item.segment, shift: needed - item.behind });
      needed++;
    }
    // Reserve atomically before the next arrow is processed; keep Segment identity for cannon reservations.
    for (const { segment: s, shift } of changes) {
      this.pushes.set(s, { offset: this.offset(s) + shift, elapsed: 0 });
      s.progress = sim.fromUnits(sim.toUnits(s.progress!) - shift);
    }
    segment.progress = sim.fromUnits(target);
    segment.beltPosition = sim.path.position(segment.progress);
    segment.previousBeltPosition = segment.beltPosition;
    segment.inTransit = false;
    sim.onPath.push(segment);
    const origin = sim.path.position(entry);
    this.transfers.set(segment, { offset: start.map((v,i)=>v-origin[i]), entry, elapsed: 0 });
    return true;
  }
  remove(segment: Segment) {
    // A shot head still leads its remaining body through the handoff; keep that short-lived pose alive.
    if (!this.transfers.has(segment)) this.pushes.delete(segment);
  }
  update(dt: number, turnRate: number) {
    const sim = this.simulation;
    const ghosts = [...this.transfers.keys()].filter(s => s.removed);
    for (const s of ghosts) s.progress = sim.fromUnits(sim.toUnits(s.progress!) + sim.conveyorSpeed * dt * sim.blockUnits / sim.path.length);
    for (const s of [...sim.onPath, ...ghosts]) {
      s.previousPosition = s.position;
      const push = this.pushes.get(s);
      if (push && (push.elapsed += dt) >= beltPushSeconds) this.pushes.delete(s);
      const progress = this.progress(s), transfer = this.transfers.get(s);
      s.previousBeltPosition = s.beltPosition ?? s.previousPosition;
      s.beltPosition = sim.path.position(progress);
      if (transfer) {
        transfer.elapsed += dt;
        const t = Math.min(1, transfer.elapsed / beltTransferSeconds);
        // Approach the moving vacancy from the board side, rather than chasing it through upstream blocks.
        // Keep the approach outside the train while the vacancy opens, without a stopped waiting phase.
        const remaining = 1 - t * t * t, center = s.beltPosition;
        const angle = sim.path.yaw(progress) - sim.path.yaw(transfer.entry), co = Math.cos(angle), si = Math.sin(angle);
        const x = transfer.offset[0] * remaining, z = transfer.offset[2] * remaining;
        s.position = [center[0] + x * co + z * si, center[1] + transfer.offset[1] * remaining, center[2] - x * si + z * co];
        const turn = ((sim.path.yaw(progress) - s.yaw) % (2*Math.PI) + 3*Math.PI) % (2*Math.PI) - Math.PI;
        s.yaw = s.index === 0 ? s.yaw + Math.max(-turnRate*dt, Math.min(turnRate*dt, turn)) : sim.path.yaw(progress);
        if (t === 1) { this.transfers.delete(s); if (s.removed) this.pushes.delete(s); s.inTransit = false; }
      } else {
        s.position = sim.path.position(progress); s.yaw = sim.path.yaw(progress);
      }
    }
  }
}
