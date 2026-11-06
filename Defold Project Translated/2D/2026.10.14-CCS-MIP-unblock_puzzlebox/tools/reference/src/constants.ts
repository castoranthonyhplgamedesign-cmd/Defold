export const DESIGN_W = 1080
export const DESIGN_H = 1920

/**
 * Design-space box that must stay on screen: HUD chrome (y 42+) down to the floor (FLOOR_Y 1724), board width
 * plus a small gutter. Scaling fits this box instead of the full 1080×1920 so the board is as large as the
 * screen allows (like the reference); the HUD bar and CSS background simply extend past it.
 * Board is bottom-anchored (floor on the screen's bottom edge); the HUD sits halfway into any spare height; see responsive.ts.
 */
export const FIT = { x: 50, y: 30, w: 980, h: 1694 }

/** Registered at boot from the inlined (base64) OTF; see main.ts. */
export const FONT = 'HelveticaRoundedBold'

export const STORE_URL_IOS = 'https://apps.apple.com/us/app/circle-sort-ring-puzzle/id6743114220'
export const STORE_URL_ANDROID = 'https://play.google.com/store/apps/details?id=com.game5mobile.circlesort&hl=en'

// Adjust once the mockup defines the real layers.
export const DEPTH = {
  BG: 0,
  BOARD: 1,
  BALLS: 2,
  BOX: 3,
  ROPE: 4,
  PLAYER_BALL: 5,
  FX: 6,
  HAND: 7,
  HUD: 8,
  HUD_CONTENT: 9,
  DANGER: 10, // red fail-countdown vignette, over the HUD
  LOGO: 17,
  DIM: 20,
  FAIL_UI: 21,
  ENDCARD: 22,
} as const

/** Endcard dim (neutral near-black, sampled from the mockup endcard frame); the fail beat uses the same. */
export const DIM = { color: 0x1e1e1e, alpha: 0.9 } as const

// Prototype tuning. Geometry = reference playable scene converted at 1920/44 px per unit. Revisit when the mockup lands.
export const GAME = {
  SEED: 1234,
  BOARD_LEFT: 108, // wall inner edge, ref x -9.9
  BOARD_RIGHT: 972, // ref x 9.9
  FLOOR_Y: 1724, // ref y -18.83
  CEILING_Y: 303, // ref lid y 13.73 — keeps balls in the box
  LINE_Y: 535, // red "danger" rope, ref y 8.41
  SPAWN_Y: 422, // ref newCircleY 11
  NEXT_X: 890 + (277 - 275.5) * (510 / 1459), // NEXT white box center (art x 26-528 of 551) on the board centered at 890
  HUD_BOARD_TOP: 55.36, // design y of the GOAL and NEXT board tops (Hud.relayout)
  HUD_BOARD_SCALE: 510 / 1459, // shared art scale of the GOAL and NEXT boards (GOAL 510 px wide)
  NEXT_Y: 55.36 + 345 * (510 / 1459), // preview center: NEXT white box center (art row 345 of 598) at the shared scale
  NEXT_D: 0.72 * 404 * (510 / 1459), // preview diameter = 72% of the NEXT white box height (art 404 px → ~141 design px), any ring count
  BOARD_ALPHA: 0.2, // mockup: translucent white container (plain white art) between the walls, HUD down to screen bottom

  RING_HOLE: 16.36, // ref 0.375 u
  RING_PITCH: 10.91, // ref 0.25 u per ring
  MAX_RINGS: 20,
  CLEAR_RUN: 9, // outer same-color run that pops: 3 balls of 3 rings (GDD; 10 and 12 were tried)
  NEW_BALL_RINGS: 3,
  THROW_GAIN: 0.5, // share of the drag's sideways speed carried into the drop
  THROW_MAX: 10, // Matter px/step cap on the throw (≈ 600 design px/s)
  THROW_IDLE_MS: 90, // finger still this long before release = straight drop
  PULSE_SCALE: 1.15, // receiver / clearing ball pop (actual game)
  PULSE_UP_MS: 90,
  PULSE_SETTLE_MS: 320,
  GRAB_PAD: 40, // design px around the player ball that still counts as grabbing it
  NEXT_TWO_CHANCE: 0.25, // one in four drops is two-color; leaves room to recover on the full starting pile
  RANDOM_COLOR_CHANCE: 0.25, // favor exposed colors while keeping some off-color drops to break cycles
  PILE_RUN: 3, // rings per color in a starting ball
  // Client: start ~91% full. 26/9/14 settles in-game to 91.7% of the floor → red line height (pile top y ≈ 633, one
  // ball under the line; gift buried). Chaotic: counts are not monotonic, so measure any change in the running game.
  PILE_SMALL: 26, // starting single-color balls, 3 rings
  PILE_BIG: 9, // starting single-color balls, 6 rings (two drops clear them)
  PILE_TWO: 14, // starting two-color balls, 3 inner + 3 outer (two clears each: the hard part). Big + two are both 6 rings: trading one for the other keeps the settled pile identical
  PILE_SETTLE_STEPS: 360, // boot-time physics steps (6 s sim) to settle the pile before coloring
  STEP_MS: 80, // per-ring transfer stagger
  // Clear pop gap per ring = CLEAR_POP_MS × √(CLEAR_RUN / rings in the run), at least CLEAR_POP_MIN_MS. Totals with the
  // CLEAR_DELAY_MS pause: 9 rings 0.74 s, 12 → 0.83 s, 15 → 0.90 s, 18 → 0.98 s (bigger is faster per ring, never full speed).
  CLEAR_POP_MS: 65,
  CLEAR_POP_MIN_MS: 45, // floor: faster pop cues + bursts risk iPhone frame drops in chains
  MERGE_FX_COUNT: 7, // gold dashes per merge (emitted once, when the last ring lands)
  MERGE_FX_TINTS: [0xffd21f, 0xffc400, 0xffe45c], // bright gold yellows, picked at random per pill
  CLEAR_DELAY_MS: 150, // pause after reaching CLEAR_RUN so touching matches merge in visibly first

  // Gravity = ref (-48 u/s² = 2094 px/s², set in main.ts). Unlike the ref (mass 1 at any size, friction 0, no spin),
  // balls spin with some friction and weigh by volume so small dropped balls can't squeeze into the pile.
  BALL_MASS: 1, // mass of a 3-ring ball; others scale with radius³ (6-ring ≈ 4.6, 20-ring ≈ 109)
  BALL_FRICTION: 0.15, // with spin allowed, friction makes balls roll and settle instead of skating
  BALL_FRICTION_STATIC: 0.15, // ≈ kinetic: no extra grip on first touch (that grip felt like sticking)
  BALL_FRICTION_AIR: 0.01, // light drag so leftover jitter dies out
  ROLL_DAMP: 0.85, // per physics step spin kept: rolling resistance
  LAND_SPEED: 0.5, // a dropped ball stays frictionless until it is slower than this (px/step)...
  LAND_STILL_MS: 300, // ...for this long,
  LAND_MAX_MS: 1200, // or at most this long after the drop
  VIEW_INSET: 1, // design px the ring art is drawn inside its physics circle (hides solver penetration)
  BOX_MASS: 10, // ≈ two 6-ring balls: heavy enough to sink as balls clear (2 floated once balls weighed by volume)
  RING_FLIGHT_MS: 160, // one ring's flight from donor to receiver (rings leave every STEP_MS)
  RING_FLIGHT_ARC: 24, // design px the flying ring lifts mid-flight
  RING_FLIGHT_WIDTH: 9.3, // design px stroke of a flying ring (≈ one ring band, with a white highlight)
  CLEAR_FX_COUNT: 10, // ring-colored dots per popped ring
  CLEAR_FX_GRAVITY: 900, // design px/s²: dots fall
  BALL_RESTITUTION: 0.32, // dropped ball off floor/walls: ~70 px floor hop like the actual game footage
  BALL_HIT_KICK: 0.35, // extra rebound share off other balls while landing (the soft pile absorbs restitution)
  BALL_HIT_MIN: 2, // px/step approach speed below which a ball-on-ball hit gets no kick
  PILE_RESTITUTION: 0.1, // pile / spat balls (ref playable value), keeps the pile calm when a ball lands
  PILE_SAME_COLOR_GAP: 40, // design px: start balls closer than this never share an outer color

  INTRO_FALL_MS: 650, // ≈ free fall of the start offset under ref gravity
  BOX_X: 454, // box drop x; it settles with the pile

  BOX_W: 160,
  BOX_H: 110, // gift art aspect (art box 291×201 px at BOX_W 160)

  FAIL_HOLD_SEC: 2, // resting above the line this long = fail
  DANGER_WARN_LEVEL: 0.34, // warning floor while a landed ball is over the line: full rope glow, 4 Hz pulse + blip, no vignette
  DROP_GRACE_MS: 1200,
  HAND_IDLE_SEC: 3,
} as const
