import {AmbientLight,Box3,DirectionalLight,InstancedMesh,Mesh,PCFShadowMap,PlaneGeometry,PMREMGenerator,Scene,ShadowMaterial,Vector3,WebGLRenderer} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

// Authored approximation of the mockup's soft studio light, not extracted reference settings.
export function createMockupLighting(renderer:WebGLRenderer,scene:Scene,bounds:Box3){
  scene.add(new AmbientLight(0xc9d9ff,.55));
  const key=new DirectionalLight(0xfff7eb,1.9),center=bounds.getCenter(new Vector3());
  key.position.copy(center).add(new Vector3(-10,50,-8));
  key.target.position.copy(center);scene.add(key,key.target);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=PCFShadowMap;
  key.castShadow=true;key.shadow.mapSize.set(512,512);key.shadow.radius=3;
  const span=bounds.getSize(new Vector3()).length()/2+3;
  Object.assign(key.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:1,far:key.position.distanceTo(center)+span*2+1});
  key.shadow.camera.updateProjectionMatrix();key.shadow.normalBias=.035;key.shadow.bias=-.0001;

  const floorGeometry=new PlaneGeometry(2000,2000),floorMaterial=new ShadowMaterial({color:0x10132d,opacity:.16});
  const floor=new Mesh(floorGeometry,floorMaterial);floor.rotation.x=-Math.PI/2;
  floor.position.y=bounds.min.y-.04;floor.receiveShadow=true;scene.add(floor);

  let environment:ReturnType<PMREMGenerator['fromScene']>|undefined;
  function restore(){
    const room=new RoomEnvironment(),generator=new PMREMGenerator(renderer);
    const next=generator.fromScene(room,.04,.1,100,{size:128});
    environment?.dispose();environment=next;
    scene.environment=next.texture;scene.environmentIntensity=.4;
    room.traverse(o=>{if(o instanceof InstancedMesh)o.dispose();});
    room.dispose();generator.dispose();
  }
  restore();
  return {restore,dispose(){scene.environment=null;environment?.dispose();key.shadow.dispose();floorGeometry.dispose();floorMaterial.dispose();scene.remove(floor,key,key.target);}};
}
