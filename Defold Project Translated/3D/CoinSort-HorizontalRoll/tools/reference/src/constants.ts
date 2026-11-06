// Mental model: each level is a coin-only cylinder, with an interactable outer cylinder and a visual-only inner cylinder.
// User-facing "columns" are circumference lanes around the cylinder; user-facing "row segments" are lengthwise bands.
// Outer row segments rotate from drag input like revolver chambers; inner row segments never rotate or receive input.
// Outer and inner coins share one global 3D display footprint from COIN_3D_CONFIG.
// COIN_CYLINDER_CONFIG.columnDiameterScale opens or tightens the outer circumference column spacing.
// COIN_CYLINDER_CONFIG.innerColumnDiameterScale opens or tightens the inner circumference column spacing.
// COIN_CYLINDER_CONFIG.laneDepthXScale adjusts the rendered cap width without changing lane order.
// Lane slots are centered between cardinal axes by CoinCylinderLevel; no initial rotation knobs are needed.
// Inner cylinders share their level's rowSegmentCount and coinsPerRowSegment values.
// Outer and inner cylinders have separate lane counts, overlap, spacing, offsets, depth radius, alpha, and editor colors.
// Locked levels use the Lock.webp asset; lock icon size, offset, and unlock pop animation live in COIN_CYLINDER_CONFIG.
// darkenWhenNonInteractable levels fade coin material opacity down, then fade back on enable.
// Row segment indices run bottom-to-top: rowSegment 0 is the lowest band, highest index is the top band.
// Depth is lane-front-priority-first; row segment and coin stack order are small tiebreakers.
// Matched columns start clearing together; each coin pops right before flying.
// Flying coin depth can be overridden per level by display lane in COIN_FLIGHT_LANE_DEPTH_CONFIG.
// Cleared columns create empty source lanes per row segment; those empty lanes rotate with their row segment.
// The jar climbs in during column clears, becomes the flight target, then exits downward after filling.
// Jar fill coins persist while the jar appears and disappears between clear batches.
// Jar fillColumnCount is row capacity; each row uses chaotic shuffled slots, jitter, and accepted rotations.
// Level labels, label containers, and HUD dots are intentionally absent from the cylinder UI.
// Coin colors are 3D material texture choices; the number is baked into each texture.

//#region Design
export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1920;

export const STORE_URLS = {
  ios: 'https://apps.apple.com/us/app/coin-sort/id6446354191',
  android: 'https://play.google.com/store/apps/details?id=com.MoodGames.CoinSort&hl=en',
} as const;
//#endregion

//#region Depth Map
export const DEPTHS = {
  BACKGROUND: 0,
  GAME_OBJECTS: 1,
  LOGO: 17,
  DIM_OVERLAY: 20,
  FAIL_WIN_UI: 21,
  HAND_HINT: 22,
  TUTORIAL_TEXT: 23,
  ENDCARD_INPUT: 25,
} as const;
//#endregion

//#region Camera
export const CAMERA_CONFIG = {
  overviewZoom: 1.5,
  overviewTargetX: DESIGN_WIDTH / 2,
  overviewTargetY: DESIGN_HEIGHT / 2,
  focusDurationMs: 620,
  panDurationMs: 720,
  endcardZoom: 0.74,
} as const;
//#endregion

//#region Background
export const BACKGROUND_CONFIG = {
  colorTop: 0x06335d,
  colorBottom: 0x031425,
  bubbleColor: 0xd9f5ff,
  bubbleCount: 42,
} as const;
//#endregion

export type Vector3DConfig = {
  x: number;
  y: number;
  z: number;
};

export const COIN_3D_CONFIG = {
  displayWidth3D: 60,
  displayHeight3D: 60,
  rendererZIndex3D: 0,
  maxPixelRatio3D: 2,
  cameraZ3D: 10000,
  depthScale3D: 400,
  depthPositionSign3D: 1,
  renderOrderScale3D: 100000,
  modelScale3D: 0.7,
  modelRotationDegrees3D: { x: 0, y: -30, z: 0 } satisfies Vector3DConfig,
  rowSegmentSpinAxis3D: { x: 1, y: 0, z: 0 } satisfies Vector3DConfig,
  rowSegmentSpinDirection3D: 1,
  coinFaceSpinOffsetDegrees3D: -30,
  materialMetalness3D: 0.12,
  materialRoughness3D: 1.0,
  materialSpecularStrength3D: 0.25,
  inactiveMaterialTint3D: 0x161b24,
  inactiveMaterialDimAmount3D: 0.95,
  ambientLightIntensity3D: 1.5,
  directionalLightColor3D: 0xffffff,
  directionalLightIntensity3D: 5.0,
  directionalLightPosition3D: { x: -600, y: -600, z: 9000 } satisfies Vector3DConfig,
  directionalLightTargetOffset3D: { x: 2272.389, y: 2352.55, z: -8480.669 } satisfies Vector3DConfig,
  directionalLightShadowEnabled3D: true,
  directionalLightShadowMapSize3D: 2048,
  directionalLightShadowCameraMargin3D: 900,
  directionalLightShadowCameraNear3D: 0.5,
  directionalLightShadowCameraFar3D: 20000,
  directionalLightShadowBias3D: -0.00008,
  directionalLightShadowNormalBias3D: 0.02,
  lightGizmoLength3D: 220,
  lightGizmoRadius3D: 9,
  lightGizmoColor3D: 0xfff0a8,
  modelSizeFallback3D: { x: 1, y: 1, z: 1 } satisfies Vector3DConfig,
} as const;

export const COIN_DEPTH_CONFIG = {
  outerBase: DEPTHS.GAME_OBJECTS + 2,
  outerRowSegmentStep: 0.01,
  outerLaneRange: 0.45,
  innerSandwichInset: 0.18,
  coinStackStep: 0.0001,
} as const;

export const COIN_CYLINDER_CONFIG = {
  columnDiameterScale: 1.3,
  innerColumnDiameterScale: 0.8,
  laneDepthXScale: 0.6,
  frontLaneDepthDirection3D: -1,
  rowSegmentDragDirection: -1,
  lockIconSize: 110,
  lockIconYOffset: 0,
  lockIconAlpha: 0.5,
  lockPopUpDistance: 78,
  lockPopRotationDegrees: -22,
  lockPopScale: 1.16,
  lockPopMs: 180,
  lockFallDistance: 160,
  lockFallRotationDegrees: 72,
  lockFallScale: 0.88,
  lockFallMs: 320,
  visualFadeMs3D: 320,
} as const;
//#endregion

//#region Level Config
export type InnerCylinderConfig = {
  enabled: boolean;
  laneCount: number;
  coinOverlap: number;
  columnSpacingOffset: number;
  centerXOffset: number;
  centerYOffset: number;
  radiusY: number;
  depthX: number;
  alpha: number;
};

export type LevelConfig = {
  id: string;
  centerX: number;
  centerY: number;
  focusZoom: number;
  laneCount: number;
  rowSegmentCount: number;
  clearObjectiveLanes: number | null;
  coinsPerRowSegment: number;
  coinOverlap: number;
  rowSegmentSpacingOffset: number;
  darkenWhenNonInteractable: boolean;
  innerCylinder: InnerCylinderConfig;
  initialRowSegmentOffsets: readonly number[];
  colorSeed: number;
};

export const LEVEL_CONFIGS: readonly LevelConfig[] = [
  {
    id: 'level-1',
    centerX: 540,
    centerY: 500,
    focusZoom: 1.75,
    laneCount: 12,
    rowSegmentCount: 3,
    clearObjectiveLanes: 2,
    coinsPerRowSegment: 12,
    coinOverlap: 11,
    rowSegmentSpacingOffset: -15,
    darkenWhenNonInteractable: false,
    innerCylinder: {
      enabled: true,
      laneCount: 6,
      coinOverlap: 11,
      columnSpacingOffset: -15,
      centerXOffset: 0,
      centerYOffset: 0,
      radiusY: 48,
      depthX: 48,
      alpha: 1.0,
    },
    initialRowSegmentOffsets: [0, 1, 2],
    colorSeed: 0,
  },
  {
    id: 'level-2',
    centerX: 540,
    centerY: 955,
    focusZoom: 1.75,
    laneCount: 12,
    rowSegmentCount: 4,
    clearObjectiveLanes: 3,
    coinsPerRowSegment: 9,
    coinOverlap: 11,
    rowSegmentSpacingOffset: -15,
    darkenWhenNonInteractable: true,
    innerCylinder: {
      enabled: true,
      laneCount: 6,
      coinOverlap: 11,
      columnSpacingOffset: -15,
      centerXOffset: 0,
      centerYOffset: 0,
      radiusY: 48,
      depthX: 48,
      alpha: 1.0,
    },
    initialRowSegmentOffsets: [0, 1, 2, 3],
    colorSeed: 1,
  },
  {
    id: 'level-3',
    centerX: 540,
    centerY: 1410,
    focusZoom: 1.75,
    laneCount: 12,
    rowSegmentCount: 5,
    clearObjectiveLanes: null,
    coinsPerRowSegment: 7,
    coinOverlap: 11,
    rowSegmentSpacingOffset: -15,
    darkenWhenNonInteractable: true,
    innerCylinder: {
      enabled: true,
      laneCount: 6,
      coinOverlap: 11,
      columnSpacingOffset: -15,
      centerXOffset: 0,
      centerYOffset: 0,
      radiusY: 48,
      depthX: 48,
      alpha: 1.0,
    },
    initialRowSegmentOffsets: [0, 1, 2, 3, 4],
    colorSeed: 2,
  },
] as const;
//#endregion

//#region Level Editor
// Use hex strings in colorTypes so editor color swatches stay clickable.
// Each row in rowSegmentColors is one row segment/band; each color type is one lane around the cylinder.
// Inner cylinders share their level's rowSegmentCount and coinsPerRowSegment values, and all coins use COIN_3D_CONFIG.
export const LEVEL_EDITOR_CONFIG = {
  colorTypes: {
    gold: '#f8e74f',
    sky: '#6fa1ff',
    lime: '#b1f73f',
    violet: '#c853ff',
    coral: '#ff8f33',
    pink: '#ffafff',
  },
  levels: [
    {
      id: 'level-1',
      outerCylinder: {
        rowSegmentColors: [
          ['lime', 'lime', 'gold', 'gold', 'pink', 'sky', 'violet', 'coral', 'sky', 'pink', 'coral', 'violet'],
          ['sky', 'pink', 'lime', 'gold', 'lime', 'coral', 'pink', 'gold', 'sky', 'coral', 'violet', 'violet'],
          ['violet', 'sky', 'violet', 'pink', 'coral', 'lime', 'coral', 'gold', 'lime', 'pink', 'gold', 'sky'],
        ],
      },
      innerCylinder: {
        rowSegmentColors: [
          ['pink', 'coral', 'violet', 'lime', 'sky', 'gold'],
          ['violet', 'gold', 'coral', 'sky', 'pink', 'lime'],
          ['sky', 'lime', 'gold', 'pink', 'coral', 'violet'],
        ],
      },
    },
    {
      id: 'level-2',
      outerCylinder: {
        rowSegmentColors: [
          ['pink', 'coral', 'lime', 'sky', 'sky', 'violet', 'pink', 'gold', 'violet', 'coral', 'gold', 'lime'],
          ['violet', 'gold', 'lime', 'lime', 'coral', 'sky', 'pink', 'sky', 'violet', 'gold', 'pink', 'coral'],
          ['lime', 'pink', 'gold', 'sky', 'pink', 'coral', 'lime', 'violet', 'violet', 'gold', 'coral', 'sky'],
          ['lime', 'pink', 'gold', 'lime', 'coral', 'coral', 'violet', 'sky', 'sky', 'violet', 'gold', 'pink'],
        ],
      },
      innerCylinder: {
        rowSegmentColors: [
          ['gold', 'pink', 'coral', 'violet', 'lime', 'sky'],
          ['violet', 'sky', 'pink', 'gold', 'coral', 'lime'],
          ['coral', 'lime', 'gold', 'sky', 'violet', 'pink'],
          ['sky', 'coral', 'violet', 'lime', 'pink', 'gold'],
        ],
      },
    },
    {
      id: 'level-3',
      outerCylinder: {
        rowSegmentColors: [
          ['violet', 'lime', 'sky', 'sky', 'coral', 'violet', 'pink', 'coral', 'gold', 'lime', 'gold', 'pink'],
          ['lime', 'coral', 'gold', 'pink', 'violet', 'coral', 'lime', 'sky', 'violet', 'sky', 'gold', 'pink'],
          ['coral', 'sky', 'violet', 'pink', 'violet', 'gold', 'gold', 'pink', 'sky', 'coral', 'lime', 'lime'],
          ['pink', 'violet', 'lime', 'sky', 'gold', 'sky', 'coral', 'coral', 'lime', 'gold', 'violet', 'pink'],
          ['lime', 'lime', 'coral', 'violet', 'gold', 'pink', 'gold', 'coral', 'sky', 'violet', 'pink', 'sky'],
        ],
      },
      innerCylinder: {
        rowSegmentColors: [
          ['sky', 'gold', 'pink', 'coral', 'violet', 'lime'],
          ['pink', 'violet', 'sky', 'lime', 'gold', 'coral'],
          ['lime', 'coral', 'gold', 'pink', 'sky', 'violet'],
          ['coral', 'sky', 'violet', 'gold', 'lime', 'pink'],
          ['violet', 'lime', 'coral', 'sky', 'pink', 'gold'],
        ],
      },
    },
  ],
} as const;

export type CoinColorType = keyof typeof LEVEL_EDITOR_CONFIG.colorTypes;
export type CoinColorValue = CoinColorType | `#${string}`;

//#endregion

//#region Jar
export const JAR_CONFIG = {
  offsetX: 0,
  offsetY: 245,
  bodyWidth: 178,
  bodyHeight: 168,
  targetOffsetX: 0,
  targetOffsetY: -60,
  baseDepth: DEPTHS.HAND_HINT - 0.48,
  fillCoinDepth: DEPTHS.HAND_HINT - 0.42,
  bodyDepth: DEPTHS.HAND_HINT - 0.34,
  lidDepth: DEPTHS.HAND_HINT - 0.24,
  baseWidth: 130,
  baseHeight: 35,
  baseOffsetX: 0,
  baseOffsetY: 62,
  fillWidth: 116,
  fillBottomOffsetY: 50,
  fillColumnCount: 30,
  fillColumnSpacing: 5,
  fillRowGap: 11,
  fillChaosJitterX: 8,
  fillChaosJitterY: 3,
  fillChaosRowStaggerX: 8,
  fillCoinWidth3D: 50,
  fillCoinHeight3D: 50,
  fillNumberWidth3D: 15,
  fillNumberHeight3D: 15,
  fillNumberOffsetX: 5,
  fillNumberOffsetY: 0,
  fillNumberDepthOffset: 0.00005,
  fillAcceptedRotationDegrees: [218, 244, 270, 296, 322, 348],
  fillDropMs: 260,
  fillDropMouthSpreadX: 16,
  maxFillCoins: 220,
  lidWidth: 130,
  lidHeight: 38,
  lidOffsetX: 0,
  lidOffsetY: -77,
  lidOriginX: 0.18,
  lidOriginY: 0.72,
  lidOpenOffsetX: -12,
  lidOpenOffsetY: -24,
  lidOpenRotationDegrees: -48,
  lidOpenMs: 130,
  lidHoldMs: 220,
  lidCloseMs: 170,
  bottomOffscreenPadding: 110,
  appearMs: 430,
  disappearMs: 380,
} as const;
//#endregion

//#region Coin Flight
export const COIN_FLIGHT_CONFIG = {
  targetSpreadX: 58,
  targetSpreadY: 24,
  displaySize3D: 44,
  frontLaneDepth: DEPTHS.HAND_HINT - 0.35,
  backLaneDepth: DEPTHS.GAME_OBJECTS + 0.1,
} as const;

// Display lanes are the post-rotation lanes checked for matches: 0..laneCount - 1.
// Put a lane in frontLanes to fly above the whole focused level, or backLanes to fly behind it.
// Lanes not listed keep their original live render depth.
export const COIN_FLIGHT_LANE_DEPTH_CONFIG = {
  'level-1': {
    frontLanes: [6, 7, 8, 9, 10, 11],
    backLanes: [0, 1, 2, 3, 4, 5],
  },
  'level-2': {
    frontLanes: [6, 7, 8, 9, 10, 11],
    backLanes: [0, 1, 2, 3, 4, 5],
  },
  'level-3': {
    frontLanes: [6, 7, 8, 9, 10, 11],
    backLanes: [0, 1, 2, 3, 4, 5],
  },
} as const;

export const FLIGHT_LANE_DEBUG_CONFIG = {
  depth: DEPTHS.ENDCARD_INPUT - 1,
  fontSize: 34,
  strokeThickness: 7,
  offsetY: -42,
  frontColor: '#55f6ff',
  backColor: '#ff9a45',
  defaultColor: '#ffffff',
  strokeColor: '#00101f',
  backgroundColor: 'rgba(0, 9, 22, 0.72)',
} as const;
//#endregion

//#region Timing
export const TIMING = {
  rowSegmentSnapMs: 180,
  clearLaneDelayMs: 90,
  clearCoinDelayMs: 42,
  clearCoinPopMs: 130,
  clearCoinPopRightDistance: 34,
  clearCoinPopRightStackSpread: 1.2,
  clearCoinFadeMs: 90,
  flyCoinMs: 430,
  flyCoinShrinkMs: 120,
} as const;
//#endregion

//#region UI
export const HAND_HINT_CONFIG = {
  targetLevelIndex: 0,
  size: 180,
  offsetX: 190,
  offsetY: 180,
  rotationDegrees: 0,
  alpha: 0.96,
  entryScale: 1.5,
  activeScale: 1,
  exitScale: 1.5,
  entryMs: 260,
  exitMs: 260,
  loopPauseMs: 420,
  tapBackRotationDegrees: 18,
  tapForwardRotationDegrees: -10,
  tapRotateBackMs: 230,
  tapBackPauseMs: 130,
  tapRotateForwardMs: 320,
  tapForwardPauseMs: 360,
  rowGestureLevelIndex: 0,
  rowGestureSegmentIndex: 0,
  rowGestureOffsetX: 125,
  rowGestureOffsetY: 98,
  rowGestureSlideOffsetX: 0,
  rowGestureSlideOffsetY: 150,
  rowGestureRotationDegrees: 0,
  rowGestureSlideMs: 760,
  rowGestureSlidePauseMs: 300,
  rowGestureReturnDelayMs: 220,
  fadeOutMs: 220,
} as const;

export const TUTORIAL_TEXT_CONFIG = {
  levelIndex: 0,
  offsetY: -170,
  maxWidth: 1060,
  sidePadding: 34,
  topPadding: 20,
  levelGap: 14,
  fontSize: 55,
  minFontSize: 34,
  strokeThickness: 15,
  glowBlur: 14,
  fadeMs: 220,
  color: '#ffffff',
  strokeColor: '#04213f',
  glowColor: '#0b4f9b',
} as const;

export const UI_CONFIG = {
  titleX: DESIGN_WIDTH / 2,
  titleY: 112,
  titleFontSize: 72,
  endcardIconX: DESIGN_WIDTH / 2,
  endcardIconY: DESIGN_HEIGHT / 2,
  endcardIconMaxWidth: 940,
  endcardIconMaxHeight: 560,
  endcardIconViewportWidthRatio: 0.9,
  endcardIconViewportHeightRatio: 0.36,
  endcardBackdropColor: 0x031425,
  endcardBackdropAlpha: 0.48,
  endcardFadeMs: 420,
  endcardAutoRedirectDelayMs: 0,
} as const;
//#endregion
