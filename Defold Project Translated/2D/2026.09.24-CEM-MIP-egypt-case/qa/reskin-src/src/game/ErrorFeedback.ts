import Phaser from 'phaser';
import { DEPTH } from '../constants';
import type { GameConfig } from '../types';
import { getMetrics } from '../utils/responsive';

export class ErrorFeedback {
  private readonly image: Phaser.GameObjects.Image;

  constructor(private readonly scene: Phaser.Scene, private readonly config: GameConfig) {
    this.image = scene.add.image(0, 0, 'error').setAlpha(0).setDepth(DEPTH.ERROR).setVisible(false);
    this.relayout();
  }

  blink(): void {
    this.scene.tweens.killTweensOf(this.image);
    this.image.setVisible(true).setAlpha(0);
    this.scene.tweens.add({
      targets: this.image,
      alpha: 0.78,
      duration: this.config.TIMING.errorBlinkMs,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.InOut',
      onComplete: () => this.image.setVisible(false),
    });
  }

  relayout(): void {
    const metrics = getMetrics();
    this.image.setPosition(metrics.width / 2, metrics.height / 2).setDisplaySize(metrics.width, metrics.height);
  }
}
