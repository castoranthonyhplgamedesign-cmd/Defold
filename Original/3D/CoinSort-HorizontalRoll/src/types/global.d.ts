export {};

declare global {
  interface Window {
    ALPlayableAnalytics?: {
      trackEvent?: (eventName: string) => void;
    };
    ExitApi?: {
      exit?: () => void;
    };
    FbPlayableAd?: {
      onCTAClick?: () => void;
    };
    Luna?: {
      Unity?: {
        Playable?: {
          InstallFullGame?: () => void;
          installFullGame?: () => void;
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
  }
}
