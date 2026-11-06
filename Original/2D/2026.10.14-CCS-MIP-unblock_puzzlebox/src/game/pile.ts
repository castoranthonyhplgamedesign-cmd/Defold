import { GAME } from '../constants'
import { RING_COLORS, ballRadius } from './RingArt'
import type { Rng } from './rng'

/** small = one color × PILE_RUN, big = one color × 2·PILE_RUN, two = PILE_RUN inner + PILE_RUN outer (2 colors). */
type Kind = 'small' | 'big' | 'two'

export type PileSlot = { x: number; y: number; n: number; two: boolean }

/**
 * Starting balls (mockup mix: mostly small singles, some big singles and two-color balls), shuffled and
 * shelf-packed upward from the floor. The caller settles them with physics, then colors them with colorPile().
 */
export function pileSlots(rng: Rng): PileSlot[] {
  const { BOARD_LEFT: L, BOARD_RIGHT: R, FLOOR_Y: F, PILE_RUN: run } = GAME
  const kinds: Kind[] = []
  for (let i = 0; i < GAME.PILE_SMALL; i++) kinds.push('small')
  for (let i = 0; i < GAME.PILE_BIG; i++) kinds.push('big')
  for (let i = 0; i < GAME.PILE_TWO; i++) kinds.push('two')
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[kinds[i], kinds[j]] = [kinds[j], kinds[i]]
  }

  const out: PileSlot[] = []
  let x = L
  let y = F
  let rowH = 0
  for (const kind of kinds) {
    const n = kind === 'small' ? run : run * 2
    const r = ballRadius(n)
    if (x + 2 * r > R) {
      x = L
      y -= rowH + 2
      rowH = 0
    }
    out.push({ x: x + r, y: y - r, n, two: kind === 'two' })
    x += 2 * r + rng() * 24 // jitter so the settled pile is loose, not a grid
    rowH = Math.max(rowH, 2 * r)
  }
  return out
}

type PileBall = { x: number; y: number; radius: number; rings: number[] }

/**
 * Colors a settled pile in place. Balls closer than PILE_SAME_COLOR_GAP never share an outer color (they would
 * merge on the first frame, or as soon as a landing ball jostles the pile); ring totals per color are kept as even as possible.
 */
export function colorPile(items: { ball: PileBall; two: boolean }[], rng: Rng) {
  const run = GAME.PILE_RUN
  const order = items.slice().sort((a, b) => b.ball.y - a.ball.y)
  // Greedy can paint itself into a corner where a ball touches all 4 colors; retry with new tie-breaks.
  for (let attempt = 0; attempt < 50; attempt++) {
    if (colorOnce(order, run, rng) === 0) return
  }
  console.warn('[pile] no conflict-free coloring found; some start balls will merge')
}

function colorOnce(order: { ball: PileBall; two: boolean }[], run: number, rng: Rng) {
  const used = RING_COLORS.map(() => 0)
  // Least-used allowed color; random tie-break.
  const pick = (allowed: (c: number) => boolean) => {
    let best = -1
    let ties = 0
    for (let c = 0; c < used.length; c++) {
      if (!allowed(c)) continue
      if (best < 0 || used[c] < used[best]) (best = c), (ties = 1)
      else if (used[c] === used[best] && rng() < 1 / ++ties) best = c
    }
    return best
  }

  let conflicts = 0
  for (let i = 0; i < order.length; i++) {
    const b = order[i].ball
    const banned = new Set<number>()
    for (let j = 0; j < i; j++) {
      const o = order[j].ball
      if (Math.hypot(o.x - b.x, o.y - b.y) < o.radius + b.radius + GAME.PILE_SAME_COLOR_GAP) banned.add(o.rings[o.rings.length - 1])
    }
    let outer = pick((c) => !banned.has(c))
    if (outer < 0) {
      conflicts++
      outer = pick(() => true)
    }
    const inner = order[i].two ? pick((c) => c !== outer) : outer
    for (let k = 0; k < b.rings.length; k++) {
      b.rings[k] = order[i].two && k < run ? inner : outer
      used[b.rings[k]]++
    }
  }
  return conflicts
}
