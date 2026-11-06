import Phaser from 'phaser'
import { DESIGN_H, DESIGN_W, FONT } from './constants'
import bg from '../Assets/images/bg.webp'
import fontUrl from '../Assets/font/Helvetica Rounded Bold.otf'
import { initAudio } from './audio'
import { bindLifecycle, initMraid, notifyGameReady } from './networks'
import { trackEvent } from './analytics'
import { bindResponsiveResize } from './utils/responsive'
import { PERF, startPerfHud } from './utils/perf'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

// Lifecycle stubs so network preview tools detect them; never override an SDK's own.
const w = window as any
for (const name of ['gameReady', 'gameStart', 'gameEnd', 'gameClose']) {
  if (typeof w[name] !== 'function') w[name] = () => {}
}

async function boot() {
  trackEvent('LOADING') // font, MRAID and first-frame assets load before the player can interact
  // iOS 16.4+: Web Audio defaults to the "ambient" session, which the ringer/silent switch mutes, while the
  // <audio> SFX use "playback" and keep playing. Put Web Audio (the BGM) in the same category as the SFX.
  const audioSession = (navigator as any).audioSession
  if (audioSession) try { audioSession.type = 'playback' } catch { /* unsupported host */ }
  // Set from JS so the image is inlined by the bundle (a raw url() in index.html would ship as a relative path).
  const bgEl = document.getElementById('bg-container')
  if (bgEl) bgEl.style.backgroundImage = `url(${bg})`
  // Phaser text never redraws when a font arrives late, so load it before the game. Raced against 1.5 s:
  // document.fonts / FontFace.load() can stall in iOS WKWebView with data: URLs (AGENTS pitfall).
  const font = new FontFace(FONT, `url(${fontUrl})`)
  const fontReady = font.load().then((f) => document.fonts.add(f)).catch((e) => console.warn('[font]', e))
  await Promise.all([initMraid(), Promise.race([fontReady, new Promise((r) => setTimeout(r, 1500))])])

  const parent = document.createElement('div')
  parent.id = 'game'
  document.body.appendChild(parent)

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: true,
    scale: { mode: Phaser.Scale.NONE, width: DESIGN_W, height: DESIGN_H },
    render: { antialias: true, pixelArt: false },
    physics: { default: 'matter', matter: { gravity: { x: 0, y: 2.094 }, positionIterations: 20, velocityIterations: 10 } },
    scene: [BootScene, GameScene],
  })
  if (import.meta.env.DEV) (window as any).__game = game // test hook, stripped from builds
  game.events.once(Phaser.Core.Events.READY, () => {
    bindResponsiveResize(game)
    initAudio(game.canvas) // after Phaser's input listeners exist on the canvas
    bindLifecycle(game)
    notifyGameReady()
    if (PERF) startPerfHud(game)
  })
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
else boot()
