import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = parseBuildOptions(process.argv.slice(2));
const distRoot = options.distSubdir ? path.join(root, 'dist', options.distSubdir) : path.join(root, 'dist');
const tmpRoot = path.join(root, '.build-tmp');

const NAME_FIELDS = {
  project3lc: 'bbs',
  creativeType: 'mip',
  vendor: 'grhpl',
  conceptName: 'wideu',
  conceptNumber: '01',
  gameplay: 'real',
  ugc: 'nougc',
  seasonal: 'noseason',
  language: 'en',
  size: 'na',
};

const ITERATIONS = [
  { key: 'full', filename: 'full', displayName: 'Full' },
  { key: '4clicks', filename: '4clk', displayName: '4 Clicks' },
  { key: '30seconds', filename: '30sec', displayName: '30 Seconds' },
];

const VARIANTS = [
  { key: 'v1', filename: 'v1', displayName: 'Variant 1', description: 'header ignores dynamic island safe area' },
  { key: 'v2', filename: 'v2', displayName: 'Variant 2', description: 'header reserves fixed dynamic island space on all portrait devices' },
];

const NETWORKS = [
  { tag: 'al', name: 'Applovin', fullName: 'Applovin', inject: 'mraid', zip: false, included: true },
  { tag: 'gg', name: 'Google', fullName: 'Google', inject: 'exitapi', zip: true, included: true },
  { tag: 'is', name: 'Ironsource', fullName: 'Ironsource', inject: 'mraid', zip: false, included: true },
  { tag: 'mtg', name: 'Mintegral', fullName: 'Mintegral', inject: 'mintegral', zip: true, included: true },
  { tag: 'fb', name: 'Facebook', fullName: 'Facebook', inject: null, zip: false, included: true },
  { tag: 'un', name: 'Unity', fullName: 'Unity', inject: 'mraid', zip: false, included: true },
  { tag: 'vu', name: 'Vungle', fullName: 'Vungle', inject: 'vungle', zip: true, included: true },
  { tag: 'mo', name: 'Moloco', fullName: 'Moloco', inject: null, zip: false, included: true },
  { tag: 'tt', name: 'TikTok', fullName: 'TikTok', inject: 'tiktok', zip: false, included: false },
];

const CRC_TABLE = createCrcTable();
const NON_MODULE_IMPORT_META = '({url:(document.currentScript&&document.currentScript.src)||location.href})';
const MRAID_LOADER_SNIPPET = `<script data-network-loader="mraid">(function(){
function fallbackBrowserOpen(url){if(typeof window.open==="function")window.open(url,"_blank")}
function getMraid(){if(typeof mraid!=="undefined"&&mraid)return mraid;if(typeof window.mraid!=="undefined"&&window.mraid)return window.mraid;return null}
function bindMraidEvents(){
if(typeof mraid!=="undefined"&&mraid){
if(typeof mraid.isViewable==="function")mraid.isViewable();
if(typeof mraid.addEventListener==="function"){
mraid.addEventListener("error",function(message,action){console.warn("[MRAID error]",{message:message,action:action})});
mraid.addEventListener("stateChange",function(state){});
mraid.addEventListener("exposureChange",function(exposedPercentage){});
mraid.addEventListener("viewableChange",function(viewable){});
mraid.addEventListener("audioVolumeChange",function(volume){if(volume===null||typeof volume!=="number")return});
}
return;
}
var api=getMraid();if(!api||typeof api.addEventListener!=="function")return;
if(typeof api.isViewable==="function")api.isViewable();
api.addEventListener("error",function(message,action){console.warn("[MRAID error]",{message:message,action:action})});
api.addEventListener("stateChange",function(state){});
api.addEventListener("exposureChange",function(exposedPercentage){});
api.addEventListener("viewableChange",function(viewable){});
api.addEventListener("audioVolumeChange",function(volume){if(volume===null||typeof volume!=="number")return});
}
function guardedMraidOpen(url){
if(typeof mraid!=="undefined"&&mraid&&typeof mraid.open==="function"){
var state=typeof mraid.getState==="function"?mraid.getState():"default";
if(state!=="loading"){mraid.open(url);return true}
}
var api=getMraid();
if(api&&typeof api.open==="function"){
var apiState=typeof api.getState==="function"?api.getState():"default";
if(apiState!=="loading"){api.open(url);return true}
}
fallbackBrowserOpen(url);return false
}
function closeAd(){
if(typeof mraid!=="undefined"&&mraid&&typeof mraid.close==="function"){mraid.close();return}
var api=getMraid();if(api&&typeof api.close==="function")api.close()
}
function unloadAd(reason){
console.warn("[MRAID unload]",reason||"creative unavailable");
if(typeof mraid!=="undefined"&&mraid&&typeof mraid.unload==="function"){mraid.unload();return}
var api=getMraid();if(api&&typeof api.unload==="function")api.unload()
}
function whenReady(callback){
var api=getMraid();if(!api){callback();return false}
bindMraidEvents();
if(typeof mraid!=="undefined"&&mraid){
if(typeof mraid.addEventListener==="function")mraid.addEventListener("ready",callback);
if(typeof mraid.getState==="function"&&mraid.getState()==="loading")return true;
callback();return true
}
if(typeof api.addEventListener==="function")api.addEventListener("ready",callback);
if(typeof api.getState==="function"&&api.getState()==="loading")return true;
callback();return true
}
window.__mraidOpen=guardedMraidOpen;
window.__mraidCloseAd=closeAd;
window.__mraidStartWhenReady=whenReady;
if(location.protocol==="file:"){
if(!window.mraid){var listeners={};window.mraid={getState:function(){return"default"},isViewable:function(){return true},addEventListener:function(event,callback){(listeners[event]||(listeners[event]=[])).push(callback);if(event==="ready")setTimeout(callback,0)},removeEventListener:function(event,callback){var list=listeners[event];if(!list)return;var index=list.indexOf(callback);if(index>=0)list.splice(index,1)},open:function(url){window.__mraidLastOpenUrl=url;fallbackBrowserOpen(url)},close:function(){},unload:function(){}}}
whenReady(function(){});return
}
var script=document.createElement("script");script.src="mraid.js";script.async=false;script.onload=function(){whenReady(function(){})};script.onerror=function(){unloadAd("MRAID SDK failed to load")};document.head.appendChild(script)
})();</script>`;

cleanDir(distRoot);
cleanDir(tmpRoot);

for (const iteration of ITERATIONS) {
  for (const variant of VARIANTS) {
    for (const network of NETWORKS.filter((candidate) => candidate.included && isSelectedNetwork(candidate))) {
      const outDir = path.join(tmpRoot, iteration.key, variant.key, network.tag);
      const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

      if (!fs.existsSync(viteBin)) {
        throw new Error(`Missing Vite entry at ${viteBin}. Run npm.cmd install inside PortRoot first.`);
      }

      const build = spawnSync(process.execPath, [viteBin, 'build', '--outDir', outDir, '--emptyOutDir'], {
        cwd: root,
        env: {
          ...process.env,
          AD_NETWORK: network.tag,
          AD_ITERATION: iteration.key,
          AD_VARIANT: variant.key,
        },
        stdio: 'inherit',
      });

      if (build.status !== 0) {
        throw new Error(`Vite build failed for ${iteration.key}/${variant.key}/${network.tag}`);
      }

      const inputPath = path.join(outDir, 'index.html');
      let html = fs.readFileSync(inputPath, 'utf8');
      html = finalizeHtml(html, iteration, variant, network);

      const filenameBase = makeFilename(iteration, variant, network);
      const networkDir = path.join(distRoot, iteration.filename, variant.filename, network.name);
      fs.mkdirSync(networkDir, { recursive: true });

      if (network.zip) {
        const zipPath = path.join(networkDir, `${filenameBase}.zip`);
        fs.writeFileSync(zipPath, createSingleFileZip('index.html', html));
      } else {
        fs.writeFileSync(path.join(networkDir, `${filenameBase}.html`), html);
      }
    }
  }
}

cleanDir(tmpRoot);

function parseBuildOptions(args) {
  const parsed = {
    distSubdir: '',
    networks: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const [name, inlineValue] = arg.split('=');
    const nextValue = inlineValue ?? args[index + 1];

    if (name === '--dist-subdir') {
      parsed.distSubdir = sanitizeDistSubdir(nextValue);
      if (inlineValue === undefined) index += 1;
      continue;
    }

    if (name === '--networks') {
      parsed.networks = new Set(nextValue.split(',').map((value) => value.trim()).filter(Boolean));
      if (inlineValue === undefined) index += 1;
    }
  }

  return parsed;
}

function sanitizeDistSubdir(value) {
  if (!value || value.includes('/') || value.includes('\\') || value.includes('..')) {
    throw new Error(`Invalid dist subdirectory "${value ?? ''}"`);
  }

  return value;
}

function isSelectedNetwork(network) {
  if (!options.networks) return true;
  return options.networks.has(network.tag) || options.networks.has(network.name) || options.networks.has(network.fullName);
}

function finalizeHtml(html, iteration, variant, network) {
  let result = html
    .replace(/\s+type="module"/g, '')
    .replace(/\s+crossorigin(?:="[^"]*")?/g, '');

  result = ensureDoctype(result);
  result = setDocumentTitle(result, makeDocumentTitle(iteration, variant, network));
  result = rewriteImportMetaForClassicScript(result);
  result = injectNetworkScript(result, network);
  result = sanitizeNonBase64DataTokens(result);
  result = injectAfterDoctype(result, `<!-- ad-variant: ${variant.displayName} | ${variant.key} | ${variant.description} -->`);
  result = injectAfterDoctype(result, `<!-- ad-network: ${network.fullName} | ${network.tag} -->`);
  return result;
}

function makeDocumentTitle(iteration, variant, network) {
  return `BBS Wide U - ${iteration.displayName} - ${variant.displayName} - ${network.name}`;
}

function setDocumentTitle(html, title) {
  const safeTitle = escapeHtml(title);
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  }

  return injectAfterHeadOpen(html, `<title>${safeTitle}</title>`);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rewriteImportMetaForClassicScript(html) {
  return html.replace(/\bimport\.meta\b/g, NON_MODULE_IMPORT_META);
}

function ensureDoctype(html) {
  const trimmed = html.trimStart();
  const withoutDoctype = trimmed.replace(/^<!doctype\s+html>\s*/i, '');
  return `<!DOCTYPE html>\n${withoutDoctype}`;
}

function injectAfterDoctype(html, snippet) {
  return html.replace(/^<!DOCTYPE html>\s*/i, `<!DOCTYPE html>\n${snippet}\n`);
}

function sanitizeNonBase64DataTokens(html) {
  const normalized = html
    .replace(/"data:"/g, '"data"+":"')
    .replace(/'data:'/g, "'data'+':'")
    .replace(/\^data:/g, '^dat\\x61:')
    .replace(/data:\$\{/g, '${"data"}:${')
    .replace(/\.data:/g, '.data :')
    .replace(/([,{])data:/g, '$1"data":');

  return escapeNonBase64DataPrefixes(normalized);
}

function escapeNonBase64DataPrefixes(html) {
  let result = '';
  let offset = 0;

  while (true) {
    const index = html.indexOf('data:', offset);
    if (index < 0) {
      result += html.slice(offset);
      return result;
    }

    result += html.slice(offset, index);
    const remaining = html.slice(index);
    if (/^data:[^;,]+\/[^;,]+(?:;[^;,=]+=[^;,]+)*;base64,/.test(remaining)) {
      result += 'data:';
    } else {
      result += 'd\\u0061ta:';
    }
    offset = index + 'data:'.length;
  }
}

function injectNetworkScript(html, network) {
  switch (network.inject) {
    case 'mraid':
      return injectAfterHeadOpen(html, MRAID_LOADER_SNIPPET);
    case 'exitapi':
      return injectAfterHeadOpen(html, '<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>');
    case 'mintegral':
      return html.replace('<body', '<body onload="gameReady()"');
    case 'vungle':
      return injectAfterHeadOpen(html, '<script>window.__VUNGLE__=true;</script>');
    case 'tiktok':
      return injectAfterHeadOpen(html, '<script>window.__TIKTOK__=true;</script>');
    default:
      return html;
  }
}

function injectAfterHeadOpen(html, snippet) {
  return html.replace(/<head([^>]*)>/i, `<head$1>\n    ${snippet}`);
}

function makeFilename(iteration, variant, network) {
  const f = NAME_FIELDS;
  return [
    f.project3lc,
    f.creativeType,
    f.vendor,
    f.conceptName,
    f.conceptNumber,
    f.gameplay,
    f.ugc,
    f.seasonal,
    f.language,
    iteration.filename,
    variant.filename,
    f.size,
    network.tag,
  ].join('_');
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function createSingleFileZip(filename, content) {
  const nameBuffer = Buffer.from(filename);
  const contentBuffer = Buffer.from(content);
  const crc = crc32(contentBuffer);
  const modTime = dosTime(new Date());
  const modDate = dosDate(new Date());

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8);
  localHeader.writeUInt16LE(modTime, 10);
  localHeader.writeUInt16LE(modDate, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(contentBuffer.length, 18);
  localHeader.writeUInt32LE(contentBuffer.length, 22);
  localHeader.writeUInt16LE(nameBuffer.length, 26);
  localHeader.writeUInt16LE(0, 28);

  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0, 8);
  centralHeader.writeUInt16LE(0, 10);
  centralHeader.writeUInt16LE(modTime, 12);
  centralHeader.writeUInt16LE(modDate, 14);
  centralHeader.writeUInt32LE(crc, 16);
  centralHeader.writeUInt32LE(contentBuffer.length, 20);
  centralHeader.writeUInt32LE(contentBuffer.length, 24);
  centralHeader.writeUInt16LE(nameBuffer.length, 28);
  centralHeader.writeUInt16LE(0, 30);
  centralHeader.writeUInt16LE(0, 32);
  centralHeader.writeUInt16LE(0, 34);
  centralHeader.writeUInt16LE(0, 36);
  centralHeader.writeUInt32LE(0, 38);
  centralHeader.writeUInt32LE(0, 42);

  const localFile = Buffer.concat([localHeader, nameBuffer, contentBuffer]);
  const centralDirectory = Buffer.concat([centralHeader, nameBuffer]);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localFile.length, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([localFile, centralDirectory, end]);
}

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return ~crc >>> 0;
}

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

function dosTime(date) {
  return (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
}

function dosDate(date) {
  return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
}
