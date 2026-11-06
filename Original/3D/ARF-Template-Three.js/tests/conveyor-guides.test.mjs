import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,Matrix4,Vector3} from 'three';
import {ConveyorPath} from '../src/core/path.ts';
import {motionTuning} from '../src/core/motionTuning.ts';
import {createConveyorGuides} from '../src/render/conveyorGuides.ts';

test('flat double chevrons retain their spacing, forward direction and travel speed',()=>{
  const scene=new Scene(),path=new ConveyorPath([[-10,0,-10],[10,0,-10],[10,0,10],[-10,0,10]]);
  const guides=createConveyorGuides(scene,path,0x6873a8,.65),mesh=scene.children[0],a=new Matrix4(),b=new Matrix4();
  assert.equal(mesh.material.map,null);assert.equal(mesh.material.opacity,.65);
  assert.equal(mesh.geometry.index.count/3,4,'Each sharp chevron is just four flat triangles');
  for(const time of [1,3,7]){
    guides.sync(time);mesh.getMatrixAt(0,a);mesh.getMatrixAt(1,b);
    const left=new Vector3().setFromMatrixPosition(a),right=new Vector3().setFromMatrixPosition(b);
    assert(Math.abs(left.distanceTo(right)-.5)<1e-5);
    const progress=time*motionTuning.guideSpeed/path.length,center=new Vector3(...path.position(progress));center.y+=.02;
    assert(left.add(right).multiplyScalar(.5).distanceTo(center)<1e-5);
    const forward=new Vector3(0,1,0).transformDirection(a),tangent=new Vector3(...path.position(progress+.001)).sub(new Vector3(...path.position(progress-.001))).normalize();
    assert(forward.dot(tangent)>.99,'Chevron tips face the direction of travel');
  }
  guides.dispose();mesh.dispose();
});
