"""Convert original MP3 copies to Defold-supported Vorbis, preserving timing/gain."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[1]
WORKSPACE=ROOT.parents[2]
ffmpeg=shutil.which('ffmpeg')
if not ffmpeg:
    candidates=list((WORKSPACE/'Defold Project Translated').glob('**/ffmpeg-static/ffmpeg.exe'))
    if not candidates:raise SystemExit('Install ffmpeg or provide an ffmpeg-static executable.')
    ffmpeg=str(candidates[0])
results=[]
for source in (ROOT/'assets/audio').glob('*.mp3'):
    target=source.with_suffix('.ogg')
    command=[ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(source),'-map_metadata','-1','-c:a','libvorbis','-q:a','6',str(target)]
    subprocess.run(command,check=True,capture_output=True)
    results.append({'source':source.relative_to(ROOT).as_posix(),'destination':target.relative_to(ROOT).as_posix(),
        'conversion':'MP3 decoded and encoded as Vorbis quality 6; no speed, gain, trimming or channel changes',
        'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'output_sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
    for sound in (ROOT/'main').glob('*.sound'):
        text=sound.read_text();sound.write_text(text.replace(source.name,target.name))
manifest=json.loads((ROOT/'docs/asset-manifest.json').read_text())
manifest['audio_conversions']=results
manifest['ffmpeg_sha256']=hashlib.sha256(Path(ffmpeg).read_bytes()).hexdigest()
(ROOT/'docs/asset-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'converted':len(results),'tool':ffmpeg}))
