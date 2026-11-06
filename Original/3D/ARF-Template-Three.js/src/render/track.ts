import {Shape,Path,ExtrudeGeometry,BufferGeometry,BufferAttribute} from 'three';
import {offsetLoop,meshBytes,type Pair,type FlowMesh} from '../layout/arrowFlow.ts';
export function trackGeometry(points:number[][],width:number,mesh?:FlowMesh,origin:Pair=[0,0]) {
  if(mesh)return mesh.parts.map(part=>{
    const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(meshBytes(part.position).buffer),3));geometry.setAttribute('normal',new BufferAttribute(new Float32Array(meshBytes(part.normal).buffer),3));geometry.setIndex(new BufferAttribute(new Uint32Array(meshBytes(part.index).buffer),1));geometry.translate(origin[0],0,origin[1]);return geometry;
  });
  const loop:Pair[]=points.map(p=>[p[0],-p[2]]);
  function ring(w:number,depth:number,top:number){
    const outer=offsetLoop(loop,-w/2),inner=offsetLoop(loop,w/2),shape=new Shape();
    shape.moveTo(...outer[0]);outer.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();
    const hole=new Path();hole.moveTo(...inner[0]);inner.slice(1).forEach(p=>hole.lineTo(...p));hole.closePath();shape.holes.push(hole);
    const geometry=new ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1,curveSegments:1});
    geometry.rotateX(-Math.PI/2);geometry.translate(0,top-depth,0);return geometry;
  }
  return [ring(width+.28,.5,-.01),ring(width,.04,0)];
}
