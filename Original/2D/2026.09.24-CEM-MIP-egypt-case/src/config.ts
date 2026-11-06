import defaultsJson from './projectDefaults.json';
import { bundledAssets } from './assetUrls';
import type { GameConfig, SoundtrackConfig, TextureConfig } from './types';

declare global {
  interface Window {
    GAME_CONFIG_DEFAULTS?: GameConfig;
    GAME_CONFIG?: Partial<GameConfig>;
    __CHANGEABLE_ASSETS__?: Record<string, string>;
  }
}

const defaults = defaultsJson as GameConfig;

function expandDottedKeys(source: Record<string, unknown>): Record<string, unknown> {
  const expanded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (!key.includes('.')) {
      expanded[key] = value;
      continue;
    }
    const parts = key.split('.');
    let cursor = expanded;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      cursor[part] = (cursor[part] as Record<string, unknown> | undefined) ?? {};
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return expanded;
}

function merge(base: unknown, override: unknown): unknown {
  if (override === undefined) return structuredClone(base);
  if (Array.isArray(base)) return structuredClone(override);
  if (base && override && typeof base === 'object' && typeof override === 'object') {
    const result = structuredClone(base) as Record<string, unknown>;
    const expanded = expandDottedKeys(override as Record<string, unknown>);
    for (const [key, value] of Object.entries(expanded)) result[key] = merge(result[key], value);
    return result;
  }
  return structuredClone(override);
}

function mergeTextures(base: TextureConfig[], overrides: TextureConfig[] | undefined): TextureConfig[] {
  if (!overrides) return base;
  const result = base.map((item) => structuredClone(item));
  for (const incoming of overrides) {
    const index = result.findIndex((item) => item.uuid === incoming.uuid || item.spriteName === incoming.spriteName);
    if (index >= 0) result[index] = merge(result[index], incoming) as TextureConfig;
    else result.push(structuredClone(incoming));
  }
  return result;
}

function mergeSoundtracks(base: SoundtrackConfig[], overrides: SoundtrackConfig[] | undefined): SoundtrackConfig[] {
  if (!overrides) return base;
  const result = base.map((item) => structuredClone(item));
  for (const incoming of overrides) {
    const index = result.findIndex((item) => item.uuid === incoming.uuid || item.id === incoming.id);
    if (index >= 0) result[index] = merge(result[index], incoming) as SoundtrackConfig;
    else result.push(structuredClone(incoming));
  }
  return result;
}

export function resolveConfig(): GameConfig {
  const builtDefaults = window.GAME_CONFIG_DEFAULTS ?? defaults;
  const supplied = window.GAME_CONFIG ?? {};
  const resolved = merge(builtDefaults, supplied) as GameConfig;
  resolved.CHANGABLE_TEXTURES = mergeTextures(builtDefaults.CHANGABLE_TEXTURES, supplied.CHANGABLE_TEXTURES as TextureConfig[] | undefined);
  resolved.CHANGABLE_SOUNDTRACKS = mergeSoundtracks(builtDefaults.CHANGABLE_SOUNDTRACKS, supplied.CHANGABLE_SOUNDTRACKS as SoundtrackConfig[] | undefined);
  const payloads = window.__CHANGEABLE_ASSETS__ ?? bundledAssets;
  for (const texture of resolved.CHANGABLE_TEXTURES) {
    if (!texture.path) texture.path = payloads[texture.uuid] ?? payloads[texture.spriteName] ?? bundledAssets[texture.uuid] ?? '';
    if (texture.format.toLowerCase() !== 'webp' && texture.path.startsWith('data:image/webp')) texture.format = 'webp';
  }
  for (const soundtrack of resolved.CHANGABLE_SOUNDTRACKS) {
    if (!soundtrack.path) soundtrack.path = payloads[soundtrack.uuid] ?? payloads[soundtrack.id] ?? bundledAssets[soundtrack.uuid] ?? '';
    if (soundtrack.format.toLowerCase() !== 'mp3' && soundtrack.path.startsWith('data:audio/mpeg')) soundtrack.format = 'mp3';
  }
  window.GAME_CONFIG = resolved;
  return resolved;
}
