import { create } from 'zustand';
import { loadAppState, saveAppState, type PersistedAppState } from '@/lib/storage';
import { getTimerDriver, type TimerDriver } from '@/lib/timerDriver';
import { handleTimerCompletionNotification } from '@/app/lib/notificationManager';
import { filterTasksByDuration } from '@/app/lib/taskUtils';
import type {
  AppSettings,
  Task,
  TaskHistory,
  TaskPriority,
  TimerSession,
  UserProgress,
} from '@/types/models';

type NewTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

interface TaskStoreState {
  tasks: Task[];
  currentSession: TimerSession | null;
  history: TaskHistory[];
  settings: AppSettings;
  progress: UserProgress;
  filters: {
    maxDuration: number;
    priority: TaskPriority | 'all';
  };
  timerDuration: number; // 現在設定されているタイマー時間（分）
}

interface TaskStoreActions {
  addTask: (task: NewTaskInput) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskCompletion: (id: string) => void;
  startTimer: (durationMinutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateRemainingTime: (seconds: number) => void;
  recordSession: (completedTaskIds: string[]) => void;
  filteredTasks: (maxDuration: number, priority?: TaskPriority) => Task[];
  todayStats: () => TaskHistory | null;
  reset: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateFilters: (updates: Partial<TaskStoreState['filters']>) => void;
  setTimerDuration: (minutes: number) => void;
}

export type TaskStore = TaskStoreState & TaskStoreActions;

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const defaultSettings: AppSettings = {
  notificationSound: true,
  alwaysOnTop: true,
  defaultDuration: 5,
  popupWidth: 400,
  popupHeight: 600,
  theme: 'system',
  geminiApiKey: undefined,
};

const createInitialState = (): TaskStoreState => ({
  tasks: [],
  currentSession: null,
  history: [],
  settings: { ...defaultSettings },
  progress: {
    totalSessions: 0,
    totalCompletedTasks: 0,
    averageSessionDuration: 0,
    lastActiveAt: undefined,
    totalFocusMinutes: 0,
  },
  filters: {
    maxDuration: 10,
    priority: 'all',
  },
  timerDuration: defaultSettings.defaultDuration,
});

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `task-${Math.random().toString(36).slice(2, 10)}`;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  ...createInitialState(),

  addTask: (taskInput) => {
    const now = new Date();

    const newTask: Task = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      completedAt: taskInput.completed ? taskInput.completedAt ?? now : undefined,
      ...taskInput,
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  removeTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },

  updateTask: (id, updates) => {
    const now = new Date();
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        const completed =
          typeof updates.completed === 'boolean' ? updates.completed : task.completed;

        return {
          ...task,
          ...updates,
          completed,
          updatedAt: now,
          completedAt: completed ? updates.completedAt ?? task.completedAt ?? now : undefined,
        };
      }),
    }));
  },

  toggleTaskCompletion: (id) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === id);

    if (!task) return;

    const nextCompleted = !task.completed;
    const now = new Date();

    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return {
          ...task,
          completed: nextCompleted,
          updatedAt: now,
          completedAt: nextCompleted ? now : undefined,
        };
      }),
    }));

    // 完了状態にした場合のみ統計に記録
    if (nextCompleted) {
      get().recordSession([id]);
    }
  },

  startTimer: (durationMinutes) => {
    const driver = ensureTimerDriver();
    const startTime = new Date();
    const durationSeconds = Math.max(0, durationMinutes * 60);
    const session: TimerSession = {
      id: generateId(),
      startTime,
      duration: durationMinutes,
      remainingTime: durationSeconds,
      isRunning: true,
      isPaused: false,
      completedTasks: [],
    };

    set({ currentSession: session });
    driver.start(durationMinutes);
  },

  pauseTimer: () => {
    const driver = ensureTimerDriver();
    driver.pause();

    set((state) => {
      if (!state.currentSession) {
        return {};
      }

      return {
        currentSession: {
          ...state.currentSession,
          isPaused: true,
          isRunning: false,
        },
      };
    });
  },

  resumeTimer: () => {
    const driver = ensureTimerDriver();
    driver.resume();

    set((state) => {
      if (!state.currentSession) {
        return {};
      }

      return {
        currentSession: {
          ...state.currentSession,
          isPaused: false,
          isRunning: true,
        },
      };
    });
  },

  stopTimer: () => {
    const driver = ensureTimerDriver();
    driver.stop();
    set({ currentSession: null });
  },

  updateRemainingTime: (seconds) => {
    set((state) => {
      if (!state.currentSession) {
        return {};
      }

      return {
        currentSession: {
          ...state.currentSession,
          remainingTime: seconds,
        },
      };
    });
  },

  recordSession: (completedTaskIds) => {
    if (completedTaskIds.length === 0) {
      return;
    }

    const { tasks, history, progress } = get();
    const completedTasks = tasks.filter((task) => completedTaskIds.includes(task.id));

    if (completedTasks.length === 0) {
      return;
    }

    const totalTime = completedTasks.reduce((sum, task) => sum + task.duration, 0);
    const todayKey = new Date().toISOString().split('T')[0];

    const tasksByCategory = completedTasks.reduce<Record<string, number>>((acc, task) => {
      const category = task.category ?? 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const existingHistoryIndex = history.findIndex((item) => item.date === todayKey);

    set((state) => {
      const nextHistory = [...state.history];

      if (existingHistoryIndex >= 0) {
        const existing = nextHistory[existingHistoryIndex];
        nextHistory[existingHistoryIndex] = {
          ...existing,
          totalTime: existing.totalTime + totalTime,
          completedTasks: existing.completedTasks + completedTasks.length,
          tasksByCategory: Object.entries(tasksByCategory).reduce((acc, [category, count]) => {
            acc[category] = (existing.tasksByCategory[category] || 0) + count;
            return acc;
          }, { ...existing.tasksByCategory }),
        };
      } else {
        nextHistory.push({
          date: todayKey,
          totalTime,
          completedTasks: completedTasks.length,
          tasksByCategory,
        });
      }

      const nextTotalSessions = progress.totalSessions + 1;
      const totalCompletedTasks = progress.totalCompletedTasks + completedTasks.length;
      const totalFocusMinutes = (progress.totalFocusMinutes ?? 0) + totalTime;
      const averageSessionDuration =
        nextTotalSessions === 0
          ? 0
          : Math.round(totalFocusMinutes / nextTotalSessions);

      return {
        history: nextHistory,
        progress: {
          totalSessions: nextTotalSessions,
          totalCompletedTasks,
          averageSessionDuration,
          lastActiveAt: new Date(),
          totalFocusMinutes,
        },
        tasks: state.tasks.map((task) => {
          if (!completedTaskIds.includes(task.id)) {
            return task;
          }
          const completedAt = task.completedAt ?? new Date();
          return {
            ...task,
            completed: true,
            completedAt,
            updatedAt: new Date(),
          };
        }),
      };
    });
  },

  filteredTasks: (maxDuration, priority) => {
    const { tasks } = get();
    return filterTasksByDuration(tasks, maxDuration, priority);
  },

  todayStats: () => {
    const todayKey = new Date().toISOString().split('T')[0];
    const { history } = get();
    return history.find((item) => item.date === todayKey) ?? null;
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...updates,
      },
    }));
  },

  updateFilters: (updates) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...updates,
      },
    }));
  },

  setTimerDuration: (minutes) => {
    set(() => ({ timerDuration: minutes }));
  },

  reset: () => {
    set(() => ({ ...createInitialState() }));
  },
}));

export const resetTaskStore = () => {
  const { reset } = useTaskStore.getState();
  reset();
};

let connectedDriver: TimerDriver | null = null;
let detachTick: (() => void) | null = null;
let detachComplete: (() => void) | null = null;

function ensureTimerDriver(): TimerDriver {
  const driver = getTimerDriver();
  if (driver !== connectedDriver) {
    if (detachTick) {
      detachTick();
      detachTick = null;
    }
    if (detachComplete) {
      detachComplete();
      detachComplete = null;
    }

    detachTick = driver.onTick((remainingSeconds) => {
      useTaskStore.setState((state) => {
        if (!state.currentSession) {
          return state;
        }

        return {
          currentSession: {
            ...state.currentSession,
            remainingTime: Math.max(0, remainingSeconds),
          },
        };
      });
    });

    detachComplete = driver.onComplete(() => {
      useTaskStore.setState((state) => {
        if (!state.currentSession) {
          return state;
        }

        return {
          currentSession: {
            ...state.currentSession,
            isRunning: false,
            isPaused: false,
            remainingTime: 0,
          },
        };
      });

      triggerTimerCompletionEffects();
    });

    connectedDriver = driver;
  }

  return driver;
}

const triggerTimerCompletionEffects = () => {
  if (typeof window === 'undefined') return;
  const { settings } = useTaskStore.getState();
  handleTimerCompletionNotification({
    enableSound: settings.notificationSound,
    message: 'チェックリストから次のタスクを選びましょう',
  });
};

export const __resetTimerIntegrationForTests = () => {
  if (detachTick) {
    detachTick();
    detachTick = null;
  }
  if (detachComplete) {
    detachComplete();
    detachComplete = null;
  }
  connectedDriver = null;
};

const debounce = <Args extends unknown[]>(fn: (...args: Args) => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const selectPersistableState = (state: TaskStore): PersistedAppState => ({
  tasks: state.tasks,
  history: state.history,
  currentSession: state.currentSession,
  settings: state.settings,
  progress: state.progress,
});

if (typeof window !== 'undefined') {
  const restored = loadAppState();
  if (restored) {
    useTaskStore.setState({
      ...restored,
    });
  }

  const persist = debounce((state: TaskStore) => {
    saveAppState(selectPersistableState(state));
  }, 500);

  useTaskStore.subscribe((state) => {
    persist(state);
  });
}
