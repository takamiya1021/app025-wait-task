'use client';

import { useMemo, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { analyzeProductivityWithAI } from '@/app/lib/geminiService';

const formatMinutes = (minutes: number) => `${minutes}分`;

const todayKey = () => new Date().toISOString().split('T')[0];

export function StatisticsPanel() {
  const history = useTaskStore(state => state.history);
  const todayStats = useTaskStore(state => state.todayStats());
  const settings = useTaskStore(state => state.settings);

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

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const handleAnalysis = async () => {
    setAiLoading(true);
    const result = await analyzeProductivityWithAI({ history, apiKey: settings.geminiApiKey });
    setAnalysis(result.summary);
    setTips(result.tips ?? []);
    setAiLoading(false);
  };

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
      <div className="mt-6 rounded-2xl border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AIアドバイス</p>
            <p className="text-sm text-slate-500">Gemini が活用状況を要約します</p>
          </div>
          <button
            type="button"
            onClick={handleAnalysis}
            disabled={aiLoading}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-200"
          >
            {aiLoading ? '分析中…' : 'AIに分析してもらう'}
          </button>
        </div>
        {analysis && (
          <div className="mt-3 text-sm text-slate-700" data-testid="ai-analysis">
            <p>{analysis}</p>
            <ul className="mt-2 list-disc pl-5 text-slate-600">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
