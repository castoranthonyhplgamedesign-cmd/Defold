import type { Rgb } from '../config';
import { SHADES } from './sandGrid';

/**
 * Brightness of static grains in the picture's last rows, bottom row first (the storyboard mock-up's
 * shaded bottom edge: about 40 % for its last few px, then a quick fade back).
 */
export const BOTTOM_SHADE = [0.4, 0.44, 0.66];
/** Brightness of static grains in the picture's first rows, top row first (the frame's shadow on the sand). */
export const TOP_SHADE = [0.25, 0.45, 0.6, 0.8, 0.9];

/**
 * Packed ABGR (little-endian RGBA bytes) for every palette value × shade, scaled by `brightness`.
 * Index: palette value × SHADES + shade; `grainShade` (0..1 of full range) spreads the shades.
 */
export function buildLut(palette: Rgb[], grainShade: number, brightness: number): Uint32Array {
  const lut = new Uint32Array((palette.length + 1) * SHADES);
  const amplitude = Math.max(0, Math.min(1, grainShade)) * 255;
  for (let c = 0; c < palette.length; c++) {
    for (let s = 0; s < SHADES; s++) {
      const offset = ((s / (SHADES - 1)) * 2 - 1) * amplitude;
      const r = clampByte((palette[c][0] + offset) * brightness);
      const g = clampByte((palette[c][1] + offset) * brightness);
      const b = clampByte((palette[c][2] + offset) * brightness);
      lut[(c + 1) * SHADES + s] = ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }
  }
  return lut;
}

/**
 * Edge brightness at a row `rows` grains tall picture, measured in grains from the top (fractional
 * rows interpolate between the shade steps): the darker of the top and bottom shading, 1 inside.
 */
export function edgeBrightness(rowFromTop: number, rows: number): number {
  const fromBottom = rows - 1 - rowFromTop;
  return Math.min(sample(TOP_SHADE, rowFromTop), sample(BOTTOM_SHADE, fromBottom));
}

function sample(steps: number[], at: number): number {
  if (at <= 0) {
    return steps[0];
  }
  if (at >= steps.length) {
    return 1;
  }
  const i = Math.floor(at);
  const next = i + 1 < steps.length ? steps[i + 1] : 1;
  return steps[i] + (next - steps[i]) * (at - i);
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
