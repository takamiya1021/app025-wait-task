import { act, render, screen } from '@testing-library/react';
import { StatisticsPanel } from '@/app/components/stats/StatisticsPanel';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

describe('StatisticsPanel', () => {
  beforeEach(() => {
    act(() => {
      resetTaskStore();
      useTaskStore.setState({
        history: [
          { date: '2025-01-01', totalTime: 15, completedTasks: 3, tasksByCategory: {} },
          { date: new Date().toISOString().split('T')[0], totalTime: 6, completedTasks: 2, tasksByCategory: {} },
        ],
      });
    });
  });

  it('今日と週間の統計を表示する', () => {
    render(<StatisticsPanel />);

    expect(screen.getByText('今日の完了タスク')).toBeInTheDocument();
    expect(screen.getAllByText('2件')).toHaveLength(2);
    expect(screen.getAllByText('6分')).toHaveLength(2);
  });
});
