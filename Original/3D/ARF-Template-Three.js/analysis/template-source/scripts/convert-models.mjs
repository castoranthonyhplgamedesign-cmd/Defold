import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { optimizeGlb } from './optimize-glb.mjs';

const require = createRequire(import.meta.url);
const convert = require('fbx2gltf');
const source = resolve('Assets/3D World Assets/Mesh');
const destination = resolve('src/models');
await mkdir(destination, { recursive: true });

async function removeAnimations(path) {
  const glb = await readFile(path);
  if (glb.toString('ascii', 0, 4) !== 'glTF' || glb.readUInt32LE(4) !== 2) {
    throw new Error(`Invalid GLB: ${path}`);
  }
  const jsonLength = glb.readUInt32LE(12);
  const jsonStart = 20;
  const document = JSON.parse(glb.toString('utf8', jsonStart, jsonStart + jsonLength));
  if (!document.animations?.length) return;
  const animationCount = document.animations.length;
  delete document.animations;
  const json = Buffer.from(JSON.stringify(document));
  const paddedJson = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
  json.copy(paddedJson);
  const remainingChunks = glb.subarray(jsonStart + jsonLength);
  const output = Buffer.alloc(20 + paddedJson.length + remainingChunks.length);
  glb.copy(output, 0, 0, 12);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(paddedJson.length, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  paddedJson.copy(output, 20);
  remainingChunks.copy(output, 20 + paddedJson.length);
  await writeFile(path, output);
  console.log(`Removed ${animationCount} animation tracks from ${path}`);
}

for (const name of ['AnimatedBlocks_', 'Shooter_v3_', 'Tunnel_v3_', 'Bullet_']) {
  const path = resolve(destination, `${name}.glb`);
  const output = await convert(resolve(source, `${name}.fbx`), path, ['--binary']);
  await removeAnimations(path);
  await optimizeGlb(path);
  console.log(output);
}
