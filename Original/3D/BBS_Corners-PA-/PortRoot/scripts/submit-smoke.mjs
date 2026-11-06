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
  const { findTouchedGateAtOrigin } = await vite.ssrLoadModule('/src/game/gateRelease.ts');
  const { wideUScene } = await vite.ssrLoadModule('/src/data/wideUScene.ts');

  const board = new BoardState(wideUScene);
  assertCurrentGateAccept(canGateAccept, board, wideUScene, 'brick_white_-3_1', 'gate_white_left');
  assertCurrentGateAccept(canGateAccept, board, wideUScene, 'brick_black_3_2', 'gate_black_right');
  assertGateTouchSubmission(findTouchedGateAtOrigin, board, wideUScene, 'brick_white_-3_1', { x: -4, z: 1 }, 'gate_white_left');
  assertGateTouchSubmission(findTouchedGateAtOrigin, board, wideUScene, 'brick_black_3_2', { x: 4, z: 2 }, 'gate_black_right');
  assertGateTouchSubmission(findTouchedGateAtOrigin, board, wideUScene, 'brick_red_start', { x: -3, z: 6 }, 'gate_red');
  assertNoGateTouchSubmission(findTouchedGateAtOrigin, board, wideUScene, 'brick_white_-3_1', { x: -2, z: 1 }, 'gate_white_left');
  assertNoGateTouchSubmission(findTouchedGateAtOrigin, board, wideUScene, 'brick_red_start', { x: -2, z: 6 }, 'gate_red');
  assertNoGateTouchSubmission(findTouchedGateAtOrigin, board, wideUScene, 'brick_red_start', { x: -3, z: 5 }, 'gate_red');
  console.log('Submit smoke passed: same-color dragged footprints submit when the visible gate-facing lane is touched, without requiring drag direction.');
} finally {
  await vite.close();
}

function assertCurrentGateAccept(canGateAccept, board, scene, brickId, gateId) {
  const brick = board.getBrick(brickId);
  const gate = scene.gates.find((candidate) => candidate.id === gateId);
  if (!brick || !gate) throw new Error(`Missing smoke fixture data for ${brickId}/${gateId}`);
  if (!canGateAccept(board, gate, brick)) {
    throw new Error(`${brickId}: current gate contact is not accepted by ${gateId}`);
  }
}

function assertGateTouchSubmission(findTouchedGateAtOrigin, board, scene, brickId, candidateOrigin, gateId) {
  const brick = board.getBrick(brickId);
  const gate = scene.gates.find((candidate) => candidate.id === gateId);
  if (!brick || !gate) throw new Error(`Missing smoke fixture data for ${brickId}/${gateId}`);

  const touchedGate = findTouchedGateAtOrigin(board, scene.gates, brick, candidateOrigin);
  if (touchedGate?.id !== gateId) {
    throw new Error(`${brickId}: expected drag candidate to touch ${gateId}, got ${touchedGate?.id ?? 'none'}`);
  }
}

function assertNoGateTouchSubmission(findTouchedGateAtOrigin, board, scene, brickId, candidateOrigin, gateId) {
  const brick = board.getBrick(brickId);
  const gate = scene.gates.find((candidate) => candidate.id === gateId);
  if (!brick || !gate) throw new Error(`Missing smoke fixture data for ${brickId}/${gateId}`);

  const touchedGate = findTouchedGateAtOrigin(board, scene.gates, brick, candidateOrigin);
  if (touchedGate?.id === gateId) {
    throw new Error(`${brickId}: drag candidate should not touch ${gateId} from ${candidateOrigin.x},${candidateOrigin.z}`);
  }
}
