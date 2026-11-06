import Phaser from 'phaser';
import { ANALYTICS_EVENTS, trackEvent } from '../analytics';
import { FX_TEXTURES } from '../assets';
import { gameConfig } from '../config';
import { notifyGameReady, unloadMraidOnFatalError } from '../networks';

/**
 * Loads every configured texture/soundtrack slot (paths already hydrated from
 * window.__CHANGEABLE_ASSETS__ or overridden via window.GAME_CONFIG) and draws the few effect
 * textures that have no supplied slice.
 */
export class BootScene extends Phaser.Scene {
  private loadFailed = false;

  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.loadFailed = false;
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      console.warn('[Boot] asset failed to load', file.key);
      // Audio is optional; a missing image leaves the ad broken, so unload instead.
      if (file.type === 'image') {
        this.loadFailed = true;
      }
    });

    for (let i = 0; i < gameConfig.CHANGABLE_TEXTURES.length; i++) {
      const texture = gameConfig.CHANGABLE_TEXTURES[i];
      if (texture.path) {
        this.load.image(texture.spriteName, texture.path);
      }
    }

    for (let i = 0; i < gameConfig.CHANGABLE_SOUNDTRACKS.length; i++) {
      const soundtrack = gameConfig.CHANGABLE_SOUNDTRACKS[i];
      if (soundtrack.path) {
        const sustained = soundtrack.id === 'bgm' || soundtrack.id === 'sfx-conveyor' || soundtrack.id === 'sfx-cut' || soundtrack.id === 'sfx-sand';
        const count = gameConfig.AUDIO.maxEffectVoices;
        // HTML5 fallback needs distinct tags for simultaneous voices; WebAudio shares the buffer.
        const instances = sustained ? 2 : Number.isFinite(count) ? Math.max(1, Math.min(8, Math.round(count))) : 4;
        this.load.audio(soundtrack.id, soundtrack.path, { instances });
      }
    }
  }

  create(): void {
    if (this.loadFailed) {
      unloadMraidOnFatalError('asset-load-error');
      return;
    }
    this.generateEffectTextures();
    trackEvent(ANALYTICS_EVENTS.LOADED);
    notifyGameReady();
    this.scene.start('GameScene');
  }

  private generateEffectTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Outline ring (tap shockwave, hint target).
    g.clear();
    g.lineStyle(9, 0xffffff, 1);
    g.strokeCircle(64, 64, 58);
    g.generateTexture(FX_TEXTURES.RING, 128, 128);
    g.destroy();

    // Soft round glow (impact flash), white so it can be tinted.
    this.drawCanvas(FX_TEXTURES.GLOW, 128, 128, ctx => {
      const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      glow.addColorStop(0, 'rgba(255,255,255,1)');
      glow.addColorStop(0.35, 'rgba(255,255,255,0.6)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 128, 128);
    });
  }

  private drawCanvas(key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): void {
    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }
    const texture = this.textures.createCanvas(key, width, height);
    if (!texture) {
      return;
    }
    draw(texture.context);
    texture.refresh();
  }
}

