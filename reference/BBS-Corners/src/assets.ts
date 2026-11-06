// Import final playable assets here so Vite can inline or bundle them.
// Do not reference local assets through raw HTML src/href paths.

import appIconUrl from './assets/app_icon.png';
import bgmUrl from './assets/bgm_compressed.mp3';
import boardBaseTextureUrl from './assets/board_base_texture.png';
import crumpleSfxUrl from './assets/crumple_compressed.wav';
import dragSfxUrl from './assets/drag_compressed.wav';
import dropSfxUrl from './assets/drop_compressed.wav';
import handPointerUrl from './assets/optimized/hand_pointer_152.webp';
import playNowUrl from './assets/optimized/playnowbutton_604.webp';

export const ASSETS = {
  ui: {
    appIcon: appIconUrl,
    handPointer: handPointerUrl,
    playNow: playNowUrl,
  },
  models: {},
  textures: {
    boardBase: boardBaseTextureUrl,
  },
  audio: {
    bgm: bgmUrl,
    crumple: crumpleSfxUrl,
    drag: dragSfxUrl,
    drop: dropSfxUrl,
  },
} as const;
