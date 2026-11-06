type Phase = 'idle' | 'priming' | 'starting' | 'playing' | 'pending';
interface Voice {
  media: HTMLAudioElement; phase: Phase; primed: boolean; unsupported: boolean;
  generation: number; cue: number; token?: number; requested: number; attempted: number;
  gain: number; cleanup: () => void;
}
export interface SoundDefinition { src: string; count: number; gain: number; loop?: boolean }
export const audioTuning = { freshnessMs: 350, moveRetryMs: 100, stallMs: 1500 };

export class AudioPools {
  private pools: Record<string,Voice[]> = {};
  private tokens = new Set<number>();
  private sequence = 0;
  private gestureSeen = false;
  private paused = false;
  private volume = 1;
  private disposed = false;
  private music: Voice | null = null;
  private now: () => number;
  constructor(definitions: Record<string,SoundDefinition>, create = () => new Audio(), now = () => performance.now()) {
    this.now=now;
    for (const [name,definition] of Object.entries(definitions)) {
      this.pools[name]=Array.from({length:definition.count},()=>{
        const media=create();media.src=definition.src;media.preload='auto';media.loop=definition.loop??false;media.muted=true;media.volume=definition.gain;
        try {media.load();} catch { /* Actual playback still gets an independent attempt. */ }
        return {media,phase:'idle',primed:false,unsupported:false,generation:0,cue:0,requested:0,attempted:0,gain:definition.gain,cleanup:()=>{}};
      });
    }
  }
  private voices() {return Object.values(this.pools).flat();}
  prepare() {
    return new Promise<void>(resolve=>{
      const pending=new Set(this.voices().filter(v=>v.media.readyState<1)),cleanups:(()=>void)[]=[];
      const finish=()=>{clearTimeout(timer);cleanups.forEach(clean=>clean());resolve();};
      const timer=setTimeout(finish,1500);
      if(!pending.size){finish();return;}
      for(const v of pending){
        const done=()=>{pending.delete(v);if(!pending.size)finish();};
        v.media.addEventListener('loadedmetadata',done);v.media.addEventListener('error',done);
        cleanups.push(()=>{v.media.removeEventListener('loadedmetadata',done);v.media.removeEventListener('error',done);});
      }
    });
  }
  private reset(v:Voice,rewind=true) {
    v.generation++;v.cleanup();v.cleanup=()=>{};v.phase='idle';v.token=undefined;
    v.media.pause();v.media.muted=true;if(rewind)try {v.media.currentTime=0;} catch { /* Not yet seekable. */ }
  }
  private apply(v:Voice) {v.media.volume=v.gain*this.volume;v.media.muted=this.paused || this.volume===0 || v.phase==='priming' || v.phase==='idle';}
  private attempt(v:Voice,prime:boolean) {
    const generation=++v.generation;v.cleanup();v.phase=prime?'priming':'starting';v.attempted=this.now();this.apply(v);
    const current=()=>generation===v.generation && !this.disposed;
    const succeeded=()=>{
      if(!current()) {if(this.paused || v.phase==='idle')v.media.pause();return;}
      v.primed=true;
      if(prime) this.reset(v);
    };
    const playing=()=>{if(!current() || v.media.paused)return;if(prime)succeeded();else {v.phase='playing';v.primed=true;}};
    const failed=(error:unknown)=>{
      if(!current())return;
      if(v.phase==='playing' && !v.media.paused)return;
      const name=(error as {name?:string})?.name;
      if(name==='NotAllowedError')v.primed=false;
      if(name==='NotSupportedError')v.unsupported=true;
      if(!prime && !v.unsupported && (v===this.music || (v.token!==undefined && this.tokens.has(v.token) && this.now()-v.requested<audioTuning.freshnessMs))) v.phase='pending';
      else this.reset(v);
    };
    const ended=()=>{if(current() && v.media.ended)this.reset(v);};
    const error=()=>failed({name:'NotSupportedError'});
    v.media.addEventListener('playing',playing);v.media.addEventListener('ended',ended);v.media.addEventListener('error',error);
    v.cleanup=()=>{v.media.removeEventListener('playing',playing);v.media.removeEventListener('ended',ended);v.media.removeEventListener('error',error);};
    try {const promise=v.media.play();promise?.then(succeeded,failed);} catch(error) {failed(error);}
  }
  play(name:string,token?:number) {
    if(this.disposed || this.paused || !this.gestureSeen || this.volume===0)return;
    const pool=this.pools[name];if(!pool)return;
    this.sweep();
    const v=pool.find(v=>v.phase==='idle' && v.primed && !v.unsupported) ?? pool.find(v=>(v.phase==='idle' || v.phase==='priming') && !v.unsupported);
    // Bounded overflow drops the newest cue; gameplay and existing tails continue.
    if(!v)return;
    v.cue=++this.sequence;v.token=token;v.requested=this.now();
    try {v.media.currentTime=0;} catch { /* Cold element; play remains synchronous. */ }
    this.attempt(v,false);
  }
  // Music belongs to the session, not a held finger; repeated taps never rewind it.
  startMusic(name:string) {
    if(this.disposed||!this.gestureSeen)return;
    const voice=this.pools[name]?.[0];if(!voice?.media.loop)return;
    this.music=voice;
  }
  private resumeMusic(boundary:boolean) {
    const v=this.music;if(!v||this.disposed||this.paused||this.volume===0||v.unsupported)return;
    if(v.phase==='idle'||((v.phase==='pending'||v.phase==='starting')&&(boundary||this.now()-v.attempted>=audioTuning.moveRetryMs)))this.attempt(v,false);
  }
  start(token:number,action:()=>void=()=>{}) {if(this.paused || this.disposed)return;this.tokens.add(token);this.gestureSeen=true;action();this.resumeMusic(true);this.prime(false);}
  move(token:number) {this.recover(token,false,this.sequence);}
  release(token:number,action:()=>void) {
    const previous=this.sequence;
    action();
    this.recover(token,true,previous);this.prime(true);this.tokens.delete(token);
    for(const v of this.voices())if(v.token===token && v.phase==='pending')this.reset(v);
  }
  cancel(token:number) {this.tokens.delete(token);for(const v of this.voices())if(v.token===token)this.reset(v);}
  private recover(token:number,boundary:boolean,previous:number) {
    if(this.paused || !this.tokens.has(token))return;
    for(const v of this.voices()) {
      if(v.token!==token || v.cue>previous || (v.phase!=='pending' && v.phase!=='starting'))continue;
      if(this.now()-v.requested>audioTuning.freshnessMs){this.reset(v);continue;}
      if(boundary || this.now()-v.attempted>=audioTuning.moveRetryMs)this.attempt(v,false);
    }
    this.resumeMusic(boundary);
  }
  private prime(boundary:boolean) {
    if(this.paused || this.disposed)return;
    for(const v of this.voices())if(!v.media.loop && !v.unsupported && ((!v.primed && v.phase==='idle') || (boundary && v.phase==='priming')))this.attempt(v,true);
  }
  sweep() {
    for(const v of this.voices())if((v.phase==='starting' || v.phase==='pending' || v.phase==='priming') && this.now()-v.attempted>audioTuning.stallMs)this.reset(v,v!==this.music);
  }
  setState(paused:boolean,volume:number) {
    const wasSilent=this.paused||this.volume===0;
    this.paused=paused;
    if(Number.isFinite(volume))this.volume=Math.max(0,Math.min(1,volume));
    if(paused || this.volume===0){this.tokens.clear();for(const v of this.voices())this.reset(v,v!==this.music);}
    else {for(const v of this.voices())this.apply(v);if(wasSilent)this.resumeMusic(false);}
  }
  stopCue(name:string) {for(const v of this.pools[name]??[])this.reset(v);}
  stop() {this.music=null;this.tokens.clear();for(const v of this.voices())this.reset(v);}
  dispose() {this.stop();this.disposed=true;for(const v of this.voices()){v.media.removeAttribute('src');try{v.media.load();}catch{}}this.pools={};}
}
