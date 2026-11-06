/**
 * Shared rhythm for every idle loop (hand tap, target breathing, SUBMIT pulse, dot ripples, hint
 * bubble breathing). All of them read one clock instead of running their own tweens, so they
 * stay in phase with each other; anything that appears mid-cycle simply joins in.
 */
export const BEAT_CYCLE_MS = 1040;

/** 0..1 position in the shared cycle; 0 = hand lifted, 0.5 = fingertip pressed. */
export function beatPhase(now: number): number {
  return (now % BEAT_CYCLE_MS) / BEAT_CYCLE_MS;
}

/** Sine-shaped press amount: 0 at phase 0 (lifted), 1 at phase 0.5 (pressed). */
export function pressAmount(phase: number): number {
  return 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
}

/** Time since the last press, as 0..1 of a cycle (for effects that start on the press). */
export function sincePress(phase: number): number {
  return (phase + 0.5) % 1;
}
