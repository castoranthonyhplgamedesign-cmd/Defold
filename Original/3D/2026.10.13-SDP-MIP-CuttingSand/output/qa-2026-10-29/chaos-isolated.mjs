// Chaos test against the BUILT playables. Seeded random actions — hint/wrong/random taps, bursts,
// multi-touch, taps during the opening pour, rotations and resizes mid-animation, visibility flips,
// MRAID exposure and Luna pause events, MRAID volume changes — across iterations, networks,
// viewports and GAME_CONFIG overrides, then the end card. Cutting Sand builds (QA_CONCEPT=cuttingsand_swipe)
// get swipes instead: along the hint, random, from outside the picture, held across a rotation,
// below the picture (never counted), and taps (never counted). Invariants are checked on every step:
// sand conservation, bucket integrity, click counting, state order, canvas size, freezing while
// hidden; and at the end: one store open right before the end card, end-card CTAs, analytics.
// Browsers are launched muted (cdp.mjs). Reproduce a run with its printed seed.
// Usage: QA_GPU=1 [QA_CONCEPT=cuttingsand_swipe] node scripts/qa/chaos.mjs [runs=10] [seed=20261014] [only=1,4]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { connect, launchBrowser, openPage, sleep } from './cdp-isolated.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// The version under test: dist/<version folder>/<length>/ (QA_CONCEPT: cuttingsand_default = v1 tap, the default; cuttingsand_swipe = v2 cut).
const CONCEPT = process.env.QA_CONCEPT || 'cuttingsand_default';
const dist = path.join(root, 'dist', CONCEPT);
const out = path.join(root, 'output/qa-2026-10-29/isolated', CONCEPT);
const RUNS = Number(process.argv[2] ?? 10);
const BASE_SEED = Number(process.argv[3] ?? 20261014);
// The sand picture in design px: the rainbow level is 189 × 168 grains, 770 px wide (its height
// follows the grain grid; any SAND.columns keeps the aspect).
const PICTURE = { x: 155, y: 188.5, w: 770, h: (168 * 770) / 189 };

const ONCE = ['LOADING', 'LOADED', 'DISPLAYED', 'CHALLENGE_STARTED', 'CHALLENGE_PASS_25', 'CHALLENGE_PASS_50', 'CHALLENGE_PASS_75', 'CHALLENGE_SOLVED', 'CHALLENGE_FAILED', 'ENDCARD_SHOWN'];
const ORDER = ['LOADING', 'LOADED', 'DISPLAYED', 'CHALLENGE_STARTED', 'CHALLENGE_PASS_25', 'CHALLENGE_PASS_50', 'CHALLENGE_PASS_75', 'END', 'ENDCARD_SHOWN'];
const STATES = ['intro', 'play', 'ending', 'endcard'];
const VIEWPORTS = [
  [390, 844, 3], [540, 960, 2], [960, 540, 2], [844, 390, 3], [768, 1024, 2], [1024, 768, 1],
  [360, 640, 2], [1280, 720, 1], [412, 915, 2.625], [320, 568, 2], [600, 600, 1], [1920, 1080, 1]
];
// [iteration, network, click limit, GAME_CONFIG override, mock MRAID container]
const VARIANTS = [
  ['5clicks', 'al', 5, {}, true],
  ['10clicks', 'is', 10, {}, false],
  ['90seconds', 'fb', 0, { GAME_LENGTH: { timeLimit: 20 } }, false],
  ['90seconds', 'al', 0, { BELT: { capacity: 300 }, GAME_LENGTH: { timeLimit: 60 } }, true],
  ['90seconds', 'mo', 0, { SAND: { columns: 40 }, GAME_LENGTH: { timeLimit: 9999 } }, false],
  ['10clicks', 'un', 10, {}, true],
  ['5clicks', 'lf', 5, { OPENING_GAMEPLAY_ANIMATION: false }, true],
  ['90seconds', 'al', 0, { SAND: { columns: 80 }, GAME_LENGTH: { timeLimit: 45 } }, false],
  ['10clicks', 'fb', 10, { HAND_TUTOR_MODE: false }, false],
  ['90seconds', 'is', 0, { GAME_LENGTH: { timeLimit: 30 }, MUTE: true }, true]
];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Records analytics, store opens (with the gesture they ran in) and, optionally, a mock MRAID container. */
function preload(config, mraid) {
  return `(() => {
  const QA = window.__QA = { events: [], opens: [], gesture: null, trace: [] };
  const name = t => t && t.tagName ? t.tagName + (t.hasAttribute('data-endcard-cta') ? '[cta]' : '') : 'window';
  const mark = e => {
    QA.gesture = e.type;
    setTimeout(() => { QA.gesture = null; }, 0);
    QA.trace.push(e.type + ':' + name(e.target) + '@' + Math.round(e.timeStamp));
    if (QA.trace.length > 40) QA.trace.shift();
  };
  for (const t of ['pointerdown', 'mousedown', 'touchstart', 'pointerup', 'mouseup', 'touchend', 'click']) window.addEventListener(t, mark, true);
  const open = via => url => { QA.opens.push({ url: String(url), via, gesture: QA.gesture, events: QA.events.slice(), trace: QA.trace.slice(-8) }); return {}; };
  window.open = open('window.open');
  window.ALPlayableAnalytics = { trackEvent: e => QA.events.push(e) };
  ${mraid ? `const listeners = {};
  window.mraid = {
    state: 'loading',
    getState() { return this.state; },
    addEventListener(e, f) { (listeners[e] = listeners[e] || []).push(f); },
    removeEventListener() {},
    isViewable() { return true; },
    open: open('mraid.open'),
    close() {},
    getPlacementType() { return 'interstitial'; },
    supports() { return false; },
    fire(e, ...args) { (listeners[e] || []).forEach(f => f(...args)); }
  };
  setTimeout(() => { window.mraid.state = 'default'; window.mraid.fire('ready'); }, 300);` : ''}
  const value = ${JSON.stringify(config)};
  if (Object.keys(value).length) {
    Object.defineProperty(window, 'GAME_CONFIG', { configurable: true, get: () => value, set: () => {} });
  }
})();`;
}

const qaState = page => page.evaluate('JSON.parse(JSON.stringify(window.__QA))');

async function chaosRun(runIndex) {
  const seed = BASE_SEED + runIndex * 7919;
  const rand = rng(seed);
  const pick = list => list[Math.floor(rand() * list.length)];
  const [length, tag, limit, config, mraid] = VARIANTS[runIndex % VARIANTS.length];
  let [vw, vh, dpr] = pick(VIEWPORTS);
  const touch = rand() < 0.5;
  const label = `run ${runIndex + 1} seed ${seed} ${CONCEPT}/${length}/${tag}${mraid ? '+mraid' : ''} ${touch ? 'touch' : 'mouse'} ${JSON.stringify(config)}`;
  const failures = [];
  const log = [];
  const fail = msg => {
    if (!failures.includes(msg)) failures.push(msg);
  };

  const browser = await launchBrowser();
  const cdp = await connect(browser.wsUrl);
  try {
    const name = fs.readdirSync(path.join(dist, length)).find(f => f.endsWith(`_${tag}.html`));
    const page = await openPage(cdp, { url: pathToFileURL(path.join(dist, length, name)).href, width: vw, height: vh, dpr, touch, preload: preload(config, mraid) });
    const toCss = (dx, dy) => {
      const s = Math.min(vw / 1080, vh / 1920);
      return { x: (vw - 1080 * s) / 2 + dx * s, y: (vh - 1920 * s) / 2 + dy * s };
    };
    const tapDesign = async (dx, dy) => {
      const p = toCss(dx, dy);
      await page.tapCss(p.x, p.y);
      await sleep(80);
    };
    /**
     * A finger (or mouse) drag in design space through `points` ([x, y] pairs), `steps` moves per
     * leg; `between(i)` may run before move i (e.g. a rotation mid-swipe).
     */
    const swipeDesign = async (points, steps = 8, stepMs = 16, between = null) => {
      const route = [];
      for (let j = 0; j + 1 < points.length; j++) {
        for (let i = j === 0 ? 0 : 1; i <= steps; i++) {
          route.push([points[j][0] + ((points[j + 1][0] - points[j][0]) * i) / steps, points[j][1] + ((points[j + 1][1] - points[j][1]) * i) / steps]);
        }
      }
      const css = i => toCss(route[i][0], route[i][1]);
      const start = css(0);
      if (touch) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y, id: 1 }] });
      } else {
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: start.x, y: start.y });
        await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: start.x, y: start.y, button: 'left', clickCount: 1 });
      }
      for (let i = 1; i < route.length; i++) {
        if (between) await between(i);
        await sleep(stepMs);
        const p = css(i);
        if (touch) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x, y: p.y, id: 1 }] });
        } else {
          await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y, button: 'left', buttons: 1 });
        }
      }
      const end = css(route.length - 1);
      if (touch) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: end.x, y: end.y, button: 'left', clickCount: 1 });
      }
      await sleep(80);
    };
    const randomInPicture = () => [PICTURE.x + rand() * PICTURE.w, PICTURE.y + rand() * PICTURE.h];
    /** The game publishes its state once a frame: wait a few frames so earlier input is in it. */
    const freshState = async () => {
      await sleep(150);
      return page.state();
    };
    let lastViewportChange = Date.now();
    let hidden = false;

    const setViewport = async (w, h, d, why) => {
      vw = w; vh = h; dpr = d;
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: d, mobile: true });
      lastViewportChange = Date.now();
      log.push(`${why} → ${w}×${h}@${d}`);
    };
    const canvasMismatch = async () => {
      const c = await page.evaluate(`(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return { w: r.width, h: r.height, bw: c.width }; })()`);
      const expectW = Math.round(vw * Math.min(3, dpr));
      return Math.abs(c.w - vw) <= 1 && Math.abs(c.h - vh) <= 1 && Math.abs(c.bw - expectW) <= 2 ? null : JSON.stringify({ vw, vh, dpr, ...c });
    };
    const setHidden = async value => {
      hidden = value;
      await page.evaluate(`(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => ${value} }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => '${value ? 'hidden' : 'visible'}' }); document.dispatchEvent(new Event('visibilitychange')); })()`);
    };
    /** While paused (hidden / not exposed / luna:pause) no update frame may run; after resuming they must. */
    const pausedCheck = async (pause, resume, what) => {
      const before = await page.state();
      await pause();
      await sleep(120);
      const a = await page.state();
      await sleep(350 + Math.floor(rand() * 400));
      const b = await page.state();
      if (b.frame !== a.frame) fail(`game kept running while ${what} (frames ${a.frame} → ${b.frame})`);
      await resume();
      await sleep(250);
      const c = await page.state();
      if (c.frame === b.frame && !c.ended) fail(`game did not resume after ${what}`);
      log.push(`${what} (state ${before.state})`);
    };
    /** Per-step invariants. */
    let prev = null;
    const checkState = s => {
      if (!s) return;
      if (s.accounted !== s.total) fail(`sand not conserved: accounted ${s.accounted} of ${s.total} (${JSON.stringify({ remaining: s.remaining, loose: s.loose, belt: s.beltLoad, buckets: s.bucketsDone })})`);
      if (s.integrity) fail(`bucket integrity: ${s.integrity}`);
      if (!(s.belt >= 0 && s.belt <= 100)) fail(`belt % out of range: ${s.belt}`);
      if (limit && s.counted > limit) fail(`counted ${s.counted} exceeds limit ${limit}`);
      if (prev) {
        if (s.counted < prev.counted) fail(`counted went backwards ${prev.counted} → ${s.counted}`);
        if (STATES.indexOf(s.state) < STATES.indexOf(prev.state)) fail(`state went backwards ${prev.state} → ${s.state}`);
        if (s.remaining > prev.remaining) fail(`static sand grew ${prev.remaining} → ${s.remaining}`);
        if (s.bucketsDone < prev.bucketsDone) fail(`buckets done went backwards`);
      }
      prev = s;
    };

    await page.waitFor(s => s.state === 'intro' || s.state === 'play', 20000, 'scene start');
    const cut = (await page.state()).mechanic === 'cut';
    // Taps (and swipes) during the opening pour must be ignored.
    if ((await page.state()).state === 'intro') {
      for (let i = 0; i < 3; i++) await tapDesign(PICTURE.x + rand() * PICTURE.w, PICTURE.y + rand() * PICTURE.h);
      if (cut) await swipeDesign([randomInPicture(), randomInPicture()]);
      const s = await page.state();
      if (s.state === 'intro' && s.counted !== 0) fail(`taps during the opening pour were counted (${s.counted})`);
      log.push('taps during pour');
    }
    await page.waitFor(s => s.state === 'play', 20000, 'play');
    const started = Date.now();
    let idleChecked = false;

    // The end card's DOM layer appears inside the ending tap; the published state lags a frame, so a
    // new action on a stale "play" state would be a real tap on the end card (a legitimate CTA).
    const endCardUp = () => page.evaluate('Boolean(document.querySelector("[data-endcard-cta]"))');
    for (let step = 0; step < 160 && Date.now() - started < 75000; step++) {
      const state = await page.state();
      checkState(state);
      if (state.ended || (await endCardUp())) break;
      const settled = Date.now() - lastViewportChange > 700;
      const r = rand();

      if (cut && r < 0.5) {
        // Cutting Sand: swipes instead of taps.
        if (r < 0.18 && state.targets.swipe) {
          const before = state;
          const line = before.targets.swipe;
          await swipeDesign([[line.x1, line.y1], [line.x2, line.y2]]);
          log.push(`swipe hint (${Math.round(line.x1)}, ${Math.round(line.y1)}) → (${Math.round(line.x2)}, ${Math.round(line.y2)})`);
          if (settled && !hidden && before.state === 'play') {
            const after = await page.waitFor(s => s.counted > before.counted || s.ended, 1500, 'hint swipe to count').catch(() => null);
            if (!after) fail(`swipe along the hint did not register (viewport ${vw}×${vh}@${dpr}); recent: ${log.slice(-5).join(' | ')}`);
          }
        } else if (r < 0.28) {
          const n = 2 + Math.floor(rand() * 3);
          await swipeDesign(Array.from({ length: n }, randomInPicture), 6);
          log.push(`random swipe (${n} points)`);
        } else if (r < 0.33) {
          // A press on the picture counts as the finger goes down, even without a swipe.
          const before = await freshState();
          await tapDesign(...randomInPicture());
          if (settled && !hidden && before.state === 'play') {
            const after = await page.waitFor(s => s.counted > before.counted || s.ended, 1500, 'press to count').catch(() => null);
            if (!after) fail(`a press on the picture was not counted in Cutting Sand (viewport ${vw}×${vh}@${dpr})`);
          }
          log.push('tap picture (cut: counts, cuts nothing)');
        } else if (r < 0.39) {
          // From far outside the frame, across the picture: a press there neither counts nor cuts.
          const before = await freshState();
          const y = PICTURE.y + rand() * PICTURE.h;
          await swipeDesign([[20, y], [PICTURE.x + PICTURE.w * (0.3 + rand() * 0.8), y + (rand() - 0.5) * 200]], 12);
          const after = await freshState();
          if (after.counted !== before.counted && !after.ended) fail('a swipe starting far outside the picture was counted');
          if (after.remaining !== before.remaining && !after.ended && before.state === 'play') fail('a swipe starting far outside the picture cut sand');
          log.push('swipe from outside');
        } else if (r < 0.44) {
          const before = await freshState();
          const y = 1120 + rand() * 760;
          await swipeDesign([[140 + rand() * 300, y], [600 + rand() * 340, y + (rand() - 0.5) * 100]]);
          const after = await freshState();
          if (after.counted !== before.counted && !after.ended) fail('a swipe below the picture was counted');
          log.push('swipe below the picture');
        } else {
          // Held across a rotation: the viewport turns mid-swipe.
          await swipeDesign([randomInPicture(), randomInPicture(), randomInPicture()], 5, 30, async i => {
            if (i === 4) await setViewport(vh, vw, dpr, 'rotate mid-swipe');
          });
          log.push('swipe across a rotation');
        }
      } else if (!cut && r < 0.2 && state.targets.right) {
        const before = state;
        await tapDesign(before.targets.right.x, before.targets.right.y);
        log.push(`tap hint (${Math.round(before.targets.right.x)}, ${Math.round(before.targets.right.y)})`);
        if (settled && !hidden && before.state === 'play') {
          const after = await page.waitFor(s => s.counted > before.counted || s.ended, 1500, 'hint tap to count').catch(() => null);
          if (!after) fail(`tap on the hint target did not register (viewport ${vw}×${vh}@${dpr}); recent: ${log.slice(-5).join(' | ')}`);
        }
      } else if (!cut && r < 0.3 && state.targets.wrong) {
        await tapDesign(state.targets.wrong.x, state.targets.wrong.y);
        log.push('tap wrong colour');
      } else if (!cut && r < 0.42) {
        await tapDesign(PICTURE.x + rand() * PICTURE.w, PICTURE.y + rand() * PICTURE.h);
        log.push('tap picture');
      } else if (!cut && r < 0.5) {
        const before = await page.state();
        // Below the picture (funnel, belt, buckets) is never a gameplay tap.
        await tapDesign(140 + rand() * 800, 1120 + rand() * 780);
        const after = await page.state();
        if (after.counted !== before.counted && !after.ended) fail('a tap below the picture was counted');
        log.push('tap off the sand');
      } else if (r < 0.57) {
        const x = rand() * vw;
        const y = rand() * vh;
        const n = 3 + Math.floor(rand() * 5);
        for (let i = 0; i < n; i++) {
          await page.tapCss(x + (rand() - 0.5) * 30, y + (rand() - 0.5) * 30);
          if (await page.evaluate('Boolean(document.querySelector("[data-endcard-cta]"))')) break;
        }
        log.push(`burst ×${n}`);
      } else if (r < 0.61 && touch) {
        const a = toCss(PICTURE.x + rand() * PICTURE.w, PICTURE.y + rand() * PICTURE.h);
        const b = toCss(PICTURE.x + rand() * PICTURE.w, PICTURE.y + rand() * PICTURE.h);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 1 }, { x: b.x, y: b.y, id: 2 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        log.push('two-finger tap');
      } else if (r < 0.71) {
        await setViewport(vh, vw, dpr, 'rotate');
        await sleep(Math.floor(rand() * 250));
      } else if (r < 0.76) {
        const [w, h, d] = pick(VIEWPORTS);
        await setViewport(w, h, d, 'resize');
      } else if (r < 0.8) {
        await pausedCheck(() => setHidden(true), () => setHidden(false), 'hidden');
      } else if (r < 0.84 && mraid) {
        await pausedCheck(
          () => page.evaluate('window.mraid.fire("exposureChange", 0)'),
          () => page.evaluate('window.mraid.fire("exposureChange", 100)'),
          'MRAID exposure 0'
        );
      } else if (r < 0.86 && tag === 'un') {
        await pausedCheck(
          () => page.evaluate('window.dispatchEvent(new Event("luna:pause"))'),
          () => page.evaluate('window.dispatchEvent(new Event("luna:resume"))'),
          'luna:pause'
        );
      } else if (r < 0.88 && mraid) {
        await page.evaluate(`window.mraid.fire("audioVolumeChange", ${rand() < 0.5 ? 'null' : Math.round(rand() * 100)})`);
        log.push('MRAID volume change');
      } else if (!idleChecked && r < 0.9 && state.state === 'play' && (cut ? state.targets.swipe : state.targets.right) && config.HAND_TUTOR_MODE !== false) {
        // Idle: the hint must come back after TUTORIAL_DELAY (10 s), while there is sand left to tap
        // (once every patch is cut, the rest is loose sand waiting for the belt: nothing to point at).
        idleChecked = true;
        const s = await page.waitFor(st => st.handVisible || st.ended, 13000, 'idle hint').catch(() => null);
        if (!s) {
          const debug = await page.evaluate('window.__SDP_DEBUG__ && window.__SDP_DEBUG__()').catch(() => null);
          const now = await page.state();
          fail(`hand hint did not return after 10 s idle (state ${now.state}, milestone ${now.milestone}, right ${JSON.stringify(now.targets.right)}, hint ${JSON.stringify(debug && debug.hint)}, paused ${debug && debug.paused}); recent: ${log.slice(-6).join(' | ')}`);
        }
        log.push('idle 10 s');
      } else {
        const ms = Math.floor(rand() * 600);
        await sleep(ms);
        log.push(`wait ${ms}`);
      }

      if (Date.now() - lastViewportChange > 650 && Date.now() - lastViewportChange < 2500) {
        const bad = await canvasMismatch();
        if (bad) fail(`canvas does not match the viewport after ${log[log.length - 1]}: ${bad}`);
      }
    }
    if (hidden) await setHidden(false);

    // Drive to the end: follow the hint at a careful pace (time-limited runs end on the timer).
    const driveStart = Date.now();
    for (;;) {
      const s = await page.state();
      checkState(s);
      if (s.ended || Date.now() - driveStart > 240000) break;
      if (cut && s.targets.swipe && s.funnel < 300) {
        const line = s.targets.swipe;
        await swipeDesign([[line.x1, line.y1], [line.x2, line.y2]]);
      } else if (!cut && s.targets.right && s.funnel < 300) {
        await tapDesign(s.targets.right.x, s.targets.right.y);
      }
      await sleep(400);
    }
    let state = await page.waitFor(s => s.state === 'endcard', 15000, 'end card').catch(() => page.state());
    checkState(state);
    if (state.state !== 'endcard') fail(`never reached the end card (state ${state.state}, ${state.endReason})`);

    // Rotate twice on the end card.
    await setViewport(vh, vw, dpr, 'rotate on end card');
    await sleep(300);
    await setViewport(vh, vw, dpr, 'rotate on end card');
    await sleep(900);
    const badCanvas = await canvasMismatch();
    if (badCanvas) fail(`canvas does not match the viewport on the end card: ${badCanvas}`);

    let q = await qaState(page);
    const endReason = state.endReason;
    const opensAtEnd = q.opens.length;
    // Exactly one store open, right before the end card (inside the tap, for the click limit).
    if (opensAtEnd !== 1) fail(`expected one store open right before the end card (${endReason}), got ${opensAtEnd}: ${JSON.stringify(q.opens.map(o => ({ via: o.via, gesture: o.gesture, events: o.events.slice(-2), trace: o.trace })))}`);
    const first = q.opens[0];
    if (first) {
      if (first.events.includes('ENDCARD_SHOWN')) fail('store opened after the end card appeared');
      const i = q.events.indexOf('CTA_CLICKED');
      if (q.events[i + 1] !== 'ENDCARD_SHOWN') fail(`CTA_CLICKED not immediately followed by ENDCARD_SHOWN: ${q.events.join(' > ')}`);
      if (endReason === 'limit' && !first.gesture) fail('click-limit store open happened outside the tap');
      if (mraid && first.via !== 'mraid.open') fail(`MRAID build opened the store via ${first.via}`);
    }
    if (endReason === 'limit' && state.counted !== limit) fail(`limit ending at counted ${state.counted} (limit ${limit})`);
    if (!limit && endReason === 'limit') fail('click-limit ending in a run without a click limit');
    const solved = q.events.includes('CHALLENGE_SOLVED');
    const failed = q.events.includes('CHALLENGE_FAILED');
    if (solved && failed) fail('both CHALLENGE_SOLVED and CHALLENGE_FAILED');
    if (endReason === 'solved' && !solved) fail('solved without CHALLENGE_SOLVED');
    if ((endReason === 'jam' || endReason === 'softlock') && !failed) fail(`${endReason} without CHALLENGE_FAILED`);
    // Only a stuck belt (jam or soft lock) is the fail state: the time and click limits just end the game.
    if ((endReason === 'time' || endReason === 'limit') && failed) fail(`${endReason} ending fired CHALLENGE_FAILED`);

    // Every end-card tap is a CTA (spaced past the 400 ms re-entry guard) and none is a gameplay tap.
    const countedAtEnd = state.counted;
    for (let i = 0; i < 3; i++) {
      await page.tapCss(rand() * vw, rand() * vh);
      await sleep(520);
    }
    q = await qaState(page);
    state = await page.state();
    if (q.opens.length !== opensAtEnd + 3) fail(`end-card taps: expected ${opensAtEnd + 3} store opens, got ${q.opens.length}`);
    if (state.counted !== countedAtEnd) fail('end-card taps were counted as gameplay');
    const cta = q.events.filter(e => e === 'CTA_CLICKED').length;
    if (cta !== opensAtEnd + 3) fail(`expected ${opensAtEnd + 3} CTA_CLICKED, got ${cta}`);
    for (const e of ONCE) {
      if (q.events.filter(x => x === e).length > 1) fail(`duplicate ${e}`);
    }
    const ordered = q.events.map(e => (e === 'CHALLENGE_SOLVED' || e === 'CHALLENGE_FAILED' ? 'END' : e)).filter(e => ORDER.includes(e));
    for (let i = 1; i < ordered.length; i++) {
      if (ORDER.indexOf(ordered[i]) < ORDER.indexOf(ordered[i - 1])) fail(`event order ${q.events.join(' > ')}`);
    }
    if (q.events.includes('CHALLENGE_RETRY')) fail('CHALLENGE_RETRY emitted');

    const errors = page.consoleErrors.filter(t => !/mraid\.js|exitapi|ERR_FILE_NOT_FOUND|net::/i.test(String(t)));
    if (errors.length) fail(`console errors: ${errors.join(' | ')}`);

    await page.screenshot(path.join(out, `run${runIndex + 1}-end.png`));
    const rotations = log.filter(l => l.startsWith('rotate')).length;
    const pauses = log.filter(l => /hidden|exposure|luna/.test(l)).length;
    console.log(`${failures.length ? 'FAIL' : 'PASS'}  ${label}: ${log.length} actions (${rotations} rotations, ${pauses} pauses), ${endReason} at counted ${state.counted}, ${state.bucketsDone} buckets; ${q.events.join(' > ')}`);
    for (const f of failures) console.log(`      ✗ ${f}`);
    fs.writeFileSync(path.join(out, `run${runIndex + 1}-log.txt`), log.join('\n'));
    return failures.length === 0;
  } catch (error) {
    console.log(`FAIL  ${label}: ${error.message}`);
    for (const f of failures) console.log(`      ✗ ${f}`);
    fs.writeFileSync(path.join(out, `run${runIndex + 1}-log.txt`), `${error.stack}\n\n${log.join('\n')}`);
    return false;
  } finally {

    let currentUrl;
    try {
      const value = await cdp.send('Runtime.evaluate', { expression: 'location.href', returnByValue: true }, 3000);
      currentUrl = value.result?.value;
    } catch (error) { currentUrl = 'Unavailable: ' + error.message; }
    fs.writeFileSync(path.join(out, `run${runIndex + 1}-navigation.json`), JSON.stringify({ currentUrl, journal: cdp.navigationJournal }, null, 2));
    console.log('NAVIGATION_DIAGNOSTIC ' + JSON.stringify({ run: runIndex + 1, currentUrl, journal: cdp.navigationJournal }));
    cdp.close();
    await browser.close();
  }
}

fs.mkdirSync(out, { recursive: true });
const only = process.argv[4] ? process.argv[4].split(',').map(n => Number(n) - 1) : null;
const indices = only ?? [...Array(RUNS).keys()];
let passed = 0;
for (const i of indices) {
  if (await chaosRun(i)) passed++;
}
console.log(`\n${passed}/${indices.length} chaos runs passed (base seed ${BASE_SEED}).`);
if (passed !== indices.length) process.exitCode = 1;
