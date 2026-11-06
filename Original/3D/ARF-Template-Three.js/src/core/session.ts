import {preloadTuning,type Simulation} from './simulation.ts';

// winEndcardDelay gives the 1.814 s win cue playback headroom before the store redirect.
// endcardDelay: hold after the run ends so the lane doors (.35 s) roll shut before the endcard; endcardSeconds: its entry.
export const sessionTuning = { duration: 60, idleHint: 3.5, endcardDelay: .6, winEndcardDelay: 2.2, endcardSeconds: .4, warningSeconds: 1 };
export const warningTuning = { threshold: 95, pulseSeconds: 1.1, alertSeconds: .3 };

export class Session {
  onStart = () => {};
  onEnd = (_reason: 'clear' | 'timeout' | 'fail') => {};
  onProgress = (_cleared: number) => {};
  onEndcard = () => {};
  onWarningPulse = () => {};
  onWarningStop = () => {};
  warningPhase = 0;
  private warningRunning = false;
  endcardShown = false;
  simulation: Simulation;
  started = false;
  ended: 'clear' | 'timeout' | 'fail' | null = null;
  remaining: number = sessionTuning.duration;
  time = 0;
  endedAt = 0;
  idle = 0;
  interacted = false;
  hintId: number | null = null;
  hintSince = 0;
  warningUntil = 0;
  valid = new Set<number>();
  // Tap-count variants (3clicks, 10clicks): every tap on an arrow counts, whether it launches, is blocked or is refused.
  taps = 0;
  tapLimit: number;
  private hintOrder: readonly number[];
  constructor(simulation: Simulation, duration = sessionTuning.duration, tapLimit = Infinity, hintOrder:readonly number[] = []) { this.simulation = simulation; this.remaining = duration; this.tapLimit = tapLimit; this.hintOrder=hintOrder;this.refreshHint(); }
  launch(id: number) {
    if (this.ended || this.taps >= this.tapLimit) return 'ignored';
    const result = this.simulation.launch(id);
    if(!this.simulation.paused&&this.simulation.arrows.some(a=>a.data.id===id)){this.interacted=true;this.idle=0;this.hintId=null;}
    if(result!=='ignored')this.taps++;
    if (result === 'accepted') {
      if(!this.started)this.onStart();
      this.started = true; this.idle = 0; this.hintId = null;
      this.refreshHint();
    } else if (result === 'full') this.warningUntil = this.time + sessionTuning.warningSeconds;
    return result;
  }
  private refreshHint() {
    const arrows = this.simulation.arrows.filter(a => this.simulation.canMove(a));
    // Prefer arrows the front cannons fully absorb; fall back to buffering on the belt while it has spare room.
    const candidates = this.simulation.hintable(arrows.filter(a => !a.feedback));
    const planned=this.hintOrder.map(id=>this.simulation.arrows.find(a=>a.data.id===id)).find(a=>a&&!a.moving);
    const preferred=planned&&!planned.feedback&&arrows.includes(planned)&&(this.simulation.fits(planned)||planned.segments.length<=this.simulation.room-preloadTuning.hintReserve)?planned:undefined;
    if(preferred&&!candidates.includes(preferred))candidates.push(preferred);
    // Outlines mean an open path; the hand alone recommends a safer move.
    this.valid = new Set(arrows.filter(a=>!a.feedback).map(a => a.data.id));
    if (this.interacted && this.idle < sessionTuning.idleHint) return;
    // Prefer the upper arrow when newly open curved exits share the leftmost column.
    const candidate = this.hintOrder.length ? preferred : candidates.find(a=>a.data.id===this.hintId) ?? candidates.reduce<typeof candidates[number] | undefined>((best,a) => !best || a.data.position[0] < best.data.position[0] || (a.data.position[0]===best.data.position[0]&&a.data.position[2]<best.data.position[2]) ? a : best, undefined);
    const id = candidate?.data.id ?? null;
    if (id !== this.hintId) { this.hintId = id; this.hintSince = this.time; }
  }
  get warningActive() { return !this.ended && this.simulation.percentage >= warningTuning.threshold; }
  private updateWarning(seconds:number) {
    if(!this.warningActive){
      if(this.warningRunning)this.onWarningStop();
      this.warningRunning=false;this.warningPhase=0;return;
    }
    this.warningRunning=true;
    const alert=this.simulation.overloadPending||this.warningUntil>this.time;
    const next=this.warningPhase+seconds/(alert?warningTuning.alertSeconds:warningTuning.pulseSeconds);
    // Audio and the visual crest share the active gameplay clock; no hidden-time catch-up cues.
    if(this.interacted&&Math.floor(next+.5)>Math.floor(this.warningPhase+.5))this.onWarningPulse();
    this.warningPhase=next%1;
  }
  advance(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Invalid elapsed time');
    if (this.simulation.paused) return;
    const before = this.time; this.time += seconds;
    if (this.ended) {
      const delay=this.ended==='clear'?sessionTuning.winEndcardDelay:sessionTuning.endcardDelay;
      if (!this.endcardShown && this.time - this.endedAt >= delay) { this.endcardShown = true; this.onEndcard(); }
      return;
    }
    const elapsed = this.started ? Math.min(seconds,this.remaining) : seconds;
    this.simulation.advance(elapsed);
    this.idle += elapsed;
    if (this.started) {
      this.remaining = Math.max(0,this.remaining-elapsed);
      const cleared = this.simulation.cleared; this.onProgress(cleared);
      if (cleared >= 1) this.end('clear');
      else if (this.simulation.overloaded) this.end('fail');
      else if (this.remaining <= 1e-9) this.end('timeout');
    }
    // The last counted tap ends the run once its arrow has landed or bounced back; like the timer, it is not a failure.
    if (!this.ended && this.taps >= this.tapLimit && !this.simulation.arrows.some(a => (a.moving && !a.done) || a.feedback)) this.end('timeout');
    if (!this.ended && Math.floor(before*10) !== Math.floor(this.time*10)) this.refreshHint();
    if (!this.ended) this.updateWarning(elapsed);
  }
  private end(reason: 'clear' | 'timeout' | 'fail') {
    this.ended = reason; this.endedAt = this.time; this.hintId = null;
    this.simulation.cannons.stop();
    this.warningRunning=false;this.onWarningStop();
    this.onEnd(reason);
  }
}
