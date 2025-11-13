import { TimerSetup, TimerDisplay } from '@/app/components/timer';
import { TaskForm, TaskList, TaskFilter } from '@/app/components/tasks';
import { PopupTaskPanel } from '@/app/components/popup';
import { AppHeader } from '@/app/components/layout';
import { StatisticsPanel } from '@/app/components/stats';
import { SettingsPanel } from '@/app/components/settings';
import { AITaskSuggestion } from '@/app/components/ai';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-6 py-12">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <AppHeader />

        {/* カウントダウン - 全幅 */}
        <TimerDisplay />

        {/* STEP 1 & 2 & 3 - 3カラム */}
        <div className="grid gap-6 md:grid-cols-3">
          <TimerSetup />
          <TaskForm />
          <TaskFilter />
        </div>

        {/* STEP 4 - 全幅 */}
        <section id="tasks" className="rounded-3xl bg-white p-6 shadow-sm">
          <header className="mb-4">
            <p className="text-sm font-semibold text-slate-500">STEP 4</p>
            <h2 className="text-2xl font-bold text-slate-900">この間にやること</h2>
          </header>
          <TaskList />
        </section>

        <StatisticsPanel />
        <AITaskSuggestion />
        <SettingsPanel />

        <PopupTaskPanel />
      </div>
    </main>
  );
}
