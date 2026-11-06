// Encode the imagegen sprites as tightly cropped, production-sized WebP assets.
import fs from 'node:fs'
import assert from 'node:assert/strict'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio'] })
const sprites = { hud: 800, gift: 240, hand: 220, button: 600, logo: 700 }
const manifest = {}
try {
  const page = await browser.newPage()
  for (const [name, width] of Object.entries(sprites)) {
    const source = `data:image/png;base64,${fs.readFileSync(`ref/generated/ui/${name}-source.png`).toString('base64')}`
    const result = await page.evaluate(async ({ source, width }) => {
      const image = new Image()
      image.src = source
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width; canvas.height = image.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(image, 0, 0)
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let left = canvas.width, top = canvas.height, right = 0, bottom = 0
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 64) continue
        left = Math.min(left, x); right = Math.max(right, x)
        top = Math.min(top, y); bottom = Math.max(bottom, y)
      }
      left = Math.max(0, left - 2); top = Math.max(0, top - 2)
      const w = Math.min(image.width - left, right - left + 3)
      const h = Math.min(image.height - top, bottom - top + 3)
      canvas.width = width; canvas.height = Math.round(width * h / w)
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, left, top, w, h, 0, 0, canvas.width, canvas.height)
      return { url: canvas.toDataURL('image/webp', 0.8), width: canvas.width, height: canvas.height, crop: [left, top, w, h] }
    }, { source, width })
    assert(result.width > 0 && result.height > 0 && result.url.startsWith('data:image/webp;'))
    const bytes = Buffer.from(result.url.split(',')[1], 'base64')
    fs.writeFileSync(`Assets/images/ui_${name}.webp`, bytes)
    manifest[name] = { width: result.width, height: result.height, crop: result.crop, bytes: bytes.length }
  }
  fs.writeFileSync('ref/generated/ui/export.json', JSON.stringify(manifest, null, 2) + '\n')
  console.log(manifest)
} finally { await browser.close() }
