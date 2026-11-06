// One Vite build per variant → per-network HTML (or ZIP) in dist/<variant>/.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { build } from 'vite'

const NAME = {
  lc3: 'ccs',
  creativeType: 'mip',
  vendor: 'grhpl',
  concept: 'unblock',
  subConcept: 'puzzlebox',
  gameplay: 'real',
  ugc: 'nougc',
  seasonal: 'noseason',
  language: 'en',
  size: 'na',
}

const VARIANTS = ['3clk', '10clk', '60sec']

const GOOGLE_EXIT_API = '<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>'
const MRAID = '<script src="mraid.js"></script>'

const NETWORKS = [
  { tag: 'al', network: 'applovin', head: MRAID, included: true },
  { tag: 'gg', network: 'google', head: GOOGLE_EXIT_API, zip: true, included: true },
  { tag: 'is', network: 'ironsource', head: MRAID, included: true },
  { tag: 'mtg', network: 'mintegral', bodyOnload: 'gameReady()', zip: true, included: true },
  { tag: 'fb', network: 'facebook', included: true },
  { tag: 'un', network: 'unity', head: MRAID, noWindowTop: true, included: true },
  { tag: 'vu', network: 'vungle', head: '<script>window.__VUNGLE__=true</script>', zip: true, included: true },
  { tag: 'mo', network: 'moloco', noXhr: true, included: true },
]

const MAX_BYTES = 5 * 1024 * 1024
const PERF = process.env.PERF === '1' // on-screen perf stats build, kept apart from the shippable dist/
const OUT = PERF ? 'dist-perf' : 'dist'
const TMP = '.tmp-build'

const fileName = (variant, tag) =>
  [NAME.lc3, NAME.creativeType, NAME.vendor, NAME.concept, NAME.subConcept, NAME.gameplay, NAME.ugc, NAME.seasonal, NAME.language, variant, NAME.size, tag]
    .join('_')
    .toLowerCase()

const stripModuleAttrs = (html) =>
  html.replace(/<script\b[^>]*>/g, (tag) => tag.replace(/\s+type="module"/, '').replace(/\s+crossorigin(="[^"]*")?/, ''))

function forNetwork(base, n) {
  let html = base.replace('<head>', () => `<head>\n<meta name="network" content="${n.network}">${n.head ? `\n${n.head}` : ''}`)
  if (n.bodyOnload) html = html.replace('<body>', () => `<body onload="${n.bodyOnload}">`)
  if (n.noWindowTop) html = html.replaceAll('window.top', 'window.self')
  // Moloco rejects any XMLHttpRequest. Phaser's loader only reaches it for non-data: URLs; every asset here is inlined.
  if (n.noXhr) html = html.replaceAll('new XMLHttpRequest', '(()=>{throw new Error("XHR disabled")})()')
  if (n.noXhr && html.includes('XMLHttpRequest')) throw new Error(`${n.tag}: XMLHttpRequest still present`)
  return html
}

/** Single-entry ZIP (deflate) with the HTML at root as index.html. */
function zipOne(name, data) {
  const body = zlib.deflateRawSync(data)
  const crc = zlib.crc32(data)
  const n = Buffer.from(name)
  const DOS_DATE = (1 << 5) | 1 // 1980-01-01

  const local = Buffer.alloc(30)
  local.writeUInt32LE(0x04034b50, 0)
  local.writeUInt16LE(20, 4)
  local.writeUInt16LE(8, 8)
  local.writeUInt16LE(DOS_DATE, 12)
  local.writeUInt32LE(crc, 14)
  local.writeUInt32LE(body.length, 18)
  local.writeUInt32LE(data.length, 22)
  local.writeUInt16LE(n.length, 26)

  const central = Buffer.alloc(46)
  central.writeUInt32LE(0x02014b50, 0)
  central.writeUInt16LE(20, 4)
  central.writeUInt16LE(20, 6)
  central.writeUInt16LE(8, 10)
  central.writeUInt16LE(DOS_DATE, 14)
  central.writeUInt32LE(crc, 16)
  central.writeUInt32LE(body.length, 20)
  central.writeUInt32LE(data.length, 24)
  central.writeUInt16LE(n.length, 28)

  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(1, 8)
  end.writeUInt16LE(1, 10)
  end.writeUInt32LE(46 + n.length, 12)
  end.writeUInt32LE(30 + n.length + body.length, 16)

  return Buffer.concat([local, n, body, central, n, end])
}

fs.rmSync(OUT, { recursive: true, force: true })

for (const variant of VARIANTS) {
  const outDir = path.join(TMP, variant)
  // HUD (restart + GOAL board) is in every build.
  await build({ logLevel: 'warn', define: { __VARIANT__: JSON.stringify(variant), __PERF__: JSON.stringify(PERF), __HUD__: 'true' }, build: { outDir, emptyOutDir: true } })
  const base = stripModuleAttrs(fs.readFileSync(path.join(outDir, 'index.html'), 'utf8'))

  const dir = path.join(OUT, variant)
  fs.mkdirSync(dir, { recursive: true })
  for (const n of NETWORKS) {
    if (!n.included) continue
    const html = Buffer.from(forNetwork(base, n))
    if (html.length > MAX_BYTES) console.warn(`⚠ ${variant}/${n.tag}: ${(html.length / 1048576).toFixed(2)} MB > 5 MB`)
    const name = fileName(variant, n.tag)
    const out = path.join(dir, n.zip ? `${name}.zip` : `${name}.html`)
    fs.writeFileSync(out, n.zip ? zipOne('index.html', html) : html)
    console.log(`${out}  ${(html.length / 1024).toFixed(0)} KB`)
  }
}

fs.rmSync(TMP, { recursive: true, force: true })
