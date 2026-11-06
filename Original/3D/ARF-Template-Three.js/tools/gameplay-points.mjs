import assert from 'node:assert/strict';

// Map the original 390x844 pick samples through the current orthographic scale.
export async function gameplayPoints(page){
 const a=await page.locator('.cannon-ammo[data-lane="0"]').boundingBox();
 const b=await page.locator('.cannon-ammo[data-lane="1"]').boundingBox();
 assert(a&&b,'Cannon labels must be laid out before picking');
 const pixelsPerUnit=Math.abs(a.x+a.width/2-b.x-b.width/2)/6;
 const ratio=pixelsPerUnit/(844/42),{width,height}=page.viewportSize();
 return (x,y)=>[width/2+(x-195)*ratio,height/2+(y-422)*ratio];
}

// Fingertip of the tutorial hand: the hinted arrow, on any level. The hand fades between 3 s tap cycles,
// so the pose is read in the same frame that confirms it is shown.
export async function hintPoint(page){
 const handle=await page.waitForFunction(()=>{
  const el=document.querySelector('.tutorial-hand'),transform=el&&getComputedStyle(el).transform;
  if(!el||el.hidden||Number(el.style.opacity)<=.5||!transform||transform==='none')return null;
  const m=new DOMMatrix(transform),tap=el.style.height==='242px',p=new DOMPoint(29,tap?29:14).matrixTransform(m),r=el.parentElement.getBoundingClientRect();
  return [r.x+p.x,r.y+p.y+(tap?0:8*Math.hypot(m.a,m.b))];
 });
 return handle.jsonValue();
}
