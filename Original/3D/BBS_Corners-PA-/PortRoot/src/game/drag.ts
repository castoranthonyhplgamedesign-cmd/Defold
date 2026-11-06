import type { Cell } from './types';

export type DragAxis = 'x' | 'z';

export type DragBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type SlideDragConfig = {
  axisLockThresholdCells: number;
  movementThresholdCells: number;
  snapAmbiguityThresholdCells: number;
  blockedEdgePaddingCells: number;
  collisionHalfExtentCells?: number;
  followFarDistanceCells?: number;
  followFarSpeedCellsPerSecond?: number;
  followMaxSpeedCellsPerSecond?: number;
  followNearDistanceCells?: number;
  followNearSpeedCellsPerSecond?: number;
  sweepStepCells?: number;
  maxGridSteps: number;
};

export type SlideDragInput = {
  startOrigin: Cell;
  currentOrigin?: Cell;
  pointerOrigin: Cell;
  lockedAxis: DragAxis | null;
  config: SlideDragConfig;
  bounds?: DragBounds;
  brickRelativeCells?: readonly Cell[];
  canPlaceAtOrigin: (origin: Cell) => boolean;
};

export type SlideDragResult = {
  lockedAxis: DragAxis | null;
  direction: Cell;
  displayOrigin: Cell;
  candidateOrigin: Cell;
  dropOrigin: Cell;
  rawStep: number;
  dropStep: number;
  freeCells: number;
  isValid: boolean;
  moved: boolean;
};

export type DragDisplayInput = {
  startOrigin: Cell;
  pointerOrigin: Cell;
  slide: SlideDragResult;
  snapLateralThresholdCells: number;
};

export type DragFollowInput = {
  currentOrigin: Cell;
  targetOrigin: Cell;
  dt: number;
  config: SlideDragConfig;
};

const DEFAULT_BRICK_RELATIVE_CELLS: readonly Cell[] = [{ x: 0, z: 0 }];
const DEFAULT_COLLISION_HALF_EXTENT_CELLS = 0.5;
const DEFAULT_SWEEP_STEP_CELLS = 0.08;
const EPSILON = 0.0001;

export function resolveSlideDrag(input: SlideDragInput): SlideDragResult {
  const boundedPointerOrigin = clampOrigin(input.pointerOrigin, input.bounds);
  const brickRelativeCells = getBrickRelativeCells(input);
  const fallbackCurrentOrigin = clampOrigin(input.currentOrigin ?? input.startOrigin, input.bounds);
  const currentOrigin = isFractionalOriginValid(fallbackCurrentOrigin, input, brickRelativeCells)
    ? fallbackCurrentOrigin
    : clampOrigin(input.startOrigin, input.bounds);
  const displayOrigin = resolveContinuousDisplayOrigin(input, currentOrigin, boundedPointerOrigin, brickRelativeCells);
  const direction = {
    x: input.pointerOrigin.x - input.startOrigin.x,
    z: input.pointerOrigin.z - input.startOrigin.z,
  };
  const candidateOrigin = roundOrigin(displayOrigin);
  const snap = resolveClosestSnapOrigin({
    startOrigin: input.startOrigin,
    pointerOrigin: displayOrigin,
    config: input.config,
    bounds: input.bounds,
    brickRelativeCells,
    canPlaceAtOrigin: input.canPlaceAtOrigin,
  });
  const rawStep = distanceBetween(input.startOrigin, displayOrigin);
  const dropStep = distanceBetween(input.startOrigin, snap.origin);

  return {
    lockedAxis: null,
    direction,
    displayOrigin,
    candidateOrigin,
    dropOrigin: snap.origin,
    rawStep,
    dropStep,
    freeCells: input.config.maxGridSteps,
    isValid: snap.isValid,
    moved: rawStep >= input.config.movementThresholdCells,
  };
}

export function resolveDragDisplayOrigin(input: DragDisplayInput): Cell {
  return { ...input.slide.displayOrigin };
}

export function resolveDragFollowTarget(input: DragFollowInput): Cell {
  const dx = input.targetOrigin.x - input.currentOrigin.x;
  const dz = input.targetOrigin.z - input.currentOrigin.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  if (distance <= EPSILON) return { ...input.targetOrigin };

  const followSpeed = resolveDragFollowSpeed(input.config, distance);
  if (!Number.isFinite(followSpeed) || followSpeed <= 0) return { ...input.targetOrigin };

  const frameDt = Math.min(1 / 30, Math.max(input.dt, 1 / 120));
  const maxStep = followSpeed * frameDt;
  if (distance <= maxStep) return { ...input.targetOrigin };

  const amount = maxStep / distance;
  return {
    x: input.currentOrigin.x + dx * amount,
    z: input.currentOrigin.z + dz * amount,
  };
}

type SnapOriginInput = {
  startOrigin: Cell;
  pointerOrigin: Cell;
  config: SlideDragConfig;
  bounds?: DragBounds;
  brickRelativeCells: readonly Cell[];
  canPlaceAtOrigin: (origin: Cell) => boolean;
};

function resolveClosestSnapOrigin(input: SnapOriginInput): { origin: Cell; isValid: boolean } {
  const candidates = collectSnapCandidates(input.pointerOrigin, input.startOrigin)
    .filter((origin) => isWithinBounds(origin, input.bounds))
    .filter((origin) => input.canPlaceAtOrigin(origin))
    .filter((origin) => isFractionalOriginValid(origin, input, input.brickRelativeCells))
    .map((origin) => ({
      origin,
      distance: distanceBetween(origin, input.pointerOrigin),
    }))
    .sort((a, b) => a.distance - b.distance);

  const best = candidates[0];
  if (!best) return { origin: { ...input.startOrigin }, isValid: false };

  const second = candidates[1];
  if (second && second.distance - best.distance <= input.config.snapAmbiguityThresholdCells) {
    return { origin: { ...input.startOrigin }, isValid: true };
  }

  return { origin: best.origin, isValid: true };
}

function resolveDragFollowSpeed(config: SlideDragConfig, distance: number): number {
  const fallbackSpeed = config.followMaxSpeedCellsPerSecond ?? 18;
  const nearSpeed = config.followNearSpeedCellsPerSecond ?? fallbackSpeed;
  const farSpeed = config.followFarSpeedCellsPerSecond ?? fallbackSpeed;
  if (!Number.isFinite(nearSpeed) || !Number.isFinite(farSpeed)) return fallbackSpeed;

  const nearDistance = Math.max(0, config.followNearDistanceCells ?? 0.75);
  const farDistance = Math.max(nearDistance + EPSILON, config.followFarDistanceCells ?? 3);
  const t = smoothStep(clamp((distance - nearDistance) / (farDistance - nearDistance), 0, 1));
  return lerpNumber(nearSpeed, farSpeed, t);
}

function resolveContinuousDisplayOrigin(
  input: SlideDragInput,
  currentOrigin: Cell,
  desiredOrigin: Cell,
  brickRelativeCells: readonly Cell[],
): Cell {
  const deltaX = desiredOrigin.x - currentOrigin.x;
  const deltaZ = desiredOrigin.z - currentOrigin.z;
  const primaryAxis: DragAxis = Math.abs(deltaX) >= Math.abs(deltaZ) ? 'x' : 'z';
  const secondaryAxis: DragAxis = primaryAxis === 'x' ? 'z' : 'x';

  let origin = { ...currentOrigin };
  origin = moveAlongAxis(input, origin, desiredOrigin, primaryAxis, brickRelativeCells);
  origin = moveAlongAxis(input, origin, desiredOrigin, secondaryAxis, brickRelativeCells);
  return origin;
}

function moveAlongAxis(
  input: SlideDragInput,
  currentOrigin: Cell,
  desiredOrigin: Cell,
  axis: DragAxis,
  brickRelativeCells: readonly Cell[],
): Cell {
  const delta = desiredOrigin[axis] - currentOrigin[axis];
  if (Math.abs(delta) <= EPSILON) return currentOrigin;

  const direction = Math.sign(delta);
  const sweepStep = Math.max(EPSILON, input.config.sweepStepCells ?? DEFAULT_SWEEP_STEP_CELLS);
  let origin = { ...currentOrigin };
  let remaining = Math.abs(delta);

  while (remaining > EPSILON) {
    const step = Math.min(sweepStep, remaining) * direction;
    const next = {
      ...origin,
      [axis]: origin[axis] + step,
    };

    if (isFractionalOriginValid(next, input, brickRelativeCells)) {
      origin = next;
      remaining -= Math.abs(step);
      continue;
    }

    return findFurthestValidOrigin(input, origin, next, brickRelativeCells);
  }

  return origin;
}

function findFurthestValidOrigin(
  input: SlideDragInput,
  validOrigin: Cell,
  blockedOrigin: Cell,
  brickRelativeCells: readonly Cell[],
): Cell {
  let low = 0;
  let high = 1;

  for (let iteration = 0; iteration < 12; iteration++) {
    const mid = (low + high) * 0.5;
    const candidate = lerpOrigin(validOrigin, blockedOrigin, mid);
    if (isFractionalOriginValid(candidate, input, brickRelativeCells)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return lerpOrigin(validOrigin, blockedOrigin, low);
}

function isFractionalOriginValid(
  origin: Cell,
  input: Pick<SlideDragInput, 'bounds' | 'config' | 'canPlaceAtOrigin'>,
  brickRelativeCells: readonly Cell[],
): boolean {
  if (!isWithinBounds(origin, input.bounds)) return false;

  const halfExtent = clamp(
    input.config.collisionHalfExtentCells ?? DEFAULT_COLLISION_HALF_EXTENT_CELLS,
    EPSILON,
    DEFAULT_COLLISION_HALF_EXTENT_CELLS,
  );
  const checkedOrigins = new Set<string>();

  for (const relativeCell of brickRelativeCells) {
    const centerX = origin.x + relativeCell.x;
    const centerZ = origin.z + relativeCell.z;
    const minCellX = Math.ceil(centerX - halfExtent - 0.5 + EPSILON);
    const maxCellX = Math.floor(centerX + halfExtent + 0.5 - EPSILON);
    const minCellZ = Math.ceil(centerZ - halfExtent - 0.5 + EPSILON);
    const maxCellZ = Math.floor(centerZ + halfExtent + 0.5 - EPSILON);

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        const integerOrigin = {
          x: x - relativeCell.x,
          z: z - relativeCell.z,
        };
        const key = cellKey(integerOrigin);
        if (checkedOrigins.has(key)) continue;
        checkedOrigins.add(key);

        if (!input.canPlaceAtOrigin(integerOrigin)) return false;
      }
    }
  }

  return true;
}

function collectSnapCandidates(origin: Cell, startOrigin: Cell): Cell[] {
  const xCandidates = uniqueNumbers([Math.floor(origin.x), Math.ceil(origin.x), Math.round(origin.x)]);
  const zCandidates = uniqueNumbers([Math.floor(origin.z), Math.ceil(origin.z), Math.round(origin.z)]);
  const candidates: Cell[] = [];
  const seen = new Set<string>();

  for (const x of xCandidates) {
    for (const z of zCandidates) {
      addSnapCandidate(candidates, seen, { x, z });
    }
  }

  addSnapCandidate(candidates, seen, roundOrigin(startOrigin));
  return candidates;
}

function addSnapCandidate(candidates: Cell[], seen: Set<string>, origin: Cell): void {
  const key = cellKey(origin);
  if (seen.has(key)) return;
  seen.add(key);
  candidates.push(origin);
}

function getBrickRelativeCells(input: SlideDragInput): readonly Cell[] {
  return input.brickRelativeCells?.length ? input.brickRelativeCells : DEFAULT_BRICK_RELATIVE_CELLS;
}

function isWithinBounds(origin: Cell, bounds: DragBounds | undefined): boolean {
  if (!bounds) return true;

  return origin.x >= bounds.minX - EPSILON
    && origin.x <= bounds.maxX + EPSILON
    && origin.z >= bounds.minZ - EPSILON
    && origin.z <= bounds.maxZ + EPSILON;
}

function cellKey(origin: Cell): string {
  return `${origin.x},${origin.z}`;
}

function roundOrigin(origin: Cell): Cell {
  return {
    x: Math.round(origin.x),
    z: Math.round(origin.z),
  };
}

function clampOrigin(origin: Cell, bounds: DragBounds | undefined): Cell {
  if (!bounds) return { ...origin };

  return {
    x: clamp(origin.x, bounds.minX, bounds.maxX),
    z: clamp(origin.z, bounds.minZ, bounds.maxZ),
  };
}

function distanceBetween(a: Cell, b: Cell): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function lerpOrigin(a: Cell, b: Cell, amount: number): Cell {
  return {
    x: a.x + (b.x - a.x) * amount,
    z: a.z + (b.z - a.z) * amount,
  };
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)];
}

function lerpNumber(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

function clamp(value: number, min: number, max: number): number {
  if (min > max) return (min + max) * 0.5;
  return Math.min(max, Math.max(min, value));
}
