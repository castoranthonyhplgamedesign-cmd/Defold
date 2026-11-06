import type { BrickColor } from './colors';
import {
  BLOCK_VISUAL_CONFIG,
  GATE_GRINDER_CONFIG,
  GATE_VISUAL_CONFIG,
  SUBMISSION_VFX_CONFIG,
  type HeaderVariantKey,
} from '../constants';

export type Vec3Sizing = readonly [number, number, number];
export type Vec2Sizing = readonly [number, number];

export type GateAssetSizing = {
  rootScale: Vec3Sizing;
  modelPosition: Vec3Sizing;
};

export type BoardRootAssetSizing = {
  screenAnchor: Vec2Sizing;
  headerClearanceProbe: Vec3Sizing;
  headerGapPx: number;
  footerClearanceProbe: Vec3Sizing;
  footerGapPx: number;
  anchorPlaneY: number;
  portrait: {
    offset: Vec3Sizing;
  };
  landscape: {
    offset: Vec3Sizing;
  };
};

const DEFAULT_GATE_SIZING: GateAssetSizing = {
  rootScale: [1, 1, 1],
  modelPosition: [0, 0.02, 0],
};

const V1_BOARD_ROOT_SIZING = {
  screenAnchor: [0.5, 0.485],
  headerClearanceProbe: [0, 0, 8.35],
  headerGapPx: 3,
  footerClearanceProbe: [0, 0, -5.15],
  footerGapPx: 3,
  anchorPlaneY: 0,
  portrait: {
    offset: [0, 0, 0],
  },
  landscape: {
    offset: [0, 0, 0],
  },
} as const satisfies BoardRootAssetSizing;

const V2_BOARD_ROOT_SIZING = {
  screenAnchor: [0.5, 0.485],
  headerClearanceProbe: [0, 0, 8.35],
  headerGapPx: 3,
  footerClearanceProbe: [0, 0, -5.15],
  footerGapPx: 3,
  anchorPlaneY: 0,
  portrait: {
    offset: [0, 0, 0],
  },
  landscape: {
    offset: [0, 0, 0],
  },
} as const satisfies BoardRootAssetSizing;

export const ASSET_SIZING = {
  scene: {
    boardRoot: {
      v1: V1_BOARD_ROOT_SIZING,
      v2: V2_BOARD_ROOT_SIZING,
    } satisfies Record<HeaderVariantKey, BoardRootAssetSizing>,
  },
  board: {
    base: {
      position: [0.09, 0, 1.50],
      scale: [1, 1, 1],
    },
    borderOuter: {
      position: [0.09, -0.1, 1.35],
      scale: [1, 1, 1],
    },
    borderInside: {
      position: [0, -0.1, 2],
      scale: [1, 1, 1],
    },
  },
  bricks: {
    rootY: 0,
    modelY: 0,
    idleScale: [1, 1, 1],
    pickupY: 0.34,
    pickupScale: [1.05, 1.05, 1.05],
    pickupAnimationMs: 120,
    settleAnimationMs: 120,
    validDragY: 0.34,
    validDragScale: [1.05, 1.05, 1.05],
    invalidDragY: 0.42,
    invalidDragScale: [1.1, 1.1, 1.1],
    modelByKey: {
      tileShort: {
        scale: BLOCK_VISUAL_CONFIG.tileShort.scale,
      },
      tileLong: {
        scale: BLOCK_VISUAL_CONFIG.tileLong.scale,
      },
    },
    hitbox: {
      padding: 1.1,
      height: 0.75,
      y: 0.38,
      nearestCellDistanceSq: 0.72,
    },
    drag: {
      axisLockThresholdCells: 0.42,
      movementThresholdCells: 0.08,
      snapAmbiguityThresholdCells: 0.08,
      blockedEdgePaddingCells: 0,
      collisionHalfExtentCells: 0.47,
      followNearDistanceCells: 0.75,
      followFarDistanceCells: 3,
      followNearSpeedCellsPerSecond: 36,
      followFarSpeedCellsPerSecond: 26,
      followMaxSpeedCellsPerSecond: 18,
      sweepStepCells: 0.08,
      snapLateralThresholdCells: 0.72,
      maxGridSteps: 12,
    },
    boardPickPlaneY: 0.58,
    feedback: {
      blockedPulseScale: 1.12,
      rejectedPulseScale: 1.08,
    },
  },
  gates: {
    byColor: {
      Red: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Red.scale },
      Orange: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Orange.scale },
      Yellow: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Yellow.scale },
      Green: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Green.scale },
      Blue: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Blue.scale },
      Purple: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Purple.scale },
      Pink: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Pink.scale },
      Black: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.Black.scale },
      White: { ...DEFAULT_GATE_SIZING, rootScale: GATE_VISUAL_CONFIG.White.scale },
    } satisfies Record<BrickColor, GateAssetSizing>,
    rootRotationY: {
      top: Math.PI / 2,
      left: 0,
      right: Math.PI,
    },
    contact: {
      lateralToleranceCells: 0,
      forwardCells: 1,
    },
    feedback: {
      acceptedPulseScale: 1.18,
      rejectedPulseScale: 1.1,
      hintPulseScale: 1.1,
      selectionBounceY: 0.28,
      selectionBounceDurationMs: 260,
      grinder: GATE_GRINDER_CONFIG,
      submissionVfx: SUBMISSION_VFX_CONFIG,
    },
  },
} as const;

export function gateVisualName(color: BrickColor): string {
  return `gate-${color.toLowerCase()}`;
}
