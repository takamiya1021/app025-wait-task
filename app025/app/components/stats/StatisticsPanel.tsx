'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

const formatMinutes = (minutes: number) => `${minutes}分`;

const todayKey = () => new Date().toISOString().split('T')[0];

export function StatisticsPanel() {
  const history = useTaskStore(state => state.history);
  const todayStats = useTaskStore(state => state.todayStats());

  const { weeklyMinutes, weeklyCompleted } = useMemo(() => {
    const now = new Date(todayKey());
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    let totalMinutes = 0;
    let completed = 0;
    history.forEach(entry => {
      const date = new Date(entry.date);
      if (date >= sevenDaysAgo && date <= now) {
        totalMinutes += entry.totalTime;
        completed += entry.completedTasks;
      }
    });

    return { weeklyMinutes: totalMinutes, weeklyCompleted: completed };
  }, [history]);

  const todayMinutes = todayStats?.totalTime ?? 0;
  const todayCompleted = todayStats?.completedTasks ?? 0;

  const cards = [
    {
      label: '今日の完了タスク',
      value: `${todayCompleted}件`,
      detail: todayStats ? `更新: ${todayStats.date}` : 'まだ完了なし',
    },
    {
      label: '今日の隙間時間活用',
      value: formatMinutes(todayMinutes),
      detail: todayMinutes > 0 ? 'よく頑張ったね' : 'これから積み上げよう',
    },
    {
      label: '直近7日の完了数',
      value: `${weeklyCompleted}件`,
      detail: '週間合計',
    },
    {
      label: '直近7日の活用時間',
      value: formatMinutes(weeklyMinutes),
      detail: '週間合計',
    },
  ];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm" aria-label="利用統計">
      <header className="mb-4 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-500">STEP 4</p>
        <h2 className="text-2xl font-bold text-slate-900">利用状況サマリー</h2>
        <p className="text-sm text-slate-500">今日と直近1週間の成果をチェック</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(card => (
          <article key={card.label} className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500">{card.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
