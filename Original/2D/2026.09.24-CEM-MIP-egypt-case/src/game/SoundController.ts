import Phaser from 'phaser';
import type { CharacterName, GameConfig, SoundtrackConfig } from '../types';

type EffectId = 'pick-drop-character' | 'return' | 'correct' | 'wrong' | 'red-strike' | 'endcard'
  | 'ahmose-sfx' | 'maya-sfx' | 'merneptah-sfx' | 'nefertiti-sfx';

const CHARACTER_CORRECT_SFX: Partial<Record<CharacterName, EffectId>> = {
  Ahmose: 'ahmose-sfx',
  Maya: 'maya-sfx',
  Merneptah: 'merneptah-sfx',
  Nefertiti: 'nefertiti-sfx',
};

export class SoundController {
  private readonly sounds = new Map<string, Phaser.Sound.BaseSound>();
  private started = false;

  constructor(private readonly scene: Phaser.Scene, private readonly config: GameConfig) {
    for (const soundtrack of config.CHANGABLE_SOUNDTRACKS) {
      if (!scene.cache.audio.exists(soundtrack.id)) continue;
      this.sounds.set(soundtrack.id, scene.sound.add(soundtrack.id, {
        volume: soundtrack.volume,
        loop: soundtrack.loop,
      }));
    }
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.start, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  private soundtrack(id: string): SoundtrackConfig | undefined {
    return this.config.CHANGABLE_SOUNDTRACKS.find((item) => item.id === id);
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.scene.sound.setMute(this.config.MUTE);
    const bgm = this.sounds.get('bgm');
    if (bgm && !bgm.isPlaying) bgm.play();
  }

  private playEffect(id: EffectId, onComplete?: () => void): void {
    this.start();
    const sound = this.sounds.get(id);
    const config = this.soundtrack(id);
    if (!sound || !config) {
      onComplete?.();
      return;
    }
    if (sound.isPlaying) sound.stop();
    if (onComplete) sound.once(Phaser.Sound.Events.COMPLETE, onComplete);
    const started = sound.play({ volume: config.volume, loop: false });
    if (!started && onComplete) {
      sound.off(Phaser.Sound.Events.COMPLETE, onComplete);
      onComplete();
    }
  }

  pickDrop(): void { this.playEffect('pick-drop-character'); }
  returned(): void { this.playEffect('return'); }
  correct(character: CharacterName): void {
    this.playEffect('correct');
    const characterEffect = CHARACTER_CORRECT_SFX[character];
    if (characterEffect) this.playEffect(characterEffect);
  }
  wrong(): void { this.playEffect('wrong'); }
  redStrike(): void { this.playEffect('red-strike'); }
  endcard(): void { this.playEffect('endcard'); }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.start, this);
    for (const sound of this.sounds.values()) sound.destroy();
    this.sounds.clear();
  }
}
