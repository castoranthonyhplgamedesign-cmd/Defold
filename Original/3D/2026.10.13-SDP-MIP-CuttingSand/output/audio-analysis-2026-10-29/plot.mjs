import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';import sharp from'sharp';import{readPcm,fft,correlate,downsample}from'./signal.mjs';
const out=path.dirname(fileURLToPath(import.meta.url)),sr=11025,a=readPcm(path.join(out,'pcm/reference.f32')),duration=a.length/sr;
const width=1180,height=300,n=2048,real=new Float64Array(n),imag=new Float64Array(n),pixels=Buffer.alloc(width*height*3),features=[];
const palette=v=>{v=Math.max(0,Math.min(1,v));return v<.33?[Math.round(40*v/.33),Math.round(25*v/.33),Math.round(65+150*v/.33)]:v<.66?[Math.round(40+210*(v-.33)/.33),Math.round(25+45*(v-.33)/.33),Math.round(215-165*(v-.33)/.33)]:[255,Math.round(70+185*(v-.66)/.34),Math.round(50+150*(v-.66)/.34)];};
let last=0;for(let i=0;i<a.length;i++)if(Math.abs(a[i])>1e-6)last=i;
for(let x=0;x<width;x++){
 const center=Math.round((x+.5)/width*a.length);let rms=0,peak=0;
 for(let i=0;i<n;i++){const value=a[center+i-n/2]||0;real[i]=value*(.5-.5*Math.cos(2*Math.PI*i/(n-1)));imag[i]=0;rms+=value*value;peak=Math.max(peak,Math.abs(value));}
 fft(real,imag);let low=0,mid=0,high=0;
 for(let k=1;k<n/2;k++){const power=(real[k]**2+imag[k]**2)/(n*n),hz=k*sr/n;if(hz<250)low+=power;else if(hz<1800)mid+=power;else high+=power;}
 for(let y=0;y<height;y++){const hz=50*(5000/50)**(1-y/(height-1)),bin=hz*n/sr,k=Math.min(n/2-1,Math.max(1,Math.round(bin))),db=20*Math.log10(Math.hypot(real[k],imag[k])/(n/2)+1e-9),rgb=palette((db+85)/70);const idx=(y*width+x)*3;pixels[idx]=rgb[0];pixels[idx+1]=rgb[1];pixels[idx+2]=rgb[2];}
 features.push({time:(x+.5)/width*duration,rms:Math.sqrt(rms/n),peak,low,mid,high});
}
await sharp(pixels,{raw:{width,height,channels:3}}).png().toFile(path.join(out,'spectrogram.png'));
const W=1280,H=650,X=70,Y=55,plotW=1180,trackY=90,trackH=130,specY=270;
const wave=features.map((f,i)=>`${i?'L':'M'}${(X+i/width*plotW).toFixed(2)},${(trackY+trackH-Math.max(0,(20*Math.log10(f.rms+1e-12)+70)/65)*trackH).toFixed(2)}`).join(' ');
let marks='';for(let t=0;t<=55;t+=5)marks+=`<line x1="${X+t/59*plotW}" y1="${trackY}" x2="${X+t/59*plotW}" y2="${specY+height}" stroke="#475569" opacity=".4"/><text x="${X+t/59*plotW}" y="${specY+height+24}" fill="#cbd5e1" font-size="14" text-anchor="middle">${t}s</text>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#0f172a"/><text x="${X}" y="32" fill="white" font-family="Arial" font-size="23">Reference video audio — 59 seconds</text><text x="${X}" y="65" fill="#cbd5e1" font-family="Arial" font-size="14">Mono analysis at 11,025 Hz; RMS envelope and logarithmic spectrogram. Colors show energy, not sound identity.</text><rect x="${X}" y="${trackY}" width="${plotW}" height="${trackH}" fill="#17263b"/><path d="${wave}" fill="none" stroke="#38bdf8" stroke-width="1.5"/><text x="12" y="130" fill="#cbd5e1" font-size="13">RMS</text><text x="${X}" y="246" fill="#cbd5e1" font-size="14">Spectrogram (50 Hz–5 kHz, 186 ms windows)</text><image x="${X}" y="${specY}" width="${plotW}" height="${height}" href="data:image/png;base64,${fs.readFileSync(path.join(out,'spectrogram.png')).toString('base64')}"/>${marks}<text x="10" y="${specY+15}" fill="#cbd5e1" font-size="12">5 kHz</text><text x="10" y="${specY+height-4}" fill="#cbd5e1" font-size="12">50 Hz</text><text x="${X}" y="630" fill="#cbd5e1" font-size="14">Last sample above −120 dBFS: ${(last/sr).toFixed(3)} s. Exact source identification requires consistent waveform evidence.</text></svg>`;
fs.writeFileSync(path.join(out,'audio-overview.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(path.join(out,'audio-overview.png'));
fs.writeFileSync(path.join(out,'signal-features.json'),JSON.stringify({duration,lastNonzero:last/sr,features},null,2));
console.log(JSON.stringify({duration,lastNonzero:last/sr,overview:'audio-overview.png'}));
