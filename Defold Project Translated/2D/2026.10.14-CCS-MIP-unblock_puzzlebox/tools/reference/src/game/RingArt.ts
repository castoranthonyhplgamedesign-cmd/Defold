import { GAME } from '../constants'
import ringAtlas from '../../Assets/images/ring_atlas.json'

/** red, blue, green, yellow — index = ring color id. */
export const RING_COLORS = [0xff2026, 0x1469e4, 0x18c908, 0xffec16]

const TAU = Math.PI * 2

export const ballRadius = (rings: number) => GAME.RING_HOLE + GAME.RING_PITCH * Math.max(rings, 1)

if (import.meta.env.DEV && (ringAtlas.hole !== GAME.RING_HOLE || ringAtlas.pitch !== GAME.RING_PITCH || ringAtlas.count !== GAME.MAX_RINGS)) {
  console.warn('[RingArt] ring_atlas geometry differs from GAME: rerun scripts/export-ring-atlas.mjs')
}

let warnedMissing = false

/** Shadow + dark base per ring count, drawn once (gradient + clips were the costly part of every redraw). */
const underlays: HTMLCanvasElement[] = []
function underlay(n: number) {
  if (underlays[n]) return underlays[n]
  const R = ballRadius(n)
  const pitch = GAME.RING_PITCH
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.ceil(R + 10) * 2
  const ctx = canvas.getContext('2d', { willReadFrequently: true })! // CPU-backed: blitted into CPU ball canvases
  const c = canvas.width / 2
  // Clip the shadow out of the hole, including its soft edge.
  ctx.beginPath()
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.arc(c, c, GAME.RING_HOLE, 0, TAU, true)
  ctx.clip('evenodd')
  // Soft drop shadow as a radial gradient (shadowBlur cost ~3 ms per big ball on a CPU canvas).
  const blur = pitch * 0.45
  const sy = c + pitch * 0.28
  const shadow = ctx.createRadialGradient(c, sy, R - blur, c, sy, R + blur)
  shadow.addColorStop(0, 'rgba(40,15,65,0.25)')
  shadow.addColorStop(1, 'rgba(40,15,65,0)')
  ctx.fillStyle = shadow
  ctx.beginPath()
  ctx.arc(c, sy, R + blur, 0, TAU)
  ctx.fill()
  // Dark base under the rings: shows as a thin groove where two color runs meet. It stops short of the
  // hole, otherwise it shows through the art's anti-aliased inner edge as a black rim.
  ctx.fillStyle = 'rgb(40,15,65)'
  ctx.beginPath()
  ctx.arc(c, c, R - pitch * 0.12, 0, TAU)
  ctx.arc(c, c, GAME.RING_HOLE + pitch * 0.25, 0, TAU, true)
  ctx.fill()
  return (underlays[n] = canvas)
}

/**
 * Copies generated ring artwork from the four-color atlas, innermost first.
 * `atlas` null (failed load) falls back to flat RING_COLORS so the board stays playable.
 */
export function drawBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, rings: number[], atlas: CanvasImageSource | null) {
  if (!rings.length) return
  if (!atlas && !warnedMissing) {
    warnedMissing = true
    console.warn('[RingArt] ring_atlas missing: drawing flat ring colors')
  }
  const pitch = GAME.RING_PITCH
  const under = underlay(rings.length)
  ctx.drawImage(under, cx - under.width / 2, cy - under.height / 2)
  ctx.save()

  const tile = ringAtlas.tileSize
  for (let i = 0; i < rings.length; ) {
    const color = rings[i]
    let j = i + 1
    while (j < rings.length && rings[j] === color) j++
    // One clip per same-color run: the atlas tile already holds the grooves between its bands.
    const rIn = GAME.RING_HOLE + pitch * i
    const rOut = GAME.RING_HOLE + pitch * j
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, rOut, 0, TAU)
    ctx.arc(cx, cy, rIn, 0, TAU, true)
    ctx.clip()
    if (atlas) {
      // Copy only the run's bounding square; the tile has every band at its real design-px radius.
      const h = Math.min(tile / 2, Math.ceil(rOut) + 1)
      ctx.drawImage(atlas, (color % 2) * tile + tile / 2 - h, Math.floor(color / 2) * tile + tile / 2 - h, 2 * h, 2 * h,
        cx - h, cy - h, 2 * h, 2 * h)
    } else {
      ctx.fillStyle = '#' + RING_COLORS[color].toString(16).padStart(6, '0')
      ctx.fill()
    }
    ctx.restore()
    i = j
  }
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Placeholder gift box until the mockup art arrives. Canvas is (w, h + bow). */
export function drawGift(ctx: CanvasRenderingContext2D, w: number, h: number, bow: number) {
  const top = bow
  const body = ctx.createLinearGradient(0, top, w, top + h)
  body.addColorStop(0, '#4fb4ff')
  body.addColorStop(1, '#1f5fe0')
  ctx.fillStyle = body
  roundRect(ctx, 6, top + h * 0.22, w - 12, h * 0.78, 14)
  ctx.fill()
  ctx.fillStyle = '#2b78f0'
  roundRect(ctx, 0, top, w, h * 0.28, 12)
  ctx.fill()

  ctx.fillStyle = '#ffd23a'
  ctx.fillRect(w / 2 - 14, top, 28, h)
  ctx.fillRect(0, top + h * 0.1, w, 22)

  ctx.fillStyle = '#ffbf1f'
  for (const dir of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(w / 2 + dir * 30, top - 4, 34, 22, dir * -0.5, 0, TAU)
    ctx.fill()
  }
  ctx.fillStyle = '#ffe07a'
  ctx.beginPath()
  ctx.arc(w / 2, top, 14, 0, TAU)
  ctx.fill()
}
