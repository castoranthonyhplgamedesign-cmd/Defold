import Phaser from 'phaser'
import { DEPTH, GAME } from '../constants'
import { sd, sx, sy, syHud } from '../utils/responsive'
import { sfx } from '../audio'
import { Ball } from './Ball'
import { RING_COLORS } from './RingArt'
import { colorPile, pileSlots } from './pile'
import { makeRng } from './rng'

// Gift art (373 px square): box spans x 41-331; the physics box covers art rows 140-341 (lid nearly full width → bottom).
const GIFT = { size: 373, cx: 186, cy: 240.5, w: 291 }

type Flight = { active: boolean; from: Ball; to: Ball; color: number; r0: number; start: number }

/** Mid-line radius of ring index i (0 = innermost). */
const ringMid = (i: number) => GAME.RING_HOLE + GAME.RING_PITCH * (i + 0.5)

type Pair = { bodyA: MatterJS.BodyType; bodyB: MatterJS.BodyType; isActive: boolean }

/**
 * Pile, box, walls, danger rope and the merge/clear rules.
 * Merge: a new contact between balls with the same outer color → the longer outer run pulls the other's
 * outer run (tie: the single-color ball) (capacity MAX_RINGS); the receiver re-checks its contacts
 * after every transfer/clear so chains continue (donor does not — matches the reference). The pile layout must start with no same-color neighbours.
 * A run ≥ CLEAR_RUN pops. Empty balls vanish.
 */
/** Rings a ball can still take: MAX_RINGS (ring atlas limit) minus rings held and in flight. */
const room = (b: Ball) => GAME.MAX_RINGS - b.rings.length - b.incoming

export class Board {
  readonly balls: Ball[] = []
  onWin: () => void = () => {}
  onFail: () => void = () => {}
  /** Intro drop finished: pile + box settled, ceiling closed. */
  onReady: () => void = () => {}

  private byBody = new Map<number, Ball>()
  private ended = false
  private intro = true
  private box: MatterJS.BodyType | null = null
  private boxPos = { x: 0, y: 0, angle: 0 }
  private boxPrev = { x: 0, y: 0, angle: 0 }
  private boxStartY = 0
  private floor!: MatterJS.BodyType
  /** Gift box view; the win beat (WinFx) takes it over. */
  boxView!: Phaser.GameObjects.Image
  private rope: Phaser.GameObjects.Graphics
  private boardView: Phaser.GameObjects.Image
  private fx: Phaser.GameObjects.Particles.ParticleEmitter
  private mergeFx: Phaser.GameObjects.Particles.ParticleEmitter
  /** Direction (deg) for the next edge particle; read by the emitters' angle/rotate ops. */
  private fxAngle = 0
  /** Rings in flight between donor and receiver, drawn by `flyView` every frame (pooled). */
  private flights: Flight[] = []
  private flyView: Phaser.GameObjects.Graphics

  constructor(private scene: Phaser.Scene) {
    this.boardView = scene.add.image(0, 0, 'board').setOrigin(0.5, 0).setDepth(DEPTH.BOARD).setAlpha(GAME.BOARD_ALPHA)
    this.rope = scene.add.graphics().setDepth(DEPTH.ROPE)
    this.makeTextures()
    // Particles start on the ball's edge and point outward (actual game). Sizes/speeds go through sd().
    const fade = { onEmit: () => 1, onUpdate: (_p: unknown, _k: string, t: number) => (t < 0.5 ? 1 : (1 - t) / 0.5) }
    const radial = { onEmit: () => this.fxAngle }
    // Clear: ring-colored dots bursting from the ball's center and falling (first version).
    this.fx = scene.add
      .particles(0, 0, 'dot', {
        speed: { onEmit: () => sd(Phaser.Math.Between(120, 520)) },
        lifespan: 550,
        scale: { onEmit: () => sd(1), onUpdate: (_p: unknown, _k: string, t: number) => sd(1) * (1 - t) },
        emitting: false,
      })
      .setDepth(DEPTH.FX)
    // Merge: short gold dashes that pop out of the receiver's edge and stay close to it.
    this.mergeFx = scene.add
      .particles(0, 0, 'pill', {
        angle: radial,
        rotate: radial,
        speed: { onEmit: () => sd(Phaser.Math.Between(30, 90)) },
        lifespan: 250,
        scaleX: { onEmit: () => sd(Phaser.Math.FloatBetween(0.4, 0.7)) },
        scaleY: { onEmit: () => sd(0.55) },
        alpha: fade,
        tint: GAME.MERGE_FX_TINTS as unknown as number[],
        emitting: false,
      })
      .setDepth(DEPTH.FX)
    this.flyView = scene.add.graphics().setDepth(DEPTH.FX)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      // Matter has already destroyed the world when scene shutdown reaches this listener.
      for (let i = 0; i < this.balls.length; i++) {
        this.balls[i].body = null
        this.balls[i].destroy()
      }
    })
  }

  build() {
    const m = this.scene.matter
    const { BOARD_LEFT: L, BOARD_RIGHT: R, FLOOR_Y: F } = GAME
    m.add.rectangle(L - 100, F - 2500, 200, 6000, { isStatic: true, label: 'wall' })
    m.add.rectangle(R + 100, F - 2500, 200, 6000, { isStatic: true, label: 'wall' })
    this.floor = m.add.rectangle(540, F + 100, 2000, 200, { isStatic: true, label: 'floor' })

    // Mixed ball sizes don't stack into a resting layout by hand, so the pile + box are settled in a
    // synchronous physics run first, then colored from the real contacts (no same-color neighbours).
    const rng = makeRng(GAME.SEED)
    let top: number = F
    const slots = pileSlots(rng)
    for (const s of slots) {
      const b = new Ball(this.scene, new Array<number>(s.n).fill(0), s.x, s.y)
      b.addBody()
      this.balls.push(b)
      top = Math.min(top, b.y - b.radius)
    }
    const box = this.addBox(GAME.BOX_X, top - GAME.BOX_H / 2 - 2, 0)
    for (let i = 0; i < GAME.PILE_SETTLE_STEPS; i++) m.world.step(1000 / 60)
    // Ceiling only after the settle: a full pile's packed rows start above it.
    m.add.rectangle(540, GAME.CEILING_Y - 100, 2000, 200, { isStatic: true, label: 'ceiling' })
    this.boxPos.x = box.position.x
    this.boxPos.angle = box.angle
    const boxY = box.position.y
    top = box.bounds.min.y
    m.world.remove(box)
    for (const b of this.balls) {
      b.sync()
      m.world.remove(b.body!)
      b.body = null
      top = Math.min(top, b.y - b.radius)
    }
    colorPile(this.balls.map((ball, i) => ({ ball, two: slots[i].two })), rng)
    for (const b of this.balls) b.redraw()
    Ball.flushRedraws(Infinity) // boot: draw the colored pile before the first frame, not one ball per frame

    // Intro: the settled formation (box included; it settles inside the full pile) starts at the top of the
    // container and is tweened down (no physics yet), so it lands exactly in the settled layout. Bodies are re-added on landing.
    const drop = top - (GAME.CEILING_Y + 4)
    for (const b of this.balls) b.y -= drop
    this.boxPos.y = boxY - drop
    this.scene.tweens.add({
      targets: [...this.balls, this.boxPos],
      y: `+=${drop}`,
      duration: GAME.INTRO_FALL_MS,
      ease: 'Quad.In',
      onComplete: () => this.finishIntro(),
    })
    this.boxView = this.scene.add.image(0, 0, 'gift').setDepth(DEPTH.BOX).setOrigin(GIFT.cx / GIFT.size, GIFT.cy / GIFT.size)

    m.world.on('collisionstart', this.onCollision, this)
    m.world.on('beforeupdate', this.savePrev, this)
    this.relayout()
    this.update(0)
  }

  add(ball: Ball, restitution?: number) {
    if (!ball.body) ball.addBody(restitution)
    this.balls.push(ball)
    this.byBody.set(ball.body!.id, ball)
  }

  /**
   * A dropped ball is frictionless while it lands (Matter uses the lower friction of a contact pair), so it
   * slides into place instead of sticking where it first touches; once settled it grips like the pile.
   */
  startLanding(ball: Ball) {
    if (!ball.body) return
    ball.landing = true
    ball.stillMs = 0
    ball.body.friction = 0
    ball.body.frictionStatic = 0
  }

  private updateLanding(dtSec: number) {
    const now = this.scene.time.now
    for (let i = 0; i < this.balls.length; i++) {
      const b = this.balls[i]
      if (!b.landing || !b.body) continue
      b.stillMs = b.body.speed < GAME.LAND_SPEED ? b.stillMs + dtSec * 1000 : 0
      if (b.stillMs < GAME.LAND_STILL_MS && now - b.droppedAtMs < GAME.LAND_MAX_MS) continue
      b.landing = false
      b.body.friction = GAME.BALL_FRICTION
      b.body.frictionStatic = GAME.BALL_FRICTION_STATIC
    }
  }

  /**
   * Outer colors of the 6 highest settled balls — the reference's pool for the player's next ball.
   * Just-dropped balls are skipped, else the falling ball feeds its own color back into the pool.
   */
  topColors(): number[] {
    const now = this.scene.time.now
    const sorted = this.balls.slice().sort((a, b) => a.y - b.y)
    const out: number[] = []
    for (let i = 0; i < sorted.length && out.length < 6; i++) {
      const b = sorted[i]
      if (b.rings.length && now - b.droppedAtMs >= GAME.DROP_GRACE_MS) out.push(b.color)
    }
    return out
  }

  get busy() {
    for (let i = 0; i < this.balls.length; i++) if (this.balls[i].busy) return true
    return false
  }

  /** Win progress 0..1: how far the gift has sunk from its post-intro spot toward the floor (touching it wins). */
  get progress() {
    if (!this.box) return 0
    const end = GAME.FLOOR_Y - GAME.BOX_H / 2
    return Phaser.Math.Clamp((this.box.position.y - this.boxStartY) / (end - this.boxStartY), 0, 1)
  }

  /**
   * Warning level 0..1: fail countdown progress (the longest a resting ball has been above the line, same rules as
   * checkFail), floored at DANGER_WARN_LEVEL the moment any landed ball pokes over the line (no grace, no rest wait).
   */
  get danger() {
    const now = this.scene.time.now
    let sec = 0
    let over = false
    for (let i = 0; i < this.balls.length; i++) {
      const b = this.balls[i]
      if (this.overLine(b, now)) over = true
      if (!b.busy && b.overLineSec > sec) sec = b.overLineSec
    }
    const level = Math.min(1, sec / GAME.FAIL_HOLD_SEC)
    return over ? Math.max(level, GAME.DANGER_WARN_LEVEL) : level
  }

  stop() {
    this.ended = true
  }

  update(dtSec: number) {
    // Matter steps at a fixed 60 Hz; on 90/120/144 Hz screens most frames have no step, so views are
    // interpolated between the last two steps (renders up to one step behind, never ahead).
    const runner = this.scene.matter.world.runner as unknown as { timeBuffer: number; delta: number }
    // Matter's runner steps once the buffer reaches 1.5 steps (Runner._timeBufferMargin), so after stepping
    // it holds 0.5–1.5 steps: subtract the half step to get the fraction since the last step.
    const alpha = Math.min(1, Math.max(0, runner.timeBuffer / runner.delta - 0.5))
    Ball.flushRedraws(1)
    for (let i = 0; i < this.balls.length; i++) this.balls[i].sync(alpha)
    this.updateLanding(dtSec)
    if (this.box) {
      const b = this.box
      const q = this.boxPrev
      this.boxView
        .setPosition(sx(q.x + (b.position.x - q.x) * alpha), sy(q.y + (b.position.y - q.y) * alpha))
        .setRotation(q.angle + (b.angle - q.angle) * alpha)
    } else {
      this.boxView.setPosition(sx(this.boxPos.x), sy(this.boxPos.y)).setRotation(this.boxPos.angle)
    }
    this.drawFlights()
    if (!this.intro && !this.ended && dtSec > 0) this.checkFail(dtSec)
  }

  relayout() {
    const top = syHud(GAME.CEILING_Y) // meets the HUD bar; stretches over the spare height
    this.boardView
      .setPosition(sx((GAME.BOARD_LEFT + GAME.BOARD_RIGHT) / 2), top)
      .setDisplaySize(sd(GAME.BOARD_RIGHT - GAME.BOARD_LEFT), this.scene.scale.height - top)
    const y = sy(GAME.LINE_Y)
    const h = sd(12)
    const seg = sd(44)
    this.rope.clear()
    const left = sx(GAME.BOARD_LEFT), right = sx(GAME.BOARD_RIGHT)
    this.rope.fillStyle(0xff2942, 1).fillRect(left, y - h / 2, right - left, h)
    this.rope.fillStyle(0xffe8ef, 1)
    for (let x = left; x < right; x += seg * 2) {
      this.rope.beginPath()
      this.rope.moveTo(x, y + h / 2)
      this.rope.lineTo(Math.min(x + sd(12), right), y - h / 2)
      this.rope.lineTo(Math.min(x + seg + sd(12), right), y - h / 2)
      this.rope.lineTo(Math.min(x + seg, right), y + h / 2)
      this.rope.closePath().fillPath()
    }
    const giftSize = sd((GAME.BOX_W * GIFT.size) / GIFT.w) // uniform: art box width = BOX_W
    this.boxView.setDisplaySize(giftSize, giftSize)
    this.fx.gravityY = sd(GAME.CLEAR_FX_GRAVITY)
  }

  // ---------- rules ----------

  private onCollision(e: { pairs: Pair[] }) {
    for (let i = 0; i < e.pairs.length; i++) {
      const a = e.pairs[i].bodyA.parent
      const b = e.pairs[i].bodyB.parent
      if (!this.ended && ((a === this.box && b === this.floor) || (b === this.box && a === this.floor))) {
        this.ended = true
        this.onWin()
        return
      }
      if (a.label !== 'wall' && b.label !== 'wall') {
        // A thrown drop grazing a wall above the line is still falling, not landed.
        this.markLanded(a)
        this.markLanded(b)
      }
      this.bounceKick(a, b)
      this.bounceKick(b, a)
      this.tryMerge(a, b)
    }
  }

  private markLanded(body: MatterJS.BodyType) {
    const ball = this.byBody.get(body.id)
    if (ball) ball.landed = true
  }

  private tryMerge(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
    const A = this.byBody.get(bodyA.id)
    const B = this.byBody.get(bodyB.id)
    if (this.intro || !A || !B || !A.rings.length || !B.rings.length || A.color !== B.color) return
    // A clearing ball keeps absorbing its color (drops or neighbours) until its pop finishes.
    if (A.clearColor >= 0 || B.clearColor >= 0) {
      const rec = A.clearColor >= 0 ? A : B
      const don = rec === A ? B : A
      // Only the color being popped; an inner color exposed mid-clear waits for the release recheck.
      if (rec.color === rec.clearColor && !don.busy && don.clearColor < 0) this.transfer(rec, don)
      return
    }
    if (A.busy || B.busy) return
    // Ruleset (drop and pile alike): more rings of the touching color (outer run) receives; equal → the
    // single-color ball; otherwise either. No spit (matches the reference): received rings stack on the
    // receiver's outer edge, and a mixed donor shows its inner color (more chains).
    const aPure = A.outerRun === A.rings.length
    const bPure = B.outerRun === B.rings.length
    const aReceives = A.outerRun !== B.outerRun ? A.outerRun > B.outerRun : aPure || !bPure
    this.transfer(aReceives ? A : B, aReceives ? B : A)
  }

  private transfer(rec: Ball, don: Ball) {
    // Whole runs only: capping at the receiver's room stranded the donor's last ring(s) as a tiny same-color ball.
    // Rings still flying in count toward MAX_RINGS, or a clearing ball (several transfers at once) passes it and
    // the outer bands fall outside the ring atlas (drawn as the dark base).
    const n = don.outerRun
    if (n > room(rec)) {
      // A clearing receiver frees room as it pops (clear() rechecks after every pop), so the donor waits. Otherwise
      // the other ball receives if this run fits there; if neither fits, no merge.
      if (rec.clearColor < 0 && don.clearColor < 0 && rec.outerRun <= room(don)) this.transfer(don, rec)
      return
    }
    rec.busy = don.busy = true
    rec.incoming += n
    const color = don.color
    let landed = 0
    for (let i = 0; i < n; i++) {
      // Each ring leaves the donor, flies as a ring outline to the receiver's outer edge, then lands.
      this.scene.time.delayedCall(GAME.STEP_MS * i, () => {
        const r0 = ringMid(don.rings.length - 1)
        don.rings.pop()
        don.redraw()
        this.fly(don, rec, color, r0, () => {
          rec.incoming--
          rec.rings.push(color)
          rec.redraw()
          sfx('merge')
          if (++landed < n) return
          this.edgeBurst(this.mergeFx, rec, GAME.MERGE_FX_COUNT) // once per merge, not per ring
          this.afterTransfer(rec, don)
        })
      })
    }
  }

  private fly(from: Ball, to: Ball, color: number, r0: number, onLand: () => void) {
    let f: Flight | undefined
    for (let i = 0; i < this.flights.length && !f; i++) if (!this.flights[i].active) f = this.flights[i]
    if (!f) this.flights.push((f = { active: false, from, to, color, r0, start: 0 }))
    f.active = true
    f.from = from
    f.to = to
    f.color = color
    f.r0 = r0
    f.start = this.scene.time.now
    const flight = f
    this.scene.time.delayedCall(GAME.RING_FLIGHT_MS, () => {
      flight.active = false
      onLand()
    })
  }

  private drawFlights() {
    const g = this.flyView
    g.clear()
    const now = this.scene.time.now
    for (let i = 0; i < this.flights.length; i++) {
      const f = this.flights[i]
      if (!f.active) continue
      const t = Phaser.Math.Clamp((now - f.start) / GAME.RING_FLIGHT_MS, 0, 1)
      const e = t * t * (3 - 2 * t) // smoothstep
      const x = f.from.x + (f.to.x - f.from.x) * e
      const y = f.from.y + (f.to.y - f.from.y) * e - Math.sin(t * Math.PI) * GAME.RING_FLIGHT_ARC
      const r = f.r0 + (ringMid(f.to.rings.length) - f.r0) * e
      g.lineStyle(sd(GAME.RING_FLIGHT_WIDTH), RING_COLORS[f.color], 1).strokeCircle(sx(x), sy(y), sd(r))
      g.lineStyle(sd(GAME.RING_PITCH * 0.25), 0xffffff, 0.45).strokeCircle(sx(x), sy(y) - sd(1), sd(r))
    }
  }

  /** `count` particles on the ball's edge, evenly spread with jitter, each heading outward. */
  private edgeBurst(em: Phaser.GameObjects.Particles.ParticleEmitter, ball: Ball, count: number) {
    const r = ball.radius
    const off = Math.random() * 360
    for (let i = 0; i < count; i++) {
      const deg = off + (360 * i) / count + Phaser.Math.Between(-12, 12)
      const a = Phaser.Math.DegToRad(deg)
      this.fxAngle = deg
      em.emitParticleAt(sx(ball.x + Math.cos(a) * r), sy(ball.y + Math.sin(a) * r), 1)
    }
  }

  private afterTransfer(rec: Ball, don: Ball) {
    // Ref: only the receiver re-checks contacts; the donor's newly exposed color waits for a new contact.
    if (don.rings.length === 0) this.remove(don)
    else don.busy = false
    if (rec.clearColor >= 0) return // the running clear pops what arrived
    this.pulse(rec)
    if (rec.outerRun >= GAME.CLEAR_RUN) this.clear(rec)
    else this.release(rec)
  }

  /**
   * Waits CLEAR_DELAY_MS, then pops the outer run one ring at a time (gap: see CLEAR_POP_MS). Until the pop finishes the ball
   * still absorbs its color from new contacts and from neighbours it already touches; popping pauses
   * while those rings fly in, so the ball visibly grows before they pop too.
   */
  private clear(ball: Ball) {
    const color = ball.color
    ball.busy = true
    ball.clearColor = color
    let gap = 0 // per-ring pop gap, set from the run size when popping starts
    const step = () => {
      if (ball.incoming > 0) {
        // Rings are still flying in: let the merge land visibly before popping on.
        this.scene.time.delayedCall(GAME.STEP_MS, step)
        return
      }
      if (ball.rings.length && ball.color === color) {
        // Bigger runs pop faster, but only by √(CLEAR_RUN / run): their total time still grows a little.
        gap ||= Math.max(GAME.CLEAR_POP_MIN_MS, GAME.CLEAR_POP_MS * Math.sqrt(GAME.CLEAR_RUN / ball.outerRun))
        this.burst(ball, color)
        sfx('pop')
        ball.rings.pop()
        ball.redraw()
        this.recheck(ball) // a touching donor that did not fit (see transfer) flows in once there is room
      } else {
        ball.clearColor = -1
        if (ball.rings.length === 0) this.remove(ball)
        else this.release(ball)
        return
      }
      this.scene.time.delayedCall(gap, step)
    }
    this.recheck(ball) // touching matching balls start merging in during the pause
    this.scene.time.delayedCall(GAME.CLEAR_DELAY_MS, step)
  }

  /**
   * The pile is soft in Matter (stacked contacts soak up an impact), so a dropped ball barely rebounds off
   * other balls whatever its restitution. While it lands, add a rebound along the contact normal from its
   * pre-impact approach speed, like the actual game. Floor/walls bounce through restitution alone.
   */
  private bounceKick(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
    const a = this.byBody.get(bodyA.id)
    const b = this.byBody.get(bodyB.id)
    if (!a || !b || !a.landing || !a.body || !b.body) return
    let nx = a.body.position.x - b.body.position.x
    let ny = a.body.position.y - b.body.position.y
    const len = Math.hypot(nx, ny) || 1
    nx /= len
    ny /= len
    const vn = (a.preVx - b.preVx) * nx + (a.preVy - b.preVy) * ny // < 0 = approaching
    if (vn > -GAME.BALL_HIT_MIN) return
    // collisionstart fires before the solver resolves the contact, so queue the rebound for the next step.
    const k = -vn * GAME.BALL_HIT_KICK
    if (k > a.kickV) {
      a.kickNx = nx
      a.kickNy = ny
      a.kickV = k
    }
  }

  /** Receiver / clearing ball pops up then springs back (view only; physics radius unchanged). */
  private pulse(b: Ball) {
    this.scene.tweens.killTweensOf(b)
    b.viewScale = 1
    this.scene.tweens.add({
      targets: b,
      viewScale: GAME.PULSE_SCALE,
      duration: GAME.PULSE_UP_MS,
      ease: 'Quad.Out',
      onComplete: () => this.scene.tweens.add({ targets: b, viewScale: 1, duration: GAME.PULSE_SETTLE_MS, ease: 'Back.Out', easeParams: [3] }),
    })
  }

  /** Free balls and re-test contacts they already have (collisionstart won't fire again) — enables chains. */
  private release(ball: Ball) {
    ball.busy = false
    this.recheck(ball)
  }

  private recheck(ball: Ball) {
    const pairs: Pair[] = (this.scene.matter.world.engine as any).pairs.list
    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i]
      if (!p.isActive) continue
      const a = p.bodyA.parent
      const b = p.bodyB.parent
      if (ball.body && (a === ball.body || b === ball.body)) this.tryMerge(a, b)
    }
  }

  private remove(ball: Ball) {
    if (ball.body) this.byBody.delete(ball.body.id)
    const i = this.balls.indexOf(ball)
    if (i >= 0) this.balls.splice(i, 1)
    ball.destroy()
  }

  private burst(ball: Ball, color: number) {
    this.fx.particleTint = RING_COLORS[color]
    this.fx.explode(GAME.CLEAR_FX_COUNT, sx(ball.x), sy(ball.y))
  }

  /**
   * Over the line, for the warning and the fail countdown alike. Speed does not matter: a shifting pile kept
   * resetting a moving ball's countdown (warning flashed, never failed). A drop crosses the line on its way down,
   * so it counts only once it has touched something.
   */
  private overLine(b: Ball, now: number) {
    return !!b.body && b.y - b.radius < GAME.LINE_Y && (b.landed || now - b.droppedAtMs >= GAME.DROP_GRACE_MS)
  }

  private checkFail(dt: number) {
    const now = this.scene.time.now
    for (let i = 0; i < this.balls.length; i++) {
      const b = this.balls[i]
      if (b.busy) continue // merging / clearing: its countdown pauses
      b.overLineSec = this.overLine(b, now) ? b.overLineSec + dt : 0
      if (b.overLineSec >= GAME.FAIL_HOLD_SEC) {
        this.ended = true
        this.onFail()
        return
      }
    }
  }

  private savePrev() {
    for (let i = 0; i < this.balls.length; i++) {
      const b = this.balls[i]
      if (!b.body) continue
      b.prevX = b.body.position.x
      b.prevY = b.body.position.y
      if (b.kickV > 0) {
        // Raise the speed away from the hit ball to the queued rebound (keep any larger existing rebound).
        const v = b.body.velocity
        const out = v.x * b.kickNx + v.y * b.kickNy
        if (out < b.kickV) this.scene.matter.body.setVelocity(b.body, { x: v.x + b.kickNx * (b.kickV - out), y: v.y + b.kickNy * (b.kickV - out) })
        b.kickV = 0
      }
      b.preVx = b.body.velocity.x
      b.preVy = b.body.velocity.y
      // Rolling resistance (Matter has none): spinning balls would roll apart and let small balls squeeze through.
      this.scene.matter.body.setAngularVelocity(b.body, b.body.angularVelocity * GAME.ROLL_DAMP)
    }
    if (this.box) {
      this.boxPrev.x = this.box.position.x
      this.boxPrev.y = this.box.position.y
      this.boxPrev.angle = this.box.angle
    }
  }

  // ---------- setup helpers ----------

  private finishIntro() {
    for (const b of this.balls) {
      b.addBody()
      this.byBody.set(b.body!.id, b)
    }
    this.box = this.addBox(this.boxPos.x, this.boxPos.y, this.boxPos.angle)
    this.boxPrev = { ...this.boxPos }
    this.boxStartY = this.boxPos.y
    this.intro = false
    this.onReady()
  }

  private addBox(x: number, y: number, angle: number) {
    const box = this.scene.matter.add.rectangle(x, y, GAME.BOX_W, GAME.BOX_H, {
      label: 'box',
      mass: GAME.BOX_MASS,
      friction: 0.3,
      chamfer: { radius: 14 },
    })
    this.scene.matter.body.setAngle(box, angle, false)
    return box
  }

  private makeTextures() {
    const t = this.scene.textures
    if (!t.exists('dot')) {
      const dot = t.createCanvas('dot', 16, 16)!
      dot.context.fillStyle = '#fff'
      dot.context.beginPath()
      dot.context.arc(8, 8, 7, 0, Math.PI * 2)
      dot.context.fill()
      dot.refresh()
    }
    if (!t.exists('pill')) {
      const pill = t.createCanvas('pill', 32, 12)!
      // Capsule from two arcs (ctx.roundRect is missing on iOS < 16). Grey rim + white core: after the gold
      // tint the rim reads as darker gold, so pills stay visible over yellow rings.
      const capsule = (r: number, color: string) => {
        pill.context.fillStyle = color
        pill.context.beginPath()
        pill.context.arc(6, 6, r, Math.PI / 2, Math.PI * 1.5)
        pill.context.arc(26, 6, r, Math.PI * 1.5, Math.PI / 2)
        pill.context.closePath()
        pill.context.fill()
      }
      capsule(5.5, '#9a7a40')
      capsule(3.5, '#ffffff')
      pill.refresh()
    }
  }
}
