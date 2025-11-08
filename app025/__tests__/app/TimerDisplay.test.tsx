import { act, render, screen } from '@testing-library/react';
import { TimerDisplay } from '@/app/components/timer/TimerDisplay';
import { StubTimerDriver } from '@/tests/helpers/stubTimerDriver';
import { setTimerDriver } from '@/lib/timerDriver';
import { __resetTimerIntegrationForTests, resetTaskStore, useTaskStore } from '@/store/useTaskStore';

let driver: StubTimerDriver;

describe('TimerDisplay', () => {
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

  it('残り時間をフォーマットして表示する', () => {
    render(<TimerDisplay />);

    expect(screen.getByText('00:00')).toBeInTheDocument();

    act(() => {
      useTaskStore.getState().startTimer(5);
    });

    act(() => {
      driver.emitTick(290);
    });

    expect(screen.getByText('04:50')).toBeInTheDocument();
  });
});
