import { BufferGeometry, BufferAttribute } from 'three';
import { geometryUrl, geometryManifest } from '../assets';

export async function loadGeometry() {
  const response = await fetch(geometryUrl);
  if (!response.ok) throw new Error('Embedded geometry unavailable');
  const buffer = await response.arrayBuffer();
  const result: Record<string, BufferGeometry[]> = {};
  for (const [name, primitives] of Object.entries(geometryManifest)) {
    result[name] = primitives.map(p => {
      const geometry = new BufferGeometry();
      for (const key of ['position', 'normal', 'index', 'uv'] as const) {
        const a = p[key];
        if (!a) continue;
        const length = a.count * a.components;
        const ArrayType = a.componentType === 5126 ? Float32Array : a.componentType === 5123 ? Uint16Array : Uint32Array;
        const attribute = new BufferAttribute(new ArrayType(buffer, a.offset, length), a.components);
        if (key === 'index') geometry.setIndex(attribute);
        else geometry.setAttribute(key, attribute);
      }
      geometry.computeBoundingBox();
      return geometry;
    });
  }
  return result;
}
