export type NotificationPermissionState = NotificationPermission | 'unsupported';

const isSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermissionState = (): NotificationPermissionState => {
  if (!isSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (!isSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.warn('Notification permission request failed', error);
    return Notification.permission;
  }
};

const showNotification = (title: string, body: string) => {
  if (!isSupported()) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body });
  } catch (error) {
    console.warn('Notification display failed', error);
  }
};

const playCompletionTone = () => {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return;
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
  oscillator.stop(ctx.currentTime + 1);
};

export const handleTimerCompletionNotification = (options: {
  enableSound: boolean;
  message?: string;
}) => {
  if (typeof window === 'undefined') return;
  const { enableSound, message } = options;
  if (enableSound) {
    playCompletionTone();
  }
  if (getNotificationPermissionState() === 'granted') {
    showNotification('⏰ 待ち時間が終了しました', message ?? 'チェックリストを確認しましょう');
  }
};
