import { test, expect } from '@playwright/test';

test('タイマー開始導線を表示する', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="landing-heading"]');
  await expect(page.getByTestId('landing-heading')).toBeVisible();

  await expect(page.getByTestId('start-timer-button')).toBeVisible();
});
