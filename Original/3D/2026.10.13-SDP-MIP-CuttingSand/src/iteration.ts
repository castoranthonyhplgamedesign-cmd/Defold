import iterations from './iterations.json';
import { gameConfig } from './config';
import { UNLIMITED } from './constants';

export type Iteration = { length: string; clickLimit: number; timeLimit: number };

/** Build variants (dist/<length>/). build-all.mjs reads the same JSON. */
export const ITERATIONS = iterations as Iteration[];

function activeLimit(value: number): number {
  return Number.isFinite(value) && value > 0 && value < UNLIMITED ? Math.floor(value) : Infinity;
}

/** Counted gameplay pointerdowns before the automatic store redirect; Infinity when inactive. */
export function getClickLimit(): number {
  return activeLimit(gameConfig.GAME_LENGTH.clickLimit);
}

/** Seconds of play (from the first counted interaction) before the end card; Infinity when inactive. */
export function getTimeLimitSeconds(): number {
  return activeLimit(gameConfig.GAME_LENGTH.timeLimit);
}
