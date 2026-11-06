import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import yazl from 'yazl';

const NAMING = {
  projectCode: 'cs',
  creativeType: 'mip',
  vendor: 'grhpl',
  conceptName: 'horizontalroll',
  conceptNumber: '01',
  gameplay: 'real',
  ugc: 'na',
  seasonal: 'noseason',
  language: 'en',
  size: 'na',
};

const ITERATIONS = [{ length: 'full' }];

const NETWORKS = [
  { name: 'Applovin', tag: 'al', included: true, zip: false, inject: 'mraid' },
  { name: 'Google', tag: 'gg', included: true, zip: true, inject: 'exitapi' },
  { name: 'Ironsource', tag: 'is', included: true, zip: false, inject: 'mraid' },
  { name: 'Mintegral', tag: 'mtg', included: true, zip: true, inject: 'mintegral' },
  { name: 'Facebook', tag: 'fb', included: true, zip: false, inject: null },
  { name: 'Unity', tag: 'un', included: true, zip: false, inject: 'mraid' },
  { name: 'Vungle', tag: 'vu', included: true, zip: true, inject: 'vungle' },
  { name: 'Moloco', tag: 'mo', included: true, zip: false, inject: null },
  { name: 'TikTok', tag: 'tt', included: false, zip: false, inject: 'tiktok' },
];

const distDir = path.resolve('dist');
const baseHtmlPath = path.join(distDir, 'index.html');

function outputBaseName(iteration, network) {
  return [
    NAMING.projectCode,
    NAMING.creativeType,
    NAMING.vendor,
    NAMING.conceptName,
    NAMING.conceptNumber,
    NAMING.gameplay,
    NAMING.ugc,
    NAMING.seasonal,
    NAMING.language,
    iteration.length,
    NAMING.size,
    network.tag,
  ].join('_');
}

function stripRejectedAttrs(html) {
  return html.replace(/\s+type="module"/g, '').replace(/\s+crossorigin(?:="[^"]*")?/g, '');
}

function injectNetwork(html, network) {
  let next = html;

  if (network.inject === 'mraid' && !next.includes('src="mraid.js"')) {
    next = next.replace('<head>', '<head>\n    <script src="mraid.js"></script>');
  }

  if (network.inject === 'exitapi' && !next.includes('exitapi.js')) {
    next = next.replace('<head>', '<head>\n    <script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>');
  }

  if (network.inject === 'mintegral') {
    next = next.replace('<body>', '<body onload="gameReady()">');
  }

  if (network.inject === 'vungle') {
    next = next.replace('<head>', '<head>\n    <script>window.__VUNGLE__=true;</script>');
  }

  if (network.inject === 'tiktok') {
    next = next.replace('<head>', '<head>\n    <script>window.__TIKTOK__=true;</script>');
  }

  if (network.tag === 'un') {
    next = next.replace(/\bwindow\.top\b/g, 'window.self');
  }

  return next;
}

function withNetworkComment(html, network) {
  return `<!-- ad-network: ${network.name} | ${network.tag} -->\n${html}`;
}

function writeZip(zipPath, htmlContent) {
  const zipfile = new yazl.ZipFile();
  zipfile.addBuffer(Buffer.from(htmlContent, 'utf8'), 'index.html');
  zipfile.end();

  return new Promise((resolve, reject) => {
    zipfile.outputStream
      .pipe(fs.createWriteStream(zipPath))
      .on('close', resolve)
      .on('error', reject);
  });
}

if (process.platform === 'win32') {
  execFileSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], { stdio: 'inherit' });
} else {
  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
}

const baseHtml = stripRejectedAttrs(fs.readFileSync(baseHtmlPath, 'utf8'));
const writeJobs = [];

for (const iteration of ITERATIONS) {
  for (const network of NETWORKS) {
    if (!network.included) {
      continue;
    }

    const networkDir = path.join(distDir, iteration.length, network.name);
    fs.mkdirSync(networkDir, { recursive: true });

    const html = withNetworkComment(injectNetwork(baseHtml, network), network);
    const baseName = outputBaseName(iteration, network);

    if (network.zip) {
      writeJobs.push(writeZip(path.join(networkDir, `${baseName}.zip`), html));
    } else {
      fs.writeFileSync(path.join(networkDir, `${baseName}.html`), html);
    }
  }
}

await Promise.all(writeJobs);
