import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Scene,BoxGeometry,MeshStandardMaterial,Matrix4,Vector3,Quaternion,OrthographicCamera} from 'three';
import {createBoard} from '../src/render/board.ts';
import {planeTransform} from '../src/ui/projection.ts';
import {Simulation} from '../src/core/simulation.ts';
import {ConveyorPath} from '../src/core/path.ts';
import {arrowStyle} from '../src/render/arrowStyle.ts';
import {flowColors} from '../src/layout/arrowFlow.ts';

test('mockup palette uses the same cyan in the editor and rendered arrows and cannons',()=>{
 const materials=JSON.parse(fs.readFileSync('src/data/materials.json'));
 assert.equal(flowColors.blue,'#2cd8ed');assert.equal(materials.blue.color,flowColors.blue);
});

test('imported board keeps 1.25 spacing, recessed picking and a continuous rise onto the belt',()=>{
 const size=1.25,data=[{id:1,color:'blue',cellSize:size,position:[0,0,0],direction:[1,0,0],cells:[[0,0,0],[-size,0,0]]}],sim=new Simulation(data,new ConveyorPath([[-5,0,-5],[5,0,-5],[5,0,5],[-5,0,5]]));
 const geometries=Object.fromEntries(['head','inner','body','corner'].map(k=>[k,[new BoxGeometry()]])),materials=Object.fromEntries(['blue','white','neutral','blocked'].map(k=>[k,new MeshStandardMaterial()])),scene=new Scene(),board=createBoard(scene,sim,geometries,materials,arrowStyle.boardY),matrix=new Matrix4(),p=new Vector3(),scale=new Vector3();
 const head=scene.children.find(m=>m.geometry===geometries.head[0]&&m.material===materials.blue),body=scene.children.find(m=>m.geometry===geometries.body[0]&&m.material===materials.blue);
 head.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix);scale.setFromMatrixScale(matrix);assert(Math.abs(p.y-arrowStyle.boardY*size)<1e-6);assert(Math.abs(scale.x-size*arrowStyle.headWidth)<1e-6);assert.equal(scale.y,size);
 body.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix);assert.equal(p.x,-size);
 const camera=new OrthographicCamera(-5,5,5,-5,.1,100);camera.position.set(0,20,12);camera.lookAt(0,0,0);camera.updateMatrixWorld();p.set(0,arrowStyle.boardY*size,0).project(camera);assert.equal(board.pick((p.x+1)*500,(1-p.y)*500,camera,{left:0,top:0,width:1000,height:1000}),1);
 sim.launch(1);let previous=arrowStyle.boardY*size;
 while(sim.arrows[0].segments[0].progress===null){sim.advance(1/120);board.sync();if(sim.arrows[0].segments[0].progress!==null)break;head.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix);assert(p.y>=previous-1e-6&&p.y<=0);assert(p.y-previous<.15);previous=p.y;}
 sim.advance(2);board.sync();body.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix);assert.equal(p.y,0);
 board.dispose();scene.children.forEach(m=>m.dispose?.());Object.values(geometries).flat().forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());
});

test('custom grid size scales straight pieces, corners, highlights and picking together',()=>{
 for(const size of [.5,1.5]){
  const data=[{id:1,color:'blue',cellSize:size,position:[0,0,0],direction:[1,0,0],cells:[[0,0,0],[-size,0,0],[-2*size,0,0],[-2*size,0,size]]}];
  const simulation=new Simulation(data,new ConveyorPath([[-10,0,-10],[10,0,-10],[10,0,10],[-10,0,10]])),geometries=Object.fromEntries(['head','inner','body','corner'].map(k=>[k,[new BoxGeometry()]])),materials=Object.fromEntries(['blue','white','neutral','blocked'].map(k=>[k,new MeshStandardMaterial()]));
  const scene=new Scene(),board=createBoard(scene,simulation,geometries,materials);board.sync(new Set([1]));
  const get=name=>scene.children.find(m=>m.geometry===geometries[name][0]&&m.material===materials.blue),matrix=new Matrix4(),scale=new Vector3();
  assert.equal(get('body').count,2,'Small straight segments must not become corners');assert.equal(get('corner').count,1);
  for(const name of ['head','body','corner']){get(name).getMatrixAt(0,matrix);scale.setFromMatrixScale(matrix);assert(Math.abs(scale.x-size)<1e-6&&Math.abs(scale.z-size)<1e-6);}
  const highlight=scene.children.find(m=>m.geometry===geometries.inner[0]&&m.material===materials.neutral);highlight.getMatrixAt(0,matrix);scale.setFromMatrixScale(matrix);assert(Math.abs(scale.x-1.041*size)<1e-6);
  const camera=new OrthographicCamera(-5,5,5,-5,.1,100);camera.position.set(0,20,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const rect={left:0,top:0,width:1000,height:1000};assert.equal(board.pick(500,500,camera,rect),1);assert.equal(board.pick(500+size*.6*100,500,camera,rect),null);
  board.dispose();scene.children.forEach(m=>m.dispose?.());Object.values(geometries).flat().forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());
 }
});

test('highlight is 25 percent thinner while source inset and alignment remain intact in four directions',()=>{
 const prefab=JSON.parse(fs.readFileSync('analysis/assets/serialized/9e896dbe-96ba-4321-b8c8-f55cd9da5258.json')).objects;
 const transform=n=>new Matrix4().compose(new Vector3(n._lpos?.x??0,n._lpos?.y??0,n._lpos?.z??0),new Quaternion(n._lrot?.x??0,n._lrot?.y??0,n._lrot?.z??0,n._lrot?.w??1),new Vector3(n._lscale?.x??1,n._lscale?.y??1,n._lscale?.z??1));
 const overrides=prefab[4]._prefab.instance.propertyOverrides;
 const root={},child={};
 for(const p of overrides){const target=p.targetInfo.__ref__===2?child:root;if(['_lpos','_lrot','_lscale'].includes(p.propertyPath[0]))target[p.propertyPath[0]]=p.value;}
 const materials={blue:new MeshStandardMaterial(),white:new MeshStandardMaterial(),neutral:new MeshStandardMaterial(),blocked:new MeshStandardMaterial()},geometries=Object.fromEntries(['head','inner','body','corner'].map(k=>[k,[new BoxGeometry()]]));
 const arrows=[0,Math.PI/2,Math.PI,-Math.PI/2].map((yaw,id)=>({data:{id,color:'blue'},moving:false,segments:[{index:0,position:[id*3,0,0],yaw,progress:null,color:'blue'}]}));
 const scene=new Scene(),board=createBoard(scene,{arrows,preloaded:[],capacity:null},geometries,materials);
 board.sync(new Set([0,1,2,3]));
 const highlight=scene.children.find(m=>m.geometry===geometries.inner[0]&&m.material===materials.neutral);
 const inner=scene.children.find(m=>m.geometry===geometries.inner[0]&&m.material.name==='arrow-inset:blue');
 assert(inner.material.color.r<materials.blue.color.r&&inner.material.color.g<materials.blue.color.g&&inner.material.color.b<materials.blue.color.b,'Arrow inset is darker than its body');
 assert.equal(highlight.count,4);assert.equal(inner.count,4);
 for(const a of arrows){
  const s=a.segments[0],base=new Matrix4().makeRotationY(s.yaw+Math.PI).setPosition(...s.position).multiply(transform(prefab[3]));
  const thinner=new Matrix4().makeScale(1.041/1.146,1,.999/1.088);
  for(const [mesh,expected] of [[highlight,base.clone().multiply(transform(root)).multiply(transform(child)).multiply(thinner)],[inner,base.clone().multiply(transform(prefab[6]))]]){
   const actual=new Matrix4();mesh.getMatrixAt(a.data.id,actual);
   actual.elements.forEach((n,i)=>assert(Math.abs(n-expected.elements[i])<1e-6,`direction ${s.yaw}, matrix component ${i}`));
  }
 }
 board.sync(new Set([1]));assert.equal(highlight.count,1);assert.equal(inner.count,4);
 arrows[1].moving=true;board.sync(new Set([1]));assert.equal(highlight.count,0);
 board.dispose();Object.values(geometries).flat().forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());
});

test('blocked overlay covers each segment, follows the existing feedback and disappears on return',()=>{
 const data=[
  {id:1,color:'blue',position:[0,0,0],direction:[1,0,0],cells:[[0,0,0],[-1,0,0],[-1,0,1]]},
  {id:2,color:'blue',position:[2,0,0],direction:[-1,0,0],cells:[[0,0,0]]},
 ];
 const simulation=new Simulation(data,new ConveyorPath([[-5,0,-5],[5,0,-5],[5,0,5],[-5,0,5]]));
 const geometries=Object.fromEntries(['head','inner','body','corner'].map(k=>[k,[new BoxGeometry()]]));
 const materials=Object.fromEntries(['blue','white','neutral','blocked'].map(k=>[k,new MeshStandardMaterial()]));
 const scene=new Scene(),board=createBoard(scene,simulation,geometries,materials);
 const red=scene.children.filter(m=>m.material.name==='blocked-overlay');
 assert(red.every(m=>m.count===0));
 assert.equal(simulation.launch(1),'blocked');simulation.advance(.1);board.sync();
 assert(red.every(m=>m.count===0),'No red during approach');
 const a=simulation.arrows[0],matrix=new Matrix4(),position=new Vector3();
 a.feedback.elapsed=a.feedback.approachSeconds+(a.feedback.duration-a.feedback.approachSeconds)*.25;board.sync();
 assert.deepEqual(red.map(m=>m.count),[1,2,0,0]);
 assert(Math.abs(red[0].material.opacity-.65)<1e-9);
 for(const segment of a.segments){
  const overlay=red[segment.index===0?0:1];overlay.getMatrixAt(segment.index===0?0:segment.index-1,matrix);
  position.setFromMatrixPosition(matrix);
  assert(position.distanceTo(new Vector3(...a.feedback.position(segment.index)))<1e-6);
  const original=scene.children.find(m=>m.geometry===overlay.geometry&&m.material===materials.blue);
  assert(original.count>0,'Original geometry and color remain underneath');
 }
 assert.equal(simulation.onPath.length,0);
 assert.equal(simulation.launch(2),'blocked');simulation.advance(.04);board.sync();
 assert(red[0].material.opacity>0);assert.equal(red[2].material.opacity,0,'Concurrent arrows have independent pulses');
 simulation.advance(2);board.sync();assert.equal(a.feedback,null);assert(red.every(m=>m.count===0&&!m.visible));
 assert.deepEqual(a.segments.map(s=>s.position),data[0].cells);
 board.dispose();Object.values(geometries).flat().forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());
});

test('world UI projects its plane axes, independently of CSS viewport scale',()=>{
 const camera=new OrthographicCamera(-21,21,21,-21,1,10000);camera.position.set(0,227.132,105.063);camera.quaternion.set(-.5372996083468239,0,0,.8433914458128856);camera.updateMatrixWorld();
 const project=p=>{const v=new Vector3(...p).project(camera);return {x:(v.x+1)*640,y:(1-v.y)*640};};
 const result=planeTransform(project,[0,0,17.144],[.01,0,0],[0,0,.01]);
 const values=result.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);
 assert(Math.abs(values[0]-1280/42*.01)<1e-9);
 assert(values[3]>.27&&values[3]<.28);assert.equal(values[1],0);assert.equal(values[2],0);
});
