import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPONENT_BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const TYPE_COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const pad = (bytes, fill = 0) => Buffer.concat([bytes, Buffer.alloc((4 - bytes.length % 4) % 4, fill)]);

// Keep the original positions and topology. Only pack normals and discard
// conveyor UVs, since the conveyor uses solid-color Babylon materials.
export async function optimizeGlb(path) {
  const source = await readFile(path);
  if (source.toString('ascii', 0, 4) !== 'glTF' || source.readUInt32LE(4) !== 2) {
    throw new Error(`Invalid GLB: ${path}`);
  }
  const jsonLength = source.readUInt32LE(12);
  const document = JSON.parse(source.toString('utf8', 20, 20 + jsonLength));
  const binaryHeader = 20 + jsonLength;
  if (source.toString('ascii', binaryHeader + 4, binaryHeader + 7) !== 'BIN') {
    throw new Error(`Missing GLB binary chunk: ${path}`);
  }
  if (document.buffers.length !== 1 || document.animations?.length || document.skins?.length ||
      document.images?.some((image) => image.bufferView !== undefined)) {
    throw new Error(`Unsupported GLB structure: ${path}`);
  }
  const binary = source.subarray(binaryHeader + 8, binaryHeader + 8 + source.readUInt32LE(binaryHeader));
  const conveyor = path.endsWith('Conveyor_Custom_Mesh.glb');
  const used = new Set();
  const normalAccessors = new Set();
  for (const mesh of document.meshes) {
    for (const primitive of mesh.primitives) {
      if (conveyor) delete primitive.attributes.TEXCOORD_0;
      for (const [semantic, id] of Object.entries(primitive.attributes)) {
        used.add(id);
        if (semantic === 'NORMAL') normalAccessors.add(id);
      }
      if (primitive.indices !== undefined) used.add(primitive.indices);
      for (const target of primitive.targets ?? []) {
        for (const id of Object.values(target)) used.add(id);
      }
    }
  }

  const oldAccessors = document.accessors;
  const oldViews = document.bufferViews;
  const newAccessors = [];
  const newViews = [];
  const chunks = [];
  const remap = new Map();
  let offset = 0;
  for (const id of [...used].sort((a, b) => a - b)) {
    const accessor = oldAccessors[id];
    if (accessor.sparse || accessor.bufferView === undefined) {
      throw new Error(`Unsupported sparse accessor ${id}: ${path}`);
    }
    const view = oldViews[accessor.bufferView];
    const elements = TYPE_COMPONENTS[accessor.type];
    const elementBytes = elements * COMPONENT_BYTES[accessor.componentType];
    const stride = view.byteStride ?? elementBytes;
    const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    let bytes;
    let next = { ...accessor, bufferView: newViews.length, byteOffset: 0 };
    if (normalAccessors.has(id) && accessor.componentType === 5126 && accessor.type === 'VEC3') {
      bytes = Buffer.alloc(accessor.count * 6);
      for (let vertex = 0; vertex < accessor.count; vertex++) {
        for (let axis = 0; axis < 3; axis++) {
          const normal = binary.readFloatLE(start + vertex * stride + axis * 4);
          bytes.writeInt16LE(Math.round(Math.max(-1, Math.min(1, normal)) * 32767), vertex * 6 + axis * 2);
        }
      }
      next = { ...next, componentType: 5122, normalized: true };
      delete next.min;
      delete next.max;
    } else {
      bytes = Buffer.alloc(accessor.count * elementBytes);
      for (let vertex = 0; vertex < accessor.count; vertex++) {
        binary.copy(bytes, vertex * elementBytes, start + vertex * stride, start + vertex * stride + elementBytes);
      }
    }
    const aligned = pad(bytes);
    newViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, ...(view.target ? { target: view.target } : {}) });
    chunks.push(aligned);
    offset += aligned.length;
    remap.set(id, newAccessors.length);
    newAccessors.push(next);
  }
  for (const mesh of document.meshes) {
    for (const primitive of mesh.primitives) {
      for (const semantic of Object.keys(primitive.attributes)) {
        primitive.attributes[semantic] = remap.get(primitive.attributes[semantic]);
      }
      if (primitive.indices !== undefined) primitive.indices = remap.get(primitive.indices);
      for (const target of primitive.targets ?? []) {
        for (const semantic of Object.keys(target)) target[semantic] = remap.get(target[semantic]);
      }
    }
  }
  document.accessors = newAccessors;
  document.bufferViews = newViews;
  document.buffers = [{ byteLength: offset }];
  const json = pad(Buffer.from(JSON.stringify(document)), 0x20);
  const packedBinary = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write('glTF', 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + packedBinary.length, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(json.length, 0);
  jsonHeader.write('JSON', 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(packedBinary.length, 0);
  binHeader.write('BIN\0', 4);
  await writeFile(path, Buffer.concat([header, jsonHeader, json, binHeader, packedBinary]));
  console.log(`Optimized ${path}: ${source.length} -> ${header.readUInt32LE(8)} bytes`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  for (const path of process.argv.slice(2)) await optimizeGlb(resolve(path));
}
