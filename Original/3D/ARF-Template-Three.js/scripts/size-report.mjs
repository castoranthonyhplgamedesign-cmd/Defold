import fs from 'node:fs';
const html=fs.readFileSync('dist/index.html','utf8'),categories={};let encodedBytes=0;
for(const match of html.matchAll(/data:([^;,]+);base64,([A-Za-z0-9+/=]+)/g)){
  const entry=categories[match[1]]??={count:0,decodedBytes:0,embeddedBytes:0};entry.count++;entry.decodedBytes+=Buffer.from(match[2],'base64').length;entry.embeddedBytes+=Buffer.byteLength(match[0]);encodedBytes+=Buffer.byteLength(match[0]);
}
fs.writeFileSync('analysis/evidence/size-breakdown.json',JSON.stringify({htmlBytes:Buffer.byteLength(html),categories,engineGameMarkupStylesBytes:Buffer.byteLength(html)-encodedBytes,note:'Exact embedded URI bytes; remaining bytes combine minified Three.js, game code, data, markup and CSS, not an independently measured Three-only cost.'},null,2));
