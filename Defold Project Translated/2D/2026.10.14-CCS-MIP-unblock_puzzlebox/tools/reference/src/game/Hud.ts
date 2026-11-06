import Phaser from 'phaser'
import { DEPTH, FONT, GAME } from '../constants'
import { HUD } from '../iteration'
import { sd, sx, syHud } from '../utils/responsive'

/**
 * Mockup chrome. Restart + GOAL board (objective text) only in the HUD build; the default build hides them.
 * HUD-anchored (syHud). Sizes come from the UI mockup, scaled so its board panel is 964 design px wide and its HUD bar ends at CEILING_Y.
 */
export class Hud {
  private bar: Phaser.GameObjects.Graphics
  private restart: Phaser.GameObjects.Image
  private goal: Phaser.GameObjects.Image
  private next: Phaser.GameObjects.Image
  private goalText: Phaser.GameObjects.Text
  onRestart: () => void = () => {}

  constructor(private scene: Phaser.Scene) {
    this.bar = scene.add.graphics().setDepth(DEPTH.HUD)
    this.restart = scene.add.image(0, 0, 'restart').setOrigin(0.5, 0).setDepth(DEPTH.HUD)
    this.goal = scene.add.image(0, 0, 'goal_board').setOrigin(0.5, 0).setDepth(DEPTH.HUD)
    this.next = scene.add.image(0, 0, 'next_board').setOrigin(0.5, 0).setDepth(DEPTH.HUD)
    this.goalText = scene.add
      .text(0, 0, 'CLEAR RINGS TO\nGET THE GIFT!', { fontFamily: FONT, color: '#000000', align: 'center' })
      .setOrigin(0.5)
      .setDepth(DEPTH.HUD_CONTENT)
    // Default build shows only the NEXT board; the HUD build adds restart + GOAL.
    if (!HUD) for (const o of [this.restart, this.goal, this.goalText]) o.setVisible(false)
    else this.restart.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.onRestart())
    this.relayout()
  }

  relayout() {
    this.bar.clear()
    this.bar.fillStyle(0x1663da).fillRect(0, 0, this.scene.scale.width, syHud(GAME.CEILING_Y))
    this.bar.fillStyle(0x073d93).fillRect(0, syHud(GAME.CEILING_Y - 8), this.scene.scale.width, sd(8))
    // GOAL and NEXT art are drawn geometrically aligned (next-board.webp 551×598 was re-cut for this): same pixel
    // scale (GOAL 510 px wide from 1459) and the same top, so tabs, box tops and bottoms line up.
    // GAME.NEXT_Y = HUD_BOARD_TOP + white-box center (art row 345 of 598) × HUD_BOARD_SCALE.
    const top = GAME.HUD_BOARD_TOP
    const k = GAME.HUD_BOARD_SCALE
    // Restart keeps its original position: visible top (row 107 of 1254) on y 103.91.
    // Restart art has ~8% transparent padding per side, so 184 shows a ~153 px button.
    this.restart.setPosition(sx(180), syHud(103.91 - (107 * 184) / 1254)).setDisplaySize(sd(184), sd(184))
    this.goal.setPosition(sx(529), syHud(top)).setDisplaySize(sd(1459 * k), sd(601 * k))
    // Centered in the GOAL board's white panel (art y 149-578 of 601 → 127 below the board top).
    this.goalText.setPosition(sx(529), syHud(top + 127)).setFontSize(sd(44)).setLineSpacing(sd(4))
    this.next.setPosition(sx(GAME.NEXT_X), syHud(top)).setDisplaySize(sd(551 * k), sd(598 * k))
  }
}
