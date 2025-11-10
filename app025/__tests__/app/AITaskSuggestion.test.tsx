import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AITaskSuggestion } from '@/app/components/ai/AITaskSuggestion';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

jest.mock('@/app/lib/geminiService', () => ({
  suggestTasksWithAI: jest.fn(async () => [
    { title: 'AIタスク', duration: 3, priority: 'medium', reason: 'テスト' },
  ]),
}));

describe('AITaskSuggestion', () => {
  beforeEach(() => {
    resetTaskStore();
    useTaskStore.getState().addTask({
      title: 'メール整理',
      duration: 5,
      priority: 'medium',
      completed: false,
    });
  });

  it('AI提案ボタンで結果を表示する', async () => {
    render(<AITaskSuggestion />);

    fireEvent.click(screen.getByRole('button', { name: 'AIに聞いてみる' }));

    await waitFor(() => {
      expect(screen.getByTestId('ai-suggestions')).toBeInTheDocument();
    });
    expect(screen.getByText('AIタスク')).toBeInTheDocument();
  });
});
