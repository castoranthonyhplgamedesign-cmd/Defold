import fs from 'node:fs'
import assert from 'node:assert/strict'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio'] })
const output = process.env.OUTPUT_DIR || 'ref/review/rings'
fs.mkdirSync(output, { recursive: true })
try {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.PLAYABLE_URL || 'http://127.0.0.1:5173')
  await page.waitForFunction(() => window.__game?.scene.getScene('Game')?.board?.intro === false)
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${output}/after.png` })
  const results = await page.evaluate(async () => {
    const { drawBall, ballRadius } = await import('/src/game/RingArt.ts')
    const { GAME } = await import('/src/constants.ts')
    const { default: metadata } = await import('/Assets/images/ring_atlas.json?import')
    const check = (condition, message) => { if (!condition) throw new Error(message) }
    check(metadata.hole === GAME.RING_HOLE && metadata.pitch === GAME.RING_PITCH && metadata.count === GAME.MAX_RINGS,
      'Atlas geometry changed: rerun scripts/export-ring-atlas.mjs')
    const scene = window.__game.scene.getScene('Game')
    const Ball = scene.board.balls[0].constructor
    check(scene.textures.exists('ring_atlas'), 'Missing preloaded atlas')
    const atlas = scene.textures.get('ring_atlas').getSourceImage()
    check(atlas.width === metadata.tileSize * 2 && atlas.height === metadata.tileSize * 2, 'Atlas dimensions')
    let maxShadowAlpha = 0
    for (let n = 1; n <= 20; n++) for (let color = 0; color < 4; color++) {
      const radius = ballRadius(n), size = Math.ceil((radius + 10) * 2)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      const rings = Array.from({ length: n }, (_, i) => (color + i) % 4)
      drawBall(ctx, size / 2, size / 2, rings, atlas)
      check(ctx.globalAlpha === 1 && ctx.globalCompositeOperation === 'source-over', 'Context state leaked')
      const data = ctx.getImageData(0, 0, size, size).data
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const distance = Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2)
        const alpha = data[(y * size + x) * 4 + 3]
        if (distance < GAME.RING_HOLE - 1) check(alpha === 0, `Hole contains pixels: ${n}/${color}`)
        if (distance > radius + 1) {
          maxShadowAlpha = Math.max(maxShadowAlpha, alpha)
          check(alpha < 80, `Artwork exceeds physics radius: ${n}/${color}`)
        }
      }
      for (let i = 0; i < n; i++) {
        const x = Math.floor(size / 2 + GAME.RING_HOLE + GAME.RING_PITCH * (i + 0.5))
        const offset = (Math.floor(size / 2) * size + x) * 4
        const [r, g, b, a] = data.slice(offset, offset + 4)
        const id = rings[i]
        check(a > 240, 'Opaque tube missing')
        check(id === 0 ? r > g * 1.5 && r > b * 1.5 : id === 1 ? b > r * 1.5 && b > g
          : id === 2 ? g > r * 1.5 && g > b * 1.5 : r > b * 1.5 && g > b * 1.5,
        `Wrong band/color sampled: ${n}/${color}/${i}`)
      }
      ctx.clearRect(0, 0, size, size)
      drawBall(ctx, size / 2, size / 2, [], atlas)
      check(ctx.getImageData(0, 0, size, size).data.every(v => v === 0), 'Empty ball leaves a shadow')
    }
    const ball = new Ball(scene, [0], -1000, -1000)
    ball.view.setVisible(false)
    ball.addBody()
    try {
      for (const n of [20, 1, 12, 3]) {
        ball.rings = Array.from({ length: n }, (_, i) => i % 4)
        ball.redraw()
        check(Math.abs(ball.body.circleRadius - ballRadius(n)) < 0.001, 'Physics radius changed')
        const image = ball.view.texture.getSourceImage(), ctx = image.getContext('2d')
        check(ctx.getImageData(image.width / 2, image.height / 2, 1, 1).data[3] === 0, 'Stale hole after redraw')
      }
    } finally { ball.destroy() }
    const receiver = new Ball(scene, [0, 1, 2], -1000, -1000)
    const donor = new Ball(scene, [3, 2, 2], -1000, -1000)
    receiver.view.setVisible(false); donor.view.setVisible(false)
    const before = new Set(scene.board.balls)
    let spat = []
    try {
      scene.board.transfer(receiver, donor)
      await new Promise(resolve => setTimeout(resolve, 600))
      // The receiver keeps only the merged run; its inner rings are spat out as a separate ball.
      spat = scene.board.balls.filter(b => !before.has(b))
      check(receiver.rings.join() === '2,2,2' && donor.rings.join() === '3', 'Transfer redraw failed')
      check(spat.length === 1 && spat[0].rings.join() === '0,1', 'Spit-out failed')
      check(!receiver.busy && !donor.busy, 'Transfer stuck busy')
    } finally { receiver.destroy(); donor.destroy(); for (const b of spat) scene.board.remove(b) }
    return { combinations: 80, transparentHoles: true, maxShadowAlpha, resizeAndTransfer: 'passed' }
  })
  await page.setViewportSize({ width: 960, height: 540 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${output}/landscape.png` })
  assert.deepEqual(await page.locator('canvas').first().evaluate(c => [c.width, c.height]), [1920, 1080])
  await page.setViewportSize({ width: 540, height: 960 })
  await page.waitForTimeout(800)
  await page.mouse.move(270, 210)
  await page.mouse.down()
  await page.mouse.move(375, 230, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(2000)
  assert(await page.evaluate(() => window.__game.scene.getScene('Game').drops > 0), 'Pointer drop did not fire')
  assert.deepEqual(errors, [])
  const report = { ...results, viewport: '540x960 DPR 2', landscape: '960x540 DPR 2', pointerDrop: 'passed', pageErrors: errors }
  fs.writeFileSync(`${output}/validation.json`, JSON.stringify(report, null, 2) + '\n')
  console.log(report)
} finally {
  await browser.close()
}
