import { TimerDisplay, TimerSetup } from '@/app/components/timer';
import { TaskForm, TaskList } from '@/app/components/tasks';
import { PopupTaskPanel } from '@/app/components/popup';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-6 py-12">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-3xl bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-4 text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Rendering Wait Helper
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              待ち時間に「今やるべきこと」を迷わない
            </h1>
            <p className="text-lg leading-7 text-slate-600">
              AI生成やレンダリングで生まれる数分間を、タスク消化に変えるミニマルなチェックリスト。
              タイマーとタスクを連動させ、集中のリズムを崩さずに小さな達成感を積み重ねましょう。
            </p>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <TimerDisplay />
          <TimerSetup />
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <TaskForm />
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <header className="mb-4">
              <p className="text-sm font-semibold text-slate-500">STEP 3</p>
              <h2 className="text-2xl font-bold text-slate-900">この間にやること</h2>
            </header>
            <TaskList />
          </div>
        </section>

        <PopupTaskPanel />
      </div>
    </main>
  );
}
