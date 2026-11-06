import type { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CAMERA_FIT, CAMERA_VIEW, type Vec3Constant } from '../constants';

export type CameraFitBounds = {
  orthoTop: number;
  orthoBottom: number;
  orthoLeft: number;
  orthoRight: number;
  target: Vec3Constant;
};

export function applyCameraFit(camera: FreeCamera): void {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  applyCameraFitForViewport(camera, width, height);
}

export function applyCameraFitForViewport(camera: FreeCamera, width: number, height: number): void {
  const bounds = calculateCameraFit(width, height);
  // Always start from the authored view, including after a landscape fit.
  camera.position.copyFromFloats(...CAMERA_VIEW.position);
  camera.orthoTop = bounds.orthoTop;
  camera.orthoBottom = bounds.orthoBottom;
  camera.orthoLeft = bounds.orthoLeft;
  camera.orthoRight = bounds.orthoRight;
  camera.setTarget(toVector3(bounds.target));
  // Projection and picking during relayout must use this view before the next render.
  camera.getScene().updateTransformMatrix(true);
}

export function calculateCameraFit(width: number, height: number): CameraFitBounds {
  width = Math.max(1, width);
  height = Math.max(1, height);
  const currentAspect = width / height;
  const isPortrait = currentAspect < 1;
  const portraitAspect = isPortrait ? currentAspect : 1 / currentAspect;
  const isTablet = portraitAspect >= CAMERA_FIT.tabletAspectThreshold;
  const isTallPhonePortrait = isPortrait && !isTablet && currentAspect < CAMERA_FIT.tallPhoneAspectThreshold;
  const activeReferenceAspect = isTablet ? CAMERA_FIT.tabletReferenceAspect : CAMERA_FIT.phoneReferenceAspect;

  let orthoSize: number;
  if (isPortrait || !CAMERA_FIT.landscapeFitByHeight) {
    orthoSize = CAMERA_FIT.baseOrthoSize * (activeReferenceAspect / currentAspect);
  } else {
    orthoSize = CAMERA_FIT.baseOrthoSize;
  }

  const min = isTablet ? CAMERA_FIT.tabletMinOrthoSize : CAMERA_FIT.minOrthoSize;
  const max = isTablet ? CAMERA_FIT.tabletMaxOrthoSize : CAMERA_FIT.maxOrthoSize;
  orthoSize = Math.max(min, Math.min(max, orthoSize));

  const halfHeight = orthoSize;
  const halfWidth = orthoSize * currentAspect;
  return {
    orthoTop: halfHeight,
    orthoBottom: -halfHeight,
    orthoLeft: -halfWidth,
    orthoRight: halfWidth,
    target: isTallPhonePortrait ? CAMERA_VIEW.phonePortraitTarget : CAMERA_VIEW.target,
  };
}

function toVector3(value: Vec3Constant): Vector3 {
  return new Vector3(value[0], value[1], value[2]);
}
