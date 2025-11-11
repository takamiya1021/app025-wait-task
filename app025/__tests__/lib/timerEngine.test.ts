import { TimerEngine } from '@/lib/timerEngine';
import type { TimerWorkerCommand, TimerWorkerResponse } from '@/types/models';

class MockWorker {
  public commands: TimerWorkerCommand[] = [];
  public terminated = false;
  private messageHandlers = new Set<(event: MessageEvent<TimerWorkerResponse>) => void>();
  private errorHandlers = new Set<(event: MessageEvent<any>) => void>();

  postMessage(command: TimerWorkerCommand) {
    this.commands.push(command);
  }

  addEventListener(type: string, listener: (event: MessageEvent<any>) => void) {
    if (type === 'message') {
      this.messageHandlers.add(listener as (event: MessageEvent<TimerWorkerResponse>) => void);
    }
    if (type === 'error') {
      this.errorHandlers.add(listener);
    }
  }

  removeEventListener(type: string, listener: (event: MessageEvent<any>) => void) {
    if (type === 'message') {
      this.messageHandlers.delete(listener as (event: MessageEvent<TimerWorkerResponse>) => void);
    }
    if (type === 'error') {
      this.errorHandlers.delete(listener);
    }
  }

  terminate() {
    this.terminated = true;
  }

  emit(message: TimerWorkerResponse) {
    const event = { data: message } as MessageEvent<TimerWorkerResponse>;
    this.messageHandlers.forEach((handler) => handler(event));
  }

  emitError(message: string) {
    const event = { data: { message } } as MessageEvent<any>;
    this.errorHandlers.forEach((handler) => handler(event));
  }
}

describe('TimerEngine (worker mode)', () => {
  it('worker経由でTICK/COMPLETEイベントを受信する', () => {
    const worker = new MockWorker();
    const engine = new TimerEngine({ workerFactory: () => worker });
    const tickSpy = jest.fn();
    const completeSpy = jest.fn();
    engine.onTick(tickSpy);
    engine.onComplete(completeSpy);

    engine.start(1);
    expect(worker.commands[0]).toEqual({ type: 'START', durationSeconds: 60 });

    worker.emit({ type: 'STARTED', durationMs: 60000 });
    worker.emit({ type: 'TICK', remainingMs: 30000 });
    worker.emit({ type: 'COMPLETE' });

    expect(tickSpy).toHaveBeenCalledWith(30);
    expect(completeSpy).toHaveBeenCalledTimes(1);

    engine.dispose();
  });

  it('pause/resume/stop コマンドをworkerに転送する', () => {
    const worker = new MockWorker();
    const engine = new TimerEngine({ workerFactory: () => worker });

    engine.start(0.5);
    engine.pause();
    engine.resume();
    engine.stop();

    expect(worker.commands).toEqual([
      { type: 'START', durationSeconds: 30 },
      { type: 'PAUSE' },
      { type: 'RESUME' },
      { type: 'STOP' },
    ]);

    engine.dispose();
  });

  it('workerエラー時にフォールバックへ切り替える', () => {
    jest.useFakeTimers();
    const worker = new MockWorker();
    const engine = new TimerEngine({ workerFactory: () => worker });
    const tickSpy = jest.fn();
    engine.onTick(tickSpy);

    engine.start(0.2);
    worker.emit({ type: 'STARTED', durationMs: 12000 });
    worker.emitError('boom');

    engine.start(0.1);
    jest.advanceTimersByTime(200);
    expect(tickSpy).toHaveBeenCalled();

    engine.dispose();
    jest.useRealTimers();
  });
});

describe('TimerEngine (fallback mode)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('forceFallbackオプションでローカルタイマーが動作する', () => {
    const engine = new TimerEngine({ forceFallback: true });
    const tickSpy = jest.fn();
    const completeSpy = jest.fn();
    engine.onTick(tickSpy);
    engine.onComplete(completeSpy);

    engine.start(0.05); // 約3秒

    jest.advanceTimersByTime(100);
    expect(tickSpy).toHaveBeenCalled();

    jest.advanceTimersByTime(4000);
    expect(completeSpy).toHaveBeenCalledTimes(1);

    engine.dispose();
  });
});
