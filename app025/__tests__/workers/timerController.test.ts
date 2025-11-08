import { createTimerController } from '@/lib/timerController';
import type { TimerWorkerResponse } from '@/types/models';

const collectMessages = () => {
  const entries: TimerWorkerResponse[] = [];
  return {
    entries,
    postMessage: (message: TimerWorkerResponse) => {
      entries.push(message);
    },
  };
};

describe('createTimerController', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  let controller: ReturnType<typeof createTimerController>;
  let messageCollector: ReturnType<typeof collectMessages>;

  const setupController = () => {
    messageCollector = collectMessages();
    controller = createTimerController(messageCollector.postMessage);
  };

  beforeEach(() => {
    setupController();
  });

  it('指定時間をカウントダウンしCOMPLETEを発火する', () => {
    controller.handleMessage({ type: 'START', durationSeconds: 2 });

    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(1000);

    const types = messageCollector.entries.map((entry) => entry.type);
    expect(types).toContain('STARTED');
    expect(types).toContain('TICK');
    expect(types).toContain('COMPLETE');

    const lastTick = [...messageCollector.entries].reverse().find((entry) => entry.type === 'TICK');
    expect(lastTick).toBeDefined();
    if (!lastTick || lastTick.type !== 'TICK') {
      throw new Error('TICKメッセージが見つかりません');
    }
    expect(lastTick.remainingMs).toBe(0);
  });

  it('一時停止・再開で残り時間を維持する', () => {
    controller.handleMessage({ type: 'START', durationSeconds: 5 });
    jest.advanceTimersByTime(2000);

    controller.handleMessage({ type: 'PAUSE' });

    const pausedMessage = messageCollector.entries.find((entry) => entry.type === 'PAUSED');
    expect(pausedMessage).toBeDefined();
    if (!pausedMessage || pausedMessage.type !== 'PAUSED') {
      throw new Error('PAUSEDメッセージが見つかりません');
    }
    const remainingAfterPause = pausedMessage.remainingMs;
    expect(remainingAfterPause).toBeGreaterThan(0);
    expect(remainingAfterPause).toBeLessThan(5000);

    jest.advanceTimersByTime(2000);

    controller.handleMessage({ type: 'RESUME' });
    jest.advanceTimersByTime(remainingAfterPause);

    const types = messageCollector.entries.map((entry) => entry.type);
    expect(types).toContain('RESUMED');
    expect(types.filter((type) => type === 'COMPLETE')).toHaveLength(1);
  });

  it('STOPでタイマーを終了する', () => {
    controller.handleMessage({ type: 'START', durationSeconds: 10 });
    jest.advanceTimersByTime(1000);
    controller.handleMessage({ type: 'STOP' });

    const lastMessage = messageCollector.entries[messageCollector.entries.length - 1];
    expect(lastMessage.type).toBe('STOPPED');

    jest.advanceTimersByTime(5000);

    const completeCount = messageCollector.entries.filter((entry) => entry.type === 'COMPLETE').length;
    expect(completeCount).toBe(0);
  });
});
