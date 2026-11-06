import Phaser from 'phaser';
import jarGlassBaseUrl from '../../Assets/images/Jar Glass Base.webp';
import jarGlassBodyUrl from '../../Assets/images/Jar Glass Body.webp';
import jarWoodLidUrl from '../../Assets/images/Jar Wood Lid.webp';
import { JAR_CONFIG, type CoinColorType } from '../constants';
import type { Coin3DController, Coin3DHandle, Coin3DPlaneHandle } from './Coin3DController';
import type { ViewTransform } from './types';

type LidState = {
  offsetX: number;
  offsetY: number;
  rotationDegrees: number;
};

type JarMotionState = {
  offsetY: number;
};

type JarMeterCallbacks = {
  onLidOpen?: () => void;
  onLidClose?: () => void;
};

type LidTweenKind = 'open' | 'close';

type JarFillCoin = {
  coin3D: Coin3DHandle;
  colorType: CoinColorType | null;
  x: number;
  y: number;
  depth: number;
  displayWidth: number;
  displayHeight: number;
  alpha: number;
  visible: boolean;
  rotationDegrees: number;
  jitterX: number;
  jitterY: number;
  dropStartX: number;
  dropProgress: number;
  dropTween: Phaser.Tweens.Tween | null;
};

export class JarMeter {
  private readonly scene: Phaser.Scene;
  private readonly coin3D: Coin3DController;
  private readonly callbacks: JarMeterCallbacks;
  private readonly basePlane3D: Coin3DPlaneHandle;
  private readonly bodyPlane3D: Coin3DPlaneHandle;
  private readonly lidPlane3D: Coin3DPlaneHandle;
  private readonly lidState: LidState = {
    offsetX: 0,
    offsetY: 0,
    rotationDegrees: 0,
  };
  private readonly motionState: JarMotionState = {
    offsetY: 0,
  };
  private readonly fillCoins: JarFillCoin[] = [];
  private lastView: ViewTransform | null = null;
  private focusPoint: { x: number; y: number } | null = null;
  private motionTween: Phaser.Tweens.Tween | null = null;
  private lidTween: Phaser.Tweens.Tween | null = null;
  private lidTweenKind: LidTweenKind | null = null;
  private lidCloseTimer: Phaser.Time.TimerEvent | null = null;
  private lidClosePromise: Promise<boolean> | null = null;
  private nextFillSeed = 0;
  private jarVisible = false;
  private jarAlpha = 0;

  constructor(scene: Phaser.Scene, coin3D: Coin3DController, callbacks: JarMeterCallbacks = {}) {
    this.scene = scene;
    this.coin3D = coin3D;
    this.callbacks = callbacks;
    this.basePlane3D = coin3D.createTexturedPlane3D(jarGlassBaseUrl, { transparent: false, alphaTest: 0.04 });
    this.bodyPlane3D = coin3D.createTexturedPlane3D(jarGlassBodyUrl, {
      transparent: true,
      alphaTest: 0.01,
      flipY: false,
    });
    this.lidPlane3D = coin3D.createTexturedPlane3D(jarWoodLidUrl, { transparent: true, alphaTest: 0.01, flipY: false });
    this.setJarVisible(false);
    this.setJarAlpha(0);
  }

  relayout(view: ViewTransform): void {
    this.lastView = view;
    if (!this.focusPoint) {
      return;
    }

    const basePosition = this.getJarWorldPosition(this.focusPoint);
    const position = {
      x: basePosition.x,
      y: basePosition.y + this.motionState.offsetY,
    };
    this.coin3D.updateTexturedPlane3D(this.basePlane3D, {
      x: view.x(position.x + JAR_CONFIG.baseOffsetX),
      y: view.y(position.y + JAR_CONFIG.baseOffsetY),
      depth: JAR_CONFIG.baseDepth,
      displayWidth: view.d(JAR_CONFIG.baseWidth),
      displayHeight: view.d(JAR_CONFIG.baseHeight),
      rotationDegrees: 0,
      alpha: this.jarAlpha,
      visible: this.jarVisible,
    });
    this.coin3D.updateTexturedPlane3D(this.bodyPlane3D, {
      x: view.x(position.x),
      y: view.y(position.y),
      depth: JAR_CONFIG.bodyDepth,
      displayWidth: view.d(JAR_CONFIG.bodyWidth),
      displayHeight: view.d(JAR_CONFIG.bodyHeight),
      rotationDegrees: 0,
      alpha: this.jarAlpha,
      visible: this.jarVisible,
    });
    this.layoutLid(position, view);
    this.layoutFillCoins(position, view);
  }

  prepareForClear(focusPoint: { x: number; y: number }, view: ViewTransform): Promise<void> {
    this.focusPoint = focusPoint;
    this.lastView = view;
    this.motionTween?.stop();
    this.motionTween = null;
    this.resetLid();
    this.motionState.offsetY = this.getHiddenOffsetY(focusPoint, view);
    this.setJarVisible(true);
    this.setJarAlpha(1);
    this.relayout(view);

    return new Promise(resolve => {
      this.motionTween = this.scene.tweens.add({
        targets: this.motionState,
        offsetY: 0,
        duration: JAR_CONFIG.appearMs,
        ease: 'Sine.easeInOut',
        onUpdate: () => this.relayout(view),
        onComplete: () => {
          this.motionTween = null;
          this.motionState.offsetY = 0;
          this.relayout(view);
          resolve();
        },
      });
    });
  }

  async hideAfterClear(): Promise<void> {
    if (!this.focusPoint || !this.lastView) {
      this.setJarVisible(false);
      return;
    }

    const focusPoint = this.focusPoint;
    this.motionTween?.stop();
    this.motionTween = null;
    const lidClosed = await this.closeLid();

    if (!lidClosed || this.focusPoint !== focusPoint || !this.lastView || !this.jarVisible) {
      return;
    }

    const exitView = this.lastView;
    await new Promise<void>(resolve => {
      this.motionTween = this.scene.tweens.add({
        targets: this.motionState,
        offsetY: this.getHiddenOffsetY(focusPoint, exitView),
        duration: JAR_CONFIG.disappearMs,
        ease: 'Sine.easeInOut',
        onUpdate: () => this.relayout(exitView),
        onComplete: () => {
          this.motionTween = null;
          this.setJarVisible(false);
          this.focusPoint = null;
          this.motionState.offsetY = 0;
          resolve();
        },
      });
    });
  }

  hide(immediate = false): void {
    this.motionTween?.stop();
    this.motionTween = null;

    if (immediate) {
      this.setJarAlpha(0);
      this.setJarVisible(false);
      this.focusPoint = null;
      this.motionState.offsetY = 0;
      this.resetLid();
      return;
    }

    void this.hideAfterClear();
  }

  receiveCoin(colorType: CoinColorType | null): Promise<void> {
    if (!this.focusPoint || !this.lastView) {
      return Promise.resolve();
    }

    const fillCoin = this.addFillCoin(colorType);

    this.relayout(this.lastView);
    this.openLid();
    return this.dropFillCoin(fillCoin);
  }

  openForIncomingCoin(): void {
    if (!this.focusPoint || !this.lastView) {
      return;
    }

    this.openLid();
  }

  getTarget(): { x: number; y: number } {
    const view = this.lastView;

    if (!view || !this.focusPoint) {
      return {
        x: this.scene.scale.width * 0.5,
        y: this.scene.scale.height,
      };
    }

    const basePosition = this.getJarWorldPosition(this.focusPoint);
    const position = {
      x: basePosition.x,
      y: basePosition.y + this.motionState.offsetY,
    };

    return {
      x: view.x(position.x + JAR_CONFIG.targetOffsetX),
      y: view.y(position.y + JAR_CONFIG.targetOffsetY),
    };
  }

  private setJarVisible(visible: boolean): void {
    this.jarVisible = visible;
    this.relayoutFromCurrentView();
  }

  private setJarAlpha(alpha: number): void {
    this.jarAlpha = alpha;
    this.relayoutFromCurrentView();
  }

  private layoutLid(position: { x: number; y: number }, view: ViewTransform): void {
    const lidX =
      position.x +
      JAR_CONFIG.lidOffsetX +
      (JAR_CONFIG.lidOriginX - 0.5) * JAR_CONFIG.lidWidth +
      this.lidState.offsetX;
    const lidY =
      position.y +
      JAR_CONFIG.lidOffsetY +
      (JAR_CONFIG.lidOriginY - 0.5) * JAR_CONFIG.lidHeight +
      this.lidState.offsetY;

    this.coin3D.updateTexturedPlane3D(this.lidPlane3D, {
      x: view.x(lidX),
      y: view.y(lidY),
      depth: JAR_CONFIG.lidDepth,
      displayWidth: view.d(JAR_CONFIG.lidWidth),
      displayHeight: view.d(JAR_CONFIG.lidHeight),
      rotationDegrees: this.lidState.rotationDegrees,
      alpha: this.jarAlpha,
      visible: this.jarVisible,
      originX: JAR_CONFIG.lidOriginX,
      originY: JAR_CONFIG.lidOriginY,
    });
  }

  private layoutFillCoins(position: { x: number; y: number }, view: ViewTransform): void {
    const bottom = position.y + JAR_CONFIG.fillBottomOffsetY;
    const slotCount = Math.max(1, Math.floor(JAR_CONFIG.fillColumnCount));
    const fillWidth = Math.max(0, JAR_CONFIG.fillWidth + JAR_CONFIG.fillColumnSpacing);
    const slotGap = slotCount <= 1 ? 0 : fillWidth / (slotCount - 1);
    const minX = position.x - fillWidth / 2;
    const maxX = position.x + fillWidth / 2;

    for (let index = 0; index < this.fillCoins.length; index += 1) {
      const fillCoin = this.fillCoins[index];
      const row = Math.floor(index / slotCount);
      const slotInRow = index % slotCount;
      const chaoticSlot = this.getChaoticSlot(row, slotInRow, slotCount);
      const rowLeft = position.x - fillWidth / 2;
      const rowStagger = this.getStableSigned(row * 977 + 31, JAR_CONFIG.fillChaosRowStaggerX);
      const targetCoinX = Phaser.Math.Clamp(rowLeft + chaoticSlot * slotGap + rowStagger + fillCoin.jitterX, minX, maxX);
      const targetCoinY = bottom - row * JAR_CONFIG.fillRowGap + fillCoin.jitterY;
      const mouthX = position.x + JAR_CONFIG.targetOffsetX + fillCoin.dropStartX;
      const mouthY = position.y + JAR_CONFIG.targetOffsetY;
      const coinX = Phaser.Math.Linear(mouthX, targetCoinX, fillCoin.dropProgress);
      const coinY = Phaser.Math.Linear(mouthY, targetCoinY, fillCoin.dropProgress);
      const depthOffset = index * 0.0001;
      const coinDepth = JAR_CONFIG.fillCoinDepth + depthOffset;
      const visible = this.jarVisible;

      fillCoin.x = view.x(coinX);
      fillCoin.y = view.y(coinY);
      fillCoin.depth = coinDepth;
      fillCoin.displayWidth = view.d(JAR_CONFIG.fillCoinWidth3D);
      fillCoin.displayHeight = view.d(JAR_CONFIG.fillCoinHeight3D);
      fillCoin.alpha = this.jarAlpha;
      fillCoin.visible = visible;
      this.updateFillCoin3D(fillCoin, visible);
    }
  }

  private getChaoticSlot(row: number, slot: number, slotCount: number): number {
    if (slotCount <= 1) {
      return 0;
    }

    const step = this.getCoprimeSlotStep(row, slotCount);
    const offset = this.getStableInt(row * 431 + 17, slotCount);

    return (offset + slot * step) % slotCount;
  }

  private getCoprimeSlotStep(row: number, slotCount: number): number {
    let step = Math.max(1, this.getStableInt(row * 769 + 53, slotCount - 1) + 1);

    while (this.getGreatestCommonDivisor(step, slotCount) !== 1) {
      step = (step % slotCount) + 1;
    }

    return step;
  }

  private getGreatestCommonDivisor(left: number, right: number): number {
    let a = Math.abs(left);
    let b = Math.abs(right);

    while (b !== 0) {
      const next = a % b;
      a = b;
      b = next;
    }

    return a;
  }

  private getStableInt(seed: number, maxExclusive: number): number {
    if (maxExclusive <= 1) {
      return 0;
    }

    return Math.floor(this.getStableUnit(seed) * maxExclusive);
  }

  private getStableSigned(seed: number, amount: number): number {
    if (amount <= 0) {
      return 0;
    }

    return (this.getStableUnit(seed) * 2 - 1) * amount;
  }

  private getStableUnit(seed: number): number {
    let value = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
    value ^= value >>> 13;
    value = Math.imul(value, 0xc2b2ae35);
    value ^= value >>> 16;

    return (value >>> 0) / 0xffffffff;
  }

  private getHiddenOffsetY(focusPoint: { x: number; y: number }, view: ViewTransform): number {
    const position = this.getJarWorldPosition(focusPoint);
    const screenY = view.y(position.y);
    const targetY = this.scene.scale.height + view.d(JAR_CONFIG.bodyHeight + JAR_CONFIG.bottomOffscreenPadding);
    const worldPixelSize = Math.max(0.001, view.d(1));

    return Math.max(0, (targetY - screenY) / worldPixelSize);
  }

  private relayoutFromCurrentView(): void {
    if (this.focusPoint && this.lastView) {
      this.relayout(this.lastView);
    }
  }

  private addFillCoin(colorType: CoinColorType | null): JarFillCoin {
    if (this.fillCoins.length >= JAR_CONFIG.maxFillCoins) {
      const oldest = this.fillCoins.shift();
      oldest?.dropTween?.stop();
      if (oldest) {
        this.coin3D.destroyCoin(oldest.coin3D);
      }
    }

    const alpha = this.jarAlpha;
    const seed = this.nextFillSeed;
    this.nextFillSeed += 1;
    const coin3D = this.coin3D.createCoin(colorType);
    const rotationIndex = this.getStableInt(seed * 191 + 7, JAR_CONFIG.fillAcceptedRotationDegrees.length);
    const rotationDegrees = JAR_CONFIG.fillAcceptedRotationDegrees[rotationIndex] ?? 270;
    const jitterX = this.getStableSigned(seed * 233 + 11, JAR_CONFIG.fillChaosJitterX);
    const jitterY = this.getStableSigned(seed * 283 + 19, JAR_CONFIG.fillChaosJitterY);
    const dropStartX = this.getStableSigned(seed * 337 + 23, JAR_CONFIG.fillDropMouthSpreadX);

    const fillCoin: JarFillCoin = {
      coin3D,
      colorType,
      x: 0,
      y: 0,
      depth: JAR_CONFIG.fillCoinDepth,
      displayWidth: 0,
      displayHeight: 0,
      alpha,
      visible: this.jarVisible,
      rotationDegrees,
      jitterX,
      jitterY,
      dropStartX,
      dropProgress: JAR_CONFIG.fillDropMs > 0 ? 0 : 1,
      dropTween: null,
    };

    this.fillCoins.push(fillCoin);
    return fillCoin;
  }

  private updateFillCoin3D(fillCoin: JarFillCoin, visible: boolean): void {
    const visibleWithAlpha = visible && fillCoin.alpha > 0.001;

    this.coin3D.updateCoin(fillCoin.coin3D, {
      x: fillCoin.x,
      y: fillCoin.y,
      depth: fillCoin.depth,
      displayWidth: fillCoin.displayWidth,
      displayHeight: fillCoin.displayHeight,
      rotationDegrees: fillCoin.rotationDegrees,
      screenRotationDegrees: fillCoin.rotationDegrees,
      alpha: fillCoin.alpha,
      dimAmount: 0,
      visible: visibleWithAlpha,
      colorType: fillCoin.colorType,
    });
  }

  private dropFillCoin(fillCoin: JarFillCoin): Promise<void> {
    if (JAR_CONFIG.fillDropMs <= 0) {
      fillCoin.dropProgress = 1;
      this.relayoutFromCurrentView();
      return Promise.resolve();
    }

    return new Promise(resolve => {
      fillCoin.dropTween?.stop();
      fillCoin.dropTween = this.scene.tweens.add({
        targets: fillCoin,
        dropProgress: 1,
        duration: JAR_CONFIG.fillDropMs,
        ease: 'Quad.easeIn',
        onUpdate: () => this.relayoutFromCurrentView(),
        onComplete: () => {
          fillCoin.dropTween = null;
          fillCoin.dropProgress = 1;
          this.relayoutFromCurrentView();
          resolve();
        },
        onStop: () => {
          fillCoin.dropTween = null;
          resolve();
        },
      });
    });
  }

  private openLid(): void {
    const shouldPlaySound = this.lidTweenKind !== 'open' && !this.isLidOpen();

    this.lidTween?.stop();
    this.lidCloseTimer?.remove(false);
    this.lidCloseTimer = null;

    if (shouldPlaySound) {
      this.callbacks.onLidOpen?.();
    }

    let openTween: Phaser.Tweens.Tween | null = null;
    this.lidTweenKind = 'open';
    openTween = this.scene.tweens.add({
      targets: this.lidState,
      offsetX: JAR_CONFIG.lidOpenOffsetX,
      offsetY: JAR_CONFIG.lidOpenOffsetY,
      rotationDegrees: JAR_CONFIG.lidOpenRotationDegrees,
      duration: JAR_CONFIG.lidOpenMs,
      ease: 'Back.easeOut',
      onUpdate: () => {
        this.relayoutFromCurrentView();
      },
      onComplete: () => {
        if (openTween && this.lidTween === openTween) {
          this.lidTween = null;
          this.lidTweenKind = null;
        }

        this.lidCloseTimer = this.scene.time.delayedCall(JAR_CONFIG.lidHoldMs, () => {
          void this.closeLid();
        });
      },
      onStop: () => {
        if (openTween && this.lidTween === openTween) {
          this.lidTween = null;
          this.lidTweenKind = null;
        }
      },
    });
    this.lidTween = openTween;
  }

  private closeLid(): Promise<boolean> {
    this.lidCloseTimer?.remove(false);
    this.lidCloseTimer = null;

    if (this.lidTweenKind === 'close' && this.lidClosePromise) {
      return this.lidClosePromise;
    }

    if (!this.lidTween && this.isLidClosed()) {
      return Promise.resolve(true);
    }

    this.lidTween?.stop();
    this.callbacks.onLidClose?.();

    let closeTween: Phaser.Tweens.Tween | null = null;
    this.lidTweenKind = 'close';
    this.lidClosePromise = new Promise(resolve => {
      const finish = (completed: boolean): void => {
        if (closeTween && this.lidTween === closeTween) {
          this.lidTween = null;
          this.lidTweenKind = null;
        }

        this.lidClosePromise = null;
        resolve(completed);
      };

      closeTween = this.scene.tweens.add({
        targets: this.lidState,
        offsetX: 0,
        offsetY: 0,
        rotationDegrees: 0,
        duration: JAR_CONFIG.lidCloseMs,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          this.relayoutFromCurrentView();
        },
        onComplete: () => {
          this.lidState.offsetX = 0;
          this.lidState.offsetY = 0;
          this.lidState.rotationDegrees = 0;
          this.relayoutFromCurrentView();
          finish(true);
        },
        onStop: () => {
          finish(false);
        },
      });
      this.lidTween = closeTween;
    });

    return this.lidClosePromise;
  }

  private resetLid(): void {
    this.lidTween?.stop();
    this.lidCloseTimer?.remove(false);
    this.lidTween = null;
    this.lidTweenKind = null;
    this.lidCloseTimer = null;
    this.lidClosePromise = null;
    this.lidState.offsetX = 0;
    this.lidState.offsetY = 0;
    this.lidState.rotationDegrees = 0;
  }

  private isLidOpen(): boolean {
    return this.isLidAt(
      JAR_CONFIG.lidOpenOffsetX,
      JAR_CONFIG.lidOpenOffsetY,
      JAR_CONFIG.lidOpenRotationDegrees,
    );
  }

  private isLidClosed(): boolean {
    return this.isLidAt(0, 0, 0);
  }

  private isLidAt(offsetX: number, offsetY: number, rotationDegrees: number): boolean {
    const tolerance = 0.1;

    return (
      Math.abs(this.lidState.offsetX - offsetX) <= tolerance &&
      Math.abs(this.lidState.offsetY - offsetY) <= tolerance &&
      Math.abs(this.lidState.rotationDegrees - rotationDegrees) <= tolerance
    );
  }

  private getJarWorldPosition(focusPoint: { x: number; y: number }): { x: number; y: number } {
    return {
      x: focusPoint.x + JAR_CONFIG.offsetX,
      y: focusPoint.y + JAR_CONFIG.offsetY,
    };
  }
}
