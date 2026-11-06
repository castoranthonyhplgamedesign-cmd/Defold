// Derived from baseline pile.ts and rng.ts; see docs/WORK_LOG.md.
const GAME={"SEED":1234,"BOARD_LEFT":108,"BOARD_RIGHT":972,"FLOOR_Y":1724,"CEILING_Y":303,"LINE_Y":535,"SPAWN_Y":422,"NEXT_X":890.5243317340644,"HUD_BOARD_TOP":55.36,"HUD_BOARD_SCALE":0.34955448937628514,"NEXT_Y":175.95629883481837,"NEXT_D":101.67840986977382,"BOARD_ALPHA":0.2,"RING_HOLE":16.36,"RING_PITCH":10.91,"MAX_RINGS":20,"CLEAR_RUN":9,"NEW_BALL_RINGS":3,"THROW_GAIN":0.5,"THROW_MAX":10,"THROW_IDLE_MS":90,"PULSE_SCALE":1.15,"PULSE_UP_MS":90,"PULSE_SETTLE_MS":320,"GRAB_PAD":40,"NEXT_TWO_CHANCE":0.25,"RANDOM_COLOR_CHANCE":0.25,"PILE_RUN":3,"PILE_SMALL":26,"PILE_BIG":9,"PILE_TWO":14,"PILE_SETTLE_STEPS":360,"STEP_MS":80,"CLEAR_POP_MS":65,"CLEAR_POP_MIN_MS":45,"MERGE_FX_COUNT":7,"MERGE_FX_TINTS":[16765471,16761856,16770140],"CLEAR_DELAY_MS":150,"BALL_MASS":1,"BALL_FRICTION":0.15,"BALL_FRICTION_STATIC":0.15,"BALL_FRICTION_AIR":0.01,"ROLL_DAMP":0.85,"LAND_SPEED":0.5,"LAND_STILL_MS":300,"LAND_MAX_MS":1200,"VIEW_INSET":1,"BOX_MASS":10,"RING_FLIGHT_MS":160,"RING_FLIGHT_ARC":24,"RING_FLIGHT_WIDTH":9.3,"CLEAR_FX_COUNT":10,"CLEAR_FX_GRAVITY":900,"BALL_RESTITUTION":0.32,"BALL_HIT_KICK":0.35,"BALL_HIT_MIN":2,"PILE_RESTITUTION":0.1,"PILE_SAME_COLOR_GAP":40,"INTRO_FALL_MS":650,"BOX_X":454,"BOX_W":160,"BOX_H":110,"FAIL_HOLD_SEC":2,"DANGER_WARN_LEVEL":0.34,"DROP_GRACE_MS":1200,"HAND_IDLE_SEC":3};
const RING_COLORS=[0xff2026,0x1469e4,0x18c908,0xffec16];
const ballRadius=(n:number)=>GAME.RING_HOLE+GAME.RING_PITCH*Math.max(n,1);
/** mulberry32 — seeded so the pile and ball colors are reproducible (reference uses the same generator). */
export function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rng = ReturnType<typeof makeRng>





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
