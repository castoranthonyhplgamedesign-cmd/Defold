import { FIT } from '../constants'

let s = 1
let offX = 0
let offY = 0
let offHud = 0

/** w/h are internal canvas px (viewport × DPR). */
export function updateLayout(w: number, h: number) {
  s = Math.min(w / FIT.w, h / FIT.h)
  offX = (w - FIT.w * s) / 2 - FIT.x * s
  // Board bottom-anchored: pile sits on the screen's bottom edge. Spare height on tall screens is split evenly:
  // half above the HUD (blue bar, clears the iOS notch / Dynamic Island), half between the HUD and the spawn ball.
  offY = h - (FIT.y + FIT.h) * s
  offHud = (offY - FIT.y * s) / 2
}

export const sx = (x: number) => offX + x * s
export const sy = (y: number) => offY + y * s
/** Design y → canvas px for HUD chrome (see updateLayout). */
export const syHud = (y: number) => offHud + y * s
/** Design-px shift that puts a board-space object at a HUD-space y (≤ 0; 0 when nothing is spare). */
export const hudDy = () => (offHud - offY) / s
export const sd = (d: number) => d * s
/** Internal canvas px → design x (pointer input). */
export const ux = (x: number) => (x - offX) / s
/** Internal canvas px → design y (pointer input). */
export const uy = (y: number) => (y - offY) / s

export const RELAYOUT = 'relayout'

// ponytail: DPR capped at 2 for fill-rate on mid-range Android; raise if art looks soft on 3x screens.
const dpr = () => Math.min(window.devicePixelRatio || 1, 2)

function viewport() {
  const vv = window.visualViewport
  return { w: Math.round(vv?.width ?? window.innerWidth), h: Math.round(vv?.height ?? window.innerHeight) }
}

/**
 * Per-frame viewport poll (catches iOS rotation that fires no reliable event).
 * ponytail: no rAF debounce / 100-300-600ms retries — the per-frame poll already
 * re-checks every frame; add them if a host freezes the loop during rotation.
 */
export function bindResponsiveResize(game: Phaser.Game) {
  let lastKey = ''
  const check = () => {
    const { w, h } = viewport()
    const r = dpr()
    const key = `${w}x${h}@${r}`
    if (key === lastKey || w === 0 || h === 0) return
    lastKey = key
    // CSS size = viewport px, set before resize: Phaser's resize skips the style when zoom is 1 (DPR 1, e.g. DevTools
    // leaving device mode), which left the old CSS width. resize then reads these bounds for its pointer
    // displayScale. Never restyle the canvas after resize.
    game.canvas.style.width = `${w}px`
    game.canvas.style.height = `${h}px`
    game.scale.zoom = 1 / r
    game.scale.resize(w * r, h * r)
    updateLayout(w * r, h * r)
    game.events.emit(RELAYOUT)
  }
  check()
  game.events.on(Phaser.Core.Events.PRE_STEP, check)
  window.addEventListener('resize', check)
}
