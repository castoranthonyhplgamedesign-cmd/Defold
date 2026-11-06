// Selects the runtime assets from Assets/, converts them into Assets/Runtime/ (WebP images, MP3
// audio) and writes the CHANGABLE_TEXTURES / CHANGABLE_SOUNDTRACKS slot metadata into
// src/projectDefaults.json from the actual output files. Source assets are never modified.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mp3Encoder } from '@breezystack/lamejs';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outRoot = path.join(root, 'Assets/Runtime');
const defaultsFile = path.join(root, 'src/projectDefaults.json');

/** The storyboard's sliced art (Assets/Image/sdp_mip-cutting-sand-assets). */
const ART = 'Assets/Image/sdp_mip-cutting-sand-assets';

/**
 * The sand level: the rainbow-and-checkerboard picture (9 stripes over 2 checker rows, 120 px
 * cells, with a sand-grain texture). `sand-picture` is it downsampled to
 * SAND.columns grains across (each grain takes the most common palette colour of its pixels),
 * saved lossless in exact palette colours; specks smaller than minPatch grains (anti-aliased edges)
 * are merged into a neighbour. The painting's last `shadowRows` rows are its darkened bottom edge,
 * not black sand: they take their colours from the row above. `sand-picture-hd` is the painting
 * itself at hdScale × the grain grid, drawn for the picture's look (texture, smooth edges).
 */
const LEVEL = {
  source: 'Assets/Image/level-rainbow-checker-v2.png',
  crop: { left: 0, top: 0, width: 1080, height: 960 },
  // At SAND.columns 189 every stripe and checker cell is 21 × 21 grains (189 × 168).
  aspect: 1080 / 960,
  shadowRows: 0,
  hdScale: 4,
  // Its cell edges fall on whole pixels at hdScale: a nearest-pixel resize keeps them sharp (a
  // smoothing kernel would blend a checker cell's colour into the stripe grains above it).
  hdKernel: 'nearest',
  // Every painting pixel belongs to its own grain: the few edge pixels the game would hand to a
  // touching grain of another colour (PictureHd reads a pixel's colour from its 3 × 3 average; the
  // source has faint seams between stripes and checker) are recoloured, so no speck lingers once
  // the sand beside it is gone.
  hdSnap: true,
  // The source's stripe/checker edge wavers by a few pixels, leaving lone grains of checker sand in
  // the stripes' bottom row (notches once the checker is gone): each grain takes the colour most of
  // its 3 × 3 neighbourhood has (ties keep its own), so single-grain jags go and corners stay.
  despeckle: true,
  // The picture is a grid of uniform cells (9 × 8 of 120 px: 6 rows of stripes, 2 of checker), but
  // the AI-made art wavers: its checker rows are 115 and 125 px, and the black cell under red rises a
  // few pixels into the stripe (6 grains of black sticking up into red). Every grain takes its cell's
  // colour (the most common in the cell's middle, `margin` px in from each edge), and the painting
  // is redrawn cell by cell from that middle, so edges are straight and seams can't show.
  cells: { cols: 9, rows: 8, margin: 10 },
  minPatch: 12
};

/**
 * The belt art's track, measured on conveyer-belt.png (857 × 259): a stadium loop whose centre line
 * is centred at (cx, cy), with straight runs to cx ± half and ends of radius `radius`; the blue
 * track is 2 × trackHalf wide. Its painted chevrons are lighter than the track around them: each
 * track pixel brighter than the track's usual shade at that spot (its distance from the centre line,
 * in a `sector`-long stretch of the loop) by more than `threshold` (r + g + b) is a chevron pixel.
 * Those (plus a 1 px fringe) are repainted from the plain track on either side along the loop, so
 * the shading stays. One top-run chevron (the one nearest the middle) is cut out as `belt-chevron`:
 * its colour, with alpha from how far each pixel is from the plain track toward it, centred on the
 * centre line. LAYOUT.belt (src/constants.ts) uses the same geometry.
 */
const BELT_ART = { cx: 428.5, cy: 111, half: 309.5, radius: 63, trackHalf: 34, sector: 50, threshold: 12 };

// key → source image (relative to the project root). Keys are the stable runtime/uuid names.
const IMAGES = [
  ['background', `${ART}/background/background-pink.png`, { width: 1200 }],
  ['sand-container', `${ART}/asset-parts/sand-container.png`, {}],
  // The belt art with its chevrons painted out, and one chevron: the game moves a ring of them round
  // the track (see BELT_ART).
  ['conveyor-belt', `${ART}/asset-parts/conveyer-belt.png`, {}],
  ['belt-chevron', `${ART}/asset-parts/conveyer-belt.png`, {}],
  // Each bucket colour and the lid that drops onto it when it is full.
  ...['purple', 'blue-v2', 'cyan', 'green-v2', 'green', 'yellow-v2', 'orange', 'red-v2', 'pink', 'black-v2', 'white-v2'].flatMap(c => [
    [`bucket-${c}`, `${ART}/buckets/bucket-${c}.png`, {}],
    [`bucket-${c}-lid`, `${ART}/buckets/bucket-${c}-lid.png`, {}]
  ]),
  ['bucket-shadow', `${ART}/buckets/bucket-shadow.png`, {}],
  ['bucket-glow', `${ART}/ui-asset/effects.png`, {}],
  ['sparkle', `${ART}/ui-asset/sparkle.png`, {}],
  ['fail-glow', `${ART}/ui-asset/error.png`, { width: 590 }],
  ['endcard-logo', `${ART}/cta-assets/SandDropLogo.png`, { trim: true, width: 1000 }],
  ['ui-hand', 'Assets/Image/UI/finger.png', { trim: true, height: 400 }]
];

// The supplied mock-up audio. Source WAV amplitudes are part of the mix: preserve their relative
// levels (especially the quiet conveyor), mix to mono, and encode at 96 kbps. Optional start,
// seconds, fadeIn and fadeOut values can make an explicit edit; otherwise keep the complete clip.
const AUDIO_SOURCE = 'Assets/Audio/SDP SFX AND BGM/SFX AND BGM';
const AUDIO = [
  // The supplied music is used at its native speed; its identity against the video is unconfirmed.
  { key: 'bgm', wav: `${AUDIO_SOURCE}/Relaxing Lo-Fi Audio Extracted.wav`, volume: 0.8, loop: true },
  { key: 'sfx-conveyor', wav: `${AUDIO_SOURCE}/Conveyor Audio Extracted.wav`, volume: 0.9, loop: true },
  { key: 'sfx-cut', wav: `${AUDIO_SOURCE}/Falling Sand Audio Extracted.wav`, volume: 0.8, loop: true },
  { key: 'sfx-sand', wav: `${AUDIO_SOURCE}/Source Prop Salt Pour Big Shaker Grains Sand Falling Heavy 01 Audio Extracted.wav`, volume: 0.85, loop: true },
  { key: 'sfx-click', wav: `${AUDIO_SOURCE}/click_128kbps Audio Extracted.wav`, volume: 0.8, loop: false },
  { key: 'sfx-woosh', wav: `${AUDIO_SOURCE}/StoneSlide01 Audio Extracted.wav`, volume: 0.55, loop: false },
  { key: 'sfx-bells', wav: `${AUDIO_SOURCE}/star Audio Extracted.wav`, volume: 0.9, loop: false },
  { key: 'sfx-win', wav: `${AUDIO_SOURCE}/OhmLab_Bubble-Pop Audio Extracted.wav`, volume: 1, loop: false },
  { key: 'sfx-endcard', wav: `${AUDIO_SOURCE}/bubble-pop Audio Extracted.wav`, volume: 1, loop: false },
  { key: 'sfx-cta', wav: `${AUDIO_SOURCE}/Digital Click 1 Audio Extracted.wav`, volume: 0.9, loop: false },
  // The reference is a winning run; this supplied alarm is reserved for the game's fail mechanic.
  { key: 'sfx-fail', wav: `${AUDIO_SOURCE}/Danger Alarm Audio Extracted.wav`, volume: 0.4, loop: false }
];

const COLOR_NAMES = ['purple', 'blue', 'cyan', 'green', 'lime', 'yellow', 'orange', 'red', 'pink', 'black', 'white'];

function readWav(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Not a RIFF/WAVE file: ${file}`);
  }
  let offset = 12;
  let fmt;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      fmt = {
        format: buffer.readUInt16LE(offset + 8),
        channels: buffer.readUInt16LE(offset + 10),
        sampleRate: buffer.readUInt32LE(offset + 12),
        bits: buffer.readUInt16LE(offset + 22)
      };
    }
    if (id === 'data') {
      if (!fmt || !((fmt.format === 1 && fmt.bits === 16) || (fmt.format === 3 && fmt.bits === 32))) {
        throw new Error(`Unsupported WAV (need 16-bit PCM or 32-bit IEEE float): ${file}`);
      }
      if (fmt.channels < 1 || fmt.sampleRate < 8000) {
        throw new Error(`Invalid WAV channels or sample rate: ${file}`);
      }
      return { ...fmt, data: buffer.subarray(offset + 8, Math.min(buffer.length, offset + 8 + size)) };
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error(`No data chunk: ${file}`);
}

/** WAV entry → mono MP3, retaining source amplitude and any authored silence/tail. */
function encodeWav(entry) {
  const wav = readWav(path.join(root, entry.wav));
  const sampleBytes = wav.bits / 8;
  const frameBytes = wav.channels * sampleBytes;
  const startFrame = Math.round((entry.start ?? 0) * wav.sampleRate);
  const totalFrames = Math.floor(wav.data.length / frameBytes) - startFrame;
  const frames = Math.min(totalFrames, Math.round((entry.seconds ?? totalFrames / wav.sampleRate) * wav.sampleRate));
  if (startFrame < 0 || frames <= 0) {
    throw new Error(`Empty or invalid WAV trim: ${entry.wav}`);
  }
  const fadeInFrames = Math.round((entry.fadeIn ?? 0) * wav.sampleRate);
  const fadeOutFrames = Math.round((entry.fadeOut ?? 0) * wav.sampleRate);
  const mono = new Int16Array(frames);
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < wav.channels; c++) {
      const offset = (startFrame + i) * frameBytes + c * sampleBytes;
      const value = wav.format === 3 ? wav.data.readFloatLE(offset) : wav.data.readInt16LE(offset) / 32768;
      if (!Number.isFinite(value)) {
        throw new Error(`Non-finite WAV sample: ${entry.wav}`);
      }
      sum += value;
    }
    let gain = 1;
    if (i < fadeInFrames) gain = i / fadeInFrames;
    if (fadeOutFrames > 0 && i >= frames - fadeOutFrames) gain = Math.min(gain, (frames - i - 1) / fadeOutFrames);
    mono[i] = Math.max(-32768, Math.min(32767, Math.round((sum / wav.channels) * gain * 32767)));
  }

  const encoder = new Mp3Encoder(1, wav.sampleRate, entry.kbps ?? 96);
  const chunks = [];
  const block = 1152;
  for (let i = 0; i < mono.length; i += block) {
    const out = encoder.encodeBuffer(mono.subarray(i, i + block));
    if (out.length) chunks.push(Buffer.from(out.buffer, out.byteOffset, out.length));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail.buffer, tail.byteOffset, tail.length));
  return Buffer.concat(chunks);
}

/** 4-connected same-colour components: per-cell label plus each component's colour, size and top contact. */
function labelPatches(grid, cols, rows) {
  const n = cols * rows;
  const label = new Int32Array(n).fill(-1);
  const patches = [];
  const stack = new Int32Array(n);
  for (let start = 0; start < n; start++) {
    if (!grid[start] || label[start] >= 0) continue;
    const color = grid[start];
    const id = patches.length;
    let size = 0;
    let top = false;
    let sp = 0;
    stack[sp++] = start;
    label[start] = id;
    while (sp) {
      const p = stack[--sp];
      size++;
      if (p < cols) top = true;
      const x = p % cols;
      const neighbours = [x > 0 ? p - 1 : -1, x < cols - 1 ? p + 1 : -1, p - cols, p + cols];
      for (const q of neighbours) {
        if (q >= 0 && q < n && label[q] < 0 && grid[q] === color) {
          label[q] = id;
          stack[sp++] = q;
        }
      }
    }
    patches.push({ color, size, top });
  }
  return { label, patches };
}

/** Recolours every patch under `min` grains to the neighbouring colour it shares the longest border with. */
function mergeSmallPatches(grid, cols, rows, min) {
  let merged = 0;
  for (let pass = 0; pass < 10; pass++) {
    const { label, patches } = labelPatches(grid, cols, rows);
    const small = patches.map(p => p.size < min);
    if (!small.some(Boolean)) break;
    const border = patches.map(() => new Map());
    for (let p = 0; p < grid.length; p++) {
      const id = label[p];
      if (id < 0 || !small[id]) continue;
      const x = p % cols;
      const neighbours = [x > 0 ? p - 1 : -1, x < cols - 1 ? p + 1 : -1, p - cols, p + cols];
      for (const q of neighbours) {
        if (q >= 0 && q < grid.length && grid[q] && label[q] !== id) {
          border[id].set(grid[q], (border[id].get(grid[q]) ?? 0) + 1);
        }
      }
    }
    const target = border.map(map => [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
    for (let p = 0; p < grid.length; p++) {
      const id = label[p];
      if (id >= 0 && small[id] && target[id]) {
        grid[p] = target[id];
        merged++;
      }
    }
  }
  return merged;
}

async function buildSandPicture(target, sand) {
  const { left, top, width, height } = LEVEL.crop;
  const { data } = await sharp(path.join(root, LEVEL.source))
    .removeAlpha()
    .extract({ left, top, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cols = sand.columns;
  const rows = Math.round(cols / (LEVEL.aspect ?? width / height));
  // The painting's darkened bottom edge reads as the colours just above it.
  const lastRow = height - 1 - (LEVEL.shadowRows ?? 0);
  const palette = sand.palette;
  const nearest = (r, g, b) => {
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const [pr, pg, pb] = palette[i];
      const distance = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    return best + 1;
  };

  const grid = new Uint8Array(cols * rows);
  const votes = new Int32Array(palette.length + 1);
  for (let gy = 0; gy < rows; gy++) {
    const y0 = Math.floor((gy * height) / rows);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) * height) / rows));
    for (let gx = 0; gx < cols; gx++) {
      const x0 = Math.floor((gx * width) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) * width) / cols));
      votes.fill(0);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (Math.min(y, lastRow) * width + x) * 3;
          votes[nearest(data[i], data[i + 1], data[i + 2])]++;
        }
      }
      let best = 1;
      for (let c = 2; c < votes.length; c++) {
        if (votes[c] > votes[best]) best = c;
      }
      grid[gy * cols + gx] = best;
    }
  }

  // A grid-of-cells level: every grain takes its cell's colour (the most common in the cell's middle).
  if (LEVEL.cells) {
    const { cols: cellCols, rows: cellRows, margin } = LEVEL.cells;
    if (cols % cellCols || rows % cellRows) {
      throw new Error(`${cols} × ${rows} grains don't divide into ${cellCols} × ${cellRows} cells (set SAND.columns to a multiple of ${cellCols})`);
    }
    const cellColor = new Uint8Array(cellCols * cellRows);
    for (let j = 0; j < cellRows; j++) {
      const sy0 = Math.round((j * height) / cellRows) + margin;
      const sy1 = Math.round(((j + 1) * height) / cellRows) - margin;
      for (let i = 0; i < cellCols; i++) {
        const sx0 = Math.round((i * width) / cellCols) + margin;
        const sx1 = Math.round(((i + 1) * width) / cellCols) - margin;
        votes.fill(0);
        for (let y = sy0; y < sy1; y++) {
          for (let x = sx0; x < sx1; x++) {
            const k = (y * width + x) * 3;
            votes[nearest(data[k], data[k + 1], data[k + 2])]++;
          }
        }
        let best = 1;
        for (let c = 2; c < votes.length; c++) {
          if (votes[c] > votes[best]) best = c;
        }
        cellColor[j * cellCols + i] = best;
      }
    }
    const grainsX = cols / cellCols;
    const grainsY = rows / cellRows;
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        grid[gy * cols + gx] = cellColor[Math.floor(gy / grainsY) * cellCols + Math.floor(gx / grainsX)];
      }
    }
  }

  let despeckled = 0;
  if (LEVEL.despeckle) {
    const source = grid.slice();
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        votes.fill(0);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const x = gx + dx;
            const y = gy + dy;
            if (x >= 0 && y >= 0 && x < cols && y < rows) votes[source[y * cols + x]]++;
          }
        }
        const own = source[gy * cols + gx];
        let best = own;
        for (let c = 1; c < votes.length; c++) {
          if (votes[c] > votes[best]) best = c;
        }
        if (best !== own) {
          grid[gy * cols + gx] = best;
          despeckled++;
        }
      }
    }
  }

  const merged = mergeSmallPatches(grid, cols, rows, LEVEL.minPatch);
  const { patches } = labelPatches(grid, cols, rows);

  const rgb = Buffer.alloc(cols * rows * 3);
  for (let p = 0; p < grid.length; p++) {
    const [r, g, b] = palette[grid[p] - 1];
    rgb[p * 3] = r;
    rgb[p * 3 + 1] = g;
    rgb[p * 3 + 2] = b;
  }
  await sharp(rgb, { raw: { width: cols, height: rows, channels: 3 } }).webp({ lossless: true }).toFile(target);
  sandLevel = { cols, rows, grid, palette };

  const name = color => COLOR_NAMES[color - 1] ?? `colour${color}`;
  const present = [...new Set(patches.map(p => p.color))].sort();
  const sizes = patches.map(p => p.size).sort((a, b) => a - b);
  console.log(`Sand picture: ${cols}×${rows} grains, ${patches.length} patches (smallest ${sizes[0]}, ${merged} grains merged, ${despeckled} despeckled)`);
  console.log(`  colours: ${present.map(name).join(', ')}`);
  console.log(`  holding the top edge: ${patches.filter(p => p.top).map(p => `${name(p.color)} ${p.size}`).join(', ')}`);
}

/** The finished grain picture's size (buildSandPicture), for the sharper copy. */
let sandLevel = null;

/**
 * `sand-picture-hd`: the painting itself (texture, smooth edges, its shaded bottom edge) at
 * LEVEL.hdScale × the grain grid; the game shows each of its pixels while the grain under it (or a
 * touching grain of its colour) is still there (PictureHd).
 */
async function buildSandPictureHd(target) {
  const { cols, rows, grid, palette } = sandLevel;
  const { left, top, width, height } = LEVEL.crop;
  const scale = LEVEL.hdScale;
  let image;
  if (LEVEL.cells) {
    // Cell by cell: each painting cell shows the middle of its source cell (its texture, none of
    // its edges), stretched to fill the cell.
    const { data: src } = await sharp(path.join(root, LEVEL.source))
      .extract({ left, top, width, height })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { cols: cellCols, rows: cellRows, margin } = LEVEL.cells;
    const w = cols * scale;
    const h = rows * scale;
    const cellW = w / cellCols;
    const cellH = h / cellRows;
    const out = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      const j = Math.floor(y / cellH);
      const sy0 = Math.round((j * height) / cellRows) + margin;
      const sy1 = Math.round(((j + 1) * height) / cellRows) - margin;
      const sy = Math.min(sy1 - 1, Math.floor(sy0 + ((y - j * cellH + 0.5) * (sy1 - sy0)) / cellH));
      for (let x = 0; x < w; x++) {
        const i = Math.floor(x / cellW);
        const sx0 = Math.round((i * width) / cellCols) + margin;
        const sx1 = Math.round(((i + 1) * width) / cellCols) - margin;
        const sx = Math.min(sx1 - 1, Math.floor(sx0 + ((x - i * cellW + 0.5) * (sx1 - sx0)) / cellW));
        src.copy(out, (y * w + x) * 4, (sy * width + sx) * 4, (sy * width + sx) * 4 + 4);
      }
    }
    image = sharp(out, { raw: { width: w, height: h, channels: 4 } });
  } else {
    image = sharp(path.join(root, LEVEL.source))
      .extract({ left, top, width, height })
      .resize(cols * scale, rows * scale, { fit: 'fill', kernel: LEVEL.hdKernel ?? 'lanczos3' });
  }
  if (LEVEL.hdSnap) {
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    // The colour the game reads for a pixel (PictureHd: nearest palette colour to its 3 × 3 average).
    const classOf = (x, y) => {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = Math.min(h - 1, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx++) {
          const i = (yy * w + Math.min(w - 1, Math.max(0, x + dx))) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
      }
      return nearestColor(palette, r / 9, g / 9, b / 9);
    };
    // A seam pixel: it reads as (3 × 3 average: PictureHd would give it to that grain) or looks like
    // (itself) the colour of a touching grain; or it is in the half of its grain that faces sand of
    // another colour and doesn't look like its own grain (the source's pale or dark seam lines).
    const foreign = (x, y) => {
      const gx = Math.floor(x / scale);
      const gy = Math.floor(y / scale);
      const own = grid[gy * cols + gx];
      const i = (y * w + x) * 4;
      const looks = nearestColor(palette, data[i], data[i + 1], data[i + 2]);
      const read = classOf(x, y);
      if (read === own && looks === own) return false;
      if (looks !== own) {
        const lx = x - gx * scale;
        const ly = y - gy * scale;
        const sx = lx < scale / 2 ? -1 : 1;
        const sy = ly < scale / 2 ? -1 : 1;
        for (const [dx, dy] of [[sx, 0], [0, sy], [sx, sy]]) {
          const nx = gx + dx;
          const ny = gy + dy;
          if ((dx || dy) && nx >= 0 && ny >= 0 && nx < cols && ny < rows && grid[ny * cols + nx] !== own) return true;
        }
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = gx + dx;
          const ny = gy + dy;
          if ((dx || dy) && nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
            const touching = grid[ny * cols + nx];
            if (touching !== own && (touching === read || touching === looks)) return true;
          }
        }
      }
      return false;
    };
    const paint = (x, y) => {
      const own = grid[Math.floor(y / scale) * cols + Math.floor(x / scale)];
      const i = (y * w + x) * 4;
      data[i] = palette[own - 1][0];
      data[i + 1] = palette[own - 1][1];
      data[i + 2] = palette[own - 1][2];
    };
    // Recolour only those pixels (in their own grain's colour), then, if needed, their neighbours in
    // the same grain too, until none is left: the painting's texture stays everywhere else.
    let snapped = 0;
    let left = 0;
    for (let pass = 0; pass < 8; pass++) {
      const marked = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (foreign(x, y)) marked.push(x, y);
        }
      }
      left = marked.length / 2;
      if (!left) break;
      for (let k = 0; k < marked.length; k += 2) {
        const x = marked[k];
        const y = marked[k + 1];
        paint(x, y);
        snapped++;
        if (pass < 2) continue;
        const gx = Math.floor(x / scale);
        const gy = Math.floor(y / scale);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h && Math.floor(nx / scale) === gx && Math.floor(ny / scale) === gy) paint(nx, ny);
          }
        }
      }
    }
    console.log(`  painting: ${snapped} edge pixels recoloured so each shows with its own grain${left ? `, ${left} still off` : ''}`);
    image = sharp(data, { raw: { width: w, height: info.height, channels: 4 } });
  }
  await image.webp({ quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true }).toFile(target);
}

/** Palette value (1-based) of the colour nearest (r, g, b). */
function nearestColor(palette, r, g, b) {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const distance = (r - palette[i][0]) ** 2 + (g - palette[i][1]) ** 2 + (b - palette[i][2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best + 1;
}

/**
 * The sand container art, with two fixes to the artist's file:
 * - A speck of red sand (40 px) painted onto its right stroke is replaced by the stroke above it.
 * - The translucent light-blue band under its top stroke paled the sand there; the mock-up shows a
 *   dark shadow, so the band becomes black, fading from 77 % at the stroke to nothing over ~22 px
 *   (CONTAINER_TOP_SHADOW: [art row, brightness left on the sand]), measured from the mock-up.
 */
const CONTAINER_SPECK = { x0: 855, x1: 890, y0: 744, y1: 770, sourceRow: 738 };
const CONTAINER_OPENING = { x0: 35, x1: 867, y0: 28, y1: 52 };
const CONTAINER_TOP_SHADOW = [[28, 0.23], [30.25, 0.4], [32.5, 0.52], [34.75, 0.53], [37, 0.63], [39.25, 0.75], [41.5, 0.83], [43.75, 0.86], [46, 0.89], [48.25, 0.96], [50.5, 1]];

async function buildContainer(target, source) {
  const { data, info } = await sharp(path.join(root, source)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const s = CONTAINER_SPECK;
  for (let y = s.y0; y <= s.y1; y++) {
    data.copy(data, (y * w + s.x0) * 4, (s.sourceRow * w + s.x0) * 4, (s.sourceRow * w + s.x1 + 1) * 4);
  }
  const brightness = row => {
    const steps = CONTAINER_TOP_SHADOW;
    if (row <= steps[0][0]) return steps[0][1];
    for (let i = 1; i < steps.length; i++) {
      if (row <= steps[i][0]) {
        const [r0, b0] = steps[i - 1];
        const [r1, b1] = steps[i];
        return b0 + ((b1 - b0) * (row - r0)) / (r1 - r0);
      }
    }
    return 1;
  };
  const o = CONTAINER_OPENING;
  for (let y = o.y0; y <= o.y1; y++) {
    const alpha = Math.round(255 * (1 - brightness(y)));
    for (let x = o.x0; x <= o.x1; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 255) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = alpha;
      }
    }
  }
  await sharp(data, { raw: { width: w, height: info.height, channels: 4 } })
    .webp({ quality: 84, alphaQuality: 90, effort: 6, smartSubsample: true })
    .toFile(target);
}

/** The belt art split into the plain track and one chevron (see BELT_ART); read once for both slots. */
let beltSplit;
async function splitBelt(source) {
  if (beltSplit) {
    return beltSplit;
  }
  const { data, info } = await sharp(path.join(root, source)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const g = BELT_ART;
  const straight = g.half * 2;
  const arc = Math.PI * g.radius;
  const length = straight * 2 + arc * 2;
  const left = g.cx - g.half;
  const right = g.cx + g.half;
  // Loop position s (along the centre line: top run left to right, round the right end, bottom run
  // right to left, round the left end) and d (distance from the centre line, + outward) of a point.
  const where = (x, y) => {
    if (x >= left && x <= right) {
      return y < g.cy ? [x - left, g.cy - y - g.radius] : [straight + arc + (right - x), y - g.cy - g.radius];
    }
    const ex = x > right ? right : left;
    let a = Math.atan2(y - g.cy, x - ex);
    if (x < left && a < 0) a += Math.PI * 2;
    const s = x > right ? straight + (a + Math.PI / 2) * g.radius : straight * 2 + arc + (a - Math.PI / 2) * g.radius;
    return [s, Math.hypot(x - ex, y - g.cy) - g.radius];
  };
  // The pixel at loop position s, d.
  const pixelAt = (s, d) => {
    s = ((s % length) + length) % length;
    let x;
    let y;
    if (s < straight) {
      x = left + s;
      y = g.cy - g.radius - d;
    } else if (s < straight + arc) {
      const a = -Math.PI / 2 + (s - straight) / g.radius;
      x = right + Math.cos(a) * (g.radius + d);
      y = g.cy + Math.sin(a) * (g.radius + d);
    } else if (s < straight * 2 + arc) {
      x = right - (s - straight - arc);
      y = g.cy + g.radius + d;
    } else {
      const a = Math.PI / 2 + (s - straight * 2 - arc) / g.radius;
      x = left + Math.cos(a) * (g.radius + d);
      y = g.cy + Math.sin(a) * (g.radius + d);
    }
    return Math.round(y - 0.5) * w + Math.round(x - 0.5);
  };
  const sum = p => data[p * 4] + data[p * 4 + 1] + data[p * 4 + 2];
  // Track pixels, their loop position, and the usual shade per (sector, distance) bin: its 25th
  // percentile, so the lighter chevrons don't pull it up.
  const onTrack = new Uint8Array(w * h);
  const sAt = new Float32Array(w * h);
  const dAt = new Float32Array(w * h);
  const bins = new Map();
  const binOf = (s, d) => `${Math.floor(s / g.sector)}|${Math.round(d)}`;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const [s, d] = where(x + 0.5, y + 0.5);
      if (Math.abs(d) > g.trackHalf || data[p * 4 + 3] < 250) continue;
      onTrack[p] = 1;
      sAt[p] = s;
      dAt[p] = d;
      const key = binOf(s, d);
      if (!bins.has(key)) bins.set(key, []);
      bins.get(key).push(sum(p));
    }
  }
  const usual = new Map();
  for (const [key, sums] of bins) {
    sums.sort((a, b) => a - b);
    usual.set(key, sums[Math.floor(sums.length * 0.25)]);
  }
  const core = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    if (onTrack[p] && sum(p) > usual.get(binOf(sAt[p], dAt[p])) + g.threshold) core[p] = 1;
  }
  // Plus a 1 px fringe (the chevrons' soft edges).
  const mask = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (!onTrack[p]) continue;
      for (let dy = -1; dy <= 1 && !mask[p]; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (core[p + dy * w + dx]) {
            mask[p] = 1;
            break;
          }
        }
      }
    }
  }
  // Repaint each chevron pixel from the nearest plain track on either side along the loop.
  const clean = Buffer.from(data);
  let painted = 0;
  for (let p = 0; p < w * h; p++) {
    if (!mask[p]) continue;
    const found = [];
    for (const dir of [-1, 1]) {
      for (let k = 1; k < 120; k++) {
        const q = pixelAt(sAt[p] + dir * k, dAt[p]);
        if (q >= 0 && q < w * h && onTrack[q] && !mask[q]) {
          found.push([q, k]);
          break;
        }
      }
    }
    if (!found.length) continue;
    const total = found.reduce((t, [, k]) => t + 1 / k, 0);
    for (let c = 0; c < 3; c++) {
      clean[p * 4 + c] = Math.round(found.reduce((t, [q, k]) => t + data[q * 4 + c] / k, 0) / total);
    }
    painted++;
  }
  // The chevron colour: the middle of the brightest chevron pixels.
  const chevronPixels = [];
  for (let p = 0; p < w * h; p++) if (core[p]) chevronPixels.push(p);
  chevronPixels.sort((a, b) => sum(b) - sum(a));
  const top = chevronPixels.slice(0, Math.max(1, Math.floor(chevronPixels.length * 0.2)));
  const color = [0, 1, 2].map(c => {
    const values = top.map(p => data[p * 4 + c]).sort((a, b) => a - b);
    return values[values.length >> 1];
  });
  // The top-run chevron nearest the middle: its columns are the run of masked columns around it.
  const topY0 = Math.ceil(g.cy - g.radius - g.trackHalf);
  const topY1 = Math.floor(g.cy - g.radius + g.trackHalf);
  const masked = x => {
    for (let y = topY0; y <= topY1; y++) if (mask[y * w + x]) return true;
    return false;
  };
  let x0 = Math.round(g.cx);
  for (let k = 0; k < 80 && !masked(x0); k++) x0 += k % 2 ? k : -k;
  let x1 = x0;
  while (masked(x0 - 1)) x0--;
  while (masked(x1 + 1)) x1++;
  let y0 = topY1;
  let y1 = topY0;
  for (let y = topY0; y <= topY1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (mask[y * w + x]) {
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
  }
  // Centred on the centre line (the game draws it there), 2 px of clear margin round it.
  const lineY = g.cy - g.radius;
  const halfH = Math.ceil(Math.max(lineY - y0, y1 + 1 - lineY)) + 2;
  const cw = x1 - x0 + 1 + 4;
  const ch = halfH * 2;
  const chevron = Buffer.alloc(cw * ch * 4);
  const cy0 = Math.round(lineY - halfH);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const sx = x0 - 2 + x;
      const sy = cy0 + y;
      const o = (y * cw + x) * 4;
      chevron[o] = color[0];
      chevron[o + 1] = color[1];
      chevron[o + 2] = color[2];
      const p = sy * w + sx;
      if (sy < 0 || sy >= h || !mask[p]) continue;
      // How far the pixel is from the plain track toward the chevron colour.
      let along = 0;
      let span = 0;
      for (let c = 0; c < 3; c++) {
        const base = clean[p * 4 + c];
        along += (data[p * 4 + c] - base) * (color[c] - base);
        span += (color[c] - base) * (color[c] - base);
      }
      chevron[o + 3] = Math.round(255 * Math.max(0, Math.min(1, span > 0 ? along / span : 0)));
    }
  }
  console.log(`Belt: ${painted} chevron px painted out; chevron ${cw}×${ch} (art x ${x0}–${x1}), colour ${color.join(',')}`);
  beltSplit = { clean, w, h, chevron, cw, ch };
  return beltSplit;
}

async function buildBelt(target, source, part) {
  const belt = await splitBelt(source);
  if (part === 'track') {
    await sharp(belt.clean, { raw: { width: belt.w, height: belt.h, channels: 4 } })
      .webp({ quality: 84, alphaQuality: 90, effort: 6, smartSubsample: true })
      .toFile(target);
  } else {
    await sharp(belt.chevron, { raw: { width: belt.cw, height: belt.ch, channels: 4 } })
      .webp({ lossless: true, effort: 6 })
      .toFile(target);
  }
}

async function buildImage(target, source, options) {
  let image = sharp(path.join(root, source)).ensureAlpha();
  if (options.trim) {
    image = sharp(await image.trim({ threshold: 1 }).png().toBuffer());
  }
  if (options.width || options.height) {
    image = image.resize(options.width ?? null, options.height ?? null, { kernel: 'lanczos3' });
  }
  await image.webp({ quality: 84, alphaQuality: 90, effort: 6, smartSubsample: true }).toFile(target);
}

async function main() {
  const defaults = JSON.parse(fs.readFileSync(defaultsFile, 'utf8'));
  const audioOnly = process.argv.includes('--audio-only');
  const target = path.resolve(audioOnly ? path.join(outRoot, 'audio') : outRoot);
  const runtimeRoot = path.resolve(root, 'Assets', 'Runtime');
  if (!target.startsWith(path.resolve(root) + path.sep) || (target !== runtimeRoot && target !== path.join(runtimeRoot, 'audio'))) {
    throw new Error(`Refusing unexpected runtime asset cleanup target: ${target}`);
  }
  // Check all new audio inputs before removing the previous runtime files.
  for (const entry of AUDIO) {
    if (entry.wav) readWav(path.join(root, entry.wav));
    else if (!fs.existsSync(path.join(root, entry.file))) throw new Error(`Missing audio source: ${entry.file}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.join(outRoot, 'audio'), { recursive: true });

  const textures = [];
  let imageBytes = 0;
  if (!audioOnly) fs.mkdirSync(path.join(outRoot, 'images'), { recursive: true });
  const entries = audioOnly ? [] : [['sand-picture', null, {}], ['sand-picture-hd', null, {}], ...IMAGES];
  for (const [key, source, options] of entries) {
    const target = path.join(outRoot, 'images', `${key}.webp`);
    if (key === 'sand-picture') {
      await buildSandPicture(target, defaults.SAND);
    } else if (key === 'sand-picture-hd') {
      await buildSandPictureHd(target);
    } else if (key === 'sand-container') {
      await buildContainer(target, source);
    } else if (key === 'conveyor-belt' || key === 'belt-chevron') {
      await buildBelt(target, source, key === 'conveyor-belt' ? 'track' : 'chevron');
    } else {
      await buildImage(target, source, options);
    }
    const meta = await sharp(target).metadata();
    imageBytes += fs.statSync(target).size;
    textures.push({
      spriteName: key,
      path: '',
      originalSize: { width: meta.width, height: meta.height },
      format: path.extname(target).slice(1),
      uuid: key,
      resizeBlocked: true,
      anchorPoint: { x: 0.5, y: 0.5 },
      scale: 1
    });
  }

  const soundtracks = [];
  let audioBytes = 0;
  for (const entry of AUDIO) {
    const target = path.join(outRoot, 'audio', `${entry.key}.mp3`);
    if (entry.wav) {
      fs.writeFileSync(target, encodeWav(entry));
    } else {
      fs.copyFileSync(path.join(root, entry.file), target);
    }
    audioBytes += fs.statSync(target).size;
    soundtracks.push({
      id: entry.key,
      path: '',
      volume: entry.volume,
      loop: entry.loop,
      format: path.extname(target).slice(1),
      uuid: entry.key
    });
  }

  if (!audioOnly) defaults.CHANGABLE_TEXTURES = textures;
  defaults.CHANGABLE_SOUNDTRACKS = soundtracks;
  fs.writeFileSync(defaultsFile, `${JSON.stringify(defaults, null, 2)}\n`);

  if (audioOnly) console.log('Audio-only preparation: runtime images and texture metadata preserved.');
  else console.log(`Images: ${textures.length} files, ${(imageBytes / 1024).toFixed(1)} KB (${textures.map(t => `${t.uuid} ${t.originalSize.width}×${t.originalSize.height}`).join(', ')})`);
  console.log(`Audio: ${soundtracks.length} files, ${(audioBytes / 1024).toFixed(1)} KB`);
}

main().catch(error => {
  console.warn(error);
  process.exitCode = 1;
});
