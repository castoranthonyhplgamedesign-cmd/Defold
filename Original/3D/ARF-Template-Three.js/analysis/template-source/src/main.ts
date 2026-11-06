import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3, Quaternion, Matrix } from '@babylonjs/core/Maths/math.vector';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import '@babylonjs/loaders/glTF/glTFFileLoader';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import { ConveyorSystem, type ConveyorMarker, type TurretLane, type TurretUnit } from './game/conveyor';
import { ArrowGrid, type GridPart } from './game/arrowGrid';
import { RoundedRectanglePath, WaypointLoopPath, type ConveyorPath } from './game/conveyorPath';
import { inferBeltMeshPath } from './game/beltMeshPath';
import { findArrowGroups, findNode, type LayoutNode, type Vec } from './layout/unityLayout';
import { mapArrowGrid2D, type ArrowGrid2DLayout, type MappedArrow } from './layout/arrowGrid2D';
import { projectLayout } from './projectLayout';
import layout from '../Assets/3D World Assets/Arrow Flow 3D Scene_Layout.json';
import grid2D from '../New-Arrow-Flow-Arrow-Grid-Test-layout.json';
import blockModel from './models/AnimatedBlocks_.glb?url';
import shooterModel from './models/Shooter_v3_.glb?url';
import tunnelModel from './models/Tunnel_v3_.glb?url';
import conveyorModel from './models/Conveyor_Custom_Mesh.glb?url';
import bulletModel from './models/Bullet_.glb?url';
import redTexture from './textures/red.webp?url';
import yellowTexture from './textures/yellow.webp?url';
import greenTexture from './textures/green.webp?url';
import blueTexture from './textures/blue.webp?url';
import tunnelTexture from './textures/tunnel.webp?url';
import arrowMarkerTexture from './textures/arrow-marker.webp?url';
import headOutlineTexture from './textures/head-outline.webp?url';
import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#renderCanvas')!;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false }, true);
const scene = new Scene(engine);
scene.useRightHandedSystem = true;
scene.clearColor = new Color4(projectLayout.view.background.r,
  projectLayout.view.background.g, projectLayout.view.background.b, 1);

const unityPosition = (v: Vec) => new Vector3(v.x, v.y, -v.z);
const rad = (degrees: number) => degrees * Math.PI / 180;
const unityRotation = (v: Vec) => Quaternion.RotationYawPitchRoll(rad(-v.y), rad(v.x), rad(-v.z));

function material(name: string, color: Color3, textureUrl?: string, invertY = true) {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = color;
  result.specularColor = new Color3(0.1, 0.1, 0.1);
  if (textureUrl) result.diffuseTexture = new Texture(textureUrl, scene, false, invertY);
  return result;
}

const red = material('Red Arrow Variant', Color3.White(), redTexture, false);
red.specularColor = new Color3(0.27, 0.27, 0.27);
red.specularPower = 300;
const yellow = material('Yellow Arrow Variant', Color3.White(), yellowTexture, false);
yellow.specularColor.copyFrom(red.specularColor);
yellow.specularPower = red.specularPower;
const green = material('Green Arrow Variant', Color3.White(), greenTexture, false);
green.specularColor.copyFrom(red.specularColor);
green.specularPower = red.specularPower;
const blue = material('Blue Arrow Variant', Color3.White(), blueTexture, false);
blue.specularColor.copyFrom(red.specularColor);
blue.specularPower = red.specularPower;
const blockMaterials = new Map([['red', red], ['yellow', yellow], ['green', green], ['blue', blue]]);
const tunnel = material('Tunnel', Color3.White(), tunnelTexture, false);
const bulletMaterial = material('Pale turret bullet',
  Color3.FromHexString(projectLayout.shooters.bulletColor));
bulletMaterial.emissiveColor = bulletMaterial.diffuseColor.scale(
  projectLayout.shooters.bulletEmissiveStrength);
bulletMaterial.specularColor = new Color3(0.65, 0.65, 0.65);
bulletMaterial.specularPower = 96;
const conveyor = material('Conveyor Wall', new Color3(0.69, 0.77, 0.91));
const conveyorBelt = material('Conveyor Belt', Color3.FromHexString('#3B3F74'));
conveyorBelt.disableLighting = true;
conveyorBelt.emissiveColor = Color3.FromHexString('#3B3F74');
conveyorBelt.specularColor = Color3.Black();
const belt = material('Unity belt sprites', new Color3(0.23, 0.25, 0.45));
belt.disableLighting = true;
belt.emissiveColor = new Color3(0.23, 0.25, 0.45);
const arrowMarker = material('Unity Arrow sprite', Color3.White(), arrowMarkerTexture);
const headOutline = material('Unity Outline sprite', Color3.White(), headOutlineTexture, false);
for (const spriteMaterial of [arrowMarker, headOutline]) {
  spriteMaterial.diffuseTexture!.hasAlpha = true;
  spriteMaterial.useAlphaFromDiffuseTexture = true;
  spriteMaterial.disableLighting = true;
  spriteMaterial.emissiveColor = Color3.White();
  spriteMaterial.backFaceCulling = false;
}

const cameraNode = (layout.sceneObjects as LayoutNode[]).find((node) => node.type === 'Camera')!;
const camera = new FreeCamera('Unity Main Camera', unityPosition(cameraNode.position), scene);
camera.position.y = projectLayout.view.cameraHeight;
camera.setTarget(new Vector3(projectLayout.view.cameraTarget.x,
  projectLayout.view.cameraTarget.y, projectLayout.view.cameraTarget.z));
camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
camera.minZ = 0.1;
camera.maxZ = 1000;
scene.activeCamera = camera;
function resize() {
  engine.resize();
  const aspect = engine.getRenderWidth() / engine.getRenderHeight();
  const halfHeight = Math.max(cameraNode.orthographicSize ?? 16, projectLayout.view.minimumHalfWidth / aspect);
  camera.orthoTop = halfHeight;
  camera.orthoBottom = -halfHeight;
  camera.orthoLeft = -halfHeight * aspect;
  camera.orthoRight = halfHeight * aspect;
}
window.addEventListener('resize', resize);
resize();

const lightNode = (layout.sceneObjects as LayoutNode[]).find((node) => node.type === 'Light')!;
const light = new DirectionalLight('Unity Directional Light', new Vector3(0, -0.95, -0.32), scene);
light.diffuse = new Color3(1, 0.9569, 0.8392);
light.intensity = lightNode.intensity ?? 1;
const ambient = new HemisphericLight('Unity ambient sky', new Vector3(0, 1, 0), scene);
ambient.diffuse = new Color3(0.212, 0.227, 0.259);
ambient.groundColor = new Color3(0.047, 0.043, 0.035);
ambient.intensity = 1;

const templates = new Map<string, Mesh>();
async function loadModel(url: string) {
  const result = await SceneLoader.ImportMeshAsync('', '', url, scene, undefined, '.glb');
  for (const group of result.animationGroups) {
    group.stop();
    group.dispose();
  }
  for (const mesh of result.meshes) {
    if (mesh instanceof Mesh && mesh.geometry) templates.set(mesh.name, mesh);
  }
  return result.meshes;
}

function createSprite(node: LayoutNode) {
  const color = node.color ?? { r: 1, g: 1, b: 1, a: 1 };
  let width: number;
  let height: number;
  let spriteMaterial: StandardMaterial;
  if (node.sprite === projectLayout.nodes.beltArrowSprite) {
    width = 10.24 * node.lossyScale.x;
    height = 6.1 * node.lossyScale.y;
    spriteMaterial = arrowMarker;
  } else if (node.sprite === projectLayout.nodes.headHighlight) {
    width = 10.24 * node.lossyScale.x;
    height = 8.7 * node.lossyScale.y;
    spriteMaterial = headOutline;
  } else if (node.sprite === 'Square.png' || node.sprite === 'Circle.png') {
    width = node.boundsSize?.x ?? 1;
    height = node.boundsSize?.z ?? 1;
    spriteMaterial = belt;
  } else {
    return;
  }
  const sprite = node.sprite === 'Circle.png'
    ? MeshBuilder.CreateDisc(node.name, { radius: width / 2, tessellation: 32, sideOrientation: Mesh.DOUBLESIDE }, scene)
    : MeshBuilder.CreatePlane(node.name, { width, height, sideOrientation: Mesh.DOUBLESIDE }, scene);
  sprite.position.copyFrom(unityPosition(node.position));
  if (node.sprite === projectLayout.nodes.headHighlight) sprite.position.y += 0.12;
  sprite.rotationQuaternion = unityRotation(node.worldEulerAngles);
  sprite.material = spriteMaterial;
  sprite.isPickable = false;
  if (spriteMaterial === belt) {
    const tinted = belt.clone(node.name + ' tint');
    tinted.diffuseColor = new Color3(color.r, color.g, color.b);
    tinted.emissiveColor = new Color3(color.r, color.g, color.b);
    sprite.material = tinted;
  }
  return sprite;
}

const turretGroups: { unit: TurretUnit; parent: LayoutNode }[] = [];
const gridMeshes = new Map<LayoutNode, Mesh>();
let conveyorBeltInstance: Mesh | null = null;
let conveyorSources: Mesh[] = [];
let conveyorBeltSource: Mesh | null = null;
function createFromNode(node: LayoutNode, parentTurret?: TurretUnit, parent?: LayoutNode) {
  // Conveyor blocks are created by ConveyorSystem so they can move as reusable slots.
  if (node.name === projectLayout.nodes.slotPlacements || node.name === projectLayout.nodes.beltArrows) return;
  let turret = parentTurret;
  if (node.type === 'GameObject' && node.name.startsWith(projectLayout.nodes.turretPrefix)) {
    const color = node.blockColor ?? projectLayout.conveyor.blockColor;
    if (!blockMaterials.has(color)) throw new Error(`Missing turret material for ${color}`);
    turret = { color,
      meshes: [], bodyPosition: Vector3.Zero(), muzzlePosition: Vector3.Zero() };
    turretGroups.push({ unit: turret, parent: parent ?? node });
  }
  if (turret && node.name === projectLayout.nodes.muzzle) turret.muzzlePosition.copyFrom(unityPosition(node.position));
  if (node.mesh) {
    const sources = node.mesh === projectLayout.nodes.conveyorWallMesh
      ? conveyorSources : [templates.get(node.mesh)];
    for (const source of sources) {
      if (!source) throw new Error(`Missing source mesh: ${node.mesh}`);
      const clone = source.clone(node.name + ' ' + source.name + ' instance', null, false);
      if (!clone) throw new Error(`Could not clone mesh: ${source.name}`);
      clone.parent = null;
      clone.position.copyFrom(unityPosition(node.position));
      clone.rotationQuaternion = unityRotation(node.worldEulerAngles).multiply(source.rotationQuaternion ?? Quaternion.Identity());
      clone.scaling.copyFrom(source.scaling).multiplyInPlace(new Vector3(node.lossyScale.x, node.lossyScale.y, node.lossyScale.z));
      clone.material = node.mesh === projectLayout.nodes.conveyorWallMesh
        ? source === conveyorBeltSource ? conveyorBelt : conveyor
        : node.mesh.startsWith(projectLayout.nodes.tunnelMeshPrefix) ? tunnel
            : blockMaterials.get(node.blockColor ?? turret?.color ?? projectLayout.conveyor.blockColor) ?? red;
      clone.isVisible = true;
      clone.isPickable = false;
      if (source === conveyorBeltSource) conveyorBeltInstance = clone;
      if (node.mesh === projectLayout.nodes.headMesh || node.mesh === projectLayout.nodes.bodyMesh
        || node.mesh === projectLayout.nodes.cornerMesh) {
        gridMeshes.set(node, clone);
      }
      if (turret) {
        turret.meshes.push(clone);
        if (node.mesh === projectLayout.nodes.turretBodyMesh) turret.bodyPosition.copyFrom(clone.position);
      }
    }
  }
  if (node.type === 'SpriteRenderer') {
    const sprite = createSprite(node);
    if (sprite && node.sprite === projectLayout.nodes.headHighlight) gridMeshes.set(node, sprite);
  }
  for (const child of node.children ?? []) createFromNode(child, turret, node);
}

function createConveyorSystem(): { system: ConveyorSystem; path: ConveyorPath } {
  const roots = layout.sceneObjects as LayoutNode[];
  const pathDefinition = projectLayout.conveyor.path;
  let path: ConveyorPath;
  let beltWidth = 0;
  let slotCount: number;
  let firstSlotPosition: Vector3;
  if (pathDefinition.kind === 'beltMesh') {
    if (!conveyorBeltInstance) throw new Error(`Missing ${projectLayout.nodes.conveyorBeltMesh} mesh`);
    const inferred = inferBeltMeshPath(conveyorBeltInstance);
    path = new WaypointLoopPath(inferred.points);
    beltWidth = inferred.width;
    slotCount = Math.max(3, Math.round(path.length /
      (beltWidth * projectLayout.conveyor.meshSizing.slotPitchToWidth)));
    firstSlotPosition = inferred.points[0];
  } else if (pathDefinition.kind === 'roundedRectangleFromSlots') {
    const placements = findNode(projectLayout.nodes.slotPlacements, roots).children ?? [];
    if (!placements.length) throw new Error('Conveyor has no slot placements');
    const points = placements.map((node) => unityPosition(node.position));
    path = RoundedRectanglePath.fromPlacements(points, pathDefinition.cornerRadius);
    slotCount = points.length;
    firstSlotPosition = points[0];
  } else {
    const waypoints = findNode(pathDefinition.nodeName, roots).children ?? [];
    path = new WaypointLoopPath(waypoints.map((node) => unityPosition(node.position)));
    const placements = findNode(projectLayout.nodes.slotPlacements, roots).children ?? [];
    if (!placements.length) throw new Error('Conveyor has no slot placements');
    slotCount = placements.length;
    firstSlotPosition = unityPosition(placements[0].position);
  }
  const lanes: TurretLane[] = [];
  const groups = new Map<LayoutNode, TurretUnit[]>();
  for (const turret of turretGroups) {
    const group = groups.get(turret.parent) ?? [];
    group.push(turret.unit);
    groups.set(turret.parent, group);
  }
  const nearestPoint = Vector3.Zero();
  const tangent = Vector3.Zero();
  for (const units of groups.values()) {
    units.sort((a, b) => {
      const distanceToPath = (unit: TurretUnit) => {
        path.sample(path.nearestDistance(unit.bodyPosition), nearestPoint, tangent);
        return Vector3.DistanceSquared(unit.bodyPosition, nearestPoint);
      };
      return distanceToPath(a) - distanceToPath(b);
    });
    path.sample(path.nearestDistance(units[0].muzzlePosition), nearestPoint, tangent);
    lanes.push({ units, targetPosition: nearestPoint.clone() });
  }
  const markers: ConveyorMarker[] = [];
  if (pathDefinition.kind === 'beltMesh') {
    const markerCount = Math.max(3, Math.round(path.length /
      (beltWidth * projectLayout.conveyor.meshSizing.markerPitchToWidth)));
    for (let i = 0; i < markerCount; i++) {
      const mesh = MeshBuilder.CreatePlane('Moving conveyor arrow ' + i,
        { width: beltWidth * projectLayout.conveyor.meshSizing.markerWidthToBelt,
          height: beltWidth * projectLayout.conveyor.meshSizing.markerLengthToBelt,
          sideOrientation: Mesh.DOUBLESIDE }, scene);
      mesh.material = arrowMarker;
      mesh.isPickable = false;
      mesh.rotationQuaternion = Quaternion.Identity();
      markers.push({ mesh, distance: 0 });
    }
  } else {
    const conveyorArrows = findNode(projectLayout.nodes.beltArrows, roots).children ?? [];
    for (let i = 0; i < conveyorArrows.length; i++) {
      const node = conveyorArrows[i];
      const sprite = node.children?.find((child) => child.sprite === projectLayout.nodes.beltArrowSprite);
      if (!sprite) continue;
      const position = unityPosition(node.position);
      const mesh = MeshBuilder.CreatePlane('Moving conveyor arrow ' + i,
        { width: 10.24 * sprite.lossyScale.x, height: 6.1 * sprite.lossyScale.y,
          sideOrientation: Mesh.DOUBLESIDE }, scene);
      mesh.position.copyFrom(position);
      mesh.position.y += 0.03;
      mesh.rotationQuaternion = unityRotation(sprite.worldEulerAngles);
      mesh.material = arrowMarker;
      mesh.isPickable = false;
      markers.push({ mesh, distance: 0 });
    }
  }
  const block = templates.get(projectLayout.nodes.bodyMesh)!;
  const bullet = templates.get(projectLayout.nodes.bulletMesh)!;
  bullet.material = bulletMaterial;
  const slotScale = pathDefinition.kind === 'beltMesh'
    ? (() => {
      block.computeWorldMatrix(true);
      const size = block.getBoundingInfo().boundingBox.extendSizeWorld;
      const bodyWidth = Math.max(size.x, size.z) * 2;
      if (bodyWidth <= 0) throw new Error('Conveyor block mesh has no width');
      const scale = beltWidth * projectLayout.conveyor.meshSizing.blockWidthToBelt / bodyWidth;
      return { x: scale, y: scale, z: scale };
    })()
    : (() => {
      const placements = findNode(projectLayout.nodes.slotPlacements, roots).children ?? [];
      return placements[0].children?.find((node) => node.mesh)?.lossyScale
        ?? placements[0].lossyScale;
    })();
  const slotSpeed = projectLayout.conveyor.slotSpeed
    ?? path.length / slotCount / (projectLayout.grid.cellSize / projectLayout.grid.speed);
  const system = new ConveyorSystem(path, slotCount, firstSlotPosition, lanes, markers,
    block, bullet, blockMaterials,
    new Vector3(slotScale.x, slotScale.y, slotScale.z), {
      slotSpeed,
      markerSpeed: projectLayout.conveyor.markerSpeed,
      bulletSpeed: projectLayout.conveyor.bulletSpeed,
      shotsPerTurret: projectLayout.shooters.shotsPerTurret,
      turretAdvanceSeconds: projectLayout.shooters.advanceSeconds,
      counterOffset: new Vector3(projectLayout.shooters.counterOffset.x,
        projectLayout.shooters.counterOffset.y, projectLayout.shooters.counterOffset.z),
      bulletHitHeight: projectLayout.shooters.bulletHitHeight,
      bulletScale: projectLayout.shooters.bulletScale,
      blockColor: projectLayout.conveyor.blockColor,
      startEmpty: projectLayout.conveyor.startEmpty,
      transferSeconds: projectLayout.conveyor.transferSeconds,
      effects: projectLayout.shooters.effects,
    });
  return { system, path };
}

let conveyorSystem: ConveyorSystem | null = null;
let arrowGrid: ArrowGrid | null = null;
let gameOutcome: 'win' | 'lose' | null = null;

function finishGame(result: 'win' | 'lose') {
  gameOutcome = result;
  arrowGrid?.setInteractive(false);
  document.documentElement.dataset.gameOutcome = result;
  window.dispatchEvent(new CustomEvent('arrowflow:outcome', { detail: { result } }));
}

function cornerKey(center: Vector3, first: Vector3, second: Vector3): string {
  const arm = (point: Vector3) => {
    const dx = point.x - center.x;
    const dz = point.z - center.z;
    return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'right' : 'left')
      : (dz > 0 ? 'down' : 'up');
  };
  return [arm(first), arm(second)].sort().join('|');
}

function sourceGridMeshes(sourceGroups: LayoutNode[][]) {
  const nodes = sourceGroups.flat();
  const headNode = nodes.find((node) => node.mesh === projectLayout.nodes.headMesh)!;
  const bodyNode = nodes.find((node) => node.mesh === projectLayout.nodes.bodyMesh)!;
  const highlightNode = headNode.children?.find((node) => node.sprite === projectLayout.nodes.headHighlight);
  const head = gridMeshes.get(headNode);
  const body = gridMeshes.get(bodyNode);
  const highlight = highlightNode ? gridMeshes.get(highlightNode) : undefined;
  if (!head || !body || !highlight) throw new Error('Unity scene needs head, body, and highlight source meshes');
  const corners = new Map<string, Mesh>();
  // The four exported Unity corners have one mesh orientation for each pair of arms.
  const armsByUnityYaw = ['down|right', 'down|left', 'left|up', 'right|up'];
  for (const node of nodes) {
    if (node.mesh !== projectLayout.nodes.cornerMesh) continue;
    const orientation = ((Math.round(node.worldEulerAngles.y / 90) % 4) + 4) % 4;
    corners.set(armsByUnityYaw[orientation], gridMeshes.get(node)!);
  }
  return { head, body, highlight, corners };
}

function mappedGridParts(arrow: MappedArrow, sources: ReturnType<typeof sourceGridMeshes>): GridPart[] {
  const material = blockMaterials.get(arrow.color);
  if (!material) throw new Error(`Missing arrow material for ${arrow.color}`);
  const positions = arrow.points.map((point) => new Vector3(point.x, 0, point.z));
  const exitDirection = new Vector3(arrow.exitDirection.x, 0, arrow.exitDirection.z);
  const yaw = Math.atan2(-exitDirection.x, -exitDirection.z);
  const turn = Quaternion.RotationYawPitchRoll(yaw, 0, 0);
  const parts: GridPart[] = [];
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const isHead = i === 0;
    const isCorner = i > 0 && i < positions.length - 1
      && Math.abs((positions[i - 1].x - position.x) * (positions[i + 1].z - position.z)
        - (positions[i - 1].z - position.z) * (positions[i + 1].x - position.x)) > 0.1;
    const source = isHead ? sources.head : sources.body;
    const mesh = source.clone(`${arrow.id} part ${i}`, null, false)!;
    mesh.parent = null;
    mesh.material = material;
    mesh.position.copyFrom(position);
    mesh.isPickable = false;
    if (isHead) mesh.rotationQuaternion = turn.multiply(sources.head.rotationQuaternion!);
    const part: GridPart = { kind: isHead ? 'head' : isCorner ? 'corner' : 'body',
      color: arrow.color, mesh, position, pathIndex: i };
    if (isHead) {
      part.exitDirection = exitDirection;
      const highlight = sources.highlight.clone(`${arrow.id} highlight`, null, false)!;
      highlight.parent = null;
      const offset = sources.highlight.position.subtract(sources.head.position);
      highlight.position.copyFrom(position).addInPlace(Vector3.TransformNormal(offset, Matrix.RotationY(yaw)));
      highlight.rotationQuaternion = turn.multiply(sources.highlight.rotationQuaternion!);
      highlight.isPickable = false;
      part.highlight = highlight;
    } else {
      part.bodyBaseRotation = templates.get(projectLayout.nodes.bodyMesh)?.rotationQuaternion?.clone()
        ?? Quaternion.Identity();
      if (isCorner) {
        const key = cornerKey(position, positions[i - 1], positions[i + 1]);
        const sourceCorner = sources.corners.get(key);
        if (!sourceCorner) throw new Error(`Unity source has no corner mesh for ${key}`);
        const corner = sourceCorner.clone(`${arrow.id} corner ${i}`, null, false)!;
        corner.parent = null;
        corner.material = material;
        corner.position.copyFrom(position);
        corner.isPickable = false;
        part.staticCorner = corner;
      }
    }
    parts.push(part);
  }
  return parts;
}

async function boot() {
  const imported = [
    ...(await loadModel(blockModel)),
    ...(await loadModel(shooterModel)),
    ...(await loadModel(tunnelModel)),
  ];
  const conveyorImported = await loadModel(conveyorModel);
  imported.push(...conveyorImported);
  conveyorSources = conveyorImported.filter((mesh): mesh is Mesh => mesh instanceof Mesh && !!mesh.geometry);
  conveyorBeltSource = conveyorSources.find((mesh) => mesh.name === projectLayout.nodes.conveyorBeltMesh) ?? null;
  if (!conveyorBeltSource) {
    for (const mesh of conveyorSources) {
      try { inferBeltMeshPath(mesh); conveyorBeltSource = mesh; break; }
      catch { /* this mesh is a wall or a non-ring detail */ }
    }
  }
  if (!conveyorBeltSource) throw new Error('Conveyor GLB needs one flat, closed belt surface');
  imported.push(...(await loadModel(bulletModel)));
  for (const node of layout.sceneObjects as LayoutNode[]) createFromNode(node);
  const conveyor = createConveyorSystem();
  conveyorSystem = conveyor.system;
  const arrowGroups = findArrowGroups(layout.sceneObjects as LayoutNode[], projectLayout.nodes.headMesh);
  if (!arrowGroups.length) throw new Error('Layout has no arrow groups');
  const sources = sourceGridMeshes(arrowGroups);
  const mapped = mapArrowGrid2D(grid2D as ArrowGrid2DLayout,
    projectLayout.grid2D.center, projectLayout.grid.cellSize, projectLayout.grid2D.colors);
  const groups = mapped.map((arrow) => mappedGridParts(arrow, sources));
  for (const mesh of gridMeshes.values()) mesh.setEnabled(false);
  arrowGrid = new ArrowGrid(scene,
    groups, conveyor.path,
    (position, color) => conveyor.system.insertAt(position, color), {
      ...projectLayout.grid,
      exitDirection: new Vector3(projectLayout.grid.exitDirection.x,
        projectLayout.grid.exitDirection.y, projectLayout.grid.exitDirection.z),
    });
  for (const mesh of imported) mesh.setEnabled(false);
}

boot().catch((error) => console.warn('Babylon layout loading failed', error));
engine.runRenderLoop(() => {
  const dt = engine.getDeltaTime() / 1000;
  if (!gameOutcome && conveyorSystem && arrowGrid) {
    conveyorSystem.update(dt);
    arrowGrid.update(dt);
    if (arrowGrid.isCleared() && conveyorSystem.isEmpty()) finishGame('win');
    else if (conveyorSystem.isFull() && !conveyorSystem.canClearOccupiedBlock()) finishGame('lose');
  }
  conveyorSystem?.updateEffects(dt);
  scene.render();
});
