import { STORE_URLS } from './constants';

type MraidApi = {
  addEventListener?: (eventName: string, callback: (...args: unknown[]) => void) => void;
  close?: () => void;
  getState?: () => string;
  isViewable?: () => boolean;
  open?: (url: string) => void;
};

type LifecycleScene = {
  sound?: {
    mute: boolean;
    setVolume?: (volume: number) => void;
  };
  tweens?: {
    pauseAll?: () => void;
    resumeAll?: () => void;
  };
};

declare global {
  interface Window {
    mraid?: MraidApi;
  }
}

let initPromise: Promise<void> | null = null;
let mraidListenersReady = false;
let lifecycleBound = false;
let boundScene: LifecycleScene | null = null;
let mraidViewable = true;
let mraidExposed = true;
let hostVolume: number | null = null;

function getStoreUrl(): string {
  return /Android/i.test(window.navigator.userAgent) ? STORE_URLS.android : STORE_URLS.ios;
}

function getMraid(): MraidApi | undefined {
  return window.mraid;
}

function callWindowLifecycle(name: 'gameReady' | 'gameStart' | 'gameEnd' | 'gameClose'): void {
  const fn = window[name];

  if (typeof fn === 'function') {
    fn();
  }
}

function applyLifecycleState(): void {
  if (!boundScene) {
    return;
  }

  const active = !document.hidden && mraidViewable && mraidExposed;

  if (boundScene.sound) {
    boundScene.sound.mute = !active;
  }

  if (active) {
    boundScene.tweens?.resumeAll?.();
  } else {
    boundScene.tweens?.pauseAll?.();
  }

  if (typeof hostVolume === 'number') {
    boundScene.sound?.setVolume?.(hostVolume);
  }
}

function setupMraidCallbacks(mraid: MraidApi): void {
  if (mraidListenersReady || typeof mraid.addEventListener !== 'function') {
    return;
  }

  mraidListenersReady = true;

  if (typeof mraid.isViewable === 'function') {
    mraidViewable = mraid.isViewable();
  }

  mraid.addEventListener('error', (message, action) => {
    console.warn('[MRAID error]', { message, action });
  });

  mraid.addEventListener('stateChange', state => {
    console.log('[MRAID stateChange]', state);
  });

  mraid.addEventListener('exposureChange', exposedPercentage => {
    if (typeof exposedPercentage === 'number') {
      mraidExposed = exposedPercentage > 0;
      applyLifecycleState();
    }
  });

  mraid.addEventListener('viewableChange', viewable => {
    if (typeof viewable === 'boolean') {
      mraidViewable = viewable;
      applyLifecycleState();
    }
  });

  mraid.addEventListener('audioVolumeChange', pct => {
    if (typeof pct === 'number') {
      hostVolume = pct / 100;
      applyLifecycleState();
    }
  });
}

function waitForLateMraid(detectTimeoutMs: number): Promise<MraidApi | undefined> {
  const existing = getMraid();

  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise(resolve => {
    const startedAt = window.performance.now();
    const timer = window.setInterval(() => {
      const mraid = getMraid();

      if (mraid || window.performance.now() - startedAt >= detectTimeoutMs) {
        window.clearInterval(timer);
        resolve(mraid);
      }
    }, 50);
  });
}

export function initMraid(timeoutMs = 2000, detectTimeoutMs = 500): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = waitForLateMraid(detectTimeoutMs).then(
    mraid =>
      new Promise<void>(resolve => {
        if (!mraid) {
          resolve();
          return;
        }

        const finish = () => {
          setupMraidCallbacks(mraid);
          resolve();
        };

        const state = typeof mraid.getState === 'function' ? mraid.getState() : 'ready';

        if (state === 'loading' && typeof mraid.addEventListener === 'function') {
          let done = false;
          const completeOnce = () => {
            if (!done) {
              done = true;
              finish();
            }
          };

          mraid.addEventListener('ready', completeOnce);
          window.setTimeout(completeOnce, timeoutMs);
          return;
        }

        finish();
      }),
  );

  return initPromise;
}

export const mraidInitPromise = initMraid();

export function bindLifecycle(scene: LifecycleScene): void {
  boundScene = scene;

  if (!lifecycleBound) {
    lifecycleBound = true;
    document.addEventListener('visibilitychange', applyLifecycleState);
    window.addEventListener('luna:pause', applyLifecycleState);
    window.addEventListener('luna:resume', applyLifecycleState);
    window.addEventListener('luna:mute', () => {
      if (boundScene?.sound) {
        boundScene.sound.mute = true;
      }
    });
    window.addEventListener('luna:unmute', () => {
      applyLifecycleState();
    });
    window.addEventListener('message', event => {
      if (event.data === 'onPause' || event.data === 'ad-event-pause') {
        if (boundScene?.sound) {
          boundScene.sound.mute = true;
        }
        boundScene?.tweens?.pauseAll?.();
      }

      if (event.data === 'onResume' || event.data === 'ad-event-resume') {
        applyLifecycleState();
      }
    });
    window.addEventListener('ad-event-pause', applyLifecycleState);
    window.addEventListener('ad-event-resume', applyLifecycleState);
  }

  applyLifecycleState();
}

export function notifyGameReady(): void {
  callWindowLifecycle('gameReady');
}

export function notifyGameStart(): void {
  callWindowLifecycle('gameStart');
}

export function notifyGameEnd(): void {
  callWindowLifecycle('gameEnd');
}

export function notifyGameClose(): void {
  callWindowLifecycle('gameClose');
}

export function closeCreative(): void {
  notifyGameClose();

  const mraid = getMraid();
  const state = typeof mraid?.getState === 'function' ? mraid.getState() : 'ready';

  if (state !== 'loading' && typeof mraid?.close === 'function') {
    mraid.close();
  }
}

export function triggerCTA(storeUrl = getStoreUrl()): void {
  const mraid = getMraid();

  if (typeof window.ExitApi?.exit === 'function') {
    window.ExitApi.exit();
    return;
  }

  if (typeof window.FbPlayableAd?.onCTAClick === 'function') {
    window.FbPlayableAd.onCTAClick();
    return;
  }

  const lunaPlayable = window.Luna?.Unity?.Playable;
  if (typeof lunaPlayable?.InstallFullGame === 'function') {
    lunaPlayable.InstallFullGame();
    return;
  }

  if (typeof lunaPlayable?.installFullGame === 'function') {
    lunaPlayable.installFullGame();
    return;
  }

  if (typeof window.playableSDK?.openAppStore === 'function') {
    window.playableSDK.openAppStore();
    return;
  }

  if (typeof window.install === 'function') {
    window.install();
    return;
  }

  if (typeof window.openAppStore === 'function') {
    window.openAppStore();
    return;
  }

  if (window.clickTag) {
    window.open(window.clickTag, '_blank');
    return;
  }

  if (window.__VUNGLE__ && window.parent) {
    window.parent.postMessage('download', '*');
    return;
  }

  if (window.__TIKTOK__) {
    window.open(storeUrl, '_blank');
    return;
  }

  const state = typeof mraid?.getState === 'function' ? mraid.getState() : 'ready';
  if (state !== 'loading' && typeof mraid?.open === 'function') {
    mraid.open(storeUrl);
    return;
  }

  window.open(storeUrl, '_blank');
}
