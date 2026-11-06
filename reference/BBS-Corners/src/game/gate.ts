import type { BoardState } from './board';
import type { BrickState, Cell, GateState } from './types';
import { doesBrickTouchGateAtOrigin } from './gateRelease';

export function canGateAccept(board: BoardState, gate: GateState, brick: BrickState): boolean {
  if (!brick.active || brick.color !== gate.color) return false;
  return doesBrickTouchGateAtOrigin(board, gate, brick, brick.origin);
}

export function normalizeGridDirection(direction: Cell): Cell {
  if (Math.abs(direction.x) >= Math.abs(direction.z)) {
    if (Math.abs(direction.x) < 0.0001) return { x: 0, z: 0 };
    return { x: direction.x >= 0 ? 1 : -1, z: 0 };
  }

  if (Math.abs(direction.z) < 0.0001) return { x: 0, z: 0 };
  return { x: 0, z: direction.z >= 0 ? 1 : -1 };
}
