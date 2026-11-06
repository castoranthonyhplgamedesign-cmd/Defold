import type { BoardState } from './board';
import type { BrickState, Cell, GateState, GridSlotState } from './types';
import { ASSET_SIZING } from '../data/assetSizing';

export function findTouchedGateAtOrigin(
  board: BoardState,
  gates: GateState[],
  brick: BrickState,
  origin: Cell,
  sameColorOnly = true,
): GateState | null {
  if (!brick.active) return null;

  for (const gate of gates) {
    if (sameColorOnly && gate.color !== brick.color) continue;
    if (doesBrickTouchGateAtOrigin(board, gate, brick, origin)) return gate;
  }

  return null;
}

export function doesBrickTouchGateAtOrigin(
  board: BoardState,
  gate: GateState,
  brick: BrickState,
  origin: Cell,
): boolean {
  const direction = getGateDirection(gate);
  if (direction.x === 0 && direction.z === 0) return false;

  const gateSlots = gate.gateSlotIds
    .map((id) => board.getSlotById(id))
    .filter((slot): slot is GridSlotState => Boolean(slot));
  if (gateSlots.length === 0) return false;

  const contactSlots = getGateContactSlots(gateSlots, direction);
  const dx = origin.x - brick.origin.x;
  const dz = origin.z - brick.origin.z;
  for (const cell of brick.cells) {
    const candidate = {
      x: cell.x + dx,
      z: cell.z + dz,
    };

    if (contactSlots.some((slot) => isTouchingGateFace(candidate, slot, direction))) return true;
  }

  return false;
}

function getGateDirection(gate: GateState): Cell {
  return {
    x: Math.sign(gate.acceptDirection[0]),
    z: Math.sign(gate.acceptDirection[2]),
  };
}

function getGateContactSlots(slots: GridSlotState[], direction: Cell): GridSlotState[] {
  const bestProjection = Math.max(...slots.map((slot) => projectAlongGate(slot, direction)));
  return slots.filter((slot) => projectAlongGate(slot, direction) === bestProjection);
}

function isTouchingGateFace(candidate: Cell, slot: GridSlotState, direction: Cell): boolean {
  const lateralDelta = direction.x !== 0
    ? Math.abs(candidate.z - slot.z)
    : Math.abs(candidate.x - slot.x);
  if (lateralDelta > ASSET_SIZING.gates.contact.lateralToleranceCells) return false;

  const forwardOffset = projectAlongGate(candidate, direction) - projectAlongGate(slot, direction);
  return forwardOffset >= 0 && forwardOffset <= ASSET_SIZING.gates.contact.forwardCells;
}

function projectAlongGate(cell: Cell, direction: Cell): number {
  return cell.x * direction.x + cell.z * direction.z;
}
