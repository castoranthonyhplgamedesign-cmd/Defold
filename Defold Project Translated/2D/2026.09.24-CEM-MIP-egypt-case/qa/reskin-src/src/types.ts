export type CharacterName = 'Tia' | 'Nebet' | 'Nakht' | 'Merit' | 'Huy' | 'Senen';

export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }
export interface TextureConfig {
  spriteName: string;
  path: string;
  originalSize: { width: number; height: number };
  format: string;
  uuid: string;
  resizeBlocked: boolean;
  anchorPoint: Point;
  scale: number;
}
export interface SoundtrackConfig {
  id: string;
  path: string;
  volume: number;
  loop: boolean;
  format: string;
  uuid: string;
}
export interface GameConfig {
  APP_LINKS: { app_store: string; google_play: string };
  MUTE: boolean;
  GAME_LENGTH: { timeLimit: number; clickLimit: number };
  GAME_BACKGROUND_TYPE: 'Color' | 'Image' | 'Gradient';
  GAME_BACKGROUND_COLOR: [number, number, number];
  SHOW_PACKSHOT: boolean;
  HAND_TUTOR_MODE: boolean;
  TUTORIAL_DELAY: number;
  TUTORIAL: {
    openingCharacter: CharacterName;
    overlayAlpha: number;
    ghostAlpha: number;
    handWidth: number;
    pressScale: number;
    stepDelayMs: number;
    moveMs: number;
    fadeMs: number;
    highlightPaddingX: number;
    highlightPaddingY: number;
  };
  LOGO_WIDTH: number;
  LAYOUT: { map: Rect; characters: Rect; clues: Rect };
  CHARACTER_HOME_Y: number;
  CHARACTER_LIST_MARGIN_X: number;
  CHARACTER_HEIGHT: number;
  PLACED_CHARACTER_HEIGHT: number;
  DROP_CIRCLE_SIZE: number;
  DROP_RADIUS: number;
  DROP_POSITIONS: Record<CharacterName, Point>;
  CLUE_TITLE: string;
  CLUE_LAYOUT: {
    titleFontSize: number;
    clueFontSize: number;
    titleY: number;
    clueYPositions: [number, number, number, number, number, number];
  };
  CLUES: { character: CharacterName; text: string }[];
  COLORS: { title: string; clue: string; strike: string; overlay: string };
  TIMING: Record<'snapMs' | 'returnMs' | 'errorBlinkMs' | 'dropCircleSpinMs' | 'completionDelayMs' | 'overlayFadeMs' | 'logoFadeMs' | 'logoScaleMs' | 'logoPulseMs', number>;
  CHANGABLE_TEXTURES: TextureConfig[];
  CHANGABLE_SOUNDTRACKS: SoundtrackConfig[];
}
