import type { Rgb } from '../config';

/** Cell value of the funnel walls (never sand). */
export const WALL = 255;

/** Brightness variants per grain (per-grain shading; the renderer maps them to colours). */
export const SHADES = 8;

/**
 * One shape of static sand: a connected same-colour region, split from its neighbours where they
 * only touch through a thin neck (see SandGrid.segment). `cell` is a cell well inside the patch near its
 * centroid; `bottom` is a cell just inside its lowest part (where the hand hint points). `openBelow`:
 * some of its grains have empty space directly under them, so tapped sand falls straight away.
 * `drains`: that fall leads out of the picture (a path down or diagonally down through no static
 * sand to the funnel), so tapped sand reaches the belt now instead of waiting in a hole.
 */
export type Patch = { color: number; size: number; minRow: number; maxRow: number; minCol: number; maxCol: number; cell: number; bottom: number; openBelow: boolean; drains: boolean };

/** The hint aims this many grains up from a patch's lowest row (inside it, not on its edge). */
const BOTTOM_INSET = 3;

/** Rows below the picture: full width for straightRows, then narrowing over funnelRows to ±mouthHalf. */
export type FunnelShape = { straightRows: number; funnelRows: number; mouthHalf: number };

/** A grain reached the mouth: return true if it may leave (the conveyor has room). */
export type ExitHandler = (color: number, shade: number, col: number) => boolean;

/** A tapped patch prefers a target cell whose neighbours this many grains away are the same colour. */
const TARGET_INSET = 3;
/** Same-colour areas split into separate shapes where they narrow below 2 × NECK_RADIUS + 1 grains. */
const NECK_RADIUS = 2;
/** Shape cores smaller than this (specks where necks meet) don't start a shape of their own. */
const MIN_CORE = 16;
/**
 * Below the picture, a blocked grain keeps up to this speed (grains/s) instead of stopping, so sand
 * queued along the funnel's slopes keeps sliding toward the mouth instead of restarting from rest
 * behind every grain ahead of it (the slopes are shallower than sand's 45° and drained one grain at
 * a time).
 */
const FUNNEL_SLIDE = 90;
const BLOCKED = -1;
const EXITED = -2;

/**
 * The sand area as a grain grid (typed arrays, no Phaser): the picture on top and the funnel below
 * it, whose walls lead to a mouth at the bottom centre.
 *
 * Static sand is the picture. Tapping a patch turns it into loose sand; so does any static sand the
 * frame no longer holds (no path through static sand, moving only down or sideways, back to sand
 * touching the frame's top or side walls): floating clumps fall, per the GDD. Loose sand falls with simple falling-sand rules: down, else
 * diagonally down, and in the funnel also along the slope toward the mouth. It collides with static
 * sand, walls and other loose grains, so sand cut out of the middle stays in its hole until a path
 * opens below. Grains reaching the mouth leave through the ExitHandler.
 */
export class SandGrid {
  /** 0 empty, 1..n static sand (palette value), WALL. */
  readonly cells: Uint8Array;
  /** Per-cell grain shade of static sand. */
  readonly shade: Uint8Array;
  /** 0 none, else the palette value of a loose grain in this cell. */
  readonly loose: Uint8Array;
  readonly looseShade: Uint8Array;
  /**
   * 1 while the loose grain in a cell has not moved since it came loose (still in its own place in
   * the picture): it is drawn as part of the picture until it moves.
   */
  readonly home: Uint8Array;
  /** Rows where a grain left its place since the renderer last looked (it clears them). */
  readonly homeChangedRows: Uint8Array;
  /** Loose grains per row (rows with none are skipped when stepping and drawing). */
  readonly rowLoose: Int32Array;
  /** Bumped whenever static sand changes (the renderer caches the static layer). */
  staticVersion = 0;
  readonly total: number;
  /** Cells removed by the last cut: lastCut tapped, then lastDrop that lost their support. */
  lastCut = 0;
  lastDrop = 0;
  /** Grains that have left the picture (fallen below its bottom row). */
  exitedPicture = 0;
  /** Grains per palette value still in the grid, static or loose (index = palette value). */
  readonly colorCounts = new Int32Array(256);
  /** Grains per palette value the picture started with. */
  readonly startCounts = new Int32Array(256);
  /** Loose grains per palette value below the picture (in the funnel, on their way to the mouth). */
  readonly funnelCounts = new Int32Array(256);
  /** Grain moves inside the picture during the last step: sand visibly falling (sounds follow it). */
  movedInPicture = 0;

  private readonly vy: Float32Array;
  private readonly acc: Float32Array;
  private readonly delay: Float32Array;
  private readonly moved: Uint32Array;
  private readonly stack: Int32Array;
  private readonly scratch: Int32Array;
  private readonly visit: Uint32Array;
  /** Per picture cell: no static sand, and a grain there can fall (down or diagonally) out of the picture. */
  private readonly drain: Uint8Array;
  /** Per column: the highest row a swipe has cut from (cutBelow); no static sand is left from it down. */
  private readonly cutTop: Int32Array;
  /** Palette values a swipe may cut (setCuttable); null = every colour. */
  private cuttable: Uint8Array | null = null;
  /** crumbleLeftovers scratch: static grains per palette value, and the values that crumble. */
  private readonly leftCounts = new Int32Array(256);
  private readonly crumbling = new Uint8Array(256);
  /** Per picture cell: the shape (see segment()) its sand belongs to; a tap clears one shape. */
  private readonly region: Int32Array;
  private stamp = 0;
  private frame = 0;
  private staticCount = 0;
  private looseCount = 0;
  private loosePicture = 0;
  private readonly mouthFrom: number;
  private readonly mouthTo: number;
  /** Column order for funnel rows in step(), two variants (see the constructor). */
  private readonly funnelOrder: Int32Array[];
  private exitHandler?: ExitHandler;
  private seed = 0x5a17d;

  constructor(
    readonly cols: number,
    readonly pictureRows: number,
    readonly rows: number,
    cells: Uint8Array,
    funnel: FunnelShape
  ) {
    const n = cols * rows;
    this.cells = cells;
    this.shade = new Uint8Array(n);
    this.loose = new Uint8Array(n);
    this.looseShade = new Uint8Array(n);
    this.home = new Uint8Array(n);
    this.homeChangedRows = new Uint8Array(rows);
    this.rowLoose = new Int32Array(rows);
    this.vy = new Float32Array(n);
    this.acc = new Float32Array(n);
    this.delay = new Float32Array(n);
    this.moved = new Uint32Array(n);
    this.stack = new Int32Array(n);
    this.scratch = new Int32Array(n);
    this.visit = new Uint32Array(n);
    this.drain = new Uint8Array(cols * pictureRows);
    this.cutTop = new Int32Array(cols).fill(pictureRows);
    for (let p = 0; p < n; p++) {
      this.shade[p] = Math.floor(this.random() * SHADES);
      if (this.isStatic(p)) {
        this.staticCount++;
        this.colorCounts[cells[p]]++;
      }
    }
    this.total = this.staticCount;
    this.startCounts.set(this.colorCounts);

    // Funnel walls below the picture; the open cells of the bottom row are the mouth.
    let from = 0;
    let to = cols - 1;
    const centre = cols / 2;
    for (let r = pictureRows; r < rows; r++) {
      const k = r - pictureRows - funnel.straightRows;
      const t = k < 0 ? 0 : Math.min(1, (k + 1) / funnel.funnelRows);
      const half = centre + (funnel.mouthHalf - centre) * t;
      from = Math.floor(centre - half);
      to = Math.ceil(centre + half) - 1;
      for (let c = 0; c < cols; c++) {
        cells[r * cols + c] = c < from || c > to ? WALL : 0;
      }
    }
    this.mouthFrom = from;
    this.mouthTo = to;
    this.region = segmentShapes(cells, cols, pictureRows);

    // Funnel rows run from the middle outward (alternating sides, either side first), so a line of
    // grains sliding toward the mouth moves together: the grain nearest the mouth goes first.
    this.funnelOrder = [new Int32Array(cols), new Int32Array(cols)];
    for (let first = 0; first < 2; first++) {
      let left = Math.floor((cols - 1) / 2);
      let right = left + 1;
      for (let i = 0; i < cols; i++) {
        const takeLeft = right >= cols || (left >= 0 && (i & 1) === first);
        this.funnelOrder[first][i] = takeLeft ? left-- : right++;
      }
    }
  }

  /**
   * Reads a picture at `columns` grains across (nearest-neighbour resample, height keeps the aspect)
   * and adds the funnel below it. Each pixel becomes the nearest palette colour; transparent pixels
   * become empty cells.
   */
  static fromImage(source: HTMLImageElement | HTMLCanvasElement, palette: Rgb[], columns: number, funnel: (pictureRows: number) => FunnelShape): SandGrid {
    const cols = Math.max(1, Math.round(columns));
    const pictureRows = Math.max(1, Math.round((cols * source.height) / source.width));
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = pictureRows;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('2D canvas unavailable');
    }
    context.imageSmoothingEnabled = false;
    context.drawImage(source, 0, 0, cols, pictureRows);
    const data = context.getImageData(0, 0, cols, pictureRows).data;

    const shape = funnel(pictureRows);
    const rows = pictureRows + shape.straightRows + shape.funnelRows;
    const cells = new Uint8Array(cols * rows);
    for (let p = 0; p < cols * pictureRows; p++) {
      const i = p * 4;
      if (data[i + 3] < 128) {
        continue;
      }
      let best = 0;
      let bestDistance = Infinity;
      for (let c = 0; c < palette.length; c++) {
        const dr = data[i] - palette[c][0];
        const dg = data[i + 1] - palette[c][1];
        const db = data[i + 2] - palette[c][2];
        const distance = dr * dr + dg * dg + db * db;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = c;
        }
      }
      cells[p] = best + 1;
    }
    return new SandGrid(cols, pictureRows, rows, cells, shape);
  }

  isStatic(p: number): boolean {
    const v = this.cells[p];
    return v > 0 && v !== WALL;
  }

  /** Static grains left in the picture. */
  get remaining(): number {
    return this.staticCount;
  }

  /** Loose grains anywhere (falling, or resting in a hole or the funnel). */
  get looseTotal(): number {
    return this.looseCount;
  }

  /** Loose grains below the picture (in the funnel, waiting for the mouth). */
  get looseInFunnel(): number {
    return this.looseCount - this.loosePicture;
  }

  /** No sand at all left in the picture area. */
  get pictureEmpty(): boolean {
    return this.staticCount === 0 && this.loosePicture === 0;
  }

  /** The nearest static cell within `radius` grains of (col, row) in the picture, or -1 (fat-finger taps). */
  staticNear(col: number, row: number, radius: number): number {
    let best = -1;
    let bestDistance = Infinity;
    for (let dy = -radius; dy <= radius; dy++) {
      const r = row + dy;
      if (r < 0 || r >= this.pictureRows) {
        continue;
      }
      for (let dx = -radius; dx <= radius; dx++) {
        const c = col + dx;
        if (c < 0 || c >= this.cols) {
          continue;
        }
        const distance = dx * dx + dy * dy;
        const p = r * this.cols + c;
        if (distance <= radius * radius && distance < bestDistance && this.isStatic(p) && (!this.cuttable || this.cuttable[this.cells[p]])) {
          best = p;
          bestDistance = distance;
        }
      }
    }
    return best;
  }

  /**
   * Taps the patch containing `cell`: it turns into loose sand, crumbling outward from the tap
   * (each grain waits rippleMs per grain of distance from (tapCol, tapRow), plus up to jitterMs).
   * Then any static sand that lost its support turns loose too (within dropJitterMs).
   */
  cut(cell: number, tapCol: number, tapRow: number, rippleMs: number, jitterMs: number, dropJitterMs: number): void {
    this.lastCut = 0;
    this.lastDrop = 0;
    if (!this.isStatic(cell)) {
      return;
    }
    const { cells, cols, region, stack, visit, scratch } = this;
    const color = cells[cell];
    const shape = region[cell];
    const n = this.cols * this.pictureRows;
    const stamp = this.nextStamp();
    let sp = 0;
    let count = 0;
    stack[sp++] = cell;
    visit[cell] = stamp;
    while (sp > 0) {
      const p = stack[--sp];
      scratch[count++] = p;
      const x = p % cols;
      if (x > 0 && cells[p - 1] === color && region[p - 1] === shape && visit[p - 1] !== stamp) {
        visit[p - 1] = stamp;
        stack[sp++] = p - 1;
      }
      if (x < cols - 1 && cells[p + 1] === color && region[p + 1] === shape && visit[p + 1] !== stamp) {
        visit[p + 1] = stamp;
        stack[sp++] = p + 1;
      }
      if (p >= cols && cells[p - cols] === color && region[p - cols] === shape && visit[p - cols] !== stamp) {
        visit[p - cols] = stamp;
        stack[sp++] = p - cols;
      }
      if (p + cols < n && cells[p + cols] === color && region[p + cols] === shape && visit[p + cols] !== stamp) {
        visit[p + cols] = stamp;
        stack[sp++] = p + cols;
      }
    }
    for (let i = 0; i < count; i++) {
      const p = scratch[i];
      const x = p % cols;
      const distance = Math.hypot(x - tapCol, (p - x) / cols - tapRow);
      this.loosen(p, distance * rippleMs + this.random() * jitterMs);
    }
    this.lastCut = count;
    this.lastDrop = this.releaseUnsupported(dropJitterMs);
  }

  /**
   * Limits play to sand of these palette values (a level wave); null = every colour. Taps find only
   * that sand (staticNear), and swipes (cutBelow) cut only it, from the line down: sand of other
   * colours stays where it is (it can still fall if it loses its support), and below the finger it
   * stops the cut, so a swipe has to reach the playable sand.
   */
  setCuttable(colors: readonly number[] | null): void {
    if (colors) {
      this.cuttable = new Uint8Array(256);
      for (let i = 0; i < colors.length; i++) {
        this.cuttable[colors[i]] = 1;
      }
    } else {
      this.cuttable = null;
    }
    // Sand left standing under earlier cuts may be cuttable now.
    this.cutTop.fill(this.pictureRows);
  }

  /**
   * Cuts along a swiped line (Cutting Sand): `points` is a polyline in grid coordinates (x0, y0,
   * x1, y1, …; fractional, may run outside the picture). The finger cuts like a disc of radius
   * `reach` grains, and within `edgeSnap` grains of the picture's left or right edge, or `topSnap`
   * of its top (the frame's top bar hides its first rows), it reaches that edge (so no sliver is left
   * standing against the frame). In every column it covers, all static sand from the line down to
   * the bottom of the picture turns loose (within jitterMs); then any static sand that lost its
   * support turns loose too (within dropJitterMs). lastCut / lastDrop hold the grains released.
   * Points more than `reach` grains above the picture, or below it, cut nothing. Only colours
   * allowed by setCuttable are cut.
   */
  cutBelow(points: readonly number[], reach: number, edgeSnap: number, topSnap: number, jitterMs: number, dropJitterMs: number): void {
    this.lastCut = 0;
    this.lastDrop = 0;
    const { cols, pictureRows } = this;
    let count = 0;
    for (let i = 0; i + 3 < points.length; i += 2) {
      const x1 = points[i];
      const y1 = points[i + 1];
      const dx = points[i + 2] - x1;
      const dy = points[i + 3] - y1;
      // Sampled every half grain, so no column the segment crosses is skipped.
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) * 2));
      for (let s = 0; s <= steps; s++) {
        const c = Math.floor(x1 + (dx * s) / steps);
        const r = Math.floor(y1 + (dy * s) / steps);
        if (c < -reach || c >= cols + reach || r < -reach || r >= pictureRows) {
          continue;
        }
        let from = Math.max(0, c - reach);
        let to = Math.min(cols - 1, c + reach);
        if (from <= edgeSnap) {
          from = 0;
        }
        if (to >= cols - 1 - edgeSnap) {
          to = cols - 1;
        }
        for (let col = from; col <= to; col++) {
          // The disc's top and bottom edge in this column (a snapped column cuts from the line itself);
          // near the top it cuts from the top row.
          const off = col - c;
          const half = Math.abs(off) <= reach ? Math.floor(Math.sqrt(reach * reach - off * off)) : 0;
          count += this.cutColumn(col, r - half <= topSnap ? 0 : r - half, r + half, jitterMs);
        }
      }
    }
    this.lastCut = count;
    if (count > 0) {
      this.lastDrop = this.releaseUnsupported(dropJitterMs);
    }
  }

  /**
   * Static sand in column c from row `top` down turns loose; returns how many grains. With
   * setCuttable, only sand of those colours: other static sand under the finger (down to
   * `fingerBottom`) is passed over, but below the finger it stops the cut, so the line has to reach
   * the playable sand (a swipe over sand of a later wave cuts nothing under it).
   */
  private cutColumn(c: number, top: number, fingerBottom: number, jitterMs: number): number {
    const { cols, cutTop, cuttable } = this;
    if (top >= cutTop[c]) {
      return 0;
    }
    let count = 0;
    let row = top;
    for (; row < cutTop[c]; row++) {
      const p = row * cols + c;
      if (!this.isStatic(p)) {
        continue;
      }
      if (!cuttable || cuttable[this.cells[p]]) {
        this.loosen(p, this.random() * jitterMs);
        count++;
      } else if (row > fingerBottom) {
        break;
      }
    }
    // Everything cuttable from cutTop[c] down is already loose (static sand never comes back); a
    // blocked cut leaves sand below it, so the mark stays.
    if (row >= cutTop[c]) {
      cutTop[c] = top;
    }
    return count;
  }

  /**
   * GDD: only floating sand falls on its own. Static sand stays while the frame holds it: a path
   * through static sand, moving only down or sideways, from sand touching the frame's top or side
   * walls. Everything else (a clump left with nothing above or beside it) turns loose.
   */
  private releaseUnsupported(jitterMs: number): number {
    const { cols, pictureRows, stack, visit } = this;
    const stamp = this.nextStamp();
    let sp = 0;
    for (let c = 0; c < cols; c++) {
      if (this.isStatic(c)) {
        visit[c] = stamp;
        stack[sp++] = c;
      }
    }
    for (let r = 1; r < pictureRows; r++) {
      const left = r * cols;
      const right = left + cols - 1;
      if (this.isStatic(left)) {
        visit[left] = stamp;
        stack[sp++] = left;
      }
      if (right !== left && this.isStatic(right)) {
        visit[right] = stamp;
        stack[sp++] = right;
      }
    }
    while (sp > 0) {
      const p = stack[--sp];
      const x = p % cols;
      if (x > 0 && visit[p - 1] !== stamp && this.isStatic(p - 1)) {
        visit[p - 1] = stamp;
        stack[sp++] = p - 1;
      }
      if (x < cols - 1 && visit[p + 1] !== stamp && this.isStatic(p + 1)) {
        visit[p + 1] = stamp;
        stack[sp++] = p + 1;
      }
      const below = p + cols;
      if (below < cols * pictureRows && visit[below] !== stamp && this.isStatic(below)) {
        visit[below] = stamp;
        stack[sp++] = below;
      }
    }
    let dropped = 0;
    for (let p = 0; p < cols * pictureRows; p++) {
      if (this.isStatic(p) && visit[p] !== stamp) {
        this.loosen(p, this.random() * jitterMs);
        dropped++;
      }
    }
    return dropped;
  }

  /**
   * Leftovers: every colour in `colors` whose static sand in the picture is down to at most `share`
   * of what it started with (or `minGrains`, if that is more) turns loose (within jitterMs), then any
   * static sand that lost its support (within dropJitterMs). Stray grains and slivers the player can
   * hardly see or reach then can't keep their buckets from filling. Returns the grains released.
   */
  crumbleLeftovers(colors: readonly number[], share: number, minGrains: number, jitterMs: number, dropJitterMs: number): number {
    const { cells, leftCounts, crumbling } = this;
    const end = this.cols * this.pictureRows;
    leftCounts.fill(0);
    for (let p = 0; p < end; p++) {
      if (this.isStatic(p)) {
        leftCounts[cells[p]]++;
      }
    }
    crumbling.fill(0);
    let any = false;
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const left = leftCounts[color];
      if (left > 0 && left <= Math.max(minGrains, share * this.startCounts[color])) {
        crumbling[color] = 1;
        any = true;
      }
    }
    if (!any) {
      return 0;
    }
    let count = 0;
    for (let p = 0; p < end; p++) {
      if (this.isStatic(p) && crumbling[cells[p]]) {
        this.loosen(p, this.random() * jitterMs);
        count++;
      }
    }
    return count + this.releaseUnsupported(dropJitterMs);
  }

  private loosen(p: number, delayMs: number): void {
    this.loose[p] = this.cells[p];
    this.looseShade[p] = this.shade[p];
    this.cells[p] = 0;
    this.vy[p] = 0;
    this.acc[p] = 0;
    this.delay[p] = delayMs;
    this.staticCount--;
    this.looseCount++;
    this.loosePicture++;
    this.rowLoose[(p / this.cols) | 0]++;
    this.home[p] = 1;
    this.staticVersion++;
  }

  /** The loose grain at p was still in its own place in the picture; it has now left it. */
  private leaveHome(p: number): void {
    if (this.home[p]) {
      this.home[p] = 0;
      this.homeChangedRows[(p / this.cols) | 0] = 1;
    }
  }

  /**
   * Advances loose sand. `gravity` and `maxSpeed` are in grains/s² and grains/s. Grains at the mouth
   * leave through the exit handler. Returns true when any grain moved or left.
   */
  step(deltaMs: number, gravity: number, maxSpeed: number): boolean {
    if (this.looseCount === 0) {
      return false;
    }
    const dt = Math.min(deltaMs, 50) / 1000;
    const { cols, rows, loose } = this;
    const frame = ++this.frame;
    const flip = (frame & 1) === 1;
    const pictureEnd = cols * this.pictureRows;
    let changed = false;
    this.movedInPicture = 0;
    const order = this.funnelOrder[flip ? 1 : 0];
    // Bottom row first, so a falling clump moves together instead of blocking itself.
    for (let r = rows - 1; r >= 0; r--) {
      if (this.rowLoose[r] === 0) {
        continue;
      }
      const inFunnel = r >= this.pictureRows;
      for (let i = 0; i < cols; i++) {
        let p = r * cols + (inFunnel ? order[i] : flip ? cols - 1 - i : i);
        if (!loose[p] || this.moved[p] === frame) {
          continue;
        }
        if (this.delay[p] > 0) {
          this.delay[p] -= deltaMs;
          continue;
        }
        let v = Math.min(maxSpeed, this.vy[p] + gravity * dt);
        let a = this.acc[p] + v * dt;
        let steps = Math.floor(a);
        a -= steps;
        while (steps-- > 0) {
          const q = this.target(p);
          if (q === EXITED) {
            this.removeLoose(p);
            changed = true;
            p = -1;
            break;
          }
          if (q === BLOCKED) {
            v = p >= pictureEnd ? Math.min(v, FUNNEL_SLIDE) : 0;
            a = 0;
            break;
          }
          this.moveLoose(p, q);
          p = q;
          changed = true;
        }
        if (p >= 0) {
          this.vy[p] = v;
          this.acc[p] = a;
          this.moved[p] = frame;
        }
      }
    }
    return changed;
  }

  /** Where the loose grain at p moves next: below, diagonally below, or (in the funnel) toward the mouth. */
  private target(p: number): number {
    const { cols, rows } = this;
    const c = p % cols;
    const r = (p - c) / cols;
    if (r === rows - 1) {
      if (c >= this.mouthFrom && c <= this.mouthTo && this.exitHandler?.(this.loose[p], this.looseShade[p], c)) {
        return EXITED;
      }
      return BLOCKED;
    }
    const below = p + cols;
    if (this.free(below)) {
      return below;
    }
    // No squeezing diagonally between two solid cells (static sand or wall) that touch only at a
    // corner, below the grain and beside it: sand would leak through closed blocks one grain at a time.
    const pinched = this.cells[below] !== 0;
    const leftFirst = this.random() < 0.5;
    const s1 = leftFirst ? -1 : 1;
    if ((leftFirst ? c > 0 : c < cols - 1) && this.free(below + s1) && !(pinched && this.cells[p + s1] !== 0)) {
      return below + s1;
    }
    if ((leftFirst ? c < cols - 1 : c > 0) && this.free(below - s1) && !(pinched && this.cells[p - s1] !== 0)) {
      return below - s1;
    }
    if (r >= this.pictureRows) {
      // On the funnel slope: slide toward the mouth.
      const side = c < cols / 2 ? p + 1 : p - 1;
      if (this.free(side)) {
        return side;
      }
    }
    return BLOCKED;
  }

  /** QA diagnostics: palette values of the loose grains in the mouth cells (0 = empty cell). */
  debugMouth(): number[] {
    const out: number[] = [];
    const base = (this.rows - 1) * this.cols;
    for (let c = this.mouthFrom; c <= this.mouthTo; c++) {
      out.push(this.loose[base + c]);
    }
    return out;
  }

  /** Sets where grains go when they leave through the mouth. */
  setExitHandler(handler: ExitHandler): void {
    this.exitHandler = handler;
  }

  private free(q: number): boolean {
    return this.cells[q] === 0 && this.loose[q] === 0;
  }

  private moveLoose(p: number, q: number): void {
    if (p < this.cols * this.pictureRows) {
      this.movedInPicture++;
    }
    this.leaveHome(p);
    this.loose[q] = this.loose[p];
    this.looseShade[q] = this.looseShade[p];
    this.loose[p] = 0;
    this.rowLoose[(p / this.cols) | 0]--;
    this.rowLoose[(q / this.cols) | 0]++;
    const pictureEnd = this.cols * this.pictureRows;
    if (p < pictureEnd && q >= pictureEnd) {
      this.loosePicture--;
      this.exitedPicture++;
      this.funnelCounts[this.loose[q]]++;
    }
  }

  private removeLoose(p: number): void {
    this.leaveHome(p);
    this.colorCounts[this.loose[p]]--;
    if (p < this.cols * this.pictureRows) {
      this.loosePicture--;
      this.exitedPicture++;
    } else {
      this.funnelCounts[this.loose[p]]--;
    }
    this.loose[p] = 0;
    this.looseCount--;
    this.rowLoose[(p / this.cols) | 0]--;
  }

  /** Every static patch (shape, see segment()) in the picture (one flood pass; call once per change, not per frame). */
  patches(): Patch[] {
    const out: Patch[] = [];
    const { cells, cols, region, stack, visit, scratch } = this;
    const n = cols * this.pictureRows;
    this.computeDrain();
    const stamp = this.nextStamp();
    for (let start = 0; start < n; start++) {
      if (!this.isStatic(start) || visit[start] === stamp) {
        continue;
      }
      const color = cells[start];
      const shape = region[start];
      let sp = 0;
      let count = 0;
      let sumX = 0;
      let sumY = 0;
      let minRow = this.pictureRows;
      let maxRow = 0;
      let minCol = cols;
      let maxCol = 0;
      let openBelow = false;
      let drains = false;
      stack[sp++] = start;
      visit[start] = stamp;
      while (sp > 0) {
        const p = stack[--sp];
        scratch[count++] = p;
        const x = p % cols;
        const y = (p - x) / cols;
        sumX += x;
        sumY += y;
        if (y < minRow) minRow = y;
        if (y > maxRow) maxRow = y;
        if (x < minCol) minCol = x;
        if (x > maxCol) maxCol = x;
        if (!openBelow && cells[p + cols] === 0 && !this.loose[p + cols]) openBelow = true;
        if (!drains && this.fallsOut(p)) drains = true;
        if (x > 0 && cells[p - 1] === color && region[p - 1] === shape && visit[p - 1] !== stamp) {
          visit[p - 1] = stamp;
          stack[sp++] = p - 1;
        }
        if (x < cols - 1 && cells[p + 1] === color && region[p + 1] === shape && visit[p + 1] !== stamp) {
          visit[p + 1] = stamp;
          stack[sp++] = p + 1;
        }
        if (p >= cols && cells[p - cols] === color && region[p - cols] === shape && visit[p - cols] !== stamp) {
          visit[p - cols] = stamp;
          stack[sp++] = p - cols;
        }
        if (p + cols < n && cells[p + cols] === color && region[p + cols] === shape && visit[p + cols] !== stamp) {
          visit[p + cols] = stamp;
          stack[sp++] = p + cols;
        }
      }
      out.push({
        color,
        size: count,
        minRow,
        maxRow,
        minCol,
        maxCol,
        cell: this.innerCell(count, sumX / count, sumY / count, color),
        bottom: this.bottomCell(count, maxRow, color),
        openBelow,
        drains
      });
    }
    return out;
  }

  /** Bottom-up: which picture cells hold no static sand and let a grain fall out of the picture. */
  private computeDrain(): void {
    const { cells, drain } = this;
    for (let p = this.cols * this.pictureRows - 1; p >= 0; p--) {
      drain[p] = cells[p] === 0 && this.fallsOut(p) ? 1 : 0;
    }
  }

  /**
   * A grain at picture cell p can move down or diagonally down onto a draining cell, or into the
   * funnel. A diagonal step between two solid cells touching at a corner is closed, as in target();
   * cells of p's own shape count as open (a tap turns them loose with p).
   */
  private fallsOut(p: number): boolean {
    const { cells, cols, drain, region } = this;
    const x = p % cols;
    const below = p + cols;
    if (below >= cols * this.pictureRows) {
      return cells[below] !== WALL || (x > 0 && cells[below - 1] !== WALL) || (x < cols - 1 && cells[below + 1] !== WALL);
    }
    if (drain[below] === 1) {
      return true;
    }
    const own = cells[p];
    const solid = (q: number): boolean => cells[q] !== 0 && !(own !== 0 && cells[q] === own && region[q] === region[p]);
    const pinched = solid(below);
    return (x > 0 && drain[below - 1] === 1 && !(pinched && solid(p - 1))) || (x < cols - 1 && drain[below + 1] === 1 && !(pinched && solid(p + 1)));
  }

  /**
   * A cell in the patch's lowest part (listed in scratch[0..count)): BOTTOM_INSET rows above its
   * lowest row, centred on that bottom band, preferring cells with the same colour around them.
   */
  private bottomCell(count: number, maxRow: number, color: number): number {
    const { cells, cols, scratch } = this;
    const band = maxRow - BOTTOM_INSET * 2;
    let sumX = 0;
    let inBand = 0;
    for (let i = 0; i < count; i++) {
      const p = scratch[i];
      if ((p - (p % cols)) / cols >= band) {
        sumX += p % cols;
        inBand++;
      }
    }
    const cx = inBand ? sumX / inBand : 0;
    const cy = maxRow - BOTTOM_INSET;
    let best = scratch[0];
    let bestScore = Infinity;
    for (let i = 0; i < count; i++) {
      const p = scratch[i];
      const x = p % cols;
      const y = (p - x) / cols;
      const inset = x >= 2 && x < cols - 2 && y >= 2 && cells[p - 2] === color && cells[p + 2] === color && cells[p - 2 * cols] === color;
      const score = (x - cx) * (x - cx) + (y - cy) * (y - cy) * 4 + (inset ? 0 : 1e6);
      if (score < bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  }

  /** The patch cell (listed in scratch[0..count)) nearest the centroid, preferring cells away from its edge. */
  private innerCell(count: number, cx: number, cy: number, color: number): number {
    const { cells, cols, scratch } = this;
    let best = scratch[0];
    let bestScore = Infinity;
    for (let i = 0; i < count; i++) {
      const p = scratch[i];
      const x = p % cols;
      const y = (p - x) / cols;
      const inset =
        x >= TARGET_INSET && x < cols - TARGET_INSET && y >= TARGET_INSET && y < this.pictureRows - TARGET_INSET &&
        cells[p - TARGET_INSET] === color && cells[p + TARGET_INSET] === color &&
        cells[p - TARGET_INSET * cols] === color && cells[p + TARGET_INSET * cols] === color;
      const score = (x - cx) * (x - cx) + (y - cy) * (y - cy) + (inset ? 0 : 1e6);
      if (score < bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  }

  private nextStamp(): number {
    this.stamp++;
    if (this.stamp >= 0xffffffff) {
      this.visit.fill(0);
      this.stamp = 1;
    }
    return this.stamp;
  }

  /** Deterministic PRNG (mulberry32): the same grain shading every session. */
  private random(): number {
    let t = (this.seed = (this.seed + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

/**
 * Splits the picture's same-colour areas into shapes (a shape id per picture cell, 0 = no sand):
 * downsampled to grains, separate shapes of the art often touch through a sliver a grain or two
 * wide, and a tap should clear only the shape it hits. Cores (cells whose whole
 * (2·NECK_RADIUS+1)² neighbourhood inside the picture is their colour) are labelled, specks under
 * MIN_CORE dropped, then grown breadth-first through their colour so each cell joins the nearest
 * core; an area with no core is one shape. Pieces split apart this way are joined again where a
 * neck is as wide as the core square or the necks form a loop (see joinRings), so a diagonal band
 * or a ring split at its thin sides stays one shape.
 */
export function segmentShapes(cells: Uint8Array, cols: number, pictureRows: number): Int32Array {
  const n = cols * pictureRows;
  const region = new Int32Array(n);
  const stack = new Int32Array(n);
  const queue = new Int32Array(n);
  const isSand = (p: number): boolean => cells[p] > 0 && cells[p] !== WALL;
  const neighbours = (p: number, f: (q: number) => void): void => {
    const x = p % cols;
    if (x > 0) f(p - 1);
    if (x < cols - 1) f(p + 1);
    if (p >= cols) f(p - cols);
    if (p + cols < n) f(p + cols);
  };

  const core = new Uint8Array(n);
  for (let p = 0; p < n; p++) {
    if (!isSand(p)) {
      continue;
    }
    const x = p % cols;
    const y = (p - x) / cols;
    let inside = true;
    for (let dy = -NECK_RADIUS; dy <= NECK_RADIUS && inside; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= pictureRows) {
        continue;
      }
      for (let dx = -NECK_RADIUS; dx <= NECK_RADIUS; dx++) {
        const xx = x + dx;
        if (xx >= 0 && xx < cols && cells[yy * cols + xx] !== cells[p]) {
          inside = false;
          break;
        }
      }
    }
    core[p] = inside ? 1 : 0;
  }

  let next = 1;
  for (let s = 0; s < n; s++) {
    if (!core[s] || region[s]) {
      continue;
    }
    const id = next++;
    let sp = 0;
    let count = 0;
    stack[sp++] = s;
    region[s] = id;
    while (sp > 0) {
      const p = stack[--sp];
      queue[count++] = p;
      neighbours(p, q => {
        if (core[q] && !region[q] && cells[q] === cells[p]) {
          region[q] = id;
          stack[sp++] = q;
        }
      });
    }
    if (count < MIN_CORE) {
      for (let i = 0; i < count; i++) {
        region[queue[i]] = 0;
      }
    }
  }

  // Breadth-first from every core at once, so each cell joins its nearest core.
  let tail = 0;
  for (let p = 0; p < n; p++) {
    if (region[p]) {
      queue[tail++] = p;
    }
  }
  for (let head = 0; head < tail; head++) {
    const p = queue[head];
    neighbours(p, q => {
      if (!region[q] && isSand(q) && cells[q] === cells[p]) {
        region[q] = region[p];
        queue[tail++] = q;
      }
    });
  }

  for (let s = 0; s < n; s++) {
    if (region[s] || !isSand(s)) {
      continue;
    }
    const id = next++;
    let sp = 0;
    stack[sp++] = s;
    region[s] = id;
    while (sp > 0) {
      const p = stack[--sp];
      neighbours(p, q => {
        if (!region[q] && isSand(q) && cells[q] === cells[p]) {
          region[q] = id;
          stack[sp++] = q;
        }
      });
    }
  }

  joinRings(region, cells, cols, pictureRows, next);
  return region;
}

/**
 * Joins pieces of one colour that are one shape after all. Each neck (a connected stretch of border
 * between two same-colour pieces) is an edge between them. A neck that is a bridge (removing it
 * cuts the pieces apart) and narrower than the core square (2·NECK_RADIUS+1 cells along the border)
 * separates two shapes touching through a sliver, and stays a split. A wider neck is a band running
 * diagonally (the square does not fit across it, though the band is as wide), and the pieces joined
 * by any other neck lie on a cycle (a ring split at its thin sides, or two pieces touching in two
 * places); both become one shape. `ids` is one past the largest shape id.
 */
function joinRings(region: Int32Array, cells: Uint8Array, cols: number, rows: number, ids: number): void {
  const n = cols * rows;
  // Cells on both sides of each border between two pieces of one colour, per pair of pieces.
  const borders = new Map<number, number[]>();
  for (let p = 0; p < n; p++) {
    const a = region[p];
    if (!a) {
      continue;
    }
    const x = p % cols;
    for (const q of [x < cols - 1 ? p + 1 : -1, p + cols < n ? p + cols : -1]) {
      const b = q < 0 ? 0 : region[q];
      if (!b || b === a || cells[q] !== cells[p]) {
        continue;
      }
      const key = a < b ? a * ids + b : b * ids + a;
      let list = borders.get(key);
      if (!list) {
        list = [];
        borders.set(key, list);
      }
      list.push(p, q);
    }
  }

  // One edge per neck: a group of touching (8-connected) border cells. Its width is its cell count
  // on the wider side.
  const edges: [number, number][] = [];
  const wide: boolean[] = [];
  for (const [key, list] of borders) {
    const a = Math.floor(key / ids);
    const b = key % ids;
    const border = new Set(list);
    const seen = new Set<number>();
    for (const start of border) {
      if (seen.has(start)) {
        continue;
      }
      let sideA = 0;
      let sideB = 0;
      const open = [start];
      seen.add(start);
      while (open.length) {
        const p = open.pop() as number;
        if (region[p] === a) {
          sideA++;
        } else {
          sideB++;
        }
        const x = p % cols;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const q = p + dy * cols + dx;
            if (x + dx >= 0 && x + dx < cols && border.has(q) && !seen.has(q)) {
              seen.add(q);
              open.push(q);
            }
          }
        }
      }
      edges.push([a, b]);
      wide.push(Math.max(sideA, sideB) >= 2 * NECK_RADIUS + 1);
    }
  }
  if (!edges.length) {
    return;
  }

  // Bridges (Tarjan); every other neck joins its two pieces.
  const links: number[][] = Array.from({ length: ids }, () => []);
  edges.forEach(([a, b], i) => {
    links[a].push(i);
    links[b].push(i);
  });
  const found = new Int32Array(ids).fill(-1);
  const low = new Int32Array(ids);
  const bridge = new Uint8Array(edges.length);
  let time = 0;
  const visit = (u: number, via: number): void => {
    found[u] = low[u] = time++;
    for (const e of links[u]) {
      if (e === via) {
        continue;
      }
      const v = edges[e][0] === u ? edges[e][1] : edges[e][0];
      if (found[v] < 0) {
        visit(v, e);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > found[u]) {
          bridge[e] = 1;
        }
      } else {
        low[u] = Math.min(low[u], found[v]);
      }
    }
  };
  for (let u = 1; u < ids; u++) {
    if (found[u] < 0 && links[u].length) {
      visit(u, -1);
    }
  }
  const parent = new Int32Array(ids);
  for (let i = 0; i < ids; i++) {
    parent[i] = i;
  }
  const root = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  edges.forEach(([a, b], i) => {
    if (!bridge[i] || wide[i]) {
      parent[root(a)] = root(b);
    }
  });
  for (let p = 0; p < n; p++) {
    if (region[p]) {
      region[p] = root(region[p]);
    }
  }
}
