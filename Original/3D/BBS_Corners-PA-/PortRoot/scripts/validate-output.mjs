import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(root, 'dist');
const EXPECTED_OUTPUT_COUNT = 48;
const MAX_OUTPUT_BYTES = 5_000_000;
const MRAID_NETWORKS = new Set(['Applovin', 'Ironsource', 'Unity']);
const ZIP_NETWORKS = new Set(['Google', 'Mintegral', 'Vungle']);
const ITERATION_TITLE_BY_DIR = {
  full: 'Full',
  '4clk': '4 Clicks',
  '30sec': '30 Seconds',
};
const VARIANT_TITLE_BY_DIR = {
  v1: 'Variant 1',
  v2: 'Variant 2',
};
const errors = [];
let checkedFiles = 0;

if (!fs.existsSync(distRoot)) {
  console.warn('No dist directory found. Run npm.cmd run build:all first.');
  process.exit(0);
}

for (const file of walk(distRoot)) {
  const rel = path.relative(root, file);
  const normalizedRel = rel.split(path.sep).join('/');
  const fileSize = fs.statSync(file).size;
  if (fileSize > MAX_OUTPUT_BYTES) {
    errors.push(`${rel}: exceeds ${MAX_OUTPUT_BYTES} bytes (${fileSize})`);
  }

  if (file.endsWith('.html')) {
    validateOutputShape(normalizedRel, false);
    validateHtml(fs.readFileSync(file, 'utf8'), rel, normalizedRel);
    checkedFiles += 1;
    continue;
  }

  if (file.endsWith('.zip')) {
    const zip = readSingleFileZip(file);
    validateOutputShape(normalizedRel, true);
    validateHtml(zip.html, `${rel}!/${zip.filename}`, normalizedRel);
    checkedFiles += 1;
  }
}

if (checkedFiles === 0) {
  console.warn('No playable HTML or ZIP outputs found.');
  process.exit(1);
}
if (checkedFiles !== EXPECTED_OUTPUT_COUNT) {
  errors.push(`expected ${EXPECTED_OUTPUT_COUNT} playable outputs, checked ${checkedFiles}`);
}

if (errors.length > 0) {
  for (const error of errors) console.warn(error);
  process.exit(1);
}

console.warn(`Playable output validation passed for ${checkedFiles} files.`);

function validateHtml(html, rel, normalizedRel) {
  const network = getNetworkName(normalizedRel);
  if (!html.startsWith('<!DOCTYPE html>\n')) {
    errors.push(`${rel}: missing line-1 <!DOCTYPE html>`);
  }
  if (!html.startsWith('<!DOCTYPE html>\n<!-- ad-network:')) {
    errors.push(`${rel}: missing line-2 ad-network comment`);
  }
  if (!html.includes('<!-- ad-variant:')) {
    errors.push(`${rel}: missing ad-variant comment`);
  }
  if (html.includes('type="module"')) {
    errors.push(`${rel}: contains type="module"`);
  }
  if (html.includes('import.meta')) {
    errors.push(`${rel}: contains raw import.meta in a classic script build`);
  }
  if (html.includes('crossorigin')) {
    errors.push(`${rel}: contains crossorigin`);
  }
  if (/(?:src|href)=["'](?:src|assets)\//.test(html) || /url\(["']?(?:src|assets)\//.test(html)) {
    errors.push(`${rel}: contains local runtime src path`);
  }
  if (html.includes('console.error')) {
    errors.push(`${rel}: contains console.error`);
  }
  if (!/<meta\s+name="ad\.orientation"\s+content="portrait,landscape"\s*\/?>/.test(html)) {
    errors.push(`${rel}: missing portrait,landscape ad orientation meta`);
  }
  validateDataUris(html, rel);
  validateDocumentTitle(html, rel, normalizedRel, network);
  validateNetworkHtml(html, rel, network);
  validateCtaFallbackMarkers(html, rel, network);
}

function validateDataUris(html, rel) {
  const dataUriPattern = /data:([^"'()\s<>]*)/g;
  for (const match of html.matchAll(dataUriPattern)) {
    const uri = match[0];
    if (!/^data:[^;,]+\/[^;,]+(?:;[^;,=]+=[^;,]+)*;base64,[A-Za-z0-9+/=]+$/.test(uri)) {
      errors.push(`${rel}: contains non-base64 data URI "${uri.slice(0, 80)}"`);
      return;
    }
  }
}

function validateDocumentTitle(html, rel, normalizedRel, network) {
  const parts = normalizedRel.split('/');
  const iterationDir = parts[0] === 'dist' ? parts[1] : parts[0];
  const variantDir = parts[0] === 'dist' ? parts[2] : parts[1];
  const iterationTitle = ITERATION_TITLE_BY_DIR[iterationDir];
  if (!iterationTitle) {
    errors.push(`${rel}: unknown iteration directory ${iterationDir}`);
    return;
  }
  const variantTitle = VARIANT_TITLE_BY_DIR[variantDir];
  if (!variantTitle) {
    errors.push(`${rel}: unknown variant directory ${variantDir}`);
    return;
  }

  const expectedTitle = `BBS Wide U - ${iterationTitle} - ${variantTitle} - ${network}`;
  if (!html.includes(`<title>${expectedTitle}</title>`)) {
    errors.push(`${rel}: expected document title "${expectedTitle}"`);
  }
}

function validateNetworkHtml(html, rel, network) {
  const mraidLoaderCount = countOccurrences(html, 'data-network-loader="mraid"');
  const mraidScriptReferenceCount = countOccurrences(html, 'mraid.js');
  if (MRAID_NETWORKS.has(network) && (mraidLoaderCount !== 1 || mraidScriptReferenceCount !== 1)) {
    errors.push(`${rel}: expected exactly one MRAID loader with one mraid.js reference, got loader=${mraidLoaderCount}, reference=${mraidScriptReferenceCount}`);
  }
  if (!MRAID_NETWORKS.has(network) && (mraidLoaderCount !== 0 || mraidScriptReferenceCount !== 0)) {
    errors.push(`${rel}: unexpected MRAID loader/reference for ${network}`);
  }
  if (MRAID_NETWORKS.has(network)) {
    validateMraidCompliance(html, rel);
  }

  const exitApiCount = countOccurrences(html, 'https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js');
  if (network === 'Google' && exitApiCount !== 1) {
    errors.push(`${rel}: expected exactly one Google ExitAPI script, got ${exitApiCount}`);
  }
  if (network !== 'Google' && exitApiCount !== 0) {
    errors.push(`${rel}: unexpected Google ExitAPI script for ${network}`);
  }

  const hasMintegralHook = /<body[^>]*\sonload="gameReady\(\)"/.test(html);
  if (network === 'Mintegral' && !hasMintegralHook) {
    errors.push(`${rel}: missing Mintegral body onload gameReady hook`);
  }
  if (network !== 'Mintegral' && hasMintegralHook) {
    errors.push(`${rel}: unexpected Mintegral body onload hook for ${network}`);
  }
}

function validateMraidCompliance(html, rel) {
  const markers = [
    ['MRAID typeof guard', ['typeof mraid!=="undefined"', 'typeof mraid !== "undefined"', 'typeof window.mraid!=="undefined"', 'typeof window.mraid !== "undefined"']],
    ['MRAID ready listener', ['mraid.addEventListener("ready"', "mraid.addEventListener('ready'"]],
    ['MRAID ready state', ['mraid.getState']],
    ['MRAID error listener', ['mraid.addEventListener("error"', "mraid.addEventListener('error'"]],
    ['MRAID stateChange listener', ['mraid.addEventListener("stateChange"', "mraid.addEventListener('stateChange'"]],
    ['MRAID exposureChange listener', ['mraid.addEventListener("exposureChange"', "mraid.addEventListener('exposureChange'"]],
    ['MRAID viewableChange listener', ['mraid.addEventListener("viewableChange"', "mraid.addEventListener('viewableChange'"]],
    ['MRAID isViewable fallback', ['mraid.isViewable']],
    ['MRAID audioVolumeChange listener', ['mraid.addEventListener("audioVolumeChange"', "mraid.addEventListener('audioVolumeChange'"]],
    ['MRAID CTA open', ['mraid.open']],
    ['MRAID browser fallback', ['window.open(']],
    ['MRAID close path', ['mraid.close']],
    ['MRAID unload path', ['mraid.unload']],
  ];

  for (const [label, options] of markers) {
    if (!options.some((marker) => html.includes(marker))) {
      errors.push(`${rel}: missing ${label}`);
    }
  }
}

function validateCtaFallbackMarkers(html, rel, network) {
  const commonFallbackMarkers = ['playableSDK', 'openAppStore'];
  const networkMarkers = {
    Google: ['ExitApi'],
    Facebook: ['FbPlayableAd'],
    Moloco: ['FbPlayableAd', 'clickTag'],
    Unity: ['InstallFullGame'],
    Mintegral: ['install'],
    Vungle: ['download'],
    Applovin: ['mraid'],
    Ironsource: ['mraid'],
  };

  for (const marker of [...commonFallbackMarkers, ...(networkMarkers[network] ?? [])]) {
    if (!html.includes(marker)) errors.push(`${rel}: missing CTA fallback marker ${marker}`);
  }
}

function validateOutputShape(normalizedRel, isZip) {
  const network = getNetworkName(normalizedRel);
  if (ZIP_NETWORKS.has(network) && !isZip) {
    errors.push(`${normalizedRel}: ${network} output should be a ZIP`);
  }
  if (!ZIP_NETWORKS.has(network) && isZip) {
    errors.push(`${normalizedRel}: ${network} output should be plain HTML`);
  }
}

function getNetworkName(normalizedRel) {
  const [, , , network = ''] = normalizedRel.split('/');
  return network;
}

function readSingleFileZip(file) {
  const zip = fs.readFileSync(file);
  if (zip.length < 30 || zip.readUInt32LE(0) !== 0x04034b50) {
    throw new Error(`${file}: missing ZIP local file header`);
  }
  const eocdOffset = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocdOffset < 0) {
    throw new Error(`${file}: missing ZIP end of central directory`);
  }
  const entryCount = zip.readUInt16LE(eocdOffset + 10);
  if (entryCount !== 1) {
    errors.push(`${path.relative(root, file)}: expected exactly one ZIP entry, got ${entryCount}`);
  }

  const compressionMethod = zip.readUInt16LE(8);
  if (compressionMethod !== 0) {
    throw new Error(`${file}: expected uncompressed ZIP entry, got method ${compressionMethod}`);
  }

  const compressedSize = zip.readUInt32LE(18);
  const filenameLength = zip.readUInt16LE(26);
  const extraLength = zip.readUInt16LE(28);
  const filenameStart = 30;
  const contentStart = filenameStart + filenameLength + extraLength;
  const contentEnd = contentStart + compressedSize;

  if (contentEnd > zip.length) {
    throw new Error(`${file}: ZIP entry extends beyond file bounds`);
  }

  const filename = zip.subarray(filenameStart, filenameStart + filenameLength).toString('utf8');
  if (filename !== 'index.html') {
    errors.push(`${path.relative(root, file)}: expected ZIP entry index.html, got ${filename}`);
  }

  return {
    filename,
    html: zip.subarray(contentStart, contentEnd).toString('utf8'),
  };
}

function countOccurrences(value, search) {
  let count = 0;
  let offset = 0;
  while (true) {
    const index = value.indexOf(search, offset);
    if (index < 0) return count;
    count++;
    offset = index + search.length;
  }
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else yield fullPath;
  }
}
