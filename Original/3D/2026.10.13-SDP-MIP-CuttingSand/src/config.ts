import defaults from './projectDefaults.json';
import { devAssetPaths } from './assets';

export type Rgb = [number, number, number];

export type TextureSlot = {
  spriteName: string;
  path: string;
  originalSize: { width: number; height: number };
  format: string;
  uuid: string;
  resizeBlocked: boolean;
  anchorPoint: { x: number; y: number };
  scale: number;
};

export type SoundtrackSlot = {
  id: string;
  path: string;
  volume: number;
  loop: boolean;
  format: string;
  uuid: string;
};

export type GameConfig = {
  APP_LINKS: {
    app_store: string;
    google_play: string;
  };
  MUTE: boolean;
  AUDIO: {
    flowHoldMs: number;
    flowFadeInMs: number;
    flowFadeMs: number;
    loopCrossfadeMs: number;
    endcardMusicFadeMs: number;
    endcardSecondPopMs: number;
    maxEffectVoices: number;
  };
  /**
   * How the player clears sand: "tap" clears the shape tapped (Tapping Sand); "cut" clears
   * everything below a swiped line, live under the finger (Cutting Sand). Set per version by the build.
   */
  MECHANIC?: 'tap' | 'cut';
  GAME_LENGTH: {
    timeLimit: number;
    clickLimit: number;
  };
  GAME_BACKGROUND_TYPE: 'Gradient' | 'Image' | 'Color';
  GAME_BACKGROUND_COLOR: Rgb;
  GAME_BACKGROUND_COLOR_CONFIG: {
    gradientDirection: 'vertical' | 'horizontal';
    colors: Rgb[];
  };
  SHOW_PACKSHOT: boolean;
  CHANGABLE_TEXTURES: TextureSlot[];
  CHANGABLE_SOUNDTRACKS: SoundtrackSlot[];
  HAND_TUTOR_MODE: boolean;
  TUTORIAL_DELAY: number;
  /** The picture appears (OPENING_STYLE) and the buckets rise into place before play starts. */
  OPENING_GAMEPLAY_ANIMATION: boolean;
  /** How the picture appears: "reveal" (grey, turning to colour in a growing circle) or "pour" (as sand). */
  OPENING_STYLE?: 'reveal' | 'pour';
  SAND: {
    /** Grains across the picture; the picture texture is resampled to this width. */
    columns: number;
    /** Key colours for reading the picture and the colours the sand is drawn in (index + 1 = grain value). */
    palette: Rgb[];
    /** Per-grain brightness jitter, 0..1 of full range. */
    grainShade: number;
    /** Loose-grain gravity, design px/s². */
    gravity: number;
  };
  BELT: {
    /** Grains the conveyor holds at 100%. */
    capacity: number;
    /** Extra grains a full belt may still take so the funnel never stays plugged (see Conveyor.accept). */
    overflow: number;
    /** Belt speed, design px/s. */
    speed: number;
    /**
     * Soft lock (fail): while the full belt turns sand away at the funnel mouth, it must take in at
     * least stallPercent % of its capacity every stallSeconds; 0 = off.
     */
    stallSeconds?: number;
    stallPercent?: number;
  };
  BUCKETS: {
    /** The number each bucket starts at and counts down from (its real grains: see BucketRack). */
    capacity: number;
    /**
     * Per sand colour (SAND.palette order): the start numbers of the buckets each of its groups
     * stacks in its column, front first (e.g. [800, 800, 380]); the colour's sand is shared out by
     * them. Missing or empty = one bucket per group starting at `capacity`.
     */
    stacks?: number[][];
    /**
     * Bucket art slot per sand colour (same order as SAND.palette). A full bucket gets the lid
     * `<key>-lid` dropped on it, or (no lid slot) turns into `<key>-cleared`, its full, lidded art.
     */
    art: string[];
    /**
     * All the buckets (none join later) as sand colours (1 = first SAND.palette entry), front row
     * first, left to right; empty, or leaving a colour of sand without a bucket = planned from the picture.
     */
    start?: (number | number[])[];
    /**
     * The level's waves, in order: the sand colours each one plays. Only the current wave's sand can
     * be tapped or cut; the next wave starts once all of it is in buckets. Empty or missing = one
     * wave with every colour.
     */
    waves?: number[][];
    /**
     * Which waves' buckets show together (wave numbers, 1 = the first): only the buckets of the
     * current wave's group show, the rest wait hidden. Empty or missing = every bucket shows.
     */
    racks?: number[][];
  };
};

declare global {
  interface Window {
    GAME_CONFIG_DEFAULTS?: GameConfig;
    GAME_CONFIG?: Partial<GameConfig> & Record<string, unknown>;
    __CHANGEABLE_ASSETS__?: Record<string, string>;
  }
}

const FALLBACK_DEFAULTS = defaults as GameConfig;

const MIME_BY_FORMAT: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4'
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function expandDottedKeys(source: Record<string, unknown>): Record<string, unknown> {
  const expanded: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (!key.includes('.')) {
      expanded[key] = isObject(expanded[key]) && isObject(value) ? { ...(expanded[key] as object), ...value } : value;
      continue;
    }

    const parts = key.split('.');
    let cursor = expanded;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!isObject(cursor[part])) {
        cursor[part] = {};
      }
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
  }

  return expanded;
}

function mergeSlots<T extends TextureSlot | SoundtrackSlot>(defaultsArray: T[], overrides: unknown): T[] {
  if (!Array.isArray(overrides)) {
    return defaultsArray;
  }

  const result = defaultsArray.map(item => ({ ...item }));
  for (let i = 0; i < overrides.length; i++) {
    const override = overrides[i];
    if (!isObject(override)) {
      continue;
    }

    const key = String(override.uuid ?? override.spriteName ?? override.id ?? '');
    let index = -1;
    for (let j = 0; j < result.length; j++) {
      const item = result[j];
      const itemKey = 'spriteName' in item ? item.spriteName : item.id;
      if (item.uuid === key || itemKey === key) {
        index = j;
        break;
      }
    }

    if (index >= 0) {
      const merged: Record<string, unknown> = { ...result[index] };
      for (const [field, value] of Object.entries(override)) {
        const base = merged[field];
        merged[field] = isObject(base) && isObject(value) ? { ...base, ...value } : value;
      }
      result[index] = merged as T;
    }
  }

  return result;
}

function deepMerge(base: Record<string, unknown>, override: unknown): Record<string, unknown> {
  if (!isObject(override)) {
    return base;
  }

  const expanded = expandDottedKeys(override);
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(expanded)) {
    if (key === 'CHANGABLE_TEXTURES' || key === 'CHANGABLE_SOUNDTRACKS') {
      result[key] = mergeSlots((base[key] as (TextureSlot | SoundtrackSlot)[]) ?? [], value);
      continue;
    }

    const baseValue = base[key];
    result[key] = isObject(baseValue) && isObject(value) ? deepMerge(baseValue, value) : value;
  }

  return result;
}

/** A data: URI must carry the MIME type implied by the slot's `format`; other paths pass through. */
function matchesFormat(path: string, format: string): boolean {
  if (!path.startsWith('data:')) {
    return true;
  }
  const expected = MIME_BY_FORMAT[format.toLowerCase()];
  if (!expected) {
    return true;
  }
  const mime = path.slice(5, path.indexOf(';') > 0 ? path.indexOf(';') : path.indexOf(',')).toLowerCase();
  return mime === expected || (expected === 'audio/mpeg' && mime === 'audio/mp3');
}

function resolvePath(current: string, keys: string[], format: string, assets: Record<string, string>): string {
  if (current) {
    if (matchesFormat(current, format)) {
      return current;
    }
    console.warn('[Config] Asset override does not match its format; using the bundled default.', keys[0], format);
  }
  for (let i = 0; i < keys.length; i++) {
    const bundled = assets[keys[i]];
    if (bundled) {
      return bundled;
    }
  }
  return '';
}

function hydrateAssets(config: GameConfig): GameConfig {
  const assets = { ...devAssetPaths(config), ...(window.__CHANGEABLE_ASSETS__ ?? {}) };
  for (let i = 0; i < config.CHANGABLE_TEXTURES.length; i++) {
    const texture = config.CHANGABLE_TEXTURES[i];
    texture.path = resolvePath(texture.path, [texture.uuid, texture.spriteName], texture.format, assets);
  }

  for (let i = 0; i < config.CHANGABLE_SOUNDTRACKS.length; i++) {
    const soundtrack = config.CHANGABLE_SOUNDTRACKS[i];
    soundtrack.path = resolvePath(soundtrack.path, [soundtrack.uuid, soundtrack.id], soundtrack.format, assets);
  }

  return config;
}

export function getGameConfig(): GameConfig {
  const runtimeDefaults = clone(window.GAME_CONFIG_DEFAULTS ?? FALLBACK_DEFAULTS);
  const override = window.GAME_CONFIG && window.GAME_CONFIG !== window.GAME_CONFIG_DEFAULTS ? window.GAME_CONFIG : {};
  const config = hydrateAssets(deepMerge(runtimeDefaults as unknown as Record<string, unknown>, override) as unknown as GameConfig);
  // `npm run dev` only: ?mechanic=tap or ?mechanic=cut picks the version (default: projectDefaults).
  if (import.meta.env.DEV) {
    const mechanic = new URLSearchParams(window.location.search).get('mechanic');
    if (mechanic === 'tap' || mechanic === 'cut') {
      config.MECHANIC = mechanic;
    }
  }
  return config;
}

export const gameConfig = getGameConfig();

const textureSlots = new Map<string, TextureSlot>();
for (let i = 0; i < gameConfig.CHANGABLE_TEXTURES.length; i++) {
  textureSlots.set(gameConfig.CHANGABLE_TEXTURES[i].spriteName, gameConfig.CHANGABLE_TEXTURES[i]);
}

export function getTextureSlot(key: string): TextureSlot | undefined {
  return textureSlots.get(key);
}

export function getSoundtrackSlot(id: string): SoundtrackSlot | undefined {
  const list = gameConfig.CHANGABLE_SOUNDTRACKS;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id || list[i].uuid === id) {
      return list[i];
    }
  }
  return undefined;
}
