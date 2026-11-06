import Phaser from 'phaser';
import { trackEvent } from '../analytics';
import type { GameConfig } from '../types';

export class BootScene extends Phaser.Scene {
  private readonly configData: GameConfig;
  private loadFailed = false;

  constructor(config: GameConfig) {
    super('BootScene');
    this.configData = config;
  }

  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, () => { this.loadFailed = true; });
    const deferred = new Set(['error', 'logo']);
    for (const texture of this.configData.CHANGABLE_TEXTURES) {
      if (!deferred.has(texture.spriteName)) this.load.image(texture.spriteName, texture.path);
    }
  }

  create(): void {
    const deferred = this.configData.CHANGABLE_TEXTURES.filter((item) => item.spriteName === 'error' || item.spriteName === 'logo');
    if (deferred.length === 0) {
      for (const soundtrack of this.configData.CHANGABLE_SOUNDTRACKS) this.load.audio(soundtrack.id, soundtrack.path);
      this.load.once(Phaser.Loader.Events.COMPLETE, () => {
        if (!this.loadFailed) trackEvent('LOADED');
        this.scene.start('GameScene');
      });
      this.load.start();
      return;
    }
    for (const texture of deferred) this.load.image(texture.spriteName, texture.path);
    for (const soundtrack of this.configData.CHANGABLE_SOUNDTRACKS) this.load.audio(soundtrack.id, soundtrack.path);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      if (!this.loadFailed) trackEvent('LOADED');
      this.scene.start('GameScene');
    });
    this.load.start();
  }
}
