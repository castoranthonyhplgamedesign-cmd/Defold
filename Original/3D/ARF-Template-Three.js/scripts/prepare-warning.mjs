import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// Original low double-buzzer synthesis guided by OnWarning's measured burst/harmonic character.
// No reference samples are used; pitch, pulse envelope and tail are authored here.
const rate=44100,duration=.46,samples=new Float64Array(Math.round(rate*duration));
for(const [start,length,frequency] of [[0,.14,98],[.18,.16,98]]){
 let phase=0;
 for(let n=0;n<Math.round(length*rate);n++){
  const t=n/rate,u=t/length;
  phase+=2*Math.PI*frequency*(1-.035*u+.008*Math.sin(2*Math.PI*19*t))/rate;
  const attack=Math.min(1,t/.005),release=Math.min(1,(length-t)/.025);
  const envelope=Math.sin(attack*Math.PI/2)**2*Math.sin(release*Math.PI/2)**2;
  const tone=.6*Math.sin(phase)+.5*Math.sin(2*phase)+.55*Math.sin(4*phase)+.16*Math.sin(6*phase)+.22*Math.sin(8*phase);
  samples[Math.round(start*rate)+n]+=envelope*Math.tanh(1.25*tone);
 }
}
// Short, quiet reflections soften the cutoff without a long overlapping alarm tail.
const dry=samples.slice();
for(const [delay,gain] of [[.029,.12],[.061,.065]])for(let i=Math.round(delay*rate);i<samples.length;i++)samples[i]+=gain*dry[i-Math.round(delay*rate)];
const peak=Math.max(...samples.map(Math.abs)),wav=Buffer.alloc(44+samples.length*2);
wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);
wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);
samples.forEach((v,i)=>wav.writeInt16LE(Math.round(v/peak*.4*32767),44+i*2));
fs.mkdirSync('analysis/warning-audio',{recursive:true});
const source='analysis/warning-audio/warning-pulse.wav',output='src/assets/audio/warning-pulse.mp3';
fs.writeFileSync(source,wav);
execFileSync('ffmpeg',['-y','-v','error','-i',source,'-map_metadata','-1','-c:a','libmp3lame','-b:a','96k','-ar','44100','-ac','1',output]);
const metadata=JSON.parse(execFileSync('ffprobe',['-v','quiet','-show_format','-show_streams','-of','json',output],{encoding:'utf8'}));
const record={method:'Original low double-buzzer synthesis; no reference samples reused',example:'OnWarning.wav',exampleSha256:createHash('sha256').update(fs.readFileSync('OnWarning.wav')).digest('hex'),analysis:'analysis/warning-audio/onwarning-analysis.json',source,output,duration,runtimeGain:.22,peakBeforeEncoding:.4,...metadata};
fs.writeFileSync('analysis/evidence/warning-asset.json',JSON.stringify(record,null,2));
console.log(JSON.stringify({output,bytes:fs.statSync(output).size,duration,runtimeGain:.22}));
