import Phaser from 'phaser'
import { DEPTH, GAME } from '../constants'
import { sd, sx, sy } from '../utils/responsive'

const APPROACH = 0.5 // point glides onto the ball while fading in
const HOLD = 0.1 // rests on the ball before pressing
const PRESS = 0.18 // squash + tilt (pointerdown)
const GO = 0.6 // center → side, and side → center at the end
const CROSS = 1 // side → other side
const PAUSE = 0.2 // rest at each end of the drag
const RELEASE = 0.18 // un-squash + untilt (pointerup)
const LIFT = 0.45 // point glides off while fading out
const HIDDEN = 3 // GDD: disappear, reappear every 3 s
const DRAG = GO + PAUSE + CROSS + PAUSE + GO
const PERIOD = APPROACH + HOLD + PRESS + DRAG + RELEASE + LIFT + HIDDEN
const AMP = 240 // design px
const OFFSET = 45 // design px: approach starts and lift ends this far down-right of the ball, toward the wrist
const HOVER = 1.08 // scale while off the screen (approach start / lift end)
const SQUASH = 0.9 // pressed scale
const TILT = -0.14 // rad (~8° CCW around the fingertip) while pressed: leans the finger into the screen
const RING = 0.3 // tap ring grow + fade, starts with PRESS
const RING_R = 70 // design px final ring radius
const SIZE = 265 // design px; art is a 1254 square with the hand in ~800 px of it (mockup: hand ≈ 1.7× ball)
// Fingertip pad (measured from the art): origin, so squash and tilt pivot on the ball.
const TIP = [0.3, 0.097] as const
const ease = Phaser.Math.Easing.Sine.InOut
const easeOut = Phaser.Math.Easing.Cubic.Out
const easeIn = Phaser.Math.Easing.Cubic.In

/**
 * GDD scan screen: hand taps the ball, drags it right and left, releases and lifts off, then hides for 3 s, repeat.
 * Ball itself stays put. Arrows brighten on the side the hand is dragging toward.
 * One pose only: press is faked with squash + tilt + a tap ring (swapping to a pressed pose jumped the hand body).
 */
export class Hand {
  visible = false
  private t = 0
  private cx = 540
  private img: Phaser.GameObjects.Image
  private ring: Phaser.GameObjects.Graphics
  private arrows: Phaser.GameObjects.Graphics[] // [left, right]
  private arrowAlpha = [0.6, 0.6]
  private dragDir = 0 // -1 left, 1 right, 0 paused / not dragging

  constructor(scene: Phaser.Scene) {
    this.arrows = [
      scene.add.graphics().setDepth(DEPTH.HAND).setVisible(false),
      scene.add.graphics().setDepth(DEPTH.HAND).setVisible(false),
    ]
    this.ring = scene.add.graphics().setDepth(DEPTH.HAND).setVisible(false)
    this.img = scene.add.image(0, 0, 'hand_point').setOrigin(...TIP).setDepth(DEPTH.HAND).setVisible(false)
  }

  /** Start the loop centered on the ball's x. */
  show(ballX: number) {
    if (this.visible) return
    this.visible = true
    this.t = 0
    this.cx = Phaser.Math.Clamp(ballX, GAME.BOARD_LEFT + AMP, GAME.BOARD_RIGHT - AMP)
    this.arrowAlpha[0] = this.arrowAlpha[1] = 0.6
    this.setVisible(true)
    this.relayout()
  }

  hide() {
    this.visible = false
    this.setVisible(false)
  }

  private setVisible(on: boolean) {
    this.img.setVisible(on)
    this.ring.setVisible(on)
    this.arrows[0].setVisible(on)
    this.arrows[1].setVisible(on)
  }

  update(dt: number) {
    if (!this.visible) return
    this.t = (this.t + dt) % PERIOD
    let t = this.t
    let off = 0 // 0 on the ball, 1 fully lifted (OFFSET away, HOVER scale)
    let x = 0 // drag offset from cx
    let alpha = 1
    let p = 0 // press amount: 0 up, 1 pressed
    this.dragDir = 0
    if (t < APPROACH) {
      const k = t / APPROACH
      off = 1 - easeOut(k)
      alpha = easeOut(k)
    } else if ((t -= APPROACH) < HOLD) {
      // resting on the ball
    } else if ((t -= HOLD) < PRESS) {
      p = ease(t / PRESS)
    } else if ((t -= PRESS) < DRAG) {
      p = 1
      x = this.dragX(t)
    } else if ((t -= DRAG) < RELEASE) {
      p = 1 - ease(t / RELEASE)
    } else if ((t -= RELEASE) < LIFT) {
      const k = t / LIFT
      off = easeIn(k)
      alpha = 1 - easeIn(k)
    } else {
      alpha = 0
    }
    const scale = (1 - (1 - SQUASH) * p) * (1 + (HOVER - 1) * off)
    const px = sx(this.cx + x + OFFSET * off)
    const py = sy(GAME.SPAWN_Y + 20 + OFFSET * off)
    const size = sd(SIZE * scale)
    this.img.setAlpha(alpha).setPosition(px, py).setDisplaySize(size, size).setRotation(TILT * p)
    this.drawRing(this.t - APPROACH - HOLD, px, py)
    // Side being dragged toward glows, the other dims; both settle to 0.6 when not moving.
    const blend = Math.min(1, dt * 10)
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1
      const target = this.dragDir === 0 ? 0.6 : this.dragDir === side ? 1 : 0.3
      this.arrowAlpha[i] += (target - this.arrowAlpha[i]) * blend
      this.arrows[i].setAlpha(alpha * this.arrowAlpha[i])
    }
  }

  /** Tap ring at the fingertip, t seconds after the press starts. */
  private drawRing(t: number, px: number, py: number) {
    this.ring.clear()
    if (t < 0 || t >= RING) return
    const k = easeOut(t / RING)
    this.ring.lineStyle(sd(8 * (1 - k) + 2), 0xffffff, 1 - k).strokeCircle(px, py, sd(RING_R * k))
  }

  /** Drag offset at time t into the drag: center → right, pause, → left, pause, → center. Sets dragDir. */
  private dragX(t: number) {
    if (t < GO) {
      this.dragDir = 1
      return AMP * ease(t / GO)
    }
    if ((t -= GO) < PAUSE) return AMP
    if ((t -= PAUSE) < CROSS) {
      this.dragDir = -1
      return AMP * (1 - 2 * ease(t / CROSS))
    }
    if ((t -= CROSS) < PAUSE) return -AMP
    this.dragDir = 1
    return -AMP * (1 - ease((t - PAUSE) / GO))
  }

  relayout() {
    for (let direction = -1; direction <= 1; direction += 2) {
      const g = this.arrows[direction < 0 ? 0 : 1].clear()
      for (let i = 0; i < 2; i++) {
        const tip = this.cx + direction * (190 + i * 100)
        const back = tip - direction * 52
        const y = GAME.SPAWN_Y
        g.fillStyle(0xffffff, i === 0 ? 1 : 0.45)
        g.fillTriangle(sx(tip), sy(y), sx(back), sy(y - 32), sx(back), sy(y + 32))
        g.fillRect(sx(Math.min(back, back - direction * 46)), sy(y - 8), sd(46), sd(16))
      }
    }
  }
}
