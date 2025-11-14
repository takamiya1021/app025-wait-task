import { TimerSetup, TimerDisplay } from '@/app/components/timer';
import { TaskForm, TaskFilter, TaskListSection } from '@/app/components/tasks';
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

        {/* STEP 1 & 2 - 2カラム */}
        <div className="grid gap-6 md:grid-cols-2">
          <TimerSetup />
          <TaskForm />
        </div>

        {/* STEP 3 - 全幅 */}
        <AITaskSuggestion />

        {/* STEP 4 - 全幅 */}
        <TaskFilter />

        {/* STEP 5 - 全幅 */}
        <TaskListSection />

        <StatisticsPanel />
        <SettingsPanel />

        <PopupTaskPanel />
      </div>
    </main>
  );
}
