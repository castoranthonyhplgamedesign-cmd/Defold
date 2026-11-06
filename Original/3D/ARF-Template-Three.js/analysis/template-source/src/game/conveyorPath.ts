import { Vector3 } from '@babylonjs/core/Maths/math.vector';

export type PathCrossing = { position: Vector3; progress: number };

/** A closed belt path. Game systems use distance along this path, never scene axes. */
export interface ConveyorPath {
  readonly length: number;
  sample(distance: number, position: Vector3, tangent: Vector3): void;
  nearestDistance(position: Vector3): number;
  firstCrossing(start: Vector3, end: Vector3): PathCrossing | null;
}

abstract class SampledLoop implements ConveyorPath {
  abstract readonly length: number;
  abstract sample(distance: number, position: Vector3, tangent: Vector3): void;

  nearestDistance(target: Vector3): number {
    const position = Vector3.Zero();
    const tangent = Vector3.Zero();
    const count = Math.max(512, Math.ceil(this.length / 0.05));
    let best = Number.POSITIVE_INFINITY;
    let result = 0;
    for (let i = 0; i < count; i++) {
      const distance = i * this.length / count;
      this.sample(distance, position, tangent);
      const separation = (target.x - position.x) ** 2 + (target.z - position.z) ** 2;
      if (separation < best) { best = separation; result = distance; }
    }
    return result;
  }

  firstCrossing(start: Vector3, end: Vector3): PathCrossing | null {
    const count = Math.max(128, Math.ceil(this.length / 0.2));
    const a = Vector3.Zero();
    const b = Vector3.Zero();
    const tangent = Vector3.Zero();
    this.sample(0, a, tangent);
    let bestProgress = Number.POSITIVE_INFINITY;
    for (let i = 1; i <= count; i++) {
      this.sample(i * this.length / count, b, tangent);
      const rx = end.x - start.x;
      const rz = end.z - start.z;
      const sx = b.x - a.x;
      const sz = b.z - a.z;
      const denominator = rx * sz - rz * sx;
      if (Math.abs(denominator) > 1e-8) {
        const qx = a.x - start.x;
        const qz = a.z - start.z;
        const progress = (qx * sz - qz * sx) / denominator;
        const pathProgress = (qx * rz - qz * rx) / denominator;
        if (progress >= 0 && progress <= 1 && pathProgress >= 0 && pathProgress <= 1
          && progress < bestProgress) bestProgress = progress;
      }
      a.copyFrom(b);
    }
    return Number.isFinite(bestProgress)
      ? { position: Vector3.Lerp(start, end, bestProgress), progress: bestProgress }
      : null;
  }
}

/** Exact straight sides and circular corners for the supplied Unity conveyor. */
export class RoundedRectanglePath extends SampledLoop {
  readonly length: number;
  private readonly cornerLength: number;
  private readonly horizontalLength: number;
  private readonly verticalLength: number;

  constructor(
    private readonly left: number,
    private readonly right: number,
    private readonly top: number,
    private readonly bottom: number,
    private readonly radius: number,
  ) {
    super();
    this.cornerLength = Math.PI * radius / 2;
    this.horizontalLength = right - left - 2 * radius;
    this.verticalLength = bottom - top - 2 * radius;
    if (this.horizontalLength <= 0 || this.verticalLength <= 0) throw new Error('Conveyor rectangle is too small for its radius');
    this.length = 4 * this.cornerLength + 2 * this.horizontalLength + 2 * this.verticalLength;
  }

  static fromPlacements(points: Vector3[], maximumRadius: number): RoundedRectanglePath {
    if (points.length < 8) throw new Error('A rounded conveyor needs at least eight placements');
    const xs = points.map((point) => point.x).sort((a, b) => a - b);
    const zs = points.map((point) => point.z).sort((a, b) => a - b);
    const edgeMiddle = Math.min(4, Math.floor(points.length / 8));
    const left = (xs[edgeMiddle - 1] + xs[edgeMiddle]) / 2;
    const right = (xs[xs.length - edgeMiddle - 1] + xs[xs.length - edgeMiddle]) / 2;
    const top = (zs[edgeMiddle - 1] + zs[edgeMiddle]) / 2;
    const bottom = (zs[zs.length - edgeMiddle - 1] + zs[zs.length - edgeMiddle]) / 2;
    const radius = Math.min(maximumRadius, (right - left) / 3, (bottom - top) / 3);
    return new RoundedRectanglePath(left, right, top, bottom, radius);
  }

  sample(distance: number, position: Vector3, tangent: Vector3) {
    let wrapped = ((distance % this.length) + this.length) % this.length;
    const r = this.radius;
    const corner = this.cornerLength;
    const horizontal = this.horizontalLength;
    const vertical = this.verticalLength;
    let angle: number;
    if (wrapped < corner) {
      angle = Math.PI + wrapped / r;
      position.set(this.left + r + r * Math.cos(angle), 0, this.top + r + r * Math.sin(angle));
      tangent.set(-Math.sin(angle), 0, Math.cos(angle));
      return;
    }
    wrapped -= corner;
    if (wrapped < horizontal) { position.set(this.left + r + wrapped, 0, this.top); tangent.set(1, 0, 0); return; }
    wrapped -= horizontal;
    if (wrapped < corner) {
      angle = 3 * Math.PI / 2 + wrapped / r;
      position.set(this.right - r + r * Math.cos(angle), 0, this.top + r + r * Math.sin(angle));
      tangent.set(-Math.sin(angle), 0, Math.cos(angle));
      return;
    }
    wrapped -= corner;
    if (wrapped < vertical) { position.set(this.right, 0, this.top + r + wrapped); tangent.set(0, 0, 1); return; }
    wrapped -= vertical;
    if (wrapped < corner) {
      angle = wrapped / r;
      position.set(this.right - r + r * Math.cos(angle), 0, this.bottom - r + r * Math.sin(angle));
      tangent.set(-Math.sin(angle), 0, Math.cos(angle));
      return;
    }
    wrapped -= corner;
    if (wrapped < horizontal) { position.set(this.right - r - wrapped, 0, this.bottom); tangent.set(-1, 0, 0); return; }
    wrapped -= horizontal;
    if (wrapped < corner) {
      angle = Math.PI / 2 + wrapped / r;
      position.set(this.left + r + r * Math.cos(angle), 0, this.bottom - r + r * Math.sin(angle));
      tangent.set(-Math.sin(angle), 0, Math.cos(angle));
      return;
    }
    wrapped -= corner;
    position.set(this.left, 0, this.bottom - r - wrapped);
    tangent.set(0, 0, -1);
  }
}

/** Ordered loop points for a future belt of any shape. Add points around bends for smooth motion. */
export class WaypointLoopPath extends SampledLoop {
  readonly length: number;
  private readonly distances: number[] = [0];

  constructor(private readonly points: Vector3[]) {
    super();
    if (points.length < 3) throw new Error('A conveyor loop needs at least three points');
    for (let i = 0; i < points.length; i++) {
      const length = Vector3.Distance(points[i], points[(i + 1) % points.length]);
      if (length <= 0) throw new Error('Conveyor loop has duplicate adjacent points');
      this.distances.push(this.distances[i] + length);
    }
    this.length = this.distances[points.length];
  }

  sample(distance: number, position: Vector3, tangent: Vector3) {
    const wrapped = ((distance % this.length) + this.length) % this.length;
    let index = 0;
    while (index < this.points.length - 1 && wrapped >= this.distances[index + 1]) index++;
    const next = (index + 1) % this.points.length;
    const fraction = (wrapped - this.distances[index]) / (this.distances[index + 1] - this.distances[index]);
    Vector3.LerpToRef(this.points[index], this.points[next], fraction, position);
    this.points[next].subtractToRef(this.points[index], tangent);
    tangent.normalize();
  }
}
