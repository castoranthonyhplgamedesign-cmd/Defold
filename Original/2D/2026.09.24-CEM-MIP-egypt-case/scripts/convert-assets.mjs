import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('Assets');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(source);
      continue;
    }
    if (path.extname(entry.name).toLowerCase() !== '.png') continue;
    const output = source.slice(0, -4) + '.webp';
    await sharp(source).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(output);
    await unlink(source);
    process.stdout.write(`Converted ${path.relative(root, source)}\n`);
  }
}

await walk(root);
