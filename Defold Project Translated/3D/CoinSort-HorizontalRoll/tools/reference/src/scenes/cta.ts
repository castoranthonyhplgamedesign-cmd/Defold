import Phaser from 'phaser';
import { trackEvent } from '../analytics';
import { DEPTHS, UI_CONFIG } from '../constants';
import { notifyGameClose, triggerCTA } from '../networks';
import { getResponsiveMetrics, sd, sx, sy } from '../utils/responsive';

export type EndCardHandle = {
  relayout: () => void;
  destroy: () => void;
};

export function redirectToStore(): void {
  notifyGameClose();
  triggerCTA();
}

export function showEndCard(scene: Phaser.Scene): EndCardHandle {
  const background = scene.add.graphics();
  const appIcon = scene.add.image(0, 0, 'app-icon');
  const zone = scene.add.zone(0, 0, 1, 1);
  const elements = [background, appIcon, zone];
  let redirected = false;
  let autoRedirectTimer: Phaser.Time.TimerEvent | null = null;

  background.setDepth(DEPTHS.ENDCARD_INPUT - 2);
  appIcon.setDepth(DEPTHS.ENDCARD_INPUT - 1);
  appIcon.setAlpha(0);
  appIcon.setOrigin(0.5);
  zone.setDepth(DEPTHS.ENDCARD_INPUT);
  zone.setInteractive({ useHandCursor: true });

  const requestRedirect = () => {
    if (redirected) {
      return;
    }

    redirected = true;
    trackEvent('CTA_CLICKED');
    redirectToStore();
  };

  zone.on('pointerdown', requestRedirect);

  const relayout = () => {
    const metrics = getResponsiveMetrics();

    background.clear();
    background.fillStyle(UI_CONFIG.endcardBackdropColor, UI_CONFIG.endcardBackdropAlpha);
    background.fillRect(0, 0, metrics.canvasW, metrics.canvasH);
    appIcon.setPosition(sx(UI_CONFIG.endcardIconX), sy(UI_CONFIG.endcardIconY));
    const sourceWidth = Math.max(1, appIcon.width);
    const sourceHeight = Math.max(1, appIcon.height);
    const iconScale = Math.min(
      Math.min(sd(UI_CONFIG.endcardIconMaxWidth), metrics.canvasW * UI_CONFIG.endcardIconViewportWidthRatio) /
        sourceWidth,
      Math.min(sd(UI_CONFIG.endcardIconMaxHeight), metrics.canvasH * UI_CONFIG.endcardIconViewportHeightRatio) /
        sourceHeight,
    );
    appIcon.setDisplaySize(sourceWidth * iconScale, sourceHeight * iconScale);
    zone.setPosition(metrics.canvasW / 2, metrics.canvasH / 2);
    zone.setSize(metrics.canvasW, metrics.canvasH);
    zone.setDisplaySize(metrics.canvasW, metrics.canvasH);
  };

  relayout();
  scene.tweens.add({
    targets: appIcon,
    alpha: 1,
    duration: UI_CONFIG.endcardFadeMs,
    ease: 'Sine.easeOut',
    onComplete: () => {
      autoRedirectTimer = scene.time.delayedCall(UI_CONFIG.endcardAutoRedirectDelayMs, requestRedirect);
    },
  });

  return {
    relayout,
    destroy: () => {
      autoRedirectTimer?.remove(false);
      for (let index = 0; index < elements.length; index += 1) {
        elements[index].destroy();
      }
    },
  };
}
