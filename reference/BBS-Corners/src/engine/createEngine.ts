import { Engine } from '@babylonjs/core/Engines/engine';
import '@babylonjs/core/Culling/ray';
import { Scene } from '@babylonjs/core/scene';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CAMERA_VIEW, SCENE_COLOR_CONFIG, SCENE_LIGHTING } from '../constants';
import { applyCameraFit } from './camera';

type Vec3Constant = readonly [number, number, number];

export type BabylonRuntime = {
  root: HTMLDivElement;
  canvas: HTMLCanvasElement;
  engine: Engine;
  scene: Scene;
  camera: FreeCamera;
};

export function createBabylonRuntime(parent: HTMLElement): BabylonRuntime {
  const root = document.createElement('div');
  root.className = 'playable-root';

  const canvas = document.createElement('canvas');
  canvas.className = 'playable-canvas';
  canvas.setAttribute('aria-label', 'Wide-U playable');
  canvas.tabIndex = 0;

  const overlay = document.createElement('div');
  overlay.className = 'html-overlay';
  overlay.id = 'html-overlay';

  root.appendChild(canvas);
  root.appendChild(overlay);
  parent.appendChild(root);

  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    antialias: true,
    adaptToDeviceRatio: true,
    powerPreference: 'high-performance',
  });

  const scene = new Scene(engine);
  scene.clearColor = toColor4(SCENE_COLOR_CONFIG.backgroundHex);

  const camera = new FreeCamera('MainCamera', toVector3(CAMERA_VIEW.position), scene);
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.setTarget(toVector3(CAMERA_VIEW.target));
  camera.inputs.clear();
  camera.minZ = 0.1;
  camera.maxZ = 80;
  scene.activeCamera = camera;
  applyCameraFit(camera);

  const mainLight = new HemisphericLight('MainLight', toVector3(SCENE_LIGHTING.hemispheric.direction), scene);
  mainLight.intensity = SCENE_LIGHTING.hemispheric.intensity;
  mainLight.diffuse = toColor3(SCENE_LIGHTING.hemispheric.diffuseColor);
  mainLight.groundColor = toColor3(SCENE_LIGHTING.hemispheric.groundColor);
  mainLight.specular = toColor3(SCENE_LIGHTING.hemispheric.specularColor);

  const directionalLight = new DirectionalLight('DirectionalLight', toVector3(SCENE_LIGHTING.directional.direction), scene);
  directionalLight.intensity = SCENE_LIGHTING.directional.intensity;
  directionalLight.diffuse = toColor3(SCENE_LIGHTING.directional.diffuseColor);
  directionalLight.specular = toColor3(SCENE_LIGHTING.directional.specularColor);
  directionalLight.setEnabled(SCENE_LIGHTING.directional.enabled);

  const softFillLight = new DirectionalLight(
    'SoftFillDirectionalLight',
    toVector3(SCENE_LIGHTING.softFillDirectional.direction),
    scene,
  );
  softFillLight.intensity = SCENE_LIGHTING.softFillDirectional.intensity;
  softFillLight.diffuse = toColor3(SCENE_LIGHTING.softFillDirectional.diffuseColor);
  softFillLight.specular = toColor3(SCENE_LIGHTING.softFillDirectional.specularColor);
  softFillLight.setEnabled(SCENE_LIGHTING.softFillDirectional.enabled);

  const highlightLight = new DirectionalLight(
    'HighlightDirectionalLight',
    toVector3(SCENE_LIGHTING.highlightDirectional.direction),
    scene,
  );
  highlightLight.intensity = SCENE_LIGHTING.highlightDirectional.intensity;
  highlightLight.diffuse = toColor3(SCENE_LIGHTING.highlightDirectional.diffuseColor);
  highlightLight.specular = toColor3(SCENE_LIGHTING.highlightDirectional.specularColor);
  highlightLight.setEnabled(SCENE_LIGHTING.highlightDirectional.enabled);

  const northLight = new DirectionalLight(
    'NorthDirectionalLight',
    toVector3(SCENE_LIGHTING.northDirectional.direction),
    scene,
  );
  northLight.intensity = SCENE_LIGHTING.northDirectional.intensity;
  northLight.diffuse = toColor3(SCENE_LIGHTING.northDirectional.diffuseColor);
  northLight.specular = toColor3(SCENE_LIGHTING.northDirectional.specularColor);
  northLight.setEnabled(SCENE_LIGHTING.northDirectional.enabled);

  const southLight = new DirectionalLight(
    'SouthDirectionalLight',
    toVector3(SCENE_LIGHTING.southDirectional.direction),
    scene,
  );
  southLight.intensity = SCENE_LIGHTING.southDirectional.intensity;
  southLight.diffuse = toColor3(SCENE_LIGHTING.southDirectional.diffuseColor);
  southLight.specular = toColor3(SCENE_LIGHTING.southDirectional.specularColor);
  southLight.setEnabled(SCENE_LIGHTING.southDirectional.enabled);

  return { root, canvas, engine, scene, camera };
}

function toVector3(value: Vec3Constant): Vector3 {
  return new Vector3(value[0], value[1], value[2]);
}

function toColor3(value: Vec3Constant): Color3 {
  return new Color3(value[0], value[1], value[2]);
}

function toColor4(hex: string): Color4 {
  const color = Color3.FromHexString(hex);
  return new Color4(color.r, color.g, color.b, 1);
}
