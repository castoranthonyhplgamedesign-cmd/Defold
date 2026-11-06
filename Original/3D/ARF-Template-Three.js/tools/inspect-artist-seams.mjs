import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:1200}});
 await page.goto('http://127.0.0.1:5181/level-editor.html');
 const mesh=JSON.parse(fs.readFileSync('analysis/artist-longarrow/playable-qa.arrow-flow.json')).conveyor.mesh;
 await page.evaluate(async mesh=>{
  const T=await import('/node_modules/three/build/three.module.js');
  document.body.replaceChildren();document.body.style.margin='0';
  const renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(1200,1200);document.body.append(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color('#454363');scene.add(new T.AmbientLight(0xffffff,1.6));const sun=new T.DirectionalLight(0xffffff,2.5);sun.position.set(0,9,4);scene.add(sun);
  const items=mesh.parts.map((p,i)=>{const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer,g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(bytes(p.position)),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(bytes(p.normal)),3));g.setIndex(new T.BufferAttribute(new Uint32Array(bytes(p.index)),1));const m=new T.Mesh(g,new T.MeshPhysicalMaterial({color:i?'#313957':'#9da4b7',roughness:.22,clearcoat:1,side:T.DoubleSide}));scene.add(m);return m;});
  const box=new T.Box3().setFromObject(scene),s=box.getSize(new T.Vector3()),c=box.getCenter(new T.Vector3()),half=Math.max(s.x,s.z)*.55;
  const camera=new T.OrthographicCamera(-half,half,half,-half,.1,1000);camera.position.set(c.x,100,c.z+20);camera.lookAt(c);camera.updateProjectionMatrix();
  window.shot=(which)=>{items.forEach((m,i)=>m.visible=which==='both'||i===which);renderer.render(scene,camera);};window.shot('both');
 },mesh);
 fs.mkdirSync('analysis/screenshots/artist-detail',{recursive:true});
 for(const [name,which]of [[process.argv[2]??'current','both'],['frame',0],['belt',1]]){await page.evaluate(which=>window.shot(which),which);await page.screenshot({path:`analysis/screenshots/artist-detail/longarrow-${name}.png`});}
}finally{await browser.close();}
