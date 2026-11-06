export type Vec = number[];
export const distance = (a: Vec, b: Vec) => Math.hypot(...a.map((v, i) => v - b[i]));
export const mix = (a: Vec, b: Vec, t: number) => a.map((v, i) => v + (b[i] - v) * t);
export const wrap = (n: number) => ((n % 1) + 1) % 1;

export class ConveyorPath {
  points: Vec[] = [];
  length = 0;
  readonly entryMode:'reference'|'first-intersection';
  constructor(raw: Vec[], spacing = .1, entryMode:'reference'|'first-intersection'='reference') {
    this.entryMode=entryMode;
    if (raw.length < 3 || raw.some(p => p.length !== 3 || !p.every(Number.isFinite)) || !(spacing > 0)) throw new Error('Invalid conveyor path');
    const lengths = raw.map((p, i) => distance(p, raw[(i + 1) % raw.length]));
    if (lengths.some(n => n <= 0)) throw new Error('Degenerate conveyor edge');
    const total = lengths.reduce((a, b) => a + b, 0), count = Math.max(2, Math.floor(total / spacing));
    let edge = 0, accumulated = 0;
    for (let i = 0; i < count; i++) {
      const d = i * total / count;
      while (edge < lengths.length - 1 && accumulated + lengths[edge] < d) accumulated += lengths[edge++];
      this.points.push(mix(raw[edge], raw[(edge + 1) % raw.length], (d - accumulated) / lengths[edge]));
    }
    this.length = this.points.reduce((sum, p, i) => sum + distance(p, this.points[(i + 1) % count]), 0);
  }
  position(progress: number) {
    const n = wrap(progress) * this.points.length, i = Math.floor(n);
    return mix(this.points[i], this.points[(i + 1) % this.points.length], n - i);
  }
  yaw(progress: number) {
    const a = this.position(progress - .01), b = this.position(progress + .01);
    return Math.atan2(b[0] - a[0], b[2] - a[2]) + Math.PI;
  }
  closest(point: Vec) {
    let best = Infinity, index = 0;
    for(let i=0;i<this.points.length;i++){
      const p=this.points[i],x=point[0]-p[0],y=point[1]-p[1],z=point[2]-p[2],squared=x*x+y*y+z*z;
      if(squared<best){best=squared;index=i;}
    }
    return index / this.points.length;
  }
  // Ray parameter limit; pass the full displacement and limit=1 to test a finite movement segment.
  intersection(origin: Vec, direction: Vec, limit=Infinity):number|null {
    let nearest=Infinity,progress:number|null=null;
    this.points.forEach((a,i)=>{
      const b=this.points[(i+1)%this.points.length],sx=b[0]-a[0],sz=b[2]-a[2],den=direction[0]*sz-direction[2]*sx;
      if(Math.abs(den)<1e-10)return;
      const x=a[0]-origin[0],z=a[2]-origin[2],t=(x*sz-z*sx)/den,u=(x*direction[2]-z*direction[0])/den;
      if(t>=-1e-8&&t<=limit+1e-8&&t<nearest&&u>=-1e-8&&u<=1+1e-8){nearest=t;progress=(i+Math.max(0,Math.min(1,u)))/this.points.length;}
    });
    return progress===null?null:wrap(progress);
  }
  entry(origin: Vec, direction: Vec) {
    if(this.entryMode==='first-intersection'){
      const progress=this.intersection(origin,direction);
      if(progress!==null)return progress;
    }
    let best = -Infinity, index = 0;
    this.points.forEach((p, i) => {
      const length = distance(p, origin);
      const dot = length ? p.reduce((n, v, j) => n + (v - origin[j]) * direction[j], 0) / length : 0;
      if (dot > best) { best = dot; index = i; }
    });
    return index / this.points.length;
  }
}
