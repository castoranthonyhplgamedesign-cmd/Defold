import Phaser from 'phaser'
import { sfx } from '../audio'
import { DEPTH, DIM, GAME } from '../constants'
import { sd } from '../utils/responsive'
import { RING_COLORS } from './RingArt'

const FLY_MS = 500 // box → screen center
const HOLD_MS = 900 // plush pose on show after the open animation, before the endcard
const FADE_MS = 250
const WIN_SIZE = 0.52 // gift width at the center as a share of the screen's short side (≈ 2.5× its board size in portrait)
const BURST = 48
// gift_open_sheet.webp (GIFT_OPEN_SPRITESHEET.md): 12 frames of 512×768 at 24 fps; frame 0 = ui_gift.webp (373 px
// square) drawn 1:1 at (69, 395); the lid pops on frame 4; the last frame is the hold pose.
const GIFT_PX = 373
// poseCy: visual center row of the hold pose (frame 11 teddy + box, rows 347–736); the beat centers that, not the box.
const SHEET = { w: 512, h: 768, giftX: 69, giftY: 395, fps: 24, popFrame: 4, poseCy: 541.5 }

/**
 * Win beat: the gift box flies from the board to the screen center and wiggles, then plays the gift_open sheet
 * (lid pops with a gold + ring-colored burst, a plush teddy jumps out and settles), holds, fades and calls onDone
 * (endcard). No dim: the endcard brings its own. Tap skips straight to onDone. Laid out every frame from the
 * current screen size, so a portrait/landscape switch mid-beat stays centered (the gift is square: width = height).
 */
export function showWin(scene: Phaser.Scene, box: Phaser.GameObjects.Image, onDone: () => void) {
  const x0 = box.x
  const y0 = box.y
  const w0 = box.displayWidth
  // Burst first: it draws behind the gift at the same depth.
  const burst = scene.add
    .particles(0, 0, 'dot', {
      speed: { onEmit: () => sd(Phaser.Math.Between(300, 950)) },
      lifespan: { min: 600, max: 1000 },
      gravityY: sd(GAME.CLEAR_FX_GRAVITY),
      scale: { onEmit: () => sd(Phaser.Math.FloatBetween(1, 2)) },
      alpha: { start: 1, end: 0 },
      tint: [...GAME.MERGE_FX_TINTS, ...GAME.MERGE_FX_TINTS, ...RING_COLORS],
      emitting: false,
    })
    .setDepth(DEPTH.FAIL_UI)
  const gift = scene.add.image(x0, y0, 'gift').setOrigin(box.originX, box.originY).setRotation(box.rotation).setDepth(DEPTH.FAIL_UI)
  // The sheet takes over from the static gift at frame 0 (identical art), anchored on the same gift point.
  const hasSheet = scene.textures.exists('gift_open')
  const sheet = scene.add
    .sprite(0, 0, hasSheet ? 'gift_open' : 'gift', 0)
    .setOrigin((SHEET.giftX + box.originX * GIFT_PX) / SHEET.w, (SHEET.giftY + box.originY * GIFT_PX) / SHEET.h)
    .setDepth(DEPTH.FAIL_UI)
    .setVisible(false)
  if (hasSheet && !scene.anims.exists('gift_open')) {
    scene.anims.create({ key: 'gift_open', frames: scene.anims.generateFrameNumbers('gift_open', {}), frameRate: SHEET.fps })
  }
  box.setVisible(false)

  // Animation state 0..1; layout() turns it into positions and sizes for the current screen.
  const t = { fly: 0, grow: 0 }
  // Fly target = screen center pushed down so the final pose (it rises above the box) is centered (~0.25 × gift width).
  const poseDy = (SHEET.giftY + box.originY * GIFT_PX - SHEET.poseCy) / GIFT_PX
  let done = false
  // finish() can run inside the UPDATE emit (tween onComplete); the emit still calls this once more after destroy.
  const layout = () => {
    if (done) return
    const cx = scene.scale.width / 2
    const big = Math.min(scene.scale.width, scene.scale.height) * WIN_SIZE
    const cy = scene.scale.height / 2 + big * poseDy
    const gw = w0 + (big - w0) * t.grow
    const gx = x0 + (cx - x0) * t.fly
    const gy = y0 + (cy - y0) * t.fly
    gift.setPosition(gx, gy).setDisplaySize(gw, gw)
    sheet.setPosition(gx, gy).setDisplaySize((gw * SHEET.w) / GIFT_PX, (gw * SHEET.h) / GIFT_PX)
  }
  layout()
  scene.events.on(Phaser.Scenes.Events.UPDATE, layout)
  scene.tweens.add({ targets: t, grow: 1, duration: FLY_MS, ease: 'Back.Out' })
  scene.tweens.add({ targets: t, fly: 1, duration: FLY_MS, ease: 'Cubic.Out', onComplete: wiggle })
  scene.tweens.add({ targets: gift, rotation: 0, duration: FLY_MS, ease: 'Cubic.Out' })

  function wiggle() {
    if (done) return
    scene.tweens.add({ targets: gift, angle: { from: -8, to: 8 }, duration: 90, yoyo: true, repeat: 2, ease: 'Sine.InOut', onComplete: open })
  }
  function open() {
    if (done) return
    gift.setAngle(0)
    const pop = () => {
      if (done) return
      sfx('gift')
      burst.explode(BURST, gift.x, gift.y - gift.displayHeight * 0.4)
    }
    // Missing sheet (failed load): pop and hold the closed gift instead of a missing texture.
    if (!hasSheet) {
      pop()
      scene.time.delayedCall(HOLD_MS, fade)
      return
    }
    gift.setVisible(false)
    sheet.setVisible(true).play('gift_open')
    scene.time.delayedCall((SHEET.popFrame * 1000) / SHEET.fps, pop)
    sheet.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => scene.time.delayedCall(HOLD_MS, fade))
  }
  function fade() {
    if (!done) scene.tweens.add({ targets: [gift, sheet, burst], alpha: 0, duration: FADE_MS, onComplete: finish })
  }
  function finish() {
    if (done) return
    done = true
    scene.events.off(Phaser.Scenes.Events.UPDATE, layout)
    scene.input.off(Phaser.Input.Events.POINTER_DOWN, finish)
    scene.tweens.killTweensOf([gift, sheet, burst, t])
    gift.destroy()
    sheet.destroy()
    burst.destroy()
    onDone()
  }
  scene.time.delayedCall(300, () => scene.input.once(Phaser.Input.Events.POINTER_DOWN, finish))
}

// Badge size as a share of the screen's short side, like the endcard logo: rotation keeps the short side, so the
// badge is the same size in portrait and landscape.
const FAIL_SIZE = 0.72 // 15% under the first 0.85

/**
 * Fail beat, same timing as the win: the FAIL badge pops in at the screen center over the endcard's dim, holds, fades,
 * then calls onDone (endcard). Tap skips straight to onDone. Laid out every frame, like showWin.
 */
export function showFail(scene: Phaser.Scene, onDone: () => void) {
  // Same dim as the endcard; it stays up until the endcard's own dim replaces it in the same frame (no flash).
  const dim = scene.add.rectangle(0, 0, 1, 1, DIM.color, DIM.alpha).setOrigin(0).setDepth(DEPTH.DIM).setAlpha(0)
  scene.tweens.add({ targets: dim, alpha: 1, duration: FADE_MS })
  const badge = scene.add.image(0, 0, 'fail_logo').setDepth(DEPTH.FAIL_UI)
  const k = { v: 0 }
  let done = false
  // finish() can run inside the UPDATE emit (tween onComplete); the emit still calls this once more after destroy.
  const layout = () => {
    if (done) return
    const size = Math.min(scene.scale.width, scene.scale.height) * FAIL_SIZE * k.v
    dim.setSize(scene.scale.width, scene.scale.height)
    badge.setPosition(scene.scale.width / 2, scene.scale.height / 2).setDisplaySize(size, size)
  }
  layout()
  scene.events.on(Phaser.Scenes.Events.UPDATE, layout)
  scene.tweens.add({ targets: k, v: 1, duration: FLY_MS, ease: 'Back.Out', onComplete: hold })

  function hold() {
    if (done) return
    scene.time.delayedCall(HOLD_MS, () => !done && scene.tweens.add({ targets: badge, alpha: 0, duration: FADE_MS, onComplete: finish }))
  }
  function finish() {
    if (done) return
    done = true
    scene.events.off(Phaser.Scenes.Events.UPDATE, layout)
    scene.input.off(Phaser.Input.Events.POINTER_DOWN, finish)
    scene.tweens.killTweensOf([badge, dim, k])
    badge.destroy()
    dim.destroy()
    onDone()
  }
  scene.time.delayedCall(300, () => scene.input.once(Phaser.Input.Events.POINTER_DOWN, finish))
}
