'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

export function TaskList() {
  const tasks = useTaskStore(state => state.tasks);
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
  const removeTask = useTaskStore(state => state.removeTask);

  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
    return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks]);

  if (sortedTasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
        タスクを追加するとここに表示されます。
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="タスクリスト">
      {sortedTasks.map(task => (
        <li key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
              className="h-5 w-5 rounded border-slate-300 text-slate-900"
              aria-label={`${task.title} を完了`}
            />
            <div className="flex flex-1 flex-col">
              <span className={`text-base font-semibold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                {task.title}
              </span>
              <span className="text-sm text-slate-500">
                所要 {task.duration}分 ・ 優先度 {task.priority.toUpperCase()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeTask(task.id)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
              aria-label={`${task.title} を削除`}
            >
              削除
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
