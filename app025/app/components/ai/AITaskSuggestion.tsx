'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { suggestTasksWithAI, type AISuggestedTask } from '@/app/lib/geminiService';

const PRIORITY_LABELS = {
  high: '高優先',
  medium: '通常',
  low: '低優先',
} as const;

export function AITaskSuggestion() {
  const tasks = useTaskStore((state) => state.tasks);
  const settings = useTaskStore((state) => state.settings);
  const timerDuration = useTaskStore((state) => state.timerDuration);
  const addTask = useTaskStore((state) => state.addTask);
  const [suggestions, setSuggestions] = useState<AISuggestedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    setAddedTasks(new Set()); // リセット
    try {
      const data = await suggestTasksWithAI({
        availableMinutes: timerDuration,
        tasks,
        apiKey: settings.geminiApiKey,
      });
      setSuggestions(data);
    } catch (err) {
      setError('AI提案の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (suggestion: AISuggestedTask) => {
    addTask({
      title: suggestion.title,
      duration: suggestion.duration,
      priority: suggestion.priority,
      completed: false,
    });
    setAddedTasks(prev => new Set(prev).add(suggestion.title));
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm" aria-label="AIタスク提案">
      <header className="mb-4 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-500">STEP 3</p>
        <h2 className="text-2xl font-bold text-slate-900">AIにおすすめを聞く</h2>
        <p className="text-sm text-slate-500">待ち時間（{timerDuration}分）に合わせてAIがタスクを推薦します</p>
      </header>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSuggest}
            disabled={loading}
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:bg-slate-200"
          >
            {loading ? 'AIが考え中…' : 'AIに聞いてみる'}
          </button>
          {!settings.geminiApiKey && (
            <p className="text-xs text-amber-600">APIキー未設定のためローカル推論で回答します</p>
          )}
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {suggestions.length > 0 && (
          <ul className="flex flex-col gap-3" data-testid="ai-suggestions">
            {suggestions.map((suggestion) => {
              const isAdded = addedTasks.has(suggestion.title);
              return (
                <li key={suggestion.title} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-900">{suggestion.title}</p>
                      <p className="text-sm text-slate-500">
                        所要 {suggestion.duration}分 / {PRIORITY_LABELS[suggestion.priority as keyof typeof PRIORITY_LABELS] || suggestion.priority}
                      </p>
                      {suggestion.reason && <p className="text-xs text-slate-400">{suggestion.reason}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTask(suggestion)}
                      disabled={isAdded}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isAdded
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                    >
                      {isAdded ? '追加済み' : '追加'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
