import { filterTasksByDuration } from '@/app/lib/taskUtils';
import type { Task } from '@/types/models';

const baseTask = (overrides: Partial<Task>): Task => ({
  id: crypto.randomUUID(),
  title: 'task',
  duration: 3,
  priority: 'medium',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('filterTasksByDuration', () => {
  it('所要時間と優先度でフィルタリングする', () => {
    const tasks = [
      baseTask({ id: '1', duration: 10, priority: 'high' }),
      baseTask({ id: '2', duration: 5, priority: 'medium' }),
      baseTask({ id: '3', duration: 2, priority: 'low' }),
    ];

    const filtered = filterTasksByDuration(tasks, 5);
    expect(filtered.map((t) => t.id)).toEqual(['2', '3']);

    const onlyHigh = filterTasksByDuration(tasks, 15, 'high');
    expect(onlyHigh).toHaveLength(1);
    expect(onlyHigh[0].priority).toBe('high');
  });
});
