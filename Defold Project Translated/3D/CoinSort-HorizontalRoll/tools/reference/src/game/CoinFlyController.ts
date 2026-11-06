import Phaser from 'phaser';
import { COIN_FLIGHT_CONFIG, TIMING } from '../constants';
import { sd } from '../utils/responsive';
import type { Coin3DController, Coin3DHandle } from './Coin3DController';
import type { CoinFlyRequest } from './types';

type CoinFlightTarget = {
  x: number;
  y: number;
};

export class CoinFlyController {
  private readonly scene: Phaser.Scene;
  private readonly coin3D: Coin3DController;
  private flightIndex = 0;

  constructor(scene: Phaser.Scene, coin3D: Coin3DController) {
    this.scene = scene;
    this.coin3D = coin3D;
  }

  addFlyingCoin(request: CoinFlyRequest, targetPoint: CoinFlightTarget): Promise<void> {
    const target = this.getTarget(targetPoint);
    const displayWidth = request.displayWidth > 0 ? request.displayWidth : sd(COIN_FLIGHT_CONFIG.displaySize3D);
    const displayHeight = request.displayHeight > 0 ? request.displayHeight : sd(COIN_FLIGHT_CONFIG.displaySize3D);
    const coin3D = this.coin3D.createCoin(request.colorType);

    this.updateFlyingCoin3D(coin3D, request, request.x, request.y, displayWidth, displayHeight, request.angle, request.alpha, true);

    return new Promise(resolve => {
      const flightState = { progress: 0 };
      const shrinkStartProgress = Phaser.Math.Clamp(
        1 - TIMING.flyCoinShrinkMs / Math.max(1, TIMING.flyCoinMs),
        0,
        0.95,
      );

      this.scene.tweens.add({
        targets: flightState,
        progress: 1,
        duration: TIMING.flyCoinMs,
        ease: 'Cubic.easeIn',
        onUpdate: () => {
          const progress = flightState.progress;
          const shrinkProgress = Phaser.Math.Clamp(
            (progress - shrinkStartProgress) / (1 - shrinkStartProgress),
            0,
            1,
          );
          const sizeProgress = Math.max(0.001, 1 - Phaser.Math.Easing.Sine.In(shrinkProgress));
          const x = Phaser.Math.Linear(request.x, target.x, progress);
          const y = Phaser.Math.Linear(request.y, target.y, progress);

          this.updateFlyingCoin3D(
            coin3D,
            request,
            x,
            y,
            displayWidth * sizeProgress,
            displayHeight * sizeProgress,
            request.angle + 420 * progress,
            request.alpha,
            true,
          );
        },
        onComplete: () => {
          this.coin3D.destroyCoin(coin3D);
          resolve();
        },
      });
    });
  }

  private getTarget(baseTarget: CoinFlightTarget): CoinFlightTarget {
    const spreadStep = (this.flightIndex % 7) - 3;
    const verticalStep = (Math.floor(this.flightIndex / 7) % 3) - 1;
    this.flightIndex += 1;

    return {
      x: baseTarget.x + sd(spreadStep * (COIN_FLIGHT_CONFIG.targetSpreadX / 7)),
      y: baseTarget.y + sd(verticalStep * COIN_FLIGHT_CONFIG.targetSpreadY),
    };
  }

  private updateFlyingCoin3D(
    coin3D: Coin3DHandle,
    request: CoinFlyRequest,
    x: number,
    y: number,
    displayWidth: number,
    displayHeight: number,
    rotationDegrees: number,
    alpha: number,
    visible: boolean,
  ): void {
    this.coin3D.updateCoin(coin3D, {
      x,
      y,
      depth: request.depth,
      displayWidth,
      displayHeight,
      rotationDegrees,
      alpha,
      dimAmount: request.dimAmount,
      visible,
      colorType: request.colorType,
    });
  }
}
