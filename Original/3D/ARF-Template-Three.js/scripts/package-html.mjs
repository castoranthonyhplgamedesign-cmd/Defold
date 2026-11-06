import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {zipSync,unzipSync,strToU8} from 'fflate';
export function finalizeHTML(source,profile){
  const html=source.replace(/<script type="module" crossorigin>/g,'<script>').replace(/<style rel="stylesheet" crossorigin>/g,'<style>');
  assert(!/type="module"|console\.error|crossorigin/.test(html));
  for(const [,script] of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script);
  const bridges=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(bridges,profile?.bridge==='mraid'?['mraid.js']:profile?.bridge==='exitapi'?['https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js']:[]);
  assert(!/exitapi-impl|\/src\/|\.\/assets\//.test(html));
  if(profile?.tag==='mo')assert(!/XMLHttpRequest|mraid\.js/.test(html));
  if(profile?.tag==='gg')assert(/ExitApi\.exit\(\)/.test(html));
  if(profile?.tag==='vu')assert(html.includes('<script>window.__VUNGLE__=true</script>'));
  if(profile?.tag==='mtg')assert(html.includes('<body onload="gameReady()">'));
  assert(html.includes(`<meta name="network" content="${profile?.name??'preview'}"`));
  assert(Buffer.byteLength(html)<(profile?.maxBytes??4_000_000));
  return {html,bridges};
}
export function writePackage(file,html,profile){
  if(profile?.zip){
    const zip=zipSync({'index.html':strToU8(html)},{level:9}),unpacked=unzipSync(zip);
    assert.deepEqual(Object.keys(unpacked),['index.html']);
    assert.equal(Buffer.from(unpacked['index.html']).toString(),html);fs.writeFileSync(file,zip);
  }else fs.writeFileSync(file,html);
  const bytes=fs.statSync(file).size;assert(bytes<(profile?.maxBytes??4_000_000));return bytes;
}
