import type { TimerDriver } from '@/lib/timerDriver';

export class StubTimerDriver implements TimerDriver {
  public startCalls: number[] = [];
  public pauseCalls = 0;
  public resumeCalls = 0;
  public stopCalls = 0;
  private tickListener: ((remaining: number) => void) | null = null;
  private completeListener: (() => void) | null = null;

  start(durationMinutes: number): void {
    this.startCalls.push(durationMinutes);
  }

  pause(): void {
    this.pauseCalls += 1;
  }

  resume(): void {
    this.resumeCalls += 1;
  }

  stop(): void {
    this.stopCalls += 1;
  }

  requestTick(): void {
    this.tickListener?.(0);
  }

  onTick(listener: (remaining: number) => void): () => void {
    this.tickListener = listener;
    return () => {
      if (this.tickListener === listener) {
        this.tickListener = null;
      }
    };
  }

  onComplete(listener: () => void): () => void {
    this.completeListener = listener;
    return () => {
      if (this.completeListener === listener) {
        this.completeListener = null;
      }
    };
  }

  emitTick(remaining: number) {
    this.tickListener?.(remaining);
  }

  emitComplete() {
    this.completeListener?.();
  }
}
