"""Embed the validated Ring Sort HTML5 bundle in one offline-capable HTML file."""
from pathlib import Path
import base64,gzip,json,re,hashlib,datetime
root=Path(__file__).resolve().parent.parent
bundle=root/'local-publish/Ring Sort'
output=root.parents[2]/'output/Ring Sort.html'
def b64(data):return base64.b64encode(data).decode('ascii')
def dataurl(path,mime):return 'data:'+mime+';base64,'+b64((bundle/path).read_bytes())
assets={}
for p in sorted(bundle.rglob('*')):
 if not p.is_file():continue
 key=p.relative_to(bundle).as_posix()
 if key=='index.html' or key=='dmloader.js' or key.startswith('branding/'):continue
 raw=p.read_bytes()
 mime='application/wasm' if key.endswith('.wasm') else 'audio/mpeg' if key.endswith('.mp3') else 'application/json' if key.endswith('.json') else 'text/javascript' if key.endswith('.js') else 'application/octet-stream'
 assets[key]={'data':b64(gzip.compress(raw,compresslevel=9,mtime=0)),'size':len(raw),'mime':mime}
runtime=r'''(()=>{
const assets=__ASSETS__,cache=new Map(),NativeResponse=Response;
function keyFor(value){const url=new URL(String(value?.url||value),document.baseURI);const path=decodeURIComponent(url.pathname);return Object.keys(assets).find(key=>path.endsWith('/'+key));}
async function get(key){if(!key||!assets[key])throw Error('Embedded asset missing: '+key);if(!cache.has(key))cache.set(key,(async()=>{const item=assets[key],raw=atob(item.data),compressed=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)compressed[i]=raw.charCodeAt(i);const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));const bytes=new Uint8Array(await new NativeResponse(stream).arrayBuffer());if(bytes.byteLength!==item.size)throw Error('Embedded asset size mismatch: '+key);return bytes;})());return cache.get(key);}
window.RingSortEmbedded={count:Object.keys(assets).length,keyFor,get};
window.fetch=async function(input){const key=keyFor(input);const bytes=await get(key);return new NativeResponse(bytes,{status:200,headers:{'Content-Type':assets[key].mime}});};
})();'''.replace('__ASSETS__',json.dumps(assets,separators=(',',':')))
adapter=r'''
// Defold's loader is kept intact except that resource reads come from embedded bytes.
FileLoader.load=function(url,type,onprogress,onerror,onload,onretry,onverify){
 const resolved=FileLoader.resolveUrl(url,0),key=RingSortEmbedded.keyFor(resolved);
 RingSortEmbedded.get(key).then(bytes=>{
  let value;if(type==='arraybuffer')value=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);else if(type==='json')value=JSON.parse(new TextDecoder().decode(bytes));else value=new TextDecoder().decode(bytes);
  const error=onverify?.(value);if(error)throw Error(error);onprogress?.(bytes.byteLength);onload(value,resolved);
 }).catch(error=>{if(onerror)onerror(String(error));else throw error;});
};
EngineLoader.stream_wasm=false;
'''
def script(text):return '<script>'+text.replace('</script','<\\/script')+'</script>'
html=(bundle/'index.html').read_text(encoding='utf-8')
# Remove network preloads: all engine/archive requests below are now memory reads.
html=re.sub(r'<link\b[^>]*\brel=["\'](?:preload|preconnect)["\'][^>]*>', '',html,flags=re.I)
for file,mime in [('icon-32.png','image/png'),('icon-180.png','image/png')]:html=html.replace('branding/'+file,dataurl('branding/'+file,mime))
manifest=json.loads((bundle/'branding/manifest.webmanifest').read_text())
manifest['start_url']='./Ring Sort.html'
for icon in manifest['icons']:icon['src']=dataurl('branding/'+icon['src'],'image/png')
html=html.replace('branding/manifest.webmanifest','data:application/manifest+json;base64,'+b64(json.dumps(manifest,separators=(',',':')).encode()))
html=html.replace('</head>',script(runtime)+'\n</head>')
loader=(bundle/'dmloader.js').read_text(encoding='utf-8')
assert loader.count('script.src = url;')==1
loader=loader.replace('script.src = url;','script.textContent = response;')
tag='<script id=\'engine-loader\' type=\'text/javascript\' src="dmloader.js"></script>'
assert tag in html
html=html.replace(tag,script(loader+adapter))
html=html.replace('if (window.location.href.startsWith("file://")) {','if (false) {')
# File-opened builds are local previews too: preserve QA support and suppress store opens.
html=html.replace("['127.0.0.1','localhost'].includes(location.hostname)","(['127.0.0.1','localhost'].includes(location.hostname)||location.protocol==='file:')")
assert not re.search(r'<script\b[^>]*\bsrc\s*=',html,re.I),'External script remains'
output.parent.mkdir(parents=True,exist_ok=True)
# One stable filename for this game; never touch unrelated game exports.
obsolete=(output.parent/'Sinonimus.html').resolve()
assert obsolete.parent==output.parent.resolve()
if obsolete.exists():obsolete.unlink()
output.write_text(html,encoding='utf-8')
record={'date':datetime.datetime.now().isoformat(),'file':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'embedded_assets':len(assets),'format':'Single HTML: inline scripts, gzip/base64 wasm/archive/audio, data-URL icons and manifest'}
(root/'qa/single-html-package.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
