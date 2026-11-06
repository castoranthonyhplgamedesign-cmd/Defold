import type { Scene } from '@babylonjs/core/scene';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Cell } from '../game/types';
import { ASSETS } from '../assets';
import { HAND_POINTER_CONFIG } from '../constants';

type ScreenPoint = {
  x: number;
  y: number;
};

type ActiveHandHint = {
  boardX: number;
  boardZ: number;
  boardRoot: TransformNode;
  direction: Cell;
  distance: number;
};

export class HandPointer {
  private readonly element: HTMLDivElement;
  private readonly image: HTMLImageElement;
  private activeHint: ActiveHandHint | null = null;
  private screenScale = 1;

  constructor(
    private readonly scene: Scene,
    overlayRoot: HTMLElement,
  ) {
    this.element = document.createElement('div');
    this.element.className = 'hand-pointer';
    this.image = document.createElement('img');
    this.image.className = 'hand-pointer__image';
    this.image.src = ASSETS.ui.handPointer;
    this.image.alt = '';
    this.image.draggable = false;
    this.element.appendChild(this.image);
    this.applySizing();
    overlayRoot.appendChild(this.element);
  }

  showAt(boardX: number, boardZ: number, direction: Cell, distance: number, boardRoot: TransformNode): void {
    this.activeHint = {
      boardX,
      boardZ,
      boardRoot,
      direction: { ...direction },
      distance,
    };
    this.renderActiveHint(true);
  }

  relayout(): void {
    if (!this.activeHint) return;

    this.renderActiveHint();
  }

  hide(): void {
    this.activeHint = null;
    this.element.classList.remove('is-visible');
  }

  dispose(): void {
    this.element.remove();
  }

  private renderActiveHint(restartAnimation = false): void {
    const hint = this.activeHint;
    if (!hint) return;
    const { boardX, boardZ, boardRoot, direction, distance } = hint;
    const boardMatrix = boardRoot.computeWorldMatrix(true);
    const startLocal = new Vector3(boardX, HAND_POINTER_CONFIG.worldY, boardZ);
    const start = this.projectToOverlay(Vector3.TransformCoordinates(startLocal, boardMatrix));
    const cellRight = this.projectToOverlay(Vector3.TransformCoordinates(startLocal.add(new Vector3(1, 0, 0)), boardMatrix));
    const end = this.projectToOverlay(Vector3.TransformCoordinates(new Vector3(
      boardX + direction.x * distance,
      HAND_POINTER_CONFIG.worldY,
      boardZ + direction.z * distance,
    ), boardMatrix));

    if (!start || !end || !cellRight) {
      this.element.classList.remove('is-visible');
      return;
    }

    const cellSize = Math.hypot(cellRight.x - start.x, cellRight.y - start.y);
    this.applySizing(cellSize);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const directionRotation = HAND_POINTER_CONFIG.rotateWithDirection ? Math.atan2(dy, dx) + Math.PI / 2 : 0;
    const offsetX = HAND_POINTER_CONFIG.screenOffsetPx[0] * this.screenScale;
    const offsetY = HAND_POINTER_CONFIG.screenOffsetPx[1] * this.screenScale;

    this.element.style.setProperty('--hand-start-x', `${start.x + offsetX}px`);
    this.element.style.setProperty('--hand-start-y', `${start.y + offsetY}px`);
    this.element.style.setProperty('--hand-end-x', `${end.x + offsetX}px`);
    this.element.style.setProperty('--hand-end-y', `${end.y + offsetY}px`);
    this.element.style.setProperty('--hand-direction-rotation', `${directionRotation}rad`);
    // Relayout changes the path in place, preserving animation progress and its hide timer.
    if (restartAnimation) {
      this.element.classList.remove('is-visible');
      void this.element.offsetWidth;
    }
    this.element.classList.add('is-visible');
  }

  private applySizing(cellSize?: number): void {
    const config = HAND_POINTER_CONFIG;
    this.screenScale = this.resolveScreenScale(cellSize);
    this.element.style.setProperty('--hand-width', `${config.widthPx * this.screenScale}px`);
    this.element.style.setProperty('--hand-height', `${config.heightPx * this.screenScale}px`);
    this.element.style.setProperty('--hand-anchor-x', `${config.anchorPx[0] * this.screenScale}px`);
    this.element.style.setProperty('--hand-anchor-y', `${config.anchorPx[1] * this.screenScale}px`);
    this.element.style.setProperty('--hand-base-rotation', `${config.baseRotationDeg}deg`);
    this.element.style.setProperty('--hand-animation-duration', `${config.animationDurationSeconds}s`);
    this.element.style.setProperty('--hand-start-scale', `${config.startScale}`);
    this.element.style.setProperty('--hand-end-scale', `${config.endScale}`);
  }

  private resolveScreenScale(cellSize?: number): number {
    const config = HAND_POINTER_CONFIG.smartScale;
    if (!config.enabled || cellSize === undefined) return 1;

    const scale = cellSize / config.referenceCellSizePx;
    return Math.min(config.maxScale, Math.max(config.minScale, scale));
  }

  private projectToOverlay(point: Vector3): ScreenPoint | null {
    const camera = this.scene.activeCamera;
    const engine = this.scene.getEngine();
    const canvas = engine.getRenderingCanvas();
    if (!camera || !canvas) return null;

    const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
    const projected = Vector3.Project(point, Matrix.Identity(), this.scene.getTransformMatrix(), viewport);
    const scaleX = canvas.clientWidth / Math.max(1, engine.getRenderWidth());
    const scaleY = canvas.clientHeight / Math.max(1, engine.getRenderHeight());

    return {
      x: projected.x * scaleX,
      y: projected.y * scaleY,
    };
  }
}
