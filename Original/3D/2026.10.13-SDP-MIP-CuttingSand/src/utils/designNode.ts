import Phaser from 'phaser';
import { getTextureSlot } from '../config';
import { sd, sx, sy } from './responsive';

/**
 * Game objects are authored in the 1080×1920 design space. Each node keeps its design-space
 * state (position, size, scale multiplier, alpha, angle) and maps it to canvas pixels through
 * sx/sy/sd when dirty. Tweens animate the design fields directly, so a resize or rotation only
 * marks every node dirty — no teardown, and in-flight animations continue at the new scale.
 */
export interface DesignNode {
  dirty: boolean;
  apply(): void;
  destroy(): void;
}

export class DesignRegistry {
  private readonly nodes: DesignNode[] = [];

  add<T extends DesignNode>(node: T): T {
    this.nodes.push(node);
    return node;
  }

  remove(node: DesignNode): void {
    const index = this.nodes.indexOf(node);
    if (index >= 0) {
      this.nodes.splice(index, 1);
    }
  }

  markAllDirty(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].dirty = true;
    }
  }

  flush(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.dirty) {
        node.dirty = false;
        node.apply();
      }
    }
  }
}

type Parent = Phaser.GameObjects.Layer | undefined;

export class DesignImage implements DesignNode {
  readonly image: Phaser.GameObjects.Image;
  dirty = true;
  /**
   * Texture slot whose anchorPoint / scale / resizeBlocked apply when the drawn texture is a runtime
   * derivative of that slot (e.g. the CTA button with its label drawn on); defaults to the texture key.
   */
  private slotKey?: string;
  private _x: number;
  private _y: number;
  private _w: number;
  private _h: number;
  private _zoom = 1;
  private _alpha = 1;
  private _angle = 0;

  constructor(
    private readonly registry: DesignRegistry,
    scene: Phaser.Scene,
    key: string,
    x: number,
    y: number,
    w: number,
    h: number,
    parent?: Parent
  ) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this.image = scene.add.image(0, 0, key);
    this.applyAnchor(key);
    parent?.add(this.image);
    registry.add(this);
    this.apply();
  }

  get x(): number { return this._x; }
  set x(value: number) { this._x = value; this.dirty = true; }
  get y(): number { return this._y; }
  set y(value: number) { this._y = value; this.dirty = true; }
  get w(): number { return this._w; }
  set w(value: number) { this._w = value; this.dirty = true; }
  get h(): number { return this._h; }
  set h(value: number) { this._h = value; this.dirty = true; }
  /**
   * Multiplier on the authored size (pulses, pop-ins). Deliberately not named `scale`: Phaser's
   * tween builder rewrites a `scale` key to scaleX/scaleY when the target has no own `scale`
   * property, which would silently skip this accessor.
   */
  get zoom(): number { return this._zoom; }
  set zoom(value: number) { this._zoom = value; this.dirty = true; }
  get alpha(): number { return this._alpha; }
  set alpha(value: number) { this._alpha = value; this.dirty = true; }
  get angle(): number { return this._angle; }
  set angle(value: number) { this._angle = value; this.dirty = true; }

  get visible(): boolean {
    return this.image.visible;
  }

  setVisible(value: boolean): this {
    this.image.setVisible(value);
    return this;
  }

  setDepth(value: number): this {
    this.image.setDepth(value);
    return this;
  }

  setTint(color: number): this {
    this.image.setTint(color);
    return this;
  }

  setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(w: number, h: number): this {
    this.w = w;
    this.h = h;
    return this;
  }

  setTexture(key: string): this {
    this.image.setTexture(key);
    this.applyAnchor(this.slotKey ?? key);
    this.dirty = true;
    return this;
  }

  setSlotKey(key: string): this {
    this.slotKey = key;
    this.applyAnchor(key);
    this.dirty = true;
    return this;
  }

  /** Slot anchorPoint drives the origin; runtime-generated FX textures stay centred. */
  private applyAnchor(key: string): void {
    const slot = getTextureSlot(key);
    this.image.setOrigin(slot?.anchorPoint.x ?? 0.5, slot?.anchorPoint.y ?? 0.5);
  }

  apply(): void {
    const slot = getTextureSlot(this.slotKey ?? this.image.texture.key);
    let baseW = this._w;
    let baseH = this._h;
    let slotScale = 1;
    if (slot) {
      slotScale = Number.isFinite(slot.scale) && slot.scale > 0 ? slot.scale : 1;
      if (!slot.resizeBlocked) {
        baseW = slot.originalSize.width;
        baseH = slot.originalSize.height;
      }
    }
    const factor = this._zoom * slotScale;
    this.image.setPosition(sx(this._x), sy(this._y));
    this.image.setDisplaySize(Math.max(0.0001, sd(baseW * factor)), Math.max(0.0001, sd(baseH * factor)));
    this.image.setAlpha(this._alpha);
    this.image.setAngle(this._angle);
  }

  destroy(): void {
    this.registry.remove(this);
    this.image.destroy();
  }
}

export type DesignTextStyle = {
  fontFamily: string;
  /** Font size, design px. */
  size: number;
  color: string;
  stroke?: string;
  /** Outline thickness, design px. */
  strokeThickness?: number;
};

/**
 * Text in design space: position, size and outline map through sx/sy/sd, so it stays crisp at the
 * canvas resolution after a resize (the glyphs are re-rendered at the new size, never scaled).
 */
export class DesignText implements DesignNode {
  readonly text: Phaser.GameObjects.Text;
  dirty = true;
  private _x: number;
  private _y: number;
  private _alpha = 1;

  constructor(
    private readonly registry: DesignRegistry,
    scene: Phaser.Scene,
    x: number,
    y: number,
    value: string,
    private readonly style: DesignTextStyle
  ) {
    this._x = x;
    this._y = y;
    this.text = scene.add.text(0, 0, value, { fontFamily: style.fontFamily, color: style.color }).setOrigin(0.5);
    registry.add(this);
    this.apply();
  }

  get x(): number { return this._x; }
  set x(value: number) { this._x = value; this.dirty = true; }
  get y(): number { return this._y; }
  set y(value: number) { this._y = value; this.dirty = true; }
  get alpha(): number { return this._alpha; }
  set alpha(value: number) { this._alpha = value; this.dirty = true; }

  setText(value: string): this {
    if (this.text.text !== value) {
      this.text.setText(value);
    }
    return this;
  }

  setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  setDepth(value: number): this {
    this.text.setDepth(value);
    return this;
  }

  setVisible(value: boolean): this {
    this.text.setVisible(value);
    return this;
  }

  apply(): void {
    const size = Math.max(1, Math.round(sd(this.style.size)));
    if (this.text.style.fontSize !== `${size}px`) {
      this.text.setFontSize(size);
    }
    // Checked on its own, not only when the size changes: a size that happens to equal Phaser's
    // default (16 px) on the first layout would otherwise never get its outline.
    if (this.style.stroke) {
      const thickness = Math.max(1, sd(this.style.strokeThickness ?? 0));
      if (this.text.style.stroke !== this.style.stroke || this.text.style.strokeThickness !== thickness) {
        this.text.setStroke(this.style.stroke, thickness);
      }
    }
    this.text.setPosition(sx(this._x), sy(this._y));
    this.text.setAlpha(this._alpha);
  }

  destroy(): void {
    this.registry.remove(this);
    this.text.destroy();
  }
}

/** Invisible rectangular hit target in design space. */
export class DesignZone implements DesignNode {
  readonly zone: Phaser.GameObjects.Zone;
  dirty = true;

  constructor(
    private readonly registry: DesignRegistry,
    scene: Phaser.Scene,
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    parent?: Parent
  ) {
    this.zone = scene.add.zone(0, 0, 1, 1).setOrigin(0.5);
    this.zone.setInteractive();
    parent?.add(this.zone);
    registry.add(this);
    this.apply();
  }

  apply(): void {
    this.zone.setPosition(sx(this.x), sy(this.y));
    this.zone.setSize(Math.max(1, sd(this.w)), Math.max(1, sd(this.h)));
  }

  destroy(): void {
    this.registry.remove(this);
    this.zone.destroy();
  }
}

/**
 * Margin by which full-screen fills overhang the canvas on every side. Camera shakes offset
 * everything the camera renders; without the overhang a shake slides the fill off one edge and
 * exposes the (transparent) page behind the canvas as a white strip.
 */
export function screenBleed(scene: Phaser.Scene): number {
  return Math.ceil(Math.max(scene.scale.width, scene.scale.height) * 0.05);
}

/**
 * Full-canvas image (the wrong-shot edge vignette); follows the canvas, not the design box. No
 * bleed: it is an edge glow, so a few pixels of camera shake at its border are invisible.
 */
export class ScreenImage implements DesignNode {
  readonly image: Phaser.GameObjects.Image;
  dirty = true;

  constructor(private readonly registry: DesignRegistry, private readonly scene: Phaser.Scene, key: string) {
    this.image = scene.add.image(0, 0, key).setOrigin(0, 0);
    registry.add(this);
    this.apply();
  }

  apply(): void {
    this.image.setPosition(0, 0);
    this.image.setDisplaySize(this.scene.scale.width, this.scene.scale.height);
  }

  destroy(): void {
    this.registry.remove(this);
    this.image.destroy();
  }
}

/** Full-canvas rectangle (background fills, dims, flashes); follows the canvas, not the design box. */
export class ScreenRect implements DesignNode {
  readonly rect: Phaser.GameObjects.Rectangle;
  dirty = true;

  constructor(private readonly registry: DesignRegistry, private readonly scene: Phaser.Scene, color: number, alpha: number) {
    this.rect = scene.add.rectangle(0, 0, 1, 1, color, 1).setOrigin(0, 0).setAlpha(alpha);
    registry.add(this);
    this.apply();
  }

  apply(): void {
    const bleed = screenBleed(this.scene);
    this.rect.setSize(this.scene.scale.width + bleed * 2, this.scene.scale.height + bleed * 2);
    this.rect.setPosition(-bleed, -bleed);
  }

  destroy(): void {
    this.registry.remove(this);
    this.rect.destroy();
  }
}
