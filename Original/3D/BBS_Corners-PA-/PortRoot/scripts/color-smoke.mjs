import { createServer } from 'vite';

const EXPECTED_COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Black', 'White'];
const EXPECTED_COLORED_BLOCKS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink'];

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
  const { BRICK_COLORS, COLOR_HEX, COLORED_BRICK_COLORS, isColoredBrickColor } = await vite.ssrLoadModule('/src/data/colors.ts');
  const { BoardState } = await vite.ssrLoadModule('/src/game/board.ts');
  const { wideUScene } = await vite.ssrLoadModule('/src/data/wideUScene.ts');
  const { ASSET_SIZING, gateVisualName } = await vite.ssrLoadModule('/src/data/assetSizing.ts');

  assertSameSet(BRICK_COLORS, EXPECTED_COLORS, 'BRICK_COLORS');
  assertSameSet(Object.keys(COLOR_HEX), EXPECTED_COLORS, 'COLOR_HEX');
  assertSameSet(COLORED_BRICK_COLORS, EXPECTED_COLORED_BLOCKS, 'COLORED_BRICK_COLORS');
  assertSameSet(Object.keys(ASSET_SIZING.gates.byColor), EXPECTED_COLORS, 'ASSET_SIZING.gates.byColor');
  assertSameSet(EXPECTED_COLORS.filter(isColoredBrickColor), EXPECTED_COLORED_BLOCKS, 'isColoredBrickColor');

  const brickColors = new Set(wideUScene.bricks.filter((brick) => brick.active).map((brick) => brick.color));
  assertSameSet([...brickColors], EXPECTED_COLORS, 'active brick colors');

  const gateColors = new Set(wideUScene.gates.map((gate) => gate.color));
  assertSameSet([...gateColors], EXPECTED_COLORS, 'gate colors');

  const board = new BoardState(wideUScene);
  for (const brick of wideUScene.bricks) {
    if (isColoredBrickColor(brick.color)) board.deactivateBrick(brick.id);
  }
  if (!board.areAllColoredBricksCleared()) {
    throw new Error(`color-only win condition failed with ${board.getActiveColoredBrickCount()} colored bricks left`);
  }
  if (board.getActiveBrickCount() === 0) {
    throw new Error('color-only win condition smoke expected black/white bricks to remain active');
  }

  for (const color of EXPECTED_COLORS) {
    if (!/^#[0-9a-f]{6}$/i.test(COLOR_HEX[color])) {
      throw new Error(`${color}: invalid hex color ${COLOR_HEX[color]}`);
    }

    const name = gateVisualName(color);
    if (name !== `gate-${color.toLowerCase()}`) {
      throw new Error(`${color}: expected gate visual name gate-${color.toLowerCase()}, got ${name}`);
    }
  }

  console.log(`Color smoke passed: ${EXPECTED_COLORS.length} colors represented across bricks, gates, materials, and gate sizing.`);
} finally {
  await vite.close();
}

function assertSameSet(actual, expected, label) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((value) => !actualSet.has(value));
  const extra = [...actualSet].filter((value) => !expectedSet.has(value));
  if (missing.length || extra.length) {
    throw new Error(`${label}: missing=[${missing.join(', ')}] extra=[${extra.join(', ')}]`);
  }
}
