import { TimerDisplay, TimerSetup } from '@/app/components/timer';
import { TaskForm, TaskList } from '@/app/components/tasks';
import { PopupTaskPanel } from '@/app/components/popup';
import { AppHeader } from '@/app/components/layout';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-6 py-12">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <AppHeader />

        <div className="grid gap-6 md:grid-cols-2">
          <TimerDisplay />
          <TimerSetup />
        </div>

        <section id="tasks" className="grid gap-6 md:grid-cols-2">
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
