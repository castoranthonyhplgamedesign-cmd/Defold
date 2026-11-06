import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('Assets/3D World Assets/Textures');
const spriteSource = resolve('Assets/3D World Assets/Sprite');
const destination = resolve('src/textures');
await mkdir(destination, { recursive: true });

for (const [input, output] of [
  ['red_.png', 'red.webp'],
  ['yellow_.png', 'yellow.webp'],
  ['green_.png', 'green.webp'],
  ['blue_.png', 'blue.webp'],
  ['Tunnel_1_Base_color.png', 'tunnel.webp'],
]) {
  await sharp(resolve(source, input))
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 74, effort: 6 })
    .toFile(resolve(destination, output));
  console.log(output);
}
for (const [input, output] of [
  ['Arrow_.png', 'arrow-marker.webp'],
  ['OutlineSprite_.png', 'head-outline.webp'],
]) {
  await sharp(resolve(spriteSource, input))
    .resize({ width: 256, height: 256, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(resolve(destination, output));
  console.log(output);
}
