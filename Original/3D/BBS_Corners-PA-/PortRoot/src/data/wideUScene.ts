import type { BrickColor } from './colors';
import type { BrickState, GateState, GridSlotState, SceneManifest } from '../game/types';
import { GATE_VISUAL_CONFIG, type Vec3Constant } from '../constants';

const COLUMNS = [-3, -2, -1, 0, 1, 2, 3] as const;
const ROWS = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7] as const;
export const WIDE_U_CENTER_OPENING = {
  minX: -1,
  maxX: 1,
  minZ: -1,
  maxZ: 5,
} as const;

const BOTTOM_COLORS: BrickColor[] = ['Blue', 'Green', 'Orange', 'Purple', 'Yellow', 'Red', 'Pink'];
const TOP_GATE_COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink'] as const satisfies readonly BrickColor[];

type NeutralBrickColor = Extract<BrickColor, 'Black' | 'White'>;
type NeutralRowCell = NeutralBrickColor | null;

const NEUTRAL_ROWS: Array<{ z: number; cells: readonly NeutralRowCell[] }> = [
  { z: -2, cells: ['Black', 'White', 'Black', 'White', 'Black', 'White', 'Black'] },
  { z: -1, cells: ['White', 'Black', null, null, null, 'Black', 'White'] },
  { z: 0, cells: ['Black', 'White', null, null, null, 'White', 'Black'] },
  { z: 1, cells: ['White', 'Black', null, null, null, 'Black', 'White'] },
  { z: 2, cells: ['Black', 'White', null, null, null, 'White', 'Black'] },
  { z: 3, cells: ['White', 'Black', null, null, null, 'Black', 'White'] },
  { z: 4, cells: ['Black', 'White', null, null, null, 'White', 'Black'] },
  { z: 5, cells: ['White', 'Black', null, null, null, 'Black', 'White'] },
  { z: 6, cells: ['Black', 'White', 'Black', 'White', 'Black', 'White', 'Black'] },
  { z: 7, cells: ['White', 'Black', 'White', 'Black', 'White', 'Black', 'White'] },
];

export const wideUScene: SceneManifest = {
  gridSlots: createGridSlots(),
  bricks: createBricks(),
  gates: createGates(),
};

export function isWideUCenterOpeningCell(x: number, z: number): boolean {
  return x >= WIDE_U_CENTER_OPENING.minX
    && x <= WIDE_U_CENTER_OPENING.maxX
    && z >= WIDE_U_CENTER_OPENING.minZ
    && z <= WIDE_U_CENTER_OPENING.maxZ;
}

function createGridSlots(): GridSlotState[] {
  const slots: GridSlotState[] = [];
  for (const z of ROWS) {
    for (const x of COLUMNS) {
      if (isWideUCenterOpeningCell(x, z)) continue;

      slots.push({
        id: slotId(x, z),
        x,
        z,
        world: [x, 0, z],
        occupyingBrickId: null,
      });
    }
  }
  return slots;
}

function createBricks(): BrickState[] {
  const bricks: BrickState[] = [];

  BOTTOM_COLORS.forEach((color, index) => {
    const x = COLUMNS[index];
    bricks.push({
      id: `brick_${color.toLowerCase()}_start`,
      color,
      origin: { x, z: -4 },
      cells: [
        { x, z: -4 },
        { x, z: -3 },
      ],
      active: true,
      meshKey: 'brick_1x2',
    });
  });

  for (const row of NEUTRAL_ROWS) {
    row.cells.forEach((color, index) => {
      if (!color) return;

      const x = COLUMNS[index];
      bricks.push({
        id: `brick_${color.toLowerCase()}_${x}_${row.z}`,
        color,
        origin: { x, z: row.z },
        cells: [{ x, z: row.z }],
        active: true,
        meshKey: 'brick_1x1',
      });
    });
  }

  return bricks;
}

function createGates(): GateState[] {
  const gates: GateState[] = TOP_GATE_COLORS.map((color, index) => {
    const x = COLUMNS[index];
    const gateVisual = GATE_VISUAL_CONFIG[color];
    return {
      id: `gate_${color.toLowerCase()}`,
      color,
      position: vec3(gateVisual.position),
      acceptDirection: [0, 0, 1],
      gateSlotIds: [slotId(x, 6), slotId(x, 7)],
      vfxPosition: vec3(gateVisual.vfxPosition),
    };
  });

  gates.push(
    {
      id: 'gate_white_left',
      color: 'White',
      position: vec3(GATE_VISUAL_CONFIG.White.position),
      acceptDirection: [-1, 0, 0],
      gateSlotIds: [slotId(-3, 1)],
      vfxPosition: vec3(GATE_VISUAL_CONFIG.White.vfxPosition),
    },
    {
      id: 'gate_black_right',
      color: 'Black',
      position: vec3(GATE_VISUAL_CONFIG.Black.position),
      acceptDirection: [1, 0, 0],
      gateSlotIds: [slotId(3, 2)],
      vfxPosition: vec3(GATE_VISUAL_CONFIG.Black.vfxPosition),
    },
  );

  return gates;
}

function slotId(x: number, z: number): string {
  return `slot_${x}_${z}`;
}

function vec3(value: Vec3Constant): [number, number, number] {
  return [value[0], value[1], value[2]];
}
