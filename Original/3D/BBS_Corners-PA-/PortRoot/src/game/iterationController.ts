import { getActiveIteration, type IterationMode } from '../iteration';

export type IterationCallbacks = {
  onRedirectRequested: () => void;
  onEndCardRequested: (isWin: boolean) => void;
};

export class IterationController {
  readonly mode: IterationMode = getActiveIteration();
  private running = false;
  private ended = false;
  private clicks = 0;
  private timeLeft = this.mode.timeLimitSeconds ?? 0;

  constructor(private readonly callbacks: IterationCallbacks) {}

  start(): void {
    if (this.ended) return;
    this.running = true;
  }

  isEnded(): boolean {
    return this.ended;
  }

  registerClick(): void {
    if (!this.running || this.ended || this.mode.clickLimit === null) return;

    this.clicks++;
    if (this.clicks >= this.mode.clickLimit) {
      this.failLimitedIteration();
    }
  }

  update(dtSeconds: number): void {
    if (!this.running || this.ended || this.mode.timeLimitSeconds === null) return;

    this.timeLeft -= dtSeconds;
    if (this.timeLeft <= 0) {
      this.failLimitedIteration();
    }
  }

  win(): void {
    if (this.ended) return;
    this.ended = true;
    this.running = false;
    this.callbacks.onEndCardRequested(true);
  }

  private failLimitedIteration(): void {
    if (this.ended) return;
    this.ended = true;
    this.running = false;
    if (this.mode.redirectsBeforeEndCard) this.callbacks.onRedirectRequested();
    this.callbacks.onEndCardRequested(false);
  }
}
