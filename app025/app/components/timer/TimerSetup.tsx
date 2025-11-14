'use client';

import { useTaskStore } from '@/store/useTaskStore';

const PRESET_MINUTES = [1, 3, 5, 10, 15];

export function TimerSetup() {
  const timerDuration = useTaskStore(state => state.timerDuration);
  const setTimerDuration = useTaskStore(state => state.setTimerDuration);

  const handleDurationChange = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(num) && num >= 1 && num <= 120) {
      setTimerDuration(num);
    } else if (value === '') {
      // 空欄の場合は何もしない（入力中）
    }
  };

  return (
    <section className="w-full rounded-2xl bg-white p-6 shadow-sm">
      <header className="mb-4 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-500">STEP 1</p>
        <h2 className="text-2xl font-bold text-slate-900">待ち時間を設定</h2>
        <p className="text-sm text-slate-500">プリセットまたは数値で時間を設定してください</p>
      </header>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="duration-input">
          待ち時間 (分)
        </label>
        <input
          id="duration-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={timerDuration}
          onChange={event => handleDurationChange(event.target.value)}
          onFocus={event => event.target.select()}
          className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-lg text-slate-900 focus:border-slate-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {PRESET_MINUTES.map(minute => (
            <button
              key={minute}
              type="button"
              onClick={() => handleDurationChange(minute)}
              className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                timerDuration === minute
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
    </section>
  );
}
