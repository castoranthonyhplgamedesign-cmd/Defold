import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

export type BeltMeshPath = { points: Vector3[]; width: number };

/** Trace the two edges of a flat, closed belt surface and run the path between them. */
export function inferBeltMeshPath(mesh: Mesh): BeltMeshPath {
  const positions = mesh.getVerticesData('position');
  const indices = mesh.getIndices();
  if (!positions || !indices || indices.length < 6) {
    throw new Error('Conveyor Belt mesh needs indexed surface triangles');
  }
  mesh.computeWorldMatrix(true);
  const world = mesh.getWorldMatrix();
  const vertices = new Map<string, Vector3>();
  const edges = new Map<string, { a: string; b: string; count: number }>();
  const vertexKey = (index: number) => {
    const point = Vector3.TransformCoordinates(
      Vector3.FromArray(positions, index * 3), world);
    const key = `${Math.round(point.x * 10000)},${Math.round(point.y * 10000)},${Math.round(point.z * 10000)}`;
    if (!vertices.has(key)) vertices.set(key, point);
    return key;
  };
  for (let i = 0; i < indices.length; i += 3) {
    const triangle = [vertexKey(indices[i]), vertexKey(indices[i + 1]), vertexKey(indices[i + 2])];
    for (let side = 0; side < 3; side++) {
      const a = triangle[side];
      const b = triangle[(side + 1) % 3];
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      const edge = edges.get(key);
      if (edge) edge.count++;
      else edges.set(key, { a, b, count: 1 });
    }
  }
  const neighbors = new Map<string, string[]>();
  for (const edge of edges.values()) {
    if (edge.count !== 1) continue;
    for (const [a, b] of [[edge.a, edge.b], [edge.b, edge.a]]) {
      const list = neighbors.get(a) ?? [];
      list.push(b);
      neighbors.set(a, list);
    }
  }
  if ([...neighbors.values()].some((list) => list.length !== 2)) {
    throw new Error('Conveyor Belt must be one flat ring with two continuous edges');
  }
  const visited = new Set<string>();
  const loops: string[][] = [];
  for (const start of neighbors.keys()) {
    if (visited.has(start)) continue;
    const loop: string[] = [];
    let previous = '';
    let current = start;
    do {
      visited.add(current);
      loop.push(current);
      const next = neighbors.get(current)!.find((key) => key !== previous)!;
      previous = current;
      current = next;
    } while (current !== start && !visited.has(current));
    if (current !== start || loop.length < 3) throw new Error('Conveyor Belt edge is not closed');
    loops.push(loop);
  }
  if (loops.length !== 2) {
    throw new Error(`Conveyor Belt needs exactly two edge loops; found ${loops.length}`);
  }
  const length = (loop: string[]) => loop.reduce((total, key, i) =>
    total + Vector3.Distance(vertices.get(key)!, vertices.get(loop[(i + 1) % loop.length])!), 0);
  const inner = length(loops[0]) < length(loops[1]) ? loops[0] : loops[1];
  const outer = inner === loops[0] ? loops[1] : loops[0];
  const outerPoints = outer.map((key) => vertices.get(key)!);
  const outerKeys = new Set(outer);
  const boundary = new Set(neighbors.keys());
  const middle = new Map<string, string[]>();
  const meshNeighbors = new Map<string, string[]>();
  for (const edge of edges.values()) {
    meshNeighbors.set(edge.a, [...(meshNeighbors.get(edge.a) ?? []), edge.b]);
    meshNeighbors.set(edge.b, [...(meshNeighbors.get(edge.b) ?? []), edge.a]);
    if (boundary.has(edge.a) || boundary.has(edge.b)) continue;
    middle.set(edge.a, [...(middle.get(edge.a) ?? []), edge.b]);
    middle.set(edge.b, [...(middle.get(edge.b) ?? []), edge.a]);
  }
  let points: Vector3[] = [];
  // Many conveyor meshes include an authored middle ring. Use it directly: projecting
  // the inner edge onto the outer edge can jump backward around rounded corners.
  if (middle.size >= 3 && [...middle.values()].every((adjacent) => adjacent.length === 2)) {
    const start = middle.keys().next().value!;
    const seen = new Set<string>();
    let previous = '';
    let current = start;
    do {
      seen.add(current);
      points.push(vertices.get(current)!);
      const next = middle.get(current)!.find((key) => key !== previous)!;
      previous = current;
      current = next;
    } while (current !== start && !seen.has(current));
    if (current !== start || seen.size !== middle.size) points = [];
  }
  let totalWidth = 0;
  const projectedPoints: Vector3[] = [];
  for (const key of inner) {
    const point = vertices.get(key)!;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestPoint = Vector3.Zero();
    for (let i = 0; i < outerPoints.length; i++) {
      const a = outerPoints[i];
      const b = outerPoints[(i + 1) % outerPoints.length];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const t = Math.max(0, Math.min(1,
        ((point.x - a.x) * dx + (point.z - a.z) * dz) / (dx * dx + dz * dz)));
      const candidate = new Vector3(a.x + t * dx, a.y + t * (b.y - a.y), a.z + t * dz);
      const distance = (candidate.x - point.x) ** 2 + (candidate.z - point.z) ** 2;
      if (distance < bestDistance) { bestDistance = distance; bestPoint = candidate; }
    }
    if (!points.length) {
      // On a two-row strip, the mesh edges identify which outer vertices belong
      // to this inner vertex, even when another bend is closer in world space.
      const across = meshNeighbors.get(key)?.filter((other) => outerKeys.has(other)) ?? [];
      if (across.length) {
        bestDistance = Number.POSITIVE_INFINITY;
        for (const other of across) {
          const candidate = vertices.get(other)!;
          const distance = (candidate.x - point.x) ** 2 + (candidate.z - point.z) ** 2;
          if (distance < bestDistance) { bestDistance = distance; bestPoint = candidate; }
        }
      }
    }
    totalWidth += Math.sqrt(bestDistance);
    projectedPoints.push(Vector3.Lerp(point, bestPoint, 0.5));
  }
  if (!points.length) {
    points = projectedPoints;
    for (let i = 0; i < points.length; i++) {
      const before = points[(i + points.length - 1) % points.length];
      const point = points[i];
      const after = points[(i + 1) % points.length];
      const ax = point.x - before.x;
      const az = point.z - before.z;
      const bx = after.x - point.x;
      const bz = after.z - point.z;
      if ((ax * bx + az * bz) / (Math.hypot(ax, az) * Math.hypot(bx, bz)) < -0.1) {
        throw new Error('Conveyor Belt center path doubles back; add a continuous middle vertex ring');
      }
    }
  }
  // Positive X/Z signed area gives the clockwise direction used by the slots.
  const area = points.reduce((sum, point, i) => {
    const next = points[(i + 1) % points.length];
    return sum + point.x * next.z - next.x * point.z;
  }, 0);
  if (area < 0) points.reverse();
  return { points, width: totalWidth / inner.length };
}
