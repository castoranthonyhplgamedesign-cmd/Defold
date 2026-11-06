import type { BabylonRuntime } from './createEngine';

export function bindResponsiveResize(runtime: BabylonRuntime, onRelayout: () => void): void {
  let frame = 0;
  let settleTimers: number[] = [];

  const resize = () => {
    frame = 0;
    const { width, height } = runtime.canvas.getBoundingClientRect();
    if (document.hidden || width <= 0 || height <= 0) return;
    runtime.engine.resize();
    onRelayout();
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(resize);
  };

  // Mobile viewport/layout updates may finish after the orientation event.
  const settle = () => {
    for (const timer of settleTimers) window.clearTimeout(timer);
    schedule();
    settleTimers = [100, 300, 600].map((delay) => window.setTimeout(schedule, delay));
  };

  new ResizeObserver(schedule).observe(runtime.root);
  window.addEventListener('resize', settle);
  window.addEventListener('orientationchange', settle);
  window.screen.orientation?.addEventListener('change', settle);
  window.visualViewport?.addEventListener('resize', settle);
  window.addEventListener('pageshow', settle);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) settle();
  });
  settle();
}
