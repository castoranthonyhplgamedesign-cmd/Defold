import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetDir = path.join(root, 'src', 'assets');
const outputDir = path.join(assetDir, 'optimized');

const IMAGE_TARGETS = [
  { source: path.join(assetDir, 'new', 'logo.png'), output: 'logo_420.webp', width: 420, quality: 84 },
  { source: path.join(assetDir, 'new', 'playnowbutton.png'), output: 'playnowbutton_604.webp', width: 604, quality: 84 },
  { source: path.join(assetDir, 'hand_pointer.png'), output: 'hand_pointer_152.webp', width: 152, quality: 86 },
];

fs.mkdirSync(outputDir, { recursive: true });

for (const target of IMAGE_TARGETS) {
  const outputPath = path.join(outputDir, target.output);
  await sharp(target.source)
    .resize({ width: target.width, withoutEnlargement: true })
    .webp({ quality: target.quality, effort: 6 })
    .toFile(outputPath);

  const sourceSize = fs.statSync(target.source).size;
  const outputSize = fs.statSync(outputPath).size;
  console.log(`${path.relative(assetDir, target.source)} -> optimized/${target.output}: ${formatBytes(sourceSize)} to ${formatBytes(outputSize)}`);
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}
