declare const __NETWORK__: import('./constants').NetworkTag;
declare const __ITERATION__: import('./constants').IterationKey;
declare const __HEADER_VARIANT__: import('./constants').HeaderVariantKey;
declare const mraid: MraidApi | undefined;

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

interface Window {
  ExitApi?: {
    exit?: () => void;
  };
  FbPlayableAd?: {
    onCTAClick?: () => void;
  };
  Luna?: {
    Unity?: {
      Playable?: {
        InstallFullGame?: (iosUrl?: string, androidUrl?: string) => void;
      };
      LifeCycle?: {
        GameStarted?: () => void;
        GameEnded?: () => void;
      };
    };
  };
  playableSDK?: {
    openAppStore?: () => void;
    reportEvent?: (eventName: string) => void;
  };
  install?: () => void;
  openAppStore?: () => void;
  clickTag?: string;
  __VUNGLE__?: boolean;
  __TIKTOK__?: boolean;
  gameReady?: () => void;
  gameStart?: () => void;
  gameEnd?: () => void;
  gameClose?: () => void;
  mraid?: MraidApi;
}

interface MraidApi {
  addEventListener?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeEventListener?: (event: string, callback: (...args: unknown[]) => void) => void;
  getState?: () => string;
  isViewable?: () => boolean;
  open?: (url: string) => void;
  close?: () => void;
  unload?: () => void;
  supports?: (feature: string) => boolean;
}
