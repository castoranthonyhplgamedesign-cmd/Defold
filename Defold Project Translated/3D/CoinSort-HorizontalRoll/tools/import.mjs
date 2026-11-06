// Convert the original FBX and executable constants without changing Original.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import * as THREE from './reference/node_modules/three/build/three.module.js';
import { FBXLoader } from './reference/node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { transformSync } from './reference/node_modules/esbuild/lib/main.js';

for (const dir of ['assets','assets/meshes','assets/images','assets/audio','main','render','web','docs','qa','scripts']) fs.mkdirSync(dir,{recursive:true});
const ts = fs.readFileSync('tools/reference/src/constants.ts','utf8');
fs.writeFileSync('tools/constants.generated.mjs',transformSync(ts,{loader:'ts',format:'esm'}).code);
const config = await import(pathToFileURL(process.cwd()+'/tools/constants.generated.mjs'));
fs.writeFileSync('docs/source-constants.json',JSON.stringify(config,null,2)+'\n');
function lua(v) {
  if(v === null) return 'nil';
  if(typeof v === 'number' || typeof v === 'boolean') return String(v);
  if(typeof v === 'string') return JSON.stringify(v);
  if(Array.isArray(v)) return '{'+v.map(lua).join(',')+'}';
  return '{'+Object.entries(v).map(([k,x])=>'['+JSON.stringify(k)+']='+lua(x)).join(',')+'}';
}
fs.writeFileSync('main/config.lua','-- Generated from original constants.ts; run node tools/import.mjs.\nreturn '+lua(config)+'\n');
THREE.TextureLoader.prototype.load = function(){return new THREE.Texture();};
const fbxPath='tools/reference/Assets/models/Coin.fbx';
const fbx=fs.readFileSync(fbxPath);
const root=new FBXLoader().parse(fbx.buffer.slice(fbx.byteOffset,fbx.byteOffset+fbx.byteLength),'');
root.updateMatrixWorld(true);
const bounds=new THREE.Box3().setFromObject(root), center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
const verts=[], norms=[], uvs=[];
let meshCount=0;
const materials=[];
root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  meshCount++;
  for(const m of (Array.isArray(mesh.material)?mesh.material:[mesh.material]))materials.push({type:m.type,shininess:m.shininess,specular:m.specular?.toArray(),map:m.map?{flipY:m.map.flipY,matrix:m.map.matrix.toArray()}:null});
  let g=mesh.geometry.clone();
  if(g.index)g=g.toNonIndexed();
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  let lo=Infinity,hi=-Infinity;
  for(let i=0;i<p.count;i++)if(Math.abs(n.getX(i))>=.7 && uv.getX(i)>=.67){lo=Math.min(lo,uv.getX(i));hi=Math.max(hi,uv.getX(i));}
  const nm=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  for(let i=0;i<p.count;i+=3)for(const j of [i,i+2,i+1]){
    const v=new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(mesh.matrixWorld).sub(center).multiplyScalar(42/Math.max(.001,Math.max(size.x,size.y)));
    const normal=new THREE.Vector3().fromBufferAttribute(n,j).applyMatrix3(nm).normalize();
    verts.push(...v.toArray());norms.push(...normal.toArray());
    let u=uv.getX(j);if(Math.abs(n.getX(j))>=.7&&u>=.67&&Number.isFinite(lo))u=lo+hi-u;
    uvs.push(u,uv.getY(j));
  }
});
fs.writeFileSync('assets/coin-geometry.json',JSON.stringify({positions:verts,normals:norms,uvs}));
const manifest={baseline:'ccb8e2b210a432272e0e4147a64b163484c4aa70',branch:'main',meshCount,vertices:verts.length/3,originalBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},conversion:'FBXLoader geometry and world transforms; center and scale as original 60px footprint times 0.7; reverse winding and mirror numbered-cap U coordinates exactly as Coin3DController.prepareTemplate3D.',assets:[]};
for(const file of ['src/constants.ts','src/game/CoinCylinderLevel.ts','src/game/Coin3DController.ts','Assets/models/Coin.fbx']){
  manifest.assets.push({source:file,sha256:crypto.createHash('sha256').update(fs.readFileSync('tools/reference/'+file)).digest('hex')});
}
manifest.materials=materials;
fs.writeFileSync('docs/asset-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({meshCount,vertices:verts.length/3,size:size.toArray(),materials,colors:Object.keys(config.LEVEL_EDITOR_CONFIG.colorTypes)}));
