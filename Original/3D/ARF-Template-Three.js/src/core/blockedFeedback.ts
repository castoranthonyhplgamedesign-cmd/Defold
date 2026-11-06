import { mix } from './path.ts';
import type { Vec } from './path.ts';
import { motionTuning } from './motionTuning.ts';

// Port of template ArrowGrid startBlockedFeedback/updateBlockedFeedback; default cells are one unit.
const baseSpeed = 7.2 / 1.5 * motionTuning.blockedPlaybackRate;
const shakeSeconds = .34 / motionTuning.blockedPlaybackRate;
// Beyond this many cells the approach speeds up so it never takes longer than this distance would.
const fastDistance = 3;
export class BlockedFeedback {
  elapsed = 0;
  contacted = false;
  steps: Vec[][];
  travel = 0;
  speed: number;
  approachSeconds: number;
  returnSeconds: number;
  cascadeSeconds: number;
  direction: Vec;
  private cellSize:number;
  constructor(origins: Vec[], direction: Vec, obstacles: Vec[], maxSteps: number,cellSize=1) {
    this.cellSize=cellSize;
    this.direction = direction;
    this.steps = [origins.map(p => [...p])];
    for (let step = 0; step < maxSteps; step++) {
      const starts = this.steps.at(-1)!;
      const ends = starts.map((p, i) => i ? [...starts[i - 1]] : p.map((v, j) => v + direction[j]*cellSize));
      let safe = 1;
      // Swept circle contact prevents skipping an obstacle between animation samples.
      for (let i = 0; i < starts.length; i++) for (const obstacle of obstacles) {
        const x = starts[i][0] - obstacle[0], z = starts[i][2] - obstacle[2];
        const dx = ends[i][0] - starts[i][0], dz = ends[i][2] - starts[i][2];
        const a = dx * dx + dz * dz, b = 2 * (x * dx + z * dz), c = x * x + z * z - (.78*cellSize) ** 2;
        const discriminant = b * b - 4 * a * c;
        if (c < 0) safe = 0;
        else if (a > 0 && discriminant >= 0) {
          const t = (-b - Math.sqrt(discriminant)) / (2 * a);
          if (t >= 0 && t <= 1) safe = Math.min(safe, t);
        }
      }
      this.steps.push(ends);
      this.travel = step + safe;
      if (safe < 1) break;
    }
    this.speed = baseSpeed * Math.max(1, this.travel / fastDistance);
    this.approachSeconds = this.travel / this.speed;
    this.returnSeconds = Math.max(.12 / motionTuning.blockedPlaybackRate, this.travel / (this.speed * 1.8));
    this.cascadeSeconds = Math.min(.45, (origins.length - 1) * .07) / motionTuning.blockedPlaybackRate;
  }
  get duration() { return this.approachSeconds + shakeSeconds + this.cascadeSeconds + this.returnSeconds; }
  get done() { return this.elapsed + 1e-9 >= this.duration; }
  get flash() {
    const t=(this.elapsed-this.approachSeconds)/(this.duration-this.approachSeconds);
    return t<=0 || t>=1 ? 0 : .65*Math.sin(t*Math.PI*2)**2;
  }
  private routeProgress() {
    const contactTime = this.elapsed - this.approachSeconds;
    const returnProgress = Math.max(0, Math.min(1, (contactTime - shakeSeconds - this.cascadeSeconds) / this.returnSeconds));
    const eased = returnProgress * returnProgress * (3 - 2 * returnProgress);
    return contactTime < 0 ? this.elapsed * this.speed : this.travel * (1 - eased);
  }
  yaw(index: number) {
    if (index === 0) return Math.atan2(this.direction[0], this.direction[2]);
    const progress = this.routeProgress(), step = Math.min(this.steps.length - 2, Math.floor(progress));
    const angle = (points: Vec[]) => Math.atan2(points[index][0] - points[index - 1][0], points[index][2] - points[index - 1][2]);
    if (step < 0) return angle(this.steps[0]);
    const start = angle(this.steps[step]), end = angle(this.steps[step + 1]);
    const difference = Math.atan2(Math.sin(end - start), Math.cos(end - start));
    return start + difference * (progress - step);
  }
  position(index: number) {
    const contactTime = this.elapsed - this.approachSeconds;
    const progress = this.routeProgress();
    const step = Math.min(this.steps.length - 2, Math.floor(progress));
    let p = this.steps.length === 1 ? [...this.steps[0][index]] : mix(this.steps[step][index], this.steps[step + 1][index], progress - step);
    if (contactTime >= 0 && contactTime < shakeSeconds + this.cascadeSeconds) {
      const delay = this.steps[0].length > 1 ? this.cascadeSeconds * index / (this.steps[0].length - 1) : 0;
      const t = Math.max(0, Math.min(1, (contactTime - delay) / shakeSeconds));
      const wave = Math.sin(t * Math.PI * 4) * (1 - t);
      const recoil = .06 * Math.abs(wave)*this.cellSize, sideways = .11 * wave*this.cellSize;
      p = [p[0] - this.direction[0] * recoil - this.direction[2] * sideways, p[1] - this.direction[1] * recoil, p[2] - this.direction[2] * recoil + this.direction[0] * sideways];
    }
    return p;
  }
}
