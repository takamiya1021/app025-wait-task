import { act, fireEvent, render, screen } from '@testing-library/react';
import { TaskList } from '@/app/components/tasks/TaskList';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

describe('TaskList', () => {
  beforeEach(() => {
    act(() => {
      resetTaskStore();
      const { addTask } = useTaskStore.getState();
      addTask({ title: 'メール返信', duration: 3, priority: 'medium', completed: false });
    });
  });

  afterEach(() => {
    act(() => {
      resetTaskStore();
    });
  });

  it('タスクの完了状態を切り替えられる', () => {
    render(<TaskList />);

    const checkbox = screen.getByRole('checkbox', { name: 'メール返信 を完了' });
    fireEvent.click(checkbox);

    expect(useTaskStore.getState().tasks[0].completed).toBe(true);
  });

  it('タスクを削除できる', () => {
    render(<TaskList />);

    fireEvent.click(screen.getByRole('button', { name: 'メール返信 を削除' }));

    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });
});
