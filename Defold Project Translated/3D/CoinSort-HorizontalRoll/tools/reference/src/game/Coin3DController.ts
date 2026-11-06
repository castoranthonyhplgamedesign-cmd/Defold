import Phaser from 'phaser';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import coinFbxUrl from '../../Assets/models/Coin.fbx';
import coralTextureUrl from '../../Assets/images/Coral.webp';
import goldTextureUrl from '../../Assets/images/Gold.webp';
import limeTextureUrl from '../../Assets/images/Lime.webp';
import pinkTextureUrl from '../../Assets/images/Pink.webp';
import skyTextureUrl from '../../Assets/images/Sky.webp';
import violetTextureUrl from '../../Assets/images/Violet.webp';
import { COIN_3D_CONFIG, type CoinColorType } from '../constants';
import { getResponsiveMetrics } from '../utils/responsive';

export type Coin3DHandle = number;
export type Coin3DStaticBatchHandle = number;

export type Coin3DUpdate = {
  x: number;
  y: number;
  depth: number;
  displayWidth: number;
  displayHeight: number;
  rotationDegrees: number;
  screenRotationDegrees?: number;
  alpha: number;
  dimAmount?: number;
  visible: boolean;
  colorType?: CoinColorType | null;
  unlit?: boolean;
};

export type Coin3DPlaneHandle = number;

export type Coin3DPlaneUpdate = {
  x: number;
  y: number;
  depth: number;
  displayWidth: number;
  displayHeight: number;
  rotationDegrees: number;
  alpha: number;
  visible: boolean;
  originX?: number;
  originY?: number;
};

export type Coin3DPlaneOptions = {
  transparent?: boolean;
  alphaTest?: number;
  flipY?: boolean;
};

export type DirectionalLight3DState = {
  position: { x: number; y: number; z: number };
  targetOffset: { x: number; y: number; z: number };
  intensity: number;
  ambientIntensity: number;
  shadowEnabled: boolean;
};

type Coin3DRecord = Coin3DUpdate & {
  id: Coin3DHandle;
  colorType: CoinColorType | null;
  object3D: THREE.Object3D | null;
  materials3D: THREE.Material[];
  dimAmount: number;
  unlit: boolean;
  staticBatchId3D: Coin3DStaticBatchHandle | null;
};

type Coin3DPlaneRecord = Coin3DPlaneUpdate & {
  id: Coin3DPlaneHandle;
  textureUrl: string;
  mesh: THREE.Mesh | null;
  material: THREE.MeshBasicMaterial | null;
  texture: THREE.Texture | null;
  transparent: boolean;
  alphaTest: number;
  flipY: boolean;
  originX: number;
  originY: number;
};

type StaticCoinBatch3D = {
  id: Coin3DStaticBatchHandle;
  handles: Set<Coin3DHandle>;
  mesh: THREE.Mesh | null;
  material: THREE.Material | null;
  needsRebuild: boolean;
};

type StaticBatchAtlasTile3D = {
  u: number;
  v: number;
  width: number;
  height: number;
};

type StaticBatchTemplateGeometry3D = {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  vertexCount: number;
};

const TEXTURE_URL_BY_COLOR: Record<CoinColorType, string> = {
  gold: goldTextureUrl,
  lime: limeTextureUrl,
  violet: violetTextureUrl,
  sky: skyTextureUrl,
  pink: pinkTextureUrl,
  coral: coralTextureUrl,
};

const degToRad3D = (degrees: number): number => THREE.MathUtils.degToRad(degrees);

export class Coin3DController {
  private readonly scene: Phaser.Scene;
  private readonly records3D = new Map<Coin3DHandle, Coin3DRecord>();
  private readonly planeRecords3D = new Map<Coin3DPlaneHandle, Coin3DPlaneRecord>();
  private readonly staticBatches3D = new Map<Coin3DStaticBatchHandle, StaticCoinBatch3D>();
  private readonly textures3D = new Map<CoinColorType, THREE.Texture>();
  private readonly materialTemplates3D: Array<THREE.Material | THREE.Material[]> = [];
  private readonly atlasTiles3D = new Map<CoinColorType, StaticBatchAtlasTile3D>();

  private renderer3D: THREE.WebGLRenderer | null = null;
  private threeScene3D: THREE.Scene | null = null;
  private camera3D: THREE.OrthographicCamera | null = null;
  private coinRoot3D: THREE.Group | null = null;
  private coinTemplate3D: THREE.Object3D | null = null;
  private coinTemplateSize3D = new THREE.Vector3(
    COIN_3D_CONFIG.modelSizeFallback3D.x,
    COIN_3D_CONFIG.modelSizeFallback3D.y,
    COIN_3D_CONFIG.modelSizeFallback3D.z,
  );
  private ambientLight3D: THREE.AmbientLight | null = null;
  private directionalLight3D: THREE.DirectionalLight | null = null;
  private directionalLightTarget3D: THREE.Object3D | null = null;
  private lightGizmoRoot3D: THREE.Group | null = null;
  private lightGizmoArrow3D: THREE.ArrowHelper | null = null;
  private planeGeometry3D: THREE.PlaneGeometry | null = null;
  private textureTemplate3D: THREE.Texture | null = null;
  private staticBatchAtlasTexture3D: THREE.Texture | null = null;
  private staticBatchTemplateGeometries3D: StaticBatchTemplateGeometry3D[] | null = null;
  private modelLoadPromise3D: Promise<void> | null = null;
  private nextId3D = 1;
  private nextPlaneId3D = 1;
  private nextStaticBatchId3D = 1;
  private renderScale3D = 1;
  private rendererWidth3D = 1;
  private rendererHeight3D = 1;
  private lightDebugVisible3D = false;
  private needsRender3D = true;
  private readonly directionalLightState3D: DirectionalLight3DState = {
    position: { ...COIN_3D_CONFIG.directionalLightPosition3D },
    targetOffset: { ...COIN_3D_CONFIG.directionalLightTargetOffset3D },
    intensity: COIN_3D_CONFIG.directionalLightIntensity3D,
    ambientIntensity: COIN_3D_CONFIG.ambientLightIntensity3D,
    shadowEnabled: COIN_3D_CONFIG.directionalLightShadowEnabled3D,
  };
  private readonly baseRotationEuler3D = new THREE.Euler(0, 0, 0, 'XYZ');
  private readonly baseRotationQuaternion3D = new THREE.Quaternion();
  private readonly screenRotationQuaternion3D = new THREE.Quaternion();
  private readonly screenRotationAxis3D = new THREE.Vector3(0, 0, 1);
  private readonly rowSegmentSpinAxis3D = new THREE.Vector3(0, 0, 1);
  private readonly rowSegmentSpinQuaternion3D = new THREE.Quaternion();
  private readonly recordPosition3D = new THREE.Vector3();
  private readonly recordScale3D = new THREE.Vector3();
  private readonly recordMatrix3D = new THREE.Matrix4();
  private readonly recordNormalMatrix3D = new THREE.Matrix3();
  private readonly batchPosition3D = new THREE.Vector3();
  private readonly batchNormal3D = new THREE.Vector3();
  private readonly batchUv3D = new THREE.Vector3();
  private readonly activeMaterialColor3D = new THREE.Color(0xffffff);
  private readonly inactiveMaterialColor3D = new THREE.Color(COIN_3D_CONFIG.inactiveMaterialTint3D);
  private readonly tempMaterialColor3D = new THREE.Color(0xffffff);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initialize(): void {
    this.ensureRenderer3D();
    this.loadModel3D();
    this.updateCanvasVisibility3D();
    this.applyAllRecordTransforms3D();
    this.applyAllPlaneRecordTransforms3D();
    this.needsRender3D = true;
  }

  createCoin(colorType: CoinColorType | null): Coin3DHandle {
    const id = this.nextId3D;
    this.nextId3D += 1;

    this.records3D.set(id, {
      id,
      colorType,
      object3D: null,
      materials3D: [],
      staticBatchId3D: null,
      x: 0,
      y: 0,
      depth: 0,
      displayWidth: 0,
      displayHeight: 0,
      rotationDegrees: 0,
      screenRotationDegrees: 0,
      alpha: 1,
      dimAmount: 0,
      unlit: false,
      visible: false,
    });

    if (this.coinTemplate3D) {
      this.createObjectForRecord3D(this.records3D.get(id)!);
    }

    return id;
  }

  destroyCoin(handle: Coin3DHandle): void {
    const record = this.records3D.get(handle);

    if (!record) {
      return;
    }

    if (record.object3D) {
      this.coinRoot3D?.remove(record.object3D);
    }

    if (record.staticBatchId3D !== null) {
      this.removeRecordFromStaticBatch3D(record);
    }

    for (let index = 0; index < record.materials3D.length; index += 1) {
      record.materials3D[index].dispose();
    }

    this.records3D.delete(handle);
    this.needsRender3D = true;
  }

  createTexturedPlane3D(
    textureUrl: string,
    options: Coin3DPlaneOptions = {},
  ): Coin3DPlaneHandle {
    const id = this.nextPlaneId3D;
    this.nextPlaneId3D += 1;

    const record: Coin3DPlaneRecord = {
      id,
      textureUrl,
      mesh: null,
      material: null,
      texture: null,
      transparent: options.transparent ?? true,
      alphaTest: options.alphaTest ?? 0.01,
      flipY: options.flipY ?? true,
      x: 0,
      y: 0,
      depth: 0,
      displayWidth: 0,
      displayHeight: 0,
      rotationDegrees: 0,
      alpha: 1,
      visible: false,
      originX: 0.5,
      originY: 0.5,
    };

    this.planeRecords3D.set(id, record);
    this.ensureRenderer3D();
    this.createObjectForPlaneRecord3D(record);
    this.needsRender3D = true;
    return id;
  }

  destroyTexturedPlane3D(handle: Coin3DPlaneHandle): void {
    const record = this.planeRecords3D.get(handle);

    if (!record) {
      return;
    }

    record.mesh?.removeFromParent();
    record.material?.dispose();
    record.texture?.dispose();
    this.planeRecords3D.delete(handle);
    this.needsRender3D = true;
  }

  updateTexturedPlane3D(handle: Coin3DPlaneHandle, update: Coin3DPlaneUpdate): void {
    const record = this.planeRecords3D.get(handle);

    if (!record) {
      return;
    }

    record.x = update.x;
    record.y = update.y;
    record.depth = update.depth;
    record.displayWidth = update.displayWidth;
    record.displayHeight = update.displayHeight;
    record.rotationDegrees = update.rotationDegrees;
    record.alpha = update.alpha;
    record.visible = update.visible;
    record.originX = update.originX ?? record.originX;
    record.originY = update.originY ?? record.originY;
    this.applyPlaneRecordTransform3D(record);
    this.needsRender3D = true;
  }

  updateCoin(handle: Coin3DHandle, update: Coin3DUpdate): void {
    const record = this.records3D.get(handle);

    if (!record) {
      return;
    }

    const colorChanged = update.colorType !== undefined && update.colorType !== record.colorType;
    const unlitChanged = update.unlit !== undefined && update.unlit !== record.unlit;
    
    record.x = update.x;
    record.y = update.y;
    record.depth = update.depth;
    record.displayWidth = update.displayWidth;
    record.displayHeight = update.displayHeight;
    record.rotationDegrees = update.rotationDegrees;
    record.screenRotationDegrees = update.screenRotationDegrees ?? record.screenRotationDegrees;
    record.alpha = update.alpha;
    record.dimAmount = update.dimAmount ?? record.dimAmount;
    record.unlit = update.unlit ?? record.unlit;
    record.visible = update.visible;
    record.colorType = update.colorType === undefined ? record.colorType : update.colorType;

    if (unlitChanged && record.staticBatchId3D !== null) {
      this.removeRecordFromStaticBatch3D(record);
    }

    if ((colorChanged || unlitChanged) && record.object3D) {
      this.applyRecordMaterials3D(record);
    }

    this.applyRecordTransform3D(record);
    this.markRecordStaticBatchDirty3D(record);
    this.needsRender3D = true;
  }

  createStaticBatch3D(handles: readonly Coin3DHandle[]): Coin3DStaticBatchHandle {
    const id = this.nextStaticBatchId3D;
    this.nextStaticBatchId3D += 1;

    const batch: StaticCoinBatch3D = {
      id,
      handles: new Set<Coin3DHandle>(),
      mesh: null,
      material: null,
      needsRebuild: true,
    };
    this.staticBatches3D.set(id, batch);

    for (let index = 0; index < handles.length; index += 1) {
      const record = this.records3D.get(handles[index]);

      if (!record) {
        continue;
      }

      if (record.staticBatchId3D !== null) {
        this.removeRecordFromStaticBatch3D(record);
      }

      record.staticBatchId3D = id;
      batch.handles.add(record.id);
      if (record.object3D) {
        record.object3D.visible = false;
      }
    }

    this.rebuildStaticBatch3D(batch);
    this.needsRender3D = true;
    return id;
  }

  updateStaticBatch3D(batchId: Coin3DStaticBatchHandle): void {
    const batch = this.staticBatches3D.get(batchId);

    if (!batch) {
      return;
    }

    batch.needsRebuild = true;
    this.rebuildStaticBatch3D(batch);
    this.needsRender3D = true;
  }

  toggleLightDebug3D(): boolean {
    return this.setLightDebugVisible3D(!this.lightDebugVisible3D);
  }

  setLightDebugVisible3D(visible: boolean): boolean {
    this.lightDebugVisible3D = visible;
    this.ensureRenderer3D();
    this.updateLight3D();
    this.updateCanvasVisibility3D();
    this.needsRender3D = true;
    return this.lightDebugVisible3D;
  }

  getDirectionalLightState3D(): DirectionalLight3DState {
    return {
      position: { ...this.directionalLightState3D.position },
      targetOffset: { ...this.directionalLightState3D.targetOffset },
      intensity: this.directionalLightState3D.intensity,
      ambientIntensity: this.directionalLightState3D.ambientIntensity,
      shadowEnabled: this.directionalLightState3D.shadowEnabled,
    };
  }

  setDirectionalLightState3D(state: Partial<DirectionalLight3DState>): void {
    if (state.position) {
      this.directionalLightState3D.position = { ...state.position };
    }

    if (state.targetOffset) {
      this.directionalLightState3D.targetOffset = { ...state.targetOffset };
    }

    if (state.intensity !== undefined) {
      this.directionalLightState3D.intensity = state.intensity;
    }

    if (state.ambientIntensity !== undefined) {
      this.directionalLightState3D.ambientIntensity = state.ambientIntensity;
    }

    if (state.shadowEnabled !== undefined) {
      this.directionalLightState3D.shadowEnabled = state.shadowEnabled;
      this.applyShadowEnabledToMeshes3D();
    }

    this.ensureRenderer3D();
    this.updateLight3D();
    this.needsRender3D = true;
  }

  relayout(): void {
    if (!this.renderer3D || !this.camera3D) {
      return;
    }

    this.resizeRenderer3D();
    this.updateLight3D();
    this.applyAllRecordTransforms3D();
    this.applyAllPlaneRecordTransforms3D();
    this.rebuildAllStaticBatches3D();
    this.needsRender3D = true;
  }

  render(): void {
    if (!this.renderer3D || !this.threeScene3D || !this.camera3D || !this.shouldShowCanvas3D()) {
      return;
    }

    this.rebuildDirtyStaticBatches3D();

    if (!this.needsRender3D) {
      return;
    }

    this.renderer3D.render(this.threeScene3D, this.camera3D);
    this.needsRender3D = false;
  }

  destroy(): void {
    this.records3D.forEach(record => {
      for (let index = 0; index < record.materials3D.length; index += 1) {
        record.materials3D[index].dispose();
      }
    });
    this.records3D.clear();

    this.planeRecords3D.forEach(record => {
      record.mesh?.removeFromParent();
      record.material?.dispose();
      record.texture?.dispose();
    });
    this.planeRecords3D.clear();
    this.planeGeometry3D?.dispose();
    this.planeGeometry3D = null;

    this.textures3D.forEach(texture => texture.dispose());
    this.textures3D.clear();

    this.staticBatches3D.forEach(batch => {
      batch.mesh?.geometry.dispose();
      batch.mesh?.removeFromParent();
      batch.material?.dispose();
    });
    this.staticBatches3D.clear();
    this.staticBatchAtlasTexture3D?.dispose();
    this.staticBatchAtlasTexture3D = null;

    this.renderer3D?.domElement.remove();
    this.renderer3D?.dispose();
    this.renderer3D = null;
    this.threeScene3D = null;
    this.camera3D = null;
    this.coinRoot3D = null;
  }

  private ensureRenderer3D(): void {
    if (this.renderer3D) {
      return;
    }

    this.threeScene3D = new THREE.Scene();
    this.coinRoot3D = new THREE.Group();
    this.threeScene3D.add(this.coinRoot3D);

    this.camera3D = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, COIN_3D_CONFIG.cameraZ3D * 2);
    this.camera3D.position.set(0, 0, COIN_3D_CONFIG.cameraZ3D);

    this.renderer3D = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    });
    this.renderer3D.autoClear = true;
    this.renderer3D.setClearColor(0x000000, 0);
    this.renderer3D.shadowMap.enabled = this.directionalLightState3D.shadowEnabled;
    this.renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer3D.domElement.style.position = 'fixed';
    this.renderer3D.domElement.style.inset = '0';
    this.renderer3D.domElement.style.pointerEvents = 'none';
    this.renderer3D.domElement.style.zIndex = String(COIN_3D_CONFIG.rendererZIndex3D);
    this.renderer3D.domElement.style.display = 'block';

    const parent = document.getElementById('game-root') ?? this.scene.game.canvas.parentElement ?? document.body;
    parent.insertBefore(this.renderer3D.domElement, parent.firstChild);
    this.scene.game.canvas.style.position = 'relative';
    this.scene.game.canvas.style.zIndex = String(COIN_3D_CONFIG.rendererZIndex3D + 1);

    this.ambientLight3D = new THREE.AmbientLight(0xffffff, this.directionalLightState3D.ambientIntensity);
    this.directionalLight3D = new THREE.DirectionalLight(
      COIN_3D_CONFIG.directionalLightColor3D,
      this.directionalLightState3D.intensity,
    );
    this.directionalLightTarget3D = new THREE.Object3D();
    this.threeScene3D.add(this.ambientLight3D, this.directionalLight3D, this.directionalLightTarget3D);
    this.directionalLight3D.target = this.directionalLightTarget3D;
    this.createLightGizmo3D();
    this.createTextures3D();
    this.resizeRenderer3D();
    this.updateLight3D();
  }

  private resizeRenderer3D(): void {
    if (!this.renderer3D || !this.camera3D) {
      return;
    }

    const metrics = getResponsiveMetrics();
    const renderDpr3D = Math.min(metrics.dpr, COIN_3D_CONFIG.maxPixelRatio3D);
    this.renderScale3D = renderDpr3D / Math.max(0.001, metrics.dpr);
    this.rendererWidth3D = Math.max(1, Math.round(metrics.viewW * renderDpr3D));
    this.rendererHeight3D = Math.max(1, Math.round(metrics.viewH * renderDpr3D));
    this.renderer3D.setSize(this.rendererWidth3D, this.rendererHeight3D, false);
    this.renderer3D.domElement.style.width = `${metrics.viewW}px`;
    this.renderer3D.domElement.style.height = `${metrics.viewH}px`;

    this.camera3D.left = 0;
    this.camera3D.right = this.rendererWidth3D;
    this.camera3D.top = 0;
    this.camera3D.bottom = this.rendererHeight3D;
    this.camera3D.near = 0.1;
    this.camera3D.far = COIN_3D_CONFIG.cameraZ3D * 2;
    this.camera3D.position.set(0, 0, COIN_3D_CONFIG.cameraZ3D);
    this.camera3D.updateProjectionMatrix();
  }

  private updateCanvasVisibility3D(): void {
    if (!this.renderer3D) {
      return;
    }

    this.renderer3D.domElement.style.display = this.shouldShowCanvas3D() ? 'block' : 'none';
  }

  private shouldShowCanvas3D(): boolean {
    return true;
  }

  private createTextures3D(): void {
    const loader = new THREE.TextureLoader();
    const colorTypes = Object.keys(TEXTURE_URL_BY_COLOR) as CoinColorType[];

    for (let index = 0; index < colorTypes.length; index += 1) {
      const colorType = colorTypes[index];
      const texture = loader.load(TEXTURE_URL_BY_COLOR[colorType], () => {
        this.resetStaticBatchAtlas3D();
        this.rebuildAllStaticBatches3D();
        this.needsRender3D = true;
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = true;
      this.applyTextureTemplate3D(texture);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      this.textures3D.set(colorType, texture);
    }
  }

  private loadModel3D(): void {
    if (this.modelLoadPromise3D) {
      return;
    }

    this.modelLoadPromise3D = new Promise(resolve => {
      const manager = new THREE.LoadingManager();
      manager.setURLModifier(url => {
        return url.includes('Coin_DefaultMaterial_BaseColor') ? goldTextureUrl : url;
      });

      const loader = new FBXLoader(manager);
      loader.load(
        coinFbxUrl,
        root => {
          this.coinTemplate3D = this.prepareTemplate3D(root);
          this.records3D.forEach(record => this.createObjectForRecord3D(record));
          this.rebuildAllStaticBatches3D();
          this.needsRender3D = true;
          resolve();
        },
        undefined,
        error => {
          console.warn('[Coin3D] Failed to load Coin.fbx', error);
          resolve();
        },
      );
    });
  }

  private prepareTemplate3D(root: THREE.Object3D): THREE.Object3D {
    root.traverse(child => {
      if (child instanceof THREE.Mesh) {
        this.correctCoinFrontFaceWinding3D(child.geometry);
        this.correctCoinCapUvDirection3D(child.geometry);
        child.geometry.computeBoundingBox();
        child.castShadow = this.directionalLightState3D.shadowEnabled;
        child.receiveShadow = this.directionalLightState3D.shadowEnabled;
        this.captureTextureTemplate3D(child.material);
        child.userData.coinMaterialTemplateIndex3D = this.materialTemplates3D.length;
        this.materialTemplates3D.push(child.material);
      }
    });

    this.applyTextureTemplateToLoadedTextures3D();
    this.staticBatchTemplateGeometries3D = null;

    const bounds = new THREE.Box3().setFromObject(root);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    root.position.sub(center);
    this.coinTemplateSize3D.copy(size);

    const template = new THREE.Group();
    template.add(root);
    return template;
  }

  private correctCoinFrontFaceWinding3D(geometry: THREE.BufferGeometry): void {
    if (geometry.userData.coinFrontFaceWindingCorrected3D === true) {
      return;
    }

    // The FBX imports with exterior triangles treated as back faces in Three.
    // Reverse winding once so FrontSide materials render the coin shell, not the interior.
    const index = geometry.index;

    if (index) {
      for (let triangleIndex = 0; triangleIndex + 2 < index.count; triangleIndex += 3) {
        const nextIndex = index.getX(triangleIndex + 1);
        index.setX(triangleIndex + 1, index.getX(triangleIndex + 2));
        index.setX(triangleIndex + 2, nextIndex);
      }

      index.needsUpdate = true;
    } else {
      const attributeNames = Object.keys(geometry.attributes);

      for (let nameIndex = 0; nameIndex < attributeNames.length; nameIndex += 1) {
        const attribute = geometry.attributes[attributeNames[nameIndex]];

        if (attribute instanceof THREE.BufferAttribute) {
          this.reverseTriangleAttributeWinding3D(attribute);
        }
      }
    }

    geometry.computeBoundingSphere();
    geometry.userData.coinFrontFaceWindingCorrected3D = true;
  }

  private reverseTriangleAttributeWinding3D(attribute: THREE.BufferAttribute): void {
    const itemSize = attribute.itemSize;

    for (let triangleIndex = 0; triangleIndex + 2 < attribute.count; triangleIndex += 3) {
      const nextVertex = triangleIndex + 1;
      const lastVertex = triangleIndex + 2;

      for (let component = 0; component < itemSize; component += 1) {
        const nextValue = attribute.getComponent(nextVertex, component);
        attribute.setComponent(nextVertex, component, attribute.getComponent(lastVertex, component));
        attribute.setComponent(lastVertex, component, nextValue);
      }
    }

    attribute.needsUpdate = true;
  }

  private correctCoinCapUvDirection3D(geometry: THREE.BufferGeometry): void {
    if (geometry.userData.coinCapUvDirectionCorrected3D === true) {
      return;
    }

    const normal = geometry.attributes.normal;
    const uv = geometry.attributes.uv;

    if (!(normal instanceof THREE.BufferAttribute) || !(uv instanceof THREE.BufferAttribute)) {
      return;
    }

    const numberedCapMinU = 0.67;
    let minNumberedCapU = Number.POSITIVE_INFINITY;
    let maxNumberedCapU = Number.NEGATIVE_INFINITY;

    for (let vertexIndex = 0; vertexIndex < normal.count; vertexIndex += 1) {
      const u = uv.getX(vertexIndex);

      if (Math.abs(normal.getX(vertexIndex)) < 0.7 || u < numberedCapMinU) {
        continue;
      }

      minNumberedCapU = Math.min(minNumberedCapU, u);
      maxNumberedCapU = Math.max(maxNumberedCapU, u);
    }

    if (!Number.isFinite(minNumberedCapU) || !Number.isFinite(maxNumberedCapU)) {
      return;
    }

    const capUMirror = minNumberedCapU + maxNumberedCapU;

    for (let vertexIndex = 0; vertexIndex < normal.count; vertexIndex += 1) {
      const u = uv.getX(vertexIndex);

      if (Math.abs(normal.getX(vertexIndex)) < 0.7 || u < numberedCapMinU) {
        continue;
      }

      uv.setX(vertexIndex, capUMirror - u);
    }

    uv.needsUpdate = true;
    geometry.userData.coinCapUvDirectionCorrected3D = true;
  }

  private captureTextureTemplate3D(material: THREE.Material | THREE.Material[]): void {
    if (this.textureTemplate3D) {
      return;
    }

    const materials = Array.isArray(material) ? material : [material];

    for (let index = 0; index < materials.length; index += 1) {
      const candidate = materials[index] as THREE.MeshStandardMaterial;

      if (candidate.map instanceof THREE.Texture) {
        this.textureTemplate3D = candidate.map;
        return;
      }
    }
  }

  private applyTextureTemplateToLoadedTextures3D(): void {
    this.textures3D.forEach(texture => this.applyTextureTemplate3D(texture));
  }

  private applyTextureTemplate3D(texture: THREE.Texture): void {
    const template = this.textureTemplate3D;

    if (!template) {
      return;
    }

    texture.flipY = template.flipY;
    texture.wrapS = template.wrapS;
    texture.wrapT = template.wrapT;
    texture.repeat.copy(template.repeat);
    texture.offset.copy(template.offset);
    texture.center.copy(template.center);
    texture.rotation = template.rotation;
    texture.matrixAutoUpdate = template.matrixAutoUpdate;
    texture.matrix.copy(template.matrix);
    texture.needsUpdate = true;
  }

  private createObjectForRecord3D(record: Coin3DRecord): void {
    if (!this.coinTemplate3D || !this.coinRoot3D || record.object3D) {
      return;
    }

    const object3D = this.coinTemplate3D.clone(true);
    record.object3D = object3D;
    this.applyRecordMaterials3D(record);
    this.coinRoot3D.add(object3D);
    this.applyRecordTransform3D(record);
    if (record.staticBatchId3D !== null) {
      object3D.visible = false;
    }
  }

  private createObjectForPlaneRecord3D(record: Coin3DPlaneRecord): void {
    if (!this.coinRoot3D || record.mesh) {
      return;
    }

    const texture = new THREE.TextureLoader().load(record.textureUrl, () => {
      this.needsRender3D = true;
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = record.flipY;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      alphaTest: record.alphaTest,
      map: texture,
      side: THREE.DoubleSide,
      transparent: record.transparent,
    });
    material.depthTest = false;
    material.depthWrite = false;
    material.toneMapped = false;

    const mesh = new THREE.Mesh(this.getPlaneGeometry3D(), material);
    mesh.frustumCulled = false;
    record.texture = texture;
    record.material = material;
    record.mesh = mesh;
    this.coinRoot3D.add(mesh);
    this.applyPlaneRecordTransform3D(record);
  }

  private getPlaneGeometry3D(): THREE.PlaneGeometry {
    if (!this.planeGeometry3D) {
      this.planeGeometry3D = new THREE.PlaneGeometry(1, 1);
    }

    return this.planeGeometry3D;
  }

  private applyPlaneRecordTransform3D(record: Coin3DPlaneRecord): void {
    if (!record.mesh || !record.material) {
      return;
    }

    const visible3D = record.visible && record.alpha > 0.001;
    record.mesh.visible = visible3D;
    record.material.opacity = record.transparent ? record.alpha : 1;

    if (!visible3D) {
      return;
    }

    const width = Math.max(0.001, record.displayWidth * this.renderScale3D);
    const height = Math.max(0.001, record.displayHeight * this.renderScale3D);
    const rotation = degToRad3D(record.rotationDegrees);
    const offsetX = (0.5 - record.originX) * width;
    const offsetY = (0.5 - record.originY) * height;
    const rotatedOffsetX = Math.cos(rotation) * offsetX - Math.sin(rotation) * offsetY;
    const rotatedOffsetY = Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetY;

    record.mesh.position.set(
      record.x * this.renderScale3D + rotatedOffsetX,
      record.y * this.renderScale3D + rotatedOffsetY,
      this.getRecordDepthZ3D(record.depth),
    );
    record.mesh.rotation.set(0, 0, rotation);
    record.mesh.scale.set(width, height, 1);
    record.mesh.renderOrder = Math.round(record.depth * COIN_3D_CONFIG.renderOrderScale3D);
  }

  private applyRecordMaterials3D(record: Coin3DRecord): void {
    if (!record.object3D) {
      return;
    }

    for (let index = 0; index < record.materials3D.length; index += 1) {
      record.materials3D[index].dispose();
    }
    record.materials3D = [];

    const colorType = record.colorType ?? 'gold';
    const texture = this.textures3D.get(colorType) ?? this.textures3D.get('gold');

    record.object3D.traverse(child => {
      if (!(child instanceof THREE.Mesh) || !texture) {
        return;
      }

      const material = record.unlit
        ? this.createUnlitMaterialFromTexture3D(child, texture)
        : this.createMaterialFromTemplate3D(child, texture);
      child.material = material;
      this.collectMaterials3D(material, record.materials3D);
    });
  }

  private createUnlitMaterialFromTexture3D(child: THREE.Mesh, texture: THREE.Texture): THREE.Material {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide,
      color: this.activeMaterialColor3D,
    });
    material.transparent = false;
    material.opacity = 1;
    material.depthWrite = true;
    material.depthTest = true;
    return material;
  }

  private createMaterialFromTemplate3D(child: THREE.Mesh, texture: THREE.Texture): THREE.Material | THREE.Material[] {
    const templateIndex = child.userData.coinMaterialTemplateIndex3D;
    const template =
      typeof templateIndex === 'number' ? this.materialTemplates3D[templateIndex] : child.material;

    if (Array.isArray(template)) {
      const materials: THREE.Material[] = [];

      for (let index = 0; index < template.length; index += 1) {
        materials.push(this.cloneMaterialWithTexture3D(template[index], texture));
      }

      return materials;
    }

    return this.cloneMaterialWithTexture3D(template, texture);
  }

  private cloneMaterialWithTexture3D(template: THREE.Material, texture: THREE.Texture): THREE.Material {
    const material = template.clone();
    const mappedMaterial = material as THREE.Material & { map?: THREE.Texture | null; color?: THREE.Color };
    const specularStrength = this.getMaterialSpecularStrength3D();
    mappedMaterial.map = texture;
    material.transparent = false;
    material.opacity = 1;
    material.side = THREE.FrontSide;
    material.depthWrite = true;
    material.depthTest = true;
    material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        '#include <map_fragment>\ndiffuseColor.a = 1.0;',
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <lights_fragment_end>',
        `reflectedLight.directSpecular *= ${specularStrength};\n#include <lights_fragment_end>`,
      );
    };

    if (mappedMaterial.color) {
      mappedMaterial.color.copy(this.activeMaterialColor3D);
    }

    this.applyMaterialSurface3D(material);
    material.needsUpdate = true;
    return material;
  }

  private applyMaterialSurface3D(material: THREE.Material): void {
    const surfaceMaterial = material as THREE.Material & { metalness?: number; roughness?: number };

    if ('metalness' in surfaceMaterial) {
      surfaceMaterial.metalness = COIN_3D_CONFIG.materialMetalness3D;
    }

    if ('roughness' in surfaceMaterial) {
      surfaceMaterial.roughness = COIN_3D_CONFIG.materialRoughness3D;
    }
  }

  private getMaterialSpecularStrength3D(): string {
    const value = COIN_3D_CONFIG.materialSpecularStrength3D;

    return Number.isFinite(value) ? Math.max(0, value).toFixed(4) : '1.0000';
  }

  private applyShadowEnabledToMeshes3D(): void {
    const enabled = this.directionalLightState3D.shadowEnabled;

    if (this.renderer3D) {
      this.renderer3D.shadowMap.enabled = enabled;
    }

    this.coinTemplate3D?.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = enabled;
        child.receiveShadow = enabled;
      }
    });

    this.records3D.forEach(record => {
      record.object3D?.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = enabled;
          child.receiveShadow = enabled;
        }
      });
    });

    this.staticBatches3D.forEach(batch => {
      if (batch.mesh) {
        batch.mesh.castShadow = enabled;
        batch.mesh.receiveShadow = enabled;
      }
    });
  }

  private collectMaterials3D(material: THREE.Material | THREE.Material[], materials: THREE.Material[]): void {
    if (Array.isArray(material)) {
      for (let index = 0; index < material.length; index += 1) {
        materials.push(material[index]);
      }
      return;
    }

    materials.push(material);
  }

  private applyRecordTransform3D(record: Coin3DRecord): void {
    if (!record.object3D) {
      return;
    }

    if (record.staticBatchId3D !== null) {
      record.object3D.visible = false;
      return;
    }

    const visible3D = record.visible && record.alpha > 0.001;
    record.object3D.visible = visible3D;

    if (!visible3D) {
      return;
    }

    const scale = this.getRecordScale3D(record);
    record.object3D.position.copy(this.getRecordPosition3D(record));
    record.object3D.quaternion.copy(this.getRecordQuaternion3D(record));
    record.object3D.scale.setScalar(scale);
    this.applyRecordRenderOrder3D(record);

    for (let index = 0; index < record.materials3D.length; index += 1) {
      this.applyMaterialTint3D(record.materials3D[index], record.dimAmount);
    }
  }

  private applyMaterialTint3D(material: THREE.Material, dimAmount: number): void {
    const colorMaterial = material as THREE.Material & { color?: THREE.Color };
    material.opacity = 1;

    if (colorMaterial.color) {
      colorMaterial.color.copy(this.getRecordMaterialColor3D(dimAmount));
    }
  }

  private getRecordMaterialColor3D(dimAmount: number): THREE.Color {
    const amount = Phaser.Math.Clamp(dimAmount, 0, 1);
    this.tempMaterialColor3D.copy(this.activeMaterialColor3D).lerp(this.inactiveMaterialColor3D, amount);
    return this.tempMaterialColor3D;
  }

  private getRecordQuaternion3D(record: Coin3DRecord): THREE.Quaternion {
    const baseRotation = COIN_3D_CONFIG.modelRotationDegrees3D;
    const spinAxis = COIN_3D_CONFIG.rowSegmentSpinAxis3D;
    this.baseRotationEuler3D.set(
      degToRad3D(baseRotation.x),
      degToRad3D(baseRotation.y),
      degToRad3D(baseRotation.z),
      'XYZ',
    );
    this.baseRotationQuaternion3D.setFromEuler(this.baseRotationEuler3D);
    this.rowSegmentSpinAxis3D.set(spinAxis.x, spinAxis.y, spinAxis.z);

    if (this.rowSegmentSpinAxis3D.lengthSq() <= 0.0001) {
      this.rowSegmentSpinAxis3D.set(0, 0, 1);
    }

    this.rowSegmentSpinAxis3D.normalize();
    this.rowSegmentSpinQuaternion3D.setFromAxisAngle(
      this.rowSegmentSpinAxis3D,
      degToRad3D(
        COIN_3D_CONFIG.coinFaceSpinOffsetDegrees3D +
          record.rotationDegrees * COIN_3D_CONFIG.rowSegmentSpinDirection3D,
      ),
    );
    this.baseRotationQuaternion3D.multiply(this.rowSegmentSpinQuaternion3D);
    this.screenRotationQuaternion3D.setFromAxisAngle(
      this.screenRotationAxis3D,
      degToRad3D(record.screenRotationDegrees ?? 0),
    );
    return this.screenRotationQuaternion3D.multiply(this.baseRotationQuaternion3D);
  }

  private getRecordPosition3D(record: Coin3DRecord): THREE.Vector3 {
    return this.recordPosition3D.set(
      record.x * this.renderScale3D,
      record.y * this.renderScale3D,
      this.getRecordDepthZ3D(record.depth),
    );
  }

  private getRecordDepthZ3D(depth: number): number {
    return depth * COIN_3D_CONFIG.depthScale3D * COIN_3D_CONFIG.depthPositionSign3D * this.renderScale3D;
  }

  private applyRecordRenderOrder3D(record: Coin3DRecord): void {
    if (!record.object3D) {
      return;
    }

    const renderOrder = Math.round(record.depth * COIN_3D_CONFIG.renderOrderScale3D);
    record.object3D.renderOrder = renderOrder;
    record.object3D.traverse(child => {
      child.renderOrder = renderOrder;
    });
  }

  private getRecordScale3D(record: Coin3DRecord): number {
    const modelWidth = Math.max(0.001, this.coinTemplateSize3D.x);
    const modelHeight = Math.max(0.001, this.coinTemplateSize3D.y);
    const targetWidth = Math.max(0.001, record.displayWidth * this.renderScale3D);
    const targetHeight = Math.max(0.001, record.displayHeight * this.renderScale3D);
    const fitScale = Math.min(targetWidth / modelWidth, targetHeight / modelHeight);

    return fitScale * COIN_3D_CONFIG.modelScale3D;
  }

  private removeRecordFromStaticBatch3D(record: Coin3DRecord): void {
    const batchId = record.staticBatchId3D;

    if (batchId === null) {
      return;
    }

    const batch = this.staticBatches3D.get(batchId);
    batch?.handles.delete(record.id);
    if (batch) {
      batch.needsRebuild = true;
    }
    record.staticBatchId3D = null;
  }

  private markRecordStaticBatchDirty3D(record: Coin3DRecord): void {
    if (record.staticBatchId3D === null) {
      return;
    }

    const batch = this.staticBatches3D.get(record.staticBatchId3D);
    if (batch) {
      batch.needsRebuild = true;
      this.invalidateStaticBatchMaterial3D(batch);
    }
  }

  private rebuildAllStaticBatches3D(): void {
    this.staticBatches3D.forEach(batch => {
      batch.needsRebuild = true;
      this.rebuildStaticBatch3D(batch);
    });
  }

  private rebuildDirtyStaticBatches3D(): void {
    this.staticBatches3D.forEach(batch => {
      if (batch.needsRebuild) {
        this.rebuildStaticBatch3D(batch);
      }
    });
  }

  private rebuildStaticBatch3D(batch: StaticCoinBatch3D): void {
    if (!batch.needsRebuild || !this.coinRoot3D || !this.coinTemplate3D) {
      return;
    }

    const material = this.getStaticBatchMaterial3D(batch);
    const geometry = material ? this.createStaticBatchGeometry3D(batch) : null;

    if (!geometry || !material) {
      if (batch.mesh) {
        batch.mesh.visible = false;
      }
      return;
    }

    if (!batch.mesh) {
      batch.mesh = new THREE.Mesh(geometry, material);
      batch.mesh.castShadow = this.directionalLightState3D.shadowEnabled;
      batch.mesh.receiveShadow = this.directionalLightState3D.shadowEnabled;
      this.coinRoot3D.add(batch.mesh);
    } else {
      batch.mesh.geometry.dispose();
      batch.mesh.geometry = geometry;
      batch.mesh.material = material;
    }

    this.applyMaterialTint3D(material, this.getStaticBatchDimAmount3D(batch));
    batch.mesh.visible = geometry.attributes.position.count > 0;
    batch.mesh.renderOrder = this.getStaticBatchRenderOrder3D(batch);
    batch.needsRebuild = false;
  }

  private createStaticBatchGeometry3D(batch: StaticCoinBatch3D): THREE.BufferGeometry | null {
    const templateGeometries = this.getStaticBatchTemplateGeometries3D();

    if (templateGeometries.length === 0 || this.atlasTiles3D.size === 0) {
      return null;
    }

    let vertexCount = 0;
    batch.handles.forEach(handle => {
      const record = this.records3D.get(handle);

      if (record?.visible && record.alpha > 0.001) {
        for (let index = 0; index < templateGeometries.length; index += 1) {
          vertexCount += templateGeometries[index].vertexCount;
        }
      }
    });

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    let positionOffset = 0;
    let normalOffset = 0;
    let uvOffset = 0;

    batch.handles.forEach(handle => {
      const record = this.records3D.get(handle);

      if (!record?.visible || record.alpha <= 0.001) {
        return;
      }

      const colorType = record.colorType ?? 'gold';
      const tile = this.atlasTiles3D.get(colorType) ?? this.atlasTiles3D.get('gold');

      if (!tile) {
        return;
      }

      const scale = this.getRecordScale3D(record);
      this.recordScale3D.set(scale, scale, scale);
      this.recordMatrix3D.compose(
        this.getRecordPosition3D(record).clone(),
        this.getRecordQuaternion3D(record).clone(),
        this.recordScale3D,
      );
      this.recordNormalMatrix3D.getNormalMatrix(this.recordMatrix3D);

      for (let geometryIndex = 0; geometryIndex < templateGeometries.length; geometryIndex += 1) {
        const templateGeometry = templateGeometries[geometryIndex];

        for (let vertexIndex = 0; vertexIndex < templateGeometry.vertexCount; vertexIndex += 1) {
          const positionIndex = vertexIndex * 3;
          const uvIndex = vertexIndex * 2;

          this.batchPosition3D
            .set(
              templateGeometry.positions[positionIndex],
              templateGeometry.positions[positionIndex + 1],
              templateGeometry.positions[positionIndex + 2],
            )
            .applyMatrix4(this.recordMatrix3D);
          positions[positionOffset] = this.batchPosition3D.x;
          positions[positionOffset + 1] = this.batchPosition3D.y;
          positions[positionOffset + 2] = this.batchPosition3D.z;
          positionOffset += 3;

          this.batchNormal3D
            .set(
              templateGeometry.normals[positionIndex],
              templateGeometry.normals[positionIndex + 1],
              templateGeometry.normals[positionIndex + 2],
            )
            .applyMatrix3(this.recordNormalMatrix3D)
            .normalize();
          normals[normalOffset] = this.batchNormal3D.x;
          normals[normalOffset + 1] = this.batchNormal3D.y;
          normals[normalOffset + 2] = this.batchNormal3D.z;
          normalOffset += 3;

          this.getStaticBatchUv3D(templateGeometry.uvs[uvIndex], templateGeometry.uvs[uvIndex + 1], tile);
          uvs[uvOffset] = this.batchUv3D.x;
          uvs[uvOffset + 1] = this.batchUv3D.y;
          uvOffset += 2;
        }
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.computeBoundingSphere();
    return geometry;
  }

  private getStaticBatchTemplateGeometries3D(): StaticBatchTemplateGeometry3D[] {
    if (this.staticBatchTemplateGeometries3D) {
      return this.staticBatchTemplateGeometries3D;
    }

    const geometries: StaticBatchTemplateGeometry3D[] = [];

    if (!this.coinTemplate3D) {
      return geometries;
    }

    this.coinTemplate3D.updateMatrixWorld(true);
    this.coinTemplate3D.traverse(child => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      const sourceGeometry = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();
      const position = sourceGeometry.attributes.position;
      const normal = sourceGeometry.attributes.normal;
      const uv = sourceGeometry.attributes.uv;

      if (
        !(position instanceof THREE.BufferAttribute) ||
        !(normal instanceof THREE.BufferAttribute) ||
        !(uv instanceof THREE.BufferAttribute)
      ) {
        sourceGeometry.dispose();
        return;
      }

      const positions = new Float32Array(position.count * 3);
      const normals = new Float32Array(position.count * 3);
      const uvs = new Float32Array(position.count * 2);
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld);

      for (let index = 0; index < position.count; index += 1) {
        const positionIndex = index * 3;
        const uvIndex = index * 2;

        this.batchPosition3D
          .set(position.getX(index), position.getY(index), position.getZ(index))
          .applyMatrix4(child.matrixWorld);
        positions[positionIndex] = this.batchPosition3D.x;
        positions[positionIndex + 1] = this.batchPosition3D.y;
        positions[positionIndex + 2] = this.batchPosition3D.z;

        this.batchNormal3D
          .set(normal.getX(index), normal.getY(index), normal.getZ(index))
          .applyMatrix3(normalMatrix)
          .normalize();
        normals[positionIndex] = this.batchNormal3D.x;
        normals[positionIndex + 1] = this.batchNormal3D.y;
        normals[positionIndex + 2] = this.batchNormal3D.z;

        uvs[uvIndex] = uv.getX(index);
        uvs[uvIndex + 1] = uv.getY(index);
      }

      sourceGeometry.dispose();
      geometries.push({ positions, normals, uvs, vertexCount: position.count });
    });

    this.staticBatchTemplateGeometries3D = geometries;
    return geometries;
  }

  private getStaticBatchMaterial3D(batch: StaticCoinBatch3D): THREE.Material | null {
    if (batch.material) {
      return batch.material;
    }

    const atlasTexture = this.createStaticBatchAtlasTexture3D();

    if (!atlasTexture) {
      return null;
    }

    const template = this.getFirstMaterialTemplate3D();

    if (!template) {
      return null;
    }

    batch.material = this.cloneMaterialWithTexture3D(template, atlasTexture);
    return batch.material;
  }

  private createStaticBatchAtlasTexture3D(): THREE.Texture | null {
    if (this.staticBatchAtlasTexture3D) {
      return this.staticBatchAtlasTexture3D;
    }

    const colorTypes = Object.keys(TEXTURE_URL_BY_COLOR) as CoinColorType[];
    const images: Array<CanvasImageSource | null> = [];
    let tileSize = 0;

    for (let index = 0; index < colorTypes.length; index += 1) {
      const texture = this.textures3D.get(colorTypes[index]);
      const image = texture?.image as CanvasImageSource & { width?: number; height?: number };
      const width = image?.width ?? 0;
      const height = image?.height ?? 0;

      if (!image || width <= 0 || height <= 0) {
        return null;
      }

      tileSize = Math.max(tileSize, width, height);
      images.push(image);
    }

    const columns = 3;
    const rows = Math.ceil(colorTypes.length / columns);
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * columns;
    canvas.height = tileSize * rows;
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    this.atlasTiles3D.clear();
    for (let index = 0; index < colorTypes.length; index += 1) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const drawY = (rows - 1 - row) * tileSize;
      const image = images[index];

      if (!image) {
        return null;
      }

      context.drawImage(image, column * tileSize, drawY, tileSize, tileSize);
      this.atlasTiles3D.set(colorTypes[index], {
        u: column / columns,
        v: row / rows,
        width: 1 / columns,
        height: 1 / rows,
      });
    }

    const atlasTexture = new THREE.CanvasTexture(canvas);
    atlasTexture.colorSpace = THREE.SRGBColorSpace;
    atlasTexture.flipY = true;
    atlasTexture.generateMipmaps = true;
    atlasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    atlasTexture.magFilter = THREE.LinearFilter;
    this.staticBatchAtlasTexture3D = atlasTexture;
    return atlasTexture;
  }

  private resetStaticBatchAtlas3D(): void {
    this.staticBatchAtlasTexture3D?.dispose();
    this.staticBatchAtlasTexture3D = null;
    this.atlasTiles3D.clear();
    this.staticBatches3D.forEach(batch => {
      this.invalidateStaticBatchMaterial3D(batch);
      batch.needsRebuild = true;
    });
  }

  private invalidateStaticBatchMaterial3D(batch: StaticCoinBatch3D): void {
    batch.material?.dispose();
    batch.material = null;
  }

  private getFirstMaterialTemplate3D(): THREE.Material | null {
    for (let index = 0; index < this.materialTemplates3D.length; index += 1) {
      const template = this.materialTemplates3D[index];

      if (Array.isArray(template)) {
        if (template[0]) {
          return template[0];
        }
        continue;
      }

      return template;
    }

    return null;
  }

  private getStaticBatchUv3D(u: number, v: number, tile: StaticBatchAtlasTile3D): THREE.Vector3 {
    const template = this.textureTemplate3D;

    this.batchUv3D.set(u, v, 1);
    if (template) {
      this.batchUv3D.applyMatrix3(template.matrix);
    }

    this.batchUv3D.x = tile.u + this.batchUv3D.x * tile.width;
    this.batchUv3D.y = tile.v + this.batchUv3D.y * tile.height;
    return this.batchUv3D;
  }

  private getStaticBatchDimAmount3D(batch: StaticCoinBatch3D): number {
    let dimAmount = 0;

    batch.handles.forEach(handle => {
      const record = this.records3D.get(handle);

      if (record?.visible) {
        dimAmount = record.dimAmount;
      }
    });

    return dimAmount;
  }

  private getStaticBatchRenderOrder3D(batch: StaticCoinBatch3D): number {
    let minDepth = Number.POSITIVE_INFINITY;

    batch.handles.forEach(handle => {
      const record = this.records3D.get(handle);

      if (record?.visible) {
        minDepth = Math.min(minDepth, record.depth);
      }
    });

    return Number.isFinite(minDepth) ? Math.round(minDepth * COIN_3D_CONFIG.renderOrderScale3D) : 0;
  }

  private applyAllRecordTransforms3D(): void {
    this.records3D.forEach(record => this.applyRecordTransform3D(record));
  }

  private applyAllPlaneRecordTransforms3D(): void {
    this.planeRecords3D.forEach(record => this.applyPlaneRecordTransform3D(record));
  }

  private createLightGizmo3D(): void {
    if (!this.threeScene3D) {
      return;
    }

    this.lightGizmoRoot3D = new THREE.Group();
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: COIN_3D_CONFIG.lightGizmoColor3D });
    const bulbGeometry = new THREE.SphereGeometry(COIN_3D_CONFIG.lightGizmoRadius3D, 12, 8);
    const lightGizmoBulb3D = new THREE.Mesh(bulbGeometry, bulbMaterial);
    this.lightGizmoArrow3D = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(),
      COIN_3D_CONFIG.lightGizmoLength3D,
      COIN_3D_CONFIG.lightGizmoColor3D,
      COIN_3D_CONFIG.lightGizmoLength3D * 0.24,
      COIN_3D_CONFIG.lightGizmoRadius3D * 2,
    );
    this.lightGizmoRoot3D.add(lightGizmoBulb3D, this.lightGizmoArrow3D);
    this.threeScene3D.add(this.lightGizmoRoot3D);
  }

  private updateLight3D(): void {
    if (!this.directionalLight3D || !this.directionalLightTarget3D) {
      return;
    }

    const position = this.getLightScenePoint3D(this.directionalLightState3D.position);
    const target = position.clone().add(this.getLightSceneOffset3D(this.directionalLightState3D.targetOffset));
    const direction = target.clone().sub(position);

    if (direction.lengthSq() <= 0.0001) {
      direction.set(0, 0, 1);
    }

    direction.normalize();
    this.directionalLight3D.position.copy(position);
    this.directionalLightTarget3D.position.copy(target);
    this.directionalLight3D.intensity = this.directionalLightState3D.intensity;
    if (this.ambientLight3D) {
      this.ambientLight3D.intensity = this.directionalLightState3D.ambientIntensity;
    }
    this.updateDirectionalLightShadow3D();
    this.lightGizmoRoot3D?.position.copy(position);
    this.lightGizmoRoot3D?.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    this.lightGizmoRoot3D?.updateMatrixWorld();
    this.lightGizmoArrow3D?.position.set(0, 0, 0);
    this.lightGizmoArrow3D?.setDirection(direction);
    this.lightGizmoArrow3D?.setLength(
      COIN_3D_CONFIG.lightGizmoLength3D,
      COIN_3D_CONFIG.lightGizmoLength3D * 0.24,
      COIN_3D_CONFIG.lightGizmoRadius3D * 2,
    );

    if (this.lightGizmoRoot3D) {
      this.lightGizmoRoot3D.visible = this.lightDebugVisible3D;
    }
  }

  private updateDirectionalLightShadow3D(): void {
    if (!this.directionalLight3D) {
      return;
    }

    const enabled = this.directionalLightState3D.shadowEnabled;
    this.directionalLight3D.castShadow = enabled;

    if (!enabled) {
      return;
    }

    const shadow = this.directionalLight3D.shadow;
    const shadowCamera = shadow.camera as THREE.OrthographicCamera;
    const cameraHalfSize =
      Math.max(this.rendererWidth3D, this.rendererHeight3D) / 2 +
      COIN_3D_CONFIG.directionalLightShadowCameraMargin3D * this.renderScale3D;

    shadow.mapSize.set(
      COIN_3D_CONFIG.directionalLightShadowMapSize3D,
      COIN_3D_CONFIG.directionalLightShadowMapSize3D,
    );
    shadow.bias = COIN_3D_CONFIG.directionalLightShadowBias3D;
    shadow.normalBias = COIN_3D_CONFIG.directionalLightShadowNormalBias3D;
    shadowCamera.left = -cameraHalfSize;
    shadowCamera.right = cameraHalfSize;
    shadowCamera.top = cameraHalfSize;
    shadowCamera.bottom = -cameraHalfSize;
    shadowCamera.near = COIN_3D_CONFIG.directionalLightShadowCameraNear3D;
    shadowCamera.far = COIN_3D_CONFIG.directionalLightShadowCameraFar3D;
    shadowCamera.updateProjectionMatrix();
  }

  private getLightScenePoint3D(position: { x: number; y: number; z: number }): THREE.Vector3 {
    return new THREE.Vector3(
      this.rendererWidth3D / 2 + position.x * this.renderScale3D,
      this.rendererHeight3D / 2 + position.y * this.renderScale3D,
      position.z * this.renderScale3D,
    );
  }

  private getLightSceneOffset3D(offset: { x: number; y: number; z: number }): THREE.Vector3 {
    return new THREE.Vector3(
      offset.x * this.renderScale3D,
      offset.y * this.renderScale3D,
      offset.z * this.renderScale3D,
    );
  }
}
