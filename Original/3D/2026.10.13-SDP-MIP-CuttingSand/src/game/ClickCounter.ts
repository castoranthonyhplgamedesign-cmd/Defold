const DUPLICATE_WINDOW_MS = 60;

/**
 * Counts real gameplay pointerdowns. A native event is counted once (WeakSet), and a second
 * delivery of the same physical tap (e.g. touch + synthesized mouse at the same spot within a few
 * ms) is dropped. The caller decides which pointerdowns are eligible.
 */
export class ClickCounter {
  private readonly seen = new WeakSet<object>();
  private lastTime = -Infinity;
  private lastX = NaN;
  private lastY = NaN;
  private total = 0;

  constructor(readonly limit: number) {}

  get count(): number {
    return this.total;
  }

  get limited(): boolean {
    return Number.isFinite(this.limit);
  }

  get reachedLimit(): boolean {
    return this.limited && this.total >= this.limit;
  }

  /** Returns true when this pointerdown is newly counted. */
  register(event: Event | undefined | null, x: number, y: number, time: number): boolean {
    if (event) {
      if (this.seen.has(event)) {
        return false;
      }
      this.seen.add(event);
    }
    if (time - this.lastTime < DUPLICATE_WINDOW_MS && Math.abs(x - this.lastX) < 4 && Math.abs(y - this.lastY) < 4) {
      return false;
    }
    this.lastTime = time;
    this.lastX = x;
    this.lastY = y;
    this.total++;
    return true;
  }
}
