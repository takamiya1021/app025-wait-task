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

  it('最小化ボタンでコンテンツを隠せる', () => {
    act(() => {
      useTaskStore.setState({
        currentSession: {
          id: 'session-3',
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

    // 初期状態：コンテンツが表示されている
    expect(screen.getByLabelText('ポップアップ進捗')).toBeInTheDocument();
    expect(screen.getByText('肩回し')).toBeInTheDocument();

    // 最小化ボタンをクリック
    const minimizeButton = screen.getByRole('button', { name: '最小化' });
    act(() => {
      minimizeButton.click();
    });

    // コンテンツが非表示になる
    expect(screen.queryByLabelText('ポップアップ進捗')).not.toBeInTheDocument();
    expect(screen.queryByText('肩回し')).not.toBeInTheDocument();

    // ボタンのラベルが「展開」に変わる
    expect(screen.getByRole('button', { name: '展開' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '最小化' })).not.toBeInTheDocument();

    // 展開ボタンをクリック
    const expandButton = screen.getByRole('button', { name: '展開' });
    act(() => {
      expandButton.click();
    });

    // コンテンツが再表示される
    expect(screen.getByLabelText('ポップアップ進捗')).toBeInTheDocument();
    expect(screen.getByText('肩回し')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '最小化' })).toBeInTheDocument();
  });

  it('非表示ボタンでポップアップ全体を非表示にできる', () => {
    act(() => {
      useTaskStore.setState({
        currentSession: {
          id: 'session-4',
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

    // 初期状態：ポップアップが表示されている
    const popup = screen.getByLabelText('タイマーポップアップ');
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveClass('opacity-100');

    // 非表示ボタンをクリック
    const hideButton = screen.getByRole('button', { name: 'ポップアップを非表示' });
    act(() => {
      hideButton.click();
    });

    // ポップアップが非表示になる（opacity-0クラスが付与される）
    expect(popup).toHaveClass('opacity-0');
  });
});
