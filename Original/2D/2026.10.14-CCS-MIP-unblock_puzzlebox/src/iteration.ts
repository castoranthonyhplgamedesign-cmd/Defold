export type Variant = '3clk' | '10clk' | '60sec'

declare const __VARIANT__: Variant

const ITERATIONS: Record<Variant, { clickLimit: number; timeLimitSec: number }> = {
  '3clk': { clickLimit: 3, timeLimitSec: Infinity },
  '10clk': { clickLimit: 10, timeLimitSec: Infinity },
  '60sec': { clickLimit: Infinity, timeLimitSec: 60 },
}

// Dev only: ?variant=3clk in the URL overrides the build variant (dropped from builds: DEV is false there).
const devVariant = import.meta.env.DEV ? (new URLSearchParams(location.search).get('variant') as Variant | null) : null
export const VARIANT: Variant = devVariant && devVariant in ITERATIONS ? devVariant : __VARIANT__
if (import.meta.env.DEV) console.log('[variant]', VARIANT, ITERATIONS[VARIANT])
export const ITERATION = ITERATIONS[VARIANT]

declare const __HUD__: boolean
/** HUD build: restart button (replays the board) + GOAL board shown. Dev: on by default, ?hud=0 hides it. */
const devHud = import.meta.env.DEV ? new URLSearchParams(location.search).get('hud') : null
export const HUD = devHud !== null ? devHud !== '0' : __HUD__
