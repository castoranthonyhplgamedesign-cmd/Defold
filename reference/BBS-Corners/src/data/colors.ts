export const BRICK_COLORS = [
  'Red',
  'Green',
  'Blue',
  'Yellow',
  'Orange',
  'Purple',
  'Pink',
  'Black',
  'White',
] as const;

export type BrickColor = (typeof BRICK_COLORS)[number];
export type ColoredBrickColor = Exclude<BrickColor, 'Black' | 'White'>;

export const COLORED_BRICK_COLORS = BRICK_COLORS.filter(isColoredBrickColor) as ColoredBrickColor[];

export function isColoredBrickColor(color: BrickColor): color is ColoredBrickColor {
  return color !== 'Black' && color !== 'White';
}

export const COLOR_HEX: Record<BrickColor, string> = {
  Red: '#fd474b',
  Green: '#46d154',
  Blue: '#3169fe',
  Yellow: '#f1ca3a',
  Orange: '#fd7a39',
  Purple: '#a950f2',
  Pink: '#fe649f',
  Black: '#34373b',
  White: '#f5f7f8',
};
