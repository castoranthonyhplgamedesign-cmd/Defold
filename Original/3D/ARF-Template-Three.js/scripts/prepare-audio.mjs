import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sources={select:'15d47550-97fa-4cfd-a531-44b4408bfd88',wrong:'f7f2f9b5-b3a2-4066-96b7-f22e35c2815d',shoot:'f971e4e6-90a4-4fd2-b90f-3411411a8a14',slidey:'e6060c36-4a3f-41eb-be39-82f3cde65b43'};
fs.mkdirSync('src/assets/audio',{recursive:true});const assets=[];
for(const [name,id] of Object.entries(sources)){
  const source=`analysis/assets/native/${id}.wav`,output=`src/assets/audio/${name}.wav`,bytes=fs.readFileSync(source);
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WAVE');fs.writeFileSync(output,bytes);
  assets.push({name,source,output,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),conversion:'None; byte-identical supplied PCM WAV'});
}
fs.writeFileSync('analysis/evidence/audio-assets.json',JSON.stringify({assets,totalBytes:assets.reduce((n,a)=>n+a.bytes,0)},null,2));
