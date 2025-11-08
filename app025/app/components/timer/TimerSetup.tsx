'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

const PRESET_MINUTES = [1, 3, 5, 10];

export function TimerSetup() {
  const startTimer = useTaskStore(state => state.startTimer);
  const pauseTimer = useTaskStore(state => state.pauseTimer);
  const resumeTimer = useTaskStore(state => state.resumeTimer);
  const stopTimer = useTaskStore(state => state.stopTimer);
  const currentSession = useTaskStore(state => state.currentSession);

  const [duration, setDuration] = useState(5);

  const isRunning = currentSession?.isRunning ?? false;
  const isPaused = currentSession?.isPaused ?? false;
  const hasSession = Boolean(currentSession);

  const handleStart = () => {
    if (duration > 0) {
      startTimer(duration);
    }
  };

  const handlePreset = (minutes: number) => {
    setDuration(minutes);
  };

  return (
    <section className="w-full rounded-2xl bg-white p-6 shadow-sm">
      <header className="mb-4 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-500">STEP 1</p>
        <h2 className="text-2xl font-bold text-slate-900">待ち時間タイマー</h2>
        <p className="text-sm text-slate-500">プリセットを選んで待ち時間タスクを始めましょう</p>
      </header>

      <div className="mb-6 flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="duration-input">
          待ち時間 (分)
        </label>
        <input
          id="duration-input"
          type="number"
          min={1}
          max={120}
          value={duration}
          onChange={event => setDuration(Number(event.target.value))}
          className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-lg focus:border-slate-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {PRESET_MINUTES.map(minute => (
            <button
              key={minute}
              type="button"
              onClick={() => handlePreset(minute)}
              className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                duration === minute
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-label={`${minute}分プリセット`}
            >
              {minute}分
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {!hasSession && (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label="タイマー開始"
            data-testid="start-timer-button"
          >
            タイマー開始
          </button>
        )}

        {hasSession && isRunning && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={pauseTimer}
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              一時停止
            </button>
            <button
              type="button"
              onClick={stopTimer}
              className="flex-1 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-base font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              停止
            </button>
          </div>
        )}

        {hasSession && isPaused && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resumeTimer}
              className="flex-1 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              再開
            </button>
            <button
              type="button"
              onClick={stopTimer}
              className="flex-1 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-base font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              停止
            </button>
          </div>
        )}

        <p className="text-sm text-slate-500">
          {hasSession
            ? isPaused
              ? 'タイマーは一時停止中です'
              : 'タイマーが進行中です'
            : 'タイマーは未開始です'}
        </p>
      </div>
    </section>
  );
}
