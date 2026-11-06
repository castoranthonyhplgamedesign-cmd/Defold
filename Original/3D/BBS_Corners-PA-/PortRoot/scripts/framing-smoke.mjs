import { Camera } from '@babylonjs/core/Cameras/camera.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createServer } from 'vite';

const SCENE_BOUNDS = {
  minX: -4.45,
  maxX: 4.45,
  minY: 0,
  maxY: 0.75,
  minZ: -4.95,
  maxZ: 7.15,
};

const VIEWPORTS = [
  { label: 'phone 16:9', width: 360, height: 640, minSideMargin: 24, minTopMargin: 80, minBottomMargin: 120, minHeightRatio: 0.56 },
  { label: 'phone tall', width: 375, height: 812, minSideMargin: 24, minTopMargin: 110, minBottomMargin: 190, minHeightRatio: 0.47 },
  { label: 'phone tall wide', width: 390, height: 844, minSideMargin: 24, minTopMargin: 110, minBottomMargin: 200, minHeightRatio: 0.47 },
  { label: 'large phone', width: 540, height: 960, minSideMargin: 36, minTopMargin: 120, minBottomMargin: 190, minHeightRatio: 0.56 },
  { label: 'portrait tablet', width: 768, height: 1024, minSideMargin: 110, minTopMargin: 120, minBottomMargin: 200, minHeightRatio: 0.56 },
  { label: 'landscape phone', width: 844, height: 390, minSideMargin: 250, minTopMargin: 36, minBottomMargin: 80, minHeightRatio: 0.5 },
  { label: 'landscape tablet', width: 1024, height: 768, minSideMargin: 260, minTopMargin: 90, minBottomMargin: 150, minHeightRatio: 0.56 },
];

const vite = await createServer({
  appType: 'custom',
  configFile: false,
  define: {
    __ITERATION__: JSON.stringify('full'),
    __NETWORK__: JSON.stringify('dev'),
    __HEADER_VARIANT__: JSON.stringify('v1'),
  },
  logLevel: 'error',
  optimizeDeps: {
    entries: [],
    noDiscovery: true,
  },
  root: process.cwd(),
  server: { hmr: false, middlewareMode: true },
});

try {
  const { CAMERA_VIEW } = await vite.ssrLoadModule('/src/constants.ts');
  const { applyCameraFitForViewport } = await vite.ssrLoadModule('/src/engine/camera.ts');

  for (const viewport of VIEWPORTS) {
    const result = projectSceneBounds(CAMERA_VIEW, applyCameraFitForViewport, viewport);
    assertViewportFit(viewport, result);
  }

  console.log(`Framing smoke passed: ${VIEWPORTS.length} phone/tablet/landscape viewports keep the board and gates inside the safe visual area.`);
} finally {
  await vite.close();
}

function projectSceneBounds(cameraView, applyCameraFitForViewport, viewport) {
  const engine = new NullEngine({
    renderWidth: viewport.width,
    renderHeight: viewport.height,
    textureSize: 256,
  });
  engine.disablePerformanceMonitorInBackground = true;

  try {
    const scene = new Scene(engine);
    const camera = new FreeCamera('FramingCamera', new Vector3(...cameraView.position), scene);
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.setTarget(new Vector3(...cameraView.target));
    scene.activeCamera = camera;
    applyCameraFitForViewport(camera, viewport.width, viewport.height);
    scene.render();

    const transform = scene.getTransformMatrix();
    const screenViewport = camera.viewport.toGlobal(viewport.width, viewport.height);
    const projected = createBoundsPoints().map((point) => Vector3.Project(point, Matrix.Identity(), transform, screenViewport));
    const minX = Math.min(...projected.map((point) => point.x));
    const maxX = Math.max(...projected.map((point) => point.x));
    const minY = Math.min(...projected.map((point) => point.y));
    const maxY = Math.max(...projected.map((point) => point.y));

    return {
      leftMargin: minX,
      rightMargin: viewport.width - maxX,
      topMargin: minY,
      bottomMargin: viewport.height - maxY,
      heightRatio: (maxY - minY) / viewport.height,
    };
  } finally {
    engine.dispose();
  }
}

function createBoundsPoints() {
  const points = [];
  for (const x of [SCENE_BOUNDS.minX, SCENE_BOUNDS.maxX]) {
    for (const y of [SCENE_BOUNDS.minY, SCENE_BOUNDS.maxY]) {
      for (const z of [SCENE_BOUNDS.minZ, SCENE_BOUNDS.maxZ]) {
        points.push(new Vector3(x, y, z));
      }
    }
  }
  return points;
}

function assertViewportFit(viewport, result) {
  assertMinimum(result.leftMargin, viewport.minSideMargin, `${viewport.label} left margin`);
  assertMinimum(result.rightMargin, viewport.minSideMargin, `${viewport.label} right margin`);
  assertMinimum(result.topMargin, viewport.minTopMargin, `${viewport.label} top margin`);
  assertMinimum(result.bottomMargin, viewport.minBottomMargin, `${viewport.label} bottom margin`);
  assertMinimum(result.heightRatio, viewport.minHeightRatio, `${viewport.label} projected height ratio`);

  if (result.heightRatio > 0.7) {
    throw new Error(`${viewport.label} projected height ratio is too large: ${format(result.heightRatio)}`);
  }
}

function assertMinimum(actual, expected, label) {
  if (actual < expected) {
    throw new Error(`${label}: expected at least ${format(expected)}, got ${format(actual)}`);
  }
}

function format(value) {
  return Number(value).toFixed(2);
}
