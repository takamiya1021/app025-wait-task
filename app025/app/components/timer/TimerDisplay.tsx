'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';

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
  const remainingTime = useTaskStore(state => state.currentSession?.remainingTime ?? 0);
  const isRunning = useTaskStore(state => state.currentSession?.isRunning ?? false);
  const isPaused = useTaskStore(state => state.currentSession?.isPaused ?? false);
  const duration = useTaskStore(state => state.currentSession?.duration ?? null);

  const statusLabel = useMemo(() => {
    if (isPaused) return '一時停止中';
    if (isRunning) return '進行中';
    if (duration) return '完了';
    return '待機中';
  }, [isPaused, isRunning, duration]);

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-md">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-300">STEP 2</p>
        <h2 className="text-2xl font-semibold">残り時間</h2>
      </header>
      <div>
        <p className="text-sm text-slate-300">状態</p>
        <p className="text-lg font-semibold">{statusLabel}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-300">カウントダウン</p>
        <p className="text-5xl font-bold tracking-tight">{formatTime(remainingTime)}</p>
      </div>
      {duration ? (
        <progress
          className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
          value={Math.max(0, duration * 60 - remainingTime)}
          max={duration * 60}
          aria-label="タイマー進捗"
        />
      ) : (
        <div className="h-2 w-full rounded-full bg-slate-800" aria-label="タイマー未開始" />
      )}
    </section>
  );
}
