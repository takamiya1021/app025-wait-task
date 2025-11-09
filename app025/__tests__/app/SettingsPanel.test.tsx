import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsPanel } from '@/app/components/settings/SettingsPanel';
import { resetTaskStore, useTaskStore } from '@/store/useTaskStore';

jest.mock('@/app/lib/notificationManager', () => ({
  getNotificationPermissionState: jest.fn(() => 'default'),
  requestNotificationPermission: jest.fn(async () => 'granted'),
}));

describe('SettingsPanel', () => {
  beforeEach(() => {
    resetTaskStore();
  });

  it('トグルで設定が更新される', () => {
    render(<SettingsPanel />);

    const soundButton = screen.getByRole('button', { name: /タイマー完了時に通知/ });
    fireEvent.click(soundButton);

    expect(useTaskStore.getState().settings.notificationSound).toBe(false);
  });

  it('通知許可ボタンを表示する', async () => {
    render(<SettingsPanel />);
    const button = screen.getByRole('button', { name: '通知を許可する' });
    fireEvent.click(button);

    const matches = await screen.findAllByText(/許可済み/);
    expect(matches.length).toBeGreaterThan(0);
  });
});
