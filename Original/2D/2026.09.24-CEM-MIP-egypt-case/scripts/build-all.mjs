import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import archiver from 'archiver';

const ROOT = process.cwd();
const TEMP = path.join(ROOT, '.build-base');
const DIST = path.join(ROOT, 'dist');
const defaults = JSON.parse(await readFile(path.join(ROOT, 'src/projectDefaults.json'), 'utf8'));
const iterations = JSON.parse(await readFile(path.join(ROOT, 'src/iterations.json'), 'utf8'));
const iterationPackage = process.argv.includes('--iteration-package');
const applovinOnly = process.argv.includes('--applovin-only') || iterationPackage;
const flatOutput = process.argv.includes('--flat') || iterationPackage;
const iterationSource = path.join(DIST, 'Source Files');

const NAMING = {
  project: 'cem',
  creativeType: 'mip',
  vendor: 'grhpl',
  concept: 'egypt',
  subConcept: 'case',
  gameplay: 'real',
  ugc: 'nougc',
  seasonal: 'noseason',
  language: 'en',
  size: 'na',
};

const NETWORKS = [
  { name: 'applovin', tag: 'al', included: true, zip: false, mraid: true },
  { name: 'google', tag: 'gg', included: true, zip: true, google: true },
  { name: 'ironsource', tag: 'is', included: true, zip: false, mraid: true },
  { name: 'mintegral', tag: 'mtg', included: true, zip: true, bodyOnload: true },
  { name: 'facebook', tag: 'fb', included: true, zip: false },
  { name: 'unity', tag: 'un', included: true, zip: false, mraid: true, unity: true },
  { name: 'vungle', tag: 'vu', included: true, zip: true, marker: 'window.__VUNGLE__=true;' },
  { name: 'moloco', tag: 'mo', included: true, zip: false },
];

const ASSET_FILES = {
  'map-bg': 'Assets/MapBG.webp',
  'character-bg': 'Assets/CharBG.webp',
  'clue-bg': 'Assets/ClueBG.webp',
  'drop-circle': 'Assets/Dashed-Circle.webp',
  error: 'Assets/Error.webp',
  logo: 'Assets/Logo.webp',
  'tutorial-hand': 'Assets/hand-egypt.webp',
  Aisha: 'Assets/Characters/Aisha.webp',
  Maya: 'Assets/Characters/Maya.webp',
  Ahmose: 'Assets/Characters/Ahmose.webp',
  Nefertiti: 'Assets/Characters/Nefertiti.webp',
  Merneptah: 'Assets/Characters/Merneptah.webp',
  Khasekhemwy: 'Assets/Characters/Khasekhemwy.webp',
  bgm: 'Assets/Audio/BGM.mp3',
  'pick-drop-character': 'Assets/Audio/PickDropCharacter.mp3',
  return: 'Assets/Audio/Return.mp3',
  correct: 'Assets/Audio/Correct.mp3',
  wrong: 'Assets/Audio/Wrong.mp3',
  'red-strike': 'Assets/Audio/RedStrike.mp3',
  endcard: 'Assets/Audio/EndCard.mp3',
  'ahmose-sfx': 'Assets/Audio/AhmoseSFX.mp3',
  'maya-sfx': 'Assets/Audio/MayaSFX.mp3',
  'merneptah-sfx': 'Assets/Audio/MerneptahSFX.mp3',
  'nefertiti-sfx': 'Assets/Audio/NefertitiSFX.mp3',
};

function mimeFor(file) {
  if (file.endsWith('.webp')) return 'image/webp';
  if (file.endsWith('.mp3')) return 'audio/mpeg';
  return 'application/octet-stream';
}

const payloads = {};
for (const [key, relative] of Object.entries(ASSET_FILES)) {
  const bytes = await readFile(path.join(ROOT, relative));
  payloads[key] = `data:${mimeFor(relative)};base64,${bytes.toString('base64')}`;
}

function configScript(config) {
  return `<script>\n/*__INLINE_GAME_CONFIG_START__*/\nconst GAME_CONFIG_DEFAULTS = ${JSON.stringify(config, null, 2)};\n/*__INLINE_GAME_CONFIG_END__*/\nwindow.GAME_CONFIG_DEFAULTS = GAME_CONFIG_DEFAULTS;\nwindow.__CHANGEABLE_ASSETS__ = ${JSON.stringify(payloads)};\n</script>\n<script>\nwindow.GAME_CONFIG = window.GAME_CONFIG_DEFAULTS;\n</script>`;
}

function makeHtml(base, network, config) {
  let html = base
    .replace(/<meta\s+name="network"\s+content="[^"]*"\s*\/?>/i, `<meta name="network" content="${network.name}">`)
    .replace(/\s+type="module"/g, '')
    .replace(/\s+crossorigin(?:="[^"]*")?/g, '');
  const sdk = network.mraid
    ? '<script src="mraid.js"></script>'
    : network.google
      ? '<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>'
      : '';
  const marker = network.marker ? `<script>${network.marker}</script>` : '';
  html = html.replace(/<head>/i, `<head>\n${sdk}\n${marker}\n${configScript(config)}`);
  if (network.bodyOnload) html = html.replace(/<body([^>]*)>/i, '<body$1 onload="gameReady()">');
  if (network.unity) html = html.replaceAll('window.top', 'window.self');
  return html;
}

function filename(network, iteration) {
  const fields = [
    NAMING.project, NAMING.creativeType, NAMING.vendor, NAMING.concept, NAMING.subConcept,
    NAMING.gameplay, NAMING.ugc, NAMING.seasonal, NAMING.language, iteration.name, NAMING.size, network.tag,
  ];
  return fields.map((value) => String(value).toLowerCase()).join('_');
}

async function zipHtml(output, html) {
  await new Promise((resolve, reject) => {
    const stream = createWriteStream(output);
    const archive = archiver('zip', { zlib: { level: 9 } });
    stream.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(stream);
    archive.append(html, { name: 'index.html' });
    void archive.finalize();
  });
}

function typeOf(value) {
  if (Array.isArray(value)) return 'Array';
  if (typeof value === 'number') return 'Number';
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'string') return 'String';
  return 'Object';
}

function description(name) {
  if (name.startsWith('APP_LINKS')) return 'Store redirect URL used by the CTA.';
  if (name.startsWith('DROP_POSITIONS')) return 'Drop-circle center in 1080×1920 authored coordinates.';
  if (name.startsWith('LAYOUT')) return 'Panel rectangle in 1080×1920 authored coordinates.';
  if (name.startsWith('CLUES')) return 'Ordered clue-row content and its matching character.';
  if (name.startsWith('CLUE_LAYOUT')) return 'Centered clue typography size or authored Y coordinate.';
  if (name.startsWith('CHANGABLE_TEXTURES')) return 'Replaceable texture slot metadata and display tuning.';
  if (name.startsWith('CHANGABLE_SOUNDTRACKS')) return 'Replaceable audio slot metadata and playback tuning.';
  if (name.startsWith('TIMING')) return 'Animation timing in milliseconds.';
  if (name.startsWith('TUTORIAL')) return 'Opening and inactivity tutorial behavior, timing, or presentation.';
  if (name.startsWith('COLORS')) return 'Runtime UI color in CSS hex notation.';
  const descriptions = {
    MUTE: 'Whether audio remains muted after the first interaction.', GAME_LENGTH: 'Time and unsolved-character press limits for the active iteration.',
    GAME_BACKGROUND_TYPE: 'Blank-space background rendering mode.', GAME_BACKGROUND_COLOR: 'Blank-space RGB fill color.',
    SHOW_PACKSHOT: 'Whether the solved-state overlay and logo are shown.',
    HAND_TUTOR_MODE: 'Enables the opening and inactivity hand tutorials.',
    LOGO_WIDTH: 'Authored end-card logo width; height follows the source aspect ratio.',
    CHARACTER_HOME_Y: 'Vertical center of the draggable character row.',
    CHARACTER_LIST_MARGIN_X: 'Equal authored-coordinate margin at the left and right of the character list.',
    CHARACTER_HEIGHT: 'Authored character height in the tray.', PLACED_CHARACTER_HEIGHT: 'Authored character height after a correct drop.',
    DROP_CIRCLE_SIZE: 'Visible dashed-circle diameter in authored coordinates.',
    DROP_RADIUS: 'Maximum authored-coordinate distance accepted for a correct drop.', CLUE_TITLE: 'Heading shown above the clue rows.',
    CHANGABLE_SOUNDTRACKS: 'Replaceable BGM and sound-effect slots.'
  };
  return descriptions[name] ?? 'Runtime configuration value.';
}

function flatten(value, prefix = '', rows = []) {
  rows.push([prefix, description(prefix), typeOf(value), JSON.stringify(value)]);
  if (Array.isArray(value)) {
    if (value.length && value[0] && typeof value[0] === 'object') flatten(value[0], `${prefix}[]`, rows);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, rows);
  }
  return rows;
}

function guide() {
  const rows = [];
  for (const [key, value] of Object.entries(defaults)) flatten(value, key, rows);
  const clickDefaults = iterations.map((iteration) => `${iteration.name}: ${iteration.clickLimit}`).join('; ');
  const clickRow = rows.find((row) => row[0] === 'GAME_LENGTH.clickLimit');
  if (clickRow) clickRow[3] = clickDefaults;
  const table = rows.map(([name, what, type, value]) => `| \`${name}\` | ${what} | ${type} | \`${String(value).replaceAll('|', '\\|')}\` |`).join('\n');
  return `# Game configuration\n\nThe built creative assigns \`GAME_CONFIG_DEFAULTS\`, then exposes it as \`window.GAME_CONFIG\`. An integration may supply nested overrides, or quoted dotted-path keys such as \`"DROP_POSITIONS.Aisha.x"\`. Objects are deep-merged, so unspecified siblings retain defaults. General arrays replace the default array; \`CHANGABLE_TEXTURES\` entries are merged individually by stable \`uuid\` or \`spriteName\`, and \`CHANGABLE_SOUNDTRACKS\` entries by stable \`uuid\` or \`id\`.\n\nThe build produces ${iterations.map((iteration) => `\`${iteration.name}\``).join(', ')} iterations. Their only config difference is \`GAME_LENGTH.clickLimit\`: ${clickDefaults}. Click-limited variants count only pointer presses on unsolved characters.\n\nA blank asset \`path\` hydrates from \`window.__CHANGEABLE_ASSETS__\`. A supplied relative or data-URI path is preserved. Texture slots list their stable key, WebP format, target dimensions in \`originalSize\`, and editable \`anchorPoint\`, \`scale\`, and \`resizeBlocked\` fields. Soundtrack slots expose their stable key, MP3 format, \`volume\`, and \`loop\`.\n\n| Variable name | What it controls | Accepted value types and range | Default value used |\n|---|---|---|---|\n${table}\n`;
}

await rm(TEMP, { recursive: true, force: true });
await rm(DIST, { recursive: true, force: true });
if (iterationPackage) {
  await mkdir(path.join(DIST, 'Preview'), { recursive: true });
  await mkdir(iterationSource, { recursive: true });
}
const vite = path.join(ROOT, 'node_modules/vite/bin/vite.js');
const result = spawnSync(process.execPath, [vite, 'build', '--config', 'vite.shared.ts', '--outDir', TEMP, '--emptyOutDir'], { cwd: ROOT, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
const base = await readFile(path.join(TEMP, 'index.html'), 'utf8');
const selectedNetworks = NETWORKS.filter((item) => item.included && (!applovinOnly || item.tag === 'al'));
let builtCount = 0;
for (const iteration of iterations) {
  const folder = iterationPackage ? iterationSource : flatOutput ? DIST : path.join(DIST, iteration.name);
  await mkdir(folder, { recursive: true });
  const iterationConfig = structuredClone(defaults);
  iterationConfig.GAME_LENGTH.clickLimit = iteration.clickLimit;
  for (const network of selectedNetworks) {
    const html = makeHtml(base, network, iterationConfig);
    const stem = path.join(folder, filename(network, iteration));
    if (network.zip) await zipHtml(`${stem}.zip`, html);
    else await writeFile(`${stem}.html`, html);
    builtCount += 1;
  }
}
await writeFile(path.join(DIST, 'GAME_CONFIG.md'), guide());
await rm(TEMP, { recursive: true, force: true });
console.log(`Built ${builtCount} variants in ${path.relative(ROOT, DIST)}`);
