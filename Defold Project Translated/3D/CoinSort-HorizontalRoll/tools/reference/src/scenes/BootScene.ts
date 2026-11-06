import Phaser from 'phaser';
import coinAudioUrl from '../../Assets/audio/Coin.mp3';
import jarAudioUrl from '../../Assets/audio/Jar.mp3';
import lockAudioUrl from '../../Assets/audio/Lock.mp3';
import musicUrl from '../../Assets/audio/Lowkey-Trap.mp3';
import appIconUrl from '../../Assets/images/App Icon.webp';
import handUrl from '../../Assets/images/Hand.webp';
import jarGlassBaseUrl from '../../Assets/images/Jar Glass Base.webp';
import jarGlassBodyUrl from '../../Assets/images/Jar Glass Body.webp';
import jarWoodLidUrl from '../../Assets/images/Jar Wood Lid.webp';
import lockUrl from '../../Assets/images/Lock.webp';
import { notifyGameReady } from '../networks';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('app-icon', appIconUrl);
    this.load.image('jar-glass-base', jarGlassBaseUrl);
    this.load.image('jar-glass-body', jarGlassBodyUrl);
    this.load.image('jar-wood-lid', jarWoodLidUrl);
    this.load.image('lock', lockUrl);
    this.load.image('hand', handUrl);
  }

  create(): void {
    this.registry.set('deferredReady', false);
    this.load.audio('coin-sound', coinAudioUrl);
    this.load.audio('jar-sound', jarAudioUrl);
    this.load.audio('lock-sound', lockAudioUrl);
    this.load.audio('bg-music', musicUrl);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.registry.set('deferredReady', true);
      notifyGameReady();
      this.scene.start('GameScene');
    });
    this.load.start();
  }
}
