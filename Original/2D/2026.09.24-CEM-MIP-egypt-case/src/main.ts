import Phaser from 'phaser';
import './style.css';
import { trackEvent } from './analytics';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from './constants';
import { resolveConfig } from './config';
import { initMraid } from './networks';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { updateMetrics } from './utils/responsive';

function installLifecycleStubs(): void {
  window.gameReady ??= () => undefined;
  window.gameStart ??= () => undefined;
  window.gameEnd ??= () => undefined;
  window.gameClose ??= () => undefined;
}

async function boot(): Promise<void> {
  installLifecycleStubs();
  trackEvent('LOADING');
  await initMraid();
  await Promise.race([
    document.fonts.load('700 48px Grenze'),
    new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
  ]);
  let parent = document.getElementById('game');
  if (!parent) {
    parent = document.createElement('div');
    parent.id = 'game';
    document.body.appendChild(parent);
  }
  const configData = resolveConfig();
  const metrics = updateMetrics();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: true,
    width: metrics.width || DESIGN_WIDTH,
    height: metrics.height || DESIGN_HEIGHT,
    scale: { mode: Phaser.Scale.NONE, width: metrics.width || DESIGN_WIDTH, height: metrics.height || DESIGN_HEIGHT },
    render: { antialias: true, pixelArt: false },
    scene: [new BootScene(configData), new GameScene(configData)],
  });
  game.sound.mute = true;
  window.gameReady?.();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void boot(), { once: true });
else void boot();
