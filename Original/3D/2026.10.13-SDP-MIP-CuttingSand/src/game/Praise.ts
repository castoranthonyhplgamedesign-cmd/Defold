import Phaser from 'phaser';
import { FX_TEXTURES } from '../assets';
import { DEPTH, GAME_FONT, LAYOUT } from '../constants';
import { DesignImage, DesignRegistry } from '../utils/designNode';

/** Source canvas height for a praise word; the width follows the text. */
const WORD_HEIGHT = 200;

/**
 * Praise word ("GREAT!", "AWESOME!", …) that pops over the picture after a big drop, rising and
 * fading out. Each word is drawn once into a canvas texture in the game font (Sand Drop logo
 * colours, white outline); one pooled image shows it.
 */
export class Praise {
  private image?: DesignImage;

  constructor(private readonly scene: Phaser.Scene, private readonly registry: DesignRegistry) {}

  show(word: string): void {
    const key = this.texture(word);
    if (!key) {
      return;
    }
    const p = LAYOUT.praise;
    const source = this.scene.textures.get(key).getSourceImage();
    const h = (p.w * source.height) / source.width;
    if (!this.image) {
      this.image = new DesignImage(this.registry, this.scene, key, p.x, p.y, p.w, h).setDepth(DEPTH.PRAISE);
    }
    const image = this.image;
    this.scene.tweens.killTweensOf(image);
    image.setTexture(key).setSize(p.w, h).setPosition(p.x, p.y).setVisible(true);
    image.zoom = 0.3;
    image.alpha = 1;
    image.angle = -6;
    this.scene.tweens.add({ targets: image, zoom: 1, angle: 0, duration: 380, ease: 'Back.Out' });
    this.scene.tweens.add({
      targets: image,
      y: p.y - 90,
      alpha: 0,
      delay: 900,
      duration: 380,
      ease: 'Quad.In',
      onComplete: () => image.setVisible(false)
    });
  }

  settle(): void {
    if (this.image) {
      this.scene.tweens.killTweensOf(this.image);
      this.image.setVisible(false);
    }
  }

  /** Draws `word` once (game font, falling back to a bold sans-serif) and returns its texture key. */
  private texture(word: string): string | null {
    const key = `${FX_TEXTURES.PRAISE}${word}`;
    if (this.scene.textures.exists(key)) {
      return key;
    }
    const size = WORD_HEIGHT * 0.62;
    const font = `${Math.round(size)}px ${GAME_FONT}, "Arial Black", sans-serif`;
    const measure = document.createElement('canvas').getContext('2d');
    if (!measure) {
      return null;
    }
    measure.font = font;
    const width = Math.ceil(measure.measureText(word).width + size * 0.6);
    const texture = this.scene.textures.createCanvas(key, width, WORD_HEIGHT);
    if (!texture) {
      return null;
    }
    const ctx = texture.context;
    const x = width / 2;
    const y = WORD_HEIGHT * 0.5;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    // Drop shadow in the logo's purple, then a thick white outline, then the orange-yellow fill.
    ctx.lineWidth = size * 0.3;
    ctx.strokeStyle = '#3d2f6b';
    ctx.strokeText(word, x, y + size * 0.08);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText(word, x, y);
    const fill = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    fill.addColorStop(0, '#ffd23a');
    fill.addColorStop(1, '#ff7a12');
    ctx.fillStyle = fill;
    ctx.fillText(word, x, y);
    texture.refresh();
    return key;
  }
}
