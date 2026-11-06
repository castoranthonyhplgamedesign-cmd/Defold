import { Scene, WebGLRenderer, OrthographicCamera, AmbientLight, DirectionalLight, MeshStandardMaterial, MeshPhysicalMaterial, TextureLoader, InstancedMesh, Object3D, Matrix4, Vector3, Box3, SRGBColorSpace, NoToneMapping, DoubleSide, CircleGeometry, MeshBasicMaterial, Mesh } from 'three';
import { tunnelTextureUrl } from '../assets';
import { loadGeometry } from './geometry';
import defaults from '../projectDefaults.json';
import {UI_LAYER} from '../constants';
import {trackGeometry} from './track';
import palette from '../data/materials.json';
import type { Simulation } from '../core/simulation';
import { createBoard } from './board';
import {arrowStyle} from './arrowStyle';
import { createCannons, laneView } from './cannons';
import type { Session } from '../core/session';
import { createOverlay } from '../ui/overlay';
import { createConveyorGuides } from './conveyorGuides';
import {insideLoop,type FlowMesh,type Pair} from '../layout/arrowFlow';
import {createMockupLighting} from './mockupLighting';
import {createCannonTrayMaterial} from './cannonTray';

export async function createScene(root: HTMLElement, simulation: Simulation, session?: Session, install: (auto?:boolean,keepPlaying?:boolean) => void = () => {}, onPause: (paused:boolean)=>void = ()=>{}, initialPaused=false, customTrack?:{points:number[][];width:number;mesh?:FlowMesh;origin?:Pair}) {
  const geometries = await loadGeometry();
  if(customTrack){geometries.track.forEach(g=>g.dispose());geometries.track=trackGeometry(customTrack.points,customTrack.width,customTrack.mesh,customTrack.origin);}
  const tunnelTexture = await new TextureLoader().loadAsync(tunnelTextureUrl);
  tunnelTexture.colorSpace = SRGBColorSpace;
  tunnelTexture.flipY = false;
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(defaults.background,0);
  renderer.domElement.style.position='relative';renderer.domElement.style.zIndex=String(UI_LAYER.world);
  root.style.backgroundColor=defaults.background;
  root.appendChild(renderer.domElement);
  const scene = new Scene();
  const camera = new OrthographicCamera(-21, 21, 21, -21, defaults.camera.near, defaults.camera.far);
  camera.position.fromArray(defaults.camera.position);
  camera.quaternion.fromArray(defaults.camera.quaternion);
  if(customTrack?.mesh)camera.rotation.set(-arrowStyle.cameraTilt*Math.PI/180,0,0);
  camera.updateMatrixWorld();
  // Proposed lighting conversion: Cocos illuminance is not a Three intensity.
  if(!customTrack?.mesh){
    scene.add(new AmbientLight(0xffffff, 1.6));
    const sun = new DirectionalLight(0xffffff, 2.5);
    sun.position.set(0, 9.06307787, 4.22618262); scene.add(sun);
  }
  const materials: Record<string, MeshStandardMaterial> = {};
  const gloss = { roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .12 };
  for (const [name, p] of Object.entries(palette)) materials[name] = new MeshPhysicalMaterial({ color: p.color, ...gloss });
  // The supplied artist conveyor declares both glTF materials double-sided.
  if(customTrack?.mesh){materials.Outer.side=DoubleSide;materials.Inner.side=DoubleSide;}
  materials.white = new MeshPhysicalMaterial({ color: 0xffffff, ...gloss });
  materials.blocked = new MeshPhysicalMaterial({ color: '#ff2020', ...gloss, transparent: true, opacity: .7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  if(customTrack?.mesh){
    const colors={purple:'#8436f5',pink:'#fa42bd',green:'#14e528',black:'#62686c',yellow:'#ffcc00',Outer:'#a3ccff',Inner:'#25275b',white:'#f4f6ff'};
    for(const [name,color] of Object.entries(colors))materials[name].color.set(color);
    for(const material of Object.values(materials)){material.roughness=.3;(material as MeshPhysicalMaterial).clearcoat=.7;(material as MeshPhysicalMaterial).clearcoatRoughness=.24;}
    // Studio reflections were washing the dark belt gray; its rim retains the glossy finish.
    materials.Inner.roughness=.6;materials.Inner.envMapIntensity=0;(materials.Inner as MeshPhysicalMaterial).clearcoat=0;(materials.Inner as MeshPhysicalMaterial).specularIntensity=.1;
  }
  // Logical white remains the preload matching category; neutral effects keep their original material.
  materials.neutral = materials.white.clone();
  materials.white.color.set('#ff4242');
  const trayMaterial = createCannonTrayMaterial(tunnelTexture);
  const groups = new Map<string, Matrix4[]>();
  const pose = new Object3D();
  function add(model: string, color: string, position: number[], yaw = 0, scale = [1, 1, 1]) {
    pose.position.fromArray(position); pose.rotation.set(0, yaw, 0); pose.scale.fromArray(scale); pose.updateMatrix();
    const key = `${model}:${color}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(pose.matrix.clone());
  }
  const board = createBoard(scene, simulation, geometries, materials,customTrack?.mesh?arrowStyle.boardY:0);
  // Floor dots on every grid cell an arrow may occupy (the editor's clearance rule), as in the shipped game.
  // They sit just under the resting blocks, so they show as a guide once arrows leave.
  const dot=new CircleGeometry(arrowStyle.dotRadius,12).rotateX(-Math.PI/2),dotMaterial=new MeshBasicMaterial({color:arrowStyle.dotColor});
  if(customTrack?.mesh&&simulation.arrows.length){
    const first=simulation.arrows[0],size=first.data.cellSize??1,[ox,,oz]=first.segments[0].position;
    const loop=customTrack.points.map(p=>[p[0],p[2]] as Pair),clearance=customTrack.width/2+.45*size,dots:Pair[]=[];
    const [minX,maxX,minZ,maxZ]=[Math.min(...loop.map(p=>p[0])),Math.max(...loop.map(p=>p[0])),Math.min(...loop.map(p=>p[1])),Math.max(...loop.map(p=>p[1]))];
    for(let x=ox+Math.ceil((minX-ox)/size)*size;x<=maxX;x+=size)for(let z=oz+Math.ceil((minZ-oz)/size)*size;z<=maxZ;z+=size)if(insideLoop([x,z],loop,clearance))dots.push([x,z]);
    const mesh=new InstancedMesh(dot.scale(size,1,size),dotMaterial,dots.length);
    dots.forEach(([x,z],i)=>{pose.position.set(x,(arrowStyle.boardY-.12)*size,z);pose.rotation.set(0,0,0);pose.scale.set(1,1,1);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);});
    scene.add(mesh);
  }
  const guides = customTrack?.mesh?createConveyorGuides(scene,simulation.path,0x6873a8,.65):createConveyorGuides(scene,simulation.path);
  const laneScale=customTrack?.mesh?arrowStyle.laneScale:1;
  const cannons = createCannons(scene, root, simulation.cannons, geometries.cannon[0], materials, laneScale);
  const meterCenter=customTrack?[Math.min(...customTrack.points.map(p=>p[0]))/2+Math.max(...customTrack.points.map(p=>p[0]))/2,0,Math.max(...customTrack.points.map(p=>p[2]))+2.5]:undefined;
  const projected = new Vector3();
  const project = (position:number[]) => { projected.fromArray(position).project(camera); return {x:(projected.x+1)*lastWidth/2,y:(1-projected.y)*lastHeight/2}; };
  add('track', 'Outer', [0, 0, 0], 0, customTrack?[1,1,1]:[.928, 2.5, 1.02]);
  for (const lane of simulation.cannons.lanes) {
    const view=laneView(lane,laneScale);
    add('tunnel', 'tunnel', view(0,0,-1.448), Math.PI / 2+(lane.yaw??0), [1.476, 1.3, 1.3].map(v=>v*laneScale));
    add('tunnelBase', 'tunnel', view(0,-.566,-.742), Math.PI / 2+(lane.yaw??0), [1, 1.3, 1.3].map(v=>v*laneScale));
  }
  const overlay = session ? createOverlay(root,session,install,meterCenter,customTrack?.mesh?arrowStyle.boardY:0) : undefined;
  for (const [key, matrices] of groups) {
    const [model, color] = key.split(':');
    geometries[model].forEach((geometry, primitive) => {
      const material = color==='tunnel'?trayMaterial:materials[model === 'track' && primitive === 1 ? 'Inner' : color];
      const mesh = new InstancedMesh(geometry, material, matrices.length);
      matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
      mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); scene.add(mesh);
    });
  }
  scene.updateMatrixWorld(true);
  const bounds=new Box3().setFromObject(scene);
  let studio:ReturnType<typeof createMockupLighting>|undefined;
  if(customTrack?.mesh){
    const casters=new Set(['body','head','corner','track','cannon','tunnel','tunnelBase'].flatMap(name=>geometries[name]));
    scene.traverse(o=>{if(o instanceof Mesh&&casters.has(o.geometry)){o.castShadow=true;o.receiveShadow=true;}});
    // Add the ground only after framing bounds are measured; shadows must not change the camera.
    studio=createMockupLighting(renderer,scene,bounds);
  }
  let worldHalfWidth=Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x)),verticalHalfHeight=defaults.camera.halfHeight;
  if(customTrack&&meterCenter){
    meterCenter[2]=Math.max(meterCenter[2],bounds.max.z+2.5);
    bounds.expandByPoint(new Vector3(meterCenter[0]-7,0,meterCenter[2]+1.5));bounds.expandByPoint(new Vector3(meterCenter[0]+7,0,meterCenter[2]-1.5));
    const viewBounds=new Box3();
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])viewBounds.expandByPoint(new Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
    const center=viewBounds.getCenter(new Vector3()),distance=Math.max(camera.position.length(),(viewBounds.max.z-viewBounds.min.z)/2+camera.near+1);
    camera.position.add(new Vector3(center.x,center.y,center.z+distance).applyQuaternion(camera.quaternion));camera.updateMatrixWorld();
    worldHalfWidth=(viewBounds.max.x-viewBounds.min.x)/2;verticalHalfHeight=(viewBounds.max.y-viewBounds.min.y)/2;
  }
  let frame = 0, lost = false, hostPaused=initialPaused, previousTime = 0, visualTime=0, lastWidth = 0, lastHeight = 0, lastDpr = 0;
  const paused=()=>lost || document.hidden || hostPaused;
  function render(time = performance.now()) {
    frame = 0;
    if (paused()) { previousTime = 0; simulation.paused = true; overlay?.setPaused(true); onPause(true); return; }
    simulation.paused = false;
    if (previousTime) {
      const dt=Math.min(.1, Math.max(0, (time - previousTime) / 1000));
      overlay?.advance(dt);
      (session ?? simulation).advance(dt);if(!session?.ended)visualTime+=dt;
    }
    previousTime = time;
    board.sync(session?.valid);
    guides.sync(visualTime);
    // Cannons keep their clock after the run ends so the lane doors can roll shut.
    cannons.sync(visualTime + (session?.ended ? session.time - session.endedAt : 0));
    const { width, height } = root.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, defaults.pixelRatioCap);
    if (width !== lastWidth || height !== lastHeight || dpr !== lastDpr) {
      renderer.setPixelRatio(dpr); renderer.setSize(width, height, false);
      lastWidth = width; lastHeight = height; lastDpr = dpr;
    }
    const aspect = width / height, padding=Math.min(24,width*.06);
    const h = Math.max(customTrack?verticalHalfHeight/(1-2*Math.min(24,height*.06)/height):verticalHalfHeight,worldHalfWidth/aspect/(1-2*padding/width));
    camera.left = -h * aspect; camera.right = h * aspect; camera.top = h; camera.bottom = -h;
    camera.updateProjectionMatrix(); cannons.layout(camera, width, height); renderer.render(scene, camera);
    overlay?.sync(project,width,height);
    renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
    renderer.domElement.dataset.triangles = String(renderer.info.render.triangles);
    // The revealed endcard is static; resize and context recovery can still request a frame.
    if(!session?.endcardShown)requestRender();
  }
  function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
  const observer = new ResizeObserver(requestRender); observer.observe(root);
  const timers = new Set<ReturnType<typeof setTimeout>>();
  function resize() {
    requestRender();
    timers.forEach(clearTimeout); timers.clear();
    for (const delay of [100, 300, 600]) {
      const timer = setTimeout(() => { timers.delete(timer); requestRender(); }, delay); timers.add(timer);
    }
  }
  function contextLost(event: Event) { event.preventDefault(); lost = true; visibilityChanged(); }
  function contextRestored() { lost = false; studio?.restore(); visibilityChanged(); }
  function visibilityChanged() { previousTime = 0; simulation.paused = paused(); overlay?.setPaused(simulation.paused); onPause(simulation.paused); requestRender(); }
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
  window.addEventListener('resize', resize);
  window.visualViewport?.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibilityChanged);
  render();
  return {
    canvas: renderer.domElement,
    wake: requestRender,
    setHostPaused(value:boolean){if(hostPaused!==value){hostPaused=value;visibilityChanged();}},
    pick: (x: number, y: number) => paused() || overlay?.introActive || session?.ended ? null : board.pick(x, y, camera, renderer.domElement.getBoundingClientRect()),
    dispose: () => {
    cannons.dispose();
    board.dispose();
    guides.dispose();
    overlay?.dispose();
    cancelAnimationFrame(frame); timers.forEach(clearTimeout); observer.disconnect();
    window.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibilityChanged);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
    scene.traverse(o => { if (o instanceof InstancedMesh) o.dispose(); });
    Object.values(geometries).flat().forEach(g => g.dispose());
    Object.values(materials).forEach(m => m.dispose());
    trayMaterial.dispose(); tunnelTexture.dispose(); dot.dispose(); dotMaterial.dispose();
    studio?.dispose();
    renderer.dispose(); renderer.domElement.remove();
    },
  };
}
