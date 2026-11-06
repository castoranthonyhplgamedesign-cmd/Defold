import Phaser from 'phaser';
import backgroundUrl from '../Assets/images/Background.webp';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from './constants';
import { initMraid } from './networks';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { applyResponsiveResize, refreshResponsiveMetrics } from './utils/responsive';

let game: Phaser.Game | null = null;

function installLifecycleStubs(): void {
  if (typeof window.gameReady !== 'function') {
    window.gameReady = () => undefined;
  }

  if (typeof window.gameStart !== 'function') {
    window.gameStart = () => undefined;
  }

  if (typeof window.gameEnd !== 'function') {
    window.gameEnd = () => undefined;
  }

  if (typeof window.gameClose !== 'function') {
    window.gameClose = () => undefined;
  }
}

function ensureRootElement(): HTMLElement {
  let root = document.getElementById('game-root');

  if (!root) {
    root = document.createElement('div');
    root.id = 'game-root';
    root.style.position = 'fixed';
    root.style.inset = '0';
    document.body.appendChild(root);
  }

  return root;
}

function installBackground(): void {
  const background = document.getElementById('bg-container');

  if (!background) {
    return;
  }

  background.style.backgroundImage = `url("${backgroundUrl}")`;
  background.style.backgroundPosition = 'center';
  background.style.backgroundRepeat = 'no-repeat';
  background.style.backgroundSize = 'cover';
}

async function boot(): Promise<void> {
  if (game) {
    return;
  }

  await initMraid();
  refreshResponsiveMetrics();
  installBackground();

  const parent = ensureRootElement();
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    transparent: true,
    parent,
    scale: {
      mode: Phaser.Scale.NONE,
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    scene: [BootScene, GameScene],
  };

  game = new Phaser.Game(config);
  applyResponsiveResize(game);
}

installLifecycleStubs();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void boot();
  });
} else {
  void boot();
}
