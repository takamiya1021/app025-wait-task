/// <reference lib="webworker" />

import { createTimerController } from '@/lib/timerController';
import type { TimerWorkerCommand } from '@/types/models';

declare const self: DedicatedWorkerGlobalScope;

const controller = createTimerController((message) => {
  self.postMessage(message);
});

self.addEventListener('message', (event: MessageEvent<TimerWorkerCommand>) => {
  controller.handleMessage(event.data);
});

export {}; // ensure this file is treated as a module
