import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MeshBasicMaterial,Texture} from 'three';
import {createCannonTrayMaterial} from '../src/render/cannonTray.ts';

test('cannon trays use the authored texture without lighting, tint or shader recoloring',()=>{
  assert.deepEqual(fs.readFileSync('src/assets/textures/tunnel-3c4374-exact.webp'),fs.readFileSync('reference/textures/tunnel-3c4374-exact.webp'));
  assert(fs.readFileSync('src/assets.ts','utf8').includes("./assets/textures/tunnel-3c4374-exact.webp"));
  const texture=new Texture(),material=createCannonTrayMaterial(texture),standard=new MeshBasicMaterial();
  assert.equal(material.map,texture);
  assert.equal(material.color.getHexString(),'ffffff');
  assert.equal(material.vertexColors,false);
  assert.equal(material.onBeforeCompile,standard.onBeforeCompile);
  assert(material.isMeshBasicMaterial);assert.equal(material.toneMapped,false);assert.equal(material.envMap,null);
  material.dispose();standard.dispose();texture.dispose();
});
