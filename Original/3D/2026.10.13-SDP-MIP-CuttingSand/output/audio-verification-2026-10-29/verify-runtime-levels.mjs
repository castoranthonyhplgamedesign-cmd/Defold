import fs from 'node:fs';
import { readPcm, downsample, correlate, refine } from '../audio-analysis-2026-10-29/signal.mjs';
const sr = 11025;
const dir = 'Assets/Audio/SDP SFX AND BGM/SFX AND BGM';
const output = 'output/audio-verification-2026-10-29';
const ref = readPcm(output + '/pcm/reference.f32');
function highpass(input) {
  let source = input;
  const alpha = 1 / (1 + 2 * Math.PI * 500 / sr);
  for (let pass = 0; pass < 2; pass++) {
    const filtered = new Float32Array(source.length); let priorX = 0, priorY = 0;
    for (let i = 0; i < source.length; i++) { const y = alpha * (priorY + source[i] - priorX); priorX = source[i]; priorY = y; filtered[i] = y; }
    source = filtered;
  }
  return source;
}
const result = { method: 'Mono decoded runtime MP3 compared with original supplied float32 WAV and mixed reference. Relative gains are waveform least-squares estimates, not perceived loudness measurements. Highpass of two one-pole 500Hz filters suppresses unrelated BGM when estimating reference sand-component gains.', sounds: [] };
for (const [id, name, volume, sourceWindow] of [
  ['sfx-cut', 'Falling Sand Audio Extracted.wav', 0.8, [0.6, 1.2]],
  ['sfx-sand', 'Source Prop Salt Pour Big Shaker Grains Sand Falling Heavy 01 Audio Extracted.wav', 0.85, [2.4, 3]]
]) {
  const b = fs.readFileSync(dir + '/' + name);
  const source = new Float32Array(Math.floor(b.readUInt32LE(40) / 32));
  for (let i = 0; i < source.length; i++) for (let j = 0; j < 8; j++) source[i] += b.readFloatLE(44 + (i * 8 + j) * 4) / 8;
  const runtime = readPcm(output + '/pcm/' + id + '.f32');
  const p = correlate(downsample(runtime, 2), downsample(source, 2), { limit: 1, separation: 1 })[0];
  const conversion = refine(runtime, source, p.start * 2, 18);
  const window = runtime.slice(Math.round((sourceWindow[0] + conversion.start / sr) * sr), Math.round((sourceWindow[1] + conversion.start / sr) * sr));
  const filteredReference = highpass(ref), filteredWindow = highpass(window);
  const peaks = correlate(downsample(filteredReference, 2), downsample(filteredWindow, 2), { limit: 8, separation: Math.round(sr * 0.3 / 2) });
  const videoMatches = peaks.map(p => {
    const refined = refine(filteredReference, filteredWindow, p.start * 2, 18);
    return { videoTime: refined.start / sr, score: refined.score, referenceComponentGain: refined.gain,
      currentSteadyVolume: volume, currentToReferenceGainRatio: volume / refined.gain,
      currentRelativeDb: refined.gain > 0 ? 20 * Math.log10(volume / refined.gain) : null };
  }).sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  result.sounds.push({ id, source: name, volume, conversion: { score: conversion.score, amplitudeGain: conversion.gain, paddingStartSeconds: conversion.start / sr }, sourceWindow, videoMatches });
}
fs.writeFileSync(output + '/runtime-level-comparison.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
