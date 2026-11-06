import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { FresnelParameters } from '@babylonjs/core/Materials/fresnelParameters';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { Scene } from '@babylonjs/core/scene';
import { trackEvent } from '../analytics';
import { wideUScene } from '../data/wideUScene';
import { COLOR_HEX, type BrickColor } from '../data/colors';
import { ASSET_SIZING, gateVisualName, type BoardRootAssetSizing, type Vec3Sizing } from '../data/assetSizing';
import type { BabylonRuntime } from '../engine/createEngine';
import { applyCameraFitForViewport } from '../engine/camera';
import { BoardState } from './board';
import { EndCardController } from './endcard';
import { HintPlanner } from './hints';
import { IterationController } from './iterationController';
import { AudioController } from './audio';
import { getOverlayRoot } from '../ui/overlay';
import { HandPointer } from '../ui/handPointer';
import { notifyGameStart, triggerCTA } from '../networks';
import {
  ACTIVE_NETWORK,
  ACTIVE_HEADER_VARIANT,
  ABSORB_ANIMATION_CONFIG,
  BOARD_MATERIAL_CONFIG,
  CONTACT_SHADOW_CONFIG,
  FOOTER_UI_CONFIG,
  HEADER_CONFIG,
  HINT_CONFIG,
  MATERIAL_LIGHTING_CONFIG,
} from '../constants';
import { ASSETS } from '../assets';
import type { BrickState, Cell, GateState } from './types';
import { createWideUModelMesh } from './wideUModelFactory';
import { WIDE_U_MODELS, type WideUModelKey } from '../generated/wideUModels';
import { findTouchedGateAtOrigin } from './gateRelease';
import {
  resolveDragDisplayOrigin,
  resolveDragFollowTarget,
  resolveSlideDrag,
  type DragAxis,
  type DragBounds,
  type SlideDragResult,
} from './drag';

type DragState = {
  brickId: string;
  startOrigin: Cell;
  displayOrigin: Cell;
  targetPointerOrigin: Cell;
  pointerWorldOffset: Cell;
  lockedAxis: DragAxis | null;
  candidateOrigin: Cell;
  dropOrigin: Cell;
  direction: Cell;
  rawStep: number;
  dropStep: number;
  isValid: boolean;
  moved: boolean;
};

type PointerLikeEvent = {
  clientX: number;
  clientY: number;
  preventDefault: () => void;
  pointerId?: number;
};

type Orientation = 'portrait' | 'landscape';

const CAMERA_BOARD_FIT = {
  closestZ: 0,
  stepZ: 0.2,
  maxIterations: 40,
  orthoScaleStep: 1.005,
  maxOrthoScale: 2.5,
  clearanceMinX: -4.45,
  clearanceMaxX: 4.45,
  clearanceMinY: -0.2,
  clearanceMaxY: 0.8,
} as const;

function toVector3(value: Vec3Sizing): Vector3 {
  return new Vector3(value[0], value[1], value[2]);
}

function toColor3(value: readonly [number, number, number]): Color3 {
  return new Color3(value[0], value[1], value[2]);
}

function clampColorChannel(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function boostColorSaturation(color: Color3, saturationBoost: number): Color3 {
  if (saturationBoost === 1) return color;

  const luma = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
  return new Color3(
    clampColorChannel(luma + (color.r - luma) * saturationBoost),
    clampColorChannel(luma + (color.g - luma) * saturationBoost),
    clampColorChannel(luma + (color.b - luma) * saturationBoost),
  );
}

function getGateRootRotationY(gate: GateState): number {
  if (gate.acceptDirection[2] > 0) return ASSET_SIZING.gates.rootRotationY.top;
  if (gate.acceptDirection[0] < 0) return ASSET_SIZING.gates.rootRotationY.left;
  if (gate.acceptDirection[0] > 0) return ASSET_SIZING.gates.rootRotationY.right;
  return 0;
}

export class GameApp {
  private readonly board = new BoardState(wideUScene);
  private readonly audio = new AudioController();
  private readonly overlayRoot = getOverlayRoot();
  private readonly endcard = new EndCardController(this.overlayRoot);
  private readonly handPointer: HandPointer;
  private readonly hintPlanner = new HintPlanner(this.board, wideUScene.gates);
  private readonly iteration = new IterationController({
    onRedirectRequested: () => triggerCTA(),
    onEndCardRequested: (isWin) => this.showEndcard(isWin),
  });
  private readonly materials = new Map<string, StandardMaterial>();
  private readonly brickNodes = new Map<string, TransformNode>();
  private readonly gateNodes = new Map<string, TransformNode>();
  private readonly gateSpinNodes = new Map<string, TransformNode>();
  private readonly gateGrinderTeeth = new Map<string, TransformNode>();
  private readonly brickShadowNodes = new Map<string, Mesh>();
  private readonly inputDisposers: Array<() => void> = [];
  private boardRoot: TransformNode | null = null;
  private dragState: DragState | null = null;
  private hintDelaySeconds = 0;
  private hintVisible = false;
  private hintReplayTimeoutId: number | null = null;
  private activeAbsorbs = 0;
  private readonly gateBounceTokens = new WeakMap<TransformNode, number>();
  private readonly gateRestY = new WeakMap<TransformNode, number>();
  private readonly brickVisualTokens = new Map<string, number>();
  private gateBounceToken = 0;
  private gateGrinderSpinToken = 0;
  private brickVisualToken = 0;
  private started = false;
  private lastTime = performance.now();

  constructor(private readonly runtime: BabylonRuntime) {
    this.handPointer = new HandPointer(runtime.scene, this.overlayRoot);
  }

  start(): void {
    this.createReferenceHud();
    this.createReferenceVisualScene();
    this.positionTutorialCopy();
    this.createInputHandling();
    this.scheduleHint(Number.POSITIVE_INFINITY);
    this.runtime.scene.onAfterRenderObservable.addOnce(() => {
      this.positionTutorialCopy();
      this.fitBoardBetweenUi();
      window.requestAnimationFrame(() => {
        this.positionTutorialCopy();
        this.fitBoardBetweenUi();
      });
      this.scheduleHint(HINT_CONFIG.firstDelaySeconds);
    });
    trackEvent('DISPLAYED');
  }

  update(): void {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.iteration.update(dt);
    this.updateActiveDrag(dt);
    this.updateHints(dt);
  }

  relayout(): void {
    this.applyHeaderUiConfig();
    this.applyFooterUiConfig();
    this.fitBoardBetweenUi();
    this.handPointer.relayout();
    window.requestAnimationFrame(() => {
      this.applyHeaderUiConfig();
      this.applyFooterUiConfig();
      this.fitBoardBetweenUi();
      this.handPointer.relayout();
    });
  }

  registerFirstInput(): void {
    this.audio.unlock();
    this.audio.playBgm();

    if (this.started) return;
    this.started = true;
    notifyGameStart();
    trackEvent('CHALLENGE_STARTED');
    this.iteration.start();
  }

  registerBrickClick(): void {
    this.registerFirstInput();
    this.iteration.registerClick();
  }

  registerBrickRemoved(): void {
    if (this.board.areAllColoredBricksCleared()) {
      this.iteration.win();
    }
  }

  dispose(): void {
    for (const disposeInput of this.inputDisposers) disposeInput();
    this.inputDisposers.length = 0;
    this.clearHintReplayTimeout();
    this.handPointer.dispose();
    this.runtime.scene.dispose();
  }

  private updateHints(dt: number): void {
    if (this.isInputLocked() || this.dragState || this.hintVisible) return;

    this.hintDelaySeconds -= dt;
    if (this.hintDelaySeconds > 0) return;

    this.showNextHint();
  }

  private scheduleHint(delaySeconds = HINT_CONFIG.delaySeconds): void {
    this.clearHintReplayTimeout();
    this.hintDelaySeconds = delaySeconds;
    this.hintVisible = false;
  }

  private showNextHint(): void {
    const candidate = this.hintPlanner.findHint();
    if (!candidate) {
      this.handPointer.hide();
      this.scheduleHint(HINT_CONFIG.delaySeconds);
      return;
    }

    const brick = this.board.getBrick(candidate.hintBrickId);
    if (!brick || !brick.active) {
      this.handPointer.hide();
      this.scheduleHint(HINT_CONFIG.restartAfterInputDelay);
      return;
    }

    const center = this.getBrickCenter(brick);
    const distance = this.hintPlanner.getHintMoveDistance(candidate.hintBrickId, candidate.direction);
    if (!this.boardRoot) return;
    this.handPointer.showAt(center.x, center.z, candidate.direction, distance, this.boardRoot);
    this.showGateFeedback(candidate.targetGateId, 'hint');
    this.hintPlanner.rememberHint(candidate);
    this.hintVisible = true;
    this.queueHintHide();
  }

  private hideHintAndRestart(delaySeconds = HINT_CONFIG.restartAfterInputDelay): void {
    this.clearHintReplayTimeout();
    this.handPointer.hide();
    this.scheduleHint(delaySeconds);
  }

  private queueHintHide(): void {
    this.clearHintReplayTimeout();
    this.hintReplayTimeoutId = window.setTimeout(() => {
      this.hintReplayTimeoutId = null;
      this.handPointer.hide();
      this.scheduleHint(HINT_CONFIG.loopDelaySeconds);
    }, HINT_CONFIG.visibleSeconds * 1000);
  }

  private clearHintReplayTimeout(): void {
    if (this.hintReplayTimeoutId === null) return;

    window.clearTimeout(this.hintReplayTimeoutId);
    this.hintReplayTimeoutId = null;
  }

  private showEndcard(isWin: boolean): void {
    this.stopTutorialHints();
    this.endcard.show(isWin);
  }

  private stopTutorialHints(): void {
    this.clearHintReplayTimeout();
    this.handPointer.hide();
    this.hintVisible = false;
    this.hintDelaySeconds = Number.POSITIVE_INFINITY;
  }

  private createReferenceHud(): void {
    if (this.overlayRoot.querySelector('.reference-hud')) return;

    this.overlayRoot.insertAdjacentHTML(
      'afterbegin',
      `<div class="reference-hud">
        <div class="ad-header">
          <div class="tutorial-copy">I can't reach all the colors...</div>
        </div>
        <div class="ad-footer">
          <div class="footer-app-icon" aria-label="Block Buster">
            <img class="footer-app-icon__image" src="${ASSETS.ui.appIcon}" alt="" draggable="false" />
          </div>
          <button class="footer-cta" type="button" aria-label="Play Now">
            <img class="footer-cta__image" src="${ASSETS.ui.playNow}" alt="" draggable="false" />
          </button>
        </div>
      </div>`,
    );

    this.applyHeaderUiConfig();
    this.applyFooterUiConfig();

    const ctaTargets = [
      ...this.overlayRoot.querySelectorAll<HTMLElement>('.footer-cta, .footer-app-icon'),
    ];
    let lastCtaInputAt = 0;
    const handleCtaPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      const target = event.currentTarget;
      if (target instanceof HTMLElement && target.classList.contains('footer-cta')) {
        target.classList.add('is-pressed');
        window.setTimeout(() => target.classList.remove('is-pressed'), 180);
      }
    };
    const handleCtaInput = (event: PointerEvent | TouchEvent) => {
      event.preventDefault();
      const now = performance.now();
      if (now - lastCtaInputAt < 350) return;

      lastCtaInputAt = now;
      trackEvent('CTA_CLICKED');
      triggerCTA();
    };
    for (const target of ctaTargets) {
      target.addEventListener('pointerdown', handleCtaPointerDown);
      target.addEventListener('pointerup', handleCtaInput);
      target.addEventListener('touchend', handleCtaInput);
    }
    this.inputDisposers.push(() => {
      for (const target of ctaTargets) {
        target.removeEventListener('pointerdown', handleCtaPointerDown);
        target.removeEventListener('pointerup', handleCtaInput);
        target.removeEventListener('touchend', handleCtaInput);
      }
    });
  }

  private positionTutorialCopy(): void {
    this.applyHeaderUiConfig();
  }

  private applyHeaderUiConfig(): void {
    const header = this.overlayRoot.querySelector<HTMLElement>('.ad-header');
    const copy = this.overlayRoot.querySelector<HTMLElement>('.tutorial-copy');
    if (!header || !copy) return;

    const overlayRect = this.overlayRoot.getBoundingClientRect();
    const orientation = this.getScreenOrientation(overlayRect);
    const config = HEADER_CONFIG[orientation];
    const headerScale = this.getHeaderScale(overlayRect, config.smartScale);
    const headerHeight = Math.round(config.heightPx * headerScale);
    const adjustsForDynamicIsland = ACTIVE_HEADER_VARIANT === 'v2';
    const safeAreaFallbackTop = adjustsForDynamicIsland
      ? Math.round(config.safeAreaTopFallbackPx * headerScale)
      : 0;
    const [top, right, bottom, left] = config.paddingPx.map((value) => Math.round(value * headerScale));

    header.dataset.orientation = orientation;
    header.dataset.headerVariant = ACTIVE_HEADER_VARIANT;
    header.style.setProperty('--header-height', `${headerHeight}px`);
    header.style.setProperty('--header-safe-area-top-env', '0px');
    header.style.setProperty('--header-safe-area-top-fallback', `${safeAreaFallbackTop}px`);
    header.style.setProperty('--header-padding-top', `${top}px`);
    header.style.setProperty('--header-padding-right', `${right}px`);
    header.style.setProperty('--header-padding-bottom', `${bottom}px`);
    header.style.setProperty('--header-padding-left', `${left}px`);
    copy.style.setProperty('--tutorial-copy-font-size', `${Math.round(config.fontSizePx * headerScale)}px`);
  }

  private getHeaderScale(
    overlayRect: DOMRect,
    config: { readonly enabled: boolean; readonly referenceShortSidePx: number; readonly minScale: number; readonly maxScale: number },
  ): number {
    if (!config.enabled || overlayRect.width <= 0 || overlayRect.height <= 0) return 1;

    const shortSide = Math.min(overlayRect.width, overlayRect.height);
    const scale = shortSide / config.referenceShortSidePx;
    return Math.min(config.maxScale, Math.max(config.minScale, scale));
  }

  private applyFooterUiConfig(): void {
    const footer = this.overlayRoot.querySelector<HTMLElement>('.ad-footer');
    if (!footer) return;

    const overlayRect = this.overlayRoot.getBoundingClientRect();
    const orientation = this.getScreenOrientation(overlayRect);
    const config = FOOTER_UI_CONFIG[orientation];
    const footerScale = this.getFooterScale(overlayRect, config.smartScale);
    const footerHeight = Math.round(config.heightPx * footerScale);
    const [top, right, bottom, left] = config.paddingPx.map((value) => Math.round(value * footerScale));
    const appIconHeight = Math.round(footerHeight * config.appIcon.heightRatio);
    const appIconWidth = Math.round(appIconHeight * config.appIcon.aspectRatio);
    const playNowHeight = Math.round(footerHeight * config.playNow.heightRatio);
    const playNowWidth = Math.round(playNowHeight * config.playNow.aspectRatio);

    footer.dataset.orientation = orientation;
    footer.style.setProperty('--footer-height', `${footerHeight}px`);
    footer.style.setProperty('--footer-padding', `${top}px ${right}px ${bottom}px ${left}px`);
    footer.style.setProperty('--footer-app-icon-width', `${appIconWidth}px`);
    footer.style.setProperty('--footer-app-icon-height', `${appIconHeight}px`);
    footer.style.setProperty('--footer-play-now-width', `${playNowWidth}px`);
    footer.style.setProperty('--footer-play-now-height', `${playNowHeight}px`);
  }

  private getFooterScale(
    overlayRect: DOMRect,
    config: { readonly enabled: boolean; readonly referenceShortSidePx: number; readonly minScale: number; readonly maxScale: number },
  ): number {
    if (!config.enabled || overlayRect.width <= 0 || overlayRect.height <= 0) return 1;

    const shortSide = Math.min(overlayRect.width, overlayRect.height);
    const scale = shortSide / config.referenceShortSidePx;
    return Math.min(config.maxScale, Math.max(config.minScale, scale));
  }

  private getScreenOrientation(rect = this.overlayRoot.getBoundingClientRect()): Orientation {
    return rect.width > rect.height ? 'landscape' : 'portrait';
  }

  private createReferenceVisualScene(): void {
    const scene = this.runtime.scene;
    const root = new TransformNode('reference-board-root', scene);
    this.boardRoot = root;
    this.positionBoardRoot();

    this.createBoardFrame(root, scene);
    this.createBricksFromManifest(root, scene);
    this.createTopGates(root, scene);
    this.createSideGates(root, scene);
    this.initializeGateVfxMaterials(scene);
  }

  private positionBoardRoot(): void {
    if (!this.boardRoot) return;

    this.boardRoot.position = this.getAnchoredBoardRootPosition();
    this.boardRoot.computeWorldMatrix(true);
  }

  private fitBoardBetweenUi(): void {
    const camera = this.runtime.camera;
    const { width: viewportWidth, height: viewportHeight } = this.runtime.canvas.getBoundingClientRect();
    if (viewportWidth <= 0 || viewportHeight <= 0) return;
    applyCameraFitForViewport(camera, viewportWidth, viewportHeight);
    const target = camera.getTarget().clone();
    const baseOrthoTop = camera.orthoTop ?? 0;
    const baseOrthoBottom = camera.orthoBottom ?? 0;
    const baseOrthoLeft = camera.orthoLeft ?? 0;
    const baseOrthoRight = camera.orthoRight ?? 0;
    const orientation = this.getScreenOrientation();

    this.positionBoardRoot();
    if (!this.doesBoardOverlapHeaderOrFooter()) return;

    if (orientation === 'landscape') {
      for (let iteration = 0; iteration < CAMERA_BOARD_FIT.maxIterations; iteration += 1) {
        const nextZ = Math.min(CAMERA_BOARD_FIT.closestZ, camera.position.z + CAMERA_BOARD_FIT.stepZ);
        if (nextZ === camera.position.z) break;

        camera.position.z = nextZ;
        camera.setTarget(target);
        this.runtime.scene.updateTransformMatrix(true);
        this.positionBoardRoot();
        if (!this.doesBoardOverlapHeaderOrFooter()) return;
      }
    }

    for (let scale = CAMERA_BOARD_FIT.orthoScaleStep; scale <= CAMERA_BOARD_FIT.maxOrthoScale; scale *= CAMERA_BOARD_FIT.orthoScaleStep) {
      this.scaleCameraOrtho(baseOrthoLeft, baseOrthoRight, baseOrthoBottom, baseOrthoTop, scale);
      this.positionBoardRoot();
      if (!this.doesBoardOverlapHeaderOrFooter()) return;
    }

    this.positionBoardRoot();
  }

  private scaleCameraOrtho(left: number, right: number, bottom: number, top: number, scale: number): void {
    const camera = this.runtime.camera;
    camera.orthoLeft = left * scale;
    camera.orthoRight = right * scale;
    camera.orthoBottom = bottom * scale;
    camera.orthoTop = top * scale;
    this.runtime.scene.updateTransformMatrix(true);
  }

  private getAnchoredBoardRootPosition(): Vector3 {
    const config = this.getBoardRootSizing();
    const orientation = this.getScreenOrientation();
    const offset = toVector3(config[orientation].offset);
    const screenSpaceOffset = new Vector3(offset.x, offset.y, 0);
    const boardVisualCenter = this.getBoardVisualCenterLocal(config);
    const anchorPlaneY = config.anchorPlaneY + screenSpaceOffset.y + boardVisualCenter.y;
    const screenAnchorPoint = this.getWorldPointAtBoardAnchor(config.screenAnchor, anchorPlaneY);

    if (!screenAnchorPoint) return screenSpaceOffset.subtract(boardVisualCenter);

    return screenAnchorPoint.subtract(boardVisualCenter).add(screenSpaceOffset);
  }

  private getBoardVisualCenterLocal(config: BoardRootAssetSizing): Vector3 {
    return toVector3(config.headerClearanceProbe)
      .add(toVector3(config.footerClearanceProbe))
      .scale(0.5);
  }

  private getWorldPointAtBoardAnchor(screenAnchor: readonly [number, number], planeY: number): Vector3 | null {
    const canvasRect = this.runtime.canvas.getBoundingClientRect();
    const headerRect = this.overlayRoot.querySelector<HTMLElement>('.ad-header')?.getBoundingClientRect();
    const footerRect = this.overlayRoot.querySelector<HTMLElement>('.ad-footer')?.getBoundingClientRect();
    const headerHeight = headerRect?.height ?? 0;
    const footerHeight = footerRect?.height ?? 0;
    const availableHeight = Math.max(1, canvasRect.height - headerHeight - footerHeight);
    const safeAnchor: readonly [number, number] = [
      screenAnchor[0],
      (headerHeight + availableHeight * screenAnchor[1]) / Math.max(1, canvasRect.height),
    ];

    return this.getWorldPointAtScreenAnchor(safeAnchor, planeY);
  }

  private doesBoardOverlapHeaderOrFooter(): boolean {
    if (!this.boardRoot) return false;

    const config = this.getBoardRootSizing();
    const headerRect = this.overlayRoot.querySelector<HTMLElement>('.ad-header')?.getBoundingClientRect();
    const footerRect = this.overlayRoot.querySelector<HTMLElement>('.ad-footer')?.getBoundingClientRect();
    const canvasRect = this.runtime.canvas.getBoundingClientRect();
    const headerBottom = headerRect ? headerRect.bottom - canvasRect.top : 0;
    const footerTop = footerRect ? footerRect.top - canvasRect.top : canvasRect.height;
    const minTopPx = headerBottom + config.headerGapPx;
    const maxBottomPx = footerTop - config.footerGapPx;
    const boardBounds = this.getProjectedBoardClearanceBounds(config);
    if (!boardBounds) return false;

    return boardBounds.top < minTopPx || boardBounds.bottom > maxBottomPx;
  }

  private getProjectedBoardClearanceBounds(config: BoardRootAssetSizing): { top: number; bottom: number } | null {
    if (!this.boardRoot) return null;

    const rootPosition = this.boardRoot.position;
    const yValues = [CAMERA_BOARD_FIT.clearanceMinY, CAMERA_BOARD_FIT.clearanceMaxY];
    const xValues = [CAMERA_BOARD_FIT.clearanceMinX, CAMERA_BOARD_FIT.clearanceMaxX];
    const zValues = [config.footerClearanceProbe[2], config.headerClearanceProbe[2]];
    const projectedY: number[] = [];

    for (const x of xValues) {
      for (const y of yValues) {
        for (const z of zValues) {
          const screenPoint = this.projectWorldToCanvasPoint(rootPosition.add(new Vector3(x, y, z)));
          if (screenPoint) projectedY.push(screenPoint.y);
        }
      }
    }

    if (projectedY.length === 0) return null;

    return {
      top: Math.min(...projectedY),
      bottom: Math.max(...projectedY),
    };
  }

  private getBoardRootSizing(): BoardRootAssetSizing {
    return ASSET_SIZING.scene.boardRoot[ACTIVE_HEADER_VARIANT];
  }

  private getWorldPointAtScreenAnchor(screenAnchor: readonly [number, number], planeY: number): Vector3 | null {
    const scene = this.runtime.scene;
    const camera = scene.activeCamera;
    if (!camera) return null;

    const canvasRect = this.runtime.canvas.getBoundingClientRect();
    const screenX = canvasRect.width * screenAnchor[0];
    const screenY = canvasRect.height * screenAnchor[1];
    const ray = scene.createPickingRay(screenX, screenY, Matrix.Identity(), camera);
    if (Math.abs(ray.direction.y) < 0.0001) return null;

    const distance = (planeY - ray.origin.y) / ray.direction.y;
    if (distance < 0) return null;

    return ray.origin.add(ray.direction.scale(distance));
  }

  private projectWorldToCanvasPoint(point: Vector3): { x: number; y: number } | null {
    const scene = this.runtime.scene;
    const camera = scene.activeCamera;
    if (!camera) return null;

    const renderWidth = this.runtime.engine.getRenderWidth();
    const renderHeight = this.runtime.engine.getRenderHeight();
    if (renderWidth <= 0 || renderHeight <= 0) return null;

    const canvasRect = this.runtime.canvas.getBoundingClientRect();
    const viewport = camera.viewport.toGlobal(renderWidth, renderHeight);
    const projected = Vector3.Project(
      point,
      Matrix.IdentityReadOnly,
      scene.getTransformMatrix(),
      viewport,
    );

    return {
      x: projected.x * (canvasRect.width / Math.max(1, renderWidth)),
      y: projected.y * (canvasRect.height / Math.max(1, renderHeight)),
    };
  }

  private createBoardFrame(parent: TransformNode, scene: Scene): void {
    const base = this.createBoardBaseSurface(scene);
    base.parent = parent;
    base.isPickable = false;

    const borderOuter = this.createMatteModel(scene, 'borderOuter', 'board-border-outer-model', BOARD_MATERIAL_CONFIG.borderHex);
    borderOuter.position = toVector3(ASSET_SIZING.board.borderOuter.position);
    borderOuter.scaling = toVector3(ASSET_SIZING.board.borderOuter.scale);
    borderOuter.parent = parent;
    borderOuter.isPickable = false;

    const borderInside = this.createMatteModel(scene, 'borderInside', 'board-border-inside-model', BOARD_MATERIAL_CONFIG.borderHex);
    borderInside.position = toVector3(ASSET_SIZING.board.borderInside.position);
    borderInside.scaling = toVector3(ASSET_SIZING.board.borderInside.scale);
    borderInside.parent = parent;
    borderInside.isPickable = false;
  }

  private createBoardBaseSurface(scene: Scene): Mesh {
    const mesh = new Mesh('board-base-cutout-surface', scene);
    const y = ASSET_SIZING.board.base.position[1];
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    const addQuad = (minX: number, maxX: number, minZ: number, maxZ: number): void => {
      const start = positions.length / 3;
      positions.push(
        minX, y, minZ,
        maxX, y, minZ,
        maxX, y, maxZ,
        minX, y, maxZ,
      );
      indices.push(start, start + 1, start + 2, start, start + 2, start + 3);

      const bottomLeft = this.getBoardBaseUvAt(minX, minZ);
      const bottomRight = this.getBoardBaseUvAt(maxX, minZ);
      const topRight = this.getBoardBaseUvAt(maxX, maxZ);
      const topLeft = this.getBoardBaseUvAt(minX, maxZ);
      uvs.push(
        bottomLeft[0], bottomLeft[1],
        bottomRight[0], bottomRight[1],
        topRight[0], topRight[1],
        topLeft[0], topLeft[1],
      );
    };

    const baseBounds = WIDE_U_MODELS.base.bounds;
    const baseOffset = ASSET_SIZING.board.base.position;
    const board = {
      minX: baseBounds.min[0] + baseOffset[0],
      maxX: baseBounds.max[0] + baseOffset[0],
      minZ: baseBounds.min[2] + baseOffset[2],
      maxZ: baseBounds.max[2] + baseOffset[2],
    };
    const middleCutout = { minX: -1.12, maxX: 1.12, minZ: -1.08, maxZ: 5.08 };

    addQuad(board.minX, board.maxX, board.minZ, middleCutout.minZ);
    addQuad(board.minX, middleCutout.minX, middleCutout.minZ, middleCutout.maxZ);
    addQuad(middleCutout.maxX, board.maxX, middleCutout.minZ, middleCutout.maxZ);
    addQuad(board.minX, board.maxX, middleCutout.maxZ, board.maxZ);

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.uvs = uvs;
    vertexData.applyToMesh(mesh);

    mesh.material = this.getBoardBaseMaterial(scene);
    return mesh;
  }

  private getBoardBaseUvAt(x: number, z: number): readonly [number, number] {
    const textureSize = 1024;
    const cellPitchPx = 84;
    const leftPx = 10;
    const topPx = 178;
    const u = (leftPx + (z + 4.5) * cellPitchPx) / textureSize;
    const v = (topPx + (x + 3.5) * cellPitchPx) / textureSize;
    return [u, v];
  }

  private createBricksFromManifest(parent: TransformNode, scene: Scene): void {
    for (const brick of this.board.getActiveBricks()) {
      const node = new TransformNode(`${brick.id}-root`, scene);
      node.parent = parent;
      node.position = this.cellToWorld(brick.origin, ASSET_SIZING.bricks.rootY);
      this.brickNodes.set(brick.id, node);

      this.createBrickShadow(node, scene, brick);
      this.createBrickModel(node, scene, brick);
      this.createBrickHitbox(node, scene, brick);
    }
  }

  private createBrickShadow(parent: TransformNode, scene: Scene, brick: BrickState): void {
    if (!CONTACT_SHADOW_CONFIG.enabled) return;

    const bounds = this.getBrickLocalBounds(brick);
    const config = CONTACT_SHADOW_CONFIG.bricks;
    const shadow = MeshBuilder.CreateGround(`${brick.id}-contact-shadow`, {
      width: bounds.maxX - bounds.minX + 1 + config.padding,
      height: bounds.maxZ - bounds.minZ + 1 + config.padding,
      subdivisions: 1,
    }, scene);
    shadow.position = new Vector3(
      (bounds.minX + bounds.maxX) * 0.5 + config.offset[0],
      CONTACT_SHADOW_CONFIG.bricks.y - parent.position.y + config.offset[1],
      (bounds.minZ + bounds.maxZ) * 0.5 + config.offset[2],
    );
    shadow.parent = parent;
    shadow.isPickable = false;
    shadow.alwaysSelectAsActiveMesh = true;
    shadow.material = this.getContactShadowMaterial(scene, 'brick', CONTACT_SHADOW_CONFIG.bricks.alpha);
    this.brickShadowNodes.set(brick.id, shadow);
  }

  private createBrickModel(parent: TransformNode, scene: Scene, brick: BrickState): void {
    const modelKey = brick.meshKey === 'brick_1x2' ? 'tileLong' : 'tileShort';
    const tile = this.createModel(scene, modelKey, `${brick.id}-model`, COLOR_HEX[brick.color]);
    const offset = this.getBrickModelOffset(brick);
    tile.position = new Vector3(offset.x, ASSET_SIZING.bricks.modelY, offset.z);
    tile.scaling = toVector3(ASSET_SIZING.bricks.modelByKey[modelKey].scale);
    tile.parent = parent;
    this.tagBrickMesh(tile, brick.id);
  }

  private createBrickHitbox(parent: TransformNode, scene: Scene, brick: BrickState): void {
    const { minX, maxX, minZ, maxZ } = this.getBrickLocalBounds(brick);

    const hitbox = MeshBuilder.CreateBox(`${brick.id}-hitbox`, {
      width: maxX - minX + ASSET_SIZING.bricks.hitbox.padding,
      depth: maxZ - minZ + ASSET_SIZING.bricks.hitbox.padding,
      height: ASSET_SIZING.bricks.hitbox.height,
    }, scene);
    hitbox.position = new Vector3((minX + maxX) * 0.5, ASSET_SIZING.bricks.hitbox.y, (minZ + maxZ) * 0.5);
    hitbox.parent = parent;
    hitbox.visibility = 1;
    hitbox.isPickable = true;
    hitbox.alwaysSelectAsActiveMesh = true;
    hitbox.material = this.getHitboxMaterial(scene);
    this.tagBrickMesh(hitbox, brick.id);
  }

  private createTopGates(parent: TransformNode, scene: Scene): void {
    const topGates = wideUScene.gates
      .filter((gate) => gate.acceptDirection[2] > 0)
      .sort((a, b) => a.position[0] - b.position[0]);

    for (const gateState of topGates) {
      const gateName = gateVisualName(gateState.color);
      const gateSizing = ASSET_SIZING.gates.byColor[gateState.color];
      const rotationY = getGateRootRotationY(gateState);
      this.createGateShadow(parent, scene, gateState, gateSizing.rootScale, rotationY);

      const gateRoot = new TransformNode(`${gateName}-root`, scene);
      gateRoot.position = new Vector3(gateState.position[0], gateState.position[1], gateState.position[2]);
      gateRoot.scaling = toVector3(gateSizing.rootScale);
      gateRoot.rotation.y = rotationY;
      gateRoot.parent = parent;
      this.gateNodes.set(gateState.id, gateRoot);

      const gatePivot = this.createGateSpinPivot(scene, `${gateName}-spin-pivot`, gateRoot, gateSizing.modelPosition);
      const gate = this.createGateModel(scene, `${gateName}-model`, gateState.color);
      gate.position = this.getGateModelPivotOffset();
      gate.parent = gatePivot;
      gate.isPickable = false;
      this.gateSpinNodes.set(gateState.id, gatePivot);
      this.createGateGrinderTeeth(scene, gatePivot, gateState);
    }
  }

  private createSideGates(parent: TransformNode, scene: Scene): void {
    const sideGates = wideUScene.gates.filter((gate) => Math.abs(gate.acceptDirection[0]) > 0);

    for (const gateState of sideGates) {
      const gateName = gateVisualName(gateState.color);
      const gateSizing = ASSET_SIZING.gates.byColor[gateState.color];
      const rotationY = getGateRootRotationY(gateState);
      this.createGateShadow(parent, scene, gateState, gateSizing.rootScale, rotationY);

      const gateRoot = new TransformNode(`${gateName}-root`, scene);
      gateRoot.position = new Vector3(gateState.position[0], gateState.position[1], gateState.position[2]);
      gateRoot.scaling = toVector3(gateSizing.rootScale);
      gateRoot.rotation.y = rotationY;
      gateRoot.parent = parent;
      this.gateNodes.set(gateState.id, gateRoot);

      const gatePivot = this.createGateSpinPivot(scene, `${gateName}-spin-pivot`, gateRoot, gateSizing.modelPosition);
      const tab = this.createGateModel(scene, `${gateName}-model`, gateState.color);
      tab.position = this.getGateModelPivotOffset();
      tab.parent = gatePivot;
      tab.isPickable = false;
      this.gateSpinNodes.set(gateState.id, gatePivot);
      this.createGateGrinderTeeth(scene, gatePivot, gateState);
    }
  }

  private createGateSpinPivot(scene: Scene, name: string, parent: TransformNode, modelPosition: Vec3Sizing): TransformNode {
    const pivot = new TransformNode(name, scene);
    pivot.position = toVector3(modelPosition).add(this.getGateModelBoundsCenter());
    pivot.parent = parent;
    return pivot;
  }

  private getGateModelPivotOffset(): Vector3 {
    return this.getGateModelBoundsCenter().scale(-1);
  }

  private getGateModelBoundsCenter(): Vector3 {
    const bounds = WIDE_U_MODELS.gate.bounds;
    return new Vector3(
      (bounds.min[0] + bounds.max[0]) * 0.5,
      (bounds.min[1] + bounds.max[1]) * 0.5,
      (bounds.min[2] + bounds.max[2]) * 0.5,
    );
  }

  private createGateGrinderTeeth(scene: Scene, parent: TransformNode, gate: GateState): void {
    const config = ASSET_SIZING.gates.feedback.grinder;
    if (!config.enabled) return;

    const teethRoot = new TransformNode(`${gate.id}-grinder-teeth-root`, scene);
    teethRoot.parent = parent;
    const bodyMaterial = this.getGateGrinderToothMaterial(scene, gate.color);
    const bounds = WIDE_U_MODELS.gate.bounds;
    const halfX = (bounds.max[0] - bounds.min[0]) * 0.5;
    const halfY = (bounds.max[1] - bounds.min[1]) * 0.5;
    const toothHalfX = config.toothBlockSize[0] * 0.5;
    const toothHalfY = config.toothBlockSize[1] * 0.5;
    const radiusX = halfX + toothHalfX + config.toothOutset;
    const radiusY = halfY + toothHalfY + config.toothOutset;
    const minZ = bounds.min[2] + config.toothBlockSize[2] * 0.85;
    const maxZ = bounds.max[2] - config.toothBlockSize[2] * 0.85;
    const rows = Math.max(1, config.toothRows);
    const teethPerRow = Math.max(1, Math.ceil(config.toothCount / rows));

    for (let toothIndex = 0; toothIndex < config.toothCount; toothIndex++) {
      const row = Math.floor(toothIndex / teethPerRow);
      const column = toothIndex % teethPerRow;
      const rowT = rows <= 1 ? 0.5 : row / (rows - 1);
      const angle = ((column + (row % 2) * 0.5) / teethPerRow) * Math.PI * 2;
      const tooth = MeshBuilder.CreateBox(`${gate.id}-grinder-tooth-${toothIndex}`, {
        width: config.toothBlockSize[0],
        height: config.toothBlockSize[1],
        depth: config.toothBlockSize[2],
      }, scene);
      tooth.position = new Vector3(
        Math.cos(angle) * radiusX,
        Math.sin(angle) * radiusY,
        minZ + (maxZ - minZ) * rowT,
      );
      tooth.rotation.z = angle;
      tooth.parent = teethRoot;
      tooth.material = bodyMaterial;
      tooth.isPickable = false;
    }

    teethRoot.setEnabled(false);
    this.gateGrinderTeeth.set(gate.id, teethRoot);
  }

  private getGateGrinderToothMaterial(scene: Scene, colorName: BrickColor): StandardMaterial {
    const cacheKey = `gate-grinder-tooth-mat-${colorName}`;
    const cached = this.materials.get(cacheKey);
    if (cached) return cached;

    const baseColor = Color3.FromHexString(COLOR_HEX[colorName]);
    const visibleColor = Color3.Lerp(baseColor, Color3.White(), colorName === 'Black' ? 0.32 : 0.16);
    const material = new StandardMaterial(cacheKey, scene);
    material.diffuseColor = visibleColor;
    material.emissiveColor = visibleColor.scale(MATERIAL_LIGHTING_CONFIG.emissiveScale);
    this.applyMatteLighting(material);
    material.backFaceCulling = false;
    this.materials.set(cacheKey, material);
    return material;
  }

  private createGateShadow(
    parent: TransformNode,
    scene: Scene,
    gateState: GateState,
    gateScale: Vec3Sizing,
    rotationY: number,
  ): void {
    if (!CONTACT_SHADOW_CONFIG.enabled) return;

    const config = CONTACT_SHADOW_CONFIG.gates;
    const shadow = MeshBuilder.CreateGround(`${gateState.id}-contact-shadow`, {
      width: config.width * Math.abs(gateScale[0]),
      height: config.depth * Math.abs(gateScale[2]),
      subdivisions: 1,
    }, scene);
    shadow.position = new Vector3(
      gateState.position[0] + config.offset[0],
      config.y + config.offset[1],
      gateState.position[2] + config.offset[2],
    );
    shadow.rotation.y = rotationY;
    shadow.parent = parent;
    shadow.isPickable = false;
    shadow.alwaysSelectAsActiveMesh = true;
    shadow.material = this.getContactShadowMaterial(scene, 'gate', CONTACT_SHADOW_CONFIG.gates.alpha);
  }

  private createInputHandling(): void {
    const canvas = this.runtime.canvas;
    const handleFirstInput = () => this.registerFirstInput();
    const handlePointerDown = (event: PointerEvent) => this.handlePointerDown(event);
    const handlePointerMove = (event: PointerEvent) => this.handlePointerMove(event);
    const handlePointerUp = (event: PointerEvent) => this.handlePointerUp(event);
    const firstInputOptions: AddEventListenerOptions = { capture: true, passive: true };

    window.addEventListener('pointerdown', handleFirstInput, firstInputOptions);
    window.addEventListener('pointerup', handleFirstInput, firstInputOptions);
    window.addEventListener('touchstart', handleFirstInput, firstInputOptions);
    window.addEventListener('touchend', handleFirstInput, firstInputOptions);
    if (ACTIVE_NETWORK === 'dev') {
      const handleDevEndcardHotkey = (event: KeyboardEvent) => {
        if (event.repeat || (event.code !== 'KeyP' && event.key.toLowerCase() !== 'p')) return;

        event.preventDefault();
        if (this.endcard.isVisible()) return;

        this.cancelActiveDrag();
        this.showEndcard(true);
      };
      window.addEventListener('keydown', handleDevEndcardHotkey);
      this.inputDisposers.push(() => {
        window.removeEventListener('keydown', handleDevEndcardHotkey);
      });
    }
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    this.inputDisposers.push(() => {
      window.removeEventListener('pointerdown', handleFirstInput, true);
      window.removeEventListener('pointerup', handleFirstInput, true);
      window.removeEventListener('touchstart', handleFirstInput, true);
      window.removeEventListener('touchend', handleFirstInput, true);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    });
  }

  private handlePointerDown(event: PointerLikeEvent): void {
    this.updateScenePointerFromEvent(event);
    if (this.isInputLocked()) return;

    const pointerPoint = this.pickBoardPoint();
    const brickId = pointerPoint ? this.findBrickIdAtBoardPoint(pointerPoint) : null;
    if (!brickId) return;

    const brick = this.board.getBrick(brickId);
    if (!brick || !brick.active || !pointerPoint) return;

    event.preventDefault();
    this.hideHintAndRestart();
    this.showMatchingGateSelectionFeedback(brick);
    this.registerBrickClick();
    if (this.isInputLocked()) return;
    this.audio.playDrag();
    if (typeof event.pointerId === 'number') {
      this.runtime.canvas.setPointerCapture?.(event.pointerId);
    }

    this.dragState = {
      brickId,
      startOrigin: { ...brick.origin },
      displayOrigin: { ...brick.origin },
      targetPointerOrigin: { ...brick.origin },
      pointerWorldOffset: {
        x: brick.origin.x - pointerPoint.x,
        z: brick.origin.z - pointerPoint.z,
      },
      lockedAxis: null,
      candidateOrigin: { ...brick.origin },
      dropOrigin: { ...brick.origin },
      direction: { x: 0, z: 0 },
      rawStep: 0,
      dropStep: 0,
      isValid: true,
      moved: false,
    };
    this.board.releaseBrickOccupancy(brickId);

    const node = this.brickNodes.get(brickId);
    if (node) {
      this.animateBrickPickup(brickId, node);
    }
  }

  private handlePointerMove(event: PointerLikeEvent): void {
    this.updateScenePointerFromEvent(event);
    if (!this.dragState) return;
    if (this.isInputLocked()) {
      this.cancelActiveDrag();
      return;
    }

    if (this.updateDragTargetFromPointer()) {
      event.preventDefault();
    }
  }

  private updateActiveDrag(dt: number): void {
    if (!this.dragState) return;
    if (this.isInputLocked()) {
      this.cancelActiveDrag();
      return;
    }

    const brick = this.board.getBrick(this.dragState.brickId);
    const node = this.brickNodes.get(this.dragState.brickId);
    if (!brick || !node) return;

    this.cancelBrickVisualTween(brick.id);
    const pointerOrigin = resolveDragFollowTarget({
      currentOrigin: this.dragState.displayOrigin,
      targetOrigin: this.dragState.targetPointerOrigin,
      dt,
      config: ASSET_SIZING.bricks.drag,
    });
    const slide = resolveSlideDrag({
      startOrigin: this.dragState.startOrigin,
      currentOrigin: this.dragState.displayOrigin,
      pointerOrigin,
      lockedAxis: this.dragState.lockedAxis,
      config: ASSET_SIZING.bricks.drag,
      bounds: this.getDragBounds(brick),
      brickRelativeCells: this.getBrickRelativeCells(brick),
      canPlaceAtOrigin: (origin) => this.board.canPlaceBrickAtOrigin(brick.id, origin),
    });
    const touchedSubmitGate = this.findReachableTouchedSubmitGate(brick, slide);
    const displayOrigin = resolveDragDisplayOrigin({
      startOrigin: this.dragState.startOrigin,
      pointerOrigin,
      slide,
      snapLateralThresholdCells: ASSET_SIZING.bricks.drag.snapLateralThresholdCells,
    });

    this.dragState = {
      ...this.dragState,
      lockedAxis: slide.lockedAxis,
      displayOrigin,
      candidateOrigin: slide.candidateOrigin,
      dropOrigin: slide.dropOrigin,
      direction: slide.direction,
      rawStep: slide.rawStep,
      dropStep: slide.dropStep,
      isValid: slide.isValid,
      moved: this.dragState.moved || slide.moved || Boolean(touchedSubmitGate),
    };

    node.position = this.cellToWorld(displayOrigin, slide.isValid || touchedSubmitGate ? ASSET_SIZING.bricks.validDragY : ASSET_SIZING.bricks.invalidDragY);
    node.scaling = slide.isValid || touchedSubmitGate ? toVector3(ASSET_SIZING.bricks.validDragScale) : toVector3(ASSET_SIZING.bricks.invalidDragScale);
    this.updateBrickShadow(brick.id);
  }

  private updateDragTargetFromPointer(): boolean {
    const drag = this.dragState;
    if (!drag) return false;

    const pointerPoint = this.pickBoardPoint();
    if (!pointerPoint) return false;

    this.dragState = {
      ...drag,
      targetPointerOrigin: {
        x: pointerPoint.x + drag.pointerWorldOffset.x,
        z: pointerPoint.z + drag.pointerWorldOffset.z,
      },
    };
    return true;
  }

  private handlePointerUp(event: PointerLikeEvent): void {
    this.updateScenePointerFromEvent(event);
    this.updateDragTargetFromPointer();
    this.updateActiveDrag(1 / 60);

    const drag = this.dragState;
    if (!drag) return;

    event.preventDefault();
    if (typeof event.pointerId === 'number') {
      this.runtime.canvas.releasePointerCapture?.(event.pointerId);
    }
    this.dragState = null;
    if (this.isInputLocked()) {
      this.board.claimBrickOccupancy(drag.brickId);
      this.syncBrickNode(drag.brickId);
      return;
    }

    const brick = this.board.getBrick(drag.brickId);
    if (!brick || !brick.active) return;

    const touchedSubmitGate = this.findReachableTouchedSubmitGate(brick, {
      candidateOrigin: drag.candidateOrigin,
      dropOrigin: drag.dropOrigin,
      rawStep: drag.rawStep,
      dropStep: drag.dropStep,
    });

    if (touchedSubmitGate && this.tryAbsorbBrick(brick.id, touchedSubmitGate)) {
      this.hideHintAndRestart();
      return;
    }

    if (!drag.moved) {
      this.audio.playDrop();
      this.board.claimBrickOccupancy(brick.id);
      this.syncBrickNode(brick.id);
      this.hideHintAndRestart();
      return;
    }

    this.audio.playDrop();

    const canDropAtClampedOrigin = drag.dropOrigin.x !== brick.origin.x || drag.dropOrigin.z !== brick.origin.z;
    if (canDropAtClampedOrigin && !this.board.moveBrickToOrigin(brick.id, drag.dropOrigin)) {
      this.board.claimBrickOccupancy(brick.id);
    } else if (!canDropAtClampedOrigin) {
      this.board.claimBrickOccupancy(brick.id);
    }

    this.syncBrickNode(brick.id);
    if (!drag.isValid && !canDropAtClampedOrigin) {
      this.showBrickFeedback(brick.id, 'blocked');
    } else {
      const touchedGate = this.findTouchedGate(brick);
      if (touchedGate) {
        this.showGateFeedback(touchedGate.id, 'rejected');
        this.showBrickFeedback(brick.id, 'rejected');
      }
    }
    this.hideHintAndRestart();
  }


  private pickBoardPoint(): Vector3 | null {
    const scene = this.runtime.scene;
    const camera = scene.activeCamera;
    if (!camera) return null;

    const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera);
    const boardOffset = this.getBoardRootPosition();
    const boardPlaneY = ASSET_SIZING.bricks.boardPickPlaneY + boardOffset.y;
    if (Math.abs(ray.direction.y) < 0.0001) return null;

    const distance = (boardPlaneY - ray.origin.y) / ray.direction.y;
    if (distance < 0) return null;

    return ray.origin.add(ray.direction.scale(distance)).subtract(boardOffset);
  }

  private tryAbsorbBrick(brickId: string, touchedGate?: GateState): boolean {
    const brick = this.board.getBrick(brickId);
    if (!brick || !brick.active) return false;

    const gate = touchedGate;
    if (!gate || gate.color !== brick.color) return false;

    this.cancelBrickVisualTween(brick.id);
    this.showGateFeedback(gate.id, 'accepted');
    this.createSubmissionVfx(gate, brick.color);
    this.spinGateGrinder(gate.id);
    this.audio.playGateSubmit();
    this.setBrickShadowEnabled(brick.id, false);
    this.board.deactivateBrick(brick.id);
    this.activeAbsorbs++;
    this.animateAbsorb(brick, gate);
    return true;
  }

  private animateAbsorb(brick: BrickState, gate: GateState): void {
    const node = this.brickNodes.get(brick.id);
    if (!node) {
      this.activeAbsorbs = Math.max(0, this.activeAbsorbs - 1);
      this.registerBrickRemoved();
      return;
    }

    const startPosition = node.position.clone();
    const startScale = node.scaling.clone();
    const endPosition = new Vector3(
      gate.position[0] + gate.acceptDirection[0] * ABSORB_ANIMATION_CONFIG.endpointForwardOffset,
      gate.vfxPosition[1],
      gate.position[2] + gate.acceptDirection[2] * ABSORB_ANIMATION_CONFIG.endpointForwardOffset,
    );
    const durationMs = ABSORB_ANIMATION_CONFIG.durationMs;
    const startedAt = performance.now();

    const tick = () => {
      const t = Math.min(1, (performance.now() - startedAt) / durationMs);
      const pullEased = t * t * t;
      node.position = Vector3.Lerp(startPosition, endPosition, pullEased);
      node.scaling = Vector3.Lerp(startScale, toVector3(ABSORB_ANIMATION_CONFIG.endScale), t);

      if (t < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      node.setEnabled(false);
      this.activeAbsorbs = Math.max(0, this.activeAbsorbs - 1);
      this.registerBrickRemoved();
    };

    tick();
  }

  private cancelActiveDrag(): void {
    const drag = this.dragState;
    this.dragState = null;
    if (drag) {
      this.board.claimBrickOccupancy(drag.brickId);
      this.syncBrickNode(drag.brickId);
    }
    this.hideHintAndRestart();
  }

  private syncBrickNode(brickId: string): void {
    const brick = this.board.getBrick(brickId);
    const node = this.brickNodes.get(brickId);
    if (!brick || !node) return;

    const settledPosition = this.cellToWorld(brick.origin, ASSET_SIZING.bricks.rootY);
    node.position.x = settledPosition.x;
    node.position.z = settledPosition.z;
    node.scaling = toVector3(ASSET_SIZING.bricks.idleScale);
    this.animateBrickY(brickId, node, ASSET_SIZING.bricks.rootY, ASSET_SIZING.bricks.settleAnimationMs);
  }

  private animateBrickPickup(brickId: string, node: TransformNode): void {
    this.flashMeshes(this.getVisibleNodeMeshes(node), Color3.FromHexString('#ffffff'), 0.2, 120);
    this.animateBrickVisual(
      brickId,
      node,
      ASSET_SIZING.bricks.pickupY,
      toVector3(ASSET_SIZING.bricks.pickupScale),
      ASSET_SIZING.bricks.pickupAnimationMs,
    );
  }

  private animateBrickY(brickId: string, node: TransformNode, targetY: number, durationMs: number): void {
    this.animateBrickVisual(brickId, node, targetY, null, durationMs);
  }

  private animateBrickVisual(
    brickId: string,
    node: TransformNode,
    targetY: number,
    targetScale: Vector3 | null,
    durationMs: number,
  ): void {
    const token = ++this.brickVisualToken;
    this.brickVisualTokens.set(brickId, token);
    const startY = node.position.y;
    const startScale = node.scaling.clone();
    const startedAt = performance.now();

    const tick = () => {
      if (this.brickVisualTokens.get(brickId) !== token) return;

      const t = durationMs <= 0 ? 1 : Math.min(1, (performance.now() - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - t, 2);
      node.position.y = startY + (targetY - startY) * eased;
      if (targetScale) {
        node.scaling = Vector3.Lerp(startScale, targetScale, eased);
      }
      this.updateBrickShadow(brickId);

      if (t < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      node.position.y = targetY;
      if (targetScale) {
        node.scaling = targetScale;
      }
      this.updateBrickShadow(brickId);
    };

    tick();
  }

  private cancelBrickVisualTween(brickId: string): void {
    this.brickVisualTokens.set(brickId, ++this.brickVisualToken);
  }

  private updateBrickShadow(brickId: string): void {
    const shadow = this.brickShadowNodes.get(brickId);
    const node = this.brickNodes.get(brickId);
    if (!shadow || !node) return;

    shadow.position.y = CONTACT_SHADOW_CONFIG.bricks.y - node.position.y + CONTACT_SHADOW_CONFIG.bricks.offset[1];
  }

  private setBrickShadowEnabled(brickId: string, enabled: boolean): void {
    this.brickShadowNodes.get(brickId)?.setEnabled(enabled);
  }

  private getBrickLocalBounds(brick: BrickState): { minX: number; maxX: number; minZ: number; maxZ: number } {
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (const cell of brick.cells) {
      const offsetX = cell.x - brick.origin.x;
      const offsetZ = cell.z - brick.origin.z;
      minX = Math.min(minX, offsetX);
      maxX = Math.max(maxX, offsetX);
      minZ = Math.min(minZ, offsetZ);
      maxZ = Math.max(maxZ, offsetZ);
    }

    return { minX, maxX, minZ, maxZ };
  }

  private getBrickRelativeCells(brick: BrickState): Cell[] {
    return brick.cells.map((cell) => ({
      x: cell.x - brick.origin.x,
      z: cell.z - brick.origin.z,
    }));
  }

  private getDragBounds(brick: BrickState): DragBounds {
    const slots = this.board.getAllSlots();
    const minSlotX = Math.min(...slots.map((slot) => slot.x));
    const maxSlotX = Math.max(...slots.map((slot) => slot.x));
    const minSlotZ = Math.min(...slots.map((slot) => slot.z));
    const maxSlotZ = Math.max(...slots.map((slot) => slot.z));
    const brickBounds = this.getBrickLocalBounds(brick);

    return {
      minX: minSlotX - brickBounds.minX,
      maxX: maxSlotX - brickBounds.maxX,
      minZ: minSlotZ - brickBounds.minZ,
      maxZ: maxSlotZ - brickBounds.maxZ,
    };
  }

  private findTouchedGate(brick: BrickState): GateState | null {
    return findTouchedGateAtOrigin(this.board, wideUScene.gates, brick, brick.origin, false);
  }

  private findReachableTouchedSubmitGate(
    brick: BrickState,
    slide: Pick<SlideDragResult, 'candidateOrigin' | 'dropOrigin' | 'rawStep' | 'dropStep'>,
  ): GateState | null {
    const dropGate = findTouchedGateAtOrigin(this.board, wideUScene.gates, brick, slide.dropOrigin);
    if (dropGate) return dropGate;

    const overdragCells = Math.abs(slide.rawStep) - Math.abs(slide.dropStep);
    if (overdragCells > ASSET_SIZING.gates.contact.forwardCells) return null;

    const candidateGate = findTouchedGateAtOrigin(this.board, wideUScene.gates, brick, slide.candidateOrigin);
    return candidateGate ?? null;
  }

  private showMatchingGateSelectionFeedback(brick: BrickState): void {
    for (const gate of wideUScene.gates) {
      if (gate.color !== brick.color) continue;

      const node = this.gateNodes.get(gate.id);
      if (!node) continue;

      this.flashMeshes(this.getVisibleNodeMeshes(node), Color3.FromHexString('#fff7c0'), 0.36, 180);
      this.bounceGateNode(node);
    }
  }

  private showBrickFeedback(brickId: string, mode: 'blocked' | 'rejected'): void {
    const node = this.brickNodes.get(brickId);
    if (!node) return;

    const color = mode === 'blocked' ? Color3.FromHexString('#ff3d3d') : Color3.FromHexString('#ffc247');
    this.flashMeshes(this.getVisibleNodeMeshes(node), color, 0.62, 220);
    this.pulseNode(node, mode === 'blocked' ? ASSET_SIZING.bricks.feedback.blockedPulseScale : ASSET_SIZING.bricks.feedback.rejectedPulseScale, 160);
  }

  private showGateFeedback(gateId: string, mode: 'accepted' | 'rejected' | 'hint'): void {
    const node = this.gateNodes.get(gateId);
    if (!node) return;

    const color = mode === 'accepted'
      ? Color3.FromHexString('#9fff40')
      : mode === 'hint'
        ? Color3.FromHexString('#fff3a3')
        : Color3.FromHexString('#ff3d3d');
    this.flashMeshes(this.getVisibleNodeMeshes(node), color, mode === 'accepted' ? 0.72 : 0.48, mode === 'hint' ? 360 : 260);
    this.pulseNode(
      node,
      mode === 'accepted'
        ? ASSET_SIZING.gates.feedback.acceptedPulseScale
        : mode === 'hint'
          ? ASSET_SIZING.gates.feedback.hintPulseScale
          : ASSET_SIZING.gates.feedback.rejectedPulseScale,
      mode === 'hint' ? 220 : 180,
    );
  }

  private getVisibleNodeMeshes(node: TransformNode): AbstractMesh[] {
    return node.getChildMeshes(false).filter((mesh) => !mesh.name.endsWith('-hitbox') && !mesh.name.endsWith('-contact-shadow'));
  }

  private flashMeshes(meshes: AbstractMesh[], color: Color3, alpha: number, durationMs: number): void {
    for (const mesh of meshes) {
      mesh.overlayColor = color;
      mesh.overlayAlpha = alpha;
      mesh.renderOverlay = true;
    }

    window.setTimeout(() => {
      for (const mesh of meshes) {
        mesh.renderOverlay = false;
      }
    }, durationMs);
  }

  private pulseNode(node: TransformNode, scale: number, durationMs: number): void {
    const startedAt = performance.now();
    const startScale = node.scaling.clone();
    const peakScale = new Vector3(scale, scale, scale);

    const tick = () => {
      const t = Math.min(1, (performance.now() - startedAt) / durationMs);
      const phase = t < 0.5 ? t * 2 : (1 - t) * 2;
      node.scaling = Vector3.Lerp(startScale, peakScale, phase);

      if (t < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      node.scaling = startScale;
    };

    tick();
  }

  private bounceGateNode(node: TransformNode): void {
    const token = ++this.gateBounceToken;
    const restY = this.gateRestY.get(node) ?? node.position.y;
    this.gateRestY.set(node, restY);
    this.gateBounceTokens.set(node, token);
    node.position.y = restY;

    const startedAt = performance.now();
    const peakY = restY + ASSET_SIZING.gates.feedback.selectionBounceY;
    const durationMs = ASSET_SIZING.gates.feedback.selectionBounceDurationMs;

    const tick = () => {
      if (this.gateBounceTokens.get(node) !== token) return;

      const t = Math.min(1, (performance.now() - startedAt) / durationMs);
      const phase = t < 0.5 ? t * 2 : (1 - t) * 2;
      node.position.y = restY + (peakY - restY) * phase;

      if (t < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      node.position.y = restY;
    };

    tick();
  }

  private spinGateGrinder(gateId: string): void {
    const gateNode = this.gateSpinNodes.get(gateId);
    if (!gateNode) return;

    const config = ASSET_SIZING.gates.feedback.grinder;
    const teeth = this.gateGrinderTeeth.get(gateId);
    const durationMs = config.durationMs;
    const token = ++this.gateGrinderSpinToken;
    const spinAxis = config.spinAxis;
    const startRotation = gateNode.rotation[spinAxis];
    const startScale = gateNode.scaling.clone();
    const turns = config.spinTurns * Math.PI * 2;
    const startedAt = performance.now();

    teeth?.setEnabled(true);

    const tick = () => {
      const t = Math.min(1, (performance.now() - startedAt) / durationMs);
      const pulse = 1 + Math.sin(t * Math.PI) * (config.spinPulseScale - 1);

      gateNode.rotation[spinAxis] = startRotation + turns * t;
      gateNode.scaling = startScale.scale(pulse);

      if (t < 1 && token === this.gateGrinderSpinToken) {
        window.requestAnimationFrame(tick);
        return;
      }

      gateNode.rotation[spinAxis] = startRotation;
      gateNode.scaling = startScale;
      teeth?.setEnabled(false);
    };

    tick();
  }

  private createSubmissionVfx(gate: GateState, color: BrickColor): void {
    const scene = this.runtime.scene;
    const config = ASSET_SIZING.gates.feedback.submissionVfx;
    if (!config.enabled || !this.boardRoot) return;

    const material = this.getSubmissionVfxMaterial(scene, color);
    const origin = new Vector3(gate.vfxPosition[0], gate.vfxPosition[1], gate.vfxPosition[2])
      .add(toVector3(config.originOffset));
    const forward = new Vector3(gate.acceptDirection[0], 0, gate.acceptDirection[2]);
    if (forward.lengthSquared() < 0.0001) {
      forward.z = 1;
    }
    forward.normalize();
    const tangent = new Vector3(-forward.z, 0, forward.x);
    const coneRadians = (config.coneAngleDeg * Math.PI) / 180;
    const meshScale = toVector3(config.meshScale);
    const spawnJitterY = config.meshScale[1] * 0.26;
    const seed = this.getVfxSeed(gate.id, performance.now());

    for (let index = 0; index < config.particleCount; index++) {
      const emissionT = config.particleCount <= 1 ? 0 : index / (config.particleCount - 1);
      const coneOffset = (this.vfxNoise(seed, index, 1) * 2 - 1) * coneRadians;
      const spreadT = (index * 0.61803398875 + this.vfxNoise(seed, 0, 2)) % 1;
      const lateralOffset = (spreadT * 2 - 1) * config.emitterHalfWidth
        + (this.vfxNoise(seed, index, 2) * 2 - 1) * config.emitterHalfWidth * 0.12;
      const speed = config.startSpeed * (0.82 + this.vfxNoise(seed, index, 3) * 0.36);
      const upwardSpeed = config.upwardSpeed * (0.65 + this.vfxNoise(seed, index, 4) * 0.7);
      const sprayDirection = forward.scale(Math.cos(coneOffset)).add(tangent.scale(Math.sin(coneOffset))).normalize();
      const widthAspect = config.minAspect + (config.maxAspect - config.minAspect) * this.vfxNoise(seed, index, 5);
      const heightAspect = config.minAspect + (config.maxAspect - config.minAspect) * this.vfxNoise(seed, index, 7);
      const spawnPosition = origin
        .add(forward.scale(config.emitterForwardOffset))
        .add(tangent.scale(lateralOffset));

      spawnPosition.y += (this.vfxNoise(seed, index, 6) - 0.5) * spawnJitterY;

      const particle = MeshBuilder.CreatePlane(`submission-smoke-vfx-${gate.id}-${index}`, {
        size: 1,
        sideOrientation: Mesh.DOUBLESIDE,
      }, scene);
      // Keep the entire trajectory attached to the board through orientation changes.
      particle.parent = this.boardRoot;
      particle.position = spawnPosition.clone();
      particle.billboardMode = TransformNode.BILLBOARDMODE_ALL;
      particle.scaling = new Vector3(meshScale.x * widthAspect, meshScale.y * heightAspect, meshScale.z);
      particle.material = material;
      particle.isPickable = false;
      particle.alwaysSelectAsActiveMesh = true;
      particle.visibility = 0;

      const velocity = sprayDirection
        .scale(speed)
        .add(tangent.scale((this.vfxNoise(seed, index, 8) * 2 - 1) * config.lateralSpeed))
        .add(new Vector3(0, upwardSpeed, 0));
      const delayMs = emissionT * config.emissionDurationMs;
      this.animateVfxParticle(particle, spawnPosition, velocity, delayMs);
    }
  }

  private initializeGateVfxMaterials(scene: Scene): void {
    for (const gate of wideUScene.gates) {
      this.getSubmissionVfxMaterial(scene, gate.color);
    }
  }

  private getSubmissionVfxMaterial(scene: Scene, colorName: BrickColor): StandardMaterial {
    const cacheKey = `submission-smoke-vfx-mat-${colorName}`;
    const cached = this.materials.get(cacheKey);
    if (cached) return cached;

    const config = ASSET_SIZING.gates.feedback.submissionVfx;
    const color = Color3.FromHexString(COLOR_HEX[colorName]);
    const material = new StandardMaterial(cacheKey, scene);
    material.diffuseColor = color;
    material.emissiveColor = color;
    material.specularColor = new Color3(0, 0, 0);
    material.alpha = config.startAlpha;
    material.disableLighting = true;
    material.backFaceCulling = false;
    this.materials.set(cacheKey, material);
    return material;
  }

  private animateVfxParticle(particle: Mesh, origin: Vector3, velocity: Vector3, delayMs: number): void {
    const config = ASSET_SIZING.gates.feedback.submissionVfx;
    const startedAt = performance.now();
    const baseScale = particle.scaling.clone();

    const tick = () => {
      const elapsedMs = performance.now() - startedAt;
      if (elapsedMs < delayMs) {
        particle.visibility = 0;
        window.requestAnimationFrame(tick);
        return;
      }

      const ageMs = elapsedMs - delayMs;
      const t = Math.min(1, ageMs / config.particleLifetimeMs);
      const seconds = ageMs / 1000;
      const size = this.evaluateSubmissionVfxSize(t);
      const alpha = config.startAlpha + (config.endAlpha - config.startAlpha) * (t * t);
      particle.position = origin
        .add(velocity.scale(seconds))
        .add(new Vector3(0, 0.5 * config.gravityY * seconds * seconds, 0));
      particle.scaling = baseScale.scale(size);
      particle.visibility = Math.max(0, alpha / config.startAlpha);

      if (t < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      particle.dispose();
    };

    tick();
  }

  private evaluateSubmissionVfxSize(t: number): number {
    const config = ASSET_SIZING.gates.feedback.submissionVfx;
    const midTime = 0.18;
    const midScale = 0.92;
    if (t <= midTime) {
      return config.startScale + (midScale - config.startScale) * (t / midTime);
    }

    const u = Math.min(1, (t - midTime) / (1 - midTime));
    const eased = 1 - Math.pow(1 - u, 2);
    return midScale + (config.endScale - midScale) * eased;
  }

  private getVfxSeed(id: string, startedAt: number): number {
    let hash = 2166136261;
    for (let index = 0; index < id.length; index++) {
      hash ^= id.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash + Math.floor(startedAt);
  }

  private vfxNoise(seed: number, index: number, salt: number): number {
    const value = Math.sin(seed * 0.0001 + index * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  private getBrickCenter(brick: BrickState): Cell {
    const total = brick.cells.reduce(
      (sum, cell) => ({
        x: sum.x + cell.x,
        z: sum.z + cell.z,
      }),
      { x: 0, z: 0 },
    );

    return {
      x: total.x / Math.max(1, brick.cells.length),
      z: total.z / Math.max(1, brick.cells.length),
    };
  }

  private getBrickModelOffset(brick: BrickState): Cell {
    const center = this.getBrickCenter(brick);
    return {
      x: center.x - brick.origin.x,
      z: center.z - brick.origin.z,
    };
  }

  private findBrickId(mesh: AbstractMesh): string | null {
    const value = mesh.metadata?.brickId;
    return typeof value === 'string' ? value : null;
  }

  private tagBrickMesh(mesh: AbstractMesh, brickId: string): void {
    mesh.metadata = {
      ...(mesh.metadata ?? {}),
      brickId,
    };
  }

  private isInputLocked(): boolean {
    return this.activeAbsorbs > 0 || this.iteration.isEnded();
  }

  private cellToWorld(cell: Cell, y: number): Vector3 {
    return new Vector3(cell.x, y, cell.z);
  }

  private getBoardRootPosition(): Vector3 {
    return this.boardRoot?.position.clone() ?? Vector3.Zero();
  }

  private worldToCell(point: Vector3): Cell {
    return {
      x: Math.round(point.x),
      z: Math.round(point.z),
    };
  }

  private updateScenePointerFromEvent(event: PointerLikeEvent): void {
    const rect = this.runtime.canvas.getBoundingClientRect();
    this.runtime.scene.pointerX = event.clientX - rect.left;
    this.runtime.scene.pointerY = event.clientY - rect.top;
  }

  private findBrickIdAtBoardPoint(point: Vector3): string | null {
    const slot = this.board.getSlotAt(this.worldToCell(point));
    if (slot?.occupyingBrickId) return slot.occupyingBrickId;

    let closestBrickId: string | null = null;
    let closestDistanceSq: number = ASSET_SIZING.bricks.hitbox.nearestCellDistanceSq;
    for (const brick of this.board.getActiveBricks()) {
      for (const cell of brick.cells) {
        const dx = point.x - cell.x;
        const dz = point.z - cell.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq < closestDistanceSq) {
          closestDistanceSq = distanceSq;
          closestBrickId = brick.id;
        }
      }
    }

    return closestBrickId;
  }

  private createModel(scene: Scene, key: WideUModelKey, name: string, colorHex: string) {
    return createWideUModelMesh(scene, key, name, this.getMaterial(scene, `${key}-mat-${colorHex}`, colorHex, key));
  }

  private createGateModel(scene: Scene, name: string, color: BrickColor) {
    const gateColor = COLOR_HEX[color];
    const arrowColor = color === 'White' ? '#000000' : '#ffffff';

    // The extractor preserves FBX material indices: slot 0 is the gate body, slot 1 is the embedded arrow.
    return createWideUModelMesh(scene, 'gate', name, [
      this.getMatteMaterial(scene, `gate-body-mat-${gateColor}`, gateColor),
      this.getMatteMaterial(scene, `gate-arrow-mat-${arrowColor}`, arrowColor),
    ]);
  }

  private getBoardBaseMaterial(scene: Scene): StandardMaterial {
    const cacheKey = 'board-base-texture-mat';
    const cached = this.materials.get(cacheKey);
    if (cached) return cached;

    const material = new StandardMaterial(cacheKey, scene);
    const texture = new Texture(ASSETS.textures.boardBase, scene);
    texture.hasAlpha = true;
    material.diffuseTexture = texture;
    material.useAlphaFromDiffuseTexture = true;
    material.diffuseColor = Color3.FromHexString(BOARD_MATERIAL_CONFIG.baseTintHex);
    material.emissiveColor = material.diffuseColor.scale(MATERIAL_LIGHTING_CONFIG.emissiveScale);
    this.applyMatteLighting(material);
    material.backFaceCulling = false;
    this.materials.set(cacheKey, material);
    return material;
  }

  private getHitboxMaterial(scene: Scene): StandardMaterial {
    const cached = this.materials.get('brick-hitbox-mat');
    if (cached) return cached;

    const material = new StandardMaterial('brick-hitbox-mat', scene);
    material.diffuseColor = new Color3(1, 1, 1);
    material.emissiveColor = new Color3(0, 0, 0);
    material.specularColor = new Color3(0, 0, 0);
    material.alpha = 0;
    material.backFaceCulling = false;
    this.materials.set('brick-hitbox-mat', material);
    return material;
  }

  private getContactShadowMaterial(scene: Scene, key: string, alpha: number): StandardMaterial {
    const cacheKey = `contact-shadow-mat-${key}-${alpha}`;
    const cached = this.materials.get(cacheKey);
    if (cached) return cached;

    const material = new StandardMaterial(cacheKey, scene);
    const color = Color3.FromHexString(CONTACT_SHADOW_CONFIG.colorHex);
    material.diffuseColor = color;
    material.emissiveColor = color;
    material.specularColor = new Color3(0, 0, 0);
    material.alpha = alpha;
    material.disableLighting = true;
    material.backFaceCulling = false;
    this.materials.set(cacheKey, material);
    return material;
  }

  private getMaterial(scene: Scene, key: string, colorHex: string, modelKey: WideUModelKey): StandardMaterial {
    const cached = this.materials.get(key);
    if (cached) return cached;

    const baseColor = Color3.FromHexString(colorHex);
    const isWhiteBlock = colorHex.toLowerCase() === COLOR_HEX.White.toLowerCase();
    const isBlackBlock = colorHex.toLowerCase() === COLOR_HEX.Black.toLowerCase();
    const isColoredLongBlock = modelKey === 'tileLong' && !isWhiteBlock && !isBlackBlock;
    const whiteMaterial = MATERIAL_LIGHTING_CONFIG.whiteMaterial;
    const coloredLongMaterial = MATERIAL_LIGHTING_CONFIG.coloredLongMaterial;
    const diffuseScale = isWhiteBlock
      ? whiteMaterial.diffuseScale
      : isColoredLongBlock
        ? coloredLongMaterial.diffuseScale
        : 1;
    const emissiveScale = isWhiteBlock
      ? whiteMaterial.emissiveScale
      : isColoredLongBlock
        ? coloredLongMaterial.emissiveScale
        : MATERIAL_LIGHTING_CONFIG.emissiveScale;
    const specularScale = isWhiteBlock
      ? whiteMaterial.specularScale
      : isColoredLongBlock
        ? coloredLongMaterial.specularScale
        : 1;
    const specularPowerScale = isColoredLongBlock ? coloredLongMaterial.specularPowerScale : 1;
    const blockGloss = MATERIAL_LIGHTING_CONFIG.blockGloss;
    const materialColor = isColoredLongBlock
      ? boostColorSaturation(baseColor, coloredLongMaterial.saturationBoost)
      : baseColor;
    const diffuseColor = materialColor.scale(diffuseScale);
    const specularColor = isColoredLongBlock
      ? Color3.Lerp(materialColor, Color3.White(), coloredLongMaterial.specularTintTowardWhite)
      : undefined;
    const material = new StandardMaterial(key, scene);
    material.diffuseColor = diffuseColor;
    material.emissiveColor = diffuseColor.scale(emissiveScale);
    this.applyModelLighting(
      material,
      specularScale * blockGloss.specularScale,
      specularPowerScale * blockGloss.specularPowerScale,
      specularColor,
      blockGloss.roughness,
    );
    material.backFaceCulling = false;
    this.materials.set(key, material);
    return material;
  }

  private createMatteModel(scene: Scene, key: WideUModelKey, name: string, colorHex: string) {
    return createWideUModelMesh(scene, key, name, this.getMatteMaterial(scene, `${key}-matte-mat-${colorHex}`, colorHex));
  }

  private getMatteMaterial(scene: Scene, key: string, colorHex: string): StandardMaterial {
    const cached = this.materials.get(key);
    if (cached) return cached;

    const material = new StandardMaterial(key, scene);
    material.diffuseColor = Color3.FromHexString(colorHex);
    material.emissiveColor = material.diffuseColor.scale(MATERIAL_LIGHTING_CONFIG.emissiveScale);
    this.applyMatteLighting(material);
    material.backFaceCulling = false;
    this.materials.set(key, material);
    return material;
  }

  private applyModelLighting(
    material: StandardMaterial,
    specularScale = 1,
    specularPowerScale = 1,
    specularColor = toColor3(MATERIAL_LIGHTING_CONFIG.specularColor),
    roughness: number = MATERIAL_LIGHTING_CONFIG.roughness,
  ): void {
    material.specularColor = specularColor.scale(specularScale);
    material.specularPower = MATERIAL_LIGHTING_CONFIG.specularPower * specularPowerScale;
    material.roughness = roughness;
    material.maxSimultaneousLights = MATERIAL_LIGHTING_CONFIG.maxSimultaneousLights;
    if (MATERIAL_LIGHTING_CONFIG.rimFresnel.enabled) {
      material.emissiveFresnelParameters = new FresnelParameters({
        isEnabled: true,
        leftColor: toColor3(MATERIAL_LIGHTING_CONFIG.rimFresnel.edgeColor),
        rightColor: toColor3(MATERIAL_LIGHTING_CONFIG.rimFresnel.centerColor),
        bias: MATERIAL_LIGHTING_CONFIG.rimFresnel.bias,
        power: MATERIAL_LIGHTING_CONFIG.rimFresnel.power,
      });
    }
  }

  private applyMatteLighting(material: StandardMaterial): void {
    material.specularColor = new Color3(0, 0, 0);
    material.specularPower = 1;
    material.maxSimultaneousLights = MATERIAL_LIGHTING_CONFIG.maxSimultaneousLights;
  }
}
