import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../constants';

export type ResponsiveMetrics = {
  viewW: number;
  viewH: number;
  dpr: number;
  scale: number;
  offX: number;
  offY: number;
  canvasW: number;
  canvasH: number;
};

type ResizableGame = {
  canvas?: HTMLCanvasElement;
  scale: {
    resize: (width: number, height: number) => void;
  };
};

let metrics: ResponsiveMetrics = computeMetrics();

function readViewport() {
  const viewport = window.visualViewport;
  const viewW = Math.max(1, Math.round(viewport?.width ?? window.innerWidth));
  const viewH = Math.max(1, Math.round(viewport?.height ?? window.innerHeight));
  return { viewW, viewH };
}

function computeMetrics(): ResponsiveMetrics {
  const { viewW, viewH } = readViewport();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const scale = Math.min(viewW / DESIGN_WIDTH, viewH / DESIGN_HEIGHT);
  const offX = (viewW - DESIGN_WIDTH * scale) / 2;
  const offY = (viewH - DESIGN_HEIGHT * scale) / 2;

  return {
    viewW,
    viewH,
    dpr,
    scale,
    offX,
    offY,
    canvasW: Math.max(1, Math.round(viewW * dpr)),
    canvasH: Math.max(1, Math.round(viewH * dpr)),
  };
}

export function refreshResponsiveMetrics(): boolean {
  const next = computeMetrics();
  const changed =
    next.viewW !== metrics.viewW ||
    next.viewH !== metrics.viewH ||
    next.dpr !== metrics.dpr ||
    next.canvasW !== metrics.canvasW ||
    next.canvasH !== metrics.canvasH;

  metrics = next;
  return changed;
}

export function getResponsiveMetrics(): ResponsiveMetrics {
  return metrics;
}

export function applyResponsiveResize(game: ResizableGame): void {
  refreshResponsiveMetrics();
  game.scale.resize(metrics.canvasW, metrics.canvasH);

  if (game.canvas) {
    game.canvas.style.width = `${metrics.viewW}px`;
    game.canvas.style.height = `${metrics.viewH}px`;
  }
}

export function bindResponsiveResize(game: ResizableGame, onResize: () => void): () => void {
  let frame = 0;
  const retryDelays = [100, 300, 600];

  const run = () => {
    frame = 0;
    applyResponsiveResize(game);
    onResize();
  };

  const schedule = () => {
    if (frame === 0) {
      frame = window.requestAnimationFrame(run);
    }

    for (let index = 0; index < retryDelays.length; index += 1) {
      window.setTimeout(run, retryDelays[index]);
    }
  };

  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);

  return () => {
    if (frame !== 0) {
      window.cancelAnimationFrame(frame);
    }

    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('scroll', schedule);
  };
}

export function pollResponsiveResize(game: ResizableGame, onResize: () => void): void {
  if (refreshResponsiveMetrics()) {
    game.scale.resize(metrics.canvasW, metrics.canvasH);

    if (game.canvas) {
      game.canvas.style.width = `${metrics.viewW}px`;
      game.canvas.style.height = `${metrics.viewH}px`;
    }

    onResize();
  }
}

export function sx(value: number): number {
  return (metrics.offX + value * metrics.scale) * metrics.dpr;
}

export function sy(value: number): number {
  return (metrics.offY + value * metrics.scale) * metrics.dpr;
}

export function sd(value: number): number {
  return value * metrics.scale * metrics.dpr;
}

export function screenDeltaToDesign(delta: number, viewZoom = 1): number {
  return delta / Math.max(0.001, metrics.scale * metrics.dpr * viewZoom);
}
