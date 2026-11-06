// Local diagnostic only. Run from the project root; no playable source is changed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { connect, launchBrowser, openPage, sleep } from './cdp-isolated.mjs';

process.env.QA_GPU = '1';
const outputDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outputDir, '../..');
const reportFile = path.join(outputDir, 'performance.json');
const report = {
  startedAt: new Date().toISOString(),
  context: 'Headless desktop Chromium, D3D11 requested, muted; CPU throttling is synthetic and is not a device benchmark.',
  viewport: { width: 390, height: 844, dpr: 2 },
  durationPerPhaseMs: 5000,
  samples: [],
  errors: []
};
let browser;
let cdp;
let shuttingDown = false;
const save = () => fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
const close = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  cdp?.close();
  if (browser) await browser.close();
};
// Includes browser setup, all four reloads, and cleanup in the wall-clock budget.
const deadlineTimer = setTimeout(async () => {
  report.errors.push('Stopped at the 85-second wall-clock deadline. Results may be partial.');
  report.finishedAt = new Date().toISOString();
  save();
  console.warn(report.errors.at(-1));
  await close();
  process.exit(1);
}, 85000);

const preload = `(() => {
  const value = {
    MUTE: true,
    OPENING_GAMEPLAY_ANIMATION: false,
    GAME_LENGTH: { timeLimit: 9999, clickLimit: 9999 }
  };
  Object.defineProperty(window, 'GAME_CONFIG', { configurable: true, get: () => value, set: () => {} });
  window.open = () => ({});
})();`;

const renderer = `(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return { error: 'No game canvas' };
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  if (!gl) return { renderer: 'No WebGL context (possibly Canvas renderer)', bitmap: [canvas.width, canvas.height] };
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    version: gl.getParameter(gl.VERSION),
    vendor: gl.getParameter(gl.VENDOR),
    renderer: gl.getParameter(gl.RENDERER),
    unmaskedVendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null,
    unmaskedRenderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null,
    bitmap: [canvas.width, canvas.height]
  };
})()`;

function startPhaseExpression() {
  return `(() => {
    const select = () => {
      const s = window.__SDP_STATE__;
      return s ? { frame: s.frame, state: s.state, ended: s.ended, endReason: s.endReason,
        counted: s.counted, remaining: s.remaining, loose: s.loose, funnel: s.funnel,
        beltLoad: s.beltLoad, bucketsDone: s.bucketsDone, muted: s.muted } : null;
    };
    const p = window.__QA_PERFORMANCE__ = {
      done: false, intervals: [], frameIntervals: [], stateStart: null, stateEnd: null,
      startedAt: null, elapsedMs: 0, frames: 0, longTasks: []
    };
    let observer;
    try {
      observer = new PerformanceObserver(list => {
        for (const e of list.getEntries()) p.longTasks.push(e.duration);
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {}
    let previous;
    let previousGameFrame;
    let previousGameAt;
    const tick = now => {
      if (p.startedAt === null) {
        p.startedAt = now;
        p.stateStart = select();
        previousGameFrame = p.stateStart?.frame;
        previousGameAt = now;
      } else {
        p.intervals.push(now - previous);
        const gameFrame = window.__SDP_STATE__?.frame;
        if (gameFrame !== previousGameFrame) {
          p.frameIntervals.push(now - previousGameAt);
          previousGameFrame = gameFrame;
          previousGameAt = now;
        }
      }
      previous = now;
      p.frames++;
      p.elapsedMs = now - p.startedAt;
      if (p.elapsedMs >= 5000) {
        p.stateEnd = select();
        p.done = true;
        observer?.disconnect();
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return true;
  })()`;
}

function stats(values) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const round = n => Math.round(n * 100) / 100;
  return {
    intervals: values.length,
    meanFps: round(1000 / mean),
    medianFps: round(1000 / median),
    meanIntervalMs: round(mean),
    medianIntervalMs: round(median),
    p95IntervalMs: round(sorted[Math.ceil(sorted.length * 0.95) - 1]),
    maximumIntervalMs: round(sorted.at(-1)),
    intervalsOver33_4Ms: values.filter(n => n > 33.4).length,
    intervalsOver50Ms: values.filter(n => n > 50).length,
    intervalsOver100Ms: values.filter(n => n > 100).length
  };
}

async function phase(page, label, mechanic) {
  await page.evaluate(startPhaseExpression());
  const started = Date.now();
  let actions = 0;
  for (;;) {
    const done = await page.evaluate('window.__QA_PERFORMANCE__?.done');
    if (done) break;
    if (Date.now() - started > 9000) throw new Error(`${label}: measurement did not finish in 9 seconds`);
    if (label === 'busy' && Date.now() - started < 4200) {
      const s = await page.state();
      if (s && !s.ended) {
        if (mechanic === 'cut' && s.targets.swipe) {
          const line = s.targets.swipe;
          await page.swipeDesign(line.x1, line.y1, line.x2, line.y2, 8, 16);
          actions++;
        } else if (mechanic === 'tap' && s.targets.right) {
          await page.tapDesign(s.targets.right.x, s.targets.right.y);
          actions++;
        }
      }
      await sleep(230);
    } else await sleep(150);
  }
  const raw = await page.evaluate('window.__QA_PERFORMANCE__');
  const heap = await cdp.send('Runtime.getHeapUsage').catch(error => ({ error: error.message }));
  return {
    phase: label,
    actualInputActions: actions,
    elapsedMs: Math.round(raw.elapsedMs),
    raf: stats(raw.intervals),
    // Published frame IDs are checked from rAF; this is a second, approximate game-loop measure.
    observedGameFrameIntervals: stats(raw.frameIntervals),
    gameFrameDelta: raw.stateEnd?.frame - raw.stateStart?.frame,
    gameFramesPerSecond: Math.round(((raw.stateEnd?.frame - raw.stateStart?.frame) * 1000 / raw.elapsedMs) * 100) / 100,
    longTasks: { count: raw.longTasks.length, totalMs: Math.round(raw.longTasks.reduce((a, b) => a + b, 0)), maximumMs: Math.round(Math.max(0, ...raw.longTasks)) },
    stateStart: raw.stateStart,
    stateEnd: raw.stateEnd,
    heap
  };
}

try {
  browser = await launchBrowser();
  cdp = await connect(browser.wsUrl);
  for (const mechanic of ['tap', 'cut']) {
    for (const cpuThrottleRate of [1, 4]) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottleRate });
      const concept = mechanic === 'tap' ? 'cuttingsand_default' : 'cuttingsand_swipe';
      const dir = path.join(root, 'dist', concept, '90seconds');
      const file = fs.readdirSync(dir).find(name => name.endsWith('_fb.html'));
      if (!file) throw new Error(`No 90seconds Facebook build in ${dir}`);
      const page = await openPage(cdp, {
        url: pathToFileURL(path.join(dir, file)).href,
        ...report.viewport, mobile: true, touch: true, preload
      });
      await page.waitFor(s => s.state === 'play' && s.mechanic === mechanic, 9000, `${mechanic} gameplay`);
      await sleep(250);
      const sample = { mechanic, concept, cpuThrottleRate, file: path.relative(root, path.join(dir, file)), renderer: await page.evaluate(renderer), phases: [] };
      report.samples.push(sample);
      sample.phases.push(await phase(page, 'idle', mechanic));
      // The busy phase starts with actual hinted input, then repeats inputs during sampling.
      sample.phases.push(await phase(page, 'busy', mechanic));
      sample.runtimeErrors = page.consoleErrors;
      save();
      console.log(JSON.stringify({ mechanic, cpuThrottleRate, renderer: sample.renderer.unmaskedRenderer,
        phases: sample.phases.map(p => ({ phase: p.phase, inputs: p.actualInputActions, raf: p.raf, gameFramesPerSecond: p.gameFramesPerSecond, endState: p.stateEnd?.state })) }));
    }
  }
} catch (error) {
  report.errors.push(error.stack || String(error));
  console.warn(error.stack || String(error));
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  save();
  await close();
  clearTimeout(deadlineTimer);
}
console.log(`Performance data: ${reportFile}`);
