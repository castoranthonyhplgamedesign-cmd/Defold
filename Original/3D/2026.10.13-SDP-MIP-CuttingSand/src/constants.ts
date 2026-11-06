export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1920;

// Fallbacks only; the runtime reads GAME_CONFIG.APP_LINKS first.
// No country or language in the link: the App Store opens the player's own storefront and language.
export const STORE_URL_IOS = 'https://apps.apple.com/app/sand-drop-color-puzzle/id6786642612';
export const STORE_URL_ANDROID = 'https://play.google.com/store/apps/details?id=com.fingersyoda.sanddrop&hl=en';

export const UNLIMITED = 9999;

/** Family name the bundled Nunito Black (the storyboard's UI font) is registered under at boot. */
export const GAME_FONT = 'NunitoBlack';

/** Root display-list depths (see the Depth Map in AGENTS.md). */
export const DEPTH = {
  BACKGROUND: 0,
  BELT: 1,
  // The belt's moving arrows: on the track, under the sand riding it.
  BELT_CHEVRON: 1.5,
  SAND: 2,
  FRAME: 3,
  BUCKETS: 4,
  BUCKET_CLEARED: 5,
  BUCKET_TEXT: 6,
  BELT_LABEL: 7,
  IMPACT: 8,
  HINT_RING: 9,
  HINT: 10,
  // The swipe trail (Cutting Sand); the hint's swipe guide line sits just under the hand.
  CUT_TRAIL: 11,
  PRAISE: 12,
  BUCKET_SPARKLE: 13,
  VIGNETTE: 15,
  ENDCARD_DIM: 30,
  ENDCARD_UI: 31,
  ENDCARD_SPARKLE: 32,
  ENDCARD_INPUT: 40
} as const;

/**
 * Design px per pixel of the storyboard's sliced art (Assets/Image/sdp_mip-cutting-sand-assets): the
 * sand painting is 849 px wide and 760 on screen; the belt and buckets share its scale.
 */
export const ART_SCALE = 760 / 849;
/** The mock-up shows the sand container a little larger than the other art (its strokes measured there). */
const CONTAINER_SCALE = 0.9163;

/**
 * Design-space (1080×1920) layout, measured 1:1 from the storyboard mock-up (Assets/Mock_Up, panel 1:
 * a 1080 × 1830 screen, centred here, so mock-up px map to design px × 2.065, +45 down), with the
 * sliced art placed as it appears there. The sand picture sits in the container's opening (its inner
 * glow covers the few px between them); four bucket rows, the last running off the bottom.
 */
export const LAYOUT = {
  // Top-left corner and width of the sand picture; its height follows the grain grid's aspect
  // (190 × 202 grains: 770 × 818, where the mock-up draws the painting, widened 4 px on the left so it
  // starts under the container's left stroke (no gap); its top edge is tucked under the top stroke).
  picture: { x: 155, y: 188.5, w: 770 },
  // The sand container art (902 × 1213 px), where the mock-up draws it.
  container: { x: 124.5, y: 178.9, w: 902 * CONTAINER_SCALE, h: 1213 * CONTAINER_SCALE },
  // Funnel walls of the grain grid, following the container's inner edge: straight sides down to
  // sideBottom, then 2:1 slopes to a mouth of ±mouthHalf at mouthY.
  frame: { sideBottom: 1070, mouthHalf: 27, mouthY: 1248 },
  // The sand canvas covers the container, the conveyor and the bucket openings, on the grain grid:
  // it starts 8 grains (of 770 / 190 px) left of the picture and spans 203 grains.
  sandArea: { x: 155 - (8 * 770) / 190, y: 188.5, w: (203 * 770) / 190, bottom: 1600 },
  // Conveyor: a stadium loop centred at (cx, cy); straight runs between x = cx ± half, track centre
  // line radius `radius` and width `track` (where sand rides), white rim `rim`, as in the belt art
  // (857 × 259 px; its track measured there, see BELT_ART in prepare-assets: centre line 18.5 px
  // above the image's centre, half 309.5, radius 63). Sand moves right along the top and left along
  // the bottom; `chevrons` arrows (the art's own, cut out) run round the track with it, always.
  belt: {
    cx: 540,
    cy: 1392 + 2.5 * ART_SCALE,
    half: 309.5 * ART_SCALE,
    radius: 63 * ART_SCALE,
    track: 65,
    rim: 10,
    artOffsetY: 18.5 * ART_SCALE,
    label: 44,
    chevrons: 25
  },
  // Buckets (art 145 × 118 px): four columns under the belt's bottom run, four rows (front row first;
  // the last only partly on screen, as in the mock-up). The count sits labelY × h below the bucket's
  // centre; its shadow shadowY × h below.
  buckets: { xs: [308, 463, 617, 772], ys: [1574, 1681, 1789, 1896], w: 145 * ART_SCALE, h: 118 * ART_SCALE, label: 38, labelY: 0.265, shadowY: 0.32, catchHalf: 46 },
  // finger.png trimmed (341×400): the fingertip sits at (tipX, tipY) of the image. The hand is tilted
  // by `angle` degrees so it reaches in from the lower right instead of covering the patch below.
  hand: { w: 190, h: 222, tipX: 0.5, tipY: 0.035, angle: -24 },
  hintRing: 110,
  // Tap shockwave ring and glow (design px at full size).
  impactRing: 230,
  impactGlow: 200,
  // Praise word over the picture after a big drop (width; height follows the word's aspect).
  praise: { x: 540, y: 598, w: 720 },
  // Storyboard end card: the Sand Drop logo, centred, over the overlay art (a flat 44, 44, 44 at 91 %).
  endcard: { logoX: 540, logoY: 960, logoW: 860 },
  dimColor: 0x2c2c2c,
  dimAlpha: 0.91
} as const;

export const TIMING = {
  // Fail (belt jammed) camera shake: duration (ms) and intensity (fraction of the screen per step).
  wrongShake: 260,
  wrongShakeIntensity: 0.005,
  // Belt jam: the red edge vignette rises to vignettePeak alpha over vignetteHold ms and stays
  // (storyboard fail state), under the fail end card.
  vignettePeak: 0.95,
  vignetteHold: 200,
  // A tapped patch crumbles outward from the tap: each grain waits tapRipple ms per grain of distance,
  // plus up to tapJitter ms. Sand that lost its support starts within dropJitter ms.
  tapRipple: 1.6,
  tapJitter: 60,
  dropJitter: 40,
  // Cutting Sand: the sand below a swipe starts falling within cutJitter ms. Audio follows actual
  // picture/funnel movement, with one short attack per stroke that releases sand.
  cutJitter: 50,
  // The swipe cuts like a disc of radius cutReach grains around the finger (17 grains, about 69 design
  // px wide; the trail's glow, CutTrail GLOW_WIDTH, matches it), and within cutEdgeSnap grains of the
  // picture's left or right edge it reaches the edge (no sliver left against the frame). Within
  // cutTopSnap grains of the picture's top (about 40 design px; the frame's top bar hides the first
  // rows) it cuts from the top row, so no hidden sliver is left hanging there.
  cutReach: 8,
  cutEdgeSnap: 10,
  cutTopSnap: 10,
  // Leftovers: once a colour of the current wave is down to leftoverShare of its sand in the picture
  // (at least leftoverGrains grains), the rest crumbles by itself after the player's cut, so stray
  // grains they can hardly see or reach never keep its buckets (and the next wave) waiting.
  leftoverShare: 0.015,
  leftoverGrains: 40,
  // Loose sand: fastest fall, grains per second (1.5 × the first build's, with SAND.gravity 2.25 ×
  // and BELT.speed 1.5 ×: the whole flow runs about 1.5 times faster).
  maxFallSpeed: 540,
  // Opening: the picture pours in bottom rows first (ms per row, plus up to introJitter ms), each
  // grain dropping in from above the frame at introSpeed grains/s plus gravity.
  introRow: 2.2,
  introJitter: 120,
  introSpeed: 260,
  // A drop of at least praiseShares[0] of the picture shakes the screen and shows a praise word;
  // the word steps up at the higher shares.
  praiseShares: [0.03, 0.1, 0.25],
  praiseWords: ['GREAT!', 'AWESOME!', 'AMAZING!'],
  bigDropShake: 180,
  bigDropShakeIntensity: 0.0035,
  // Bucket animations, as in the sand-shovel mock-up. Buckets rise into place (bucketRise ms, from
  // bucketRiseFrom design px below) and their lids pop off one by one, lidPop ms apart. A full
  // bucket stretches while its lid drops on (lidDrop), hops up to the belt and squashes with a flash
  // (bucketHop), then is flung off to the right, spinning (bucketFly); halfway through the fling the
  // next bucket of its column slides up into its place (bucketSlide) and takes its turn.
  lidDrop: 230,
  bucketHop: 150,
  bucketFly: 450,
  bucketSlide: 160,
  bucketRise: 300,
  bucketRiseFrom: 460,
  lidPop: 150,
  // Opening reveal (OPENING_STYLE "reveal", as in the sand-shovel mock-up): the grey picture turns to
  // colour in blocks of revealBlock × revealBlock grains: first a square revealSquare grains wide
  // sitting on revealFrom (fractions of the picture: the middle of its stripe/checker edge), held
  // revealHold ms, then a blocky circle around revealFrom growing to the farthest corner by revealMs.
  // The lids start popping lidPopAt ms into the opening.
  // The grey picture shows on its own for revealDelay ms first (the buckets rise and the lids pop
  // that much later too).
  revealDelay: 500,
  revealMs: 950,
  revealFrom: { x: 0.5, y: 0.75 },
  // 7-grain blocks: a chunky pixel-art circle (27 × 24 blocks over the picture); they line up with
  // the 21-grain stripes and cells, and the first square is one cell (3 × 3 blocks) on the lime stripe.
  revealBlock: 7,
  revealSquare: 21,
  revealHold: 70,
  lidPopAt: 600,
  // Tap and drop sounds play only once sand really falls: at least fallingMoves grain moves inside
  // the picture in one frame, within soundWindow ms of the tap (blocked sand stays silent).
  fallingMoves: 8,
  soundWindow: 400,
  // Fail: the belt must stay full with nothing matching a front bucket for this long (ms); longer
  // than a bucket swap (lid + hop + fly + slide), while which that column takes nothing.
  jamGrace: 2500,
  // Soft lock (BELT.stallSeconds): the mouth counts as no longer turned away after this long (ms)
  // without a refused grain (they retry every frame while it is).
  stallQuiet: 300,
  // Win: every bucket is full (all the sand is in them); the end card (and the store redirect right
  // before it) waits briefly (ms) after that.
  winEndcardDelay: 900,
  // Once the picture is cleared the rest of the sand drains into the buckets; if they are still not
  // all full after this long (ms; a safety net, it normally takes a few seconds), the game is won anyway.
  drainCap: 15000,
  // Once no static sand is left to tap, the sand, belt, buckets and their animations run this many
  // times as fast (whole steps per frame) until the end card: the player only waits for it to drain.
  fastForward: 2,
  // Fail: the end card (and the store redirect right before it) follows the jam by this long (ms).
  failEndcardDelay: 1000
} as const;
