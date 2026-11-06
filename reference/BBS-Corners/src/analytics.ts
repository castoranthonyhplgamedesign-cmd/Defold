export type AnalyticsEvent =
  | 'DISPLAYED'
  | 'CTA_CLICKED'
  | 'ENDCARD_SHOWN'
  | 'CHALLENGE_STARTED'
  | 'CHALLENGE_SOLVED'
  | 'LEVEL_FAILED';

export function trackEvent(eventName: AnalyticsEvent, value?: number): void {
  if (typeof window.playableSDK?.reportEvent === 'function') {
    window.playableSDK.reportEvent(eventName);
    return;
  }

  // Keep analytics visible in previews without producing console.error.
  console.warn('[Analytics]', eventName, value ?? '');
}
