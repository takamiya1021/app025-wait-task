import type { TimerWorkerCommand, TimerWorkerResponse } from '@/types/models';

const TICK_INTERVAL_MS = 100;

type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerInternalState {
  durationMs: number;
  remainingMs: number;
  targetTimestamp: number | null;
  timerId: ReturnType<typeof setInterval> | null;
  status: TimerStatus;
}

const now = () => Date.now();

const computeRemaining = (targetTimestamp: number | null): number => {
  if (!targetTimestamp) {
    return 0;
  }
  return Math.max(0, targetTimestamp - now());
};

export interface TimerController {
  handleMessage: (command: TimerWorkerCommand) => void;
}

export const createTimerController = (
  postMessage: (message: TimerWorkerResponse) => void,
): TimerController => {
  const state: TimerInternalState = {
    durationMs: 0,
    remainingMs: 0,
    targetTimestamp: null,
    timerId: null,
    status: 'idle',
  };

  const clearTimer = () => {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  };

  const emitTick = () => {
    const remainingMs = computeRemaining(state.targetTimestamp);
    postMessage({ type: 'TICK', remainingMs });
    if (remainingMs <= 0) {
      finalizeCompletion();
    }
  };

  const startTicker = () => {
    clearTimer();
    state.timerId = setInterval(emitTick, TICK_INTERVAL_MS);
  };

  const finalizeCompletion = () => {
    clearTimer();
    state.status = 'idle';
    state.remainingMs = 0;
    state.targetTimestamp = null;
    postMessage({ type: 'COMPLETE' });
  };

  const handleStart = (durationSeconds: number) => {
    const durationMs = Math.max(0, Math.round(durationSeconds * 1000));
    state.durationMs = durationMs;
    state.remainingMs = durationMs;
    if (durationMs === 0) {
      postMessage({ type: 'STARTED', durationMs });
      postMessage({ type: 'TICK', remainingMs: 0 });
      postMessage({ type: 'COMPLETE' });
      return;
    }

    state.status = 'running';
    state.targetTimestamp = now() + durationMs;
    postMessage({ type: 'STARTED', durationMs });
    postMessage({ type: 'TICK', remainingMs: durationMs });
    startTicker();
  };

  const handlePause = () => {
    if (state.status !== 'running') {
      return;
    }
    const remainingMs = computeRemaining(state.targetTimestamp);
    state.remainingMs = remainingMs;
    state.status = 'paused';
    state.targetTimestamp = null;
    clearTimer();
    postMessage({ type: 'PAUSED', remainingMs });
  };

  const handleResume = () => {
    if (state.status !== 'paused') {
      return;
    }
    state.status = 'running';
    state.targetTimestamp = now() + state.remainingMs;
    postMessage({ type: 'RESUMED', remainingMs: state.remainingMs });
    startTicker();
  };

  const handleStop = () => {
    if (state.status === 'idle') {
      return;
    }
    clearTimer();
    state.status = 'idle';
    state.remainingMs = 0;
    state.targetTimestamp = null;
    postMessage({ type: 'STOPPED' });
  };

  const handleTickRequest = () => {
    const remainingMs = computeRemaining(state.targetTimestamp);
    postMessage({ type: 'TICK', remainingMs });
  };

  const handleMessage = (command: TimerWorkerCommand) => {
    switch (command.type) {
      case 'START':
        handleStart(command.durationSeconds);
        break;
      case 'PAUSE':
        handlePause();
        break;
      case 'RESUME':
        handleResume();
        break;
      case 'STOP':
        handleStop();
        break;
      case 'TICK_REQUEST':
        handleTickRequest();
        break;
      default:
        postMessage({ type: 'ERROR', message: 'Unknown command' });
    }
  };

  return { handleMessage };
};
