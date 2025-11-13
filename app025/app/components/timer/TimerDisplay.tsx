'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { ProgressBar } from '@/app/components/progress';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = Math.max(0, seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

export function TimerDisplay() {
  const timerDuration = useTaskStore(state => state.timerDuration);
  const currentSession = useTaskStore(state => state.currentSession);
  const startTimer = useTaskStore(state => state.startTimer);
  const pauseTimer = useTaskStore(state => state.pauseTimer);
  const resumeTimer = useTaskStore(state => state.resumeTimer);
  const stopTimer = useTaskStore(state => state.stopTimer);

  const remainingTime = currentSession?.remainingTime ?? 0;
  const isRunning = currentSession?.isRunning ?? false;
  const isPaused = currentSession?.isPaused ?? false;
  const duration = currentSession?.duration ?? null;
  const hasSession = Boolean(currentSession);
  const isCompleted = hasSession && remainingTime === 0 && !isRunning && !isPaused;

  const handleStart = () => {
    if (timerDuration > 0) {
      startTimer(timerDuration);
    }
  };

  const statusLabel = useMemo(() => {
    if (isPaused) return '一時停止中';
    if (isRunning) return '進行中';
    if (duration) return '完了';
    return '待機中';
  }, [isPaused, isRunning, duration]);

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">状態</p>
          <p className="text-base font-semibold">{statusLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">カウントダウン</p>
          <p className="text-4xl font-bold tracking-tight">{formatTime(remainingTime)}</p>
        </div>
      </div>

      {duration ? (
        <ProgressBar
          value={Math.max(0, duration * 60 - remainingTime)}
          max={duration * 60}
          label="タイマー進捗"
          className="mt-2"
        />
      ) : (
        <div className="mt-2 h-2 w-full rounded-full bg-slate-800" aria-label="タイマー未開始" />
      )}

      {/* タイマー操作ボタン */}
      <div className="flex flex-col gap-3 border-t border-slate-700 pt-4">
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
              className="flex-1 rounded-full border-2 border-slate-600 bg-slate-800 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
            >
              一時停止
            </button>
            <button
              type="button"
              onClick={stopTimer}
              className="flex-1 rounded-full border-2 border-rose-500 bg-rose-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-rose-500"
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
              className="flex-1 rounded-full border-2 border-emerald-500 bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-500"
            >
              再開
            </button>
            <button
              type="button"
              onClick={stopTimer}
              className="flex-1 rounded-full border-2 border-rose-500 bg-rose-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-rose-500"
            >
              停止
            </button>
          </div>
        )}

        {isCompleted && (
          <button
            type="button"
            onClick={stopTimer}
            className="rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            新しいタイマーを開始
          </button>
        )}
      </div>
    </section>
  );
}
