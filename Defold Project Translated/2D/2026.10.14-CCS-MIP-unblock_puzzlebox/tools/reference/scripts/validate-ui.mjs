import assert from 'node:assert/strict'
import fs from 'node:fs'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio'] })
const out = 'ref/review/ui'
fs.mkdirSync(out, { recursive: true })
const errors = []
try {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 })
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('http://127.0.0.1:5173')
  await page.waitForTimeout(3500)
  await page.screenshot({ path: `${out}/after-portrait.png` })
  const state = () => page.evaluate(() => {
    const s = window.__game.scene.getScene('Game')
    const counts = [0, 0, 0, 0]
    for (const b of s.board.balls) for (const c of b.rings) counts[c]++
    return { counts, labels: s.hud.labels.map(t => Number(t.text)), drops: s.drops,
      textures: Object.keys(s.textures.list).length, ready: s.deferredReady,
      pointerListeners: s.input.listenerCount('pointerdown') }
  })
  const initial = await state()
  assert.deepEqual(initial.labels, initial.counts)
  await page.mouse.click(260, 110)
  assert.equal((await state()).drops, 0, 'HUD tap must not launch a ball')
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(270, 211)
    await page.mouse.down()
    await page.mouse.move(180, 220, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(150)
    assert.equal((await state()).drops, 1)
    await page.getByRole('button', { name: 'Restart puzzle' }).click()
    await page.waitForTimeout(2500)
    const reset = await state()
    assert.equal(reset.drops, 0)
    assert.equal(reset.ready, true)
    assert.equal(reset.pointerListeners, initial.pointerListeners)
    assert.equal(reset.textures, initial.textures)
    assert.deepEqual(reset.labels, reset.counts)
    assert.equal(await page.getByRole('button', { name: 'Restart puzzle' }).count(), 1)
  }
  await page.setViewportSize({ width: 960, height: 540 })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${out}/after-landscape.png` })
  await page.getByRole('button', { name: 'Restart puzzle' }).click()
  await page.waitForTimeout(2500)
  assert.equal((await state()).drops, 0)
  await page.setViewportSize({ width: 540, height: 960 })
  await page.waitForTimeout(750)
  await page.evaluate(() => { window.__opened = []; window.open = url => { window.__opened.push(url); return null }; window.__game.scene.getScene('Game').triggerWin() })
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `${out}/after-endcard.png` })
  await page.getByRole('button', { name: 'Install Circle Sort' }).click()
  assert.equal(await page.evaluate(() => window.__opened.length), 1)
  assert.deepEqual(errors, [])
  fs.writeFileSync(`${out}/validation.json`, JSON.stringify({ passed: true, initial, checks: ['live counts', 'HUD input isolation', '3 restarts during next-ball transition without texture or listener growth', 'landscape restart', 'endcard CTA'], errors }, null, 2))
  console.log('UI validation passed')
} finally { await browser.close() }
