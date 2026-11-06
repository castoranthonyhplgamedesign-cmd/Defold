import { createServer } from 'vite';

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
  const { HintPlanner } = await vite.ssrLoadModule('/src/game/hints.ts');
  const { wideUScene } = await vite.ssrLoadModule('/src/data/wideUScene.ts');

  const board = new BoardState(wideUScene);
  const planner = new HintPlanner(board, wideUScene.gates);
  const emittedHints = [];

  for (let turn = 0; turn < 8; turn++) {
    const hint = planner.findHint();
    if (!hint) break;

    const hintBrick = board.getBrick(hint.hintBrickId);
    const targetBrick = board.getBrick(hint.targetBrickId);
    const targetGate = wideUScene.gates.find((gate) => gate.id === hint.targetGateId);
    if (!hintBrick || !targetBrick || !targetGate) {
      throw new Error(`Hint ${turn + 1} references missing board data: ${JSON.stringify(hint)}`);
    }

    const canMove = board.canMove(hint.hintBrickId, hint.direction);
    const canSubmit = hint.hintBrickId === hint.targetBrickId && canGateAccept(board, targetGate, hintBrick);
    if (!canMove && !canSubmit) {
      throw new Error(`Hint ${turn + 1} is not movable or submittable: ${JSON.stringify(hint)}`);
    }

    emittedHints.push(`${hint.hintBrickId} -> ${cellLabel(hint.direction)} target=${hint.targetBrickId} gate=${hint.targetGateId}`);
    planner.rememberHint(hint);

    if (canSubmit) {
      board.deactivateBrick(hint.hintBrickId);
    } else {
      board.moveBrick(hint.hintBrickId, hint.direction);
    }
  }

  if (emittedHints.length === 0) {
    throw new Error('No hints were produced for the current Wide-U layout.');
  }

  console.log(`Hint smoke passed with ${emittedHints.length} hints:`);
  for (const [index, hint] of emittedHints.entries()) {
    console.log(`${index + 1}. ${hint}`);
  }
} finally {
  await vite.close();
}

function cellLabel(cell) {
  if (cell.x === 1) return 'right';
  if (cell.x === -1) return 'left';
  if (cell.z === 1) return 'up';
  if (cell.z === -1) return 'down';
  return `${cell.x},${cell.z}`;
}
