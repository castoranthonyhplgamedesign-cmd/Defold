import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('D:/Projects/Phaser/Bubble-Cash--Template/node_modules/sharp');
const source = 'analysis/assets/native/';
const assets = {
  title: 'e9ba55d5-a84e-4356-9314-6c3d429c78c3',
  play: '7ee7c69f-f28a-4986-8d93-f51a03f19e78',
  icon: 'ebadcded-6f27-4491-afaf-84fc212b18a4',
  'hand-idle': 'f571e731-662a-47d5-97ac-a8a7f089bf7d',
  'hand-tap': '6df3381d-185f-4eaa-abbd-556744d82f44',
  'meter-border': '7d9879b2-c46d-4447-ad18-2c7a71f658cf',
  'meter-fill': 'c25ecc7a-5291-441f-be5d-8845567f2c92',
};
fs.mkdirSync('src/assets/ui', {recursive:true});
const manifest = [];
for (const [name,id] of Object.entries(assets)) {
  let image = sharp(`${source}${id}.png`);
  const frame=JSON.parse(fs.readFileSync(`analysis/assets/serialized/${id}@f9941.json`)).objects[0].content;
  const {x:left,y:top,width,height}=frame.rect;
  const crop={left,top,width,height};
  if (crop) image = image.extract(crop);
  const output = `src/assets/ui/${name}.webp`;
  const info = await image.webp({lossless:true}).toFile(output);
  assert(info.width > 0 && info.size > 0);
  manifest.push({output,source:`${source}${id}.png`,crop,...info});
}
fs.copyFileSync(`${source}LilitaOne-Regular.ttf`, 'src/assets/ui/LilitaOne-Regular.ttf');
await sharp(`${source}111e5ae7-b6bd-44cf-bd61-943063308bd6.png`).webp({lossless:true}).toFile('src/assets/ui/conveyor-guide.webp');
// Decode numeric curve data only; never execute the supplied playable.
const ccon = fs.readFileSync(`${source}612b568c-6e7e-4b82-a194-d0cb5b2656f1.ccon`);
assert.equal(ccon.subarray(0,4).toString(), 'CCON');
const chunk = Math.ceil((16 + ccon.readUInt32LE(12)) / 8) * 8;
assert.equal(ccon.readUInt32LE(chunk),180);
let cursor = chunk + 4 + 2;
const count = ccon.readUInt32LE(cursor); cursor += 4; assert.equal(count,2);
const times = [ccon.readFloatLE(cursor),ccon.readFloatLE(cursor+4)]; cursor += 8;
const keys = [];
for (let i=0;i<count;i++) {
  const flags = ccon.readUInt32LE(cursor); cursor+=4;
  const key = {value:ccon.readFloatLE(cursor),interpolation:0,weightMode:0,leftTangent:0,leftWeight:0,rightTangent:0,rightWeight:0}; cursor+=4;
  if(flags&2) key.interpolation=ccon[cursor++];
  if(flags&4) key.weightMode=ccon[cursor++];
  for(const [flag,name] of [[8,'leftTangent'],[16,'leftWeight'],[32,'rightTangent'],[64,'rightWeight']]) if(flags&flag) {key[name]=ccon.readFloatLE(cursor);cursor+=4;}
  assert.equal(key.interpolation,2); keys.push(key);
}
assert.equal(cursor,chunk+4+58); assert.deepEqual(times,[0,2]);
const [a,b]=keys, duration=times[1];
const controls=[Math.cos(Math.atan(a.rightTangent))*a.rightWeight/duration,a.value+Math.sin(Math.atan(a.rightTangent))*a.rightWeight,1-Math.cos(Math.atan(b.leftTangent))*b.leftWeight/duration,b.value-Math.sin(Math.atan(b.leftTangent))*b.leftWeight];
assert(controls.every(Number.isFinite)); assert(controls[0]>=0 && controls[2]<=1 && controls[0]<controls[2]);
fs.writeFileSync('src/data/cta-pulse.json', JSON.stringify({duration,start:a.value,end:b.value,controls},null,2)+'\n');
fs.writeFileSync('analysis/evidence/milestone-4-ui-assets.json',JSON.stringify({manifest,font:`${source}LilitaOne-Regular.ttf`,pulse:{source:`${source}612b568c-6e7e-4b82-a194-d0cb5b2656f1.ccon`,times,keys,controls,wrap:'PingPong (22)'}},null,2));
console.log(JSON.stringify({assets:manifest.length,bytes:manifest.reduce((n,a)=>n+a.size,0),controls}));
