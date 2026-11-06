import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../constants';

export interface ResponsiveMetrics {
  width: number;
  height: number;
  scale: number;
  offX: number;
  offY: number;
  dpr: number;
}

let metrics: ResponsiveMetrics = { width: DESIGN_WIDTH, height: DESIGN_HEIGHT, scale: 1, offX: 0, offY: 0, dpr: 1 };

export function updateMetrics(): ResponsiveMetrics {
  const viewport = window.visualViewport;
  const cssWidth = viewport?.width ?? window.innerWidth;
  const cssHeight = viewport?.height ?? window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const width = Math.round(cssWidth * dpr);
  const height = Math.round(cssHeight * dpr);
  const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  metrics = { width, height, scale, offX: (width - DESIGN_WIDTH * scale) / 2, offY: (height - DESIGN_HEIGHT * scale) / 2, dpr };
  return metrics;
}

export const sx = (x: number): number => metrics.offX + x * metrics.scale;
export const sy = (y: number): number => metrics.offY + y * metrics.scale;
export const sd = (value: number): number => value * metrics.scale;
export const ux = (x: number): number => (x - metrics.offX) / metrics.scale;
export const uy = (y: number): number => (y - metrics.offY) / metrics.scale;
export const getMetrics = (): ResponsiveMetrics => metrics;

export function bindResponsiveResize(game: Phaser.Game, relayout: () => void): () => void {
  let raf = 0;
  const resize = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const next = updateMetrics();
      game.scale.resize(next.width, next.height);
      relayout();
    });
  };
  window.addEventListener('resize', resize);
  window.visualViewport?.addEventListener('resize', resize);
  for (const delay of [100, 300, 600]) window.setTimeout(resize, delay);
  return () => {
    window.removeEventListener('resize', resize);
    window.visualViewport?.removeEventListener('resize', resize);
    cancelAnimationFrame(raf);
  };
}
