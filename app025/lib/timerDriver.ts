import { TimerEngine } from '@/lib/timerEngine';

export type TickListener = (remainingSeconds: number) => void;
export type CompleteListener = () => void;

export interface TimerDriver {
  start: (durationMinutes: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  requestTick: () => void;
  onTick: (listener: TickListener) => () => void;
  onComplete: (listener: CompleteListener) => () => void;
  dispose?: () => void;
}

const createDriverFromEngine = (engine: TimerEngine): TimerDriver => ({
  start: (durationMinutes) => engine.start(durationMinutes),
  pause: () => engine.pause(),
  resume: () => engine.resume(),
  stop: () => engine.stop(),
  requestTick: () => engine.requestTick(),
  onTick: (listener) => engine.onTick(listener),
  onComplete: (listener) => engine.onComplete(listener),
  dispose: () => engine.dispose(),
});

let driverInstance: TimerDriver | null = null;

const createDefaultDriver = (): TimerDriver => {
  const forceFallback = typeof window === 'undefined' || typeof Worker === 'undefined';
  const engine = new TimerEngine({ forceFallback });
  return createDriverFromEngine(engine);
};

export const getTimerDriver = (): TimerDriver => {
  if (!driverInstance) {
    driverInstance = createDefaultDriver();
  }
  return driverInstance;
};

export const setTimerDriver = (driver: TimerDriver | null) => {
  if (driverInstance && driverInstance.dispose) {
    driverInstance.dispose();
  }
  driverInstance = driver;
};

export const resetTimerDriver = () => {
  setTimerDriver(null);
};

export const createDriverForEngine = createDriverFromEngine;
