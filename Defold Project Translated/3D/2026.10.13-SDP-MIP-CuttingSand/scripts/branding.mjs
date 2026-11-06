import fs from 'node:fs/promises';import {chromium}from'playwright';import sharp from'sharp';
const brand=JSON.parse(await fs.readFile('branding.json','utf8'));
await sharp('assets/branding/icon-source.png').resize(512,512,{fit:'contain'}).png().toFile(brand.icon);
const font=(await fs.readFile('assets/Nunito-Black.ttf')).toString('base64');const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
const png=await page.evaluate(async({font})=>{
 const face=new FontFace('BrandNunito',`url(data:font/ttf;base64,${font})`);document.fonts.add(face);await face.load();const c=document.createElement('canvas');c.width=1000;c.height=747;const ctx=c.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
 for(const [word,y]of [['SAND',220],['SLICE',510]]){
  let size=245;ctx.font=`${size}px BrandNunito`;while(ctx.measureText(word).width>880){size--;ctx.font=`${size}px BrandNunito`}
  ctx.lineWidth=43;ctx.strokeStyle='#6240a4';ctx.strokeText(word,500,y+18);ctx.lineWidth=38;ctx.strokeStyle='white';ctx.strokeText(word,500,y);
  const fill=ctx.createLinearGradient(0,y-size/2,0,y+size/2);fill.addColorStop(0,'#ffdf45');fill.addColorStop(.5,'#ffac24');fill.addColorStop(1,'#ff6a36');ctx.fillStyle=fill;ctx.fillText(word,500,y);
 }
 return c.toDataURL('image/png').split(',')[1];
},{font});await browser.close();await fs.writeFile(brand.logo,Buffer.from(png,'base64'));
await fs.writeFile('docs/BRANDING.json',JSON.stringify({name:brand.name,icon:{path:brand.icon,source:'assets/branding/icon-source.png',method:'Built-in image_gen; resized to 512x512 for the app icon',prompt:'Square casual puzzle app icon, layered rainbow kinetic sand cube, separated diagonal slice and white spatula, coral pink tile, no text or watermark.'},logo:{path:brand.logo,method:'New SAND / SLICE wordmark rendered with the original Nunito Black font, white border and purple shadow; replaces the original Sand Drop logo by user request.'}},null,2));
console.log('Created Sand Slice icon and end-card wordmark.');
