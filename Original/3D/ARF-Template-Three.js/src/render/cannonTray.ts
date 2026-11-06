import {MeshBasicMaterial,Texture} from 'three';

export function createCannonTrayMaterial(texture:Texture){
  return new MeshBasicMaterial({map:texture,toneMapped:false});
}
