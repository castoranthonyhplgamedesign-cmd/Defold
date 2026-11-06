// Embed the Defold runtime, Wasm and every archive piece into one offline HTML.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const brand=JSON.parse(fs.readFileSync(path.join(root,'branding.json'),'utf8'));
const bundle=path.join(root,'publish',brand.name);
const output=path.resolve(root,'../../../output',brand.packageName+'.html');
const escapeScript=s=>s.replace(/<\/script/gi,'<\\/script');
const resources={};
for(const file of fs.readdirSync(path.join(bundle,'archive')))resources[file]=fs.readFileSync(path.join(bundle,'archive',file)).toString('base64');
resources[brand.executable+'.wasm']=fs.readFileSync(path.join(bundle,brand.executable+'.wasm')).toString('base64');
const engineCode=fs.readFileSync(path.join(bundle,brand.executable+'_wasm.js'),'utf8');
const loader=fs.readFileSync(path.join(bundle,'dmloader.js'),'utf8');
const embedded=`(function(){
  const resources=${JSON.stringify(resources)};
  const engineCode=${escapeScript(JSON.stringify(engineCode))};
  function bytesFor(url){
    const name=String(url).split('/').pop().split('?')[0];
    if(!Object.prototype.hasOwnProperty.call(resources,name))throw new Error('Missing embedded resource: '+name);
    const binary=atob(resources[name]);const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return bytes;
  }
  // Keep the original archive assembly, verification and Wasm startup paths;
  // satisfy their file loads directly from the embedded byte map.
  FileLoader.load=function(url,type,onprogress,onerror,onload,onretry,onverify){
    Promise.resolve().then(async function(){
      const resolved=typeof url==='function'?url(0):url;
      const bytes=bytesFor(resolved);
      const response=type==='text'?new TextDecoder().decode(bytes):bytes.buffer;
      if(onverify){const error=await onverify(response);if(error)throw new Error(error)}
      if(onprogress)onprogress(bytes.byteLength);
      if(onload)await onload(response,resolved);
    }).catch(function(error){if(onerror)onerror(error);else throw error});
  };
  EngineLoader.loadAndRunScriptAsync=function(){
    ProgressUpdater.updateCurrent(new TextEncoder().encode(engineCode).length);
    Module.mainScriptUrlOrBlob=location.href;
    const script=document.createElement('script');script.textContent=engineCode;
    document.body.appendChild(script);
  };
  window.__BBS_SINGLE_FILE__={name:${JSON.stringify(brand.name)},embeddedFiles:Object.keys(resources),runtime:'Defold 1.14.0'};
})();`;
const icon='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/branding/icon.png')).toString('base64');
let html=fs.readFileSync(path.join(bundle,'index.html'),'utf8');
html=html.replace(/href="icon\.png"/g,'href="'+icon+'"');
html=html.replace(/<script id="engine-loader" src="dmloader\.js"><\/script>/,()=>'<script id="engine-loader">'+escapeScript(loader)+'</script>');
html=html.replace('<script id="engine-setup">',()=>'<script id="embedded-resources">'+escapeScript(embedded)+'</script>\n<script id="engine-setup">');
html=html.replace("const local=/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname);","const local=location.protocol==='file:'||/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname);");
if(/<script[^>]+\bsrc\s*=/i.test(html))throw Error('External script reference survived packing.');
if(!html.includes('id="embedded-resources"'))throw Error('Embedded loader was not inserted.');
if(!html.includes("const local=location.protocol==='file:'"))throw Error('File preview CTA guard was not inserted.');
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,html);
const report={name:brand.name,file:output,bytes:Buffer.byteLength(html),sha256:crypto.createHash('sha256').update(html).digest('hex'),embeddedResources:Object.keys(resources),companionFilesRequired:false};
fs.writeFileSync(path.join(root,'publish','single-html-manifest.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
