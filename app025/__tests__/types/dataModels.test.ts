import type {
  AppSettings,
  Task,
  TaskHistory,
  TaskPriority,
  TimerSession,
  UserProgress,
} from '@/types/models';

describe('ドメインデータモデル', () => {
  it('Task 型に必要なフィールドが揃っている', () => {
    const task: Task = {
      id: 'task-001',
      title: 'ストレッチ',
      duration: 3,
      priority: 'high',
      completed: false,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
      category: 'health',
    };

    expect(task.title).toBe('ストレッチ');
  });

  it('TaskPriority は high/medium/low のみ許容する', () => {
    const priorities: TaskPriority[] = ['high', 'medium', 'low'];
    expect(priorities).toHaveLength(3);
  });

  it('TimerSession は経過時間とタスク完了情報を保持する', () => {
    const session: TimerSession = {
      id: 'session-001',
      startTime: new Date('2025-01-01T12:00:00Z'),
      duration: 5,
      remainingTime: 60,
      isRunning: true,
      isPaused: false,
      completedTasks: ['task-001'],
    };

    expect(session.completedTasks).toContain('task-001');
  });

  it('TaskHistory は日別集計を保持する', () => {
    const history: TaskHistory = {
      date: '2025-01-01',
      totalTime: 15,
      completedTasks: 4,
      tasksByCategory: {
        work: 2,
        life: 2,
      },
    };

    expect(history.totalTime).toBe(15);
  });

  it('UserProgress は完了したタスクに関する統計情報を表す', () => {
    const progress: UserProgress = {
      totalSessions: 1,
      totalCompletedTasks: 4,
      lastActiveAt: new Date('2025-01-02T09:00:00Z'),
      averageSessionDuration: 4,
    };

    expect(progress.totalSessions).toBe(1);
  });

  it('AppSettings はユーザー設定を保持する', () => {
    const settings: AppSettings = {
      notificationSound: true,
      alwaysOnTop: true,
      defaultDuration: 5,
      popupWidth: 400,
      popupHeight: 600,
      theme: 'system',
    };

    expect(settings.defaultDuration).toBe(5);
  });
});
