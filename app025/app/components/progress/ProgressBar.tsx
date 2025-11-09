'use client';

import { CSSProperties } from 'react';

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const clamped = Math.min(max, Math.max(0, value));
  const percentage = max === 0 ? 0 : (clamped / max) * 100;

  const barStyle: CSSProperties = {
    width: `${percentage}%`,
  };

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`} aria-label={label}>
      <div className="h-2 w-full rounded-full bg-slate-800/30">
        <div className="h-full rounded-full bg-emerald-400 transition-[width]" style={barStyle} />
      </div>
    </div>
  );
}
