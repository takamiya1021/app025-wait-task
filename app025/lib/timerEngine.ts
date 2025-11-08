import { createTimerController, type TimerController } from '@/lib/timerController';
import type { TimerWorkerCommand, TimerWorkerResponse } from '@/types/models';

interface WorkerLike {
  postMessage: (command: TimerWorkerCommand) => void;
  addEventListener: (type: string, listener: (event: MessageEvent<any>) => void) => void;
  removeEventListener: (type: string, listener: (event: MessageEvent<any>) => void) => void;
  terminate: () => void;
}

export interface TimerEngineOptions {
  workerFactory?: () => WorkerLike;
  forceFallback?: boolean;
}

type TickListener = (remainingSeconds: number) => void;
type CompleteListener = () => void;

export class TimerEngine {
  private worker: WorkerLike | null = null;
  private fallbackController: TimerController | null = null;
  private durationMs = 0;
  private remainingMs = 0;
  private tickListeners = new Set<TickListener>();
  private completeListeners = new Set<CompleteListener>();
  private disposed = false;
  private readonly handleMessageBound = (event: MessageEvent<TimerWorkerResponse>) => {
    this.handleWorkerMessage(event.data);
  };
  private readonly handleErrorBound = (error: ErrorEvent) => {
    console.error('Timer worker error', error.message);
    this.switchToFallback();
  };

  constructor(private readonly options: TimerEngineOptions = {}) {
    const canUseCustomWorker = Boolean(options.workerFactory);
    const canUseBrowserWorker = typeof window !== 'undefined' && typeof Worker !== 'undefined';

    if (!options.forceFallback && (canUseCustomWorker || canUseBrowserWorker)) {
      try {
        const factory = options.workerFactory ?? this.createBrowserWorker;
        this.worker = factory();
        this.worker.addEventListener('message', this.handleMessageBound as EventListener);
        this.worker.addEventListener('error', this.handleErrorBound as EventListener);
      } catch (error) {
        console.warn('Timer worker作成に失敗したためフォールバックします', error);
        this.worker = null;
      }
    }

    if (!this.worker) {
      this.switchToFallback();
    }
  }

  private createBrowserWorker = () =>
    new Worker(new URL('../workers/timer.worker.ts', import.meta.url), { type: 'module' });

  private switchToFallback() {
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessageBound as EventListener);
      this.worker.removeEventListener('error', this.handleErrorBound as EventListener);
      this.worker.terminate();
      this.worker = null;
    }
    if (!this.fallbackController) {
      this.fallbackController = createTimerController((message) => {
        this.handleWorkerMessage(message);
      });
    }
  }

  private handleWorkerMessage = (message: TimerWorkerResponse) => {
    switch (message.type) {
      case 'STARTED':
        this.durationMs = message.durationMs;
        this.remainingMs = message.durationMs;
        break;
      case 'TICK':
        this.remainingMs = message.remainingMs;
        this.emitTick();
        break;
      case 'PAUSED':
      case 'RESUMED':
        this.remainingMs = message.remainingMs;
        break;
      case 'STOPPED':
        this.remainingMs = 0;
        break;
      case 'COMPLETE':
        this.remainingMs = 0;
        this.emitComplete();
        break;
      case 'ERROR':
        console.error('Timer worker error', message.message);
        break;
      default:
        break;
    }
  };

  private sendCommand(command: TimerWorkerCommand) {
    if (this.disposed) {
      return;
    }
    if (this.worker) {
      this.worker.postMessage(command);
    } else if (this.fallbackController) {
      this.fallbackController.handleMessage(command);
    }
  }

  private emitTick() {
    const remainingSeconds = Math.ceil(this.remainingMs / 1000);
    this.tickListeners.forEach((listener) => listener(remainingSeconds));
  }

  private emitComplete() {
    this.completeListeners.forEach((listener) => listener());
  }

  public start(durationMinutes: number) {
    const durationSeconds = Math.max(0, durationMinutes * 60);
    this.sendCommand({ type: 'START', durationSeconds });
  }

  public pause() {
    this.sendCommand({ type: 'PAUSE' });
  }

  public resume() {
    this.sendCommand({ type: 'RESUME' });
  }

  public stop() {
    this.sendCommand({ type: 'STOP' });
  }

  public requestTick() {
    this.sendCommand({ type: 'TICK_REQUEST' });
  }

  public getRemainingSeconds() {
    return Math.ceil(this.remainingMs / 1000);
  }

  public getProgress() {
    if (this.durationMs === 0) {
      return 0;
    }
    const completed = this.durationMs - this.remainingMs;
    return Math.min(1, Math.max(0, completed / this.durationMs));
  }

  public onTick(callback: TickListener) {
    this.tickListeners.add(callback);
    return () => this.tickListeners.delete(callback);
  }

  public onComplete(callback: CompleteListener) {
    this.completeListeners.add(callback);
    return () => this.completeListeners.delete(callback);
  }

  public dispose() {
    this.disposed = true;
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessageBound as EventListener);
      this.worker.removeEventListener('error', this.handleErrorBound as EventListener);
      this.worker.terminate();
      this.worker = null;
    }
    if (this.fallbackController) {
      this.fallbackController = null;
    }
    this.tickListeners.clear();
    this.completeListeners.clear();
  }
}
