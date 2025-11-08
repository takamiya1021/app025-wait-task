import { test, expect } from '@playwright/test';

test('タイマー開始導線を表示する', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: '待ち時間に「今やるべきこと」を迷わない' }),
  ).toBeVisible();

  await expect(page.getByTestId('start-timer-button')).toBeVisible();
});
