'use client';

import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-lg">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Rendering Wait Helper
          </p>
          <h1
            data-testid="landing-heading"
            className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            待ち時間をタスク完了タイムに変える相棒
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200">
            AI生成やレンダリングで空く数分を、身体をほぐす・頭を整える・机を片づける時間に。タイマーとチェックリストを同期させて、
            いつでも「今やるべきこと」を迷わず取りかかれます。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            タイマーを起動
          </button>
          <Link
            href="#tasks"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            チェックリストを見る
          </Link>
        </div>
      </div>
    </header>
  );
}
