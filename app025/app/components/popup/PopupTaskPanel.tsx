'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { PopupWindow } from '@/app/components/popup/PopupWindow';
import { ProgressBar } from '@/app/components/progress';

// デスクトップかどうかを判定するカスタムフック
function useIsDesktop() {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // マウント前はサーバーと同じ状態（false）を返す
  return mounted ? isDesktop : false;
}

const priorityLabels = {
  all: 'すべて',
  high: '高',
  medium: '中',
  low: '低',
} as const;

type PriorityFilter = keyof typeof priorityLabels;

export function PopupTaskPanel() {
  const isDesktop = useIsDesktop();
  const currentSession = useTaskStore(state => state.currentSession);
  const filterByDuration = useTaskStore(state => state.filteredTasks);
  const alwaysOnTopSetting = useTaskStore(state => state.settings.alwaysOnTop);
  const [isOpen, setIsOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  useEffect(() => {
    if (currentSession?.isRunning) {
      setIsOpen(true);
    } else if (!currentSession) {
      setIsOpen(false);
    }
  }, [currentSession]);

  const remainingMinutes = Math.max(0, Math.ceil((currentSession?.remainingTime ?? 0) / 60));

  const filteredTasks = useMemo(() => {
    if (!currentSession) return [];
    const priority = priorityFilter === 'all' ? undefined : priorityFilter;
    return filterByDuration(Math.max(1, remainingMinutes), priority);
  }, [currentSession, priorityFilter, filterByDuration, remainingMinutes]);

  // デスクトップまたはセッションがない場合は表示しない
  if (isDesktop || !currentSession) {
    return null;
  }

  return (
    <PopupWindow
      isOpen={isOpen}
      alwaysOnTop={alwaysOnTopSetting}
      ariaLabel="タイマーポップアップ"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">待ち時間タスク</p>
          <p className="text-lg font-bold text-slate-900">残り {remainingMinutes} 分</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
          aria-pressed={isOpen}
        >
          {isOpen ? '最小化' : '展開' }
        </button>
      </div>
      {isOpen && (
        <div className="flex flex-col gap-4 px-5 py-4">
          <ProgressBar
            value={Math.max(0, currentSession.duration * 60 - currentSession.remainingTime)}
            max={currentSession.duration * 60}
            label="ポップアップ進捗"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">優先度</span>
            <div className="flex gap-2">
              {(Object.keys(priorityLabels) as PriorityFilter[]).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPriorityFilter(option)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    priorityFilter === option
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {priorityLabels[option]}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex max-h-64 flex-col gap-3 overflow-y-auto" aria-label="推奨タスク">
            {filteredTasks.length === 0 && (
              <li className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                実行できるタスクがありません。
              </li>
            )}
            {filteredTasks.map(task => (
              <li key={task.id} className="rounded-2xl border border-slate-100 p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-500">{task.duration}分 ・ 優先度 {task.priority.toUpperCase()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PopupWindow>
  );
}
