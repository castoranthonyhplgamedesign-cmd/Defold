import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { optimizeGlb } from './optimize-glb.mjs';

// Unity serialized Mesh, version 11: float32 vertex stream with an 88-byte stride,
// and little-endian uint16 triangle indices. This asset is the scene's conveyor.
const source = await readFile(resolve('Assets/3D World Assets/Mesh/Custom Mesh.asset'), 'utf8');
const line = (name) => {
  const match = source.match(new RegExp(`^\\s*${name}: ([^\\r\\n]+)`, 'm'));
  if (!match) throw new Error(`${name} is missing from the Unity mesh`);
  return match[1];
};
const vertexCount = Number(line('m_VertexCount'));
const vertexBytes = Buffer.from(line('_typelessdata'), 'hex');
const indexBytes = Buffer.from(line('m_IndexBuffer'), 'hex');
const stride = vertexBytes.length / vertexCount;
if (stride !== 88) throw new Error(`Unexpected vertex stride ${stride}`);

const positions = new Float32Array(vertexCount * 3);
const normals = new Float32Array(vertexCount * 3);
const uvs = new Float32Array(vertexCount * 2);
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < vertexCount; i++) {
  const at = i * stride;
  const pos = [vertexBytes.readFloatLE(at), vertexBytes.readFloatLE(at + 4), -vertexBytes.readFloatLE(at + 8)];
  const normal = [vertexBytes.readFloatLE(at + 12), vertexBytes.readFloatLE(at + 16), -vertexBytes.readFloatLE(at + 20)];
  for (let j = 0; j < 3; j++) {
    positions[i * 3 + j] = pos[j];
    normals[i * 3 + j] = normal[j];
    min[j] = Math.min(min[j], pos[j]);
    max[j] = Math.max(max[j], pos[j]);
  }
  uvs[i * 2] = vertexBytes.readFloatLE(at + 56);
  uvs[i * 2 + 1] = 1 - vertexBytes.readFloatLE(at + 60);
}

const submeshText = source.slice(source.indexOf('m_SubMeshes:'), source.indexOf('m_Shapes:'));
const submeshes = [...submeshText.matchAll(/firstByte: (\d+)[\s\S]*?indexCount: (\d+)/g)]
  .map((match) => ({ firstByte: Number(match[1]), indexCount: Number(match[2]) }));
if (submeshes.length !== 2) throw new Error(`Expected two conveyor submeshes, found ${submeshes.length}`);

const chunks = [];
const bufferViews = [];
const accessors = [];
let byteLength = 0;
function view(bytes, target) {
  const padding = (4 - byteLength % 4) % 4;
  if (padding) { chunks.push(Buffer.alloc(padding)); byteLength += padding; }
  const index = bufferViews.length;
  bufferViews.push({ buffer: 0, byteOffset: byteLength, byteLength: bytes.length, target });
  chunks.push(bytes);
  byteLength += bytes.length;
  return index;
}
function accessor(bufferView, componentType, count, type, bounds) {
  const index = accessors.length;
  accessors.push({ bufferView, componentType, count, type, ...(bounds ?? {}) });
  return index;
}
const positionAccessor = accessor(view(Buffer.from(positions.buffer), 34962), 5126, vertexCount, 'VEC3', { min, max });
const normalAccessor = accessor(view(Buffer.from(normals.buffer), 34962), 5126, vertexCount, 'VEC3');
const uvAccessor = accessor(view(Buffer.from(uvs.buffer), 34962), 5126, vertexCount, 'VEC2');
// Unity submesh 0 is the wall geometry; submesh 1 is the flat belt surface.
// Keep them separate so Babylon can use the authored belt color.
const primitives = [];
for (const submesh of submeshes) {
  const indices = new Uint16Array(submesh.indexCount);
  for (let i = 0; i < submesh.indexCount; i += 3) {
    const start = submesh.firstByte + i * 2;
    indices[i] = indexBytes.readUInt16LE(start);
    indices[i + 1] = indexBytes.readUInt16LE(start + 4);
    indices[i + 2] = indexBytes.readUInt16LE(start + 2);
  }
  const indexAccessor = accessor(view(Buffer.from(indices.buffer), 34963), 5123, indices.length, 'SCALAR');
  primitives.push({ attributes: { POSITION: positionAccessor, NORMAL: normalAccessor, TEXCOORD_0: uvAccessor }, indices: indexAccessor, mode: 4 });
}
const gltf = {
  asset: { version: '2.0', generator: 'Arrow Flow Unity Mesh converter' },
  scene: 0,
  scenes: [{ nodes: [0, 1] }],
  nodes: [{ mesh: 0, name: 'Custom Mesh' }, { mesh: 1, name: 'Conveyor Belt' }],
  meshes: [
    { name: 'Custom Mesh', primitives: [primitives[0]] },
    { name: 'Conveyor Belt', primitives: [primitives[1]] },
  ],
  buffers: [{ byteLength }],
  bufferViews,
  accessors,
};
const pad = (buffer, fill) => Buffer.concat([buffer, Buffer.alloc((4 - buffer.length % 4) % 4, fill)]);
const json = pad(Buffer.from(JSON.stringify(gltf)), 0x20);
const binary = pad(Buffer.concat(chunks), 0);
const header = Buffer.alloc(12);
header.write('glTF', 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + json.length + 8 + binary.length, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(json.length, 0);
jsonHeader.write('JSON', 4);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(binary.length, 0);
binaryHeader.write('BIN\0', 4);
const output = resolve('src/models/Conveyor_Custom_Mesh.glb');
await writeFile(output, Buffer.concat([header, jsonHeader, json, binaryHeader, binary]));
await optimizeGlb(output);
console.log(`Converted ${vertexCount} vertices and ${submeshes.reduce((sum, mesh) => sum + mesh.indexCount, 0) / 3} triangles to ${output}`);
