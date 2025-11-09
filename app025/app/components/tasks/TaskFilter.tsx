'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import type { TaskPriority } from '@/types/models';
import { filterTasksByDuration } from '@/app/lib/taskUtils';

const durationPresets = [3, 5, 10, 15];

export function TaskFilter() {
  const filters = useTaskStore((state) => state.filters);
  const updateFilters = useTaskStore((state) => state.updateFilters);
  const tasks = useTaskStore((state) => state.tasks);

  const visibleCount = useMemo(() => {
    const selectedPriority = filters.priority === 'all' ? undefined : filters.priority;
    return filterTasksByDuration(tasks, filters.maxDuration, selectedPriority).length;
  }, [filters, tasks]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm" aria-label="タスクフィルター">
      <header className="mb-4">
        <p className="text-sm font-semibold text-slate-500">STEP 3.5</p>
        <h2 className="text-2xl font-bold text-slate-900">タスクフィルター</h2>
        <p className="text-sm text-slate-500">ぴったりのタスクだけ表示できます（現在 {visibleCount} 件）</p>
      </header>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700">最大所要時間</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {durationPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateFilters({ maxDuration: preset })}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  filters.maxDuration === preset
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset}分以内
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">優先度</p>
          <div className="mt-2 flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateFilters({ priority: level })}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  filters.priority === level
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                aria-pressed={filters.priority === level}
              >
                {level === 'all' ? 'すべて' : level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
