import { BeltPush } from './beltPush.ts';
import { BlockedFeedback } from './blockedFeedback.ts';
import { ConveyorPath, distance, mix, wrap } from './path.ts';
import type { Vec } from './path.ts';
import { motionTuning } from './motionTuning.ts';
import { Cannons } from './cannons.ts';
import type { LaneData } from './cannons.ts';

export interface ArrowData { id: number; color: string; direction: Vec; position: Vec; cells: Vec[]; cellSize?:number }
export interface Segment { arrowId: number; index: number; color: string; position: Vec; previousPosition?: Vec; yaw: number; progress: number | null; inTransit: boolean; removed: boolean; size?:number }
export interface ArrowState { data: ArrowData; moving: boolean; segments: Segment[]; elapsed: number; duration: number; entry: number; arrived: number | null; done: boolean; histories: Vec[][]; feedback: BlockedFeedback | null; route?: Route; travelled?: number; speed?: number }
// Overload launch route: straight along the arrow's row to the belt edge, then a smooth merge onto the belt.
interface Route { points: Vec[]; lengths: number[]; merge: number }
export const tuning = { speed: motionTuning.conveyorSpeed, spacing: .9, segmentSpacing: .60, admission: 90, meterPerBlock: .5, forcedInsertion: .5 / motionTuning.launchPlaybackRate, follow: 20 * motionTuning.launchPlaybackRate, tick: 1 / 120 };
// Authored overload-preview spacing, independent of the reference meter weighting.
// Belt speed matches the shipped game (~10 blocks/s). Belt block is .9 of a board cell; touching pitch 1.03x.
// fraction: share of the nominal slots preloaded with whites, rounded to the mockup's 99% start.
// launchFactor: arrow flight speed over belt speed; it eases down to belt speed through the merge.
// mergeCells: the merge curve starts where the arrow first comes this many cells from the belt centerline, so a
// slanted arrow never runs along the belt edge, and it joins the belt beside that point; mergeShift: it lands this many
// block units downstream of where the arrow's row crosses the belt, so the arrow turns in instead of sliding sideways.
// turnRate: maximum head turn speed; jamGraceSeconds: unmatched settled-belt delay. A full entry fails immediately.
export const preloadTuning = { gap: .1, fraction: .99, blocksPerSecond: 10, beltScale: .9, seam: 1.03, hintReserve: 8, launchFactor: 1.6, mergeCells: .9, mergeShift: .75, turnRate: 20, jamGraceSeconds: .8 };

// Rounded-rectangle footprint of the body mesh (geometry.json: ±.447 x ±.498, elliptical .22 x .25 corners), per
// unit block. Arc points sit slightly outside the curve so the polygon never undercuts the real mesh.
const footprint: number[][] = [];
for (const [sx, sz, start] of [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]])
  for (let k = 0; k <= 6; k++) { const a = (start + 15 * k) * Math.PI / 180, out = 1 / Math.cos(7.5 * Math.PI / 180); footprint.push([sx * (.447 - .22) + .22 * out * Math.cos(a), sz * (.498 - .25) + .25 * out * Math.sin(a)]); }
function overlaps(a: number[][], b: number[][]) {
  for (const poly of [a, b]) for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], length = Math.hypot(p[1] - q[1], q[0] - p[0]);
    if (length < 1e-6) continue;
    const x = (p[1] - q[1]) / length, z = (q[0] - p[0]) / length;
    let amin = Infinity, amax = -Infinity, bmin = Infinity, bmax = -Infinity;
    for (const v of a) { const d = v[0] * x + v[1] * z; amin = Math.min(amin, d); amax = Math.max(amax, d); }
    for (const v of b) { const d = v[0] * x + v[1] * z; bmin = Math.min(bmin, d); bmax = Math.max(bmax, d); }
    if (amax <= bmin + 1e-8 || bmax <= amin + 1e-8) return false;
  }
  return true;
}
// Belt length in touching-block units: one unit is the seam pitch on straights and wider where bends need it.
// Returns the cumulative unit count at each sample; blocks advancing equal units stay touching all round.
function beltUnits(path: ConveyorPath, size: number, samples = 512) {
  const body = (t: number) => { const c = path.position(t), yaw = path.yaw(t), co = Math.cos(yaw), si = Math.sin(yaw); return footprint.map(([x, z]) => [c[0] + size * (x * co + z * si), c[2] + size * (-x * si + z * co)]); };
  const pitch = Array.from({ length: samples }, (_, i) => {
    const t = i / samples, a = body(t); let lo = 0, hi = 2 * size;
    for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (overlaps(a, body(t + m / path.length))) lo = m; else hi = m; }
    // .015 covers interpolation between samples (the 1.29-cell v2 grid's bends need more than the .01 that 1.25 did).
    return Math.max(hi + .015, size * preloadTuning.seam);
  });
  // A follower at p needs its whole pitch ahead to span at most one unit; widen samples only where a pair falls short.
  const step = path.length / samples, scale = pitch.slice();
  let units: number[] = [];
  for (let pass = 0; pass < 200; pass++) {
    units = [0]; for (let i = 0; i < samples; i++) units.push(units[i] + step / scale[i]);
    const at = (x: number) => { const k = Math.floor(x), f = x - k, n = Math.floor(k / samples); return units[k % samples] + n * units[samples] + f * (units[k % samples + 1] - units[k % samples]); };
    const grow = new Array(samples).fill(1);
    for (let i = 0; i < samples; i++) {
      // Followers sit between samples too: hold each sample to the wider of its neighbours' needs.
      const need = Math.max(pitch[i], pitch[(i + 1) % samples]), span = at(i + need / step) - units[i];
      if (span > 1 + 1e-9) for (let j = i; j <= i + Math.ceil(need / step) + 1; j++) grow[j % samples] = Math.max(grow[j % samples], span);
    }
    if (grow.every(g => g === 1)) break;
    // Damped, once per sample per pass: overlapping windows would otherwise compound into needless gaps.
    for (let j = 0; j < samples; j++) scale[j] *= Math.sqrt(grow[j]) * (1 + 1e-6);
  }
  return units;
}


export class Simulation {
  onBlockedContact = () => {};
  arrows: ArrowState[];
  onPath: Segment[] = [];
  preloaded: Segment[] = [];
  capacity: number | null = null;
  pausedGroups = new Set<number>();
  paused = false;
  private remainder = 0;
  jammed = false;
  private overloadElapsed = 0;
  private units: number[] = [];
  private started = false;
  private beltPush = new BeltPush(this);
  path: ConveyorPath;
  cannons: Cannons;
  private allSegments: Segment[];
  constructor(data: ArrowData[], path: ConveyorPath, lanes: LaneData[] = [], whitePreloadSize?: number) {
    this.path = path;
    this.cannons = new Cannons(lanes);
    const occupied = new Set<string>(), ids = new Set<number>();
    this.arrows = data.map(a => {
      const size=a.cellSize??1;if(!Number.isFinite(size)||size<.5||size>1.5)throw new Error('Invalid arrow cell size');
      if (ids.has(a.id) || !Number.isInteger(a.id) || !a.color || a.direction.length !== 3 || a.direction[1] !== 0 || a.direction.some(v => !Number.isInteger(v)) || a.direction.reduce((s, v) => s + Math.abs(v), 0) !== 1 || a.position.length !== 3 || !a.position.every(Number.isFinite) || !a.cells.length) throw new Error('Invalid arrow');
      ids.add(a.id);
      const segments = a.cells.map((c, index) => {
        if (c.length !== 3 || !c.every(Number.isFinite) || (index && Math.abs(distance(c, a.cells[index - 1]) - size) > 1e-6)) throw new Error('Invalid arrow cells');
        const position = c.map((v, j) => v + a.position[j]), key = position.join(',');
        if (occupied.has(key)) throw new Error('Overlapping board cells'); occupied.add(key);
        return { arrowId: a.id, index, color: a.color, position, yaw: Math.atan2(a.direction[0], a.direction[2]), progress: null, inTransit: false, removed: false, size };
      });
      return { data: a, moving: false, segments, elapsed: 0, duration: 0, entry: path.entryMode==='first-intersection'?path.entry(a.position,a.direction):0, arrived: null, done: false, histories: [], feedback: null };
    });
    if(whitePreloadSize!==undefined){
      if(!Number.isFinite(whitePreloadSize)||whitePreloadSize<.5||whitePreloadSize>1.5)throw new Error('Invalid preload block size');
      this.capacity=Math.floor(path.length/(whitePreloadSize+preloadTuning.gap));
      this.units=beltUnits(path,whitePreloadSize*preloadTuning.beltScale);
      const count=Math.round(this.capacity*preloadTuning.fraction);
      if(count<1||count>=this.capacity)throw new Error('Conveyor cannot represent a near-full preload');
      let group=-1;while(ids.has(group))group--;
      // One touching train, as on the shipped game's belt; the leftover length stays as one open stretch.
      if(count>this.blockUnits)throw new Error('Conveyor cannot represent a near-full preload');
      this.preloaded=Array.from({length:count},(_,index)=>{
        const progress=this.fromUnits(index);
        return {arrowId:group,index,color:'white',position:path.position(progress),yaw:path.yaw(progress),progress,inTransit:false,removed:false,size:whitePreloadSize};
      });
      this.onPath=[...this.preloaded];
    }
    this.allSegments = [...this.arrows.flatMap(a => a.segments),...this.preloaded];
  }
  // Touching blocks that fit round the belt, and conversions between path progress and block units.
  get blockUnits() { return this.units[this.units.length - 1]; }
  toUnits(progress: number) { const n = this.units.length - 1, x = wrap(progress) * n, i = Math.min(n - 1, Math.floor(x)); return this.units[i] + (x - i) * (this.units[i + 1] - this.units[i]); }
  fromUnits(units: number) {
    const total = this.blockUnits, u = ((units % total) + total) % total; let lo = 0, hi = this.units.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (this.units[mid] <= u) lo = mid; else hi = mid; }
    return (lo + (u - this.units[lo]) / (this.units[hi] - this.units[lo])) / (this.units.length - 1);
  }
  unitsBetween(from: number, to: number) { const total = this.blockUnits; return (((this.toUnits(to) - this.toUnits(from)) % total) + total) % total; }
  get percentage() { return this.capacity===null?100*tuning.meterPerBlock*this.onPath.length/this.path.length:Math.max(this.overloadPending?100:0,100*this.onPath.length/this.capacity); }
  // Overload belt: average arc speed of the block-unit belt. Launched arrows travel at this speed too.
  get conveyorSpeed() { return this.capacity===null?tuning.speed:preloadTuning.blocksPerSecond*this.path.length/this.blockUnits; }
  get launchSpeed() { return this.conveyorSpeed * preloadTuning.launchFactor; }
  private get tailSpeed() { return this.capacity===null?motionTuning.tailSpeed:this.launchSpeed; }
  get beltScale() { return this.capacity===null?1:preloadTuning.beltScale; }
  get active() { return this.cannons.active || this.onPath.length > 0 || this.arrows.some(a => (a.moving && !a.done) || a.feedback !== null); }
  // Share of all blocks (board arrows and preloaded whites) the cannons have cleared; 1 is a board clear.
  get cleared() { let n = 0; for (const s of this.allSegments) if (s.removed) n++; return n / this.allSegments.length; }
  private get live() { return this.allSegments.filter(s => !s.removed && (s.progress !== null || s.inTransit)); }
  // Whole blocks the overload belt can still take, counting blocks already flying in.
  get room() { return this.capacity === null ? Infinity : Math.max(0,Math.floor(this.blockUnits + 1e-9) - this.live.length); }
  fits(arrow: ArrowState) {
    const color = arrow.data.color, ammo = this.cannons.lanes.reduce((n, l) => n + (l.queue[0]?.color === color ? l.queue[0].ammo : 0), 0);
    const rest = ammo - this.live.filter(s => s.color === color).length - arrow.segments.length;
    if (rest < 0 || arrow.segments.length > this.room) return false;
    const sums = new Set([0]);
    for (const a of this.arrows) if (a !== arrow && !a.moving && a.data.color === color) for (const s of [...sums]) if (s + a.segments.length <= rest) sums.add(s + a.segments.length);
    return sums.has(rest);
  }
  // Hint picks: arrows that fit exactly; otherwise any that still leave hintReserve slots, using the belt as a buffer
  // so a front cannon whose color is still buried can wait while other arrows are cleared out of the way.
  hintable(arrows: ArrowState[]) {
    const exact = arrows.filter(a => this.fits(a));
    return exact.length ? exact : arrows.filter(a => a.segments.length <= this.room - preloadTuning.hintReserve);
  }
  get overloadPending() { return this.jammed || this.overloadElapsed > 0; }
  get overloaded() { return this.jammed || this.overloadElapsed + 1e-9 >= preloadTuning.jamGraceSeconds; }
  private exitDistance(arrow:ArrowState){
    if(this.capacity!==null){
      // Cache the static board-to-belt route so picking and hints use the same exit as the launch.
      arrow.route??=this.route(arrow);
      const origin=arrow.segments[0].position,direction=arrow.data.direction;
      return Math.max(...arrow.route.points.map(p=>p.reduce((n,v,i)=>n+(v-origin[i])*direction[i],0)));
    }
    return this.path.entryMode==='first-intersection'?distance(arrow.segments[0].position,this.path.position(arrow.entry)):Infinity;
  }
  canMove(arrow: ArrowState) {
    if (arrow.moving) return false;
    const origin = arrow.segments[0].position, d = arrow.data.direction,limit=this.exitDistance(arrow);
    return !this.arrows.some(other => other.segments.some(s => {
      if(other.moving&&(this.capacity===null||s.progress!==null))return false;
      if (other === arrow && s.index === 0) return false;
      const delta = s.position.map((v, i) => v - origin[i]);
      const forward = delta.reduce((sum, v, i) => sum + v * d[i], 0);
      return forward > .001 && forward<limit && delta.every((v, i) => d[i] !== 0 || Math.abs(v) < ((arrow.data.cellSize??1)+(s.size??1))*.25);
    }));
  }
  launch(id: number): 'accepted' | 'blocked' | 'full' | 'ignored' {
    const arrow = this.arrows.find(a => a.data.id === id);
    if (this.paused || !arrow || arrow.moving || arrow.feedback) return 'ignored';
    if(this.overloaded)return 'ignored';
    // The reference keeps its admission gate; overload judges capacity during entry, never on tap.
    if (this.capacity===null && this.percentage >= tuning.admission) return 'full';
    if (!this.canMove(arrow)) {
      const origin = arrow.segments[0].position, direction = arrow.data.direction;
      const obstacles = this.arrows.filter(a => a !== arrow).flatMap(a => a.segments.filter(s=>!a.moving||(this.capacity!==null&&s.progress===null)).map(s => s.position));
      let nearest = Infinity;
      for (const p of obstacles) {
        const delta = p.map((v, i) => v - origin[i]);
        const forward = delta.reduce((n, v, i) => n + v * direction[i], 0);
        if (forward > 0 && forward<this.exitDistance(arrow) && delta.every((v, i) => direction[i] || Math.abs(v) < (arrow.data.cellSize??1)*.5)) nearest = Math.min(nearest, forward);
      }
      // Own-tail obstruction remains a reference rule; without an external contact, shake in place.
      arrow.feedback = new BlockedFeedback(arrow.segments.map(s => s.position), direction, obstacles, Number.isFinite(nearest) ? Math.ceil(nearest/(arrow.data.cellSize??1)) : 0,arrow.data.cellSize??1);
      return 'blocked';
    }
    arrow.moving = true;
    this.started = true;
    if (this.capacity === null) {
      arrow.entry = this.path.entry(arrow.segments[0].position, arrow.data.direction);
      const travel=distance(arrow.segments[0].position, this.path.position(arrow.entry));
      arrow.duration = Math.max(Math.max(.3, .05*travel)/motionTuning.launchPlaybackRate,travel/motionTuning.tailSpeed+motionTuning.launchEaseSeconds/2);
    } else { arrow.route ??= this.route(arrow); arrow.travelled = 0; arrow.speed = 0; arrow.duration = arrow.route.lengths[arrow.route.lengths.length - 1] / this.launchSpeed; }
    // Seed the authored body route so tails follow bends instead of chasing an empty history.
    arrow.histories = arrow.segments.map((s,i) => { s.inTransit = true; const next=arrow.segments[i+1];return next?[[...next.position],[...s.position]]:[[...s.position]]; });
    return 'accepted';
  }
  // Straight to the merge point, then a quadratic curve that leaves along the arrow's direction and lands along
  // the belt mergeShift units downstream. Entries at a slant, on a bend or beside the belt turn in smoothly.
  private route(arrow: ArrowState): Route {
    const start = arrow.segments[0].position, direction = arrow.data.direction, cell = arrow.data.cellSize ?? 1;
    const hit = this.path.position(arrow.entry), reach = distance(start, hit), lane = (p: Vec) => distance(p, this.path.position(this.path.closest(p)));
    let lead = 0; while (lead + .05 < reach && lane(mix(start, hit, (lead + .05) / reach)) > preloadTuning.mergeCells * cell) lead += .05;
    // Join beside where the row first reaches the belt; a row running alongside it never rides its edge.
    const merge = reach ? mix(start, hit, lead / reach) : [...start], crossing = lead + .05 < reach ? this.path.closest(mix(start, hit, (lead + .05) / reach)) : arrow.entry;
    const flow = (at: number) => { const a = this.path.position(at - .5 / this.path.length), b = this.path.position(at + .5 / this.path.length), n = distance(a, b) || 1; return b.map((v, i) => (v - a[i]) / n); };
    // A belt flowing against the arrow: land straight on it (no U-turn hook) and let the belt carry it back.
    const against = flow(crossing).reduce((n, v, i) => n + v * direction[i], 0) < 0;
    arrow.entry = against ? crossing : this.fromUnits(this.toUnits(crossing) + preloadTuning.mergeShift);
    const end = this.path.position(arrow.entry);
    const tangent = flow(arrow.entry).map(v => against ? -v : v);
    // Control point where the arrow's line meets the belt's line into the landing point: the turn runs one way only.
    const dx = end[0] - merge[0], dz = end[2] - merge[2], det = tangent[0] * direction[2] - direction[0] * tangent[2];
    const u = Math.abs(det) > 1e-6 ? (tangent[0] * dz - dx * tangent[2]) / det : -1, v = Math.abs(det) > 1e-6 ? (dx * direction[2] - direction[0] * dz) / det : -1;
    // Lines that meet behind or far away (nearly parallel) would hook or overshoot: those use a gentle Hermite curve.
    const span = Math.hypot(dx, dz), corner = u > 0 && v > 0 && u < 2 * span && v < 2 * span, reach2 = span * .8;
    const points = [start];
    for (let k = 0; k <= 48; k++) {
      const t = k / 48;
      points.push(corner ? merge.map((value, i) => (1 - t) ** 2 * value + 2 * t * (1 - t) * (value + direction[i] * u) + t * t * end[i])
        : merge.map((value, i) => value * (2*t**3 - 3*t**2 + 1) + direction[i] * reach2 * (t**3 - 2*t**2 + t) + end[i] * (-2*t**3 + 3*t**2) + tangent[i] * reach2 * (t**3 - t**2)));
    }
    // A rounded belt can cross the merge curve before its intended endpoint. Join at that first contact.
    for(let i=1;i<points.length;i++){
      const crossing=this.path.intersection(points[i-1],points[i].map((v,j)=>v-points[i-1][j]),1);
      if(crossing!==null){arrow.entry=crossing;points.splice(i,points.length-i,this.path.position(crossing));break;}
    }
    const lengths = [0]; for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
    return { points, lengths, merge: lengths[1] };
  }
  insert(segment: Segment, progress: number) {
    if (segment.progress !== null || segment.removed) return false;
    if (this.capacity !== null) return this.beltPush.insert(segment, progress);
    segment.progress = wrap(progress); segment.inTransit=false; this.onPath.push(segment);
    if (this.onPath.some(s => s.arrowId !== segment.arrowId && wrap(s.progress! - progress) > 0 && wrap(s.progress! - progress) < 3 * tuning.spacing / this.path.length)) this.pausedGroups.add(segment.arrowId);
    // Source records pausedGroups but never consumes it to stop movement or reject entry.
    segment.position = this.path.position(progress); segment.yaw = this.path.yaw(progress);
    return true;
  }
  remove(segment: Segment) {
    if(segment.removed)return;
    segment.removed = true;
    this.beltPush.remove(segment);
    this.onPath = this.onPath.filter(s => s !== segment);
  }
  // A push changes occupied positions, not the belt clock. Vacancies travel with the belt.
  private moveBelt(movement: number, dt: number) {
    const units = movement * this.blockUnits;
    for (const s of this.onPath) s.progress = this.fromUnits(this.toUnits(s.progress!) + units);
    this.beltPush.update(dt);
    this.jammed = false;
  }
  advance(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Invalid elapsed time');
    if (this.paused) return;
    this.remainder += seconds;
    while (this.remainder + 1e-10 >= tuning.tick && !this.overloaded) { this.step(tuning.tick); this.remainder -= tuning.tick; }
  }
  private step(dt: number) {
    const spacing = tuning.spacing / this.path.length, movement = this.conveyorSpeed * dt / this.path.length;
    // Keep a destroyed leader's route alive until its tail has entered.
    for(const a of this.arrows)if(a.moving&&!a.done)for(const s of a.segments)if(s.removed&&s.progress!==null){
      s.progress=this.capacity===null?wrap(s.progress+movement):this.fromUnits(this.toUnits(s.progress)+movement*this.blockUnits);
      s.position=this.path.position(s.progress);s.yaw=this.path.yaw(s.progress);
    }
    // Preserve source insertion order: foreign groups constrain movement, same-group segments do not.
    if (this.capacity !== null) this.moveBelt(movement, dt);
    else for (const segment of this.onPath) {
      segment.previousPosition = segment.position;
      let gap = Infinity;
      for (const other of this.onPath) if (other.arrowId !== segment.arrowId) {
        const delta = wrap(other.progress! - segment.progress!);
        if (delta > 0 && delta < .99) gap = Math.min(gap, delta-spacing*Math.max(segment.size??1,other.size??1));
      }
      segment.progress = wrap(segment.progress! + Math.max(0, Math.min(movement, gap)));
      segment.position = this.path.position(segment.progress); segment.yaw = this.path.yaw(segment.progress);
    }
    for (const a of this.arrows) {
      const size=a.data.cellSize??1,segmentSpacing=this.capacity===null?tuning.segmentSpacing*size/this.path.length:wrap(this.fromUnits(this.toUnits(a.entry)+1)-a.entry);
      if (a.feedback) {
        const feedback=a.feedback;
        feedback.elapsed += dt;
        if (!feedback.contacted && feedback.elapsed>=feedback.approachSeconds) {
          feedback.contacted=true; this.onBlockedContact();
        }
        if (feedback.done) a.feedback = null;
      }
      if (!a.moving || a.done) continue;
      a.elapsed += dt;
      const head = a.segments[0];
      if (head.progress === null && a.route) {
        const r = a.route, total = r.lengths[r.lengths.length - 1], belt = this.conveyorSpeed, launch = this.launchSpeed;
        // Ease in, fly at launch speed, then slow to belt speed across the merge so the join matches the belt.
        const target = belt + (launch - belt) * Math.min(1, Math.max(0, (total - a.travelled!) / Math.max(1e-9, total - r.merge)));
        a.speed = a.speed! < target ? Math.min(target, a.speed! + launch / motionTuning.launchEaseSeconds * dt) : target;
        let next = Math.min(total, a.travelled! + a.speed * dt);
        // Fail at first blocked entry, before any more tail movement or cannon updates this tick.
        const fullEntry = this.onPath.length >= Math.floor(this.blockUnits + 1e-9) && next > r.merge;
        if (fullEntry) {
          next = Math.max(a.travelled!, r.merge);
        }
        a.travelled = next;
        let k = 1; while (k < r.lengths.length - 1 && r.lengths[k] < next) k++;
        const f = (next - r.lengths[k - 1]) / Math.max(1e-9, r.lengths[k] - r.lengths[k - 1]), from = r.points[k - 1], to = r.points[k];
        head.position = mix(from, to, Math.min(1, f));
        // The head turns toward its route at a bounded rate, so tight merges swing round instead of snapping.
        const turn = ((Math.atan2(to[0] - from[0], to[2] - from[2]) - head.yaw) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
        head.yaw += Math.max(-preloadTuning.turnRate * dt, Math.min(preloadTuning.turnRate * dt, turn));
        if (fullEntry) { this.jammed = true; return; }
        if (next >= total - 1e-9 && this.insert(head, a.entry)) a.arrived = a.elapsed;

      } else if (head.progress === null) {
        const ramp=motionTuning.launchEaseSeconds;
        const travelledTime=a.elapsed<ramp?a.elapsed*a.elapsed/(2*ramp):a.elapsed-ramp/2;
        const t=Math.min(1,travelledTime/(a.duration-ramp/2));
        head.position = mix(a.data.cells[0].map((v, i) => v + a.data.position[i]), this.path.position(a.entry), t);
        if (a.elapsed + 1e-10 >= a.duration && this.insert(head, a.entry)) a.arrived = a.elapsed;
      }
      a.histories[0].push([...head.position]);
      for (let i = 1; i < a.segments.length; i++) {
        const s = a.segments[i], history = a.histories[i - 1];
        if (s.progress === null) {
          if(this.capacity!==null && this.onPath.length>=Math.floor(this.blockUnits+1e-9) && a.segments[i-1].progress!==null && distance(s.position,this.path.position(this.path.closest(s.position)))<preloadTuning.mergeCells*size){
            this.jammed=true;return;
          }
          let travelled = 0, target = history[0];
          const previous = a.segments[i - 1], followSpacing=previous.progress===null||previous.inTransit?size:segmentSpacing*this.path.length;
          for (let j = history.length - 1; j > 0; j--) {
            const length = distance(history[j], history[j - 1]);
            if (travelled + length > followSpacing) { target = mix(history[j], history[j - 1], (followSpacing - travelled) / length); break; }
            travelled += length;
          }
          // A stalled entry may redirect the next tail block, but never teleport it.
          // Overload belt spaces an arrow's own blocks one touching unit apart wherever they join.
          const previousProgress=previous.progress===null?0:this.capacity===null?previous.progress:this.beltPush.progress(previous);
          const behind=previous.progress===null?0:this.capacity===null?previous.progress-segmentSpacing:this.fromUnits(this.toUnits(previousProgress)-1);
          // Overload only snaps a stalled block that is already on the belt; a far one would slide across the rim.
          if(previous.progress!==null && !previous.inTransit && a.arrived!==null && a.elapsed-a.arrived>=tuning.forcedInsertion && (this.capacity===null||distance(s.position,this.path.position(behind))<.5*size)) target=this.path.position(behind);
          const remaining=distance(s.position,target);
          // Allow a little follow-through, but bound the lag so it cannot accumulate into detached links.
          const eased=1-Math.exp(-tuning.follow*dt/size);
          // Once the leader is on the overload belt, added easing cuts the bend and delays cannon eligibility.
          const follow=previous.progress===null?Math.max(eased,remaining?1-motionTuning.tailLagCells*size/remaining:1):this.capacity!==null?1:Math.min(1,tuning.follow*dt/size);
          s.position = mix(s.position, target, Math.min(follow,remaining ? this.tailSpeed*dt/remaining : 1));
          s.yaw = Math.atan2(previous.position[0] - s.position[0], previous.position[2] - s.position[2]) + Math.PI;
          if(previous.progress!==null && !previous.inTransit){
            const nearest=this.path.closest(s.position),gap=wrap(previousProgress-nearest);
            const spaced=this.capacity===null?gap+1e-10>=segmentSpacing:this.unitsBetween(nearest,previousProgress)>=1-1e-9;
            if(distance(s.position,this.path.position(behind))<.1) this.insert(s,behind);
            else if(spaced && gap<.5 && distance(s.position,this.path.position(nearest))<.1) this.insert(s,nearest);
          }
        }
        a.histories[i].push([...s.position]);
      }
      for (let i = 0; i < a.histories.length; i++) {
        const h = a.histories[i]; let length = 0;
        for (let j = h.length - 1; j > 0; j--) if ((length += distance(h[j], h[j - 1])) > 2*size) { a.histories[i] = h.slice(j - 1); break; }
        // Retain motion samples, not an unbounded stream of repeated stopped positions.
        if (h.length > 2 && distance(h[h.length - 1], h[h.length - 2]) < 1e-9) h.pop();
      }
    }
    if(this.capacity!==null)for(const a of this.arrows)if(a.moving&&!a.done)for(const s of a.segments)if(s.progress===null&&!s.removed)this.beltPush.yieldTo(s,a.segments[s.index-1]);
    const beforeShots=this.onPath.length;
    if(this.capacity===null||this.started)this.cannons.update(dt, this.onPath, this.allSegments, segment => this.remove(segment));
    for(const a of this.arrows)if(a.moving&&!a.done&&a.segments.every(s=>s.removed||s.progress!==null)){
      a.done=true;a.route=undefined;a.segments.forEach(s=>{s.inTransit=false;});a.histories=[];
    }
    if(this.capacity!==null&&this.started){
      const entering=this.arrows.some(a=>a.moving&&!a.done);
      let pressure=false;
      if(!entering&&this.onPath.length>=this.capacity){
        const colors=new Set(this.onPath.map(s=>s.color));
        pressure=!this.cannons.lanes.some(l=>l.queue[0]&&colors.has(l.queue[0].color));
      }
      // Resolve real shots before the deadline; a successful removal or resumed entry resets the grace.
      const recovering=this.onPath.length<beforeShots||this.cannons.shots.length>0||this.cannons.lanes.some(l=>l.advancing>1e-9);
      this.overloadElapsed=pressure&&!recovering?this.overloadElapsed+dt:0;
    }
  }
}
