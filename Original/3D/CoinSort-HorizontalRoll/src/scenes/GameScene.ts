import Phaser from 'phaser';
import { trackEvent } from '../analytics';
import {
  CAMERA_CONFIG,
  DEPTHS,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  HAND_HINT_CONFIG,
  LEVEL_CONFIGS,
  TUTORIAL_TEXT_CONFIG,
} from '../constants';
import { Coin3DController } from '../game/Coin3DController';
import { CoinCylinderLevel } from '../game/CoinCylinderLevel';
import { CoinFlyController } from '../game/CoinFlyController';
import { JarMeter } from '../game/JarMeter';
import { SoundController } from '../game/SoundController';
import type { CoinFlyRequest, ViewTransform } from '../game/types';
import { getIterationConfig } from '../iteration';
import { bindLifecycle, notifyGameEnd, notifyGameStart } from '../networks';
import { EndCardHandle, showEndCard } from './cta';
import {
  applyResponsiveResize,
  bindResponsiveResize,
  getResponsiveMetrics,
  pollResponsiveResize,
  sd,
  sx,
  sy,
} from '../utils/responsive';

type CameraState = {
  targetX: number;
  targetY: number;
  zoom: number;
};

type HandHintMode = 'start' | 'rowGesture';
type HandHintState = {
  offsetX: number;
  offsetY: number;
  rotationDegrees: number;
  alpha: number;
  displayScale: number;
};

type TutorialTextStep = 'intro' | 'rotate';

export class GameScene extends Phaser.Scene {
  private readonly cameraState: CameraState = {
    targetX: CAMERA_CONFIG.overviewTargetX,
    targetY: CAMERA_CONFIG.overviewTargetY,
    zoom: CAMERA_CONFIG.overviewZoom,
  };
  private readonly handHintState: HandHintState = {
    offsetX: 0,
    offsetY: 0,
    rotationDegrees: HAND_HINT_CONFIG.rotationDegrees + HAND_HINT_CONFIG.tapForwardRotationDegrees,
    alpha: 0,
    displayScale: HAND_HINT_CONFIG.entryScale,
  };

  private levels: CoinCylinderLevel[] = [];
  private coin3D!: Coin3DController;
  private coinFly!: CoinFlyController;
  private jar!: JarMeter;
  private sounds!: SoundController;
  private handHint: Phaser.GameObjects.Image | null = null;
  private handHintMode: HandHintMode | null = null;
  private handHintTween: Phaser.Tweens.Tween | null = null;
  private handHintDelayTimer: Phaser.Time.TimerEvent | null = null;
  private handHintDelayResolve: ((completed: boolean) => void) | null = null;
  private handHintReturnTimer: Phaser.Time.TimerEvent | null = null;
  private handHintSequenceId = 0;
  private tutorialText: Phaser.GameObjects.Text | null = null;
  private tutorialTextStep: TutorialTextStep | null = null;
  private tutorialTextTween: Phaser.Tweens.Tween | null = null;
  private resizeCleanup: (() => void) | null = null;
  private activeLevelIndex = -1;
  private rowGestureCompleted = false;
  private started = false;
  private ended = false;
  private flightLaneDebugVisible = false;
  private endcard: EndCardHandle | null = null;

  constructor() {
    super('GameScene');
  }

  create(): void {
    const iteration = getIterationConfig();
    applyResponsiveResize(this.game);
    bindLifecycle(this);
    trackEvent('DISPLAYED');

    this.sounds = new SoundController(this);
    this.coin3D = new Coin3DController(this);
    this.coin3D.initialize();
    this.coinFly = new CoinFlyController(this, this.coin3D);
    this.jar = new JarMeter(this, this.coin3D, {
      onLidOpen: () => this.sounds.playJar(),
      onLidClose: () => this.sounds.playJar(),
    });
    this.createLevels(iteration.playableLevels);
    this.createHandHint();
    this.createTutorialText();
    this.input.keyboard?.on('keydown-F', this.toggleFlightLaneDebug, this);
    this.input.keyboard?.on('keydown-L', this.toggleLight3DDebug, this);
    this.resizeCleanup = bindResponsiveResize(this.game, () => this.relayout());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-F', this.toggleFlightLaneDebug, this);
      this.input.keyboard?.off('keydown-L', this.toggleLight3DDebug, this);
      this.tutorialTextTween?.stop();
      this.stopLightTools();
      this.coin3D.destroy();
      this.resizeCleanup?.();
    });

    this.relayout();
    this.launchLightTools();
    this.input.once('pointerdown', () => {
      this.sounds.unlockAudio();
      this.hideHandHint();
      this.startPlaying();
    });
  }

  update(): void {
    pollResponsiveResize(this.game, () => this.relayout());
    this.coin3D.render();
  }

  private createLevels(playableLevels: number): void {
    this.levels = LEVEL_CONFIGS.slice(0, playableLevels).map(
      (config, index) =>
        new CoinCylinderLevel(this, config, {
          onCoinFly: request => this.handleCoinFly(request),
          onClearStart: level => this.handleClearStart(level),
          onClearComplete: level => this.handleClearComplete(level),
          onRowSegmentRotate: () => this.sounds.playCoin(),
          onRowSegmentHoldStart: level => this.handleRowSegmentHoldStart(level),
          onRowSegmentHoldEnd: (level, rotated) => this.handleRowSegmentHoldEnd(level, rotated),
          onObjectiveComplete: level => this.handleObjectiveComplete(level),
          onNoObjectiveTap: level => this.handleNoObjectiveTap(level),
          onLevelUnlock: () => this.sounds.playUnlock(),
        }, this.coin3D),
    );

    for (let index = 0; index < this.levels.length; index += 1) {
      this.levels[index].setLocked(index !== 0, false);
      this.levels[index].setEnabled(false, false);
    }
  }

  private createHandHint(): void {
    this.handHint = this.add.image(0, 0, 'hand');
    this.handHint.setOrigin(0.5);
    this.handHint.setDepth(DEPTHS.HAND_HINT);
    this.handHint.setAlpha(0);
    this.startHandHintLoop('start');
  }

  private createTutorialText(): void {
    this.tutorialText = this.add.text(0, 0, 'Collect coins and unlock all the towers', {
      align: 'center',
      color: TUTORIAL_TEXT_CONFIG.color,
      fontFamily: 'Arial',
      fontStyle: '700',
      stroke: TUTORIAL_TEXT_CONFIG.strokeColor,
      strokeThickness: 1,
    });
    this.tutorialText.setOrigin(0.5);
    this.tutorialText.setDepth(DEPTHS.TUTORIAL_TEXT);
    this.tutorialTextStep = 'intro';
  }

  private startPlaying(): void {
    if (this.started || this.ended) {
      return;
    }

    this.started = true;
    this.activeLevelIndex = 0;
    this.hideTutorialText('intro');
    trackEvent('CHALLENGE_STARTED');
    notifyGameStart();
    this.levels[0]?.setEnabled(false);
    this.focusLevel(0, CAMERA_CONFIG.focusDurationMs, () => {
      this.levels[0]?.setEnabled(true);
      this.showTutorialText('rotate');
      this.showRowGestureHint();
    });
  }

  private handleClearStart(level: CoinCylinderLevel): Promise<void> {
    if (this.levels.indexOf(level) !== this.activeLevelIndex || this.ended) {
      return Promise.resolve();
    }

    return this.jar.prepareForClear(level.getFocusPoint(), this.createViewTransform());
  }

  private handleClearComplete(level: CoinCylinderLevel): Promise<void> {
    if (this.levels.indexOf(level) !== this.activeLevelIndex || this.ended) {
      return Promise.resolve();
    }

    return this.jar.hideAfterClear();
  }

  private handleCoinFly(request: CoinFlyRequest): Promise<void> {
    this.sounds.playCoin();
    this.jar.openForIncomingCoin();
    return this.coinFly.addFlyingCoin(request, this.jar.getTarget()).then(() => {
      return this.jar.receiveCoin(request.colorType);
    });
  }

  private toggleFlightLaneDebug(): void {
    this.flightLaneDebugVisible = !this.flightLaneDebugVisible;

    for (let index = 0; index < this.levels.length; index += 1) {
      this.levels[index].setFlightLaneDebugVisible(this.flightLaneDebugVisible);
    }
  }

  private toggleLight3DDebug(): void {
    this.coin3D.toggleLightDebug3D();
    this.coin3D.relayout();
  }

  private launchLightTools(): void {
    if (!import.meta.env.DEV || !new URLSearchParams(window.location.search).has('lightdev')) {
      return;
    }

    void import('./LightDevScene')
      .then(({ LightDevScene }) => {
        this.scene.add('LightDevScene', LightDevScene, true, { coin3D: this.coin3D });
      })
      .catch(error => console.warn('[LightDevScene] Failed to load', error));
  }

  private stopLightTools(): void {
    if (!import.meta.env.DEV || !new URLSearchParams(window.location.search).has('lightdev')) {
      return;
    }

    this.scene.stop('LightDevScene');
  }

  private handleObjectiveComplete(level: CoinCylinderLevel): void {
    const index = this.levels.indexOf(level);

    if (index !== this.activeLevelIndex || this.ended) {
      return;
    }

    trackEvent('CHALLENGE_SOLVED');
    if (this.levels.indexOf(level) === HAND_HINT_CONFIG.rowGestureLevelIndex) {
      this.rowGestureCompleted = true;
      this.hideHandHint();
    }
    level.setCompletedLocked();
    this.jar.hide();

    const nextIndex = index + 1;
    if (nextIndex >= this.levels.length) {
      this.triggerWin();
      return;
    }

    this.time.delayedCall(240, () => {
      this.activeLevelIndex = nextIndex;
      this.levels[nextIndex].setLocked(false);
      this.focusLevel(nextIndex, CAMERA_CONFIG.panDurationMs, () => {
        this.levels[nextIndex].setEnabled(true);
      });
    });
  }

  private handleNoObjectiveTap(level: CoinCylinderLevel): void {
    if (this.levels.indexOf(level) === this.activeLevelIndex) {
      this.triggerWin();
    }
  }

  private triggerWin(): void {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this.hideHandHint();
    this.hideTutorialText();
    this.jar.hide();
    notifyGameEnd();
    this.levels[this.activeLevelIndex]?.setCompletedLocked();
    this.tweens.add({
      targets: this.cameraState,
      targetX: CAMERA_CONFIG.overviewTargetX,
      targetY: CAMERA_CONFIG.overviewTargetY,
      zoom: CAMERA_CONFIG.endcardZoom,
      duration: CAMERA_CONFIG.panDurationMs,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.relayout(),
      onComplete: () => {
        this.time.delayedCall(320, () => {
          trackEvent('ENDCARD_SHOWN');
          this.endcard = showEndCard(this);
        });
      },
    });
  }

  private hideHandHint(): void {
    if (!this.handHint || !this.handHint.visible) {
      return;
    }

    this.cancelHandHintAnimation();
    this.handHintReturnTimer?.remove(false);
    this.handHintReturnTimer = null;

    this.handHintTween = this.tweens.add({
      targets: this.handHintState,
      alpha: 0,
      displayScale: HAND_HINT_CONFIG.exitScale,
      duration: HAND_HINT_CONFIG.fadeOutMs,
      ease: 'Sine.easeOut',
      onUpdate: () => this.layoutHandHint(this.createViewTransform()),
      onComplete: () => {
        this.handHint?.setVisible(false);
        this.handHintMode = null;
        this.handHintTween = null;
      },
    });
  }

  private showRowGestureHint(): void {
    if (
      !this.handHint ||
      this.rowGestureCompleted ||
      this.ended ||
      this.activeLevelIndex !== HAND_HINT_CONFIG.rowGestureLevelIndex
    ) {
      return;
    }

    this.cancelHandHintAnimation();
    this.handHintReturnTimer?.remove(false);
    this.handHintReturnTimer = null;
    this.startHandHintLoop('rowGesture');
  }

  private handleRowSegmentHoldStart(level: CoinCylinderLevel): void {
    if (this.levels.indexOf(level) !== HAND_HINT_CONFIG.rowGestureLevelIndex || this.rowGestureCompleted) {
      return;
    }

    this.hideHandHint();
  }

  private handleRowSegmentHoldEnd(level: CoinCylinderLevel, rotated: boolean): void {
    if (this.levels.indexOf(level) !== HAND_HINT_CONFIG.rowGestureLevelIndex || this.ended) {
      return;
    }

    if (rotated) {
      this.rowGestureCompleted = true;
      this.hideHandHint();
      this.hideTutorialText('rotate');
      return;
    }

    if (this.rowGestureCompleted || this.activeLevelIndex !== HAND_HINT_CONFIG.rowGestureLevelIndex) {
      return;
    }

    this.handHintReturnTimer?.remove(false);
    this.handHintReturnTimer = this.time.delayedCall(HAND_HINT_CONFIG.rowGestureReturnDelayMs, () => {
      this.handHintReturnTimer = null;
      this.showRowGestureHint();
    });
  }

  private focusLevel(index: number, duration: number, onComplete?: () => void): void {
    const level = this.levels[index];
    const focus = level?.getFocusPoint();

    if (!level || !focus) {
      return;
    }

    this.tweens.add({
      targets: this.cameraState,
      targetX: focus.x,
      targetY: focus.y,
      zoom: level.config.focusZoom,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.relayout(),
      onComplete: () => {
        this.relayout();
        onComplete?.();
      },
    });
  }

  private relayout(): void {
    const view = this.createViewTransform();
    for (let index = 0; index < this.levels.length; index += 1) {
      this.levels[index].relayout(view);
    }

    this.jar.relayout(view);
    this.layoutHandHint(view);
    this.layoutTutorialText(view);
    this.endcard?.relayout();
    this.coin3D.relayout();
  }

  private showTutorialText(step: TutorialTextStep): void {
    if (!this.tutorialText || this.ended) {
      return;
    }

    this.tutorialTextTween?.stop();
    this.tutorialTextStep = step;
    this.tutorialText.setText(
      step === 'intro' ? 'Collect coins and unlock all the towers' : 'Line up the coins of the same color',
    );
    this.tutorialText.setVisible(true);
    this.tutorialText.setAlpha(0);
    this.layoutTutorialText(this.createViewTransform());

    this.tutorialTextTween = this.tweens.add({
      targets: this.tutorialText,
      alpha: 1,
      duration: TUTORIAL_TEXT_CONFIG.fadeMs,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tutorialTextTween = null;
      },
    });
  }

  private hideTutorialText(step?: TutorialTextStep): void {
    if (!this.tutorialText || !this.tutorialText.visible || (step && this.tutorialTextStep !== step)) {
      return;
    }

    this.tutorialTextTween?.stop();
    this.tutorialTextTween = this.tweens.add({
      targets: this.tutorialText,
      alpha: 0,
      duration: TUTORIAL_TEXT_CONFIG.fadeMs,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tutorialText?.setVisible(false);
        this.tutorialTextStep = null;
        this.tutorialTextTween = null;
      },
    });
  }

  private layoutTutorialText(view: ViewTransform): void {
    if (!this.tutorialText || !this.tutorialText.visible) {
      return;
    }

    const level = this.levels[TUTORIAL_TEXT_CONFIG.levelIndex];

    if (!level) {
      this.tutorialText.setVisible(false);
      return;
    }

    const metrics = getResponsiveMetrics();
    const wrapWidth = Math.max(1, Math.round(
      Math.min(
        sd(TUTORIAL_TEXT_CONFIG.maxWidth),
        metrics.canvasW - sd(TUTORIAL_TEXT_CONFIG.sidePadding * 2),
      ),
    ));
    const levelTopY = view.y(level.getVisualTopY());
    const topPadding = sd(TUTORIAL_TEXT_CONFIG.topPadding);
    const levelGap = sd(TUTORIAL_TEXT_CONFIG.levelGap);
    const availableHeight = Math.max(1, levelTopY - levelGap - topPadding);
    const fontSize = this.fitTutorialTextFontSize(wrapWidth, availableHeight);
    const strokeThickness = Math.round(sd(TUTORIAL_TEXT_CONFIG.strokeThickness));
    const glowBlur = Math.round(sd(TUTORIAL_TEXT_CONFIG.glowBlur));

    this.applyTutorialTextStyle(fontSize, wrapWidth, strokeThickness, glowBlur);

    const effectPadding = strokeThickness;
    const visualHeight = this.tutorialText.height + effectPadding * 2;
    const minY = topPadding + visualHeight / 2;
    const maxY = levelTopY - levelGap - visualHeight / 2;
    const preferredY = view.y(level.config.centerY + TUTORIAL_TEXT_CONFIG.offsetY);
    const y = maxY >= minY ? Phaser.Math.Clamp(preferredY, minY, maxY) : minY;

    this.tutorialText.setPosition(view.x(level.config.centerX), y);
  }

  private fitTutorialTextFontSize(wrapWidth: number, availableHeight: number): number {
    if (!this.tutorialText) {
      return Math.round(sd(TUTORIAL_TEXT_CONFIG.fontSize));
    }

    const maxFontSize = Math.round(sd(TUTORIAL_TEXT_CONFIG.fontSize));
    const minFontSize = Math.round(sd(TUTORIAL_TEXT_CONFIG.minFontSize));
    const strokeThickness = Math.round(sd(TUTORIAL_TEXT_CONFIG.strokeThickness));
    const glowBlur = Math.round(sd(TUTORIAL_TEXT_CONFIG.glowBlur));

    for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
      this.applyTutorialTextStyle(fontSize, wrapWidth, strokeThickness, glowBlur);

      if (this.tutorialText.height + strokeThickness * 2 <= availableHeight) {
        return fontSize;
      }
    }

    return minFontSize;
  }

  private applyTutorialTextStyle(
    fontSize: number,
    wrapWidth: number,
    strokeThickness: number,
    glowBlur: number,
  ): void {
    if (!this.tutorialText) {
      return;
    }

    this.tutorialText.setFontSize(fontSize);
    this.tutorialText.setWordWrapWidth(wrapWidth, true);
    this.tutorialText.setStroke(TUTORIAL_TEXT_CONFIG.strokeColor, strokeThickness);
    this.tutorialText.setShadow(0, 0, TUTORIAL_TEXT_CONFIG.glowColor, glowBlur, true, true);
  }

  private layoutHandHint(view: ViewTransform): void {
    if (!this.handHint || !this.handHint.visible) {
      return;
    }

    const focus = this.getHandHintFocusPoint();

    if (!focus) {
      this.handHint.setVisible(false);
      return;
    }

    const basePosition = this.getHandHintBasePosition(focus);
    this.handHint.setPosition(
      view.x(basePosition.x + this.handHintState.offsetX),
      view.y(basePosition.y + this.handHintState.offsetY),
    );
    this.handHint.setRotation(Phaser.Math.DegToRad(this.handHintState.rotationDegrees));
    this.handHint.setAlpha(this.handHintState.alpha);
    this.handHint.setDisplaySize(
      view.d(HAND_HINT_CONFIG.size * this.handHintState.displayScale),
      view.d(HAND_HINT_CONFIG.size * this.handHintState.displayScale),
    );
  }

  private getHandHintFocusPoint(): { x: number; y: number } | null {
    if (this.handHintMode === 'rowGesture') {
      return this.levels[HAND_HINT_CONFIG.rowGestureLevelIndex]?.getRowSegmentHintPoint(
        HAND_HINT_CONFIG.rowGestureSegmentIndex,
      ) ?? null;
    }

    return this.levels[HAND_HINT_CONFIG.targetLevelIndex]?.getFocusPoint() ?? null;
  }

  private getHandHintBasePosition(focus: { x: number; y: number }): { x: number; y: number } {
    if (this.handHintMode === 'rowGesture') {
      return {
        x: focus.x + HAND_HINT_CONFIG.rowGestureOffsetX,
        y: focus.y + HAND_HINT_CONFIG.rowGestureOffsetY,
      };
    }

    return {
      x: focus.x + HAND_HINT_CONFIG.offsetX,
      y: focus.y + HAND_HINT_CONFIG.offsetY,
    };
  }

  private startHandHintLoop(mode: HandHintMode): void {
    if (!this.handHint) {
      return;
    }

    this.cancelHandHintAnimation();
    const token = ++this.handHintSequenceId;
    this.handHintMode = mode;
    this.handHint.setVisible(true);
    this.resetHandHintState(mode);
    this.layoutHandHint(this.createViewTransform());
    void this.runHandHintLoop(token, mode);
  }

  private async runHandHintLoop(token: number, mode: HandHintMode): Promise<void> {
    while (this.isHandHintSequenceActive(token, mode)) {
      this.resetHandHintState(mode);
      this.layoutHandHint(this.createViewTransform());

      const completed = await this.runHandHintCycle(token, mode);
      if (!completed) {
        return;
      }

      await this.waitHandHint(token, mode, HAND_HINT_CONFIG.loopPauseMs);
    }
  }

  private async runHandHintCycle(token: number, mode: HandHintMode): Promise<boolean> {
    const baseRotation = this.getHandBaseRotationDegrees(mode);
    const backRotation = baseRotation + HAND_HINT_CONFIG.tapBackRotationDegrees;
    const forwardRotation = baseRotation + HAND_HINT_CONFIG.tapForwardRotationDegrees;

    this.handHintState.rotationDegrees = forwardRotation;

    if (!(await this.tweenHandState(token, mode, {
      alpha: HAND_HINT_CONFIG.alpha,
      displayScale: HAND_HINT_CONFIG.activeScale,
    }, HAND_HINT_CONFIG.entryMs, 'Sine.easeOut'))) {
      return false;
    }

    if (!(await this.tweenHandState(token, mode, {
      rotationDegrees: backRotation,
    }, HAND_HINT_CONFIG.tapRotateBackMs, 'Sine.easeInOut'))) {
      return false;
    }

    if (!(await this.waitHandHint(token, mode, HAND_HINT_CONFIG.tapBackPauseMs))) {
      return false;
    }

    if (!(await this.tweenHandState(token, mode, {
      rotationDegrees: forwardRotation,
    }, HAND_HINT_CONFIG.tapRotateForwardMs, 'Sine.easeInOut'))) {
      return false;
    }

    if (!(await this.waitHandHint(token, mode, HAND_HINT_CONFIG.tapForwardPauseMs))) {
      return false;
    }

    if (mode === 'rowGesture') {
      if (!(await this.tweenHandState(token, mode, {
        offsetX: HAND_HINT_CONFIG.rowGestureSlideOffsetX,
        offsetY: HAND_HINT_CONFIG.rowGestureSlideOffsetY,
      }, HAND_HINT_CONFIG.rowGestureSlideMs, 'Sine.easeInOut'))) {
        return false;
      }

      if (!(await this.waitHandHint(token, mode, HAND_HINT_CONFIG.rowGestureSlidePauseMs))) {
        return false;
      }
    }

    return this.tweenHandState(token, mode, {
      alpha: 0,
      displayScale: HAND_HINT_CONFIG.exitScale,
    }, HAND_HINT_CONFIG.exitMs, 'Sine.easeIn');
  }

  private tweenHandState(
    token: number,
    mode: HandHintMode,
    target: Partial<HandHintState>,
    durationMs: number,
    ease: string,
  ): Promise<boolean> {
    if (!this.isHandHintSequenceActive(token, mode)) {
      return Promise.resolve(false);
    }

    const duration = Math.max(1, durationMs);

    return new Promise(resolve => {
      this.handHintTween = this.tweens.add({
        targets: this.handHintState,
        ...target,
        duration,
        ease,
        onUpdate: () => this.layoutHandHint(this.createViewTransform()),
        onComplete: () => {
          this.handHintTween = null;
          resolve(this.isHandHintSequenceActive(token, mode));
        },
        onStop: () => resolve(false),
      });
    });
  }

  private waitHandHint(token: number, mode: HandHintMode, delayMs: number): Promise<boolean> {
    if (!this.isHandHintSequenceActive(token, mode)) {
      return Promise.resolve(false);
    }

    const delay = Math.max(0, delayMs);
    if (delay === 0) {
      return Promise.resolve(true);
    }

    return new Promise(resolve => {
      this.handHintDelayResolve = resolve;
      this.handHintDelayTimer = this.time.delayedCall(delay, () => {
        this.handHintDelayTimer = null;
        this.handHintDelayResolve = null;
        resolve(this.isHandHintSequenceActive(token, mode));
      });
    });
  }

  private cancelHandHintAnimation(): void {
    this.handHintSequenceId += 1;
    this.handHintTween?.stop();
    this.handHintTween = null;
    this.handHintDelayTimer?.remove(false);
    this.handHintDelayTimer = null;
    this.handHintDelayResolve?.(false);
    this.handHintDelayResolve = null;
  }

  private resetHandHintState(mode: HandHintMode): void {
    this.handHintState.offsetX = 0;
    this.handHintState.offsetY = 0;
    this.handHintState.rotationDegrees =
      this.getHandBaseRotationDegrees(mode) + HAND_HINT_CONFIG.tapForwardRotationDegrees;
    this.handHintState.alpha = 0;
    this.handHintState.displayScale = HAND_HINT_CONFIG.entryScale;
  }

  private getHandBaseRotationDegrees(mode: HandHintMode): number {
    return mode === 'rowGesture' ? HAND_HINT_CONFIG.rowGestureRotationDegrees : HAND_HINT_CONFIG.rotationDegrees;
  }

  private isHandHintSequenceActive(token: number, mode: HandHintMode): boolean {
    if (!this.handHint || !this.handHint.visible || token !== this.handHintSequenceId || this.handHintMode !== mode) {
      return false;
    }

    if (mode === 'start') {
      return !this.started && !this.ended;
    }

    return (
      !this.rowGestureCompleted &&
      !this.ended &&
      this.activeLevelIndex === HAND_HINT_CONFIG.rowGestureLevelIndex
    );
  }

  private createViewTransform(): ViewTransform {
    const halfW = DESIGN_WIDTH / 2;
    const halfH = DESIGN_HEIGHT / 2;

    return {
      zoom: this.cameraState.zoom,
      x: worldX => sx(halfW + (worldX - this.cameraState.targetX) * this.cameraState.zoom),
      y: worldY => sy(halfH + (worldY - this.cameraState.targetY) * this.cameraState.zoom),
      d: worldValue => sd(worldValue * this.cameraState.zoom),
    };
  }
}
