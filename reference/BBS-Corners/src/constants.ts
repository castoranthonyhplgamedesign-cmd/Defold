import type { BrickColor } from './data/colors';

export type NetworkTag = 'dev' | 'al' | 'gg' | 'is' | 'mtg' | 'fb' | 'un' | 'vu' | 'mo' | 'tt';
export type IterationKey = 'full' | '4clicks' | '30seconds';
export type HeaderVariantKey = 'v1' | 'v2';
export type Vec3Constant = readonly [number, number, number];

const WARM_LIGHT_COLOR = [1, 0.9568627451, 0.8392156863] as const;
const WHITE_LIGHT_COLOR = [.8, .8, .8] as const;
const SOFT_SPECULAR_LIGHT_COLOR = [0.7, 0.7, 0.7] as const;

export const ACTIVE_NETWORK = __NETWORK__;
export const ACTIVE_ITERATION = __ITERATION__;
export const ACTIVE_HEADER_VARIANT = __HEADER_VARIANT__;

export const ITERATION_DISPLAY_NAMES: Record<IterationKey, string> = {
  full: 'Full',
  '4clicks': '4 Clicks',
  '30seconds': '30 Seconds',
} as const;

export const NETWORK_DISPLAY_NAMES: Record<NetworkTag, string> = {
  dev: 'Dev',
  al: 'Applovin',
  gg: 'Google',
  is: 'Ironsource',
  mtg: 'Mintegral',
  fb: 'Facebook',
  un: 'Unity',
  vu: 'Vungle',
  mo: 'Moloco',
  tt: 'TikTok',
} as const;

export const HEADER_VARIANT_DISPLAY_NAMES: Record<HeaderVariantKey, string> = {
  v1: 'Variant 1',
  v2: 'Variant 2',
} as const;

export function getPlayableTitle(
  iteration = ACTIVE_ITERATION,
  network = ACTIVE_NETWORK,
  variant = ACTIVE_HEADER_VARIANT,
): string {
  return `BBS Wide U - ${ITERATION_DISPLAY_NAMES[iteration]} - ${HEADER_VARIANT_DISPLAY_NAMES[variant]} - ${NETWORK_DISPLAY_NAMES[network]}`;
}

export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1920;

export const STORE_URLS = {
  ios: 'https://apps.apple.com/us/app/block-buster-no-timer/id6745272388',
  android: 'https://play.google.com/store/apps/details?id=com.block.away',
};

export const CAMERA_FIT = {
  baseOrthoSize: 7,
  phoneReferenceAspect: 0.5625,
  tabletReferenceAspect: 0.75,
  tabletAspectThreshold: 0.65,
  minOrthoSize: 8.75,
  maxOrthoSize: 11.6,
  tabletMinOrthoSize: 8.75,
  tabletMaxOrthoSize: 10.4,
  landscapeFitByHeight: true,
  tallPhoneAspectThreshold: 0.52,
};

export const CAMERA_VIEW = {
  position: [0, 15.55, -6.65],
  target: [0, 0, 0.15],
  phonePortraitTarget: [0, 0, -0.95],
} as const;

export const SCENE_COLOR_CONFIG = {
  backgroundHex: '#cde1f1',
} as const;

export const SCENE_LIGHTING = {
  hemispheric: {
    direction: [0.68, 0.86, -0.36],
    intensity: 0.64,
    diffuseColor: WHITE_LIGHT_COLOR,
    groundColor: WARM_LIGHT_COLOR,
    specularColor: SOFT_SPECULAR_LIGHT_COLOR,
  },
  directional: {
    enabled: true,
    direction: [0.68, -0.62, -0.40],
    intensity: 0.3,
    diffuseColor: WHITE_LIGHT_COLOR,
    specularColor: SOFT_SPECULAR_LIGHT_COLOR,
  },
  softFillDirectional: {
    enabled: true,
    direction: [0.48, -0.80, -0.42],
    intensity: 0.35,
    diffuseColor: WHITE_LIGHT_COLOR,
    specularColor: SOFT_SPECULAR_LIGHT_COLOR,
  },
  highlightDirectional: {
    enabled: true,
    direction: [0.6, -0.46, -0.42],
    intensity: .36,
    diffuseColor: WHITE_LIGHT_COLOR,
    specularColor: WHITE_LIGHT_COLOR,
  },
  northDirectional: {
    enabled: true,
    direction: [0, -1, 0],
    intensity: .05,
    diffuseColor: WHITE_LIGHT_COLOR,
    specularColor: SOFT_SPECULAR_LIGHT_COLOR,
  },
  southDirectional: {
    enabled: false,
    direction: [-0.68, -0.62, 0.40],
    intensity: 0.15,
    diffuseColor: WHITE_LIGHT_COLOR,
    specularColor: SOFT_SPECULAR_LIGHT_COLOR,
  },
} as const;

export const MATERIAL_LIGHTING_CONFIG = {
  emissiveScale: 0.028,
  specularColor: [0.36, 0.34, 0.31],
  specularPower: 58,
  roughness: 0.18,
  maxSimultaneousLights: 6,
  blockGloss: {
    specularScale: 1.72,
    specularPowerScale: 1.68,
    roughness: 0.048,
  },
  whiteMaterial: {
    diffuseScale: 0.96,
    emissiveScale: 0.024,
    specularScale: 0.26,
  },
  coloredLongMaterial: {
    diffuseScale: 0.92,
    saturationBoost: 1.28,
    emissiveScale: 0.018,
    specularTintTowardWhite: 0.18,
    specularScale: 0.46,
    specularPowerScale: 1.8,
  },
  rimFresnel: {
    enabled: false,
    edgeColor: [0.014, 0.014, 0.016],
    centerColor: [0, 0, 0],
    bias: 0.014,
    power: 3.1,
  },
} as const;

export const BOARD_MATERIAL_CONFIG = {
  baseTintHex: '#ffffff',
  borderHex: '#303195',
} as const;

export const BLOCK_VISUAL_CONFIG = {
  tileShort: {
    scale: [0.953, 1.342, 0.953],
  },
  tileLong: {
    scale: [0.932, 1.326, 0.956],
  },
} as const satisfies Record<'tileShort' | 'tileLong', { scale: Vec3Constant }>;

export const GATE_VISUAL_CONFIG = {
  Red: {
    position: [-3, 0, 7.67],
    scale: [1.05, 1.05, 1.05],
    vfxPosition: [-3, 0.55, 7.99],
  },
  Orange: {
    position: [-2, 0, 7.67],
    scale: [1.05, 1.05, 1.05],
    vfxPosition: [-2, 0.55, 7.99],
  },
  Yellow: {
    position: [-1, 0, 7.67],
    scale: [1.05, 1.05, 1.05],
    vfxPosition: [-1, 0.55, 7.99],
  },
  Green: {
    position: [0, 0, 7.67],
    scale: [1.05, 1.05, 1.05],
    vfxPosition: [0, 0.55, 7.99],
  },
  Blue: {
    position: [1, 0, 7.67],
    scale: [1.05, 1.05, 1.05],
    vfxPosition: [1, 0.55, 7.99],
  },
  Purple: {
    position: [2, 0, 7.67],
    scale: [1.05, 1.05, 1.05],
    vfxPosition: [2, 0.55, 7.99],
  },
  Pink: {
    position: [3, 0, 7.67],
    scale: [1.05, 1.05, 1.05],
    vfxPosition: [3, 0.55, 7.99],
  },
  Black: {
    position: [3.7, 0, 2],
    scale: [1, 0.98, 1],
    vfxPosition: [4.18, 0.55, 2],
  },
  White: {
    position: [-3.71, 0, 1],
    scale: [1, 0.98, 1],
    vfxPosition: [-4.18, 0.55, 1],
  },
} as const satisfies Record<BrickColor, {
  position: Vec3Constant;
  scale: Vec3Constant;
  vfxPosition: Vec3Constant;
}>;

export const CONTACT_SHADOW_CONFIG = {
  enabled: true,
  colorHex: '#000000',
  bricks: {
    y: 0.018,
    alpha: 0.05,
    padding: 0.14,
    offset: [0.045, 0, -0.045],
  },
  gates: {
    y: 0.016,
    alpha: 0.08,
    width: 0.82,
    depth: 0.3,
    offset: [0.035, 0, -0.035],
  },
} as const;

export const SUBMISSION_VFX_CONFIG = {
  enabled: true,
  particleCount: 15,
  durationMs: 2000,
  emissionDurationMs: 450,
  particleLifetimeMs: 1700,
  coneAngleDeg: 0,
  originOffset: [0, -0.08, 0],
  emitterForwardOffset: -0.28,
  emitterHalfWidth: 0.54,
  startSpeed: 4.5,
  lateralSpeed: 0.1,
  upwardSpeed: 0,
  gravityY: 0,
  meshScale: [0.42, 0.42, 0.42],
  minAspect: 0.72,
  maxAspect: 1.42,
  startScale: .8,
  endScale: 0,
  startAlpha: 1,
  endAlpha: 0,
} as const;

export const GATE_GRINDER_CONFIG = {
  enabled: true,
  toothCount: 10,
  toothRows: 5,
  toothBlockSize: [0.12, 0.12, 0.16],
  toothOutset: 0.015,
  spinAxis: 'z',
  durationMs: 500,
  spinTurns: 6,
  spinPulseScale: 1.08,
  bodyHex: '#d8d8d0',
} as const satisfies {
  enabled: boolean;
  toothCount: number;
  toothRows: number;
  toothBlockSize: Vec3Constant;
  toothOutset: number;
  spinAxis: 'x' | 'y' | 'z';
  durationMs: number;
  spinTurns: number;
  spinPulseScale: number;
  bodyHex: string;
};

export const ABSORB_ANIMATION_CONFIG = {
  durationMs: 400,
  endScale: [0.5, 0.5, 0.5],
  endpointForwardOffset: .3,
} as const;

export const AUDIO_CONFIG = {
  enabled: true,
  bgmVolume: 0.2,
  dragVolume: 1,
  dropVolume: 1,
  gateSubmitVolume: 1,
  gateSubmitMaxDurationSeconds: 0.8,
} as const;

export const HAND_POINTER_CONFIG = {
  widthPx: 76,
  heightPx: 87,
  anchorPx: [10, 10],
  screenOffsetPx: [4, 25],
  worldY: 0.95,
  rotateWithDirection: false,
  baseRotationDeg: 0,
  animationDurationSeconds: 1.25,
  startScale: 0.7,
  endScale: 0.76,
  smartScale: {
    enabled: true,
    referenceCellSizePx: 48,
    minScale: 0.3,
    maxScale: 1.6,
  },
} as const;

export const FOOTER_UI_CONFIG = {
  portrait: {
    heightPx: 98,
    paddingPx: [0, 11, 0, 7],
    smartScale: {
      enabled: true,
      referenceShortSidePx: 390,
      minScale: 1,
      maxScale: 1.75,
    },
    appIcon: {
      aspectRatio: 320 / 200,
      heightRatio: 45 / 60,
    },
    playNow: {
      aspectRatio: 1324 / 470,
      heightRatio: 35 / 60,
    },
  },
  landscape: {
    heightPx: 72,
    paddingPx: [0, 16, 0, 12],
    smartScale: {
      enabled: true,
      referenceShortSidePx: 390,
      minScale: 1,
      maxScale: 1.35,
    },
    appIcon: {
      aspectRatio: 320 / 200,
      heightRatio: 49 / 60,
    },
    playNow: {
      aspectRatio: 1324 / 470,
      heightRatio: 38 / 60,
    },
  },
} as const;

export const HEADER_CONFIG = {
  portrait: {
    heightPx: 58,
    safeAreaTopFallbackPx: 35,
    paddingPx: [0, 18, 0, 18],
    fontSizePx: 24,
    smartScale: {
      enabled: true,
      referenceShortSidePx: 390,
      minScale: 0.82,
      maxScale: 1.45,
    },
  },
  landscape: {
    heightPx: 46,
    safeAreaTopFallbackPx: 0,
    paddingPx: [0, 18, 0, 18],
    fontSizePx: 20,
    smartScale: {
      enabled: true,
      referenceShortSidePx: 390,
      minScale: 0.8,
      maxScale: 1.25,
    },
  },
} as const;

export const HINT_CONFIG = {
  firstDelaySeconds: 0,
  delaySeconds: 6,
  loopDelaySeconds: 1,
  visibleSeconds: 1.35,
  minMoveDistance: 0.65,
  distancePerFreeCell: 0.75,
  maxMoveDistance: 1.6,
  moveCheckCells: 4,
  routeCheckCells: 12,
  restartAfterInputDelay: 6,
  reverseMemoryTurns: 3,
};
