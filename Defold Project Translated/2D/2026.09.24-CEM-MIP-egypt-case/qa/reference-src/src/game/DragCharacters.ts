import Phaser from 'phaser';
import { CHARACTER_ORDER, DEPTH, DESIGN_WIDTH } from '../constants';
import type { CharacterName, GameConfig, TextureConfig } from '../types';
import { sd, sx, sy, ux, uy } from '../utils/responsive';

interface ResponsiveMotion {
  progress: { value: number };
  from: { x: number; y: number };
  to: { x: number; y: number };
  tween: Phaser.Tweens.Tween;
}

interface CharacterItem {
  name: CharacterName;
  image: Phaser.GameObjects.Image;
  homeX: number;
  placed: boolean;
  motion?: ResponsiveMotion;
}

export interface DragCharacterCallbacks {
  onUnsolvedPress: (character: CharacterName) => void;
  onDrop: () => void;
  onCorrect: (character: CharacterName) => void;
  onWrong: () => void;
  onReturn: () => void;
}

export class DragCharacters {
  private readonly characters: CharacterItem[] = [];
  private readonly targets = new Map<CharacterName, Phaser.GameObjects.Image>();

  constructor(private readonly scene: Phaser.Scene, private readonly config: GameConfig, private readonly callbacks: DragCharacterCallbacks) {
    const circleConfig = this.texture('drop-circle');
    for (const name of CHARACTER_ORDER) {
      const target = scene.add.image(0, 0, 'drop-circle')
        .setOrigin(circleConfig.anchorPoint.x, circleConfig.anchorPoint.y)
        .setDepth(DEPTH.DROP_TARGETS);
      this.targets.set(name, target);
    }

    const availableWidth = DESIGN_WIDTH - this.config.CHARACTER_LIST_MARGIN_X * 2;
    const slotWidth = availableWidth / CHARACTER_ORDER.length;
    for (let i = 0; i < CHARACTER_ORDER.length; i += 1) {
      const name = CHARACTER_ORDER[i];
      const texture = this.texture(name);
      const image = scene.add.image(0, 0, name)
        .setOrigin(texture.anchorPoint.x, texture.anchorPoint.y)
        .setDepth(DEPTH.CHARACTERS)
        .setInteractive({ useHandCursor: true, draggable: true });
      const item: CharacterItem = {
        name,
        image,
        homeX: this.config.CHARACTER_LIST_MARGIN_X + slotWidth * (i + 0.5),
        placed: false,
      };
      this.characters.push(item);
      scene.input.setDraggable(image);
      image.on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (!item.placed) this.callbacks.onUnsolvedPress(item.name);
      });
      image.on(Phaser.Input.Events.DRAG_START, () => {
        if (!item.placed) {
          image.setDepth(DEPTH.DRAGGING);
          this.updateHoveredTarget(image.x, image.y);
        }
      });
      image.on(Phaser.Input.Events.DRAG, (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!item.placed) {
          image.setPosition(dragX, dragY);
          this.updateHoveredTarget(dragX, dragY);
        }
      });
      image.on(Phaser.Input.Events.DRAG_END, () => this.drop(item));
    }
    this.relayout();
  }

  private texture(key: string): TextureConfig {
    const texture = this.config.CHANGABLE_TEXTURES.find((item) => item.spriteName === key);
    if (!texture) throw new Error(`Missing texture config: ${key}`);
    return texture;
  }

  private displayHeight(item: CharacterItem): number {
    const texture = this.texture(item.name);
    const authored = item.placed ? this.config.PLACED_CHARACTER_HEIGHT : this.config.CHARACTER_HEIGHT;
    return sd((texture.resizeBlocked ? authored : texture.originalSize.height) * texture.scale);
  }

  private sizeCharacter(item: CharacterItem): void {
    const texture = this.texture(item.name);
    const height = this.displayHeight(item);
    item.image.setDisplaySize(height * texture.originalSize.width / texture.originalSize.height, height);
  }

  private moveTo(item: CharacterItem, to: { x: number; y: number }, duration: number, onComplete?: () => void): void {
    item.motion?.tween.remove();
    const progress = { value: 0 };
    const motion = {} as ResponsiveMotion;
    motion.progress = progress;
    motion.from = { x: ux(item.image.x), y: uy(item.image.y) };
    motion.to = to;
    motion.tween = this.scene.tweens.add({
      targets: progress,
      value: 1,
      duration,
      ease: 'Back.Out',
      onUpdate: () => this.positionMotion(item),
      onComplete: () => {
        item.motion = undefined;
        item.image.setPosition(sx(to.x), sy(to.y));
        onComplete?.();
      },
    });
    item.motion = motion;
  }

  private positionMotion(item: CharacterItem): void {
    if (!item.motion) return;
    const { from, to, progress } = item.motion;
    item.image.setPosition(
      sx(Phaser.Math.Linear(from.x, to.x, progress.value)),
      sy(Phaser.Math.Linear(from.y, to.y, progress.value)),
    );
  }

  private hoveredTarget?: CharacterName;

  private updateHoveredTarget(x: number, y: number): void {
    let hovered: CharacterName | undefined;
    for (const name of CHARACTER_ORDER) {
      const target = this.targets.get(name)!;
      if (!target.visible) continue;
      const point = this.config.DROP_POSITIONS[name];
      if (Phaser.Math.Distance.Between(x, y, sx(point.x), sy(point.y)) <= sd(this.config.DROP_RADIUS)) {
        hovered = name;
        break;
      }
    }
    if (hovered === this.hoveredTarget) return;
    this.resetHoveredTarget();
    if (!hovered) return;
    this.hoveredTarget = hovered;
    const target = this.targets.get(hovered)!;
    this.scene.tweens.add({
      targets: target,
      angle: 360,
      duration: this.config.TIMING.dropCircleSpinMs,
      repeat: -1,
      ease: 'Linear',
    });
  }

  private resetHoveredTarget(): void {
    if (!this.hoveredTarget) return;
    const target = this.targets.get(this.hoveredTarget)!;
    this.scene.tweens.killTweensOf(target);
    target.setAngle(0);
    this.hoveredTarget = undefined;
  }

  private drop(item: CharacterItem): void {
    if (item.placed) return;
    this.callbacks.onDrop();
    this.resetHoveredTarget();
    const position = this.config.DROP_POSITIONS[item.name];
    const targetX = sx(position.x);
    const targetY = sy(position.y);
    const distance = Phaser.Math.Distance.Between(item.image.x, item.image.y, targetX, targetY);
    item.image.setDepth(DEPTH.CHARACTERS);
    if (distance <= sd(this.config.DROP_RADIUS)) {
      item.placed = true;
      item.image.disableInteractive();
      this.targets.get(item.name)?.setVisible(false);
      this.callbacks.onCorrect(item.name);
      this.sizeCharacter(item);
      this.moveTo(item, position, this.config.TIMING.snapMs);
      return;
    }
    let overWrongCircle = false;
    for (const name of CHARACTER_ORDER) {
      if (name === item.name) continue;
      const other = this.config.DROP_POSITIONS[name];
      if (Phaser.Math.Distance.Between(item.image.x, item.image.y, sx(other.x), sy(other.y)) <= sd(this.config.DROP_RADIUS)) {
        overWrongCircle = true;
        break;
      }
    }
    if (overWrongCircle) this.callbacks.onWrong();
    else this.callbacks.onReturn();
    item.image.disableInteractive();
    this.moveTo(item, { x: item.homeX, y: this.config.CHARACTER_HOME_Y }, this.config.TIMING.returnMs, () => {
      item.image.setInteractive({ useHandCursor: true, draggable: true });
      this.scene.input.setDraggable(item.image);
    });
  }

  relayout(): void {
    const circleTexture = this.texture('drop-circle');
    for (const name of CHARACTER_ORDER) {
      const point = this.config.DROP_POSITIONS[name];
      const target = this.targets.get(name)!;
      const targetSize = (circleTexture.resizeBlocked ? this.config.DROP_CIRCLE_SIZE : circleTexture.originalSize.width) * circleTexture.scale;
      target.setPosition(sx(point.x), sy(point.y)).setDisplaySize(sd(targetSize), sd(targetSize));
    }
    for (const item of this.characters) {
      const point = this.config.DROP_POSITIONS[item.name];
      if (item.motion) this.positionMotion(item);
      else item.image.setPosition(item.placed ? sx(point.x) : sx(item.homeX), item.placed ? sy(point.y) : sy(this.config.CHARACTER_HOME_Y));
      this.sizeCharacter(item);
    }
  }

  getAvailableCharacters(): CharacterName[] {
    const available: CharacterName[] = [];
    for (const item of this.characters) if (!item.placed) available.push(item.name);
    return available;
  }
}
