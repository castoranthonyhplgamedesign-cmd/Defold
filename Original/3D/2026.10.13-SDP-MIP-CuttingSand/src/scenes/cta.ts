import Phaser from 'phaser';
import { ANALYTICS_EVENTS, trackEvent } from '../analytics';
import { playSound, SOUNDS, unlockAudio } from '../audio';
import { gameConfig, getTextureSlot } from '../config';
import { DEPTH, LAYOUT, STORE_URL_ANDROID, STORE_URL_IOS } from '../constants';
import { notifyGameClose, triggerCTA } from '../networks';
import { DesignImage, DesignRegistry, ScreenRect } from '../utils/designNode';

const CTA_REENTRY_GUARD_MS = 400;
const CTA_LABEL = 'Play Sand Drop';
const SPARKLE_COUNT = 12;
// Colours from the Sand Drop logo, plus white.
const SPARKLE_COLORS = [0xffd23a, 0xffffff, 0x22c7c0, 0xb8d42a, 0xff8a1c];

export function isIosDevice(): boolean {
  const ua = navigator.userAgent || '';
  if (/iphone|ipad|ipod/i.test(ua)) {
    return true;
  }
  // iPadOS 13+ reports a desktop Safari UA; touch support disambiguates it from macOS.
  return /macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;
}

export function storeUrl(): string {
  return isIosDevice()
    ? gameConfig.APP_LINKS.app_store || STORE_URL_IOS
    : gameConfig.APP_LINKS.google_play || STORE_URL_ANDROID;
}

/** Time of the last store redirect; end-card taps within the guard are ignored. */
let lastRedirectAt = -Infinity;

/**
 * Store redirect. Every redirect (the click-limit tap and end-card taps) is reported as CTA_CLICKED.
 */
export function redirectToStore(): void {
  trackEvent(ANALYTICS_EVENTS.CTA_CLICKED);
  lastRedirectAt = performance.now();
  notifyGameClose();
  triggerCTA(storeUrl());
}

/**
 * End card: dim over the game and the Sand Drop logo, centred. Any tap anywhere is a CTA, handled
 * by a full-screen transparent DOM button (the Phaser visuals carry no CTA listener).
 * The button arms only on a pointerdown that starts after it is installed, so the tap (or the swipe
 * still in progress) that caused the end card can't also trigger it.
 */
export class EndCard {
  private clickLayer?: HTMLButtonElement;
  private shown = false;
  private armed = false;
  private secondPop?: Phaser.Time.TimerEvent;

  constructor(private readonly scene: Phaser.Scene, private readonly registry: DesignRegistry) {}

  get isShown(): boolean {
    return this.shown;
  }

  /** @param packshot false keeps the current screen and only installs the whole-screen CTA layer. */
  show(packshot: boolean): void {
    if (this.shown) {
      return;
    }
    this.shown = true;
    this.installClickLayer();
    if (!packshot) {
      return;
    }
    // Reference ending: two short reveal pops, then the bubble as the card settles.
    playSound(this.scene, SOUNDS.WIN);
    this.secondPop = this.scene.time.delayedCall(Math.max(0, gameConfig.AUDIO.endcardSecondPopMs), () => {
      this.secondPop = undefined;
      playSound(this.scene, SOUNDS.WIN);
    });

    const e = LAYOUT.endcard;
    const dim = new ScreenRect(this.registry, this.scene, LAYOUT.dimColor, 0);
    dim.rect.setDepth(DEPTH.ENDCARD_DIM);

    const logo = new DesignImage(this.registry, this.scene, 'endcard-logo', e.logoX, e.logoY, e.logoW, heightFor('endcard-logo', e.logoW))
      .setDepth(DEPTH.ENDCARD_UI);
    logo.zoom = 0.5;
    logo.alpha = 0;

    this.scene.tweens.add({ targets: dim.rect, alpha: LAYOUT.dimAlpha, duration: 300, ease: 'Sine.Out' });
    this.scene.tweens.add({
      targets: logo,
      zoom: 1,
      alpha: 1,
      duration: 420,
      delay: 80,
      ease: 'Back.Out',
      onComplete: () => {
        playSound(this.scene, SOUNDS.ENDCARD);
        this.sparkle(e.logoX, e.logoY, e.logoW);
        this.scene.tweens.add({ targets: logo, y: e.logoY - 14, duration: 1100, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
      }
    });
    trackEvent(ANALYTICS_EVENTS.ENDCARD_SHOWN);
  }

  /** Sparkles burst out around the logo as it lands (once; the images are released after). */
  private sparkle(x: number, y: number, width: number): void {
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / SPARKLE_COUNT + Math.random() * 0.5;
      const reach = width * (0.42 + Math.random() * 0.22);
      const size = 46 + Math.random() * 40;
      const s = new DesignImage(this.registry, this.scene, 'sparkle', x, y, size, size)
        .setDepth(DEPTH.ENDCARD_SPARKLE)
        .setTint(SPARKLE_COLORS[i % SPARKLE_COLORS.length]);
      s.zoom = 0.3;
      s.angle = Math.random() * 90;
      this.scene.tweens.add({
        targets: s,
        x: x + Math.cos(angle) * reach,
        y: y + Math.sin(angle) * reach * 0.7,
        zoom: 1,
        angle: s.angle + 140,
        duration: 520,
        ease: 'Cubic.Out'
      });
      this.scene.tweens.add({ targets: s, alpha: 0, zoom: 0.2, delay: 420, duration: 300, ease: 'Quad.In', onComplete: () => s.destroy() });
    }
  }

  private installClickLayer(): void {
    const installedAt = performance.now();
    const layer = document.createElement('button');
    layer.type = 'button';
    layer.setAttribute('aria-label', CTA_LABEL);
    layer.setAttribute('data-endcard-cta', '');
    Object.assign(layer.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      margin: '0',
      padding: '0',
      border: '0',
      opacity: '0',
      background: 'transparent',
      cursor: 'pointer',
      touchAction: 'manipulation',
      zIndex: String(DEPTH.ENDCARD_INPUT)
    });
    layer.addEventListener('pointerdown', event => {
      if (event.timeStamp >= installedAt) {
        this.armed = true;
      }
    });
    layer.addEventListener('click', event => {
      // Keyboard activation (detail 0) has no pointerdown; allow it.
      if (!this.armed && event.detail !== 0) {
        return;
      }
      this.armed = false;
      this.redirect();
    });
    document.body.appendChild(layer);
    this.clickLayer = layer;
  }

  /**
   * One store open per tap burst: taps within CTA_REENTRY_GUARD_MS of the previous redirect are
   * ignored — including the click-limit redirect, so a fast double tap doesn't open the store twice.
   */
  private redirect(): void {
    if (performance.now() - lastRedirectAt < CTA_REENTRY_GUARD_MS) {
      return;
    }
    unlockAudio(this.scene);
    playSound(this.scene, SOUNDS.CTA);
    redirectToStore();
  }

  destroy(): void {
    this.secondPop?.remove(false);
    this.secondPop = undefined;
    this.clickLayer?.remove();
    this.clickLayer = undefined;
  }
}

/** Display height for `width` that keeps the slot's real aspect ratio. */
function heightFor(key: string, width: number): number {
  const slot = getTextureSlot(key);
  return slot ? (width * slot.originalSize.height) / slot.originalSize.width : width;
}
