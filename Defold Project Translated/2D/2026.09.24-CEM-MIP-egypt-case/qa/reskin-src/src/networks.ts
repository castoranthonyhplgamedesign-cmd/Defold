import Phaser from 'phaser';

interface MraidApi {
  getState?: () => string;
  addEventListener?: (event: string, callback: (...args: unknown[]) => void) => void;
  isViewable?: () => boolean;
  open?: (url: string) => void;
  close?: () => void;
}

declare global {
  interface Window {
    mraid?: MraidApi;
    ExitApi?: { exit?: () => void };
    FbPlayableAd?: { onCTAClick?: () => void };
    Luna?: { Unity?: { Playable?: { InstallFullGame?: () => void } } };
    install?: () => void;
    openAppStore?: () => void;
    clickTag?: string | (() => void);
    __VUNGLE__?: boolean;
    gameReady?: () => void;
    gameStart?: () => void;
    gameEnd?: () => void;
    gameClose?: () => void;
  }
}

let activeScene: Phaser.Scene | undefined;
let mraidReadyPromise: Promise<void> | undefined;
let mraidViewable = true;
let mraidExposed = true;
let hostVolume = 1;
let listenersBound = false;

function applyLifecycle(): void {
  if (!activeScene) return;
  const paused = document.hidden || !mraidViewable || !mraidExposed;
  if (paused) activeScene.scene.pause();
  else activeScene.scene.resume();
  activeScene.sound.setMute(paused);
  activeScene.sound.setVolume(hostVolume);
}

function setupMraid(mraid: MraidApi): void {
  if (listenersBound || typeof mraid.addEventListener !== 'function') return;
  listenersBound = true;
  if (typeof mraid.isViewable === 'function') mraidViewable = mraid.isViewable();
  mraid.addEventListener('error', (message, action) => console.warn('[MRAID error]', { message, action }));
  mraid.addEventListener('stateChange', (state) => console.log('[MRAID stateChange]', state));
  mraid.addEventListener('exposureChange', (percentage) => {
    if (typeof percentage === 'number') mraidExposed = percentage > 0;
    applyLifecycle();
  });
  mraid.addEventListener('viewableChange', (viewable) => {
    if (typeof viewable === 'boolean') mraidViewable = viewable;
    applyLifecycle();
  });
  mraid.addEventListener('audioVolumeChange', (percentage) => {
    if (typeof percentage === 'number') hostVolume = Phaser.Math.Clamp(percentage / 100, 0, 1);
    applyLifecycle();
  });
}

export function initMraid(timeoutMs = 2000, detectTimeoutMs = 500): Promise<void> {
  if (mraidReadyPromise) return mraidReadyPromise;
  mraidReadyPromise = new Promise((resolve) => {
    const started = performance.now();
    const detect = () => {
      const mraid = window.mraid;
      if (!mraid) {
        if (performance.now() - started < detectTimeoutMs) window.setTimeout(detect, 25);
        else resolve();
        return;
      }
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        setupMraid(mraid);
        resolve();
      };
      if (typeof mraid.getState !== 'function' || mraid.getState() !== 'loading') finish();
      else {
        mraid.addEventListener?.('ready', finish);
        window.setTimeout(finish, timeoutMs);
      }
    };
    detect();
  });
  return mraidReadyPromise;
}

void initMraid();

export function bindLifecycle(scene: Phaser.Scene): () => void {
  activeScene = scene;
  const onVisibility = () => applyLifecycle();
  const onMessage = (event: MessageEvent) => {
    if (event.data === 'onPause') scene.scene.pause();
    else if (event.data === 'onResume') scene.scene.resume();
  };
  const pause = () => scene.scene.pause();
  const resume = () => scene.scene.resume();
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('message', onMessage);
  window.addEventListener('ad-event-pause', pause);
  window.addEventListener('ad-event-resume', resume);
  window.addEventListener('luna:pause', pause);
  window.addEventListener('luna:resume', resume);
  applyLifecycle();
  return () => {
    if (activeScene === scene) activeScene = undefined;
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('message', onMessage);
    window.removeEventListener('ad-event-pause', pause);
    window.removeEventListener('ad-event-resume', resume);
    window.removeEventListener('luna:pause', pause);
    window.removeEventListener('luna:resume', resume);
  };
}

export const notifyGameStart = (): void => window.gameStart?.();
export const notifyGameEnd = (): void => window.gameEnd?.();
export const notifyGameClose = (): void => window.gameClose?.();

export function triggerCTA(storeUrl: string): void {
  if (typeof window.ExitApi !== 'undefined' && typeof window.ExitApi.exit === 'function') { window.ExitApi.exit(); return; }
  if (typeof window.FbPlayableAd?.onCTAClick === 'function') { window.FbPlayableAd.onCTAClick(); return; }
  if (typeof window.Luna?.Unity?.Playable?.InstallFullGame === 'function') { window.Luna.Unity.Playable.InstallFullGame(); return; }
  if (typeof window.playableSDK?.openAppStore === 'function') { window.playableSDK.openAppStore(); return; }
  if (typeof window.install === 'function') { window.install(); return; }
  if (typeof window.openAppStore === 'function') { window.openAppStore(); return; }
  if (typeof window.clickTag === 'function') { window.clickTag(); return; }
  if (window.__VUNGLE__) { window.parent.postMessage({ event: 'download' }, '*'); return; }
  if (typeof window.mraid?.open === 'function' && (typeof window.mraid.getState !== 'function' || window.mraid.getState() !== 'loading')) { window.mraid.open(storeUrl); return; }
  window.open(storeUrl, '_blank');
}
