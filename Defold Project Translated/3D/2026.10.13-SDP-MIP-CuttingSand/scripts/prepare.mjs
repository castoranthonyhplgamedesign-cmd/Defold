// Offline asset conversion only. The shipped runtime is Defold/Lua.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {build,transform} from 'esbuild';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const ref='tools/reference';
for(const d of ['assets/images','assets/data','docs','web/audio'])await fs.mkdir(d,{recursive:true});
const config=JSON.parse(await fs.readFile(ref+'/src/projectDefaults.json'));
const constants=await transform(await fs.readFile(ref+'/src/constants.ts','utf8'),{loader:'ts',format:'esm'});
const K=await import('data:text/javascript;base64,'+Buffer.from(constants.code).toString('base64'));
const result=await build({entryPoints:[ref+'/src/game/sandGrid.ts'],bundle:true,format:'esm',write:false});
const {SandGrid}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const image=await sharp(ref+'/Assets/Runtime/images/sand-picture.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
const cols=config.SAND.columns,pr=image.info.height,grain=K.LAYOUT.picture.w/cols;
if(image.info.width!==cols)throw Error('Re-export grid for new column count');
const shape={straightRows:Math.max(0,Math.round((K.LAYOUT.frame.sideBottom-K.LAYOUT.picture.y-pr*grain)/grain)),funnelRows:Math.max(1,Math.round((K.LAYOUT.frame.mouthY-Math.max(K.LAYOUT.frame.sideBottom,K.LAYOUT.picture.y+pr*grain))/grain)),mouthHalf:K.LAYOUT.frame.mouthHalf/grain};
const rows=pr+shape.straightRows+shape.funnelRows,cells=new Uint8Array(cols*rows);
function nearest(r,g,b){let best=0,dist=Infinity;for(let c=0;c<config.SAND.palette.length;c++){const a=config.SAND.palette[c],d=(r-a[0])**2+(g-a[1])**2+(b-a[2])**2;if(d<dist){dist=d;best=c+1}}return best}
for(let p=0;p<cols*pr;p++)if(image.data[p*4+3]>=128)cells[p]=nearest(...image.data.subarray(p*4,p*4+3));
const grid=new SandGrid(cols,pr,rows,cells,shape);
await fs.writeFile('assets/data/cells.bin',grid.cells);
await fs.writeFile('assets/data/shades.bin',grid.shade);
const regions=Buffer.alloc(cols*pr*2);for(let p=0;p<cols*pr;p++)regions.writeUInt16LE(grid.region[p],p*2);
await fs.writeFile('assets/data/regions.bin',regions);
await fs.writeFile('assets/data/level.json',JSON.stringify({cols,pr,rows,shape,total:grid.total,seed:grid.seed,totals:Array.from(grid.colorCounts),patches:grid.patches()}));
await fs.writeFile('assets/data/config.json',JSON.stringify({...config,LAYOUT:K.LAYOUT,TIMING:K.TIMING,ART_SCALE:K.ART_SCALE}));
function lua(x){if(x===null)return 'nil';if(typeof x==='string')return JSON.stringify(x);if(typeof x!=='object')return String(x);return '{'+Object.entries(x).map(([k,v])=>(Array.isArray(x)?'':'['+JSON.stringify(k)+']=')+lua(v)).join(',')+'}'}
await fs.writeFile('qa/fixture.lua','return '+lua({level:{cols,pr,rows,shape,total:grid.total,seed:grid.seed,totals:Array.from(grid.colorCounts)},config:{...config,LAYOUT:K.LAYOUT,TIMING:K.TIMING,ART_SCALE:K.ART_SCALE}}));
const initial=Buffer.from(grid.cells),shadeInitial=Buffer.from(grid.shade);
function checksum(a){let n=0;for(let i=0;i<a.length;i++)n=(n+a[i]*(i%65521+1))%2147483647;return n}
const oracle=[];
for(const mechanic of ['tap','cut']){
 const g=new SandGrid(cols,pr,rows,new Uint8Array(initial),shape);g.setCuttable(config.BUCKETS.waves[0]);g.setExitHandler(()=>true);
 if(mechanic==='tap'){const p=g.patches().filter(p=>p.color===10).sort((a,b)=>b.maxRow-a.maxRow||b.size-a.size)[0];const cell=p.bottom;g.cut(cell,cell%cols,Math.floor(cell/cols),K.TIMING.tapRipple,K.TIMING.tapJitter,K.TIMING.dropJitter)}
 else g.cutBelow([0,145,cols-1,145],K.TIMING.cutReach,K.TIMING.cutEdgeSnap,K.TIMING.cutTopSnap,K.TIMING.cutJitter,K.TIMING.dropJitter);
 g.crumbleLeftovers(config.BUCKETS.waves[0],K.TIMING.leftoverShare,K.TIMING.leftoverGrains,K.TIMING.cutJitter,K.TIMING.dropJitter);
 const trace=[];for(let frame=0;frame<=240;frame++){if(frame%30===0)trace.push({frame,remaining:g.remaining,loose:g.looseTotal,exited:g.exitedPicture,staticChecksum:checksum(g.cells),looseChecksum:checksum(g.loose)});g.step(1000/60,config.SAND.gravity/grain,K.TIMING.maxFallSpeed)}oracle.push({mechanic,trace});
}
await fs.writeFile('qa/oracle.json',JSON.stringify(oracle,null,2));
const manifest=[];let atlas='';
for(const slot of config.CHANGABLE_TEXTURES){
 const src=`${ref}/Assets/Runtime/images/${slot.uuid}.${slot.format}`,dest=`assets/images/${slot.uuid}.png`;
 await sharp(src).ensureAlpha().png().toFile(dest);
 manifest.push({source:src.replace(ref+'/', ''),destination:dest,conversion:'WebP decoded to PNG, dimensions preserved',sha256:crypto.createHash('sha256').update(await fs.readFile(src)).digest('hex')});
 if(!slot.uuid.startsWith('sand-picture'))atlas+=`images { image: "/${dest}" }\n`;
}
await fs.copyFile(ref+'/Assets/Font/Nunito-Black.ttf','assets/Nunito-Black.ttf');
for(const s of config.CHANGABLE_SOUNDTRACKS){const src=`${ref}/Assets/Runtime/audio/${s.uuid}.${s.format}`,dest=`web/audio/${s.uuid}.${s.format}`;await fs.copyFile(src,dest);manifest.push({source:src.replace(ref+'/',''),destination:dest,conversion:'Unmodified',sha256:crypto.createHash('sha256').update(await fs.readFile(src)).digest('hex')})}
await fs.writeFile('assets/art.atlas',atlas+'margin: 0\nextrude_borders: 2\ninner_padding: 0\n');
// Exact offline HD ownership calculation from PictureHd; minimal display stubs
// allow the source implementation to export its owner table without Phaser.
const hd=await sharp('assets/images/sand-picture-hd.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
globalThis.ImageData=class{constructor(data,w,h){this.data=data;this.width=w;this.height=h}};
globalThis.document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(hd.data)})})})};
let source=await fs.readFile(ref+'/src/game/PictureHd.ts','utf8');
source=source.replace(/^import .*$/gm,'');
source='const Phaser={Textures:{FilterMode:{LINEAR:1}}};const WALL=255; const DEPTH={SAND:2};const LAYOUT='+JSON.stringify(K.LAYOUT)+';const TIMING='+JSON.stringify(K.TIMING)+';class DesignImage{constructor(){}setDepth(){return this}};\n'+source;
const mod=await transform(source,{loader:'ts',format:'esm'});const {PictureHd}=await import('data:text/javascript;base64,'+Buffer.from(mod.code).toString('base64'));
const scene={textures:{exists:()=>true,get:()=>({getSourceImage:()=>({width:hd.info.width,height:hd.info.height})}),remove(){},createCanvas:()=>({setFilter(){},context:{putImageData(){}},refresh(){}})}};
const pic=PictureHd.create(scene,{},grid,new Uint8Array(cols*pr),config.SAND.palette,grain);
const owners=Buffer.alloc(pic.owner.length*2);for(let p=0;p<pic.owner.length;p++)owners.writeUInt16LE(pic.owner[p],p*2);
await fs.writeFile('assets/data/owners.bin',owners);
await fs.writeFile('docs/ASSET_MANIFEST.json',JSON.stringify({branch:'cantReach',commit:'8a241d35af7e59acaa1aa092505dafab9db7ea40',assets:manifest,offlineData:'cells/shades/regions from original SandGrid; owners from original PictureHd. No original runtime is embedded.'},null,2));
console.log(JSON.stringify({cols,pr,rows,total:grid.total,shapes:grid.patches().length,assets:manifest.length}));
await import('./prepare-fx.mjs');
const sustained=(await fs.readFile(ref+'/src/game/SustainedAudio.ts','utf8')).replace(/^import .*$/gm,'');
await fs.writeFile('web/sustained.js',(await transform(sustained,{loader:'ts',format:'iife',globalName:'SandAudio'})).code);
if(await fs.stat('assets/branding/icon-source.png').catch(()=>null))await import('./branding.mjs');
