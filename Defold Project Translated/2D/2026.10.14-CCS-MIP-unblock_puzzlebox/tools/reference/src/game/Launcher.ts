import Phaser from 'phaser'
import { DEPTH, GAME } from '../constants'
import { hudDy, ux, uy } from '../utils/responsive'
import { Ball } from './Ball'
import type { Board } from './Board'
import { RING_COLORS } from './RingArt'
import type { Rng } from './rng'

/** Player ball at the top + next-ball preview. Press the ball, drag to aim, release to drop. */
export class Launcher {
  enabled = true
  dragging = false
  onGrab: () => void = () => {}
  onDrop: () => void = () => {}

  private current: Ball | null = null
  private next: Ball | null = null
  private ready = false
  /** Smoothed horizontal drag speed (design px/s) and the last pointer sample, for throw momentum. */
  private dragVx = 0
  private lastX = 0
  private lastT = 0

  constructor(private scene: Phaser.Scene, private board: Board, private rng: Rng) {
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.down, this)
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.move, this)
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.up, this)
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.up, this)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.down, this)
      scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.move, this)
      scene.input.off(Phaser.Input.Events.POINTER_UP, this.up, this)
      scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.up, this)
      this.current?.destroy()
      if (this.next !== this.current) this.next?.destroy()
    })
  }

  start() {
    const color = this.pick(-1)
    this.current = this.spawn(color, 540, GAME.SPAWN_Y, false, false) // tutorial ball stays single-color
    this.next = this.spawn(this.pick(color), GAME.NEXT_X, GAME.NEXT_Y, true)
    this.ready = true
  }

  /** Hides the waiting player ball (win beat: it would show through the gaps around the teddy). Sticky: a ball
   * still flying in from NEXT when the win lands is hidden too (applied in update). */
  hideBall() {
    this.ballHidden = true
  }
  private ballHidden = false

  get ballX() {
    return this.ready && this.current ? this.current.x : 540 // a ball flying in from NEXT will land at 540
  }

  update() {
    this.current?.sync()
    if (this.ballHidden) this.current?.view.setVisible(false)
    // NEXT sits in the HUD; balls live in board space, so re-apply the HUD gap (changes on resize).
    if (this.next) this.next.y = GAME.NEXT_Y + hudDy()
    this.next?.sync()
  }

  private down(p: Phaser.Input.Pointer) {
    if (!this.enabled || !this.ready || !this.current) return
    // Only a press on the player ball (plus a finger-sized margin) starts a drag.
    const b = this.current
    if (Math.hypot(ux(p.x) - b.x, uy(p.y) - b.y) > b.radius + GAME.GRAB_PAD) return
    this.dragging = true
    this.current.x = this.clampX(ux(p.x), this.current)
    this.dragVx = 0
    this.lastX = ux(p.x)
    this.lastT = this.scene.time.now
    this.onGrab()
  }

  private move(p: Phaser.Input.Pointer) {
    if (!this.dragging || !this.current) return
    this.current.x = this.clampX(ux(p.x), this.current)
    const now = this.scene.time.now
    const dt = now - this.lastT
    if (dt > 0) {
      // Exponential smoothing so one jittery sample doesn't decide the throw.
      this.dragVx += (((ux(p.x) - this.lastX) / dt) * 1000 - this.dragVx) * 0.5
      this.lastX = ux(p.x)
      this.lastT = now
    }
  }

  private up() {
    if (!this.dragging || !this.current) return
    this.dragging = false
    if (!this.enabled) return
    const ball = this.current
    ball.view.setDepth(DEPTH.BALLS)
    ball.droppedAtMs = this.scene.time.now
    this.board.add(ball, GAME.BALL_RESTITUTION) // bouncy like the actual game; pile balls stay calm
    // Throw: carry the drag's sideways speed into the drop. A pause before release (finger stopped) drops straight.
    const vx = this.scene.time.now - this.lastT > GAME.THROW_IDLE_MS ? 0 : this.dragVx
    const v = Phaser.Math.Clamp((vx / 60) * GAME.THROW_GAIN, -GAME.THROW_MAX, GAME.THROW_MAX) // px/s → Matter px/step
    this.scene.matter.body.setVelocity(ball.body!, { x: v, y: 0 })
    this.board.startLanding(ball)
    this.current = null
    this.ready = false
    this.onDrop()
    this.scene.time.delayedCall(250, () => this.advance())
  }

  private advance() {
    if (!this.next) return
    const ball = this.next
    // Flying ball is the current one from here, so update() stops pinning it to the HUD.
    this.current = ball
    this.next = null
    this.scene.tweens.add({
      targets: ball,
      x: 540,
      y: GAME.SPAWN_Y,
      viewScale: 1,
      duration: 300,
      ease: 'Back.Out',
      onComplete: () => {
        ball.view.setDepth(DEPTH.PLAYER_BALL)
        this.next = this.spawn(this.pick(ball.color), GAME.NEXT_X, GAME.NEXT_Y, true)
        this.ready = true
      },
    })
  }

  /**
   * `color` is the outer color. NEXT_TWO_CHANCE of balls are two-color like the actual game:
   * NEW_BALL_RINGS of a random other color inside, NEW_BALL_RINGS of `color` outside.
   */
  private spawn(color: number, x: number, y: number, next: boolean, allowTwo = true) {
    const rings: number[] = []
    if (allowTwo && this.rng() < GAME.NEXT_TWO_CHANCE) {
      const inner = (color + 1 + Math.floor(this.rng() * (RING_COLORS.length - 1))) % RING_COLORS.length
      for (let i = 0; i < GAME.NEW_BALL_RINGS; i++) rings.push(inner)
    }
    for (let i = 0; i < GAME.NEW_BALL_RINGS; i++) rings.push(color)
    const ball = new Ball(this.scene, rings, x, y)
    ball.view.setDepth(next ? DEPTH.HUD_CONTENT : DEPTH.PLAYER_BALL)
    ball.viewScale = 0
    const scale = next ? GAME.NEXT_D / (2 * ball.radius) : 1
    this.scene.tweens.add({ targets: ball, viewScale: scale, duration: 400, ease: 'Back.Out' })
    return ball
  }

  /** Color from the pile's top colors (or, RANDOM_COLOR_CHANCE of the time, any color), never `exclude`. */
  private pick(exclude: number) {
    const pool = this.rng() < GAME.RANDOM_COLOR_CHANCE ? [] : this.board.topColors().filter((c) => c !== exclude)
    if (pool.length) return pool[Math.floor(this.rng() * pool.length)]
    const skip = exclude >= 0 ? 1 : 0
    const c = Math.floor(this.rng() * (RING_COLORS.length - skip))
    return skip && c >= exclude ? c + 1 : c
  }

  private clampX(x: number, ball: Ball) {
    return Phaser.Math.Clamp(x, GAME.BOARD_LEFT + ball.radius, GAME.BOARD_RIGHT - ball.radius)
  }
}
