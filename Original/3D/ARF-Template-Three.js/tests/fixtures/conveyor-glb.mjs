import fs from 'node:fs';
export function conveyorGLB(edit=()=>{}){
 const d=JSON.parse(fs.readFileSync('examples/levels/artist-rounded.arrow-flow.json')),chunks=[],bufferViews=[],accessors=[],primitives=[];let byteLength=0;
 for(const [i,p]of d.conveyor.mesh.parts.entries()){
  const ids={};for(const key of ['position','normal','index']){const b=Buffer.from(p[key],'base64');ids[key]=accessors.length;accessors.push({bufferView:bufferViews.length,componentType:key==='index'?5125:5126,count:b.length/(key==='index'?4:12),type:key==='index'?'SCALAR':'VEC3'});bufferViews.push({buffer:0,byteOffset:byteLength,byteLength:b.length});byteLength+=b.length;chunks.push(b);}
  primitives.push({attributes:{POSITION:ids.position,NORMAL:ids.normal},indices:ids.index,material:i});
 }
 const json={asset:{version:'2.0'},buffers:[{byteLength}],bufferViews,accessors,meshes:[{primitives}],nodes:[{mesh:0,name:'Artist ring'}],scenes:[{nodes:[0]}],scene:0,materials:[{name:'Border'},{name:'Belt surface'}]};edit(json);
 const text=Buffer.from(JSON.stringify(json)),padded=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(padded);const binary=Buffer.concat(chunks),glb=Buffer.alloc(28+padded.length+binary.length);
 glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(padded.length,12);glb.writeUInt32LE(0x4e4f534a,16);padded.copy(glb,20);glb.writeUInt32LE(binary.length,20+padded.length);glb.writeUInt32LE(0x004e4942,24+padded.length);binary.copy(glb,28+padded.length);return glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength);
}
