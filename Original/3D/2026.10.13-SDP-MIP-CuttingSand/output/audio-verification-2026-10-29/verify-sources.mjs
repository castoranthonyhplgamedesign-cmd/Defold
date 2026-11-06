import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPcm, downsample, nextPower, spectrum, prefix, correlate, refine } from '../audio-analysis-2026-10-29/signal.mjs';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../..');
const dir = path.join(root, 'Assets/Audio/SDP SFX AND BGM/SFX AND BGM');
const sr = 11025;
const ref = readPcm(path.join(root, 'output/audio-analysis-2026-10-29/pcm/reference.f32'));
function wav(file) {
  const b = fs.readFileSync(file);
  let channels = 0, rate = 0, format = 0, bits = 0, offset = 0, bytes = 0;
  for (let i = 12; i + 8 <= b.length;) {
    const id = b.toString('ascii', i, i + 4), size = b.readUInt32LE(i + 4);
    if (id === 'fmt ') { format = b.readUInt16LE(i + 8); channels = b.readUInt16LE(i + 10); rate = b.readUInt32LE(i + 12); bits = b.readUInt16LE(i + 22); }
    if (id === 'data') { offset = i + 8; bytes = size; }
    i += 8 + size + (size % 2);
  }
  if (format !== 3 || bits !== 32 || rate !== 44100 || !offset) throw new Error('Unexpected WAV format: ' + file);
  const frames = bytes / channels / 4;
  const samples = new Float32Array(Math.floor(frames / 4));
  let energy = 0, peak = 0;
  for (let i = 0; i < samples.length; i++) {
    let value = 0;
    for (let j = 0; j < 4; j++) for (let c = 0; c < channels; c++) value += b.readFloatLE(offset + ((i * 4 + j) * channels + c) * 4) / (4 * channels);
    samples[i] = value; energy += value * value; peak = Math.max(peak, Math.abs(value));
  }
  return { samples, channels, duration: frames / rate, rms: Math.sqrt(energy / samples.length), peak };
}
const cutoff = Number(process.argv[2] || 0);
function highpass(input) {
  if (!cutoff) return input;
  let source = input;
  const alpha = 1 / (1 + 2 * Math.PI * cutoff / sr);
  for (let pass = 0; pass < 2; pass++) {
    const filtered = new Float32Array(source.length);
    let priorX = 0, priorY = 0;
    for (let i = 0; i < source.length; i++) { const y = alpha * (priorY + source[i] - priorX); priorX = source[i]; priorY = y; filtered[i] = y; }
    source = filtered;
  }
  return source;
}
const signal = highpass(ref);
const factor = cutoff ? 2 : 4, coarseRate = sr / factor, coarseRef = downsample(signal, factor);
const n = nextPower(coarseRef.length + 15 * coarseRate);
const spec = spectrum(coarseRef, n), stats = prefix(coarseRef);
const result = { method: 'Fresh supplied float32 WAV identity check against previously decoded actual mockup PCM. WAV averaged to mono and 11025 Hz using a 4-sample box filter. Normalized waveform correlation with 11025 Hz refinement. Correlation scores are not probabilities. Positive high scores across broadband duration support identity; weak scores do not establish absence.', highpassHz: cutoff, highpassPasses: cutoff ? 2 : 0, sampleRate: sr, referenceSeconds: ref.length / sr, files: [] };
for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.wav'))) {
  const { samples, ...metadata } = wav(path.join(dir, name));
  const windows = [];
  if (/Relaxing|Conveyor/.test(name)) {
    for (const start of [0, 8, 20, 32, 42]) if (start + 7 <= metadata.duration) windows.push([start, start + 7]);
  } else if (/Falling Sand|Source Prop/.test(name) && cutoff) {
    windows.push([0, metadata.duration]);
    for (let start = 0; start + 0.6 <= metadata.duration; start += 0.6) windows.push([start, start + 0.6]);
  } else windows.push([0, metadata.duration]);
  const matches = [];
  for (const [start, end] of windows) {
    const template = highpass(samples.slice(Math.round(start * sr), Math.round(end * sr)));
    const coarse = downsample(template, factor);
    const peaks = correlate(coarseRef, coarse, { n, signalSpectrum: spec, statistics: stats, limit: 8, separation: Math.round(coarseRate * Math.min(0.25, (end - start) / 2)) });
    for (const p of peaks) {
      const r = refine(signal, template, p.start * factor, 18);
      matches.push({ sourceWindow: [start, end], videoTime: r.start / sr, sourceStartAlignedToVideo: r.start / sr - start, score: r.score, gain: r.gain, comparedSeconds: r.length / sr });
    }
  }
  matches.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  result.files.push({ source: path.relative(root, path.join(dir, name)).replaceAll('\\', '/'), ...metadata, matches });
  console.log(name, JSON.stringify(matches.slice(0, 4)));
  fs.writeFileSync(path.join(out, cutoff ? `source-identity-highpass-${cutoff}.json` : 'source-identity.json'), JSON.stringify(result, null, 2));
}
