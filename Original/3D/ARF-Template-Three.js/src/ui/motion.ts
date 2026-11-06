const lerp = (a: number,b: number,t: number) => a+(b-a)*t;
import type {Project} from './projection';
const out = (t: number) => 1-(1-t)**2;
const inOut = (t: number) => t < .5 ? 2*t*t : 1-(-2*t+2)**2/2;
// Brief: the hand taps once, hides, and reappears every 3 seconds.
export const handCycle = { period: 3, visible: 1.9, fade: .25 };
export function handPose(age: number) {
  const phase = age%handCycle.period, t = phase < .8 ? 0 : phase-.8;
  let y=0, rotation=0, xScale=1, yScale=1;
  if(t<.2) {y=lerp(0,.09,out(t/.2));rotation=lerp(0,-15,out(t/.2));}
  else if(t<.3) {const p=((t-.2)/.1)**2;y=lerp(.09,-.3,p);rotation=lerp(-15,20,p);}
  else if(t<.45) {const p=out((t-.3)/.15);y=lerp(-.3,-.06,p);rotation=lerp(20,-5,p);}
  else if(t<.7) {const p=inOut((t-.45)/.25);y=lerp(-.06,0,p);rotation=lerp(-5,0,p);}
  if(t>=.3 && t<.35) {xScale=lerp(1,1.1,(t-.3)/.05);yScale=lerp(1,.9,(t-.3)/.05);}
  else if(t>=.35 && t<.43) {xScale=lerp(1.1,.95,(t-.35)/.08);yScale=lerp(.9,1.05,(t-.35)/.08);}
  else if(t>=.43 && t<.55) {xScale=lerp(.95,1,(t-.43)/.12);yScale=lerp(1.05,1,(t-.43)/.12);}
  return {y,rotation,xScale,yScale,tap:t>=.2 && t<.45,opacity:Math.max(0,Math.min(1,phase/handCycle.fade,(handCycle.visible-phase)/handCycle.fade))};
}
export function handTransform(project:Project,head:number[],age:number) {
  const motion=handPose(age),target=project([head[0],head[1]+1.2,head[2]]);
  const unit=project([head[0]+1,head[1]+1.2,head[2]]).x-target.x;
  const scale=unit*.017,angle=motion.rotation*.2*Math.PI/180;
  const a=Math.cos(angle)*scale*motion.xScale,b=Math.sin(angle)*scale*motion.xScale;
  const c=-Math.sin(angle)*scale*motion.yScale,d=Math.cos(angle)*scale*motion.yScale;
  const tipY=motion.tap?29:14;
  return `matrix(${a},${b},${c},${d},${target.x-a*29-c*tipY},${target.y-b*29-d*tipY-(motion.tap?0:8*scale)})`;
}
export function pulse(age: number, curve: {duration:number;start:number;end:number;controls:number[]}) {
  const phase = age%(curve.duration*2), x = (phase <= curve.duration ? phase : curve.duration*2-phase)/curve.duration;
  const [x1,y1,x2,y2] = curve.controls;
  const bezier = (a:number,b:number,c:number,d:number,t:number) => (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
  let low=0,high=1;
  for(let i=0;i<20;i++) {const t=(low+high)/2;if(bezier(0,x1,x2,1,t)<x) low=t;else high=t;}
  return bezier(curve.start,y1,y2,curve.end,(low+high)/2);
}
