import type { BrickState, Cell, GridSlotState, SceneManifest } from './types';
import { isColoredBrickColor } from '../data/colors';

export class BoardState {
  private readonly slots = new Map<string, GridSlotState>();
  private readonly slotsByCell = new Map<string, GridSlotState>();
  private readonly bricks = new Map<string, BrickState>();

  constructor(manifest: SceneManifest) {
    for (const slot of manifest.gridSlots) {
      const copy = { ...slot };
      this.slots.set(copy.id, copy);
      this.slotsByCell.set(cellKey(copy), copy);
    }

    for (const brick of manifest.bricks) {
      this.bricks.set(brick.id, { ...brick, cells: brick.cells.map((cell) => ({ ...cell })) });
      if (brick.active) this.occupyBrick(brick.id);
    }
  }

  getBrick(id: string): BrickState | undefined {
    return this.bricks.get(id);
  }

  getActiveBricks(): BrickState[] {
    return [...this.bricks.values()].filter((brick) => brick.active);
  }

  getActiveBrickCount(): number {
    return this.getActiveBricks().length;
  }

  getActiveColoredBrickCount(): number {
    return this.getActiveBricks().filter((brick) => isColoredBrickColor(brick.color)).length;
  }

  areAllColoredBricksCleared(): boolean {
    return this.getActiveColoredBrickCount() === 0;
  }

  getAllSlots(): GridSlotState[] {
    return [...this.slots.values()];
  }

  getSlotById(id: string): GridSlotState | undefined {
    return this.slots.get(id);
  }

  getSlotAt(cell: Cell): GridSlotState | undefined {
    return this.slotsByCell.get(cellKey(cell));
  }

  canMove(brickId: string, direction: Cell, cellsToMove = 1): boolean {
    const brick = this.bricks.get(brickId);
    if (!brick || !brick.active) return false;

    for (const cell of brick.cells) {
      const target = {
        x: cell.x + direction.x * cellsToMove,
        z: cell.z + direction.z * cellsToMove,
      };
      const slot = this.getSlotAt(target);
      if (!slot) return false;
      if (slot.occupyingBrickId && slot.occupyingBrickId !== brickId) return false;
    }

    return true;
  }

  moveBrick(brickId: string, direction: Cell, cellsToMove = 1): boolean {
    if (!this.canMove(brickId, direction, cellsToMove)) return false;

    const brick = this.bricks.get(brickId);
    if (!brick) return false;

    this.clearBrick(brickId);
    brick.origin.x += direction.x * cellsToMove;
    brick.origin.z += direction.z * cellsToMove;
    for (const cell of brick.cells) {
      cell.x += direction.x * cellsToMove;
      cell.z += direction.z * cellsToMove;
    }
    this.occupyBrick(brickId);
    return true;
  }

  canPlaceBrickAtOrigin(brickId: string, origin: Cell): boolean {
    const brick = this.bricks.get(brickId);
    if (!brick || !brick.active) return false;

    const dx = origin.x - brick.origin.x;
    const dz = origin.z - brick.origin.z;
    for (const cell of brick.cells) {
      const target = {
        x: cell.x + dx,
        z: cell.z + dz,
      };
      const slot = this.getSlotAt(target);
      if (!slot) return false;
      if (slot.occupyingBrickId && slot.occupyingBrickId !== brickId) return false;
    }

    return true;
  }

  moveBrickToOrigin(brickId: string, origin: Cell): boolean {
    if (!this.canPlaceBrickAtOrigin(brickId, origin)) return false;

    const brick = this.bricks.get(brickId);
    if (!brick) return false;

    const dx = origin.x - brick.origin.x;
    const dz = origin.z - brick.origin.z;
    this.clearBrick(brickId);
    brick.origin = { ...origin };
    for (const cell of brick.cells) {
      cell.x += dx;
      cell.z += dz;
    }
    this.occupyBrick(brickId);
    return true;
  }

  deactivateBrick(brickId: string): void {
    const brick = this.bricks.get(brickId);
    if (!brick) return;

    this.clearBrick(brickId);
    brick.active = false;
  }

  releaseBrickOccupancy(brickId: string): void {
    const brick = this.bricks.get(brickId);
    if (!brick || !brick.active) return;

    this.clearBrick(brickId);
  }

  claimBrickOccupancy(brickId: string): boolean {
    const brick = this.bricks.get(brickId);
    if (!brick || !brick.active) return false;

    for (const cell of brick.cells) {
      const slot = this.getSlotAt(cell);
      if (!slot || (slot.occupyingBrickId && slot.occupyingBrickId !== brickId)) return false;
    }

    this.clearBrick(brickId);
    this.occupyBrick(brickId);
    return true;
  }

  countFreeCells(brickId: string, direction: Cell, maxCells: number): number {
    let freeCells = 0;
    for (let cells = 1; cells <= maxCells; cells++) {
      if (!this.canMove(brickId, direction, cells)) break;
      freeCells = cells;
    }
    return freeCells;
  }

  private occupyBrick(brickId: string): void {
    const brick = this.bricks.get(brickId);
    if (!brick) return;

    for (const cell of brick.cells) {
      const slot = this.getSlotAt(cell);
      if (slot) slot.occupyingBrickId = brickId;
    }
  }

  private clearBrick(brickId: string): void {
    for (const slot of this.slots.values()) {
      if (slot.occupyingBrickId === brickId) slot.occupyingBrickId = null;
    }
  }
}

export function cellKey(cell: Cell): string {
  return `${cell.x},${cell.z}`;
}
