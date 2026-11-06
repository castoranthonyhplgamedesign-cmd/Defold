// Plays the built AppLovin playables in headless Chrome (see cdp.mjs) and checks the flow:
//  - Full clear, portrait and landscape (time limit lifted through window.GAME_CONFIG): opening pour,
//    hand hint, taps on the hinted patch (paced so the belt never floods) until the picture is
//    empty, end card, end-card tap → store.
//  - 5clicks: five taps → the fifth opens the store, then the end card.
//  - Time limit (4 s): no CHALLENGE_FAILED (not a fail); the store, then the end card.
//  - Jam (belt capacity 400, every front bucket black): taps on other colours fill the belt → fail state.
//  - Soft lock (belt capacity 400, must take in its capacity every second while full): fail state.
//  - Cutting Sand swipe (dist/cantreach_swipe): swipe hint; every press counts (a tap cuts nothing);
//    swipes from far off the picture cut; the fifth press opens the store while the finger is still
//    down, then the end card.
//    (The rest test dist/cantreach_default, the tap version.)
// Checks analytics order and console errors; screenshots go to qa-screenshots/. Run after build:all
// with QA_GPU=1 (software GL is too slow at DPR 3 for timed checks).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { connect, launchBrowser, openPage, sleep } from './cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'qa-screenshots');
const VIEWPORTS = [
  { label: 'portrait', width: 390, height: 844, dpr: 3 },
  { label: 'landscape', width: 844, height: 390, dpr: 3 }
];
// Store opens are recorded instead of opening a tab (a new tab backgrounds the page under test).
const STUB_WINDOW_OPEN = `window.__QA_OPEN__ = [];
window.open = url => { window.__QA_OPEN__.push(String(url)); return {}; };`;
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.fingersyoda.sanddrop&hl=en';

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

/** Same accessor shape an external config editor installs: the build's default assignment is ignored. */
const override = config => `(() => {
  const value = ${JSON.stringify(config)};
  Object.defineProperty(window, 'GAME_CONFIG', { configurable: true, get: () => value, set: () => {} });
})();`;

/** The AppLovin build of an iteration of a version (dist/<version folder>/<length>/). */
function builtFile(length, concept = 'cantreach_default') {
  const dir = path.join(root, 'dist', concept, length);
  const name = fs.readdirSync(dir).find(file => file.endsWith('_al.html'));
  if (!name) throw new Error(`No _al.html in ${dir}; run npm run build:all`);
  return path.join(dir, name);
}

/** Analytics events in the order they were logged (console fallback: "[Analytics] NAME"). */
const events = page => page.logs.filter(line => line.startsWith('log: [Analytics] ')).map(line => line.slice('log: [Analytics] '.length));
const storeOpens = page => page.evaluate('window.__QA_OPEN__ || []');

/** True when `expected` appears in `actual` in this order (other events may sit in between). */
function inOrder(actual, expected) {
  let i = 0;
  for (const event of actual) {
    if (event === expected[i]) i++;
  }
  return i === expected.length;
}

async function withPage(file, viewport, preload, run) {
  const browser = await launchBrowser();
  const cdp = await connect(browser.wsUrl);
  try {
    const page = await openPage(cdp, {
      url: pathToFileURL(file).href,
      width: viewport.width,
      height: viewport.height,
      dpr: viewport.dpr,
      mobile: true,
      touch: true,
      preload: `${STUB_WINDOW_OPEN}\n${preload}`
    });
    await run(page);
    check(page.consoleErrors.length === 0, `${path.basename(file)} ${viewport.label}: console errors: ${page.consoleErrors.join(' | ')}`);
  } finally {
    cdp.close();
    await browser.close();
  }
}

/** Tap a design point and wait until the tap has been counted. */
async function tap(page, point) {
  const before = (await page.state()).counted;
  await page.tapDesign(point.x, point.y);
  return page.waitFor(s => s.counted > before || s.ended, 3000, 'tap counted');
}

async function clearRun(viewport) {
  const label = viewport.label;
  await withPage(builtFile('90seconds'), viewport, override({ GAME_LENGTH: { timeLimit: 9999 } }), async page => {
    const capture = name => page.screenshot(path.join(outDir, `${label}-${name}.png`));
    await page.waitFor(st => st.state === 'intro' || st.state === 'play', 20000, 'scene started');
    await sleep(350);
    await capture('0-intro-pour');
    let s = await page.waitFor(st => st.state === 'play' && st.targets.right, 20000, 'gameplay ready');
    await sleep(500);
    s = await page.state();
    check(s.handVisible, `${label}: hand hint not visible at start`);
    await capture('1-hint');

    const started = Date.now();
    let taps = 0;
    // A belt holding sand for buckets further back in their columns doesn't drain until the player
    // frees what the front buckets need, so a level belt is no reason to keep waiting.
    let beltLevel = -1;
    let beltSince = Date.now();
    let shots = { first: false, belt: false, bucket: false, drop: false };
    while (!s.ended) {
      if (Date.now() - started > 300000) {
        const debug = await page.evaluate('window.__SDP_DEBUG__ && window.__SDP_DEBUG__()').catch(() => null);
        throw new Error(`${label}: not cleared after 5 minutes (${JSON.stringify(s)}) debug ${JSON.stringify(debug)}`);
      }
      // Pace like a careful player: let the funnel and belt drain before the next tap.
      if (!shots.bucket && s.bucketsDone > 0) {
        await capture('4-bucket-done');
        shots.bucket = true;
      }
      if (s.belt !== beltLevel) {
        beltLevel = s.belt;
        beltSince = Date.now();
      }
      const beltSettled = Date.now() - beltSince > 1500;
      if (s.funnel > 300 || (s.belt > 55 && !beltSettled) || !s.targets.right) {
        await sleep(150);
        s = await page.state();
        if (!shots.belt && s.belt >= 15) {
          await capture('3-belt-and-buckets');
          shots.belt = true;
        }
        continue;
      }
      s = await tap(page, s.targets.right);
      taps++;
      if (!shots.first) {
        await sleep(250);
        await capture('2-first-tap');
        shots.first = true;
      }
      if (!shots.drop && s.lastDrop > 0) {
        await sleep(300);
        await capture('5-drop');
        shots.drop = true;
      }
      await sleep(120);
      s = await page.state();
    }
    check(s.endReason === 'solved', `${label}: ended '${s.endReason}' before clearing (${s.remaining} static left, belt ${s.belt}%)`);
    console.log(`${label}: ${s.endReason} after ${taps} taps in ${Math.round((Date.now() - started) / 1000)} s; ${s.bucketsDone} buckets filled`);

    await page.waitFor(st => st.state === 'endcard', 8000, 'end card');
    await sleep(1100);
    await capture('6-endcard');
    await page.tapCss(viewport.width / 2, viewport.height * 0.8);
    await sleep(400);
    const log = events(page);
    // The store opens right before the end card; the end-card tap opens it again.
    const expected = ['LOADING', 'LOADED', 'DISPLAYED', 'CHALLENGE_STARTED', 'CHALLENGE_PASS_25', 'CHALLENGE_PASS_50', 'CHALLENGE_PASS_75', 'CHALLENGE_SOLVED', 'CTA_CLICKED', 'ENDCARD_SHOWN', 'CTA_CLICKED'];
    check(inOrder(log, expected), `${label}: analytics order ${log.join(',')}`);
    check(!log.includes('CHALLENGE_FAILED'), `${label}: CHALLENGE_FAILED fired on a cleared picture`);
    const opens = await storeOpens(page);
    check(opens.length === 2 && opens.every(url => url === PLAY_STORE), `${label}: store opens ${JSON.stringify(opens)}`);
    console.log(`${label} analytics: ${log.join(' → ')}`);
  });
}

async function clickLimitRun() {
  const viewport = VIEWPORTS[0];
  await withPage(builtFile('5clicks'), viewport, '', async page => {
    let s = await page.waitFor(st => st.state === 'play' && st.targets.right, 20000, 'gameplay ready');
    for (let i = 0; i < 5; i++) {
      s = await page.state();
      await tap(page, s.targets.right);
      if (i === 4) {
        const at = events(page);
        check(at.indexOf('CTA_CLICKED') >= 0 && at.indexOf('CTA_CLICKED') < at.indexOf('ENDCARD_SHOWN'), `5clicks: limit tap should redirect right before the end card (${at.join(',')})`);
      }
      await sleep(400);
    }
    s = await page.waitFor(st => st.state === 'endcard', 6000, 'end card after the click limit');
    check(s.endReason === 'limit' && s.counted === 5, `5clicks: ${s.endReason}, counted ${s.counted}`);
    await sleep(1100);
    await page.screenshot(path.join(outDir, '5clicks-endcard.png'));
    await page.tapCss(viewport.width / 2, viewport.height / 2);
    await sleep(400);
    const log = events(page);
    check(inOrder(log, ['CHALLENGE_STARTED', 'CTA_CLICKED', 'ENDCARD_SHOWN', 'CTA_CLICKED']), `5clicks: analytics order ${log.join(',')}`);
    check((await page.state()).counted === 5, '5clicks: end-card tap counted as a gameplay click');
    const opens = await storeOpens(page);
    check(opens.length === 2 && opens.every(url => url === PLAY_STORE), `5clicks: store opens ${JSON.stringify(opens)}`);
    console.log(`5clicks: ${log.join(' → ')}`);
  });
}

async function timeLimitRun() {
  await withPage(builtFile('90seconds'), VIEWPORTS[0], override({ GAME_LENGTH: { timeLimit: 4 } }), async page => {
    const s = await page.waitFor(st => st.state === 'play' && st.targets.right, 20000, 'gameplay ready');
    await tap(page, s.targets.right);
    const end = await page.waitFor(st => st.state === 'endcard', 8000, 'end card after the time limit');
    check(end.endReason === 'time', `time limit: endReason ${end.endReason}`);
    const log = events(page);
    // Running out of time is not the fail state: no CHALLENGE_FAILED (only a belt jam fails).
    check(inOrder(log, ['CHALLENGE_STARTED', 'CTA_CLICKED', 'ENDCARD_SHOWN']) && !log.includes('CHALLENGE_SOLVED') && !log.includes('CHALLENGE_FAILED'), `time limit: analytics ${log.join(',')}`);
    console.log(`time limit: ${log.join(' → ')}`);
  });
}

async function jamRun() {
  const viewport = VIEWPORTS[0];
  // Every front bucket purple (each colour still needs a bucket somewhere, or the start is replanned),
  // one wave with every colour (so other colours' sand can be tapped) and every bucket showing.
  const start = [1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  await withPage(builtFile('90seconds'), viewport, override({ BELT: { capacity: 400 }, BUCKETS: { start, waves: [], racks: [] } }), async page => {
    let s = await page.waitFor(st => st.state === 'play' && st.targets.wrong, 20000, 'gameplay ready');
    const started = Date.now();
    while (!s.ended && Date.now() - started < 30000) {
      if (s.targets.wrong && s.funnel < 600) {
        s = await tap(page, s.targets.wrong);
      }
      await sleep(300);
      s = await page.state();
      if (s.vignette > 0.3) {
        await page.screenshot(path.join(outDir, 'jam-vignette.png'));
      }
    }
    s = await page.waitFor(st => st.state === 'endcard', 6000, 'end card after the jam');
    check(s.endReason === 'jam', `jam: endReason ${s.endReason}`);
    check((s.sounds['sfx-fail'] ?? 0) === 1, `jam: fail sound played ${s.sounds['sfx-fail'] ?? 0} times (want 1)`);
    await page.waitFor(st => (st.sounds['sfx-endcard'] ?? 0) === 1, 2000, 'end-card reveal pop after the jam');
    const log = events(page);
    check(inOrder(log, ['CHALLENGE_STARTED', 'CHALLENGE_FAILED', 'CTA_CLICKED', 'ENDCARD_SHOWN']), `jam: analytics ${log.join(',')}`);
    console.log(`jam: ${s.endReason} at belt ${s.belt}% → ${log.join(' → ')}`);
  });
}

/**
 * Soft lock: a small belt (capacity 400, no overflow) that must take in all of its capacity every
 * second while it turns sand away, so the first full-belt wait fails as stuck (before the 2.5 s jam).
 */
async function softlockRun() {
  const viewport = VIEWPORTS[0];
  await withPage(builtFile('90seconds'), viewport, override({ BELT: { capacity: 400, overflow: 0, stallSeconds: 1, stallPercent: 100 } }), async page => {
    let s = await page.waitFor(st => st.state === 'play' && st.targets.right, 20000, 'gameplay ready');
    const started = Date.now();
    while (!s.ended && Date.now() - started < 30000) {
      const target = s.targets.right || s.targets.wrong;
      if (target && s.funnel < 600) {
        s = await tap(page, target);
      }
      await sleep(250);
      s = await page.state();
    }
    s = await page.waitFor(st => st.state === 'endcard', 6000, 'end card after the soft lock');
    check(s.endReason === 'softlock', `softlock: endReason ${s.endReason}`);
    check((s.sounds['sfx-fail'] ?? 0) === 1, `softlock: fail sound played ${s.sounds['sfx-fail'] ?? 0} times (want 1)`);
    const log = events(page);
    check(inOrder(log, ['CHALLENGE_STARTED', 'CHALLENGE_FAILED', 'CTA_CLICKED', 'ENDCARD_SHOWN']), `softlock: analytics ${log.join(',')}`);
    console.log(`softlock: ${s.endReason} at belt ${s.belt}% → ${log.join(' → ')}`);
  });
}

/** Sand that can't fall yet stays silent when tapped; sand that falls plays the cut sound. */
async function soundRun() {
  await withPage(builtFile('90seconds'), VIEWPORTS[0], '', async page => {
    let s = await page.waitFor(st => st.state === 'play' && st.targets.blocked && st.targets.right, 20000, 'gameplay ready');
    await tap(page, s.targets.blocked);
    await sleep(700);
    s = await page.state();
    const cutAfterBlocked = s.sounds['sfx-cut'] ?? 0;
    check(cutAfterBlocked === 0 && (s.sounds['sfx-sand'] ?? 0) === 0 && (s.sounds['sfx-click'] ?? 0) === 0, `sound: tapping blocked sand played falling sounds (${JSON.stringify(s.sounds)})`);
    check(s.lastCut > 0, 'sound: the blocked tap did not loosen its patch');
    await tap(page, s.targets.right);
    const after = await page.waitFor(st => (st.sounds['sfx-cut'] ?? 0) > cutAfterBlocked, 1500, 'cut sound once sand falls').catch(() => null);
    check(!!after, 'sound: tapping open sand did not play the cut sound');
    check((after?.sounds['sfx-click'] ?? 0) === 1, 'sound: a real cut should play one attack click');
    console.log(`sound: blocked tap silent (${cutAfterBlocked} cut sounds), open tap → ${JSON.stringify((after ?? s).sounds)}`);
  });
}

/** Swipe along a design-space line and wait until the swipe has been counted. */
async function swipe(page, line) {
  const before = (await page.state()).counted;
  await page.swipeDesign(line.x1, line.y1, line.x2, line.y2);
  return page.waitFor(s => s.counted > before || s.ended, 3000, 'swipe counted');
}

/**
 * Cutting Sand (90 seconds): the hint demonstrates a swipe. A swipe can start anywhere, and every
 * press counts as the finger goes down: a swipe below the picture, a tap, a jittery tap (less than
 * SWIPE_MIN_DISTANCE) and a swipe over sand that can't be cut yet count but cut nothing; swipes
 * from far off the picture into it cut; a swipe along the hinted line cuts everything below it (the
 * cut sound, CHALLENGE_STARTED).
 */
async function cutRun() {
  const viewport = VIEWPORTS[0];
  await withPage(builtFile('90seconds', 'cantreach_swipe'), viewport, override({ GAME_LENGTH: { timeLimit: 9999 } }), async page => {
    let s = await page.waitFor(st => st.state === 'play' && st.targets.swipe, 20000, 'gameplay ready');
    check(s.mechanic === 'cut', `cut: mechanic ${s.mechanic}`);
    await sleep(900);
    s = await page.state();
    check(s.handVisible, 'cut: swipe hint not visible at start');
    await page.screenshot(path.join(outDir, 'cut-1-hint.png'));
    const before = s.remaining;
    await page.swipeDesign(200, 1500, 880, 1520);
    await sleep(300);
    s = await page.state();
    check(s.counted === 1 && s.remaining === before, `cut: a swipe below the picture should count once (${s.counted}) and cut nothing (${before - s.remaining})`);
    await page.tapDesign((s.targets.swipe.x1 + s.targets.swipe.x2) / 2, s.targets.swipe.y1 + 30);
    await sleep(400);
    s = await page.state();
    check(s.counted === 2 && s.remaining === before, `cut: a tap on the picture should count once (${s.counted}) and cut nothing (${before - s.remaining})`);
    // A tap whose finger drifts 40 design px before lifting (spam taps, finger jitter): counts, cuts nothing.
    const jx = (s.targets.swipe.x1 + s.targets.swipe.x2) / 2;
    const jy = s.targets.swipe.y1 + 30;
    await page.swipeDesign(jx, jy, jx + 32, jy + 24, 4, 16);
    await sleep(400);
    s = await page.state();
    check(s.counted === 3 && s.remaining === before, `cut: a jittery tap should count once (${s.counted}) and cut nothing (${before - s.remaining})`);
    // Wave 1 plays only the checkerboard: a swipe across the stripes above it counts but cuts nothing
    // (the stripes stop the cut before it reaches the checker).
    await page.swipeDesign(170, 300, 910, 300, 10, 20);
    await sleep(400);
    s = await page.state();
    check(s.counted === 4 && s.remaining === before, `cut: a wave-1 swipe over the stripes should count once (${s.counted}) and cut nothing (${before - s.remaining})`);
    // The hinted line, started at the screen's left edge (far off the picture): counts, cuts.
    const line = s.targets.swipe;
    await page.swipeDesign(10, line.y1, line.x2, line.y2, 14, 30);
    await page.screenshot(path.join(outDir, 'cut-2-trail.png'));
    s = await page.waitFor(st => st.counted === 5 && st.remaining < before, 3000, 'swipe from the screen edge').catch(() => null);
    check(!!s, 'cut: a hinted swipe started at the screen edge should count once and cut');
    const sound = await page.waitFor(st => (st.sounds['sfx-cut'] ?? 0) > 0, 1500, 'cut sound').catch(() => null);
    check(!!sound, 'cut: no cut sound');
    await sleep(600);
    await page.screenshot(path.join(outDir, 'cut-3-falling.png'));
    // Straight up from the buckets, far below the picture, to the next hint's line: counts, cuts that column.
    s = await page.waitFor(st => st.targets.swipe && st.funnel < 600, 15000, 'next hint');
    const up = s.targets.swipe;
    const ux = (up.x1 + up.x2) / 2;
    const remainingBefore = s.remaining;
    await page.swipeDesign(ux, 1800, ux, up.y1, 16, 25);
    s = await page.waitFor(st => st.counted === 6 && st.remaining < remainingBefore, 3000, 'swipe from the buckets').catch(() => null);
    check(!!s, 'cut: a swipe started on the buckets should count once and cut');
    await sleep(700);
    // A few more hinted swipes.
    for (let i = 0; i < 2; i++) {
      s = await page.waitFor(st => st.targets.swipe && st.funnel < 600, 15000, 'next hint');
      s = await swipe(page, s.targets.swipe);
      await sleep(700);
    }
    s = await page.state();
    check(s.counted === 8, `cut: a swipe below the picture, two taps, a swipe over the stripes and 4 cutting swipes counted ${s.counted} (want 8)`);
    check(s.accounted === s.total, `cut: sand not conserved (${s.accounted} of ${s.total})`);
    const log = events(page);
    check(inOrder(log, ['CHALLENGE_STARTED']) && !log.includes('CHALLENGE_FAILED'), `cut: analytics ${log.join(',')}`);
    console.log(`cut: 4 swipes released ${before - s.remaining} grains, ${s.bucketsDone} buckets, belt ${s.belt}% → ${log.join(' → ')}`);
    // One logical falling layer uses a bounded pair only for complementary EOF crossfades, with
    // one short attack for the stroke rather than stacking full-volume clips every 400 ms.
    const clicks = s.sounds['sfx-click'] ?? 0;
    await page.swipeDesign(170, 712, 910, 712, 60, 35);
    await sleep(500);
    s = await page.state();
    const during = (s.sounds['sfx-click'] ?? 0) - clicks;
    check(during === 1, `cut: a held 2 s swipe played ${during} attack clicks (want one)`);
    const audio = await page.evaluate('window.__SDP_AUDIO__()');
    for (const key of ['sfx-cut', 'sfx-sand']) {
      const channel = audio.channels[key];
      check(channel.capacity === 2 && channel.playing <= 2 && channel.volume <= channel.baseVolume + 0.00001,
        `cut: ${key} stacked full-volume clips`);
      check(channel.playing < 2 || channel.crossfading, `cut: ${key} overlapped outside its clip handover`);
    }
    console.log(`cut: held swipe → ${during} attack, cut/pour kept as bounded complementary layers`);
  });
}

/**
 * Cutting Sand, 5 clicks: the fifth press (here far off the picture, on the buckets) opens the store
 * as the finger goes down (before it can cut), then the end card.
 */
async function cutLimitRun() {
  const viewport = VIEWPORTS[0];
  await withPage(builtFile('5clicks', 'cantreach_swipe'), viewport, '', async page => {
    let s = await page.waitFor(st => st.state === 'play' && st.targets.swipe, 20000, 'gameplay ready');
    for (let i = 0; i < 4; i++) {
      s = await page.waitFor(st => st.targets.swipe || st.ended, 15000, 'next hint');
      s = await swipe(page, s.targets.swipe);
      await sleep(400);
    }
    // The fifth press alone (finger still down: no move, no release) ends the game.
    s = await page.waitFor(st => st.targets.swipe, 15000, 'next hint');
    const remaining = s.remaining;
    const p = page.designToCss(540, 1800);
    await page.pressCss(p.x, p.y);
    s = await page.waitFor(st => st.ended, 3000, 'the fifth press to end the game while the finger is down').catch(() => null);
    check(!!s, 'cut 5clicks: the fifth press did not end the game while the finger was still down');
    await page.releaseCss(p.x, p.y);
    s = await page.state();
    check(s.remaining === remaining, `cut 5clicks: the fifth press cut sand (${remaining - s.remaining})`);
    s = await page.waitFor(st => st.state === 'endcard', 6000, 'end card after the swipe limit');
    check(s.endReason === 'limit' && s.counted === 5, `cut 5clicks: ${s.endReason}, counted ${s.counted}`);
    const log = events(page);
    check(inOrder(log, ['CHALLENGE_STARTED', 'CTA_CLICKED', 'ENDCARD_SHOWN']), `cut 5clicks: analytics ${log.join(',')}`);
    const opens = await storeOpens(page);
    check(opens.length === 1 && opens[0] === PLAY_STORE, `cut 5clicks: store opens ${JSON.stringify(opens)}`);
    console.log(`cut 5clicks: ${log.join(' → ')}`);
  });
}

fs.mkdirSync(outDir, { recursive: true });
const only = process.argv[2];
if (!only || only === 'sound') await soundRun();
if (!only || only === 'clear') {
  for (const viewport of VIEWPORTS) {
    await clearRun(viewport);
  }
}
if (!only || only === 'limit') await clickLimitRun();
if (!only || only === 'time') await timeLimitRun();
if (!only || only === 'jam') await jamRun();
if (!only || only === 'softlock') await softlockRun();
if (!only || only === 'cut') await cutRun();
if (!only || only === 'cutlimit') await cutLimitRun();

if (failures.length) {
  console.warn(`\nQA FAILED (${failures.length}):\n${failures.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`\nQA passed. Screenshots: ${path.relative(root, outDir)}`);
}
