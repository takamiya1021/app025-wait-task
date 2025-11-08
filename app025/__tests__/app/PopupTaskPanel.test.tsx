import { act, render, screen } from '@testing-library/react';
import { PopupTaskPanel } from '@/app/components/popup/PopupTaskPanel';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

describe('PopupTaskPanel', () => {
  beforeEach(() => {
    act(() => {
      resetTaskStore();
      const { addTask } = useTaskStore.getState();
      addTask({ title: '肩回し', duration: 3, priority: 'high', completed: false });
      addTask({ title: '参考資料チェック', duration: 10, priority: 'low', completed: false });
    });
  });

  afterEach(() => {
    act(() => {
      resetTaskStore();
    });
  });

  it('タイマーセッションがあると自動で表示される', () => {
    act(() => {
      useTaskStore.setState({
        currentSession: {
          id: 'session-1',
          startTime: new Date('2025-01-01T00:00:00Z'),
          duration: 5,
          remainingTime: 240,
          isRunning: true,
          isPaused: false,
          completedTasks: [],
        },
      });
    });

    render(<PopupTaskPanel />);

    expect(screen.getByLabelText('タイマーポップアップ')).toBeInTheDocument();
    expect(screen.getByText('残り 4 分')).toBeInTheDocument();
    expect(screen.getByText('肩回し')).toBeInTheDocument();
    expect(screen.queryByText('参考資料チェック')).not.toBeInTheDocument();
  });

  it('優先度フィルターで一覧を切り替えられる', () => {
    act(() => {
      useTaskStore.setState({
        currentSession: {
          id: 'session-2',
          startTime: new Date('2025-01-01T00:00:00Z'),
          duration: 15,
          remainingTime: 600,
          isRunning: true,
          isPaused: false,
          completedTasks: [],
        },
      });
    });

    render(<PopupTaskPanel />);

    expect(screen.getByText('肩回し')).toBeInTheDocument();
    expect(screen.getByText('参考資料チェック')).toBeInTheDocument();

    const lowFilter = screen.getByRole('button', { name: '低' });
    act(() => {
      lowFilter.click();
    });

    expect(screen.queryByText('肩回し')).not.toBeInTheDocument();
    expect(screen.getByText('参考資料チェック')).toBeInTheDocument();
  });
});
