export type AnalyticsEvent =
  | 'DISPLAYED'
  | 'CTA_CLICKED'
  | 'ENDCARD_SHOWN'
  | 'CHALLENGE_STARTED'
  | 'CHALLENGE_SOLVED';

export function trackEvent(event: AnalyticsEvent): void {
  const sdk = window.playableSDK;

  if (typeof window.ALPlayableAnalytics?.trackEvent === 'function') {
    window.ALPlayableAnalytics.trackEvent(event);
    return;
  }

  if (typeof sdk?.reportEvent === 'function') {
    sdk.reportEvent(event);
    return;
  }

  console.log('[Analytics]', event);
}
