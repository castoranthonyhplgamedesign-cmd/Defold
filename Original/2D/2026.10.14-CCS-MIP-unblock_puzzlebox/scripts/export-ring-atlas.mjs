// Offline asset export. PLAYWRIGHT_MODULE may point to an existing Playwright installation.
import fs from 'node:fs'
import assert from 'node:assert/strict'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const constants = fs.readFileSync('src/constants.ts', 'utf8')
const value = name => Number(constants.match(new RegExp(`${name}:\\s*([\\d.]+)`))?.[1])
const hole = value('RING_HOLE'), pitch = value('RING_PITCH'), count = value('MAX_RINGS')
assert(hole > 0 && pitch > 0 && Number.isInteger(count) && count > 0)
const source = JSON.parse(fs.readFileSync('ref/generated/rings/source.json', 'utf8'))
const dataUrl = `data:image/png;base64,${fs.readFileSync('ref/generated/rings/source.png').toString('base64')}`
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio'] })
try {
  const page = await browser.newPage()
  const result = await page.evaluate(async ({ dataUrl, source, hole, pitch, count }) => {
    const image = new Image()
    image.src = dataUrl
    await image.decode()
    const input = document.createElement('canvas')
    input.width = image.width; input.height = image.height
    const ic = input.getContext('2d', { willReadFrequently: true })
    ic.drawImage(image, 0, 0)
    const pixels = ic.getImageData(0, 0, input.width, input.height).data
    const radius = hole + pitch * count
    const tileSize = Math.ceil(radius) * 2 + 4
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = tileSize * 2
    const ctx = canvas.getContext('2d')
    const output = ctx.createImageData(canvas.width, canvas.height)
    let minSourceAlpha = 255
    for (let color = 0; color < 4; color++) {
      const { cx, cy, innerX, innerY, outerX, outerY } = source.crops[color]
      const ox = (color % 2) * tileSize, oy = Math.floor(color / 2) * tileSize
      for (let y = 0; y < tileSize; y++) for (let x = 0; x < tileSize; x++) {
        const dx = x + 0.5 - tileSize / 2, dy = y + 0.5 - tileSize / 2
        const r = Math.hypot(dx, dy)
        const alpha = Math.max(0, Math.min(1, r - hole + 0.5, radius - r + 0.5))
        if (!alpha) continue
        const band = Math.max(0, Math.min(count - 1, Math.floor((r - hole) / pitch)))
        const t = Math.max(0, Math.min(1, (r - hole - band * pitch) / pitch))
        // Radial remapping changes circumference only; every tube retains its authored thickness.
        const sx = cx + dx / r * (innerX + t * (outerX - innerX))
        const sy = cy + dy / r * (innerY + t * (outerY - innerY))
        const ix = Math.floor(sx), iy = Math.floor(sy), fx = sx - ix, fy = sy - iy
        const target = ((oy + y) * canvas.width + ox + x) * 4
        for (let channel = 0; channel < 4; channel++) {
          const at = (xx, yy) => pixels[(yy * input.width + xx) * 4 + channel]
          const v = (at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx) * (1 - fy)
            + (at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx) * fy
          if (channel === 3) minSourceAlpha = Math.min(minSourceAlpha, v)
          else output.data[target + channel] = v
        }
        output.data[target + 3] = Math.round(alpha * 255)
      }
    }
    if (minSourceAlpha < 240) throw new Error(`Source crop crosses transparent pixels: ${minSourceAlpha}`)
    ctx.putImageData(output, 0, 0)
    return { url: canvas.toDataURL('image/webp', 0.82), tileSize, minSourceAlpha }
  }, { dataUrl, source, hole, pitch, count })
  assert(result.url.startsWith('data:image/webp;base64,'))
  const bytes = Buffer.from(result.url.split(',')[1], 'base64')
  fs.writeFileSync('Assets/images/ring_atlas.webp', bytes)
  fs.writeFileSync('Assets/images/ring_atlas.json', JSON.stringify({ tileSize: result.tileSize, hole, pitch, count }, null, 2) + '\n')
  console.log(`Exported 4 colors × ${count} ring bands: ${bytes.length} bytes; source alpha >= ${result.minSourceAlpha.toFixed(1)}`)
} finally {
  await browser.close()
}
