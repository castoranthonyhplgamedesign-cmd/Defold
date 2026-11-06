import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(root, 'dist');
const tempRoot = path.join(root, 'qa-artifacts', 'cta-html');
const expectedOutputCount = 24;
const iosStoreUrl = 'https://apps.apple.com/us/app/block-buster-no-timer/id6745272388';
const androidStoreUrl = 'https://play.google.com/store/apps/details?id=com.block.away';
const iPhoneUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const expectedCtaByNetwork = {
  Applovin: { type: 'mraid.open', url: iosStoreUrl, injectedGlobal: 'mraid' },
  Ironsource: { type: 'mraid.open', url: iosStoreUrl, injectedGlobal: 'mraid' },
  Unity: { type: 'Luna.Unity.Playable.InstallFullGame', iosUrl: iosStoreUrl, androidUrl: androidStoreUrl, injectedGlobal: 'mraid' },
  Google: { type: 'ExitApi.exit' },
  Mintegral: { type: 'install', lifecycleEvent: 'gameReady' },
  Facebook: { type: 'FbPlayableAd.onCTAClick' },
  Moloco: { type: 'FbPlayableAd.onCTAClick' },
  Vungle: { type: 'postMessage', message: 'download', injectedFlag: '__VUNGLE__' },
};

const browserExecutablePath = findBrowserExecutable();
if (!browserExecutablePath) {
  throw new Error('No system Chrome or Edge executable found. Install a Chromium browser or set PLAYWRIGHT_CHROMIUM_EXECUTABLE.');
}

const outputs = collectOutputs();
if (outputs.length !== expectedOutputCount) {
  throw new Error(`Expected ${expectedOutputCount} playable outputs, found ${outputs.length}. Run npm.cmd run build:all first.`);
}

prepareTempRoot();

const browser = await chromium.launch({
  headless: true,
  executablePath: browserExecutablePath,
});

const failures = [];
const results = [];

try {
  for (const output of outputs) {
    try {
      const result = await qaOutput(browser, output);
      results.push(result);
      console.log(`CTA/analytics QA passed: ${result.iteration}/${result.network} -> ${result.event.type}`);
    } catch (error) {
      failures.push(`${output.iteration}/${output.network}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  for (const failure of failures) console.warn(failure);
  throw new Error(`CTA/analytics QA failed for ${failures.length} output(s).`);
}

console.log(`CTA/analytics QA passed for ${results.length} playable outputs.`);

async function qaOutput(browser, output) {
  const expectation = expectedCtaByNetwork[output.network];
  if (!expectation) throw new Error(`No CTA expectation configured for ${output.network}`);

  const htmlPath = materializeHtml(output);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: iPhoneUserAgent,
  });

  const pageErrors = [];
  const consoleErrors = [];
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.addInitScript(({ network }) => {
    const events = [];
    Object.defineProperty(window, '__ctaQaEvents', {
      value: events,
      configurable: true,
    });

    const log = (type, payload = {}) => {
      events.push({ type, payload });
    };

    window.open = (url, target) => {
      log('window.open', { url, target });
      return null;
    };

    window.gameReady = () => log('gameReady');
    window.gameStart = () => log('gameStart');
    window.gameEnd = () => log('gameEnd');
    window.gameClose = () => log('gameClose');
    window.playableSDK = {
      reportEvent: (eventName, value) => log('playableSDK.reportEvent', { eventName, value }),
    };

    const originalPostMessage = window.postMessage.bind(window);
    window.postMessage = (message, targetOrigin, transfer) => {
      log('postMessage', { message, targetOrigin });
      if (message === 'download') return undefined;
      return originalPostMessage(message, targetOrigin, transfer);
    };

    if (network === 'Google') {
      window.ExitApi = {
        exit: () => log('ExitApi.exit'),
      };
    }

    if (network === 'Facebook' || network === 'Moloco') {
      window.FbPlayableAd = {
        onCTAClick: () => log('FbPlayableAd.onCTAClick'),
      };
    }

    if (network === 'Unity') {
      window.Luna = {
        Unity: {
          LifeCycle: {
            GameStarted: () => log('Luna.Unity.LifeCycle.GameStarted'),
            GameEnded: () => log('Luna.Unity.LifeCycle.GameEnded'),
          },
          Playable: {
            InstallFullGame: (iosUrl, androidUrl) => log('Luna.Unity.Playable.InstallFullGame', { iosUrl, androidUrl }),
          },
        },
      };
    }

    if (network === 'Mintegral') {
      window.install = () => log('install');
    }
  }, { network: output.network });

  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForQaEvent(page, 'gameReady');
    await waitForReportedAnalytics(page, 'DISPLAYED');

    if (expectation.injectedGlobal === 'mraid') {
      await page.waitForFunction(() => Boolean(window.mraid), null, { timeout: 5000 });
      await page.evaluate(() => {
        window.mraid.open = (url) => window.__ctaQaEvents.push({ type: 'mraid.open', payload: { url } });
      });
    }

    await assertRuntimeInjection(page, expectation);
    await triggerGameplayStart(page);
    await waitForQaEvent(page, 'gameStart');
    await waitForReportedAnalytics(page, 'CHALLENGE_STARTED');
    if (output.network === 'Unity') {
      await waitForQaEvent(page, 'Luna.Unity.LifeCycle.GameStarted');
    }

    const footerEvent = await assertCtaRedirect(page, expectation, 'footer CTA', async () => {
      await page.waitForSelector('.footer-cta', { timeout: 15000 });
      await tapSelector(page, '.footer-cta');
    });

    await assertCtaRedirect(page, expectation, 'endcard CTA', async () => {
      await page.waitForSelector('.endcard', { timeout: 15000 });
      await page.evaluate(() => {
        const endcard = document.querySelector('.endcard');
        if (!endcard) throw new Error('Missing .endcard');
        endcard.classList.add('is-visible');
      });
      await tapSelector(page, '.endcard__cta');
    });

    const blockingErrors = [...pageErrors, ...consoleErrors].filter((message) => !isExpectedExternalLoadNoise(message));
    if (blockingErrors.length > 0) {
      throw new Error(`Browser errors: ${blockingErrors.join(' | ')}`);
    }

    return {
      iteration: output.iteration,
      network: output.network,
      event: footerEvent,
    };
  } finally {
    await context.close();
  }
}

async function tapSelector(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ timeout: 15000 });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Missing bounding box for ${selector}`);

  await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.5);
}

async function assertCtaRedirect(page, expectation, label, trigger) {
  const startIndex = await page.evaluate(() => window.__ctaQaEvents.length);
  await trigger();
  await waitForQaEventAfter(page, 'gameClose', startIndex, 5000, label);
  await waitForReportedAnalyticsAfter(page, 'CTA_CLICKED', startIndex, 5000, label);
  await page.waitForFunction(
    ({ expectedType, minIndex }) => window.__ctaQaEvents
      .slice(minIndex)
      .some((event) => event.type === expectedType),
    { expectedType: expectation.type, minIndex: startIndex },
    { timeout: 5000 },
  );

  const events = await page.evaluate((minIndex) => window.__ctaQaEvents.slice(minIndex), startIndex);
  const ctaEvent = events.find((event) => event.type === expectation.type);
  assertExpectedEvent(ctaEvent, expectation, label);
  return ctaEvent;
}

async function triggerGameplayStart(page) {
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ timeout: 15000 });

  const ratios = [
    [0.24, 0.72],
    [0.38, 0.72],
    [0.5, 0.72],
    [0.62, 0.72],
    [0.76, 0.72],
    [0.5, 0.58],
  ];

  for (const [xRatio, yRatio] of ratios) {
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Missing canvas bounding box');

    await page.touchscreen.tap(box.x + box.width * xRatio, box.y + box.height * yRatio);
    const started = await hasQaEvent(page, 'CHALLENGE_STARTED', true);
    if (started) return;
  }

  throw new Error('Could not trigger gameplay start analytics from tested canvas points');
}

async function hasQaEvent(page, eventType, isAnalyticsEvent = false) {
  try {
    await page.waitForFunction(
      ({ expectedType, expectedAnalytics }) => window.__ctaQaEvents.some((event) => {
        if (!expectedAnalytics) return event.type === expectedType;
        return event.type === 'playableSDK.reportEvent' && event.payload.eventName === expectedType;
      }),
      { expectedType: eventType, expectedAnalytics: isAnalyticsEvent },
      { timeout: 350 },
    );
    return true;
  } catch {
    return false;
  }
}

async function waitForQaEvent(page, eventType, timeout = 5000) {
  await page.waitForFunction(
    (expectedType) => window.__ctaQaEvents.some((event) => event.type === expectedType),
    eventType,
    { timeout },
  );
}

async function waitForQaEventAfter(page, eventType, minIndex, timeout = 5000, label = 'CTA') {
  await page.waitForFunction(
    ({ expectedType, fromIndex }) => window.__ctaQaEvents
      .slice(fromIndex)
      .some((event) => event.type === expectedType),
    { expectedType: eventType, fromIndex: minIndex },
    { timeout },
  ).catch((error) => {
    throw new Error(`${label}: missing event ${eventType}: ${error.message}`);
  });
}

async function waitForReportedAnalytics(page, eventName, timeout = 5000) {
  await page.waitForFunction(
    (expectedEventName) => window.__ctaQaEvents.some((event) => (
      event.type === 'playableSDK.reportEvent'
      && event.payload.eventName === expectedEventName
    )),
    eventName,
    { timeout },
  );
}

async function waitForReportedAnalyticsAfter(page, eventName, minIndex, timeout = 5000, label = 'CTA') {
  await page.waitForFunction(
    ({ expectedEventName, fromIndex }) => window.__ctaQaEvents
      .slice(fromIndex)
      .some((event) => (
        event.type === 'playableSDK.reportEvent'
        && event.payload.eventName === expectedEventName
      )),
    { expectedEventName: eventName, fromIndex: minIndex },
    { timeout },
  ).catch((error) => {
    throw new Error(`${label}: missing analytics ${eventName}: ${error.message}`);
  });
}

async function assertRuntimeInjection(page, expectation) {
  if (expectation.injectedFlag) {
    const hasFlag = await page.evaluate((flag) => window[flag] === true, expectation.injectedFlag);
    if (!hasFlag) throw new Error(`Expected injected flag window.${expectation.injectedFlag}`);
  }

  if (expectation.lifecycleEvent) {
    await page.waitForFunction(
      (eventType) => window.__ctaQaEvents.some((event) => event.type === eventType),
      expectation.lifecycleEvent,
      { timeout: 5000 },
    );
  }
}

function assertExpectedEvent(event, expectation, label = 'CTA') {
  if (!event) throw new Error(`${label}: missing CTA event ${expectation.type}`);

  if (expectation.url && event.payload.url !== expectation.url) {
    throw new Error(`${label}: expected ${expectation.type} URL ${expectation.url}, got ${event.payload.url}`);
  }

  if (expectation.iosUrl && event.payload.iosUrl !== expectation.iosUrl) {
    throw new Error(`${label}: expected iOS URL ${expectation.iosUrl}, got ${event.payload.iosUrl}`);
  }

  if (expectation.androidUrl && event.payload.androidUrl !== expectation.androidUrl) {
    throw new Error(`${label}: expected Android URL ${expectation.androidUrl}, got ${event.payload.androidUrl}`);
  }

  if (expectation.message && event.payload.message !== expectation.message) {
    throw new Error(`${label}: expected postMessage ${expectation.message}, got ${event.payload.message}`);
  }
}

function isExpectedExternalLoadNoise(message) {
  return message.includes('mraid.js')
    || message.includes('exitapi.js')
    || message.includes('Failed to load resource')
    || message.includes('net::ERR_');
}

function collectOutputs() {
  if (!fs.existsSync(distRoot)) return [];

  const outputs = [];
  for (const file of walk(distRoot)) {
    if (!file.endsWith('.html') && !file.endsWith('.zip')) continue;
    const rel = path.relative(distRoot, file);
    const parts = rel.split(path.sep);
    outputs.push({
      path: file,
      rel,
      iteration: parts[0],
      network: parts[1],
      isZip: file.endsWith('.zip'),
    });
  }

  outputs.sort((a, b) => a.rel.localeCompare(b.rel));
  return outputs;
}

function materializeHtml(output) {
  if (!output.isZip) return output.path;

  const html = readSingleFileZip(output.path).html;
  const outDir = path.join(tempRoot, output.iteration, output.network);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, path.basename(output.path, '.zip') + '.html');
  fs.writeFileSync(outPath, html);
  return outPath;
}

function readSingleFileZip(file) {
  const zip = fs.readFileSync(file);
  if (zip.length < 30 || zip.readUInt32LE(0) !== 0x04034b50) {
    throw new Error(`${file}: missing ZIP local file header`);
  }

  const compressionMethod = zip.readUInt16LE(8);
  if (compressionMethod !== 0) {
    throw new Error(`${file}: expected uncompressed ZIP entry, got method ${compressionMethod}`);
  }

  const compressedSize = zip.readUInt32LE(18);
  const filenameLength = zip.readUInt16LE(26);
  const extraLength = zip.readUInt16LE(28);
  const filenameStart = 30;
  const contentStart = filenameStart + filenameLength + extraLength;
  const contentEnd = contentStart + compressedSize;
  const filename = zip.subarray(filenameStart, filenameStart + filenameLength).toString('utf8');
  if (filename !== 'index.html') {
    throw new Error(`${file}: expected ZIP entry index.html, got ${filename}`);
  }

  return {
    filename,
    html: zip.subarray(contentStart, contentEnd).toString('utf8'),
  };
}

function prepareTempRoot() {
  const resolved = path.resolve(tempRoot);
  const allowed = path.resolve(root, 'qa-artifacts');
  if (!resolved.startsWith(allowed + path.sep)) {
    throw new Error(`Refusing to clean temp directory outside qa-artifacts: ${resolved}`);
  }

  fs.rmSync(resolved, { recursive: true, force: true });
  fs.mkdirSync(resolved, { recursive: true });
}

function findBrowserExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else yield fullPath;
  }
}
