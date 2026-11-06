import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const ids = {
  body: 'a45e711c-c946-4632-a215-f8c994fa9f4a@41ac8',
  corner: 'c6eea205-ec83-4098-8759-1c5862dbe22a@0a48a',
  head: '748aa730-f10e-4897-9e4a-6963194fe2e2@db054',
  inner: '7e0d00cd-e958-4d76-b418-a3e8130166a2@2e7eb',
  cannon: '69414c89-0d43-42e9-ace6-01ff0a340dd1@3d923',
  tunnel: '2d1aaa79-f44e-408e-bd52-45b2357e89d5@c6e33',
  tunnelBase: '2d1aaa79-f44e-408e-bd52-45b2357e89d5@00870',
  track: '716d7457-32e8-483b-b6fe-c528a6798a00@a62fe',
};
fs.mkdirSync('src/assets', { recursive: true });
fs.mkdirSync('src/data', { recursive: true });
const chunks = [], manifest = {};
let offset = 0;
for (const [name, id] of Object.entries(ids)) {
  const file = `analysis/assets/models/${id}.gltf`, gltf = read(file);
  const source = fs.readFileSync(path.resolve(path.dirname(file), gltf.buffers[0].uri));
  function pack(index) {
    const a = gltf.accessors[index], v = gltf.bufferViews[a.bufferView];
    const components = { VEC3: 3, VEC2: 2, SCALAR: 1 }[a.type];
    const bytes = { 5126: 4, 5123: 2, 5125: 4 }[a.componentType];
    assert(components && bytes);
    const width = components * bytes, out = Buffer.alloc(Math.ceil(a.count * width / 4) * 4);
    for (let i = 0; i < a.count; i++) {
      const start = (v.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (v.byteStride ?? width);
      assert(start + width <= source.length);
      source.copy(out, i * width, start, start + width);
    }
    const descriptor = { offset, count: a.count, components, componentType: a.componentType };
    offset += out.length; chunks.push(out);
    return descriptor;
  }
  manifest[name] = gltf.meshes[0].primitives.map(p => ({
    position: pack(p.attributes.POSITION), normal: pack(p.attributes.NORMAL),
    index: pack(p.indices),
    uv: name === 'tunnel' || name === 'tunnelBase' ? pack(p.attributes.TEXCOORD_0) : null,
  }));
}
fs.writeFileSync('src/assets/geometry.bin', Buffer.concat(chunks));
fs.writeFileSync('src/assets/geometry.json', JSON.stringify(manifest));
fs.mkdirSync('src/assets/textures', { recursive: true });
fs.copyFileSync('reference/textures/tunnel-3c4374-exact.webp','src/assets/textures/tunnel-3c4374-exact.webp');
const scene = read('analysis/assets/serialized/05df34ae-586f-458e-a1b4-9cb0c0e05872.json').objects;
const level = read('analysis/evidence/level.json');
fs.writeFileSync('src/data/path.json', JSON.stringify(level.pathWorldControlPoints.map(p => [p.x, p.y, p.z])));
const xyz = v => [v.x, v.y, v.z];
const occupied = new Set();
const arrows = level.arrows.map(a => {
  // shortcut: declared length discards stale overrides; validate against reference runtime before gameplay parity.
  const length = scene[a.sourceObject]._prefab.instance.propertyOverrides.find(p => p.propertyPath.join('.') === 'cells.length')?.value ?? a.cells.length;
  const cells = a.cells.slice(0, length).map(xyz);
  for (const c of cells) {
    const key = c.map((v, i) => v + xyz(a.position)[i]).join(',');
    assert(!occupied.has(key), `Overlapping board cell ${key}`); occupied.add(key);
  }
  return { id: a.sourceObject, color: a.color, direction: xyz(a.direction), position: xyz(a.position), cells };
});
assert.equal(arrows.length, 79); assert.equal(occupied.size, 406);
fs.writeFileSync('src/data/level.json', JSON.stringify({ arrows, shooters: level.shooters.map(s => ({ position: xyz(s.position), queue: s.queue.map(c => ({ color: c.color, ammo: c.ammo })) })) }));
const materials = read('analysis/evidence/materials.json');
const colors = {};
for (const name of ['green', 'blue', 'orange', 'black', 'pink', 'purple', 'yellow', 'Inner', 'Outer']) {
  const p = materials.find(m => m.name === name).properties[0], c = p.mainColor;
  colors[name] = { color: '#' + [c.r,c.g,c.b].map(v => v.toString(16).padStart(2,'0')).join(''), roughness: p.roughness };
}
fs.writeFileSync('src/data/materials.json', JSON.stringify(colors));
fs.writeFileSync('analysis/evidence/milestone-1-assets.json', JSON.stringify({ source: ids, packedGeometryBytes: offset, boardCells: occupied.size, arrows: arrows.length, interpretation: 'Declared array lengths take precedence over stale cell overrides. Inferred, runtime unverified.', materialLimit: 'Tunnel texture and UVs retained. Three gloss is authored tuning; Cocos shader parity remains unverified.' }, null, 2));
console.log(`Prepared ${Object.keys(ids).length} geometries: ${offset} bytes; ${arrows.length} arrows / ${occupied.size} cells.`);
