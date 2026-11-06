// One offline HTML; all WASM, archives, scripts, images, fonts and audio inline.
import fs from 'node:fs';import path from 'node:path';import{gzipSync}from'node:zlib';import crypto from'node:crypto';
const brand=JSON.parse(fs.readFileSync('branding.json','utf8'));const bundle=path.resolve('bundle',brand.name);const output=path.resolve('../../../output',brand.packageName+'.html');
const escapeScript=s=>s.replace(/<\/script/gi,'<\\/script');const script=s=>'<script>'+escapeScript(s)+'</script>';
const assets={};
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else{
 const key=path.relative(bundle,p).replaceAll('\\','/');if(key==='index.html'||key==='dmloader.js'||key.startsWith('.'))continue;
 const raw=fs.readFileSync(p);const ext=path.extname(key);const mime={'.wasm':'application/wasm','.js':'application/javascript','.json':'application/json','.mp3':'audio/mpeg','.png':'image/png'}[ext]||'application/octet-stream';assets[key]={data:gzipSync(raw,{level:9,mtime:0}).toString('base64'),size:raw.length,mime};
}}}walk(bundle);
const runtime=`(()=>{
const assets=${JSON.stringify(assets)},cache=new Map();
function keyFor(value){const url=new URL(String(value?.url||value),document.baseURI);const pathname=decodeURIComponent(url.pathname);return Object.keys(assets).find(key=>pathname.endsWith('/'+key));}
async function get(key){if(!key||!assets[key])throw Error('Embedded asset missing: '+key);if(!cache.has(key))cache.set(key,(async()=>{const item=assets[key],binary=atob(item.data),compressed=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)compressed[i]=binary.charCodeAt(i);const decoded=new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());if(decoded.byteLength!==item.size)throw Error('Embedded size mismatch: '+key);return decoded;})());return cache.get(key);}
window.SandSliceEmbedded={name:${JSON.stringify(brand.name)},count:Object.keys(assets).length,keyFor,get};
window.fetch=async function(input){const key=keyFor(input),bytes=await get(key);return new Response(bytes,{status:200,headers:{'Content-Type':assets[key].mime}});};
})();`;
const adapter=`
FileLoader.load=function(url,type,onprogress,onerror,onload,onretry,onverify){
 const resolved=FileLoader.resolveUrl(url,0),key=SandSliceEmbedded.keyFor(resolved);
 SandSliceEmbedded.get(key).then(async bytes=>{
  let value;if(type==='arraybuffer')value=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);else if(type==='json')value=JSON.parse(new TextDecoder().decode(bytes));else value=new TextDecoder().decode(bytes);
  const error=onverify?await onverify(value):null;if(error)throw Error(error);if(onprogress)onprogress(bytes.byteLength);if(onload)await onload(value,resolved);
 }).catch(error=>{if(onerror)onerror(String(error));else throw error;});
};EngineLoader.stream_wasm=false;Module.persistentStorage=false;
`;
let html=fs.readFileSync(path.join(bundle,'index.html'),'utf8');
html=html.replace(/<link\b[^>]*\brel=["'](?:preload|preconnect)["'][^>]*>/gi,'');
html=html.replace('</head>',()=>script(runtime)+'\n</head>');
let loader=fs.readFileSync(path.join(bundle,'dmloader.js'),'utf8');
if(loader.split('script.src = url;').length!==2)throw Error('Defold script loader changed');
loader=loader.replace('script.src = url;','script.textContent = response;');
const tag=/<script\b[^>]*\bsrc=["']dmloader\.js["'][^>]*><\/script>/;
if(!tag.test(html))throw Error('Expected Defold loader element');html=html.replace(tag,()=>script(loader+adapter));
html=html.replace('if (window.location.href.startsWith("file://")) {','if (false) {');
if(/<script\b[^>]*\bsrc\s*=/i.test(html))throw Error('External script tag survived packing');
if(!html.includes(`<title>${brand.name}</title>`))throw Error('Wrong title');
const normalized=s=>s.replace(/[^a-z0-9]/gi,'').toLowerCase();fs.mkdirSync(path.dirname(output),{recursive:true});
for(const name of fs.readdirSync(path.dirname(output))){if(path.extname(name).toLowerCase()!=='.html')continue;if(normalized(path.basename(name,'.html'))===normalized(brand.packageName)&&name!==path.basename(output))throw Error('Duplicate game output: '+name);}
if(fs.existsSync(output)&&!fs.readFileSync(output,'utf8').includes('window.SandSliceEmbedded='))throw Error('Output name belongs to another file; refusing overwrite');
fs.writeFileSync(output,html);
const report={name:brand.name,file:output,bytes:Buffer.byteLength(html),sha256:crypto.createHash('sha256').update(html).digest('hex'),embeddedAssets:Object.keys(assets),companionFilesRequired:false,publicDeployment:false};fs.writeFileSync('qa/single-html-package.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({file:output,bytes:report.bytes,embeddedAssets:report.embeddedAssets.length}));
