import Phaser from 'phaser';
import { FX_TEXTURES } from '../assets';
import type { Rgb } from '../config';
import { DEPTH, LAYOUT, TIMING } from '../constants';
import { DesignImage, DesignRegistry } from '../utils/designNode';
import { PictureHd } from './PictureHd';
import { BOTTOM_SHADE, TOP_SHADE, buildLut } from './sandColors';
import { SHADES, type SandGrid } from './sandGrid';

/** Soft shadow one grain below the picture's bottom row: black at 22 % (packed ABGR). */
const UNDER_SHADOW = (Math.round(0.22 * 255) << 24) >>> 0;

/** Plots one grain (packed colour) at a design-space point. */
export type Plot = (x: number, y: number, color: number) => void;

/** Anything else that draws grains into the sand canvas (the conveyor and its falling grains). */
export interface GrainLayer {
  draw(plot: Plot): void;
  readonly active: boolean;
}

export type SandViewOptions = {
  palette: Rgb[];
  grainShade: number;
  /** design px / s² */
  gravity: number;
};

/**
 * Draws all sand into one canvas texture (one pixel per grain, NEAREST filtered) shown as a single
 * image over the frame, the conveyor and the bucket openings: the grid's static and loose sand, the
 * opening pour, and the grains of other layers (the conveyor). No per-grain game objects. When the
 * sharper `sand-picture-hd` art is available, the picture's static sand is drawn by PictureHd under
 * this layer instead (smooth edges), and this layer keeps the moving sand.
 */
export class SandView {
  private hd: PictureHd | null = null;
  /** The painting layer draws the picture (false during the opening pour: this layer draws it then). */
  private hdLive = false;
  private texture?: Phaser.Textures.CanvasTexture;
  private node?: DesignImage;
  private imageData?: ImageData;
  private pixels?: Uint32Array;
  /** The static picture (and walls' gaps) drawn once per change; each frame starts from a copy. */
  private staticPixels?: Uint32Array;
  private staticVersion = -1;
  private readonly lut: Uint32Array;
  /** lut darkened for the picture's bottom rows (BOTTOM_SHADE, bottom row first) and top rows (TOP_SHADE). */
  private readonly bottomLuts: Uint32Array[];
  private readonly topLuts: Uint32Array[];
  private readonly canvasCols: number;
  private readonly canvasRows: number;
  /** Grid cell (0, 0) in canvas grains. */
  private readonly offsetX: number;
  private readonly offsetY: number;
  /** 1 while a picture cell's grain is still pouring in (the opening). */
  private readonly hidden: Uint8Array;

  // Opening pour: grains falling into their picture cells.
  private readonly px: Float32Array;
  private readonly py: Float32Array;
  private readonly pvy: Float32Array;
  private readonly pdelay: Float32Array;
  private readonly pcell: Int32Array;
  private pouring = 0;
  private gridDirty = true;
  private seed = 0x1badb;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly registry: DesignRegistry,
    private readonly grid: SandGrid,
    private readonly grain: number,
    private readonly layers: GrainLayer[],
    private readonly options: SandViewOptions
  ) {
    const area = LAYOUT.sandArea;
    this.canvasCols = Math.round(area.w / grain);
    this.canvasRows = Math.ceil((area.bottom - area.y) / grain);
    this.offsetX = Math.round((LAYOUT.picture.x - area.x) / grain);
    this.offsetY = Math.round((LAYOUT.picture.y - area.y) / grain);
    const { palette, grainShade } = options;
    this.lut = buildLut(palette, grainShade, 1);
    this.bottomLuts = BOTTOM_SHADE.map(brightness => buildLut(palette, grainShade, brightness));
    this.topLuts = TOP_SHADE.map(brightness => buildLut(palette, grainShade, brightness));
    const n = grid.cols * grid.pictureRows;
    this.hidden = new Uint8Array(n);
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.pvy = new Float32Array(n);
    this.pdelay = new Float32Array(n);
    this.pcell = new Int32Array(n);
  }

  create(): void {
    // Created first, so the grain layer (moving sand) draws over it at the same depth.
    this.hd = PictureHd.create(this.scene, this.registry, this.grid, this.hidden, this.options.palette, this.grain);
    this.hdLive = !!this.hd;
    if (this.scene.textures.exists(FX_TEXTURES.SAND)) {
      this.scene.textures.remove(FX_TEXTURES.SAND);
    }
    const texture = this.scene.textures.createCanvas(FX_TEXTURES.SAND, this.canvasCols, this.canvasRows);
    if (!texture) {
      return;
    }
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.texture = texture;
    this.imageData = texture.context.createImageData(this.canvasCols, this.canvasRows);
    this.pixels = new Uint32Array(this.imageData.data.buffer);
    this.staticPixels = new Uint32Array(this.pixels.length);
    const area = LAYOUT.sandArea;
    const w = this.canvasCols * this.grain;
    const h = this.canvasRows * this.grain;
    this.node = new DesignImage(this.registry, this.scene, FX_TEXTURES.SAND, area.x + w / 2, area.y + h / 2, w, h).setDepth(DEPTH.SAND);
    this.render();
  }

  /** Packed colour (ABGR) of a grain of palette value `color` and shade. */
  colorOf(color: number, shade: number): number {
    return this.lut[color * SHADES + (shade % SHADES)];
  }

  /** True once every grain of the opening pour has settled and the opening reveal has finished. */
  get introDone(): boolean {
    return this.pouring === 0 && !this.hd?.revealing;
  }

  /**
   * Opening (as in the sand-shovel mock-up): the painting shows in grey and turns to colour in a
   * growing circle (PictureHd.startReveal). False (nothing started) without the painting.
   */
  reveal(): boolean {
    if (!this.hd) {
      return false;
    }
    this.hd.startReveal(TIMING.revealFrom.x, TIMING.revealFrom.y, TIMING.revealMs);
    return true;
  }

  /** Marks the grid as changed (a tap) so the next frame redraws it. */
  invalidate(): void {
    this.gridDirty = true;
  }

  /**
   * Opening: every picture grain drops in from above the frame and settles into its place, bottom
   * rows first, so the picture pours in like sand filling the frame.
   */
  intro(): void {
    const { grid } = this;
    const cols = grid.cols;
    for (let p = 0; p < cols * grid.pictureRows; p++) {
      if (!grid.isStatic(p)) {
        continue;
      }
      const x = p % cols;
      const y = (p - x) / cols;
      const g = this.pouring++;
      this.px[g] = x;
      this.py[g] = -4 - this.random() * 40;
      this.pvy[g] = TIMING.introSpeed;
      this.pdelay[g] = (grid.pictureRows - 1 - y) * TIMING.introRow + this.random() * TIMING.introJitter;
      this.pcell[g] = p;
      this.hidden[p] = 1;
    }
    // The cached static layer must drop the now-hidden grains.
    this.staticVersion = -1;
    if (this.hd) {
      this.hdLive = false;
      this.hd.setVisible(false);
    }
    this.gridDirty = true;
  }

  /** Advances the opening pour and redraws when anything changed. `gridChanged`: loose sand moved. */
  update(deltaMs: number, gridChanged: boolean): void {
    this.hd?.stepReveal(deltaMs);
    // Checked before stepping, so the frame in which the last grain settles is still drawn.
    const pouring = this.pouring > 0;
    if (pouring) {
      this.stepPour(deltaMs);
    }
    let layersActive = false;
    for (let i = 0; i < this.layers.length; i++) {
      layersActive ||= this.layers[i].active;
    }
    if (gridChanged || this.gridDirty || pouring || layersActive || this.wasActive) {
      this.render();
      this.gridDirty = false;
    }
    this.hd?.update();
    // One more frame after the layers go quiet, to clear their last grains.
    this.wasActive = layersActive;
  }

  private wasActive = false;

  private stepPour(deltaMs: number): void {
    const dt = Math.min(deltaMs, 50) / 1000;
    const gravity = this.options.gravity / this.grain;
    const cols = this.grid.cols;
    for (let i = 0; i < this.pouring; i++) {
      if (this.pdelay[i] > 0) {
        this.pdelay[i] -= deltaMs;
        continue;
      }
      this.pvy[i] += gravity * dt;
      this.py[i] += this.pvy[i] * dt;
      const cell = this.pcell[i];
      if (this.py[i] >= (cell - (cell % cols)) / cols) {
        // Settled: it joins the cached static layer.
        this.hidden[cell] = 0;
        if (this.staticPixels) {
          this.paintStatic(this.staticPixels, cell);
        }
        const last = --this.pouring;
        this.px[i] = this.px[last];
        this.py[i] = this.py[last];
        this.pvy[i] = this.pvy[last];
        this.pdelay[i] = this.pdelay[last];
        this.pcell[i] = this.pcell[last];
        i--;
      }
    }
    if (this.pouring === 0 && this.hd && !this.hdLive) {
      // Poured: the painting takes over the picture; this layer drops its copy.
      this.hdLive = true;
      this.hd.setVisible(true);
      this.staticVersion = -1;
    }
  }

  /** Redraws the cached static layer (after a tap changed the picture). */
  private rebuildStatic(): void {
    const staticPixels = this.staticPixels;
    if (!staticPixels) {
      return;
    }
    staticPixels.fill(0);
    const { grid } = this;
    const n = grid.cols * grid.pictureRows;
    for (let p = 0; p < n; p++) {
      const v = grid.cells[p];
      if (v > 0 && v < 255 && !this.hidden[p]) {
        this.paintStatic(staticPixels, p);
      }
    }
    this.staticVersion = grid.staticVersion;
  }

  /**
   * Draws the static grain at picture cell p into the static layer, unless the painting layer draws
   * the picture. Without the painting, the picture's edges are shaded as in the mock-up: its last
   * rows darken (BOTTOM_SHADE) with a soft shadow one grain below them, and its first rows darken
   * under the frame (TOP_SHADE); only grains still there are shaded, so cleared sand takes its
   * shadow with it. (The painting and the container art carry their own shading.)
   */
  private paintStatic(staticPixels: Uint32Array, p: number): void {
    if (this.hdLive) {
      return;
    }
    const { grid, canvasCols } = this;
    const c = p % grid.cols;
    const r = (p - c) / grid.cols;
    const index = (r + this.offsetY) * canvasCols + c + this.offsetX;
    if (this.hd) {
      // The opening pour, before the painting takes over: plain colours.
      staticPixels[index] = this.lut[grid.cells[p] * SHADES + grid.shade[p]];
      return;
    }
    const fromBottom = grid.pictureRows - 1 - r;
    const lut =
      fromBottom < this.bottomLuts.length ? this.bottomLuts[fromBottom] : r < this.topLuts.length ? this.topLuts[r] : this.lut;
    staticPixels[index] = lut[grid.cells[p] * SHADES + grid.shade[p]];
    if (fromBottom === 0 && r + 1 + this.offsetY < this.canvasRows) {
      staticPixels[index + canvasCols] = UNDER_SHADOW;
    }
  }

  private render(): void {
    const pixels = this.pixels;
    if (!pixels || !this.staticPixels || !this.texture || !this.imageData) {
      return;
    }
    if (this.staticVersion !== this.grid.staticVersion) {
      this.rebuildStatic();
    }
    pixels.set(this.staticPixels);
    const { grid, canvasCols, lut } = this;
    const { cells, loose, looseShade, shade, cols, rows, rowLoose, home } = grid;
    // Loose sand still in its own place is drawn by the painting layer (it looks unchanged until it moves).
    const skipHome = this.hdLive;
    for (let r = 0; r < rows; r++) {
      if (rowLoose[r] === 0) {
        continue;
      }
      const rowStart = (r + this.offsetY) * canvasCols + this.offsetX;
      const cellStart = r * cols;
      for (let c = 0; c < cols; c++) {
        const v = loose[cellStart + c];
        if (v && !(skipHome && home[cellStart + c])) {
          pixels[rowStart + c] = lut[v * SHADES + looseShade[cellStart + c]];
        }
      }
    }
    for (let i = 0; i < this.pouring; i++) {
      if (this.pdelay[i] > 0 || this.py[i] < 0) {
        continue;
      }
      const cell = this.pcell[i];
      const x = this.px[i] + this.offsetX;
      const y = (this.py[i] | 0) + this.offsetY;
      if (y >= 0 && y < this.canvasRows) {
        pixels[y * canvasCols + x] = lut[cells[cell] * SHADES + shade[cell]];
      }
    }
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].draw(this.plot);
    }
    this.texture.context.putImageData(this.imageData, 0, 0);
    this.texture.refresh();
  }

  private readonly plot: Plot = (x, y, color) => {
    const area = LAYOUT.sandArea;
    const cx = Math.floor((x - area.x) / this.grain);
    const cy = Math.floor((y - area.y) / this.grain);
    if (cx >= 0 && cx < this.canvasCols && cy >= 0 && cy < this.canvasRows && this.pixels) {
      this.pixels[cy * this.canvasCols + cx] = color;
    }
  };

  private random(): number {
    let t = (this.seed = (this.seed + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
