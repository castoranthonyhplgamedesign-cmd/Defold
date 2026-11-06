import Phaser from 'phaser';
import { DEPTH } from '../constants';
import type { GameConfig, TextureConfig } from '../types';
import { sd, sx, sy } from '../utils/responsive';

export class ScenePanels {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly map: Phaser.GameObjects.Image;
  private readonly characters: Phaser.GameObjects.Image;
  private readonly clues: Phaser.GameObjects.Image;

  constructor(private readonly scene: Phaser.Scene, private readonly config: GameConfig) {
    this.background = scene.add.rectangle(0, 0, 1, 1, Phaser.Display.Color.GetColor(...config.GAME_BACKGROUND_COLOR)).setOrigin(0).setDepth(DEPTH.BACKGROUND);
    this.map = scene.add.image(0, 0, 'map-bg').setDepth(DEPTH.PANELS);
    this.characters = scene.add.image(0, 0, 'character-bg').setDepth(DEPTH.PANELS);
    this.clues = scene.add.image(0, 0, 'clue-bg').setDepth(DEPTH.PANELS);
    this.relayout();
  }

  relayout(): void {
    const canvas = this.scene.scale.gameSize;
    this.background.setPosition(0, 0).setSize(canvas.width, canvas.height);
    const panels: [Phaser.GameObjects.Image, typeof this.config.LAYOUT.map, TextureConfig][] = [
      [this.map, this.config.LAYOUT.map, this.texture('map-bg')],
      [this.characters, this.config.LAYOUT.characters, this.texture('character-bg')],
      [this.clues, this.config.LAYOUT.clues, this.texture('clue-bg')],
    ];
    for (const [image, rect, texture] of panels) {
      const width = (texture.resizeBlocked ? rect.width : texture.originalSize.width) * texture.scale;
      const height = (texture.resizeBlocked ? rect.height : texture.originalSize.height) * texture.scale;
      image.setOrigin(texture.anchorPoint.x, texture.anchorPoint.y);
      image.setPosition(sx(rect.x + rect.width * texture.anchorPoint.x), sy(rect.y + rect.height * texture.anchorPoint.y));
      image.setDisplaySize(sd(width), sd(height));
    }
  }

  private texture(key: string): TextureConfig {
    const texture = this.config.CHANGABLE_TEXTURES.find((item) => item.spriteName === key);
    if (!texture) throw new Error(`Missing texture config: ${key}`);
    return texture;
  }
}
