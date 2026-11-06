const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve('analysis');
for(const p of ['original','extracted','assets','screenshots','evidence'])fs.mkdirSync(path.join(root,p),{recursive:true});
const name=fs.readdirSync('.').find(n=>n.endsWith('.html')), input=fs.readFileSync(name),html=input.toString();
fs.writeFileSync(path.join(root,'original',name),input);
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
scripts.forEach((m,i)=>fs.writeFileSync(path.join(root,'extracted',`inline-${i}.${m[1].includes('importmap')?'json':'js'}`),m[2]));
[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].forEach((m,i)=>fs.writeFileSync(path.join(root,'extracted',`inline-${i}.css`),m[1]));
const zip=Buffer.from(html.match(/window\.__zip\s*=\s*"([A-Za-z0-9+/=]+)"/)[1],'base64');
fs.writeFileSync(path.join(root,'extracted','payload.zip'),zip);
let end=zip.length-22;while(end>=0&&zip.readUInt32LE(end)!==0x06054b50)end--;assert(end>=0);
let at=zip.readUInt32LE(end+16);const count=zip.readUInt16LE(end+10),files=[];
for(let i=0;i<count;i++){
 assert.equal(zip.readUInt32LE(at),0x02014b50);const method=zip.readUInt16LE(at+10),compressed=zip.readUInt32LE(at+20),size=zip.readUInt32LE(at+24),nl=zip.readUInt16LE(at+28),el=zip.readUInt16LE(at+30),cl=zip.readUInt16LE(at+32),off=zip.readUInt32LE(at+42),name=zip.subarray(at+46,at+46+nl).toString();at+=46+nl+el+cl;
 const dest=path.resolve(root,'extracted','bundle',name);assert(dest.startsWith(path.join(root,'extracted','bundle')+path.sep));if(name.endsWith('/'))continue;
 assert.equal(zip.readUInt32LE(off),0x04034b50);const start=off+30+zip.readUInt16LE(off+26)+zip.readUInt16LE(off+28),raw=zip.subarray(start,start+compressed);assert([0,8].includes(method));const data=method===8?zlib.inflateRawSync(raw):raw;assert.equal(data.length,size);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data);files.push({name,size,compressed,sha256:crypto.createHash('sha256').update(data).digest('hex')});
}
const manifest={original:name,bytes:input.length,sha256:crypto.createHash('sha256').update(input).digest('hex'),zipBytes:zip.length,files};fs.writeFileSync(path.join(root,'evidence','fingerprint.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
