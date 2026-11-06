import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('D:/Projects/Phaser/Bubble-Cash--Template/node_modules/sharp');
const source='reference/textures/tunnel-121420.webp';
const output='reference/textures/tunnel-3c4374-exact.webp';
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
const target=[60,67,116],shell=[];
for(let i=0;i<data.length;i+=3){
  if(Math.max(data[i],data[i+1],data[i+2])>=64)continue;
  shell.push(i);data.set(target,i);
}
assert(shell.length>info.width*info.height*.2,'Expected dark shell islands');
await sharp(data,{raw:{width:info.width,height:info.height,channels:3}}).webp({lossless:true,effort:6}).toFile(output);
const decoded=await sharp(output).removeAlpha().raw().toBuffer();
assert.deepEqual(decoded,data,'Lossless export must preserve every authored pixel');
for(const i of shell)assert.deepEqual([...decoded.subarray(i,i+3)],target);
fs.copyFileSync(output,'src/assets/textures/tunnel-3c4374-exact.webp');
const result={source,output,width:info.width,height:info.height,filledPixels:shell.length,totalPixels:info.width*info.height,RGB:target,bytes:fs.statSync(output).size,losslessRoundTrip:true};
fs.writeFileSync('analysis/evidence/cannon-texture-3c4374.json',JSON.stringify(result,null,2));console.log(result);
