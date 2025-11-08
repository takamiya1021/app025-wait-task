import { test, expect } from '@playwright/test';

test('タイマー開始導線を表示する', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  await page.waitForSelector('h1');
  await expect(page.getByText('待ち時間をタスク完了タイムに変える相棒')).toBeVisible();

  await expect(page.getByTestId('start-timer-button')).toBeVisible();
});
