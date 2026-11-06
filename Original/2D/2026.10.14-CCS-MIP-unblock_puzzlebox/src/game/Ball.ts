import Phaser from 'phaser'
import { DEPTH, GAME } from '../constants'
import { sd, sx, sy } from '../utils/responsive'
import { ballRadius, drawBall } from './RingArt'
import { PERF, perfFrame } from '../utils/perf'

let nextId = 0
/** Balls waiting for a texture render (Ball.flushRedraws). */
const queue: Ball[] = []

/**
 * One ring ball: ring colors (index 0 = innermost), an optional Matter body, and a canvas-texture view.
 * Positions are design px; the view is mapped through sx/sy/sd every sync.
 */
export class Ball {
  readonly id = nextId++
  body: MatterJS.BodyType | null = null
  busy = false
  /** Color of the run being popped (-1 = not clearing); the ball still absorbs that color until the pop finishes. */
  clearColor = -1
  /** Rings in flight toward this ball; they count toward MAX_RINGS before they land. */
  incoming = 0
  overLineSec = 0
  droppedAtMs = -Infinity
  /** Has touched something since spawning (a falling drop crossing the line is not a warning). */
  landed = false
  /** Just dropped and still frictionless; ms it has been slow (see Board.updateLanding). */
  landing = false
  stillMs = 0
  x: number
  y: number
  /** Body position before the latest physics step (render interpolation). */
  prevX = 0
  prevY = 0
  /** Body velocity before the latest physics step (ball-on-ball bounce kick). */
  preVx = 0
  preVy = 0
  /** Pending ball-on-ball rebound (normal + speed), applied at the start of the next physics step. */
  kickNx = 0
  kickNy = 0
  kickV = 0
  viewScale = 1
  private queued = false
  readonly view: Phaser.GameObjects.Image
  private tex: Phaser.Textures.CanvasTexture

  constructor(private scene: Phaser.Scene, public rings: number[], x: number, y: number) {
    this.x = x
    this.y = y
    this.tex = this.makeTexture(this.texSize())
    this.view = scene.add.image(0, 0, this.tex.key).setDepth(DEPTH.BALLS)
    this.render() // first draw is immediate, so a new ball never shows an empty texture
  }

  get color() {
    return this.rings[this.rings.length - 1]
  }

  get radius() {
    return ballRadius(this.rings.length)
  }

  /** Mass ∝ volume (like the 3D game's spheres): big balls anchor the pile, small ones can't shove through. */
  get mass() {
    return GAME.BALL_MASS * (this.radius / ballRadius(GAME.NEW_BALL_RINGS)) ** 3
  }

  /** Count of outermost rings sharing the outer color. */
  get outerRun() {
    let n = 0
    for (let i = this.rings.length - 1; i >= 0 && this.rings[i] === this.color; i--) n++
    return n
  }

  addBody(restitution: number = GAME.PILE_RESTITUTION) {
    this.body = this.scene.matter.add.circle(this.x, this.y, this.radius, {
      label: 'ball',
      restitution,
      friction: GAME.BALL_FRICTION,
      frictionStatic: GAME.BALL_FRICTION_STATIC,
      frictionAir: GAME.BALL_FRICTION_AIR,
    })
    this.scene.matter.body.setMass(this.body, this.mass)
    // Bodies may spin so they roll off each other instead of skating; the view never rotates (rings are
    // concentric and the art's highlight must stay put), so spin is invisible.
    this.prevX = this.x
    this.prevY = this.y
  }

  /** Rings changed: resize the physics circle now, queue the texture render (see flushRedraws). */
  redraw() {
    if (!this.queued) {
      this.queued = true
      queue.push(this)
    }
    if (this.body) {
      const k = this.radius / (this.body.circleRadius ?? this.radius)
      if (k !== 1) {
        this.scene.matter.body.scale(this.body, k, k)
        this.scene.matter.body.setMass(this.body, this.mass) // setMass rescales inertia too
      }
    }
  }

  /**
   * Renders at most `max` queued balls; call once per frame. Chain reactions change many balls every STEP_MS, and
   * several canvas renders + uploads in one frame dropped iPhone to ~15 fps. Queued changes to one ball collapse
   * into a single render; the art trails the rings by a frame or two at most.
   */
  static flushRedraws(max: number) {
    for (let i = 0; i < max && queue.length; i++) {
      const ball = queue.shift()!
      ball.queued = false
      ball.render()
    }
  }

  private render() {
    const size = this.texSize()
    if (size > this.tex.width) {
      const old = this.tex
      this.tex = this.makeTexture(size)
      this.view.setTexture(this.tex.key)
      this.scene.textures.remove(old)
    }
    const t0 = PERF ? performance.now() : 0
    const ctx = this.tex.context
    ctx.clearRect(0, 0, this.tex.width, this.tex.height)
    const t = this.scene.textures
    drawBall(ctx, this.tex.width / 2, this.tex.height / 2, this.rings,
      t.exists('ring_atlas') ? (t.get('ring_atlas').getSourceImage() as HTMLImageElement) : null)
    this.tex.refresh()
    if (PERF) {
      perfFrame.redrawN++
      perfFrame.redraw += performance.now() - t0
    }
  }

  /** `alpha` = fraction of a physics step since the last one; the view is drawn between prev and current. */
  sync(alpha = 1) {
    let rx = this.x
    let ry = this.y
    if (this.body) {
      this.x = this.body.position.x
      this.y = this.body.position.y
      rx = this.prevX + (this.x - this.prevX) * alpha
      ry = this.prevY + (this.y - this.prevY) * alpha
    }
    // Art drawn VIEW_INSET px inside the body: Matter leaves ~2 px of penetration under load, so the art never
    // overlaps. (Padding the body instead made the settled pile drift and self-merge.)
    const d = sd(this.tex.width * this.viewScale * (1 - GAME.VIEW_INSET / this.radius))
    this.view.setPosition(sx(rx), sy(ry)).setDisplaySize(d, d)
  }

  destroy() {
    if (this.queued) queue.splice(queue.indexOf(this), 1)
    if (this.body) this.scene.matter.world.remove(this.body)
    this.body = null
    this.view.destroy()
    this.scene.textures.remove(this.tex)
  }

  private texSize() {
    return Math.ceil(((this.radius + 10) * 2) / 32) * 32
  }

  private makeTexture(size: number) {
    // willReadFrequently keeps the canvas in CPU memory. A GPU-backed canvas (iOS default) needs a GPU→CPU readback
    // before every WebGL upload in refresh(), which stalled frames on iPhone during merges and clears.
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    canvas.getContext('2d', { willReadFrequently: true })
    return this.scene.textures.addCanvas(`ball${this.id}_${size}`, canvas)!
  }
}
