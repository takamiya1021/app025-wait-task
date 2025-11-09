import { fireEvent, render, screen } from '@testing-library/react';
import { TaskFilter } from '@/app/components/tasks/TaskFilter';
import { TaskList } from '@/app/components/tasks/TaskList';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

describe('TaskFilter', () => {
  beforeEach(() => {
    resetTaskStore();
    const { addTask } = useTaskStore.getState();
    addTask({ title: '短時間', duration: 3, priority: 'low', completed: false });
    addTask({ title: '長時間', duration: 15, priority: 'high', completed: false });
  });

  it('最大所要時間でフィルタリングする', () => {
    render(
      <div>
        <TaskFilter />
        <TaskList />
      </div>,
    );

    fireEvent.click(screen.getByText('15分以内'));
    expect(screen.getByText('長時間')).toBeInTheDocument();

    fireEvent.click(screen.getByText('5分以内'));

    expect(screen.queryByText('長時間')).not.toBeInTheDocument();
    expect(screen.getByText('短時間')).toBeInTheDocument();
  });
});
