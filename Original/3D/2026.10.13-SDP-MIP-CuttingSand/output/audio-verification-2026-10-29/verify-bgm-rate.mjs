import fs from 'node:fs';
import { readPcm, downsample, nextPower, spectrum, prefix, correlate, refine } from '../audio-analysis-2026-10-29/signal.mjs';
const sr = 11025, factor = 5;
const ref = readPcm('output/audio-verification-2026-10-29/pcm/reference.f32');
const file = 'Assets/Audio/SDP SFX AND BGM/SFX AND BGM/Relaxing Lo-Fi Audio Extracted.wav';
const b = fs.readFileSync(file), source = new Float32Array(Math.floor(53 * sr));
for (let i = 0; i < source.length; i++) for (let j = 0; j < 8; j++) source[i] += b.readFloatLE(44 + (i * 8 + j) * 4) / 8;
const coarseRef = downsample(ref, factor), n = nextPower(coarseRef.length + 7 * sr / factor);
const spec = spectrum(coarseRef, n), stats = prefix(coarseRef);
const result = { method: 'Narrow waveform speed/pitch test suggested by independent source/video repetition periods. Linear interpolation resampling, mono normalized correlation; no edits to source or runtime.', files: [] };
for (const rate of [1, 85 / 82, 1.035, 1.036, 1.037, 1.038]) {
  const accelerated = new Float32Array(Math.floor(source.length / rate));
  for (let i = 0; i < accelerated.length; i++) { const pos = i * rate, lo = Math.floor(pos), t = pos - lo; accelerated[i] = source[lo] * (1 - t) + (source[lo + 1] || 0) * t; }
  const matches = [];
  for (const start of [0, 8, 20, 32, 42]) {
    const template = accelerated.slice(Math.round(start * sr), Math.round((start + 7) * sr));
    if (template.length < 6 * sr) continue;
    const peaks = correlate(coarseRef, downsample(template, factor), { n, signalSpectrum: spec, statistics: stats, limit: 4, separation: Math.round(sr / factor * 0.5) });
    for (const peak of peaks) { const refined = refine(ref, template, peak.start * factor, 15); matches.push({ window: [start, start + template.length / sr], videoTime: refined.start / sr, sourceStartAlignedToVideo: refined.start / sr - start, score: refined.score, gain: refined.gain }); }
  }
  matches.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  result.files.push({ rate, matches });
  console.log(JSON.stringify({ rate, matches: matches.slice(0, 4) }));
}
fs.writeFileSync('output/audio-verification-2026-10-29/bgm-rate-check.json', JSON.stringify(result, null, 2));
