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
  const { resolveDragDisplayOrigin, resolveDragFollowTarget, resolveSlideDrag } = await vite.ssrLoadModule('/src/game/drag.ts');
  const { ASSET_SIZING } = await vite.ssrLoadModule('/src/data/assetSizing.ts');
  const { BoardState } = await vite.ssrLoadModule('/src/game/board.ts');
  const { wideUScene } = await vite.ssrLoadModule('/src/data/wideUScene.ts');
  const config = ASSET_SIZING.bricks.drag;
  const startOrigin = { x: 0, z: 0 };
  const openBoard = {
    minX: -3,
    maxX: 3,
    minZ: -4,
    maxZ: 6,
  };
  const canPlaceAnywhere = () => true;

  assertDrag(resolveSlideDrag({
    startOrigin,
    pointerOrigin: { x: 0.2, z: 0.1 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: canPlaceAnywhere,
  }), {
    lockedAxis: null,
    candidateOrigin: { x: 0, z: 0 },
    dropOrigin: { x: 0, z: 0 },
    isValid: true,
  }, 'short free drag snaps back to the nearest origin');

  const freeSlide = resolveSlideDrag({
    startOrigin,
    pointerOrigin: { x: 2.2, z: 1.1 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: canPlaceAnywhere,
  });
  assertDrag(freeSlide, {
    lockedAxis: null,
    candidateOrigin: { x: 2, z: 1 },
    dropOrigin: { x: 2, z: 1 },
    isValid: true,
  }, 'omni drag snaps to the closest grid cell');
  assertCellApprox(resolveDragDisplayOrigin({
    startOrigin,
    pointerOrigin: { x: 2.2, z: 1.1 },
    slide: freeSlide,
    snapLateralThresholdCells: config.snapLateralThresholdCells,
  }), { x: 2.2, z: 1.1 }, 'omni drag display follows the pointer continuously');

  const ambiguousSlide = resolveSlideDrag({
    startOrigin,
    pointerOrigin: { x: 0.5, z: 0 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: canPlaceAnywhere,
  });
  assertDrag(ambiguousSlide, {
    lockedAxis: null,
    candidateOrigin: { x: 1, z: 0 },
    dropOrigin: { x: 0, z: 0 },
    isValid: true,
  }, 'ambiguous nearest-cell distance snaps to original');

  const clampedSlide = resolveSlideDrag({
    startOrigin,
    pointerOrigin: { x: 8.4, z: 9.2 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: canPlaceAnywhere,
  });
  assertDrag(clampedSlide, {
    lockedAxis: null,
    candidateOrigin: { x: 3, z: 6 },
    dropOrigin: { x: 3, z: 6 },
    isValid: true,
  }, 'omni drag clamps the block origin inside board bounds');
  assertCellApprox(resolveDragDisplayOrigin({
    startOrigin,
    pointerOrigin: { x: 8.4, z: 9.2 },
    slide: clampedSlide,
    snapLateralThresholdCells: config.snapLateralThresholdCells,
  }), { x: 3, z: 6 }, 'drag display is clamped inside board bounds');

  const occupiedSlide = resolveSlideDrag({
    startOrigin,
    pointerOrigin: { x: 2.2, z: 0 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: (origin) => origin.x <= 1 && origin.z === 0,
  });
  assertDrag(occupiedSlide, {
    lockedAxis: null,
    candidateOrigin: { x: 1, z: 0 },
    dropOrigin: { x: 1, z: 0 },
    isValid: true,
  }, 'drop chooses the closest valid cell when the nearest cell is occupied');
  assertCellWithin(resolveDragDisplayOrigin({
    startOrigin,
    pointerOrigin: { x: 2.2, z: 0 },
    slide: occupiedSlide,
    snapLateralThresholdCells: config.snapLateralThresholdCells,
  }), {
    minX: 1,
    maxX: 1 + dragClearanceCells(config),
    minZ: 0,
    maxZ: 0,
  }, 'occupied cells stop free drag display at the configured clearance');

  const nearFollow = resolveDragFollowTarget({
    currentOrigin: startOrigin,
    targetOrigin: { x: 0.5, z: 0 },
    dt: 1 / 60,
    config,
  });
  const farFollow = resolveDragFollowTarget({
    currentOrigin: startOrigin,
    targetOrigin: { x: 4, z: 0 },
    dt: 1 / 60,
    config,
  });
  if (!(nearFollow.x > farFollow.x)) {
    throw new Error(`distance-aware follow should move near targets faster than far targets; near=${nearFollow.x}, far=${farFollow.x}`);
  }

  const lPathSlide = resolveSlideDrag({
    startOrigin,
    currentOrigin: startOrigin,
    pointerOrigin: { x: 2, z: 1 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: canPlaceInCells([
      { x: 0, z: 0 },
      { x: 0, z: 1 },
      { x: 1, z: 1 },
      { x: 2, z: 1 },
    ]),
  });
  assertDrag(lPathSlide, {
    lockedAxis: null,
    candidateOrigin: { x: 0, z: 1 },
    dropOrigin: { x: 0, z: 1 },
    isValid: true,
  }, 'drag does not teleport through an L-shaped free route in one pointer update');
  assertCellWithin(resolveDragDisplayOrigin({
    startOrigin,
    pointerOrigin: { x: 2, z: 1 },
    slide: lPathSlide,
    snapLateralThresholdCells: config.snapLateralThresholdCells,
  }), {
    minX: 0,
    maxX: dragClearanceCells(config),
    minZ: 1,
    maxZ: 1,
  }, 'L-shaped route follows only the continuous unblocked segment plus configured clearance');

  const diagonalCornerSlide = resolveSlideDrag({
    startOrigin,
    currentOrigin: startOrigin,
    pointerOrigin: { x: 0.7, z: 0.7 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: canPlaceInCells([
      { x: 0, z: 0 },
      { x: 1, z: 0 },
      { x: 0, z: 1 },
    ]),
  });
  assertDrag(diagonalCornerSlide, {
    lockedAxis: null,
    candidateOrigin: { x: 1, z: 0 },
    dropOrigin: { x: 1, z: 0 },
    isValid: true,
  }, 'diagonal drag slides along the free edge instead of overlapping a blocked corner');
  assertCellWithin(resolveDragDisplayOrigin({
    startOrigin,
    pointerOrigin: { x: 0.7, z: 0.7 },
    slide: diagonalCornerSlide,
    snapLateralThresholdCells: config.snapLateralThresholdCells,
  }), {
    minX: 0.7,
    maxX: 0.7,
    minZ: 0,
    maxZ: dragClearanceCells(config),
  }, 'blocked diagonal corner keeps the display within the configured clearance');

  const board = new BoardState(wideUScene);
  const draggedBrickId = 'brick_blue_start';
  assertSlotOccupant(board, { x: -3, z: -4 }, draggedBrickId, 'initial dragged brick bottom occupancy');
  assertSlotOccupant(board, { x: -3, z: -3 }, draggedBrickId, 'initial dragged brick top occupancy');
  board.releaseBrickOccupancy(draggedBrickId);
  assertSlotOccupant(board, { x: -3, z: -4 }, null, 'released dragged brick bottom occupancy');
  assertSlotOccupant(board, { x: -3, z: -3 }, null, 'released dragged brick top occupancy');
  if (!board.claimBrickOccupancy(draggedBrickId)) {
    throw new Error('Dragged brick should reclaim its occupied slots after cancel/drop.');
  }
  assertSlotOccupant(board, { x: -3, z: -4 }, draggedBrickId, 'claimed dragged brick bottom occupancy');
  assertSlotOccupant(board, { x: -3, z: -3 }, draggedBrickId, 'claimed dragged brick top occupancy');

  const gapBoard = new BoardState(wideUScene);
  const gapBrickId = 'brick_black_-2_0';
  const gapBrick = gapBoard.getBrick(gapBrickId);
  if (!gapBrick) throw new Error(`Missing gap test brick ${gapBrickId}`);
  gapBoard.releaseBrickOccupancy(gapBrickId);
  const gapSlide = resolveSlideDrag({
    startOrigin: gapBrick.origin,
    pointerOrigin: { x: -0.4, z: 0 },
    lockedAxis: null,
    config,
    bounds: openBoard,
    canPlaceAtOrigin: (origin) => gapBoard.canPlaceBrickAtOrigin(gapBrickId, origin),
  });
  assertDrag(gapSlide, {
    lockedAxis: null,
    candidateOrigin: { x: -2, z: 0 },
    dropOrigin: gapBrick.origin,
    isValid: true,
  }, 'center opening blocks drop snap across the board gap');
  assertCellWithin(resolveDragDisplayOrigin({
    startOrigin: gapBrick.origin,
    pointerOrigin: { x: -0.4, z: 0 },
    slide: gapSlide,
    snapLateralThresholdCells: config.snapLateralThresholdCells,
  }), {
    minX: -2,
    maxX: -2 + dragClearanceCells(config),
    minZ: 0,
    maxZ: 0,
  }, 'center opening stops free drag display at the configured clearance');

  console.log('Drag smoke passed: omni display, nearest-cell snap, ambiguity fallback, strict board/blocker/gap clamp, valid-cell fallback, and occupancy release/claim are valid.');
} finally {
  await vite.close();
}

function assertDrag(actual, expected, label) {
  if (actual.lockedAxis !== expected.lockedAxis) {
    throw new Error(`${label}: expected lockedAxis=${expected.lockedAxis}, got ${actual.lockedAxis}`);
  }
  assertCell(actual.candidateOrigin, expected.candidateOrigin, `${label} candidateOrigin`);
  assertCell(actual.dropOrigin, expected.dropOrigin, `${label} dropOrigin`);
  if (actual.isValid !== expected.isValid) {
    throw new Error(`${label}: expected isValid=${expected.isValid}, got ${actual.isValid}`);
  }
}

function assertCell(actual, expected, label) {
  if (actual.x !== expected.x || actual.z !== expected.z) {
    throw new Error(`${label}: expected (${expected.x},${expected.z}), got (${actual.x},${actual.z})`);
  }
}

function assertCellApprox(actual, expected, label) {
  const epsilon = 0.0001;
  if (Math.abs(actual.x - expected.x) > epsilon || Math.abs(actual.z - expected.z) > epsilon) {
    throw new Error(`${label}: expected (${expected.x},${expected.z}), got (${actual.x},${actual.z})`);
  }
}

function assertCellWithin(actual, expected, label) {
  const epsilon = 0.0001;
  if (
    actual.x < expected.minX - epsilon
    || actual.x > expected.maxX + epsilon
    || actual.z < expected.minZ - epsilon
    || actual.z > expected.maxZ + epsilon
  ) {
    throw new Error(`${label}: expected x=${expected.minX}..${expected.maxX}, z=${expected.minZ}..${expected.maxZ}; got (${actual.x},${actual.z})`);
  }
}

function assertSlotOccupant(board, cell, expectedBrickId, label) {
  const slot = board.getSlotAt(cell);
  if (!slot) throw new Error(`${label}: missing slot at (${cell.x},${cell.z})`);
  if (slot.occupyingBrickId !== expectedBrickId) {
    throw new Error(`${label}: expected ${expectedBrickId ?? 'empty'}, got ${slot.occupyingBrickId ?? 'empty'}`);
  }
}

function canPlaceInCells(cells) {
  const allowed = new Set(cells.map((cell) => `${cell.x},${cell.z}`));
  return (origin) => allowed.has(`${origin.x},${origin.z}`);
}

function dragClearanceCells(config) {
  const halfExtent = config.collisionHalfExtentCells ?? 0.5;
  return Math.max(0, 0.5 - halfExtent) + 0.001;
}
