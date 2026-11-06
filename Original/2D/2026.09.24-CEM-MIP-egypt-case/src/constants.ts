export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1920;

export const DEPTH = {
  BACKGROUND: 0,
  PANELS: 1,
  DROP_TARGETS: 3,
  CHARACTERS: 6,
  DRAGGING: 10,
  CLUES: 12,
  TUTORIAL_OVERLAY: 15,
  TUTORIAL_GHOSTS: 16,
  TUTORIAL_PROMPT: 17,
  TUTORIAL_HAND: 18,
  ERROR: 21,
  OVERLAY: 20,
  LOGO: 22,
} as const;

export const CHARACTER_ORDER = ['Aisha', 'Maya', 'Ahmose', 'Nefertiti', 'Merneptah', 'Khasekhemwy'] as const;
