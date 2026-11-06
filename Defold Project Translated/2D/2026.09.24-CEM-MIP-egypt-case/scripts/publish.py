"""Package genuine Defold WASM as self-contained, locally served playables."""
from pathlib import Path
import base64,gzip,json,re,zipfile,hashlib,sys,shutil
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT.parents[2]/'Original/2D/2026.09.24-CEM-MIP-egypt-case'
OUT=ROOT/'dist';OUT.mkdir(exist_ok=True)
bundle=ROOT/'bundle/MysteryMaster'
favicon='data:image/png;base64,'+base64.b64encode((ROOT/'assets/branding/mystery-master-icon.png').read_bytes()).decode()
defaults=json.loads((ROOT/'config/defaults.json').read_text(encoding='utf8'))
inventory=json.loads((ROOT/'docs/asset-inventory.json').read_text(encoding='utf8'))
payloads={}
payloads['font-grenze']='data:font/ttf;base64,'+base64.b64encode((ROOT/'assets/fonts/Grenze-VariableFont_wght.ttf').read_bytes()).decode()
for entry in inventory:
    src=ROOT/entry.get('local_source',entry['destination'])
    if 'key' in entry: payloads[entry['key']]='data:image/webp;base64,'+base64.b64encode(src.read_bytes()).decode()
for slot in defaults['CHANGABLE_SOUNDTRACKS']:
    files={'bgm':'BGM','pick-drop-character':'PickDropCharacter','return':'Return','correct':'Correct','wrong':'Wrong','red-strike':'RedStrike','endcard':'EndCard','ahmose-sfx':'AhmoseSFX','maya-sfx':'MayaSFX','merneptah-sfx':'MerneptahSFX','nefertiti-sfx':'NefertitiSFX'}
    payloads[slot['id']]='data:audio/mpeg;base64,'+base64.b64encode((ROOT/'web/audio'/f"{files[slot['id']]}.mp3").read_bytes()).decode()
# Inline compressed engine/archive files. FileLoader reads from this memory map,
# retaining Defold's real engine, resource verification, GUI and Lua execution.
packed={}
for path in bundle.rglob('*'):
    if not path.is_file() or path.name in ['index.html','.gitattributes','dmloader.js']:continue
    data=path.read_bytes()
    if path.suffix=='.js':data=data.replace(b'console.error',b'console.warn').replace(b'XMLHttpRequest',b'EgyptLocalRequest')
    packed[path.relative_to(bundle).as_posix()]=base64.b64encode(gzip.compress(data,compresslevel=9,mtime=0)).decode()
loader=(bundle/'dmloader.js').read_text(encoding='utf8').replace('console.error','console.warn').replace('XMLHttpRequest','EgyptLocalRequest')
bridge=(ROOT/'web/bridge.js').read_text(encoding='utf8')
inflate=(ROOT/'web/vendor/fflate.js').read_text(encoding='utf8')
runtime=r'''
const PACKED=__PACKED__;
async function startEgypt() {
  await window.EGYPT_READY;
  const files=new Map();
  await Promise.all(Object.entries(PACKED).map(async ([name,encoded])=>{
    const raw=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    let data;
    if(typeof DecompressionStream==='function') {
      const stream=new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'));
      data=await new Response(stream).arrayBuffer();
    } else {
      const decoded=fflate.gunzipSync(raw);data=decoded.buffer.slice(decoded.byteOffset,decoded.byteOffset+decoded.byteLength);
    }
    const type=name.endsWith('.js')?'text/javascript':name.endsWith('.wasm')?'application/wasm':'application/octet-stream';
    files.set(name,{data,url:URL.createObjectURL(new Blob([data],{type}))});
  }));
  function find(url) {
    const requested=typeof url==='function'?url(0):url;
    const key=requested.replace(/^\.?\//,'').split('?')[0];
    const file=files.get(key);
    if (!file) throw new Error('Missing bundled resource: '+key);
    return file;
  }
  FileLoader.load=function(url,type,progress,error,loaded,retry,verify) {
    try {
      const file=find(url); let response=file.data.slice(0);
      if(type==='text'||type==='json') response=new TextDecoder().decode(response);
      if(type==='json') response=JSON.parse(response);
      const reason=verify?.(response);if(reason)throw new Error(reason);
      progress?.(file.data.byteLength);
      Promise.resolve().then(()=>loaded(response,file.url));
    }catch(e){error?.(String(e));}
  };
  FileLoader.size=(url,callback)=>callback(find(url).data.byteLength);
  EngineLoader.wasmjs_size=files.get('MysteryMaster_wasm.js').data.byteLength;
  CUSTOM_PARAMETERS.archive_location_filter=path=>'archive'+path;
  CUSTOM_PARAMETERS.resize_window_callback=()=>{
    const dpr=Math.min(devicePixelRatio||1,3),w=Math.round((visualViewport?.width||innerWidth)*dpr),h=Math.round((visualViewport?.height||innerHeight)*dpr);
    if(Module.canvas && (Module.canvas.width!==w || Module.canvas.height!==h)) {
      Module.canvas.width=w;Module.canvas.height=h;
      if(typeof Module.setCanvasSize==='function')Module.setCanvasSize(w,h);
    }
  };
  CUSTOM_PARAMETERS.start_success=()=>{document.getElementById('loading').remove();window.gameReady?.();};
  CUSTOM_PARAMETERS.start_error=error=>{document.getElementById('loading').textContent='Unable to load the game.';console.warn(error);};
  ProgressView.addProgress=()=>{};ProgressView.updateProgress=()=>{};ProgressView.removeProgress=()=>{};
  EngineLoader.load('canvas','MysteryMaster');
}
startEgypt().catch(error=>{document.getElementById('loading').textContent='Unable to load the game.';console.warn(error);});
'''.replace('__PACKED__',json.dumps(packed,separators=(',',':')))
def html(network,variant,head='',body=''):
    cfg=json.loads(json.dumps(defaults));cfg['GAME_LENGTH']['clickLimit']={'2clicks':2,'4clicks':4,'full':9999}[variant]
    return '<!DOCTYPE html>\n<html><head>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="network" content="'+network+'"><meta name="application-name" content="Mystery Master"><link rel="icon" type="image/png" href="'+favicon+'"><link rel="apple-touch-icon" href="'+favicon+'"><title>Mystery Master</title>\n'+head+'''
<style>html,body,#canvas-container{width:100%;height:100%;margin:0;overflow:hidden;touch-action:none;background:#cf9862}#canvas{display:block;width:100%!important;height:100%!important;outline:0}#loading{position:fixed;inset:0;display:grid;place-items:center;font:18px sans-serif;color:#512e10;pointer-events:none}</style>
<script>/*__INLINE_GAME_CONFIG_START__*/
const GAME_CONFIG_DEFAULTS = '''+json.dumps(cfg,indent=2)+''';
/*__INLINE_GAME_CONFIG_END__*/
window.GAME_CONFIG_DEFAULTS=GAME_CONFIG_DEFAULTS;
window.__CHANGEABLE_ASSETS__='''+json.dumps(payloads,separators=(',',':'))+''';
</script><script>window.GAME_CONFIG=window.GAME_CONFIG_DEFAULTS;</script>
</head><body '''+body+'''>
<div id="canvas-container"><canvas id="canvas" tabindex="1" width="1080" height="1920"></canvas></div><div id="loading">Loading…</div><div id="webgl-not-supported" hidden>WebGL is required.</div>
<script>'''+bridge+'''</script><script>'''+inflate+'''</script><script>'''+loader+'''</script><script>'''+runtime+'''</script></body></html>'''
mraid='<script src="mraid.js"></script>'
networks=[('al','applovin',mraid,False,''),('gg','google','<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>',True,''),('is','ironsource',mraid,False,''),('mtg','mintegral','',True,'onload="gameReady()"'),('fb','facebook','',False,''),('un','unity',mraid,False,''),('vu','vungle','<script>window.__VUNGLE__=true;</script>',True,''),('mo','moloco','',False,'')]
report=[]
(OUT/'index.html').write_text(html('local','full'),encoding='utf8')
if '--single-output' in sys.argv:
    target=Path(sys.argv[sys.argv.index('--single-output')+1]).resolve()
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists() and '<title>Mystery Master</title>' not in target.read_text(encoding='utf8'):
        raise FileExistsError(f'Output name already belongs to another build: {target}')
    shutil.copy2(OUT/'index.html',target)
    print(f'Published one self-contained HTML: {target} ({target.stat().st_size:,} bytes)')
    sys.exit(0)
if '--preview' in sys.argv:
    print('Local preview updated.');sys.exit(0)
for variant in ['2clicks','4clicks','full']:
    folder=OUT/variant;folder.mkdir(exist_ok=True)
    for tag,network,head,zipped,body in networks:
        result=html(network,variant,head,body)
        name=f'cem_mip_grhpl_mystery-master_real_nougc_noseason_en_{variant}_na_{tag}'
        path=folder/(name+'.html');path.write_text(result,encoding='utf8')
        if zipped:
            with zipfile.ZipFile(folder/(name+'.zip'),'w',zipfile.ZIP_DEFLATED) as archive:archive.writestr('index.html',path.read_bytes())
        report.append({'variant':variant,'network':network,'path':str(path.relative_to(OUT)),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(OUT/'index.html').write_text(html('local','full'),encoding='utf8')
(OUT/'build-manifest.json').write_text(json.dumps(report,indent=2),encoding='utf8')
guide=['# Game configuration','', 'Defaults match the original source. Configure before startup through an accessor injected immediately after `<head>`. Nested objects merge; quoted dotted paths expand; ordinary arrays replace; texture and audio slots merge by uuid or runtime key. Empty paths use embedded original assets; relative URLs and data URIs override them. The `9999` limit is unlimited. The original runtime does not enforce `timeLimit`; it is retained as metadata for compatibility.','', '| Variable name | What it controls | Accepted value types and range | Default value used |','|---|---|---|---|']
def walk(value,path=''):
    if isinstance(value,dict):
        for key,v in value.items():walk(v,f'{path}.{key}' if path else key)
    elif isinstance(value,list) and value and isinstance(value[0],dict):
        for i,v in enumerate(value):walk(v,f'{path}[{i}]')
    else:
        kind='boolean' if isinstance(value,bool) else 'number; retain authored range' if isinstance(value,(int,float)) else 'array' if isinstance(value,list) else 'string'
        desc=path.split('.')[-1]
        if path.startswith('TIMING.'):desc='Animation or transition duration in milliseconds';kind='number >= 0'
        elif path=='MUTE':desc='Mute music and sound effects';kind='boolean'
        elif path=='SHOW_PACKSHOT':desc='Show the completion overlay, logo and CTA';kind='boolean'
        elif path=='HAND_TUTOR_MODE':desc='Enable opening and inactivity hand tutorials';kind='boolean'
        elif path=='TUTORIAL_DELAY':desc='Idle seconds before a hand hint';kind='number >= 0'
        elif path.startswith('APP_LINKS.'):desc='Platform store redirect destination';kind='URL string'
        elif path=='GAME_LENGTH.clickLimit':desc='Unsolved portrait presses before end card';kind='positive integer; 9999 means unlimited'
        elif path=='GAME_LENGTH.timeLimit':desc='Compatibility metadata, not enforced by the original or this translation';kind='number; retain 9999'
        elif '.path' in path:desc='Replacement asset URL/data URI; empty uses bundled original';kind='string'
        elif '.volume' in path:desc='Sound base gain before host volume and mute';kind='number 0 to 1'
        elif '.loop' in path:desc='Loop music; gameplay effects remain one-shots as in the original';kind='boolean'
        elif '.anchorPoint.' in path:desc='Texture origin fraction';kind='number 0 to 1'
        elif path.endswith('.scale'):desc='Multiplier on the authored responsive texture size';kind='number > 0'
        elif path.endswith('.resizeBlocked'):desc='Keep authored layout size instead of replacement originalSize';kind='boolean'
        elif '.originalSize.' in path:desc='Texture source dimension used for aspect ratio and unblocked resizing';kind='positive integer pixels'
        elif path.endswith('.format'):desc='Media format metadata';kind='webp for images; mp3 for sounds'
        elif path.endswith('.uuid') or path.endswith('.spriteName') or path.endswith('.id'):desc='Stable key used to resolve an editable asset slot';kind='existing runtime key string'
        guide.append(f'| `{path}` | {desc} | {kind} | `{json.dumps(value)}` |')
walk(defaults)
(OUT/'GAME_CONFIG.md').write_text('\n'.join(guide),encoding='utf8')
(ROOT/'docs/GAME_CONFIG.md').write_text('\n'.join(guide),encoding='utf8')
print(f'Published {len(report)} self-contained playables; largest {max(x["bytes"] for x in report):,} bytes. Local preview: http://127.0.0.1:8174/dist/')
