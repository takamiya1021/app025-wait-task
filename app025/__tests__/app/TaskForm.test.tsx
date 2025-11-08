import { act, fireEvent, render, screen } from '@testing-library/react';
import { TaskForm } from '@/app/components/tasks/TaskForm';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

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
});
