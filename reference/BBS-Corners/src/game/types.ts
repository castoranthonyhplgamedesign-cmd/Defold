import type { BrickColor } from '../data/colors';

export type Cell = {
  x: number;
  z: number;
};

export type Vec3Tuple = [number, number, number];

export type GridSlotState = Cell & {
  id: string;
  world: Vec3Tuple;
  occupyingBrickId: string | null;
};

export type BrickState = {
  id: string;
  color: BrickColor;
  origin: Cell;
  cells: Cell[];
  active: boolean;
  meshKey: string;
};

export type GateState = {
  id: string;
  color: BrickColor;
  position: Vec3Tuple;
  acceptDirection: Vec3Tuple;
  gateSlotIds: string[];
  vfxPosition: Vec3Tuple;
};

export type SceneManifest = {
  gridSlots: GridSlotState[];
  bricks: BrickState[];
  gates: GateState[];
};

export type HintCandidate = {
  hintBrickId: string;
  targetBrickId: string;
  targetGateId: string;
  direction: Cell;
};
