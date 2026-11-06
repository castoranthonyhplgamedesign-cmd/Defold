import Phaser from 'phaser'
import { trackEvent } from '../analytics'
import { sfx } from '../audio'
import { DEPTH, DIM } from '../constants'
import { notifyGameClose, triggerCTA } from '../networks'
import { RELAYOUT } from '../utils/responsive'

const LOGO_W = 0.66 // logo width as a share of the screen's short side (= old portrait size on 9:16)

/** `auto`: game-end redirect with no CTA tap, so it is not tracked as CTA_CLICKED. */
export function redirectToStore(auto = false) {
  if (!auto) trackEvent('CTA_CLICKED')
  notifyGameClose()
  triggerCTA()
}

/**
 * Visual-only Phaser endcard: dim + logo centred on the screen (not the design frame), so it is centred in
 * portrait and landscape. Tapping anywhere is the CTA via a full-screen DOM layer (see AGENTS pitfall on Phaser hit areas).
 */
export function showEndcard(scene: Phaser.Scene) {
  trackEvent('ENDCARD_SHOWN')
  sfx('win')

  const dim = scene.add.rectangle(0, 0, 1, 1, DIM.color, DIM.alpha).setOrigin(0).setDepth(DEPTH.DIM)
  const logo = scene.add.image(0, 0, 'logo').setDepth(DEPTH.ENDCARD)
  const intro = { k: 0 }
  scene.tweens.add({ targets: intro, k: 1, duration: 400, ease: 'Back.Out' })

  const layout = () => {
    dim.setSize(scene.scale.width, scene.scale.height)
    // Sized off the screen's short side, not sd(): sd() is height-limited in landscape and shrank the logo.
    const w = Math.min(scene.scale.width, scene.scale.height) * LOGO_W * intro.k
    logo.setPosition(scene.scale.width / 2, scene.scale.height / 2).setDisplaySize(w, (w * 328) / 650)
  }
  layout()
  scene.events.on(Phaser.Scenes.Events.UPDATE, layout)
  scene.game.events.on(RELAYOUT, layout)

  const layer = document.createElement('button')
  layer.setAttribute('aria-label', 'Install Circle Sort')
  layer.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:10;border:0;padding:0;margin:0;background:transparent;cursor:pointer'
  layer.addEventListener('click', () => redirectToStore())
  document.body.appendChild(layer)

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, layout)
    scene.game.events.off(RELAYOUT, layout)
    layer.remove()
  })
}
