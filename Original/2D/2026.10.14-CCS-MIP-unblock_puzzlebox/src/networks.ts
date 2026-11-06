import { setAudioState } from './audio'
import { STORE_URL_ANDROID, STORE_URL_IOS } from './constants'

declare const mraid: any
declare const ExitApi: any
declare const FbPlayableAd: any
declare const playableSDK: any

const w = window as any

const isIOS = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const storeUrl = () => (isIOS() ? STORE_URL_IOS : STORE_URL_ANDROID)

// ---------- MRAID ----------

let mraidViewable = true
let mraidExposed = true
let mraidSetupDone = false
let onMraidVisibility: (() => void) | null = null
let onHostVolume: ((v: number) => void) | null = null

const hasMraid = () => typeof w.mraid !== 'undefined'
const mraidReady = () => typeof mraid.getState !== 'function' || mraid.getState() !== 'loading'

function setupMraid() {
  if (mraidSetupDone) return
  mraidSetupDone = true
  if (typeof mraid.addEventListener !== 'function') return
  mraid.addEventListener('error', (message: string, action: string) => console.warn('[MRAID error]', { message, action }))
  mraid.addEventListener('stateChange', (state: string) => console.log('[MRAID stateChange]', state))
  mraid.addEventListener('exposureChange', (pct: number) => {
    mraidExposed = pct > 0
    onMraidVisibility?.()
  })
  mraid.addEventListener('viewableChange', (v: boolean) => {
    mraidViewable = !!v
    onMraidVisibility?.()
  })
  mraid.addEventListener('audioVolumeChange', (pct: number | null) => {
    if (typeof pct === 'number') onHostVolume?.(pct / 100)
  })
  if (typeof mraid.isViewable === 'function') mraidViewable = !!mraid.isViewable()
}

let initPromise: Promise<void> | null = null

/** Resolves once MRAID is ready, absent, or timed out — never hangs boot. */
export function initMraid(timeoutMs = 2000, detectTimeoutMs = 500): Promise<void> {
  return (initPromise ??= new Promise<void>((resolve) => {
    const started = Date.now()
    const attach = () => {
      if (!hasMraid()) {
        if (Date.now() - started < detectTimeoutMs) setTimeout(attach, 50)
        else resolve()
        return
      }
      if (mraidReady()) {
        setupMraid()
        resolve()
        return
      }
      mraid.addEventListener('ready', () => {
        setupMraid()
        resolve()
      })
      setTimeout(resolve, timeoutMs)
    }
    attach()
  }))
}
initMraid()

// ---------- Lifecycle ----------

const call = (name: string) => {
  if (typeof w[name] !== 'function') return
  try {
    w[name]()
  } catch (e) {
    console.warn(`[${name}]`, e)
  }
}
export const notifyGameReady = () => call('gameReady')
export const notifyGameStart = () => call('gameStart')
export const notifyGameEnd = () => call('gameEnd')
export const notifyGameClose = () => call('gameClose')

/** Combines every host pause/mute source into game.pause()/resume() and sound mute. */
export function bindLifecycle(game: Phaser.Game) {
  const pausers = new Set<string>()
  const muters = new Set<string>(['gesture']) // muted until first tap
  let hostVolume = 1
  window.addEventListener('pointerdown', () => set(muters, 'gesture', false), { once: true, capture: true })

  const apply = () => {
    const paused = pausers.size > 0
    if (paused && !game.isPaused) game.pause()
    else if (!paused && game.isPaused) game.resume()
    game.sound.mute = paused || muters.size > 0
    game.sound.volume = hostVolume
    setAudioState(paused, muters.size > 0, hostVolume)
  }
  const set = (bag: Set<string>, src: string, on: boolean) => {
    if (on) bag.add(src)
    else bag.delete(src)
    apply()
  }

  onMraidVisibility = () => set(pausers, 'mraid', !mraidViewable || !mraidExposed)
  onHostVolume = (v) => {
    hostVolume = v
    apply()
  }
  if (hasMraid()) onMraidVisibility() // apply cached hidden state immediately

  document.addEventListener('visibilitychange', () => set(pausers, 'document', document.hidden))

  // Unity (Luna)
  window.addEventListener('luna:pause', () => set(pausers, 'luna', true))
  window.addEventListener('luna:resume', () => set(pausers, 'luna', false))
  window.addEventListener('luna:mute', () => set(muters, 'luna', true))
  window.addEventListener('luna:unmute', () => set(muters, 'luna', false))

  // Mintegral
  window.addEventListener('message', (e) => {
    const d = typeof e.data === 'string' ? e.data : e.data?.type
    if (d === 'onPause') set(pausers, 'mintegral', true)
    else if (d === 'onResume') set(pausers, 'mintegral', false)
  })

  // Vungle
  window.addEventListener('ad-event-pause', () => set(pausers, 'vungle', true))
  window.addEventListener('ad-event-resume', () => set(pausers, 'vungle', false))

  apply()
}

// ---------- CTA ----------

// ponytail: TikTok (__TIKTOK__) branch omitted — tt not in this project's 8 networks.
export function triggerCTA() {
  const url = storeUrl()
  if (typeof ExitApi !== 'undefined' && typeof ExitApi.exit === 'function') {
    ExitApi.exit()
    return
  }
  if (typeof FbPlayableAd !== 'undefined' && typeof FbPlayableAd.onCTAClick === 'function') {
    FbPlayableAd.onCTAClick()
    return
  }
  const luna = w.Luna?.Unity?.Playable
  if (luna && typeof luna.InstallFullGame === 'function') {
    luna.InstallFullGame()
    return
  }
  if (typeof playableSDK !== 'undefined' && typeof playableSDK.openAppStore === 'function') {
    playableSDK.openAppStore()
    return
  }
  if (typeof w.install === 'function') {
    w.install()
    return
  }
  if (typeof w.openAppStore === 'function') {
    w.openAppStore()
    return
  }
  if (typeof w.clickTag === 'string' && w.clickTag) {
    window.open(w.clickTag, '_blank')
    return
  }
  if (w.__VUNGLE__) {
    parent.postMessage('download', '*')
    return
  }
  if (hasMraid() && typeof mraid.open === 'function' && mraidReady()) {
    mraid.open(url)
    return
  }
  window.open(url, '_blank')
}
