import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
test('packed geometry has finite positions, normals and valid triangle indices', () => {
  const manifest = read('src/assets/geometry.json');
  const bytes = fs.readFileSync('src/assets/geometry.bin');
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length);
  for (const primitives of Object.values(manifest)) for (const p of primitives) {
    for (const key of ['position', 'normal', ...(p.uv ? ['uv'] : [])]) {
      const a = p[key], values = new Float32Array(buffer, a.offset, a.count * a.components);
      assert(values.every(Number.isFinite));
    }
    assert.equal(p.position.count, p.normal.count);
    const a = p.index, Type = a.componentType === 5123 ? Uint16Array : Uint32Array;
    const indices = new Type(buffer, a.offset, a.count);
    assert.equal(indices.length % 3, 0); assert(indices.every(i => i < p.position.count));
  }
  for (const name of ['tunnel','tunnelBase']) for (const p of manifest[name]) {
    assert.equal(p.uv.count,p.position.count); assert.equal(p.uv.components,2);
  }
});
test('preview board has unique contiguous cells and valid facing axes', () => {
  const level = read('src/data/level.json'), occupied = new Set();
  for (const arrow of level.arrows) {
    assert.equal(arrow.direction.reduce((n, v) => n + Math.abs(v), 0), 1);
    arrow.cells.forEach((cell, i) => {
      if (i) assert.equal(cell.reduce((n, v, j) => n + Math.abs(v - arrow.cells[i - 1][j]), 0), 1);
      const key = cell.map((v, j) => v + arrow.position[j]).join(',');
      assert(!occupied.has(key)); occupied.add(key);
    });
  }
  assert.equal(occupied.size, 406); assert.equal(level.shooters.length, 4);
});
