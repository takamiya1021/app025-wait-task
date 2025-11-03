import { loadAppState, saveAppState, STORAGE_KEY } from '@/lib/storage';
import type { Task, TaskHistory, TimerSession, AppSettings, UserProgress } from '@/types/models';

const createSampleState = () => {
  const baseTask: Task = {
    id: 'task-1',
    title: 'メモ整理',
    duration: 5,
    priority: 'medium',
    completed: false,
    createdAt: new Date('2025-01-01T09:00:00Z'),
    updatedAt: new Date('2025-01-01T09:00:00Z'),
  };

  const session: TimerSession = {
    id: 'session-1',
    startTime: new Date('2025-01-02T10:00:00Z'),
    duration: 5,
    remainingTime: 240,
    isRunning: true,
    isPaused: false,
    completedTasks: ['task-1'],
  };

  const settings: AppSettings = {
    notificationSound: true,
    alwaysOnTop: true,
    defaultDuration: 5,
    popupWidth: 400,
    popupHeight: 600,
    theme: 'system',
  };

  const progress: UserProgress = {
    totalSessions: 2,
    totalCompletedTasks: 4,
    averageSessionDuration: 4,
    lastActiveAt: new Date('2025-01-02T11:00:00Z'),
    totalFocusMinutes: 20,
  };

  return {
    tasks: [baseTask],
    history: [
      {
        date: '2024-12-01',
        totalTime: 30,
        completedTasks: 5,
        tasksByCategory: { work: 3, life: 2 },
      },
      {
        date: '2025-01-01',
        totalTime: 10,
        completedTasks: 2,
        tasksByCategory: { work: 2 },
      },
    ] as TaskHistory[],
    currentSession: session,
    settings,
    progress,
  };
};

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date('2025-01-05T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('状態を保存すると30日より古い履歴が除外される', () => {
    const state = createSampleState();

    saveAppState(state);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw as string);
    expect(parsed.history).toHaveLength(1);
    expect(parsed.history[0].date).toBe('2025-01-01');
  });

  it('保存した状態を復元すると Date 型が再構築される', () => {
    const state = createSampleState();
    saveAppState(state);

    const restored = loadAppState();

    expect(restored?.tasks[0].createdAt instanceof Date).toBe(true);
    expect(restored?.currentSession?.startTime instanceof Date).toBe(true);
    expect(restored?.progress.lastActiveAt instanceof Date).toBe(true);
  });

  it('壊れたデータは無視して null を返す', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    localStorage.setItem(STORAGE_KEY, '{ this is invalid json');

    const restored = loadAppState();

    expect(restored).toBeNull();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
