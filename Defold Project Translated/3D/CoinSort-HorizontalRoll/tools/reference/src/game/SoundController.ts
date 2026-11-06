import Phaser from 'phaser';

export class SoundController {
  private readonly scene: Phaser.Scene;
  private coinSound: Phaser.Sound.BaseSound | null = null;
  private jarSound: Phaser.Sound.BaseSound | null = null;
  private lockSound: Phaser.Sound.BaseSound | null = null;
  private bgMusic: Phaser.Sound.BaseSound | null = null;
  private audioUnlocked = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.sound.mute = true;

    if (this.scene.cache.audio.exists('coin-sound')) {
      this.coinSound = this.scene.sound.add('coin-sound', { volume: 0.42 });
    }

    if (this.scene.cache.audio.exists('jar-sound')) {
      this.jarSound = this.scene.sound.add('jar-sound', { volume: 0.68 });
    }

    if (this.scene.cache.audio.exists('lock-sound')) {
      this.lockSound = this.scene.sound.add('lock-sound', { volume: 0.72 });
    }

    if (this.scene.cache.audio.exists('bg-music')) {
      this.bgMusic = this.scene.sound.add('bg-music', { loop: true, volume: 0.34 });
    }

    this.scene.input.once('pointerdown', this.handleFirstInteraction);
    this.scene.sound.on(Phaser.Sound.Events.UNLOCKED, this.handleSoundUnlocked);
    this.addDomFirstInteractionListeners();

    document.addEventListener('visibilitychange', this.handleVisibility);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.removeDomFirstInteractionListeners();
      this.scene.input.off('pointerdown', this.handleFirstInteraction);
      this.scene.sound.off(Phaser.Sound.Events.UNLOCKED, this.handleSoundUnlocked);
      document.removeEventListener('visibilitychange', this.handleVisibility);
      this.bgMusic?.stop();
    });
  }

  unlockAudio(): void {
    this.audioUnlocked = true;
    this.scene.sound.mute = false;
    this.removeDomFirstInteractionListeners();

    const context = this.getAudioContext();
    const resumePromise = context?.resume?.();
    if (resumePromise) {
      void resumePromise.then(() => this.playMusic()).catch(() => undefined);
    }

    this.playMusic();
    this.scene.time.delayedCall(120, () => this.playMusic());
  }

  playCoin(): void {
    if (this.coinSound && !this.scene.sound.mute) {
      this.coinSound.play();
    }
  }

  playJar(): void {
    if (this.jarSound && !this.scene.sound.mute) {
      this.jarSound.play();
    }
  }

  playUnlock(): void {
    if (this.lockSound && !this.scene.sound.mute) {
      this.lockSound.play();
    }
  }

  private playMusic(): void {
    if (this.bgMusic && !this.bgMusic.isPlaying && !this.scene.sound.mute && this.audioUnlocked && this.canPlayAudio()) {
      this.bgMusic.play();
    }
  }

  private canPlayAudio(): boolean {
    const soundManager = this.scene.sound as Phaser.Sound.BaseSoundManager & { locked?: boolean };
    const context = this.getAudioContext();

    return !soundManager.locked && context?.state !== 'suspended' && context?.state !== 'interrupted';
  }

  private getAudioContext(): AudioContext | undefined {
    return (this.scene.sound as { context?: AudioContext }).context;
  }

  private addDomFirstInteractionListeners(): void {
    window.addEventListener('pointerdown', this.handleFirstInteraction, { capture: true, passive: true });
    window.addEventListener('touchstart', this.handleFirstInteraction, { capture: true, passive: true });
    window.addEventListener('keydown', this.handleFirstInteraction, true);
  }

  private removeDomFirstInteractionListeners(): void {
    window.removeEventListener('pointerdown', this.handleFirstInteraction, true);
    window.removeEventListener('touchstart', this.handleFirstInteraction, true);
    window.removeEventListener('keydown', this.handleFirstInteraction, true);
  }

  private readonly handleFirstInteraction = (): void => {
    this.unlockAudio();
  };

  private readonly handleSoundUnlocked = (): void => {
    this.playMusic();
  };

  private readonly handleVisibility = (): void => {
    if (!this.audioUnlocked) {
      return;
    }

    if (document.hidden) {
      this.scene.sound.mute = true;
      const context = this.getAudioContext();
      void context?.suspend?.();
      return;
    }

    this.scene.sound.mute = false;
    const context = this.getAudioContext();
    void context?.resume?.();
    this.playMusic();
  };
}
