import Phaser from 'phaser'
import { PERF, perfFrame } from './utils/perf'
import touch from '../Assets/audio/sfx_touch.mp3'
import merge from '../Assets/audio/sfx_merge.mp3'
import pop from '../Assets/audio/sfx_pop.mp3'
import gift from '../Assets/audio/sfx_gift.mp3'
import win from '../Assets/audio/sfx_win.mp3'
// Red-line warning blip (generated: 660 Hz sine, 5 ms attack, exp decay, 0.15 s). Danger plays it on every rope pulse.
import warn from '../Assets/audio/sfx_warn.mp3'

/**
 * HTMLAudio SFX pools per IOS_SFX_GUIDELINES.md: every voice is created at boot, primed silently during
 * real gameplay gestures, reused for every cue, and paused/muted through the shared lifecycle state.
 * Sounds and volumes come from the reference playable (touch/merge/destroy/goal/win slots).
 */
export type Cue = 'touch' | 'merge' | 'pop' | 'gift' | 'win' | 'warn'

// voices = expected overlap: merge/pop fire every 80 ms per ring and last 0.65 s.
const SPEC: Record<Cue, { src: string; voices: number; volume: number }> = {
  touch: { src: touch, voices: 2, volume: 1 },
  merge: { src: merge, voices: 6, volume: 0.5 },
  pop: { src: pop, voices: 6, volume: 0.5 },
  gift: { src: gift, voices: 2, volume: 1 },
  win: { src: win, voices: 1, volume: 1 },
  warn: { src: warn, voices: 2, volume: 0.25 },
}
const PENDING_FRESH_MS = 1000 // a rejected cue may be retried on release only this long after its request

type Voice = {
  el: HTMLAudioElement
  base: number
  gen: number // request generation: stale prime/play callbacks compare against it
  primed: boolean
  priming: boolean
  audible: boolean
  playingSeen: boolean
  pending: boolean
  requestedAt: number
  unsupported: boolean
}

const pools = {} as Record<Cue, Voice[]>
let paused = false
let muted = true
let hostVolume = 1
let gestureActive = false

/** Create every voice (call after the MRAID/DOM gate, before input) and hook gestures on the game canvas. */
export function initAudio(target: HTMLElement) {
  for (const cue of Object.keys(SPEC) as Cue[]) {
    const { src, voices, volume } = SPEC[cue]
    pools[cue] = []
    for (let i = 0; i < voices; i++) {
      const el = new Audio(src)
      el.preload = 'auto'
      const v: Voice = { el, base: volume, gen: 0, primed: false, priming: false, audible: false, playingSeen: false, pending: false, requestedAt: 0, unsupported: false }
      el.addEventListener('playing', () => { if (v.audible) v.playingSeen = true })
      el.addEventListener('ended', () => { v.audible = false })
      el.addEventListener('error', () => { v.unsupported = true })
      if (el.readyState === HTMLMediaElement.HAVE_NOTHING) try { el.load() } catch { /* retried on play */ }
      pools[cue].push(v)
    }
  }
  // One input path. Registered after Phaser's own canvas listeners, so the immediate cue (requested from
  // Phaser's handler) is always started before spare voices are primed, all inside the same native event.
  const ua = navigator.userAgent
  const mobile = /Android|iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const touchPath = mobile && 'ontouchstart' in window
  const opts = { capture: false, passive: true }
  target.addEventListener(touchPath ? 'touchstart' : 'pointerdown', onStart, opts)
  target.addEventListener(touchPath ? 'touchend' : 'pointerup', onEnd, opts)
  target.addEventListener(touchPath ? 'touchcancel' : 'pointercancel', onCancel, opts)
  window.addEventListener('blur', onCancel)
}

/** Lifecycle gate from networks.bindLifecycle: host pause/visibility, mute sources and host volume. */
export function setAudioState(isPaused: boolean, isMuted: boolean, volume: number) {
  if (isPaused && !paused) {
    for (const cue in pools) for (const v of pools[cue as Cue]) stop(v)
  }
  paused = isPaused
  muted = isMuted
  hostVolume = volume
  for (const cue in pools) for (const v of pools[cue as Cue]) if (!v.priming) applyLevel(v)
}

/** Request a cue now. Overflow policy: reuse the oldest voice when every voice is busy. */
export function sfx(cue: Cue) {
  if (!PERF) return play1(cue)
  const t0 = performance.now()
  play1(cue)
  perfFrame.sfx += performance.now() - t0
  perfFrame.sfxN++
}

// Chain cues (merge/pop, every 80 ms) cost ~22 ms per HTMLAudio play() on iPhone (media-process IPC). Once their
// buffers are decoded they play as Web Audio one-shots through Phaser's master (lifecycle mute/volume), like the BGM.
const web: Partial<Record<Cue, () => void>> = {}

export function initWebSfx(sound: Phaser.Sound.BaseSoundManager, cache: Phaser.Cache.BaseCache) {
  if (!(sound instanceof Phaser.Sound.WebAudioSoundManager)) return
  const ctx = sound.context
  for (const cue of ['merge', 'pop', 'warn'] as Cue[]) {
    const buf = cache.get(cue)
    if (!(buf instanceof AudioBuffer)) continue
    const gain = ctx.createGain()
    gain.gain.value = SPEC[cue].volume
    gain.connect(sound.destination)
    web[cue] = () => {
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(gain)
      src.start()
    }
  }
}

function play1(cue: Cue) {
  if (paused) return
  const w = web[cue]
  if (w) return w()
  const pool = pools[cue]
  if (!pool) return
  let pick: Voice | null = null
  for (const v of pool) if (!v.audible && !v.unsupported && v.primed) { pick = v; break }
  if (!pick) for (const v of pool) if (!v.audible && !v.unsupported) { pick = v; break }
  if (!pick) for (const v of pool) if (!v.unsupported && (!pick || v.requestedAt < pick.requestedAt)) pick = v
  if (pick) play(pick, true)
}

function play(v: Voice, fromStart: boolean) {
  const g = ++v.gen // also cancels an in-flight silent prime on this element (promotion)
  v.priming = false
  v.audible = true
  v.pending = false
  if (fromStart) {
    v.playingSeen = false
    v.requestedAt = performance.now()
    try { v.el.currentTime = 0 } catch { /* not seekable yet */ }
  }
  applyLevel(v)
  let p: Promise<void> | undefined
  try { p = v.el.play() } catch (e) { return fail(v, g, e) }
  p?.catch((e) => fail(v, g, e))
}

function fail(v: Voice, g: number, e: unknown) {
  if (g !== v.gen) return
  const name = (e as DOMException)?.name
  v.audible = false
  if (name === 'NotSupportedError') v.unsupported = true
  if (name === 'NotAllowedError') v.primed = false
  v.pending = gestureActive // only a still-active gesture may retry it, on its release
}

function prime(v: Voice) {
  if (v.primed || v.priming || v.audible || v.unsupported || paused) return
  const g = ++v.gen
  v.priming = true
  v.el.muted = true
  const done = (ok: boolean) => {
    if (g !== v.gen) return
    v.priming = false
    v.primed = ok
    v.el.pause()
    try { v.el.currentTime = 0 } catch { /* ignore */ }
    applyLevel(v)
  }
  let p: Promise<void> | undefined
  try { p = v.el.play() } catch { return done(false) }
  p ? p.then(() => done(true), () => done(false)) : done(true)
}

function stop(v: Voice) {
  v.gen++
  v.priming = v.audible = v.pending = false
  v.el.pause()
}

function applyLevel(v: Voice) {
  v.el.muted = muted
  v.el.volume = Math.max(0, Math.min(1, v.base * hostVolume))
}

function primeAll() {
  for (const cue in pools) for (const v of pools[cue as Cue]) prime(v)
}

function onStart() {
  gestureActive = true
  primeAll()
}

function onEnd() {
  // Native release: retry rejected and still-starting cues on their own elements before the gesture ends.
  const now = performance.now()
  for (const cue in pools) {
    for (const v of pools[cue as Cue]) {
      if (v.pending && now - v.requestedAt < PENDING_FRESH_MS) play(v, false)
      else if (v.audible && !v.playingSeen) play(v, false)
    }
  }
  primeAll()
  onCancel()
}

function onCancel() {
  gestureActive = false
  for (const cue in pools) for (const v of pools[cue as Cue]) v.pending = false
}

// BGM: bgm_loop.mp3 is an 8-bar cut of bgm.mp3 (90 BPM, from 4.025 s) with a 60 ms crossfaded seam, plus 0.3 s of
// loop head after the loop end. A native WebAudio loop (loopStart/loopEnd) skips any MP3 encoder padding a decoder
// keeps (e.g. Safari), which a plain looped <audio> or Phaser sound would play as a gap.
const BGM_LOOP_SEC = 940800 / 44100
const BGM_VOLUME = 0.4

/** Starts the BGM loop through Phaser's master mute/volume, so bindLifecycle's gesture/pause/host mute apply. */
export function startBgm(sound: Phaser.Sound.BaseSoundManager, buffer: unknown) {
  if (!(sound instanceof Phaser.Sound.WebAudioSoundManager) || !(buffer instanceof AudioBuffer)) return
  const ctx = sound.context
  const d = buffer.getChannelData(0)
  let lead = 0
  while (lead < d.length && Math.abs(d[lead]) < 1e-4) lead++ // encoder delay, if this decoder kept it
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true
  src.loopStart = lead / buffer.sampleRate
  src.loopEnd = src.loopStart + BGM_LOOP_SEC
  const gain = ctx.createGain()
  gain.gain.value = BGM_VOLUME
  src.connect(gain).connect(sound.destination)
  src.start(0, src.loopStart)
  // iOS can leave the context suspended/"interrupted" (first load, app switch, call) and Phaser only unlocks once:
  // resume it on every gesture. Lifecycle muting is a separate gain, so this never un-mutes a hidden ad.
  const wake = () => {
    if (ctx.state !== 'running') ctx.resume().catch(() => {})
  }
  window.addEventListener('touchend', wake, { capture: true, passive: true })
  window.addEventListener('pointerup', wake, { capture: true, passive: true })
}
