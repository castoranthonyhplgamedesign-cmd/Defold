// Execute the original procedural praise painter offline; no substitute artwork.
import fs from 'node:fs/promises';import {transform}from'esbuild';import{chromium}from'playwright';
const source=(await fs.readFile('tools/reference/src/game/Praise.ts','utf8')).replace(/^import .*$/gm,'');
let code=(await transform(source,{loader:'ts',format:'esm'})).code.replace(/export\s*\{[\s\S]*?\};/g,'');
const font=(await fs.readFile('assets/Nunito-Black.ttf')).toString('base64');
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
const outputs=await page.evaluate(async({code,font})=>{
 const face=new FontFace('NunitoBlack',`url(data:font/ttf;base64,${font})`);document.fonts.add(face);await face.load();
 const textures=new Map();const scene={textures:{exists:k=>textures.has(k),createCanvas(k,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const t={context:c.getContext('2d'),refresh(){},canvas:c};textures.set(k,t);return t;}}};
 const Praise=new Function("const FX_TEXTURES={PRAISE:'praise-'};const GAME_FONT='NunitoBlack';"+code+';return Praise')();const painter=new Praise(scene,{});const out=[];
 for(const word of ['WAVE 1','WAVE 2','WAVE 3','GREAT!','AWESOME!','AMAZING!']){const k=painter.texture(word);const c=textures.get(k).canvas;out.push({word,key:'praise-'+word.toLowerCase().replace(/[^a-z0-9]/g,''),width:c.width,height:c.height,png:c.toDataURL('image/png').split(',')[1]});}
 const ring=document.createElement('canvas');ring.width=ring.height=128;const r=ring.getContext('2d');r.lineWidth=9;r.strokeStyle='white';r.beginPath();r.arc(64,64,58,0,Math.PI*2);r.stroke();out.push({word:'ring',key:'fx-ring',width:128,height:128,png:ring.toDataURL().split(',')[1]});
 const glow=document.createElement('canvas');glow.width=glow.height=128;const g=glow.getContext('2d');const gradient=g.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.35,'rgba(255,255,255,0.6)');gradient.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gradient;g.fillRect(0,0,128,128);out.push({word:'glow',key:'fx-glow',width:128,height:128,png:glow.toDataURL().split(',')[1]});return out;
},{code,font});await browser.close();
const C=JSON.parse(await fs.readFile('assets/data/config.json'));C.FX={};let atlas=await fs.readFile('assets/art.atlas','utf8');
for(const o of outputs){await fs.writeFile(`assets/images/${o.key}.png`,Buffer.from(o.png,'base64'));C.FX[o.word]={key:o.key,width:o.width,height:o.height};atlas+=`images { image: "/assets/images/${o.key}.png" }\n`;}
await fs.writeFile('assets/art.atlas',atlas);await fs.writeFile('assets/data/config.json',JSON.stringify(C));
const manifest=JSON.parse(await fs.readFile('docs/ASSET_MANIFEST.json'));manifest.proceduralEffects={source:'src/game/Praise.ts: texture and src/scenes/BootScene.ts: generateEffectTextures',conversion:'Original Nunito font and canvas paint instructions rasterized offline in Chrome; runtime animation is Lua',outputs:outputs.map(({png,...x})=>x)};await fs.writeFile('docs/ASSET_MANIFEST.json',JSON.stringify(manifest,null,2));
