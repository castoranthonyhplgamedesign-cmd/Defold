"""Package the branded Defold build as one self-contained, offline HTML file."""
from pathlib import Path
from datetime import datetime, timezone
import base64
import gzip
import hashlib
import json
import re

ROOT=Path(__file__).resolve().parents[1]
BRAND=json.loads((ROOT/'branding.json').read_text(encoding='utf-8'))
BUILD=json.loads((ROOT/'qa/build.json').read_text(encoding='utf-8'))
if BUILD['exit_code']!=0 or not BUILD.get('inputs_unchanged_during_build'):raise SystemExit('A stable successful build is required.')
for name,digest in BUILD['input_sha256'].items():
    if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=digest:raise SystemExit('Build is stale: '+name)
BUNDLE=ROOT/'build/default'/BRAND['name']
OUTPUT=ROOT.parents[2]/'output'/BRAND['filename']
OUTPUT.parent.mkdir(exist_ok=True)
normalize=lambda name:re.sub('[^a-z0-9]','',Path(name).stem.lower())
for candidate in OUTPUT.parent.iterdir():
    if normalize(candidate.name)==normalize(OUTPUT.name):
        if candidate.name!=OUTPUT.name:raise SystemExit('Conflicting output name: '+candidate.name)
        if 'TokenRollEmbedded'not in candidate.read_text(encoding='utf-8',errors='replace'):raise SystemExit('Output belongs to another artifact; refusing to overwrite it.')

manifest=json.loads((BUNDLE/'archive/archive_files.json').read_text())
names={'archive/archive_files.json',BRAND['executable']+'.wasm',BRAND['executable']+'_wasm.js'}
for content in manifest['content']:
    for piece in content['pieces']:names.add('archive/'+piece['name'])
assets={}
for name in sorted(names):
    data=(BUNDLE/name).read_bytes()
    mime='application/wasm'if name.endswith('.wasm')else 'application/json'if name.endswith('.json')else 'text/javascript'if name.endswith('.js')else 'application/octet-stream'
    assets[name]={'data':base64.b64encode(gzip.compress(data,compresslevel=9,mtime=0)).decode('ascii'),'size':len(data),'mime':mime}

runtime=r'''(()=>{
const assets=__ASSETS__,cache=new Map(),NativeResponse=Response;
function keyFor(value){const url=new URL(String(value?.url||value),document.baseURI);const pathname=decodeURIComponent(url.pathname);return Object.keys(assets).find(key=>pathname.endsWith('/'+key));}
async function get(key){if(!key||!assets[key])throw Error('Embedded asset missing: '+key);if(!cache.has(key))cache.set(key,(async()=>{const item=assets[key],raw=atob(item.data),compressed=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)compressed[i]=raw.charCodeAt(i);const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));const bytes=new Uint8Array(await new NativeResponse(stream).arrayBuffer());if(bytes.byteLength!==item.size)throw Error('Embedded asset size mismatch: '+key);return bytes;})());return cache.get(key);}
window.TokenRollEmbedded={name:'Token Roll',count:Object.keys(assets).length,keyFor,get};
window.fetch=async function(input){const key=keyFor(input),bytes=await get(key);return new NativeResponse(bytes,{status:200,headers:{'Content-Type':assets[key].mime}});};
})();'''.replace('__ASSETS__',json.dumps(assets,separators=(',',':')))
adapter=r'''
// Keep Defold archive assembly/verification while reading every resource in memory.
FileLoader.load=function(url,type,onprogress,onerror,onload,onretry,onverify){
 const resolved=FileLoader.resolveUrl(url,0),key=TokenRollEmbedded.keyFor(resolved);
 TokenRollEmbedded.get(key).then(async bytes=>{
  let value;if(type==='arraybuffer')value=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);else if(type==='json')value=JSON.parse(new TextDecoder().decode(bytes));else value=new TextDecoder().decode(bytes);
  const error=await onverify?.(value);if(error)throw Error(error);onprogress?.(bytes.byteLength);await onload(value,resolved);
 }).catch(error=>{if(onerror)onerror(String(error));else throw error;});
};
EngineLoader.stream_wasm=false;
'''
def script(text):return '<script>'+re.sub('</script',r'<\/script',text,flags=re.I)+'</script>'
html=(BUNDLE/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link\b[^>]*\brel=["\'](?:preload|preconnect)["\'][^>]*>','',html,flags=re.I)
html=html.replace('</head>',script(runtime)+'\n</head>')
loader=(BUNDLE/'dmloader.js').read_text(encoding='utf-8')
if loader.count('script.src = url;')!=1:raise SystemExit('Unexpected engine loader; inspect before packing.')
loader=loader.replace('script.src = url;','script.textContent = response;')
pattern=r'<script\b[^>]*\bsrc=["\']dmloader\.js["\'][^>]*>\s*</script>'
html,count=re.subn(pattern,lambda match:script(loader+adapter),html)
if count!=1:raise SystemExit('Defold loader tag was not replaced.')
html=html.replace('if (window.location.href.startsWith("file://")) {','if (false) {')
if re.search(r'<script\b[^>]*\bsrc\s*=',html,re.I):raise SystemExit('External script survived packaging.')
if re.search(r'<(?:img|link|audio|video)\b[^>]*\b(?:src|href)=["\'](?!data:|#)',html,re.I):raise SystemExit('External resource reference survived packaging.')
OUTPUT.write_text(html,encoding='utf-8',newline='\n')
record={'captured_utc':datetime.now(timezone.utc).isoformat(),'name':BRAND['name'],'file':str(OUTPUT),'bytes':OUTPUT.stat().st_size,'sha256':hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),'embedded_assets':len(assets),'companion_files_required':False,'format':'Single HTML with inline loader and gzip/base64 engine, Wasm and archive assets; embedded icon.'}
(ROOT/'qa/single-html-package.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(json.dumps(record))
