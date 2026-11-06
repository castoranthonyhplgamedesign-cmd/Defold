import Phaser from 'phaser';
import { trackEvent } from '../analytics';
import { CluePanel } from '../game/CluePanel';
import { DragCharacters } from '../game/DragCharacters';
import { ErrorFeedback } from '../game/ErrorFeedback';
import { ScenePanels } from '../game/ScenePanels';
import { SoundController } from '../game/SoundController';
import { TutorialGuide } from '../game/TutorialGuide';
import { bindLifecycle, notifyGameEnd, notifyGameStart } from '../networks';
import type { GameConfig } from '../types';
import { bindResponsiveResize, updateMetrics } from '../utils/responsive';
import { CompletionCta } from './cta';

const PROGRESSION_THRESHOLDS = [25, 50, 75] as const;
const PROGRESSION_EVENTS = ['CHALLENGE_PASS_25', 'CHALLENGE_PASS_50', 'CHALLENGE_PASS_75'] as const;

export class GameScene extends Phaser.Scene {
  private panels!: ScenePanels;
  private clues!: CluePanel;
  private characters!: DragCharacters;
  private errorFeedback!: ErrorFeedback;
  private tutorial!: TutorialGuide;
  private audio!: SoundController;
  private cta!: CompletionCta;
  private solved = 0;
  private progressionIndex = 0;
  private unsolvedPresses = 0;
  private finished = false;
  private cleanupResize?: () => void;
  private cleanupLifecycle?: () => void;
  private viewportSignature = '';

  constructor(private readonly configData: GameConfig) {
    super('GameScene');
  }

  create(): void {
    this.panels = new ScenePanels(this, this.configData);
    this.clues = new CluePanel(this, this.configData);
    this.errorFeedback = new ErrorFeedback(this, this.configData);
    this.audio = new SoundController(this, this.configData);
    this.characters = new DragCharacters(this, this.configData, {
      onUnsolvedPress: () => {
        this.audio.pickDrop();
        this.recordUnsolvedPress();
      },
      onDrop: () => this.audio.pickDrop(),
      onCorrect: (character) => {
        if (this.finished) return;
        this.clues.solve(character);
        this.audio.redStrike();
        this.solved += 1;
        this.trackProgression();
        this.audio.correct(character);
        if (this.solved === this.configData.CLUES.length) this.complete(true);
      },
      onWrong: () => {
        this.audio.wrong();
        this.audio.returned();
        this.errorFeedback.blink();
      },
      onReturn: () => this.audio.returned(),
    });
    this.tutorial = new TutorialGuide(
      this,
      this.configData,
      () => this.characters.getAvailableCharacters(),
      () => this.clues.getTutorialHighlightBounds(),
    );
    this.cta = new CompletionCta(this, this.configData);
    this.cleanupResize = bindResponsiveResize(this.game, () => this.relayoutForOrientation());
    this.cleanupLifecycle = bindLifecycle(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => this.sound.setMute(this.configData.MUTE));
    trackEvent('DISPLAYED');
    notifyGameStart();
    trackEvent('CHALLENGE_STARTED');
    this.viewportSignature = this.currentViewportSignature();
  }

  update(): void {
    const signature = this.currentViewportSignature();
    if (signature === this.viewportSignature) return;
    this.viewportSignature = signature;
    const metrics = updateMetrics();
    this.scale.resize(metrics.width, metrics.height);
    this.relayoutForOrientation();
  }

  private currentViewportSignature(): string {
    const viewport = window.visualViewport;
    return `${viewport?.width ?? window.innerWidth}:${viewport?.height ?? window.innerHeight}:${window.devicePixelRatio}`;
  }

  private recordUnsolvedPress(): void {
    if (this.finished) return;
    this.unsolvedPresses += 1;
    const limit = this.configData.GAME_LENGTH.clickLimit;
    if (limit < 9999 && this.unsolvedPresses >= limit) this.complete(false, true);
  }

  private trackProgression(): void {
    const progress = this.solved / this.configData.CLUES.length * 100;
    while (this.progressionIndex < PROGRESSION_THRESHOLDS.length && progress >= PROGRESSION_THRESHOLDS[this.progressionIndex]) {
      trackEvent(PROGRESSION_EVENTS[this.progressionIndex]);
      this.progressionIndex += 1;
    }
  }

  private complete(challengeSolved: boolean, redirectImmediately = false): void {
    if (this.finished) return;
    this.finished = true;
    this.input.enabled = false;
    this.tutorial.stop();
    if (challengeSolved) trackEvent('CHALLENGE_SOLVED');
    notifyGameEnd();
    if (redirectImmediately) {
      this.audio.endcard();
      this.cta.show();
      return;
    }
    this.time.delayedCall(this.configData.TIMING.completionDelayMs, () => {
      this.audio.endcard();
      this.cta.show();
    });
  }

  private relayout(): void {
    if (!this.panels) return;
    this.panels.relayout();
    this.clues.relayout();
    this.characters.relayout();
    this.errorFeedback.relayout();
    this.tutorial.relayout();
    this.cta.relayout();
  }

  private relayoutForOrientation(): void {
    this.tweens.pauseAll();
    this.relayout();
    this.tweens.resumeAll();
  }

  private cleanup(): void {
    this.cleanupResize?.();
    this.cleanupLifecycle?.();
    this.cta?.destroy();
  }
}
