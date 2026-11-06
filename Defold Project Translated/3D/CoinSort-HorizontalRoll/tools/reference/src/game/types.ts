import type { CoinColorType } from '../constants';

export type ViewTransform = {
  zoom: number;
  x: (worldX: number) => number;
  y: (worldY: number) => number;
  d: (worldValue: number) => number;
};

export type CoinFlyRequest = {
  x: number;
  y: number;
  depth: number;
  colorType: CoinColorType | null;
  displayWidth: number;
  displayHeight: number;
  angle: number;
  alpha: number;
  dimAmount: number;
};
