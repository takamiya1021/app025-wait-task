import { act, render, screen, fireEvent } from '@testing-library/react';
import { StatisticsPanel } from '@/app/components/stats/StatisticsPanel';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

jest.mock('@/app/lib/geminiService', () => ({
  analyzeProductivityWithAI: jest.fn(async () => ({
    summary: 'AIまとめ',
    tips: ['tip1', 'tip2'],
  })),
}));

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

  it('AIアドバイスを取得できる', async () => {
    render(<StatisticsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'AIに分析してもらう' }));

    expect(await screen.findByTestId('ai-analysis')).toHaveTextContent('AIまとめ');
  });
});
