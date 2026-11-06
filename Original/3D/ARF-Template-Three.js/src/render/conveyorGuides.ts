import {InstancedMesh,MeshBasicMaterial,Object3D,Shape,ShapeGeometry,Vector2} from 'three';
import type {Scene} from 'three';
import type {ConveyorPath} from '../core/path';
import {motionTuning} from '../core/motionTuning.ts';

// Broad, flat double-chevron strokes, paired at the existing spacing.
export function createConveyorGuides(scene:Scene,path:ConveyorPath,color=0x515b91,opacity=1){
  const shape=new Shape([[-.35,-.28],[0,.04],[.35,-.28],[.35,-.04],[0,.28],[-.35,-.04]].map(([x,y])=>new Vector2(x,y)));
  const geometry=new ShapeGeometry(shape);
  const material=new MeshBasicMaterial({color,opacity,transparent:true,depthWrite:false});
  const count=Math.max(1,Math.floor(path.length/5)),mesh=new InstancedMesh(geometry,material,count*2);
  mesh.frustumCulled=false;scene.add(mesh);
  const parent=new Object3D(),quad=new Object3D();parent.add(quad);quad.rotation.x=-Math.PI/2;
  function sync(time:number){
    for(let i=0;i<count;i++){
      const progress=i/count+time*motionTuning.guideSpeed/path.length;
      parent.position.fromArray(path.position(progress));parent.position.y+=.02;
      parent.rotation.y=path.yaw(progress);
      for(let j=0;j<2;j++){quad.position.z=j===0?-.25:.25;parent.updateMatrixWorld(true);mesh.setMatrixAt(i*2+j,quad.matrixWorld);}
    }
    mesh.instanceMatrix.needsUpdate=true;
  }
  sync(0);
  return {sync,dispose(){geometry.dispose();material.dispose();}};
}
