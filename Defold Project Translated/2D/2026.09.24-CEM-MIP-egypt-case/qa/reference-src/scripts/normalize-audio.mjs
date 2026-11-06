import { rename, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const audioDir = path.resolve('Assets/Audio');
const activeFiles = [
  'BGM.mp3',
  'PickDropCharacter.mp3',
  'Correct.mp3',
  'Wrong.mp3',
  'Return.mp3',
  'RedStrike.mp3',
  'EndCard.mp3',
  'AhmoseSFX.mp3',
  'MayaSFX.mp3',
  'MerneptahSFX.mp3',
  'NefertitiSFX.mp3',
];

for (const filename of activeFiles) {
  const source = path.join(audioDir, filename);
  const temporary = path.join(audioDir, `${path.parse(filename).name}.96k.tmp.mp3`);
  const result = spawnSync(ffmpegPath, [
    '-y', '-i', source,
    '-map_metadata', '-1',
    '-codec:a', 'libmp3lame',
    '-b:a', '96k',
    temporary,
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Audio normalization failed: ${filename}`);
  const converted = await stat(temporary);
  if (converted.size <= 0) throw new Error(`Normalized audio is empty: ${filename}`);
  await unlink(source);
  await rename(temporary, source);
  process.stdout.write(`Normalized ${filename} to 96 kbps (${converted.size} bytes)\n`);
}
