import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const audioDir = path.resolve('Assets/Audio');
const files = await readdir(audioDir);

for (const filename of files) {
  if (path.extname(filename).toLowerCase() !== '.wav') continue;
  const source = path.join(audioDir, filename);
  const output = source.slice(0, -4) + '.mp3';
  const result = spawnSync(ffmpegPath, [
    '-y', '-i', source,
    '-map_metadata', '-1',
    '-codec:a', 'libmp3lame',
    '-b:a', '96k',
    output,
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Audio conversion failed: ${filename}`);
  const converted = await stat(output);
  if (converted.size <= 0) throw new Error(`Converted audio is empty: ${path.basename(output)}`);
  await unlink(source);
  process.stdout.write(`Converted ${filename} -> ${path.basename(output)} (${converted.size} bytes)\n`);
}
