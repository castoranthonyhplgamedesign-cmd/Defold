import Phaser from 'phaser'
import { sfx } from '../audio'
import { DEPTH, GAME } from '../constants'
import { sd, sx, sy } from '../utils/responsive'

const VIGNETTE_FROM = 1 - 0.5 / GAME.FAIL_HOLD_SEC // red vignette only in the last 0.5 s of the countdown
const START_PHASE = Math.PI - 1e-3 // just before a pulse peak: the warning starts at full glow with a blip
const VIG = 256 // vignette texture size; stretched to the screen

/**
 * Fail countdown warning: the rope pulses red (faster as the countdown runs) while a ball rests above it,
 * plus a red screen-edge vignette for the last 0.5 s. `level` 0..1 = countdown progress (Board.danger).
 */
export class Danger {
  private glow: Phaser.GameObjects.Graphics
  private vignette: Phaser.GameObjects.Image
  private shown = 0 // eased level, so the warning fades out instead of snapping off
  private phase = START_PHASE

  constructor(private scene: Phaser.Scene) {
    if (!scene.textures.exists('vignette')) {
      const tex = scene.textures.createCanvas('vignette', VIG, VIG)!
      const g = tex.context.createRadialGradient(VIG / 2, VIG / 2, VIG * 0.3, VIG / 2, VIG / 2, VIG * 0.71)
      g.addColorStop(0, 'rgba(255,20,40,0)')
      g.addColorStop(1, 'rgba(255,20,40,0.9)')
      tex.context.fillStyle = g
      tex.context.fillRect(0, 0, VIG, VIG)
      tex.refresh()
    }
    this.glow = scene.add.graphics().setDepth(DEPTH.ROPE).setAlpha(0)
    this.vignette = scene.add.image(0, 0, 'vignette').setOrigin(0).setDepth(DEPTH.DANGER).setAlpha(0)
    this.relayout()
  }

  update(level: number, dt: number) {
    // Rise instantly (the warning must land the frame a ball crosses), fade out eased.
    this.shown = level > this.shown ? level : this.shown + (level - this.shown) * Math.min(1, dt * 12)
    if (this.shown < 0.01) {
      this.phase = START_PHASE
      this.glow.setAlpha(0)
      this.vignette.setAlpha(0)
      return
    }
    const prev = this.phase
    this.phase += dt * Math.PI * 2 * (2 + 6 * this.shown) // 2 Hz → 8 Hz as the countdown runs
    // Blip on each pulse peak (phase π mod 2π) while really in danger, not during the fade-out.
    if (level > 0 && Math.floor((this.phase + Math.PI) / (Math.PI * 2)) > Math.floor((prev + Math.PI) / (Math.PI * 2))) sfx('warn')
    const pulse = 0.5 + 0.5 * Math.sin(this.phase - Math.PI / 2) // starts at a peak (START_PHASE)
    this.glow.setAlpha(Math.min(1, this.shown * 3) * (0.35 + 0.65 * pulse))
    const v = Phaser.Math.Clamp((this.shown - VIGNETTE_FROM) / (1 - VIGNETTE_FROM), 0, 1)
    this.vignette.setAlpha(v * (0.6 + 0.4 * pulse))
  }

  relayout() {
    const left = sx(GAME.BOARD_LEFT)
    const h = sd(18) // a bit thicker than the 12 px rope, so it reads as a glow over it
    this.glow.clear().fillStyle(0xff1a2e, 1).fillRect(left, sy(GAME.LINE_Y) - h / 2, sx(GAME.BOARD_RIGHT) - left, h)
    this.vignette.setDisplaySize(this.scene.scale.width, this.scene.scale.height)
  }
}
