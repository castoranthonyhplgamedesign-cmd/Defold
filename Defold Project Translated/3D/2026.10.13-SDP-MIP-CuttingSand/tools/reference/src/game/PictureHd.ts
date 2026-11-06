import Phaser from 'phaser';
import type { Rgb } from '../config';
import { DEPTH, LAYOUT, TIMING } from '../constants';
import { DesignImage, DesignRegistry } from '../utils/designNode';
import { WALL, type SandGrid } from './sandGrid';

/** Texture slot with the picture's look at a whole multiple of the grain grid's resolution. */
export const PICTURE_HD_KEY = 'sand-picture-hd';
const CANVAS_KEY = 'fx-sand-hd';
/**
 * Share of the painting's height that is its darkened bottom edge (12 of the storyboard painting's
 * 893 px): those pixels belong to the sand just above them, not to black sand.
 */
const SHADOW_SHARE = 12 / 893;
/** The painting is split into this many horizontal bands; only bands whose sand changed re-upload. */
const BANDS = 16;

type Band = { texture: Phaser.Textures.CanvasTexture; imageData: ImageData; y0: number; y1: number; dirty: boolean };

/**
 * The picture's static sand drawn from the storyboard sand painting (the `sand-picture-hd` slot, a
 * whole multiple of the grain grid), so it keeps the painting's texture and smooth edges instead of
 * stepping grain by grain. Each pixel belongs to a grain: its own grain when the colours match, else
 * the touching grain of its colour (only when the pixel itself has that colour too, so a pixel at a
 * corner where other colours meet stays with its own grain). It shows while that grain is static sand, or loose sand that has
 * not moved yet, so a tapped shape looks unchanged until its sand falls, and then takes exactly its
 * pixels with it; moving sand is drawn on the grain layer above. The painting is cut into BANDS
 * horizontal textures, and only the bands where sand left its place are redrawn and re-uploaded.
 */
export class PictureHd {
  private readonly bands: Band[] = [];
  private readonly nodes: DesignImage[] = [];
  private readonly pixels: Uint32Array;
  /** The painting, packed like `pixels`. */
  private readonly art: Uint32Array;
  /** The colours each pixel shows: `art`, or during the opening reveal the grey picture with the revealed part in colour. */
  private display: Uint32Array;
  /**
   * The opening reveal (startReveal): circle centre and radius in grains, growth per ms, the radius
   * that covers the picture, the time the first square is held (ms), the block size (grains), and
   * per row of blocks the revealed range of blocks [lo, hi] (lo > hi: none).
   */
  private reveal: { cx: number; cy: number; radius: number; speed: number; max: number; wait: number; hold: number; block: number; side: number; lo: Int32Array; hi: Int32Array } | null = null;
  private readonly owner: Int32Array;
  /** Redraw every band on the next update (shown again after the opening pour). */
  private allDirty = true;

  private constructor(
    scene: Phaser.Scene,
    registry: DesignRegistry,
    private readonly grid: SandGrid,
    private readonly hidden: Uint8Array,
    private readonly scale: number,
    private readonly width: number,
    private readonly height: number,
    art: Uint32Array,
    classes: Uint8Array,
    pixelClasses: Uint8Array,
    grain: number
  ) {
    this.art = art;
    this.display = art;
    this.owner = new Int32Array(width * height);
    this.assignOwners(classes, pixelClasses);

    const buffer = new ArrayBuffer(width * height * 4);
    this.pixels = new Uint32Array(buffer);
    const p = LAYOUT.picture;
    // Design px per painting px (the picture is drawn at its full size, band by band).
    const unitX = p.w / width;
    const unitY = (grid.pictureRows * grain) / height;
    const bandRows = Math.ceil(height / BANDS);
    for (let i = 0, y0 = 0; y0 < height; i++, y0 += bandRows) {
      const y1 = Math.min(height, y0 + bandRows);
      const key = `${CANVAS_KEY}-${i}`;
      if (scene.textures.exists(key)) {
        scene.textures.remove(key);
      }
      const texture = scene.textures.createCanvas(key, width, y1 - y0) as Phaser.Textures.CanvasTexture;
      texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      // The band's ImageData shares the picture's pixel buffer.
      const view = new Uint8ClampedArray(buffer, y0 * width * 4, (y1 - y0) * width * 4);
      const imageData = new ImageData(view, width, y1 - y0);
      this.bands.push({ texture, imageData, y0, y1, dirty: true });
      const h = (y1 - y0) * unitY;
      this.nodes.push(new DesignImage(registry, scene, key, p.x + (width * unitX) / 2, p.y + y0 * unitY + h / 2, width * unitX, h).setDepth(DEPTH.SAND));
    }
  }

  /**
   * Reads the `sand-picture-hd` slot; null (draw the picture grain by grain instead) when it is
   * missing or not a whole multiple of the grid.
   */
  static create(scene: Phaser.Scene, registry: DesignRegistry, grid: SandGrid, hidden: Uint8Array, palette: Rgb[], grain: number): PictureHd | null {
    if (!scene.textures.exists(PICTURE_HD_KEY)) {
      return null;
    }
    const source = scene.textures.get(PICTURE_HD_KEY).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const scale = source.width / grid.cols;
    if (!Number.isInteger(scale) || scale < 2 || source.height !== grid.pictureRows * scale) {
      return null;
    }
    const w = source.width;
    const h = source.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return null;
    }
    context.drawImage(source, 0, 0);
    const data = context.getImageData(0, 0, w, h).data;
    const art = new Uint32Array(data.slice().buffer);

    // Colour of each pixel for ownership: the nearest sand colour to its 3 × 3 average (the
    // painting's grain texture would otherwise read as specks of other colours). The darkened
    // bottom edge has no colour of its own: each of its pixels belongs to the grain under it (copying
    // the row above it instead left grains there that no pixel showed: sand that held loose sand up
    // where none was drawn).
    const lastRow = h - 1 - Math.round(SHADOW_SHARE * h);
    const classes = new Uint8Array(w * h);
    // The nearest sand colour to each pixel on its own (a pixel only joins a touching grain of the
    // colour it reads as when it has that colour itself).
    const nearest = (r: number, g: number, b: number): number => {
      let best = 0;
      let bestDistance = Infinity;
      for (let c = 0; c < palette.length; c++) {
        const distance = (r - palette[c][0]) ** 2 + (g - palette[c][1]) ** 2 + (b - palette[c][2]) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = c + 1;
        }
      }
      return best;
    };
    const pixelClasses = new Uint8Array(w * h);
    for (let q = 0; q < w * h; q++) {
      pixelClasses[q] = nearest(data[q * 4], data[q * 4 + 1], data[q * 4 + 2]);
    }
    for (let y = 0; y <= lastRow; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        let opaque = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = Math.min(lastRow, Math.max(0, y + dy));
          for (let dx = -1; dx <= 1; dx++) {
            const xx = Math.min(w - 1, Math.max(0, x + dx));
            const i = (yy * w + xx) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            opaque += data[i + 3] >= 128 ? 1 : 0;
            n++;
          }
        }
        if (opaque * 2 < n) {
          continue;
        }
        classes[y * w + x] = nearest(r / n, g / n, b / n);
      }
    }
    for (let y = lastRow + 1; y < h; y++) {
      const row = Math.floor(y / scale) * grid.cols;
      for (let x = 0; x < w; x++) {
        classes[y * w + x] = grid.cells[row + Math.floor(x / scale)];
        pixelClasses[y * w + x] = classes[y * w + x];
      }
    }
    return new PictureHd(scene, registry, grid, hidden, scale, w, h, art, classes, pixelClasses, grain);
  }

  /**
   * A pixel belongs to its own grain if the colours match, else (when the pixel itself has that
   * colour too) to the nearest touching grain of its colour.
   */
  private assignOwners(classes: Uint8Array, pixelClasses: Uint8Array): void {
    const { grid, scale, width, height } = this;
    const { cells, cols, pictureRows } = grid;
    for (let y = 0; y < height; y++) {
      const cy = Math.floor(y / scale);
      for (let x = 0; x < width; x++) {
        const cx = Math.floor(x / scale);
        const q = y * width + x;
        const own = cy * cols + cx;
        const color = classes[q];
        let owner = own;
        if (cells[own] !== color && pixelClasses[q] === color) {
          let bestDistance = Infinity;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx;
              const ny = cy + dy;
              if ((dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= cols || ny >= pictureRows) {
                continue;
              }
              const n = ny * cols + nx;
              if (cells[n] !== color) {
                continue;
              }
              const distance = ((nx + 0.5) * scale - x - 0.5) ** 2 + ((ny + 0.5) * scale - y - 0.5) ** 2;
              if (distance < bestDistance) {
                bestDistance = distance;
                owner = n;
              }
            }
          }
        }
        this.owner[q] = owner;
      }
    }
  }

  /**
   * Shown or hidden (hidden during the opening pour, whose settling grains the grain layer draws;
   * redrawing this large texture per settled grain would be too slow). Showing it redraws it.
   */
  setVisible(visible: boolean): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].setVisible(visible);
    }
    if (visible) {
      this.allDirty = true;
    }
  }

  /** The opening reveal is running. */
  get revealing(): boolean {
    return this.reveal !== null;
  }

  /**
   * Opening (as in the sand-shovel mock-up): the picture shows in grey (on its own for
   * TIMING.revealDelay ms), then turns to colour in blocks of TIMING.revealBlock grains: first a
   * square TIMING.revealSquare grains wide sitting on
   * (fx, fy) (fractions of the picture), held TIMING.revealHold ms, then a blocky circle around (fx,
   * fy) that covers the picture after `durationMs`. stepReveal() grows it.
   */
  startReveal(fx: number, fy: number, durationMs: number): void {
    const { art, grid } = this;
    const grey = new Uint32Array(art.length);
    for (let q = 0; q < art.length; q++) {
      const c = art[q];
      // A light grey: luminance lifted toward white (black sand reads as a mid grey).
      const l = Math.round(89 + 0.65 * (0.299 * (c & 255) + 0.587 * ((c >>> 8) & 255) + 0.114 * ((c >>> 16) & 255)));
      grey[q] = (c & 0xff000000) | (l << 16) | (l << 8) | l;
    }
    this.display = grey;
    const cols = grid.cols;
    const rows = grid.pictureRows;
    const block = Math.max(1, TIMING.revealBlock);
    const blockRows = Math.ceil(rows / block);
    const cx = fx * cols;
    const cy = fy * rows;
    const side = TIMING.revealSquare;
    const max = Math.hypot(Math.max(cx, cols - cx), Math.max(cy, rows - cy)) + block;
    const r0 = side * 0.75;
    const hold = TIMING.revealHold;
    this.reveal = {
      cx,
      cy,
      radius: r0,
      speed: (max - r0) / Math.max(1, durationMs - hold),
      max,
      wait: TIMING.revealDelay,
      hold,
      block,
      side,
      lo: new Int32Array(blockRows).fill(cols),
      hi: new Int32Array(blockRows).fill(-1)
    };
    this.allDirty = true;
    if (!(this.reveal.wait > 0)) {
      this.revealSquare();
    }
  }

  /** The reveal's first square: its bottom on the reveal point, centred across. */
  private revealSquare(): void {
    const rv = this.reveal;
    if (!rv) {
      return;
    }
    const { cx, cy, side, block } = rv;
    const bx0 = Math.round((cx - side / 2) / block);
    const bx1 = Math.round((cx + side / 2) / block) - 1;
    const by0 = Math.max(0, Math.round((cy - side) / block));
    const by1 = Math.min(rv.lo.length - 1, Math.round(cy / block) - 1);
    for (let by = by0; by <= by1; by++) {
      this.revealBlocks(by, Math.max(0, bx0), bx1);
    }
  }

  /** Grows the reveal by `deltaMs` (after the first square's hold): blocks inside the circle show their colour. */
  stepReveal(deltaMs: number): void {
    const rv = this.reveal;
    if (!rv) {
      return;
    }
    if (rv.wait > 0) {
      // The grey picture on its own first.
      rv.wait -= deltaMs;
      if (!(rv.wait > 0)) {
        this.revealSquare();
      }
      return;
    }
    if (rv.hold > 0) {
      rv.hold -= deltaMs;
      return;
    }
    rv.radius = Math.min(rv.max, rv.radius + rv.speed * Math.min(deltaMs, 50));
    const b = rv.block;
    const blockCols = Math.ceil(this.grid.cols / b);
    for (let by = 0; by < rv.lo.length; by++) {
      const dy = (by + 0.5) * b - rv.cy;
      const reach = rv.radius * rv.radius - dy * dy;
      if (reach <= 0) {
        continue;
      }
      const half = Math.sqrt(reach);
      const lo = Math.max(0, Math.ceil((rv.cx - half) / b - 0.5));
      const hi = Math.min(blockCols - 1, Math.floor((rv.cx + half) / b - 0.5));
      if (lo <= hi) {
        this.revealBlocks(by, lo, hi);
      }
    }
    if (rv.radius >= rv.max) {
      this.display = this.art;
      this.reveal = null;
      this.allDirty = true;
    }
  }

  /** Blocks [lo, hi] of block row `by` show their colour (the ones not shown yet); their bands redraw. */
  private revealBlocks(by: number, lo: number, hi: number): void {
    const rv = this.reveal;
    if (!rv) {
      return;
    }
    const oldLo = rv.lo[by];
    const oldHi = rv.hi[by];
    const had = oldLo <= oldHi;
    if (had && lo >= oldLo && hi <= oldHi) {
      return;
    }
    const { scale, width, bands, art, display } = this;
    const { cols, pictureRows } = this.grid;
    const b = rv.block;
    const gy0 = by * b;
    const gy1 = Math.min(pictureRows, gy0 + b);
    for (let bx = lo; bx <= hi; bx++) {
      if (had && bx >= oldLo && bx <= oldHi) {
        bx = oldHi;
        continue;
      }
      const gx1 = Math.min(cols, bx * b + b);
      for (let py = gy0 * scale; py < gy1 * scale; py++) {
        const row = py * width;
        for (let px = bx * b * scale; px < gx1 * scale; px++) {
          display[row + px] = art[row + px];
        }
      }
    }
    rv.lo[by] = had ? Math.min(lo, oldLo) : lo;
    rv.hi[by] = had ? Math.max(hi, oldHi) : hi;
    const y0 = gy0 * scale;
    const y1 = gy1 * scale;
    for (let i = 0; i < bands.length; i++) {
      if (bands[i].y0 < y1 && bands[i].y1 > y0) {
        bands[i].dirty = true;
      }
    }
  }

  /**
   * Per frame: redraw and upload the bands where sand left its place (a tap alone changes nothing
   * here: its sand still looks the same until it moves).
   */
  update(): void {
    const { grid, scale, bands } = this;
    const changed = grid.homeChangedRows;
    for (let r = 0; r < grid.pictureRows; r++) {
      if (!changed[r]) {
        continue;
      }
      changed[r] = 0;
      // A grain's pixels lie in its own row of cells or the rows beside it.
      const y0 = Math.max(0, (r - 1) * scale);
      const y1 = Math.min(this.height, (r + 2) * scale);
      for (let i = 0; i < bands.length; i++) {
        if (bands[i].y0 < y1 && bands[i].y1 > y0) {
          bands[i].dirty = true;
        }
      }
    }
    for (let i = 0; i < bands.length; i++) {
      const band = bands[i];
      if (!band.dirty && !this.allDirty) {
        continue;
      }
      band.dirty = false;
      for (let q = band.y0 * this.width; q < band.y1 * this.width; q++) {
        this.paint(q);
      }
      band.texture.context.putImageData(band.imageData, 0, 0);
      band.texture.refresh();
    }
    this.allDirty = false;
  }

  /** A pixel shows while its grain is static sand, or loose sand still in its own place. */
  private paint(q: number): void {
    const o = this.owner[q];
    const v = this.grid.cells[o];
    const there = (v > 0 && v !== WALL) || this.grid.home[o] === 1;
    this.pixels[q] = there && !this.hidden[o] ? this.display[q] : 0;
  }
}
