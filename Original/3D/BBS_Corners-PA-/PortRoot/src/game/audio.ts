import { bindLifecycle } from '../networks';
import { ASSETS } from '../assets';
import { AUDIO_CONFIG } from '../constants';

export class AudioController {
  private unlocked = false;
  private mutedByLifecycle = false;
  private bgmRequested = false;
  private readonly bgm: HTMLAudioElement;
  private readonly drag: HTMLAudioElement;
  private readonly drop: HTMLAudioElement;
  private readonly gateSubmit: HTMLAudioElement;

  constructor() {
    this.bgm = this.createAudio(ASSETS.audio.bgm, true);
    this.drag = this.createAudio(ASSETS.audio.drag);
    this.drop = this.createAudio(ASSETS.audio.drop);
    this.gateSubmit = this.createAudio(ASSETS.audio.crumple);

    bindLifecycle((paused) => {
      this.mutedByLifecycle = paused;
      if (paused) {
        this.bgm.pause();
        return;
      }

      if (this.bgmRequested) {
        this.startBgmIfAllowed();
      }
    });
  }

  unlock(): void {
    this.unlocked = true;
  }

  isMuted(): boolean {
    return !AUDIO_CONFIG.enabled || !this.unlocked || this.mutedByLifecycle;
  }

  playBgm(): void {
    this.bgmRequested = true;
    this.startBgmIfAllowed();
  }

  playDrag(): void {
    this.playOneShot(this.drag, AUDIO_CONFIG.dragVolume);
  }

  playDrop(): void {
    this.playOneShot(this.drop, AUDIO_CONFIG.dropVolume);
  }

  playGateSubmit(): void {
    this.playOneShot(this.gateSubmit, AUDIO_CONFIG.gateSubmitVolume, AUDIO_CONFIG.gateSubmitMaxDurationSeconds);
  }

  private createAudio(src: string, loop = false): HTMLAudioElement {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.loop = loop;
    return audio;
  }

  private startBgmIfAllowed(): void {
    if (!AUDIO_CONFIG.enabled || !this.unlocked || this.mutedByLifecycle) return;

    this.bgm.volume = AUDIO_CONFIG.bgmVolume;
    this.bgm.loop = true;
    if (!this.bgm.paused) return;

    void this.bgm.play().catch(() => undefined);
  }

  private playOneShot(source: HTMLAudioElement, volume: number, maxDurationSeconds?: number): void {
    if (this.isMuted()) return;

    const instance = source.cloneNode(true) as HTMLAudioElement;
    instance.volume = volume;
    void instance.play()
      .then(() => {
        if (maxDurationSeconds === undefined) return;

        window.setTimeout(() => {
          instance.pause();
          instance.currentTime = 0;
        }, maxDurationSeconds * 1000);
      })
      .catch(() => undefined);
  }
}
