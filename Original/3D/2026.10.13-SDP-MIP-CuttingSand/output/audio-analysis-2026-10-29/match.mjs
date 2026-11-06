import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
import{readPcm,downsample,nextPower,spectrum,prefix,correlate,refine,directCorrelation}from'./signal.mjs';
const out=path.dirname(fileURLToPath(import.meta.url));const manifest=JSON.parse(fs.readFileSync(path.join(out,'decoded.json'),'utf8'));const sr=manifest.sampleRate,factor=10,rate=sr/factor;
const ref=readPcm(path.join(out,'pcm/reference.f32')),coarseRef=downsample(ref,factor);
const result={method:'Mono waveform normalized cross-correlation; coarse 1102.5 Hz then local 11025 Hz refinement. Scores are correlation coefficients, not probabilities.',sampleRate:sr,referenceDuration:ref.length/sr,bgm:[],sfx:[]};
const save=()=>fs.writeFileSync(path.join(out,'matches.json'),JSON.stringify(result,null,2));
const bgms=manifest.files.filter(f=>f.source.includes('/BGM/')||/Runtime\/audio\/bgm\.mp3$/.test(f.source));
const queries=[0,8,20,32,44,51].map(start=>({start,raw:ref.slice(Math.round(start*sr),Math.round((start+7)*sr)),coarse:coarseRef.slice(Math.round(start*rate),Math.round((start+7)*rate))}));
for(const [index,file]of bgms.entries()){
 const raw=readPcm(path.join(out,file.pcm)),coarse=downsample(raw,factor);const n=nextPower(coarse.length+Math.round(7*rate)-1),spec=spectrum(coarse,n),stats=prefix(coarse);const matches=[];
 for(const query of queries){if(coarse.length<query.coarse.length)continue;const peaks=correlate(coarse,query.coarse,{n,signalSpectrum:spec,statistics:stats,limit:3,separation:Math.round(rate*.5)});const refined=peaks.map(p=>{const r=refine(raw,query.raw,p.start*factor,35);return{referenceStart:query.start,sourceStart:r.start/sr,sourceMinusReference:r.start/sr-query.start,coarseScore:p.score,...r,start:undefined};});matches.push(...refined);}
 matches.sort((a,b)=>Math.abs(b.score)-Math.abs(a.score));result.bgm.push({source:file.source,duration:file.duration,matches});
 console.log('BGM',index+1,'/',bgms.length,file.source,JSON.stringify(matches[0]));save();
}
const sfx=manifest.files.filter(f=>f.id!=='reference'&&!bgms.includes(f));const maxLength=Math.max(...sfx.map(f=>Math.min(f.samples,Math.round(sr*15))/factor));const n=nextPower(coarseRef.length+maxLength-1),refSpec=spectrum(coarseRef,n),refStats=prefix(coarseRef);
for(const[index,file]of sfx.entries()){
 const raw=readPcm(path.join(out,file.pcm));let first=0,last=raw.length;const max=Math.max(...[] ,file.peak);const threshold=Math.max(.0003,max*.012);
 while(first<last&&Math.abs(raw[first])<threshold)first++;while(last>first&&Math.abs(raw[last-1])<threshold)last--;
 first=Math.max(0,first-Math.round(.005*sr));last=Math.min(last,first+Math.round(15*sr));const trim=raw.slice(first,last),coarse=downsample(trim,factor);
 if(coarse.length<16)continue;
 const peaks=correlate(coarseRef,coarse,{n,signalSpectrum:refSpec,statistics:refStats,limit:12,separation:Math.round(rate*Math.min(.25,trim.length/sr*.8))});
 const matches=peaks.map(p=>{const r=refine(ref,trim,p.start*factor,35);return{videoTime:r.start/sr-first/sr,audibleOffset:first/sr,coarseScore:p.score,...r,start:undefined};}).sort((a,b)=>Math.abs(b.score)-Math.abs(a.score));
 result.sfx.push({source:file.source,duration:file.duration,trim:[first/sr,last/sr],matches});
 if(matches[0]?.score>.2||index%20===0)console.log('SFX',index+1,'/',sfx.length,file.source,JSON.stringify(matches.slice(0,3)));save();
}
result.bgm.sort((a,b)=>Math.abs(b.matches[0]?.score||0)-Math.abs(a.matches[0]?.score||0));result.sfx.sort((a,b)=>Math.abs(b.matches[0]?.score||0)-Math.abs(a.matches[0]?.score||0));save();
console.log('TOP BGM',JSON.stringify(result.bgm.slice(0,5).map(f=>({source:f.source,match:f.matches[0]}))));console.log('TOP SFX',JSON.stringify(result.sfx.slice(0,15).map(f=>({source:f.source,match:f.matches[0]}))));
