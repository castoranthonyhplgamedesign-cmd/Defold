// Reproducible vector-based brand art. No generated raster service is required.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(path.resolve(root,'../../../reference/BBS-Corners/package.json'));
const sharp=require('sharp');
const brand=JSON.parse(fs.readFileSync(path.join(root,'branding.json'),'utf8'));
const dir=path.join(root,'assets/branding');
const mark=fs.readFileSync(path.join(dir,'mark.svg'));
await sharp(mark).png().toFile(path.join(dir,'icon.png'));
// Render the title with the original bold font, then composite it below the mark.
const text=await sharp({text:{text:`<span foreground="#ffffff">${brand.name}</span>`,font:'Roboto Bold 92',fontfile:path.join(root,'assets/Roboto-Bold.ttf'),width:590,height:104,align:'centre',rgba:true}}).png().toBuffer();
const metrics=await sharp(text).metadata();
const smallMark=await sharp(mark).resize(238,238).png().toBuffer();
await sharp({create:{width:640,height:400,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
  .composite([{input:smallMark,left:201,top:10},{input:text,left:Math.round((640-metrics.width)/2),top:276}]).png().toFile(path.join(root,'assets/app_icon.png'));
// Bob's Windows icon replacer requires DIB frames matching all engine sizes.
const sizes=[16,24,32,48,64,96,128,256], frames=[];
for(const size of sizes){
  const rgba=await sharp(mark).resize(size,size).ensureAlpha().raw().toBuffer();
  const maskStride=Math.ceil(size/32)*4;
  const dib=Buffer.alloc(40+size*size*4+maskStride*size);
  dib.writeUInt32LE(40,0);dib.writeInt32LE(size,4);dib.writeInt32LE(size*2,8);dib.writeUInt16LE(1,12);dib.writeUInt16LE(32,14);dib.writeUInt32LE(size*size*4,20);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const source=(y*size+x)*4,target=40+((size-1-y)*size+x)*4;
    dib[target]=rgba[source+2];dib[target+1]=rgba[source+1];dib[target+2]=rgba[source];dib[target+3]=rgba[source+3];
    if(rgba[source+3]===0)dib[40+size*size*4+(size-1-y)*maskStride+(x>>3)]|=1<<(7-(x%8));
  }
  frames.push(dib);
}
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;
for(let i=0;i<sizes.length;i++){
  const at=6+i*16;header[at]=sizes[i]===256?0:sizes[i];header[at+1]=header[at];header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);
  header.writeUInt32LE(frames[i].length,at+8);header.writeUInt32LE(offset,at+12);offset+=frames[i].length;
}
fs.writeFileSync(path.join(dir,'icon.ico'),Buffer.concat([header,...frames]));
console.log(`Created ${brand.name} logo, browser icon and Windows icon from mark.svg.`);
