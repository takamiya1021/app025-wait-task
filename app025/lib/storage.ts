import type {
  AppSettings,
  Task,
  TaskHistory,
  TaskPriority,
  TimerSession,
  UserProgress,
} from '@/types/models';

export interface PersistedAppState {
  tasks: Task[];
  history: TaskHistory[];
  currentSession: TimerSession | null;
  settings: AppSettings;
  progress: UserProgress;
}

interface SerializedTask {
  id: string;
  title: string;
  duration: number;
  priority: TaskPriority;
  category?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

interface SerializedTimerSession {
  id: string;
  startTime: string;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
  completedTasks: string[];
}

interface SerializedProgress {
  totalSessions: number;
  totalCompletedTasks: number;
  averageSessionDuration: number;
  lastActiveAt?: string | null;
  totalFocusMinutes?: number;
}

interface SerializedAppState {
  tasks: SerializedTask[];
  history: TaskHistory[];
  currentSession: SerializedTimerSession | null;
  settings: AppSettings;
  progress: SerializedProgress;
}

export const STORAGE_KEY = 'app025:persisted-state';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const isStorageAvailable = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const serializeTask = (task: Task): SerializedTask => ({
  id: task.id,
  title: task.title,
  duration: task.duration,
  priority: task.priority,
  category: task.category,
  completed: task.completed,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  completedAt: task.completedAt ? task.completedAt.toISOString() : null,
});

const serializeTimerSession = (session: TimerSession): SerializedTimerSession => ({
  ...session,
  startTime: session.startTime.toISOString(),
});

const serializeProgress = (progress: UserProgress): SerializedProgress => ({
  totalSessions: progress.totalSessions,
  totalCompletedTasks: progress.totalCompletedTasks,
  averageSessionDuration: progress.averageSessionDuration,
  lastActiveAt: progress.lastActiveAt ? progress.lastActiveAt.toISOString() : null,
  totalFocusMinutes: progress.totalFocusMinutes,
});

const deserializeTask = (task: SerializedTask): Task => ({
  id: task.id,
  title: task.title,
  duration: task.duration,
  priority: task.priority,
  category: task.category,
  completed: task.completed,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
  completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
});

const deserializeTimerSession = (
  session: SerializedTimerSession,
): TimerSession => ({
  ...session,
  startTime: new Date(session.startTime),
});

const deserializeProgress = (progress: SerializedProgress): UserProgress => ({
  totalSessions: progress.totalSessions,
  totalCompletedTasks: progress.totalCompletedTasks,
  averageSessionDuration: progress.averageSessionDuration,
  lastActiveAt: progress.lastActiveAt ? new Date(progress.lastActiveAt) : undefined,
  totalFocusMinutes: progress.totalFocusMinutes,
});

const pruneHistory = (history: TaskHistory[]): TaskHistory[] => {
  const now = Date.now();
  return history.filter((entry) => {
    const entryDate = new Date(`${entry.date}T00:00:00Z`).getTime();
    return now - entryDate <= THIRTY_DAYS_MS;
  });
};

export const saveAppState = (state: PersistedAppState): void => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const serialized: SerializedAppState = {
      tasks: state.tasks.map(serializeTask),
      history: pruneHistory(state.history),
      currentSession: state.currentSession
        ? serializeTimerSession(state.currentSession)
        : null,
      settings: state.settings,
      progress: serializeProgress(state.progress),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.warn('LocalStorageへの保存に失敗しました', error);
  }
};

export const loadAppState = (): PersistedAppState | null => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SerializedAppState;

    return {
      tasks: parsed.tasks.map(deserializeTask),
      history: parsed.history,
      currentSession: parsed.currentSession
        ? deserializeTimerSession(parsed.currentSession)
        : null,
      settings: parsed.settings,
      progress: deserializeProgress(parsed.progress),
    };
  } catch (error) {
    console.warn('LocalStorageからの復元に失敗しました', error);
    return null;
  }
};
