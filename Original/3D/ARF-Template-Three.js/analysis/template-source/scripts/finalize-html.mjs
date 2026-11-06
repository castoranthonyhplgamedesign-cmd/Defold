import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Script } from 'node:vm';

const path = resolve('dist/index.html');
const html = await readFile(path, 'utf8');
if (!html.includes('<script type="module" crossorigin>')) {
  throw new Error('Expected the single-file Vite script in dist/index.html');
}
let finalized = html
  .replace('<script type="module" crossorigin>', '<script>')
  .replace('<style rel="stylesheet" crossorigin>', '<style>')
  .replaceAll('console.error', 'console.warn');
const bundledScript = finalized.match(/<script>([\s\S]*?)<\/script>/);
if (!bundledScript) throw new Error('Bundled script not found');
finalized = finalized.replace(bundledScript[0], '').replace('</body>', () => `${bundledScript[0]}</body>`);
new Script(bundledScript[1]);
if (finalized.includes('import.meta')) {
  throw new Error('Classic output still contains import.meta');
}
await writeFile(path, finalized);
console.log(`Finalized classic single-file HTML (${Buffer.byteLength(finalized)} bytes)`);
