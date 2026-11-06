import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {BufferGeometry,BufferAttribute,Mesh,Group,MeshPhysicalMaterial,MeshBasicMaterial,BoxGeometry,SphereGeometry,CircleGeometry,Scene} from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {flowRuntime} from '../src/layout/arrowFlow.ts';
import {trackGeometry} from '../src/render/track.ts';
import {createConveyorGuides} from '../src/render/conveyorGuides.ts';
import {ConveyorPath} from '../src/core/path.ts';

// The Three exporter uses this browser API to assemble the GLB, without image processing here.
globalThis.FileReader=class {
 readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();}).catch(error=>this.onerror?.(error));}
};
const root='Visual_Assets',entries=[],read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
fs.mkdirSync(root,{recursive:true});
function record(relative,source,use){const bytes=fs.readFileSync(path.join(root,relative));entries.push({file:relative,source,use,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
function copy(source,relative,use){fs.mkdirSync(path.dirname(path.join(root,relative)),{recursive:true});fs.copyFileSync(source,path.join(root,relative));assert(fs.readFileSync(source).equals(fs.readFileSync(path.join(root,relative))));record(relative,source,use);}
for(const [name,category,use] of [
 ['title.webp','UI/Branding','Gameplay bottom-left title and endcard title'],
 ['icon.webp','UI/Branding','Endcard app icon'],
 ['hand-idle.webp','UI/Tutorial','Tutorial hand idle frame'],
 ['hand-tap.webp','UI/Tutorial','Tutorial hand tap frame'],
 ['meter-border.webp','UI/Progress_Bar','Fullness meter border'],
 ['meter-fill.webp','UI/Progress_Bar','Fullness meter fill mask'],
 ['play.webp','UI/Fallback','Play button used only by unsupported-renderer fallback'],
 ['LilitaOne-Regular.ttf','Fonts','Ammo counts, opening caption and other text'],
])copy(`src/assets/ui/${name}`,`${category}/${name}`,use);
copy('src/assets/textures/tunnel-3c4374-exact.webp','Textures/Cannon_Tray/tunnel-3c4374-exact.webp','Active unlit cannon hood/tray atlas; no tint');
copy('src/assets/geometry.bin','Models/Runtime_Data/geometry.bin','Original packed geometry imported by the runtime');
copy('src/assets/geometry.json','Models/Runtime_Data/geometry.json','Byte offsets and attribute types for geometry.bin');
copy('levels/overload-level.arrow-flow.json','Layout/overload-level.arrow-flow.json','Exact shipped board, embedded conveyor mesh and layout authoring data');

const palette={blue:'#2cd8ed',purple:'#8436f5',pink:'#fa42bd',green:'#14e528',black:'#62686c',yellow:'#ffcc00',white:'#ff4242',neutral:'#f4f6ff',Outer:'#a3ccff',Inner:'#25275b'};
const glossy=color=>new MeshPhysicalMaterial({color,roughness:.3,metalness:0,clearcoat:.7,clearcoatRoughness:.24});
const neutral=glossy(palette.neutral),cyan=glossy(palette.blue),tray=new MeshBasicMaterial({color:0xffffff});
const exporter=new GLTFExporter(),loader=new GLTFLoader();
async function model(relative,geometries,materials,source,use){
 const group=new Group();group.name=path.basename(relative,'.glb');
 geometries.forEach((geometry,i)=>{const mesh=new Mesh(geometry,Array.isArray(materials)?materials[i]:materials);mesh.name=`${group.name}-${i}`;group.add(mesh);});
 const data=await exporter.parseAsync(group,{binary:true});
 const loaded=await loader.parseAsync(data,'');assert(loaded.scene.children.length>0);
 const full=path.join(root,relative);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,Buffer.from(data));record(relative,source,use);
 loaded.scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});
}
const packed=fs.readFileSync('src/assets/geometry.bin'),manifest=read('src/assets/geometry.json');
for(const [name,relative,material] of [
 ['body','Arrows/body',cyan],['head','Arrows/head',cyan],['corner','Arrows/corner',cyan],['inner','Arrows/head-inset-and-highlight',neutral],
 ['cannon','Cannons/cannon',cyan],['tunnel','Cannons/hood',tray],['tunnelBase','Cannons/tray-base',tray],
]){
 const geometries=manifest[name].map(p=>{
  const g=new BufferGeometry();
  for(const key of ['position','normal','uv','index'])if(p[key]){
   const a=p[key],Type=a.componentType===5126?Float32Array:a.componentType===5123?Uint16Array:Uint32Array;
   const buffer=packed.buffer.slice(packed.byteOffset+a.offset,packed.byteOffset+a.offset+a.count*a.components*Type.BYTES_PER_ELEMENT);
   const attribute=new BufferAttribute(new Type(buffer),a.components);if(key==='index')g.setIndex(attribute);else g.setAttribute(key,attribute);
  }return g;
 });
 await model(`Models/${relative}.glb`,geometries,material,'src/assets/geometry.bin + geometry.json',name==='tunnel'||name==='tunnelBase'?'Geometry and UVs; apply the separately supplied cannon tray texture':'Unposed reusable geometry; runtime transforms and colors are applied in code');
 geometries.forEach(g=>g.dispose());
}
const runtime=flowRuntime(read('levels/overload-level.arrow-flow.json'));
const conveyor=trackGeometry(runtime.path,runtime.trackWidth,runtime.trackMesh,runtime.trackOrigin);
const outer=glossy(palette.Outer),inner=glossy(palette.Inner);outer.side=inner.side=2;inner.roughness=.6;inner.clearcoat=0;inner.specularIntensity=.1;
await model('Models/Conveyor/overload-conveyor.glb',conveyor,conveyor.map((_,i)=>i===1?inner:outer),'level embedded mesh + src/render/track.ts','Active imported conveyor with its runtime origin translation and outer/inner materials');
conveyor.forEach(g=>g.dispose());
for(const [name,g,use] of [
 ['projectile',new SphereGeometry(.375,8,6),'Base sphere for projectiles and impact flashes'],
 ['particle-cube',new BoxGeometry(),'Base cube for colored shards and stretched white sparks'],
 ['lane-door',new BoxGeometry().translate(0,-.5,0),'Top-anchored shutter; runtime scales to 2.6 x 2.4 x .14 times lane scale'],
 ['grid-dot',new CircleGeometry(.1,12).rotateX(-Math.PI/2),'Floor dot; runtime scales with cell size'],
]){await model(`Models/Procedural/${name}.glb`,[g],neutral,'src/render/cannons.ts or scene.ts',use);g.dispose();}
const guideScene=new Scene(),guides=createConveyorGuides(guideScene,new ConveyorPath(runtime.path),0x6873a8,.65),guide=guideScene.children[0];
await model('Models/Procedural/conveyor-chevron.glb',[guide.geometry],guide.material,'src/render/conveyorGuides.ts','Single broad chevron; runtime pairs, places and animates instances along the belt');guides.dispose();
const materialData={palette,gloss:{roughness:.3,metalness:0,clearcoat:.7,clearcoatRoughness:.24},belt:{roughness:.6,clearcoat:0,specularIntensity:.1},insets:{color:'arrow color multiplied by .55 in linear space',roughness:.75,metalness:0,envMapIntensity:.12},tray:{type:'MeshBasicMaterial',texture:'Textures/Cannon_Tray/tunnel-3c4374-exact.webp',tint:null,toneMapped:false},background:'#3b3f68',gridDot:'#5c6194',chevron:{color:'#6873a8',opacity:.65},blockedOverlay:{color:'#ff2020',opacity:'two animated contact pulses'},lightingSource:'src/render/mockupLighting.ts'};
fs.mkdirSync(`${root}/Materials`,{recursive:true});fs.writeFileSync(`${root}/Materials/materials.json`,JSON.stringify(materialData,null,2));record('Materials/materials.json','src/render/scene.ts, board.ts, cannonTray.ts, arrowStyle.ts','Current runtime palette and surface settings');
fs.writeFileSync(`${root}/README.md`,`# Arrow Flow visual assets\n\nCollected from the current playable. Source assets are copied byte-for-byte; GLBs are exports of runtime geometry, not new artwork. Audio is outside this visual-only collection.\n\n- **UI/**: branding, tutorial, progress bar and fallback-only play artwork.\n- **Textures/**: only the active cannon-tray texture. Apply it to hood/tray GLB UVs using an unlit material, sRGB, and the runtime flipY=false convention. GLBs do not embed this texture.\n- **Fonts/**: Lilita One vector font.\n- **Models/**: portable GLBs plus the original runtime binary/manifest. Arrow/cannon pieces use preview colors; actual instances are recolored and transformed by the renderer. The head inset geometry is also reused for the highlighted outline. The conveyor export preserves the current origin translation.\n- **Layout/**: exact shipped level including embedded artist conveyor.\n- **Materials/**: current #FF4242 preload/cannon palette and surface settings.\n\n## Generated visuals\n\nProjectiles, flash spheres, debris, lane shutters, dots and chevrons are generated in code; their base geometry is exported under Models/Procedural. Runtime scale, poses and animations are not baked into these single-piece exports. The vignette, progress-bar background gradient, caption and ammo outlines, dimmer, safe-area layout and endcard pop are CSS/DOM effects (src/style.css and src/ui/overlay.ts), not image assets. Studio lighting, procedural room reflections and the shadow-catching floor come from src/render/mockupLighting.ts; no static environment image or shadow texture exists to copy. GLB viewers will not reproduce the playable lighting automatically.\n\nUnused texture trials and the unused conveyor-guide.webp are excluded. Runtime_Data retains the packed reference track because it is part of the shipped binary; this level replaces that track with the artist conveyor, so no separate reference-track GLB is exported. Source provenance and SHA-256 values are in inventory.json. Existing reference/client artwork and extracted models retain their original ownership; this export does not grant licensing rights.\n`);
fs.writeFileSync(`${root}/inventory.json`,JSON.stringify({generatedAt:new Date().toISOString(),files:entries,assetCount:entries.length,totalAssetBytes:entries.reduce((n,e)=>n+e.bytes,0),validation:'Copies byte-identical; every exported GLB parsed by Three GLTFLoader'},null,2));
console.log(JSON.stringify({folder:root,assets:entries.length,bytes:entries.reduce((n,e)=>n+e.bytes,0),glbs:entries.filter(e=>e.file.endsWith('.glb')).length}));
