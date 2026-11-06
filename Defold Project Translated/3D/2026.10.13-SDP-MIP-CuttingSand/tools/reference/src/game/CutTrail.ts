import Phaser from 'phaser';
import { DEPTH } from '../constants';
import { sd, sx, sy } from '../utils/responsive';

/** How long (ms) each point of the swipe trail stays visible. */
const TRAIL_MS = 260;
const MAX_POINTS = 96;
/**
 * Trail widths at the newest point (design px): the soft glow (as wide as the swipe cuts,
 * TIMING.cutReach) and the bright core.
 */
const GLOW_WIDTH = 69;
const CORE_WIDTH = 14;

/**
 * The glowing line a swipe leaves (Cutting Sand), in design space: a soft wide glow and a bright
 * core that thin and fade along the line, the newest point brightest. Redrawn each frame while
 * any of it is visible (from design points, so a resize mid-swipe keeps it in place).
 */
export class CutTrail {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly xs = new Float32Array(MAX_POINTS);
  private readonly ys = new Float32Array(MAX_POINTS);
  private readonly ts = new Float64Array(MAX_POINTS);
  private count = 0;

  constructor(scene: Phaser.Scene) {
    this.g = scene.add.graphics().setDepth(DEPTH.CUT_TRAIL);
  }

  /** A new point of the swipe (design px) at time `now` (ms). */
  add(x: number, y: number, now: number): void {
    if (this.count === MAX_POINTS) {
      this.xs.copyWithin(0, 1);
      this.ys.copyWithin(0, 1);
      this.ts.copyWithin(0, 1);
      this.count--;
    }
    this.xs[this.count] = x;
    this.ys[this.count] = y;
    this.ts[this.count] = now;
    this.count++;
  }

  /** Per frame: old points fade out, and the trail is redrawn. */
  update(now: number): void {
    let drop = 0;
    while (drop < this.count && now - this.ts[drop] > TRAIL_MS) {
      drop++;
    }
    if (drop > 0) {
      this.xs.copyWithin(0, drop, this.count);
      this.ys.copyWithin(0, drop, this.count);
      this.ts.copyWithin(0, drop, this.count);
      this.count -= drop;
    }
    const g = this.g;
    g.clear();
    if (this.count === 0) {
      return;
    }
    for (let pass = 0; pass < 2; pass++) {
      const width = pass === 0 ? GLOW_WIDTH : CORE_WIDTH;
      const alpha = pass === 0 ? 0.3 : 0.95;
      for (let i = 0; i < this.count; i++) {
        const life = Math.max(0, 1 - (now - this.ts[i]) / TRAIL_MS);
        const w = sd(width) * (0.35 + 0.65 * life);
        const x = sx(this.xs[i]);
        const y = sy(this.ys[i]);
        if (i > 0) {
          g.lineStyle(w, 0xffffff, alpha * life);
          g.lineBetween(sx(this.xs[i - 1]), sy(this.ys[i - 1]), x, y);
        }
        // Round joints and ends.
        g.fillStyle(0xffffff, alpha * life);
        g.fillCircle(x, y, w / 2);
      }
    }
  }

  clear(): void {
    this.count = 0;
    this.g.clear();
  }
}
