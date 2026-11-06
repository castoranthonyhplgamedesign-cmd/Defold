import Phaser from 'phaser';
import { getSoundtrackSlot, gameConfig } from './config';
import { SustainedAudio } from './game/SustainedAudio';

export const SOUNDS = {
  BGM: 'bgm',
  CONVEYOR: 'sfx-conveyor',
  CLICK: 'sfx-click',
  CUT: 'sfx-cut',
  SAND: 'sfx-sand',
  WOOSH: 'sfx-woosh',
  BELLS: 'sfx-bells',
  FAIL: 'sfx-fail',
  WIN: 'sfx-win',
  ENDCARD: 'sfx-endcard',
  CTA: 'sfx-cta'
} as const;

type Sound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
type Voice = { sound: Sound; baseVolume: number };
type Flow = { id: string; lastMoving: number };

/** Actual starts, rather than playback requests; read by gameplay QA. */
export const soundPlays: Record<string, number> = {};
const pools = new Map<string, Voice[]>();
const layers = new Map<string, SustainedAudio>();
const cutFlow: Flow = { id: SOUNDS.CUT, lastMoving: -Infinity };
const pourFlow: Flow = { id: SOUNDS.SAND, lastMoving: -Infinity };
let sceneRef: Phaser.Scene | undefined;
let unlocked = false;
let hostMuted = false;
let gameplayFinished = false;

declare global {
  interface Window {
    /** On-demand diagnostics without per-frame snapshot allocations. */
    __SDP_AUDIO__?: () => unknown;
  }
}

function webAudioContext(scene: Phaser.Scene): AudioContext | undefined {
  return (scene.sound as Partial<Phaser.Sound.WebAudioSoundManager>).context;
}

function applyMute(scene: Phaser.Scene): void {
  scene.sound.setMute(!unlocked || gameConfig.MUTE || hostMuted || document.hidden);
}

/** Retain host mute across first-input unlocking and browser visibility changes. */
export function setHostAudioMuted(scene: Phaser.Scene, muted: boolean): void {
  hostMuted = muted;
  applyMute(scene);
}

/** Preallocate bounded voices; retain source levels and the configured base gain. */
export function initAudio(scene: Phaser.Scene): void {
  sceneRef = scene;
  unlocked = false;
  hostMuted = false;
  gameplayFinished = false;
  cutFlow.lastMoving = -Infinity;
  pourFlow.lastMoving = -Infinity;
  pools.clear();
  layers.clear();
  const previous = Object.keys(soundPlays);
  for (let i = 0; i < previous.length; i++) delete soundPlays[previous[i]];
  scene.sound.setMute(true);

  const configuredCount = gameConfig.AUDIO.maxEffectVoices;
  const count = Number.isFinite(configuredCount) ? Math.max(1, Math.min(8, Math.round(configuredCount))) : 4;
  const slots = gameConfig.CHANGABLE_SOUNDTRACKS;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!scene.cache.audio.exists(slot.id)) continue;
    const sustained = slot.id === SOUNDS.BGM || slot.id === SOUNDS.CONVEYOR || slot.id === SOUNDS.CUT || slot.id === SOUNDS.SAND;
    if (sustained) {
      layers.set(slot.id, new SustainedAudio(scene, slot, gameConfig.AUDIO, () => {
        soundPlays[slot.id] = (soundPlays[slot.id] ?? 0) + 1;
      }));
      continue;
    }
    const voices: Voice[] = [];
    for (let j = 0; j < count; j++) {
      const sound = scene.sound.add(slot.id, { volume: slot.volume, loop: slot.loop }) as Sound;
      voices.push({ sound, baseVolume: slot.volume });
    }
    pools.set(slot.id, voices);
  }

  const visibility = (): void => {
    applyMute(scene);
    const context = webAudioContext(scene);
    if (document.hidden) {
      void context?.suspend?.().catch(() => undefined);
    } else if (unlocked) {
      void context?.resume?.().catch(() => undefined);
    }
  };
  document.addEventListener('visibilitychange', visibility);
  const cleanup = (): void => {
    document.removeEventListener('visibilitychange', visibility);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    scene.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
    if (sceneRef !== scene) return;
    for (const voices of pools.values()) {
      for (let i = 0; i < voices.length; i++) voices[i].sound.destroy();
    }
    for (const layer of layers.values()) layer.destroy();
    pools.clear();
    layers.clear();
    if (sceneRef === scene) {
      sceneRef = undefined;
      window.__SDP_AUDIO__ = undefined;
    }
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  window.__SDP_AUDIO__ = () => {
    const channels: Record<string, unknown> = {};
    for (const [id, layer] of layers) channels[id] = { ...layer.snapshot(), starts: soundPlays[id] ?? 0 };
    for (const [id, voices] of pools) {
      let playing = 0;
      let paused = 0;
      for (let i = 0; i < voices.length; i++) {
        if (voices[i].sound.isPlaying) playing++;
        if (voices[i].sound.isPaused) paused++;
      }
      const details = [];
      let volume = 0;
      for (let i = 0; i < voices.length; i++) {
        const sound = voices[i].sound;
        if (sound.isPlaying || sound.isPaused) volume += sound.volume;
        details.push({ playing: sound.isPlaying, paused: sound.isPaused, volume: sound.volume, seek: sound.seek, duration: sound.duration });
      }
      channels[id] = { playing, paused, capacity: voices.length, volume, baseVolume: voices[0].baseVolume, voices: details, starts: soundPlays[id] ?? 0 };
    }
    return { unlocked, hostMuted, muted: scene.sound.mute, gameplayFinished, channels };
  };
}

/** Nothing starts before the first genuine pointerdown, including the conveyor loop. */
export function unlockAudio(scene: Phaser.Scene): void {
  if (unlocked) return;
  unlocked = true;
  applyMute(scene);
  const context = webAudioContext(scene);
  if (context) {
    void context.resume?.().catch(() => undefined);
  } else if (scene.sound.locked) {
    // Unlike WebAudio, Phaser's HTML5 manager does not install its gesture unlock itself.
    (scene.sound as Phaser.Sound.HTML5AudioSoundManager).unlock();
  }
  if (!gameConfig.MUTE && !gameplayFinished) {
    playSound(scene, SOUNDS.BGM, 1, true);
    playSound(scene, SOUNDS.CONVEYOR, 1, true);
  }
}

/** Pool short effects; continuous beds own their normalized fades and overlaps. */
export function playSound(scene: Phaser.Scene, id: string, rate = 1, exclusive = false): void {
  if (sceneRef !== scene || !unlocked || gameConfig.MUTE || scene.scene.isPaused()) return;
  const layer = layers.get(id);
  if (layer) {
    layer.update(0, true, true);
    return;
  }
  const voices = pools.get(id);
  if (!voices) return;
  let voice: Voice | undefined;
  for (let i = 0; i < voices.length; i++) {
    const current = voices[i];
    if (current.sound.isPlaying || current.sound.isPaused) {
      if (exclusive) return;
    } else if (!voice) {
      voice = current;
    }
  }
  voice ??= voices[0];
  const slot = getSoundtrackSlot(id);
  voice.baseVolume = slot?.volume ?? 1;
  if (voice.sound.play({ volume: voice.baseVolume, loop: slot?.loop ?? false, rate })) {
    soundPlays[id] = (soundPlays[id] ?? 0) + 1;
  }
}

function updateFlow(scene: Phaser.Scene, flow: Flow, moving: boolean): void {
  const layer = layers.get(flow.id);
  if (!layer) return;
  if (moving && !gameplayFinished) {
    flow.lastMoving = scene.time.now;
  }
}

/** Active cutting/falling and sand travelling through the funnel/belt use separate normalized beds. */
export function updateAudio(scene: Phaser.Scene, delta: number, cuttingOrFalling: boolean, transportingSand: boolean): void {
  updateFlow(scene, cutFlow, cuttingOrFalling);
  updateFlow(scene, pourFlow, transportingSand);
  const allowed = sceneRef === scene && unlocked && !gameConfig.MUTE && !scene.scene.isPaused();
  const background = unlocked && !gameplayFinished;
  const hold = Math.max(0, gameConfig.AUDIO.flowHoldMs);
  for (const [id, layer] of layers) {
    const requested = id === SOUNDS.CUT ? !gameplayFinished && scene.time.now - cutFlow.lastMoving <= hold
      : id === SOUNDS.SAND ? !gameplayFinished && scene.time.now - pourFlow.lastMoving <= hold : background;
    layer.update(delta, requested, allowed,
      gameplayFinished && id === SOUNDS.BGM ? gameConfig.AUDIO.endcardMusicFadeMs : gameConfig.AUDIO.flowFadeMs);
  }
}

/** Stop gameplay layers and fade music while the end card reveals. */
export function finishGameplayAudio(scene: Phaser.Scene): void {
  gameplayFinished = true;
  for (const [id, layer] of layers) {
    layer.update(0, false, unlocked && !gameConfig.MUTE,
      id === SOUNDS.BGM ? gameConfig.AUDIO.endcardMusicFadeMs : gameConfig.AUDIO.flowFadeMs);
  }
  // Short clicks/chimes retain their authored tails; only indefinitely looping effects must stop.
  for (const [id, voices] of pools) {
    if (id === SOUNDS.FAIL) continue;
    for (let i = 0; i < voices.length; i++) if (voices[i].sound.loop) voices[i].sound.stop();
  }
}

export function stopSoundEffects(_scene: Phaser.Scene, keep: readonly string[] = []): void {
  for (const [id, layer] of layers) if (id !== SOUNDS.BGM && !keep.includes(id)) layer.stop();
  for (const [id, voices] of pools) {
    if (id === SOUNDS.BGM || keep.includes(id)) continue;
    for (let i = 0; i < voices.length; i++) {
      voices[i].sound.stop();
    }
  }
}
