import fs from 'node:fs';import {chromium} from 'playwright';
const dir='analysis/screenshots/preload-color-comparison';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
try{
 const p=await b.newPage({deviceScaleFactor:1});
 for(const [width,height]of [[390,844],[844,390]]){
  const panels=['f34041','bf3233','ff4242'].map((color,i)=>`<section><header>${['Original','Darker trial','Current'][i]} <strong>#${color.toUpperCase()}</strong></header><img width="${width}" height="${height}" src="data:image/png;base64,${fs.readFileSync(`${dir}/${color}-${width}x${height}.png`).toString('base64')}"></section>`).join('');
  const html=`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:12px;background:#171923;color:#fff;font:18px Arial;display:flex;gap:12px}section{width:${width}px}header{height:44px;display:flex;align-items:center;justify-content:center;gap:12px}img{display:block}</style>${panels}`;
  fs.writeFileSync(`${dir}/comparison-${width}x${height}.html`,html);
  await p.setViewportSize({width:width*3+48,height:height+68});await p.setContent(html);await p.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
  await p.screenshot({path:`${dir}/comparison-three-colors-${width}x${height}.png`});
 }
}finally{await b.close();}
