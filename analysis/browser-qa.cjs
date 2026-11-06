// Verify only published loopback copies; intercept every non-loopback request.
const { chromium } = require('../reference/BBS-Corners/node_modules/playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = __dirname;
const base = 'http://127.0.0.1:18967';

(async () => {
  const browser = await chromium.launch({headless: true, args: ['--mute-audio']});
  const results = {captured_utc: new Date().toISOString(), report: {}, games: []};
  try {
    const page = await browser.newPage({viewport: {width: 390, height: 844}});
    const response = await page.goto(base);
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('h1').textContent(), 'Defold workspace analysis');
    assert.equal(await page.locator('a[href^="games/"]').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({path: path.join(root, 'evidence/report-mobile.png')});
    results.report = {status: 'PASS', http_status: response.status(), mobile_no_horizontal_overflow: true};
    await page.close();
    for (const key of ['bbs', 'egypt']) {
      for (const viewport of [{width: 390, height: 844}, {width: 844, height: 390}]) {
        const context = await browser.newContext({viewport});
        const page = await context.newPage();
        const entry = {key, viewport, errors: [], console_errors: [], failed_requests: [], external_blocked: [], http_errors: []};
        page.on('pageerror', error => entry.errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') entry.console_errors.push(message.text()); });
        page.on('requestfailed', request => entry.failed_requests.push({url: request.url(), error: request.failure()?.errorText}));
        page.on('response', response => { if (response.status() >= 400) entry.http_errors.push({url: response.url(), status: response.status()}); });
        await context.route('**/*', route => {
          const url = new URL(route.request().url());
          if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
            entry.external_blocked.push(url.href);
            return route.abort();
          }
          return route.continue();
        });
        try {
          const response = await page.goto(`${base}/games/${key}/index.html`, {waitUntil: 'load', timeout: 45000});
          entry.http_status = response.status();
          await page.waitForFunction(k => k === 'bbs' ? !!window.__bbsState : !!window.__EGYPT_STATE__, key, {timeout: 20000}).catch(() => {});
          entry.state = await page.evaluate(k => k === 'bbs' ? window.__bbsState ?? null : window.__EGYPT_STATE__ ?? null, key);
          entry.bridge_present = await page.evaluate(k => k === 'bbs' ? !!window.BBSBridge : !!window.EgyptBridge, key);
          if (key === 'bbs' && entry.state) {
            const initial = entry.state;
            const brick = initial.bricks.find(b => b.active && b.id === initial.hint?.id);
            if (brick) {
              await page.mouse.move(brick.screen_x, brick.screen_y);
              await page.mouse.down();
              for (const point of initial.hint?.route ?? []) await page.mouse.move(point.x, point.y, {steps: 3});
              await page.mouse.up();
              await page.waitForFunction(n => window.__bbsState.remaining < n, initial.remaining, {timeout: 5000}).catch(() => {});
              const after = await page.evaluate(() => window.__bbsState);
              entry.drag = {before: initial.remaining, after: after.remaining, clicks: after.clicks,
                            passed: after.remaining < initial.remaining};
            }
            await page.evaluate(() => dispatchEvent(new Event('luna:pause')));
            entry.pause = await page.evaluate(() => BBSBridge.state());
            await page.evaluate(() => dispatchEvent(new Event('luna:resume')));
            entry.resume = await page.evaluate(() => BBSBridge.state());
            const beforeURL = page.url();
            await page.evaluate(() => BBSBridge.cta());
            entry.local_cta = await page.evaluate(() => BBSBridge.calls.filter(x => x.type === 'cta').length);
            entry.cta_no_navigation = page.url() === beforeURL && context.pages().length === 1;
          }
          await page.screenshot({path: path.join(root, `evidence/${key}-${viewport.width}x${viewport.height}.png`)});
          entry.status = entry.state && entry.bridge_present && !entry.errors.length && !entry.console_errors.length && !entry.http_errors.length ? 'PASS' : 'FAIL';
          if (key === 'bbs' && (!entry.drag?.passed || entry.pause !== 'paused' || entry.resume !== 'active' || !entry.cta_no_navigation)) entry.status = 'FAIL';
        } catch (error) {
          entry.status = 'FAIL';
          entry.test_error = error.message;
        }
        results.games.push(entry);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await fs.writeFile(path.join(root, 'evidence/browser-qa.json'), JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify({report: results.report, games: results.games.map(({state, ...entry}) => ({...entry, state_present: !!state}))}));
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
