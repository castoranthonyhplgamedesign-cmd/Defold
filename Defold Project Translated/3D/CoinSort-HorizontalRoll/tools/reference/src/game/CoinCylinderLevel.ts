import Phaser from 'phaser';
import {
  COIN_3D_CONFIG,
  COIN_CYLINDER_CONFIG,
  COIN_DEPTH_CONFIG,
  COIN_FLIGHT_CONFIG,
  COIN_FLIGHT_LANE_DEPTH_CONFIG,
  DEPTHS,
  FLIGHT_LANE_DEBUG_CONFIG,
  LEVEL_EDITOR_CONFIG,
  TIMING,
  type CoinColorType,
  type CoinColorValue,
  type LevelConfig,
} from '../constants';
import { screenDeltaToDesign, sd } from '../utils/responsive';
import type { Coin3DController, Coin3DHandle } from './Coin3DController';
import type { CoinFlyRequest, ViewTransform } from './types';

type CoinStackPiece = {
  rowSegment: number;
  lane: number;
  coinStackIndex: number;
  coin3D: Coin3DHandle;
  x: number;
  y: number;
  depth: number;
  displayWidth: number;
  displayHeight: number;
  rotationDegrees: number;
  alpha: number;
  dimAmount: number;
  visible: boolean;
  colorType: CoinColorType | null;
};

type CoinLaneVisual = {
  colorType: CoinColorType | null;
};

type DragState = {
  rowSegment: number;
  startY: number;
  rotation: number;
  lastSoundStep: number;
};

type LockAnimationState = {
  offsetY: number;
  rotationDegrees: number;
  alpha: number;
  scale: number;
};

type CoinCylinderCallbacks = {
  onCoinFly: (request: CoinFlyRequest) => Promise<void>;
  onClearStart: (level: CoinCylinderLevel) => Promise<void>;
  onClearComplete: (level: CoinCylinderLevel) => Promise<void>;
  onRowSegmentRotate: () => void;
  onRowSegmentHoldStart: (level: CoinCylinderLevel) => void;
  onRowSegmentHoldEnd: (level: CoinCylinderLevel, rotated: boolean) => void;
  onObjectiveComplete: (level: CoinCylinderLevel) => void;
  onNoObjectiveTap: (level: CoinCylinderLevel) => void;
  onLevelUnlock: () => void;
};

const positiveModulo = (value: number, size: number): number => ((value % size) + size) % size;
const OUTER_RADIUS_Y_MULTIPLIER = 1;
const OUTER_DEPTH_X_MULTIPLIER = 1;

export class CoinCylinderLevel {
  readonly config: LevelConfig;

  private readonly scene: Phaser.Scene;
  private readonly callbacks: CoinCylinderCallbacks;
  private readonly coin3D: Coin3DController;
  private readonly lockImage: Phaser.GameObjects.Image;
  private readonly pieces: CoinStackPiece[] = [];
  private readonly innerPieces: CoinStackPiece[] = [];
  private readonly flightLaneDebugLabels: Phaser.GameObjects.Text[] = [];
  private readonly rowSegmentZones: Phaser.GameObjects.Zone[] = [];
  private readonly levelZone: Phaser.GameObjects.Zone;
  private readonly outerRowSegmentLaneVisuals: CoinLaneVisual[][] = [];
  private readonly innerRowSegmentLaneVisuals: CoinLaneVisual[][] = [];
  private readonly fallbackColorTypes = Object.keys(LEVEL_EDITOR_CONFIG.colorTypes) as CoinColorType[];
  private readonly visualState = { alphaProgress: 0 };
  private readonly lockAnimationState: LockAnimationState = {
    offsetY: 0,
    rotationDegrees: 0,
    alpha: 1,
    scale: 1,
  };
  private readonly rowSegmentLaneOffsets: number[] = [];
  private readonly rowSegmentRotations: number[] = [];
  private readonly clearedOuterSourceLanes: Set<number>[] = [];
  private colorTween: Phaser.Tweens.Tween | null = null;
  private lockPopTween: Phaser.Tweens.Tween | null = null;
  private lockFallTween: Phaser.Tweens.Tween | null = null;
  private alphaTarget = 0;
  private lockAnimating = false;
  private drag: DragState | null = null;
  private enabled = false;
  private locked = true;
  private resolving = false;
  private lastView: ViewTransform | null = null;
  private completedLocked = false;
  private flightLaneDebugVisible = false;
  private clearedLaneCount = 0;

  constructor(scene: Phaser.Scene, config: LevelConfig, callbacks: CoinCylinderCallbacks, coin3D: Coin3DController) {
    this.scene = scene;
    this.config = config;
    this.callbacks = callbacks;
    this.coin3D = coin3D;
    this.lockImage = scene.add.image(0, 0, 'lock');
    this.lockImage.setOrigin(0.5);
    this.lockImage.setDepth(DEPTHS.DIM_OVERLAY);
    this.levelZone = scene.add.zone(0, 0, 1, 1);
    this.levelZone.setDepth(DEPTHS.ENDCARD_INPUT - 2);
    this.levelZone.on('pointerdown', () => {
      if (this.enabled && !this.locked && this.config.clearObjectiveLanes === null) {
        this.callbacks.onNoObjectiveTap(this);
      }
    });

    this.createColorPatterns();
    this.createInnerPieces();
    this.createPieces();
    this.createFlightLaneDebugLabels();
    this.createRowSegmentZones();

    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('pointermove', this.handlePointerMove, this);
      scene.input.off('pointerup', this.handlePointerUp, this);
    });
  }

  setLocked(locked: boolean, animate = true): void {
    const wasLocked = this.locked;

    this.completedLocked = false;
    this.locked = locked;
    this.updateInteractivity();

    // Update coin materials immediately when locked state changes
    if (this.lastView) {
      this.layoutPieces(this.lastView);
    }

    if (locked) {
      this.resetLockAnimation();
    } else if (wasLocked && animate) {
      this.animateLockUnlock();
    } else {
      this.lockImage.setVisible(false);
      if (this.lastView) {
        this.layoutLock(this.lastView);
      }
    }

    this.updateVisualState(animate);
  }

  setEnabled(enabled: boolean, animate = true): void {
    this.enabled = enabled && !this.completedLocked;
    this.updateInteractivity();
    this.updateVisualState(animate);
  }

  setCompletedLocked(): void {
    const changed = !this.completedLocked || !this.locked || this.enabled;

    this.completedLocked = true;
    this.locked = true;
    this.enabled = false;
    this.updateInteractivity();
    this.hideLockVisual();
    this.updateVisualState(false);

    if (changed && this.lastView) {
      this.layoutPieces(this.lastView);
      this.layoutLock(this.lastView);
    }
  }

  setFlightLaneDebugVisible(visible: boolean): void {
    this.flightLaneDebugVisible = visible;

    for (let index = 0; index < this.flightLaneDebugLabels.length; index += 1) {
      this.flightLaneDebugLabels[index].setVisible(visible);
    }

    if (this.lastView) {
      this.layoutFlightLaneDebugLabels(this.lastView);
    }
  }

  relayout(view: ViewTransform): void {
    this.lastView = view;
    this.layoutPieces(view);
    this.layoutZones(view);
    this.layoutLock(view);
  }

  getFocusPoint(): { x: number; y: number } {
    const top = this.config.centerY - this.getLevelVisualHeight() / 2;
    const bottom = this.config.centerY + this.getLevelVisualHeight() / 2;

    return {
      x: this.config.centerX,
      y: (top + bottom) / 2,
    };
  }

  getVisualTopY(): number {
    return this.config.centerY - this.getLevelVisualHeight() / 2;
  }

  getRowSegmentHintPoint(rowSegment: number): { x: number; y: number } {
    const clampedRowSegment = Phaser.Math.Clamp(rowSegment, 0, this.config.rowSegmentCount - 1);

    return {
      x:
        this.config.centerX +
        (clampedRowSegment - (this.config.rowSegmentCount - 1) / 2) * this.getRowSegmentSpacing(),
      y: this.config.centerY,
    };
  }

  private createColorPatterns(): void {
    const editorLevel = LEVEL_EDITOR_CONFIG.levels.find(level => level.id === this.config.id);

    for (let rowSegment = 0; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
      this.outerRowSegmentLaneVisuals.push(
        this.createLaneVisualRow(
          editorLevel?.outerCylinder.rowSegmentColors[rowSegment],
          this.config.laneCount,
          this.config.colorSeed,
        ),
      );
    }

    for (let rowSegment = 0; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
      this.innerRowSegmentLaneVisuals.push(
        this.createLaneVisualRow(
          editorLevel?.innerCylinder.rowSegmentColors[rowSegment],
          this.config.innerCylinder.laneCount,
          this.config.colorSeed + rowSegment,
        ),
      );
    }

    for (let rowSegment = 0; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
      this.rowSegmentLaneOffsets.push(this.config.initialRowSegmentOffsets[rowSegment] ?? rowSegment);
      this.rowSegmentRotations.push(0);
      this.clearedOuterSourceLanes.push(new Set<number>());
    }
  }

  private createLaneVisualRow(
    rowColors: readonly CoinColorValue[] | undefined,
    laneCount: number,
    fallbackSeed: number,
  ): CoinLaneVisual[] {
    const laneVisuals: CoinLaneVisual[] = [];

    for (let lane = 0; lane < laneCount; lane += 1) {
      const fallbackType = this.fallbackColorTypes[(lane + fallbackSeed) % this.fallbackColorTypes.length];
      const colorValue = rowColors && rowColors.length > 0 ? rowColors[lane % rowColors.length] : fallbackType;

      laneVisuals.push({
        colorType: this.getCoinColorType(colorValue) ?? fallbackType,
      });
    }

    return laneVisuals;
  }

  private getCoinColorType(color: CoinColorValue): CoinColorType | null {
    return color.startsWith('#') ? null : (color as CoinColorType);
  }

  private createInnerPieces(): void {
    if (!this.config.innerCylinder.enabled) {
      return;
    }

    for (let rowSegment = 0; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
      for (let lane = 0; lane < this.config.innerCylinder.laneCount; lane += 1) {
        for (let coinStackIndex = 0; coinStackIndex < this.config.coinsPerRowSegment; coinStackIndex += 1) {
          const colorType = this.getInnerLaneVisual(rowSegment, lane).colorType;
          const coin3D = this.coin3D.createCoin(colorType);
          this.innerPieces.push({
            rowSegment,
            lane,
            coinStackIndex,
            coin3D,
            x: 0,
            y: 0,
            depth: COIN_DEPTH_CONFIG.outerBase,
            displayWidth: 0,
            displayHeight: 0,
            rotationDegrees: 0,
            alpha: 0,
            dimAmount: 0,
            visible: false,
            colorType,
          });
        }
      }
    }
  }

  private createPieces(): void {
    for (let rowSegment = 0; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
      for (let lane = 0; lane < this.config.laneCount; lane += 1) {
        for (let coinStackIndex = 0; coinStackIndex < this.config.coinsPerRowSegment; coinStackIndex += 1) {
          const colorType = this.getOuterLaneVisual(rowSegment, lane).colorType;
          const coin3D = this.coin3D.createCoin(colorType);
          this.pieces.push({
            rowSegment,
            lane,
            coinStackIndex,
            coin3D,
            x: 0,
            y: 0,
            depth: COIN_DEPTH_CONFIG.outerBase,
            displayWidth: 0,
            displayHeight: 0,
            rotationDegrees: 0,
            alpha: 0,
            dimAmount: 0,
            visible: false,
            colorType,
          });
        }
      }
    }
  }

  private createFlightLaneDebugLabels(): void {
    for (let lane = 0; lane < this.config.laneCount; lane += 1) {
      const label = this.scene.add.text(0, 0, String(lane), {
        align: 'center',
        backgroundColor: FLIGHT_LANE_DEBUG_CONFIG.backgroundColor,
        color: FLIGHT_LANE_DEBUG_CONFIG.defaultColor,
        fontFamily: 'Arial',
        fontStyle: '700',
        stroke: FLIGHT_LANE_DEBUG_CONFIG.strokeColor,
        strokeThickness: FLIGHT_LANE_DEBUG_CONFIG.strokeThickness,
      });
      label.setOrigin(0.5);
      label.setDepth(FLIGHT_LANE_DEBUG_CONFIG.depth + lane * 0.0001);
      label.setVisible(false);
      this.flightLaneDebugLabels.push(label);
    }
  }

  private createRowSegmentZones(): void {
    for (let rowSegment = 0; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
      const zone = this.scene.add.zone(0, 0, 1, 1);
      zone.setDepth(DEPTHS.ENDCARD_INPUT - 3);
      zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.enabled || this.locked || this.resolving || this.config.clearObjectiveLanes === null) {
          return;
        }

        this.drag = {
          rowSegment,
          startY: pointer.y,
          rotation: 0,
          lastSoundStep: 0,
        };
        this.callbacks.onRowSegmentHoldStart(this);
      });
      this.rowSegmentZones.push(zone);
    }
  }

  private updateInteractivity(): void {
    const rowSegmentInteractive = this.enabled && !this.locked && !this.resolving && this.config.clearObjectiveLanes !== null;
    const levelInteractive = this.enabled && !this.locked && this.config.clearObjectiveLanes === null;

    for (let index = 0; index < this.rowSegmentZones.length; index += 1) {
      const zone = this.rowSegmentZones[index];

      if (rowSegmentInteractive) {
        zone.setInteractive({ useHandCursor: true });
      } else {
        zone.disableInteractive();
      }
    }

    if (levelInteractive) {
      this.levelZone.setInteractive({ useHandCursor: true });
    } else {
      this.levelZone.disableInteractive();
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.drag || !this.lastView) {
      return;
    }

    const deltaY = screenDeltaToDesign(pointer.y - this.drag.startY, this.lastView.zoom);
    this.drag.rotation = Phaser.Math.Clamp(
      (deltaY / this.getLaneDragDistance()) * COIN_CYLINDER_CONFIG.rowSegmentDragDirection,
      -2.5,
      2.5,
    );
    this.rowSegmentRotations[this.drag.rowSegment] = this.drag.rotation;
    this.playRowSegmentRotateTicks(this.drag, this.getRowSegmentStep(this.drag.rotation));
    this.layoutPieces(this.lastView);
  }

  private handlePointerUp(): void {
    if (!this.drag || !this.lastView) {
      this.drag = null;
      return;
    }

    const drag = this.drag;
    const step = this.getRowSegmentStep(drag.rotation);
    const rotated = step !== 0;
    this.playRowSegmentRotateTicks(drag, step);

    this.drag = null;
    this.resolving = true;
    this.updateInteractivity();
    this.animateRollSettle(drag.rowSegment, step, () => {
      if (step !== 0) {
        this.rowSegmentLaneOffsets[drag.rowSegment] = positiveModulo(
          this.rowSegmentLaneOffsets[drag.rowSegment] + step,
          this.config.laneCount,
        );
      }

      this.rowSegmentRotations[drag.rowSegment] = 0;
      if (this.lastView) {
        this.layoutPieces(this.lastView);
      }

      this.resolving = false;
      this.resolveLaneMatches();
      this.callbacks.onRowSegmentHoldEnd(this, rotated);

      if (!this.resolving) {
        this.updateInteractivity();
      }
    });
  }

  private animateRollSettle(rowSegment: number, step: number, onComplete: () => void): void {
    const tweenTarget = { value: this.rowSegmentRotations[rowSegment] };

    this.scene.tweens.add({
      targets: tweenTarget,
      value: step,
      duration: step === 0 ? 120 : TIMING.rowSegmentSnapMs,
      ease: 'Sine.easeOut',
      onUpdate: () => {
        this.rowSegmentRotations[rowSegment] = tweenTarget.value;
        if (this.lastView) {
          this.layoutPieces(this.lastView);
        }
      },
      onComplete: () => {
        this.rowSegmentRotations[rowSegment] = step;
        if (this.lastView) {
          this.layoutPieces(this.lastView);
        }
        onComplete();
      },
    });
  }

  private getRowSegmentStep(rotation: number): number {
    return Math.abs(rotation) >= 0.38 ? Math.round(rotation) : 0;
  }

  private playRowSegmentRotateTicks(drag: DragState, targetStep: number): void {
    const stepDelta = targetStep - drag.lastSoundStep;
    const tickCount = Math.abs(stepDelta);

    if (tickCount === 0) {
      return;
    }

    const direction = Math.sign(stepDelta);
    for (let tick = 0; tick < tickCount; tick += 1) {
      drag.lastSoundStep += direction;
      this.callbacks.onRowSegmentRotate();
    }
  }

  private layoutPieces(view: ViewTransform): void {
    this.layoutInnerPieces(view);
    this.layoutOuterPieces(view);
    this.layoutFlightLaneDebugLabels(view);
    this.scene.sys.depthSort();
  }

  private layoutInnerPieces(view: ViewTransform): void {
    const inner = this.config.innerCylinder;
    const dimAmount = this.getVisibleCoinDimAmount3D();

    for (let index = 0; index < this.innerPieces.length; index += 1) {
      const piece = this.innerPieces[index];
      const position = this.getInnerPiecePosition(piece);
      const depth = this.getInnerPieceDepth(piece);
      const laneVisual = this.getInnerLaneVisual(piece.rowSegment, piece.lane);
      const visible = inner.enabled;

      this.layoutCoin3D(piece, laneVisual.colorType, position, depth, visible, inner.alpha, dimAmount, 0, view);
    }
  }

  private layoutOuterPieces(view: ViewTransform): void {
    for (let index = 0; index < this.pieces.length; index += 1) {
      const piece = this.pieces[index];

      if (this.isOuterDisplayLaneEmpty(piece.rowSegment, piece.lane)) {
        piece.alpha = 0;
        piece.visible = false;
        this.updateCoin3DFromPiece(piece);
        continue;
      }

      const position = this.getPiecePosition(piece);
      const depth = this.getPieceDepth(piece);
      const laneVisual = this.getOuterLaneVisual(piece.rowSegment, piece.lane);
      const rotationDegrees = this.getRowSegmentCoinRotationDegrees(piece.rowSegment);
      const dimAmount = this.getVisibleCoinDimAmount3D();

      this.layoutCoin3D(piece, laneVisual.colorType, position, depth, true, 1, dimAmount, rotationDegrees, view);
    }
  }

  private layoutCoin3D(
    piece: CoinStackPiece,
    colorType: CoinColorType | null,
    position: { x: number; y: number },
    coinDepth: number,
    visible: boolean,
    alpha: number,
    dimAmount: number,
    rotationDegrees: number,
    view: ViewTransform,
  ): void {
    piece.x = view.x(position.x);
    piece.y = view.y(position.y);
    piece.depth = coinDepth;
    piece.displayWidth = view.d(COIN_3D_CONFIG.displayWidth3D);
    piece.displayHeight = view.d(COIN_3D_CONFIG.displayHeight3D);
    piece.rotationDegrees = rotationDegrees;
    piece.alpha = alpha;
    piece.dimAmount = dimAmount;
    piece.visible = visible;
    piece.colorType = colorType;
    this.updateCoin3DFromPiece(piece);
  }

  private updateCoin3DFromPiece(piece: CoinStackPiece): void {
    this.coin3D.updateCoin(piece.coin3D, {
      x: piece.x,
      y: piece.y,
      depth: piece.depth,
      displayWidth: piece.displayWidth,
      displayHeight: piece.displayHeight,
      rotationDegrees: piece.rotationDegrees,
      alpha: piece.alpha,
      dimAmount: piece.dimAmount,
      visible: piece.visible && piece.alpha > 0.001,
      colorType: piece.colorType,
      unlit: this.shouldUseUnlitCoinMaterials(),
    });
  }

  private shouldUseUnlitCoinMaterials(): boolean {
    return this.locked && !this.completedLocked;
  }

  private getRowSegmentCoinRotationDegrees(rowSegment: number): number {
    const initialLaneOffset = this.config.initialRowSegmentOffsets[rowSegment] ?? rowSegment;
    const totalLaneRotation =
      this.rowSegmentLaneOffsets[rowSegment] - initialLaneOffset + this.rowSegmentRotations[rowSegment];

    return totalLaneRotation * (360 / this.config.laneCount);
  }

  private layoutFlightLaneDebugLabels(view: ViewTransform): void {
    if (!this.flightLaneDebugVisible) {
      return;
    }

    const fontSize = Math.max(10, Math.round(view.d(FLIGHT_LANE_DEBUG_CONFIG.fontSize)));
    const strokeThickness = Math.max(2, Math.round(view.d(FLIGHT_LANE_DEBUG_CONFIG.strokeThickness)));

    for (let lane = 0; lane < this.flightLaneDebugLabels.length; lane += 1) {
      const label = this.flightLaneDebugLabels[lane];
      const anchorPiece = this.getFlightLaneDebugAnchorPiece(lane);

      if (!anchorPiece) {
        label.setVisible(false);
        continue;
      }

      const position = this.getPiecePosition(anchorPiece);
      label.setVisible(true);
      label.setText(String(lane));
      label.setColor(this.getFlightLaneDebugColor(lane));
      label.setFontSize(fontSize);
      label.setStroke(FLIGHT_LANE_DEBUG_CONFIG.strokeColor, strokeThickness);
      label.setPosition(view.x(position.x), view.y(position.y + FLIGHT_LANE_DEBUG_CONFIG.offsetY));
    }
  }

  private getFlightLaneDebugAnchorPiece(displayLane: number): CoinStackPiece | null {
    const topClearPiece = this.getLaneClearPieces(displayLane)[0];

    if (topClearPiece) {
      return topClearPiece;
    }

    return (
      this.pieces.find(
        piece =>
          piece.lane === displayLane &&
          piece.rowSegment === this.config.rowSegmentCount - 1 &&
          piece.coinStackIndex === this.config.coinsPerRowSegment - 1,
      ) ?? null
    );
  }

  private getFlightLaneDebugColor(displayLane: number): string {
    const depthConfig =
      COIN_FLIGHT_LANE_DEPTH_CONFIG[this.config.id as keyof typeof COIN_FLIGHT_LANE_DEPTH_CONFIG];

    if (!depthConfig) {
      return FLIGHT_LANE_DEBUG_CONFIG.defaultColor;
    }

    const frontLanes = depthConfig.frontLanes as readonly number[];
    const backLanes = depthConfig.backLanes as readonly number[];

    if (frontLanes.includes(displayLane)) {
      return FLIGHT_LANE_DEBUG_CONFIG.frontColor;
    }

    if (backLanes.includes(displayLane)) {
      return FLIGHT_LANE_DEBUG_CONFIG.backColor;
    }

    return FLIGHT_LANE_DEBUG_CONFIG.defaultColor;
  }

  private updateVisualState(animate: boolean): void {
    const target = this.getTargetAlphaProgress();
    const alreadyAtTarget = Math.abs(this.visualState.alphaProgress - target) < 0.001;

    if (this.alphaTarget === target) {
      if (animate && this.colorTween?.isPlaying()) {
        return;
      }
      if (alreadyAtTarget) {
        return;
      }
    }

    if (alreadyAtTarget && !this.colorTween) {
      this.alphaTarget = target;
      return;
    }

    this.alphaTarget = target;
    this.colorTween?.stop();
    this.colorTween = null;

    if (!animate || !this.lastView || COIN_CYLINDER_CONFIG.visualFadeMs3D <= 0) {
      this.visualState.alphaProgress = target;
      if (this.lastView) {
        this.layoutPieces(this.lastView);
      }
      return;
    }

    this.colorTween = this.scene.tweens.add({
      targets: this.visualState,
      alphaProgress: target,
      duration: COIN_CYLINDER_CONFIG.visualFadeMs3D,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        if (this.lastView) {
          this.layoutPieces(this.lastView);
        }
      },
      onComplete: () => {
        this.visualState.alphaProgress = target;
        this.colorTween = null;
        if (this.lastView) {
          this.layoutPieces(this.lastView);
        }
      },
    });
  }

  private getVisibleCoinDimAmount3D(): number {
    return Phaser.Math.Linear(COIN_3D_CONFIG.inactiveMaterialDimAmount3D, 0, this.visualState.alphaProgress);
  }

  private getTargetAlphaProgress(): number {
    if (this.completedLocked) {
      return 1;
    }

    return !this.config.darkenWhenNonInteractable || (this.enabled && !this.locked) ? 1 : 0;
  }

  private getPiecePosition(piece: CoinStackPiece): { x: number; y: number } {
    const lanePosition = this.getOuterLanePosition(piece);
    const angle = this.getLaneAngle(lanePosition);
    const depthX = Math.cos(angle) * this.getLaneDepthX();
    const rowSegmentCenter =
      this.config.centerX + (piece.rowSegment - (this.config.rowSegmentCount - 1) / 2) * this.getRowSegmentSpacing();
    const coinOffset =
      (piece.coinStackIndex - (this.config.coinsPerRowSegment - 1) / 2) * this.config.coinOverlap;

    return {
      x: rowSegmentCenter + coinOffset + depthX,
      y: this.config.centerY + Math.sin(angle) * this.getLaneRadiusY(),
    };
  }

  private getPieceDepth(piece: CoinStackPiece): number {
    const lanePosition = this.getOuterLanePosition(piece);
    const cylinderFrontPriority = this.getLaneFrontPosition(lanePosition);
    return this.getOuterDepth(piece.rowSegment, cylinderFrontPriority, piece.coinStackIndex);
  }

  private getInnerPiecePosition(piece: CoinStackPiece): { x: number; y: number } {
    const inner = this.config.innerCylinder;
    const lanePosition = this.getInnerLanePosition(piece.lane);
    const angle = this.getLaneAngle(lanePosition, inner.laneCount);
    const depthX = Math.cos(angle) * this.getInnerLaneDepthX();
    const rowSegmentCenter =
      this.config.centerX +
      inner.centerXOffset +
      (piece.rowSegment - (this.config.rowSegmentCount - 1) / 2) * this.getInnerColumnSpacing();
    const coinOffset =
      (piece.coinStackIndex - (this.config.coinsPerRowSegment - 1) / 2) * inner.coinOverlap;

    return {
      x: rowSegmentCenter + coinOffset + depthX,
      y: this.config.centerY + inner.centerYOffset + Math.sin(angle) * this.getInnerLaneRadiusY(),
    };
  }

  private getInnerPieceDepth(piece: CoinStackPiece): number {
    const inner = this.config.innerCylinder;
    const lanePosition = this.getInnerLanePosition(piece.lane);
    const cylinderFrontPriority = this.getLaneFrontPosition(lanePosition, inner.laneCount);
    const inset = Phaser.Math.Clamp(COIN_DEPTH_CONFIG.innerSandwichInset, 0.01, 0.49);
    const innerDepthRatio = Phaser.Math.Clamp(this.getInnerLaneDepthX() / Math.max(0.001, this.getLaneDepthX()), 0, 1);
    const innerDepthRange = innerDepthRatio * (1 - inset * 2);
    const innerFrontPriority = 0.5 + (cylinderFrontPriority - 0.5) * innerDepthRange;
    return this.getOuterDepth(
      this.getInnerOuterRowSegment(piece.rowSegment),
      innerFrontPriority,
      piece.coinStackIndex,
    );
  }

  private getOuterDepth(rowSegment: number, laneFrontPriority: number, coinStackIndex: number): number {
    const clampedLanePriority = Phaser.Math.Clamp(laneFrontPriority, 0, 1);
    const rowSegmentStackPriority = rowSegment * COIN_DEPTH_CONFIG.outerRowSegmentStep;

    return (
      COIN_DEPTH_CONFIG.outerBase +
      rowSegmentStackPriority +
      clampedLanePriority * COIN_DEPTH_CONFIG.outerLaneRange +
      coinStackIndex * COIN_DEPTH_CONFIG.coinStackStep
    );
  }

  private getInnerOuterRowSegment(innerRowSegment: number): number {
    return innerRowSegment;
  }

  private getOuterLanePosition(piece: CoinStackPiece): number {
    return this.getOuterDisplayLanePosition(piece.rowSegment, piece.lane);
  }

  private getOuterDisplayLanePosition(rowSegment: number, lane: number): number {
    return lane + this.rowSegmentRotations[rowSegment];
  }

  private getInnerLanePosition(lane: number): number {
    return lane;
  }

  private getLaneAngle(lanePosition: number, laneCount = this.config.laneCount): number {
    const centeredLanePosition = positiveModulo(lanePosition + 0.5, laneCount);
    return (centeredLanePosition / laneCount) * Math.PI * 2 - Math.PI / 2;
  }

  private getLaneFrontPosition(lanePosition: number, laneCount = this.config.laneCount): number {
    const angle = this.getLaneAngle(lanePosition, laneCount);
    return (Math.cos(angle) * COIN_CYLINDER_CONFIG.frontLaneDepthDirection3D + 1) / 2;
  }

  private getOuterLaneColorType(rowSegment: number, lane: number): CoinColorType | null {
    return this.getOuterLaneVisual(rowSegment, lane).colorType;
  }

  private getOuterLaneVisual(rowSegment: number, lane: number): CoinLaneVisual {
    const sourceLane = this.getOuterSourceLane(rowSegment, lane);
    return this.outerRowSegmentLaneVisuals[rowSegment]?.[sourceLane] ?? this.getFallbackLaneVisual(sourceLane);
  }

  private getOuterSourceLane(rowSegment: number, displayLane: number): number {
    return positiveModulo(displayLane - this.rowSegmentLaneOffsets[rowSegment], this.config.laneCount);
  }

  private isOuterDisplayLaneEmpty(rowSegment: number, displayLane: number): boolean {
    const sourceLane = this.getOuterSourceLane(rowSegment, displayLane);
    return this.clearedOuterSourceLanes[rowSegment]?.has(sourceLane) ?? false;
  }

  private clearOuterDisplayLane(displayLane: number): void {
    for (let rowSegment = 0; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
      this.clearedOuterSourceLanes[rowSegment].add(this.getOuterSourceLane(rowSegment, displayLane));
    }
  }

  private getInnerLaneVisual(rowSegment: number, lane: number): CoinLaneVisual {
    const sourceLane = positiveModulo(lane, this.config.innerCylinder.laneCount);
    return this.innerRowSegmentLaneVisuals[rowSegment]?.[sourceLane] ?? this.getFallbackLaneVisual(sourceLane);
  }

  private getFallbackLaneVisual(lane: number): CoinLaneVisual {
    const colorType = this.fallbackColorTypes[lane % this.fallbackColorTypes.length];

    return {
      colorType,
    };
  }

  private layoutZones(view: ViewTransform): void {
    for (let rowSegment = 0; rowSegment < this.rowSegmentZones.length; rowSegment += 1) {
      const x =
        this.config.centerX +
        (rowSegment - (this.config.rowSegmentCount - 1) / 2) * this.getRowSegmentSpacing();
      const zone = this.rowSegmentZones[rowSegment];
      zone.setPosition(view.x(x), view.y(this.config.centerY));
      zone.setDisplaySize(
        view.d(this.getRowSegmentVisualWidth() + 28),
        view.d(this.getLevelVisualHeight()),
      );
    }

    this.levelZone.setPosition(view.x(this.config.centerX), view.y(this.config.centerY));
    this.levelZone.setDisplaySize(view.d(this.getLevelVisualWidth()), view.d(this.getLevelVisualHeight()));
  }

  private getRowSegmentVisualWidth(): number {
    return (this.config.coinsPerRowSegment - 1) * this.config.coinOverlap + COIN_3D_CONFIG.displayWidth3D;
  }

  private getRowSegmentSpacing(): number {
    return this.getRowSegmentVisualWidth() - COIN_3D_CONFIG.displayWidth3D * 0.55 + this.config.rowSegmentSpacingOffset;
  }

  private getInnerColumnVisualWidth(): number {
    const inner = this.config.innerCylinder;
    return (this.config.coinsPerRowSegment - 1) * inner.coinOverlap + COIN_3D_CONFIG.displayWidth3D;
  }

  private getInnerColumnSpacing(): number {
    const inner = this.config.innerCylinder;
    return this.getInnerColumnVisualWidth() - COIN_3D_CONFIG.displayWidth3D * 0.55 + inner.columnSpacingOffset;
  }

  private getLaneRadiusY(): number {
    return (
      COIN_3D_CONFIG.displayHeight3D *
      OUTER_RADIUS_Y_MULTIPLIER *
      COIN_CYLINDER_CONFIG.columnDiameterScale
    );
  }

  private getLaneDepthX(): number {
    return (
      COIN_3D_CONFIG.displayWidth3D *
      OUTER_DEPTH_X_MULTIPLIER *
      COIN_CYLINDER_CONFIG.columnDiameterScale *
      COIN_CYLINDER_CONFIG.laneDepthXScale
    );
  }

  private getLaneDragDistance(): number {
    return COIN_3D_CONFIG.displayHeight3D * 0.78;
  }

  private getLevelVisualWidth(): number {
    const outerWidth =
      (this.config.rowSegmentCount - 1) * this.getRowSegmentSpacing() +
      this.getRowSegmentVisualWidth() +
      this.getLaneDepthX() * 2;
    const innerWidth = this.getInnerVisualWidth();

    return Math.max(outerWidth, innerWidth);
  }

  private getLevelVisualHeight(): number {
    const outerHeight = this.getLaneRadiusY() * 2 + COIN_3D_CONFIG.displayHeight3D * 1.15;
    const innerHeight = this.getInnerVisualHeight();

    return Math.max(outerHeight, innerHeight);
  }

  private getInnerVisualWidth(): number {
    const inner = this.config.innerCylinder;

    if (!inner.enabled) {
      return 0;
    }

    return (
      Math.abs(inner.centerXOffset) * 2 +
      (this.config.rowSegmentCount - 1) * this.getInnerColumnSpacing() +
      this.getInnerColumnVisualWidth() +
      this.getInnerLaneDepthX() * 2
    );
  }

  private getInnerVisualHeight(): number {
    const inner = this.config.innerCylinder;

    if (!inner.enabled) {
      return 0;
    }

    return Math.abs(inner.centerYOffset) * 2 + this.getInnerLaneRadiusY() * 2 + COIN_3D_CONFIG.displayHeight3D * 1.15;
  }

  private getInnerLaneRadiusY(): number {
    return this.config.innerCylinder.radiusY * COIN_CYLINDER_CONFIG.innerColumnDiameterScale;
  }

  private getInnerLaneDepthX(): number {
    return (
      this.config.innerCylinder.depthX *
      COIN_CYLINDER_CONFIG.innerColumnDiameterScale *
      COIN_CYLINDER_CONFIG.laneDepthXScale
    );
  }

  private resetLockAnimation(): void {
    this.lockPopTween?.stop();
    this.lockFallTween?.stop();
    this.lockPopTween = null;
    this.lockFallTween = null;
    this.lockAnimating = false;
    this.lockAnimationState.offsetY = 0;
    this.lockAnimationState.rotationDegrees = 0;
    this.lockAnimationState.alpha = 1;
    this.lockAnimationState.scale = 1;
    this.lockImage.setVisible(this.locked && !this.completedLocked);
    this.lockImage.setAlpha(COIN_CYLINDER_CONFIG.lockIconAlpha);
    this.lockImage.setRotation(0);

    if (this.lastView) {
      this.layoutLock(this.lastView);
    }
  }

  private hideLockVisual(): void {
    this.lockPopTween?.stop();
    this.lockFallTween?.stop();
    this.lockPopTween = null;
    this.lockFallTween = null;
    this.lockAnimating = false;
    this.lockAnimationState.offsetY = 0;
    this.lockAnimationState.rotationDegrees = 0;
    this.lockAnimationState.alpha = 1;
    this.lockAnimationState.scale = 1;
    this.lockImage.setVisible(false);
  }

  private animateLockUnlock(): void {
    this.resetLockAnimation();
    this.lockAnimating = true;
    this.callbacks.onLevelUnlock();

    if (this.lastView) {
      this.layoutLock(this.lastView);
    }

    this.lockPopTween = this.scene.tweens.add({
      targets: this.lockAnimationState,
      offsetY: -COIN_CYLINDER_CONFIG.lockPopUpDistance,
      rotationDegrees: COIN_CYLINDER_CONFIG.lockPopRotationDegrees,
      scale: COIN_CYLINDER_CONFIG.lockPopScale,
      alpha: 1,
      duration: COIN_CYLINDER_CONFIG.lockPopMs,
      ease: 'Back.easeOut',
      onUpdate: () => {
        if (this.lastView) {
          this.layoutLock(this.lastView);
        }
      },
      onComplete: () => this.animateLockFall(),
    });
  }

  private animateLockFall(): void {
    this.lockFallTween = this.scene.tweens.add({
      targets: this.lockAnimationState,
      offsetY: COIN_CYLINDER_CONFIG.lockFallDistance,
      rotationDegrees: COIN_CYLINDER_CONFIG.lockFallRotationDegrees,
      scale: COIN_CYLINDER_CONFIG.lockFallScale,
      alpha: 0,
      duration: COIN_CYLINDER_CONFIG.lockFallMs,
      ease: 'Sine.easeIn',
      onUpdate: () => {
        if (this.lastView) {
          this.layoutLock(this.lastView);
        }
      },
      onComplete: () => {
        this.lockAnimating = false;
        this.lockAnimationState.offsetY = 0;
        this.lockAnimationState.rotationDegrees = 0;
        this.lockAnimationState.alpha = 1;
        this.lockAnimationState.scale = 1;
        this.lockPopTween = null;
        this.lockFallTween = null;

        if (this.lastView) {
          this.layoutLock(this.lastView);
        }
      },
    });
  }

  private layoutLock(view: ViewTransform): void {
    const visible = (this.locked && !this.completedLocked) || this.lockAnimating;
    this.lockImage.setVisible(visible);

    if (!visible) {
      return;
    }

    this.lockImage.setPosition(
      view.x(this.config.centerX),
      view.y(this.config.centerY + COIN_CYLINDER_CONFIG.lockIconYOffset + this.lockAnimationState.offsetY),
    );
    this.lockImage.setRotation(Phaser.Math.DegToRad(this.lockAnimationState.rotationDegrees));
    this.lockImage.setAlpha(COIN_CYLINDER_CONFIG.lockIconAlpha * this.lockAnimationState.alpha);
    this.lockImage.setDisplaySize(
      view.d(COIN_CYLINDER_CONFIG.lockIconSize * this.lockAnimationState.scale),
      view.d(COIN_CYLINDER_CONFIG.lockIconSize * this.lockAnimationState.scale),
    );
  }

  private resolveLaneMatches(): void {
    if (this.resolving || this.config.clearObjectiveLanes === null) {
      return;
    }

    const matchingLanes: number[] = [];

    for (let lane = 0; lane < this.config.laneCount; lane += 1) {
      if (this.isOuterDisplayLaneEmpty(0, lane)) {
        continue;
      }

      const firstColor = this.getOuterLaneColorType(0, lane);
      if (firstColor === null) {
        continue;
      }

      let matched = true;

      for (let rowSegment = 1; rowSegment < this.config.rowSegmentCount; rowSegment += 1) {
        if (
          this.isOuterDisplayLaneEmpty(rowSegment, lane) ||
          this.getOuterLaneColorType(rowSegment, lane) !== firstColor
        ) {
          matched = false;
          break;
        }
      }

      if (matched) {
        matchingLanes.push(lane);
      }
    }

    matchingLanes.sort((a, b) => this.getLaneTopClearDepth(b) - this.getLaneTopClearDepth(a));

    if (matchingLanes.length === 0) {
      return;
    }

    this.resolving = true;
    this.updateInteractivity();
    void this.animateLaneClears(matchingLanes);
  }

  private async animateLaneClears(matchingLanes: readonly number[]): Promise<void> {
    const laneClears: { lane: number; pieces: CoinStackPiece[] }[] = [];

    for (let index = 0; index < matchingLanes.length; index += 1) {
      const lane = matchingLanes[index];
      laneClears.push({ lane, pieces: this.getLaneClearPieces(lane) });
    }

    await this.callbacks.onClearStart(this);

    for (let index = 0; index < laneClears.length; index += 1) {
      this.clearOuterDisplayLane(laneClears[index].lane);
      this.clearedLaneCount += 1;
    }

    const clearAnimations: Promise<void>[] = [];
    for (let index = 0; index < laneClears.length; index += 1) {
      clearAnimations.push(this.animateLaneClear(laneClears[index].lane, laneClears[index].pieces));
    }

    await Promise.all(clearAnimations);
    await this.callbacks.onClearComplete(this);
    await this.wait(TIMING.clearLaneDelayMs);

    if (this.lastView) {
      this.layoutPieces(this.lastView);
    }
    this.resolving = false;

    if (this.config.clearObjectiveLanes !== null && this.clearedLaneCount >= this.config.clearObjectiveLanes) {
      this.callbacks.onObjectiveComplete(this);
      return;
    }

    this.updateInteractivity();
  }

  private async animateLaneClear(lane: number, pieces: readonly CoinStackPiece[]): Promise<void> {
    const flights: Promise<void>[] = [];

    for (let index = 0; index < pieces.length; index += 1) {
      flights.push(this.animateClearPiece(pieces[index], lane, index));
      await this.wait(TIMING.clearCoinDelayMs);
    }

    await Promise.all(flights);
  }

  private animateClearPiece(piece: CoinStackPiece, lane: number, index: number): Promise<void> {
    const laneVisual = this.getOuterLaneVisual(piece.rowSegment, lane);
    const popRight = sd(
      TIMING.clearCoinPopRightDistance +
        (index % this.config.coinsPerRowSegment) * TIMING.clearCoinPopRightStackSpread,
    );
    const startX = piece.x;
    const popState = { progress: 0, alpha: piece.alpha };

    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: popState,
        progress: 1,
        duration: TIMING.clearCoinPopMs,
        ease: 'Sine.easeOut',
        onUpdate: () => {
          piece.x = Phaser.Math.Linear(startX, startX + popRight, popState.progress);
          this.updatePoppedCoin3D(piece, laneVisual.colorType);
        },
        onComplete: () => {
          const flightDepth = this.getFlightDepth(piece, lane);
          const flight = this.callbacks.onCoinFly({
            x: piece.x,
            y: piece.y,
            depth: flightDepth,
            colorType: laneVisual.colorType,
            displayWidth: piece.displayWidth,
            displayHeight: piece.displayHeight,
            angle: piece.rotationDegrees,
            alpha: piece.alpha,
            dimAmount: piece.dimAmount,
          });

          this.scene.tweens.add({
            targets: popState,
            alpha: 0,
            duration: TIMING.clearCoinFadeMs,
            ease: 'Sine.easeOut',
            onUpdate: () => {
              piece.alpha = popState.alpha;
              this.updatePoppedCoin3D(piece, laneVisual.colorType);
            },
            onComplete: () => {
              piece.alpha = 0;
              piece.visible = false;
              this.updatePoppedCoin3D(piece, laneVisual.colorType);
            },
          });
          void flight.then(() => resolve());
        },
      });
    });
  }

  private updatePoppedCoin3D(piece: CoinStackPiece, colorType: CoinColorType | null): void {
    piece.colorType = colorType;
    piece.rotationDegrees = this.getRowSegmentCoinRotationDegrees(piece.rowSegment);
    piece.visible = piece.alpha > 0.001;
    this.updateCoin3DFromPiece(piece);
  }

  private getFlightDepth(piece: CoinStackPiece, lane: number): number {
    const depthConfig =
      COIN_FLIGHT_LANE_DEPTH_CONFIG[this.config.id as keyof typeof COIN_FLIGHT_LANE_DEPTH_CONFIG];

    if (!depthConfig) {
      return piece.depth;
    }

    const displayLane = positiveModulo(lane, this.config.laneCount);
    const frontLanes = depthConfig.frontLanes as readonly number[];
    const backLanes = depthConfig.backLanes as readonly number[];
    const stackOffset = piece.coinStackIndex * COIN_DEPTH_CONFIG.coinStackStep;

    if (frontLanes.includes(displayLane)) {
      return COIN_FLIGHT_CONFIG.frontLaneDepth + stackOffset;
    }

    if (backLanes.includes(displayLane)) {
      return COIN_FLIGHT_CONFIG.backLaneDepth + stackOffset;
    }

    return piece.depth;
  }

  private getLaneClearPieces(lane: number): CoinStackPiece[] {
    const ordered: CoinStackPiece[] = [];

    for (let rowSegment = this.config.rowSegmentCount - 1; rowSegment >= 0; rowSegment -= 1) {
      const rowSegmentPieces = this.pieces
        .filter(
          piece =>
            piece.lane === lane &&
            piece.rowSegment === rowSegment &&
            !this.isOuterDisplayLaneEmpty(piece.rowSegment, piece.lane),
        )
        .sort((a, b) => this.compareTopToBottomClearOrder(a, b));

      for (let index = 0; index < rowSegmentPieces.length; index += 1) {
        ordered.push(rowSegmentPieces[index]);
      }
    }

    return ordered;
  }

  private getLaneTopClearDepth(lane: number): number {
    const topPiece = this.getLaneClearPieces(lane)[0];
    return topPiece ? this.getPieceDepth(topPiece) : Number.NEGATIVE_INFINITY;
  }

  private compareTopToBottomClearOrder(a: CoinStackPiece, b: CoinStackPiece): number {
    const verticalOrder = a.y - b.y;

    if (Math.abs(verticalOrder) > 0.5) {
      return verticalOrder;
    }

    return b.coinStackIndex - a.coinStackIndex;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, () => resolve());
    });
  }
}
