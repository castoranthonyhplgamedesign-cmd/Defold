import Phaser from 'phaser';
import { FX_TEXTURES } from '../assets';
import { DEPTH, LAYOUT, TIMING } from '../constants';
import { DesignImage, DesignRegistry, ScreenImage } from '../utils/designNode';

/** Impact effects in flight at once (round-robin pool). */
const IMPACT_POOL = 4;

type Impact = { ring: DesignImage; glow: DesignImage };

/**
 * Feedback, pooled (no runtime allocation): a shockwave ring and glow where the player tapped, a
 * light shake on a big drop, and, when the belt jams, a camera shake with a red glow along the
 * screen edges.
 */
export class Feedback {
  private vignette?: ScreenImage;
  private readonly impacts: Impact[] = [];
  private nextImpact = 0;

  constructor(private readonly scene: Phaser.Scene, private readonly registry: DesignRegistry) {}

  create(): void {
    for (let i = 0; i < IMPACT_POOL; i++) {
      const glow = new DesignImage(this.registry, this.scene, FX_TEXTURES.GLOW, 0, 0, LAYOUT.impactGlow, LAYOUT.impactGlow)
        .setDepth(DEPTH.IMPACT)
        .setVisible(false);
      const ring = new DesignImage(this.registry, this.scene, FX_TEXTURES.RING, 0, 0, LAYOUT.impactRing, LAYOUT.impactRing)
        .setDepth(DEPTH.IMPACT)
        .setVisible(false);
      this.impacts.push({ ring, glow });
    }
    this.vignette = new ScreenImage(this.registry, this.scene, 'fail-glow');
    this.vignette.image.setDepth(DEPTH.VIGNETTE).setAlpha(0);
  }

  get vignetteAlpha(): number {
    return this.vignette?.image.alpha ?? 0;
  }

  /** A tap on the sand: white shockwave ring and a flash tinted like the sand (`tint` is 0xRRGGBB). */
  tap(x: number, y: number, tint: number): void {
    const impact = this.impacts[this.nextImpact];
    if (!impact) {
      return;
    }
    this.nextImpact = (this.nextImpact + 1) % this.impacts.length;
    const { ring, glow } = impact;
    this.scene.tweens.killTweensOf([ring, glow]);

    ring.setTint(0xffffff).setVisible(true).setPosition(x, y);
    ring.zoom = 0.25;
    ring.alpha = 0.95;
    this.scene.tweens.add({ targets: ring, zoom: 1, alpha: 0, duration: 340, ease: 'Cubic.Out', onComplete: () => ring.setVisible(false) });

    glow.setTint(tint).setVisible(true).setPosition(x, y);
    glow.zoom = 0.4;
    glow.alpha = 0.9;
    this.scene.tweens.add({ targets: glow, zoom: 1.1, alpha: 0, duration: 260, ease: 'Quad.Out', onComplete: () => glow.setVisible(false) });
  }

  /** A big drop: a short, light shake. */
  bigDrop(): void {
    this.scene.cameras.main.shake(TIMING.bigDropShake, TIMING.bigDropShakeIntensity);
  }

  /** The belt jammed (fail): shake and a red glow along the screen edges. */
  jam(): void {
    this.scene.cameras.main.shake(TIMING.wrongShake, TIMING.wrongShakeIntensity);
    if (!this.vignette) {
      return;
    }
    // Storyboard fail state: the red edge glow comes up and stays, into the end card.
    const image = this.vignette.image;
    this.scene.tweens.killTweensOf(image);
    this.scene.tweens.add({ targets: image, alpha: TIMING.vignettePeak, duration: TIMING.vignetteHold, ease: 'Quad.Out' });
  }

  /**
   * Stop the vignette and any tap effects immediately (e.g. when the end card takes over).
   * @param keepVignette leave the jam's red edge glow on (the fail end card shows over it).
   */
  settle(keepVignette = false): void {
    if (this.vignette && !keepVignette) {
      this.scene.tweens.killTweensOf(this.vignette.image);
      this.vignette.image.setAlpha(0);
    }
    for (let i = 0; i < this.impacts.length; i++) {
      const { ring, glow } = this.impacts[i];
      this.scene.tweens.killTweensOf([ring, glow]);
      ring.setVisible(false);
      glow.setVisible(false);
    }
  }
}
