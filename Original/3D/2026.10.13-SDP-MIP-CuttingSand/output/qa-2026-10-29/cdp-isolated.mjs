// QA artifact: uses a browser-owned ephemeral port, never the original driver's random shared port.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { openPage as originalOpenPage, sleep } from '../../scripts/qa/cdp.mjs';
export { sleep };

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];

async function findBrowser() {
  for (const executable of BROWSERS) {
    try { await fs.access(executable); return executable; } catch {}
  }
  throw new Error('Chrome or Edge was not found.');
}

export async function launchBrowser() {
  const executable = await findBrowser();
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'sdp-qa-isolated-'));
  const gl = process.env.QA_GPU === '1'
    ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist']
    : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
  const child = spawn(executable, [
    '--headless=new', '--mute-audio', ...gl,
    '--disable-background-networking', '--disable-extensions', '--no-first-run',
    '--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files',
    '--remote-allow-origins=*', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });
  let spawnError;
  let exited = false;
  child.once('error', error => { spawnError = error; });
  const closed = new Promise(resolve => child.once('close', () => { exited = true; resolve(); }));
  let closePromise;
  const close = () => (closePromise ??= (async () => {
    if (!exited) child.kill();
    await Promise.race([closed, sleep(2500)]);
    if (!exited) child.kill();
    const resolvedProfile = path.resolve(profile);
    const resolvedTemp = path.resolve(os.tmpdir()) + path.sep;
    if (!resolvedProfile.startsWith(resolvedTemp) || !path.basename(resolvedProfile).startsWith('sdp-qa-isolated-')) {
      throw new Error(`Refusing unexpected profile cleanup path: ${resolvedProfile}`);
    }
    await fs.rm(resolvedProfile, { recursive: true, force: true }).catch(() => {});
  })());
  try {
    const deadline = Date.now() + 12000;
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (exited) throw new Error('Browser exited before its DevTools target became available.');
      try {
        const activePort = await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8');
        const [portText, browserEndpoint] = activePort.trim().split(/\r?\n/);
        const port = Number(portText);
        if (!(port > 0 && port <= 65535) || !browserEndpoint?.startsWith('/devtools/browser/')) throw new Error('Incomplete DevToolsActivePort');
        const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1500) });
        const targets = await response.json();
        const page = targets.find(target => target.type === 'page' && target.webSocketDebuggerUrl);
        if (page) return { wsUrl: page.webSocketDebuggerUrl, port, profile, pid: child.pid, close };
      } catch {}
      await sleep(70);
    }
    throw new Error('Timed out reading this browser profile\'s DevToolsActivePort / page target.');
  } catch (error) {
    await close();
    throw error;
  }
}

export async function connect(wsUrl) {
  let nextId = 1;
  let closed = false;
  const pending = new Map();
  const listeners = [];
  const navigationJournal = [];
  const ws = new WebSocket(wsUrl);
  const rejectPending = reason => {
    for (const { reject, timer } of pending.values()) {
      clearTimeout(timer);
      reject(reason);
    }
    pending.clear();
  };
  ws.addEventListener('close', () => {
    closed = true;
    rejectPending(new Error('CDP WebSocket closed.'));
  });
  ws.addEventListener('error', () => rejectPending(new Error('CDP WebSocket error.')));
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { ws.close(); reject(new Error('CDP connect timed out after 10 seconds.')); }, 10000);
    ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connect failed.')); }, { once: true });
  });
  ws.addEventListener('message', event => {
    let message;
    try { message = JSON.parse(event.data); } catch { return; }
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(timer);
      if (message.error) reject(new Error(`${message.error.message} ${message.error.data ?? ''}`));
      else resolve(message.result);
      return;
    }
    if (message.method === 'Page.frameNavigated') {
      const frame = message.params.frame;
      navigationJournal.push({ at: new Date().toISOString(), frameId: frame.id, parentId: frame.parentId ?? null, url: frame.url, loaderId: frame.loaderId });
    }
    if (message.method) for (const listener of listeners) listener(message);
  });
  const send = (method, params = {}, timeoutMs = 15000) => new Promise((resolve, reject) => {
    if (closed || ws.readyState !== WebSocket.OPEN) { reject(new Error(`CDP is closed (${method})`)); return; }
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP command timed out after ${timeoutMs} ms: ${method}`));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    try { ws.send(JSON.stringify({ id, method, params })); }
    catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
  });
  return {
    send, on: listener => listeners.push(listener), navigationJournal,
    close: () => { closed = true; rejectPending(new Error('CDP client closed.')); ws.close(); }
  };
}

export async function openPage(cdp, options) {
  const page = await originalOpenPage(cdp, options);
  return { ...page, navigationJournal: cdp.navigationJournal, currentUrl: () => page.evaluate('location.href') };
}
