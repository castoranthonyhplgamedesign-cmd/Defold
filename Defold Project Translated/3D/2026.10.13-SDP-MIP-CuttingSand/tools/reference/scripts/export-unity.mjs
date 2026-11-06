// Exports this playable's baked level and art to the Unity (Luna) port, so both builds play the same
// picture. Run after prepare:assets:  node scripts/export-unity.mjs [unity project folder]
//
// Writes into <unity>/Assets/Data/Sand/ and <unity>/Assets/Sprites/Sand/:
//  - sand-level.bytes   the grain grid: "SDL1", u16 cols, u16 rows, u8 palette size, palette RGB
//                       triples, then cols × rows cells (0 empty, 1..n palette value), row 0 at the top.
//  - sand-painting.png  the sand painting at a whole multiple of the grid (sand-picture-hd).
//  - sand-owner.png     per painting pixel, which grain shows it: code (dy + 1) * 3 + (dx + 1) for the
//                       grain at the pixel's own grid cell + (dx, dy), stored × 28 in a grey PNG (the
//                       same rule as src/game/PictureHd.ts: the pixel's own grain when the colours
//                       match, else the nearest touching grain of its colour; the darkened bottom band
//                       belongs to the grain under it).
//  - sand-container.png the cleaned container art (frame and funnel).
//  - the other runtime sprites (buckets and their cleared art, shadow, glow, belt, logo, fail glow,
//    sparkle, hand), and the effect art the Phaser build draws at runtime (fx-ring, fx-glow, the praise
//    words), rendered in headless Chrome with the game font.
// And into <unity>/Assets/Audio/Sounds/: every sound slot's MP3 (<key>.mp3) and sounds.json (key,
// volume, loop per slot).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const unity = path.resolve(process.argv[2] ?? path.join(root, '../../unity/Projects', path.basename(root)));
if (!fs.existsSync(path.join(unity, 'Assets'))) {
  throw new Error(`No Unity project at ${unity}`);
}
const runtime = path.join(root, 'Assets/Runtime/images');
const dataDir = path.join(unity, 'Assets/Data/Sand');
const spriteDir = path.join(unity, 'Assets/Sprites/Sand');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(spriteDir, { recursive: true });

const defaults = JSON.parse(fs.readFileSync(path.join(root, 'src/projectDefaults.json'), 'utf8'));
const palette = defaults.SAND.palette;
const nearest = (r, g, b) => {
  let best = 0;
  let d = Infinity;
  for (let c = 0; c < palette.length; c++) {
    const e = (r - palette[c][0]) ** 2 + (g - palette[c][1]) ** 2 + (b - palette[c][2]) ** 2;
    if (e < d) {
      d = e;
      best = c + 1;
    }
  }
  return best;
};

// Grain grid.
const pic = await sharp(path.join(runtime, 'sand-picture.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const cols = pic.info.width;
const rows = pic.info.height;
const cells = new Uint8Array(cols * rows);
for (let p = 0; p < cols * rows; p++) {
  cells[p] = pic.data[p * 4 + 3] < 128 ? 0 : nearest(pic.data[p * 4], pic.data[p * 4 + 1], pic.data[p * 4 + 2]);
}
const header = Buffer.alloc(4 + 2 + 2 + 1 + palette.length * 3);
header.write('SDL1', 0, 'ascii');
header.writeUInt16LE(cols, 4);
header.writeUInt16LE(rows, 6);
header.writeUInt8(palette.length, 8);
palette.forEach((rgb, i) => header.set(rgb, 9 + i * 3));
fs.writeFileSync(path.join(dataDir, 'sand-level.bytes'), Buffer.concat([header, Buffer.from(cells)]));

// Painting and its owner map.
const hd = await sharp(path.join(runtime, 'sand-picture-hd.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const w = hd.info.width;
const h = hd.info.height;
const scale = w / cols;
if (!Number.isInteger(scale) || h !== rows * scale) {
  throw new Error(`sand-picture-hd (${w}×${h}) is not a whole multiple of the grid (${cols}×${rows})`);
}
const lastRow = h - 1 - Math.round((12 / 893) * h);
const owner = new Uint8Array(w * h);
for (let y = 0; y < h; y++) {
  const cy = Math.floor(y / scale);
  for (let x = 0; x < w; x++) {
    const cx = Math.floor(x / scale);
    let cls;
    if (y > lastRow) {
      cls = cells[cy * cols + cx];
    } else {
      let r = 0, g = 0, b = 0, n = 0, opaque = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = Math.min(lastRow, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          const i = (yy * w + xx) * 4;
          r += hd.data[i]; g += hd.data[i + 1]; b += hd.data[i + 2];
          opaque += hd.data[i + 3] >= 128 ? 1 : 0;
          n++;
        }
      }
      cls = opaque * 2 < n ? 0 : nearest(r / n, g / n, b / n);
    }
    let code = 4; // (0, 0): its own grain
    if (cells[cy * cols + cx] !== cls) {
      let bestDistance = Infinity;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if ((dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= cols || ny >= rows || cells[ny * cols + nx] !== cls) continue;
          const d = ((nx + 0.5) * scale - x - 0.5) ** 2 + ((ny + 0.5) * scale - y - 0.5) ** 2;
          if (d < bestDistance) {
            bestDistance = d;
            code = (dy + 1) * 3 + (dx + 1);
          }
        }
      }
    }
    owner[y * w + x] = code * 28;
  }
}
await sharp(Buffer.from(owner), { raw: { width: w, height: h, channels: 1 } }).png({ compressionLevel: 9 }).toFile(path.join(spriteDir, 'sand-owner.png'));
await sharp(path.join(runtime, 'sand-picture-hd.webp')).png({ compressionLevel: 9 }).toFile(path.join(spriteDir, 'sand-painting.png'));
await sharp(path.join(runtime, 'sand-container.webp')).png({ compressionLevel: 9 }).toFile(path.join(spriteDir, 'sand-container.png'));

// The other runtime sprites, exactly as the Phaser build uses them (LAYOUT's sizes are their pixel
// sizes × ART_SCALE).
const SPRITES = [
  ...['white', 'black', 'blue', 'red', 'yellow'].flatMap(c => [`bucket-${c}`, `bucket-${c}-cleared`]),
  'bucket-shadow', 'bucket-glow', 'conveyor-belt', 'endcard-logo', 'fail-glow', 'sparkle', 'ui-hand'
];
for (const key of SPRITES) {
  await sharp(path.join(runtime, `${key}.webp`)).png({ compressionLevel: 9 }).toFile(path.join(spriteDir, `${key}.png`));
}

// Sounds, as the Phaser build plays them (trimmed by prepare:assets), with each slot's volume and
// loop in sounds.json (the Unity scene builder makes the AudioLibrary from it).
const soundDir = path.join(unity, 'Assets/Audio/Sounds');
fs.mkdirSync(soundDir, { recursive: true });
const sounds = defaults.CHANGABLE_SOUNDTRACKS.map(s => ({ key: s.id, volume: s.volume ?? 1, loop: !!s.loop }));
for (const s of sounds) {
  fs.copyFileSync(path.join(root, 'Assets/Runtime/audio', `${s.key}.mp3`), path.join(soundDir, `${s.key}.mp3`));
}
fs.writeFileSync(path.join(soundDir, 'sounds.json'), JSON.stringify({ sounds }, null, 2) + '\n');

// Effect art the Phaser build draws at runtime (BootScene's ring and glow, Praise's words), drawn
// here by the same canvas code in headless Chrome with the game font.
const { connect, launchBrowser, openPage, sleep } = await import(new URL('./qa/cdp.mjs', import.meta.url).href);
const words = ['GREAT!', 'AWESOME!', 'AMAZING!'];
const fontUrl = new URL(`file:///${path.join(root, 'Assets/Font/Nunito-Black.ttf').replace(/\\/g, '/')}`).href;
const page = `<!doctype html><html><head><style>@font-face { font-family: NunitoBlack; src: url("${fontUrl}"); }</style></head><body><script>
(async () => {
  await document.fonts.load('124px NunitoBlack');
  const out = {};
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  let c = canvas(128, 128), ctx = c.getContext('2d');
  ctx.lineWidth = 9; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(64, 64, 58, 0, Math.PI * 2); ctx.stroke();
  out['fx-ring'] = c.toDataURL();
  c = canvas(128, 128); ctx = c.getContext('2d');
  const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  glow.addColorStop(0, 'rgba(255,255,255,1)'); glow.addColorStop(0.35, 'rgba(255,255,255,0.6)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 128, 128);
  out['fx-glow'] = c.toDataURL();
  const H = 200, size = H * 0.62, font = Math.round(size) + 'px NunitoBlack, "Arial Black", sans-serif';
  for (const word of ${JSON.stringify(words)}) {
    const m = canvas(1, 1).getContext('2d'); m.font = font;
    const w = Math.ceil(m.measureText(word).width + size * 0.6);
    c = canvas(w, H); ctx = c.getContext('2d');
    const x = w / 2, y = H * 0.5;
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.3; ctx.strokeStyle = '#3d2f6b'; ctx.strokeText(word, x, y + size * 0.08);
    ctx.strokeStyle = '#ffffff'; ctx.strokeText(word, x, y);
    const fill = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    fill.addColorStop(0, '#ffd23a'); fill.addColorStop(1, '#ff7a12');
    ctx.fillStyle = fill; ctx.fillText(word, x, y);
    out['praise-' + word.replace(/[^A-Z]/g, '').toLowerCase()] = c.toDataURL();
  }
  window.__FX = out;
})();
</script></body></html>`;
const pageFile = path.join(fs.mkdtempSync(path.join((await import('node:os')).tmpdir(), 'sdp-fx-')), 'fx.html');
fs.writeFileSync(pageFile, page);
const browser = await launchBrowser();
const cdp = await connect(browser.wsUrl);
let fx = null;
try {
  const tab = await openPage(cdp, { url: new URL(`file:///${pageFile.replace(/\\/g, '/')}`).href, width: 800, height: 600 });
  for (let i = 0; i < 50 && !fx; i++) {
    await sleep(100);
    fx = await tab.evaluate('window.__FX || null');
  }
} finally {
  cdp.close();
  await browser.close();
}
if (!fx) throw new Error('Effect art did not render in Chrome');
for (const [name, url] of Object.entries(fx)) {
  fs.writeFileSync(path.join(spriteDir, `${name}.png`), Buffer.from(url.split(',')[1], 'base64'));
}

console.log(`Exported to ${path.relative(root, unity) || unity}:
  Assets/Data/Sand/sand-level.bytes   ${cols}×${rows} grains, ${palette.length} colours
  Assets/Sprites/Sand/sand-painting.png ${w}×${h}
  Assets/Sprites/Sand/sand-owner.png    ${w}×${h}
  Assets/Sprites/Sand/sand-container.png
  Assets/Sprites/Sand/ ${SPRITES.length} runtime sprites + ${Object.keys(fx).join(', ')}
  Assets/Audio/Sounds/ ${sounds.map(s => s.key).join(', ')} + sounds.json`);
