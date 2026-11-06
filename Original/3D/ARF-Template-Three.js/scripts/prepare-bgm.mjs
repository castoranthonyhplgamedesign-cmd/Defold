import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const source='reference/audio/BGM.wav',output='src/assets/audio/bgm.mp3';
// The supplied music peaks near 0 dBFS; bake headroom into the asset before the runtime mix.
const attenuationDb=-24;
// Matching passages 7.68 s apart; the crossfade ends exactly where the next repeat begins.
const sourceStart=3.72,duration=7.68,crossfade=.48;
const filter=`[0:a]asplit=2[a][b];[a]atrim=start=${sourceStart+crossfade}:end=${sourceStart+duration+crossfade},asetpts=PTS-STARTPTS[body];[b]atrim=start=${sourceStart}:end=${sourceStart+crossfade},asetpts=PTS-STARTPTS[head];[body][head]acrossfade=d=${crossfade}:c1=tri:c2=tri,volume=${attenuationDb}dB[out]`;
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',source,'-filter_complex',filter,'-map','[out]','-map_metadata','-1','-vn','-c:a','libmp3lame','-b:a','96k','-ar','44100','-ac','2',output]);
const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration,size:stream=codec_name,sample_rate,channels,bit_rate','-of','json',output],{encoding:'utf8'}));
if(metadata.streams[0].bit_rate!=='96000')throw new Error('BGM must be 96 kbps');
assert(Math.abs(Number(metadata.format.duration)-duration)<.001);
const pcm=execFileSync('ffmpeg',['-v','error','-i',output,'-f','f32le','pipe:1'],{maxBuffer:8e6});
const samples=new Float32Array(pcm.buffer,pcm.byteOffset,pcm.length/4),frames=samples.length/2;
const seam=[];
for(let channel=0;channel<2;channel++){
  const rms=(start,end)=>{let sum=0;for(let i=start;i<end;i++)sum+=samples[i*2+channel]**2;return Math.sqrt(sum/(end-start));};
  const startRms=rms(0,2205),endRms=rms(frames-2205,frames),jump=Math.abs(samples[channel]-samples[(frames-1)*2+channel]);
  assert(startRms>.001&&endRms>.001,'Loop must not fade to silence');
  assert(jump<.005,'Decoded MP3 wrap must not have a large sample jump');
  seam.push({channel,startRms,endRms,jump});
}
const record={source,sourceSha256:createHash('sha256').update(fs.readFileSync(source)).digest('hex'),output,excerptSeconds:duration,sourceStart,crossfadeSeconds:crossfade,attenuationDb,runtimeGain:.5,seam,...metadata};
fs.writeFileSync('analysis/evidence/bgm-asset.json',JSON.stringify(record,null,2));console.log(JSON.stringify(record,null,2));
