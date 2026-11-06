import Phaser from 'phaser';
import { CHARACTER_ORDER, DEPTH, DESIGN_WIDTH } from '../constants';
import type { CharacterName, GameConfig, TextureConfig } from '../types';
import { getMetrics, sd, sx, sy } from '../utils/responsive';

type TutorialMode = 'opening' | 'idle' | 'hidden';
type HandPath = 'drag' | 'intro-sweep' | 'intro-to-character';

interface TutorialState {
  moveProgress: number;
  handScale: number;
}

export class TutorialGuide {
  private readonly overlayParts: Phaser.GameObjects.Rectangle[] = [];
  private readonly ghostPortrait: Phaser.GameObjects.Image;
  private readonly ghostCircle: Phaser.GameObjects.Image;
  private readonly promptPortrait: Phaser.GameObjects.Image;
  private readonly hand: Phaser.GameObjects.Image;
  private readonly state: TutorialState = { moveProgress: 0, handScale: 1 };
  private readonly timers: Phaser.Time.TimerEvent[] = [];
  private readonly tweens: Phaser.Tweens.Tween[] = [];
  private mode: TutorialMode = 'hidden';
  private handPath: HandPath = 'drag';
  private character: CharacterName;
  private idleIndex = 0;
  private active: boolean;
  private inactivityTimer?: Phaser.Time.TimerEvent;
  private sequenceId = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly config: GameConfig,
    private readonly getAvailableCharacters: () => CharacterName[],
    private readonly getHighlightBounds: () => Phaser.Geom.Rectangle,
  ) {
    this.active = config.HAND_TUTOR_MODE;
    this.character = config.TUTORIAL.openingCharacter;
    const black = Phaser.Display.Color.HexStringToColor(config.COLORS.overlay).color;
    for (let i = 0; i < 4; i += 1) {
      this.overlayParts.push(scene.add.rectangle(0, 0, 1, 1, black, config.TUTORIAL.overlayAlpha).setOrigin(0).setDepth(DEPTH.TUTORIAL_OVERLAY).setVisible(false));
    }
    const portraitTexture = this.texture(this.character);
    const circleTexture = this.texture('drop-circle');
    const handTexture = this.texture('tutorial-hand');
    this.ghostPortrait = scene.add.image(0, 0, this.character).setOrigin(portraitTexture.anchorPoint.x, portraitTexture.anchorPoint.y).setDepth(DEPTH.TUTORIAL_GHOSTS).setVisible(false);
    this.ghostCircle = scene.add.image(0, 0, 'drop-circle').setOrigin(circleTexture.anchorPoint.x, circleTexture.anchorPoint.y).setDepth(DEPTH.TUTORIAL_PROMPT).setVisible(false);
    this.promptPortrait = scene.add.image(0, 0, this.character).setOrigin(portraitTexture.anchorPoint.x, portraitTexture.anchorPoint.y).setDepth(DEPTH.TUTORIAL_PROMPT).setVisible(false);
    this.hand = scene.add.image(0, 0, 'tutorial-hand').setOrigin(handTexture.anchorPoint.x, handTexture.anchorPoint.y).setDepth(DEPTH.TUTORIAL_HAND).setVisible(false);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handleActivity, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
    if (config.HAND_TUTOR_MODE) this.startOpening();
  }

  private texture(key: string): TextureConfig {
    const texture = this.config.CHANGABLE_TEXTURES.find((item) => item.spriteName === key);
    if (!texture) throw new Error(`Missing texture config: ${key}`);
    return texture;
  }

  private homeX(character: CharacterName): number {
    const index = CHARACTER_ORDER.indexOf(character);
    const availableWidth = DESIGN_WIDTH - this.config.CHARACTER_LIST_MARGIN_X * 2;
    return this.config.CHARACTER_LIST_MARGIN_X + availableWidth / CHARACTER_ORDER.length * (index + 0.5);
  }

  private delay(ms: number, callback: () => void, id = this.sequenceId): void {
    const timer = this.scene.time.delayedCall(ms, () => {
      const index = this.timers.indexOf(timer);
      if (index >= 0) this.timers.splice(index, 1);
      if (id === this.sequenceId) callback();
    });
    this.timers.push(timer);
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig, callback?: () => void, id = this.sequenceId): void {
    let tween: Phaser.Tweens.Tween;
    tween = this.scene.tweens.add({
      ...config,
      onUpdate: () => this.relayoutMovingVisuals(),
      onComplete: () => {
        const index = this.tweens.indexOf(tween);
        if (index >= 0) this.tweens.splice(index, 1);
        if (id === this.sequenceId) callback?.();
      },
    });
    this.tweens.push(tween);
  }

  private clearSequence(): void {
    this.sequenceId += 1;
    for (const timer of this.timers) timer.remove(false);
    for (const tween of this.tweens) tween.remove();
    this.timers.length = 0;
    this.tweens.length = 0;
  }

  private startOpening(): void {
    this.clearSequence();
    this.mode = 'opening';
    this.character = this.config.TUTORIAL.openingCharacter;
    this.handPath = 'intro-sweep';
    this.state.moveProgress = 0;
    this.state.handScale = 1;
    for (const part of this.overlayParts) part.setVisible(true).setAlpha(0);
    this.ghostPortrait.setTexture(this.character).setVisible(true).setAlpha(0);
    this.ghostCircle.setVisible(true).setAlpha(0);
    this.promptPortrait.setTexture(this.character).setVisible(true).setAlpha(0);
    this.hand.setVisible(true).setAlpha(0);
    this.relayout();
    const id = this.sequenceId;
    this.tween({ targets: this.overlayParts, alpha: 1, duration: this.config.TUTORIAL.fadeMs }, undefined, id);
    this.tween({ targets: [this.ghostPortrait, this.ghostCircle], alpha: this.config.TUTORIAL.ghostAlpha, duration: this.config.TUTORIAL.fadeMs }, undefined, id);
    this.delay(this.config.TUTORIAL.stepDelayMs, () => this.openingIntroduction(id), id);
  }

  private openingIntroduction(id: number): void {
    if (id !== this.sequenceId || this.mode !== 'opening') return;
    this.handPath = 'intro-sweep';
    this.state.moveProgress = 0;
    this.state.handScale = 1;
    this.relayoutMovingVisuals();
    this.tween({ targets: this.hand, alpha: 1, duration: this.config.TUTORIAL.fadeMs }, () => {
      this.delay(this.config.TUTORIAL.stepDelayMs, () => {
        this.tween({ targets: this.state, moveProgress: 1, duration: this.config.TUTORIAL.moveMs, ease: 'Sine.InOut' }, () => {
          this.delay(this.config.TUTORIAL.stepDelayMs, () => {
            this.handPath = 'intro-to-character';
            this.state.moveProgress = 0;
            this.relayoutMovingVisuals();
            this.tween({ targets: this.state, moveProgress: 1, duration: this.config.TUTORIAL.moveMs, ease: 'Sine.InOut' }, () => {
              this.handPath = 'drag';
              this.state.moveProgress = 0;
              this.relayoutMovingVisuals();
              this.openingCycle(id, true);
            }, id);
          }, id);
        }, id);
      }, id);
    }, id);
  }

  private openingCycle(id: number, handAlreadyVisible = false): void {
    if (id !== this.sequenceId || this.mode !== 'opening') return;
    this.handPath = 'drag';
    this.state.moveProgress = 0;
    this.state.handScale = 1;
    this.relayoutMovingVisuals();
    const fadeTargets = handAlreadyVisible ? [this.promptPortrait] : [this.promptPortrait, this.hand];
    this.tween({ targets: fadeTargets, alpha: 1, duration: this.config.TUTORIAL.fadeMs }, () => {
      this.delay(this.config.TUTORIAL.stepDelayMs, () => {
        this.tween({ targets: this.state, handScale: this.config.TUTORIAL.pressScale, duration: this.config.TUTORIAL.fadeMs }, () => {
          this.delay(this.config.TUTORIAL.stepDelayMs, () => {
            this.tween({ targets: this.state, moveProgress: 1, duration: this.config.TUTORIAL.moveMs, ease: 'Sine.InOut' }, () => {
              this.tween({ targets: this.state, handScale: 1, duration: this.config.TUTORIAL.fadeMs }, () => {
                this.delay(this.config.TUTORIAL.stepDelayMs * 2, () => {
                  this.tween({ targets: [this.promptPortrait, this.hand], alpha: 0, duration: this.config.TUTORIAL.fadeMs }, () => {
                    this.state.moveProgress = 0;
                    this.relayoutMovingVisuals();
                    this.tween({ targets: this.promptPortrait, alpha: 1, duration: this.config.TUTORIAL.fadeMs }, () => {
                      this.delay(this.config.TUTORIAL.stepDelayMs, () => this.openingCycle(id), id);
                    }, id);
                  }, id);
                }, id);
              }, id);
            }, id);
          }, id);
        }, id);
      }, id);
    }, id);
  }

  private startIdleTutorial(): void {
    const available = this.getAvailableCharacters();
    if (available.length === 0) return;
    const preferred = available.filter((name) => name !== 'Aisha');
    const choices = preferred.length > 0 ? preferred : available;
    this.character = choices[this.idleIndex % choices.length];
    this.idleIndex += 1;
    this.clearSequence();
    this.mode = 'idle';
    this.handPath = 'drag';
    this.hand.setVisible(true).setAlpha(0);
    this.state.moveProgress = 0;
    this.state.handScale = 1;
    this.relayout();
    this.idleCycle(this.sequenceId);
  }

  private idleCycle(id: number): void {
    if (id !== this.sequenceId || this.mode !== 'idle') return;
    this.state.moveProgress = 0;
    this.state.handScale = 1;
    this.relayoutMovingVisuals();
    this.tween({ targets: this.hand, alpha: 1, duration: this.config.TUTORIAL.fadeMs }, () => {
      this.delay(this.config.TUTORIAL.stepDelayMs, () => {
        this.tween({ targets: this.state, handScale: this.config.TUTORIAL.pressScale, duration: this.config.TUTORIAL.fadeMs }, () => {
          this.tween({ targets: this.state, moveProgress: 1, duration: this.config.TUTORIAL.moveMs, ease: 'Sine.InOut' }, () => {
            this.tween({ targets: this.state, handScale: 1, duration: this.config.TUTORIAL.fadeMs }, () => {
              this.delay(this.config.TUTORIAL.stepDelayMs * 2, () => {
                this.tween({ targets: this.hand, alpha: 0, duration: this.config.TUTORIAL.fadeMs }, () => {
                  this.delay(this.config.TUTORIAL.stepDelayMs, () => this.idleCycle(id), id);
                }, id);
              }, id);
            }, id);
          }, id);
        }, id);
      }, id);
    }, id);
  }

  private handleActivity(): void {
    if (!this.active) return;
    this.inactivityTimer?.remove(false);
    if (this.mode === 'opening' || this.mode === 'idle') {
      this.clearSequence();
      const visible = [...this.overlayParts, this.ghostPortrait, this.ghostCircle, this.promptPortrait, this.hand];
      this.scene.tweens.add({
        targets: visible,
        alpha: 0,
        duration: this.config.TUTORIAL.fadeMs,
        onComplete: () => {
          for (const object of visible) object.setVisible(false);
          this.mode = 'hidden';
        },
      });
    }
    this.inactivityTimer = this.scene.time.delayedCall(this.config.TUTORIAL_DELAY * 1000, () => this.startIdleTutorial());
  }

  private relayoutOverlay(): void {
    if (this.mode !== 'opening') return;
    const metrics = getMetrics();
    const raw = this.getHighlightBounds();
    const padX = sd(this.config.TUTORIAL.highlightPaddingX);
    const padY = sd(this.config.TUTORIAL.highlightPaddingY);
    const left = Phaser.Math.Clamp(raw.left - padX, 0, metrics.width);
    const top = Phaser.Math.Clamp(raw.top - padY, 0, metrics.height);
    const right = Phaser.Math.Clamp(raw.right + padX, 0, metrics.width);
    const bottom = Phaser.Math.Clamp(raw.bottom + padY, 0, metrics.height);
    const rects = [
      { x: 0, y: 0, width: metrics.width, height: top },
      { x: 0, y: bottom, width: metrics.width, height: metrics.height - bottom },
      { x: 0, y: top, width: left, height: bottom - top },
      { x: right, y: top, width: metrics.width - right, height: bottom - top },
    ];
    for (let i = 0; i < this.overlayParts.length; i += 1) {
      const rect = rects[i];
      this.overlayParts[i].setPosition(rect.x, rect.y).setSize(Math.max(rect.width, 1), Math.max(rect.height, 1));
    }
  }

  private relayoutMovingVisuals(): void {
    if (this.mode === 'hidden') return;
    const home = { x: this.homeX(this.character), y: this.config.CHARACTER_HOME_Y };
    const target = this.config.DROP_POSITIONS[this.character];
    const x = Phaser.Math.Linear(home.x, target.x, this.state.moveProgress);
    const y = Phaser.Math.Linear(home.y, target.y, this.state.moveProgress);
    const handTexture = this.texture('tutorial-hand');
    const handWidth = this.config.TUTORIAL.handWidth * handTexture.scale * this.state.handScale;
    let handX = sx(x);
    let handY = sy(y);
    if (this.mode === 'opening' && this.handPath !== 'drag') {
      const bounds = this.getHighlightBounds();
      const underlineY = bounds.bottom + sd(this.config.TUTORIAL.highlightPaddingY);
      if (this.handPath === 'intro-sweep') {
        handX = Phaser.Math.Linear(bounds.left, bounds.right, this.state.moveProgress);
        handY = underlineY;
      } else {
        handX = Phaser.Math.Linear(bounds.right, sx(home.x), this.state.moveProgress);
        handY = Phaser.Math.Linear(underlineY, sy(home.y), this.state.moveProgress);
      }
    }
    this.hand.setPosition(handX, handY).setDisplaySize(sd(handWidth), sd(handWidth * handTexture.originalSize.height / handTexture.originalSize.width));
    if (this.mode === 'opening') {
      const portraitTexture = this.texture(this.character);
      const portraitHeight = this.config.CHARACTER_HEIGHT * portraitTexture.scale;
      this.promptPortrait.setPosition(sx(x), sy(y)).setDisplaySize(sd(portraitHeight * portraitTexture.originalSize.width / portraitTexture.originalSize.height), sd(portraitHeight));
    }
  }

  relayout(): void {
    this.relayoutOverlay();
    const homeX = this.homeX(this.character);
    const target = this.config.DROP_POSITIONS[this.character];
    const portraitTexture = this.texture(this.character);
    const circleTexture = this.texture('drop-circle');
    const portraitHeight = this.config.CHARACTER_HEIGHT * portraitTexture.scale;
    this.ghostPortrait.setTexture(this.character).setPosition(sx(homeX), sy(this.config.CHARACTER_HOME_Y)).setDisplaySize(sd(portraitHeight * portraitTexture.originalSize.width / portraitTexture.originalSize.height), sd(portraitHeight));
    const circleSize = this.config.DROP_CIRCLE_SIZE * circleTexture.scale;
    this.ghostCircle.setPosition(sx(target.x), sy(target.y)).setDisplaySize(sd(circleSize), sd(circleSize));
    this.relayoutMovingVisuals();
  }

  stop(): void {
    this.active = false;
    this.inactivityTimer?.remove(false);
    this.clearSequence();
    this.mode = 'hidden';
    for (const object of [...this.overlayParts, this.ghostPortrait, this.ghostCircle, this.promptPortrait, this.hand]) object.setVisible(false);
  }

  destroy(): void {
    this.stop();
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handleActivity, this);
  }
}
