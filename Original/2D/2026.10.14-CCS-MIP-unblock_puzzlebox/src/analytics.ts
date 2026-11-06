/** AppLovin Playable Analytics names (deduped by the SDK). CHALLENGE_RETRY = HUD build restart button. */
export type AnalyticsEvent =
  | 'CHALLENGE_RETRY'
  | 'LOADING'
  | 'LOADED'
  | 'DISPLAYED'
  | 'CTA_CLICKED'
  | 'ENDCARD_SHOWN'
  | 'CHALLENGE_STARTED'
  | 'CHALLENGE_PASS_25'
  | 'CHALLENGE_PASS_50'
  | 'CHALLENGE_PASS_75'
  | 'CHALLENGE_SOLVED'
  | 'CHALLENGE_FAILED'

declare const ALPlayableAnalytics: any
declare const playableSDK: any

export function trackEvent(e: AnalyticsEvent) {
  if (typeof ALPlayableAnalytics !== 'undefined' && typeof ALPlayableAnalytics.trackEvent === 'function') {
    ALPlayableAnalytics.trackEvent(e)
  } else if (typeof playableSDK !== 'undefined' && typeof playableSDK.reportEvent === 'function') {
    playableSDK.reportEvent(e)
  } else {
    console.log('[Analytics]', e)
  }
}
