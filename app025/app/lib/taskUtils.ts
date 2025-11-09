import type { Task, TaskPriority } from '@/types/models';

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function filterTasksByDuration(
  tasks: Task[],
  maxDuration: number,
  priority?: TaskPriority,
): Task[] {
  return tasks
    .filter((task) => {
      if (task.completed) return false;
      if (task.duration > maxDuration) return false;
      if (priority && task.priority !== priority) return false;
      return true;
    })
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
