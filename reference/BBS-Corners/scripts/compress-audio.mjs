import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetDir = path.join(root, 'src', 'assets');
const lamejs = loadLameJs();

const AUDIO_TARGETS = [
  { source: 'bgm.wav', output: 'bgm_compressed.wav', sampleRate: 16000 },
  { source: 'crumple.wav', output: 'crumple_compressed.wav', sampleRate: 22050, maxSeconds: 0.8 },
  { source: 'drag.wav', output: 'drag_compressed.wav', sampleRate: 22050 },
  { source: 'drop.wav', output: 'drop_compressed.wav', sampleRate: 22050 },
];

const MP3_TARGETS = [
  { source: 'bgm.wav', output: 'bgm_compressed.mp3', sampleRate: 22050, kbps: 64 },
];

for (const target of AUDIO_TARGETS) {
  const sourcePath = path.join(assetDir, target.source);
  const outputPath = path.join(assetDir, target.output);
  const source = readPcmWav(sourcePath);
  const compressed = compressWav(source, target);
  fs.writeFileSync(outputPath, writePcmWav(compressed.samples, target.sampleRate));

  const sourceSize = fs.statSync(sourcePath).size;
  const outputSize = fs.statSync(outputPath).size;
  console.log(`${target.source} -> ${target.output}: ${formatBytes(sourceSize)} to ${formatBytes(outputSize)}`);
}

for (const target of MP3_TARGETS) {
  const sourcePath = path.join(assetDir, target.source);
  const outputPath = path.join(assetDir, target.output);
  const source = readPcmWav(sourcePath);
  const compressed = compressWav(source, target);
  fs.writeFileSync(outputPath, writeMp3(compressed.samples, target.sampleRate, target.kbps));

  const sourceSize = fs.statSync(sourcePath).size;
  const outputSize = fs.statSync(outputPath).size;
  console.log(`${target.source} -> ${target.output}: ${formatBytes(sourceSize)} to ${formatBytes(outputSize)}`);
}

function readPcmWav(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`${file}: expected RIFF/WAVE input.`);
  }

  let offset = 12;
  let format = null;
  let data = null;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkSize;

    if (chunkId === 'fmt ') {
      format = {
        audioFormat: buffer.readUInt16LE(chunkStart),
        channels: buffer.readUInt16LE(chunkStart + 2),
        sampleRate: buffer.readUInt32LE(chunkStart + 4),
        bitsPerSample: buffer.readUInt16LE(chunkStart + 14),
      };
    } else if (chunkId === 'data') {
      data = buffer.subarray(chunkStart, chunkEnd);
    }

    offset = chunkEnd + (chunkSize % 2);
  }

  if (!format || !data) throw new Error(`${file}: missing fmt or data chunk.`);
  if (format.audioFormat !== 1 || format.bitsPerSample !== 16) {
    throw new Error(`${file}: only 16-bit PCM WAV input is supported.`);
  }

  const frameCount = Math.floor(data.length / (format.channels * 2));
  const samples = new Float32Array(frameCount);
  for (let frame = 0; frame < frameCount; frame++) {
    let total = 0;
    for (let channel = 0; channel < format.channels; channel++) {
      const sampleOffset = (frame * format.channels + channel) * 2;
      total += data.readInt16LE(sampleOffset) / 32768;
    }
    samples[frame] = total / format.channels;
  }

  return {
    sampleRate: format.sampleRate,
    samples,
  };
}

function compressWav(source, target) {
  const sourceMaxSamples = target.maxSeconds
    ? Math.min(source.samples.length, Math.floor(source.sampleRate * target.maxSeconds))
    : source.samples.length;
  const outputLength = Math.max(1, Math.floor(sourceMaxSamples * target.sampleRate / source.sampleRate));
  const output = new Float32Array(outputLength);
  const ratio = source.sampleRate / target.sampleRate;

  for (let index = 0; index < outputLength; index++) {
    const sourcePosition = index * ratio;
    const leftIndex = Math.min(sourceMaxSamples - 1, Math.floor(sourcePosition));
    const rightIndex = Math.min(sourceMaxSamples - 1, leftIndex + 1);
    const t = sourcePosition - leftIndex;
    output[index] = source.samples[leftIndex] * (1 - t) + source.samples[rightIndex] * t;
  }

  return { samples: output };
}

function writePcmWav(samples, sampleRate) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples.length; index++) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }

  return buffer;
}

function writeMp3(samples, sampleRate, kbps) {
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, kbps);
  const blockSize = 1152;
  const chunks = [];

  for (let offset = 0; offset < samples.length; offset += blockSize) {
    const block = floatToInt16(samples.subarray(offset, offset + blockSize));
    const encoded = encoder.encodeBuffer(block);
    if (encoded.length > 0) chunks.push(Buffer.from(encoded));
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) chunks.push(Buffer.from(flushed));
  return Buffer.concat(chunks);
}

function floatToInt16(samples) {
  const output = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index++) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    output[index] = Math.round(sample * 32767);
  }
  return output;
}

function loadLameJs() {
  const bundlePath = path.join(root, 'node_modules', 'lamejs', 'lame.min.js');
  const context = { console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(bundlePath, 'utf8'), context, { filename: bundlePath });
  if (typeof context.lamejs?.Mp3Encoder !== 'function') {
    throw new Error('Failed to load lamejs MP3 encoder.');
  }
  return context.lamejs;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}
