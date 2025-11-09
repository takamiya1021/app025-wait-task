import { resetTaskStore, useTaskStore, __resetTimerIntegrationForTests } from '@/store/useTaskStore';
import { setTimerDriver } from '@/lib/timerDriver';
import { handleTimerCompletionNotification } from '@/app/lib/notificationManager';
import type { TaskPriority } from '@/types/models';
import { StubTimerDriver } from '@/tests/helpers/stubTimerDriver';

let stubDriver: StubTimerDriver;

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

describe('useTaskStore', () => {
  beforeEach(() => {
    stubDriver = new StubTimerDriver();
    setTimerDriver(stubDriver);
    __resetTimerIntegrationForTests();
    resetTaskStore();
  });

  afterEach(() => {
    setTimerDriver(null);
    __resetTimerIntegrationForTests();
  });

  it('タスクを追加できる', () => {
    const { addTask, tasks } = useTaskStore.getState();

    expect(tasks).toHaveLength(0);

    addTask({
      title: 'メモ整理',
      duration: 3,
      priority: 'medium',
      completed: false,
    });

    const currentTasks = useTaskStore.getState().tasks;
    expect(currentTasks).toHaveLength(1);
    expect(currentTasks[0].id).toBeTruthy();
    expect(currentTasks[0].createdAt instanceof Date).toBe(true);
  });

  it('タスクを更新して更新日時を保持する', () => {
    const { addTask, updateTask } = useTaskStore.getState();

    addTask({
      title: 'コーヒーを淹れる',
      duration: 5,
      priority: 'high',
      completed: false,
    });

    const originalTask = useTaskStore.getState().tasks[0];

    updateTask(originalTask.id, { title: 'ハーブティーを淹れる' });

    const updatedTask = useTaskStore.getState().tasks[0];
    expect(updatedTask.title).toBe('ハーブティーを淹れる');
    expect(updatedTask.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalTask.updatedAt.getTime(),
    );
  });

  it('タスク完了状態をトグルできる', () => {
    const { addTask, toggleTaskCompletion } = useTaskStore.getState();

    addTask({
      title: 'デスクを整える',
      duration: 1,
      priority: 'low',
      completed: false,
    });

    const taskId = useTaskStore.getState().tasks[0].id;

    toggleTaskCompletion(taskId);

    const toggledTask = useTaskStore.getState().tasks[0];
    expect(toggledTask.completed).toBe(true);
    expect(toggledTask.completedAt instanceof Date).toBe(true);
  });

  it('タイマーを開始・一時停止・再開・停止できる', () => {
    const { startTimer, pauseTimer, resumeTimer, stopTimer } = useTaskStore.getState();

    startTimer(5);

    expect(stubDriver.startCalls).toEqual([5]);

    let session = useTaskStore.getState().currentSession;
    expect(session).not.toBeNull();
    expect(session?.isRunning).toBe(true);
    expect(session?.remainingTime).toBe(5 * 60);

    pauseTimer();
    expect(stubDriver.pauseCalls).toBe(1);

    session = useTaskStore.getState().currentSession;
    expect(session?.isPaused).toBe(true);

    resumeTimer();
    expect(stubDriver.resumeCalls).toBe(1);

    session = useTaskStore.getState().currentSession;
    expect(session?.isPaused).toBe(false);

    stopTimer();
    expect(stubDriver.stopCalls).toBe(1);

    expect(useTaskStore.getState().currentSession).toBeNull();
  });

  it('タイマードライバのTickで残り時間が更新される', () => {
    const { startTimer } = useTaskStore.getState();

    startTimer(5);

    stubDriver.emitTick(120);

    const session = useTaskStore.getState().currentSession;
    expect(session?.remainingTime).toBe(120);
  });

  it('タイマー完了でセッションが停止状態になる', () => {
    const { startTimer } = useTaskStore.getState();

    startTimer(1);

    stubDriver.emitComplete();

    const session = useTaskStore.getState().currentSession;
    expect(session?.isRunning).toBe(false);
    expect(session?.remainingTime).toBe(0);
    expect(handleTimerCompletionNotification).toHaveBeenCalled();
  });

  it('設定を更新できる', () => {
    const { updateSettings } = useTaskStore.getState();
    expect(useTaskStore.getState().settings.notificationSound).toBe(true);

    updateSettings({ notificationSound: false });

    expect(useTaskStore.getState().settings.notificationSound).toBe(false);
  });

  it('セッション履歴を記録して当日統計を計算できる', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-02-01T10:00:00Z'));

    const { addTask, recordSession, todayStats } = useTaskStore.getState();

    addTask({
      title: '受信トレイ整理',
      duration: 3,
      priority: 'medium',
      completed: true,
      completedAt: new Date('2025-02-01T09:50:00Z'),
    });

    const taskId = useTaskStore.getState().tasks[0].id;

    recordSession([taskId]);

    const stats = todayStats();
    expect(stats?.date).toBe('2025-02-01');
    expect(stats?.completedTasks).toBe(1);

    jest.useRealTimers();
  });

  it('所要時間と優先度でタスクをフィルタリングできる', () => {
    const { addTask, filteredTasks } = useTaskStore.getState();

    const seedTasks = [
      { title: '筋トレ', duration: 10, priority: 'high', completed: false },
      { title: '瞑想', duration: 5, priority: 'medium', completed: false },
      { title: 'コーヒーブレイク', duration: 3, priority: 'low', completed: false },
    ] as const;

    seedTasks.forEach(addTask);

    const filtered = filteredTasks(5);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(task => task.duration <= 5)).toBe(true);

    const [first, second] = filtered;
    expect(priorityOrder[first.priority]).toBeLessThanOrEqual(priorityOrder[second.priority]);
  });
});
jest.mock('@/app/lib/notificationManager', () => ({
  handleTimerCompletionNotification: jest.fn(),
}));
