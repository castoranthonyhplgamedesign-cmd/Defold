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
  const { wideUScene } = await vite.ssrLoadModule('/src/data/wideUScene.ts');
  const { WIDE_U_MODELS } = await vite.ssrLoadModule('/src/generated/wideUModels.ts');

  assertModelBounds(WIDE_U_MODELS.tileShort, 'tileShort', { maxHalfX: 0.55, maxHalfZ: 0.55 });
  assertModelBounds(WIDE_U_MODELS.tileLong, 'tileLong', { maxHalfX: 0.55, maxHalfZ: 1.08 });
  assertModelBounds(WIDE_U_MODELS.gate, 'gate', { maxHalfX: 0.55, maxHalfZ: 0.55 });
  assertGateMaterialSlots(WIDE_U_MODELS.gate);

  const slotIds = new Set(wideUScene.gridSlots.map((slot) => slot.id));
  const occupiedSlots = new Map();
  for (const brick of wideUScene.bricks) {
    if (!brick.active) continue;

    const expectedCells = brick.meshKey === 'brick_1x2' ? 2 : 1;
    if (brick.cells.length !== expectedCells) {
      throw new Error(`${brick.id}: expected ${expectedCells} cells for ${brick.meshKey}, got ${brick.cells.length}`);
    }

    for (const cell of brick.cells) {
      const slotId = `slot_${cell.x}_${cell.z}`;
      if (!slotIds.has(slotId)) throw new Error(`${brick.id}: missing grid slot ${slotId}`);
      const current = occupiedSlots.get(slotId);
      if (current) throw new Error(`${brick.id}: overlaps ${current} at ${slotId}`);
      occupiedSlots.set(slotId, brick.id);
    }
  }

  for (const gate of wideUScene.gates) {
    for (const gateSlotId of gate.gateSlotIds) {
      if (!slotIds.has(gateSlotId)) throw new Error(`${gate.id}: missing gate slot ${gateSlotId}`);
    }
  }

  const activeBrickCount = wideUScene.bricks.filter((brick) => brick.active).length;
  console.log(`Model smoke passed: ${activeBrickCount} active bricks, ${wideUScene.gates.length} gates, ${occupiedSlots.size} occupied slots.`);
} finally {
  await vite.close();
}

function assertModelBounds(model, name, expected) {
  const halfX = Math.max(Math.abs(model.bounds.min[0]), Math.abs(model.bounds.max[0]));
  const halfZ = Math.max(Math.abs(model.bounds.min[2]), Math.abs(model.bounds.max[2]));
  if (halfX > expected.maxHalfX || halfZ > expected.maxHalfZ) {
    throw new Error(`${name}: bounds exceed grid expectation. halfX=${halfX}, halfZ=${halfZ}`);
  }

  if (model.positions.length === 0 || model.normals.length === 0) {
    throw new Error(`${name}: missing generated mesh data`);
  }

  if (model.positions.length !== model.normals.length) {
    throw new Error(`${name}: expected one normal per position component`);
  }
}

function assertGateMaterialSlots(model) {
  const slots = model.materialSlots;
  if (!Array.isArray(slots) || slots.length !== 2) {
    throw new Error(`gate: expected 2 generated material slots, got ${slots?.length ?? 0}`);
  }

  const byMaterialIndex = new Map(slots.map((slot) => [slot.materialIndex, slot]));
  const bodySlot = byMaterialIndex.get(0);
  const arrowSlot = byMaterialIndex.get(1);
  if (!bodySlot || !arrowSlot) {
    throw new Error('gate: expected material index 0 for body and material index 1 for arrow');
  }

  const totalIndexCount = slots.reduce((total, slot) => total + slot.indexCount, 0);
  const vertexCount = model.positions.length / 3;
  if (totalIndexCount !== vertexCount) {
    throw new Error(`gate: material slots cover ${totalIndexCount} vertices, expected ${vertexCount}`);
  }

  if (arrowSlot.indexCount >= bodySlot.indexCount) {
    throw new Error('gate: expected arrow material slot to be smaller than the body slot');
  }
}
