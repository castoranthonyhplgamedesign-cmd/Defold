import Phaser from 'phaser';
import { trackEvent } from '../analytics';
import { DEPTH } from '../constants';
import { notifyGameClose, triggerCTA } from '../networks';
import type { GameConfig } from '../types';
import { getMetrics, sd } from '../utils/responsive';

export class CompletionCta {
  private readonly overlay: Phaser.GameObjects.Rectangle;
  private readonly logo: Phaser.GameObjects.Image;
  private clickLayer?: HTMLButtonElement;
  private shown = false;
  private ctaEventRecorded = false;
  private readonly logoEntrance = { progress: 1 };

  constructor(private readonly scene: Phaser.Scene, private readonly config: GameConfig) {
    const overlayColor = Phaser.Display.Color.HexStringToColor(config.COLORS.overlay).color;
    this.overlay = scene.add.rectangle(0, 0, 1, 1, overlayColor, 0.72).setOrigin(0).setDepth(DEPTH.OVERLAY).setAlpha(0).setVisible(false);
    const logoConfig = config.CHANGABLE_TEXTURES.find((item) => item.spriteName === 'logo')!;
    this.logo = scene.add.image(0, 0, 'logo').setOrigin(logoConfig.anchorPoint.x, logoConfig.anchorPoint.y).setDepth(DEPTH.LOGO).setAlpha(0).setVisible(false);
    this.relayout();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroy());
  }

  show(): void {
    if (this.shown || !this.config.SHOW_PACKSHOT) return;
    this.shown = true;
    this.overlay.setVisible(true);
    this.logo.setVisible(true);
    this.logoEntrance.progress = 0;
    this.relayoutLogo();
    trackEvent('ENDCARD_SHOWN');
    this.scene.tweens.add({ targets: this.overlay, alpha: 1, duration: this.config.TIMING.overlayFadeMs });
    this.scene.tweens.add({
      targets: this.logo,
      alpha: 1,
      duration: this.config.TIMING.logoFadeMs,
    });
    this.scene.tweens.add({
      targets: this.logoEntrance,
      progress: 1,
      duration: this.config.TIMING.logoScaleMs,
      ease: 'Back.Out',
      onUpdate: () => this.relayoutLogo(),
      onComplete: () => this.pulse(),
    });
    this.createClickLayer();
    this.redirect();
  }

  redirect(): void {
    if (!this.ctaEventRecorded) {
      this.ctaEventRecorded = true;
      trackEvent('CTA_CLICKED');
    }
    notifyGameClose();
    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    triggerCTA(isApple ? this.config.APP_LINKS.app_store : this.config.APP_LINKS.google_play);
  }

  private pulse(): void {
    const baseWidth = this.logo.displayWidth;
    const baseHeight = this.logo.displayHeight;
    this.scene.tweens.add({
      targets: this.logo,
      displayWidth: baseWidth * 1.06,
      displayHeight: baseHeight * 1.06,
      duration: this.config.TIMING.logoPulseMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  private createClickLayer(): void {
    if (this.clickLayer) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Install the game');
    Object.assign(button.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%', padding: '0', border: '0',
      opacity: '0', cursor: 'pointer', zIndex: '1000', background: 'transparent',
    });
    button.addEventListener('click', () => this.redirect());
    document.body.appendChild(button);
    this.clickLayer = button;
  }

  relayout(): void {
    const metrics = getMetrics();
    this.overlay.setPosition(0, 0).setSize(metrics.width, metrics.height);
    this.relayoutLogo();
    if (this.shown && this.logoEntrance.progress >= 1 && this.logo.alpha >= 1) {
      this.scene.tweens.killTweensOf(this.logo);
      this.pulse();
    }
  }

  private relayoutLogo(): void {
    const metrics = getMetrics();
    const logoConfig = this.config.CHANGABLE_TEXTURES.find((item) => item.spriteName === 'logo')!;
    const logoWidth = sd((logoConfig.resizeBlocked ? this.config.LOGO_WIDTH : logoConfig.originalSize.width) * logoConfig.scale);
    const width = logoWidth * this.logoEntrance.progress;
    this.logo.setPosition(metrics.width / 2, metrics.height / 2).setDisplaySize(width, width * logoConfig.originalSize.height / logoConfig.originalSize.width);
  }

  destroy(): void {
    this.clickLayer?.remove();
    this.clickLayer = undefined;
  }
}
