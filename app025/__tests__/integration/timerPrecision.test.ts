import { createTimerController } from '@/lib/timerController';

describe('タイマー精度検証', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('3000msタイマーの完了誤差が±1秒以内である', () => {
    const timestamps: number[] = [];
    const controller = createTimerController(() => {
      timestamps.push(Date.now());
    });

    const start = Date.now();
    controller.handleMessage({ type: 'START', durationSeconds: 3 });

    jest.advanceTimersByTime(3100);

    const completionTs = timestamps[timestamps.length - 1];
    expect(completionTs).toBeDefined();

    const elapsed = completionTs - start;
    expect(Math.abs(elapsed - 3000)).toBeLessThanOrEqual(1000);
  });
});
