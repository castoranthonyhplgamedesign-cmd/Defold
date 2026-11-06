import Phaser from 'phaser'
import { trackEvent } from '../analytics'
import { initWebSfx, sfx, startBgm } from '../audio'
import { GAME } from '../constants'
import { Board } from '../game/Board'
import { Danger } from '../game/Danger'
import { Hand } from '../game/Hand'
import { Hud } from '../game/Hud'
import { Launcher } from '../game/Launcher'
import { makeRng } from '../game/rng'
import { showFail, showWin } from '../game/WinFx'
import { ITERATION } from '../iteration'
import { notifyGameEnd, notifyGameStart } from '../networks'
import { RELAYOUT } from '../utils/responsive'
import { PERF, perfPhysics } from '../utils/perf'
import { DEFERRED, queue } from './BootScene'
import { redirectToStore, showEndcard } from './cta'

/** Orchestrator only: wires game/ modules, owns limits and lifecycle calls. */
export class GameScene extends Phaser.Scene {
  private board!: Board
  private launcher!: Launcher
  private hand!: Hand
  private hud!: Hud
  private danger!: Danger
  private deferredReady = false
  private playing = false
  private ended = false
  private clicks = 0 // valid grabs (pointerdown on the player ball)
  private elapsedSec = 0
  private idleSec = 0
  private passed = 0 // CHALLENGE_PASS_* milestones already sent (0..3)
  private displayed = false

  constructor() {
    super('Game')
  }

  create() {
    // Restart reuses this instance: clicks, elapsedSec, playing, passed and displayed carry over (limits keep running).
    this.ended = false
    this.idleSec = 0
    if (!this.deferredReady) {
      queue(this.load, DEFERRED)
      this.load.once(Phaser.Loader.Events.COMPLETE, () => {
        this.deferredReady = true
        startBgm(this.sound, this.cache.audio.get('bgm')) // muted until the first tap via bindLifecycle
        initWebSfx(this.sound, this.cache.audio)
      })
      this.load.start()
    }

    const rng = makeRng(GAME.SEED)
    this.board = new Board(this)
    this.board.build()
    this.board.onWin = () => this.triggerWin()
    this.board.onFail = () => this.triggerFail()

    this.launcher = new Launcher(this, this.board, rng)
    this.launcher.onGrab = () => this.onGrab()
    this.launcher.onDrop = () => this.onDrop()

    this.hand = new Hand(this)
    this.hud = new Hud(this)
    this.hud.onRestart = () => this.restartBoard()
    this.danger = new Danger(this)
    this.board.onReady = () => {
      this.launcher.start()
      if (!this.displayed) trackEvent('DISPLAYED') // intro over, the ball can be dragged
      this.displayed = true
      this.hand.show(this.launcher.ballX)
    }

    if (PERF) perfPhysics(this.matter.world)
    this.game.events.on(RELAYOUT, this.relayout, this)
    this.bindDebug() // dev only; the body is dead code in builds
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(RELAYOUT, this.relayout, this))
  }

  private onGrab() {
    sfx('touch') // synchronous inside Phaser's native touchstart/pointerdown handler
    this.hand.hide()
    this.idleSec = 0
    this.clicks++
    if (!this.playing && this.deferredReady) this.startPlaying()
    // Last allowed click ends on the press itself. Note: touchstart grants no user activation, so a plain window.open
    // fallback may be blocked on touch browsers; SDK / MRAID store opens are unaffected.
    if (this.clicks >= ITERATION.clickLimit) this.endByLimit()
  }

  /** HUD build restart button: fresh board, same session (not a click; limits and analytics state carry over). */
  private restartBoard() {
    if (this.ended) return
    sfx('touch')
    trackEvent('CHALLENGE_RETRY')
    this.scene.restart()
  }

  private onDrop() {
    if (!this.playing) this.startPlaying()
  }

  /** CHALLENGE_PASS_25/50/75 by gift progress, each once and in order. */
  private trackProgress(p: number) {
    while (this.passed < 3 && p >= (this.passed + 1) * 0.25) {
      this.passed++
      trackEvent(this.passed === 1 ? 'CHALLENGE_PASS_25' : this.passed === 2 ? 'CHALLENGE_PASS_50' : 'CHALLENGE_PASS_75')
    }
  }

  private startPlaying() {
    this.playing = true
    notifyGameStart()
    trackEvent('CHALLENGE_STARTED')
  }

  update(_t: number, dtMs: number) {
    const dt = dtMs / 1000
    this.board.update(dt)
    this.launcher.update()
    this.hand.update(dt)
    this.danger.update(this.ended ? 0 : this.board.danger, dt) // eases out once the game ends
    if (!this.playing || this.ended) return

    this.trackProgress(this.board.progress)
    this.elapsedSec += dt
    if (this.elapsedSec >= ITERATION.timeLimitSec) return this.endByLimit()

    this.idleSec = this.launcher.dragging ? 0 : this.idleSec + dt
    if (this.idleSec >= GAME.HAND_IDLE_SEC && this.launcher.enabled) this.hand.show(this.launcher.ballX)
  }

  triggerWin() {
    if (!this.end()) return
    this.trackProgress(1) // a fast sink can skip a frame check; send any missing milestones in order first
    trackEvent('CHALLENGE_SOLVED')
    this.launcher.hideBall()
    showWin(this, this.board.boxView, () => this.toEndcard())
  }

  triggerFail() {
    if (!this.end()) return
    trackEvent('CHALLENGE_FAILED')
    showFail(this, () => this.toEndcard())
  }

  private endByLimit() {
    if (this.end()) this.toEndcard()
  }

  /** Game end: auto-redirect to the store, then leave the endcard up for when the player returns. */
  private toEndcard() {
    // Freeze the board under the endcard: no physics, merges or ring pops (Board's steps run on scene.time).
    this.matter.world.pause()
    this.time.paused = true
    redirectToStore(true)
    showEndcard(this)
  }

  /** Shared end bookkeeping; false if already ended. */
  private end() {
    if (this.ended) return false
    this.ended = true
    this.launcher.enabled = false
    this.hand.hide()
    this.board.stop()
    notifyGameEnd()
    return true
  }

  /**
   * Dev-only visual checks (stripped from builds): keys D / W / F / L, or window.debug.danger() etc. in the console.
   * danger: pins a pile ball above the line so the real countdown runs (rope pulse → vignette → fail endcard).
   */
  private bindDebug() {
    if (import.meta.env.DEV) {
      const debug = {
        danger: () => {
          const b = this.board.balls.find((b) => b.body && !b.busy)
          if (!b?.body) return
          this.matter.body.setStatic(b.body, true)
          this.matter.body.setPosition(b.body, { x: 300, y: GAME.LINE_Y - 70 }, false)
          b.droppedAtMs = -Infinity // skip the drop grace
        },
        win: () => this.triggerWin(),
        fail: () => this.triggerFail(),
        limit: () => this.endByLimit(),
      }
      ;(window as any).debug = debug
      const keys: Record<string, () => void> = { d: debug.danger, w: debug.win, f: debug.fail, l: debug.limit }
      this.input.keyboard?.on('keydown', (e: KeyboardEvent) => keys[e.key.toLowerCase()]?.())
    }
  }

  private relayout() {
    this.board.relayout()
    this.hud.relayout()
    this.hand.relayout()
    this.danger.relayout()
  }
}
