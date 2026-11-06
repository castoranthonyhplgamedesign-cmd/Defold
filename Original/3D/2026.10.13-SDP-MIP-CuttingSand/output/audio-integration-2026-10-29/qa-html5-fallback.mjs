// Muted HTML5 fallback source-state checks; no audible-output claim.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser, connect, openPage, sleep } from '../../scripts/qa/cdp.mjs';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../..');
const results = [];
const ids = ['bgm', 'sfx-conveyor', 'sfx-cut', 'sfx-sand'];
const check = (ok, message) => { if (!ok) throw new Error(message); };
const clip = `data:audio/mpeg;base64,${fs.readFileSync(path.join(root, 'Assets/Runtime/audio/sfx-cut.mp3')).toString('base64')}`;
const tuning = { flowFadeInMs: 350, flowHoldMs: 160, flowFadeMs: 550, loopCrossfadeMs: 240 };
const override = config => `Object.defineProperty(window,'GAME_CONFIG',{configurable:true,get:()=>(${JSON.stringify(config)}),set:()=>{}});`;
const preload = `
Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:undefined});
Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:undefined});
window.__QA_TAGS__=[];const NativeAudio=window.Audio;
window.Audio=function(...args){const tag=new NativeAudio(...args);window.__QA_TAGS__.push(tag);return tag;};
window.Audio.prototype=NativeAudio.prototype;
window.__QA_OPEN__=[];window.open=url=>{window.__QA_OPEN__.push(String(url));return {};};
const listeners={};window.mraid={getState:()=> 'default',isViewable:()=>true,
addEventListener:(event,fn)=>(listeners[event]??=[]).push(fn),open:window.open,
fire:(event,...args)=>(listeners[event]??[]).forEach(fn=>fn(...args))};`;
const sample = page => page.evaluate(`({state:JSON.parse(JSON.stringify(window.__SDP_STATE__)),
audio:window.__SDP_AUDIO__(),tags:window.__QA_TAGS__.map(t=>({name:t.dataset.name,locked:t.dataset.locked,
used:t.dataset.used,paused:t.paused,ended:t.ended,time:t.currentTime,duration:t.duration,volume:t.volume,muted:t.muted}))})`);
const active = c => c.playing + c.paused;

async function wait(page, predicate, label, timeout = 4000) {
  const until = Date.now() + timeout;
  let last;
  while (Date.now() < until) {
    last = await sample(page);
    if (predicate(last)) return last;
    await sleep(25);
  }
  throw new Error(`${label}: ${JSON.stringify(last)}`);
}

function validate(s) {
  for (const id of ids) {
    const channel = s.audio.channels[id];
    const tags = s.tags.filter(t => t.name?.startsWith(id) && /^\d\d$/.test(t.name.slice(id.length)));
    check(tags.length === 2 && channel.capacity === 2, `${id}: missing distinct HTML5 tags`);
    check(active(channel) <= 2, `${id}: voice count exceeded pool`);
    check(channel.volume >= -0.000001 && channel.volume <= channel.baseVolume + 0.00001, `${id}: controller gain exceeded base`);
    const used = tags.filter(t => t.used === 'true');
    check(used.length <= 2, `${id}: tag pool overflow`);
    check(used.reduce((sum, t) => sum + t.volume, 0) <= channel.baseVolume + 0.00001, `${id}: actual HTML5 tag gain exceeded base`);
  }
}

function record(s, id, proof) {
  validate(s);
  const c = s.audio.channels[id];
  const gain = c.baseVolume ? c.volume / c.baseVolume : 0;
  check(c.playing > 0 && gain > 0.87, `${id}: sustained controller gain hole ${JSON.stringify(c)}`);
  proof.minimumGain = Math.min(proof.minimumGain, gain);
  proof.maximumGain = Math.max(proof.maximumGain, gain);
  const actual = s.tags.filter(t => t.name?.startsWith(id) && t.used === 'true' && !t.paused && !t.ended);
  const actualGain = actual.reduce((sum, t) => sum + t.volume, 0) / c.baseVolume;
  check(actualGain > 0.87, `${id}: active HTML5 tag gain hole ${JSON.stringify(actual)}`);
  proof.minimumActualGain = Math.min(proof.minimumActualGain, actualGain);
  if (c.crossfading && c.playing === 2 && actual.length === 2 && actual.every(t => t.volume > 0.00001)) {
    if (!proof.handovers.some(h => h.starts === c.starts)) proof.handovers.push({ starts: c.starts, gain, actualGain,
      tags: actual.map(t => ({ name: t.name, time: t.time, volume: t.volume })) });
    proof.overlapSamples++;
  }
}

async function run(label, mechanic, config, test) {
  const browser = await launchBrowser();
  const cdp = await connect(browser.wsUrl);
  const timer = setTimeout(() => cdp.close(), 45000);
  const start = Date.now();
  try {
    const dir = path.join(root, 'dist', mechanic === 'tap' ? 'cantreach_default' : 'cantreach_swipe', '90seconds');
    const filename = fs.readdirSync(dir).find(name => name.endsWith('_al.html'));
    const page = await openPage(cdp, { url: pathToFileURL(path.join(dir, filename)).href,
      width: 390, height: 844, dpr: 2, mobile: true, touch: true,
      preload: preload + override({ OPENING_GAMEPLAY_ANIMATION: false, SHOW_PACKSHOT: true,
        AUDIO: tuning, GAME_LENGTH: { timeLimit: 16, clickLimit: 9999 },
        CHANGABLE_SOUNDTRACKS: ['bgm', 'sfx-conveyor'].map(uuid => ({ uuid, path: clip, volume: uuid === 'bgm' ? 0.12 : 0.08, loop: true })), ...config }) });
    await page.waitFor(s => s.state === 'play', 16000, 'HTML5 game boot');
    const initial = await sample(page);
    check(initial.tags.length === 36, `Expected 8 sustained +28 short-effect tags, got ${initial.tags.length}`);
    check(!initial.audio.unlocked && Object.values(initial.audio.channels).every(c => c.starts === 0), 'Fallback autoplayed');
    const detail = await test(page, cdp);
    check(page.consoleErrors.length === 0, `Runtime errors: ${page.consoleErrors.join(' | ')}`);
    results.push({ label, pass: true, elapsedMs: Date.now() - start, ...detail });
    console.log(`PASS ${label}: ${JSON.stringify(detail)}`);
  } catch (error) {
    results.push({ label, pass: false, elapsedMs: Date.now() - start, error: error.stack });
    console.warn(`FAIL ${label}: ${error.message}`);
  } finally {
    clearTimeout(timer);
    cdp.close();
    await browser.close();
    fs.writeFileSync(path.join(out, 'qa-html5-fallback.json'), JSON.stringify(results, null, 2));
  }
}

await run('HTML5 / held cut, repeated EOF overlaps, SDK pause and end card', 'cut', { SAND: { gravity: 0.001 } }, async (page, cdp) => {
  await page.swipeDesign(170, 1700, 900, 1700, 8, 20);
  await sleep(300);
  const firstSwipe = await sample(page);
  const firstSwipeLockedTags = firstSwipe.tags.filter(t => t.locked === 'true').length;
  const firstSwipeStarts = Object.fromEntries(ids.map(id => [id, firstSwipe.audio.channels[id].starts]));
  await page.tapDesign(540, 1800);
  await wait(page, s => s.audio.channels.bgm.playing > 0 && s.tags.every(t => t.locked === 'false'), 'HTML5 tap unlock');
  const at = x => page.designToCss(x, 712);
  const move = x => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...at(x), id: 1, radiusX: 1, radiusY: 1, force: 1 }] });
  const begin = at(170);
  await page.pressCss(begin.x, begin.y);
  let held = true;
  const proofs = Object.fromEntries(['bgm', 'sfx-conveyor', 'sfx-cut'].map(id => [id, { minimumGain: Infinity, maximumGain: 0, minimumActualGain: Infinity, overlapSamples: 0, handovers: [] }]));
  let pauseVerified = false;
  try {
    await move(240);
    const attack = await wait(page, s => s.audio.channels['sfx-cut'].playing > 0, 'HTML5 cut attack');
    check(attack.audio.channels['sfx-cut'].volume < 0.8 * 0.8, 'HTML5 attack jumped to full gain');
    for (let step = 1; step <= 95; step++) {
      await move(240 + 620 * step / 95);
      await sleep(70);
      const s = await sample(page);
      if (step > 8) for (const id of Object.keys(proofs)) record(s, id, proofs[id]);
      if (!pauseVerified && s.audio.channels['sfx-cut'].playing === 2) {
        await page.evaluate("window.dispatchEvent(new Event('luna:pause'))");
        const paused = await sample(page);
        check(paused.audio.channels['sfx-cut'].paused === 2, 'HTML5 overlap voices did not both pause');
        await sleep(180);
        const after = await sample(page);
        for (let i = 0; i < 2; i++) check(Math.abs(after.audio.channels['sfx-cut'].voices[i].seek - paused.audio.channels['sfx-cut'].voices[i].seek) < 0.005, 'Paused HTML5 seek advanced');
        await page.evaluate("window.dispatchEvent(new Event('luna:resume'))");
        const resumed = await sample(page);
        check(resumed.audio.channels['sfx-cut'].starts === paused.audio.channels['sfx-cut'].starts, 'HTML5 resume started new voices');
        check(resumed.audio.channels['sfx-cut'].playing === 2, 'HTML5 resume lost overlap voices');
        validate(resumed);
        pauseVerified = true;
      }
    }
    for (const [id, proof] of Object.entries(proofs)) check(proof.handovers.length >= 2, `${id}: did not capture repeated HTML5 tag overlaps`);
    check(pauseVerified, 'No HTML5 overlap paused');
    await page.releaseCss(at(860).x, at(860).y);
    held = false;
    let previous = 1.01;
    const release = [];
    const stopAt = Date.now();
    while (Date.now() - stopAt < 1800) {
      const s = await sample(page);
      validate(s);
      const c = s.audio.channels['sfx-cut'];
      const gain = c.volume / c.baseVolume;
      check(gain <= previous + 0.025, 'HTML5 release gain rose');
      previous = gain;
      release.push({ ms: Date.now() - stopAt, gain });
      if (active(c) === 0) break;
      await sleep(30);
    }
    check(previous === 0 && release.filter(s => s.gain > 0.05 && s.gain < 0.95).length >= 3, 'HTML5 cut release did not fade to zero');
    await page.waitFor(s => s.state === 'endcard', 10000, 'HTML5 end card');
    const ended = await wait(page, s => ids.every(id => active(s.audio.channels[id]) === 0), 'HTML5 end-card release');
    validate(ended);
    return { firstSwipeLockedTags, firstSwipeStarts, proofs, pauseVerified, release, endcardStopped: true };
  } finally {
    if (held) await page.releaseCss(at(860).x, at(860).y).catch(() => undefined);
  }
});

await run('HTML5 / belt sand repeated EOF overlaps and natural release', 'tap', { BELT: { speed: 60 } }, async page => {
  await page.tapDesign(540, 1800);
  await wait(page, s => s.audio.channels.bgm.playing > 0, 'HTML5 background unlock');
  const target = (await page.state()).targets.right;
  await page.tapDesign(target.x, target.y);
  await wait(page, s => s.audio.channels['sfx-sand'].playing > 0, 'HTML5 transported sand');
  const proof = { minimumGain: Infinity, maximumGain: 0, minimumActualGain: Infinity, overlapSamples: 0, handovers: [] };
  const began = Date.now();
  let emptyAt = 0;
  let previous = 1.01;
  const release = [];
  while (Date.now() - began < 15500) {
    const s = await sample(page);
    const transport = await page.evaluate('window.__SDP_DEBUG__().conveyor');
    const moving = s.state.loose > 0 || transport.count + transport.falling > 0;
    validate(s);
    if (moving && Date.now() - began > 700 && s.state.loose === 0 && s.state.funnel === 0) record(s, 'sfx-sand', proof);
    if (!moving) {
      if (!emptyAt) emptyAt = Date.now();
      const gain = s.audio.channels['sfx-sand'].volume / s.audio.channels['sfx-sand'].baseVolume;
      check(gain <= previous + 0.025, 'HTML5 sand rose after draining');
      previous = gain;
      release.push({ ms: Date.now() - emptyAt, gain });
      if (active(s.audio.channels['sfx-sand']) === 0) break;
    }
    await sleep(35);
  }
  check(proof.handovers.length >= 2, 'HTML5 sand did not overlap twice');
  check(previous === 0 && release.filter(s => s.gain > 0.05 && s.gain < 0.95).length >= 3, 'HTML5 sand did not release naturally');
  return { proof, release };
});

console.log(`${results.filter(r => r.pass).length}/${results.length} HTML5 cases passed (browser audio muted).`);
if (results.some(r => !r.pass)) process.exitCode = 1;
