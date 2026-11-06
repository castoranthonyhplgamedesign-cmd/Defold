import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { launchBrowser, connect, openPage, sleep } from '../../scripts/qa/cdp.mjs';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../..');
const video = 'Assets/Mock_Up/sdp_cantreach_sandshovel_59s_1080x1920.mp4';
const sources = [video, ...fs.readdirSync(path.join(root, 'Assets/Runtime/audio')).filter(n => n.endsWith('.mp3')).map(n => `Assets/Runtime/audio/${n}`)];
const server = http.createServer((req, res) => {
  if (req.url === '/') { res.end('<!doctype html><html><body></body></html>'); return; }
  const index = Number(req.url.slice(1));
  if (!Number.isInteger(index) || index < 0 || index >= sources.length) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', index === 0 ? 'video/mp4' : 'audio/mpeg');
  fs.createReadStream(path.join(root, sources[index])).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser, cdp;
const report = { method: 'Fresh muted Chrome OfflineAudioContext decode to mono 11025 Hz; hashes identify exact inputs. No listening-based claims.', files: [] };
try {
  browser = await launchBrowser(); cdp = await connect(browser.wsUrl);
  const page = await openPage(cdp, { url: `http://127.0.0.1:${server.address().port}/`, width: 400, height: 800, dpr: 1 });
  for (let i = 0; i < 100; i++) { if (await page.evaluate('document.readyState === "complete"')) break; await sleep(25); }
  await page.evaluate(`window.decodeFile=async function(index){const context=new OfflineAudioContext(1,1,11025);const buffer=await context.decodeAudioData(await(await fetch('/'+index)).arrayBuffer());const data=new Float32Array(buffer.length);for(let c=0;c<buffer.numberOfChannels;c++){const channel=buffer.getChannelData(c);for(let i=0;i<data.length;i++)data[i]+=channel[i]/buffer.numberOfChannels;}window.decodedBytes=new Uint8Array(data.buffer);return {sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,duration:buffer.duration,samples:data.length}};window.chunk=function(offset){const bytes=window.decodedBytes.subarray(offset,offset+131072);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary)};`);
  fs.mkdirSync(path.join(out, 'pcm'), { recursive: true });
  for (let i = 0; i < sources.length; i++) {
    const info = await page.evaluate(`window.decodeFile(${i})`);
    const chunks = [];
    for (let offset = 0; offset < info.samples * 4; offset += 131072) chunks.push(Buffer.from(await page.evaluate(`window.chunk(${offset})`), 'base64'));
    const bytes = Buffer.concat(chunks);
    const source = sources[i];
    const pcm = `pcm/${i === 0 ? 'reference' : path.basename(source, '.mp3')}.f32`;
    fs.writeFileSync(path.join(out, pcm), bytes);
    const result = { source, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, source))).digest('hex'), pcm, ...info };
    if (i === 0) {
      const prior = fs.readFileSync(path.join(root, 'output/audio-analysis-2026-10-29/pcm/reference.f32'));
      result.priorDecodedPcmIdentical = bytes.equals(prior);
    }
    report.files.push(result);
    console.log('DECODED', source, info.duration);
  }
} finally {
  fs.writeFileSync(path.join(out, 'decoded-current.json'), JSON.stringify(report, null, 2));
  cdp?.close(); await browser?.close(); await new Promise(resolve => server.close(resolve));
}
