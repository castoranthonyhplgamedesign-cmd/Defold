import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import type { ConveyorPath } from './conveyorPath';

export type GridPart = {
  kind: 'head' | 'body' | 'corner';
  color: string;
  exitDirection?: Vector3;
  pathIndex?: number;
  mesh: Mesh;
  highlight?: Mesh;
  staticCorner?: Mesh;
  position: Vector3;
  bodyBaseRotation?: Quaternion;
};
export type ArrowGridOptions = {
  cellSize: number;
  speed: number;
  exitDirection: Vector3;
  exitScanDistance: number;
};

type Arrow = {
  parts: GridPart[];
  exitDirection: Vector3;
  clearing: boolean;
  cleared: boolean;
  motion: ClearingMotion | null;
  startOrder: number;
  highlightClearTime: number;
};

type ClearingMotion = {
  progress: number;
  transferred: boolean;
  originPositions: Vector3[];
  originVisible: boolean[];
  cornerOrigins: (Vector3 | null)[];
  cornerEnabled: boolean[];
  starts: Vector3[];
  ends: Vector3[];
  startRotations: Quaternion[];
  endRotations: Quaternion[];
  history: MotionStep[];
  crossingIndex: number;
  crossingProgress: number;
  crossingPoint: Vector3;
  crossed: boolean;
};

type MotionStep = {
  starts: Vector3[];
  ends: Vector3[];
  startRotations: Quaternion[];
  endRotations: Quaternion[];
  progress: number;
};

type BlockedFeedback = {
  arrow: Arrow;
  motion: ClearingMotion;
  elapsed: number;
  returnSeconds: number;
  returnSteps: number;
  contactPositions: Vector3[];
  contactCornerPositions: (Vector3 | null)[];
};

/** Moves each arrow piece along its path, then hands it to a belt slot. */
export class ArrowGrid {
  private readonly arrows: Arrow[];
  private readonly blockedFeedbacks: BlockedFeedback[] = [];
  private interactive = true;
  private nextStartOrder = 0;
  private readonly highlightOffsets = new Map<Mesh, Vector3>();
  private highlightTimer = 0;
  private readonly stepSeconds: number;
  private readonly defaultExitDirection: Vector3;

  constructor(
    private readonly scene: Scene,
    groups: GridPart[][],
    private readonly path: ConveyorPath,
    private readonly insert: (position: Vector3, color: string) => boolean,
    private readonly options: ArrowGridOptions,
  ) {
    this.stepSeconds = options.cellSize / options.speed;
    this.defaultExitDirection = options.exitDirection.normalizeToNew();
    this.arrows = groups.map((group) => {
      const exitDirection = (group.find((part) => part.kind === 'head')?.exitDirection
        ?? this.defaultExitDirection).normalizeToNew();
      const parts = this.order(group, exitDirection);
      const positions = parts.map((part) => part.position);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.highlight) this.highlightOffsets.set(part.mesh, part.highlight.position.subtract(part.mesh.position));
        if (i > 0) {
          const ahead = positions[i - 1].subtract(positions[i]);
          const yaw = Math.atan2(ahead.x, -ahead.z) + Math.PI / 2;
          part.mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(-yaw, 0, 0)
            .multiply(part.bodyBaseRotation!);
        }
        if (part.staticCorner) {
          if (this.isTurn(positions, i)) {
            part.mesh.isVisible = false;
          } else {
            part.staticCorner.setEnabled(false);
          }
        }
      }
      return { parts, exitDirection, clearing: false, cleared: false, motion: null,
        startOrder: 0, highlightClearTime: 0 };
    });
    this.updateHighlightVisibility(0, true);
    const canvas = scene.getEngine().getRenderingCanvas()!;
    canvas.addEventListener('pointerdown', (event) => {
      if (!this.interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * scene.getEngine().getRenderWidth() / rect.width;
      const y = (event.clientY - rect.top) * scene.getEngine().getRenderHeight() / rect.height;
      const viewport = scene.activeCamera!.viewport.toGlobal(
        scene.getEngine().getRenderWidth(), scene.getEngine().getRenderHeight());
      const viewProjection = scene.getTransformMatrix();
      const world = Matrix.Identity();
      const center = this.arrows[0].parts[0].mesh.getBoundingInfo().boundingBox.centerWorld;
      const projected = Vector3.Project(center, world, viewProjection, viewport);
      const projectedNeighbor = Vector3.Project(center.add(new Vector3(options.cellSize, 0, 0)), world, viewProjection, viewport);
      const hitRadius = Math.abs(projectedNeighbor.x - projected.x) * 0.55;
      let nearest: Arrow | null = null;
      let distance = hitRadius ** 2;
      for (const arrow of this.arrows) {
        if (arrow.cleared || arrow.clearing || this.hasBlockedFeedback(arrow)) continue;
        for (const part of arrow.parts) {
          if (!part.mesh.isEnabled()) continue;
          const screen = Vector3.Project(part.mesh.getBoundingInfo().boundingBox.centerWorld,
            world, viewProjection, viewport);
          const gap = (screen.x - x) ** 2 + (screen.y - y) ** 2;
          if (gap < distance) { nearest = arrow; distance = gap; }
        }
      }
      if (nearest) this.start(nearest);
    });
  }

  private order(parts: GridPart[], exitDirection: Vector3): GridPart[] {
    const head = parts.find((part) => part.kind === 'head');
    if (!head) throw new Error('Arrow grid has no head');
    if (parts.every((part) => part.pathIndex !== undefined)) {
      const ordered = [...parts].sort((a, b) => a.pathIndex! - b.pathIndex!);
      if (ordered[0] !== head) throw new Error('Arrow pathIndex 0 must be its head');
      return ordered;
    }
    const ordered = [head];
    const unused = new Set(parts);
    unused.delete(head);
    let direction = exitDirection.scale(-1);
    while (unused.size) {
      const current = ordered[ordered.length - 1];
      let next: GridPart | undefined;
      let best = -Infinity;
      for (const candidate of unused) {
        const offset = candidate.position.subtract(current.position);
        if (Math.abs(offset.length() - this.options.cellSize) > this.options.cellSize * 0.03) continue;
        const score = Vector3.Dot(offset, direction);
        if (score > best) { best = score; next = candidate; }
      }
      if (!next) throw new Error('Arrow grid contains a disconnected segment');
      direction = next.position.subtract(current.position);
      ordered.push(next);
      unused.delete(next);
    }
    return ordered;
  }

  private isTurn(positions: Vector3[], index: number): boolean {
    if (index === 0 || index === positions.length - 1) return false;
    const dxAhead = positions[index - 1].x - positions[index].x;
    const dzAhead = positions[index - 1].z - positions[index].z;
    const dxBehind = positions[index + 1].x - positions[index].x;
    const dzBehind = positions[index + 1].z - positions[index].z;
    return Math.abs(dxAhead * dzBehind - dzAhead * dxBehind)
      > this.options.cellSize * this.options.cellSize * 0.5;
  }

  private blockingDistance(arrow: Arrow): number | null {
    const head = arrow.parts[0].mesh.position;
    const exit = this.path.firstCrossing(head,
      head.add(arrow.exitDirection.scale(this.options.exitScanDistance)));
    if (!exit) return 0;
    const exitDistance = Vector3.Distance(head, exit.position);
    let nearest = Number.POSITIVE_INFINITY;
    for (let j = 0; j < this.arrows.length; j++) {
      const other = this.arrows[j];
      if (other === arrow || other.cleared) continue;
      let feedback: BlockedFeedback | null = null;
      for (let k = 0; k < this.blockedFeedbacks.length; k++) {
        if (this.blockedFeedbacks[k].arrow === other) {
          feedback = this.blockedFeedbacks[k];
          break;
        }
      }
      for (let i = 0; i < other.parts.length; i++) {
        const part = other.parts[i];
        if (!part.mesh.isEnabled()) continue;
        const position = feedback ? feedback.motion.originPositions[i]
          : part.mesh.position;
        const offset = position.subtract(head);
        const forward = Vector3.Dot(offset, arrow.exitDirection);
        const sideDistanceSquared = offset.lengthSquared() - forward * forward;
        if (forward > this.options.cellSize * 0.03 && forward < exitDistance
          && sideDistanceSquared < (this.options.cellSize * 0.55) ** 2) {
          nearest = Math.min(nearest, forward);
        }
      }
    }
    return Number.isFinite(nearest) ? nearest : null;
  }

  private isBlocked(arrow: Arrow): boolean {
    return this.blockingDistance(arrow) !== null;
  }

  private canClear(arrow: Arrow): boolean {
    return !arrow.cleared && !arrow.clearing && !this.hasBlockedFeedback(arrow)
      && arrow.parts[0].mesh.isEnabled() && !this.isBlocked(arrow);
  }

  private hasBlockedFeedback(arrow: Arrow): boolean {
    for (let i = 0; i < this.blockedFeedbacks.length; i++) {
      if (this.blockedFeedbacks[i].arrow === arrow) return true;
    }
    return false;
  }

  isCleared(): boolean {
    for (let i = 0; i < this.arrows.length; i++) {
      if (!this.arrows[i].cleared) return false;
    }
    return true;
  }

  setInteractive(interactive: boolean) {
    this.interactive = interactive;
    this.updateHighlightVisibility();
  }

  private updateHighlightVisibility(dt = 0, immediate = false) {
    for (const arrow of this.arrows) {
      const highlight = arrow.parts[0].highlight;
      if (!highlight) continue;
      const clear = this.interactive && this.canClear(arrow);
      arrow.highlightClearTime = clear
        ? Math.min(0.12, arrow.highlightClearTime + (immediate ? 0.12 : dt)) : 0;
      const visible = clear && arrow.highlightClearTime >= 0.12;
      if (highlight.isEnabled() !== visible) highlight.setEnabled(visible);
    }
  }

  private start(arrow: Arrow) {
    arrow.clearing = true;
    arrow.startOrder = ++this.nextStartOrder;
    const originPositions = arrow.parts.map((part) => part.mesh.position.clone());
    const originVisible = arrow.parts.map((part) => part.mesh.isVisible);
    const cornerOrigins = arrow.parts.map((part) => part.staticCorner?.position.clone() ?? null);
    const cornerEnabled = arrow.parts.map((part) => part.staticCorner?.isEnabled() ?? false);
    for (const part of arrow.parts) {
      part.staticCorner?.setEnabled(false);
      part.mesh.isVisible = true;
    }
    arrow.motion = {
      transferred: false, originPositions, originVisible,
      cornerOrigins, cornerEnabled,
      progress: 0, starts: [], ends: [], startRotations: [], endRotations: [],
      history: [],
      crossingIndex: -1, crossingProgress: 1, crossingPoint: Vector3.Zero(), crossed: false,
    };
    this.updateHighlightVisibility();
    this.prepareStep(arrow);
  }

  private startBlockedFeedback(arrow: Arrow) {
    const motion = arrow.motion!;
    motion.history.push({
      starts: motion.starts, ends: motion.ends,
      startRotations: motion.startRotations, endRotations: motion.endRotations,
      progress: motion.progress,
    });
    const returnSteps = motion.history.length - 1 + motion.progress;
    this.blockedFeedbacks.push({
      arrow, motion, elapsed: 0,
      returnSeconds: Math.max(0.12, returnSteps * this.options.cellSize / (this.options.speed * 1.8)),
      returnSteps,
      contactPositions: arrow.parts.map((part) => part.mesh.position.clone()),
      contactCornerPositions: arrow.parts.map((part) => part.staticCorner?.position.clone() ?? null),
    });
    arrow.clearing = false;
    arrow.motion = null;
    this.updateHighlightVisibility();
  }

  private updateBlockedFeedback(feedback: BlockedFeedback, dt: number): boolean {
    const shakeSeconds = 0.34;
    const cascadeSeconds = Math.min(0.45, (feedback.arrow.parts.length - 1) * 0.07);
    feedback.elapsed += Math.min(dt, 0.05);
    const shakeTotal = shakeSeconds + cascadeSeconds;
    const returning = feedback.elapsed >= shakeTotal;
    const returnProgress = returning
      ? Math.min(1, (feedback.elapsed - shakeTotal) / feedback.returnSeconds) : 0;
    const easedReturn = returnProgress * returnProgress * (3 - 2 * returnProgress);
    const reversePosition = feedback.returnSteps * (1 - easedReturn);
    const stepIndex = Math.min(feedback.motion.history.length - 1, Math.floor(reversePosition));
    const stepProgress = reversePosition - stepIndex;
    const step = feedback.motion.history[stepIndex];
    const direction = feedback.arrow.exitDirection;
    for (let i = 0; i < feedback.arrow.parts.length; i++) {
      const part = feedback.arrow.parts[i];
      const contact = feedback.contactPositions[i];
      let sideways = 0;
      let recoil = 0;
      if (!returning) {
        const delay = feedback.arrow.parts.length > 1
          ? cascadeSeconds * i / (feedback.arrow.parts.length - 1) : 0;
        const t = Math.max(0, Math.min(1, (feedback.elapsed - delay) / shakeSeconds));
        const fade = 1 - t;
        recoil = this.options.cellSize * 0.06 * Math.abs(Math.sin(t * Math.PI * 4)) * fade;
        sideways = this.options.cellSize * 0.11 * Math.sin(t * Math.PI * 4) * fade;
      }
      const dx = -direction.x * recoil - direction.z * sideways;
      const dy = -direction.y * recoil;
      const dz = -direction.z * recoil + direction.x * sideways;
      if (returning) {
        Vector3.LerpToRef(step.starts[i], step.ends[i], stepProgress, part.mesh.position);
        Quaternion.SlerpToRef(step.startRotations[i],
          step.endRotations[i], stepProgress, part.mesh.rotationQuaternion!);
      } else {
        part.mesh.position.copyFrom(contact).addInPlaceFromFloats(dx, dy, dz);
      }
      const contactCorner = feedback.contactCornerPositions[i];
      const originCorner = feedback.motion.cornerOrigins[i];
      if (part.staticCorner && contactCorner && originCorner) {
        if (returning) part.staticCorner.position.copyFrom(originCorner);
        else part.staticCorner.position.copyFrom(contactCorner).addInPlaceFromFloats(dx, dy, dz);
      }
      if (part.highlight) part.highlight.position.copyFrom(part.mesh.position)
        .addInPlace(this.highlightOffsets.get(part.mesh)!);
    }
    if (returnProgress === 1) {
      for (let i = 0; i < feedback.arrow.parts.length; i++) {
        const part = feedback.arrow.parts[i];
        part.mesh.isVisible = feedback.motion.originVisible[i];
        part.staticCorner?.setEnabled(feedback.motion.cornerEnabled[i]);
      }
      return true;
    }
    return false;
  }

  private prepareStep(arrow: Arrow) {
    const motion = arrow.motion!;
    const parts = arrow.parts;
    motion.starts = [];
    motion.ends = [];
    motion.startRotations = [];
    motion.endRotations = [];
    motion.crossingIndex = -1;
    motion.crossingProgress = 1;
    motion.crossed = false;
    for (let i = 0; i < parts.length; i++) {
      const start = parts[i].mesh.position.clone();
      motion.starts.push(start);
      motion.ends.push(i === 0 ? start.add(arrow.exitDirection.scale(this.options.cellSize))
        : parts[i - 1].mesh.position.clone());
      motion.startRotations.push(parts[i].mesh.rotationQuaternion!.clone());
    }
    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        motion.endRotations.push(motion.startRotations[i]);
        continue;
      }
      const ahead = motion.ends[i - 1].subtract(motion.ends[i]);
      const yaw = Math.atan2(ahead.x, -ahead.z) + Math.PI / 2;
      motion.endRotations.push(Quaternion.RotationYawPitchRoll(-yaw, 0, 0)
        .multiply(parts[i].bodyBaseRotation!));
    }
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i].mesh.isEnabled()) continue;
      const crossing = this.path.firstCrossing(motion.starts[i], motion.ends[i]);
      if (crossing) {
        motion.crossingIndex = i;
        motion.crossingProgress = crossing.progress;
        motion.crossingPoint.copyFrom(crossing.position);
      }
    }
  }

  private collidesAt(arrow: Arrow, motion: ClearingMotion, progress: number): boolean {
    const contactRadiusSquared = (this.options.cellSize * 0.78) ** 2;
    for (let i = 0; i < arrow.parts.length; i++) {
      if (!arrow.parts[i].mesh.isEnabled()) continue;
      const start = motion.starts[i];
      const end = motion.ends[i];
      const x = start.x + (end.x - start.x) * progress;
      const z = start.z + (end.z - start.z) * progress;
      for (let j = 0; j < this.arrows.length; j++) {
        const other = this.arrows[j];
        if (other === arrow || other.cleared || this.hasBlockedFeedback(other)
          || (other.clearing && other.startOrder > arrow.startOrder)) continue;
        for (let k = 0; k < other.parts.length; k++) {
          const obstacle = other.parts[k];
          if (!obstacle.mesh.isEnabled()) continue;
          const dx = x - obstacle.mesh.position.x;
          const dz = z - obstacle.mesh.position.z;
          if (dx * dx + dz * dz < contactRadiusSquared) return true;
        }
      }
    }
    return false;
  }

  update(dt: number) {
    for (let i = this.blockedFeedbacks.length - 1; i >= 0; i--) {
      if (this.updateBlockedFeedback(this.blockedFeedbacks[i], dt)) {
        this.blockedFeedbacks.splice(i, 1);
        this.updateHighlightVisibility();
      }
    }
    for (let i = 0; i < this.arrows.length; i++) {
      const arrow = this.arrows[i];
      if (arrow.motion) this.updateClearing(arrow, dt);
    }
    this.highlightTimer += dt;
    if (this.highlightTimer >= 0.05) {
      this.highlightTimer = 0;
      this.updateHighlightVisibility(0.05);
    }
  }

  private updateClearing(arrow: Arrow, dt: number) {
    const motion = arrow.motion!;
    let remaining = Math.min(dt, 0.05);
    while (remaining > 0) {
      const stepTime = Math.min(remaining, (1 - motion.progress) * this.stepSeconds);
      const nextProgress = Math.min(1, motion.progress + stepTime / this.stepSeconds);
      if (this.collidesAt(arrow, motion, nextProgress)) {
        let safe = motion.progress;
        let hit = nextProgress;
        for (let i = 0; i < 8; i++) {
          const middle = (safe + hit) * 0.5;
          if (this.collidesAt(arrow, motion, middle)) hit = middle;
          else safe = middle;
        }
        motion.progress = safe;
        this.placeParts(arrow, motion);
        if (!motion.transferred) this.startBlockedFeedback(arrow);
        return;
      }
      if (!motion.crossed && motion.crossingIndex >= 0 && nextProgress >= motion.crossingProgress) {
        if (!this.insert(motion.crossingPoint, arrow.parts[motion.crossingIndex].color)) {
          motion.progress = motion.crossingProgress;
          this.placeParts(arrow, motion);
          return;
        }
        motion.crossed = true;
        motion.transferred = true;
        const part = arrow.parts[motion.crossingIndex];
        part.mesh.setEnabled(false);
        part.highlight?.setEnabled(false);
      }
      motion.progress = nextProgress;
      remaining -= stepTime;
      this.placeParts(arrow, motion);
      if (motion.progress < 1) return;
      if (arrow.parts.every((part) => !part.mesh.isEnabled())) {
        arrow.cleared = true;
        arrow.clearing = false;
        arrow.motion = null;
        this.updateHighlightVisibility();
        return;
      }
      motion.history.push({
        starts: motion.starts, ends: motion.ends,
        startRotations: motion.startRotations, endRotations: motion.endRotations,
        progress: 1,
      });
      motion.progress = 0;
      this.prepareStep(arrow);
    }
  }

  private placeParts(arrow: Arrow, motion: ClearingMotion) {
    for (let i = 0; i < arrow.parts.length; i++) {
      const part = arrow.parts[i];
      Vector3.LerpToRef(motion.starts[i], motion.ends[i], motion.progress, part.mesh.position);
      if (i > 0) Quaternion.SlerpToRef(motion.startRotations[i], motion.endRotations[i],
        motion.progress, part.mesh.rotationQuaternion!);
      if (part.highlight) part.highlight.position.copyFrom(part.mesh.position).addInPlace(this.highlightOffsets.get(part.mesh)!);
    }
  }
}
