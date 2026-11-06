import Phaser from 'phaser';
import gameFontUrl from '../Assets/Font/Nunito-Black.ttf?inline';
import { ANALYTICS_EVENTS, trackEvent } from './analytics';
import { DESIGN_HEIGHT, DESIGN_WIDTH, GAME_FONT } from './constants';
import { initMraid } from './networks';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { bindResponsiveResize, getViewportSize, updateResponsive } from './utils/responsive';

trackEvent(ANALYTICS_EVENTS.LOADING);

/** Network preview tools look for these; keep any SDK-provided implementation. */
function installLifecycleStubs(): void {
  window.gameReady = window.gameReady ?? (() => undefined);
  window.gameStart = window.gameStart ?? (() => undefined);
  window.gameEnd = window.gameEnd ?? (() => undefined);
  window.gameClose = window.gameClose ?? (() => undefined);
}

/**
 * Registers the bundled game font (used for the end-card button label). WKWebView can stall on
 * data-URL fonts, so the load is raced against a short timeout; the label falls back to sans-serif.
 */
function loadGameFont(): Promise<void> {
  if (typeof FontFace === 'undefined' || !document.fonts) {
    return Promise.resolve();
  }
  try {
    const face = new FontFace(GAME_FONT, `url(${gameFontUrl})`);
    document.fonts.add(face);
    const loaded = face.load().then(
      () => undefined,
      error => console.warn('[Font] game font failed to load', error)
    );
    return Promise.race([loaded, new Promise<void>(resolve => window.setTimeout(resolve, 1500))]);
  } catch (error) {
    console.warn('[Font] game font unavailable', error);
    return Promise.resolve();
  }
}

async function start(): Promise<void> {
  installLifecycleStubs();
  await Promise.all([initMraid(), loadGameFont()]);

  // Created at runtime and passed by reference: previewer sandboxes may strip authored DOM.
  const root = document.getElementById('game') ?? document.body.appendChild(document.createElement('div'));
  root.id = 'game';

  const viewport = getViewportSize();
  updateResponsive(viewport.width * viewport.dpr, viewport.height * viewport.dpr);

  // The only Phaser.Game on the page (iOS WKWebView rejects a second WebGL context).
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: root,
    transparent: true,
    scale: {
      mode: Phaser.Scale.NONE,
      width: viewport.width * viewport.dpr || DESIGN_WIDTH,
      height: viewport.height * viewport.dpr || DESIGN_HEIGHT,
      zoom: 1 / viewport.dpr
    },
    render: {
      antialias: true,
      pixelArt: false
    },
    fps: { target: 60 },
    scene: [BootScene, GameScene]
  });

  bindResponsiveResize(() => {
    const next = getViewportSize();
    const width = next.width * next.dpr;
    const height = next.height * next.dpr;
    const scene = game.scene.getScene('GameScene') as GameScene | null;
    if (scene && scene.sys.isActive()) {
      scene.relayout(width, height);
    } else {
      updateResponsive(width, height);
      game.scale.resize(width, height);
    }
    game.scale.setZoom(1 / next.dpr);
  });
}

function boot(): void {
  void start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
