'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { suggestTasksWithAI, type AISuggestedTask } from '@/app/lib/geminiService';

export function AITaskSuggestion() {
  const tasks = useTaskStore((state) => state.tasks);
  const settings = useTaskStore((state) => state.settings);
  const currentSession = useTaskStore((state) => state.currentSession);
  const filters = useTaskStore((state) => state.filters);
  const [availableMinutes, setAvailableMinutes] = useState(() =>
    currentSession ? Math.max(1, Math.ceil(currentSession.duration)) : filters.maxDuration,
  );
  const [suggestions, setSuggestions] = useState<AISuggestedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await suggestTasksWithAI({
        availableMinutes,
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

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm" aria-label="AIタスク提案">
      <header className="mb-4 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-500">STEP 6</p>
        <h2 className="text-2xl font-bold text-slate-900">AIにおすすめを聞く</h2>
        <p className="text-sm text-slate-500">待ち時間に合わせてAIがタスクを推薦します</p>
      </header>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="ai-available-minutes">
            待ち時間（分）
          </label>
          <input
            id="ai-available-minutes"
            type="number"
            min={1}
            max={60}
            value={availableMinutes}
            onChange={(event) => setAvailableMinutes(Number(event.target.value))}
            className="mt-1 w-32 rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
          />
        </div>
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
            {suggestions.map((suggestion) => (
              <li key={suggestion.title} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-base font-semibold text-slate-900">{suggestion.title}</p>
                <p className="text-sm text-slate-500">
                  所要 {suggestion.duration}分 / 優先度 {suggestion.priority.toUpperCase()}
                </p>
                {suggestion.reason && <p className="text-xs text-slate-400">{suggestion.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
