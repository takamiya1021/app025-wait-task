'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { filterTasksByDuration } from '@/app/lib/taskUtils';
import { TaskList } from './TaskList';

export function TaskListSection() {
  const tasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const timerDuration = useTaskStore(state => state.timerDuration);

  const { percentage, barColorClass, bgColorClass } = useMemo(() => {
    const selectedPriority = filters.priority === 'all' ? undefined : filters.priority;
    const filtered = filterTasksByDuration(tasks, filters.maxDuration, selectedPriority);

    // 未完了タスクの合計時間を計算
    const incompleteTasks = filtered.filter(task => !task.completed);
    const total = incompleteTasks.reduce((sum, task) => sum + task.duration, 0);

    // 待ち時間に対する割合（%）
    const ratio = total / timerDuration;
    const percentage = Math.min(ratio * 100, 100); // 100%で上限

    let barColorClass: string;
    let bgColorClass: string;

    if (ratio <= 0.7) {
      // 余裕（70%以下）- 緑
      barColorClass = 'bg-emerald-500';
      bgColorClass = 'bg-emerald-100';
    } else if (ratio <= 0.9) {
      // やや余裕（70%〜90%）- 青緑
      barColorClass = 'bg-teal-500';
      bgColorClass = 'bg-teal-100';
    } else if (ratio <= 1.0) {
      // ギリギリ（90%〜100%）- 黄
      barColorClass = 'bg-amber-500';
      bgColorClass = 'bg-amber-100';
    } else {
      // オーバー（100%超）- 赤
      barColorClass = 'bg-rose-500';
      bgColorClass = 'bg-rose-100';
    }

    return { percentage, barColorClass, bgColorClass };
  }, [tasks, filters, timerDuration]);

  return (
    <section id="tasks" className="rounded-3xl bg-white p-6 shadow-sm">
      <header className="mb-4">
        <p className="text-sm font-semibold text-slate-500">STEP 5</p>
        <h2 className="text-2xl font-bold text-slate-900">この間にやること</h2>
        <p className="text-sm text-slate-500">完了したタスクにチェックを入れてください</p>

        {/* プログレスバー */}
        <div className="mt-3">
          <div className={`h-3 w-full rounded-full overflow-hidden ${bgColorClass}`}>
            <div
              className={`h-full transition-all duration-300 ${barColorClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </header>
      <TaskList />
    </section>
  );
}
