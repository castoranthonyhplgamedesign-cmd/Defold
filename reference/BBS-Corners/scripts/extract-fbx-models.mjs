import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(portRoot, '..');
const sourceRoot = path.join(repoRoot, 'Assets', 'Projects', '2026.06.01 BBS, MIP, Wide U', 'Models');
const outputPath = path.join(portRoot, 'src', 'generated', 'wideUModels.ts');

const FBX_GRID_UNIT = 0.0815;
const HORIZONTAL_SCALE = 1 / FBX_GRID_UNIT;
const VERTICAL_SCALE = 2.9;
const PRECISION = 1000;
const TILE_STUD_BASE_Y = 0.19801;
const TILE_STUD_EXTENSION_HEIGHT = 0.07;
const TILE_STUD_RADIUS = 0.165;
const TILE_STUD_SELECTION_RADIUS = 0.218;
const TILE_STUD_BAND_SEGMENTS = 40;
const TILE_STUD_COLUMN_X = [-0.24, 0.24];
const TILE_SHORT_STUD_ROW_Z = [-0.22, 0.25];
const TILE_LONG_STUD_ROW_Z = [-0.78, -0.27, 0.25, 0.77];

const modelSpecs = [
  ['base', 'SM_Base.fbx'],
  ['border', 'SM_Border 1.fbx'],
  ['borderOuter', 'SM_Border.fbx'],
  ['borderInside', 'SM_Border inside.fbx'],
  ['tileShort', 'SM_Tile_Short.fbx'],
  ['tileLong', 'SM_Tile_Long.fbx'],
  ['gate', 'SM_Gate.fbx'],
];

const models = Object.fromEntries(
  modelSpecs.map(([key, file]) => [key, extractModel(path.join(sourceRoot, file), key)]),
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, renderModule(models));

for (const [key, model] of Object.entries(models)) {
  const triangles = model.indices.length / 3;
  console.log(`${key}: ${model.positions.length / 3} vertices, ${triangles} triangles`);
}
console.log(`Wrote ${path.relative(portRoot, outputPath)}`);

function extractModel(filePath, key) {
  const tree = parseFbxBinary(fs.readFileSync(filePath));
  const geometry = findFirst(tree, 'Geometry');
  if (!geometry) throw new Error(`Missing Geometry in ${filePath}`);

  const model = findFirst(tree, 'Model');
  const modelScale = getModelScale(model);
  const vertices = readRequiredArray(geometry, 'Vertices');
  const polygonVertexIndex = readRequiredArray(geometry, 'PolygonVertexIndex');
  const normals = readRequiredArray(geometry, 'Normals');
  const normalsIndex = readRequiredArray(geometry, 'NormalsIndex');
  const uvs = readRequiredArray(geometry, 'UV');
  const uvIndex = readRequiredArray(geometry, 'UVIndex');

  const polygons = collectPolygons(polygonVertexIndex);
  const materialIndices = readMaterialIndices(geometry, polygons.length);
  const triangles = [];

  for (let polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {
    const polygon = polygons[polygonIndex];
    const materialIndex = materialIndices?.[polygonIndex] ?? 0;
    for (let i = 1; i < polygon.length - 1; i++) {
      const triangle = {
        materialIndex,
        vertices: [],
      };

      for (const polygonVertex of [polygon[0], polygon[i + 1], polygon[i]]) {
        const vertexOffset = polygonVertex.vertexIndex * 3;
        const sourceX = vertices[vertexOffset] * modelScale[0];
        const sourceY = vertices[vertexOffset + 1] * modelScale[1];
        const sourceZ = vertices[vertexOffset + 2] * modelScale[2];

        const normalIndex = normalsIndex[polygonVertex.polygonVertexIndex] ?? polygonVertex.vertexIndex;
        const normalOffset = normalIndex * 3;

        const sourceUvIndex = uvIndex[polygonVertex.polygonVertexIndex] ?? polygonVertex.vertexIndex;
        const uvOffset = sourceUvIndex * 2;
        triangle.vertices.push({
          position: [
            round(sourceX * HORIZONTAL_SCALE),
            round(sourceZ * VERTICAL_SCALE),
            round(sourceY * HORIZONTAL_SCALE),
          ],
          normal: [
            round(normals[normalOffset] ?? 0),
            round(normals[normalOffset + 2] ?? 1),
            round(normals[normalOffset + 1] ?? 0),
          ],
          uv: [
            round(uvs[uvOffset] ?? 0),
            round(1 - (uvs[uvOffset + 1] ?? 0)),
          ],
        });
      }

      triangles.push(triangle);
    }
  }

  triangles.sort((a, b) => a.materialIndex - b.materialIndex);

  const positionsOut = [];
  const normalsOut = [];
  const uvsOut = [];
  const indicesOut = [];
  const materialSlots = [];
  let currentMaterialIndex = null;
  let currentIndexStart = 0;
  let nextIndex = 0;

  for (const triangle of triangles) {
    if (triangle.materialIndex !== currentMaterialIndex) {
      if (currentMaterialIndex !== null) {
        materialSlots.push({
          materialIndex: currentMaterialIndex,
          indexStart: currentIndexStart,
          indexCount: indicesOut.length - currentIndexStart,
        });
      }

      currentMaterialIndex = triangle.materialIndex;
      currentIndexStart = indicesOut.length;
    }

    for (const vertex of triangle.vertices) {
      positionsOut.push(...vertex.position);
      normalsOut.push(...vertex.normal);
      uvsOut.push(...vertex.uv);
      indicesOut.push(nextIndex++);
    }
  }

  if (currentMaterialIndex !== null) {
    materialSlots.push({
      materialIndex: currentMaterialIndex,
      indexStart: currentIndexStart,
      indexCount: indicesOut.length - currentIndexStart,
    });
  }

  if (key === 'tileShort' || key === 'tileLong') {
    extendTileStuds(key, positionsOut, uvsOut, indicesOut);
  }

  const bakedNormals = key === 'tileShort' || key === 'tileLong'
    ? computeFlatNormals(positionsOut, indicesOut)
    : normalsOut;

  return {
    positions: positionsOut,
    normals: bakedNormals,
    uvs: uvsOut,
    indices: indicesOut,
    bounds: getBounds(positionsOut),
    materialSlots: shouldEmitMaterialSlots(materialSlots) ? materialSlots : undefined,
  };
}

function extendTileStuds(key, positions, uvs, indices) {
  if (TILE_STUD_EXTENSION_HEIGHT <= 0) return;

  const centers = findTileStudCenters(key, positions);
  const originalVertexCount = positions.length / 3;

  for (let vertexIndex = 0; vertexIndex < originalVertexCount; vertexIndex++) {
    const offset = vertexIndex * 3;
    if (positions[offset + 1] < TILE_STUD_BASE_Y - 0.0005) continue;
    if (!isWithinAnyStud(positions[offset], positions[offset + 2], centers, TILE_STUD_SELECTION_RADIUS)) continue;

    positions[offset + 1] = round(positions[offset + 1] + TILE_STUD_EXTENSION_HEIGHT);
  }

  for (const center of centers) {
    appendStudExtensionBand(center, positions, uvs, indices);
  }
}

function findTileStudCenters(key, positions) {
  const rowSeeds = key === 'tileShort'
    ? TILE_SHORT_STUD_ROW_Z
    : TILE_LONG_STUD_ROW_Z;
  let centers = rowSeeds.flatMap((z) => TILE_STUD_COLUMN_X.map((x) => [x, z]));
  const points = [];

  for (let offset = 0; offset < positions.length; offset += 3) {
    if (positions[offset + 1] > 0.238) {
      points.push([positions[offset], positions[offset + 2]]);
    }
  }

  for (let iteration = 0; iteration < 25; iteration++) {
    const sums = centers.map(() => [0, 0, 0]);

    for (const point of points) {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < centers.length; index++) {
        const center = centers[index];
        const dx = point[0] - center[0];
        const dz = point[1] - center[1];
        const distance = dx * dx + dz * dz;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }

      sums[bestIndex][0] += point[0];
      sums[bestIndex][1] += point[1];
      sums[bestIndex][2]++;
    }

    centers = centers.map((center, index) => {
      const sum = sums[index];
      return sum[2] > 0
        ? [sum[0] / sum[2], sum[1] / sum[2]]
        : center;
    });
  }

  return centers;
}

function appendStudExtensionBand(center, positions, uvs, indices) {
  for (let segment = 0; segment < TILE_STUD_BAND_SEGMENTS; segment++) {
    const angleA = (segment / TILE_STUD_BAND_SEGMENTS) * Math.PI * 2;
    const angleB = ((segment + 1) / TILE_STUD_BAND_SEGMENTS) * Math.PI * 2;
    const bottomA = getStudBandPoint(center, angleA, TILE_STUD_BASE_Y);
    const bottomB = getStudBandPoint(center, angleB, TILE_STUD_BASE_Y);
    const topA = getStudBandPoint(center, angleA, TILE_STUD_BASE_Y + TILE_STUD_EXTENSION_HEIGHT);
    const topB = getStudBandPoint(center, angleB, TILE_STUD_BASE_Y + TILE_STUD_EXTENSION_HEIGHT);
    const uA = segment / TILE_STUD_BAND_SEGMENTS;
    const uB = (segment + 1) / TILE_STUD_BAND_SEGMENTS;

    appendTriangle(positions, uvs, indices, [
      { position: bottomA, uv: [uA, 1] },
      { position: topA, uv: [uA, 0] },
      { position: bottomB, uv: [uB, 1] },
    ]);
    appendTriangle(positions, uvs, indices, [
      { position: bottomB, uv: [uB, 1] },
      { position: topA, uv: [uA, 0] },
      { position: topB, uv: [uB, 0] },
    ]);
  }
}

function getStudBandPoint(center, angle, y) {
  return [
    round(center[0] + Math.cos(angle) * TILE_STUD_RADIUS),
    round(y),
    round(center[1] + Math.sin(angle) * TILE_STUD_RADIUS),
  ];
}

function appendTriangle(positions, uvs, indices, vertices) {
  for (const vertex of vertices) {
    indices.push(positions.length / 3);
    positions.push(...vertex.position);
    uvs.push(...vertex.uv);
  }
}

function isWithinAnyStud(x, z, centers, radius) {
  return centers.some((center) => Math.hypot(x - center[0], z - center[1]) <= radius);
}

function computeFlatNormals(positions, indices) {
  const normals = new Array(positions.length).fill(0);

  for (let index = 0; index < indices.length; index += 3) {
    const a = indices[index] * 3;
    const b = indices[index + 1] * 3;
    const c = indices[index + 2] * 3;

    const abX = positions[b] - positions[a];
    const abY = positions[b + 1] - positions[a + 1];
    const abZ = positions[b + 2] - positions[a + 2];
    const acX = positions[c] - positions[a];
    const acY = positions[c + 1] - positions[a + 1];
    const acZ = positions[c + 2] - positions[a + 2];
    let normalX = abY * acZ - abZ * acY;
    let normalY = abZ * acX - abX * acZ;
    let normalZ = abX * acY - abY * acX;
    const length = Math.hypot(normalX, normalY, normalZ) || 1;
    normalX /= length;
    normalY /= length;
    normalZ /= length;

    for (const offset of [a, b, c]) {
      normals[offset] = round(normalX);
      normals[offset + 1] = round(normalY);
      normals[offset + 2] = round(normalZ);
    }
  }

  return normals;
}

function parseFbxBinary(buffer) {
  const magic = buffer.subarray(0, 20).toString('utf8');
  if (magic !== 'Kaydara FBX Binary  ') {
    throw new Error('Only binary FBX files are supported.');
  }

  let offset = 27;
  const version = buffer.readUInt32LE(23);
  const isLargeNode = version >= 7500;
  const roots = [];

  while (offset < buffer.length - nodeHeaderSize(isLargeNode)) {
    const node = readNode();
    if (!node) break;
    roots.push(node);
  }

  return { name: 'Root', props: [], children: roots };

  function readNode() {
    const startOffset = offset;
    const endOffset = readOffset();
    const numProps = readOffset();
    readOffset();
    const nameLength = buffer[offset++];

    if (endOffset === 0 && numProps === 0 && nameLength === 0) return null;
    if (endOffset <= startOffset) return null;

    const name = buffer.subarray(offset, offset + nameLength).toString('utf8');
    offset += nameLength;

    const props = [];
    for (let i = 0; i < numProps; i++) {
      props.push(readProperty());
    }

    const children = [];
    while (offset < endOffset) {
      const child = readNode();
      if (!child) break;
      children.push(child);
    }

    offset = endOffset;
    return { name, props, children };
  }

  function readOffset() {
    if (!isLargeNode) {
      const value = buffer.readUInt32LE(offset);
      offset += 4;
      return value;
    }

    const value = Number(buffer.readBigUInt64LE(offset));
    offset += 8;
    return value;
  }

  function readProperty() {
    const type = String.fromCharCode(buffer[offset++]);
    switch (type) {
      case 'Y': {
        const value = buffer.readInt16LE(offset);
        offset += 2;
        return value;
      }
      case 'C':
        return buffer[offset++] !== 0;
      case 'I': {
        const value = buffer.readInt32LE(offset);
        offset += 4;
        return value;
      }
      case 'F': {
        const value = buffer.readFloatLE(offset);
        offset += 4;
        return value;
      }
      case 'D': {
        const value = buffer.readDoubleLE(offset);
        offset += 8;
        return value;
      }
      case 'L': {
        const value = Number(buffer.readBigInt64LE(offset));
        offset += 8;
        return value;
      }
      case 'f':
      case 'd':
      case 'l':
      case 'i':
      case 'b':
        return readArrayProperty(type);
      case 'S':
        return readBlob().toString('utf8');
      case 'R':
        return readBlob();
      default:
        throw new Error(`Unsupported FBX property type "${type}" at ${offset - 1}`);
    }
  }

  function readArrayProperty(type) {
    const length = buffer.readUInt32LE(offset);
    const encoding = buffer.readUInt32LE(offset + 4);
    const byteLength = buffer.readUInt32LE(offset + 8);
    offset += 12;

    let data = buffer.subarray(offset, offset + byteLength);
    offset += byteLength;
    if (encoding === 1) data = zlib.inflateSync(data);
    if (encoding !== 0 && encoding !== 1) throw new Error(`Unsupported FBX array encoding ${encoding}`);

    const stride = { f: 4, d: 8, l: 8, i: 4, b: 1 }[type];
    const values = new Array(length);
    for (let i = 0; i < length; i++) {
      const pos = i * stride;
      values[i] = type === 'f'
        ? data.readFloatLE(pos)
        : type === 'd'
          ? data.readDoubleLE(pos)
          : type === 'l'
            ? Number(data.readBigInt64LE(pos))
            : type === 'i'
              ? data.readInt32LE(pos)
              : data[pos];
    }

    return values;
  }

  function readBlob() {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    const value = buffer.subarray(offset, offset + length);
    offset += length;
    return value;
  }
}

function nodeHeaderSize(isLargeNode) {
  return isLargeNode ? 25 : 13;
}

function findFirst(node, name) {
  if (node.name === name) return node;
  for (const child of node.children ?? []) {
    const match = findFirst(child, name);
    if (match) return match;
  }

  return null;
}

function findAll(node, name, matches = []) {
  if (node.name === name) matches.push(node);
  for (const child of node.children ?? []) findAll(child, name, matches);
  return matches;
}

function readRequiredArray(node, name) {
  const found = findFirst(node, name);
  const value = found?.props?.[0];
  if (!Array.isArray(value)) throw new Error(`Missing array node ${name}`);
  return value;
}

function readMaterialIndices(geometry, polygonCount) {
  const layer = findFirst(geometry, 'LayerElementMaterial');
  if (!layer) return null;

  const mappingType = findFirst(layer, 'MappingInformationType')?.props?.[0] ?? 'AllSame';
  const referenceType = findFirst(layer, 'ReferenceInformationType')?.props?.[0] ?? 'Direct';
  const values = findFirst(layer, 'Materials')?.props?.[0];
  if (!Array.isArray(values) || values.length === 0) return null;

  if (mappingType === 'AllSame') {
    return new Array(polygonCount).fill(resolveMaterialIndex(values, 0, referenceType));
  }

  if (mappingType !== 'ByPolygon') {
    return null;
  }

  const indices = [];
  for (let polygonIndex = 0; polygonIndex < polygonCount; polygonIndex++) {
    indices.push(resolveMaterialIndex(values, polygonIndex, referenceType));
  }

  return indices;
}

function resolveMaterialIndex(values, index, referenceType) {
  const rawValue = values[index] ?? values[0] ?? 0;
  if (referenceType === 'IndexToDirect' || referenceType === 'Direct') {
    return Math.max(0, Number(rawValue) || 0);
  }

  return 0;
}

function shouldEmitMaterialSlots(materialSlots) {
  if (materialSlots.length <= 1) return false;
  return new Set(materialSlots.map((slot) => slot.materialIndex)).size > 1;
}

function getModelScale(model) {
  if (!model) return [1, 1, 1];

  const properties = findFirst(model, 'Properties70');
  if (!properties) return [1, 1, 1];

  for (const prop of findAll(properties, 'P')) {
    if (prop.props[0] === 'Lcl Scaling') {
      return [Number(prop.props[4]), Number(prop.props[5]), Number(prop.props[6])];
    }
  }

  return [1, 1, 1];
}

function collectPolygons(polygonVertexIndex) {
  const polygons = [];
  let current = [];
  for (let i = 0; i < polygonVertexIndex.length; i++) {
    const rawIndex = polygonVertexIndex[i];
    const isLast = rawIndex < 0;
    current.push({
      vertexIndex: isLast ? -rawIndex - 1 : rawIndex,
      polygonVertexIndex: i,
    });

    if (isLast) {
      polygons.push(current);
      current = [];
    }
  }

  return polygons;
}

function getBounds(positions) {
  const min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  for (let i = 0; i < positions.length; i += 3) {
    min[0] = Math.min(min[0], positions[i]);
    min[1] = Math.min(min[1], positions[i + 1]);
    min[2] = Math.min(min[2], positions[i + 2]);
    max[0] = Math.max(max[0], positions[i]);
    max[1] = Math.max(max[1], positions[i + 1]);
    max[2] = Math.max(max[2], positions[i + 2]);
  }

  return { min, max };
}

function renderModule(modelMap) {
  const entries = Object.entries(modelMap)
    .map(([key, model]) => `  ${key}: ${renderModel(model)}`)
    .join(',\n');

  return `// Generated by scripts/extract-fbx-models.mjs. Do not edit manually.\n\nexport type WideUModelKey = 'base' | 'border' | 'borderOuter' | 'borderInside' | 'tileShort' | 'tileLong' | 'gate';\n\nexport type WideUModelMaterialSlot = {\n  materialIndex: number;\n  indexStart: number;\n  indexCount: number;\n};\n\nexport type WideUModelMesh = {\n  positions: number[];\n  normals: number[];\n  materialSlots?: WideUModelMaterialSlot[];\n  bounds: {\n    min: [number, number, number];\n    max: [number, number, number];\n  };\n};\n\nexport const WIDE_U_MODELS: Record<WideUModelKey, WideUModelMesh> = {\n${entries},\n};\n`;
}

function renderModel(model) {
  const materialSlots = model.materialSlots
    ? `\n    materialSlots: ${renderMaterialSlots(model.materialSlots)},`
    : '';
  return `{\n    positions: ${renderArray(model.positions)},\n    normals: ${renderArray(model.normals)},${materialSlots}\n    bounds: { min: ${renderTuple(model.bounds.min)}, max: ${renderTuple(model.bounds.max)} },\n  }`;
}

function renderArray(values) {
  return `[${values.join(',')}]`;
}

function renderTuple(values) {
  return `[${values.map(round).join(',')}]`;
}

function renderMaterialSlots(slots) {
  return `[${slots.map((slot) => `{ materialIndex: ${slot.materialIndex}, indexStart: ${slot.indexStart}, indexCount: ${slot.indexCount} }`).join(', ')}]`;
}

function round(value) {
  return Math.round(value * PRECISION) / PRECISION;
}
