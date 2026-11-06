"""Build with the installed Defold toolchain; publish files only to local-publish/."""
from pathlib import Path
import os,sys,subprocess,zipfile,re,shutil,json,datetime
root=Path(__file__).resolve().parent.parent
os.chdir(root)
install=Path(os.environ.get('DEFOLD_HOME',str(Path.home()/'Documents/Defold')))
jars=list((install/'packages').glob('defold-*.jar'))
if not jars:raise SystemExit('Installed Defold editor JAR not found. Set DEFOLD_HOME.')
jar=jars[0];java=next((install/'packages').glob('jdk-*/bin/java.exe'))
def run(args):
    print('Running:',str(args[0]),' '.join(str(x) for x in args[1:]),flush=True)
    r=subprocess.run([str(x) for x in args],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
    output=r.stdout.decode('utf-8',errors='replace');print(output,flush=True)
    with (root/'qa/build.log').open('a',encoding='utf-8') as log:log.write(output)
    r.check_returncode()
if '--assets' in sys.argv:run([sys.executable,'scripts/convert_assets.py'])
run(['node','scripts/prepare.mjs']);run(['node','scripts/build-bridge.mjs'])
with zipfile.ZipFile(jar) as z:template=z.read('builtins/manifests/web/engine_template.html').decode()
bridge=(root/'web/physics.bundle.js').read_text();host=(root/'web/host.js').read_text()
# Keep Defold's supported loader markup and replace only the page styling/start gate.
template=template.replace('</head>','<link rel="icon" type="image/png" href="branding/icon-32.png"><link rel="apple-touch-icon" href="branding/icon-180.png"><link rel="manifest" href="branding/manifest.webmanifest"><meta name="application-name" content="Ring Sort"><meta name="apple-mobile-web-app-title" content="Ring Sort">\n<script>'+bridge.replace('</script','<\\/script')+'</script>\n<script>'+host.replace('</script','<\\/script')+'</script>\n<style>html,body{width:100%;height:100%;overflow:hidden;touch-action:none;background:#9f7bf0}#app-container,#canvas-container{position:fixed;inset:0;width:100%;height:100%}#canvas{width:100%;height:100%;display:block}.buttons-background{display:none}</style>\n</head>')
template=template.replace('EngineLoader.load("canvas", "{{exe-name}}");','window.PuzzleBoot().then(function(){EngineLoader.load("canvas", "{{exe-name}}");}).catch(function(error){document.body.innerText="Unable to start Ring Sort: "+error.message;console.warn(error);});')
template=template.replace("<script id='engine-setup' type='text/javascript'>", "<script id='engine-setup' type='text/javascript'>\nCUSTOM_PARAMETERS.resize_window_callback=function(){var w=Math.round(window.visualViewport?.width||innerWidth),h=Math.round(window.visualViewport?.height||innerHeight),d=Math.min(devicePixelRatio||1,2),c=document.getElementById('canvas');if(c.width!==Math.round(w*d))c.width=Math.round(w*d);if(c.height!==Math.round(h*d))c.height=Math.round(h*d);c.style.width=w+'px';c.style.height=h+'px';};\n")
template=template.replace('<title>{{project.title}} {{project.version}}</title>','<title>{{project.title}}</title>')
(root/'web/template.html').write_text(template,encoding='utf-8')
run([java,'-cp',jar,'com.dynamo.bob.Bob','--platform','wasm-web','--architectures','wasm-web','--variant','release','--archive','--bundle-output','local-publish','build','bundle'])
bundles=[p.parent for p in (root/'local-publish').glob('*/index.html')]
if not bundles:raise SystemExit('No HTML5 bundle created')
dest=root/'local-publish/Ring Sort';(dest/'audio').mkdir(exist_ok=True)
(dest/'branding').mkdir(exist_ok=True)
for name in ['icon-32.png','icon-180.png','icon-192.png','icon-512.png','manifest.webmanifest','ring-sort.ico']:shutil.copy2(root/'branding'/name,dest/'branding'/name)
for f in (root/'web/audio').glob('*.mp3'):shutil.copy2(f,dest/'audio'/f.name)
(dest/'THIRD_PARTY_LICENSES.txt').write_text('Phaser\n\n'+(root/'docs/PHASER_LICENSE.md').read_text(encoding='utf-8')+'\n\nMatter.js\n\n'+(root/'docs/MATTER_LICENSE.md').read_text(encoding='utf-8'),encoding='utf-8')
report={'date':datetime.datetime.now().isoformat(),'toolchain_jar':str(jar),'target':'wasm-web','bundle':str(dest.relative_to(root)),'bytes':sum(f.stat().st_size for f in dest.rglob('*') if f.is_file())}
(root/'qa/build.json').write_text(json.dumps(report,indent=2)+'\n')
print('Local bundle:',dest,flush=True)
redirect='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ring Sort</title><script>location.replace("/Ring%20Sort/index.html"+location.search+location.hash)</script></head><body><a href="/Ring%20Sort/index.html">Play Ring Sort</a></body></html>'
(root/'local-publish/index.html').write_text(redirect,encoding='utf-8')
legacy=root/'local-publish/Puzzlebox Defold'
if legacy.exists():(legacy/'index.html').write_text(redirect,encoding='utf-8')
previous=root/'local-publish/Sinonimus'
if previous.exists():(previous/'index.html').write_text(redirect,encoding='utf-8')

run([sys.executable,"scripts/package_single_html.py"])
