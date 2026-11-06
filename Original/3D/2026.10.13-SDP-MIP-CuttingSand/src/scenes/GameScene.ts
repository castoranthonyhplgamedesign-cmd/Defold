import Phaser from 'phaser';
import { ANALYTICS_EVENTS, trackEvent } from '../analytics';
import { SOUNDS, finishGameplayAudio, initAudio, playSound, soundPlays, unlockAudio, updateAudio } from '../audio';
import { gameConfig } from '../config';
import { DEPTH, LAYOUT, TIMING } from '../constants';
import { BucketRack, type BucketGroup } from '../game/BucketRack';
import { ClickCounter } from '../game/ClickCounter';
import { Conveyor } from '../game/Conveyor';
import { CutTrail } from '../game/CutTrail';
import { Feedback } from '../game/Feedback';
import { Frame } from '../game/Frame';
import { HandHint, type HintTarget } from '../game/HandHint';
import { Praise } from '../game/Praise';
import { SandGrid, type Patch } from '../game/sandGrid';
import { SandView } from '../game/SandView';
import { getClickLimit, getTimeLimitSeconds } from '../iteration';
import { bindLifecycle, notifyGameEnd, notifyGameStart, unloadMraidOnFatalError } from '../networks';
import { DesignRegistry, screenBleed } from '../utils/designNode';
import { getViewportSize, toDesign, updateResponsive, viewportKey } from '../utils/responsive';
import { EndCard, redirectToStore } from './cta';

/** intro (picture pouring in) → play → ending (cleared, jammed or click limit; end card pending) → endcard. */
export type PlayState = 'intro' | 'play' | 'ending' | 'endcard';

type Point = { x: number; y: number };
/** A line in design space (the swipe hint). */
type Line = { x1: number; y1: number; x2: number; y2: number };

/**
 * A swipe in progress (Cutting Sand; it can start anywhere on screen and was counted as one
 * interaction when the finger went down). `points` holds the line still to cut, in grid coordinates
 * (x0, y0, x1, y1, …; its first point is where the last cut ended); `released` sums the grains it
 * set falling. `pointerId`: the finger it follows; `from`: where that finger pressed (design px);
 * `armed`: it has moved SWIPE_MIN_DISTANCE from there and cuts.
 */
type Swipe = { points: number[]; released: number; pointerId: number; from: Point; armed: boolean };

/** A swipe hint spans at least this many design px (a narrow shape still gets a clear gesture). */
const MIN_SWIPE_HINT = 150;
/**
 * Cutting Sand: the finger must move this many design px from where it pressed before the swipe cuts
 * (then the whole path from the press is cut). A tap, even with a little finger jitter, cuts nothing
 * (it still counts as a press), so spamming taps can't carve the picture.
 */
const SWIPE_MIN_DISTANCE = 60;

type QaState = {
  state: PlayState;
  /** The current wave (1-based) and the sand colours it plays (BUCKETS.waves). */
  wave: number;
  activeColors: number[];
  counted: number;
  clickLimit: number | null;
  /** Static grains left in the picture, and at the start. */
  remaining: number;
  total: number;
  /** Share of the picture's grains that have left it (into the funnel), in %. */
  removedPct: number;
  /** Grains the last tap released: the patch itself, and the sand that lost its support. */
  lastCut: number;
  lastDrop: number;
  /** Loose grains anywhere, and those waiting in the funnel. */
  loose: number;
  funnel: number;
  /** Conveyor fill in %, and grains on it. */
  belt: number;
  beltLoad: number;
  /** Palette values of the front buckets taking sand. */
  fronts: number[];
  bucketsDone: number;
  /** Static + loose + belt/falling + bucketed grains; always equals total (QA conservation check). */
  accounted: number;
  /** '' when bucket counts are consistent. */
  integrity: string;
  /** Update frames run (stops while the ad is hidden or paused). */
  frame: number;
  /** Simulation steps per frame: TIMING.fastForward once no static sand is left to tap, else 1. */
  speed: number;
  muted: boolean;
  /** Times each sound has started. */
  sounds: Record<string, number>;
  handVisible: boolean;
  vignette: number;
  /** No more taps are accepted. */
  ended: boolean;
  /** 'solved' | 'limit' | 'time' | 'jam' | 'softlock' once the game has ended; '' while playing. */
  endReason: string;
  milestone: string;
  /**
   * Design-space tap points: the hint target (a patch a front bucket needs), a patch none needs, and
   * a patch whose sand can't fall yet (nothing open below it). Cutting Sand: `swipe` is the hinted
   * swipe line (across the top of the hint target).
   */
  targets: { right: Point | null; wrong: Point | null; blocked: Point | null; swipe: Line | null };
  /** "tap" (Tapping Sand) or "cut" (Cutting Sand). */
  mechanic: string;
};

declare global {
  interface Window {
    /** Read-only runtime snapshot for QA automation. */
    __SDP_STATE__?: QaState;
    /** On-demand diagnostics for QA: bucket queues, grains per colour on the belt and in the sand. */
    __SDP_DEBUG__?: () => unknown;
  }
}

const PROGRESS_EVENTS = [
  [0.25, ANALYTICS_EVENTS.CHALLENGE_PASS_25],
  [0.5, ANALYTICS_EVENTS.CHALLENGE_PASS_50],
  [0.75, ANALYTICS_EVENTS.CHALLENGE_PASS_75]
] as const;

/**
 * Taps this many grains from the sand still hit it (fat fingers: about 9 CSS px on a phone), so
 * small bits left in corners are easy to tap.
 */
const TAP_REACH = 6;
/**
 * Belt fill (%) above which the hand only points at sand a front bucket takes: sand no front bucket
 * takes yet (a later bucket's colour) would only fill the belt further and stall it.
 */
const HINT_BELT_LIMIT = 50;

/**
 * Hint tier (lower first): sand that falls out to the belt now in a colour a front bucket needs,
 * then in a colour a queued bucket takes, then any sand that falls out now. Sand that would only
 * drop into a hole comes last: tapping it traps loose sand that later floods the funnel at once.
 */
function hintTier(p: Patch, needed: readonly number[], queued: readonly number[]): number {
  if (!p.drains) {
    return p.openBelow ? 3 : 4;
  }
  if (needed.includes(p.color)) {
    return 0;
  }
  return queued.includes(p.color) ? 1 : 2;
}

/**
 * The level's waves from BUCKETS.waves: valid colours only, each colour in its first wave; a colour
 * of sand that no wave lists joins the last one. No waves configured: one wave with every colour.
 */
function levelWaves(totals: readonly number[]): number[][] {
  const colors = totals.length - 1;
  const seen = new Set<number>();
  const waves: number[][] = [];
  for (const wave of gameConfig.BUCKETS.waves ?? []) {
    const valid = (Array.isArray(wave) ? wave : []).filter(c => Number.isInteger(c) && c >= 1 && c <= colors && !seen.has(c));
    valid.forEach(c => seen.add(c));
    if (valid.length) {
      waves.push(valid);
    }
  }
  const rest: number[] = [];
  for (let c = 1; c <= colors; c++) {
    if (!seen.has(c) && totals[c] > 0) {
      rest.push(c);
    }
  }
  if (!waves.length) {
    waves.push(rest);
  } else if (rest.length) {
    waves[waves.length - 1].push(...rest);
  }
  return waves;
}

/** Hint order: lower tier, then the lowest patch, then the largest. */
function hintBefore(a: Patch, tierA: number, b: Patch, tierB: number): boolean {
  if (tierA !== tierB) {
    return tierA < tierB;
  }
  return a.maxRow > b.maxRow || (a.maxRow === b.maxRow && a.size > b.size);
}

export class GameScene extends Phaser.Scene {
  private nodes = new DesignRegistry();
  private background?: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;
  private grid?: SandGrid;
  private view!: SandView;
  private conveyor!: Conveyor;
  private rack!: BucketRack;
  private feedback!: Feedback;
  private praise!: Praise;
  private hand!: HandHint;
  private endCard!: EndCard;
  private counter!: ClickCounter;
  /** Design px per grain. */
  private grain = 1;
  private patches: Patch[] = [];
  private targets: QaState['targets'] = { right: null, wrong: null, blocked: null, swipe: null };
  /** Cutting Sand: a swipe cuts everything below its line (else Tapping Sand: a tap clears one shape). */
  private readonly cutMode = gameConfig.MECHANIC === 'cut';
  private swipe: Swipe | null = null;
  private trail?: CutTrail;
  private frontKey = '';
  /** The level's waves (sand colours each plays), and the current one. */
  private waves: number[][] = [];
  private waveIndex = 0;
  private qa?: QaState;

  private state: PlayState = 'play';
  /** No more taps: every bucket full (won), belt jammed, click limit reached or time up. */
  private inputClosed = false;
  /** How long (ms) the cleared picture's sand has been draining into the buckets (see TIMING.drainCap). */
  private drainMs = 0;
  private challengeStarted = false;
  private gameEndNotified = false;
  private progressFired = 0;
  private jamMs = 0;
  /** Soft-lock check (watchStall): time the mouth has been turned away, grains let on meanwhile, time since the last turn-away. */
  private stallMs = 0;
  private stallIntake = 0;
  private stallQuietMs = 0;
  private timeLimitEvent?: Phaser.Time.TimerEvent;
  private endCardAt = 0;
  private endReason = '';
  private milestone = 'boot';
  private lastViewport = '';
  private frames = 0;
  /** Tap sound and drop feedback wait until sand really starts falling (see TIMING.fallingMoves). */
  private cutPending = false;
  /** A swipe changed sand since the last audio update, even before those grains start falling. */
  private swipeCutPending = false;
  private dropPending = 0;
  private pendingUntil = 0;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.nodes = new DesignRegistry();
    this.counter = new ClickCounter(getClickLimit());

    const viewport = getViewportSize();
    this.lastViewport = viewportKey(viewport);
    updateResponsive(viewport.width * viewport.dpr, viewport.height * viewport.dpr);
    this.scale.resize(viewport.width * viewport.dpr, viewport.height * viewport.dpr);

    initAudio(this);
    bindLifecycle(this);
    this.drawBackground();

    if (!this.textures.exists('sand-picture')) {
      unloadMraidOnFatalError('sand-picture-missing');
      return;
    }
    const sand = gameConfig.SAND;
    const picture = this.textures.get('sand-picture').getSourceImage() as HTMLImageElement;
    this.grain = LAYOUT.picture.w / Math.max(1, Math.round(sand.columns));
    const grid = SandGrid.fromImage(picture, sand.palette, sand.columns, pictureRows => {
      const f = LAYOUT.frame;
      const pictureBottom = LAYOUT.picture.y + pictureRows * this.grain;
      return {
        straightRows: Math.max(0, Math.round((f.sideBottom - pictureBottom) / this.grain)),
        funnelRows: Math.max(1, Math.round((f.mouthY - Math.max(f.sideBottom, pictureBottom)) / this.grain)),
        mouthHalf: Math.max(1, f.mouthHalf / this.grain)
      };
    });
    this.grid = grid;

    // One bucket art per sand colour (storyboard art).
    const bucketArt = sand.palette.map((_, i) => gameConfig.BUCKETS.art[i] ?? gameConfig.BUCKETS.art[0]);
    this.rack = new BucketRack(this, this.nodes, bucketArt, gameConfig.BUCKETS.capacity, gameConfig.BUCKETS.stacks ?? [], {
      // The reference starts both layers on the zero-count frame, before the lid/hop animation.
      onFull: () => {
        if (this.state !== 'intro' && this.state !== 'play') return;
        playSound(this, SOUNDS.BELLS);
        playSound(this, SOUNDS.WOOSH);
      }
    });
    // The buckets (all of them; none join later) share out the picture's sand: BUCKETS.start, unless
    // it leaves a colour of sand without a bucket, else planned from the picture.
    const totals = [0, ...sand.palette.map((_, i) => grid.colorCounts[i + 1])];
    const slots = LAYOUT.buckets.xs.length * LAYOUT.buckets.ys.length;
    // Entries: a colour, [colour, numbers…] (its own bucket numbers), or 0 (an empty slot).
    const colorOf = (entry: BucketGroup): number => (Array.isArray(entry) ? entry[0] : (entry as number));
    const valid = (c: number): boolean => Number.isInteger(c) && c >= 1 && c <= sand.palette.length;
    const start = (gameConfig.BUCKETS.start ?? [])
      .filter(entry => colorOf(entry) === 0 || (valid(colorOf(entry)) && (!Array.isArray(entry) || entry.slice(1).every(n => n > 0))))
      .slice(0, slots);
    const covered = totals.every((total, c) => c === 0 || total === 0 || start.some(entry => colorOf(entry) === c));
    const order = covered && start.length ? start : BucketRack.plan(grid.patches(), totals, slots, LAYOUT.buckets.xs.length);
    this.rack.create(order, totals, color => grid.colorCounts[color] + this.conveyor.supplyOf(color));
    this.waves = levelWaves(totals);
    grid.setCuttable(this.waves[0]);
    this.rack.showColors(this.rackColors());
    const beltConfig = gameConfig.BELT;
    this.conveyor = new Conveyor(this, this.nodes, this.rack, sand.palette.length, beltConfig.capacity, beltConfig.overflow ?? 0, beltConfig.speed, sand.gravity);
    this.conveyor.setWaiting(color => grid.funnelCounts[color]);
    this.conveyor.create();
    this.view = new SandView(this, this.nodes, grid, this.grain, [this.conveyor], {
      palette: sand.palette,
      grainShade: sand.grainShade,
      gravity: sand.gravity
    });
    this.view.create();
    grid.setExitHandler((color, shade, col) =>
      this.conveyor.accept(color, this.view.colorOf(color, shade), LAYOUT.picture.x + (col + 0.5) * this.grain));
    new Frame(this, this.nodes);
    window.__SDP_DEBUG__ = () => {
      const colors = sand.palette.map((_, i) => i + 1);
      return {
        columns: this.rack.debugColumns(),
        needed: this.rack.neededColors(),
        accepting: this.rack.frontColors(),
        belt: colors.map(c => this.conveyor.supplyOf(c)),
        sand: colors.map(c => grid.colorCounts[c]),
        funnel: colors.map(c => grid.funnelCounts[c]),
        conveyor: this.conveyor.debugState(),
        mouth: grid.debugMouth().join(''),
        hint: this.hand.debugState(),
        timeScale: this.time.timeScale,
        paused: this.time.paused,
        load: this.conveyor.load
      };
    };

    this.praise = new Praise(this, this.nodes);
    this.feedback = new Feedback(this, this.nodes);
    this.feedback.create();
    this.hand = new HandHint(this, this.nodes);
    this.hand.create(gameConfig.HAND_TUTOR_MODE, gameConfig.TUTORIAL_DELAY);
    this.endCard = new EndCard(this, this.nodes);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.endCard.destroy());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.endCard.destroy());

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => this.onPointerDown(pointer));
    if (this.cutMode) {
      this.trail = new CutTrail(this);
      this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => this.onPointerMove(pointer));
      this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => this.onPointerUp(pointer));
      this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, (pointer: Phaser.Input.Pointer) => this.onPointerUp(pointer));
    }

    if (gameConfig.OPENING_GAMEPLAY_ANIMATION) {
      // As in the sand-shovel mock-up: the buckets rise into place, lids on, and their lids pop off
      // one by one while the picture appears.
      // The reveal waits TIMING.revealDelay ms first; the buckets keep their place in its timing.
      const wait = gameConfig.OPENING_STYLE === 'pour' ? 0 : TIMING.revealDelay;
      this.rack.rise(wait + 70);
      this.time.delayedCall(wait + TIMING.lidPopAt, () => {
        if (this.state === 'intro' || this.state === 'play') {
          this.rack.setOpenColors(this.waves[this.waveIndex]);
        }
      });
      // The picture pours into the frame first; play starts once every grain has settled.
      this.state = 'intro';
      this.milestone = 'intro';
      if (gameConfig.OPENING_STYLE === 'pour' || !this.view.reveal()) {
        this.view.intro();
      }
    } else {
      this.startPlaying();
    }
    this.nodes.flush();
    this.game.events.once(Phaser.Core.Events.POST_RENDER, () => trackEvent(ANALYTICS_EVENTS.DISPLAYED));
    this.publishState();
  }

  update(_time: number, delta: number): void {
    const grid = this.grid;
    if (!grid) {
      return;
    }
    this.frames++;
    const viewport = getViewportSize();
    const key = viewportKey(viewport);
    if (key !== this.lastViewport) {
      this.lastViewport = key;
      this.relayout(viewport.width * viewport.dpr, viewport.height * viewport.dpr);
      this.scale.setZoom(1 / viewport.dpr);
    }

    // Cutting Sand: the swipe cuts once a frame, along everything the finger moved through.
    if (this.swipe) {
      this.applySwipe();
    }
    this.trail?.update(this.time.now);

    // Nothing left to tap: the sand, belt and buckets run whole extra steps (fast-forward).
    const speed = this.speed();
    this.tweens.timeScale = this.state === 'endcard' ? 1 : speed;
    let moved = false;
    let movedInPicture = 0;
    for (let i = 0; i < speed; i++) {
      moved = grid.step(delta, gameConfig.SAND.gravity / this.grain, TIMING.maxFallSpeed) || moved;
      movedInPicture = Math.max(movedInPicture, grid.movedInPicture);
      this.conveyor.update(delta);
      this.rack.retireExhausted();
    }
    this.rack.update(delta * speed);
    this.view.update(delta, moved);
    this.playFallingFeedback(movedInPicture);
    updateAudio(this, delta,
      !this.inputClosed && (this.swipeCutPending || movedInPicture >= TIMING.fallingMoves),
      !this.inputClosed && ((moved && grid.looseInFunnel > 0) || this.conveyor.active));
    this.swipeCutPending = false;
    const intake = this.conveyor.takeIntake();

    if (this.state === 'intro' && this.view.introDone) {
      this.startPlaying();
    }
    if (this.state === 'play') {
      this.trackProgress();
      this.advanceWaveIfReady();
      this.watchFronts();
      if (this.rack.allFilled) {
        // The win: every bucket is full (all the sand is in them).
        this.onSolved();
      } else if (!grid.pictureEmpty) {
        this.drainMs = 0;
        this.watchJam(delta * speed);
        this.watchStall(delta * speed, intake.accepted, intake.refused);
      } else {
        // The picture is cleared: the rest of the sand drains into the buckets (fast-forwarded, see
        // speed()); the player can't fail now. If it somehow never finishes, it ends as a win anyway.
        this.drainMs += delta;
        if (this.drainMs >= TIMING.drainCap) {
          this.onSolved();
        }
      }
    }
    if (!this.inputClosed) {
      this.hand.tick(this.time.now);
    }
    if (this.endCardAt && this.time.now >= this.endCardAt) {
      this.showEndCard();
    }
    this.nodes.flush();
    this.publishState();
  }

  /** Called on rotation / resize: the composition is re-mapped, never rebuilt. */
  relayout(width: number, height: number): void {
    updateResponsive(width, height);
    this.scale.resize(width, height);
    this.drawBackground();
    this.nodes.markAllDirty();
    this.nodes.flush();
  }

  // ─── Background ──────────────────────────────────────────────────────────

  private drawBackground(): void {
    this.background?.destroy();
    // Overhang the canvas so camera shakes never expose the page behind it (see screenBleed).
    const bleed = screenBleed(this);
    const w = this.scale.width + bleed * 2;
    const h = this.scale.height + bleed * 2;
    const type = gameConfig.GAME_BACKGROUND_TYPE;

    if (type === 'Image' && this.textures.exists('background')) {
      const frame = this.textures.getFrame('background');
      const cover = Math.max(w / frame.realWidth, h / frame.realHeight);
      this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
        .setDisplaySize(frame.realWidth * cover, frame.realHeight * cover)
        .setDepth(DEPTH.BACKGROUND);
      return;
    }

    const g = this.add.graphics().setDepth(DEPTH.BACKGROUND);
    const colors = gameConfig.GAME_BACKGROUND_COLOR_CONFIG.colors;
    if (type === 'Gradient' && colors.length >= 2) {
      // Every colour is a stop, evenly spaced: one gradient band between each pair.
      const horizontal = gameConfig.GAME_BACKGROUND_COLOR_CONFIG.gradientDirection === 'horizontal';
      const bands = colors.length - 1;
      const band = (horizontal ? w : h) / bands;
      for (let i = 0; i < bands; i++) {
        const a = Phaser.Display.Color.GetColor(colors[i][0], colors[i][1], colors[i][2]);
        const b = Phaser.Display.Color.GetColor(colors[i + 1][0], colors[i + 1][1], colors[i + 1][2]);
        const from = -bleed + band * i;
        if (horizontal) {
          g.fillGradientStyle(a, b, a, b, 1);
          g.fillRect(from, -bleed, band + 1, h);
        } else {
          g.fillGradientStyle(a, a, b, b, 1);
          g.fillRect(-bleed, from, w, band + 1);
        }
      }
    } else {
      const c = gameConfig.GAME_BACKGROUND_COLOR;
      g.fillStyle(Phaser.Display.Color.GetColor(c[0], c[1], c[2]), 1);
      g.fillRect(-bleed, -bleed, w, h);
    }
    this.background = g;
  }

  // ─── Play ────────────────────────────────────────────────────────────────

  private startPlaying(): void {
    this.state = 'play';
    this.milestone = 'play';
    notifyGameStart();
    if (this.waves.length > 1) {
      this.praise.show('WAVE 1');
    }
    // The front buckets' turn: their lids come off.
    this.rack.setOpenColors(this.waves[this.waveIndex]);
    this.patches = this.activePatches();
    this.frontKey = this.rack.neededColors().join(',');
    this.refreshTargets();
    const hint = this.currentHint();
    if (hint) {
      this.hand.showNow(hint);
    }
  }

  /**
   * Tapping Sand: a tap on the picture's sand clears that patch. Cutting Sand: a press anywhere
   * starts a swipe (see onPointerMove). Taps during the opening pour, off the sand (Tapping Sand),
   * or after the end are not gameplay and are not counted.
   */
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    unlockAudio(this);
    const grid = this.grid;
    if (!grid || this.state !== 'play' || this.inputClosed) {
      return;
    }
    const tap = toDesign(pointer.x, pointer.y);
    if (this.cutMode) {
      // A press anywhere counts as the finger goes down (one swipe, one click).
      if (!this.countInteraction(pointer.event, pointer.x, pointer.y, pointer.downTime)) {
        return;
      }
      this.milestone = `cut-${this.counter.count}`;
      // The press that reaches the click limit opens the store inside this same handler (user gesture).
      if (this.counter.reachedLimit) {
        this.clickLimitCutoff();
        return;
      }
      this.startSwipe(tap, pointer);
      return;
    }
    const col = Math.floor((tap.x - LAYOUT.picture.x) / this.grain);
    const row = Math.floor((tap.y - LAYOUT.picture.y) / this.grain);
    const cell = grid.staticNear(col, row, TAP_REACH);
    if (cell < 0 || !this.countInteraction(pointer.event, pointer.x, pointer.y, pointer.downTime)) {
      return;
    }
    this.clearPatch(cell, col, row, tap);
    // The tap that reaches the click limit opens the store inside this same handler (user gesture).
    if (this.counter.reachedLimit) {
      this.clickLimitCutoff();
    }
  }

  /**
   * Cutting Sand: a finger goes down anywhere (already counted); the hint hides while it swipes. A
   * second finger takes over from the first (whose swipe ends there).
   */
  private startSwipe(at: Point, pointer: Phaser.Input.Pointer): void {
    if (this.swipe) {
      this.endSwipe();
    }
    this.swipe = {
      points: [this.gridX(at.x), this.gridY(at.y)],
      released: 0,
      pointerId: pointer.id,
      from: at,
      armed: false
    };
    this.trail?.add(at.x, at.y, this.time.now);
    this.hand.clear();
  }

  /** Cutting Sand: the finger moves; the line it draws is cut on the next frame (applySwipe). */
  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    const swipe = this.swipe;
    if (!swipe || pointer.id !== swipe.pointerId || !pointer.isDown || this.state !== 'play' || this.inputClosed) {
      return;
    }
    const at = toDesign(pointer.x, pointer.y);
    if (!swipe.armed && Math.hypot(at.x - swipe.from.x, at.y - swipe.from.y) >= SWIPE_MIN_DISTANCE) {
      swipe.armed = true;
    }
    swipe.points.push(this.gridX(at.x), this.gridY(at.y));
    this.trail?.add(at.x, at.y, this.time.now);
  }

  /**
   * Cutting Sand: everything below the line drawn since the last frame turns into falling sand.
   * Nothing is cut until the finger has moved SWIPE_MIN_DISTANCE (then the path from the press on).
   */
  private applySwipe(): void {
    const swipe = this.swipe;
    const grid = this.grid;
    if (!swipe || !grid || !swipe.armed || swipe.points.length < 4 || this.state !== 'play' || this.inputClosed) {
      return;
    }
    grid.cutBelow(swipe.points, TIMING.cutReach, TIMING.cutEdgeSnap, TIMING.cutTopSnap, TIMING.cutJitter, TIMING.dropJitter);
    // The next cut starts where this one ended.
    swipe.points.splice(0, swipe.points.length - 2);
    const released = grid.lastCut + grid.lastDrop;
    if (released === 0) {
      return;
    }
    this.swipeCutPending = true;
    this.view.invalidate();
    if (swipe.released === 0) {
      // One attack per stroke that releases sand; the long falling layers follow actual movement.
      this.cutPending = true;
      this.pendingUntil = this.time.now + TIMING.soundWindow;
    }
    swipe.released += released;
  }

  /** Cutting Sand: the swipe's finger lifts. */
  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    const swipe = this.swipe;
    if (!swipe || pointer.id !== swipe.pointerId) {
      return;
    }
    this.onPointerMove(pointer);
    this.endSwipe();
  }

  /** Cutting Sand: the swipe ends. A big cut is praised; the hint re-arms for the sand left. */
  private endSwipe(): void {
    const swipe = this.swipe;
    if (!swipe) {
      return;
    }
    this.applySwipe();
    this.swipe = null;
    const grid = this.requireGrid();
    if (swipe.released > 0) {
      this.crumbleLeftovers();
      // Cut sand always has a way down, so the praise doesn't wait for it to move.
      this.celebrateDrop(swipe.released / grid.total);
      this.patches = this.activePatches();
      this.refreshTargets();
    }
    const hint = this.currentHint();
    if (!this.inputClosed && hint) {
      this.hand.armIdle(hint);
    }
  }

  /** Design x / y to grid coordinates (fractional; 0 = the picture's left / top edge). */
  private gridX(x: number): number {
    return (x - LAYOUT.picture.x) / this.grain;
  }

  private gridY(y: number): number {
    return (y - LAYOUT.picture.y) / this.grain;
  }

  /** Counts an eligible gameplay interaction; returns false for duplicates of the same tap. */
  private countInteraction(event: Event | null | undefined, x: number, y: number, time: number): boolean {
    if (!this.counter.register(event, x, y, time || this.time.now)) {
      return false;
    }
    if (!this.challengeStarted) {
      this.challengeStarted = true;
      trackEvent(ANALYTICS_EVENTS.CHALLENGE_STARTED);
      this.startTimeLimit();
    }
    return true;
  }

  /**
   * The tapped patch crumbles into loose sand from the tap outward; any sand no longer held from
   * above or the sides drops with it. Loose sand falls into the funnel and onto the conveyor, or
   * stays in its hole until a path opens.
   */
  private clearPatch(cell: number, col: number, row: number, tap: Point): void {
    const grid = this.requireGrid();
    const color = grid.cells[cell];
    grid.cut(cell, col, row, TIMING.tapRipple, TIMING.tapJitter, TIMING.dropJitter);
    this.crumbleLeftovers();
    this.view.invalidate();
    this.hand.clear();
    this.feedback.tap(tap.x, tap.y, this.tintOf(color));
    // Sounds (and the drop shake/praise) wait until the sand actually falls: sand cut out of the
    // middle stays silent until a path opens below it.
    this.cutPending = true;
    this.dropPending = grid.lastDrop / grid.total;
    this.pendingUntil = this.time.now + TIMING.soundWindow;
    this.milestone = `tap-${this.counter.count}`;
    this.patches = this.activePatches();
    this.refreshTargets();
    const hint = this.currentHint();
    if (!this.inputClosed && hint) {
      this.hand.armIdle(hint);
    }
  }

  /**
   * Once sand is really falling inside the picture, the stroke's click attack plays. Moving grains
   * independently drive the long cut/pour layers; a big drop also gets shake and praise. If
   * nothing falls within the window (the sand is blocked), they are dropped.
   */
  private playFallingFeedback(movedInPicture: number): void {
    if (!this.cutPending && this.dropPending <= 0) {
      return;
    }
    if (this.time.now > this.pendingUntil) {
      this.cutPending = false;
      this.dropPending = 0;
      return;
    }
    if (movedInPicture < TIMING.fallingMoves || this.inputClosed && this.state === 'endcard') {
      return;
    }
    if (this.cutPending) {
      this.cutPending = false;
      playSound(this, SOUNDS.CLICK);
    }
    if (this.dropPending > 0) {
      this.celebrateDrop(this.dropPending);
      this.dropPending = 0;
    }
  }

  /** A drop of sand that lost its support: a light shake and a praise word that grows with its share. */
  private celebrateDrop(share: number): void {
    const shares = TIMING.praiseShares;
    if (share < shares[0]) {
      return;
    }
    let level = 0;
    while (level + 1 < shares.length && share >= shares[level + 1]) {
      level++;
    }
    this.feedback.bigDrop();
    this.praise.show(TIMING.praiseWords[level]);
  }

  /**
   * When the front buckets need different colours (one filled and the next moved up), the hint
   * follows; its idle timer keeps running, so flowing sand never holds the hint back.
   */
  private watchFronts(): void {
    const key = this.rack.neededColors().join(',');
    if (key === this.frontKey) {
      return;
    }
    this.frontKey = key;
    this.refreshTargets();
    const hint = this.currentHint();
    if (this.inputClosed || !hint) {
      return;
    }
    if (this.hand.armed) {
      this.hand.retarget(hint);
    } else if (!this.swipe) {
      // The last cut left no hint (nothing worth cutting then): the idle hint comes back now.
      this.hand.armIdle(hint);
    }
  }

  /** The hand's hint: a tap on the target patch, or (Cutting Sand) a swipe across its top. */
  private currentHint(): HintTarget | null {
    if (this.cutMode) {
      const line = this.targets.swipe;
      return line ? { tipX: line.x1, tipY: line.y1, toX: line.x2, toY: line.y2 } : null;
    }
    return this.targets.right ? this.hintAt(this.targets.right) : null;
  }

  /**
   * Cutting Sand's hint: a level swipe just inside the top of the patch (so all of it falls, with
   * whatever lies below it), a little wider than the patch and at least MIN_SWIPE_HINT long.
   */
  private swipeLine(p: Patch): Line {
    const cols = this.requireGrid().cols;
    const minCols = MIN_SWIPE_HINT / this.grain;
    let from = p.minCol - 1.5;
    let to = p.maxCol + 2.5;
    if (to - from < minCols) {
      const mid = (from + to) / 2;
      from = mid - minCols / 2;
      to = mid + minCols / 2;
    }
    from = Math.max(0.5, from);
    to = Math.min(cols - 0.5, to);
    const y = LAYOUT.picture.y + (p.minRow + 0.5) * this.grain;
    return { x1: LAYOUT.picture.x + from * this.grain, y1: y, x2: LAYOUT.picture.x + to * this.grain, y2: y };
  }

  /**
   * Hint target: the best patch by hintTier (sand that falls out to the belt now, colours the front
   * buckets need first), lowest first, then largest; the hand points at its bottom part, where the
   * sand drops into the funnel. QA's "wrong" target: the largest patch no front bucket needs.
   */
  private refreshTargets(): void {
    const fronts = this.rack.neededColors();
    const queued = this.rack.queuedColors();
    const beltBusy = this.conveyor.percent > HINT_BELT_LIMIT;
    let right: Patch | null = null;
    let rightTier = 0;
    let wrong: Patch | null = null;
    let blocked: Patch | null = null;
    for (let i = 0; i < this.patches.length; i++) {
      const p = this.patches[i];
      if (!p.openBelow && (!blocked || p.minRow < blocked.minRow)) {
        blocked = p;
      }
      const tier = hintTier(p, fronts, queued);
      if ((!beltBusy || tier === 0) && (!right || hintBefore(p, tier, right, rightTier))) {
        right = p;
        rightTier = tier;
      }
      if (!fronts.includes(p.color) && (!wrong || p.size > wrong.size)) {
        wrong = p;
      }
    }
    this.targets = {
      right: right ? this.cellCenter(right.bottom) : null,
      wrong: wrong ? this.cellCenter(wrong.cell) : null,
      blocked: blocked ? this.cellCenter(blocked.cell) : null,
      swipe: this.cutMode && right ? this.swipeLine(right) : null
    };
  }

  // ─── Waves ───────────────────────────────────────────────────────────────

  /**
   * After the player's cut: a colour of the current wave down to its last few grains in the picture
   * (TIMING.leftoverShare, at least leftoverGrains) crumbles by itself, so stray grains they can
   * hardly see or reach never keep its buckets, or the next wave, waiting.
   */
  private crumbleLeftovers(): void {
    if (this.state !== 'play') {
      return;
    }
    const released = this.requireGrid().crumbleLeftovers(this.waves[this.waveIndex], TIMING.leftoverShare, TIMING.leftoverGrains, TIMING.cutJitter, TIMING.dropJitter);
    if (released > 0) {
      this.view.invalidate();
    }
  }

  /** The current wave's patches (the only sand that can be tapped or cut, and hinted). */
  private activePatches(): Patch[] {
    const colors = this.waves[this.waveIndex];
    return this.requireGrid().patches().filter(patch => colors.includes(patch.color));
  }

  /**
   * Colours whose buckets show during the current wave: those of every wave in its BUCKETS.racks
   * group (a wave in no group shows alone); no racks = every bucket shows.
   */
  private rackColors(): number[] | null {
    const racks = gameConfig.BUCKETS.racks ?? [];
    if (!racks.length) {
      return null;
    }
    const wave = this.waveIndex + 1;
    const rack = racks.find(r => Array.isArray(r) && r.includes(wave)) ?? [wave];
    const colors: number[] = [];
    for (let i = 0; i < rack.length; i++) {
      colors.push(...(this.waves[rack[i] - 1] ?? []));
    }
    return colors;
  }

  /** All of the current wave's sand is in buckets (none left in the picture, funnel or on the belt). */
  private waveComplete(): boolean {
    const grid = this.requireGrid();
    const colors = this.waves[this.waveIndex];
    for (let i = 0; i < colors.length; i++) {
      if (grid.colorCounts[colors[i]] + this.conveyor.supplyOf(colors[i]) > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * The next wave starts once the current one's sand is all in buckets and its last bucket has
   * flown off: its sand becomes playable, its buckets rise into place if they were hidden
   * (BUCKETS.racks), its front buckets' lids pop off, "WAVE n" pops up and the hand points at its
   * first target.
   */
  private advanceWaveIfReady(): void {
    if (this.waveIndex >= this.waves.length - 1 || !this.waveComplete() || this.rack.hasBucketsForColors(this.waves[this.waveIndex])) {
      return;
    }
    this.waveIndex++;
    const colors = this.waves[this.waveIndex];
    this.requireGrid().setCuttable(colors);
    this.rack.showColors(this.rackColors());
    // Once the newly shown buckets have popped in, the wave's front buckets open.
    this.rack.setOpenColors(colors, TIMING.bucketRise + 120);
    this.patches = this.activePatches();
    this.frontKey = this.rack.neededColors().join(',');
    this.milestone = `wave-${this.waveIndex + 1}`;
    this.praise.show(`WAVE ${this.waveIndex + 1}`);
    this.refreshTargets();
    const hint = this.currentHint();
    if (!this.inputClosed && hint && !this.swipe) {
      this.hand.showNow(hint);
    }
  }

  /** Share of the picture's grains that have fallen out of it, crossing 25 / 50 / 75 %. */
  private trackProgress(): void {
    const grid = this.requireGrid();
    const removed = grid.exitedPicture / Math.max(1, grid.total);
    while (this.progressFired < PROGRESS_EVENTS.length && removed >= PROGRESS_EVENTS[this.progressFired][0]) {
      trackEvent(PROGRESS_EVENTS[this.progressFired][1]);
      this.progressFired++;
    }
  }

  /**
   * Simulation steps per frame: TIMING.fastForward once no static sand is left to tap (the player can
   * only wait for the sand to drain into the buckets), until the end card; otherwise 1.
   */
  private speed(): number {
    const ending = this.state === 'play' || this.state === 'ending';
    return ending && this.grid?.remaining === 0 ? Math.max(1, Math.round(TIMING.fastForward)) : 1;
  }

  /** GDD fail state: the belt is full and nothing on it matches a front bucket, for jamGrace ms. */
  private watchJam(delta: number): void {
    if (!this.conveyor.jammed) {
      this.jamMs = 0;
      return;
    }
    this.jamMs += delta;
    if (this.jamMs >= TIMING.jamGrace) {
      this.onFail('jam');
    }
  }

  /**
   * Soft lock (fail): while the full belt turns sand away at the funnel mouth, it must take in at
   * least BELT.stallPercent % of its capacity every BELT.stallSeconds. Otherwise sand only gets on a
   * grain at a time as the buckets drain the belt, and the game would crawl. Sand still sliding down
   * the funnel, or no sand waiting at all (the player isn't tapping), never counts.
   */
  private watchStall(delta: number, accepted: number, refused: number): void {
    const belt = gameConfig.BELT;
    const windowMs = (belt.stallSeconds ?? 0) * 1000;
    if (!(windowMs > 0)) {
      return;
    }
    this.stallQuietMs = refused > 0 ? 0 : this.stallQuietMs + delta;
    const need = (Math.max(1, belt.capacity) * (belt.stallPercent ?? 5)) / 100;
    this.stallIntake += accepted;
    if (this.stallQuietMs > TIMING.stallQuiet || this.stallIntake >= need) {
      // The mouth isn't being turned away any more, or the belt took its share: a fresh window.
      this.stallMs = 0;
      this.stallIntake = 0;
      return;
    }
    this.stallMs += delta;
    if (this.stallMs >= windowMs) {
      this.onFail('softlock');
    }
  }

  // ─── Ending ──────────────────────────────────────────────────────────────

  private endPlay(reason: string, milestone: string): void {
    this.inputClosed = true;
    this.state = 'ending';
    this.milestone = milestone;
    if (!this.endReason) {
      this.endReason = reason;
    }
    this.hand.clear();
    this.timeLimitEvent?.remove(false);
    this.timeLimitEvent = undefined;
    this.notifyEndOnce();
  }

  private onSolved(): void {
    this.trackProgress();
    trackEvent(ANALYTICS_EVENTS.CHALLENGE_SOLVED);
    this.endPlay('solved', 'solved');
    this.scheduleEndCard(TIMING.winEndcardDelay);
  }

  /** The fail state: a jammed belt (GDD), or a soft lock (watchStall). */
  private onFail(reason: 'jam' | 'softlock'): void {
    trackEvent(ANALYTICS_EVENTS.CHALLENGE_FAILED);
    this.endPlay(reason, reason);
    this.feedback.jam();
    playSound(this, SOUNDS.FAIL);
    this.scheduleEndCard(TIMING.failEndcardDelay);
  }

  /** Click limit: the store opens and the end card shows from the limit tap itself (user gesture). */
  private clickLimitCutoff(): void {
    this.endPlay('limit', 'limit');
    this.showEndCard();
  }

  private startTimeLimit(): void {
    const seconds = getTimeLimitSeconds();
    if (!Number.isFinite(seconds) || this.timeLimitEvent) {
      return;
    }
    this.timeLimitEvent = this.time.delayedCall(seconds * 1000, () => this.onTimeUp());
  }

  /** The time limit ran out before the picture was cleared. */
  private onTimeUp(): void {
    this.timeLimitEvent = undefined;
    if (this.state !== 'play') {
      return;
    }
    // Running out of time is not a fail (only a belt jam is): the game just ends, like the click limit.
    this.endPlay('time', 'time-up');
    this.showEndCard();
  }

  /** gameEnd fires once per session. */
  private notifyEndOnce(): void {
    if (!this.gameEndNotified) {
      this.gameEndNotified = true;
      notifyGameEnd();
    }
  }

  private scheduleEndCard(delayMs: number): void {
    if (!this.endCardAt && !this.endCard.isShown) {
      this.endCardAt = this.time.now + delayMs;
    }
  }

  /**
   * Every ending (cleared, jammed, click limit, time up) comes through here: the store opens right
   * before the end card appears. Timers, the hint, the vignette, camera shake and sound effects stop
   * while music fades beneath the reveal; the sand, belt and buckets keep moving behind the card.
   */
  private showEndCard(): void {
    if (this.endCard.isShown) {
      return;
    }
    redirectToStore();
    this.endCardAt = 0;
    this.state = 'endcard';
    this.inputClosed = true;
    this.time.removeAllEvents();
    // removeAllEvents() only covers active timers; timers scheduled this frame are still pending.
    this.time.clearPendingEvents();
    this.timeLimitEvent = undefined;
    this.hand.clear();
    this.feedback.settle(this.endReason === 'jam' || this.endReason === 'softlock');
    this.praise.settle();
    this.cameras.main.resetFX();
    finishGameplayAudio(this);
    this.endCard.show(gameConfig.SHOW_PACKSHOT);
    this.milestone = 'endcard';
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private requireGrid(): SandGrid {
    if (!this.grid) {
      throw new Error('Sand grid not created');
    }
    return this.grid;
  }

  private cellCenter(cell: number): Point {
    const cols = this.requireGrid().cols;
    const x = cell % cols;
    const y = (cell - x) / cols;
    return { x: LAYOUT.picture.x + (x + 0.5) * this.grain, y: LAYOUT.picture.y + (y + 0.5) * this.grain };
  }

  private hintAt(point: Point): HintTarget {
    return { tipX: point.x, tipY: point.y, glowX: point.x, glowY: point.y };
  }

  private tintOf(color: number): number {
    const rgb = gameConfig.SAND.palette[color - 1];
    return rgb ? Phaser.Display.Color.GetColor(rgb[0], rgb[1], rgb[2]) : 0xffffff;
  }

  // ─── QA ──────────────────────────────────────────────────────────────────

  private publishState(): void {
    const grid = this.requireGrid();
    const qa = (this.qa ??= {} as QaState);
    qa.state = this.state;
    qa.wave = this.waveIndex + 1;
    qa.activeColors = [...(this.waves[this.waveIndex] ?? [])];
    qa.counted = this.counter.count;
    qa.clickLimit = Number.isFinite(this.counter.limit) ? this.counter.limit : null;
    qa.remaining = grid.remaining;
    qa.total = grid.total;
    qa.removedPct = Math.round((grid.exitedPicture / Math.max(1, grid.total)) * 1000) / 10;
    qa.lastCut = grid.lastCut;
    qa.lastDrop = grid.lastDrop;
    qa.loose = grid.looseTotal;
    qa.funnel = grid.looseInFunnel;
    qa.belt = this.conveyor.percent;
    qa.beltLoad = this.conveyor.load;
    qa.fronts = this.rack.frontColors();
    qa.bucketsDone = this.rack.completed;
    qa.speed = this.speed();
    qa.accounted = grid.remaining + grid.looseTotal + this.conveyor.inTransit + this.rack.filled;
    qa.integrity = this.rack.integrityIssue();
    qa.frame = this.frames;
    qa.muted = this.sound.mute;
    qa.sounds = soundPlays;
    qa.handVisible = this.hand.visible;
    qa.vignette = Math.round(this.feedback.vignetteAlpha * 100) / 100;
    qa.ended = this.inputClosed;
    qa.endReason = this.endReason;
    qa.milestone = this.milestone;
    qa.targets = this.targets;
    qa.mechanic = this.cutMode ? 'cut' : 'tap';
    window.__SDP_STATE__ = qa;
  }
}
