export type Project = (position: number[]) => {x:number;y:number};

// Preserve both local axes of reference world-space UI under the orthographic camera.
export function planeTransform(project: Project, center: number[], xAxis: number[], downAxis: number[]) {
  const p=project(center),x=project(center.map((v,i)=>v+xAxis[i])),y=project(center.map((v,i)=>v+downAxis[i]));
  return `matrix(${x.x-p.x},${x.y-p.y},${y.x-p.x},${y.y-p.y},${p.x},${p.y}) translate(-50%,-50%)`;
}
