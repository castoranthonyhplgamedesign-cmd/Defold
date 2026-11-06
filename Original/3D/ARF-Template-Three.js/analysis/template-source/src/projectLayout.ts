/** Scene-specific mapping and tuning. Mechanics in game/ do not import this file. */
export type PathDefinition =
  | { kind: 'beltMesh' }
  | { kind: 'roundedRectangleFromSlots'; cornerRadius: number }
  | { kind: 'waypoints'; nodeName: string };

export const projectLayout = {
  view: {
    background: { r: 0.2627, g: 0.2588, b: 0.4039 },
    cameraHeight: 13.5,
    cameraTarget: { x: 0, y: 0, z: -8.46 },
    minimumHalfWidth: 8.8,
  },
  nodes: {
    slotPlacements: 'Conveyor Blocks',
    beltArrows: 'Conveyor Arrows',
    turretPrefix: 'Shooter Turret',
    turretBodyMesh: 'Shooter1_',
    muzzle: 'Muzzle Point',
    headMesh: 'HeadBlock1',
    bodyMesh: 'Block1',
    cornerMesh: 'CornerBlock1',
    conveyorWallMesh: 'Custom Mesh',
    conveyorBeltMesh: 'Conveyor Belt',
    tunnelMeshPrefix: 'Tunnel',
    bulletMesh: 'Icosphere',
    beltArrowSprite: 'Arrow_.png',
    headHighlight: 'OutlineSprite__0.png',
  },
  grid: {
    cellSize: 1.5,
    speed: 7.2,
    exitDirection: { x: 0, y: 0, z: -1 },
    exitScanDistance: 100,
  },
  grid2D: {
    center: { x: 0.11, z: -7.35 },
    colors: {
      '#ff0000': 'red',
      '#00ff04': 'green',
      '#eeff00': 'yellow',
      '#1100ff': 'blue',
    } as Record<string, string>,
  },
  conveyor: {
    path: { kind: 'beltMesh' } as PathDefinition,
    meshSizing: {
      slotPitchToWidth: 0.86,
      markerPitchToWidth: 1.43,
      markerWidthToBelt: 0.43,
      markerLengthToBelt: 0.255,
      blockWidthToBelt: 0.75,
    },
    // An optional fixed slotSpeed can replace the cadence match for another scene.
    slotSpeed: undefined as number | undefined,
    markerSpeed: 2.8,
    transferSeconds: 0.12,
    bulletSpeed: 38,
    blockColor: 'red',
    startEmpty: true,
  },
  shooters: {
    shotsPerTurret: 17,
    advanceSeconds: 0.55,
    counterOffset: { x: 0, y: 1.92, z: 0.65 },
    bulletHitHeight: 1.1,
    bulletScale: 0.55,
    bulletColor: '#f4f2e9',
    bulletEmissiveStrength: 0.45,
    effects: {
      burstSize: 0.31,
      burstCount: 11,
      burstDuration: 0.48,
      burstColors: {
        red: '#ff5146',
        yellow: '#ffdb24',
        green: '#1cea18',
        blue: '#15cee8',
      },
    },
  },
};
