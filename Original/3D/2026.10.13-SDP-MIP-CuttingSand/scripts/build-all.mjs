// One Vite build → per-version, per-iteration, per-network playables in dist/<concept>/<length>/,
// plus dist/GAME_CONFIG.md. Versions (VERSIONS) differ only in their config's MECHANIC and ship
// under their own concept name. Every output is self-checked against the AGENTS.md ship rules; any
// failure fails the build.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const tempDir = path.join(root, '.build-temp');
const distDir = path.join(root, 'dist');
// Hand-off folder: dist/<HANDOFF_FOLDER>/<v1|v2>/Source Files/ holds the AppLovin build of every
// iteration of each version.
const HANDOFF_FOLDER = '2026.10.13 SDP, MIP, Cantreach';
const SOURCE_FILES_NETWORK = 'al';
const sourceFilesDir = version => path.join(distDir, HANDOFF_FOLDER, version.delivery, 'Source Files');
const runtimeDir = path.join(root, 'Assets/Runtime');
const projectDefaults = JSON.parse(fs.readFileSync(path.join(root, 'src/projectDefaults.json'), 'utf8'));
const ITERATIONS = JSON.parse(fs.readFileSync(path.join(root, 'src/iterations.json'), 'utf8'));

// Versions: the same game with its config's MECHANIC set, told apart in the file name by the
// sub-concept; `folder` is its dist folder (dist/<folder>/<length>/), `delivery` its hand-off folder.
const VERSIONS = [
  { mechanic: 'tap', subConceptName: 'default', folder: 'cantreach_default', delivery: 'v1' }, // tap a shape to clear it
  { mechanic: 'cut', subConceptName: 'swipe', folder: 'cantreach_swipe', delivery: 'v2' } // swipe: everything below the line falls
];

const NAMING = {
  threeLc: 'sdp',
  creativeType: 'mip',
  vendor: 'grhpl',
  conceptName: 'cantreach',
  gameplay: 'real',
  ugc: 'nougc',
  seasonal: 'noseason',
  language: 'en',
  size: 'na'
};

const NETWORKS = [
  { tag: 'al', name: 'applovin', inject: 'mraid', zip: false, included: true },
  { tag: 'gg', name: 'google', inject: 'exitapi', zip: true, included: true },
  { tag: 'is', name: 'ironsource', inject: 'mraid', zip: false, included: true },
  { tag: 'mtg', name: 'mintegral', inject: 'mtg', zip: true, included: true },
  { tag: 'fb', name: 'facebook', inject: '', zip: false, included: true },
  { tag: 'un', name: 'unity', inject: 'mraid', zip: false, included: true },
  { tag: 'vu', name: 'vungle', inject: 'vungle', zip: true, included: true },
  { tag: 'mo', name: 'moloco', inject: '', zip: false, included: true },
  { tag: 'tt', name: 'tiktok', inject: 'tiktok', zip: false, included: false },
  { tag: 'lf', name: 'liftoff', inject: 'mraid', zip: false, included: true }
];

const EXIT_API_URL = 'https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js';
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_CONFIG_BYTES = 100 * 1024;
const START = '/*__INLINE_GAME_CONFIG_START__*/';
const END = '/*__INLINE_GAME_CONFIG_END__*/';

const MIME_BY_EXT = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav'
};

function lower(value) {
  return String(value).toLowerCase();
}

function buildBase() {
  fs.rmSync(tempDir, { recursive: true, force: true });
  execFileSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', tempDir, '--emptyOutDir'], {
    cwd: root,
    stdio: 'inherit'
  });
}

function dataUri(file) {
  const mime = MIME_BY_EXT[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

/** Bundled bytes for every slot, keyed by its stable uuid. */
function changeableAssets() {
  const assets = {};
  for (const texture of projectDefaults.CHANGABLE_TEXTURES) {
    const file = path.join(runtimeDir, 'images', `${texture.uuid}.${texture.format}`);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing runtime texture ${file}; run npm run prepare:assets`);
    }
    assets[texture.uuid] = dataUri(file);
  }
  for (const sound of projectDefaults.CHANGABLE_SOUNDTRACKS) {
    const file = path.join(runtimeDir, 'audio', `${sound.uuid}.${sound.format}`);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing runtime audio ${file}; run npm run prepare:assets`);
    }
    assets[sound.uuid] = dataUri(file);
  }
  return assets;
}

function configFor(version, iteration) {
  const config = JSON.parse(JSON.stringify(projectDefaults));
  config.MECHANIC = version.mechanic;
  config.GAME_LENGTH.clickLimit = iteration.clickLimit;
  config.GAME_LENGTH.timeLimit = iteration.timeLimit;
  config.CHANGABLE_TEXTURES = config.CHANGABLE_TEXTURES.map(texture => ({ ...texture, path: '' }));
  config.CHANGABLE_SOUNDTRACKS = config.CHANGABLE_SOUNDTRACKS.map(sound => ({ ...sound, path: '' }));
  return config;
}

function inlineScriptFor(version, iteration, assetsJson) {
  return `<script>
${START}
const GAME_CONFIG_DEFAULTS = ${JSON.stringify(configFor(version, iteration), null, 2)};
${END}
window.GAME_CONFIG_DEFAULTS = GAME_CONFIG_DEFAULTS;
window.__CHANGEABLE_ASSETS__ = ${assetsJson};
</script>
<script>
window.GAME_CONFIG = window.GAME_CONFIG_DEFAULTS;
</script>`;
}

function transformHtml(baseHtml, network, version, iteration, assetsJson) {
  let html = baseHtml
    .replace(/<meta\s+charset=["'][^"']*["']\s*\/?>\s*/i, '')
    .replace(/<meta\s+name=["']network["'][^>]*>\s*/i, '')
    .replace(/\s+type=["']module["']/g, '')
    .replace(/\s+crossorigin(?:=["'][^"']*["'])?(?=[\s>])/g, '');

  const head = ['<meta charset="UTF-8">', `<meta name="network" content="${network.name}">`];
  if (network.inject === 'mraid') {
    head.push('<script src="mraid.js"></script>');
  }
  if (network.inject === 'exitapi') {
    head.push(`<script type="text/javascript" src="${EXIT_API_URL}"></script>`);
  }
  if (network.inject === 'vungle') {
    head.push('<script>window.__VUNGLE__=true;</script>');
  }
  if (network.inject === 'tiktok') {
    head.push('<script>window.__TIKTOK__=true;</script>');
  }
  head.push(inlineScriptFor(version, iteration, assetsJson));

  html = html.replace(/<head>/i, `<head>\n${head.join('\n')}`);
  if (network.inject === 'mtg') {
    html = html.replace(/<body>/i, '<body onload="gameReady()">');
  }
  if (network.tag === 'un') {
    html = html.replace(/window\.top/g, 'window.self');
  }
  return html;
}

function filename(network, version, iteration) {
  return [
    NAMING.threeLc,
    NAMING.creativeType,
    NAMING.vendor,
    NAMING.conceptName,
    version.subConceptName,
    NAMING.gameplay,
    NAMING.ugc,
    NAMING.seasonal,
    NAMING.language,
    iteration.length,
    NAMING.size,
    network.tag
  ].map(lower).join('_');
}

async function zipBuffer(html) {
  const zip = new JSZip();
  zip.file('index.html', html);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
}

// ─── Self-check ─────────────────────────────────────────────────────────────

function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

function checkOutput(html, network, version, iteration, bytes) {
  const problems = [];
  const expect = (ok, message) => {
    if (!ok) problems.push(message);
  };

  expect(bytes < MAX_BYTES, `size ${bytes} >= 5 MB`);
  expect(html.startsWith('<!DOCTYPE html>'), 'does not start with <!DOCTYPE html>');
  expect(/<html[^>]*>\s*<head>/i.test(html), '<html><head> not at document start');
  const headEnd = html.search(/<\/head>/i);
  const headHtml = html.slice(0, headEnd);
  expect(headHtml.includes(`<meta name="network" content="${network.name}">`), 'network meta missing from <head>');
  expect(/<meta name="viewport"[^>]*width=device-width/i.test(headHtml), 'viewport meta missing');
  expect(!/type=["']module["']/i.test(html), 'type="module" present');
  expect(!/<script[^>]*crossorigin/i.test(html), 'crossorigin script attribute present');
  expect(!html.includes('exitapi-impl'), 'exitapi-impl reference present');
  expect(!html.includes('XMLHttpRequest'), 'XMLHttpRequest present');
  expect(!html.includes('Assets/Runtime') && !/["'][^"'\s]*\.(webp|png|jpe?g|mp3|ogg|wav|ttf|woff2?)["']/i.test(html), 'external asset path present');

  const scriptSrcs = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/gi)].map(m => m[1]);
  const allowedSrc = network.inject === 'mraid' ? ['mraid.js'] : network.inject === 'exitapi' ? [EXIT_API_URL] : [];
  expect(scriptSrcs.every(src => allowedSrc.includes(src)), `unexpected script src: ${scriptSrcs.join(', ')}`);
  expect(count(html, /<script src="mraid\.js"><\/script>/g) === (network.inject === 'mraid' ? 1 : 0), 'mraid.js injection count wrong');
  if (network.tag === 'gg') {
    expect(headHtml.includes(`<script type="text/javascript" src="${EXIT_API_URL}"></script>`), 'exitapi.js missing from <head>');
    expect(html.includes('ExitApi.exit()'), 'literal ExitApi.exit() missing');
  }
  if (network.tag === 'mtg') {
    expect(html.includes('<body onload="gameReady()">'), 'Mintegral body onload missing');
  }
  if (network.tag === 'un') {
    expect(!html.includes('window.top'), 'window.top present in Unity build');
  }
  if (network.tag === 'mo' || network.tag === 'fb') {
    expect(html.includes('FbPlayableAd.onCTAClick()'), 'FbPlayableAd.onCTAClick() missing');
  }

  const start = html.indexOf(START);
  const end = html.indexOf(END);
  expect(start > 0 && end > start && start < headEnd, 'config sentinels missing or outside <head>');
  if (start > 0 && end > start) {
    const block = html.slice(start, end + END.length);
    expect(Buffer.byteLength(block) < MAX_CONFIG_BYTES, 'config block >= 100 KB');
    expect(!/data:(image|audio)/.test(block), 'config block contains data URIs');
    const configText = block.slice(block.indexOf('=') + 1, block.lastIndexOf(';'));
    const config = JSON.parse(configText);
    expect(config.MECHANIC === version.mechanic, `MECHANIC is ${config.MECHANIC}, not ${version.mechanic}`);
    expect(config.GAME_LENGTH.clickLimit === iteration.clickLimit, 'clickLimit not set for iteration');
    expect(config.GAME_LENGTH.timeLimit === iteration.timeLimit, 'timeLimit not set for iteration');
    expect(config.CHANGABLE_TEXTURES.every(t => t.path === '' && t.uuid === t.spriteName), 'texture slot path/uuid invalid');
    expect(config.CHANGABLE_SOUNDTRACKS.every(s => s.path === '' && s.uuid === s.id), 'sound slot path/uuid invalid');
    const assetStart = html.indexOf('window.__CHANGEABLE_ASSETS__ = ');
    const assetJson = html.slice(assetStart + 'window.__CHANGEABLE_ASSETS__ = '.length, html.indexOf(';\n</script>', assetStart));
    const assets = JSON.parse(assetJson);
    const missing = [...config.CHANGABLE_TEXTURES.map(t => t.uuid), ...config.CHANGABLE_SOUNDTRACKS.map(s => s.uuid)].filter(key => !assets[key]);
    expect(missing.length === 0, `uuids missing from __CHANGEABLE_ASSETS__: ${missing.join(', ')}`);
    const assignAt = html.indexOf('window.GAME_CONFIG = window.GAME_CONFIG_DEFAULTS;');
    expect(assignAt > end && assignAt < headEnd, 'window.GAME_CONFIG assignment missing or misplaced');
  }
  return problems;
}

// ─── GAME_CONFIG.md ─────────────────────────────────────────────────────────

const FIELD_DOCS = {
  APP_LINKS: ['Store destinations used by the CTA fallback chain (mraid.open / window.open).', 'Object.'],
  'APP_LINKS.app_store': ['iOS / iPadOS store URL.', 'String URL.'],
  'APP_LINKS.google_play': ['Android (and any non-iOS) store URL.', 'String URL.'],
  MUTE: ['Keeps all audio muted, even after the first tap unlocks sound.', 'Boolean.'],
  AUDIO: ['Playback envelopes and the pool size used by the supplied mechanic sounds.', 'Object.'],
  'AUDIO.flowHoldMs': ['Keeps cutting/pouring audio alive across brief gaps in moving sand.', 'Number >= 0, milliseconds.'],
  'AUDIO.flowFadeInMs': ['Smooth attack and recovery from an interrupted fade for continuous audio beds.', 'Number >= 0, milliseconds.'],
  'AUDIO.flowFadeMs': ['Fade-out time once cutting/pouring movement stops.', 'Number >= 0, milliseconds.'],
  'AUDIO.loopCrossfadeMs': ['Overlap between the tail and head of a repeating audio bed; bounded by the available clip length. Silent encoder padding is skipped between repeats.', 'Number >= 0, milliseconds.'],
  'AUDIO.endcardMusicFadeMs': ['Fades gameplay music beneath the end-card reveal.', 'Number >= 0, milliseconds.'],
  'AUDIO.endcardSecondPopMs': ['Second reveal pop after the end card appears; the final bubble follows the logo settling.', 'Number >= 0, milliseconds.'],
  'AUDIO.maxEffectVoices': ['Maximum simultaneous instances of each short effect; each continuous bed uses two bounded voices for crossfades.', 'Integer 1-8.'],
  MECHANIC: ['How the player clears sand; set per version by the build. "tap" (Tapping Sand): a tap clears the one shape it hits. "cut" (Cutting Sand): a swipe (it can start anywhere on screen) cuts the picture live under the finger — in every column the line covers (it cuts a band about 70 design px wide, and reaches the picture\'s side or top when it comes within about 40 design px of it, so no sliver is left against the frame, nor hidden under its top bar), all the sand from the line down to the bottom of the picture falls (plus any sand left floating above), and a glowing trail follows the finger; the hint hand demonstrates a swipe. Taps reach about 24 design px around the finger in both versions. In both, a colour of the current wave down to its last few grains (1.5 % of its sand, at least 40 grains) crumbles by itself after the player\'s cut, so stray grains they can hardly see or reach never hold the level up.', '"tap" or "cut".'],
  GAME_LENGTH: ['Automatic end conditions.', 'Object.'],
  'GAME_LENGTH.timeLimit': ['Seconds after the first tap before the game ends if the picture is not cleared. This is not the fail state (no CHALLENGE_FAILED; only a belt jam fails): the store opens, then the end card shows. Every ending (cleared, belt jam, click limit, time up) opens the store right before the end card.', 'Number > 0; 9999 = inactive.'],
  'GAME_LENGTH.clickLimit': ['Interactions before the store opens from the last one, with the end card right after: taps on the sand (MECHANIC "tap"; each clears a patch), or presses anywhere on screen (MECHANIC "cut"; each starts a swipe), counted as the finger goes down — the press that reaches the limit opens the store right away, before it can cut. Taps off the sand (tap), taps during the opening pour and on the end card are not counted.', 'Integer ≥ 1; 9999 = inactive.'],
  GAME_BACKGROUND_TYPE: ['Canvas background behind the fixed 1080×1920 composition.', '"Color", "Gradient" or "Image" (Image uses the `background` texture slot, cover-fit).'],
  GAME_BACKGROUND_COLOR: ['Solid background colour when GAME_BACKGROUND_TYPE is "Color".', '[R, G, B], each 0–255.'],
  GAME_BACKGROUND_COLOR_CONFIG: ['Gradient settings when GAME_BACKGROUND_TYPE is "Gradient".', 'Object.'],
  'GAME_BACKGROUND_COLOR_CONFIG.gradientDirection': ['Gradient axis (first colour at top/left, last at bottom/right).', '"vertical" or "horizontal".'],
  'GAME_BACKGROUND_COLOR_CONFIG.colors': ['Gradient colour stops, evenly spaced from the first (top/left) to the last (bottom/right); the defaults are sampled from the storyboard mock-up.', 'Array of ≥ 2 [R, G, B] tuples (replaces the whole array).'],
  SHOW_PACKSHOT: ['Shows the Sand Drop end card (logo and CTA button over the dimmed game). When false the last screen stays and still acts as a whole-screen CTA.', 'Boolean.'],
  CHANGABLE_TEXTURES: ['Replaceable image slots (see Texture Slots).', 'Array merged by `uuid` / `spriteName`.'],
  'CHANGABLE_TEXTURES[].spriteName': ['Stable runtime texture key.', 'Match key only — not overridable.'],
  'CHANGABLE_TEXTURES[].path': ['Image source. Empty = bundled default from window.__CHANGEABLE_ASSETS__; a relative path or data: URI replaces it.', 'String; data URI MIME must match `format`.'],
  'CHANGABLE_TEXTURES[].originalSize': ['Source image resolution (editor target dimensions).', 'Object.'],
  'CHANGABLE_TEXTURES[].originalSize.width': ['Source width in px; used as the drawn width when resizeBlocked is false.', 'Integer > 0.'],
  'CHANGABLE_TEXTURES[].originalSize.height': ['Source height in px; used as the drawn height when resizeBlocked is false.', 'Integer > 0.'],
  'CHANGABLE_TEXTURES[].format': ['Encoding of the asset; validates the data URI MIME type.', '"webp", "png" or "jpg".'],
  'CHANGABLE_TEXTURES[].uuid': ['Override / asset-map key (same as spriteName).', 'Match key only — not overridable.'],
  'CHANGABLE_TEXTURES[].resizeBlocked': ['true keeps the authored layout size; false draws at originalSize × scale.', 'Boolean.'],
  'CHANGABLE_TEXTURES[].anchorPoint': ['Image origin used for placement.', 'Object.'],
  'CHANGABLE_TEXTURES[].anchorPoint.x': ['Horizontal origin.', 'Number 0–1.'],
  'CHANGABLE_TEXTURES[].anchorPoint.y': ['Vertical origin.', 'Number 0–1.'],
  'CHANGABLE_TEXTURES[].scale': ['Multiplier on the drawn size.', 'Number > 0.'],
  CHANGABLE_SOUNDTRACKS: ['Replaceable audio slots (see Soundtrack Slots).', 'Array merged by `uuid` / `id`.'],
  'CHANGABLE_SOUNDTRACKS[].id': ['Stable runtime sound key.', 'Match key only — not overridable.'],
  'CHANGABLE_SOUNDTRACKS[].path': ['Audio source. Empty = bundled default; a relative path or data: URI replaces it.', 'String; data URI MIME must match `format`.'],
  'CHANGABLE_SOUNDTRACKS[].volume': ['Base playback volume.', 'Number 0–1.'],
  'CHANGABLE_SOUNDTRACKS[].loop': ['Loop playback.', 'Boolean.'],
  'CHANGABLE_SOUNDTRACKS[].format': ['Encoding of the asset; validates the data URI MIME type.', '"mp3", "ogg" or "wav".'],
  'CHANGABLE_SOUNDTRACKS[].uuid': ['Override / asset-map key (same as id).', 'Match key only — not overridable.'],
  HAND_TUTOR_MODE: ['Tutorial hand: taps on a patch a front bucket needs at the start, and again after TUTORIAL_DELAY idle seconds.', 'Boolean.'],
  TUTORIAL_DELAY: ['Idle seconds after a shot before the hand hint returns.', 'Number ≥ 0.'],
  OPENING_GAMEPLAY_ANIMATION: ['An opening (about 1 s) before the hand hint appears and taps are accepted, as in the sand-shovel mock-up: the picture appears (OPENING_STYLE) while the buckets rise into place with their lids on, and the lids of the front buckets pop off one by one. false shows the picture and buckets at once (the lids still pop off as play starts).', 'Boolean.'],
  OPENING_STYLE: ['How the picture appears in the opening: "reveal" shows it in grey and turns it to colour in chunky pixel blocks of 7 × 7 grains, as in the mock-up: first a small square on the middle of its stripe/checker edge, then a blocky circle growing from there until it covers the picture (about 1 s); "pour" pours it into the frame as sand, bottom rows first.', '"reveal" or "pour".'],
  SAND: ['Sand picture and grain behaviour.', 'Object.'],
  'SAND.columns': ['Grains across the picture (the `sand-picture` texture is resampled to this width; the on-screen picture width stays 760 design px, so this sets the grain size).', 'Integer ≥ 8.'],
  'SAND.palette': ['Sand colours (sampled from the level picture: purple, blue, cyan, green, lime, yellow, orange, red, pink, black, white): every picture pixel snaps to the nearest entry, and grains are drawn in that entry\'s colour. Bucket colours come from the same list. Change it together with the picture.', 'Array of [R, G, B] (0–255), one per colour (replaces the whole array).'],
  'SAND.grainShade': ['Per-grain brightness variation that gives the sand its grainy look.', 'Number 0–0.3 (0 = flat colour).'],
  'SAND.gravity': ['Acceleration of falling grains.', 'Number > 0, design px/s².'],
  BELT: ['Conveyor belt under the funnel.', 'Object.'],
  'BELT.capacity': ['Grains the belt holds at 100%. A full belt only lets on sand a front bucket takes; full with nothing matching a front bucket and no such sand waiting in the funnel (for 2.5 s) is the fail state.', 'Integer > 0.'],
  'BELT.overflow': ['Extra grains a full belt may still take while nothing on it matches a front bucket but such sand waits in the funnel, so other colours cannot plug the funnel mouth in front of it. Using it all up is also the fail state.', 'Integer >= 0.'],
  'BELT.speed': ['Belt speed.', 'Number > 0, design px/s.'],
  'BELT.stallSeconds': ['Soft lock, a second fail state: while the full belt is turning sand away at the funnel mouth (sand waits to get on), it must take in at least BELT.stallPercent of its capacity within this many seconds, or the game fails as stuck (CHALLENGE_FAILED, fail screen). Sand still sliding down the funnel, or a player who is not tapping, never counts. 0 = off.', 'Number >= 0, seconds (3–5 suggested).'],
  'BELT.stallPercent': ['How much the belt must take in (as % of BELT.capacity) within BELT.stallSeconds while it turns sand away, to count as moving.', 'Number > 0, %.'],
  BUCKETS: ['Buckets under the belt (4 columns; only the front bucket of a column takes sand).', 'Object.'],
  'BUCKETS.capacity': ['The number each bucket starts at and counts down to 0 as it fills (GDD: 800). It is only the number shown: the buckets are all there are, so together they take every grain of the picture, and a grain counts for less than 1. Each colour\'s sand is shared out between its buckets, the front row taking the smallest share (1 : 2 : 3 : 4 by starting row), so front buckets fill within a tap or two.', 'Integer > 0.'],
  'BUCKETS.start': ['All the bucket groups (no more join later), front first and left to right: entry i goes to column i % 4, behind that column\'s earlier groups. An entry is a sand colour (1 = the first SAND.palette entry: a group of that colour\'s BUCKETS.stacks buckets), [colour, number, number, …] (a group with its own bucket numbers), or 0 (an empty slot: that column gets nothing there). Every colour in the picture needs at least one group; otherwise, or when empty, the buckets are planned from the picture (the fewest grains per bucket, different colours in front, the rest in the order their sand comes free from the bottom up, each row arranged so no two of a colour sit side by side or one above the other). The default follows the waves (BUCKETS.waves) as in the mock-up video: black, white, black, white in front; then the columns orange, lime, cyan, purple (800, 800, 380 each), with pink split: an 800 under cyan, an 800 and a 380 under purple; then red, yellow, green, blue.','Array (up to 16 entries) of colours 1–palette length, [colour, numbers…] arrays, or 0 (replaces the whole array).'],
  'BUCKETS.art': ['Bucket art for each sand colour, in SAND.palette order: texture slot keys. A full bucket gets the slot `<key>-lid` dropped onto it; colours without a lid slot turn into `<key>-cleared` instead (that bucket full, lid on). Then it flies off.', 'Array of slot keys, one per sand colour (replaces the whole array).'],
  'BUCKETS.stacks': ['Per sand colour (SAND.palette order), the numbers of the buckets each of its groups (each entry of BUCKETS.start) stacks in its column, front first: when the front one is full and flies off, the column slides up. The colour\'s sand is shared out by these numbers. Default: every rainbow colour 800, 800, 380; black one bucket of 1396 and white one of 1404 per group (as in the reference video). Only the numbers shown, like BUCKETS.capacity.', 'Array (one per sand colour) of arrays of integers > 0 (replaces the whole array); a missing or empty entry = one bucket per group starting at BUCKETS.capacity.'],
  'BUCKETS.waves': ['The level\'s waves, in order, as sand colours (1 = the first SAND.palette entry). Only the current wave\'s sand can be tapped or cut: a swipe has to reach it and cuts it from the line down, and sand of other colours below the finger stops the cut (a swipe over the stripes in wave 1 cuts nothing); the next wave starts once all its sand is in buckets. Default: checkerboard (black, white), then purple, cyan, lime, orange, pink, then blue, green, yellow, red.', 'Array of arrays of integers 1–palette length (replaces the whole array); empty = one wave with every colour.'],
  'BUCKETS.racks': ['Which waves\' buckets show together, as wave numbers (1 = the first BUCKETS.waves entry): only the buckets of the current wave\'s group show, the others wait hidden and rise into place when their group comes up. Default: each wave alone (wave 1: just the black and white buckets; wave 3\'s buckets only appear when wave 3 starts).', 'Array of arrays of wave numbers (replaces the whole array); empty = every bucket shows from the start.'],
};

/** Slot fields that do not apply to a texture, documented per slot in the guide. */
const SLOT_NOTES = {
  'sand-picture': 'The level: read pixel by pixel into grains (see SAND). Flat colours close to SAND.palette; transparent pixels are empty. anchorPoint, scale and resizeBlocked are not used.',
  'sand-picture-hd': 'The level\'s look (the storyboard sand painting: texture, smooth edges) at a whole multiple (2× or more) of `sand-picture`\'s size; each pixel shows while the grain under it (or a touching grain of its colour) is still there. Must match `sand-picture` exactly in layout; if its size is not a whole multiple, the game draws the picture grain by grain instead. anchorPoint, scale and resizeBlocked are not used.',
  'endcard-logo': 'End-card logo.',
  background: 'Storyboard background. Used only when GAME_BACKGROUND_TYPE is "Image"; always cover-fit (anchorPoint, scale and resizeBlocked are not used).',
  'sand-container': 'The frame and funnel around the picture (storyboard art); the picture sits in its opening, whose inner edge the sand follows.',
  'conveyor-belt': 'The conveyor (storyboard art: rim, track, label slot), with its arrows painted out: the game moves them (`belt-chevron`). Sand rides on its track, whose shape is fixed in the game (replacement art needs the same loop).',
  'belt-chevron': 'One arrow of the belt track, pointing right, centred on the track: the game runs 25 of them round the loop at BELT.speed, always, turned along the curves.',
  'bucket-shadow': 'Soft shadow under each bucket.',
  'bucket-glow': 'Glow behind a full bucket as its lid closes.',
  sparkle: 'Sparkle around a full bucket and the end-card logo.',
  'fail-glow': 'Red glow along the screen edges when the belt jams (fail), stretched to the screen; it stays under the end card.',
  'ui-hand': 'Tutorial hand; the fingertip is near the top centre of the image.'
};

function fieldRows(value, prefix, rows) {
  if (Array.isArray(value) && value.length && typeof value[0] === 'object' && !Array.isArray(value[0])) {
    rows.push([prefix, `${value.length} slots`]);
    fieldRows(value[0], `${prefix}[]`, rows);
    return;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (prefix && !prefix.endsWith('[]')) rows.push([prefix, null]);
    for (const [key, child] of Object.entries(value)) {
      fieldRows(child, prefix ? `${prefix}.${key}` : key, rows);
    }
    return;
  }
  rows.push([prefix, value]);
}

function describeDefault(pathKey, value, builtConfigs) {
  if (pathKey === 'GAME_LENGTH.clickLimit' || pathKey === 'GAME_LENGTH.timeLimit') {
    const field = pathKey.split('.')[1];
    return builtConfigs
      .filter(({ version }) => version === VERSIONS[0])
      .map(({ iteration, config }) => `${config.GAME_LENGTH[field]} (${iteration.length})`)
      .join(', ');
  }
  if (pathKey === 'MECHANIC') {
    return VERSIONS.map(version => `"${version.mechanic}" (${version.delivery}, ${version.subConceptName})`).join(', ');
  }
  if (value === null) return '—';
  if (pathKey.includes('[]')) {
    if (pathKey.endsWith('.path')) return '"" (every slot)';
    const perSlot = ['spriteName', 'uuid', 'id', 'originalSize', 'volume', 'loop', 'format'];
    if (perSlot.some(key => pathKey.endsWith(`.${key}`) || pathKey.includes(`.${key}.`))) return 'Per slot — see tables below';
    return `${JSON.stringify(value)} (every slot)`;
  }
  if (value === null) return '—';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function configGuide(builtConfigs) {
  const config = builtConfigs[builtConfigs.length - 1].config;
  const rows = [];
  fieldRows(config, '', rows);
  const missingDocs = rows.map(([key]) => key).filter(key => !FIELD_DOCS[key]);
  if (missingDocs.length) {
    throw new Error(`GAME_CONFIG.md has no description for: ${missingDocs.join(', ')}`);
  }
  const table = rows
    .map(([key, value]) => `| \`${key}\` | ${FIELD_DOCS[key][0]} | ${FIELD_DOCS[key][1]} | ${describeDefault(key, value, builtConfigs)} |`)
    .join('\n');
  const textures = config.CHANGABLE_TEXTURES
    .map(t => `| \`${t.uuid}\` | ${t.format} | ${t.originalSize.width}×${t.originalSize.height} | anchorPoint (${t.anchorPoint.x}, ${t.anchorPoint.y}), scale ${t.scale}, resizeBlocked ${t.resizeBlocked} | ${SLOT_NOTES[t.uuid] ?? ''} |`)
    .join('\n');
  const sounds = config.CHANGABLE_SOUNDTRACKS
    .map(s => `| \`${s.uuid}\` | ${s.format} | volume ${s.volume}, loop ${s.loop} |`)
    .join('\n');

  return `# GAME_CONFIG — Sand Drop · Tapping Sand / Cutting Sand

Generated by \`scripts/build-all.mjs\` from the config emitted into every built playable (${builtConfigs.map(({ version, iteration }) => `\`dist/${version.folder}/${iteration.length}/\``).join(', ')}). The versions differ only in \`MECHANIC\` (${VERSIONS.map(v => `${v.delivery} ${v.subConceptName}: "${v.mechanic}"`).join(', ')}), the iterations only in \`GAME_LENGTH\`.

## How configuration resolves

1. Each HTML defines \`GAME_CONFIG_DEFAULTS\` inside the \`${START}\` … \`${END}\` block in \`<head>\`, then assigns \`window.GAME_CONFIG = window.GAME_CONFIG_DEFAULTS\`.
2. An external editor may replace \`window.GAME_CONFIG\` before the game boots. **Precedence:** values in \`window.GAME_CONFIG\` win; any field it does not supply keeps its default.
3. Objects are **deep-merged**: an override changes only the exact fields supplied.
4. Plain arrays (\`GAME_BACKGROUND_COLOR\`, \`GAME_BACKGROUND_COLOR_CONFIG.colors\`) are **replaced** as a whole.
5. \`CHANGABLE_TEXTURES\` / \`CHANGABLE_SOUNDTRACKS\` are **merged per slot** by \`uuid\` (or \`spriteName\` / \`id\`); slots you don't mention stay intact, and fields you don't mention inside a slot keep their defaults.
6. After merging, every slot with an empty \`path\` is filled from \`window.__CHANGEABLE_ASSETS__[uuid]\` (bundled data URI). A non-empty \`path\` (relative path or data URI) is kept as given.

Nested-object syntax (preferred):

\`\`\`js
window.GAME_CONFIG = {
  GAME_LENGTH: { clickLimit: 2 },
  APP_LINKS: { app_store: "https://example.com/app" },
  CHANGABLE_SOUNDTRACKS: [{ uuid: "bgm", volume: 0.2 }]
};
\`\`\`

Quoted dotted-path keys are also accepted:

\`\`\`js
window.GAME_CONFIG = {
  "GAME_LENGTH.clickLimit": 2,
  "APP_LINKS.app_store": "https://example.com/app"
};
\`\`\`

## Variables

| Variable name | What it controls | Accepted value types and range | Default value used |
|---|---|---|---|
${table}

## Texture Slots

Target dimensions are the bundled WebP's real size. Tuning fields: \`anchorPoint\`, \`scale\`, \`resizeBlocked\`, \`path\`.

| Stable key (uuid = spriteName) | Format | Target dimensions | Defaults | Notes |
|---|---|---|---|---|
${textures}

## Soundtrack Slots

Tuning fields: \`volume\`, \`loop\`, \`path\`. Volumes/loop are the actual base values used at runtime.

| Stable key (uuid = id) | Format | Defaults |
|---|---|---|
${sounds}
`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  buildBase();
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  const baseHtml = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf8');
  const assetsJson = JSON.stringify(changeableAssets(), null, 2);
  const failures = [];
  const summary = [];

  for (const version of VERSIONS) for (const iteration of ITERATIONS) {
    const dir = path.join(distDir, version.folder, lower(iteration.length));
    fs.mkdirSync(dir, { recursive: true });
    for (const network of NETWORKS) {
      if (!network.included) {
        continue;
      }
      const html = transformHtml(baseHtml, network, version, iteration, assetsJson);
      const name = filename(network, version, iteration);
      const bytes = Buffer.byteLength(html);
      const problems = checkOutput(html, network, version, iteration, bytes);
      let target;
      let outBytes = bytes;
      if (network.zip) {
        target = path.join(dir, `${name}.zip`);
        const buffer = await zipBuffer(html);
        fs.writeFileSync(target, buffer);
        outBytes = buffer.length;
        if (outBytes >= MAX_BYTES) problems.push('zip >= 5 MB');
      } else {
        target = path.join(dir, `${name}.html`);
        fs.writeFileSync(target, html);
      }
      if (network.tag === SOURCE_FILES_NETWORK) {
        fs.mkdirSync(sourceFilesDir(version), { recursive: true });
        fs.copyFileSync(target, path.join(sourceFilesDir(version), path.basename(target)));
      }
      summary.push(`${path.relative(distDir, target)}  html ${(bytes / 1048576).toFixed(2)} MB${network.zip ? `, zip ${(outBytes / 1048576).toFixed(2)} MB` : ''}`);
      for (const problem of problems) {
        failures.push(`${path.relative(distDir, target)}: ${problem}`);
      }
    }
  }

  const builtConfigs = VERSIONS.flatMap(version => ITERATIONS.map(iteration => ({ version, iteration, config: configFor(version, iteration) })));
  fs.writeFileSync(path.join(distDir, 'GAME_CONFIG.md'), configGuide(builtConfigs));
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log(summary.join('\n'));
  for (const version of VERSIONS) {
    const dir = sourceFilesDir(version);
    const sourceFiles = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    console.log(`\nSource Files, ${version.delivery} ${version.subConceptName} (${SOURCE_FILES_NETWORK}, one per iteration): ${path.relative(distDir, dir)}\n  ${sourceFiles.join('\n  ')}`);
    if (sourceFiles.length !== ITERATIONS.length) {
      failures.push(`Source Files ${version.delivery}: expected ${ITERATIONS.length} files, found ${sourceFiles.length}`);
    }
  }
  if (failures.length) {
    console.warn(`\nSelf-check FAILED (${failures.length}):\n${failures.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`\nSelf-check passed for ${summary.length} outputs.`);
  }
}

main().catch(error => {
  console.warn(error);
  process.exitCode = 1;
});
