const fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const files = d => fs.readdirSync(d, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(d,e.name)) : [path.join(d,e.name)]);
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const original = 'arf_mip_smmeemee_gameplay_01_real_nougc_noseason_en_60s_na_al.html';
const expected = '31166b29c782babc3ccbcb7b52168cda8701c08abccbaf1c010660a0aaba4c66';
assert.equal(hash('reference/playable/'+original), expected); assert.equal(hash('analysis/original/'+original), expected);
const required = ['REPORT.md','assets.md','assets.csv','tuning.json','beat-sheet.md','state-machine.md','rebuild-spec.md','screenshots/README.md'];
required.forEach(p => assert(fs.statSync('analysis/'+p).size > 0));
const jsonFiles = files('analysis').filter(p => /\.(json|gltf)$/.test(p));
jsonFiles.forEach(read);
const catalog = read('analysis/evidence/assets-final.json'), summary = read('analysis/evidence/asset-summary.json');
assert.equal(new Set(catalog.map(r=>r.id)).size, 109); assert.equal(catalog.length, summary.cataloguedAssets);
for (const row of catalog) for (const r of row.representations) assert.equal(fs.statSync(r.file).size, r.bytes, r.file);
const assetFiles = files('analysis/assets');
assert.equal(assetFiles.length, summary.exportedFiles);
assert.equal(assetFiles.reduce((n,p)=>n+fs.statSync(p).size,0),summary.exportedBytes);
let references=0;
function checkRefs(value, count, file) {
  if (!value || typeof value!=='object') return;
  if ('__ref__' in value) {assert(Number.isInteger(value.__ref__) && value.__ref__>=0 && value.__ref__<count, file); references++;}
  Object.values(value).forEach(v=>checkRefs(v,count,file));
}
for(const p of files('analysis/assets/serialized')) {const data=read(p); if(data.objects) checkRefs(data.objects,data.objects.length,p);}
let primitives=0, numericComponents=0;
const sizes={5121:1,5123:2,5125:4,5126:4}, widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
for(const file of files('analysis/assets/models')) {
  const g=read(file), buffers=g.buffers.map(b=>fs.readFileSync(path.resolve(path.dirname(file),b.uri)));
  g.buffers.forEach((b,i)=>assert.equal(buffers[i].length,b.byteLength));
  const values=g.accessors.map(a=>{
    const v=g.bufferViews[a.bufferView], b=buffers[v.buffer], size=sizes[a.componentType], width=widths[a.type], stride=v.byteStride||size*width, start=(v.byteOffset||0)+(a.byteOffset||0);
    assert(size&&width); assert((a.byteOffset||0)+(a.count-1)*stride+width*size<=v.byteLength,file);
    const out=[];
    for(let i=0;i<a.count;i++) for(let c=0;c<width;c++) {
      const offset=start+i*stride+c*size;
      const n=a.componentType===5126?b.readFloatLE(offset):size===4?b.readUInt32LE(offset):size===2?b.readUInt16LE(offset):b.readUInt8(offset);
      assert(Number.isFinite(n),file); out.push(n); numericComponents++;
    }
    return out;
  });
  for(const mesh of g.meshes) for(const p of mesh.primitives) {
    const count=g.accessors[p.attributes.POSITION].count;
    assert(values[p.indices].every(n=>Number.isInteger(n)&&n>=0&&n<count),file);
    assert.equal(values[p.indices].length%3,0); primitives++;
  }
}
const tuning=read('analysis/tuning.json');
for(const v of Object.values(tuning.values)) assert(v.status && v.source);
const result={status:'Passed static integrity checks; runtime unavailable',originalSha256:expected,jsonFilesParsed:jsonFiles.length,catalogIds:catalog.length,assetFiles:assetFiles.length,assetBytes:summary.exportedBytes,serializedReferencesChecked:references,meshPrimitivesChecked:primitives,meshNumericComponentsChecked:numericComponents,namedTuningEntries:Object.keys(tuning.values).length,requiredDeliverables:required,runtime:{executed:false,screenshots:0,reason:'Browser failed before navigation; see runtime-failure.json'}};
fs.writeFileSync('analysis/evidence/validation.json',JSON.stringify(result,null,2)); console.log(JSON.stringify(result,null,2));
