import {
  getNotificationPermissionState,
  requestNotificationPermission,
  handleTimerCompletionNotification,
} from '@/app/lib/notificationManager';

describe('notificationManager', () => {
  const globalAny = globalThis as any;
  const originalNotification = globalAny.Notification;

  afterEach(() => {
    if (originalNotification) {
      globalAny.Notification = originalNotification;
    } else {
      delete globalAny.Notification;
    }
  });

  it('returns unsupported when Notification API is absent', () => {
    delete globalAny.Notification;
    expect(getNotificationPermissionState()).toBe('unsupported');
  });

  it('requests permission when available', async () => {
    const requestPermission = jest.fn(async () => 'granted');
    globalAny.Notification = class MockNotification {
      static permission = 'default';
      static requestPermission = requestPermission;
      constructor() {}
    };

    const result = await requestNotificationPermission();
    expect(result).toBe('granted');
    expect(requestPermission).toHaveBeenCalled();
  });

  it('plays notification only when permission is granted', () => {
    const showSpy = jest.fn();
    globalAny.Notification = class MockNotification {
      static permission = 'granted';
      constructor() {
        showSpy();
      }
    };

    handleTimerCompletionNotification({ enableSound: false, message: 'done' });
    expect(showSpy).toHaveBeenCalled();
  });

  it('does nothing when permission denied', () => {
    const showSpy = jest.fn();
    globalAny.Notification = class MockNotification {
      static permission = 'denied';
      constructor() {
        showSpy();
      }
    };

    handleTimerCompletionNotification({ enableSound: false });
    expect(showSpy).not.toHaveBeenCalled();
  });
});
