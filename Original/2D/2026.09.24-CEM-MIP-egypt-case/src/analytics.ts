declare global {
  interface Window {
    ALPlayableAnalytics?: { trackEvent?: (event: string) => void };
    playableSDK?: { reportEvent?: (event: string) => void; openAppStore?: () => void };
  }
}

export type AnalyticsEvent =
  | 'LOADING'
  | 'LOADED'
  | 'DISPLAYED'
  | 'CHALLENGE_STARTED'
  | 'CHALLENGE_PASS_25'
  | 'CHALLENGE_PASS_50'
  | 'CHALLENGE_PASS_75'
  | 'CHALLENGE_SOLVED'
  | 'CTA_CLICKED'
  | 'ENDCARD_SHOWN';

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window.ALPlayableAnalytics?.trackEvent === 'function') window.ALPlayableAnalytics.trackEvent(event);
  else if (typeof window.playableSDK?.reportEvent === 'function') window.playableSDK.reportEvent(event);
  else console.log('[Analytics]', event);
}
