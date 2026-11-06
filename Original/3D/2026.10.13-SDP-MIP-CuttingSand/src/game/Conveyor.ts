import Phaser from 'phaser';
import { ART_SCALE, DEPTH, GAME_FONT, LAYOUT } from '../constants';
import { DesignImage, DesignRegistry, DesignText } from '../utils/designNode';
import type { BucketRack } from './BucketRack';
import type { GrainLayer, Plot } from './SandView';

/** Width (design px) of the stream of grains landing in the middle of a bucket. */
const BUCKET_SPREAD = 22;
/** Falling grains: mouth → belt, and belt → bucket. */
const ONTO_BELT = 0;
const INTO_BUCKET = 1;

/**
 * The conveyor loop under the funnel. Sand from the mouth lands on the top run and travels right,
 * round the end and back left along the bottom run; over each bucket column, grains matching that
 * column's front bucket drop into it. Everything else keeps going round. The label shows how full
 * the belt is (grains on it, plus grains falling onto it, over its capacity).
 */
export class Conveyor implements GrainLayer {
  private readonly straight: number;
  private readonly arc: number;
  private readonly length: number;
  // Belt grains (struct of arrays, swap-removed).
  private readonly s: Float32Array;
  private readonly lane: Float32Array;
  private readonly color: Uint8Array;
  private readonly packed: Uint32Array;
  private count = 0;
  // Falling grains.
  private readonly fx: Float32Array;
  private readonly fy: Float32Array;
  private readonly fvy: Float32Array;
  private readonly fty: Float32Array;
  /** Horizontal speed (design px/s): a grain thrown off the belt arcs into the middle of a bucket. */
  private readonly fvx: Float32Array;
  private readonly fkind: Uint8Array;
  private readonly fbucket: Int32Array;
  private readonly fcolor: Uint8Array;
  private readonly fpacked: Uint32Array;
  private fcount = 0;
  private incoming = 0;
  /** Grains per palette value on the belt or falling onto it. */
  private readonly colorCounts: Int32Array;
  /** Most grains the belt ever holds: capacity plus the overflow (see accept()). */
  private readonly limit: number;
  /** Grains of a palette value waiting in the funnel for the mouth. */
  private waiting: (color: number) => number = () => 0;
  private readonly pos = { x: 0, y: 0 };
  /** The track's arrows, evenly spaced round the loop; they move with the belt, always. */
  private readonly chevrons: DesignImage[] = [];
  /** How far (design px along the loop) the belt has moved, mod its length. */
  private travelled = 0;
  private label?: DesignText;
  private shownPercent = -1;
  /** Grains let on, and turned away at the funnel mouth, since the last takeIntake(). */
  private accepted = 0;
  private refused = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly registry: DesignRegistry,
    private readonly rack: BucketRack,
    paletteSize: number,
    private readonly capacity: number,
    overflow: number,
    private readonly speed: number,
    private readonly gravity: number
  ) {
    const b = LAYOUT.belt;
    this.straight = b.half * 2;
    this.arc = Math.PI * b.radius;
    this.length = this.straight * 2 + this.arc * 2;
    this.limit = Math.max(1, capacity) + Math.max(0, Math.round(overflow));
    const beltMax = this.limit;
    this.s = new Float32Array(beltMax);
    this.lane = new Float32Array(beltMax);
    this.color = new Uint8Array(beltMax);
    this.packed = new Uint32Array(beltMax);
    const fallMax = beltMax * 2;
    this.fx = new Float32Array(fallMax);
    this.fy = new Float32Array(fallMax);
    this.fvy = new Float32Array(fallMax);
    this.fty = new Float32Array(fallMax);
    this.fvx = new Float32Array(fallMax);
    this.fkind = new Uint8Array(fallMax);
    this.fbucket = new Int32Array(fallMax);
    this.fcolor = new Uint8Array(fallMax);
    this.fpacked = new Uint32Array(fallMax);
    this.colorCounts = new Int32Array(paletteSize + 1);
  }

  create(): void {
    // The storyboard's belt art (rim, plain track, label slot), and its chevrons, which move.
    const b = LAYOUT.belt;
    const frame = this.scene.textures.getFrame('conveyor-belt');
    const w = frame.realWidth * ART_SCALE;
    const h = frame.realHeight * ART_SCALE;
    new DesignImage(this.registry, this.scene, 'conveyor-belt', b.cx, b.cy + b.artOffsetY, w, h).setDepth(DEPTH.BELT);
    if (this.scene.textures.exists('belt-chevron')) {
      const chevron = this.scene.textures.getFrame('belt-chevron');
      for (let i = 0; i < b.chevrons; i++) {
        this.chevrons.push(
          new DesignImage(this.registry, this.scene, 'belt-chevron', b.cx, b.cy, chevron.realWidth * ART_SCALE, chevron.realHeight * ART_SCALE).setDepth(
            DEPTH.BELT_CHEVRON
          )
        );
      }
      this.placeChevrons();
    }
    // Black with a white outline, as in the storyboard (like the bucket counts).
    this.label = new DesignText(this.registry, this.scene, b.cx, b.cy, '0%', {
      fontFamily: `${GAME_FONT}, "Arial Black", sans-serif`,
      size: b.label,
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setDepth(DEPTH.BELT_LABEL);
  }

  /** Grains on the belt or falling onto it. */
  get load(): number {
    return this.count + this.incoming;
  }

  get percent(): number {
    return Math.min(100, Math.round((this.load / Math.max(1, this.capacity)) * 100));
  }

  /** Grains of a palette value on the belt or falling onto it. */
  supplyOf(color: number): number {
    return this.colorCounts[color] ?? 0;
  }

  /** Internals for QA diagnostics: grains counted per colour on the belt itself, and the gate state. */
  debugState(): Record<string, unknown> {
    const onBelt = new Array<number>(this.colorCounts.length).fill(0);
    for (let i = 0; i < this.count; i++) {
      onBelt[this.color[i]]++;
    }
    return {
      count: this.count,
      incoming: this.incoming,
      falling: this.fcount,
      onBelt: onBelt.slice(1),
      feedsFront: this.feedsFront(),
      frontWaiting: this.frontWaiting(),
      jammed: this.jammed
    };
  }

  /** Grains on the belt or falling (onto it, or into a bucket): QA's sand conservation check. */
  get inTransit(): number {
    return this.count + this.fcount;
  }

  get active(): boolean {
    return this.count > 0 || this.fcount > 0;
  }

  /** Sets where the belt reads how much sand of a colour waits in the funnel (for the jam check). */
  setWaiting(waiting: (color: number) => number): void {
    this.waiting = waiting;
  }

  /**
   * The GDD's fail state (the caller adds a grace time): the belt is full and nothing on it matches a
   * front bucket, and no sand a front bucket takes is waiting in the funnel (or the overflow is used
   * up as well).
   */
  get jammed(): boolean {
    const load = this.load;
    if (load < this.capacity || this.feedsFront()) {
      return false;
    }
    return load >= this.limit || !this.frontWaiting();
  }

  /** Some grain on the belt (or falling onto it) matches a front bucket, so the belt can drain. */
  private feedsFront(): boolean {
    for (let c = 1; c < this.colorCounts.length; c++) {
      if (this.colorCounts[c] > 0 && this.rack.takes(c)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Grains the belt let on and turned away at the funnel mouth since the last call (the soft-lock
   * check reads it once a frame).
   */
  takeIntake(): Readonly<{ accepted: number; refused: number }> {
    this.intake.accepted = this.accepted;
    this.intake.refused = this.refused;
    this.accepted = 0;
    this.refused = 0;
    return this.intake;
  }

  private readonly intake = { accepted: 0, refused: 0 };

  /** Sand a front bucket takes is waiting in the funnel. */
  private frontWaiting(): boolean {
    for (let c = 1; c < this.colorCounts.length; c++) {
      if (this.waiting(c) > 0 && this.rack.takes(c)) {
        return true;
      }
    }
    return false;
  }

  /**
   * A grain leaves the funnel mouth at design x. Below capacity every grain gets on. A full belt
   * still lets on sand a front bucket takes; and while nothing on it matches a front bucket but such
   * sand waits in the funnel, any sand (up to the overflow), so colours no bucket takes can't plug
   * the mouth in front of it. Returns false when the grain has to wait in the funnel.
   */
  accept(color: number, packed: number, x: number): boolean {
    const load = this.load;
    if (this.fcount >= this.fx.length || load >= this.limit) {
      this.refused++;
      return false;
    }
    if (load >= this.capacity && !this.rack.takes(color) && (this.feedsFront() || !this.frontWaiting())) {
      this.refused++;
      return false;
    }
    this.accepted++;
    const b = LAYOUT.belt;
    const lane = (Math.random() - 0.5) * (b.track - 12);
    const f = this.fcount++;
    this.fx[f] = x;
    this.fy[f] = LAYOUT.frame.mouthY;
    this.fvy[f] = 60;
    this.fty[f] = b.cy - b.radius + lane;
    this.fvx[f] = 0;
    this.fkind[f] = ONTO_BELT;
    this.fbucket[f] = -1;
    this.fcolor[f] = color;
    this.fpacked[f] = packed;
    this.incoming++;
    this.colorCounts[color]++;
    return true;
  }

  update(deltaMs: number): void {
    const dt = Math.min(deltaMs, 50) / 1000;
    this.stepFalling(dt);
    this.stepBelt(dt);
    this.travelled = (this.travelled + this.speed * dt) % this.length;
    this.placeChevrons();
    const percent = this.percent;
    if (percent !== this.shownPercent) {
      this.shownPercent = percent;
      this.label?.setText(`${percent}%`);
    }
  }

  private stepFalling(dt: number): void {
    const b = LAYOUT.belt;
    for (let i = 0; i < this.fcount; i++) {
      this.fvy[i] += this.gravity * dt;
      this.fy[i] += this.fvy[i] * dt;
      this.fx[i] += this.fvx[i] * dt;
      if (this.fy[i] < this.fty[i]) {
        continue;
      }
      if (this.fkind[i] === ONTO_BELT) {
        this.incoming--;
        if (this.count < this.s.length) {
          const g = this.count++;
          this.s[g] = Math.max(0, Math.min(this.straight, this.fx[i] - (b.cx - b.half)));
          this.lane[g] = this.fty[i] - (b.cy - b.radius);
          this.color[g] = this.fcolor[i];
          this.packed[g] = this.fpacked[i];
        } else {
          this.colorCounts[this.fcolor[i]]--;
        }
      } else {
        this.rack.fill(this.fbucket[i]);
      }
      this.removeFalling(i--);
    }
  }

  private stepBelt(dt: number): void {
    const b = LAYOUT.buckets;
    const bottomFrom = this.straight + this.arc;
    const bottomTo = bottomFrom + this.straight;
    const advance = this.speed * dt;
    for (let i = 0; i < this.count; i++) {
      let s = this.s[i] + advance;
      if (s >= this.length) {
        s -= this.length;
      }
      this.s[i] = s;
      if (s < bottomFrom || s > bottomTo) {
        continue;
      }
      const x = LAYOUT.belt.cx + LAYOUT.belt.half - (s - bottomFrom);
      for (let col = 0; col < b.xs.length; col++) {
        if (Math.abs(x - b.xs[col]) > b.catchHalf) {
          continue;
        }
        const id = this.rack.reserve(col, this.color[i]);
        if (id >= 0 && this.fcount < this.fx.length) {
          this.dropIntoBucket(i, x, b.xs[col], id);
          i--;
        }
        break;
      }
    }
  }

  /**
   * Belt grain i (at design x) is thrown off the bottom run into bucket `id` below it, whose column
   * is centred at bucketX: a projectile arc (steady sideways speed, gravity down) that lands near
   * the middle of the opening (within ±BUCKET_SPREAD/2). Each grain's start, drop speed and landing
   * spot vary a little, so the grains pour as a loose stream rather than a single line.
   */
  private dropIntoBucket(i: number, x: number, bucketX: number, id: number): void {
    const b = LAYOUT.buckets;
    const belt = LAYOUT.belt;
    const f = this.fcount++;
    const startX = x + (Math.random() - 0.5) * 8;
    const startY = belt.cy + belt.radius - this.lane[i];
    const landY = b.ys[0] - b.h * 0.3 + Math.random() * 10;
    const vy = 25 + Math.random() * 45;
    // Fall time from startY to landY under gravity, then the sideways speed that lands on target.
    const drop = Math.max(1, landY - startY);
    const g = this.gravity;
    const time = g > 0 ? (Math.sqrt(vy * vy + 2 * g * drop) - vy) / g : drop / vy;
    this.fx[f] = startX;
    this.fy[f] = startY;
    this.fvy[f] = vy;
    this.fty[f] = landY;
    this.fvx[f] = (bucketX + (Math.random() - 0.5) * BUCKET_SPREAD - startX) / Math.max(0.05, time);
    this.fkind[f] = INTO_BUCKET;
    this.fbucket[f] = id;
    this.fcolor[f] = this.color[i];
    this.fpacked[f] = this.packed[i];
    this.colorCounts[this.color[i]]--;
    const last = --this.count;
    this.s[i] = this.s[last];
    this.lane[i] = this.lane[last];
    this.color[i] = this.color[last];
    this.packed[i] = this.packed[last];
  }

  private removeFalling(i: number): void {
    const last = --this.fcount;
    this.fx[i] = this.fx[last];
    this.fy[i] = this.fy[last];
    this.fvy[i] = this.fvy[last];
    this.fty[i] = this.fty[last];
    this.fvx[i] = this.fvx[last];
    this.fkind[i] = this.fkind[last];
    this.fbucket[i] = this.fbucket[last];
    this.fcolor[i] = this.fcolor[last];
    this.fpacked[i] = this.fpacked[last];
  }

  draw(plot: Plot): void {
    for (let i = 0; i < this.count; i++) {
      this.position(this.s[i], this.lane[i]);
      plot(this.pos.x, this.pos.y, this.packed[i]);
    }
    for (let i = 0; i < this.fcount; i++) {
      plot(this.fx[i], this.fy[i], this.fpacked[i]);
    }
  }

  /** Each chevron on the centre line, turned to point the way the belt moves there. */
  private placeChevrons(): void {
    const n = this.chevrons.length;
    const radius = LAYOUT.belt.radius;
    for (let i = 0; i < n; i++) {
      const s = (this.travelled + (i * this.length) / n) % this.length;
      this.position(s, 0);
      let turn: number;
      if (s < this.straight) {
        turn = 0;
      } else if (s < this.straight + this.arc) {
        turn = (s - this.straight) / radius;
      } else if (s < this.straight * 2 + this.arc) {
        turn = Math.PI;
      } else {
        turn = Math.PI + (s - this.straight * 2 - this.arc) / radius;
      }
      const chevron = this.chevrons[i];
      chevron.setPosition(this.pos.x, this.pos.y);
      chevron.angle = (turn * 180) / Math.PI;
    }
  }

  /** Design-space point at distance s along the loop's centre line, offset `lane` px toward the centre. */
  private position(s: number, lane: number): void {
    const b = LAYOUT.belt;
    const left = b.cx - b.half;
    const right = b.cx + b.half;
    if (s < this.straight) {
      this.pos.x = left + s;
      this.pos.y = b.cy - b.radius + lane;
    } else if (s < this.straight + this.arc) {
      const a = -Math.PI / 2 + (s - this.straight) / b.radius;
      const r = b.radius - lane;
      this.pos.x = right + Math.cos(a) * r;
      this.pos.y = b.cy + Math.sin(a) * r;
    } else if (s < this.straight * 2 + this.arc) {
      this.pos.x = right - (s - this.straight - this.arc);
      this.pos.y = b.cy + b.radius - lane;
    } else {
      const a = Math.PI / 2 + (s - this.straight * 2 - this.arc) / b.radius;
      const r = b.radius - lane;
      this.pos.x = left + Math.cos(a) * r;
      this.pos.y = b.cy + Math.sin(a) * r;
    }
  }
}
