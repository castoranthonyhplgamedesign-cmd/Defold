/**
 * AppLovin Playable Analytics predefined events. The SDK object (window.ALPlayableAnalytics) is
 * provided by the AppLovin container and is never defined here; every dispatch is guarded.
 * CHALLENGE_FAILED fires only when the belt jams (the GDD fail state); the time and click limits
 * just end the game. CHALLENGE_RETRY stays defined, but this playable has no retry action, so
 * nothing emits it.
 */
export const ANALYTICS_EVENTS = {
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  DISPLAYED: 'DISPLAYED',
  CHALLENGE_STARTED: 'CHALLENGE_STARTED',
  CHALLENGE_PASS_25: 'CHALLENGE_PASS_25',
  CHALLENGE_PASS_50: 'CHALLENGE_PASS_50',
  CHALLENGE_PASS_75: 'CHALLENGE_PASS_75',
  CHALLENGE_SOLVED: 'CHALLENGE_SOLVED',
  CHALLENGE_FAILED: 'CHALLENGE_FAILED',
  CHALLENGE_RETRY: 'CHALLENGE_RETRY',
  ENDCARD_SHOWN: 'ENDCARD_SHOWN',
  CTA_CLICKED: 'CTA_CLICKED'
} as const;

declare global {
  interface Window {
    ALPlayableAnalytics?: { trackEvent?: (event: string) => void };
  }
}

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

// Transition events fire at most once per session; CTA_CLICKED (and RETRY) may repeat.
const ONCE_PER_SESSION = new Set<AnalyticsEvent>([
  ANALYTICS_EVENTS.LOADING,
  ANALYTICS_EVENTS.LOADED,
  ANALYTICS_EVENTS.DISPLAYED,
  ANALYTICS_EVENTS.CHALLENGE_STARTED,
  ANALYTICS_EVENTS.CHALLENGE_PASS_25,
  ANALYTICS_EVENTS.CHALLENGE_PASS_50,
  ANALYTICS_EVENTS.CHALLENGE_PASS_75,
  ANALYTICS_EVENTS.CHALLENGE_SOLVED,
  ANALYTICS_EVENTS.CHALLENGE_FAILED,
  ANALYTICS_EVENTS.ENDCARD_SHOWN
]);

const sentEvents = new Set<AnalyticsEvent>();

// Every predefined name, enumerated at runtime: unknown names are rejected, and the bundler keeps
// all of them (including CHALLENGE_RETRY, which nothing emits) in the built HTML.
const KNOWN_EVENTS = new Set<string>(Object.values(ANALYTICS_EVENTS));

export function trackEvent(event: AnalyticsEvent): void {
  if (!KNOWN_EVENTS.has(event)) {
    console.warn('[Analytics] unknown event', event);
    return;
  }
  if (ONCE_PER_SESSION.has(event)) {
    if (sentEvents.has(event)) {
      return;
    }
    sentEvents.add(event);
  }

  if (typeof window.ALPlayableAnalytics?.trackEvent === 'function') {
    try {
      window.ALPlayableAnalytics.trackEvent(event);
      return;
    } catch (error) {
      console.warn('[Analytics] ALPlayableAnalytics dispatch failed', error);
    }
  }

  if (typeof window.playableSDK?.reportEvent === 'function') {
    try {
      window.playableSDK.reportEvent(event);
      return;
    } catch (error) {
      console.warn('[Analytics] playableSDK dispatch failed', error);
    }
  }

  console.log('[Analytics]', event);
}
