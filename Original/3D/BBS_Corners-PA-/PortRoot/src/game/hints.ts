import { HINT_CONFIG } from '../constants';
import type { BoardState } from './board';
import { canGateAccept, normalizeGridDirection } from './gate';
import type { BrickState, Cell, GateState, HintCandidate } from './types';

const DIRECTIONS: Cell[] = [
  { x: 0, z: 1 },
  { x: 0, z: -1 },
  { x: -1, z: 0 },
  { x: 1, z: 0 },
];

export class HintPlanner {
  private hintTurn = 0;
  private readonly recentDirectionByBrick = new Map<string, Cell>();
  private readonly recentTurnByBrick = new Map<string, number>();

  constructor(
    private readonly board: BoardState,
    private readonly gates: GateState[],
  ) {}

  findHint(): HintCandidate | null {
    return this.findSubmitHint() ?? this.findDirectClearHint() ?? this.findBlackWhiteTargetHint();
  }

  rememberHint(candidate: HintCandidate): void {
    this.hintTurn++;
    this.recentDirectionByBrick.set(candidate.hintBrickId, candidate.direction);
    this.recentTurnByBrick.set(candidate.hintBrickId, this.hintTurn);
  }

  getHintMoveDistance(brickId: string, direction: Cell): number {
    const freeCells = this.board.countFreeCells(brickId, direction, HINT_CONFIG.moveCheckCells);
    if (freeCells <= 0) return HINT_CONFIG.minMoveDistance;
    return Math.max(
      HINT_CONFIG.minMoveDistance,
      Math.min(HINT_CONFIG.maxMoveDistance, freeCells * HINT_CONFIG.distancePerFreeCell),
    );
  }

  private findSubmitHint(): HintCandidate | null {
    let best: HintCandidate | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const brick of this.board.getActiveBricks()) {
      const gate = this.getBestMatchingGate(brick);
      if (!gate || !canGateAccept(this.board, gate, brick)) continue;

      const direction = normalizeGridDirection({ x: gate.acceptDirection[0], z: gate.acceptDirection[2] });
      const distance = this.distanceToGate(brick, gate);
      if (best && distance >= bestDistance) continue;

      best = this.createCandidate(brick.id, brick.id, gate.id, direction);
      bestDistance = distance;
    }

    return best;
  }

  private findDirectClearHint(): HintCandidate | null {
    let best: HintCandidate | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const brick of this.board.getActiveBricks()) {
      const gate = this.getBestMatchingGate(brick);
      if (!gate) continue;

      const route = this.tryGetDirectGateRoute(brick, gate);
      if (!route) continue;
      if (!this.board.canMove(brick.id, route.direction)) continue;
      if (!this.isRouteClear(brick, route.direction, route.steps)) continue;
      if (this.isRecentReverse(brick.id, route.direction)) continue;

      const distance = this.distanceToGate(brick, gate);
      if (best && distance >= bestDistance) continue;

      best = this.createCandidate(brick.id, brick.id, gate.id, route.direction);
      bestDistance = distance;
    }

    return best;
  }

  private findBlackWhiteTargetHint(): HintCandidate | null {
    let best: HintCandidate | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const brick of this.board.getActiveBricks()) {
      if (brick.color !== 'Black' && brick.color !== 'White') continue;

      const gate = this.getBestMatchingGate(brick);
      if (!gate) continue;

      const candidate = this.findHintForTarget(brick, gate);
      if (!candidate) continue;

      const distance = this.distanceToGate(brick, gate);
      if (best && distance >= bestDistance) continue;

      best = candidate;
      bestDistance = distance;
    }

    return best;
  }

  private findHintForTarget(target: BrickState, gate: GateState): HintCandidate | null {
    return this.findTargetPassHint(target, gate) ?? this.findTargetAlignmentHint(target, gate);
  }

  private findTargetPassHint(target: BrickState, gate: GateState): HintCandidate | null {
    const routeDirection = this.getRouteDirection(target, gate);
    if (!routeDirection) return null;

    if (this.board.canMove(target.id, routeDirection) && !this.isRecentReverse(target.id, routeDirection)) {
      return this.createCandidate(target.id, target.id, gate.id, routeDirection);
    }

    return this.findRouteBlockerHint(target, gate, routeDirection);
  }

  private findTargetAlignmentHint(target: BrickState, gate: GateState): HintCandidate | null {
    const orderedDirections = this.getDirectionsTowardGateOrdered(target, gate);
    for (const direction of orderedDirections) {
      if (!direction) continue;
      if (!this.board.canMove(target.id, direction)) continue;
      if (!this.moveGetsCloserToGate(target, gate, direction)) continue;
      if (this.isRecentReverse(target.id, direction)) continue;

      return this.createCandidate(target.id, target.id, gate.id, direction);
    }

    for (const direction of orderedDirections) {
      if (!direction) continue;
      if (this.board.canMove(target.id, direction)) continue;

      const blockerHint = this.findRouteBlockerHint(target, gate, direction);
      if (blockerHint) return blockerHint;
    }

    return null;
  }

  private findRouteBlockerHint(target: BrickState, gate: GateState, routeDirection: Cell): HintCandidate | null {
    const direction = normalizeGridDirection(routeDirection);
    if (this.isZeroDirection(direction)) return null;

    const checkedBlockerIds = new Set<string>();
    const routeSteps = this.getRouteStepLimit(target, gate, direction);
    for (let step = 1; step <= routeSteps; step++) {
      for (const cell of target.cells) {
        const blocker = this.getBlockingBrickAtCell({
          x: cell.x + direction.x * step,
          z: cell.z + direction.z * step,
        }, target.id);

        if (!blocker || checkedBlockerIds.has(blocker.id)) continue;
        checkedBlockerIds.add(blocker.id);

        const clearDirection = this.findBlockerClearDirection(blocker, target, gate, direction);
        if (!clearDirection) continue;

        return this.createCandidate(blocker.id, target.id, gate.id, clearDirection);
      }
    }

    return null;
  }

  private findBlockerClearDirection(
    blocker: BrickState,
    target: BrickState,
    gate: GateState,
    routeDirection: Cell,
  ): Cell | null {
    const routeSteps = this.getRouteStepLimit(target, gate, routeDirection);
    const currentOverlap = this.countRouteOverlap(blocker, target, routeDirection, routeSteps, { x: 0, z: 0 });
    const clearDirections = this.getBlockerClearDirectionsOrdered(blocker, target, routeDirection);

    return this.chooseBlockerClearDirection(blocker, target, routeDirection, routeSteps, currentOverlap, clearDirections, true)
      ?? this.chooseBlockerClearDirection(blocker, target, routeDirection, routeSteps, currentOverlap, clearDirections, false);
  }

  private chooseBlockerClearDirection(
    blocker: BrickState,
    target: BrickState,
    routeDirection: Cell,
    routeSteps: number,
    currentOverlap: number,
    clearDirections: Cell[],
    requireOverlapReduction: boolean,
  ): Cell | null {
    for (const candidate of clearDirections) {
      const direction = normalizeGridDirection(candidate);
      if (this.isZeroDirection(direction)) continue;
      if (!this.board.canMove(blocker.id, direction)) continue;
      if (this.isRecentReverse(blocker.id, direction)) continue;

      const nextOverlap = this.countRouteOverlap(blocker, target, routeDirection, routeSteps, direction);
      if (requireOverlapReduction && nextOverlap >= currentOverlap) continue;

      return direction;
    }

    return null;
  }

  private getBestMatchingGate(brick: BrickState): GateState | null {
    let best: GateState | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const gate of this.gates) {
      if (gate.color !== brick.color) continue;

      const distance = this.distanceToGate(brick, gate);
      if (distance < bestDistance) {
        best = gate;
        bestDistance = distance;
      }
    }

    return best;
  }

  private getRouteDirection(target: BrickState, gate: GateState): Cell | null {
    const directRoute = this.tryGetDirectGateRoute(target, gate);
    return directRoute?.direction ?? this.directionTowardGate(target, gate);
  }

  private tryGetDirectGateRoute(target: BrickState, gate: GateState): { direction: Cell; steps: number } | null {
    let best: { direction: Cell; steps: number } | null = null;

    for (const direction of DIRECTIONS) {
      if (!this.moveGetsCloserToGate(target, gate, direction)) continue;

      const steps = this.getStepsToGateSlots(target, gate, direction);
      if (steps === null) continue;
      if (best && steps >= best.steps) continue;

      best = { direction, steps };
    }

    return best;
  }

  private getStepsToGateSlots(target: BrickState, gate: GateState, direction: Cell): number | null {
    const gateSlotIds = new Set(gate.gateSlotIds);
    const gridDirection = normalizeGridDirection(direction);
    if (this.isZeroDirection(gridDirection)) return null;

    for (let steps = 1; steps <= HINT_CONFIG.routeCheckCells; steps++) {
      let allCellsReachGate = true;
      for (const cell of target.cells) {
        const slot = this.board.getSlotAt({
          x: cell.x + gridDirection.x * steps,
          z: cell.z + gridDirection.z * steps,
        });

        if (!slot || !gateSlotIds.has(slot.id)) {
          allCellsReachGate = false;
          break;
        }
      }

      if (allCellsReachGate) return steps;
    }

    return null;
  }

  private getRouteStepLimit(target: BrickState, gate: GateState, routeDirection: Cell): number {
    const stepsToGate = this.getStepsToGateSlots(target, gate, routeDirection);
    const maxSteps = Math.max(HINT_CONFIG.moveCheckCells, HINT_CONFIG.routeCheckCells);
    return Math.max(1, stepsToGate === null ? maxSteps : Math.min(maxSteps, stepsToGate));
  }

  private isRouteClear(target: BrickState, routeDirection: Cell, routeSteps: number): boolean {
    const direction = normalizeGridDirection(routeDirection);
    if (this.isZeroDirection(direction)) return false;

    for (let step = 1; step <= routeSteps; step++) {
      for (const cell of target.cells) {
        const slot = this.board.getSlotAt({
          x: cell.x + direction.x * step,
          z: cell.z + direction.z * step,
        });

        if (!slot) return false;
        if (slot.occupyingBrickId && slot.occupyingBrickId !== target.id) return false;
      }
    }

    return true;
  }

  private directionTowardGate(brick: BrickState, gate: GateState): Cell | null {
    const center = this.getBrickCenter(brick);
    const closestGateCell = this.getClosestGateCell(center, gate);
    const dx = closestGateCell.x - center.x;
    const dz = closestGateCell.z - center.z;
    const direction = normalizeGridDirection({ x: dx, z: dz });
    return this.isZeroDirection(direction) ? null : direction;
  }

  private getDirectionsTowardGateOrdered(brick: BrickState, gate: GateState): Array<Cell | null> {
    const center = this.getBrickCenter(brick);
    const closestGateCell = this.getClosestGateCell(center, gate);
    const dx = closestGateCell.x - center.x;
    const dz = closestGateCell.z - center.z;
    const xDirection = Math.abs(dx) > 0.05 ? { x: dx >= 0 ? 1 : -1, z: 0 } : null;
    const zDirection = Math.abs(dz) > 0.05 ? { x: 0, z: dz >= 0 ? 1 : -1 } : null;

    return Math.abs(dx) >= Math.abs(dz)
      ? [xDirection, zDirection]
      : [zDirection, xDirection];
  }

  private getBlockerClearDirectionsOrdered(blocker: BrickState, target: BrickState, routeDirection: Cell): Cell[] {
    const blockerCenter = this.getBrickCenter(blocker);
    const targetCenter = this.getBrickCenter(target);
    const direction = normalizeGridDirection(routeDirection);

    if (Math.abs(direction.x) > 0) {
      const primary = blockerCenter.z >= targetCenter.z ? { x: 0, z: 1 } : { x: 0, z: -1 };
      return [primary, this.invertDirection(primary), this.invertDirection(direction), direction];
    }

    const primary = blockerCenter.x >= targetCenter.x ? { x: 1, z: 0 } : { x: -1, z: 0 };
    return [primary, this.invertDirection(primary), this.invertDirection(direction), direction];
  }

  private moveGetsCloserToGate(brick: BrickState, gate: GateState, direction: Cell): boolean {
    const gridDirection = normalizeGridDirection(direction);
    if (this.isZeroDirection(gridDirection)) return false;

    const center = this.getBrickCenter(brick);
    return this.distanceFromCellToGate({
      x: center.x + gridDirection.x,
      z: center.z + gridDirection.z,
    }, gate) < this.distanceFromCellToGate(center, gate) - 0.01;
  }

  private getBlockingBrickAtCell(cell: Cell, ignoredBrickId: string): BrickState | null {
    const slot = this.board.getSlotAt(cell);
    if (!slot || !slot.occupyingBrickId || slot.occupyingBrickId === ignoredBrickId) return null;

    const brick = this.board.getBrick(slot.occupyingBrickId);
    return brick?.active ? brick : null;
  }

  private countRouteOverlap(
    brick: BrickState,
    target: BrickState,
    routeDirection: Cell,
    routeSteps: number,
    brickOffset: Cell,
  ): number {
    const routeCells = new Set<string>();
    const direction = normalizeGridDirection(routeDirection);
    for (let step = 1; step <= routeSteps; step++) {
      for (const targetCell of target.cells) {
        routeCells.add(this.cellKey({
          x: targetCell.x + direction.x * step,
          z: targetCell.z + direction.z * step,
        }));
      }
    }

    let overlap = 0;
    for (const brickCell of brick.cells) {
      const movedCell = {
        x: brickCell.x + brickOffset.x,
        z: brickCell.z + brickOffset.z,
      };
      if (!this.board.getSlotAt(movedCell)) continue;
      if (routeCells.has(this.cellKey(movedCell))) overlap++;
    }

    return overlap;
  }

  private distanceToGate(brick: BrickState, gate: GateState): number {
    return this.distanceFromCellToGate(this.getBrickCenter(brick), gate);
  }

  private distanceFromCellToGate(cell: Cell, gate: GateState): number {
    return this.distanceBetweenCells(cell, this.getClosestGateCell(cell, gate));
  }

  private getClosestGateCell(cell: Cell, gate: GateState): Cell {
    let best: Cell = { x: gate.position[0], z: gate.position[2] };
    let bestDistance = this.distanceBetweenCells(cell, best);

    for (const gateSlotId of gate.gateSlotIds) {
      const slot = this.board.getSlotById(gateSlotId);
      if (!slot) continue;

      const candidate = { x: slot.x, z: slot.z };
      const distance = this.distanceBetweenCells(cell, candidate);
      if (distance >= bestDistance) continue;

      best = candidate;
      bestDistance = distance;
    }

    return best;
  }

  private getBrickCenter(brick: BrickState): Cell {
    const total = brick.cells.reduce(
      (sum, cell) => ({
        x: sum.x + cell.x,
        z: sum.z + cell.z,
      }),
      { x: 0, z: 0 },
    );

    return {
      x: total.x / Math.max(1, brick.cells.length),
      z: total.z / Math.max(1, brick.cells.length),
    };
  }

  private distanceBetweenCells(a: Cell, b: Cell): number {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    return dx * dx + dz * dz;
  }

  private createCandidate(hintBrickId: string, targetBrickId: string, targetGateId: string, direction: Cell): HintCandidate {
    return {
      hintBrickId,
      targetBrickId,
      targetGateId,
      direction: normalizeGridDirection(direction),
    };
  }

  private invertDirection(direction: Cell): Cell {
    return { x: -direction.x, z: -direction.z };
  }

  private isZeroDirection(direction: Cell): boolean {
    return direction.x === 0 && direction.z === 0;
  }

  private cellKey(cell: Cell): string {
    return `${cell.x},${cell.z}`;
  }

  private isRecentReverse(brickId: string, direction: Cell): boolean {
    const recent = this.recentDirectionByBrick.get(brickId);
    const turn = this.recentTurnByBrick.get(brickId);
    if (!recent || turn === undefined) return false;
    if (this.hintTurn - turn > Math.max(1, HINT_CONFIG.reverseMemoryTurns)) return false;
    return recent.x === -direction.x && recent.z === -direction.z;
  }
}
