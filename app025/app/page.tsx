export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-6 py-12">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-3xl bg-white p-12 text-center shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          レンダリング待ちタスク管理
        </h1>
        <p className="text-base leading-7 text-slate-600 sm:text-lg">
          AI生成やレンダリングの待ち時間を、サッと切り替えて有効活用できるようにするためのタスク管理アプリです。
        </p>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="w-full rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:w-auto"
          >
            タイマーを開始
          </button>
        </div>
      </div>
    </main>
  );
}
