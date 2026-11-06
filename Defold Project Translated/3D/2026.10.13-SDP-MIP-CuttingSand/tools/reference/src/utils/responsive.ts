import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../constants';

export type ViewportSize = {
  width: number;
  height: number;
  dpr: number;
};

let viewW = DESIGN_WIDTH;
let viewH = DESIGN_HEIGHT;
let scale = 1;
let offX = 0;
let offY = 0;

/**
 * The fixed 1080×1920 composition is scaled uniformly and centred in the canvas, in both
 * portrait and landscape (s = min(viewW/1080, viewH/1920)). Only full-screen fills (background,
 * dims, flashes) use the raw canvas size.
 */
export function updateResponsive(width: number, height: number): void {
  viewW = Math.max(1, width);
  viewH = Math.max(1, height);
  scale = Math.min(viewW / DESIGN_WIDTH, viewH / DESIGN_HEIGHT);
  offX = (viewW - DESIGN_WIDTH * scale) / 2;
  offY = (viewH - DESIGN_HEIGHT * scale) / 2;
}

export function sx(x: number): number {
  return offX + x * scale;
}

export function sy(y: number): number {
  return offY + y * scale;
}

export function sd(v: number): number {
  return v * scale;
}

/** Inverse of sx/sy: canvas pixels → design coordinates. */
export function toDesign(x: number, y: number): { x: number; y: number } {
  return { x: (x - offX) / scale, y: (y - offY) / scale };
}

export function responsiveState() {
  return { viewW, viewH, scale, offX, offY };
}

export function getViewportSize(): ViewportSize {
  const viewport = window.visualViewport;
  const width = Math.max(1, Math.round(viewport?.width ?? window.innerWidth));
  const height = Math.max(1, Math.round(viewport?.height ?? window.innerHeight));
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  return { width, height, dpr };
}

export function viewportKey(viewport: ViewportSize): string {
  return `${viewport.width}:${viewport.height}:${viewport.dpr}`;
}

export function bindResponsiveResize(callback: () => void): () => void {
  let raf = 0;
  const run = () => {
    if (raf) {
      cancelAnimationFrame(raf);
    }
    raf = requestAnimationFrame(callback);
    window.setTimeout(callback, 100);
    window.setTimeout(callback, 300);
    window.setTimeout(callback, 600);
  };

  window.addEventListener('resize', run);
  window.addEventListener('orientationchange', run);
  window.visualViewport?.addEventListener('resize', run);

  return () => {
    window.removeEventListener('resize', run);
    window.removeEventListener('orientationchange', run);
    window.visualViewport?.removeEventListener('resize', run);
  };
}
