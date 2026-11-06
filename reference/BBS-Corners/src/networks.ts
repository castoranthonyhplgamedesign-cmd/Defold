import { ACTIVE_NETWORK, STORE_URLS, type NetworkTag } from './constants';

type VisibilityCallback = (paused: boolean) => void;

let mraidReady = false;
let mraidViewable = true;
let mraidExposed = true;
let mraidAudioAudible = true;
const lifecyclePauseCallbacks = new Set<VisibilityCallback>();
const MRAID_NETWORKS = new Set<NetworkTag>(['al', 'is', 'un']);

export function installLifecycleStubs(): void {
  const names: Array<'gameReady' | 'gameStart' | 'gameEnd' | 'gameClose'> = [
    'gameReady',
    'gameStart',
    'gameEnd',
    'gameClose',
  ];

  for (const name of names) {
    if (typeof window[name] !== 'function') {
      window[name] = () => undefined;
    }
  }
}

export async function initMraid(timeoutMs = 2000, detectTimeoutMs = 500): Promise<void> {
  const api = await detectMraid(detectTimeoutMs);
  if (!api) {
    if (isMraidNetwork()) {
      console.warn('[MRAID] unavailable before startup timeout');
    }
    return;
  }

  setupMraidListeners(api);
  await waitForMraidReady(api, timeoutMs);
}

function isMraidNetwork(): boolean {
  return MRAID_NETWORKS.has(ACTIVE_NETWORK);
}

function getMraidApi(): MraidApi | null {
  if (typeof mraid !== "undefined" && mraid) return mraid;
  if (typeof window !== "undefined" && typeof window.mraid !== "undefined") return window.mraid;
  return null;
}

function waitForMraidReady(api: MraidApi, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      mraidReady = true;
      resolve();
    };

    if (typeof mraid !== "undefined" && mraid) {
      if (typeof mraid.addEventListener === 'function') {
        mraid.addEventListener("ready", finish);
      }

      const directState = typeof mraid.getState === 'function' ? mraid.getState() : 'default';
      if (directState !== 'loading') {
        finish();
        return;
      }

      window.setTimeout(finish, timeoutMs);
      return;
    }

    if (typeof api.addEventListener === 'function') {
      api.addEventListener("ready", finish);
    }

    const state = typeof api.getState === 'function' ? api.getState() : 'default';
    if (state !== 'loading') {
      finish();
      return;
    }

    window.setTimeout(finish, timeoutMs);
  });
}

function detectMraid(detectTimeoutMs: number): Promise<MraidApi | null> {
  const initialApi = getMraidApi();
  if (initialApi) return Promise.resolve(initialApi);

  return new Promise((resolve) => {
    const startedAt = performance.now();
    const tick = () => {
      const api = getMraidApi();
      if (api) {
        resolve(api);
        return;
      }

      if (performance.now() - startedAt >= detectTimeoutMs) {
        resolve(null);
        return;
      }

      window.setTimeout(tick, 50);
    };

    tick();
  });
}

function setupMraidListeners(api: MraidApi): void {
  if (typeof mraid !== "undefined" && mraid) {
    if (typeof mraid.isViewable === 'function') {
      mraidViewable = mraid.isViewable();
    }

    if (typeof mraid.addEventListener === 'function') {
      mraid.addEventListener("error", (message, action) => {
        console.warn('[MRAID error]', { message, action });
      });
      mraid.addEventListener("stateChange", (state) => {
        console.warn('[MRAID stateChange]', state);
      });
      mraid.addEventListener("exposureChange", (exposedPercentage) => {
        mraidExposed = typeof exposedPercentage === 'number' ? exposedPercentage > 0 : true;
        applyLifecyclePauseState();
      });
      mraid.addEventListener("viewableChange", (viewable) => {
        mraidViewable = viewable !== false;
        applyLifecyclePauseState();
      });
      mraid.addEventListener("audioVolumeChange", (volume) => {
        if (volume === null || typeof volume !== 'number') return;
        mraidAudioAudible = volume > 0;
        applyLifecyclePauseState();
      });
    }

    return;
  }

  if (typeof api.isViewable === 'function') {
    mraidViewable = api.isViewable();
  }

  if (typeof api.addEventListener !== 'function') return;

  api.addEventListener("error", (message, action) => {
    console.warn('[MRAID error]', { message, action });
  });
  api.addEventListener("stateChange", (state) => {
    console.warn('[MRAID stateChange]', state);
  });
  api.addEventListener("exposureChange", (exposedPercentage) => {
    mraidExposed = typeof exposedPercentage === 'number' ? exposedPercentage > 0 : true;
    applyLifecyclePauseState();
  });
  api.addEventListener("viewableChange", (viewable) => {
    mraidViewable = viewable !== false;
    applyLifecyclePauseState();
  });
  api.addEventListener("audioVolumeChange", (volume) => {
    if (volume === null || typeof volume !== 'number') return;
    mraidAudioAudible = volume > 0;
    applyLifecyclePauseState();
  });
}

export function bindLifecycle(callback: VisibilityCallback): () => void {
  lifecyclePauseCallbacks.add(callback);
  document.addEventListener('visibilitychange', applyLifecyclePauseState);
  applyLifecyclePauseState();
  return () => {
    lifecyclePauseCallbacks.delete(callback);
    if (lifecyclePauseCallbacks.size === 0) {
      document.removeEventListener('visibilitychange', applyLifecyclePauseState);
    }
  };
}

function applyLifecyclePauseState(): void {
  const paused = document.hidden || !mraidViewable || !mraidExposed || !mraidAudioAudible;
  for (const callback of lifecyclePauseCallbacks) callback(paused);
}

export function notifyGameReady(): void {
  window.gameReady?.();
}

export function notifyGameStart(): void {
  window.gameStart?.();
  if (ACTIVE_NETWORK === 'un') {
    window.Luna?.Unity?.LifeCycle?.GameStarted?.();
  }
}

export function notifyGameEnd(): void {
  window.gameEnd?.();
  if (ACTIVE_NETWORK === 'un') {
    window.Luna?.Unity?.LifeCycle?.GameEnded?.();
  }
}

export function notifyGameClose(): void {
  window.gameClose?.();
}

export function closeMraidAd(): void {
  if (typeof mraid !== "undefined" && typeof mraid.close === 'function') {
    mraid.close();
    return;
  }

  const api = getMraidApi();
  if (typeof api?.close === 'function') {
    api.close();
  }
}

export function unloadMraidAd(reason = 'creative unavailable'): void {
  console.warn('[MRAID unload]', reason);
  if (typeof mraid !== "undefined" && typeof mraid.unload === 'function') {
    mraid.unload();
    return;
  }

  const api = getMraidApi();
  if (typeof api?.unload === 'function') {
    api.unload();
    return;
  }

  notifyGameClose();
}

export function triggerCTA(): void {
  notifyGameClose();
  const storeUrl = getStoreUrlForPlatform();

  if (ACTIVE_NETWORK === 'gg' && typeof window.ExitApi?.exit === 'function') {
    window.ExitApi.exit();
    return;
  }

  if ((ACTIVE_NETWORK === 'fb' || ACTIVE_NETWORK === 'mo') && typeof window.FbPlayableAd?.onCTAClick === 'function') {
    window.FbPlayableAd.onCTAClick();
    return;
  }

  if (ACTIVE_NETWORK === 'un' && typeof window.Luna?.Unity?.Playable?.InstallFullGame === 'function') {
    window.Luna.Unity.Playable.InstallFullGame(STORE_URLS.ios, STORE_URLS.android);
    return;
  }

  if (isMraidNetwork()) {
    if (openWithMraid(storeUrl, true)) return;
    return;
  }

  if (typeof window.playableSDK?.openAppStore === 'function') {
    window.playableSDK.openAppStore();
    return;
  }

  if (ACTIVE_NETWORK === 'mtg' && typeof window.install === 'function') {
    window.install();
    return;
  }

  if (typeof window.openAppStore === 'function') {
    window.openAppStore();
    return;
  }

  if (ACTIVE_NETWORK === 'mo' && typeof window.clickTag === 'string' && window.clickTag.length > 0) {
    openBrowserWindow(window.clickTag);
    return;
  }

  if (ACTIVE_NETWORK === 'vu' || window.__VUNGLE__) {
    window.parent?.postMessage?.('download', '*');
    return;
  }

  if (ACTIVE_NETWORK === 'tt' || window.__TIKTOK__) {
    openBrowserWindow(storeUrl);
    return;
  }

  if (openWithMraid(storeUrl)) return;

  openBrowserWindow(storeUrl);
}

function openWithMraid(url: string, allowBrowserFallback = false): boolean {
  if (typeof mraid !== "undefined" && mraid && typeof mraid.open === 'function') {
    const state = typeof mraid.getState === 'function' ? mraid.getState() : 'default';
    if (mraidReady && state !== 'loading') {
      mraid.open(url);
      return true;
    }
  }

  const api = getMraidApi();
  if (mraidReady && typeof api?.open === 'function') {
    const state = typeof api.getState === 'function' ? api.getState() : 'default';
    if (state !== 'loading') {
      api.open(url);
      return true;
    }
  }

  if (allowBrowserFallback) {
    openBrowserWindow(url);
    return true;
  }

  return false;
}

function openBrowserWindow(url: string): void {
  if (typeof window.open === 'function') {
    window.open(url, '_blank');
  }
}

function getStoreUrlForPlatform(): string {
  return isIosLikeDevice() ? STORE_URLS.ios : STORE_URLS.android;
}

function isIosLikeDevice(): boolean {
  const { userAgent, platform, maxTouchPoints } = window.navigator;
  return /iPad|iPhone|iPod/i.test(userAgent)
    || /iPad|iPhone|iPod/i.test(platform)
    || (platform === 'MacIntel' && maxTouchPoints > 1);
}
