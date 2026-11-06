import fs from 'node:fs';
export function readPcm(file){const b=fs.readFileSync(file);return new Float32Array(b.buffer,b.byteOffset,b.byteLength/4);}
export function downsample(x,factor=10){const out=new Float64Array(Math.floor(x.length/factor));for(let i=0;i<out.length;i++){let s=0;for(let j=0;j<factor;j++)s+=x[i*factor+j];out[i]=s/factor;}return out;}
export function nextPower(n){let size=1;while(size<n)size*=2;return size;}
const plans=new Map();
function plan(n){if(plans.has(n))return plans.get(n);const cos=new Float64Array(n/2),sin=new Float64Array(n/2);for(let i=0;i<n/2;i++){cos[i]=Math.cos(-2*Math.PI*i/n);sin[i]=Math.sin(-2*Math.PI*i/n);}const bit=new Uint32Array(n);let j=0;for(let i=0;i<n;i++){bit[i]=j;let m=n>>1;while(j&m){j^=m;m>>=1;}j^=m;}const p={cos,sin,bit};plans.set(n,p);return p;}
export function fft(real,imag,inverse=false){const n=real.length,{cos,sin,bit}=plan(n);for(let i=0;i<n;i++){const j=bit[i];if(i<j){let t=real[i];real[i]=real[j];real[j]=t;t=imag[i];imag[i]=imag[j];imag[j]=t;}}for(let len=2;len<=n;len*=2){const half=len/2,step=n/len;for(let base=0;base<n;base+=len){for(let j=0;j<half;j++){const a=base+j,b=a+half,idx=j*step,wr=cos[idx],wi=inverse?-sin[idx]:sin[idx];const br=real[b],bi=imag[b],tr=wr*br-wi*bi,ti=wr*bi+wi*br;real[b]=real[a]-tr;imag[b]=imag[a]-ti;real[a]+=tr;imag[a]+=ti;}}}if(inverse)for(let i=0;i<n;i++){real[i]/=n;imag[i]/=n;}}
export function spectrum(x,n=nextPower(x.length)){const re=new Float64Array(n),im=new Float64Array(n);re.set(x);fft(re,im);return{re,im};}
export function prefix(x){const sum=new Float64Array(x.length+1),squares=new Float64Array(x.length+1);for(let i=0;i<x.length;i++){sum[i+1]=sum[i]+x[i];squares[i+1]=squares[i]+x[i]*x[i];}return{sum,squares};}
export function correlate(signal,template,{signalSpectrum,n=nextPower(signal.length+template.length-1),statistics=prefix(signal),limit=8,separation=250}={}){
 const m=template.length;let mean=0;for(let i=0;i<m;i++)mean+=template[i]/m;
 const reversed=new Float64Array(n);let energy=0;for(let i=0;i<m;i++){const v=template[i]-mean;reversed[m-i-1]=v;energy+=v*v;}
 if(energy<1e-14)return[];
 const imaginary=new Float64Array(n);fft(reversed,imaginary);const sig=signalSpectrum||spectrum(signal,n);
 for(let i=0;i<n;i++){const a=reversed[i],b=imaginary[i];reversed[i]=a*sig.re[i]-b*sig.im[i];imaginary[i]=a*sig.im[i]+b*sig.re[i];}
 fft(reversed,imaginary,true);
 const candidates=[];const {sum,squares}=statistics;
 for(let start=0;start<=signal.length-m;start++){
   const s=sum[start+m]-sum[start],e=squares[start+m]-squares[start]-s*s/m;
   const score=e>1e-14?reversed[start+m-1]/Math.sqrt(e*energy):0;
   if(!Number.isFinite(score))continue;
   if(candidates.length>=limit&&Math.abs(score)<=Math.abs(candidates[candidates.length-1].score))continue;
   const near=candidates.findIndex(p=>Math.abs(p.start-start)<separation);
   if(near>=0){if(Math.abs(candidates[near].score)>=Math.abs(score))continue;candidates.splice(near,1);}
   candidates.push({start,score});candidates.sort((a,b)=>Math.abs(b.score)-Math.abs(a.score));if(candidates.length>limit)candidates.length=limit;
 }
 return candidates;
}
export function directCorrelation(signal,template,start,templateStart=0,length=template.length-templateStart){
 let sx=0,st=0,xx=0,tt=0,xt=0,n=0;
 for(let i=0;i<length;i++){const j=start+i,k=templateStart+i;if(j<0||j>=signal.length||k<0||k>=template.length)continue;const x=signal[j],t=template[k];sx+=x;st+=t;xx+=x*x;tt+=t*t;xt+=x*t;n++;}
 const xe=xx-sx*sx/n,te=tt-st*st/n;return {score:xe>0&&te>0?(xt-sx*st/n)/Math.sqrt(xe*te):0,gain:te>0?(xt-sx*st/n)/te:0,length:n};
}
export function refine(signal,template,coarseStart,radius=40){let best={score:0,start:coarseStart};for(let start=Math.round(coarseStart)-radius;start<=Math.round(coarseStart)+radius;start++){const r=directCorrelation(signal,template,start);if(Math.abs(r.score)>Math.abs(best.score))best={...r,start};}return best;}
