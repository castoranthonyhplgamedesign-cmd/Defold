import { createServer } from 'vite';

const DIRECTIONS = [
  { x: 0, z: 1 },
  { x: 0, z: -1 },
  { x: -1, z: 0 },
  { x: 1, z: 0 },
];
const MAX_DRAG_STEPS = 12;
const MAX_SEARCH_NODES = 200000;

const vite = await createServer({
  appType: 'custom',
  configFile: false,
  define: {
    __ITERATION__: JSON.stringify('full'),
    __NETWORK__: JSON.stringify('dev'),
    __HEADER_VARIANT__: JSON.stringify('v1'),
  },
  logLevel: 'error',
  optimizeDeps: {
    entries: [],
    noDiscovery: true,
  },
  root: process.cwd(),
  server: { hmr: false, middlewareMode: true },
});

try {
  const { BoardState } = await vite.ssrLoadModule('/src/game/board.ts');
  const { canGateAccept } = await vite.ssrLoadModule('/src/game/gate.ts');
  const { ASSET_SIZING } = await vite.ssrLoadModule('/src/data/assetSizing.ts');
  const { isColoredBrickColor } = await vite.ssrLoadModule('/src/data/colors.ts');
  const { wideUScene } = await vite.ssrLoadModule('/src/data/wideUScene.ts');

  const solver = createSolver(wideUScene, ASSET_SIZING.gates.contact, isColoredBrickColor);
  const actions = solver.solve();
  replaySolution(new BoardState(wideUScene), wideUScene, canGateAccept, actions);

  const moveCount = actions.filter((action) => action.type === 'move').length;
  const submitCount = actions.filter((action) => action.type === 'submit').length;
  console.log(`Full-clear smoke passed: cleared all colored blocks with ${submitCount} submissions and ${moveCount} legal drag moves.`);
} finally {
  await vite.close();
}

function createSolver(scene, gateContact, isColoredBrickColor) {
  const pieces = scene.bricks.map((brick) => ({
    id: brick.id,
    color: brick.color,
    countsForWin: isColoredBrickColor(brick.color),
    origin: { ...brick.origin },
    relCells: brick.cells.map((cell) => ({
      x: cell.x - brick.origin.x,
      z: cell.z - brick.origin.z,
    })),
  }));
  const slots = new Set(scene.gridSlots.map((slot) => cellKey(slot)));
  const slotsById = new Map(scene.gridSlots.map((slot) => [slot.id, slot]));
  const gates = scene.gates.map((gate) => ({
    id: gate.id,
    color: gate.color,
    direction: {
      x: Math.sign(gate.acceptDirection[0]),
      z: Math.sign(gate.acceptDirection[2]),
    },
    slots: gate.gateSlotIds.map((id) => slotsById.get(id)).filter(Boolean),
  }));

  return {
    solve() {
      let state = pieces.map((piece) => [piece.origin.x, piece.origin.z]);
      const actions = [];

      for (let cycle = 0; cycle < pieces.length * 4; cycle++) {
        while (true) {
          const submitIndex = findReadySubmission(state);
          if (submitIndex === null) break;

          actions.push({
            type: 'submit',
            brickId: pieces[submitIndex].id,
            gateId: getBestTouchedGate(submitIndex, state).id,
          });
          state[submitIndex] = null;
        }

        if (countActiveWinPieces(state) === 0) return actions;

        const nextSubmitPath = searchPathToNextSubmission(state);
        if (!nextSubmitPath) {
          throw new Error(`No legal route to the next submission. Active colored bricks=${countActiveWinPieces(state)}.`);
        }

        for (const move of nextSubmitPath) {
          state = applyMove(state, move);
          actions.push({
            type: 'move',
            brickId: pieces[move.index].id,
            direction: { x: move.dx, z: move.dz },
            steps: move.steps,
          });
        }
      }

      throw new Error(`Full clear did not converge. Active colored bricks=${countActiveWinPieces(state)}.`);
    },
  };

  function searchPathToNextSubmission(startState) {
    const queue = [{ state: startState, path: [] }];
    const seen = new Set([encodeState(startState)]);

    for (let head = 0; head < queue.length && head < MAX_SEARCH_NODES; head++) {
      const node = queue[head];
      for (const move of generateMoves(node.state)) {
        const nextState = applyMove(node.state, move);
        const key = encodeState(nextState);
        if (seen.has(key)) continue;

        seen.add(key);
        const path = [...node.path, move];
        if (findReadySubmission(nextState) !== null) return path;
        queue.push({ state: nextState, path });
      }
    }

    return null;
  }

  function generateMoves(state) {
    const occupied = createOccupancy(state);
    const moves = [];

    for (let index = 0; index < pieces.length; index++) {
      if (!state[index]) continue;

      for (const direction of DIRECTIONS) {
        for (let steps = 1; steps <= MAX_DRAG_STEPS; steps++) {
          const origin = {
            x: state[index][0] + direction.x * steps,
            z: state[index][1] + direction.z * steps,
          };
          if (!canPlaceAt(state, occupied, index, origin)) break;

          moves.push({
            index,
            dx: direction.x,
            dz: direction.z,
            steps,
          });
        }
      }
    }

    return moves;
  }

  function findReadySubmission(state) {
    let bestIndex = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < pieces.length; index++) {
      if (!state[index]) continue;

      const gate = getBestTouchedGate(index, state);
      if (!gate) continue;

      const distance = distanceToGate(index, state, gate);
      if (distance >= bestDistance) continue;

      bestIndex = index;
      bestDistance = distance;
    }

    return bestIndex;
  }

  function getBestTouchedGate(index, state) {
    let bestGate = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const gate of gates) {
      if (gate.color !== pieces[index].color) continue;
      if (!doesPieceTouchGate(index, state, gate)) continue;

      const distance = distanceToGate(index, state, gate);
      if (distance >= bestDistance) continue;

      bestGate = gate;
      bestDistance = distance;
    }

    return bestGate;
  }

  function doesPieceTouchGate(index, state, gate) {
    const origin = state[index];
    const contactSlots = getGateContactSlots(gate);
    for (const relCell of pieces[index].relCells) {
      const cell = {
        x: origin[0] + relCell.x,
        z: origin[1] + relCell.z,
      };

      if (contactSlots.some((slot) => isTouchingGateFace(cell, slot, gate.direction))) return true;
    }

    return false;
  }

  function getGateContactSlots(gate) {
    const bestProjection = Math.max(...gate.slots.map((slot) => projectAlongGate(slot, gate.direction)));
    return gate.slots.filter((slot) => projectAlongGate(slot, gate.direction) === bestProjection);
  }

  function isTouchingGateFace(cell, slot, direction) {
    const lateralDelta = direction.x !== 0
      ? Math.abs(cell.z - slot.z)
      : Math.abs(cell.x - slot.x);
    if (lateralDelta > gateContact.lateralToleranceCells) return false;

    const forwardOffset = projectAlongGate(cell, direction) - projectAlongGate(slot, direction);
    return forwardOffset >= 0 && forwardOffset <= gateContact.forwardCells;
  }

  function distanceToGate(index, state, gate) {
    const origin = state[index];
    const cells = pieces[index].relCells.map((relCell) => ({
      x: origin[0] + relCell.x,
      z: origin[1] + relCell.z,
    }));
    const center = {
      x: cells.reduce((sum, cell) => sum + cell.x, 0) / cells.length,
      z: cells.reduce((sum, cell) => sum + cell.z, 0) / cells.length,
    };

    return Math.min(...gate.slots.map((slot) => {
      const dx = slot.x - center.x;
      const dz = slot.z - center.z;
      return dx * dx + dz * dz;
    }));
  }

  function canPlaceAt(state, occupied, index, origin) {
    for (const relCell of pieces[index].relCells) {
      const key = cellKey({
        x: origin.x + relCell.x,
        z: origin.z + relCell.z,
      });
      if (!slots.has(key)) return false;

      const current = occupied.get(key);
      if (current !== undefined && current !== index) return false;
    }

    return true;
  }

  function createOccupancy(state) {
    const occupied = new Map();
    for (let index = 0; index < pieces.length; index++) {
      const origin = state[index];
      if (!origin) continue;

      for (const relCell of pieces[index].relCells) {
        occupied.set(cellKey({
          x: origin[0] + relCell.x,
          z: origin[1] + relCell.z,
        }), index);
      }
    }
    return occupied;
  }

  function applyMove(state, move) {
    const next = state.map((origin) => (origin ? [...origin] : null));
    next[move.index] = [
      next[move.index][0] + move.dx * move.steps,
      next[move.index][1] + move.dz * move.steps,
    ];
    return next;
  }

  function encodeState(state) {
    return state.map((origin) => (origin ? `${origin[0]},${origin[1]}` : '_')).join('|');
  }

  function countActiveWinPieces(state) {
    return state.filter((origin, index) => origin && pieces[index].countsForWin).length;
  }
}

function replaySolution(board, scene, canGateAccept, actions) {
  for (const [index, action] of actions.entries()) {
    if (action.type === 'move') {
      const moved = board.moveBrick(action.brickId, action.direction, action.steps);
      if (!moved) throw new Error(`Action ${index + 1}: illegal move ${action.brickId}.`);
      continue;
    }

    const brick = board.getBrick(action.brickId);
    const gate = scene.gates.find((candidate) => candidate.id === action.gateId);
    if (!brick || !gate) throw new Error(`Action ${index + 1}: missing submit fixture.`);
    if (!canGateAccept(board, gate, brick)) {
      throw new Error(`Action ${index + 1}: ${action.brickId} cannot submit to ${action.gateId}.`);
    }
    board.deactivateBrick(action.brickId);
  }

  if (!board.areAllColoredBricksCleared()) {
    throw new Error(`Replay ended with ${board.getActiveColoredBrickCount()} active colored bricks.`);
  }
}

function projectAlongGate(cell, direction) {
  return cell.x * direction.x + cell.z * direction.z;
}

function cellKey(cell) {
  return `${cell.x},${cell.z}`;
}
