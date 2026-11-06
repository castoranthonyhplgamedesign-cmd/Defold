import Phaser from 'phaser';
import { setHostAudioMuted } from './audio';

declare global {
  interface Window {
    ExitApi?: { exit?: () => void };
    FbPlayableAd?: { onCTAClick?: () => void };
    Luna?: { Unity?: { Playable?: { InstallFullGame?: () => void; LifeCycle?: { GameStarted?: () => void; GameEnded?: () => void } } } };
    playableSDK?: { openAppStore?: () => void; reportEvent?: (event: string) => void };
    install?: () => void;
    openAppStore?: () => void;
    clickTag?: string;
    __VUNGLE__?: boolean;
    __TIKTOK__?: boolean;
    mraid?: MraidLike;
    closePlayable?: () => void;
    gameReady?: () => void;
    gameStart?: () => void;
    gameEnd?: () => void;
    gameClose?: () => void;
  }

  var mraid: MraidLike | undefined;
}

type MraidLike = {
  getState?: () => string;
  isViewable?: () => boolean;
  open?: (url?: string) => void;
  close?: () => void;
  unload?: () => void;
  addEventListener?: (event: string, callback: (...args: never[]) => void) => void;
};

const POPUP_RETRY_WINDOW_MS = 1200;

let sceneRef: Phaser.Scene | undefined;
let mraidInitialized = false;
let mraidViewable = true;
let mraidExposed = true;
let mraidVolume: number | undefined;
let initPromise: Promise<boolean> | undefined;
let popupRetryArmed = false;
let lifecycleListenersInstalled = false;
let lunaPaused = false;
let lunaMuted = false;
let mintegralPaused = false;
let vunglePaused = false;

function getMraidState(): string {
  try {
    if (typeof mraid !== 'undefined' && mraid && typeof mraid.getState === 'function') {
      return mraid.getState() || 'ready';
    }
  } catch {
    return 'ready';
  }
  return 'ready';
}

function applySceneLifecycle(): void {
  if (!sceneRef) {
    return;
  }

  // A resume from one bridge must not override another bridge's active pause/mute request.
  const hidden = document.hidden || !mraidViewable || !mraidExposed || lunaPaused || mintegralPaused || vunglePaused;
  setHostAudioMuted(sceneRef, lunaMuted || hidden);
  if (hidden) {
    sceneRef.scene.pause();
    sceneRef.sound.pauseAll();
  } else {
    sceneRef.scene.resume();
    sceneRef.sound.resumeAll();
  }

  if (typeof mraidVolume === 'number') {
    sceneRef.sound.setVolume(mraidVolume);
  }
}

function setupMraid(): void {
  if (mraidInitialized || typeof mraid === 'undefined' || !mraid) {
    return;
  }

  mraidInitialized = true;
  if (typeof mraid.isViewable === 'function') {
    try {
      mraidViewable = mraid.isViewable();
    } catch {
      mraidViewable = true;
    }
  }

  if (typeof mraid.addEventListener === 'function') {
    mraid.addEventListener('error', ((message: string, action: string) => {
      console.warn('[MRAID error]', { message, action });
    }) as never);
    mraid.addEventListener('stateChange', ((state: string) => {
      console.log('[MRAID stateChange]', state);
    }) as never);
    mraid.addEventListener('exposureChange', ((exposedPercentage: number) => {
      mraidExposed = typeof exposedPercentage === 'number' ? exposedPercentage > 0 : true;
      applySceneLifecycle();
    }) as never);
    mraid.addEventListener('viewableChange', ((viewable: boolean) => {
      mraidViewable = !!viewable;
      applySceneLifecycle();
    }) as never);
    mraid.addEventListener('audioVolumeChange', ((pct: number | null) => {
      if (typeof pct === 'number') {
        mraidVolume = Math.max(0, Math.min(1, pct / 100));
        applySceneLifecycle();
      }
    }) as never);
  }
}

export function initMraid(timeoutMs = 2000, detectTimeoutMs = 500): Promise<boolean> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise(resolve => {
    const startedAt = Date.now();
    const waitForPresence = () => {
      if (typeof mraid !== 'undefined' && mraid) {
        const finish = () => {
          setupMraid();
          resolve(true);
        };

        if (getMraidState() === 'loading' && typeof mraid.addEventListener === 'function') {
          let done = false;
          const complete = () => {
            if (!done) {
              done = true;
              finish();
            }
          };
          mraid.addEventListener('ready', complete as never);
          window.setTimeout(complete, timeoutMs);
        } else {
          finish();
        }
        return;
      }

      if (Date.now() - startedAt < detectTimeoutMs) {
        window.setTimeout(waitForPresence, 50);
      } else {
        resolve(false);
      }
    };

    waitForPresence();
  });

  return initPromise;
}

void initMraid();

/** Cache host events even before the first scene exists; install each global callback once. */
function installLifecycleListeners(): void {
  if (lifecycleListenersInstalled) {
    return;
  }
  lifecycleListenersInstalled = true;
  document.addEventListener('visibilitychange', applySceneLifecycle);
  window.addEventListener('message', event => {
    if (event.data === 'onPause') {
      mintegralPaused = true;
      applySceneLifecycle();
    }
    if (event.data === 'onResume') {
      mintegralPaused = false;
      applySceneLifecycle();
    }
  });
  window.addEventListener('ad-event-pause', () => {
    vunglePaused = true;
    applySceneLifecycle();
  });
  window.addEventListener('ad-event-resume', () => {
    vunglePaused = false;
    applySceneLifecycle();
  });
  window.addEventListener('luna:pause', () => {
    lunaPaused = true;
    applySceneLifecycle();
  });
  window.addEventListener('luna:resume', () => {
    lunaPaused = false;
    applySceneLifecycle();
  });
  window.addEventListener('luna:mute', () => {
    lunaMuted = true;
    applySceneLifecycle();
  });
  window.addEventListener('luna:unmute', () => {
    lunaMuted = false;
    applySceneLifecycle();
  });
}

installLifecycleListeners();

export function bindLifecycle(scene: Phaser.Scene): void {
  sceneRef = scene;
  applySceneLifecycle();

  const release = (): void => {
    if (sceneRef === scene) {
      sceneRef = undefined;
    }
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, release);
    scene.events.off(Phaser.Scenes.Events.DESTROY, release);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, release);
  scene.events.once(Phaser.Scenes.Events.DESTROY, release);
}

export function notifyGameReady(): void {
  window.gameReady?.();
}

export function notifyGameStart(): void {
  window.gameStart?.();
  window.Luna?.Unity?.Playable?.LifeCycle?.GameStarted?.();
}

export function notifyGameEnd(): void {
  window.gameEnd?.();
  window.Luna?.Unity?.Playable?.LifeCycle?.GameEnded?.();
}

export function notifyGameClose(): void {
  window.gameClose?.();
}

export function closeCreative(): void {
  notifyGameClose();
  if (typeof mraid !== 'undefined' && mraid && typeof mraid.close === 'function' && getMraidState() !== 'loading') {
    mraid.close();
  }
}

export function unloadMraidOnFatalError(reason = 'creative-load-failed'): void {
  console.warn('[MRAID unload]', reason);
  if (typeof mraid !== 'undefined' && mraid && typeof mraid.unload === 'function') {
    mraid.unload();
  }
}

/**
 * A touch pointerdown is not a popup-activating gesture in Chrome, so a store open issued from the
 * click-limit tap can be blocked. When window.open returns null, retry once on the pointerup /
 * touchend that ends the same physical tap (bounded in time so it can't fire on a later tap).
 */
function armPopupRetry(storeUrl: string): void {
  if (popupRetryArmed) {
    return;
  }
  popupRetryArmed = true;
  const armedAt = Date.now();
  const cleanup = () => {
    popupRetryArmed = false;
    document.removeEventListener('pointerup', retry, true);
    document.removeEventListener('touchend', retry, true);
  };
  const retry = () => {
    cleanup();
    if (Date.now() - armedAt <= POPUP_RETRY_WINDOW_MS) {
      try {
        window.open(storeUrl, '_blank');
      } catch (error) {
        console.warn('[CTA] window.open retry failed', error);
      }
    }
  };
  document.addEventListener('pointerup', retry, true);
  document.addEventListener('touchend', retry, true);
  window.setTimeout(cleanup, POPUP_RETRY_WINDOW_MS);
}

function openWindow(storeUrl: string): void {
  let opened: Window | null = null;
  try {
    opened = window.open(storeUrl, '_blank');
  } catch (error) {
    console.warn('[CTA] window.open failed', error);
  }
  if (!opened) {
    armPopupRetry(storeUrl);
  }
}

export function triggerCTA(storeUrl: string): void {
  if (typeof ExitApi !== 'undefined' && typeof ExitApi.exit === 'function') {
    ExitApi.exit();
    return;
  }

  if (typeof window.FbPlayableAd?.onCTAClick === 'function') {
    window.FbPlayableAd.onCTAClick();
    return;
  }

  if (typeof window.Luna?.Unity?.Playable?.InstallFullGame === 'function') {
    window.Luna.Unity.Playable.InstallFullGame();
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
    openWindow(window.clickTag);
    return;
  }

  if (window.__VUNGLE__) {
    window.parent?.postMessage('download', '*');
    return;
  }

  if (window.__TIKTOK__) {
    openWindow(storeUrl);
    return;
  }

  if (typeof mraid !== 'undefined' && mraid && typeof mraid.open === 'function' && getMraidState() !== 'loading') {
    try {
      mraid.open(storeUrl);
      return;
    } catch (error) {
      console.warn('[MRAID open]', error);
    }
  }

  openWindow(storeUrl);
}

declare const ExitApi: { exit?: () => void } | undefined;

window.closePlayable = closeCreative;
