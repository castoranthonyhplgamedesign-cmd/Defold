// Convert the checked-in Unity-derived triangle data without changing the source.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const source = path.resolve(root, '../../../Original/3D/BBS_Corners-PA-/PortRoot');
const write = (p, data) => { fs.mkdirSync(path.dirname(path.join(root,p)), {recursive:true}); fs.writeFileSync(path.join(root,p),data); };
const text = fs.readFileSync(path.join(source,'src/generated/wideUModels.ts'),'utf8');
const models = vm.runInNewContext('('+text.slice(text.indexOf('= {',text.indexOf('export const WIDE_U_MODELS'))+2).replace(/;\s*$/,'')+')');
const records=[];
for (const [key,m] of Object.entries(models)) {
  const p=m.positions.slice(), n=m.normals.slice(), colors=[];
  // Convert Unity/Babylon left-handed Z into Defold right-handed Z, reverse winding.
  for(let i=0;i<p.length;i+=9) {
    for(const a of [p,n]) { for(let j=0;j<3;j++) a[i+j*3+2]*=-1; for(let j=0;j<3;j++) [a[i+3+j],a[i+6+j]]=[a[i+6+j],a[i+3+j]]; }
  }
  for(let i=0;i<p.length/3;i++) { const slot=m.materialSlots?.find(s=>i>=s.indexStart && i<s.indexStart+s.indexCount); const c=slot?.materialIndex===1?0:1; colors.push(c,c,c); }
  write(`assets/models/${key}.buffer`,JSON.stringify([{name:'position',type:'float32',count:3,data:p},{name:'normal',type:'float32',count:3,data:n},{name:'body',type:'float32',count:3,data:colors}]));
  write(`assets/models/${key}.mesh`,`material: "/render/plastic.material"\nvertices: "/assets/models/${key}.buffer"\nprimitive_type: PRIMITIVE_TRIANGLES\nposition_stream: "position"\nnormal_stream: "normal"\n`);
  records.push({asset:key,source:'PortRoot/src/generated/wideUModels.ts',vertices:p.length/3,bounds:m.bounds});
}
for(const [to,from] of Object.entries({ 'play_now.png':'new/playnowbutton.png','hand.png':'hand_pointer.png','board.png':'board_base_texture.png','bgm.wav':'bgm_compressed.wav','drag.wav':'drag_compressed.wav','drop.wav':'drop_compressed.wav','crumple.wav':'crumple_compressed.wav'})) {
  const bytes=fs.readFileSync(path.join(source,'src/assets',from)); write('assets/'+to,bytes);
  records.push({asset:to,source:'PortRoot/src/assets/'+from,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
write('assets/ui.atlas',['app_icon.png','play_now.png','hand.png'].map(f=>`images { image: "/assets/${f}" }`).join('\n')+'\nmargin: 0\nextrude_borders: 2\ninner_padding: 2\n');
const fontSource='Assets/TextMesh Pro/Examples & Extras/Fonts/Roboto-Bold.ttf';
const font=fs.readFileSync(path.resolve(source,'..',fontSource));
write('assets/Roboto-Bold.ttf',font);
records.push({asset:'Roboto-Bold.ttf',source:fontSource,sha256:crypto.createHash('sha256').update(font).digest('hex')});
records.push({asset:'app_icon.png',source:'assets/branding/mark.svg + branding.json; tools/generate-branding.mjs',note:'Client-requested replacement branding; not copied from the original project.'});
write('docs/asset-manifest.json',JSON.stringify({baseline:'cfd9f7b',conversion:'Mesh Z reflected and winding reversed; original normals and material regions retained. Raster and audio assets copied byte-for-byte.',assets:records},null,2));
console.log(`Imported ${records.length} original assets.`);
