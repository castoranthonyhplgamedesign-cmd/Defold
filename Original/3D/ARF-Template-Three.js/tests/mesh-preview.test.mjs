import assert from 'node:assert/strict';
import test from 'node:test';
import {meshPreview} from '../tools/level-editor/mesh-preview.ts';
const encode=a=>Buffer.from(a.buffer).toString('base64');
test('editor silhouette includes attached mesh faces outside the travel ring and handles either winding',()=>{
 const part={position:encode(new Float32Array([0,0,0,1,0,0,0,0,1,4,0,0,5,0,0,4,0,1])),normal:'',index:encode(new Uint32Array([0,1,2,3,5,4]))};
 const mesh={parts:[part,part],surface:[[[0,0],[1,0],[0,1]],[[.1,.1],[.2,.1],[.1,.2]]]};
 const paths=meshPreview(mesh);assert.equal(paths[0],'M0,0L1,0L0,1ZM4,0L5,0L4,1Z');assert.equal(meshPreview(mesh),paths);
});
