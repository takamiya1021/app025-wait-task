export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskDurationOption = 1 | 3 | 5 | 10 | 15 | 30;

export interface Task {
  id: string;
  title: string;
  duration: number;
  priority: TaskPriority;
  category?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TimerSession {
  id: string;
  startTime: Date;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
  completedTasks: string[];
}

export interface TaskHistory {
  date: string;
  totalTime: number;
  completedTasks: number;
  tasksByCategory: Record<string, number>;
}

export interface UserProgress {
  totalSessions: number;
  totalCompletedTasks: number;
  averageSessionDuration: number;
  lastActiveAt?: Date;
  totalFocusMinutes?: number;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  notificationSound: boolean;
  alwaysOnTop: boolean;
  defaultDuration: number;
  popupWidth: number;
  popupHeight: number;
  theme: ThemePreference;
  geminiApiKey?: string;
}

export interface TaskFilterCriteria {
  durationLimit?: number;
  priority?: TaskPriority;
  category?: string;
  includeCompleted?: boolean;
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  highPriorityTasks: number;
}
