import { act, fireEvent, render, screen } from '@testing-library/react';
import { TaskForm } from '@/app/components/tasks/TaskForm';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

jest.mock('@/app/lib/geminiService', () => ({
  classifyTaskWithAI: jest.fn(async () => ({ category: 'work', duration: 7, priority: 'high' })),
}));

describe('TaskForm', () => {
  beforeEach(() => {
    act(() => {
      resetTaskStore();
    });
  });

  it('入力したタスクを追加してフォームをリセットする', () => {
    render(<TaskForm />);

    fireEvent.change(screen.getByLabelText('タスク名'), { target: { value: 'ストレッチ' } });
    fireEvent.change(screen.getByLabelText('所要時間 (分)'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'タスクを追加' }));

    expect(screen.getByLabelText('タスク名')).toHaveValue('');
    const added = useTaskStore.getState().tasks.find(task => task.title === 'ストレッチ');
    expect(added).toBeDefined();
  });

  it('AIで分類ボタンで所要時間が更新される', async () => {
    render(<TaskForm />);

    fireEvent.change(screen.getByLabelText('タスク名'), { target: { value: 'メール整理' } });
    fireEvent.click(screen.getByRole('button', { name: 'AIで分類' }));

    await screen.findByText(/AI提案/);
    expect(screen.getByLabelText('所要時間 (分)')).toHaveValue(7);
  });
});
