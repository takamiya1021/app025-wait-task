'use client';

import { FormEvent, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { classifyTaskWithAI } from '@/app/lib/geminiService';

const PRIORITY_LABELS = {
  high: '高優先',
  medium: '通常',
  low: '低優先',
} as const;

export function TaskForm() {
  const addTask = useTaskStore(state => state.addTask);
  const settings = useTaskStore(state => state.settings);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(3);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [classifying, setClassifying] = useState(false);
  const [classificationMessage, setClassificationMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    addTask({
      title: trimmed,
      duration,
      priority,
      completed: false,
    });
    setTitle('');
  };

  return (
    <form
      className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
      aria-label="タスク追加フォーム"
      data-testid="task-form"
    >
      <div>
        <label htmlFor="task-title" className="text-sm font-semibold text-slate-700">
          タスク名
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={event => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
          placeholder="例: 受信トレイ整理"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-duration" className="text-sm font-semibold text-slate-700">
            所要時間 (分)
          </label>
          <input
            id="task-duration"
            type="number"
            min={1}
            max={30}
            value={duration}
            onChange={event => setDuration(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-700">優先度</span>
          <div className="mt-2 flex gap-2">
            {(Object.keys(PRIORITY_LABELS) as Array<'high' | 'medium' | 'low'>).map(value => (
              <button
                type="button"
                key={value}
                onClick={() => setPriority(value)}
                className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  priority === value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                aria-pressed={priority === value}
                aria-label={`優先度 ${PRIORITY_LABELS[value]}`}
              >
                {PRIORITY_LABELS[value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          タスクを追加
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!title.trim()) return;
            setClassifying(true);
            const result = await classifyTaskWithAI({
              title,
              apiKey: settings.geminiApiKey,
            });
            setDuration(result.duration);
            setPriority(result.priority);
            setClassificationMessage(`${result.category} / 約${result.duration}分 / ${result.priority.toUpperCase()}`);
            setClassifying(false);
          }}
          disabled={classifying}
          className="rounded-full border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {classifying ? '推定中…' : 'AIで分類'}
        </button>
      </div>
      {classificationMessage && (
        <p className="text-sm text-slate-500">AI提案: {classificationMessage}</p>
      )}
    </form>
  );
}
