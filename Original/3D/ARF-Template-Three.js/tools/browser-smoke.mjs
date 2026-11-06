import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const html = fs.readFileSync('dist/index.html', 'utf8');
const milestone = 'milestone-4';
fs.mkdirSync(`analysis/screenshots/${milestone}`, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--mute-audio', '--disable-background-networking'] });
const errors = [], requests = [], captures = [];
try {
  const context = await browser.newContext({ deviceScaleFactor: 2, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const url = route.request().url(); requests.push(url);
    if (url === 'https://preview.invalid/') return route.fulfill({ contentType: 'text/html', body: html });
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  for (const [width, height] of [[390,844], [844,390], [768,1024], [360,640]]) {
    await page.setViewportSize({ width, height });
    if (!captures.length) await page.goto('https://preview.invalid/');
    await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true');
    await page.waitForTimeout(750);
    const info = await page.locator('canvas').evaluate(canvas => ({ width: canvas.width, height: canvas.height, calls: Number(canvas.dataset.drawCalls), triangles: Number(canvas.dataset.triangles), canvases: document.querySelectorAll('canvas').length }));
    assert.equal(info.width, width * 2); assert.equal(info.height, height * 2);
    assert.equal(info.canvases, 1); assert(info.calls > 0 && info.calls < 100);
    const file = `analysis/screenshots/${milestone}/${width}x${height}.png`;
    await page.screenshot({ path: file }); captures.push({ viewport: { width, height }, ...info, file });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, ['https://preview.invalid/']);
  fs.writeFileSync(`analysis/evidence/${milestone}-browser.json`, JSON.stringify({ testedAt: new Date().toISOString(), browser: browser.version(), scope: 'Current Three preview viewport checks, not untrusted reference', errors, requests, captures }, null, 2));
  console.log(JSON.stringify({ errors, requests, captures }, null, 2));
} finally { await browser.close(); }
