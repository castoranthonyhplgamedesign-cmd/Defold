// Focused checks for the supplied audio and its actual mechanic/lifecycle triggers.
// Chrome is muted by cdp.mjs; this verifies source starts/state, not audible device output.
// Run after build:all: QA_GPU=1 node scripts/qa/audio.mjs [case[,case...]]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser, connect, openPage, sleep } from './cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'output/audio-integration-2026-10-29');
const results = [];
const selected = process.argv[2]?.split(',');
const cases = ['tap', 'cut', 'lifecycle', 'mute', 'fail', 'belt', 'swipe', 'fade'];
if (selected?.some(name => !cases.includes(name))) throw new Error(`Unknown case selection: ${selected.join(',')}`);
fs.mkdirSync(out, { recursive: true });
const save = () => fs.writeFileSync(path.join(out, selected ? selected.length === 1 ? `qa-${selected[0]}.json` : 'qa-selected.json' : 'qa.json'), JSON.stringify(results, null, 2));
const check = (ok, message) => { if (!ok) throw new Error(message); };
const audioState = page => page.evaluate('window.__SDP_AUDIO__ ? window.__SDP_AUDIO__() : null');
const starts = (state, id) => state.channels[id]?.starts ?? 0;
const active = (state, id) => (state.channels[id]?.playing ?? 0) + (state.channels[id]?.paused ?? 0);

const mock = `window.__QA_OPEN__=[];window.open=url=>{window.__QA_OPEN__.push(String(url));return {}};
const listeners={};window.mraid={getState:()=> 'default',isViewable:()=>true,
addEventListener:(event,fn)=>(listeners[event]??=[]).push(fn),open:window.open,
fire:(event,...args)=>(listeners[event]??[]).forEach(fn=>fn(...args))};`;
const override = value => `Object.defineProperty(window,'GAME_CONFIG',{configurable:true,get:()=>(${JSON.stringify(value)}),set:()=>{}});`;

async function waitAudio(page, predicate, label, timeout = 3500) {
  const deadline = Date.now() + timeout;
  let state;
  while (Date.now() < deadline) {
    state = await audioState(page);
    if (state && predicate(state)) return state;
    await sleep(35);
  }
  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(state)}`);
}

function validateLayers(audio) {
  for (const id of ['bgm', 'sfx-conveyor', 'sfx-cut', 'sfx-sand']) {
    const channel = audio.channels[id];
    check(channel.capacity === 2 && active(audio, id) <= 2, `${id}: unbounded continuous-layer voices`);
    check(channel.volume >= -0.000001 && channel.volume <= channel.baseVolume + 0.00001,
      `${id}: complementary voices exceeded the logical bed gain`);
    if (active(audio, id) === 2) check(channel.crossfading, `${id}: two voices outside an EOF handover`);
  }
}

function silentGameplay(audio) {
  for (const id of ['sfx-click', 'sfx-cut', 'sfx-sand']) check(starts(audio, id) === 0, `${id} played without a real cut`);
}

async function withPage(label, mechanic, config, run, timeout = 45000) {
  const browser = await launchBrowser();
  const cdp = await connect(browser.wsUrl);
  const timer = setTimeout(() => cdp.close(), timeout);
  const startedAt = Date.now();
  try {
    const dir = path.join(root, 'dist', mechanic === 'tap' ? 'cantreach_default' : 'cantreach_swipe', '90seconds');
    const file = fs.readdirSync(dir).find(name => name.endsWith('_al.html'));
    check(file, `No AppLovin build in ${dir}`);
    const page = await openPage(cdp, { url: pathToFileURL(path.join(dir, file)).href,
      width: 390, height: 844, dpr: 2, mobile: true, touch: true,
      preload: mock + override({ OPENING_GAMEPLAY_ANIMATION: false, SHOW_PACKSHOT: true,
        GAME_LENGTH: { timeLimit: 9999, clickLimit: 9999 }, ...config }) });
    await page.waitFor(s => s.state === 'play', 15000, 'gameplay');
    const details = await run(page, cdp);
    check(page.consoleErrors.length === 0, `Runtime errors: ${page.consoleErrors.join(' | ')}`);
    results.push({ label, pass: true, elapsedMs: Date.now() - startedAt, ...details });
    console.log(`PASS ${label}: ${JSON.stringify(details)}`);
  } catch (error) {
    results.push({ label, pass: false, elapsedMs: Date.now() - startedAt, error: error.stack });
    console.warn(`FAIL ${label}: ${error.message}`);
  } finally {
    clearTimeout(timer);
    cdp.close();
    await browser.close();
    save();
  }
}

async function endcardChecks(page, reason) {
  await page.waitFor(s => s.state === 'endcard', 8000, 'end card');
  let audio = await waitAudio(page, a => starts(a, 'sfx-win') >= 1, 'first end-card pop');
  check(starts(audio, 'sfx-win') === 1, `${reason}: both element pops started at once`);
  check(starts(audio, 'sfx-endcard') === 0, `${reason}: settle pop preceded the element pops`);
  audio = await waitAudio(page, a => starts(a, 'sfx-win') === 2, 'second end-card pop');
  check(starts(audio, 'sfx-endcard') === 0, `${reason}: settle pop preceded the second element pop`);
  audio = await waitAudio(page, a => starts(a, 'sfx-endcard') === 1, 'end-card settle pop');
  audio = await waitAudio(page, a => ['bgm', 'sfx-conveyor', 'sfx-cut', 'sfx-sand'].every(id => active(a, id) === 0), 'end-card background fade');
  for (const id of ['bgm', 'sfx-conveyor', 'sfx-cut', 'sfx-sand']) check(active(audio, id) === 0, `${reason}: ${id} remained on the end card`);
  check(starts(audio, 'sfx-cta') === 0, `${reason}: automatic redirect played a CTA click`);
  const before = await page.evaluate('window.__QA_OPEN__.length');
  check(before === 1, `${reason}: expected one automatic store attempt, got ${before}`);
  await page.tapCss(195, 700);
  await sleep(70);
  audio = await audioState(page);
  check(starts(audio, 'sfx-cta') === 1, `${reason}: explicit CTA did not play exactly one click`);
  await page.tapCss(195, 700);
  await sleep(70);
  check(starts(await audioState(page), 'sfx-cta') === 1, `${reason}: guarded CTA tap played another click`);
  await sleep(450);
  await page.tapCss(195, 700);
  await sleep(70);
  audio = await audioState(page);
  check(starts(audio, 'sfx-cta') === 2, `${reason}: next accepted CTA did not play a click`);
  check(await page.evaluate('window.__QA_OPEN__.length') === before + 2, `${reason}: CTA/store call counts disagree`);
  validateLayers(audio);
  return audio;
}

async function tapCase() {
  await withPage('tap / full clear / bucket and end-card cues', 'tap', {}, async page => {
    let state = await page.state();
    let audio = await audioState(page);
    check(!audio.unlocked && audio.muted, 'Audio unlocked before input');
    check(Object.values(audio.channels).every(c => c.starts === 0), 'Audio autoplayed before input');
    check(state.targets.blocked && state.targets.right, 'No blocked/open tap targets');
    await page.tapDesign(state.targets.blocked.x, state.targets.blocked.y);
    await sleep(650);
    audio = await audioState(page);
    silentGameplay(audio);
    check(starts(audio, 'bgm') === 1 && starts(audio, 'sfx-conveyor') === 1, 'First gesture did not start one music/conveyor loop');
    state = await page.state();
    await page.tapDesign(state.targets.right.x, state.targets.right.y);
    await waitAudio(page, a => starts(a, 'sfx-click') === 1 && starts(a, 'sfx-cut') > 0, 'first real tap sounds');

    const start = Date.now();
    let beltLevel = -1;
    let beltSince = start;
    let taps = 1;
    for (;;) {
      const pair = await page.evaluate('({state:JSON.parse(JSON.stringify(window.__SDP_STATE__)),audio:window.__SDP_AUDIO__()})');
      state = pair.state;
      audio = pair.audio;
      if (state.ended) break;
      check(Date.now() - start < 100000, `Full clear timed out at ${JSON.stringify(state)}`);
      validateLayers(audio);
      check(starts(audio, 'sfx-bells') === state.bucketsDone && starts(audio, 'sfx-woosh') === state.bucketsDone,
        `Full bucket cues not paired at zero count: ${state.bucketsDone}, ${JSON.stringify(audio.channels)}`);
      if (state.belt !== beltLevel) { beltLevel = state.belt; beltSince = Date.now(); }
      const settled = Date.now() - beltSince > 1500;
      if (state.targets.right && state.funnel < 300 && (state.belt <= 55 || settled)) {
        await page.tapDesign(state.targets.right.x, state.targets.right.y);
        taps++;
      }
      await sleep(140);
    }
    check(state.endReason === 'solved' && state.bucketsDone === 31, `Expected solved/31 buckets, got ${JSON.stringify(state)}`);
    check(state.accounted === state.total && !state.integrity, 'Sand/bucket accounting failed');
    audio = await endcardChecks(page, 'solved');
    check(starts(audio, 'sfx-bells') === 31 && starts(audio, 'sfx-woosh') === 31, 'Final bucket effect count changed on the end card');
    check(starts(audio, 'sfx-fail') === 0, 'Solved flow played danger alarm');
    return { taps, buckets: state.bucketsDone, audio };
  }, 125000);
}

async function cutCase() {
  await withPage('swipe / silent invalid input / held stroke / time end', 'cut', { GAME_LENGTH: { timeLimit: 14, clickLimit: 9999 } }, async page => {
    let state = await page.state();
    const initial = state.remaining;
    const hint = state.targets.swipe;
    check(hint, 'No swipe hint');
    await page.tapDesign((hint.x1 + hint.x2) / 2, hint.y1);
    await page.swipeDesign(400, 750, 432, 774, 4, 20);
    await page.swipeDesign(170, 300, 910, 300, 10, 20);
    await sleep(450);
    let audio = await audioState(page);
    silentGameplay(audio);
    check((await page.state()).remaining === initial, 'Invalid input unexpectedly cut sand');
    check(starts(audio, 'bgm') === 1 && starts(audio, 'sfx-conveyor') === 1, 'Swipe first input duplicated/missed background loops');
    const line = (await page.state()).targets.swipe;
    await page.swipeDesign(line.x1, line.y1, line.x2, line.y2, 10, 25);
    await waitAudio(page, a => starts(a, 'sfx-click') === 1 && starts(a, 'sfx-cut') > 0, 'first real stroke');
    const before = starts(await audioState(page), 'sfx-click');
    let heldDone = false;
    let samples = 0;
    const held = page.swipeDesign(170, 712, 910, 712, 60, 35).finally(() => { heldDone = true; });
    while (!heldDone) {
      validateLayers(await audioState(page));
      samples++;
      await sleep(55);
    }
    await held;
    await sleep(180);
    audio = await audioState(page);
    check(starts(audio, 'sfx-click') === before + 1, 'Held stroke did not produce exactly one attack click');
    const driveStart = Date.now();
    while ((state = await page.state()).bucketsDone === 0 && !state.ended && Date.now() - driveStart < 7000) {
      const next = state.targets.swipe;
      if (next && state.funnel < 300) await page.swipeDesign(next.x1, next.y1, next.x2, next.y2, 10, 25);
      await sleep(350);
    }
    check(state.bucketsDone > 0, 'Swipe flow never filled a bucket');
    await page.waitFor(s => s.state === 'endcard', 22000, 'swipe time limit');
    audio = await endcardChecks(page, 'time');
    check(starts(audio, 'sfx-bells') > 0 && starts(audio, 'sfx-bells') === starts(audio, 'sfx-woosh'), 'Swipe bucket layers did not remain paired');
    check(starts(audio, 'sfx-fail') === 0, 'Time limit played danger alarm');
    return { heldSamples: samples, bucketsBeforeEnding: state.bucketsDone, audio };
  });
}

async function lifecycleCase() {
  await withPage('host mute / overlapping pauses / audio overrides', 'cut', {
    AUDIO: { maxEffectVoices: 2 }, CHANGABLE_SOUNDTRACKS: [{ uuid: 'bgm', volume: 0.123 }, { uuid: 'sfx-conveyor', volume: 0.22 }]
  }, async page => {
    await page.evaluate("window.dispatchEvent(new Event('luna:mute'))");
    await page.tapDesign(540, 1800);
    let audio = await audioState(page);
    check(audio.hostMuted && audio.muted, 'First gesture overrode SDK mute');
    check(Math.abs(audio.channels.bgm.baseVolume - 0.123) < 0.000001 && Math.abs(audio.channels['sfx-conveyor'].baseVolume - 0.22) < 0.000001, 'Soundtrack volume override was not consumed');
    await waitAudio(page, a => Math.abs(a.channels.bgm.volume - 0.123) < 0.00001 && Math.abs(a.channels['sfx-conveyor'].volume - 0.22) < 0.00001, 'overridden background gains to complete their attack');
    check(Object.keys(audio.channels).length === 11 && audio.channels['sfx-click'].capacity === 2, 'Array merge or pool-size override lost slots');
    await page.evaluate("window.dispatchEvent(new Event('luna:unmute'))");
    await waitAudio(page, a => !a.muted, 'SDK unmute');
    await page.evaluate("window.dispatchEvent(new Event('luna:pause'))");
    await sleep(150);
    let before = await page.state();
    await page.evaluate("mraid.fire('audioVolumeChange',50)");
    await sleep(250);
    let after = await page.state();
    audio = await audioState(page);
    check(before.frame === after.frame, 'Volume callback resumed Luna-paused gameplay');
    check(audio.channels.bgm.paused === 1 && audio.channels['sfx-conveyor'].paused === 1, 'Luna pause left the audio loops playing');
    await page.evaluate("mraid.fire('exposureChange',0);window.dispatchEvent(new Event('luna:resume'))");
    await sleep(250);
    after = await page.state();
    check(before.frame === after.frame, 'Luna resume overrode zero exposure');
    await page.evaluate("mraid.fire('exposureChange',100)");
    await sleep(220);
    check((await page.state()).frame > after.frame, 'Game did not resume when all pause reasons cleared');
    audio = await audioState(page);
    for (const id of ['bgm', 'sfx-conveyor']) {
      check(audio.channels[id].playing === 1 && audio.channels[id].paused === 0, `${id} did not resume with gameplay`);
    }
    await page.evaluate("window.dispatchEvent(new Event('luna:mute'));Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))");
    await sleep(120);
    await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))");
    await sleep(180);
    audio = await audioState(page);
    check(audio.hostMuted && audio.muted, 'Foregrounding discarded SDK mute');
    check(starts(audio, 'bgm') === 1 && starts(audio, 'sfx-conveyor') === 1, 'Resume restarted/duplicated background loops');
    validateLayers(audio);
    return { audio };
  });
}

async function muteCase() {
  await withPage('MUTE keeps gameplay and CTA silent', 'cut', { MUTE: true, GAME_LENGTH: { timeLimit: 2, clickLimit: 9999 } }, async page => {
    const line = (await page.state()).targets.swipe;
    await page.swipeDesign(line.x1, line.y1, line.x2, line.y2, 10, 20);
    await page.evaluate("window.dispatchEvent(new Event('luna:unmute'))");
    await page.waitFor(s => s.state === 'endcard', 8000, 'muted end card');
    await sleep(650);
    await page.tapCss(195, 700);
    await sleep(100);
    const audio = await audioState(page);
    check(audio.muted && Object.values(audio.channels).every(c => c.starts === 0), 'MUTE allowed an effect/background/CTA sound');
    return { audio };
  });
}

async function failCase() {
  await withPage('danger alarm only on a real jam', 'tap', {
    BELT: { capacity: 400, overflow: 0, stallSeconds: 0 },
    BUCKETS: { start: [1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], waves: [], racks: [] }
  }, async page => {
    let state = await page.state();
    const started = Date.now();
    while (!state.ended && Date.now() - started < 20000) {
      if (state.targets.wrong && state.funnel < 600) await page.tapDesign(state.targets.wrong.x, state.targets.wrong.y);
      await sleep(280);
      state = await page.state();
    }
    check(state.endReason === 'jam', `Expected jam; got ${JSON.stringify(state)}`);
    await endcardChecks(page, 'jam');
    const audio = await audioState(page);
    check(starts(audio, 'sfx-fail') === 1, 'Danger alarm did not play exactly once for jam');
    return { endReason: state.endReason, audio };
  });
}

/** Stop input after one real cut; transport must keep the sand bed alive after the funnel empties. */
async function beltCase() {
  for (const mechanic of ['tap', 'cut']) {
    await withPage(`${mechanic} / belt-only sand / clip restart and natural release`, mechanic, {
      // Slower real transport makes a belt-only interval longer than the supplied 4.23 s pour clip.
      BELT: { speed: 60 }, GAME_LENGTH: { timeLimit: 20, clickLimit: 9999 }
    }, async page => {
      const initial = await page.state();
      if (mechanic === 'tap') {
        check(initial.targets.right, 'No real tap target');
        await page.tapDesign(initial.targets.right.x, initial.targets.right.y);
      } else {
        const line = initial.targets.swipe;
        check(line, 'No real swipe target');
        await page.swipeDesign(line.x1, line.y1, line.x2, line.y2, 10, 25);
      }
      await page.waitFor(s => s.remaining < initial.remaining, 2500, 'the single input to release sand');
      const timing = await page.evaluate('window.GAME_CONFIG_DEFAULTS.AUDIO');
      const releaseMs = timing.flowHoldMs + timing.flowFadeMs + 150;
      const started = Date.now();
      let beltSince = 0;
      let beltStarts = 0;
      let longestBeltMs = 0;
      let samples = 0;
      let restartVerified = false;
      let emptySince = 0;
      let firstBelt;
      let lastBelt;
      let release;
      for (;;) {
        const sample = await page.evaluate(`(() => {
          const state=JSON.parse(JSON.stringify(window.__SDP_STATE__));
          const transport=window.__SDP_DEBUG__().conveyor;
          return {state,audio:window.__SDP_AUDIO__(),transport:transport.count+transport.falling};
        })()`);
        const { state, audio, transport } = sample;
        check(Date.now() - started < 24500, `Transport did not settle/end: ${JSON.stringify(sample)}`);
        validateLayers(audio);
        check(state.counted === 1, 'The belt regression added an unintended second gameplay input');
        const beltOnly = state.state === 'play' && state.loose === 0 && state.funnel === 0 && transport > 0;
        if (beltOnly) {
          if (!beltSince) {
            beltSince = Date.now();
            beltStarts = starts(audio, 'sfx-sand');
            firstBelt = { funnel: state.funnel, loose: state.loose, transport, starts: beltStarts };
          }
          const elapsed = Date.now() - beltSince;
          longestBeltMs = Math.max(longestBeltMs, elapsed);
          if (elapsed > releaseMs) {
            const flowing = audio;
            check(flowing.channels['sfx-sand'].playing >= 1 && flowing.channels['sfx-sand'].capacity === 2,
              `Sand stopped or stacked during belt-only transport: ${JSON.stringify(sample)}`);
            samples++;
            lastBelt = { elapsedMs: elapsed, funnel: state.funnel, loose: state.loose, transport, starts: starts(flowing, 'sfx-sand'), playing: flowing.channels['sfx-sand'].playing };
            if (elapsed >= 5000 && starts(flowing, 'sfx-sand') > beltStarts) restartVerified = true;
          }
        } else {
          beltSince = 0;
        }
        if (state.loose === 0 && transport === 0) {
          if (!emptySince) emptySince = Date.now();
          if (Date.now() - emptySince > releaseMs) {
            check(active(audio, 'sfx-sand') === 0, 'Sand bed did not release after all moving/transport sand drained');
            release = 'naturally drained';
            break;
          }
        } else {
          emptySince = 0;
        }
        if (state.state === 'endcard') {
          await waitAudio(page, a => active(a, 'sfx-sand') === 0 && active(a, 'sfx-conveyor') === 0, 'end-card transport audio cleanup');
          release = 'time-limit end card';
          break;
        }
        await sleep(65);
      }
      check(longestBeltMs >= 5000 && samples > 5, `No sustained belt-only audio interval: ${longestBeltMs} ms / ${samples} samples`);
      check(restartVerified, 'Belt-only sand did not outlast/restart the supplied pour clip');
      return { firstBelt, lastBelt, longestBeltMs, samples, restartVerified, release };
    }, 35000);
  }
}

/** A real cut must start Falling Sand during the drag, without waiting for eight moving grains. */
async function swipeCase() {
  await withPage('swipe / immediate Falling Sand / no gravity threshold delay', 'cut', {
    // A positive, supported gravity so small that quantized grains cannot advance a cell in 4 s.
    // This isolates the cut gesture from the existing physical-movement audio trigger.
    SAND: { gravity: 0.001 }, GAME_LENGTH: { timeLimit: 12, clickLimit: 9999 }
  }, async (page, cdp) => {
    const initial = await page.state();
    await page.swipeDesign(400, 750, 432, 774, 4, 20);
    await page.swipeDesign(170, 300, 910, 300, 8, 20);
    await page.swipeDesign(170, 1700, 910, 1700, 8, 20);
    await sleep(180);
    const invalid = await audioState(page);
    check((await page.state()).remaining === initial.remaining, 'Jitter, wrong-wave, or empty-area input cut sand');
    silentGameplay(invalid);

    const at = (x, y) => page.designToCss(x, y);
    const begin = at(170, 712);
    await page.pressCss(begin.x, begin.y);
    let held = true;
    const move = async x => {
      const point = at(x, 712);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, radiusX: 1, radiusY: 1, force: 1, id: 1 }] });
    };
    const sample = () => page.evaluate(`(() => {
      const state=JSON.parse(JSON.stringify(window.__SDP_STATE__));
      const transport=window.__SDP_DEBUG__().conveyor;
      return {state,audio:window.__SDP_AUDIO__(),transport:transport.count+transport.falling};
    })()`);
    let first;
    let last;
    let heldSamples = 0;
    const beganMoving = Date.now();
    try {
      await move(240); // Exceeds the 60-design-pixel swipe threshold while the finger stays down.
      await page.waitFor(s => s.remaining < initial.remaining, 1000, 'successful held drag to cut sand');
      await waitAudio(page, a => a.channels['sfx-cut'].playing >= 1, 'Falling Sand before physical movement', 1000);
      first = await sample();
      check(first.state.loose > 0 && first.state.removedPct === 0 && first.state.funnel === 0 && first.transport === 0,
        `The first swipe sound was not isolated from falling/transport: ${JSON.stringify(first)}`);
      const firstStarts = starts(first.audio, 'sfx-cut');
      for (let step = 1; step <= 50; step++) {
        await move(240 + (910 - 240) * step / 50);
        await sleep(64);
        const current = await sample();
        validateLayers(current.audio);
        check(current.audio.channels['sfx-cut'].playing >= 1, 'Falling Sand stopped during the held cutting gesture');
        check(current.state.removedPct === 0 && current.state.funnel === 0 && current.transport === 0,
          'Physical falling/transport contaminated the held-swipe regression');
        check(starts(current.audio, 'sfx-sand') === 0, 'A stationary pile incorrectly started the separate pour layer');
        heldSamples++;
        last = current;
      }
      check(starts(last.audio, 'sfx-cut') > firstStarts, 'Held cutting did not outlast/restart the Falling Sand clip');
      const heldMs = Date.now() - beganMoving;
      const finish = at(910, 712);
      await page.releaseCss(finish.x, finish.y);
      held = false;
      const timing = await page.evaluate('window.GAME_CONFIG_DEFAULTS.AUDIO');
      await sleep(timing.flowHoldMs + timing.flowFadeMs + 180);
      const afterRelease = await audioState(page);
      check(active(afterRelease, 'sfx-cut') === 0, 'Falling Sand did not release after the gesture stopped and grains remained stationary');
      return { initialRemaining: initial.remaining, firstRemaining: first.state.remaining,
        firstLoose: first.state.loose, firstCutStarts: firstStarts, heldSamples,
        heldMs, lastRemaining: last.state.remaining,
        finalCutStarts: starts(last.audio, 'sfx-cut'), maxCutVoices: last.audio.channels['sfx-cut'].capacity,
        removedPct: last.state.removedPct, funnel: last.state.funnel, transport: last.transport,
        stoppedAfterRelease: active(afterRelease, 'sfx-cut') === 0 };
    } finally {
      if (held) {
        const point = at(910, 712);
        await page.releaseCss(point.x, point.y).catch(() => undefined);
      }
    }
  }, 22000);
}

/** Read actual per-voice gain/seek, rather than trusting a controller's requested state. */
function gainSample(audio, id) {
  const channel = audio.channels[id];
  const voices = channel.voices.filter(v => v.playing || v.paused);
  const volume = voices.reduce((sum, voice) => sum + voice.volume, 0);
  check(Math.abs(volume - channel.volume) < 0.00001, `${id}: reported gain disagrees with active voices`);
  return { volume, normalized: channel.baseVolume > 0 ? volume / channel.baseVolume : 0,
    starts: starts(audio, id), playing: channel.playing, paused: channel.paused,
    loopStart: channel.loopStart, loopEnd: channel.loopEnd,
    voices: voices.map(v => ({ volume: v.volume, seek: v.seek, duration: v.duration, weight: v.weight })) };
}

function steadyCrossfade(audio, id, proof) {
  validateLayers(audio);
  const sample = gainSample(audio, id);
  check(sample.normalized > 0.88, `${id}: a gain hole appeared in continuous playback: ${JSON.stringify(sample)}`);
  proof.minimumGain = Math.min(proof.minimumGain, sample.normalized);
  proof.maximumGain = Math.max(proof.maximumGain, sample.normalized);
  if (sample.playing === 2 && sample.voices.every(v => v.volume > 0.00001)) {
    const sorted = sample.voices.slice().sort((a, b) => a.seek - b.seek);
    check(sorted[0].seek < sample.loopStart + 0.6 && sorted[1].seek > sample.loopEnd - 0.6,
      `${id}: overlap was not an end-to-start handover: ${JSON.stringify(sample)}`);
    if (!proof.handovers.some(h => h.starts === sample.starts)) proof.handovers.push(sample);
    proof.overlapSamples++;
  }
  return sample;
}

async function fadeCase() {
  const clip = `data:audio/mpeg;base64,${fs.readFileSync(path.join(root, 'Assets/Runtime/audio/sfx-cut.mp3')).toString('base64')}`;
  const tuning = { flowFadeInMs: 400, flowHoldMs: 160, flowFadeMs: 600, loopCrossfadeMs: 240 };
  await withPage('fade / cutting attack, reversal, EOF crossfades and paused overlap', 'cut', {
    SAND: { gravity: 0.001 }, AUDIO: tuning, GAME_LENGTH: { timeLimit: 18, clickLimit: 9999 },
    CHANGABLE_SOUNDTRACKS: [{ uuid: 'bgm', path: clip, volume: 0.12, loop: true }, { uuid: 'sfx-conveyor', path: clip, volume: 0.08, loop: true }]
  }, async (page, cdp) => {
    const at = x => page.designToCss(x, 712);
    const point = at(170);
    await page.pressCss(point.x, point.y);
    let held = true;
    const move = async x => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...at(x), id: 1, radiusX: 1, radiusY: 1, force: 1 }] });
    const proofs = Object.fromEntries(['sfx-cut', 'bgm', 'sfx-conveyor'].map(id => [id, { minimumGain: Infinity, maximumGain: 0, overlapSamples: 0, handovers: [] }]));
    try {
      await move(240);
      await waitAudio(page, a => a.channels['sfx-cut'].playing > 0, 'cut attack');
      const first = gainSample(await audioState(page), 'sfx-cut');
      check(first.normalized < 0.7, `Cut attack snapped straight to full level: ${JSON.stringify(first)}`);
      for (let step = 1; step <= 12; step++) { await move(240 + 100 * step / 12); await sleep(40); }
      const full = gainSample(await audioState(page), 'sfx-cut');
      check(full.normalized > 0.95, 'Cut attack did not reach its target level');

      // No new cut cells: let the activity release begin, then resume this same held gesture.
      await sleep(tuning.flowHoldMs + tuning.flowFadeMs * 0.4);
      const releasing = gainSample(await audioState(page), 'sfx-cut');
      check(releasing.normalized > 0.05 && releasing.normalized < 0.9, `No observable smooth release: ${JSON.stringify(releasing)}`);
      await move(400);
      await sleep(35);
      const reversing = gainSample(await audioState(page), 'sfx-cut');
      check(reversing.normalized >= releasing.normalized - 0.05 && reversing.normalized < 0.95,
        `Activity resume jumped or fell instead of reversing from the current gain: ${JSON.stringify({ releasing, reversing })}`);
      check(reversing.normalized - releasing.normalized < 0.25, 'Mid-release activity snapped to full volume');
      check(reversing.starts === releasing.starts, 'Mid-release activity unnecessarily restarted its source');
      for (let step = 1; step <= 12; step++) { await move(400 + 100 * step / 12); await sleep(40); }

      let pauseVerified = false;
      for (let step = 1; step <= 80; step++) {
        await move(500 + 360 * step / 80);
        await sleep(40);
        const audio = await audioState(page);
        for (const id of Object.keys(proofs)) steadyCrossfade(audio, id, proofs[id]);
        if (!pauseVerified && audio.channels['sfx-cut'].playing === 2) {
          await page.evaluate("window.dispatchEvent(new Event('luna:pause'))");
          const before = await audioState(page);
          check(before.channels['sfx-cut'].playing === 0 && before.channels['sfx-cut'].paused === 2, 'Both overlap voices did not pause');
          await sleep(140);
          const after = await audioState(page);
          for (let i = 0; i < 2; i++) {
            check(Math.abs(after.channels['sfx-cut'].voices[i].seek - before.channels['sfx-cut'].voices[i].seek) < 0.002,
              'Paused crossfade voices advanced their audio clocks');
          }
          const resumed = await page.evaluate("window.dispatchEvent(new Event('luna:resume'));window.__SDP_AUDIO__()");
          validateLayers(resumed);
          check(starts(resumed, 'sfx-cut') === starts(before, 'sfx-cut'), 'Pause/resume duplicated crossfade sources');
          await page.evaluate("window.dispatchEvent(new Event('luna:mute'))");
          await waitAudio(page, a => a.muted, 'SDK mute during the handover');
          await page.evaluate("window.dispatchEvent(new Event('luna:unmute'))");
          await waitAudio(page, a => !a.muted, 'SDK unmute during the handover');
          pauseVerified = true;
        }
      }
      check(pauseVerified, 'Never observed an overlap to pause');
      for (const [id, proof] of Object.entries(proofs)) check(proof.handovers.length >= 2, `${id}: did not observe two end-to-start handovers`);
      const end = at(860);
      await page.releaseCss(end.x, end.y);
      held = false;
      const release = [];
      const stoppedAt = Date.now();
      let previousGain = 1.01;
      for (;;) {
        const audio = await audioState(page);
        const sample = gainSample(audio, 'sfx-cut');
        validateLayers(audio);
        check(sample.normalized <= previousGain + 0.025, 'The released layer rose during its fade-out');
        previousGain = sample.normalized;
        release.push({ ms: Date.now() - stoppedAt, gain: sample.normalized });
        if (active(audio, 'sfx-cut') === 0) break;
        check(Date.now() - stoppedAt < 1600, 'Cut fade did not stop');
        await sleep(25);
      }
      check(release.filter(s => s.gain > 0.05 && s.gain < 0.95).length >= 3, 'Cut release was not gradual');
      return { first, full, releasing, reversing, proofs, pauseVerified, release };
    } finally {
      if (held) { const end = at(860); await page.releaseCss(end.x, end.y).catch(() => undefined); }
    }
  }, 30000);

  await withPage('fade / transported sand EOF crossfades, natural release and end card', 'tap', {
    AUDIO: tuning, BELT: { speed: 60 }, GAME_LENGTH: { timeLimit: 15, clickLimit: 9999 }
  }, async page => {
    const target = (await page.state()).targets.right;
    await page.tapDesign(target.x, target.y);
    await waitAudio(page, a => a.channels['sfx-sand'].playing > 0, 'pour attack');
    const first = gainSample(await audioState(page), 'sfx-sand');
    check(first.normalized < 0.7, 'Pour attack snapped to full level');
    const proof = { minimumGain: Infinity, maximumGain: 0, overlapSamples: 0, handovers: [] };
    const release = [];
    const started = Date.now();
    let drainAt = 0;
    let previousGain = 1.01;
    for (;;) {
      const pair = await page.evaluate('({state:JSON.parse(JSON.stringify(window.__SDP_STATE__)),audio:window.__SDP_AUDIO__(),transport:window.__SDP_DEBUG__().conveyor})');
      const transporting = pair.transport.count + pair.transport.falling > 0 || pair.state.loose > 0;
      validateLayers(pair.audio);
      if (transporting) {
        if (Date.now() - started > tuning.flowFadeInMs + 150 && pair.state.funnel === 0 && pair.state.loose === 0) {
          steadyCrossfade(pair.audio, 'sfx-sand', proof);
        }
      } else {
        if (!drainAt) drainAt = Date.now();
        const sample = gainSample(pair.audio, 'sfx-sand');
        check(sample.normalized <= previousGain + 0.025, 'The pour level rose after all sand drained');
        previousGain = sample.normalized;
        release.push({ ms: Date.now() - drainAt, gain: sample.normalized });
        if (active(pair.audio, 'sfx-sand') === 0) break;
      }
      check(Date.now() - started < 14500, 'Transport did not drain before the end-card cleanup probe');
      await sleep(30);
    }
    check(proof.handovers.length >= 2 && proof.overlapSamples > 2, 'Did not observe repeated pour EOF handovers');
    check(release.filter(s => s.gain > 0.05 && s.gain < 0.95).length >= 3, 'Natural pour release was not gradual');
    await page.waitFor(s => s.state === 'endcard', 6000, 'fade-probe end card');
    const musicBefore = gainSample(await audioState(page), 'bgm');
    await sleep(80);
    const musicDuring = gainSample(await audioState(page), 'bgm');
    check(musicDuring.normalized > 0 && musicDuring.normalized < musicBefore.normalized, 'End-card music did not fade smoothly');
    const ended = await endcardChecks(page, 'fade probe');
    return { first, proof, release, musicBefore, musicDuring, stoppedOnEndcard: active(ended, 'bgm') === 0 };
  }, 30000);

  const shortClip = `data:audio/mpeg;base64,${fs.readFileSync(path.join(root, 'Assets/Runtime/audio/sfx-cta.mp3')).toString('base64')}`;
  await withPage('fade / loop-false overrides remain one-shot per activity period', 'cut', {
    SAND: { gravity: 0.001 }, GAME_LENGTH: { timeLimit: 12, clickLimit: 9999 },
    CHANGABLE_SOUNDTRACKS: ['bgm', 'sfx-conveyor', 'sfx-cut'].map(uuid => ({ uuid, path: shortClip, loop: false }))
  }, async (page, cdp) => {
    const at = x => page.designToCss(x, 712);
    const move = x => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...at(x), id: 1 }] });
    const start = at(170);
    await page.pressCss(start.x, start.y);
    for (let step = 1; step <= 35; step++) { await move(240 + 210 * step / 35); await sleep(40); }
    const once = await audioState(page);
    for (const id of ['bgm', 'sfx-conveyor', 'sfx-cut']) {
      check(starts(once, id) === 1 && active(once, id) === 0, `${id}: loop:false did not finish exactly one source`);
    }
    let end = at(450);
    await page.releaseCss(end.x, end.y);
    const timing = await page.evaluate('window.GAME_CONFIG_DEFAULTS.AUDIO');
    await sleep(timing.flowHoldMs + timing.flowFadeMs + 150);
    const next = at(500);
    await page.pressCss(next.x, next.y);
    await move(580);
    const again = await waitAudio(page, a => starts(a, 'sfx-cut') === 2, 'one-shot layer in a new activity period');
    end = at(580);
    await page.releaseCss(end.x, end.y);
    check(starts(again, 'bgm') === 1 && starts(again, 'sfx-conveyor') === 1, 'A later gesture restarted loop:false background beds');
    return { once: Object.fromEntries(['bgm', 'sfx-conveyor', 'sfx-cut'].map(id => [id, starts(once, id)])), nextCutStarts: starts(again, 'sfx-cut') };
  }, 15000);
}

for (const [name, run] of [['tap', tapCase], ['cut', cutCase], ['lifecycle', lifecycleCase], ['mute', muteCase], ['fail', failCase], ['belt', beltCase], ['swipe', swipeCase], ['fade', fadeCase]]) {
  if (!selected || selected.includes(name)) await run();
}
console.log(`${results.filter(r => r.pass).length}/${results.length} focused audio cases passed.`);
if (results.some(r => !r.pass)) process.exitCode = 1;
