import Phaser from 'phaser';
import { ART_SCALE, DEPTH, GAME_FONT, LAYOUT, TIMING } from '../constants';
import { DesignImage, DesignRegistry, DesignText } from '../utils/designNode';
import type { Patch } from './sandGrid';

/** `need`: grains that fill it; `remaining` grains still to come (the label shows them scaled to `label`, its start number). */
type Bucket = { id: number; color: number; label: number; need: number; remaining: number; reserved: number; pulse: number; labelDirty: boolean };
/**
 * `lid`: the bucket's lid (colours with a lid slot): on while the bucket waits for its turn, lifted
 * off when its turn comes, dropped back on when it is full. `lidClosed`: it is on now; `lidDy`: its
 * place relative to the bucket's centre.
 */
type BucketView = { shadow: DesignImage; glow: DesignImage; body: DesignImage; lid: DesignImage; label: DesignText; lidClosed: boolean; lidDy: number };
type Column = { queue: Bucket[]; views: BucketView[]; busy: boolean };

/**
 * One entry of the bucket group order: a sand colour (its `stacks` numbers), [colour, n1, n2, …] (a
 * group with its own numbers), or 0 (an empty slot: that column gets no group there).
 */
export type BucketGroup = number | readonly number[];

/** Grains of one colour not yet in a bucket, anywhere (picture, funnel, belt). */
export type SandSupply = (color: number) => number;

export type BucketEvents = {
  /** Count reached zero: completion starts, before the lid drops or the bucket hops. */
  onFull?: () => void;
  /** A full bucket's lid closed. */
  onLid?: () => void;
  /** A full bucket flies off. */
  onFly?: () => void;
};

/**
 * Share of its colour's sand a bucket takes, by starting row (front first): front buckets take
 * little and fill within a tap or two, the back ones take the rest (their number counts down more
 * slowly per grain; nobody gets that far in a short ad).
 */
const ROW_SHARE = [1, 2, 3, 4];
const SPARKLE_COUNT = 8;
const SPARKLE_COLORS = [0xffffff, 0xffe27a, 0xfff3b8];
/** Under each bucket: its shadow, and the glow behind a cleared bucket (storyboard art). */
const SHADOW_DEPTH = DEPTH.BUCKETS - 0.2;
const GLOW_DEPTH = DEPTH.BUCKETS - 0.1;
/** A dropped lid's top sits this many art px above the bucket art's top (it covers the rim). */
const LID_OVERLAP = 10;
/** How far (design px) above its place a lid starts its drop. */
const LID_FALL = 110;
/** A waiting bucket's lid: over the buckets (a lower row stands in front of the one above). */
const LID_DEPTH = DEPTH.BUCKETS + 0.05;
/**
 * Lid pop: the bucket stretches tall (its height × (1 + POP_STRETCH)) over POP_STRETCH_MS, then its
 * lid hops up onto the belt (LID_HOP_MS) and shrinks away there, tilting (LID_SHRINK_MS), while
 * the bucket snaps back (POP_SNAP_MS).
 */
const POP_STRETCH = 0.6;
const POP_STRETCH_MS = 140;
const LID_TO_Y = LAYOUT.belt.cy + LAYOUT.belt.radius * 0.3;
const LID_HOP_MS = 110;
const LID_SHRINK_MS = 130;
const LID_TILT = -18;
const POP_SNAP_MS = 200;
/** A full bucket: how much it stretches while its lid drops on, where it hops to (the belt) and how far it is flung. */
const FULL_STRETCH = 0.45;
const HOP_TO_Y = LAYOUT.belt.cy + LAYOUT.belt.radius * 0.45;
const FLING_X = 760;
const FLING_SPIN = 85;
/** How far through its fling (0–1) a full bucket is when the next bucket of its column slides up into its place. */
const NEXT_AFTER_FLING = 0.5;

/**
 * The bucket columns under the conveyor. Each column shows a queue of buckets of one colour each;
 * only the front bucket of a column takes sand. The starting buckets are all there are (none join
 * later): each colour's sand is shared out between its buckets (front rows take less, ROW_SHARE),
 * so together they take the whole picture. A bucket's label counts down from `capacity` however
 * many grains it really takes (a grain counts for capacity / need). With `stacks` numbers for a
 * colour, each of its groups is a stack of buckets with those start numbers (e.g. 800, 800, 380), one
 * above the other in the group's column, and the colour's sand is shared out by those numbers.
 * showColors() can keep the buckets of other colours hidden (a later wave). Buckets are the
 * storyboard's art, one image per colour (`art`, slot keys in SAND.palette order). A full bucket
 * gets its lid (`<art>-lid`) dropped on, or turns into its cleared art (lid on, tilted), with a glow
 * and sparkles, hops and flies off to the right, and the column slides up.
 */
export class BucketRack {
  private readonly columns: Column[] = [];
  private readonly byId: Bucket[] = [];
  private completedCount = 0;
  private filledGrains = 0;
  private supply: SandSupply = () => 0;
  /** Colours whose buckets show (showColors); null = every colour. */
  private shownColors: Set<number> | null = null;
  /** Colours whose front buckets have their turn, lid off (setOpenColors); null = every colour. */
  private openColors: Set<number> | null = new Set<number>();

  /**
   * @param stacks per sand colour (SAND.palette order), the start numbers of the buckets each of its
   * groups stacks in its column, front first; none = one bucket per group, starting at `capacity`.
   */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly registry: DesignRegistry,
    private readonly art: string[],
    private readonly capacity: number,
    private readonly stacks: readonly (readonly number[])[],
    private readonly events: BucketEvents
  ) {}

  /**
   * Only buckets of these colours show (null = all); the others wait hidden in their places. Buckets
   * that appear pop in, front rows first.
   */
  showColors(colors: readonly number[] | null): void {
    const before = this.shownColors;
    this.shownColors = colors ? new Set(colors) : null;
    for (let col = 0; col < this.columns.length; col++) {
      const column = this.columns[col];
      for (let row = 0; row < column.views.length; row++) {
        // A full bucket flying off keeps its look until it has gone (advance() repaints its view).
        if (row === 0 && column.busy) {
          continue;
        }
        const bucket = column.queue[row];
        const view = column.views[row];
        this.paint(view, bucket, !(bucket && this.isTurn(row, bucket)));
        if (!bucket || !before || before.has(bucket.color) || !this.isShown(bucket)) {
          continue;
        }
        this.riseView(view, row * 40);
      }
    }
  }

  /** Intro: every shown bucket rises into its place from below the screen, after `delayMs`. */
  rise(delayMs = 0): void {
    for (let col = 0; col < this.columns.length; col++) {
      const column = this.columns[col];
      for (let row = 0; row < column.views.length; row++) {
        const bucket = column.queue[row];
        if (bucket && this.isShown(bucket) && !(row === 0 && column.busy)) {
          this.riseView(column.views[row], delayMs + row * 40);
        }
      }
    }
  }

  /**
   * A bucket (with its shadow, number and lid) rises into place from below the screen, overshooting
   * a little. One tween per part: the lid's own animations cancel only the lid's.
   */
  private riseView(view: BucketView, delayMs: number): void {
    const parts = [view.body, view.shadow, view.label, view.lid];
    for (let i = 0; i < parts.length; i++) {
      parts[i].y += TIMING.bucketRiseFrom;
      this.scene.tweens.add({ targets: parts[i], y: `-=${TIMING.bucketRiseFrom}`, delay: delayMs, duration: TIMING.bucketRise, ease: 'Back.Out' });
    }
  }

  private isShown(bucket: Bucket): boolean {
    return !this.shownColors || this.shownColors.has(bucket.color);
  }

  /**
   * The front buckets of these colours have their turn (null = every colour): their lids pop off one
   * after another, left to right (`staggerMs` apart), after `delayMs` (e.g. once newly shown buckets
   * have risen into place). The rest keep theirs on.
   */
  setOpenColors(colors: readonly number[] | null, delayMs = 0, staggerMs = TIMING.lidPop): void {
    this.openColors = colors ? new Set(colors) : null;
    for (let col = 0; col < this.columns.length; col++) {
      const column = this.columns[col];
      const bucket = column.queue[0];
      const view = column.views[0];
      if (!column.busy && bucket && view && view.lidClosed && this.isShown(bucket) && this.isTurn(0, bucket)) {
        this.openLid(view, delayMs + col * staggerMs);
      }
    }
  }

  /** A bucket's turn: it is at the front of its column and its colour plays now. */
  private isTurn(row: number, bucket: Bucket): boolean {
    return row === 0 && (!this.openColors || this.openColors.has(bucket.color));
  }

  /**
   * The lid pops off (front row only): the bucket stretches tall, bottom on the ground, carrying its
   * lid up; the lid hops up onto the belt and shrinks away there, tilting; the bucket snaps back
   * with a little squash.
   */
  private openLid(view: BucketView, delayMs: number): void {
    if (!view.lidClosed) {
      return;
    }
    view.lidClosed = false;
    const b = LAYOUT.buckets;
    const restY = b.ys[0];
    const { body, lid } = view;
    const stretch = (k: number): void => {
      const h = b.h * (1 + POP_STRETCH * k);
      body.setSize(b.w * (1 - 0.15 * k), h);
      body.y = restY + b.h / 2 - h / 2;
    };
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      delay: delayMs,
      duration: POP_STRETCH_MS,
      ease: 'Quad.Out',
      // The lid's own tweens (rising or sliding into place) stop only when the pop starts.
      onStart: () => this.scene.tweens.killTweensOf(lid),
      onUpdate: tween => {
        const k = tween.getValue() ?? 0;
        stretch(k);
        lid.y = restY + view.lidDy - b.h * POP_STRETCH * k;
      },
      onComplete: () => {
        this.scene.tweens.add({
          targets: lid,
          y: LID_TO_Y,
          duration: LID_HOP_MS,
          ease: 'Quad.Out',
          onComplete: () => {
            this.scene.tweens.add({ targets: lid, zoom: 0, angle: LID_TILT, duration: LID_SHRINK_MS, ease: 'Quad.In', onComplete: () => lid.setVisible(false) });
          }
        });
        this.scene.tweens.addCounter({
          from: 1,
          to: 0,
          duration: POP_SNAP_MS,
          ease: 'Back.Out',
          onUpdate: tween => stretch(tween.getValue() ?? 0),
          onComplete: () => stretch(0)
        });
      }
    });
  }

  /** True while a bucket of these colours is still in a column, or a full one is still flying off. */
  hasBucketsForColors(colors: readonly number[]): boolean {
    for (let col = 0; col < this.columns.length; col++) {
      const column = this.columns[col];
      if (column.busy) {
        return true;
      }
      for (let row = 0; row < column.queue.length; row++) {
        if (colors.includes(column.queue[row].color)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Starting buckets for a picture with `totals[c]` grains of each colour, `slots` of them: split
   * between the colours so the fullest bucket holds as little sand as possible (every colour with
   * sand gets one). The front row takes different colours, those lowest in the picture first (their
   * sand falls first); the rest follow in the order their sand comes free as the picture is cleared
   * from the bottom up (a colour's next bucket once its share of sand has come free). Then each row
   * is rearranged so the colours are spread out (scatter()).
   */
  static plan(patches: Patch[], totals: readonly number[], slots: number, rowLength: number): number[] {
    const count = totals.map((t): number => (t > 0 ? 1 : 0));
    for (let used = count.reduce((a, b) => a + b, 0); used < slots; used++) {
      let best = 0;
      for (let c = 1; c < totals.length; c++) {
        if (count[c] && (!best || totals[c] / count[c] > totals[best] / count[best])) {
          best = c;
        }
      }
      if (!best) {
        break;
      }
      count[best]++;
    }
    const ordered = patches.slice().sort((a, b) => b.maxRow - a.maxRow || b.size - a.size);
    const freed = new Array<number>(totals.length).fill(0);
    const placed = new Array<number>(totals.length).fill(0);
    const order: number[] = [];
    for (let i = 0; i < ordered.length && order.length < rowLength; i++) {
      const c = ordered[i].color;
      if (count[c] && !order.includes(c)) {
        order.push(c);
        placed[c]++;
      }
    }
    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i].color;
      freed[c] += ordered[i].size;
      while (placed[c] < count[c] && freed[c] >= Math.round((totals[c] * (placed[c] + 1)) / count[c])) {
        order.push(c);
        placed[c]++;
      }
    }
    for (let c = 1; c < totals.length; c++) {
      for (; placed[c] < count[c]; placed[c]++) {
        order.push(c);
      }
    }
    return BucketRack.scatter(order, rowLength);
  }

  /**
   * Rearranges the buckets within each row (each keeps its row: the order sand comes free) so no
   * two of a colour sit side by side or one above the other, and as few as possible touch
   * diagonally: the colours look spread out, not grouped. Tries every arrangement of each row.
   */
  static scatter(order: number[], rowLength: number): number[] {
    const rows: number[][] = [];
    for (let i = 0; i < order.length; i += rowLength) {
      rows.push(order.slice(i, i + rowLength));
    }
    const options = rows.map(row => {
      const seen = new Set<string>();
      const out: number[][] = [];
      const build = (rest: number[], acc: number[]): void => {
        if (!rest.length) {
          const key = acc.join(',');
          if (!seen.has(key)) {
            seen.add(key);
            out.push(acc);
          }
          return;
        }
        for (let i = 0; i < rest.length; i++) {
          build(rest.slice(0, i).concat(rest.slice(i + 1)), acc.concat(rest[i]));
        }
      };
      build(row, []);
      return out;
    });
    // Side by side or one above the other: 100; diagonal: 1.
    const cost = (above: number[] | null, row: number[]): number => {
      let c = 0;
      for (let x = 0; x < row.length; x++) {
        if (x > 0 && row[x] === row[x - 1]) c += 100;
        if (above) {
          if (above[x] === row[x]) c += 100;
          if (x > 0 && above[x - 1] === row[x]) c += 1;
          if (x + 1 < row.length && above[x + 1] === row[x]) c += 1;
        }
      }
      return c;
    };
    let best = Infinity;
    let bestRows = rows;
    const search = (r: number, above: number[] | null, picked: number[][], total: number): void => {
      if (total >= best) {
        return;
      }
      if (r === rows.length) {
        best = total;
        bestRows = picked;
        return;
      }
      for (const row of options[r]) {
        search(r + 1, row, picked.concat([row]), total + cost(above, row));
      }
    };
    search(0, null, [], 0);
    return bestRows.flat();
  }

  /**
   * Fills the columns from a bucket group order (front row first, left to right; group i goes to
   * column i % 4): these are all the buckets there will be. Each group is its colour's `stacks`
   * buckets one above the other (or one bucket). Each colour's `totals` grains are shared out between
   * its buckets by their start numbers (without stack numbers: by ROW_SHARE of their starting row), so
   * together they take exactly that colour's sand.
   */
  create(order: readonly BucketGroup[], totals: readonly number[], supply: SandSupply): void {
    const b = LAYOUT.buckets;
    this.supply = supply;
    for (let i = 0; i < b.xs.length; i++) {
      this.columns.push({ queue: [], views: [], busy: false });
    }
    const groups = Math.min(order.length, b.xs.length * b.ys.length);
    const plan: { col: number; color: number; label: number; weight: number }[] = [];
    for (let i = 0; i < groups; i++) {
      const entry = order[i];
      const color = Array.isArray(entry) ? entry[0] : (entry as number);
      if (!color) {
        // An empty slot: this column has no group here.
        continue;
      }
      const col = i % this.columns.length;
      const numbers = Array.isArray(entry) && entry.length > 1 ? entry.slice(1) : this.stacks[color - 1] ?? [];
      if (numbers.length) {
        for (let k = 0; k < numbers.length; k++) {
          plan.push({ col, color, label: numbers[k], weight: numbers[k] });
        }
      } else {
        const weight = ROW_SHARE[Math.min(ROW_SHARE.length - 1, Math.floor(i / this.columns.length))];
        plan.push({ col, color, label: this.capacity, weight });
      }
    }
    const weights = new Array<number>(totals.length).fill(0);
    for (let i = 0; i < plan.length; i++) {
      weights[plan[i].color] += plan[i].weight;
    }
    // Each colour's sand is shared out by weight; the last bucket of a colour takes what is left.
    const given = new Array<number>(totals.length).fill(0);
    const weightLeft = weights.slice();
    for (let i = 0; i < plan.length; i++) {
      const { col, color, label, weight } = plan[i];
      const left = (totals[color] ?? 0) - given[color];
      const share = weightLeft[color] <= weight ? left : Math.round((left * weight) / weightLeft[color]);
      given[color] += share;
      weightLeft[color] -= weight;
      // A colour with no sand still gets a bucket that can fill (retireExhausted sends it off).
      this.columns[col].queue.push(this.newBucket(color, label, Math.max(1, share)));
    }

    for (let col = 0; col < this.columns.length; col++) {
      for (let row = 0; row < b.ys.length; row++) {
        const view = this.makeView(b.xs[col], b.ys[row]);
        this.columns[col].views.push(view);
        this.paint(view, this.columns[col].queue[row], true);
      }
    }
  }

  get completed(): number {
    return this.completedCount;
  }

  /**
   * Every bucket is full and on its way off (the last one past the point where the next would slide
   * up): the level is done. The buckets take exactly the picture's sand, so this is also "all the
   * sand is in buckets".
   */
  get allFilled(): boolean {
    for (let col = 0; col < this.columns.length; col++) {
      if (this.columns[col].queue.length > 0 || this.columns[col].busy) {
        return false;
      }
    }
    return this.columns.length > 0;
  }

  /** Grains that have landed in buckets so far (QA's sand conservation check). */
  get filled(): number {
    return this.filledGrains;
  }

  /** Each column's queue as "colour:remaining" (QA diagnostics). */
  debugColumns(): string[][] {
    return this.columns.map(column => column.queue.map(b => `${b.color}:${b.remaining}${column.busy && b === column.queue[0] ? '*' : ''}`));
  }

  /** '' when every bucket count is consistent; otherwise what is wrong (QA). */
  integrityIssue(): string {
    for (let i = 0; i < this.byId.length; i++) {
      const b = this.byId[i];
      if (b.remaining < 0 || b.reserved < 0 || b.reserved > b.remaining || b.remaining > b.need) {
        return `bucket ${b.id}: remaining ${b.remaining}, reserved ${b.reserved}`;
      }
    }
    return '';
  }

  /** Colours a front bucket can still take right now. */
  frontColors(): number[] {
    const colors: number[] = [];
    for (let i = 0; i < this.columns.length; i++) {
      const front = this.front(i);
      if (front && !colors.includes(front.color)) {
        colors.push(front.color);
      }
    }
    return colors;
  }

  /**
   * Colours the front buckets still need, ignoring grains already on their way in and buckets mid
   * swap (the hint follows this; it doesn't flicker as sand lands).
   */
  neededColors(): number[] {
    const colors: number[] = [];
    for (let i = 0; i < this.columns.length; i++) {
      const bucket = this.columns[i].queue[0];
      if (bucket && bucket.remaining > 0 && !colors.includes(bucket.color)) {
        colors.push(bucket.color);
      }
    }
    return colors.sort((a, b) => a - b);
  }

  /** True when some front bucket can take a grain of `color` right now (frontColors() without the array). */
  takes(color: number): boolean {
    for (let i = 0; i < this.columns.length; i++) {
      if (this.front(i)?.color === color) {
        return true;
      }
    }
    return false;
  }

  /** Colours of every bucket in the columns (front and queued), ignoring reservations. */
  queuedColors(): number[] {
    const colors: number[] = [];
    for (let i = 0; i < this.columns.length; i++) {
      const queue = this.columns[i].queue;
      for (let j = 0; j < queue.length; j++) {
        if (queue[j].remaining > 0 && !colors.includes(queue[j].color)) {
          colors.push(queue[j].color);
        }
      }
    }
    return colors;
  }

  /** Claims a place in column `col`'s front bucket for one grain of `color`; returns its bucket id or -1. */
  reserve(col: number, color: number): number {
    const front = this.front(col);
    if (!front || front.color !== color) {
      return -1;
    }
    front.reserved++;
    return front.id;
  }

  /**
   * A front bucket whose colour has no sand left anywhere (`supply`: grains of a colour still in the
   * picture, funnel or on the belt) can never fill (a grain went astray, or a configured start gave
   * a colour without sand a bucket): it closes and flies off like a full one, so it doesn't block
   * the buckets behind it.
   */
  retireExhausted(): void {
    for (let col = 0; col < this.columns.length; col++) {
      const column = this.columns[col];
      const bucket = column.queue[0];
      if (!column.busy && bucket && bucket.remaining > 0 && bucket.reserved === 0 && this.supply(bucket.color) <= 0) {
        this.complete(col);
      }
    }
  }

  private newBucket(color: number, label: number, need: number): Bucket {
    const bucket: Bucket = { id: this.byId.length, color, label, need, remaining: need, reserved: 0, pulse: 0, labelDirty: true };
    this.byId.push(bucket);
    return bucket;
  }

  /** The bucket's number: its remaining grains scaled so it starts at its start number (0 only when full). */
  private shown(bucket: Bucket): string {
    return String(Math.max(0, Math.ceil((bucket.label * bucket.remaining) / bucket.need)));
  }

  /** A claimed grain landed in its bucket. */
  fill(id: number): void {
    const bucket = this.byId[id];
    if (!bucket) {
      return;
    }
    bucket.reserved--;
    bucket.remaining--;
    this.filledGrains++;
    bucket.pulse = 1;
    bucket.labelDirty = true;
    if (bucket.remaining <= 0 && bucket.reserved <= 0) {
      const col = this.columns.findIndex(column => column.queue[0] === bucket);
      if (col >= 0) {
        this.complete(col);
      }
    }
  }

  /** Per frame: the front buckets' labels follow the fill, and filling buckets bounce slightly. */
  update(deltaMs: number): void {
    const decay = Math.min(1, deltaMs / 160);
    for (let col = 0; col < this.columns.length; col++) {
      const column = this.columns[col];
      // Only a column's front bucket takes sand, so only its label and bounce change.
      const bucket = column.queue[0];
      const view = column.views[0];
      if (!bucket || !view) {
        continue;
      }
      if (bucket.labelDirty) {
        bucket.labelDirty = false;
        view.label.setText(this.shown(bucket));
      }
      if (bucket.pulse > 0 && !column.busy) {
        bucket.pulse = Math.max(0, bucket.pulse - decay);
        view.body.zoom = 1 + 0.06 * bucket.pulse;
      }
    }
  }

  private front(col: number): Bucket | null {
    const column = this.columns[col];
    if (!column || column.busy) {
      return null;
    }
    const bucket = column.queue[0];
    return bucket && bucket.remaining - bucket.reserved > 0 ? bucket : null;
  }

  /**
   * A full bucket (as in the mock-up): its number goes, it stretches tall while its lid drops onto
   * it, then it hops up to the belt, squashes with a flash and sparkles, and is flung off to the
   * right, spinning. Its own images do the flying. The column's queue moves on at once, but the next
   * bucket stays where it is (taking no sand) until the full one is on its way off: only then does
   * it slide into the front place and take its turn (slideUp).
   */
  private complete(col: number): void {
    const column = this.columns[col];
    const bucket = column.queue[0];
    const view = column.views[0];
    this.completedCount++;
    this.events.onFull?.();
    if (!bucket || !view) {
      this.advance(col);
      this.slideUp(col);
      return;
    }
    const b = LAYOUT.buckets;
    const x = b.xs[col];
    const y = b.ys[0];
    const art = this.art[bucket.color - 1];
    const lidKey = `${art}-lid`;
    const hasLid = this.scene.textures.exists(lidKey);
    const lidSize = hasLid ? artSize(this.scene, lidKey) : { w: 0, h: 0 };
    const lidDy = -b.h / 2 - LID_OVERLAP * ART_SCALE + lidSize.h / 2;
    const body = new DesignImage(this.registry, this.scene, art, x, y, b.w, b.h).setDepth(DEPTH.BUCKET_CLEARED);
    const lid = hasLid ? new DesignImage(this.registry, this.scene, lidKey, x, y + lidDy - LID_FALL, lidSize.w, lidSize.h).setDepth(DEPTH.BUCKET_CLEARED + 0.05) : null;
    if (lid) {
      lid.alpha = 0;
    }
    view.body.setVisible(false);
    view.shadow.setVisible(false);
    view.label.setVisible(false);
    view.lid.setVisible(false);
    this.advance(col);

    // 1. It stretches tall (bottom on the ground) while the lid drops onto its rising top.
    const stretch = (k: number): void => {
      const h = b.h * (1 + FULL_STRETCH * k);
      body.setSize(b.w * (1 - 0.12 * k), h);
      body.y = y + b.h / 2 - h / 2;
    };
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: TIMING.lidDrop,
      onUpdate: tween => {
        const t = tween.getValue() ?? 0;
        stretch(1 - (1 - t) * (1 - t));
        if (lid) {
          lid.alpha = Math.min(1, t * 3);
          lid.y = y + lidDy - b.h * FULL_STRETCH * (1 - (1 - t) * (1 - t)) - LID_FALL * (1 - t * t);
        }
      },
      onComplete: () => {
        this.events.onLid?.();
        lid?.destroy();
        this.flyOff(body, art, x, y, () => this.slideUp(col));
      }
    });
  }

  /**
   * The closed bucket (one image: `closedTexture`) hops up to the belt and squashes with a flash and
   * sparkles, then is flung off to the right, spinning, and is gone. `onClear` runs once it is
   * NEXT_AFTER_FLING of the way through its fling (its place is clear for the next bucket).
   */
  private flyOff(body: DesignImage, art: string, x: number, y: number, onClear: () => void): void {
    let cleared = false;
    const clear = (): void => {
      if (!cleared) {
        cleared = true;
        onClear();
      }
    };
    const b = LAYOUT.buckets;
    const key = this.closedTexture(art);
    const size = artSize(this.scene, key);
    // The closed image is taller than the bucket (its lid): keep the bucket part where it was.
    const baseY = y + b.h / 2 - size.h / 2;
    const squash = (k: number, cy: number): void => {
      body.setSize(size.w * (1 + 0.18 * k), size.h * (1 - 0.22 * k));
      body.y = cy;
    };
    body.setTexture(key);
    squash(0, baseY);
    const hopDy = HOP_TO_Y - baseY;
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: TIMING.bucketHop,
      ease: 'Quad.Out',
      onUpdate: tween => {
        const t = tween.getValue() ?? 0;
        squash(t, baseY + hopDy * t);
      },
      onComplete: () => {
        this.flash(x, HOP_TO_Y);
        this.sparkle(x, HOP_TO_Y);
        this.events.onFly?.();
        this.scene.tweens.addCounter({
          from: 0,
          to: 1,
          duration: TIMING.bucketFly,
          ease: 'Quad.In',
          onUpdate: tween => {
            const t = tween.getValue() ?? 0;
            squash(1 - Math.min(1, t * 3), HOP_TO_Y - 50 * t);
            body.x = x + FLING_X * t;
            body.angle = FLING_SPIN * t;
            if (tween.progress >= NEXT_AFTER_FLING) {
              clear();
            }
          },
          onComplete: () => {
            clear();
            body.destroy();
          }
        });
      }
    });
  }

  /** A white flash (the glow art) where a full bucket lands on the belt. */
  private flash(x: number, y: number): void {
    const size = artSize(this.scene, 'bucket-glow');
    const glow = new DesignImage(this.registry, this.scene, 'bucket-glow', x, y, size.w, size.h).setDepth(DEPTH.BUCKET_CLEARED - 0.1);
    glow.alpha = 0;
    glow.zoom = 0.6;
    this.scene.tweens.add({ targets: glow, alpha: 1, zoom: 1.1, duration: 150, ease: 'Quad.Out', yoyo: true, onComplete: () => glow.destroy() });
  }

  /**
   * A closed bucket as one image (its art with the lid on, drawn once into a canvas texture), so it
   * can spin as one piece; the cleared art for colours without a lid, else the open art.
   */
  private closedTexture(art: string): string {
    const key = `${art}-closed`;
    if (this.scene.textures.exists(key)) {
      return key;
    }
    const lidKey = `${art}-lid`;
    if (!this.scene.textures.exists(lidKey)) {
      return this.scene.textures.exists(`${art}-cleared`) ? `${art}-cleared` : art;
    }
    const bodyFrame = this.scene.textures.getFrame(art);
    const lidFrame = this.scene.textures.getFrame(lidKey);
    const w = Math.max(bodyFrame.realWidth, lidFrame.realWidth);
    const h = bodyFrame.realHeight + LID_OVERLAP;
    const canvas = this.scene.textures.createCanvas(key, w, h);
    if (!canvas) {
      return art;
    }
    canvas.drawFrame(art, undefined, (w - bodyFrame.realWidth) / 2, LID_OVERLAP);
    canvas.drawFrame(lidKey, undefined, (w - lidFrame.realWidth) / 2, 0);
    canvas.refresh();
    return key;
  }

  /**
   * The full bucket leaves its column's queue: the buckets behind it move up one in the queue, each
   * view still showing its own bucket where it stands; the flown bucket's view goes to the back
   * (empty: no bucket joins). The column stays busy, taking no sand, until slideUp() has moved the
   * views into their new places.
   */
  private advance(col: number): void {
    const column = this.columns[col];
    const b = LAYOUT.buckets;
    column.busy = true;
    column.queue.shift();
    const flown = column.views.shift();
    if (flown) {
      column.views.push(flown);
      this.scene.tweens.killTweensOf([flown.shadow, flown.glow, flown.body, flown.lid, flown.label]);
      this.place(flown, b.xs[col], b.ys[column.views.length - 1] + 160);
    }
    for (let row = 0; row < column.views.length; row++) {
      this.paint(column.views[row], column.queue[row], true);
    }
  }

  /** The column's buckets slide up into their places (after advance()); the new front one takes its turn. */
  private slideUp(col: number): void {
    const column = this.columns[col];
    const b = LAYOUT.buckets;
    for (let row = 0; row < column.views.length; row++) {
      const view = column.views[row];
      this.scene.tweens.killTweensOf([view.shadow, view.glow, view.body, view.lid, view.label]);
      const bucket = column.queue[row];
      this.scene.tweens.add({ targets: view.body, y: b.ys[row], duration: TIMING.bucketSlide, ease: 'Quad.Out' });
      this.scene.tweens.add({ targets: view.shadow, y: b.ys[row] + b.h * b.shadowY, duration: TIMING.bucketSlide, ease: 'Quad.Out' });
      this.scene.tweens.add({ targets: view.label, y: b.ys[row] + b.h * b.labelY, duration: TIMING.bucketSlide, ease: 'Quad.Out' });
      this.scene.tweens.add({ targets: view.lid, y: b.ys[row] + view.lidDy, duration: TIMING.bucketSlide, ease: 'Quad.Out' });
      if (bucket && this.isShown(bucket) && this.isTurn(row, bucket)) {
        // Its turn: the lid comes off once the bucket has slid into place.
        this.openLid(view, TIMING.bucketSlide);
      }
    }
    // A tween, not a timer, so it keeps pace with the slide when the scene fast-forwards its tweens.
    this.scene.tweens.addCounter({ from: 0, to: 1, duration: TIMING.bucketSlide, onComplete: () => {
      column.busy = false;
    } });
  }

  private place(view: BucketView, x: number, y: number): void {
    const b = LAYOUT.buckets;
    view.body.setPosition(x, y);
    view.body.zoom = 1;
    view.shadow.zoom = 1;
    view.lid.setVisible(false);
    view.lidClosed = false;
    view.shadow.setPosition(x, y + b.h * b.shadowY);
    view.glow.setPosition(x, y);
    view.glow.setVisible(false);
    view.label.setPosition(x, y + b.h * b.labelY);
  }

  /** Shows `bucket` in the view (or hides it), with its lid on when `lidClosed` (it waits for its turn). */
  private paint(view: BucketView, bucket: Bucket | undefined, lidClosed: boolean): void {
    const visible = !!bucket && this.isShown(bucket);
    view.lidClosed = false;
    view.body.setVisible(visible);
    view.shadow.setVisible(visible);
    view.label.setVisible(visible);
    view.glow.setVisible(false);
    view.lid.setVisible(false);
    view.shadow.setDepth(SHADOW_DEPTH);
    view.glow.setDepth(GLOW_DEPTH);
    view.body.setDepth(DEPTH.BUCKETS);
    if (!bucket) {
      return;
    }
    const b = LAYOUT.buckets;
    view.body.setTexture(this.art[bucket.color - 1]).setSize(b.w, b.h);
    view.body.zoom = 1;
    view.shadow.zoom = 1;
    view.label.alpha = 1;
    view.label.setText(this.shown(bucket));
    bucket.labelDirty = false;
    const lidKey = `${this.art[bucket.color - 1]}-lid`;
    if (lidClosed && visible && this.scene.textures.exists(lidKey)) {
      const size = artSize(this.scene, lidKey);
      view.lidDy = -b.h / 2 - LID_OVERLAP * ART_SCALE + size.h / 2;
      view.lid.setTexture(lidKey).setSize(size.w, size.h).setPosition(view.body.x, view.body.y + view.lidDy).setDepth(LID_DEPTH).setVisible(true);
      view.lid.alpha = 1;
      view.lid.angle = 0;
      view.lid.zoom = 1;
      view.lidClosed = true;
    }
  }

  private makeView(x: number, y: number): BucketView {
    const b = LAYOUT.buckets;
    const shadowSize = artSize(this.scene, 'bucket-shadow');
    const shadow = new DesignImage(this.registry, this.scene, 'bucket-shadow', x, y + b.h * b.shadowY, shadowSize.w, shadowSize.h).setDepth(SHADOW_DEPTH);
    const glowSize = artSize(this.scene, 'bucket-glow');
    const glow = new DesignImage(this.registry, this.scene, 'bucket-glow', x, y, glowSize.w, glowSize.h)
      .setDepth(GLOW_DEPTH)
      .setVisible(false);
    const body = new DesignImage(this.registry, this.scene, this.art[0], x, y, b.w, b.h).setDepth(DEPTH.BUCKETS);
    const lid = new DesignImage(this.registry, this.scene, this.art[0], x, y, b.w, b.h).setVisible(false);
    const label = new DesignText(this.registry, this.scene, x, y + b.h * b.labelY, '', {
      fontFamily: `${GAME_FONT}, "Arial Black", sans-serif`,
      size: b.label,
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setDepth(DEPTH.BUCKET_TEXT);
    return { shadow, glow, body, lid, label, lidClosed: false, lidDy: 0 };
  }

  private sparkle(x: number, y: number): void {
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / SPARKLE_COUNT + Math.random() * 0.5;
      const reach = 70 + Math.random() * 40;
      const size = 34 + Math.random() * 24;
      const s = new DesignImage(this.registry, this.scene, 'sparkle', x, y, size, size)
        .setDepth(DEPTH.BUCKET_SPARKLE)
        .setTint(SPARKLE_COLORS[i % SPARKLE_COLORS.length]);
      s.zoom = 0.3;
      this.scene.tweens.add({ targets: s, x: x + Math.cos(angle) * reach, y: y + Math.sin(angle) * reach, zoom: 1, angle: 120, duration: 380, ease: 'Cubic.Out' });
      this.scene.tweens.add({ targets: s, alpha: 0, zoom: 0.2, delay: 300, duration: 240, ease: 'Quad.In', onComplete: () => s.destroy() });
    }
  }
}

/** Display size of a storyboard art slot at ART_SCALE. */
function artSize(scene: Phaser.Scene, key: string): { w: number; h: number } {
  const frame = scene.textures.getFrame(key);
  return frame ? { w: frame.realWidth * ART_SCALE, h: frame.realHeight * ART_SCALE } : { w: LAYOUT.buckets.w, h: LAYOUT.buckets.h };
}
