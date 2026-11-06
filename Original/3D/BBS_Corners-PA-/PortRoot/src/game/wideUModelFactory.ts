import type { Material } from '@babylonjs/core/Materials/material';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { SubMesh } from '@babylonjs/core/Meshes/subMesh';
import type { Scene } from '@babylonjs/core/scene';
import { WIDE_U_MODELS, type WideUModelKey, type WideUModelMesh } from '../generated/wideUModels';

export type WideUModelMaterialInput = Material | readonly Material[];

const SMOOTHED_BLOCK_KEYS = new Set<WideUModelKey>(['tileShort', 'tileLong']);
const POSITION_KEY_PRECISION = 1000;

export function createWideUModelMesh(scene: Scene, key: WideUModelKey, name: string, material: WideUModelMaterialInput): Mesh {
  const model = WIDE_U_MODELS[key];
  const mesh = new Mesh(name, scene);
  const vertexData = new VertexData();
  vertexData.positions = model.positions;
  vertexData.normals = SMOOTHED_BLOCK_KEYS.has(key) ? createSmoothedNormals(model.positions) : model.normals;
  vertexData.indices = createSequentialIndices(model.positions.length / 3);
  vertexData.applyToMesh(mesh);
  applyModelMaterial(scene, mesh, model, name, material);
  mesh.alwaysSelectAsActiveMesh = true;
  return mesh;
}

function createSequentialIndices(vertexCount: number): number[] {
  return Array.from({ length: vertexCount }, (_, index) => index);
}

function createSmoothedNormals(positions: number[]): number[] {
  const vertexCount = positions.length / 3;
  const normalSums = new Map<string, [number, number, number]>();
  const vertexKeys: string[] = [];

  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
    const offset = vertexIndex * 3;
    vertexKeys[vertexIndex] = getPositionKey(positions[offset], positions[offset + 1], positions[offset + 2]);
  }

  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 3) {
    const a = vertexIndex * 3;
    const b = a + 3;
    const c = a + 6;
    const normal = getTriangleNormal(positions, a, b, c);

    for (const key of [vertexKeys[vertexIndex], vertexKeys[vertexIndex + 1], vertexKeys[vertexIndex + 2]]) {
      const sum = normalSums.get(key);
      if (sum) {
        sum[0] += normal[0];
        sum[1] += normal[1];
        sum[2] += normal[2];
      } else {
        normalSums.set(key, [...normal]);
      }
    }
  }

  const smoothedNormals: number[] = [];
  for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
    smoothedNormals.push(...normalize(normalSums.get(vertexKeys[vertexIndex]) ?? [0, 1, 0]));
  }

  return smoothedNormals;
}

function getPositionKey(x: number, y: number, z: number): string {
  return [
    Math.round(x * POSITION_KEY_PRECISION),
    Math.round(y * POSITION_KEY_PRECISION),
    Math.round(z * POSITION_KEY_PRECISION),
  ].join(',');
}

function getTriangleNormal(
  positions: number[],
  a: number,
  b: number,
  c: number,
): [number, number, number] {
  const abX = positions[b] - positions[a];
  const abY = positions[b + 1] - positions[a + 1];
  const abZ = positions[b + 2] - positions[a + 2];
  const acX = positions[c] - positions[a];
  const acY = positions[c + 1] - positions[a + 1];
  const acZ = positions[c + 2] - positions[a + 2];

  return normalize([
    abY * acZ - abZ * acY,
    abZ * acX - abX * acZ,
    abX * acY - abY * acX,
  ]);
}

function normalize([x, y, z]: [number, number, number]): [number, number, number] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function applyModelMaterial(
  scene: Scene,
  mesh: Mesh,
  model: WideUModelMesh,
  name: string,
  material: WideUModelMaterialInput,
): void {
  if (!isMaterialList(material)) {
    mesh.material = material;
    return;
  }

  if (!model.materialSlots || model.materialSlots.length === 0 || material.length <= 1) {
    mesh.material = material[0] ?? null;
    return;
  }

  const multiMaterial = new MultiMaterial(`${name}-multi-material`, scene);
  for (let index = 0; index < material.length; index++) {
    multiMaterial.subMaterials[index] = material[index] ?? null;
  }

  mesh.material = multiMaterial;
  mesh.subMeshes = [];

  const vertexCount = model.positions.length / 3;
  for (const slot of model.materialSlots) {
    const materialIndex = Math.min(slot.materialIndex, material.length - 1);
    new SubMesh(materialIndex, 0, vertexCount, slot.indexStart, slot.indexCount, mesh);
  }
}

function isMaterialList(material: WideUModelMaterialInput): material is readonly Material[] {
  return Array.isArray(material);
}
