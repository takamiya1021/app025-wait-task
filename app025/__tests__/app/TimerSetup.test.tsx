import { fireEvent, render, screen } from '@testing-library/react';
import { TimerSetup } from '@/app/components/timer/TimerSetup';
import { StubTimerDriver } from '@/tests/helpers/stubTimerDriver';
import { setTimerDriver } from '@/lib/timerDriver';
import { __resetTimerIntegrationForTests, resetTaskStore } from '@/store/useTaskStore';

let driver: StubTimerDriver;

describe('TimerSetup', () => {
  beforeEach(() => {
    driver = new StubTimerDriver();
    setTimerDriver(driver);
    __resetTimerIntegrationForTests();
    resetTaskStore();
  });

  afterEach(() => {
    setTimerDriver(null);
    __resetTimerIntegrationForTests();
  });

  it('プリセットと入力値でタイマーを開始できる', () => {
    render(<TimerSetup />);

    const input = screen.getByLabelText('待ち時間 (分)');
    fireEvent.change(input, { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: 'タイマー開始' }));

    expect(driver.startCalls).toEqual([3]);
  });

  it('進行中は一時停止/停止ボタンが表示される', () => {
    render(<TimerSetup />);

    fireEvent.click(screen.getByRole('button', { name: 'タイマー開始' }));
    expect(screen.getByText('一時停止')).toBeInTheDocument();

    fireEvent.click(screen.getByText('一時停止'));
    expect(driver.pauseCalls).toBe(1);
    expect(screen.getByText('再開')).toBeInTheDocument();

    fireEvent.click(screen.getByText('再開'));
    expect(driver.resumeCalls).toBe(1);

    fireEvent.click(screen.getByText('停止'));
    expect(driver.stopCalls).toBe(1);
    expect(screen.getByRole('button', { name: 'タイマー開始' })).toBeInTheDocument();
  });
});
