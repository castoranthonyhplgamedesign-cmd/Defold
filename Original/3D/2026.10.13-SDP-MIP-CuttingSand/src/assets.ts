import type { GameConfig } from './config';

const DEV_ROOT = '/Assets/Runtime';

/**
 * Dev-server file paths for every configured slot. Built playables get their bytes from
 * window.__CHANGEABLE_ASSETS__ (injected by build-all), so this map is empty in production and
 * the bundle carries no asset paths.
 */
export function devAssetPaths(config: Pick<GameConfig, 'CHANGABLE_TEXTURES' | 'CHANGABLE_SOUNDTRACKS'>): Record<string, string> {
  const paths: Record<string, string> = {};
  if (!import.meta.env.DEV) {
    return paths;
  }

  for (let i = 0; i < config.CHANGABLE_TEXTURES.length; i++) {
    const texture = config.CHANGABLE_TEXTURES[i];
    paths[texture.uuid] = `${DEV_ROOT}/images/${texture.uuid}.${texture.format}`;
  }
  for (let i = 0; i < config.CHANGABLE_SOUNDTRACKS.length; i++) {
    const sound = config.CHANGABLE_SOUNDTRACKS[i];
    paths[sound.uuid] = `${DEV_ROOT}/audio/${sound.uuid}.${sound.format}`;
  }
  return paths;
}

/** Textures drawn at runtime (no slice exists for these). */
export const FX_TEXTURES = {
  /** Outline ring (tap shockwave, hint target). */
  RING: 'fx-ring',
  /** Soft round glow (impact flash). */
  GLOW: 'fx-glow',
  /** Prefix of the praise-word textures (one per word, drawn on first use). */
  PRAISE: 'fx-praise-',
  /** Canvas the sand grid and falling grains are drawn into. */
  SAND: 'fx-sand'
} as const;
