// Minimal headless Chrome/Edge driver over the DevTools protocol (no extra dependencies).
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function findBrowser() {
  for (const candidate of BROWSERS) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // next
    }
  }
  throw new Error('Chrome or Edge was not found.');
}

async function waitForTarget(profile) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      // Read this browser's assigned port instead of attaching to another run's random port.
      const activePort = await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8');
      const port = Number(activePort.split(/\r?\n/)[0]);
      if (!(port > 0 && port <= 65535)) throw new Error('Debug port not ready');
      const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1500) });
      const targets = await response.json();
      const page = targets.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // not up yet
    }
    await sleep(120);
  }
  throw new Error('Timed out waiting for the DevTools target.');
}

export async function launchBrowser() {
  const executable = await findBrowser();
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'sdp-qa-'));
  // QA_GPU=1 renders with the machine's GPU (closer to device performance); default is SwiftShader.
  const gl = process.env.QA_GPU === '1'
    ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist']
    : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
  const child = spawn(executable, [
    '--headless=new',
    // QA browsers are always silent (audio unlocks on the first test tap otherwise).
    '--mute-audio',
    ...gl,
    '--disable-background-networking',
    '--disable-extensions',
    '--no-first-run',
    '--autoplay-policy=no-user-gesture-required',
    '--allow-file-access-from-files',
    '--remote-allow-origins=*',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore', windowsHide: true });
  const close = async () => {
    child.kill();
    await sleep(300);
    const resolvedProfile = path.resolve(profile);
    if (!resolvedProfile.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(resolvedProfile).startsWith('sdp-qa-')) {
      throw new Error('Refusing unexpected browser profile cleanup target');
    }
    await fs.rm(resolvedProfile, { recursive: true, force: true }).catch(() => undefined);
  };
  try {
    const wsUrl = await waitForTarget(profile);
    return { wsUrl, close };
  } catch (error) {
    await close();
    throw error;
  }
}

export async function connect(wsUrl) {
  let nextId = 1;
  const pending = new Map();
  const listeners = [];
  const ws = new WebSocket(wsUrl);
  const rejectPending = error => {
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(error);
    }
    pending.clear();
  };
  ws.addEventListener('close', () => rejectPending(new Error('CDP connection closed')));
  ws.addEventListener('error', () => rejectPending(new Error('CDP connection failed')));
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(timer);
      if (message.error) reject(new Error(`${message.error.message} ${message.error.data ?? ''}`));
      else resolve(message.result);
      return;
    }
    if (message.method) {
      for (const listener of listeners) listener(message);
    }
  });
  const send = (method, params = {}) => {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 20000);
      pending.set(id, { resolve, reject, timer });
      try { ws.send(JSON.stringify({ id, method, params })); }
      catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
    });
  };
  return { send, on: listener => listeners.push(listener), close: () => ws.close() };
}

/**
 * One page session: device emulation, stubs injected before any page script, console/exception
 * capture, taps in CSS pixels or design coordinates.
 */
export async function openPage(cdp, { url, width, height, dpr = 1, mobile = true, touch = false, userAgent, preload = '', blockUrls = [] }) {
  const consoleErrors = [];
  const logs = [];
  cdp.on(message => {
    if (message.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text);
    }
    if (message.method === 'Runtime.consoleAPICalled') {
      const text = message.params.args.map(arg => arg.value ?? arg.description ?? '').join(' ');
      if (message.params.type === 'error') consoleErrors.push(text);
      logs.push(`${message.params.type}: ${text}`);
    }
  });
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  if (blockUrls.length) await cdp.send('Network.setBlockedURLs', { urls: blockUrls });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  if (touch) await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  if (userAgent) await cdp.send('Emulation.setUserAgentOverride', { userAgent });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: preload });
  await cdp.send('Page.navigate', { url });

  const evaluate = async expression => {
    const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };

  const state = () => evaluate('window.__SDP_STATE__ ? JSON.parse(JSON.stringify(window.__SDP_STATE__)) : null');

  const waitFor = async (predicate, timeout = 15000, label = 'condition') => {
    const deadline = Date.now() + timeout;
    let last;
    while (Date.now() < deadline) {
      last = await state();
      if (last && predicate(last)) return last;
      await sleep(25);
    }
    throw new Error(`Timed out waiting for ${label}; last state ${JSON.stringify(last)}`);
  };

  const tapCss = async (x, y) => {
    if (touch) {
      const point = [{ x, y, radiusX: 1, radiusY: 1, force: 1, id: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    }
  };

  /** Finger (or mouse button) down only; releaseCss() lifts it. */
  const pressCss = async (x, y) => {
    if (touch) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, radiusX: 1, radiusY: 1, force: 1, id: 1 }] });
    } else {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    }
  };

  const releaseCss = async (x, y) => {
    if (touch) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    }
  };

  const designToCss = (dx, dy) => {
    const s = Math.min(width / 1080, height / 1920);
    return { x: (width - 1080 * s) / 2 + dx * s, y: (height - 1920 * s) / 2 + dy * s };
  };

  const tapDesign = async (dx, dy) => {
    const p = designToCss(dx, dy);
    await tapCss(p.x, p.y);
  };

  /** A finger (or mouse) drag in design space from (x1, y1) to (x2, y2): `steps` moves `stepMs` apart. */
  const swipeDesign = async (x1, y1, x2, y2, steps = 14, stepMs = 16) => {
    const at = i => designToCss(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps);
    const pause = () => new Promise(resolve => setTimeout(resolve, stepMs));
    const start = at(0);
    if (touch) {
      const point = p => [{ x: p.x, y: p.y, radiusX: 1, radiusY: 1, force: 1, id: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(start) });
      for (let i = 1; i <= steps; i++) {
        await pause();
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(at(i)) });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: start.x, y: start.y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: start.x, y: start.y, button: 'left', clickCount: 1 });
      for (let i = 1; i <= steps; i++) {
        await pause();
        const p = at(i);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y, button: 'left', buttons: 1 });
      }
      const end = at(steps);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: end.x, y: end.y, button: 'left', clickCount: 1 });
    }
  };

  const screenshot = async file => {
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, Buffer.from(shot.data, 'base64'));
  };

  /** Bring this tab back to the front (e.g. the player returning after a store redirect opened a new tab). */
  const bringToFront = () => cdp.send('Page.bringToFront');

  return { evaluate, state, waitFor, tapCss, pressCss, releaseCss, tapDesign, swipeDesign, designToCss, screenshot, bringToFront, consoleErrors, logs };
}
