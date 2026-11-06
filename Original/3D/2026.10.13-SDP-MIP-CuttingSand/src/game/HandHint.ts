import Phaser from 'phaser';
import { FX_TEXTURES } from '../assets';
import { DEPTH, LAYOUT } from '../constants';
import { BEAT_CYCLE_MS, pressAmount } from '../utils/beat';
import { DesignImage, DesignRegistry } from '../utils/designNode';
import { sd, sx, sy } from '../utils/responsive';

/** How far (design px) the upward-pointing hand drops away from the target between taps. */
const LIFT = 34;
/** One swipe demonstration (press, drag, lift): two beats. */
const SWIPE_CYCLE_MS = BEAT_CYCLE_MS * 2;

/**
 * Fingertip position, plus where to draw the target ring (optional), in design space. With toX/toY
 * the hint is a swipe (Cutting Sand): the finger presses at tip and drags to (toX, toY).
 */
export type HintTarget = { tipX: number; tipY: number; glowX?: number; glowY?: number; toX?: number; toY?: number };

/**
 * Tutorial hand (and a white ring on the spot it points at). Shows immediately when asked, or after
 * an idle delay; any interaction calls reset() to hide it and restart the idle timer.
 */
export class HandHint {
  private hand?: DesignImage;
  private glow?: DesignImage;
  /** A swipe hint's guide line, growing behind the fingertip. */
  private guide?: Phaser.GameObjects.Graphics;
  private target?: HintTarget;
  /** Hand-centre offset from the fingertip (the tilted art). */
  private tipOffsetX = 0;
  private tipOffsetY = 0;
  /** When the hand last appeared: its tap or swipe loop starts from the beginning there. */
  private shownAt = 0;
  private idleEvent?: Phaser.Time.TimerEvent;
  /** Hand centre with the fingertip on the target (the pressed position). */
  private baseX = 0;
  private baseY = 0;
  /** Unit direction the hand lifts away from the target between taps. */
  private liftX = 0;
  private liftY = 1;
  private enabled = true;
  private idleDelayMs = 4000;

  constructor(private readonly scene: Phaser.Scene, private readonly registry: DesignRegistry) {}

  create(enabled: boolean, idleDelaySeconds: number): void {
    this.enabled = enabled;
    this.idleDelayMs = Math.max(0, idleDelaySeconds) * 1000;
    const t = LAYOUT.hintRing;
    this.glow = new DesignImage(this.registry, this.scene, FX_TEXTURES.RING, 0, 0, t, t)
      .setDepth(DEPTH.HINT_RING)
      .setVisible(false);
    const h = LAYOUT.hand;
    this.hand = new DesignImage(this.registry, this.scene, 'ui-hand', 0, 0, h.w, h.h)
      .setDepth(DEPTH.HINT)
      .setVisible(false);
    this.guide = this.scene.add.graphics().setDepth(DEPTH.HINT - 0.5);
  }

  get visible(): boolean {
    return !!this.hand?.visible;
  }

  /** QA diagnostics: whether a target is set and an idle timer is pending (ms left). */
  debugState(): Record<string, unknown> {
    return {
      enabled: this.enabled,
      target: this.target ?? null,
      idleLeft: this.idleEvent ? Math.round(this.idleEvent.getRemaining()) : null,
      visible: this.visible
    };
  }

  /** Point at a target now (tutorial start). */
  showNow(target: HintTarget): void {
    this.hide();
    this.target = target;
    this.cancelIdle();
    this.display();
  }

  /** Has a target (showing, or waiting for the idle delay). */
  get armed(): boolean {
    return !!this.target;
  }

  /** Arm the idle timer for a target; the hand appears only if nothing happens for the delay. */
  armIdle(target: HintTarget): void {
    this.hide();
    this.target = target;
    this.scheduleIdle();
  }

  /**
   * Point at a different target without touching the idle timer: a showing hand moves there, a
   * pending idle hint will appear there. Nothing happens when the hint is cleared.
   */
  retarget(target: HintTarget): void {
    if (!this.target) {
      return;
    }
    this.target = target;
    if (this.hand?.visible) {
      this.display();
    }
  }

  /** Hide and restart the idle timer for the current target (after any tap). */
  reset(): void {
    this.hide();
    if (this.target) {
      this.scheduleIdle();
    }
  }

  /** Hide and forget the target (input locked, turn changing, game over). */
  clear(): void {
    this.cancelIdle();
    this.hide();
    this.target = undefined;
  }

  private scheduleIdle(): void {
    this.cancelIdle();
    if (!this.enabled || !this.target) {
      return;
    }
    this.idleEvent = this.scene.time.delayedCall(this.idleDelayMs, () => {
      this.idleEvent = undefined;
      this.display();
    });
  }

  private cancelIdle(): void {
    this.idleEvent?.remove(false);
    this.idleEvent = undefined;
  }

  private display(): void {
    if (!this.enabled || !this.target || !this.hand || !this.glow) {
      return;
    }
    const h = LAYOUT.hand;
    // Anchor the fingertip (tipX/tipY of the hand art, rotated with the tilted hand) on the target.
    const angle = Phaser.Math.DegToRad(h.angle);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tipX = (h.tipX - 0.5) * h.w;
    const tipY = (h.tipY - 0.5) * h.h;
    this.tipOffsetX = -(tipX * cos - tipY * sin);
    this.tipOffsetY = -(tipX * sin + tipY * cos);
    const baseX = this.target.tipX + this.tipOffsetX;
    const baseY = this.target.tipY + this.tipOffsetY;
    // Between taps the hand lifts back along the finger's axis (toward the lower right).
    this.liftX = -sin;
    this.liftY = cos;
    this.hand.angle = h.angle;
    // The loop starts from its beginning (hand lifted, or at the start of the swipe), not mid-way.
    this.shownAt = this.scene.time.now;
    if (this.swipe) {
      // A swipe demonstration: tick() drives the hand, its fade and the guide line.
      this.glow.setVisible(false);
      this.hand.setVisible(true);
      this.tick(this.shownAt);
      return;
    }
    const glow = this.target.glowX !== undefined && this.target.glowY !== undefined;

    this.glow.setVisible(glow);
    this.glow.alpha = 0;
    this.scene.tweens.killTweensOf(this.glow);
    if (glow) {
      this.glow.setPosition(this.target.glowX as number, this.target.glowY as number);
      this.scene.tweens.add({ targets: this.glow, alpha: 0.9, duration: 200 });
    }

    this.hand.setVisible(true);
    this.baseX = baseX;
    this.baseY = baseY;
    this.hand.alpha = 0;
    this.scene.tweens.add({ targets: this.hand, alpha: 1, duration: 180 });
    this.tick(this.shownAt);
  }

  /**
   * Per frame (`now`: scene time, ms). The hand taps once per beat, counted from when it appeared
   * (lifted at first, fingertip on the target half a beat in), and the target ring breathes with
   * it, growing as the finger presses. A swipe hint runs tickSwipe() instead.
   */
  tick(now: number): void {
    if (!this.hand?.visible) {
      return;
    }
    if (this.swipe) {
      this.tickSwipe(now);
      return;
    }
    const press = pressAmount(((now - this.shownAt) % BEAT_CYCLE_MS) / BEAT_CYCLE_MS);
    this.hand.setPosition(this.baseX + LIFT * this.liftX * (1 - press), this.baseY + LIFT * this.liftY * (1 - press));
    this.hand.zoom = 1 - 0.08 * press;
    if (this.glow?.visible) {
      this.glow.zoom = 1 + 0.07 * press;
    }
  }

  private get swipe(): boolean {
    return this.target?.toX !== undefined && this.target?.toY !== undefined;
  }

  /**
   * One swipe demonstration per SWIPE_CYCLE_MS: the finger presses at the start, drags to the end
   * (easing in and out) with the guide line growing behind it, then lifts and fades out.
   */
  private tickSwipe(now: number): void {
    const t = this.target;
    if (!t || !this.hand || t.toX === undefined || t.toY === undefined) {
      return;
    }
    const p = ((now - this.shownAt) % SWIPE_CYCLE_MS) / SWIPE_CYCLE_MS;
    let press = 0;
    let move = 0;
    let fade = 0;
    if (p < 0.15) {
      press = p / 0.15;
      fade = Math.min(1, p / 0.08);
    } else if (p < 0.75) {
      const q = (p - 0.15) / 0.6;
      press = 1;
      move = q < 0.5 ? 2 * q * q : 1 - (2 - 2 * q) ** 2 / 2;
      fade = 1;
    } else if (p < 0.95) {
      const q = (p - 0.75) / 0.2;
      press = 1 - q;
      move = 1;
      fade = 1 - q;
    }
    const x = t.tipX + (t.toX - t.tipX) * move;
    const y = t.tipY + (t.toY - t.tipY) * move;
    this.hand.setPosition(x + this.tipOffsetX + LIFT * this.liftX * (1 - press), y + this.tipOffsetY + LIFT * this.liftY * (1 - press));
    this.hand.zoom = 1 - 0.08 * press;
    this.hand.alpha = fade;
    const g = this.guide;
    if (!g) {
      return;
    }
    g.clear();
    if (fade > 0 && move > 0) {
      const w = sd(12);
      g.lineStyle(w, 0xffffff, 0.75 * fade);
      g.lineBetween(sx(t.tipX), sy(t.tipY), sx(x), sy(y));
      g.fillStyle(0xffffff, 0.75 * fade);
      g.fillCircle(sx(t.tipX), sy(t.tipY), w / 2);
      g.fillCircle(sx(x), sy(y), w / 2);
    }
  }

  hide(): void {
    this.guide?.clear();
    if (this.hand) {
      this.scene.tweens.killTweensOf(this.hand);
      this.hand.setVisible(false);
    }
    if (this.glow) {
      this.scene.tweens.killTweensOf(this.glow);
      this.glow.setVisible(false);
      this.glow.zoom = 1;
    }
  }
}
