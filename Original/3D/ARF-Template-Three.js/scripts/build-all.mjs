import fs from 'node:fs';
import assert from 'node:assert/strict';
import {finalizeHTML,writePackage} from './package-html.mjs';
import {build} from 'vite';
const profiles=JSON.parse(fs.readFileSync('src/networkProfiles.json'));
assert.equal(profiles.length,8);assert.equal(new Set(profiles.map(p=>p.tag)).size,8);
const report=[];
// Run length before the endcard: countdown seconds (undefined = the 60 s default) and counted arrow taps.
const lengths={'3clicks':{duration:'Infinity',taps:'3'},'10clicks':{duration:'Infinity',taps:'10'},'60seconds':{duration:'undefined',taps:'Infinity'},'full':{duration:'Infinity',taps:'Infinity'}};
for(const [length,{duration,taps}] of Object.entries(lengths)){
const destination=`dist/${length}`;fs.mkdirSync(destination,{recursive:true});
for(const profile of profiles) {
  const outDir=`analysis/build/${length}/${profile.tag}`;
  await build({mode:profile.tag,define:{__DURATION__:duration,__TAPS__:taps},build:{outDir}});
  const {html,bridges}=finalizeHTML(fs.readFileSync(`${outDir}/index.html`,'utf8'),profile);
  const bytes=Buffer.byteLength(html);assert(bytes<profile.maxBytes);
  fs.writeFileSync(`${outDir}/index.html`,html);
  const name=`arf_mip_grhpl_conveyor_overload_real_nougc_noseason_en_${length}_na_${profile.tag}`;
  const file=`${destination}/${name}.${profile.zip?'zip':'html'}`;
  const packageBytes=writePackage(file,html,profile);
  report.push({...profile,length,file,htmlBytes:bytes,packageBytes,bridges});
}
assert.equal(fs.readdirSync(destination).length,8);
}
fs.writeFileSync('analysis/evidence/network-builds.json',JSON.stringify({builtAt:new Date().toISOString(),profiles:report},null,2));
console.log(JSON.stringify(report,null,2));
